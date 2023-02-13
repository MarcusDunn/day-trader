# Quote Server Adaptor

This serves as a gRPC wrapper around the UVic quote server. It has the goal of being minimal overhead.

## Running

It requires a two environment variables:

- `QUOTE_SERVER_URI`: The URI of the UVic quote server. You can set this to `FAKE` to simulate the UVic quote server.
    - e.g. `quoteserver.seng.uvic.ca:4000`.
- `OTEL_EXPORTER_URI`: The URI of the Jaeger collector.
  - e.g. `localhost:14268`

And one optional one:
- `SERVER_ADDR`: the uri to serve from. 
  - defaults to `0.0.0.0:50051`.

## Overview

The server opens a single TCP stream to the provided quote server. gRPC requests are marshalled into an appropriate
message and sent to the quote server. The response from the quote server is than marshalled into a gRPC response and
sent as a response. Synchronization is done through a multiple producer single consumer channel, where the single
consumer owns the TCP stream and responds via a passed in send end of an oneshot channel.

## Jaeger

The server expects port 

## Future Plans

- [ ] Add caching
    - Caching will be key to minimizing requests to the quote-server. If we decide a cache is needed, this service will
      handle writing to the cache. Cache reading would still be done by callers of this service to avoid the overhead of
      an HTTP call.
- [ ] Investigate performance of multiple TCP connections
    - Currently, the adaptor only opens a single TCP connection to the UVic quote server. The justification for this is
      that this adaptor will be much faster than the quote server and the synchronization overhead of the multiple
      producer multiple consumer queue required to support multiple connections would not be outweighed by the benefits
      of multiple connections to the kernel. This could be looked into. Alternatives include simply starting more
      adaptors and putting a load balancer in front of them which would simplify the server but make infrastructure more
      complex.
