import { TriggerHandlers } from "../proto/day_trader/Trigger";
import { PrismaClient } from '@prisma/client'
import { Status } from "@grpc/grpc-js/build/src/constants";
import { GetQuote } from "../utils/GetQuote";
import { SendAccountTransactionLog, SendErrorEventLog, SendSystemEventLog, SendUserCommandLog } from "../utils/LogClient";

const prisma = new PrismaClient()

const CancelSetBuy: TriggerHandlers['CancelSetBuy'] = async (call, callback) => {
    console.log("In trigger service in CancelSetBuy handler:",call.request)
    try{
        if(!call.request.userId || !call.request.stockSymbol ){
            SendErrorEventLog(call.request.userId ?? '', 'cancel_set_buy', 0.0, call.request.stockSymbol ?? '', "Invalid arguments")
            return callback({code: Status.INVALID_ARGUMENT, message: "Invalid arguments"}, {success: false})
        }
        try{
            const buyTrigger = await prisma.buyTrigger.delete({
                where: {
                    username_stock: {
                        username: call.request.userId,
                        stock: call.request.stockSymbol,
                    }
                }
            })
            SendSystemEventLog(call.request.userId ?? '', "cancel_set_buy", buyTrigger.buyAmount, buyTrigger.stock);
            SendUserCommandLog(call.request.userId ?? '', "cancel_set_buy", buyTrigger.buyAmount, buyTrigger.stock);
            return callback(null, {success: true});
        }catch(error){
            SendErrorEventLog(call.request.userId ?? '', 'cancel_set_buy', 0.0, call.request.stockSymbol ?? '', "Error on delete buy trigger")
            return callback({code: Status.NOT_FOUND, message: "Error on delete buy trigger"}, {success: false});
        }
    }catch(error){
        console.log(error)
        SendErrorEventLog(call.request.userId ?? '', 'cancel_set_buy', 0.0, call.request.stockSymbol ?? '', "Internal Server Error")
        return callback({code: Status.INTERNAL}, {});
    }
}

const CancelSetSell: TriggerHandlers['CancelSetSell'] = async (call, callback) => {
    console.log("In trigger service in CancelSetSell handler:",call.request)
    try{
        if(!call.request.userId || !call.request.stockSymbol ){
            SendErrorEventLog(call.request.userId ?? '', 'cancel_set_sell', 0.0, call.request.stockSymbol ?? '', "Invalid arguments")
            return callback({code: Status.INVALID_ARGUMENT, message: "Invalid arguments"}, {success: false})
        }
        try{
            const sellTrigger = await prisma.sellTrigger.delete({
                where: {
                    username_stock: {
                        username: call.request.userId,
                        stock: call.request.stockSymbol,
                    }
                }
            })
            SendUserCommandLog(call.request.userId ?? '', "cancel_set_sell", sellTrigger.sharesToSell, sellTrigger.stock);
            SendSystemEventLog(call.request.userId ?? '', "cancel_set_sell", sellTrigger.sharesToSell, sellTrigger.stock);
            return callback(null, { success: true });
        }catch(error){
            SendErrorEventLog(call.request.userId ?? '', 'cancel_set_sell', 0.0, call.request.stockSymbol ?? '', "Error on delete sell trigger")
            return callback({code: Status.NOT_FOUND, message: "Error on delete sell trigger"}, {success: false});
        }
    }catch(error){
        console.log(error)
        SendErrorEventLog(call.request.userId ?? '', 'cancel_set_sell', 0.0, call.request.stockSymbol ?? '', "Internal server error")
        return callback({code: Status.INTERNAL}, {});
    }
}

