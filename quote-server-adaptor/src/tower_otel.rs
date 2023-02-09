use futures_util::future::FutureExt;
use hyper::header::HeaderName;
use hyper::http::HeaderValue;
use hyper::Request;
use opentelemetry::propagation::{Extractor, Injector};
use opentelemetry::trace::{Span, Status, Tracer};
use std::fmt::Debug;
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use tower::{Layer, Service};

#[derive(Clone, Debug)]
pub struct OtelLayer<T> {
    pub tracer: T,
}

impl<T> OtelLayer<T>
where
    T: Tracer,
{
    pub fn new(tracer: T) -> Self {
        Self { tracer }
    }
}

impl<S, T> Layer<S> for OtelLayer<T>
where
    T: Clone,
{
    type Service = OtelService<S, T>;

    fn layer(&self, inner: S) -> Self::Service {
        OtelService {
            inner,
            tracer: self.tracer.clone(),
        }
    }
}

#[derive(Clone, Debug)]
pub struct OtelService<S, T> {
    inner: S,
    tracer: T,
}

impl<S, T, B, L> Service<Request<B>> for OtelService<S, T>
where
    S: Service<Request<B>, Response = hyper::Response<L>>,
    S::Error: Debug,
    S::Future: Send + 'static,
    S::Response: Send,
    T: Tracer,
    T::Span: Send + 'static,
{
    type Response = S::Response;
    type Error = S::Error;
    type Future = Pin<Box<dyn Future<Output = Result<S::Response, S::Error>> + Send>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, mut req: Request<B>) -> Self::Future {
        let context = opentelemetry::global::get_text_map_propagator(|prop| {
            prop.extract(&HeaderMap(req.headers_mut()))
        });
        let uri = req.uri();

        let builder = self.tracer.span_builder(uri.path().to_string());
        let mut span = self.tracer.build_with_context(builder, &context);

        let fut = self.inner.call(req).map(move |res| match res {
            Ok(mut ok) => {
                opentelemetry::global::get_text_map_propagator(|prop| {
                    prop.inject(&mut HeaderMap(ok.headers_mut()))
                });
                span.end();
                Ok(ok)
            }
            Err(e) => {
                span.set_status(Status::error(format!("{e:?}")));
                span.end();
                Err(e)
            }
        });

        Box::pin(fut)
    }
}

struct HeaderMap<'a>(&'a mut hyper::HeaderMap);

impl<'a> Extractor for HeaderMap<'a> {
    fn get(&self, key: &str) -> Option<&str> {
        self.0.get(key).and_then(|v| v.to_str().ok())
    }

    fn keys(&self) -> Vec<&str> {
        self.0.keys().map(|it| it.as_str()).collect()
    }
}

impl<'a> Injector for HeaderMap<'a> {
    fn set(&mut self, key: &str, value: String) {
        self.0.insert(
            HeaderName::try_from(key).expect("key to be a valid header"),
            HeaderValue::try_from(&value).expect("value to be a valid header value"),
        );
    }
}
