import grpc from "@grpc/grpc-js"
import protoloader from "@grpc/proto-loader"

const PROTO_PATH = __dirname + '/../../../protos/route_guide.proto';

const packageDefinition = protoloader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

export const loadPackageDefinition = grpc.loadPackageDefinition(packageDefinition);
