use opentelemetry::global;
use opentelemetry::runtime::Tokio;
use std::env;
use std::error::Error;
use std::fmt::Debug;
use std::mem::size_of;
use opentelemetry::sdk::propagation::TraceContextPropagator;

use quote_server_adaptor::quote_server::{Quote, QuoteServer};
use quote_server_adaptor::{QuoteRequest, QuoteResponse};
use tokio::io::BufReader;
use tokio::io::{AsyncBufRead, AsyncWriteExt};
use tokio::io::{AsyncBufReadExt, AsyncWrite};
use tokio::net::tcp::{OwnedReadHalf, OwnedWriteHalf};
use tokio::net::TcpStream;
use tokio::select;
use tokio::sync::mpsc::Receiver;
use tokio::sync::oneshot::Sender;
use tokio::sync::{mpsc, oneshot};
use tonic::transport::Server;
use tonic::{Request, Response, Status};
use tonic::service::interceptor;
use tracing::{info, instrument};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use quote_server_adaptor::otel::otel_tracing;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    global::set_text_map_propagator(TraceContextPropagator::new());

    let tracer = opentelemetry_jaeger::new_collector_pipeline()
        .with_reqwest()
        .with_service_name("quote-server-adaptor")
        .with_endpoint(env::var("JAEGER_URI").expect("JAEGER_URI should be set"))
        .install_batch(Tokio)?;

    tracing_subscriber::registry()
        .with(tracing::level_filters::LevelFilter::INFO)
        .with(tracing_opentelemetry::layer().with_tracer(tracer))
        .try_init()?;

    info!("starting");

    let (tcp_handler_send, mut tcp_handler_recv) =
        mpsc::channel::<(String, Sender<Result<String, &'static str>>)>(32);

    let socket_handler = tokio::spawn(async move {
        let quote_server_addr = env::var("QUOTE_SERVER_URI")
            .expect("QUOTE_SERVER_URI environment variable should be set.");
        let (reader, mut writer) = TcpStream::connect(&quote_server_addr)
            .await
            .expect("The passed in quote server URI should be possible to connect to.")
            .into_split();
        println!("connected to {quote_server_addr}");

        let mut reader = BufReader::new(reader);

        loop {
            handle_socket(&mut tcp_handler_recv, &mut writer, &mut reader).await;
        }
    });

    let server = Server::builder()
        .layer(interceptor(otel_tracing))
        .add_service(QuoteServer::new(Quoter { tcp_handler_send }))
        .serve(([127, 0, 0, 1], 5000).into());

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

#[instrument]
async fn handle_socket(
    tcp_handler_recv: &mut Receiver<(String, Sender<Result<String, &str>>)>,
    mut writer: &mut OwnedWriteHalf,
    mut reader: &mut BufReader<OwnedReadHalf>,
) {
    let (send, respond) = tcp_handler_recv
        .recv()
        .await
        .expect("The send side of the tcp_handler should never be closed.");

    match respond.send(get_response(&mut writer, &mut reader, send).await) {
        Ok(()) => {}
        Err(err) => {
            println!("Failed to send {err:?} to oneshot channel.")
        }
    };
}

#[instrument]
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
    #[instrument]
    async fn quote(
        &self,
        request: Request<QuoteRequest>,
    ) -> Result<Response<QuoteResponse>, Status> {
        let (send, recv) = oneshot::channel::<Result<String, &'static str>>();

        let QuoteRequest {
            user_id,
            stock_symbol,
        } = request.into_inner();

        self.tcp_handler_send
            .send((make_socket_message(user_id, &stock_symbol), send))
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

fn response_from_quote_server_string(line: &str) -> Result<QuoteResponse, &'static str> {
    let mut returned = line.split(',');

    let response = QuoteResponse {
        quote: returned
            .next()
            .ok_or("Invalid response from quote server. (Missing quote)")?
            .parse()
            .map_err(|_| "Invalid response from quote server. (Invalid quote)")?,
        sym: returned
            .next()
            .ok_or("Invalid response from quote server. (Missing sym)")?
            .to_string(),
        user_id: returned
            .next()
            .ok_or("Invalid response from quote server. (Missing user_id)")?
            .to_string(),
        timestamp: returned
            .next()
            .ok_or("Invalid response from quote server. (Missing timestamp)")?
            .parse()
            .map_err(|_| "Invalid response from quote server. (Invalid timestamp)")?,
        crypto_key: returned
            .next()
            .ok_or("Invalid response from quote server. (Missing crypto_key)")?
            .to_string(),
    };
    Ok(response)
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
