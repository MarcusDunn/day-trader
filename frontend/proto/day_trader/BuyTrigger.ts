// Original file: ../protos/day-trader.proto


export interface BuyTrigger {
  'username'?: (string);
  'stock'?: (string);
  'triggerAmount'?: (number | string);
  'buyAmount'?: (number | string);
}

export interface BuyTrigger__Output {
  'username': (string);
  'stock': (string);
  'triggerAmount': (number);
  'buyAmount': (number);
}
