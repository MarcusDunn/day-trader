use opentelemetry::global;
use opentelemetry::propagation::Extractor;
use std::task::{Context, Poll};
use tonic::{Request, Status};
use tracing_opentelemetry::OpenTelemetrySpanExt;

pub fn otel_tracing<T>(req: Request<T>) -> Result<Request<T>, Status> {
    let parent_ctx =
        global::get_text_map_propagator(|prop| prop.extract(&MetadataMap(req.metadata())));
    tracing::Span::current().set_parent(parent_ctx);
    Ok(req)
}

struct MetadataMap<'a>(&'a tonic::metadata::MetadataMap);

impl<'a> Extractor for MetadataMap<'a> {
    /// Get a value for a key from the MetadataMap.  If the value can't be converted to &str, returns None
    fn get(&self, key: &str) -> Option<&str> {
        self.0.get(key).and_then(|metadata| metadata.to_str().ok())
    }

    /// Collect all the keys from the MetadataMap.
    fn keys(&self) -> Vec<&str> {
        self.0
            .keys()
            .map(|key| match key {
                tonic::metadata::KeyRef::Ascii(v) => v.as_str(),
                tonic::metadata::KeyRef::Binary(v) => v.as_str(),
            })
            .collect::<Vec<_>>()
    }
}
