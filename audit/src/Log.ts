import { PrismaClient } from "@prisma/client";
import { LogHandlers } from "./proto/day_trader/Log";
import { create as createXmlBuilder } from 'xmlbuilder2';
import { Status } from "@grpc/grpc-js/build/src/constants";

const prisma = new PrismaClient();

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

    return callback({code: Status.OK}, userSummary);
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
    return callback({code: Status.OK}, { xml: xmlString })
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
    return callback({code: Status.OK}, { xml: xmlString })
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
    return callback({code: Status.OK}, insertTransaction)
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
    return callback({code: Status.OK}, insertError );
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
    return callback({code: Status.OK}, insertQuote);
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
    return callback({code: Status.OK}, insertSystemEventQuery);
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
    return callback({code: Status.OK}, insertCommand);
}

export const LogImplementation: LogHandlers = {
    DisplaySummary,
    DumpLog,
    DumpLogUser,
    InsertAccountTransaction,
    InsertErrorEvent,
    InsertQuoteServer,
    InsertSystemEvent,
    InsertUserCommand,
}