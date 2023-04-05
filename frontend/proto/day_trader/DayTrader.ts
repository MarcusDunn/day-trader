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
import type { CancelSetBuyRequest as _day_trader_CancelSetBuyRequest, CancelSetBuyRequest__Output as _day_trader_CancelSetBuyRequest__Output } from '../day_trader/CancelSetBuyRequest';
import type { CancelSetBuyResponse as _day_trader_CancelSetBuyResponse, CancelSetBuyResponse__Output as _day_trader_CancelSetBuyResponse__Output } from '../day_trader/CancelSetBuyResponse';
import type { CancelSetSellRequest as _day_trader_CancelSetSellRequest, CancelSetSellRequest__Output as _day_trader_CancelSetSellRequest__Output } from '../day_trader/CancelSetSellRequest';
import type { CancelSetSellResponse as _day_trader_CancelSetSellResponse, CancelSetSellResponse__Output as _day_trader_CancelSetSellResponse__Output } from '../day_trader/CancelSetSellResponse';
import type { CommitBuyRequest as _day_trader_CommitBuyRequest, CommitBuyRequest__Output as _day_trader_CommitBuyRequest__Output } from '../day_trader/CommitBuyRequest';
import type { CommitBuyResponse as _day_trader_CommitBuyResponse, CommitBuyResponse__Output as _day_trader_CommitBuyResponse__Output } from '../day_trader/CommitBuyResponse';
import type { CommitSellRequest as _day_trader_CommitSellRequest, CommitSellRequest__Output as _day_trader_CommitSellRequest__Output } from '../day_trader/CommitSellRequest';
import type { CommitSellResponse as _day_trader_CommitSellResponse, CommitSellResponse__Output as _day_trader_CommitSellResponse__Output } from '../day_trader/CommitSellResponse';
import type { DisplaySummaryRequest as _day_trader_DisplaySummaryRequest, DisplaySummaryRequest__Output as _day_trader_DisplaySummaryRequest__Output } from '../day_trader/DisplaySummaryRequest';
import type { DisplaySummaryResponse as _day_trader_DisplaySummaryResponse, DisplaySummaryResponse__Output as _day_trader_DisplaySummaryResponse__Output } from '../day_trader/DisplaySummaryResponse';
import type { DumpLogRequest as _day_trader_DumpLogRequest, DumpLogRequest__Output as _day_trader_DumpLogRequest__Output } from '../day_trader/DumpLogRequest';
import type { DumpLogResponse as _day_trader_DumpLogResponse, DumpLogResponse__Output as _day_trader_DumpLogResponse__Output } from '../day_trader/DumpLogResponse';
import type { DumpLogUserRequest as _day_trader_DumpLogUserRequest, DumpLogUserRequest__Output as _day_trader_DumpLogUserRequest__Output } from '../day_trader/DumpLogUserRequest';
import type { DumpLogUserResponse as _day_trader_DumpLogUserResponse, DumpLogUserResponse__Output as _day_trader_DumpLogUserResponse__Output } from '../day_trader/DumpLogUserResponse';
import type { GetAllStocksRequest as _day_trader_GetAllStocksRequest, GetAllStocksRequest__Output as _day_trader_GetAllStocksRequest__Output } from '../day_trader/GetAllStocksRequest';
import type { GetAllStocksResponse as _day_trader_GetAllStocksResponse, GetAllStocksResponse__Output as _day_trader_GetAllStocksResponse__Output } from '../day_trader/GetAllStocksResponse';
import type { GetUserInfoRequest as _day_trader_GetUserInfoRequest, GetUserInfoRequest__Output as _day_trader_GetUserInfoRequest__Output } from '../day_trader/GetUserInfoRequest';
import type { GetUserInfoResponse as _day_trader_GetUserInfoResponse, GetUserInfoResponse__Output as _day_trader_GetUserInfoResponse__Output } from '../day_trader/GetUserInfoResponse';
import type { LoginRequest as _day_trader_LoginRequest, LoginRequest__Output as _day_trader_LoginRequest__Output } from '../day_trader/LoginRequest';
import type { LoginResponse as _day_trader_LoginResponse, LoginResponse__Output as _day_trader_LoginResponse__Output } from '../day_trader/LoginResponse';
import type { QuoteRequest as _day_trader_QuoteRequest, QuoteRequest__Output as _day_trader_QuoteRequest__Output } from '../day_trader/QuoteRequest';
import type { QuoteRequestSimple as _day_trader_QuoteRequestSimple, QuoteRequestSimple__Output as _day_trader_QuoteRequestSimple__Output } from '../day_trader/QuoteRequestSimple';
import type { SellRequest as _day_trader_SellRequest, SellRequest__Output as _day_trader_SellRequest__Output } from '../day_trader/SellRequest';
import type { SellResponse as _day_trader_SellResponse, SellResponse__Output as _day_trader_SellResponse__Output } from '../day_trader/SellResponse';
import type { SetBuyAmountRequest as _day_trader_SetBuyAmountRequest, SetBuyAmountRequest__Output as _day_trader_SetBuyAmountRequest__Output } from '../day_trader/SetBuyAmountRequest';
import type { SetBuyAmountResponse as _day_trader_SetBuyAmountResponse, SetBuyAmountResponse__Output as _day_trader_SetBuyAmountResponse__Output } from '../day_trader/SetBuyAmountResponse';
import type { SetBuyTriggerRequest as _day_trader_SetBuyTriggerRequest, SetBuyTriggerRequest__Output as _day_trader_SetBuyTriggerRequest__Output } from '../day_trader/SetBuyTriggerRequest';
import type { SetBuyTriggerResponse as _day_trader_SetBuyTriggerResponse, SetBuyTriggerResponse__Output as _day_trader_SetBuyTriggerResponse__Output } from '../day_trader/SetBuyTriggerResponse';
import type { SetSellAmountRequest as _day_trader_SetSellAmountRequest, SetSellAmountRequest__Output as _day_trader_SetSellAmountRequest__Output } from '../day_trader/SetSellAmountRequest';
import type { SetSellAmountResponse as _day_trader_SetSellAmountResponse, SetSellAmountResponse__Output as _day_trader_SetSellAmountResponse__Output } from '../day_trader/SetSellAmountResponse';
import type { SetSellTriggerRequest as _day_trader_SetSellTriggerRequest, SetSellTriggerRequest__Output as _day_trader_SetSellTriggerRequest__Output } from '../day_trader/SetSellTriggerRequest';
import type { SetSellTriggerResponse as _day_trader_SetSellTriggerResponse, SetSellTriggerResponse__Output as _day_trader_SetSellTriggerResponse__Output } from '../day_trader/SetSellTriggerResponse';

