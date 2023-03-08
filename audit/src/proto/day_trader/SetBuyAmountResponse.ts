// Original file: ../protos/day-trader.proto


export interface SetBuyAmountResponse {
  'balance'?: (number | string);
  'buyAmount'?: (number | string);
  'success'?: (boolean);
}

export interface SetBuyAmountResponse__Output {
  'balance'?: (number);
  'buyAmount'?: (number);
  'success'?: (boolean);
}
