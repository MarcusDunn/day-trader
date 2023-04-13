# Lean

The leanest meanest backend you'll ever see.

## Configuration

The lean backend can be configured with the following environment variables:

- `TRACE_ID_RATIO`: The ratio of requests to trace. 0.0 means no tracing, 1.0 means trace all requests. Defaults to `1.0`.
- `DATABASE_MAX_CONNECTIONS`: The maximum number of connections to the database. Must be configured. eg. `5000`
- `DATABASE_URL`: The URL of the database. Must be configured. eg. `postgres://postgres:postgres@localhost:5432/postgres`
- `DATABASE_CONNECTION_TIMEOUT_SECONDS`: The number of seconds to wait for a database connection. Defaults to `30`.
- `TEST_BEFORE_ACQUIRE`: Whether to test the connection before acquiring it. Defaults to `true`.
- `QUOTE_CLIENT_ADDR`: The address of the quote service. Must be configured. eg. `http://localhost:8080`
- `SERVER_ADDR`: The address to listen on. Must be configured. eg. `0.0.0.0:8000`
- `QUOTE_CACHE_TTL`: The time to live of the quote cache in seconds. Defaults to `300`.
- `RUST_LOG`: The log level. Defaults to `none,lean=info`.

In addition, open-telemetry can be configured with the environment variables that are specified [here](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#endpoint-urls-for-otlphttp):

