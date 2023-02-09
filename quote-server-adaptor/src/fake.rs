use std::ops::Deref;
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll};
use tokio::io::{AsyncRead, AsyncWrite, ReadBuf};

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
        println!("writing {} to sent", &string);
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
        println!("locking!");
        let option = { self.sent.lock().unwrap().take() };
        match option {
            None => Poll::Ready(Ok(())),
            Some(last) => {
                println!("last was {last}");
                if let [user, ticker] = last.split(',').map(str::trim).collect::<Vec<_>>()[..] {
                    let str = format!(
                        "{},{ticker},{user},{},{}",
                        100,
                        1167631200000u64,
                        "IRrR7UeTO35kSWUgG0QJKmB35sL27FKM7AVhP5qpjCgmWQeXFJs35g=="
                    );
                    println!("putting {str} into buf");
                    buf.put_slice(str.as_bytes());
                    println!("buf is {buf:?}");
                    Poll::Ready(Ok(()))
                } else {
                    println!("bad request");
                    buf.put_slice(b"error - bad request");
                    Poll::Ready(Ok(()))
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
    use super::*;

    #[tokio::test]
    async fn check_fake_quote_server_can_respond() {
        let mut server = FakeQuoteServer::default();
        server.write_all(b"marcus,TSLA").await.expect("write should succeed");
        let mut reader = BufReader::new(server.clone());
        let mut str = String::new();
        reader.read_line(&mut str).await.expect("read should work");
        assert_eq!("100,TSLA,marcus,1167631200000,IRrR7UeTO35kSWUgG0QJKmB35sL27FKM7AVhP5qpjCgmWQeXFJs35g==", str.as_str());
        println!("locking!");
        assert_eq!(*server.sent.lock().unwrap().deref(), None);
    }
}
