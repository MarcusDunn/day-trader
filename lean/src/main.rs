use anyhow::anyhow;
use opentelemetry::runtime::Tokio;
use opentelemetry::sdk::trace::Config;
use opentelemetry::sdk::trace::Sampler::TraceIdRatioBased;
use opentelemetry::sdk::Resource;
use opentelemetry::KeyValue;
use opentelemetry_otlp::WithExportConfig;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::time::Duration;
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

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    if let Err(err) = dotenvy::dotenv() {
        warn!("failed to load dotenv: {err}")
    }

    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(opentelemetry_otlp::new_exporter().tonic().with_env())
        .with_trace_config(
            Config::default()
                .with_sampler(TraceIdRatioBased(0.01))
                .with_resource(Resource::new(vec![KeyValue::new("service.name", "legacy")])),
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
        .map_err(|e| anyhow!("failed to get DATABASE_CONNECTION_TIMEOUT_SECONDS from env: {e}"))?
        .parse::<u64>()
        .map_err(|e| anyhow!("failed to parse DATABASE_CONNECTION_TIMEOUT_SECONDS: {e}"))?;

    let database_min_connections = env::var("DATABASE_MIN_CONNECTIONS")
        .map_err(|e| database_max_connections.to_string())?
        .parse::<u32>()
        .map_err(|e| anyhow!("failed to parse DATABASE_MIN_CONNECTIONS: {e}"))?;

    info!(
        "establishing {database_max_connections} connections to database (this may take some time)"
    );

    let pool = PgPoolOptions::new()
        .acquire_timeout(Duration::from_secs(database_connection_timeout_seconds))
        .test_before_acquire(false)
        .max_connections(database_max_connections)
        .min_connections(database_min_connections)
        .connect(
            &env::var("DATABASE_URL")
                .map_err(|e| anyhow!("failed to get DATABASE_URL from env: {e}"))?,
        )
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
