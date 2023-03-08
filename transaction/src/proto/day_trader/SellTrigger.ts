// Original file: ../protos/day-trader.proto


export interface SellTrigger {
  'id'?: (number);
  'username'?: (string);
  'stock'?: (string);
  'triggerAmount'?: (number | string);
  'sharesToSell'?: (number | string);
}

export interface SellTrigger__Output {
  'id'?: (number);
  'username'?: (string);
  'stock'?: (string);
  'triggerAmount'?: (number);
  'sharesToSell'?: (number);
}