export interface DayTraderClient extends grpc.Client {
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
  
  CancelSetBuy(argument: _day_trader_CancelSetBuyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSetBuyResponse__Output>): grpc.ClientUnaryCall;
  CancelSetBuy(argument: _day_trader_CancelSetBuyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CancelSetBuyResponse__Output>): grpc.ClientUnaryCall;
  CancelSetBuy(argument: _day_trader_CancelSetBuyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSetBuyResponse__Output>): grpc.ClientUnaryCall;
  CancelSetBuy(argument: _day_trader_CancelSetBuyRequest, callback: grpc.requestCallback<_day_trader_CancelSetBuyResponse__Output>): grpc.ClientUnaryCall;
  cancelSetBuy(argument: _day_trader_CancelSetBuyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSetBuyResponse__Output>): grpc.ClientUnaryCall;
  cancelSetBuy(argument: _day_trader_CancelSetBuyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CancelSetBuyResponse__Output>): grpc.ClientUnaryCall;
  cancelSetBuy(argument: _day_trader_CancelSetBuyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSetBuyResponse__Output>): grpc.ClientUnaryCall;
  cancelSetBuy(argument: _day_trader_CancelSetBuyRequest, callback: grpc.requestCallback<_day_trader_CancelSetBuyResponse__Output>): grpc.ClientUnaryCall;
  
  CancelSetSell(argument: _day_trader_CancelSetSellRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSetSellResponse__Output>): grpc.ClientUnaryCall;
  CancelSetSell(argument: _day_trader_CancelSetSellRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CancelSetSellResponse__Output>): grpc.ClientUnaryCall;
  CancelSetSell(argument: _day_trader_CancelSetSellRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSetSellResponse__Output>): grpc.ClientUnaryCall;
  CancelSetSell(argument: _day_trader_CancelSetSellRequest, callback: grpc.requestCallback<_day_trader_CancelSetSellResponse__Output>): grpc.ClientUnaryCall;
  cancelSetSell(argument: _day_trader_CancelSetSellRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSetSellResponse__Output>): grpc.ClientUnaryCall;
  cancelSetSell(argument: _day_trader_CancelSetSellRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_CancelSetSellResponse__Output>): grpc.ClientUnaryCall;
  cancelSetSell(argument: _day_trader_CancelSetSellRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_CancelSetSellResponse__Output>): grpc.ClientUnaryCall;
  cancelSetSell(argument: _day_trader_CancelSetSellRequest, callback: grpc.requestCallback<_day_trader_CancelSetSellResponse__Output>): grpc.ClientUnaryCall;
  
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
  
