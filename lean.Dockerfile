FROM rust as build
WORKDIR app
RUN apt-get update
RUN apt-get install -y protobuf-compiler
COPY protos protos
COPY lean lean
RUN cargo install --path lean

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y extra-runtime-dependencies && rm -rf /var/lib/apt/lists/*
COPY --from=build /usr/local/cargo/bin/lean /usr/local/bin/lean
ENTRYPOINT ["lean"]