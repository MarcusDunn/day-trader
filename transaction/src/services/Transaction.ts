import { TransactionHandlers } from "../proto/day_trader/Transaction";
import { PrismaClient } from '@prisma/client'
import { notExpired } from "../utils/DateUtils";
import { GetQuote } from "../utils/GetQuote";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { SendAccountTransactionLog, SendErrorEventLog, SendSystemEventLog, SendUserCommandLog } from "../utils/LogClient";

const prisma = new PrismaClient()


const Add: TransactionHandlers['Add'] = async (call, callback) => {
    console.log("In transaction service in Add handler",call.request)
    try{
        if(!call.request.userId){
            return callback({code: Status.INVALID_ARGUMENT}, {balance: 0})
        }
        call.request.amount = call.request.amount ?? 0.0;
        const user = await prisma.user.upsert({
            where: { username: call.request.userId },
            update: { balance: { increment: call.request.amount } },
            create: { username: call.request.userId, balance: call.request.amount }
          });
        
        SendAccountTransactionLog(call.request.userId, "add", call.request.amount)
        SendUserCommandLog(call.request.userId, "add", call.request.amount);
        return callback(null, {balance: user.balance})
    }catch(error){
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
}

const Buy: TransactionHandlers['Buy'] = async (call, callback) => {
    console.log("In transaction service in Buy handler",call.request)
    try{
        // get user balance
        const userBalance = (await prisma.user.findFirstOrThrow({
            where: {
                username: call.request.userId
            }
        })).balance;
    
        // ensure call.request arguments are present for ts
        if(!call.request.amount || !call.request.userId || !call.request.stockSymbol){
            SendErrorEventLog(call.request.userId ?? '', "buy", call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Missing arguments");
            return callback({ code: Status.INVALID_ARGUMENT, details: "Missing amount or userId in request" }, { shares: 0, success: false });
        }
    
        // ensure user has enough funds
        if(userBalance < call.request.amount){
            SendErrorEventLog(call.request.userId, "buy", call.request.amount, call.request.stockSymbol, "Insufficient funds");
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
                expiresAt: new Date(new Date().getTime() + 61000), 
            },
            create: {
                username: call.request.userId,
                stock: call.request.stockSymbol || '', 
                amount: call.request.amount,  
                shares: shares
            }
        })
    
        if(!createdBuy){
            SendErrorEventLog(call.request.userId, "buy", call.request.amount, call.request.stockSymbol, "Error creating uncommitedBuy");
            return callback({code: Status.INTERNAL, details: "Error creating uncommitedBuy"}, { shares: 0, success: false })
        }
        SendSystemEventLog(call.request.userId, "buy", call.request.amount, call.request.stockSymbol);
        SendUserCommandLog(call.request.userId, "buy", call.request.amount, call.request.stockSymbol);
        return callback(null, { shares: shares, success: true })
    }catch(error){
        console.log(error)
        SendErrorEventLog(call.request.userId ?? '', "buy", call.request.amount ?? 0.0, call.request.stockSymbol ?? 'null', "Internal system error");
        return callback({code: Status.INTERNAL}, {});
    }
}

