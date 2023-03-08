// Original file: ../protos/day-trader.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { DisplaySummaryRequest as _day_trader_DisplaySummaryRequest, DisplaySummaryRequest__Output as _day_trader_DisplaySummaryRequest__Output } from '../day_trader/DisplaySummaryRequest';
import type { DisplaySummaryResponse as _day_trader_DisplaySummaryResponse, DisplaySummaryResponse__Output as _day_trader_DisplaySummaryResponse__Output } from '../day_trader/DisplaySummaryResponse';
import type { DumpLogRequest as _day_trader_DumpLogRequest, DumpLogRequest__Output as _day_trader_DumpLogRequest__Output } from '../day_trader/DumpLogRequest';
import type { DumpLogResponse as _day_trader_DumpLogResponse, DumpLogResponse__Output as _day_trader_DumpLogResponse__Output } from '../day_trader/DumpLogResponse';
import type { DumpLogUserRequest as _day_trader_DumpLogUserRequest, DumpLogUserRequest__Output as _day_trader_DumpLogUserRequest__Output } from '../day_trader/DumpLogUserRequest';
import type { DumpLogUserResponse as _day_trader_DumpLogUserResponse, DumpLogUserResponse__Output as _day_trader_DumpLogUserResponse__Output } from '../day_trader/DumpLogUserResponse';
import type { InsertAccountTransactionRequest as _day_trader_InsertAccountTransactionRequest, InsertAccountTransactionRequest__Output as _day_trader_InsertAccountTransactionRequest__Output } from '../day_trader/InsertAccountTransactionRequest';
import type { InsertAccountTransactionResponse as _day_trader_InsertAccountTransactionResponse, InsertAccountTransactionResponse__Output as _day_trader_InsertAccountTransactionResponse__Output } from '../day_trader/InsertAccountTransactionResponse';
import type { InsertErrorEventRequest as _day_trader_InsertErrorEventRequest, InsertErrorEventRequest__Output as _day_trader_InsertErrorEventRequest__Output } from '../day_trader/InsertErrorEventRequest';
import type { InsertErrorEventResponse as _day_trader_InsertErrorEventResponse, InsertErrorEventResponse__Output as _day_trader_InsertErrorEventResponse__Output } from '../day_trader/InsertErrorEventResponse';
import type { InsertQuoteServerRequest as _day_trader_InsertQuoteServerRequest, InsertQuoteServerRequest__Output as _day_trader_InsertQuoteServerRequest__Output } from '../day_trader/InsertQuoteServerRequest';
import type { InsertQuoteServerResponse as _day_trader_InsertQuoteServerResponse, InsertQuoteServerResponse__Output as _day_trader_InsertQuoteServerResponse__Output } from '../day_trader/InsertQuoteServerResponse';
import type { InsertSystemEventRequest as _day_trader_InsertSystemEventRequest, InsertSystemEventRequest__Output as _day_trader_InsertSystemEventRequest__Output } from '../day_trader/InsertSystemEventRequest';
import type { InsertSystemEventResponse as _day_trader_InsertSystemEventResponse, InsertSystemEventResponse__Output as _day_trader_InsertSystemEventResponse__Output } from '../day_trader/InsertSystemEventResponse';
import type { InsertUserCommandRequest as _day_trader_InsertUserCommandRequest, InsertUserCommandRequest__Output as _day_trader_InsertUserCommandRequest__Output } from '../day_trader/InsertUserCommandRequest';
import type { InsertUserCommandResponse as _day_trader_InsertUserCommandResponse, InsertUserCommandResponse__Output as _day_trader_InsertUserCommandResponse__Output } from '../day_trader/InsertUserCommandResponse';

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
  
  InsertAccountTransaction(argument: _day_trader_InsertAccountTransactionRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertAccountTransactionResponse__Output>): grpc.ClientUnaryCall;
  InsertAccountTransaction(argument: _day_trader_InsertAccountTransactionRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_InsertAccountTransactionResponse__Output>): grpc.ClientUnaryCall;
  InsertAccountTransaction(argument: _day_trader_InsertAccountTransactionRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertAccountTransactionResponse__Output>): grpc.ClientUnaryCall;
  InsertAccountTransaction(argument: _day_trader_InsertAccountTransactionRequest, callback: grpc.requestCallback<_day_trader_InsertAccountTransactionResponse__Output>): grpc.ClientUnaryCall;
  insertAccountTransaction(argument: _day_trader_InsertAccountTransactionRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertAccountTransactionResponse__Output>): grpc.ClientUnaryCall;
  insertAccountTransaction(argument: _day_trader_InsertAccountTransactionRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_InsertAccountTransactionResponse__Output>): grpc.ClientUnaryCall;
  insertAccountTransaction(argument: _day_trader_InsertAccountTransactionRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertAccountTransactionResponse__Output>): grpc.ClientUnaryCall;
  insertAccountTransaction(argument: _day_trader_InsertAccountTransactionRequest, callback: grpc.requestCallback<_day_trader_InsertAccountTransactionResponse__Output>): grpc.ClientUnaryCall;
  
  InsertErrorEvent(argument: _day_trader_InsertErrorEventRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertErrorEventResponse__Output>): grpc.ClientUnaryCall;
  InsertErrorEvent(argument: _day_trader_InsertErrorEventRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_InsertErrorEventResponse__Output>): grpc.ClientUnaryCall;
  InsertErrorEvent(argument: _day_trader_InsertErrorEventRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertErrorEventResponse__Output>): grpc.ClientUnaryCall;
  InsertErrorEvent(argument: _day_trader_InsertErrorEventRequest, callback: grpc.requestCallback<_day_trader_InsertErrorEventResponse__Output>): grpc.ClientUnaryCall;
  insertErrorEvent(argument: _day_trader_InsertErrorEventRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertErrorEventResponse__Output>): grpc.ClientUnaryCall;
  insertErrorEvent(argument: _day_trader_InsertErrorEventRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_InsertErrorEventResponse__Output>): grpc.ClientUnaryCall;
  insertErrorEvent(argument: _day_trader_InsertErrorEventRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertErrorEventResponse__Output>): grpc.ClientUnaryCall;
  insertErrorEvent(argument: _day_trader_InsertErrorEventRequest, callback: grpc.requestCallback<_day_trader_InsertErrorEventResponse__Output>): grpc.ClientUnaryCall;
  
  InsertQuoteServer(argument: _day_trader_InsertQuoteServerRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertQuoteServerResponse__Output>): grpc.ClientUnaryCall;
  InsertQuoteServer(argument: _day_trader_InsertQuoteServerRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_InsertQuoteServerResponse__Output>): grpc.ClientUnaryCall;
  InsertQuoteServer(argument: _day_trader_InsertQuoteServerRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertQuoteServerResponse__Output>): grpc.ClientUnaryCall;
  InsertQuoteServer(argument: _day_trader_InsertQuoteServerRequest, callback: grpc.requestCallback<_day_trader_InsertQuoteServerResponse__Output>): grpc.ClientUnaryCall;
  insertQuoteServer(argument: _day_trader_InsertQuoteServerRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertQuoteServerResponse__Output>): grpc.ClientUnaryCall;
  insertQuoteServer(argument: _day_trader_InsertQuoteServerRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_InsertQuoteServerResponse__Output>): grpc.ClientUnaryCall;
  insertQuoteServer(argument: _day_trader_InsertQuoteServerRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertQuoteServerResponse__Output>): grpc.ClientUnaryCall;
  insertQuoteServer(argument: _day_trader_InsertQuoteServerRequest, callback: grpc.requestCallback<_day_trader_InsertQuoteServerResponse__Output>): grpc.ClientUnaryCall;
  
  InsertSystemEvent(argument: _day_trader_InsertSystemEventRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertSystemEventResponse__Output>): grpc.ClientUnaryCall;
  InsertSystemEvent(argument: _day_trader_InsertSystemEventRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_InsertSystemEventResponse__Output>): grpc.ClientUnaryCall;
  InsertSystemEvent(argument: _day_trader_InsertSystemEventRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertSystemEventResponse__Output>): grpc.ClientUnaryCall;
  InsertSystemEvent(argument: _day_trader_InsertSystemEventRequest, callback: grpc.requestCallback<_day_trader_InsertSystemEventResponse__Output>): grpc.ClientUnaryCall;
  insertSystemEvent(argument: _day_trader_InsertSystemEventRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertSystemEventResponse__Output>): grpc.ClientUnaryCall;
  insertSystemEvent(argument: _day_trader_InsertSystemEventRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_InsertSystemEventResponse__Output>): grpc.ClientUnaryCall;
  insertSystemEvent(argument: _day_trader_InsertSystemEventRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertSystemEventResponse__Output>): grpc.ClientUnaryCall;
  insertSystemEvent(argument: _day_trader_InsertSystemEventRequest, callback: grpc.requestCallback<_day_trader_InsertSystemEventResponse__Output>): grpc.ClientUnaryCall;
  
  InsertUserCommand(argument: _day_trader_InsertUserCommandRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertUserCommandResponse__Output>): grpc.ClientUnaryCall;
  InsertUserCommand(argument: _day_trader_InsertUserCommandRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_InsertUserCommandResponse__Output>): grpc.ClientUnaryCall;
  InsertUserCommand(argument: _day_trader_InsertUserCommandRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertUserCommandResponse__Output>): grpc.ClientUnaryCall;
  InsertUserCommand(argument: _day_trader_InsertUserCommandRequest, callback: grpc.requestCallback<_day_trader_InsertUserCommandResponse__Output>): grpc.ClientUnaryCall;
  insertUserCommand(argument: _day_trader_InsertUserCommandRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertUserCommandResponse__Output>): grpc.ClientUnaryCall;
  insertUserCommand(argument: _day_trader_InsertUserCommandRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_day_trader_InsertUserCommandResponse__Output>): grpc.ClientUnaryCall;
  insertUserCommand(argument: _day_trader_InsertUserCommandRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_day_trader_InsertUserCommandResponse__Output>): grpc.ClientUnaryCall;
  insertUserCommand(argument: _day_trader_InsertUserCommandRequest, callback: grpc.requestCallback<_day_trader_InsertUserCommandResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface LogHandlers extends grpc.UntypedServiceImplementation {
  DisplaySummary: grpc.handleUnaryCall<_day_trader_DisplaySummaryRequest__Output, _day_trader_DisplaySummaryResponse>;
  
  DumpLog: grpc.handleUnaryCall<_day_trader_DumpLogRequest__Output, _day_trader_DumpLogResponse>;
  
  DumpLogUser: grpc.handleUnaryCall<_day_trader_DumpLogUserRequest__Output, _day_trader_DumpLogUserResponse>;
  
  InsertAccountTransaction: grpc.handleUnaryCall<_day_trader_InsertAccountTransactionRequest__Output, _day_trader_InsertAccountTransactionResponse>;
  
  InsertErrorEvent: grpc.handleUnaryCall<_day_trader_InsertErrorEventRequest__Output, _day_trader_InsertErrorEventResponse>;
  
  InsertQuoteServer: grpc.handleUnaryCall<_day_trader_InsertQuoteServerRequest__Output, _day_trader_InsertQuoteServerResponse>;
  
  InsertSystemEvent: grpc.handleUnaryCall<_day_trader_InsertSystemEventRequest__Output, _day_trader_InsertSystemEventResponse>;
  
  InsertUserCommand: grpc.handleUnaryCall<_day_trader_InsertUserCommandRequest__Output, _day_trader_InsertUserCommandResponse>;
  
}

export interface LogDefinition extends grpc.ServiceDefinition {
  DisplaySummary: MethodDefinition<_day_trader_DisplaySummaryRequest, _day_trader_DisplaySummaryResponse, _day_trader_DisplaySummaryRequest__Output, _day_trader_DisplaySummaryResponse__Output>
  DumpLog: MethodDefinition<_day_trader_DumpLogRequest, _day_trader_DumpLogResponse, _day_trader_DumpLogRequest__Output, _day_trader_DumpLogResponse__Output>
  DumpLogUser: MethodDefinition<_day_trader_DumpLogUserRequest, _day_trader_DumpLogUserResponse, _day_trader_DumpLogUserRequest__Output, _day_trader_DumpLogUserResponse__Output>
  InsertAccountTransaction: MethodDefinition<_day_trader_InsertAccountTransactionRequest, _day_trader_InsertAccountTransactionResponse, _day_trader_InsertAccountTransactionRequest__Output, _day_trader_InsertAccountTransactionResponse__Output>
  InsertErrorEvent: MethodDefinition<_day_trader_InsertErrorEventRequest, _day_trader_InsertErrorEventResponse, _day_trader_InsertErrorEventRequest__Output, _day_trader_InsertErrorEventResponse__Output>
  InsertQuoteServer: MethodDefinition<_day_trader_InsertQuoteServerRequest, _day_trader_InsertQuoteServerResponse, _day_trader_InsertQuoteServerRequest__Output, _day_trader_InsertQuoteServerResponse__Output>
  InsertSystemEvent: MethodDefinition<_day_trader_InsertSystemEventRequest, _day_trader_InsertSystemEventResponse, _day_trader_InsertSystemEventRequest__Output, _day_trader_InsertSystemEventResponse__Output>
  InsertUserCommand: MethodDefinition<_day_trader_InsertUserCommandRequest, _day_trader_InsertUserCommandResponse, _day_trader_InsertUserCommandRequest__Output, _day_trader_InsertUserCommandResponse__Output>
}
