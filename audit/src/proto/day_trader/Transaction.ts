// Original file: ../protos/day-trader.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { AddRequest as _day_trader_AddRequest, AddRequest__Output as _day_trader_AddRequest__Output } from '../day_trader/AddRequest';
import type { AddResponse as _day_trader_AddResponse, AddResponse__Output as _day_trader_AddResponse__Output } from '../day_trader/AddResponse';
import type { BuyRequest as _day_trader_BuyRequest, BuyRequest__Output as _day_trader_BuyRequest__Output } from '../day_trader/BuyRequest';
import type { BuyResponse as _day_trader_BuyResponse, BuyResponse__Output as _day_trader_BuyResponse__Output } from '../day_trader/BuyResponse';
import type { CancelBuyRequest as _day_trader_CancelBuyRequest, CancelBuyRequest__Output as _day_trader_CancelBuyRequest__Output } from '../day_trader/CancelBuyRequest';
import type { CancelBuyResponse as _day_trader_CancelBuyResponse, CancelBuyResponse__Output as _day_trader_CancelBuyResponse__Output } from '../day_trader/CancelBuyResponse';
import type { CancelSellRequest as _day_trader_CancelSellRequest, CancelSellRequest__Output as _day_trader_CancelSellRequest__Output } from '../day_trader/CancelSellRequest';
import type { CancelSellResponse as _day_trader_CancelSellResponse, CancelSellResponse__Output as _day_trader_CancelSellResponse__Output } from '../day_trader/CancelSellResponse';
import type { CommitBuyRequest as _day_trader_CommitBuyRequest, CommitBuyRequest__Output as _day_trader_CommitBuyRequest__Output } from '../day_trader/CommitBuyRequest';
import type { CommitBuyResponse as _day_trader_CommitBuyResponse, CommitBuyResponse__Output as _day_trader_CommitBuyResponse__Output } from '../day_trader/CommitBuyResponse';
import type { CommitSellRequest as _day_trader_CommitSellRequest, CommitSellRequest__Output as _day_trader_CommitSellRequest__Output } from '../day_trader/CommitSellRequest';
import type { CommitSellResponse as _day_trader_CommitSellResponse, CommitSellResponse__Output as _day_trader_CommitSellResponse__Output } from '../day_trader/CommitSellResponse';
import type { CreateUserRequest as _day_trader_CreateUserRequest, CreateUserRequest__Output as _day_trader_CreateUserRequest__Output } from '../day_trader/CreateUserRequest';
import type { CreateUserResponse as _day_trader_CreateUserResponse, CreateUserResponse__Output as _day_trader_CreateUserResponse__Output } from '../day_trader/CreateUserResponse';
import type { GetUserRequest as _day_trader_GetUserRequest, GetUserRequest__Output as _day_trader_GetUserRequest__Output } from '../day_trader/GetUserRequest';
import type { GetUserResponse as _day_trader_GetUserResponse, GetUserResponse__Output as _day_trader_GetUserResponse__Output } from '../day_trader/GetUserResponse';
import type { SellRequest as _day_trader_SellRequest, SellRequest__Output as _day_trader_SellRequest__Output } from '../day_trader/SellRequest';
import type { SellResponse as _day_trader_SellResponse, SellResponse__Output as _day_trader_SellResponse__Output } from '../day_trader/SellResponse';

export interface TransactionClient extends grpc.Client {
  Add(argument: _day_trader_AddRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_AddResponse__Output>): grpc.ClientUnaryCall;
  Add(argument: _day_trader_AddRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_AddResponse__Output>): grpc.ClientUnaryCall;
  Add(argument: _day_trader_AddRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_AddResponse__Output>): grpc.ClientUnaryCall;
  Add(argument: _day_trader_AddRequest, callback: grpc.requestCallback<_day_trader_AddResponse__Output>): grpc.ClientUnaryCall;
  add(argument: _day_trader_AddRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_AddResponse__Output>): grpc.ClientUnaryCall;
  add(argument: _day_trader_AddRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_AddResponse__Output>): grpc.ClientUnaryCall;
  add(argument: _day_trader_AddRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_AddResponse__Output>): grpc.ClientUnaryCall;
  add(argument: _day_trader_AddRequest, callback: grpc.requestCallback<_day_trader_AddResponse__Output>): grpc.ClientUnaryCall;
  
  Buy(argument: _day_trader_BuyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_BuyResponse__Output>): grpc.ClientUnaryCall;
  Buy(argument: _day_trader_BuyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_BuyResponse__Output>): grpc.ClientUnaryCall;
  Buy(argument: _day_trader_BuyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_BuyResponse__Output>): grpc.ClientUnaryCall;
  Buy(argument: _day_trader_BuyRequest, callback: grpc.requestCallback<_day_trader_BuyResponse__Output>): grpc.ClientUnaryCall;
  buy(argument: _day_trader_BuyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_BuyResponse__Output>): grpc.ClientUnaryCall;
  buy(argument: _day_trader_BuyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_BuyResponse__Output>): grpc.ClientUnaryCall;
  buy(argument: _day_trader_BuyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_BuyResponse__Output>): grpc.ClientUnaryCall;
  buy(argument: _day_trader_BuyRequest, callback: grpc.requestCallback<_day_trader_BuyResponse__Output>): grpc.ClientUnaryCall;
  
