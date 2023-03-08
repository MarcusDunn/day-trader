import { loadPackageDefinition, Server} from "@grpc/grpc-js";
import {loadSync} from "@grpc/proto-loader";
import {ProtoGrpcType} from "./proto/day-trader";
import { TriggerHandlers } from "./proto/day_trader/Trigger";
import { PrismaClient } from '@prisma/client'
import * as grpc from '@grpc/grpc-js';

const prisma = new PrismaClient()

const def = loadSync(__dirname + "../../../protos/day_trader.proto")
const definitions = loadPackageDefinition(def) as unknown as ProtoGrpcType
const QuoteClient = new definitions.day_trader.Quote('localhost:50051', grpc.credentials.createInsecure());

const server = new Server();

const CancelSetBuy: TriggerHandlers['CancelSetBuy'] = async (call, callback) => {
    return callback(null, {})
}

const CancelSetSell: TriggerHandlers['CancelSetSell'] = async (call, callback) => {
    return callback(null, {})
}

const SetBuyAmount: TriggerHandlers['SetBuyAmount'] = async (call, callback) => {
    return callback(null, {})
}

const SetBuyTrigger: TriggerHandlers['SetBuyTrigger'] = async (call, callback) => {
    return callback(null, {})
}

const SetSellAmount: TriggerHandlers['SetSellAmount'] = async (call, callback) => {
    return callback(null, {})
}

const SetSellTrigger: TriggerHandlers['SetSellTrigger'] = async (call, callback) => {
    return callback(null, {})
}

export const TriggerImplementation: TriggerHandlers = {
    CancelSetBuy,
    CancelSetSell,
    SetBuyAmount,
    SetBuyTrigger,
    SetSellAmount,
    SetSellTrigger,
}