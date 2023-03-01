import {credentials, loadPackageDefinition, Server} from "@grpc/grpc-js";
import {loadSync} from "@grpc/proto-loader";
import {ProtoGrpcType} from "./day-trader";
import {LogHandlers} from "./day_trader/Log";

const def = loadSync(__dirname + "../../protos/day_trader.proto")
const definitions = loadPackageDefinition(def) as unknown as ProtoGrpcType


// example of a client if you need to call an external service
// const quoteClient = new definitions.day_trader.Quote("localhost:80", credentials.createInsecure())

const server = new Server();

const DisplaySummary: LogHandlers['DisplaySummary'] = (call, callback) => {
    return callback(null, {})
}

const DumpLog: LogHandlers['DumpLog'] = (call, callback) => {
    return callback(null, {})
}

const DumpLogUser: LogHandlers['DumpLogUser'] = (call, callback) => {
    return callback(null, {})
}

const implementation: LogHandlers = {
    DisplaySummary,
    DumpLog,
    DumpLogUser,
}

server.addService(definitions.day_trader.Log.service, implementation)

server.start()
