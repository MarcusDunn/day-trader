use crate::command::add::LoadTestAdd;
use crate::command::command_user_id_file_name::LoadTestDumpLogUserIdFileName;
use crate::command::dump_log::{DumpLog, LoadTestDumpLogFileName};
use crate::command::user_id::LoadTestUserIdCommand;
use crate::command::user_id_stock_symbol::LoadTestUserIdStockSymbolCommand;
use crate::command::user_id_stock_symbol_amount_created::LoadTestUserIdStockSymbolAmountCommand;
use crate::services::DayTraderServicesStack;
use crate::ParseLoadTestCommandError;
use tonic::Status;
use tracing::debug;

pub mod add;
pub mod command_user_id_file_name;
pub mod dump_log;
pub mod user_id;
pub mod user_id_stock_symbol;
pub mod user_id_stock_symbol_amount_created;

#[derive(PartialEq, Debug, clap::Subcommand, Clone)]
pub enum LoadTestCommand {
    /// Add the given amount of money to the user's account
    Add(LoadTestAdd),
    /// Get the current quote for the stock for the specified user
    Quote(LoadTestUserIdStockSymbolCommand),
    /// Buy the dollar amount of the stock for the specified user at the current price.
    Buy(LoadTestUserIdStockSymbolAmountCommand),
    /// Commits the most recently executed BUY command
    CommitBuy(LoadTestUserIdCommand),
    /// Cancels the most recently executed BUY Command
    CancelBuy(LoadTestUserIdCommand),
    /// Sell the specified dollar mount of the stock currently held by the specified user at the current price.
    Sell(LoadTestUserIdStockSymbolAmountCommand),
    /// Commits the most recently executed SELL command
    CommitSell(LoadTestUserIdCommand),
    /// Cancels the most recently executed SELL Command
    CancelSell(LoadTestUserIdCommand),
    /// Sets a defined amount of the given stock to buy when the current stock price is less than or equal to the BUY_TRIGGER
    SetBuyAmount(LoadTestUserIdStockSymbolAmountCommand),
    /// Cancels a SET_BUY command issued for the given stock
    CancelSetBuy(LoadTestUserIdStockSymbolCommand),
    /// Sets the trigger point base on the current stock price when any SET_BUY will execute.
    SetBuyTrigger(LoadTestUserIdStockSymbolAmountCommand),
    /// Sets a defined amount of the specified stock to sell when the current stock price is equal or greater than the sell trigger point
    SetSellAmount(LoadTestUserIdStockSymbolAmountCommand),
    /// Sets the stock price trigger point for executing any SET_SELL triggers associated with the given stock and user
    SetSellTrigger(LoadTestUserIdStockSymbolAmountCommand),
    /// Cancels the SET_SELL associated with the given stock and user
    CancelSetSell(LoadTestUserIdStockSymbolCommand),
    /// Provides a summary to the client of the given user's transaction history and the current status of their accounts as well as any set buy or sell triggers and their parameters
    DisplaySummary(LoadTestUserIdCommand),
    /// Print out to the specified file the complete set of transactions that have occurred in the system.
    DumpLogFileName(LoadTestDumpLogFileName),
    /// Print out the history of the users transactions to the user specified file
    DumpLogUser(LoadTestDumpLogUserIdFileName),
}

