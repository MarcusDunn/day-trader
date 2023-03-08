import {credentials, loadPackageDefinition, Server} from "@grpc/grpc-js";
import {loadSync} from "@grpc/proto-loader";
import {ProtoGrpcType} from "./day-trader";
import { TransactionHandlers } from "./day_trader/Transaction";
import { PrismaClient } from '@prisma/client'
import { notExpired } from "../utils/DateUtils";

const prisma = new PrismaClient()

const def = loadSync(__dirname + "../../../protos/day_trader.proto")
const definitions = loadPackageDefinition(def) as unknown as ProtoGrpcType


// example of a client if you need to call an external service
// const quoteClient = new definitions.day_trader.Quote("localhost:80", credentials.createInsecure())

const server = new Server();

const Add: TransactionHandlers['Add'] = async (call, callback) => {
    const user = await prisma.user.update({
        where: { username: call.request.userId },
        data: { balance: { increment: call.request.amount } },
      });
    return callback(null, user.balance)
}

const Buy: TransactionHandlers['Buy'] = async (call, callback) => {
    // get user balance
    const userBalance = (await prisma.user.findFirstOrThrow({
        where: {
            username: call.request.userId
        }
    })).balance;

    // ensure call.request arguments are present for ts
    if(!call.request.amount || !call.request.userId){
        return callback({ code: 400, details: "Missing amount or userId in request" }, {});
    }

    // ensure user has enough funds
    if(!(userBalance < call.request.amount)){
        return callback({ code: 402, details: "Insufficient funds" }, {});
    }

    // get current price of stock
    const currentPrice = 50.34;
    const shares = call.request.amount/currentPrice;

    // create uncommited buy 
    const createdBuy = await prisma.uncommitedBuy.upsert({
        where: {
            username: call.request.userId
        },
        update: {
            stock: call.request.stockSymbol || '', 
            amount: call.request.amount, 
            shares: shares, 
        },
        create: {
            username: call.request.userId,
            stock: call.request.stockSymbol || '', 
            amount: call.request.amount,  
            shares: shares
        }
    })

    return callback(null, createdBuy)
}

const Sell: TransactionHandlers['Sell'] = async (call, callback) => {
    // get users current stock
    const usersStock = await prisma.ownedStock.findFirst({
        where: {
            username: call.request.userId,
            stock: call.request.stockSymbol,
        }
    })

    // ensure user has stock
    if(!usersStock){
        return callback({ code: 403, details: "user does not own stock" }, {})
    }
    
    // ensure arguments are included
    if(!call.request.amount || !call.request.userId){
        return callback({ code: 400, details: "Missing arguments in request" }, {});
    }

    // get current price of stock
    const currentPrice = 50.34;
    const shares = call.request.amount/currentPrice;

    // ensure user has more stock then attempting to sell
    if(usersStock.shares < shares){
        return callback({ code: 402, details: "Insufficient owned stock" }, {}); 
    }

    // create uncommited buy 
    const createdSell = await prisma.uncommitedSell.upsert({
        where: {
            username: call.request.userId
        },
        update: {
            stock: call.request.stockSymbol || '', 
            amount: call.request.amount,
            shares: shares,
        },
        create: {
            username: call.request.userId,
            stock: call.request.stockSymbol || '', 
            amount: call.request.amount,  
            shares: shares,
        }
    })

    return callback(null, createdSell)
}

const CancelBuy: TransactionHandlers['CancelBuy'] = async (call, callback) => {
    const deletedBuy = await prisma.uncommitedBuy.delete({
        where: {
            username: call.request.userId,
        }
    })
    return callback(null, {deletedBuy})
}

const CancelSell: TransactionHandlers['CancelSell'] = async (call, callback) => {
    const deletedSell = await prisma.uncommitedSell.delete({
        where: {
            username: call.request.userId,
        }
    })
    return callback(null, deletedSell)
}

const CommitBuy: TransactionHandlers['CommitBuy'] = async (call, callback) => {
    const buyToCommit = await prisma.uncommitedBuy.findFirst({
        where: {
            username: call.request.userId,
        }
    })

    // ensure user has made buy request
    if(!buyToCommit){
        return callback({ code: 403, details: "user did not make a buy request" }, {})
    }
    
    // ensures its not expired
    if(!(notExpired(buyToCommit.expiresAt))){
        return callback({ code: 403, details: "Buy request expired" }, {})
    }

    // upsert ownedStock
    const newPurchasedStock = await prisma.ownedStock.upsert({
        where: {
            username_stock: {
                username: buyToCommit.username,
                stock: buyToCommit.stock,
            }
        },
        update: { shares: { increment: buyToCommit.shares } },
        create: {
            username: buyToCommit.username,
            stock: buyToCommit.stock,
            shares: buyToCommit.amount,
        }
    })

    // remove balance from user account
    const decrementedUserBalance = await prisma.user.update({
        where: { username: buyToCommit.username },
        data: { balance: { decrement: buyToCommit.amount }}
    });

    // remove uncommited buy
    const deletedBuy = await prisma.uncommitedBuy.delete({
        where: {
            username: call.request.userId,
        }
    })

    return callback(null, newPurchasedStock)
}

const CommitSell: TransactionHandlers['CommitSell'] = async (call, callback) => {
    const sellToCommit = await prisma.uncommitedSell.findFirst({
        where: {
            username: call.request.userId,
        }
    })

    // ensure user has made sell request
    if(!sellToCommit){
        return callback({ code: 403, details: "user did not make a sell request" }, {})
    }
    
    // ensures its not expired
    if(!(notExpired(sellToCommit.expiresAt))){
        return callback({ code: 403, details: "Sell request expired" }, {})
    }

    // update stock owned amount
    const newPurchasedStock = await prisma.ownedStock.update({
        where: {
            username_stock: {
                username: sellToCommit.username,
                stock: sellToCommit.stock,
            }
        },
        data: { shares: { decrement: sellToCommit.shares } }
    }) 

    // if updated stock has less then 0 amount delete it
    if(newPurchasedStock.shares <= 0){
        const deletedOwnedStock = await prisma.ownedStock.delete({
            where: {
                username_stock: {
                    username: sellToCommit.username,
                    stock: sellToCommit.stock,
                }
            }
        });
    }

    // add balance to user account
    const incrementedUserBalance = await prisma.user.update({
        where: { username: sellToCommit.username },
        data: { balance: { increment: sellToCommit.amount }}
    });

    // remove uncommited sell
    const deletedSell = await prisma.uncommitedSell.delete({
        where: {
            username: sellToCommit.username,
        }
    })

    return callback(null, incrementedUserBalance.balance)
}

const CreateUser: TransactionHandlers['CreateUser'] = async (call, callback) => {
    return callback(null, {})
}

const GetUser: TransactionHandlers['GetUser'] = async (call, callback) => {
    return callback(null, {})
}


const implementation: TransactionHandlers = {
    Add,
    Buy,
    CancelBuy,
    CancelSell,
    CommitBuy,
    CommitSell,
    Sell,
    CreateUser,
    GetUser,
}

server.addService(definitions.day_trader.Transaction.service, implementation)

server.start()