  CancelBuy(argument: _day_trader_CancelBuyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelBuyResponse__Output>): grpc.ClientUnaryCall;
  CancelBuy(argument: _day_trader_CancelBuyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CancelBuyResponse__Output>): grpc.ClientUnaryCall;
  CancelBuy(argument: _day_trader_CancelBuyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelBuyResponse__Output>): grpc.ClientUnaryCall;
  CancelBuy(argument: _day_trader_CancelBuyRequest, callback: grpc.requestCallback<_day_trader_CancelBuyResponse__Output>): grpc.ClientUnaryCall;
  cancelBuy(argument: _day_trader_CancelBuyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelBuyResponse__Output>): grpc.ClientUnaryCall;
  cancelBuy(argument: _day_trader_CancelBuyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CancelBuyResponse__Output>): grpc.ClientUnaryCall;
  cancelBuy(argument: _day_trader_CancelBuyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelBuyResponse__Output>): grpc.ClientUnaryCall;
  cancelBuy(argument: _day_trader_CancelBuyRequest, callback: grpc.requestCallback<_day_trader_CancelBuyResponse__Output>): grpc.ClientUnaryCall;
  
  CancelSell(argument: _day_trader_CancelSellRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSellResponse__Output>): grpc.ClientUnaryCall;
  CancelSell(argument: _day_trader_CancelSellRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CancelSellResponse__Output>): grpc.ClientUnaryCall;
  CancelSell(argument: _day_trader_CancelSellRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSellResponse__Output>): grpc.ClientUnaryCall;
  CancelSell(argument: _day_trader_CancelSellRequest, callback: grpc.requestCallback<_day_trader_CancelSellResponse__Output>): grpc.ClientUnaryCall;
  cancelSell(argument: _day_trader_CancelSellRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSellResponse__Output>): grpc.ClientUnaryCall;
  cancelSell(argument: _day_trader_CancelSellRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CancelSellResponse__Output>): grpc.ClientUnaryCall;
  cancelSell(argument: _day_trader_CancelSellRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSellResponse__Output>): grpc.ClientUnaryCall;
  cancelSell(argument: _day_trader_CancelSellRequest, callback: grpc.requestCallback<_day_trader_CancelSellResponse__Output>): grpc.ClientUnaryCall;
  
  CommitBuy(argument: _day_trader_CommitBuyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CommitBuyResponse__Output>): grpc.ClientUnaryCall;
  CommitBuy(argument: _day_trader_CommitBuyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CommitBuyResponse__Output>): grpc.ClientUnaryCall;
  CommitBuy(argument: _day_trader_CommitBuyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CommitBuyResponse__Output>): grpc.ClientUnaryCall;
  CommitBuy(argument: _day_trader_CommitBuyRequest, callback: grpc.requestCallback<_day_trader_CommitBuyResponse__Output>): grpc.ClientUnaryCall;
  commitBuy(argument: _day_trader_CommitBuyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CommitBuyResponse__Output>): grpc.ClientUnaryCall;
  commitBuy(argument: _day_trader_CommitBuyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CommitBuyResponse__Output>): grpc.ClientUnaryCall;
  commitBuy(argument: _day_trader_CommitBuyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CommitBuyResponse__Output>): grpc.ClientUnaryCall;
  commitBuy(argument: _day_trader_CommitBuyRequest, callback: grpc.requestCallback<_day_trader_CommitBuyResponse__Output>): grpc.ClientUnaryCall;
  
  CommitSell(argument: _day_trader_CommitSellRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CommitSellResponse__Output>): grpc.ClientUnaryCall;
  CommitSell(argument: _day_trader_CommitSellRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CommitSellResponse__Output>): grpc.ClientUnaryCall;
  CommitSell(argument: _day_trader_CommitSellRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CommitSellResponse__Output>): grpc.ClientUnaryCall;
  CommitSell(argument: _day_trader_CommitSellRequest, callback: grpc.requestCallback<_day_trader_CommitSellResponse__Output>): grpc.ClientUnaryCall;
  commitSell(argument: _day_trader_CommitSellRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CommitSellResponse__Output>): grpc.ClientUnaryCall;
  commitSell(argument: _day_trader_CommitSellRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CommitSellResponse__Output>): grpc.ClientUnaryCall;
  commitSell(argument: _day_trader_CommitSellRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CommitSellResponse__Output>): grpc.ClientUnaryCall;
  commitSell(argument: _day_trader_CommitSellRequest, callback: grpc.requestCallback<_day_trader_CommitSellResponse__Output>): grpc.ClientUnaryCall;
  
