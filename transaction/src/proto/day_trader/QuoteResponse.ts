// Original file: ../protos/day-trader.proto

import type { Long } from '@grpc/proto-loader';

export interface QuoteResponse {
  'quote'?: (number | string);
  'sym'?: (string);
  'userId'?: (string);
  'timestamp'?: (number | string | Long);
  'cryptoKey'?: (string);
}

export interface QuoteResponse__Output {
  'quote'?: (number);
  'sym'?: (string);
  'userId'?: (string);
  'timestamp'?: (Long);
  'cryptoKey'?: (string);
}
