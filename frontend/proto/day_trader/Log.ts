// Original file: ../protos/day-trader.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { DisplaySummaryRequest as _day_trader_DisplaySummaryRequest, DisplaySummaryRequest__Output as _day_trader_DisplaySummaryRequest__Output } from '../day_trader/DisplaySummaryRequest';
import type { DisplaySummaryResponse as _day_trader_DisplaySummaryResponse, DisplaySummaryResponse__Output as _day_trader_DisplaySummaryResponse__Output } from '../day_trader/DisplaySummaryResponse';
import type { DumpLogRequest as _day_trader_DumpLogRequest, DumpLogRequest__Output as _day_trader_DumpLogRequest__Output } from '../day_trader/DumpLogRequest';
import type { DumpLogResponse as _day_trader_DumpLogResponse, DumpLogResponse__Output as _day_trader_DumpLogResponse__Output } from '../day_trader/DumpLogResponse';
import type { DumpLogUserRequest as _day_trader_DumpLogUserRequest, DumpLogUserRequest__Output as _day_trader_DumpLogUserRequest__Output } from '../day_trader/DumpLogUserRequest';
import type { DumpLogUserResponse as _day_trader_DumpLogUserResponse, DumpLogUserResponse__Output as _day_trader_DumpLogUserResponse__Output } from '../day_trader/DumpLogUserResponse';

export interface LogClient extends grpc.Client {
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
  
}

export interface LogHandlers extends grpc.UntypedServiceImplementation {
  DisplaySummary: grpc.handleUnaryCall<_day_trader_DisplaySummaryRequest__Output, _day_trader_DisplaySummaryResponse>;
  
  DumpLog: grpc.handleUnaryCall<_day_trader_DumpLogRequest__Output, _day_trader_DumpLogResponse>;
  
  DumpLogUser: grpc.handleUnaryCall<_day_trader_DumpLogUserRequest__Output, _day_trader_DumpLogUserResponse>;
  
}

export interface LogDefinition extends grpc.ServiceDefinition {
  DisplaySummary: MethodDefinition<_day_trader_DisplaySummaryRequest, _day_trader_DisplaySummaryResponse, _day_trader_DisplaySummaryRequest__Output, _day_trader_DisplaySummaryResponse__Output>
  DumpLog: MethodDefinition<_day_trader_DumpLogRequest, _day_trader_DumpLogResponse, _day_trader_DumpLogRequest__Output, _day_trader_DumpLogResponse__Output>
  DumpLogUser: MethodDefinition<_day_trader_DumpLogUserRequest, _day_trader_DumpLogUserResponse, _day_trader_DumpLogUserRequest__Output, _day_trader_DumpLogUserResponse__Output>
}
