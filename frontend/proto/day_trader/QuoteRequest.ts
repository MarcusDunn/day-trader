// Original file: ../protos/day-trader.proto


export interface QuoteRequest {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'requestNum'?: (number);
}

export interface QuoteRequest__Output {
  'userId': (string);
  'stockSymbol': (string);
  'requestNum': (number);
}
