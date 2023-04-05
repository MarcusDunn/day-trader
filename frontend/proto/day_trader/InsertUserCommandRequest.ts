// Original file: ../protos/day-trader.proto


export interface InsertUserCommandRequest {
  'server'?: (string);
  'command'?: (string);
  'username'?: (string);
  'stockSymbol'?: (string);
  'funds'?: (number | string);
}

export interface InsertUserCommandRequest__Output {
  'server': (string);
  'command': (string);
  'username': (string);
  'stockSymbol': (string);
  'funds': (number);
}
