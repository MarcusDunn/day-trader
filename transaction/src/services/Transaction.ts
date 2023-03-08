import { TransactionHandlers } from "../proto/day_trader/Transaction";
import { PrismaClient } from '@prisma/client'
import { notExpired } from "../utils/DateUtils";
import { GetQuote } from "../utils/GetQuote";
import { Status } from "@grpc/grpc-js/build/src/constants";

const prisma = new PrismaClient()


const Add: TransactionHandlers['Add'] = async (call, callback) => {
    console.log("In transaction service in Add handler",call.request)
    if(!call.request.userId){
        return callback({code: Status.INVALID_ARGUMENT}, {balance: 0})
    }
    const user = await prisma.user.upsert({
        where: { username: call.request.userId },
        update: { balance: { increment: call.request.amount } },
        create: { username: call.request.userId, balance: call.request.amount }
      });
    return callback(null, {balance: user.balance})
}

const Buy: TransactionHandlers['Buy'] = async (call, callback) => {
    console.log("In transaction service in Buy handler",call.request)
    // get user balance
    const userBalance = (await prisma.user.findFirstOrThrow({
        where: {
            username: call.request.userId
        }
    })).balance;

    // ensure call.request arguments are present for ts
    if(!call.request.amount || !call.request.userId || !call.request.stockSymbol){
        return callback({ code: Status.INVALID_ARGUMENT, details: "Missing amount or userId in request" }, { shares: 0, success: false });
    }

    // ensure user has enough funds
    if(!(userBalance < call.request.amount)){
        return callback({ code: Status.FAILED_PRECONDITION, details: "Insufficient funds" }, { shares: 0, success: false });
    }

    // get current price of stock
    
    const currentPrice: number = Number((await GetQuote(call.request.userId, call.request.stockSymbol)).quote)

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

    if(!createdBuy){
        return callback({code: Status.INTERNAL, details: "Error creating uncommitedBuy"}, { shares: 0, success: false })
    }

    return callback(null, { shares: shares, success: true })
}

const Sell: TransactionHandlers['Sell'] = async (call, callback) => {
    console.log("In transaction service in Sell handler",call.request)
    // get users current stock
    const usersStock = await prisma.ownedStock.findFirst({
        where: {
            username: call.request.userId,
            stock: call.request.stockSymbol,
        }
    })

    // ensure user has stock
    if(!usersStock){
        return callback({ code: Status.FAILED_PRECONDITION, details: "user does not own stock" }, { amount: 0.0, shares: 0.0, success: false })
    }
    
    // ensure arguments are included
    if(!call.request.amount || !call.request.userId || !call.request.stockSymbol){
        return callback({ code: Status.INVALID_ARGUMENT, details: "Missing arguments in request" }, { amount: 0.0, shares: 0.0, success: false });
    }

    // get current price of stock
    const currentPrice = Number((await GetQuote(call.request.userId, call.request.stockSymbol)).quote)
    const shares = call.request.amount/currentPrice;

    // ensure user has more stock then attempting to sell
    if(usersStock.shares < shares){
        return callback({ code: Status.FAILED_PRECONDITION, details: "Insufficient owned stock" }, { amount: 0.0, shares: 0.0, success: false } ); 
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

    return callback(null, { amount: createdSell.amount, shares: createdSell.shares, success: true})
}

const CancelBuy: TransactionHandlers['CancelBuy'] = async (call, callback) => {
    console.log("In transaction service in CancelBuy handler",call.request)
    const deletedBuy = await prisma.uncommitedBuy.delete({
        where: {
            username: call.request.userId,
        }
    })
    return callback(null, { success: true })
}

const CancelSell: TransactionHandlers['CancelSell'] = async (call, callback) => {
    console.log("In transaction service in CancelSell handler",call.request)
    const deletedSell = await prisma.uncommitedSell.delete({
        where: {
            username: call.request.userId,
        }
    })
    return callback(null, { success: true })
}

const CommitBuy: TransactionHandlers['CommitBuy'] = async (call, callback) => {
    console.log("In transaction service in CommitBuy handler",call.request)
    const buyToCommit = await prisma.uncommitedBuy.findFirst({
        where: {
            username: call.request.userId,
        }
    })

    // ensure user has made buy request
    if(!buyToCommit){
        return callback({ code: Status.FAILED_PRECONDITION, details: "user did not make a buy request" }, { stocksOwned: 0.0, balance: 0.0, success: false })
    }
    
    // ensures its not expired
    if(!(notExpired(buyToCommit.expiresAt))){
        return callback({ code: Status.DEADLINE_EXCEEDED, details: "Buy request expired" }, { stocksOwned: 0.0, balance: 0.0, success: false })
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

    return callback(null, { stocksOwned: newPurchasedStock.shares, balance: decrementedUserBalance.balance, success: true })
}

const CommitSell: TransactionHandlers['CommitSell'] = async (call, callback) => {
    console.log("In transaction service in CommitSell handler",call.request)
    const sellToCommit = await prisma.uncommitedSell.findFirst({
        where: {
            username: call.request.userId,
        }
    })

    // ensure user has made sell request
    if(!sellToCommit){
        return callback({ code: Status.FAILED_PRECONDITION, details: "user did not make a sell request" }, { stocksOwned: 0.0, balance: 0.0, success: false })
    }
    
    // ensures its not expired
    if(!(notExpired(sellToCommit.expiresAt))){
        return callback({ code: Status.DEADLINE_EXCEEDED, details: "Sell request expired" }, { stocksOwned: 0.0, balance: 0.0, success: false })
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

    return callback(null, { stocksOwned: newPurchasedStock.shares, balance: incrementedUserBalance.balance, success: true })
}

const CreateUser: TransactionHandlers['CreateUser'] = async (call, callback) => {
    console.log("In transaction service in CreateUser handler",call.request)
    const existingUser = await prisma.user.findUnique({
        where: {username: call.request.userId}
    });
    if(existingUser){
        return callback({code: Status.ALREADY_EXISTS, details: "User exists with that username"}, { username: "error", success: false });
    }
    if(!call.request.userId){
        return callback({code: Status.INVALID_ARGUMENT, details: "Include username in request"}, { username: "error", success: false });
    }
    const newUser = await prisma.user.create({
        data: {
            username: call.request.userId,
        }
    });
    return callback(null, { username: newUser.username, success: true })
}

const GetUser: TransactionHandlers['GetUser'] = async (call, callback) => {
    console.log("In transaction service in GetUser handler",call.request)
    const user = await prisma.user.findUnique({
        where: {username: call.request.userId},
        include: {
            OwnedStock: true,
            BuyTrigger: true,
            SellTrigger: true,
        }
    });
    if(!user){
        return callback({code: Status.NOT_FOUND, details: "User not found"}, { username: "error", balance: 0.0, role: "error", success: false, ownedStock: [], buyTriggers: [], sellTriggers: [] })
    }
    
    return callback(null, { 
        username: user.username, 
        balance: user.balance, 
        role: user.role, 
        success: true, 
        ownedStock: user.OwnedStock, 
        buyTriggers: [],
        sellTriggers: [],
        // buyTriggers: user.BuyTrigger,
        // sellTriggers: user.SellTrigger 
    })
}

export const TransactionImplementations: TransactionHandlers = {
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