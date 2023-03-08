// Original file: ../protos/day-trader.proto


export interface InsertQuoteServerRequest {
  'server'?: (string);
  'quoteServerTime'?: (number);
  'username'?: (string);
  'stockSymbol'?: (string);
  'price'?: (number | string);
  'cryptokey'?: (string);
}

export interface InsertQuoteServerRequest__Output {
  'server'?: (string);
  'quoteServerTime'?: (number);
  'username'?: (string);
  'stockSymbol'?: (string);
  'price'?: (number);
  'cryptokey'?: (string);
}
