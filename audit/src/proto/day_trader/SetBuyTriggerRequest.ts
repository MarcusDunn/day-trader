// Original file: ../protos/day-trader.proto


export interface SetBuyTriggerRequest {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number | string);
}

export interface SetBuyTriggerRequest__Output {
  'userId'?: (string);
  'stockSymbol'?: (string);
  'amount'?: (number);
}
