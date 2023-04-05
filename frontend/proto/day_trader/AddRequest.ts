// Original file: ../protos/day-trader.proto


export interface AddRequest {
  'userId'?: (string);
  'amount'?: (number | string);
  'requestNum'?: (number);
}

export interface AddRequest__Output {
  'userId': (string);
  'amount': (number);
  'requestNum': (number);
}
