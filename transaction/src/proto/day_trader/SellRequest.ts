// Original file: ../protos/day-trader.proto


export interface SellRequest {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number | string);
}

export interface SellRequest__Output {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number);
}
