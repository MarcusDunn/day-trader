// Original file: ../protos/day-trader.proto


export interface SellResponse {
  'amount'?: (number | string);
  'shares'?: (number | string);
  'success'?: (boolean);
}

export interface SellResponse__Output {
  'amount'?: (number);
  'shares'?: (number);
  'success'?: (boolean);
}
