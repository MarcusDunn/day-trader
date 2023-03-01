import { PrismaClient } from '@prisma/client'
import { Logs } from './dummy_data/Logs';
import { NewLogs } from './dummy_data/NewLog';

const prisma = new PrismaClient();

async function main() {

  const check = await prisma.log.findMany();
  if (check.length !== 0) {
    console.log("DB Already Seeded");
    return;
  }

  console.log("Beginning Seeding");

  console.log("Seeding Logs...");
  for (const log of NewLogs) {
    console.log("Seeding log", log);
    if (log.type == "userCommand") {
      await prisma.UserCommand.create({
        data: log
      });
    } else if (log.type == "accountTransaction") {
      await prisma.accountTransaction.create({
        data: log
      });
    } else if (log.type == "quoteServer") {
      await prisma.quoteServer.create({
        data: log
      });
    } else if (log.type == "errorEvent") {
      await prisma.errorEvent.create({
        data: log
      });
    }
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