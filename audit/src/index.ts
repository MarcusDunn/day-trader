import * as grpc from '@grpc/grpc-js';
import { loadPackageDefinition, Server } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/day-trader";
import { LogImplementation } from './Log';

const def = loadSync(__dirname + "/proto/day-trader-copy.proto")
const definitions = loadPackageDefinition(def) as unknown as ProtoGrpcType

const server = new grpc.Server();
const port = process.env.PORT || 50051;
const credentials = grpc.ServerCredentials.createInsecure();


server.addService(definitions.day_trader.Log.service, LogImplementation)

server.bindAsync(`0.0.0.0:${port}`, credentials, () => {
    server.start();
    console.log(`Audit server started on port ${port}`);
});