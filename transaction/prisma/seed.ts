import { PrismaClient } from '@prisma/client'
import { Users } from './dummy_data/Users';
import { OwnedStocks } from './dummy_data/OwnedStocks';
import { BuySellTriggers } from './dummy_data/BuySellTriggers';

const prisma = new PrismaClient();

async function main(){ 
  
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
    console.log("Seeding BuySellTriggers");
    for(const trigger of BuySellTriggers){
      console.log("Seeding trigger", BuySellTriggers.indexOf(trigger));
      await prisma.buySellTrigger.create({
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
    process.exit(1);
  });