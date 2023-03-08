// Original file: ../protos/day-trader.proto


export interface InsertSystemEventRequest {
  'server'?: (string);
  'command'?: (string);
  'username'?: (string);
  'stockSymbol'?: (string);
  'funds'?: (number | string);
}

export interface InsertSystemEventRequest__Output {
  'server'?: (string);
  'command'?: (string);
  'username'?: (string);
  'stockSymbol'?: (string);
  'funds'?: (number);
}
