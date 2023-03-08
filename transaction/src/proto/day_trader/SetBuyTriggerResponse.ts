// Original file: ../protos/day-trader.proto


export interface SetBuyTriggerResponse {
  'triggerAmount'?: (number | string);
  'stock'?: (string);
  'success'?: (boolean);
}

export interface SetBuyTriggerResponse__Output {
  'triggerAmount'?: (number);
  'stock'?: (string);
  'success'?: (boolean);
}