impl LoadTestCommand {
    pub fn user(&self) -> Option<String> {
        match self {
            LoadTestCommand::Add(LoadTestAdd { user_id, .. }) => Some(user_id.clone()),
            LoadTestCommand::Quote(LoadTestUserIdStockSymbolCommand { user_id, .. }) => {
                Some(user_id.clone())
            }
            LoadTestCommand::Buy(LoadTestUserIdStockSymbolAmountCommand { user_id, .. }) => {
                Some(user_id.clone())
            }
            LoadTestCommand::CommitBuy(LoadTestUserIdCommand { user_id, .. }) => {
                Some(user_id.clone())
            }
            LoadTestCommand::CancelBuy(LoadTestUserIdCommand { user_id, .. }) => {
                Some(user_id.clone())
            }
            LoadTestCommand::Sell(LoadTestUserIdStockSymbolAmountCommand { user_id, .. }) => {
                Some(user_id.clone())
            }
            LoadTestCommand::CommitSell(LoadTestUserIdCommand { user_id, .. }) => {
                Some(user_id.clone())
            }
            LoadTestCommand::CancelSell(LoadTestUserIdCommand { user_id, .. }) => {
                Some(user_id.clone())
            }
            LoadTestCommand::SetBuyAmount(LoadTestUserIdStockSymbolAmountCommand {
                user_id,
                ..
            }) => Some(user_id.clone()),
            LoadTestCommand::CancelSetBuy(LoadTestUserIdStockSymbolCommand { user_id, .. }) => {
                Some(user_id.clone())
            }
            LoadTestCommand::SetBuyTrigger(LoadTestUserIdStockSymbolAmountCommand {
                user_id,
                ..
            }) => Some(user_id.clone()),
            LoadTestCommand::SetSellAmount(LoadTestUserIdStockSymbolAmountCommand {
                user_id,
                ..
            }) => Some(user_id.clone()),
            LoadTestCommand::SetSellTrigger(LoadTestUserIdStockSymbolAmountCommand {
                user_id,
                ..
            }) => Some(user_id.clone()),
            LoadTestCommand::CancelSetSell(LoadTestUserIdStockSymbolCommand {
                user_id, ..
            }) => Some(user_id.clone()),
            LoadTestCommand::DisplaySummary(LoadTestUserIdCommand { user_id, .. }) => {
                Some(user_id.clone())
            }
            LoadTestCommand::DumpLogFileName(_) => None,
            LoadTestCommand::DumpLogUser(LoadTestDumpLogUserIdFileName { user_id, .. }) => {
                Some(user_id.clone())
            }
        }
    }

    pub async fn execute(self, client: &mut DayTraderServicesStack) -> Result<(), Status> {
        match self {
            LoadTestCommand::Add(add) => client
                .day_trader
                .add(add)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::Quote(quote) => client
                .quote
                .quote(quote)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::Buy(buy) => client
                .day_trader
                .buy(buy)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::CommitBuy(commit_buy) => client
                .day_trader
                .commit_buy(commit_buy)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::CommitSell(commit_sell) => client
                .day_trader
                .commit_sell(commit_sell)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::CancelSell(cancel_sell) => client
                .day_trader
                .cancel_sell(cancel_sell)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::DisplaySummary(display_summary) => client
                .day_trader
                .display_summary(display_summary)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::CancelBuy(cancel_buy) => client
                .day_trader
                .cancel_buy(cancel_buy)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::CancelSetBuy(cancel_set_buy) => client
                .day_trader
                .cancel_set_buy(cancel_set_buy)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::SetBuyAmount(set_buy_amount) => client
                .day_trader
                .set_buy_amount(set_buy_amount)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::Sell(sell) => client
                .day_trader
                .sell(sell)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::CancelSetSell(cancel_set_sell) => client
                .day_trader
                .cancel_set_sell(cancel_set_sell)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::SetSellTrigger(set_sell_trigger) => client
                .day_trader
                .set_sell_trigger(set_sell_trigger)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::SetSellAmount(set_sell_amount) => client
                .day_trader
                .set_sell_amount(set_sell_amount)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::DumpLogFileName(dump_log) => client
                .day_trader
                .dump_log(dump_log)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::SetBuyTrigger(set_buy_trigger) => client
                .day_trader
                .set_buy_trigger(set_buy_trigger)
                .await
                .map(|resp| debug!("{resp:?}")),
            LoadTestCommand::DumpLogUser(dump_log_user) => client
                .day_trader
                .dump_log_user(dump_log_user)
                .await
                .map(|resp| debug!("{resp:?}")),
        }
    }
}