const Sell: TransactionHandlers['Sell'] = async (call, callback) => {
    console.log("In transaction service in Sell handler",call.request)
    try{
        // get users current stock
        const usersStock = await prisma.ownedStock.findFirst({
            where: {
                username: call.request.userId,
                stock: call.request.stockSymbol,
            }
        })
    
        // ensure user has stock
        if(!usersStock){
            SendErrorEventLog(call.request.userId ?? '', "sell", call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "user does not own stock");
            return callback({ code: Status.FAILED_PRECONDITION, details: "user does not own stock" }, { amount: 0.0, shares: 0.0, success: false })
        }
        
        // ensure arguments are included
        if(!call.request.amount || !call.request.userId || !call.request.stockSymbol){
            SendErrorEventLog(call.request.userId ?? '', "sell", call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Missing arguments");
            return callback({ code: Status.INVALID_ARGUMENT, details: "Missing arguments in request" }, { amount: 0.0, shares: 0.0, success: false });
        }
    
        // get current price of stock
        const currentPrice = Number((await GetQuote(call.request.userId, call.request.stockSymbol)).quote)
        const shares = call.request.amount/currentPrice;
    
        // ensure user has more stock then attempting to sell
        if(usersStock.shares < shares){
            SendErrorEventLog(call.request.userId ?? '', "sell", call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Insufficient owned stock");
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
                expiresAt: new Date(new Date().getTime() + 61000), 
            },
            create: {
                username: call.request.userId,
                stock: call.request.stockSymbol || '', 
                amount: call.request.amount,  
                shares: shares,
            }
        })
        SendSystemEventLog(call.request.userId, "sell", call.request.amount, call.request.stockSymbol);
        SendUserCommandLog(call.request.userId, "sell", call.request.amount, call.request.stockSymbol);
        return callback(null, { amount: createdSell.amount, shares: createdSell.shares, success: true})
    }catch(error){
        console.log(error)
        SendErrorEventLog(call.request.userId ?? '', "sell", call.request.amount ?? 0.0, call.request.stockSymbol ?? 'null', "Internal system error");
        return callback({code: Status.INTERNAL}, {});
    }
}

const CancelBuy: TransactionHandlers['CancelBuy'] = async (call, callback) => {
    console.log("In transaction service in CancelBuy handler",call.request)
    
    try{
        const deletedBuy = await prisma.uncommitedBuy.delete({
            where: {
                username: call.request.userId,
            }
        })
        SendSystemEventLog(call.request.userId ?? '', "cancel_buy", deletedBuy.amount, deletedBuy.stock);
        SendUserCommandLog(call.request.userId ?? '', "cancel_buy", deletedBuy.amount, deletedBuy.stock);
        return callback(null, { success: true })
    }catch(error){
        SendErrorEventLog(call.request.userId ?? '', "cancel_buy", 0.0, 'null', "No uncommited buy found");
        return callback({code: Status.NOT_FOUND, details: "Uncommitted buy not found"}, { success: false })
    }
}

const CancelSell: TransactionHandlers['CancelSell'] = async (call, callback) => {
    console.log("In transaction service in CancelSell handler",call.request)
    try{
        const deletedSell = await prisma.uncommitedSell.delete({
            where: {
                username: call.request.userId,
            }
        })
        SendSystemEventLog(call.request.userId ?? '', "cancel_sell", deletedSell.amount, deletedSell.stock);
        SendUserCommandLog(call.request.userId ?? '', "cancel_sell", deletedSell.amount, deletedSell.stock);
        return callback(null, { success: true })
    }catch(error){
        SendErrorEventLog(call.request.userId ?? '', "cancel_sell", 0.0, 'null', "No uncommited sell found");
        return callback({code: Status.NOT_FOUND, details: "Uncommitted sell not found"}, { success: false })
    }
}

