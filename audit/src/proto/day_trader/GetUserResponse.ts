// Original file: ../protos/day-trader.proto

import type { OwnedStock as _day_trader_OwnedStock, OwnedStock__Output as _day_trader_OwnedStock__Output } from '../day_trader/OwnedStock';
import type { BuyTrigger as _day_trader_BuyTrigger, BuyTrigger__Output as _day_trader_BuyTrigger__Output } from '../day_trader/BuyTrigger';
import type { SellTrigger as _day_trader_SellTrigger, SellTrigger__Output as _day_trader_SellTrigger__Output } from '../day_trader/SellTrigger';

export interface GetUserResponse {
  'username'?: (string);
  'balance'?: (number | string);
  'role'?: (string);
  'success'?: (boolean);
  'ownedStock'?: (_day_trader_OwnedStock)[];
  'buyTriggers'?: (_day_trader_BuyTrigger)[];
  'sellTriggers'?: (_day_trader_SellTrigger)[];
}

export interface GetUserResponse__Output {
  'username'?: (string);
  'balance'?: (number);
  'role'?: (string);
  'success'?: (boolean);
  'ownedStock'?: (_day_trader_OwnedStock__Output)[];
  'buyTriggers'?: (_day_trader_BuyTrigger__Output)[];
  'sellTriggers'?: (_day_trader_SellTrigger__Output)[];
}
