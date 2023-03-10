// Original file: ../protos/day-trader.proto


export interface SetSellTriggerRequest {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number | string);
}

export interface SetSellTriggerRequest__Output {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number);
}
