// Original file: ../protos/day-trader.proto

import type { Long } from '@grpc/proto-loader';

export interface AccountTransaction {
  'transactionNum'?: (number);
  'timestamp'?: (number | string | Long);
  'server'?: (string);
  'action'?: (string);
  'username'?: (string);
  'funds'?: (number | string);
}

export interface AccountTransaction__Output {
  'transactionNum': (number);
  'timestamp': (string);
  'server': (string);
  'action': (string);
  'username': (string);
  'funds': (number);
}
