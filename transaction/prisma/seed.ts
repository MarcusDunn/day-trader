import { PrismaClient } from '@prisma/client'
import { Users } from './dummy_data/Users';
import { OwnedStocks } from './dummy_data/OwnedStocks';
import { BuyTriggers } from './dummy_data/BuyTriggers';
import { SellTriggers } from './dummy_data/SellTriggers';

const prisma = new PrismaClient();

async function main(){ 

    const check = await prisma.user.findMany();
    if(check.length !== 0){
      console.log("DB Already Seeded");
      return;
    }
    console.log("Beginning Seeding");

    console.log("Seeding Users...");
    for(const user of Users){
      console.log("Seeding user", Users.indexOf(user));
      await prisma.user.create({
        data: user
      });
    }

    console.log("Seeding OwnedStocks...");
    for(const stock of OwnedStocks){
      console.log("Seeding stock", OwnedStocks.indexOf(stock));
      await prisma.ownedStock.create({
        data: stock
      });
    }
    console.log("Seeding BuyTriggers");
    for(const trigger of BuyTriggers){
      console.log("Seeding trigger", BuyTriggers.indexOf(trigger));
      await prisma.buyTrigger.create({
        data: trigger
      });
    }
    console.log("Seeding SellTriggers");
    for(const trigger of SellTriggers){
      console.log("Seeding trigger", SellTriggers.indexOf(trigger));
      await prisma.sellTrigger.create({
        data: trigger
      });
    }

}


main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });