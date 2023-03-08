import { QuoteResponse } from "../proto/day_trader/QuoteResponse";
import * as grpc from '@grpc/grpc-js';
import {loadSync} from "@grpc/proto-loader";
import { ProtoGrpcType } from "../proto/day-trader";
import { PrismaClient } from "@prisma/client";
import { SellResponse } from "../proto/day_trader/SellResponse";
import { CommitSellResponse } from '../proto/day_trader/CommitSellResponse';
import { BuyResponse } from "../proto/day_trader/BuyResponse";
import { CommitBuyResponse } from "../proto/day_trader/CommitBuyResponse";

const prisma = new PrismaClient();

const def = loadSync(__dirname + "../../../protos/day_trader.proto")
const definitions = grpc.loadPackageDefinition(def) as unknown as ProtoGrpcType
const QuoteClient = new definitions.day_trader.Quote('localhost:50051', grpc.credentials.createInsecure());
const TransactionClient = new definitions.day_trader.Transaction(`0.0.0.0:${process.env.PORT || 50051}`, grpc.credentials.createInsecure());

export async function GetQuote(userId: string, stockSymbol: string): Promise<QuoteResponse>{
    const quote = await (new Promise<QuoteResponse>((accept, reject) => {
        QuoteClient.Quote({
            userId: userId,
            stockSymbol: stockSymbol
        }, (error, val) => {
            if(!error && val){
                accept(val);
            }else{
                reject(error);
            }
        });
    }));
    CheckTriggersFromQuote(quote);
    return quote
}

export async function CheckTriggersFromQuote(quote: QuoteResponse){
    const sellTriggers = await prisma.sellTrigger.findMany({
        where: {
            stock: quote.sym,
            triggerAmount: { gte: Number(quote.quote)}
        }
    })

    for(const sellTrigger of sellTriggers){
        // first give them the stock back before it is taken
        // as sell method will decrement them again
        const incrementedStock = await prisma.ownedStock.update({
            where: {
                username_stock: {
                    username: sellTrigger.username,
                    stock: sellTrigger.stock,
                }
            },
            data: {
                shares: { increment: sellTrigger.sharesToSell}
            }
        })
        // sell
        const sellResponse = await (new Promise<SellResponse>((accept, reject) => {
            TransactionClient.sell({
                userId: sellTrigger.username,
                stockSymbol: sellTrigger.stock,
                amount: (sellTrigger.sharesToSell*Number(quote.quote)),
            }, (error, val) => {
                if(!error && val){
                    accept(val);
                }else{
                    reject(error);
                }
            });
        }));
        // commit sell
        const commitSellResponse = await (new Promise<CommitSellResponse>((accept, reject) => {
            TransactionClient.commitSell({
                userId: sellTrigger.username,
            }, (error, val) => {
                if(!error && val){
                    accept(val);
                }else{
                    reject(error);
                }
            });
        }));
        // delete sellTrigger
        const deleteTriggerResponse = await prisma.sellTrigger.delete({
            where: {
                username_stock: {
                    username: sellTrigger.username,
                    stock: sellTrigger.stock,
                }
            }
        })
    }

    const buyTriggers = await prisma.buyTrigger.findMany({
        where: {
            stock: quote.sym,
            triggerAmount: { lte: Number(quote.quote)}
        }
    })
    for(const buyTrigger of buyTriggers){
        // first give them the money back before it is taken
        // as buy method will decrement them again
        const incrementedBalance = await prisma.user.update({
            where: {
                username: buyTrigger.username,
            },
            data: {
                balance: { increment: buyTrigger.buyAmount}
            }
        })
        // buy
        const buyResponse = await (new Promise<BuyResponse>((accept, reject) => {
            TransactionClient.buy({
                userId: buyTrigger.username,
                stockSymbol: buyTrigger.stock,
                amount: buyTrigger.buyAmount,
            }, (error, val) => {
                if(!error && val){
                    accept(val);
                }else{
                    reject(error);
                }
            });
        }));
        // commit buy
        const commitBuyResponse = await (new Promise<CommitBuyResponse>((accept, reject) => {
            TransactionClient.commitBuy({
                userId: buyTrigger.username,
            }, (error, val) => {
                if(!error && val){
                    accept(val);
                }else{
                    reject(error);
                }
            });
        }));
        // delete buyTrigger
        const deleteTriggerResponse = await prisma.buyTrigger.delete({
            where: {
                username_stock: {
                    username: buyTrigger.username,
                    stock: buyTrigger.stock,
                }
            }
        })
    }

}