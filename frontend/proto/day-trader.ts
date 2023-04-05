import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { DayTraderClient as _day_trader_DayTraderClient, DayTraderDefinition as _day_trader_DayTraderDefinition } from './day_trader/DayTrader';
import type { QuoteClient as _day_trader_QuoteClient, QuoteDefinition as _day_trader_QuoteDefinition } from './day_trader/Quote';

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
    DayTrader: SubtypeConstructor<typeof grpc.Client, _day_trader_DayTraderClient> & { service: _day_trader_DayTraderDefinition }
    DisplaySummaryRequest: MessageTypeDefinition
    DisplaySummaryResponse: MessageTypeDefinition
    DumpLogRequest: MessageTypeDefinition
    DumpLogResponse: MessageTypeDefinition
    DumpLogUserRequest: MessageTypeDefinition
    DumpLogUserResponse: MessageTypeDefinition
    GetAllStocksRequest: MessageTypeDefinition
    GetAllStocksResponse: MessageTypeDefinition
    GetUserInfoRequest: MessageTypeDefinition
    GetUserInfoResponse: MessageTypeDefinition
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
    LoginRequest: MessageTypeDefinition
    LoginResponse: MessageTypeDefinition
    OwnedStock: MessageTypeDefinition
    Quote: SubtypeConstructor<typeof grpc.Client, _day_trader_QuoteClient> & { service: _day_trader_QuoteDefinition }
    QuoteRequest: MessageTypeDefinition
    QuoteRequestSimple: MessageTypeDefinition
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
    Stock: MessageTypeDefinition
    UserCommand: MessageTypeDefinition
  }
}

