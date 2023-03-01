import { integer } from '@elastic/elasticsearch/lib/api/types';
import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const server = new grpc.Server();
const port = process.env.PORT || 50051;
const credentials = grpc.ServerCredentials.createInsecure();

//Can be: accountTransaction, systemEvent, quoteServer, errorEvent
//Will need to be passed in from the request
const requestType = "UserCommand";
getAllLogs(requestType);

//const data = 0;
//insertLog(requestType, data);

async function getAllLogs(requestType: String) {
    const logs = await prisma[requestType as keyof typeof prisma].findMany();
    return logs
}

//Function to insert new logs coming in
//The request type will need to be fetched to store into the correct table
//Data is just an int for now as nothing is being inserted, just have it as a placeholder for now
async function insertLog(requestType: String, data: number) {
    if (requestType == "userCommand") {
        await prisma.UserCommand.create({
            data: data
        });
    } else if (requestType == "accountTransaction") {
        await prisma.accountTransaction.create({
            data: data
        });
    } else if (requestType == "quoteServer") {
        await prisma.quoteServer.create({
            data: data
        });
    } else if (requestType == "errorEvent") {
        await prisma.errorEvent.create({
            data: data
        });
    }
}

async function getAllBuyLogs() {
    const logs = await prisma.log.findMany({
        where: {
            action: "BUY"
        }
    });
    return logs
}
async function getAllSellLogs() {
    const logs = await prisma.log.findMany({
        where: {
            action: "SELL"
        }
    });
    return logs
}
async function getLog(id: number) {
    const log = await prisma.requestType.findUniqueOrThrow({
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