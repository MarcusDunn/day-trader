// Original file: ../protos/day-trader.proto


export interface SellTrigger {
  'username'?: (string);
  'stock'?: (string);
  'triggerAmount'?: (number | string);
  'sharesToSell'?: (number | string);
}

export interface SellTrigger__Output {
  'username': (string);
  'stock': (string);
  'triggerAmount': (number);
  'sharesToSell': (number);
}
