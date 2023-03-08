// Original file: ../protos/day-trader.proto


export interface CommitSellResponse {
  'stocksOwned'?: (number | string);
  'balance'?: (number | string);
  'success'?: (boolean);
}

export interface CommitSellResponse__Output {
  'stocksOwned'?: (number);
  'balance'?: (number);
  'success'?: (boolean);
}
