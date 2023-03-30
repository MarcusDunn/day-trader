fn main() {
    tonic_build::configure()
        .build_client(true)
        .build_server(true)
        .compile(&["day-trader.proto"], &["../protos"])
        .unwrap();

    println!("cargo:rerun-if-changed=migrations");
}
