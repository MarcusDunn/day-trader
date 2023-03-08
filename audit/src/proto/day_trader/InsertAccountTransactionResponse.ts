// Original file: ../protos/day-trader.proto

import type { Long } from '@grpc/proto-loader';

export interface InsertAccountTransactionResponse {
  'transactionNum'?: (number);
  'timestamp'?: (number | string | Long);
  'server'?: (string);
  'action'?: (string);
  'username'?: (string);
  'funds'?: (number | string);
}

export interface InsertAccountTransactionResponse__Output {
  'transactionNum'?: (number);
  'timestamp'?: (Long);
  'server'?: (string);
  'action'?: (string);
  'username'?: (string);
  'funds'?: (number);
}