  DisplaySummary(argument: _day_trader_DisplaySummaryRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DisplaySummaryResponse__Output>): grpc.ClientUnaryCall;
  DisplaySummary(argument: _day_trader_DisplaySummaryRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_DisplaySummaryResponse__Output>): grpc.ClientUnaryCall;
  DisplaySummary(argument: _day_trader_DisplaySummaryRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DisplaySummaryResponse__Output>): grpc.ClientUnaryCall;
  DisplaySummary(argument: _day_trader_DisplaySummaryRequest, callback: grpc.requestCallback<_day_trader_DisplaySummaryResponse__Output>): grpc.ClientUnaryCall;
  displaySummary(argument: _day_trader_DisplaySummaryRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DisplaySummaryResponse__Output>): grpc.ClientUnaryCall;
  displaySummary(argument: _day_trader_DisplaySummaryRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_DisplaySummaryResponse__Output>): grpc.ClientUnaryCall;
  displaySummary(argument: _day_trader_DisplaySummaryRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DisplaySummaryResponse__Output>): grpc.ClientUnaryCall;
  displaySummary(argument: _day_trader_DisplaySummaryRequest, callback: grpc.requestCallback<_day_trader_DisplaySummaryResponse__Output>): grpc.ClientUnaryCall;
  
  DumpLog(argument: _day_trader_DumpLogRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DumpLogResponse__Output>): grpc.ClientUnaryCall;
  DumpLog(argument: _day_trader_DumpLogRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_DumpLogResponse__Output>): grpc.ClientUnaryCall;
  DumpLog(argument: _day_trader_DumpLogRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DumpLogResponse__Output>): grpc.ClientUnaryCall;
  DumpLog(argument: _day_trader_DumpLogRequest, callback: grpc.requestCallback<_day_trader_DumpLogResponse__Output>): grpc.ClientUnaryCall;
  dumpLog(argument: _day_trader_DumpLogRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DumpLogResponse__Output>): grpc.ClientUnaryCall;
  dumpLog(argument: _day_trader_DumpLogRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_DumpLogResponse__Output>): grpc.ClientUnaryCall;
  dumpLog(argument: _day_trader_DumpLogRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DumpLogResponse__Output>): grpc.ClientUnaryCall;
  dumpLog(argument: _day_trader_DumpLogRequest, callback: grpc.requestCallback<_day_trader_DumpLogResponse__Output>): grpc.ClientUnaryCall;
  
  DumpLogUser(argument: _day_trader_DumpLogUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DumpLogUserResponse__Output>): grpc.ClientUnaryCall;
  DumpLogUser(argument: _day_trader_DumpLogUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_DumpLogUserResponse__Output>): grpc.ClientUnaryCall;
  DumpLogUser(argument: _day_trader_DumpLogUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DumpLogUserResponse__Output>): grpc.ClientUnaryCall;
  DumpLogUser(argument: _day_trader_DumpLogUserRequest, callback: grpc.requestCallback<_day_trader_DumpLogUserResponse__Output>): grpc.ClientUnaryCall;
  dumpLogUser(argument: _day_trader_DumpLogUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DumpLogUserResponse__Output>): grpc.ClientUnaryCall;
  dumpLogUser(argument: _day_trader_DumpLogUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_DumpLogUserResponse__Output>): grpc.ClientUnaryCall;
  dumpLogUser(argument: _day_trader_DumpLogUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_DumpLogUserResponse__Output>): grpc.ClientUnaryCall;
  dumpLogUser(argument: _day_trader_DumpLogUserRequest, callback: grpc.requestCallback<_day_trader_DumpLogUserResponse__Output>): grpc.ClientUnaryCall;
  