const SetBuyAmount: TriggerHandlers['SetBuyAmount'] = async (call, callback) => {
    console.log("In trigger service in SetBuyAmount handler:",call.request)
    try{
        const user = await prisma.user.findUnique({
            where: {
                username: call.request.userId,
            },
            include: {
                BuyTrigger: {
                    where: {
                        stock: call.request.stockSymbol,
                    }
                }
            }
        })
        // error handling
        if(!call.request.userId || !call.request.stockSymbol || !call.request.amount || !user){
            const message = user ? "Invalid arguments" : "Invalid UserId";
            SendErrorEventLog(call.request.userId ?? '', 'set_buy_amount', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', message)
            return callback({code: Status.INVALID_ARGUMENT, message: message}, { balance: 0.0, buyAmount: 0.0, success: false})
        }
        // need to check if existing trigger exists for user_stock
        // if it does, ensure the difference of the balance is taken/given
        const existingTrigger = user.BuyTrigger[0]
        let userBalanceTotal = user.balance;
    
        if(user.BuyTrigger && existingTrigger?.buyAmount){
            userBalanceTotal += existingTrigger.buyAmount
        }
    
        if(userBalanceTotal < call.request.amount){
            SendErrorEventLog(call.request.userId ?? '', 'set_buy_amount', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Insufficent funds")
            return callback({code: Status.INVALID_ARGUMENT, message: "Insufficent funds"}, { balance: 0.0, buyAmount: 0.0, success: false})
        }
        if(user.BuyTrigger){
            await prisma.user.update({
                where: {
                    username: call.request.userId
                },
                data: {
                    balance: { increment: existingTrigger?.buyAmount ?? 0.0 }
                }
            });
            SendAccountTransactionLog(call.request.userId, "add", existingTrigger?.buyAmount ?? 0.0);
        }
        
        const removeFunds = await prisma.user.update({
            where: {
                username: call.request.userId
            },
            data: {
                balance: { decrement: call.request.amount }
            }
        });

        SendAccountTransactionLog(call.request.userId, "remove", call.request.amount ?? 0.0);
    
        const AddedTrigger = await prisma.buyTrigger.upsert({
            where: {
                username_stock: {
                    username: call.request.userId,
                    stock: call.request.stockSymbol,
                } 
            },
            update: {
                stock: call.request.stockSymbol,
                buyAmount: call.request.amount,
            },
            create: {
                username: call.request.userId,
                stock: call.request.stockSymbol,
                buyAmount: call.request.amount,
            }
        })
        
        SendSystemEventLog(call.request.userId, "set_buy_amount", AddedTrigger.buyAmount, AddedTrigger.stock);
        SendUserCommandLog(call.request.userId, "set_buy_amount", AddedTrigger.buyAmount, AddedTrigger.stock);
        return callback(null, { balance: removeFunds.balance, buyAmount: AddedTrigger.buyAmount, success: false})
    }catch(error){
        console.log(error)
        SendErrorEventLog(call.request.userId ?? '', 'set_buy_amount', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Internal Server Error")
        return callback({code: Status.INTERNAL}, {});
    }
}

const SetBuyTrigger: TriggerHandlers['SetBuyTrigger'] = async (call, callback) => {
    console.log("In trigger service in SetBuyTrigger handler:",call.request)
    try{
        if(!call.request.userId || !call.request.stockSymbol || !call.request.amount){
            SendErrorEventLog(call.request.userId ?? '', 'set_buy_trigger', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Invalid arguments")
            return callback({code: Status.INVALID_ARGUMENT, message: "Invalid arguments"}, { triggerAmount: 0.0, stock: "error", success: false })
        }
        const buyTrigger = await prisma.buyTrigger.findUnique({
            where: {
                username_stock: {
                    username: call.request.userId,
                    stock: call.request.stockSymbol,
                }
            }
        })
        if(!buyTrigger){
            SendErrorEventLog(call.request.userId ?? '', 'set_buy_trigger', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "No buy trigger was found")
            return callback({code: Status.NOT_FOUND, message: "No buy trigger was found"}, { triggerAmount: 0.0, stock: "error", success: false })
        }
        const updatedTrigger = await prisma.buyTrigger.update({
            where: {
                username_stock: {
                    username: call.request.userId,
                    stock: call.request.stockSymbol,
                }
            },
            data: {
                triggerAmount: call.request.amount
            }
        })
        SendSystemEventLog(call.request.userId, "set_buy_trigger", updatedTrigger.buyAmount, updatedTrigger.stock);
        SendUserCommandLog(call.request.userId, "set_buy_trigger", updatedTrigger.buyAmount, updatedTrigger.stock);
        return callback(null, { triggerAmount: updatedTrigger.triggerAmount || undefined, stock: updatedTrigger.stock, success: true })
    }catch(error){
        console.log(error)
        SendErrorEventLog(call.request.userId ?? '', 'set_buy_trigger', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Internal server error")
        return callback({code: Status.INTERNAL}, {});
    }
}

const SetSellAmount: TriggerHandlers['SetSellAmount'] = async (call, callback) => {
    console.log("In trigger service in SetSellAmount handler:",call.request)
    try{
        const user = await prisma.user.findUnique({
            where: {
                username: call.request.userId,
            },
            include: {
                OwnedStock: {
                    where: {
                        stock: call.request.stockSymbol,
                    }
                }
            }
        })
        // error handling
        if(!call.request.userId || !call.request.stockSymbol || !call.request.amount || !user){
            const message = user ? "Invalid arguments" : "Invalid UserId";
            SendErrorEventLog(call.request.userId ?? '', 'set_sell_amount', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', message)
            return callback({code: Status.INVALID_ARGUMENT, message: message}, {})
        }
        if(!user.OwnedStock[0]){
            SendErrorEventLog(call.request.userId ?? '', 'set_sell_amount', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "User does not own stock")
            return callback({code: Status.FAILED_PRECONDITION, message: "User does not own stock"}, { currentStockPrice: 0.0, numSharesToSell: 0.0, success: false})
        }
        
        const currentStockPrice = Number((await GetQuote(call.request.userId, call.request.stockSymbol)).quote);
        const numSharesToSell = call.request.amount/currentStockPrice;
        const dollarValueOwnedCurrently = currentStockPrice*user.OwnedStock[0].shares
        if(dollarValueOwnedCurrently < call.request.amount){
            SendErrorEventLog(call.request.userId ?? '', 'set_sell_amount', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Not enough stock owned")
            return callback({code: Status.FAILED_PRECONDITION, message: "Not enough stock owned"}, { currentStockPrice: 0.0, numSharesToSell: 0.0, success: false})
        }
    
        const AddedTrigger = await prisma.sellTrigger.upsert({
            where: {
                username_stock: {
                    username: call.request.userId,
                    stock: call.request.stockSymbol,
                } 
            },
            update: {
                stock: call.request.stockSymbol,
                sharesToSell: numSharesToSell,
            },
            create: {
                username: call.request.userId,
                stock: call.request.stockSymbol,
                sharesToSell: numSharesToSell,
            }
        });
        SendSystemEventLog(call.request.userId, "set_sell_amount", AddedTrigger.sharesToSell, AddedTrigger.stock);
        SendUserCommandLog(call.request.userId, "set_sell_amount", AddedTrigger.sharesToSell, AddedTrigger.stock);
        return callback(null, { currentStockPrice: currentStockPrice, numSharesToSell: numSharesToSell, success: true})
    }catch(error){
        console.log(error)
        SendErrorEventLog(call.request.userId ?? '', 'set_sell_amount', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Internal server error")
        return callback({code: Status.INTERNAL}, {});
    }
}

const SetSellTrigger: TriggerHandlers['SetSellTrigger'] = async (call, callback) => {
    console.log("In trigger service in SetSellTrigger handler:",call.request)
    try{
        if(!call.request.userId || !call.request.stockSymbol || !call.request.amount){
            SendErrorEventLog(call.request.userId ?? '', 'set_sell_trigger', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Invalid arguments")
            return callback({code: Status.INVALID_ARGUMENT, message: "Invalid arguments"}, {stock: "error", sharesLeft: 0.0, success: false })
        }
        const sellTrigger = await prisma.sellTrigger.findUnique({
            where: {
                username_stock: {
                    username: call.request.userId,
                    stock: call.request.stockSymbol,
                }
            }
        })
        if(!sellTrigger){
            SendErrorEventLog(call.request.userId ?? '', 'set_sell_trigger', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "No sell trigger was found")
            return callback({code: Status.NOT_FOUND, message: "No sell trigger was found"}, {stock: "error", sharesLeft: 0.0, success: false })
        }
    
        // take stock from user
        const takenStock = await prisma.ownedStock.update({
            where: {
                username_stock: {
                    username: call.request.userId,
                    stock: call.request.stockSymbol,
                }
            },
            data: {
                shares: { decrement: sellTrigger.sharesToSell }
            }
        })
    
        const updatedTrigger = await prisma.sellTrigger.update({
            where: {
                username_stock: {
                    username: call.request.userId,
                    stock: call.request.stockSymbol,
                }
            },
            data: {
                triggerAmount: call.request.amount
            }
        })
        SendSystemEventLog(call.request.userId, "set_sell_amount", updatedTrigger.sharesToSell, updatedTrigger.stock);
        SendUserCommandLog(call.request.userId, "set_sell_amount", updatedTrigger.sharesToSell, updatedTrigger.stock);
        return callback(null, {stock: updatedTrigger.stock, sharesLeft: takenStock.shares, success: true })
    }catch(error){
        console.log(error)
        SendErrorEventLog(call.request.userId ?? '', 'set_sell_trigger', call.request.amount ?? 0.0, call.request.stockSymbol ?? '', "Internal Server Error")
        return callback({code: Status.INTERNAL}, {});
    }
}

export const TriggerImplementation: TriggerHandlers = {
    CancelSetBuy,
    CancelSetSell,
    SetBuyAmount,
    SetBuyTrigger,
    SetSellAmount,
    SetSellTrigger,
}