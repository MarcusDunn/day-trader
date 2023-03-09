import * as grpc from '@grpc/grpc-js';
import {loadSync} from "@grpc/proto-loader";
import { ProtoGrpcType } from "../proto/day-trader";
import { InsertAccountTransactionResponse } from '../proto/day_trader/InsertAccountTransactionResponse';

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
