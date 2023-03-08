// Original file: ../protos/day-trader.proto

import type { Long } from '@grpc/proto-loader';

export interface InsertQuoteServerResponse {
  'transactionNum'?: (number);
  'timestamp'?: (number | string | Long);
  'server'?: (string);
  'quoteServerTime'?: (number | string | Long);
  'username'?: (string);
  'stockSymbol'?: (string);
  'price'?: (number | string);
  'cryptoKey'?: (string);
}

export interface InsertQuoteServerResponse__Output {
  'transactionNum'?: (number);
  'timestamp'?: (Long);
  'server'?: (string);
  'quoteServerTime'?: (Long);
  'username'?: (string);
  'stockSymbol'?: (string);
  'price'?: (number);
  'cryptoKey'?: (string);
}
