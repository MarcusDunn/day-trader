// Original file: ../protos/day-trader.proto


export interface InsertAccountTransactionRequest {
  'server'?: (string);
  'action'?: (string);
  'username'?: (string);
  'funds'?: (number | string);
}

export interface InsertAccountTransactionRequest__Output {
  'server': (string);
  'action': (string);
  'username': (string);
  'funds': (number);
}
