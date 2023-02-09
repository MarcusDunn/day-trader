use std::cell::RefCell;
use std::pin::Pin;
use std::task::{Context, Poll};
use tokio::io::{AsyncRead, AsyncWrite, ReadBuf};

#[derive(Default, Clone, Debug)]
pub struct FakeQuoteServer {
    sent: RefCell<Option<String>>,
}

impl AsyncWrite for FakeQuoteServer {
    fn poll_write(
        self: Pin<&mut Self>,
        _: &mut Context<'_>,
        buf: &[u8],
    ) -> Poll<Result<usize, std::io::Error>> {
        match self.sent.replace(Some(String::from_utf8(buf.to_vec()).expect("valid utf8"))) {
            Some(last) => panic!("wrote twice before getting response! ({last}, {buf:?})"),
            None => {
                Poll::Ready(Ok(buf.len()))
            }
        }
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
        match &self.sent.take() {
            None => Poll::Ready(Ok(())),
            Some(last) => {
                if let [user, ticker] = last.split(',').collect::<Vec<_>>()[..] {
                    let str = format!(
                        "{},{ticker},{user},{},{}",
                        100,
                        1167631200000u64,
                        "IRrR7UeTO35kSWUgG0QJKmB35sL27FKM7AVhP5qpjCgmWQeXFJs35g=="
                    );
                    buf.put_slice(str.as_bytes());
                    Poll::Ready(Ok(()))
                } else {
                    buf.put_slice(b"error - bad request");
                    Poll::Ready(Ok(()))
                }
            }
        }
    }
}