  GetAllStocks(argument: _day_trader_GetAllStocksRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetAllStocksResponse__Output>): grpc.ClientUnaryCall;
  GetAllStocks(argument: _day_trader_GetAllStocksRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_GetAllStocksResponse__Output>): grpc.ClientUnaryCall;
  GetAllStocks(argument: _day_trader_GetAllStocksRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetAllStocksResponse__Output>): grpc.ClientUnaryCall;
  GetAllStocks(argument: _day_trader_GetAllStocksRequest, callback: grpc.requestCallback<_day_trader_GetAllStocksResponse__Output>): grpc.ClientUnaryCall;
  getAllStocks(argument: _day_trader_GetAllStocksRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetAllStocksResponse__Output>): grpc.ClientUnaryCall;
  getAllStocks(argument: _day_trader_GetAllStocksRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_GetAllStocksResponse__Output>): grpc.ClientUnaryCall;
  getAllStocks(argument: _day_trader_GetAllStocksRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetAllStocksResponse__Output>): grpc.ClientUnaryCall;
  getAllStocks(argument: _day_trader_GetAllStocksRequest, callback: grpc.requestCallback<_day_trader_GetAllStocksResponse__Output>): grpc.ClientUnaryCall;
  
  GetUserInfo(argument: _day_trader_GetUserInfoRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetUserInfoResponse__Output>): grpc.ClientUnaryCall;
  GetUserInfo(argument: _day_trader_GetUserInfoRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_GetUserInfoResponse__Output>): grpc.ClientUnaryCall;
  GetUserInfo(argument: _day_trader_GetUserInfoRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetUserInfoResponse__Output>): grpc.ClientUnaryCall;
  GetUserInfo(argument: _day_trader_GetUserInfoRequest, callback: grpc.requestCallback<_day_trader_GetUserInfoResponse__Output>): grpc.ClientUnaryCall;
  getUserInfo(argument: _day_trader_GetUserInfoRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetUserInfoResponse__Output>): grpc.ClientUnaryCall;
  getUserInfo(argument: _day_trader_GetUserInfoRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_GetUserInfoResponse__Output>): grpc.ClientUnaryCall;
  getUserInfo(argument: _day_trader_GetUserInfoRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_GetUserInfoResponse__Output>): grpc.ClientUnaryCall;
  getUserInfo(argument: _day_trader_GetUserInfoRequest, callback: grpc.requestCallback<_day_trader_GetUserInfoResponse__Output>): grpc.ClientUnaryCall;
  
  Login(argument: _day_trader_LoginRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_LoginResponse__Output>): grpc.ClientUnaryCall;
  Login(argument: _day_trader_LoginRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_LoginResponse__Output>): grpc.ClientUnaryCall;
  Login(argument: _day_trader_LoginRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_LoginResponse__Output>): grpc.ClientUnaryCall;
  Login(argument: _day_trader_LoginRequest, callback: grpc.requestCallback<_day_trader_LoginResponse__Output>): grpc.ClientUnaryCall;
  login(argument: _day_trader_LoginRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_LoginResponse__Output>): grpc.ClientUnaryCall;
  login(argument: _day_trader_LoginRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_LoginResponse__Output>): grpc.ClientUnaryCall;
  login(argument: _day_trader_LoginRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_LoginResponse__Output>): grpc.ClientUnaryCall;
  login(argument: _day_trader_LoginRequest, callback: grpc.requestCallback<_day_trader_LoginResponse__Output>): grpc.ClientUnaryCall;
  
  Quote(argument: _day_trader_QuoteRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_QuoteRequestSimple__Output>): grpc.ClientUnaryCall;
  Quote(argument: _day_trader_QuoteRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_QuoteRequestSimple__Output>): grpc.ClientUnaryCall;
  Quote(argument: _day_trader_QuoteRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_QuoteRequestSimple__Output>): grpc.ClientUnaryCall;
  Quote(argument: _day_trader_QuoteRequest, callback: grpc.requestCallback<_day_trader_QuoteRequestSimple__Output>): grpc.ClientUnaryCall;
  quote(argument: _day_trader_QuoteRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_QuoteRequestSimple__Output>): grpc.ClientUnaryCall;
  quote(argument: _day_trader_QuoteRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_QuoteRequestSimple__Output>): grpc.ClientUnaryCall;
  quote(argument: _day_trader_QuoteRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_QuoteRequestSimple__Output>): grpc.ClientUnaryCall;
  quote(argument: _day_trader_QuoteRequest, callback: grpc.requestCallback<_day_trader_QuoteRequestSimple__Output>): grpc.ClientUnaryCall;
  
