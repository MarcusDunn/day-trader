use opentelemetry::runtime::Tokio;
use opentelemetry::sdk::Resource;
use opentelemetry::{global, KeyValue};
use quote_server_adaptor::fake::FakeQuoteServer;
use quote_server_adaptor::quote_server::{Quote, QuoteServer};

use opentelemetry::sdk::trace::Config;
use quote_server_adaptor::{QuoteRequest, QuoteResponse};
use std::env;
use std::error::Error;
use std::fmt::Debug;
use std::mem::size_of;
use tokio::io::{AsyncBufRead, AsyncWriteExt};
use tokio::io::{AsyncBufReadExt, AsyncWrite};
use tokio::io::{AsyncRead, BufReader};
use tokio::net::TcpStream;
use tokio::select;
use tokio::sync::mpsc::Receiver;
use tokio::sync::oneshot::Sender;
use tokio::sync::{mpsc, oneshot};
use tonic::transport::Server;
use tonic::{Request, Response, Status};
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

    let (tcp_handler_send, mut tcp_handler_recv) =
        mpsc::channel::<(String, Sender<Result<String, &'static str>>)>(32);

    let socket_handler = tokio::spawn(async move {
        let quote_server_addr = env::var("QUOTE_SERVER_URI")
            .expect("QUOTE_SERVER_URI environment variable should be set.");
        if quote_server_addr == "FAKE" {
            run_fake_quote_server(&mut tcp_handler_recv).await;
        } else {
            run_quote_server(&mut tcp_handler_recv, &quote_server_addr).await;
        }
    });

    let addr = env::var("SERVER_ADDR")
        .unwrap_or_else(|_| String::from("0.0.0.0:50051"))
        .parse()?;

    let server = Server::builder()
        .layer(
            tower_http::trace::TraceLayer::new_for_grpc()
                .on_request(DefaultOnRequest::default().level(tracing::Level::INFO))
                .on_response(
                    DefaultOnResponse::default()
                        .level(tracing::Level::INFO)
                        .latency_unit(LatencyUnit::Micros),
                ),
        )
        .add_service(QuoteServer::new(Quoter {
            tcp_handler_send: tcp_handler_send.clone(),
        }))
        .serve_with_shutdown(addr, async {
            tokio::signal::ctrl_c().await.unwrap();
            info!("received shutdown signal")
        });
    info!("listening on {addr}");

    let exit_result = select! {
        socket_handler_result = socket_handler => {
            match socket_handler_result {
                Err(err) => {
                    Err(err.into())
                },
                Ok(()) => {
                    Err("Socket handler exited successfully. (It should never exit)".into())
                },
            }
        }
        server_result = server => {
            match server_result {
                Err(err) => {
                    Err(err.into())
                }
                Ok(()) => {
                    Err("Server exited successfully.".into())
                }
            }
        }
    };

    global::shutdown_tracer_provider();

    exit_result
}

async fn run_quote_server(
    tcp_handler_recv: &mut Receiver<(String, Sender<Result<String, &str>>)>,
    quote_server_addr: &String,
) -> ! {
    loop {
        let mut stream = TcpStream::connect(&quote_server_addr)
            .await
            .unwrap_or_else(|err| panic!("The passed in quote server URI [{quote_server_addr}] should be possible to connect to: {err}"));

        let (reader, mut writer) = stream.split();

        let mut reader = BufReader::new(reader);

        handle_socket(tcp_handler_recv, &mut writer, &mut reader).await;
    }
}

async fn run_fake_quote_server(
    tcp_handler_recv: &mut Receiver<(String, Sender<Result<String, &str>>)>,
) -> ! {
    let mut quote_server = FakeQuoteServer::default();
    let mut writer = quote_server.clone();
    let mut reader = BufReader::new(&mut quote_server);
    info!("running a fake quote server");
    loop {
        handle_socket(tcp_handler_recv, &mut writer, &mut reader).await
    }
}

