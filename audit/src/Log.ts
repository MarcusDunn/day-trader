import {PrismaClient} from "@prisma/client";
import {LogHandlers} from "./proto/day_trader/Log";
import {create as createXmlBuilder} from 'xmlbuilder2';
import {Status} from "@grpc/grpc-js/build/src/constants";
import {GetUserInfo} from "./utils/GetUserInfo";
import {UserCommand, accountTransaction, systemEvent, quoteServer, errorEvent} from "@prisma/client";
import {ExpandObject, XMLBuilder} from "xmlbuilder2/lib/interfaces";

const prisma = new PrismaClient();

const DisplaySummary: LogHandlers['DisplaySummary'] = async (call, callback) => {
    console.log("Log DisplaySummary called with:", call.request);
    try {
        if (!call.request.userId) {
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
    } catch (error) {
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
}

type LogEvent =
    | { eventType: 'user command', event: UserCommand }
    | { eventType: 'account transaction', event: accountTransaction }
    | { eventType: 'system event', event: systemEvent }
    | { eventType: 'quote server', event: quoteServer }
    | { eventType: 'error event', event: errorEvent }

function logEventToXml(xmlBuilder: XMLBuilder, event: LogEvent): void {
    switch (event.eventType) {
        case "user command":
            xmlBuilder.ele('userCommand')
                .ele({...event.event, command: event.event.command.toUpperCase() })
                .up()
            break;
        case "account transaction":
            xmlBuilder.ele('accountTransaction')
                .ele(event.event)
                .up()
            break;
        case "system event":
            xmlBuilder.ele('systemEvent')
                .ele({...event.event, command: event.event.command.toUpperCase() })
                .up()
            break;
        case "quote server":
            xmlBuilder.ele('quoteServer')
                .ele(event.event)
                .up()
            break;
        case "error event":
            xmlBuilder.ele('errorEvent')
                .ele({...event.event, command: event.event.command.toUpperCase() })
                .up()
            break;
    }
}

function createXml(allUserCommands: UserCommand[], allAccountTransactions: accountTransaction[], allSystemEvents: systemEvent[], allQuoteServers: quoteServer[], allErrorEvents: errorEvent[]): XMLBuilder {
    const xml = createXmlBuilder({version: '1.0'})
        .ele('log')

    const x: LogEvent[] = [
        ...allErrorEvents.map(e => ({eventType: 'error event' as const, event: e})),
        ...allQuoteServers.map(e => ({eventType: 'quote server' as const, event: e})),
        ...allSystemEvents.map(e => ({eventType: 'system event' as const, event: e})),
        ...allAccountTransactions.map(e => ({eventType: 'account transaction' as const, event: e})),
        ...allUserCommands.map(e => ({eventType: 'user command' as const, event: e})),
    ]

    x.sort(({event: a}, {event: b}) => {
        if (a.timestamp > b.timestamp) {
            return 1;
        } else if (a.timestamp < b.timestamp) {
            return -1;
        } else {
            return 0;
        }
    }).forEach((event) => logEventToXml(xml, event))

    return xml
}

const DumpLog: LogHandlers['DumpLog'] = async (call, callback) => {
    console.log("Log DumpLog called with:", call.request);
    try {
        const allUserCommands = await prisma.userCommand.findMany({orderBy: {timestamp: 'asc'}});
        const allAccountTransactions = await prisma.accountTransaction.findMany({orderBy: {timestamp: 'asc'}});
        const allSystemEvents = await prisma.systemEvent.findMany({orderBy: {timestamp: 'asc'}});
        const allQuoteServers = await prisma.quoteServer.findMany({orderBy: {timestamp: 'asc'}});
        const allErrorEvents = await prisma.errorEvent.findMany({orderBy: {timestamp: 'asc'}});

        const xml = createXml(allUserCommands, allAccountTransactions, allSystemEvents, allQuoteServers, allErrorEvents)

        const xmlString = xml.end({prettyPrint: false});
        return callback(null, {xml: xmlString})
    } catch (error) {
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
}

const DumpLogUser: LogHandlers['DumpLogUser'] = async (call, callback) => {
    console.log("Log DumpLogUser called with:", call.request);
    try {
        const usersUserCommands = await prisma.userCommand.findMany({
            where: {username: call.request.userId},
            orderBy: {timestamp: 'asc'}
        });
        const usersAccountTransactions = await prisma.accountTransaction.findMany({
            where: {username: call.request.userId},
            orderBy: {timestamp: 'asc'}
        });
        const usersSystemEvents = await prisma.systemEvent.findMany({
            where: {username: call.request.userId},
            orderBy: {timestamp: 'asc'}
        });
        const usersQuoteServers = await prisma.quoteServer.findMany({
            where: {username: call.request.userId},
            orderBy: {timestamp: 'asc'}
        });
        const usersErrorEvents = await prisma.errorEvent.findMany({
            where: {username: call.request.userId},
            orderBy: {timestamp: 'asc'}
        });

        const xml = createXml(usersUserCommands, usersAccountTransactions, usersSystemEvents, usersQuoteServers, usersErrorEvents)

        const xmlString = xml.end({prettyPrint: false});
        return callback(null, {xml: xmlString})
    } catch (error) {
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
}

const InsertAccountTransaction: LogHandlers['InsertAccountTransaction'] = async (call, callback) => {
    console.log("Log InsertAccountTransaction called with:", call.request);
    try {
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
    } catch (error) {
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
}

const InsertErrorEvent: LogHandlers['InsertErrorEvent'] = async (call, callback) => {
    console.log("Log InsertErrorEvent called with:", call.request);
    try {
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
        return callback(null, insertErrorReturn);
    } catch (error) {
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
}

const InsertQuoteServer: LogHandlers['InsertQuoteServer'] = async (call, callback) => {
    console.log("Log InsertQuoteServer called with:", call.request);
    try {
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
    } catch (error) {
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
}

const InsertSystemEvent: LogHandlers['InsertSystemEvent'] = async (call, callback) => {
    console.log("Log InsertSystemEvent called with:", call.request);
    try {
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
    } catch (error) {
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
}

const InsertUserCommand: LogHandlers['InsertUserCommand'] = async (call, callback) => {
    console.log("Log InsertUserCommand called with:", call.request);
    try {
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
    } catch (error) {
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
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