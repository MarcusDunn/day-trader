import { credentials, loadPackageDefinition, Server } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { ProtoGrpcType } from "./day-trader";
import { LogHandlers } from "./day_trader/Log";
import { accountTransaction, errorEvent, PrismaClient, quoteServer, systemEvent, UserCommand } from '@prisma/client'
import { create as createXmlBuilder } from 'xmlbuilder2';
import { UserCommands } from "../../prisma/dummy_data/UserCommands";

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

const implementation: LogHandlers = {
    DisplaySummary,
    DumpLog,
    DumpLogUser,
}

server.addService(definitions.day_trader.Log.service, implementation)

server.start()