#[instrument(skip_all)]
async fn handle_socket<T, G>(
    tcp_handler_recv: &mut Receiver<(String, Sender<Result<String, &str>>)>,
    mut writer: &mut T,
    mut reader: &mut BufReader<G>,
) where
    T: AsyncWrite + Debug + Unpin,
    G: AsyncRead + Debug + Unpin,
{
    let (send, respond) = tcp_handler_recv
        .recv()
        .await
        .expect("The send side of the tcp_handler should never be closed.");

    let response = get_response(&mut writer, &mut reader, send).await;

    match respond.send(response) {
        Ok(()) => {}
        Err(err) => {
            println!("Failed to send {err:?} to oneshot channel.")
        }
    };
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
    if (writer.write_all(message.as_bytes()).await).is_err() {
        return Err("Failed to write to socket.");
    }

    let mut line = String::new();
    if (reader.read_line(&mut line).await).is_err() {
        return Err("Failed to read from socket.");
    }
    Ok(line)
}

#[derive(Debug)]
struct Quoter {
    tcp_handler_send: mpsc::Sender<(String, Sender<Result<String, &'static str>>)>,
}

#[tonic::async_trait]
impl Quote for Quoter {
    async fn quote(
        &self,
        request: Request<QuoteRequest>,
    ) -> Result<Response<QuoteResponse>, Status> {
        let (send, recv) = oneshot::channel::<Result<String, &'static str>>();

        let QuoteRequest {
            user_id,
            stock_symbol,
            request_num: _,
        } = request.into_inner();

        let message = make_socket_message(user_id, &stock_symbol);
        self.tcp_handler_send
            .send((message, send))
            .await
            .map_err(|err| {
                Status::internal(format!(
                    "Error while sending request to mpsc channel: {err}"
                ))
            })?;

        let line = recv
            .await
            .expect("The send end of the oneshot should never be closed.")
            .map_err(|err| {
                Status::internal(format!(
                    "Error while receiving a message from oneshot channel {err}"
                ))
            })?;

        let response = response_from_quote_server_string(&line).map_err(Status::internal)?;

        Ok(Response::new(response))
    }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn check_make_socket_message() {
        assert_eq!(
            "hello,world\n",
            make_socket_message("hello".to_string(), "world")
        )
    }

    #[tokio::test]
    async fn check_quoter_success() {
        let (send, mut recv) = mpsc::channel::<(String, Sender<Result<String, &str>>)>(32);

        tokio::spawn(async move {
            let (str, sender) = recv.recv().await.unwrap();
            assert_eq!(str, "marcus,TSLA\n");
            sender
                .send(Ok("100.0,TSLA,marcus,1675326735,webfweiof".to_string()))
                .unwrap();
        });

        let response = Quoter {
            tcp_handler_send: send,
        }
        .quote(Request::new(QuoteRequest {
            user_id: "marcus".to_string(),
            stock_symbol: "TSLA".to_string(),
            request_num: 0,
        }))
        .await
        .unwrap();

        assert_eq!(
            QuoteResponse {
                quote: 100.0,
                sym: "TSLA".to_string(),
                user_id: "marcus".to_string(),
                timestamp: 1675326735,
                crypto_key: "webfweiof".to_string(),
            },
            response.into_inner()
        );
    }

    #[tokio::test]
    async fn check_handle_message_success() {
        let mut writer = Vec::new();
        let reader = Vec::from("response");
        let message = make_socket_message("marcus".to_string(), "TSLA");

        let response = get_response(&mut writer, &mut BufReader::new(reader.as_slice()), message)
            .await
            .unwrap();

        assert_eq!("response", response)
    }

    #[test]
    fn check_response_from_string() {
        let response =
            response_from_quote_server_string("100.0,TSLA,marcus,1675326735,webfweiof").unwrap();
        assert_eq!(
            QuoteResponse {
                quote: 100.0,
                sym: "TSLA".to_string(),
                user_id: "marcus".to_string(),
                timestamp: 1675326735,
                crypto_key: "webfweiof".to_string(),
            },
            response
        )
    }
}
