use opentelemetry::{global, KeyValue};
use opentelemetry_sdk::runtime::Tokio;
use opentelemetry_sdk::Resource;

use opentelemetry_sdk::trace::Config;
use quote_server_adaptor::quote_server::{Quote, QuoteServer};
use quote_server_adaptor::{QuoteRequest, QuoteResponse};
use rand::distributions::Alphanumeric;
use rand::Rng;
use std::env;
use std::error::Error;
use std::fmt::Debug;
use std::mem::size_of;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::io::BufReader;
use tokio::io::{AsyncBufRead, AsyncWriteExt};
use tokio::io::{AsyncBufReadExt, AsyncWrite};
use tokio::net::TcpStream;
use tokio::task::JoinSet;
use tonic::transport::Server;
use tonic::{async_trait, Request, Response, Status};
use tower::ServiceBuilder;
use tower_http::trace::{DefaultOnRequest, DefaultOnResponse};
use tower_http::LatencyUnit;
use tracing::{info, instrument};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::{EnvFilter, Layer};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(opentelemetry_otlp::new_exporter().tonic())
        .with_trace_config(
            Config::default().with_resource(Resource::new(vec![KeyValue::new(
                "service.name",
                "quote-server-adaptor",
            )])),
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

    info!("starting");

    let quote_server_addr =
        env::var("QUOTE_SERVER_URI").expect("QUOTE_SERVER_URI environment variable should be set.");

    let quoter = Quoter::from_addr(quote_server_addr);

    let addr = env::var("SERVER_ADDR")
        .unwrap_or_else(|_| String::from("0.0.0.0:50051"))
        .parse()?;

    let server = Server::builder()
        // https://github.com/hyperium/tonic/issues/1579
        // .layer(
        //         tower_http::trace::TraceLayer::new_for_grpc()
        //             .on_request(DefaultOnRequest::default().level(tracing::Level::INFO))
        //             .on_response(
        //                 DefaultOnResponse::default()
        //                     .level(tracing::Level::INFO)
        //                     .latency_unit(LatencyUnit::Micros),
        //             )
        // )
        .add_service(QuoteServer::new(quoter))
        .serve_with_shutdown(addr, async {
            tokio::signal::ctrl_c().await.unwrap();
            info!("received shutdown signal")
        });
    info!("listening on {addr}");

    let exit_result = match server.await {
        Err(err) => Err(err.into()),
        Ok(()) => Err("Server exited successfully.".into()),
    };

    global::shutdown_tracer_provider();

    exit_result
}

enum Quoter {
    Real(UVicQuoter),
    Fake(FakeQuoteServer),
}

#[async_trait]
impl Quote for Quoter {
    async fn quote(
        &self,
        request: Request<QuoteRequest>,
    ) -> Result<Response<QuoteResponse>, Status> {
        match self {
            Quoter::Real(real) => real.quote(request).await,
            Quoter::Fake(fake) => fake.quote(request).await,
        }
    }
}

impl Quoter {
    fn from_addr(addr: String) -> Quoter {
        match addr.as_str() {
            "FAKE" => Self::Fake(FakeQuoteServer),
            _ => Self::Real(UVicQuoter {
                quote_server_addr: addr,
                hackery_levels: env::var("HACKERY_LEVELS")
                    .map(|hackery_levels| {
                        hackery_levels
                            .parse()
                            .expect("failed to parse HACKERY_LEVELS")
                    })
                    .unwrap_or(5),
            }),
        }
    }
}

struct FakeQuoteServer;

#[async_trait]
impl Quote for FakeQuoteServer {
    #[instrument(skip_all)]
    async fn quote(
        &self,
        request: Request<QuoteRequest>,
    ) -> Result<Response<QuoteResponse>, Status> {
        let QuoteRequest {
            user_id,
            stock_symbol,
            ..
        } = request.into_inner();
        let mut rng = rand::thread_rng();
        let quote = rng.gen_range(50_f64..300_f64);
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("time went backwards")
            .as_millis();

        let timestamp = u64::try_from(timestamp).map_err(|e| {
            Status::internal(format!("failed to convert timestamp to 64 bits: {e}"))
        })?;

        let crypto_key = rng
            .sample_iter(Alphanumeric)
            .take(57)
            .map(char::from)
            .collect::<String>();

        Ok(Response::new(QuoteResponse {
            quote,
            sym: stock_symbol,
            user_id,
            timestamp,
            crypto_key,
        }))
    }
}