impl TryFrom<&str> for LoadTestCommand {
    type Error = ParseLoadTestCommandError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        use LoadTestCommand::*;
        use ParseLoadTestCommandError::*;
        let (request_num, rest) = value.split_once(' ').ok_or_else(|| MissingSpace {
            value: value.to_string(),
        })?;
        
        let request_num = request_num.replace(&['[', ']'], "");
        
        let request_num: i32 = request_num.parse().map_err(|err| {
            InvalidRequestNum {
                value: request_num,
                reason: err,
            }
        })?;
        let mut iter = rest.split(',');
        Ok(
            match iter.next().ok_or_else(|| MissingCommand {
                value: value.to_string(),
            })? {
                "ADD" => {
                    Add(
                        LoadTestAdd::try_from((request_num, iter)).map_err(|reason| CommandParseFailure {
                            command: "ADD".to_string(),
                            value: value.to_string(),
                            reason,
                        })?,
                    )
                }
                str @ ("QUOTE" | "CANCEL_SET_BUY" | "CANCEL_SET_SELL") => {
                    let cmd =
                        LoadTestUserIdStockSymbolCommand::try_from((request_num, iter)).map_err(|reason| {
                            CommandParseFailure {
                                command: str.to_string(),
                                value: value.to_string(),
                                reason,
                            }
                        })?;
                    match str {
                        "QUOTE" => Quote(cmd),
                        "CANCEL_SET_BUY" => CancelSetBuy(cmd),
                        "CANCEL_SET_SELL" => CancelSetSell(cmd),
                        _ => unreachable!(),
                    }
                }
                str @ ("BUY" | "SELL" | "SET_BUY_AMOUNT" | "SET_SELL_TRIGGER"
                | "SET_SELL_AMOUNT" | "SET_BUY_TRIGGER") => {
                    let cmd = LoadTestUserIdStockSymbolAmountCommand::try_from((request_num, iter)).map_err(
                        |reason| CommandParseFailure {
                            command: str.to_string(),
                            value: value.to_string(),
                            reason,
                        },
                    )?;
                    match str {
                        "BUY" => Buy(cmd),
                        "SET_BUY_AMOUNT" => SetBuyAmount(cmd),
                        "SELL" => Sell(cmd),
                        "SET_SELL_TRIGGER" => SetSellTrigger(cmd),
                        "SET_BUY_TRIGGER" => SetBuyTrigger(cmd),
                        "SET_SELL_AMOUNT" => SetSellAmount(cmd),
                        _ => unreachable!(),
                    }
                }
                str @ ("COMMIT_BUY" | "COMMIT_SELL" | "CANCEL_SELL" | "DISPLAY_SUMMARY"
                | "CANCEL_BUY") => {
                    let cmd = LoadTestUserIdCommand::try_from((request_num, iter)).map_err(|reason| {
                        CommandParseFailure {
                            command: str.to_string(),
                            value: value.to_string(),
                            reason,
                        }
                    })?;
                    match str {
                        "COMMIT_BUY" => CommitBuy(cmd),
                        "COMMIT_SELL" => CommitSell(cmd),
                        "CANCEL_SELL" => CancelSell(cmd),
                        "DISPLAY_SUMMARY" => DisplaySummary(cmd),
                        "CANCEL_BUY" => CancelBuy(cmd),
                        _ => unreachable!(),
                    }
                }
                "DUMPLOG" => {
                    let cmd = DumpLog::try_from((request_num, iter)).map_err(|reason| CommandParseFailure {
                        command: "DUMPLOG".to_string(),
                        value: value.to_string(),
                        reason,
                    })?;
                    match cmd {
                        DumpLog::User(user) => DumpLogUser(user),
                        DumpLog::NoUser(no_user) => DumpLogFileName(no_user),
                    }
                }
                command => {
                    return Err(UnknownCommand {
                        command: command.to_string(),
                        value: value.to_string(),
                    });
                }
            },
        )
    }
}
