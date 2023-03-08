import { PrismaClient } from '@prisma/client';
import { GetQuote } from './GetQuote';

const prisma = new PrismaClient()

export async function CheckTriggers(){
    console.log("Checking Triggers")
    const buyTriggers = await prisma.buyTrigger.findMany({select: {stock: true}})
    const sellTriggers = await prisma.sellTrigger.findMany({select: {stock: true}})
    const allTriggeredStocks = [...(buyTriggers.map((trigger) => {return trigger.stock})), ...(sellTriggers.map((trigger) => {return trigger.stock}))];
    const uniqueTriggeredStocks = [...new Set(allTriggeredStocks)];
    for(const stock of uniqueTriggeredStocks){
        // GetQuote("whatuseriddoiuse", stock);
        console.log("Would Check Stock price of: ",stock);
    }
}