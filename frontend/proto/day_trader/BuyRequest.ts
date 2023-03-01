// Original file: ../protos/day-trader.proto


export interface BuyRequest {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number | string);
}

export interface BuyRequest__Output {
  'userId': (string);
  'stockSymbol': (string);
  'amount': (number);
}
