// Original file: ../protos/day-trader.proto

import type { Long } from '@grpc/proto-loader';

export interface InsertQuoteServerRequest {
  'server'?: (string);
  'quoteServerTime'?: (number | string | Long);
  'username'?: (string);
  'stockSymbol'?: (string);
  'price'?: (number | string);
  'cryptokey'?: (string);
}

export interface InsertQuoteServerRequest__Output {
  'server'?: (string);
  'quoteServerTime'?: (Long);
  'username'?: (string);
  'stockSymbol'?: (string);
  'price'?: (number);
  'cryptokey'?: (string);
}
