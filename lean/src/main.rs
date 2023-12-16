use anyhow::{anyhow, bail};
use opentelemetry::KeyValue;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::time::Duration;
use opentelemetry_sdk::Resource;
use opentelemetry_sdk::runtime::Tokio;
use opentelemetry_sdk::trace::Config;
use opentelemetry_sdk::trace::Sampler::TraceIdRatioBased;
use tonic::transport::{Channel, Server};
use tower_http::request_id::MakeRequestUuid;
use tower_http::trace::{DefaultMakeSpan, DefaultOnResponse};
use tower_http::LatencyUnit;
use tracing::{info, warn};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::prelude::*;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::EnvFilter;

use lean::proto::day_trader_server::DayTraderServer;
use lean::proto::quote_client::QuoteClient;
use lean::DayTraderImpl;

const DEFAULT_RUST_LOG: &str = "none,lean=info";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    if let Err(err) = dotenvy::dotenv() {
        warn!("failed to load dotenv: {err}")
    }

    if env::var("RUST_LOG").is_err() {
        println!("setting RUST_LOG to {}", DEFAULT_RUST_LOG);
        env::set_var("RUST_LOG", DEFAULT_RUST_LOG);
    }

    let trace_id_ratio = env::var("TRACE_ID_RATIO")
        .unwrap_or_else(|_| String::from("1"))
        .parse()
        .map_err(|e| anyhow!("failed to parse TRACE_ID_RATIO: {e}"))?;

    if !(0_f64..=1_f64).contains(&trace_id_ratio) {
        bail!("Invalid TRACE_ID_RATIO (must be in [0..1])")
    }

    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(opentelemetry_otlp::new_exporter().tonic())
        .with_trace_config(
            Config::default()
                .with_sampler(TraceIdRatioBased(trace_id_ratio))
                .with_resource(Resource::new(vec![KeyValue::new("service.name", "lean")])),
        )
        .install_batch(Tokio)?;

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::fmt::layer()
                .with_ansi(true)
                .with_filter(EnvFilter::from_default_env()),
        )
        .with(
            tracing_opentelemetry::layer()
                .with_tracer(tracer)
                .with_filter(EnvFilter::from_default_env()),
        )
        .try_init()?;

    let database_max_connections = env::var("DATABASE_MAX_CONNECTIONS")
        .map_err(|e| anyhow!("failed to get DATABASE_MAX_CONNECTIONS from env: {e}"))?
        .parse::<u32>()
        .map_err(|e| anyhow!("failed to parse DATABASE_MAX_CONNECTIONS: {e}"))?;

    let database_connection_timeout_seconds = env::var("DATABASE_CONNECTION_TIMEOUT_SECONDS")
        .unwrap_or_else(|_| String::from("30"))
        .parse::<u64>()
        .map_err(|e| anyhow!("failed to parse DATABASE_CONNECTION_TIMEOUT_SECONDS: {e}"))?;

    let test_before_acquire = env::var("TEST_BEFORE_ACQUIRE")
        .unwrap_or_else(|_| String::from("true"))
        .parse()
        .map_err(|e| anyhow!("failed to parse TEST_BEFORE_ACQUIRE: {e}"))?;

    let database_url = &env::var("DATABASE_URL")
        .map_err(|e| anyhow!("failed to get DATABASE_URL from env: {e}"))?;

    let pool = PgPoolOptions::new()
        .acquire_timeout(Duration::from_secs(database_connection_timeout_seconds))
        .test_before_acquire(test_before_acquire)
        .max_connections(database_max_connections)
        .connect(database_url)
        .await
        .map_err(|e| anyhow!("failed to connect to postgres: {e}"))?;

    info!("connected to database");

    sqlx::migrate!()
        .run(&pool)
        .await
        .map_err(|e| anyhow!("failed to migrate database: {e}"))?;

    let quote_client_addr = env::var("QUOTE_CLIENT_ADDR")
        .map_err(|e| anyhow!("failed to get QUOTE_CLIENT_ADDR from env: {e}"))?;

    let channel = Channel::from_shared(quote_client_addr)
        .map_err(|e| anyhow!("failed to create channel: {e}"))?
        .connect()
        .await
        .map_err(|e| anyhow!("failed to connect to quote client: {e}"))?;

    info!("connected to quote client");

    let quote_client = QuoteClient::new(channel);

    let server_addr = env::var("SERVER_ADDR")
        .map_err(|e| anyhow!("failed to get SERVER_ADDR from env: {e}"))?
        .parse()
        .map_err(|e| anyhow!("failed to parse SERVER_ADDR into an SocketAddr: {e}"))?;

    let (metrics_layer, counter) =
        tower_http::metrics::in_flight_requests::InFlightRequestsLayer::pair();

    tokio::spawn(
        counter.run_emitter(Duration::from_secs(1), |in_flight_requests| async move {
            info!("in flight requests: {}", in_flight_requests);
        }),
    );

    Server::builder()
        .layer(tower_http::request_id::SetRequestIdLayer::x_request_id(
            MakeRequestUuid,
        ))
        .layer(metrics_layer)
        .layer(
            tower_http::trace::TraceLayer::new_for_grpc()
                .on_response(DefaultOnResponse::default().latency_unit(LatencyUnit::Micros))
                .make_span_with(DefaultMakeSpan::new().include_headers(true)),
        )
        .add_service(DayTraderServer::new(DayTraderImpl::new(pool, quote_client)))
        .serve_with_shutdown(server_addr, async {
            tokio::signal::ctrl_c().await.unwrap();
            info!("server shutting down");
        })
        .await
        .map_err(|e| anyhow!("failed to serve: {e}"))?;

    Ok(())
}
