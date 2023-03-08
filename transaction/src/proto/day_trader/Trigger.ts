// Original file: ../protos/day-trader.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CancelSetBuyRequest as _day_trader_CancelSetBuyRequest, CancelSetBuyRequest__Output as _day_trader_CancelSetBuyRequest__Output } from '../day_trader/CancelSetBuyRequest';
import type { CancelSetBuyResponse as _day_trader_CancelSetBuyResponse, CancelSetBuyResponse__Output as _day_trader_CancelSetBuyResponse__Output } from '../day_trader/CancelSetBuyResponse';
import type { CancelSetSellRequest as _day_trader_CancelSetSellRequest, CancelSetSellRequest__Output as _day_trader_CancelSetSellRequest__Output } from '../day_trader/CancelSetSellRequest';
import type { CancelSetSellResponse as _day_trader_CancelSetSellResponse, CancelSetSellResponse__Output as _day_trader_CancelSetSellResponse__Output } from '../day_trader/CancelSetSellResponse';
import type { SetBuyAmountRequest as _day_trader_SetBuyAmountRequest, SetBuyAmountRequest__Output as _day_trader_SetBuyAmountRequest__Output } from '../day_trader/SetBuyAmountRequest';
import type { SetBuyAmountResponse as _day_trader_SetBuyAmountResponse, SetBuyAmountResponse__Output as _day_trader_SetBuyAmountResponse__Output } from '../day_trader/SetBuyAmountResponse';
import type { SetBuyTriggerRequest as _day_trader_SetBuyTriggerRequest, SetBuyTriggerRequest__Output as _day_trader_SetBuyTriggerRequest__Output } from '../day_trader/SetBuyTriggerRequest';
import type { SetBuyTriggerResponse as _day_trader_SetBuyTriggerResponse, SetBuyTriggerResponse__Output as _day_trader_SetBuyTriggerResponse__Output } from '../day_trader/SetBuyTriggerResponse';
import type { SetSellAmountRequest as _day_trader_SetSellAmountRequest, SetSellAmountRequest__Output as _day_trader_SetSellAmountRequest__Output } from '../day_trader/SetSellAmountRequest';
import type { SetSellAmountResponse as _day_trader_SetSellAmountResponse, SetSellAmountResponse__Output as _day_trader_SetSellAmountResponse__Output } from '../day_trader/SetSellAmountResponse';
import type { SetSellTriggerRequest as _day_trader_SetSellTriggerRequest, SetSellTriggerRequest__Output as _day_trader_SetSellTriggerRequest__Output } from '../day_trader/SetSellTriggerRequest';
import type { SetSellTriggerResponse as _day_trader_SetSellTriggerResponse, SetSellTriggerResponse__Output as _day_trader_SetSellTriggerResponse__Output } from '../day_trader/SetSellTriggerResponse';

export interface TriggerClient extends grpc.Client {
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

export interface TriggerHandlers extends grpc.UntypedServiceImplementation {
  CancelSetBuy: grpc.handleUnaryCall<_day_trader_CancelSetBuyRequest__Output, _day_trader_CancelSetBuyResponse>;
  
  CancelSetSell: grpc.handleUnaryCall<_day_trader_CancelSetSellRequest__Output, _day_trader_CancelSetSellResponse>;
  
  SetBuyAmount: grpc.handleUnaryCall<_day_trader_SetBuyAmountRequest__Output, _day_trader_SetBuyAmountResponse>;
  
  SetBuyTrigger: grpc.handleUnaryCall<_day_trader_SetBuyTriggerRequest__Output, _day_trader_SetBuyTriggerResponse>;
  
  SetSellAmount: grpc.handleUnaryCall<_day_trader_SetSellAmountRequest__Output, _day_trader_SetSellAmountResponse>;
  
  SetSellTrigger: grpc.handleUnaryCall<_day_trader_SetSellTriggerRequest__Output, _day_trader_SetSellTriggerResponse>;
  
}

export interface TriggerDefinition extends grpc.ServiceDefinition {
  CancelSetBuy: MethodDefinition<_day_trader_CancelSetBuyRequest, _day_trader_CancelSetBuyResponse, _day_trader_CancelSetBuyRequest__Output, _day_trader_CancelSetBuyResponse__Output>
  CancelSetSell: MethodDefinition<_day_trader_CancelSetSellRequest, _day_trader_CancelSetSellResponse, _day_trader_CancelSetSellRequest__Output, _day_trader_CancelSetSellResponse__Output>
  SetBuyAmount: MethodDefinition<_day_trader_SetBuyAmountRequest, _day_trader_SetBuyAmountResponse, _day_trader_SetBuyAmountRequest__Output, _day_trader_SetBuyAmountResponse__Output>
  SetBuyTrigger: MethodDefinition<_day_trader_SetBuyTriggerRequest, _day_trader_SetBuyTriggerResponse, _day_trader_SetBuyTriggerRequest__Output, _day_trader_SetBuyTriggerResponse__Output>
  SetSellAmount: MethodDefinition<_day_trader_SetSellAmountRequest, _day_trader_SetSellAmountResponse, _day_trader_SetSellAmountRequest__Output, _day_trader_SetSellAmountResponse__Output>
  SetSellTrigger: MethodDefinition<_day_trader_SetSellTriggerRequest, _day_trader_SetSellTriggerResponse, _day_trader_SetSellTriggerRequest__Output, _day_trader_SetSellTriggerResponse__Output>
}
