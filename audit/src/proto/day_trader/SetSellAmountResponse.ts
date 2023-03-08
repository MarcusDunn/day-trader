// Original file: ../protos/day-trader.proto


export interface SetSellAmountResponse {
  'currentStockPrice'?: (number | string);
  'numSharesToSell'?: (number | string);
  'success'?: (boolean);
}

export interface SetSellAmountResponse__Output {
  'currentStockPrice'?: (number);
  'numSharesToSell'?: (number);
  'success'?: (boolean);
}
