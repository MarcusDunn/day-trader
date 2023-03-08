// Original file: ../protos/day-trader.proto


export interface SetBuyAmountRequest {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number | string);
}

export interface SetBuyAmountRequest__Output {
  'userId': (string);
  'stockSymbol': (string);
  'amount': (number);
}
