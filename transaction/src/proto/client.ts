import {credentials, loadPackageDefinition, Server} from "@grpc/grpc-js";
import {loadSync} from "@grpc/proto-loader";
import {ProtoGrpcType} from "./day-trader";
import { TransactionHandlers } from "./day_trader/Transaction";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const def = loadSync(__dirname + "../../protos/day_trader.proto")
const definitions = loadPackageDefinition(def) as unknown as ProtoGrpcType


// example of a client if you need to call an external service
// const quoteClient = new definitions.day_trader.Quote("localhost:80", credentials.createInsecure())

const server = new Server();

const Add: TransactionHandlers['Add'] = async (call, callback) => {
    const userBalance = (await prisma.user.findFirstOrThrow({
        where: {
            username: call.request.userId
        }
    })).balance;
    const newBalance = call.request.amount ? userBalance + call.request.amount : userBalance;
    const modifiedUser = await prisma.user.update({
        where: {
            username: call.request.userId
        },
        data: {
            balance: newBalance
        }
    })
    return callback(null, modifiedUser.balance)
}
const Buy: TransactionHandlers['Buy'] = (call, callback) => {
    return callback(null, {})
}
const CancelBuy: TransactionHandlers['CancelBuy'] = (call, callback) => {
    return callback(null, {})
}
const CancelSell: TransactionHandlers['CancelSell'] = (call, callback) => {
    return callback(null, {})
}
const CommitBuy: TransactionHandlers['CommitBuy'] = (call, callback) => {
    return callback(null, {})
}
const CommitSell: TransactionHandlers['CommitSell'] = (call, callback) => {
    return callback(null, {})
}
const Sell: TransactionHandlers['Sell'] = (call, callback) => {
    return callback(null, {})
}

const implementation: TransactionHandlers = {
    Add,
    Buy,
    CancelBuy,
    CancelSell,
    CommitBuy,
    CommitSell,
    Sell
}

server.addService(definitions.day_trader.Transaction.service, implementation)

server.start()
