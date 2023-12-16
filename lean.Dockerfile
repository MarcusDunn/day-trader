FROM rust as build
WORKDIR app
RUN apt-get update
RUN apt-get install -y protobuf-compiler
COPY protos protos
COPY lean lean
RUN cargo install --path lean

FROM debian:stable-slim
COPY --from=build /usr/local/cargo/bin/lean /usr/local/bin/lean
ENTRYPOINT ["lean"]