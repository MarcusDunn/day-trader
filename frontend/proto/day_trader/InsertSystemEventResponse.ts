// Original file: ../protos/day-trader.proto

import type { Long } from '@grpc/proto-loader';

export interface InsertSystemEventResponse {
  'transactionNum'?: (number);
  'timestamp'?: (number | string | Long);
  'server'?: (string);
  'command'?: (string);
  'username'?: (string);
  'stockSymbol'?: (string);
  'funds'?: (number | string);
}

export interface InsertSystemEventResponse__Output {
  'transactionNum': (number);
  'timestamp': (string);
  'server': (string);
  'command': (string);
  'username': (string);
  'stockSymbol': (string);
  'funds': (number);
}
