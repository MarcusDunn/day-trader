// Original file: ../protos/day-trader.proto


export interface BuyTrigger {
  'id'?: (number);
  'username'?: (string);
  'stock'?: (string);
  'triggerAmount'?: (number | string);
  'buyAmount'?: (number | string);
}

export interface BuyTrigger__Output {
  'id'?: (number);
  'username'?: (string);
  'stock'?: (string);
  'triggerAmount'?: (number);
  'buyAmount'?: (number);
}