const CommitBuy: TransactionHandlers['CommitBuy'] = async (call, callback) => {
    console.log("In transaction service in CommitBuy handler",call.request)
    try{
        const buyToCommit = await prisma.uncommitedBuy.findFirst({
            where: {
                username: call.request.userId,
            }
        })
    
        // ensure user has made buy request
        if(!buyToCommit){
            SendErrorEventLog(call.request.userId ?? '', "commit_buy", 0.0, 'null', "user did not make a buy request");
            return callback({ code: Status.FAILED_PRECONDITION, details: "user did not make a buy request" }, { stocksOwned: 0.0, balance: 0.0, success: false })
        }
        
        // ensures its not expired
        if(!(notExpired(buyToCommit.expiresAt))){
            SendErrorEventLog(buyToCommit.username, "commit_buy", buyToCommit.amount, buyToCommit.stock, "Buy request expired");
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
        
        SendAccountTransactionLog(buyToCommit.username, "remove", buyToCommit.amount)

        // remove uncommited buy
        try{
            const deletedBuy = await prisma.uncommitedBuy.delete({
                where: {
                    username: call.request.userId,
                }
            })
            SendSystemEventLog(call.request.userId ?? '', "commit_buy", deletedBuy.amount, deletedBuy.stock);
            SendUserCommandLog(call.request.userId ?? '', "commit_buy", deletedBuy.amount, deletedBuy.stock);
            return callback(null, { stocksOwned: newPurchasedStock.shares, balance: decrementedUserBalance.balance, success: true })
        }catch(error){
            SendErrorEventLog(call.request.userId ?? '', "commit_buy", buyToCommit.amount, buyToCommit.stock, "No uncommited buy found to delete after completion");
            return callback({code: Status.FAILED_PRECONDITION}, { stocksOwned: newPurchasedStock.shares, balance: decrementedUserBalance.balance, success: false })
        }
    }catch(error){
        console.log(error)
        SendErrorEventLog(call.request.userId ?? '', "commit_buy", 0.0, 'null', "Internal Server Error");
        return callback({code: Status.INTERNAL}, {});
    }
}

const CommitSell: TransactionHandlers['CommitSell'] = async (call, callback) => {
    console.log("In transaction service in CommitSell handler",call.request)
    try{
        const sellToCommit = await prisma.uncommitedSell.findFirst({
            where: {
                username: call.request.userId,
            }
        })
    
        // ensure user has made sell request
        if(!sellToCommit){
            SendErrorEventLog(call.request.userId ?? '', "commit_sell", 0.0, 'null', "user did not make a sell request");
            return callback({ code: Status.FAILED_PRECONDITION, details: "user did not make a sell request" }, { stocksOwned: 0.0, balance: 0.0, success: false })
        }
        
        // ensures its not expired
        if(!(notExpired(sellToCommit.expiresAt))){
            SendErrorEventLog(call.request.userId ?? '', "commit_sell", sellToCommit.shares, sellToCommit.stock, "Sell request expired");
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
            try{
                const deletedOwnedStock = await prisma.ownedStock.delete({
                    where: {
                        username_stock: {
                            username: sellToCommit.username,
                            stock: sellToCommit.stock,
                        }
                    }
                });
            }catch(error){
                console.log("No ownedStock to delete?")
            }
        }
    
        // add balance to user account
        const incrementedUserBalance = await prisma.user.update({
            where: { username: sellToCommit.username },
            data: { balance: { increment: sellToCommit.amount }}
        });
        
        SendAccountTransactionLog(sellToCommit.username, "add", sellToCommit.amount);
    
        // remove uncommited sell
        try{
            const deletedSell = await prisma.uncommitedSell.delete({
                where: {
                    username: sellToCommit.username,
                }
            })
            SendUserCommandLog(call.request.userId ?? '', "commit_sell", deletedSell.amount, deletedSell.stock);
            SendSystemEventLog(call.request.userId ?? '', "commit_sell", deletedSell.amount, deletedSell.stock);
            return callback(null, { stocksOwned: newPurchasedStock.shares, balance: incrementedUserBalance.balance, success: true })
        }catch(error){
            SendErrorEventLog(call.request.userId ?? '', "commit_sell", sellToCommit.shares, sellToCommit.stock, "Uncommitted sell to delete was not found");
            return callback({code: Status.NOT_FOUND, details: "Uncommitted sell to delete was not found"}, { stocksOwned: newPurchasedStock.shares, balance: incrementedUserBalance.balance, success: true } )
        }
    }catch(error){
        console.log(error)
        SendErrorEventLog(call.request.userId ?? '', "commit_sell", 0.0, '', "Internal Server Error");
        return callback({code: Status.INTERNAL}, {});
    }
}

const CreateUser: TransactionHandlers['CreateUser'] = async (call, callback) => {
    console.log("In transaction service in CreateUser handler",call.request)
    try{
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
    }catch(error){
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
}

const GetUser: TransactionHandlers['GetUser'] = async (call, callback) => {
    console.log("In transaction service in GetUser handler",call.request)
    try{
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
    }catch(error){
        console.log(error)
        return callback({code: Status.INTERNAL}, {});
    }
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