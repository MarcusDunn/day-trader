// Original file: ../protos/day-trader.proto

import type { UserCommand as _day_trader_UserCommand, UserCommand__Output as _day_trader_UserCommand__Output } from '../day_trader/UserCommand';
import type { AccountTransaction as _day_trader_AccountTransaction, AccountTransaction__Output as _day_trader_AccountTransaction__Output } from '../day_trader/AccountTransaction';

export interface DisplaySummaryResponse {
  'userCommands'?: (_day_trader_UserCommand)[];
  'accountTransactions'?: (_day_trader_AccountTransaction)[];
}

export interface DisplaySummaryResponse__Output {
  'userCommands'?: (_day_trader_UserCommand__Output)[];
  'accountTransactions'?: (_day_trader_AccountTransaction__Output)[];
}
