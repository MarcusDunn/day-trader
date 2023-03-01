import { PrismaClient } from '@prisma/client'
import { UserCommands } from './dummy_data/UserCommands';
import { AccountTransactions } from './dummy_data/AccountTransactions';
import { SystemEvents } from './dummy_data/SystemEvents';
import { QuoteServers } from './dummy_data/QuoteServers';
import { ErrorEvents } from './dummy_data/ErrorEvents';

const prisma = new PrismaClient();

async function main() {

  const check = await prisma.userCommand.findMany();
  if (check.length !== 0) {
    console.log("DB Already Seeded");
    return;
  }

  console.log("Beginning Seeding");

  console.log("Seeding Logs...");
  for(const userCommand of UserCommands){
    console.log("Seeding UserCommands",UserCommands.indexOf(userCommand))
    await prisma.userCommand.create({
      data: userCommand
    });
  }
  for(const accountTransaction of AccountTransactions){
    console.log("Seeding AccountTransactions",AccountTransactions.indexOf(accountTransaction))
    await prisma.accountTransaction.create({
      data: accountTransaction
    });
  }
  for(const systemEvent of SystemEvents){
    console.log("Seeding SystemEvents",SystemEvents.indexOf(systemEvent))
    await prisma.systemEvent.create({
      data: systemEvent
    });
  }
  for(const quoteServer of QuoteServers){
    console.log("Seeding QuoteServers",QuoteServers.indexOf(quoteServer))
    await prisma.quoteServer.create({
      data: quoteServer
    });
  }
  for(const errorEvent of ErrorEvents){
    console.log("Seeding ErrorEvents",ErrorEvents.indexOf(errorEvent))
    await prisma.errorEvent.create({
      data: errorEvent
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