import { PrismaClient } from "@prisma/client";
import { LogHandlers } from "./proto/day_trader/Log";
import { create as createXmlBuilder } from 'xmlbuilder2';
import { Status } from "@grpc/grpc-js/build/src/constants";
import { GetUserInfo } from "./utils/GetUserInfo";

const prisma = new PrismaClient();

const DisplaySummary: LogHandlers['DisplaySummary'] = async (call, callback) => {
    console.log("Log DisplaySummary called with:",call.request);
    if(!call.request.userId){
        return callback({code: Status.INVALID_ARGUMENT}, {});
    }
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

    const userInfo = await GetUserInfo(call.request.userId);

    const userSummary = {
        userCommands: userCommands.map((cmd: any) => {
            cmd.timestamp = String(cmd.timestamp);
            return cmd;
        }),
        accountTransactions: accountTransactions.map((cmd: any) => {
            cmd.timestamp = String(cmd.timestamp);
            return cmd;
        }),
        userSummary: userInfo
    }

    return callback(null, userSummary);
}

const DumpLog: LogHandlers['DumpLog'] = async (call, callback) => {
    console.log("Log DumpLog called with:",call.request);
    const allUserCommands = await prisma.userCommand.findMany({ orderBy: { timestamp: 'asc' } });
    const allAccountTransactions = await prisma.accountTransaction.findMany({ orderBy: { timestamp: 'asc' } });
    const allSystemEvents = await prisma.systemEvent.findMany({ orderBy: { timestamp: 'asc' } });
    const allQuoteServers = await prisma.quoteServer.findMany({ orderBy: { timestamp: 'asc' } });
    const allErrorEvents = await prisma.errorEvent.findMany({ orderBy: { timestamp: 'asc' } });


    const xml = createXmlBuilder({ version: '1.0' }) //set to xml version 1.0
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
    console.log("Log DumpLogUser called with:",call.request);
    const usersUserCommands = await prisma.userCommand.findMany({ where: { username: call.request.userId }, orderBy: { timestamp: 'asc' } });
    const usersAccountTransactions = await prisma.accountTransaction.findMany({ where: { username: call.request.userId }, orderBy: { timestamp: 'asc' } });
    const usersSystemEvents = await prisma.systemEvent.findMany({ where: { username: call.request.userId }, orderBy: { timestamp: 'asc' } });
    const usersQuoteServers = await prisma.quoteServer.findMany({ where: { username: call.request.userId }, orderBy: { timestamp: 'asc' } });
    const usersErrorEvents = await prisma.errorEvent.findMany({ where: { username: call.request.userId }, orderBy: { timestamp: 'asc' } });

    const xml = createXmlBuilder({ version: '1.0' }) //set to xml version 1.0
        .ele('root')
        .ele(usersUserCommands)
        .ele(usersAccountTransactions)
        .ele(usersSystemEvents)
        .ele(usersQuoteServers)
        .ele(usersErrorEvents)

    const xmlString = xml.end({ prettyPrint: true });
    return callback(null, { xml: xmlString })
}

const InsertAccountTransaction: LogHandlers['InsertAccountTransaction'] = async (call, callback)  => {
    console.log("Log InsertAccountTransaction called with:",call.request);
    const insertTransaction = await prisma.accountTransaction.create({
        data: {
            timestamp: Date.now(),
            server: call.request.server || 'undefined',
            action: call.request.action || 'undefined',
            username: call.request.username || 'undefined',
            funds: call.request.funds || 0,
        },
    });
    const insertTransactionReturn: any = insertTransaction;
    insertTransactionReturn.timestep = String(insertTransactionReturn.timestep);
    return callback(null, insertTransactionReturn)
}

const InsertErrorEvent: LogHandlers['InsertErrorEvent'] = async (call, callback) => {
    console.log("Log InsertErrorEvent called with:",call.request);
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
    const insertErrorReturn: any = insertError;
    insertErrorReturn.timestep = String(insertErrorReturn.timestep);
    return callback(null, insertErrorReturn );
}

const InsertQuoteServer: LogHandlers['InsertQuoteServer'] = async (call, callback) => {
    console.log("Log InsertQuoteServer called with:",call.request);
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
    const insertQuoteReturn: any = insertQuote;
    insertQuoteReturn.timestep = String(insertQuoteReturn.timestep);
    return callback(null, insertQuoteReturn);
}

const InsertSystemEvent: LogHandlers['InsertSystemEvent'] = async (call, callback) => {
    console.log("Log InsertSystemEvent called with:",call.request);
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
    const insertSystemEventQueryReturn: any = insertSystemEventQuery;
    insertSystemEventQueryReturn.timestep = String(insertSystemEventQueryReturn.timestep);
    return callback(null, insertSystemEventQueryReturn);
}

const InsertUserCommand: LogHandlers['InsertUserCommand'] = async (call, callback) => {
    console.log("Log InsertUserCommand called with:",call.request);
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
    const insertCommandReturn: any = insertCommand;
    insertCommandReturn.timestep = String(insertCommandReturn.timestep);
    return callback(null, insertCommandReturn);
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