  Sell(argument: _day_trader_SellRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  Sell(argument: _day_trader_SellRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  Sell(argument: _day_trader_SellRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  Sell(argument: _day_trader_SellRequest, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  sell(argument: _day_trader_SellRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  sell(argument: _day_trader_SellRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  sell(argument: _day_trader_SellRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  sell(argument: _day_trader_SellRequest, callback: grpc.requestCallback<_day_trader_SellResponse__Output>): grpc.ClientUnaryCall;
  
  SetBuyAmount(argument: _day_trader_SetBuyAmountRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetBuyAmountResponse__Output>): grpc.ClientUnaryCall;
  SetBuyAmount(argument: _day_trader_SetBuyAmountRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SetBuyAmountResponse__Output>): grpc.ClientUnaryCall;
  SetBuyAmount(argument: _day_trader_SetBuyAmountRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetBuyAmountResponse__Output>): grpc.ClientUnaryCall;
  SetBuyAmount(argument: _day_trader_SetBuyAmountRequest, callback: grpc.requestCallback<_day_trader_SetBuyAmountResponse__Output>): grpc.ClientUnaryCall;
  setBuyAmount(argument: _day_trader_SetBuyAmountRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetBuyAmountResponse__Output>): grpc.ClientUnaryCall;
  setBuyAmount(argument: _day_trader_SetBuyAmountRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SetBuyAmountResponse__Output>): grpc.ClientUnaryCall;
  setBuyAmount(argument: _day_trader_SetBuyAmountRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetBuyAmountResponse__Output>): grpc.ClientUnaryCall;
  setBuyAmount(argument: _day_trader_SetBuyAmountRequest, callback: grpc.requestCallback<_day_trader_SetBuyAmountResponse__Output>): grpc.ClientUnaryCall;
  
  SetBuyTrigger(argument: _day_trader_SetBuyTriggerRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetBuyTriggerResponse__Output>): grpc.ClientUnaryCall;
  SetBuyTrigger(argument: _day_trader_SetBuyTriggerRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SetBuyTriggerResponse__Output>): grpc.ClientUnaryCall;
  SetBuyTrigger(argument: _day_trader_SetBuyTriggerRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetBuyTriggerResponse__Output>): grpc.ClientUnaryCall;
  SetBuyTrigger(argument: _day_trader_SetBuyTriggerRequest, callback: grpc.requestCallback<_day_trader_SetBuyTriggerResponse__Output>): grpc.ClientUnaryCall;
  setBuyTrigger(argument: _day_trader_SetBuyTriggerRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetBuyTriggerResponse__Output>): grpc.ClientUnaryCall;
  setBuyTrigger(argument: _day_trader_SetBuyTriggerRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SetBuyTriggerResponse__Output>): grpc.ClientUnaryCall;
  setBuyTrigger(argument: _day_trader_SetBuyTriggerRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetBuyTriggerResponse__Output>): grpc.ClientUnaryCall;
  setBuyTrigger(argument: _day_trader_SetBuyTriggerRequest, callback: grpc.requestCallback<_day_trader_SetBuyTriggerResponse__Output>): grpc.ClientUnaryCall;
  
  SetSellAmount(argument: _day_trader_SetSellAmountRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetSellAmountResponse__Output>): grpc.ClientUnaryCall;
  SetSellAmount(argument: _day_trader_SetSellAmountRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SetSellAmountResponse__Output>): grpc.ClientUnaryCall;
  SetSellAmount(argument: _day_trader_SetSellAmountRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetSellAmountResponse__Output>): grpc.ClientUnaryCall;
  SetSellAmount(argument: _day_trader_SetSellAmountRequest, callback: grpc.requestCallback<_day_trader_SetSellAmountResponse__Output>): grpc.ClientUnaryCall;
  setSellAmount(argument: _day_trader_SetSellAmountRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetSellAmountResponse__Output>): grpc.ClientUnaryCall;
  setSellAmount(argument: _day_trader_SetSellAmountRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SetSellAmountResponse__Output>): grpc.ClientUnaryCall;
  setSellAmount(argument: _day_trader_SetSellAmountRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetSellAmountResponse__Output>): grpc.ClientUnaryCall;
  setSellAmount(argument: _day_trader_SetSellAmountRequest, callback: grpc.requestCallback<_day_trader_SetSellAmountResponse__Output>): grpc.ClientUnaryCall;
  
  SetSellTrigger(argument: _day_trader_SetSellTriggerRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetSellTriggerResponse__Output>): grpc.ClientUnaryCall;
  SetSellTrigger(argument: _day_trader_SetSellTriggerRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SetSellTriggerResponse__Output>): grpc.ClientUnaryCall;
  SetSellTrigger(argument: _day_trader_SetSellTriggerRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetSellTriggerResponse__Output>): grpc.ClientUnaryCall;
  SetSellTrigger(argument: _day_trader_SetSellTriggerRequest, callback: grpc.requestCallback<_day_trader_SetSellTriggerResponse__Output>): grpc.ClientUnaryCall;
  setSellTrigger(argument: _day_trader_SetSellTriggerRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetSellTriggerResponse__Output>): grpc.ClientUnaryCall;
  setSellTrigger(argument: _day_trader_SetSellTriggerRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_SetSellTriggerResponse__Output>): grpc.ClientUnaryCall;
  setSellTrigger(argument: _day_trader_SetSellTriggerRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_SetSellTriggerResponse__Output>): grpc.ClientUnaryCall;
  setSellTrigger(argument: _day_trader_SetSellTriggerRequest, callback: grpc.requestCallback<_day_trader_SetSellTriggerResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface DayTraderHandlers extends grpc.UntypedServiceImplementation {
  Add: grpc.handleUnaryCall<_day_trader_AddRequest__Output, _day_trader_AddResponse>;
  
  Buy: grpc.handleUnaryCall<_day_trader_BuyRequest__Output, _day_trader_BuyResponse>;
  
  CancelBuy: grpc.handleUnaryCall<_day_trader_CancelBuyRequest__Output, _day_trader_CancelBuyResponse>;
  
  CancelSell: grpc.handleUnaryCall<_day_trader_CancelSellRequest__Output, _day_trader_CancelSellResponse>;
  
  CancelSetBuy: grpc.handleUnaryCall<_day_trader_CancelSetBuyRequest__Output, _day_trader_CancelSetBuyResponse>;
  
  CancelSetSell: grpc.handleUnaryCall<_day_trader_CancelSetSellRequest__Output, _day_trader_CancelSetSellResponse>;
  
  CommitBuy: grpc.handleUnaryCall<_day_trader_CommitBuyRequest__Output, _day_trader_CommitBuyResponse>;
  
  CommitSell: grpc.handleUnaryCall<_day_trader_CommitSellRequest__Output, _day_trader_CommitSellResponse>;
  
  DisplaySummary: grpc.handleUnaryCall<_day_trader_DisplaySummaryRequest__Output, _day_trader_DisplaySummaryResponse>;
  
  DumpLog: grpc.handleUnaryCall<_day_trader_DumpLogRequest__Output, _day_trader_DumpLogResponse>;
  
  DumpLogUser: grpc.handleUnaryCall<_day_trader_DumpLogUserRequest__Output, _day_trader_DumpLogUserResponse>;
  
  GetAllStocks: grpc.handleUnaryCall<_day_trader_GetAllStocksRequest__Output, _day_trader_GetAllStocksResponse>;
  
  GetUserInfo: grpc.handleUnaryCall<_day_trader_GetUserInfoRequest__Output, _day_trader_GetUserInfoResponse>;
  
  Login: grpc.handleUnaryCall<_day_trader_LoginRequest__Output, _day_trader_LoginResponse>;
  
  Quote: grpc.handleUnaryCall<_day_trader_QuoteRequest__Output, _day_trader_QuoteRequestSimple>;
  
  Sell: grpc.handleUnaryCall<_day_trader_SellRequest__Output, _day_trader_SellResponse>;
  
  SetBuyAmount: grpc.handleUnaryCall<_day_trader_SetBuyAmountRequest__Output, _day_trader_SetBuyAmountResponse>;
  
  SetBuyTrigger: grpc.handleUnaryCall<_day_trader_SetBuyTriggerRequest__Output, _day_trader_SetBuyTriggerResponse>;
  
  SetSellAmount: grpc.handleUnaryCall<_day_trader_SetSellAmountRequest__Output, _day_trader_SetSellAmountResponse>;
  
  SetSellTrigger: grpc.handleUnaryCall<_day_trader_SetSellTriggerRequest__Output, _day_trader_SetSellTriggerResponse>;
  
}

export interface DayTraderDefinition extends grpc.ServiceDefinition {
  Add: MethodDefinition<_day_trader_AddRequest, _day_trader_AddResponse, _day_trader_AddRequest__Output, _day_trader_AddResponse__Output>
  Buy: MethodDefinition<_day_trader_BuyRequest, _day_trader_BuyResponse, _day_trader_BuyRequest__Output, _day_trader_BuyResponse__Output>
  CancelBuy: MethodDefinition<_day_trader_CancelBuyRequest, _day_trader_CancelBuyResponse, _day_trader_CancelBuyRequest__Output, _day_trader_CancelBuyResponse__Output>
  CancelSell: MethodDefinition<_day_trader_CancelSellRequest, _day_trader_CancelSellResponse, _day_trader_CancelSellRequest__Output, _day_trader_CancelSellResponse__Output>
  CancelSetBuy: MethodDefinition<_day_trader_CancelSetBuyRequest, _day_trader_CancelSetBuyResponse, _day_trader_CancelSetBuyRequest__Output, _day_trader_CancelSetBuyResponse__Output>
  CancelSetSell: MethodDefinition<_day_trader_CancelSetSellRequest, _day_trader_CancelSetSellResponse, _day_trader_CancelSetSellRequest__Output, _day_trader_CancelSetSellResponse__Output>
  CommitBuy: MethodDefinition<_day_trader_CommitBuyRequest, _day_trader_CommitBuyResponse, _day_trader_CommitBuyRequest__Output, _day_trader_CommitBuyResponse__Output>
  CommitSell: MethodDefinition<_day_trader_CommitSellRequest, _day_trader_CommitSellResponse, _day_trader_CommitSellRequest__Output, _day_trader_CommitSellResponse__Output>
  DisplaySummary: MethodDefinition<_day_trader_DisplaySummaryRequest, _day_trader_DisplaySummaryResponse, _day_trader_DisplaySummaryRequest__Output, _day_trader_DisplaySummaryResponse__Output>
  DumpLog: MethodDefinition<_day_trader_DumpLogRequest, _day_trader_DumpLogResponse, _day_trader_DumpLogRequest__Output, _day_trader_DumpLogResponse__Output>
  DumpLogUser: MethodDefinition<_day_trader_DumpLogUserRequest, _day_trader_DumpLogUserResponse, _day_trader_DumpLogUserRequest__Output, _day_trader_DumpLogUserResponse__Output>
  GetAllStocks: MethodDefinition<_day_trader_GetAllStocksRequest, _day_trader_GetAllStocksResponse, _day_trader_GetAllStocksRequest__Output, _day_trader_GetAllStocksResponse__Output>
  GetUserInfo: MethodDefinition<_day_trader_GetUserInfoRequest, _day_trader_GetUserInfoResponse, _day_trader_GetUserInfoRequest__Output, _day_trader_GetUserInfoResponse__Output>
  Login: MethodDefinition<_day_trader_LoginRequest, _day_trader_LoginResponse, _day_trader_LoginRequest__Output, _day_trader_LoginResponse__Output>
  Quote: MethodDefinition<_day_trader_QuoteRequest, _day_trader_QuoteRequestSimple, _day_trader_QuoteRequest__Output, _day_trader_QuoteRequestSimple__Output>
  Sell: MethodDefinition<_day_trader_SellRequest, _day_trader_SellResponse, _day_trader_SellRequest__Output, _day_trader_SellResponse__Output>
  SetBuyAmount: MethodDefinition<_day_trader_SetBuyAmountRequest, _day_trader_SetBuyAmountResponse, _day_trader_SetBuyAmountRequest__Output, _day_trader_SetBuyAmountResponse__Output>
  SetBuyTrigger: MethodDefinition<_day_trader_SetBuyTriggerRequest, _day_trader_SetBuyTriggerResponse, _day_trader_SetBuyTriggerRequest__Output, _day_trader_SetBuyTriggerResponse__Output>
  SetSellAmount: MethodDefinition<_day_trader_SetSellAmountRequest, _day_trader_SetSellAmountResponse, _day_trader_SetSellAmountRequest__Output, _day_trader_SetSellAmountResponse__Output>
  SetSellTrigger: MethodDefinition<_day_trader_SetSellTriggerRequest, _day_trader_SetSellTriggerResponse, _day_trader_SetSellTriggerRequest__Output, _day_trader_SetSellTriggerResponse__Output>
}
