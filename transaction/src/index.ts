import { loadPackageDefinition, Server} from "@grpc/grpc-js";
import {loadSync} from "@grpc/proto-loader";
import {ProtoGrpcType} from "./proto/day-trader";
import * as grpc from '@grpc/grpc-js';
import { TransactionImplementations } from "./services/Transaction";
import { TriggerImplementation } from "./services/Trigger";
import { CheckTriggers } from "./utils/CheckTriggers";


const def = loadSync(__dirname + "/../../protos/day-trader.proto")
const definitions = loadPackageDefinition(def) as unknown as ProtoGrpcType

const server = new Server();

server.addService(definitions.day_trader.Transaction.service, TransactionImplementations)
server.addService(definitions.day_trader.Trigger.service, TriggerImplementation)


const port = process.env.PORT || 50051;

server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log(`gRPC server started on port ${port}`);
    setInterval(() => {
        CheckTriggers();
    }, 300000); // every 5 minutes check triggers
});