#[derive(Clone)]
struct UVicQuoter {
    quote_server_addr: String,
    hackery_levels: u8,
}

#[async_trait]
impl Quote for UVicQuoter {
    #[instrument(skip(self))]
    async fn quote(
        &self,
        request: Request<QuoteRequest>,
    ) -> Result<Response<QuoteResponse>, Status> {
        let QuoteRequest {
            user_id,
            stock_symbol,
            ..
        } = request.into_inner();

        let mut join_set = JoinSet::new();

        for _ in 0..self.hackery_levels {
            let user_id = user_id.clone();
            let stock_symbol = stock_symbol.clone();
            let quoter = self.clone();
            join_set.spawn(async move {
                quoter
                    .connect_and_query_uvic_quote_server(user_id, &stock_symbol)
                    .await
            });
        }

        let response = join_set
            .join_next()
            .await
            .expect("at least 1 request should be sent")
            .map_err(|e| Status::internal(format!("failed to join: {e}")))??;

        Ok(Response::new(
            response_from_quote_server_string(&response).map_err(Status::internal)?,
        ))
    }
}

impl UVicQuoter {
    #[tracing::instrument(skip_all)]
    async fn connect(&self) -> std::io::Result<TcpStream> {
        TcpStream::connect(&self.quote_server_addr).await
    }

    #[instrument(skip_all)]
    async fn connect_and_query_uvic_quote_server(
        &self,
        user_id: String,
        stock_symbol: &str,
    ) -> Result<String, Status> {
        let mut stream = self.connect().await.map_err(|e| {
            Status::internal(format!(
                "failed to connect to {}: {e}",
                self.quote_server_addr
            ))
        })?;

        let (reader, mut writer) = stream.split();

        let mut reader = BufReader::new(reader);

        let response = get_response(
            &mut writer,
            &mut reader,
            make_socket_message(user_id, stock_symbol),
        )
        .await
        .map_err(|e| Status::internal(format!("failed to get response: {e}")))?;

        Ok(response)
    }
}

#[instrument(skip(writer, reader))]
async fn get_response<W, R>(
    writer: &mut W,
    reader: &mut R,
    message: String,
) -> Result<String, &'static str>
where
    W: AsyncWrite + Unpin + Debug,
    R: AsyncBufRead + Unpin + Debug,
{
    if writer.write_all(message.as_bytes()).await.is_err() {
        return Err("Failed to write to socket.");
    }

    let mut line = String::new();
    if (reader.read_line(&mut line).await).is_err() {
        return Err("Failed to read from socket.");
    }
    Ok(line)
}

fn make_socket_message(mut user_id: String, stock_symbol: &str) -> String {
    user_id.reserve(size_of::<char>() + stock_symbol.len() + size_of::<char>());
    user_id.push(',');
    user_id.push_str(stock_symbol);
    user_id.push('\n');
    user_id
}

fn response_from_quote_server_string(line: &str) -> Result<QuoteResponse, String> {
    let mut returned = line.split(',');

    let quote_str = returned.next().ok_or_else(|| {
        format!("Invalid response from quote server. (Missing quote in \"{line}\")")
    })?;
    let quote = quote_str
        .parse()
        .map_err(|err| format!("Invalid response from quote server. (Invalid quote \"{quote_str}\": {err} in \"{line}\")"))?;
    let sym = returned
        .next()
        .ok_or_else(|| format!("Invalid response from quote server. (Missing sym in \"{line}\")"))?
        .to_string();
    let user_id = returned
        .next()
        .ok_or_else(|| {
            format!("Invalid response from quote server. (Missing user_id in \"{line}\")")
        })?
        .to_string();
    let timestamp_str = returned.next().ok_or_else(|| {
        format!("Invalid response from quote server. (Missing timestamp in \"{line}\")")
    })?;
    let timestamp = timestamp_str
        .parse()
        .map_err(|err| format!("Invalid response from quote server. (Invalid timestamp \"{timestamp_str}\" due to {err} in \"{line}\")"))?;
    let crypto_key = returned
        .next()
        .ok_or_else(|| {
            format!("Invalid response from quote server. (Missing crypto_key in \"{line}\")")
        })?
        .to_string();
    Ok(QuoteResponse {
        quote,
        sym,
        user_id,
        timestamp,
        crypto_key,
    })
}
