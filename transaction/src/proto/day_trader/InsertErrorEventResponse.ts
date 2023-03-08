// Original file: ../protos/day-trader.proto

import type { Long } from '@grpc/proto-loader';

export interface InsertErrorEventResponse {
  'transactionNum'?: (number);
  'timestamp'?: (number | string | Long);
  'server'?: (string);
  'command'?: (string);
  'username'?: (string);
  'stockSymbol'?: (string);
  'funds'?: (number | string);
  'errorMessage'?: (string);
}

export interface InsertErrorEventResponse__Output {
  'transactionNum'?: (number);
  'timestamp'?: (Long);
  'server'?: (string);
  'command'?: (string);
  'username'?: (string);
  'stockSymbol'?: (string);
  'funds'?: (number);
  'errorMessage'?: (string);
}
