// Original file: ../protos/day-trader.proto


export interface InsertErrorEventRequest {
  'server'?: (string);
  'command'?: (string);
  'username'?: (string);
  'stockSymbol'?: (string);
  'funds'?: (number | string);
  'errorMessage'?: (string);
}

export interface InsertErrorEventRequest__Output {
  'server': (string);
  'command': (string);
  'username': (string);
  'stockSymbol': (string);
  'funds': (number);
  'errorMessage': (string);
}
