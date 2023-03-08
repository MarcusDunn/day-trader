import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from "@prisma/client";
import { loadPackageDefinition, Server } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/day-trader";
import { LogHandlers } from "./proto/day_trader/Log";
import { create as createXmlBuilder } from 'xmlbuilder2';

const prisma = new PrismaClient();

const server = new grpc.Server();
const port = process.env.PORT || 50051;
const credentials = grpc.ServerCredentials.createInsecure();

const def = loadSync(__dirname + "../protos/day_trader.proto")
const definitions = loadPackageDefinition(def) as unknown as ProtoGrpcType

server.bindAsync(`0.0.0.0:${port}`, credentials, () => {
    server.start();
    console.log(`gRPC server started on port ${port}`);
});

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

    //will also need to query the transaction server to get current status of the user

    const userSummary = {
        userCommands: userCommands,
        accountTransactions: accountTransactions,
    }

    return callback(null, userSummary);
}

const DumpLog: LogHandlers['DumpLog'] = async (call, callback) => {
    const allUserCommands = await prisma.userCommand.findMany({ orderBy: { timestamp: 'asc' } });
    const allAccountTransactions = await prisma.accountTransaction.findMany({ orderBy: { timestamp: 'asc' } });
    const allSystemEvents = await prisma.systemEvent.findMany({ orderBy: { timestamp: 'asc' } });
    const allQuoteServers = await prisma.quoteServer.findMany({ orderBy: { timestamp: 'asc' } });
    const allErrorEvents = await prisma.errorEvent.findMany({ orderBy: { timestamp: 'asc' } });


    const xml = createXmlBuilder({ version: '1.0' }) //set to xml version 1.0
        .ele('?xml version="1.0"?')
        .ele('root')
        .ele(allUserCommands)
        .ele(allAccountTransactions)
        .ele(allSystemEvents)
        .ele(allQuoteServers)
        .ele(allErrorEvents)

    const xmlString = xml.end({ prettyPrint: true });
    return callback(null, { xml: xmlString })
}

const DumpLogUser: LogHandlers['DumpLogUser'] = async (call, callback) => {
    const usersUserCommands = await prisma.userCommand.findMany({ where: { username: call.request.userId }, orderBy: { timestamp: 'asc' } });
    const usersAccountTransactions = await prisma.accountTransaction.findMany({ where: { username: call.request.userId }, orderBy: { timestamp: 'asc' } });
    const usersSystemEvents = await prisma.systemEvent.findMany({ where: { username: call.request.userId }, orderBy: { timestamp: 'asc' } });
    const usersQuoteServers = await prisma.quoteServer.findMany({ where: { username: call.request.userId }, orderBy: { timestamp: 'asc' } });
    const usersErrorEvents = await prisma.errorEvent.findMany({ where: { username: call.request.userId }, orderBy: { timestamp: 'asc' } });

    const xml = createXmlBuilder({ version: '1.0' }) //set to xml version 1.0
        .ele('?xml version="1.0"?')
        .ele('root')
        .ele(usersUserCommands)
        .ele(usersAccountTransactions)
        .ele(usersSystemEvents)
        .ele(usersQuoteServers)
        .ele(usersErrorEvents)

    const xmlString = xml.end({ prettyPrint: true });
    return callback(null, { xml: xmlString })
}

const InsertAccountTransaction: LogHandlers['InsertAccountTransaction'] = async (call, callback) => {
    const insertTransaction = await prisma.accountTransaction.create({
        data: {
            timestamp: Date.now(),
            server: call.request.server || 'undefined',
            action: call.request.action || 'undefined',
            username: call.request.username || 'undefined',
            funds: call.request.funds || 0,
        },
    });
    return callback(null, { transaction: insertTransaction })
}

const InsertErrorEvent: LogHandlers['InsertErrorEvent'] = async (call, callback) => {
    const insertError = await prisma.errorEvent.create({
        data: {
            timestamp: Date.now(),
            server: call.request.server || 'undefined',
            username: call.request.username || 'undefined',
            stockSymbol: call.request.stockSymbol || 'undefined',
            funds: call.request.funds || 0,
            command: call.request.command || 'undefined',
            errorMessage: call.request.errorMessage || 'undefined',
        },
    });
    return callback(null, { errorMessage: insertError });
}

const InsertQuoteServer: LogHandlers['InsertQuoteServer'] = async (call, callback) => {
    const insertQuote = await prisma.quoteServer.create({
        data: {
            timestamp: Date.now(),
            server: call.request.server || 'undefined',
            quoteServerTime: call.request.quoteServerTime ? call.request.quoteServerTime.toNumber() : 0,
            username: call.request.username || 'undefined',
            stockSymbol: call.request.stockSymbol || 'undefined',
            price: call.request.price || 0,
            cryptokey: call.request.cryptokey || 'undefined'
        }
    })
    return callback(null, { quoteMessage: insertQuote });
}

const InsertSystemEvent: LogHandlers['InsertSystemEvent'] = async (call, callback) => {
    const insertSystemEventQuery = await prisma.systemEvent.create({
        data: {
            timestamp: Date.now(),
            server: call.request.server || 'undefined',
            command: call.request.command || 'undefined',
            username: call.request.username || 'undefined',
            stockSymbol: call.request.stockSymbol || 'undefined',
            funds: call.request.funds || 0,
        },
    })
    return callback(null, { systemMessage: insertSystemEventQuery });
}

const InsertUserCommand: LogHandlers['InsertUserCommand'] = async (call, callback) => {
    const insertCommand = await prisma.userCommand.create({
        data: {
            timestamp: Date.now(),
            server: call.request.server || 'undefined',
            command: call.request.command || 'undefined',
            username: call.request.username || 'undefined',
            stockSymbol: call.request.stockSymbol || 'undefined',
            funds: call.request.funds || 0,
        },
    })
    return callback(null, { commandMessage: insertCommand });
}

const implementation: LogHandlers = {
    DisplaySummary,
    DumpLog,
    DumpLogUser,
    InsertAccountTransaction,
    InsertErrorEvent,
    InsertQuoteServer,
    InsertSystemEvent,
    InsertUserCommand,
}

server.addService(definitions.day_trader.Log.service, implementation)

server.start()