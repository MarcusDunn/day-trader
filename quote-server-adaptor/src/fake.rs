use rand::distributions::Alphanumeric;
use rand::Rng;
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::io::{AsyncRead, AsyncWrite, ReadBuf};
use tracing::info;

#[derive(Default, Clone, Debug)]
pub struct FakeQuoteServer {
    sent: Arc<Mutex<Option<String>>>,
}

impl AsyncWrite for FakeQuoteServer {
    fn poll_write(
        self: Pin<&mut Self>,
        _: &mut Context<'_>,
        buf: &[u8],
    ) -> Poll<Result<usize, std::io::Error>> {
        let string = String::from_utf8(buf.to_vec()).expect("valid utf8");
        self.sent.lock().unwrap().replace(string);
        Poll::Ready(Ok(buf.len()))
    }

    fn poll_flush(self: Pin<&mut Self>, _: &mut Context<'_>) -> Poll<Result<(), std::io::Error>> {
        Poll::Ready(Ok(()))
    }

    fn poll_shutdown(
        self: Pin<&mut Self>,
        _: &mut Context<'_>,
    ) -> Poll<Result<(), std::io::Error>> {
        Poll::Ready(Ok(()))
    }
}

impl AsyncRead for FakeQuoteServer {
    fn poll_read(
        self: Pin<&mut Self>,
        _: &mut Context<'_>,
        buf: &mut ReadBuf<'_>,
    ) -> Poll<std::io::Result<()>> {
        let option = { self.sent.lock().unwrap().take() };
        let mut rng = rand::thread_rng();
        match option {
            None => Poll::Ready(Ok(())),
            Some(last) => {
                if let [user, ticker] = last.split(',').map(str::trim).collect::<Vec<_>>()[..] {
                    let price = rng.gen_range(50..300);
                    let timestamp = SystemTime::now()
                        .duration_since(UNIX_EPOCH)
                        .expect("time went backwards")
                        .as_millis();
                    let hash = rng
                        .sample_iter(Alphanumeric)
                        .take(57)
                        .map(char::from)
                        .collect::<String>();
                    let string = format!("{price},{ticker},{user},{timestamp},{hash}");
                    info!("sending {string}");
                    buf.put_slice(string.as_bytes());
                    Poll::Ready(Ok(()))
                } else {
                    buf.put_slice(b"error - bad request");
                    Poll::Ready(Ok(()))
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::ops::Deref;
    use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};

    #[tokio::test]
    async fn check_fake_quote_server_can_respond() {
        let mut server = FakeQuoteServer::default();
        server
            .write_all(b"marcus,TSLA")
            .await
            .expect("write should succeed");
        let mut reader = BufReader::new(server.clone());
        let mut str = String::new();
        reader.read_line(&mut str).await.expect("read should work");
        let [price, ticker, name, timestamp, hash] = str.split(',').collect::<Vec<_>>()[..] else { panic!("invalid") };
        assert!(price.parse::<u32>().is_ok());
        assert!(ticker.parse::<u32>().is_err());
        assert!(name.parse::<u32>().is_err());
        let timestamp = timestamp.parse::<u128>().unwrap();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("time went backwards")
            .as_millis();
        assert!(now >= timestamp);
        assert!(hash.parse::<u32>().is_err());
        assert_eq!(*server.sent.lock().unwrap().deref(), None);
    }
}