  CreateUser(argument: _day_trader_CreateUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  CreateUser(argument: _day_trader_CreateUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  CreateUser(argument: _day_trader_CreateUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  CreateUser(argument: _day_trader_CreateUserRequest, callback: grpc.requestCallback<_day_trader_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _day_trader_CreateUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _day_trader_CreateUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _day_trader_CreateUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _day_trader_CreateUserRequest, callback: grpc.requestCallback<_day_trader_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  
  GetUser(argument: _day_trader_GetUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetUserResponse__Output>): grpc.ClientUnaryCall;
  GetUser(argument: _day_trader_GetUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_GetUserResponse__Output>): grpc.ClientUnaryCall;
  GetUser(argument: _day_trader_GetUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetUserResponse__Output>): grpc.ClientUnaryCall;
  GetUser(argument: _day_trader_GetUserRequest, callback: grpc.requestCallback<_day_trader_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _day_trader_GetUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _day_trader_GetUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _day_trader_GetUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _day_trader_GetUserRequest, callback: grpc.requestCallback<_day_trader_GetUserResponse__Output>): grpc.ClientUnaryCall;
  
  Sell(argument: _day_trader_SellRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  Sell(argument: _day_trader_SellRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  Sell(argument: _day_trader_SellRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  Sell(argument: _day_trader_SellRequest, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  sell(argument: _day_trader_SellRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  sell(argument: _day_trader_SellRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  sell(argument: _day_trader_SellRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  sell(argument: _day_trader_SellRequest, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface TransactionHandlers extends grpc.UntypedServiceImplementation {
  Add: grpc.handleUnaryCall<_day_trader_AddRequest__Output, _day_trader_AddResponse>;
  
  Buy: grpc.handleUnaryCall<_day_trader_BuyRequest__Output, _day_trader_BuyResponse>;
  
  CancelBuy: grpc.handleUnaryCall<_day_trader_CancelBuyRequest__Output, _day_trader_CancelBuyResponse>;
  
  CancelSell: grpc.handleUnaryCall<_day_trader_CancelSellRequest__Output, _day_trader_CancelSellResponse>;
  
  CommitBuy: grpc.handleUnaryCall<_day_trader_CommitBuyRequest__Output, _day_trader_CommitBuyResponse>;
  
  CommitSell: grpc.handleUnaryCall<_day_trader_CommitSellRequest__Output, _day_trader_CommitSellResponse>;
  
  CreateUser: grpc.handleUnaryCall<_day_trader_CreateUserRequest__Output, _day_trader_CreateUserResponse>;
  
  GetUser: grpc.handleUnaryCall<_day_trader_GetUserRequest__Output, _day_trader_GetUserResponse>;
  
  Sell: grpc.handleUnaryCall<_day_trader_SellRequest__Output, _day_trader_SellResponse>;
  
}

export interface TransactionDefinition extends grpc.ServiceDefinition {
  Add: MethodDefinition<_day_trader_AddRequest, _day_trader_AddResponse, _day_trader_AddRequest__Output, _day_trader_AddResponse__Output>
  Buy: MethodDefinition<_day_trader_BuyRequest, _day_trader_BuyResponse, _day_trader_BuyRequest__Output, _day_trader_BuyResponse__Output>
  CancelBuy: MethodDefinition<_day_trader_CancelBuyRequest, _day_trader_CancelBuyResponse, _day_trader_CancelBuyRequest__Output, _day_trader_CancelBuyResponse__Output>
  CancelSell: MethodDefinition<_day_trader_CancelSellRequest, _day_trader_CancelSellResponse, _day_trader_CancelSellRequest__Output, _day_trader_CancelSellResponse__Output>
  CommitBuy: MethodDefinition<_day_trader_CommitBuyRequest, _day_trader_CommitBuyResponse, _day_trader_CommitBuyRequest__Output, _day_trader_CommitBuyResponse__Output>
  CommitSell: MethodDefinition<_day_trader_CommitSellRequest, _day_trader_CommitSellResponse, _day_trader_CommitSellRequest__Output, _day_trader_CommitSellResponse__Output>
  CreateUser: MethodDefinition<_day_trader_CreateUserRequest, _day_trader_CreateUserResponse, _day_trader_CreateUserRequest__Output, _day_trader_CreateUserResponse__Output>
  GetUser: MethodDefinition<_day_trader_GetUserRequest, _day_trader_GetUserResponse, _day_trader_GetUserRequest__Output, _day_trader_GetUserResponse__Output>
  Sell: MethodDefinition<_day_trader_SellRequest, _day_trader_SellResponse, _day_trader_SellRequest__Output, _day_trader_SellResponse__Output>
}
