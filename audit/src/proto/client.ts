import {credentials, loadPackageDefinition, Server} from "@grpc/grpc-js";
import {loadSync} from "@grpc/proto-loader";
import {ProtoGrpcType} from "./day-trader";
import {LogHandlers} from "./day_trader/Log";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const def = loadSync(__dirname + "../../protos/day_trader.proto")
const definitions = loadPackageDefinition(def) as unknown as ProtoGrpcType


// example of a client if you need to call an external service
// const quoteClient = new definitions.day_trader.Quote("localhost:80", credentials.createInsecure())

const server = new Server();

const DisplaySummary: LogHandlers['DisplaySummary'] = async (call, callback) => {
    const userCommands = await prisma.userCommand.findMany({
        where: {
            username: call.request.userId,
        },
        orderBy: {
            timestamp: 'asc',
        },
    });
    const accountTransactions = await prisma.accountTransaction.findMany({
        where: {
            username: call.request.userId,
        },
        orderBy: {
            timestamp: 'asc',
        },
    });

    return callback(null, {})
}

const DumpLog: LogHandlers['DumpLog'] = async (call, callback) => {
    const allUserCommands = await prisma.userCommand.findMany({ orderBy: { timestamp: 'asc' } });
    const allAccountTransactions = await prisma.accountTransaction.findMany({ orderBy: { timestamp: 'asc' } });
    const allSystemEvents = await prisma.systemEvent.findMany({ orderBy: { timestamp: 'asc' } });
    const allQuoteServers = await prisma.quoteServer.findMany({ orderBy: { timestamp: 'asc' } });
    const allErrorEvents = await prisma.errorEvent.findMany({ orderBy: { timestamp: 'asc' } });
    return callback(null, {})
}

const DumpLogUser: LogHandlers['DumpLogUser'] = async (call, callback) => {
    const accountTransactions = await prisma.accountTransaction.findMany({
        where: {
            username: call.request.userId,
        },
        orderBy: {
            timestamp: 'asc',
        },
    });

    return callback(null, {})
}

const implementation: LogHandlers = {
    DisplaySummary,
    DumpLog,
    DumpLogUser,
}

server.addService(definitions.day_trader.Log.service, implementation)

server.start()
