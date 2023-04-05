// Original file: ../protos/day-trader.proto

import type { Stock as _day_trader_Stock, Stock__Output as _day_trader_Stock__Output } from '../day_trader/Stock';

export interface GetAllStocksResponse {
  'stocks'?: (_day_trader_Stock)[];
}

export interface GetAllStocksResponse__Output {
  'stocks': (_day_trader_Stock__Output)[];
}
