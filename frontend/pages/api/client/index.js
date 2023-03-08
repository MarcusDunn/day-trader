import {loadPackageDefinition} from "./definitions";

export const quoteClient = new loadPackageDefinition.day_trader.Quote(process.env["GRPC_QUOTE_ADDR"])
export const logClient = new loadPackageDefinition.day_trader.Log(process.env["GRPC_LOG_ADDR"])
export const transactionClient = new loadPackageDefinition.day_trader.Transaction(process.env["GRPC_TRANSACTION_ADDR"])
export const triggerClient = new loadPackageDefinition.day_trader.Trigger(process.env["GRPC_TRIGGER_ADDR"])