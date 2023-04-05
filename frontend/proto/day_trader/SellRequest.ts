// Original file: ../protos/day-trader.proto


export interface SellRequest {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number | string);
  'requestNum'?: (number);
}

export interface SellRequest__Output {
  'userId': (string);
  'stockSymbol': (string);
  'amount': (number);
  'requestNum': (number);
}
