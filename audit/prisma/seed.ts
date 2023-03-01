import { PrismaClient } from '@prisma/client'
import { Logs } from './dummy_data/Logs';

const prisma = new PrismaClient();

async function main(){ 
  
    const check = prisma.log.findMany();
    if(check.length !== 0){
      console.log("DB Already Seeded");
      return;
    }
    
    console.log("Beginning Seeding");

    console.log("Seeding Logs...");
    for(const log of Logs){
      console.log("Seeding log", log);
      await prisma.log.create({
        data: log
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