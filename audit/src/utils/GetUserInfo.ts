import * as grpc from '@grpc/grpc-js';
import {loadSync} from "@grpc/proto-loader";
import { ProtoGrpcType } from "../proto/day-trader";
import { PrismaClient } from "@prisma/client";
import { GetUserResponse } from '../proto/day_trader/GetUserResponse';

const prisma = new PrismaClient();

const def = loadSync(__dirname + "/../proto/day-trader-copy.proto")
const definitions = grpc.loadPackageDefinition(def) as unknown as ProtoGrpcType
const TransactionClient = new definitions.day_trader.Transaction(process.env.TransactionURI || 'transactionserver:50051', grpc.credentials.createInsecure());


export async function GetUserInfo(userId: string): Promise<GetUserResponse>{
    const userInfo = await (new Promise<GetUserResponse>((accept, reject) => {
        TransactionClient.GetUser({
            userId: userId,
        }, (error, val) => {
            if(!error && val){
                accept(val);
            }else{
                reject(error);
            }
        });
    }));
    return userInfo
}
