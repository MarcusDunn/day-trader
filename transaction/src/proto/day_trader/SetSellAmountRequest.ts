// Original file: ../protos/day-trader.proto


export interface SetSellAmountRequest {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number | string);
}

export interface SetSellAmountRequest__Output {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number);
}
