# CLI
A command line interface to interact with the Day-Trader application.

## Usage

Your best bet will be to call `cargo run -- --help` to see the available commands.
```
A command line interface for testing day-trader

Usage: cli [SERVICES_URI] <COMMAND>

Commands:
  add                 Add the given amount of money to the user's account
  quote               Get the current quote for the stock for the specified user
  buy                 Buy the dollar amount of the stock for the specified user at the current price
  commit-buy          Commits the most recently executed BUY command
  cancel-buy          Cancels the most recently executed BUY Command
  sell                Sell the specified dollar mount of the stock currently held by the specified user at the current price
  commit-sell         Commits the most recently executed SELL command
  cancel-sell         Cancels the most recently executed SELL Command
  set-buy-amount      Sets a defined amount of the given stock to buy when the current stock price is less than or equal to the BUY_TRIGGER
  cancel-set-buy      Cancels a SET_BUY command issued for the given stock
  set-buy-trigger     Sets the trigger point base on the current stock price when any SET_BUY will execute
  set-sell-amount     Sets a defined amount of the specified stock to sell when the current stock price is equal or greater than the sell trigger point
  set-sell-trigger    Sets the stock price trigger point for executing any SET_SELL triggers associated with the given stock and user
  cancel-set-sell     Cancels the SET_SELL associated with the given stock and user
  display-summary     Provides a summary to the client of the given user's transaction history and the current status of their accounts as well as any set buy or sell triggers and their parameters
  dump-log-file-name  Print out to the specified file the complete set of transactions that have occurred in the system
  dump-log-user       Print out the history of the users transactions to the user specified file
  file                Run a load test file
  help                Print this message or the help of the given subcommand(s)

Arguments:
  [SERVICES_URI]  The uri of the gRPC services [default: http://localhost:5000]

Options:
  -h, --help     Print help
  -V, --version  Print version
```

## Install

To install on your computer, you can run `cargo install --path cli` from the root of the repository.

You should then be able to run with `cli`
    