import * as grpc from '@grpc/grpc-js';
import {loadSync} from "@grpc/proto-loader";
import { ProtoGrpcType } from "../proto/day-trader";
import { InsertAccountTransactionResponse } from '../proto/day_trader/InsertAccountTransactionResponse';
import { InsertErrorEventResponse } from '../proto/day_trader/InsertErrorEventResponse';
import { InsertSystemEventResponse } from '../proto/day_trader/InsertSystemEventResponse';
import { InsertUserCommandResponse } from '../proto/day_trader/InsertUserCommandResponse';

const def = loadSync(__dirname + "/../proto/day-trader-copy.proto")
const definitions = grpc.loadPackageDefinition(def) as unknown as ProtoGrpcType
const LogClient = new definitions.day_trader.Log(process.env.LogURI || 'http://auditserver:50051', grpc.credentials.createInsecure());


export async function SendAccountTransactionLog(username: string, action: string, funds: number): Promise<InsertAccountTransactionResponse>{
    const Log = await (new Promise<InsertAccountTransactionResponse>((accept, reject) => {
        LogClient.InsertAccountTransaction({
            server: "TransactionServer",
            action: action,
            username: username,
            funds: funds,
        }, (error, val) => {
            if(!error && val){
                accept(val);
            }else{
                reject(error);
            }
        });
    }));
    return Log
}

export async function SendUserCommandLog(username: string, command: string, funds: number, stockSymbol?: string): Promise<InsertUserCommandResponse>{
    const Log = await (new Promise<InsertUserCommandResponse>((accept, reject) => {
        LogClient.InsertUserCommand({
            server: "TransactionServer",
            command: command,
            username: username,
            stockSymbol: stockSymbol,
            funds: funds,
        }, (error, val) => {
            if(!error && val){
                accept(val);
            }else{
                reject(error);
            }
        });
    }));
    return Log
}

export async function SendSystemEventLog(username: string, command: string, funds: number, stockSymbol: string): Promise<InsertSystemEventResponse>{
    const Log = await (new Promise<InsertSystemEventResponse>((accept, reject) => {
        LogClient.InsertSystemEvent({
            server: "TransactionService",
            command: command,
            username: username,
            stockSymbol: stockSymbol,
            funds: funds,
        }, (error, val) => {
            if(!error && val){
                accept(val);
            }else{
                reject(error);
            }
        });
    }));
    return Log
}

export async function SendErrorEventLog(username: string, command: string, funds: number, stockSymbol: string, errorMessage: string): Promise<InsertErrorEventResponse>{
    const Log = await (new Promise<InsertErrorEventResponse>((accept, reject) => {
        LogClient.InsertErrorEvent({
            server: "TransactionService",
            command: command,
            username: username,
            stockSymbol: stockSymbol,
            funds: funds,
            errorMessage: errorMessage,
        }, (error, val) => {
            if(!error && val){
                accept(val);
            }else{
                reject(error);
            }
        });
    }));
    return Log
}
