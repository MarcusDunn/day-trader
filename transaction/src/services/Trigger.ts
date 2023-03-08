import { TriggerHandlers } from "../proto/day_trader/Trigger";
import { PrismaClient } from '@prisma/client'
import { Status } from "@grpc/grpc-js/build/src/constants";
import { GetQuote } from "../utils/GetQuote";

const prisma = new PrismaClient()

const CancelSetBuy: TriggerHandlers['CancelSetBuy'] = async (call, callback) => {
    if(!call.request.userId || !call.request.stockSymbol ){
        return callback({code: Status.INVALID_ARGUMENT, message: "Invalid arguments"}, {})
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
    if(!call.request.userId || !call.request.stockSymbol ){
        return callback({code: Status.INVALID_ARGUMENT, message: "Invalid arguments"}, {})
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
        return callback({code: Status.INVALID_ARGUMENT, message: message}, {})
    }
    // need to check if existing trigger exists for user_stock
    // if it does, ensure the difference of the balance is taken/given
    const existingTrigger = user.BuyTrigger[0]
    let userBalanceTotal = user.balance;

    if(user.BuyTrigger){
        userBalanceTotal += existingTrigger.buyAmount
    }

    if(userBalanceTotal < call.request.amount){
        return callback({code: Status.INVALID_ARGUMENT, message: "Insufficent funds"}, {})
    }
    if(user.BuyTrigger){
        await prisma.user.update({
            where: {
                username: call.request.userId
            },
            data: {
                balance: { increment: existingTrigger.buyAmount }
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

    return callback(null, AddedTrigger)
}

const SetBuyTrigger: TriggerHandlers['SetBuyTrigger'] = async (call, callback) => {
    if(!call.request.userId || !call.request.stockSymbol || !call.request.amount){
        return callback({code: Status.INVALID_ARGUMENT, message: "Invalid arguments"}, {})
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
        return callback({code: Status.NOT_FOUND, message: "No buy trigger was found"}, {})
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
    
    return callback(null, updatedTrigger)
}

const SetSellAmount: TriggerHandlers['SetSellAmount'] = async (call, callback) => {
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
        return callback({code: Status.FAILED_PRECONDITION, message: "User does not own stock"}, {})
    }
    
    const currentStockPrice = Number((await GetQuote(call.request.userId, call.request.stockSymbol)).quote);
    const numSharesToSell = call.request.amount/currentStockPrice;
    const dollarValueOwnedCurrently = currentStockPrice*user.OwnedStock[0].shares
    if(dollarValueOwnedCurrently < call.request.amount){
        return callback({code: Status.FAILED_PRECONDITION, message: "Not enough stock owned"}, {})
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

    return callback(null, AddedTrigger)
}

const SetSellTrigger: TriggerHandlers['SetSellTrigger'] = async (call, callback) => {
    if(!call.request.userId || !call.request.stockSymbol || !call.request.amount){
        return callback({code: Status.INVALID_ARGUMENT, message: "Invalid arguments"}, {})
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
        return callback({code: Status.NOT_FOUND, message: "No sell trigger was found"}, {})
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
    
    return callback(null, updatedTrigger)
}

export const TriggerImplementation: TriggerHandlers = {
    CancelSetBuy,
    CancelSetSell,
    SetBuyAmount,
    SetBuyTrigger,
    SetSellAmount,
    SetSellTrigger,
}