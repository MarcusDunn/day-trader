export const NewLogs = [
    {
        "type": "userCommand",
        "timestamp": 1167631200000,
        "server": "CLT1",
        "transactionNum": 1,
        "command": "ADD",
        "username": "jiosesdo",
        "funds": 100
    },
    {
        "type": "userCommand",
        "timestamp": 1167631201000,
        "server": "CLT1",
        "transactionNum": 2,
        "command": "BUY",
        "username": "jiosesdo",
        "stockSymbol": "ABC",
        "funds": 100
    },
    {
        "type": "userCommand",
        "timestamp": 1167631205000,
        "server": "CLT2",
        "transactionNum": 3,
        "command": "BUY",
        "username": "skelsioe",
        "stockSymbol": "DEF",
        "funds": 1000
    },
    {
        "type": "userCommand",
        "timestamp": 1167631205200,
        "server": "CLT2",
        "transactionNum": 4,
        "command": "SELL",
        "username": "bob",
        "stockSymbol": "GHI",
        "funds": 1000
    },
    {
        "type": "accountTransaction",
        "timestamp": 1167631200200,
        "server": "CLT2",
        "transactionNum": 1,
        "action": "add",
        "username": "jiosesdo",
        "funds": 100
    },
    {
        "type": "accountTransaction",
        "timestamp": 1167631204000,
        "server": "CLT2",
        "transactionNum": 2,
        "action": "remove",
        "username": "jiosesdo",
        "funds": 100
    },
    {
        "type": "systemEvent",
        "timestamp": 1167631202000,
        "server": "HSD1",
        "transactionNum": 2,
        "command": "BUY",
        "username": "jiosesdo",
        "stockSymbol": "ABC",
        "funds": 100
    },
    {
        "type": "quoteServer",
        "timestamp": 1167631203000,
        "server": "QSRV1",
        "transactionNum": 2,
        "quoteServerTime": 1167631203000,
        "username": "jiosesdo",
        "stockSymbol": "ABC",
        "price": 10,
        "cryptokey": "IRrR7UeTO35kSWUgG0QJKmB35sL27FKM7AVhP5qpjCgmWQeXFJs35g=="
    },
    {
        "type": "errorEvent",
        "timestamp": 1167631206000,
        "server": "CLT2",
        "transactionNum": 4,
        "command": "SELL",
        "username": "bob",
        "stockSymbol": "GHI",
        "funds": 1000,
        "errorMessage": "Account bob does not exist"
    }
]