// Original file: ../protos/day-trader.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { QuoteRequest as _day_trader_QuoteRequest, QuoteRequest__Output as _day_trader_QuoteRequest__Output } from '../day_trader/QuoteRequest';
import type { QuoteResponse as _day_trader_QuoteResponse, QuoteResponse__Output as _day_trader_QuoteResponse__Output } from '../day_trader/QuoteResponse';

export interface QuoteClient extends grpc.Client {
  Quote(argument: _day_trader_QuoteRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_QuoteResponse__Output>): grpc.ClientUnaryCall;
  Quote(argument: _day_trader_QuoteRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_QuoteResponse__Output>): grpc.ClientUnaryCall;
  Quote(argument: _day_trader_QuoteRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_QuoteResponse__Output>): grpc.ClientUnaryCall;
  Quote(argument: _day_trader_QuoteRequest, callback: grpc.requestCallback<_day_trader_QuoteResponse__Output>): grpc.ClientUnaryCall;
  quote(argument: _day_trader_QuoteRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_QuoteResponse__Output>): grpc.ClientUnaryCall;
  quote(argument: _day_trader_QuoteRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_QuoteResponse__Output>): grpc.ClientUnaryCall;
  quote(argument: _day_trader_QuoteRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_QuoteResponse__Output>): grpc.ClientUnaryCall;
  quote(argument: _day_trader_QuoteRequest, callback: grpc.requestCallback<_day_trader_QuoteResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface QuoteHandlers extends grpc.UntypedServiceImplementation {
  Quote: grpc.handleUnaryCall<_day_trader_QuoteRequest__Output, _day_trader_QuoteResponse>;
  
}

export interface QuoteDefinition extends grpc.ServiceDefinition {
  Quote: MethodDefinition<_day_trader_QuoteRequest, _day_trader_QuoteResponse, _day_trader_QuoteRequest__Output, _day_trader_QuoteResponse__Output>
}
