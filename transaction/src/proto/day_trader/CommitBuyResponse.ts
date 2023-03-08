// Original file: ../protos/day-trader.proto


export interface CommitBuyResponse {
  'stocksOwned'?: (number | string);
  'balance'?: (number | string);
  'success'?: (boolean);
}

export interface CommitBuyResponse__Output {
  'stocksOwned'?: (number);
  'balance'?: (number);
  'success'?: (boolean);
}
