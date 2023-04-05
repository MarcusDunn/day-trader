// Original file: ../protos/day-trader.proto


export interface SetBuyAmountRequest {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number | string);
  'requestNum'?: (number);
}

export interface SetBuyAmountRequest__Output {
  'userId': (string);
  'stockSymbol': (string);
  'amount': (number);
  'requestNum': (number);
}
