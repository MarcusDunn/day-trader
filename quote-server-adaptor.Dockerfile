FROM rust as build
WORKDIR app
RUN apt-get update
RUN apt-get install -y protobuf-compiler
COPY protos protos
COPY quote-server-adaptor quote-server-adaptor
RUN cargo install --path quote-server-adaptor

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y extra-runtime-dependencies && rm -rf /var/lib/apt/lists/*
COPY --from=build /usr/local/cargo/bin/quote-server-adaptor /usr/local/bin/quote-server-adaptor
ENTRYPOINT ["quote-server-adaptor"]