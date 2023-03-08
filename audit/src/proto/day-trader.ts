import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { LogClient as _day_trader_LogClient, LogDefinition as _day_trader_LogDefinition } from './day_trader/Log';
import type { QuoteClient as _day_trader_QuoteClient, QuoteDefinition as _day_trader_QuoteDefinition } from './day_trader/Quote';
import type { TransactionClient as _day_trader_TransactionClient, TransactionDefinition as _day_trader_TransactionDefinition } from './day_trader/Transaction';
import type { TriggerClient as _day_trader_TriggerClient, TriggerDefinition as _day_trader_TriggerDefinition } from './day_trader/Trigger';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  day_trader: {
    AccountTransaction: MessageTypeDefinition
    AddRequest: MessageTypeDefinition
    AddResponse: MessageTypeDefinition
    BuyRequest: MessageTypeDefinition
    BuyResponse: MessageTypeDefinition
    BuyTrigger: MessageTypeDefinition
    CancelBuyRequest: MessageTypeDefinition
    CancelBuyResponse: MessageTypeDefinition
    CancelSellRequest: MessageTypeDefinition
    CancelSellResponse: MessageTypeDefinition
    CancelSetBuyRequest: MessageTypeDefinition
    CancelSetBuyResponse: MessageTypeDefinition
    CancelSetSellRequest: MessageTypeDefinition
    CancelSetSellResponse: MessageTypeDefinition
    CommitBuyRequest: MessageTypeDefinition
    CommitBuyResponse: MessageTypeDefinition
    CommitSellRequest: MessageTypeDefinition
    CommitSellResponse: MessageTypeDefinition
    CreateUserRequest: MessageTypeDefinition
    CreateUserResponse: MessageTypeDefinition
    DisplaySummaryRequest: MessageTypeDefinition
    DisplaySummaryResponse: MessageTypeDefinition
    DumpLogRequest: MessageTypeDefinition
    DumpLogResponse: MessageTypeDefinition
    DumpLogUserRequest: MessageTypeDefinition
    DumpLogUserResponse: MessageTypeDefinition
    GetUserRequest: MessageTypeDefinition
    GetUserResponse: MessageTypeDefinition
    InsertAccountTransactionRequest: MessageTypeDefinition
    InsertAccountTransactionResponse: MessageTypeDefinition
    InsertErrorEventRequest: MessageTypeDefinition
    InsertErrorEventResponse: MessageTypeDefinition
    InsertQuoteServerRequest: MessageTypeDefinition
    InsertQuoteServerResponse: MessageTypeDefinition
    InsertSystemEventRequest: MessageTypeDefinition
    InsertSystemEventResponse: MessageTypeDefinition
    InsertUserCommandRequest: MessageTypeDefinition
    InsertUserCommandResponse: MessageTypeDefinition
    Log: SubtypeConstructor<typeof grpc.Client, _day_trader_LogClient> & { service: _day_trader_LogDefinition }
    OwnedStock: MessageTypeDefinition
    Quote: SubtypeConstructor<typeof grpc.Client, _day_trader_QuoteClient> & { service: _day_trader_QuoteDefinition }
    QuoteRequest: MessageTypeDefinition
    QuoteResponse: MessageTypeDefinition
    SellRequest: MessageTypeDefinition
    SellResponse: MessageTypeDefinition
    SellTrigger: MessageTypeDefinition
    SetBuyAmountRequest: MessageTypeDefinition
    SetBuyAmountResponse: MessageTypeDefinition
    SetBuyTriggerRequest: MessageTypeDefinition
    SetBuyTriggerResponse: MessageTypeDefinition
    SetSellAmountRequest: MessageTypeDefinition
    SetSellAmountResponse: MessageTypeDefinition
    SetSellTriggerRequest: MessageTypeDefinition
    SetSellTriggerResponse: MessageTypeDefinition
    Transaction: SubtypeConstructor<typeof grpc.Client, _day_trader_TransactionClient> & { service: _day_trader_TransactionDefinition }
    Trigger: SubtypeConstructor<typeof grpc.Client, _day_trader_TriggerClient> & { service: _day_trader_TriggerDefinition }
    UserCommand: MessageTypeDefinition
  }
}

