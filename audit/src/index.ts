import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const server = new grpc.Server();
const port = process.env.PORT || 50051;
const credentials = grpc.ServerCredentials.createInsecure();

async function getAllLogs(){
    const logs = await prisma.log.findMany();
    return logs
}
async function getAllBuyLogs(){
    const logs = await prisma.log.findMany({
        where: {
            action: "BUY"
        }
    });
    return logs
}
async function getAllSellLogs(){
    const logs = await prisma.log.findMany({
        where: {
            action: "SELL"
        }
    });
    return logs
}
async function getLog(id: number){
    const log = await prisma.log.findUniqueOrThrow({
        where: {
            id
        }
    });
    return log;
}

server.bindAsync(`0.0.0.0:${port}`, credentials, () => {
    server.start();
    console.log(`gRPC server started on port ${port}`);
});