import * as grpc from '@grpc/grpc-js';
import {loadSync} from "@grpc/proto-loader";

const def = loadSync("/Users/PeterWilson/Source/day-trader/frontend/clients/day-trader.proto")
const definitions = grpc.loadPackageDefinition(def)
const DayTraderClient = new definitions.day_trader.DayTrader(process.env.transactionURI || 'localhost:8000', grpc.credentials.createInsecure());


export function Add(userId, amount, requestNum) {
    return new Promise((accept, reject) => {
        new DayTraderClient.Add({userId, amount, requestNum}, (err, value) => {
            if (err != null) {
                accept(value)
            } else {
                reject(err)
            }
        })
    })
}

// export function Buy(userId, stockSymbol, amount, requestNum) {
//     return new Promise((accept, reject) => {
//         new DayTraderClient.Buy({userId, stockSymbol, amount, requestNum}, (err, value) => {
//             if (err != null) {
//                 accept(value)
//             } else {
//                 reject(err)
//             }
//         })
//     })
// }

// export function CommitBuy(userId, requestNum) {
//     return new Promise((accept, reject) => {
//         new DayTraderClient.CommitBuy({userId, requestNum}, (err, value) => {
//             if (err != null) {
//                 accept(value)
//             } else {
//                 reject(err)
//             }
//         })
//     })
// }

// export function CancelBuy(userId, requestNum) {
//     return new Promise((accept, reject) => {
//         new DayTraderClient.CancelBuy({userId, requestNum}, (err, value) => {
//             if (err != null) {
//                 accept(value)
//             } else {
//                 reject(err)
//             }
//         })
//     })
// }

// export function Sell(userId, stockSymbol, amount, requestNum) {
//     return new Promise((accept, reject) => {
//         new DayTraderClient.Sell({userId, amount, stockSymbol, requestNum}, (err, value) => {
//             if (err != null) {
//                 accept(value)
//             } else {
//                 reject(err)
//             }
//         })
//     })
// }

// export function CommitSell(userId, requestNum) {
//     return new Promise((accept, reject) => {
//         new DayTraderClient.CommitSell({userId, requestNum}, (err, value) => {
//             if (err != null) {
//                 accept(value)
//             } else {
//                 reject(err)
//             }
//         })
//     })
// }

// export function CancelSell(userId, requestNum) {
//     return new Promise((accept, reject) => {
//         new DayTraderClient.CancelSell({userId, requestNum}, (err, value) => {
//             if (err != null) {
//                 accept(value)
//             } else {
//                 reject(err)
//             }
//         })
//     })
// }

// export function DumpLogUser(userId, filename, requestNum) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.DumpLogUser({ userId, filename, requestNum }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

// export function DumpLog(filename, requestNum) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.DumpLog({ filename, requestNum }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

// export function DisplaySummary(userId, requestNum) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.DisplaySummary({ userId, requestNum }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

// export function SetBuyAmount(userId, stockSymbol, amount, requestNum) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.SetBuyAmount({ userId, stockSymbol, amount, requestNum }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

// export function CancelSetBuy(userId, stockSymbol, requestNum) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.CancelSetBuy({ userId, stockSymbol, requestNum }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

// export function SetBuyTrigger(userId, stockSymbol, amount, requestNum) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.SetBuyTrigger({ userId, stockSymbol, amount, requestNum }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

// export function SetSellAmount(userId, stockSymbol, amount, requestNum) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.SetSellAmount({ userId, stockSymbol, amount, requestNum }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

// export function SetSellTrigger(userId, stockSymbol, amount, requestNum) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.SetSellTrigger({ userId, stockSymbol, amount, requestNum }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
//     }

// export function CancelSetSell(userId, stockSymbol, requestNum) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.CancelSetSell({ userId, stockSymbol, requestNum }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

// export function GetAllStocks() {
//     return new Promise((accept, reject) => {
//         DayTraderClient.GetAllStocks({}, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

// export function GetUserInfo(userId) {
//     return new Promise((accept, reject) => {
//       DayTraderClient.GetUserInfo({ userId }, (err, value) => {
//         if (err == null) {
//           accept(value);
//         } else {
//           reject(err);
//         }
//       });
//     });
//   }
  
// export function Login(userId) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.Login({ userId }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

// export function Quote(userId, stockSymbol, requestNum) {
//     return new Promise((accept, reject) => {
//         DayTraderClient.Quote({ userId, stockSymbol, requestNum }, (err, value) => {
//         if (err == null) {
//             accept(value);
//         } else {
//             reject(err);
//         }
//         });
//     });
// }

  