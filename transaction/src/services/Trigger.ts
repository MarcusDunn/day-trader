import { TriggerHandlers } from "../proto/day_trader/Trigger";
import { PrismaClient } from '@prisma/client'
import { Status } from "@grpc/grpc-js/build/src/constants";
import { GetQuote } from "../utils/GetQuote";

const prisma = new PrismaClient()

const CancelSetBuy: TriggerHandlers['CancelSetBuy'] = async (call, callback) => {
    console.log("In trigger service in CancelSetBuy handler:",call.request)
    if(!call.request.userId || !call.request.stockSymbol ){
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
        return callback(null, {success: true});
    }catch(error){
        return callback({code: Status.NOT_FOUND, message: "Error on delete buy trigger"}, {success: false});
    }
}

const CancelSetSell: TriggerHandlers['CancelSetSell'] = async (call, callback) => {
    console.log("In trigger service in CancelSetSell handler:",call.request)
    if(!call.request.userId || !call.request.stockSymbol ){
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
        return callback(null, { success: true });
    }catch(error){
        return callback({code: Status.NOT_FOUND, message: "Error on delete sell trigger"}, {success: false});
    }
}

const SetBuyAmount: TriggerHandlers['SetBuyAmount'] = async (call, callback) => {
    console.log("In trigger service in SetBuyAmount handler:",call.request)
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
    }

    const removeFunds = await prisma.user.update({
        where: {
            username: call.request.userId
        },
        data: {
            balance: { decrement: call.request.amount }
        }
    });

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

    return callback(null, { balance: removeFunds.balance, buyAmount: AddedTrigger.buyAmount, success: false})
}

const SetBuyTrigger: TriggerHandlers['SetBuyTrigger'] = async (call, callback) => {
    console.log("In trigger service in SetBuyTrigger handler:",call.request)
    if(!call.request.userId || !call.request.stockSymbol || !call.request.amount){
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
    
    return callback(null, { triggerAmount: updatedTrigger.triggerAmount || undefined, stock: updatedTrigger.stock, success: true })
}

const SetSellAmount: TriggerHandlers['SetSellAmount'] = async (call, callback) => {
    console.log("In trigger service in SetSellAmount handler:",call.request)
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
        return callback({code: Status.INVALID_ARGUMENT, message: message}, {})
    }
    if(!user.OwnedStock[0]){
        return callback({code: Status.FAILED_PRECONDITION, message: "User does not own stock"}, { currentStockPrice: 0.0, numSharesToSell: 0.0, success: false})
    }
    
    const currentStockPrice = Number((await GetQuote(call.request.userId, call.request.stockSymbol)).quote);
    const numSharesToSell = call.request.amount/currentStockPrice;
    const dollarValueOwnedCurrently = currentStockPrice*user.OwnedStock[0].shares
    if(dollarValueOwnedCurrently < call.request.amount){
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

    return callback(null, { currentStockPrice: currentStockPrice, numSharesToSell: numSharesToSell, success: true})
}

const SetSellTrigger: TriggerHandlers['SetSellTrigger'] = async (call, callback) => {
    console.log("In trigger service in SetSellTrigger handler:",call.request)
    if(!call.request.userId || !call.request.stockSymbol || !call.request.amount){
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
    
    return callback(null, {stock: updatedTrigger.stock, sharesLeft: takenStock.shares, success: true })
}

export const TriggerImplementation: TriggerHandlers = {
    CancelSetBuy,
    CancelSetSell,
    SetBuyAmount,
    SetBuyTrigger,
    SetSellAmount,
    SetSellTrigger,
}