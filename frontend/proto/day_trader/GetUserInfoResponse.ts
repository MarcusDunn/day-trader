// Original file: ../protos/day-trader.proto

import type { Stock as _day_trader_Stock, Stock__Output as _day_trader_Stock__Output } from '../day_trader/Stock';
import type { SellTrigger as _day_trader_SellTrigger, SellTrigger__Output as _day_trader_SellTrigger__Output } from '../day_trader/SellTrigger';
import type { BuyTrigger as _day_trader_BuyTrigger, BuyTrigger__Output as _day_trader_BuyTrigger__Output } from '../day_trader/BuyTrigger';

export interface GetUserInfoResponse {
  'balance'?: (number | string);
  'stock'?: (_day_trader_Stock)[];
  'SellTriggers'?: (_day_trader_SellTrigger)[];
  'BuyTriggers'?: (_day_trader_BuyTrigger)[];
}

export interface GetUserInfoResponse__Output {
  'balance': (number);
  'stock': (_day_trader_Stock__Output)[];
  'SellTriggers': (_day_trader_SellTrigger__Output)[];
  'BuyTriggers': (_day_trader_BuyTrigger__Output)[];
}
