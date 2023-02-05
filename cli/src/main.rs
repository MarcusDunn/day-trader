use crate::CommandParseFailure::{FloatParseError, MissingArgs};
use clap::Parser;
use cli::log_client::LogClient;
use cli::quote_client::QuoteClient;
use cli::transaction_client::TransactionClient;
use cli::trigger_client::TriggerClient;
use cli::{
    AddRequest, BuyRequest, CancelBuyRequest, CancelSellRequest, CancelSetBuyRequest,
    CancelSetSellRequest, CommitBuyRequest, CommitSellRequest, DisplaySummaryRequest,
    DumplogRequest, DumplogUserRequest, QuoteRequest, SellRequest, SetBuyAmountRequest,
    SetBuyTriggerRequest, SetSellAmountRequest, SetSellTriggerRequest,
};
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::num::ParseFloatError;
use std::path::PathBuf;
use std::str::Split;
use tokio::task::JoinSet;
use tonic::transport::Uri;
use tonic::{IntoRequest, Request, Status};

#[derive(clap::Parser, Debug, PartialEq)]
#[command(author, version, about, long_about = None)]
struct CliArgs {
    /// The uri of the gRPC services.
    #[arg(default_value_t = String::from("http://localhost:5000"))]
    services_uri: String,
    #[command(subcommand)]
    command: CliCommand,
}

#[derive(clap::Subcommand, Clone, Debug, PartialEq)]
enum CliCommand {
    #[command(flatten)]
    Single(LoadTestCommand),
    /// Run a load test file.
    File { file: PathBuf },
}

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    let args = CliArgs::parse();

    let commands = match args.command {
        CliCommand::File { file } => BufReader::new(File::open(file)?)
            .lines()
            .map(|line| line.map_err(|err| anyhow::anyhow!(err)))
            .map(|line| {
                line.and_then(|line| {
                    LoadTestCommand::try_from(line.trim()).map_err(|err| anyhow::anyhow!(err))
                })
            })
            .collect::<Result<Vec<_>, _>>()?,
        CliCommand::Single(single) => vec![single],
    };

    let channel = tonic::transport::Channel::builder(Uri::try_from(args.services_uri)?)
        .connect()
        .await?;

    let stack = DayTraderServicesStack {
        quote: QuoteClient::new(channel.clone()),
        log: LogClient::new(channel.clone()),
        transaction: TransactionClient::new(channel.clone()),
        trigger: TriggerClient::new(channel),
    };

    let mut join_set = JoinSet::new();
    for command in commands {
        let stack = stack.clone();
        join_set.spawn(async {
            if let Err(err) = command.execute(stack).await {
                println!("Error: {err}");
            }
        });
    }

    Ok(())
}

#[derive(Clone)]
struct DayTraderServicesStack {
    quote: QuoteClient<tonic::transport::Channel>,
    log: LogClient<tonic::transport::Channel>,
    transaction: TransactionClient<tonic::transport::Channel>,
    trigger: TriggerClient<tonic::transport::Channel>,
}

trait DayTraderCall {
    type Response;
    fn execute(client: DayTraderServicesStack) -> Self::Response;
}

#[derive(PartialEq, Debug, clap::Subcommand, Clone)]
enum LoadTestCommand {
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
    DumpLogFileName(LoadTestDumpLog),
    /// Print out the history of the users transactions to the user specified file
    DumpLogUser(LoadTestDumpLogUserIdFileName),
}

impl LoadTestCommand {
    async fn execute(self, mut client: DayTraderServicesStack) -> Result<(), Status> {
        match self {
            LoadTestCommand::Add(add) => client.transaction.add(add).await.map(|ok| {
                println!("{ok:?}");
            }),
            LoadTestCommand::Quote(quote) => client.quote.quote(quote).await.map(|ok| {
                println!("{ok:?}");
            }),
            LoadTestCommand::Buy(buy) => client.transaction.buy(buy).await.map(|ok| {
                println!("{ok:?}");
            }),
            LoadTestCommand::CommitBuy(commit_buy) => {
                client.transaction.commit_buy(commit_buy).await.map(|ok| {
                    println!("{ok:?}");
                })
            }
            LoadTestCommand::CommitSell(commit_sell) => {
                client.transaction.commit_sell(commit_sell).await.map(|ok| {
                    println!("{ok:?}");
                })
            }
            LoadTestCommand::CancelSell(cancel_sell) => {
                client.transaction.cancel_sell(cancel_sell).await.map(|ok| {
                    println!("{ok:?}");
                })
            }
            LoadTestCommand::DisplaySummary(display_summary) => {
                client.log.display_summary(display_summary).await.map(|ok| {
                    println!("{ok:?}");
                })
            }
            LoadTestCommand::CancelBuy(cancel_buy) => {
                client.transaction.cancel_buy(cancel_buy).await.map(|ok| {
                    println!("{ok:?}");
                })
            }
            LoadTestCommand::CancelSetBuy(cancel_set_buy) => client
                .trigger
                .cancel_set_buy(cancel_set_buy)
                .await
                .map(|ok| {
                    println!("{ok:?}");
                }),
            LoadTestCommand::SetBuyAmount(set_buy_amount) => client
                .trigger
                .set_buy_amount(set_buy_amount)
                .await
                .map(|ok| {
                    println!("{ok:?}");
                }),
            LoadTestCommand::Sell(sell) => client.transaction.sell(sell).await.map(|ok| {
                println!("{ok:?}");
            }),
            LoadTestCommand::CancelSetSell(cancel_set_sell) => client
                .trigger
                .cancel_set_sell(cancel_set_sell)
                .await
                .map(|ok| {
                    println!("{ok:?}");
                }),
            LoadTestCommand::SetSellTrigger(set_sell_trigger) => client
                .trigger
                .set_sell_trigger(set_sell_trigger)
                .await
                .map(|ok| {
                    println!("{ok:?}");
                }),
            LoadTestCommand::SetSellAmount(set_sell_amount) => client
                .trigger
                .set_sell_amount(set_sell_amount)
                .await
                .map(|ok| {
                    println!("{ok:?}");
                }),
            LoadTestCommand::DumpLogFileName(dump_log) => {
                client.log.dumplog(dump_log).await.map(|ok| {
                    println!("{ok:?}");
                })
            }
            LoadTestCommand::SetBuyTrigger(set_buy_trigger) => client
                .trigger
                .set_buy_trigger(set_buy_trigger)
                .await
                .map(|ok| {
                    println!("{ok:?}");
                }),
            LoadTestCommand::DumpLogUser(dump_log_user) => {
                client.log.dumplog_user(dump_log_user).await.map(|ok| {
                    println!("{ok:?}");
                })
            }
        }
    }
}

#[derive(thiserror::Error, Debug, PartialEq)]
enum ParseLoadTestCommandError {
    #[error("missing a space in command string \"{value}\"")]
    MissingSpace { value: String },
    #[error("missing command in command string \"{value}\"")]
    MissingCommand { value: String },
    #[error("unknown command {command} in \"{value}\"")]
    UnknownCommand { value: String, command: String },
    #[error("failed to parse {command} in value \"{value}\": {reason}")]
    CommandParseFailure {
        command: String,
        value: String,
        reason: CommandParseFailure,
    },
}

impl TryFrom<&str> for LoadTestCommand {
    type Error = ParseLoadTestCommandError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        use LoadTestCommand::*;
        use ParseLoadTestCommandError::*;
        let (_, rest) = value.split_once(' ').ok_or_else(|| MissingSpace {
            value: value.to_string(),
        })?;
        let mut iter: Split<char> = rest.split(',');
        Ok(
            match iter.next().ok_or_else(|| MissingCommand {
                value: value.to_string(),
            })? {
                "ADD" => {
                    Add(
                        LoadTestAdd::try_from(iter).map_err(|reason| CommandParseFailure {
                            command: "ADD".to_string(),
                            value: value.to_string(),
                            reason,
                        })?,
                    )
                }
                str @ ("QUOTE" | "CANCEL_SET_BUY" | "CANCEL_SET_SELL") => {
                    let cmd =
                        LoadTestUserIdStockSymbolCommand::try_from(iter).map_err(|reason| {
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
                    let cmd = LoadTestUserIdStockSymbolAmountCommand::try_from(iter).map_err(
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
                    let cmd = LoadTestUserIdCommand::try_from(iter).map_err(|reason| {
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
                    let cmd =
                        LoadTestDumpLog::try_from(iter).map_err(|reason| CommandParseFailure {
                            command: "DUMPLOG".to_string(),
                            value: value.to_string(),
                            reason,
                        })?;
                    DumpLogFileName(cmd)
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

#[derive(PartialEq, Debug, clap::Args, Clone)]
struct LoadTestAdd {
    user_id: String,
    amount: f32,
}

impl IntoRequest<AddRequest> for LoadTestAdd {
    fn into_request(self) -> Request<AddRequest> {
        Request::new(AddRequest {
            user_id: self.user_id,
            amount: self.amount,
        })
    }
}

#[derive(PartialEq, Debug, clap::Args, Clone)]
struct LoadTestUserIdStockSymbolCommand {
    user_id: String,
    stock_symbol: String,
}

impl IntoRequest<QuoteRequest> for LoadTestUserIdStockSymbolCommand {
    fn into_request(self) -> Request<QuoteRequest> {
        Request::new(QuoteRequest {
            user_id: self.user_id,
            stock_symbol: self.stock_symbol,
        })
    }
}

impl IntoRequest<CancelSetBuyRequest> for LoadTestUserIdStockSymbolCommand {
    fn into_request(self) -> Request<CancelSetBuyRequest> {
        Request::new(CancelSetBuyRequest {
            user_id: self.user_id,
            stock_symbol: self.stock_symbol,
        })
    }
}

impl IntoRequest<CancelSetSellRequest> for LoadTestUserIdStockSymbolCommand {
    fn into_request(self) -> Request<CancelSetSellRequest> {
        Request::new(CancelSetSellRequest {
            user_id: self.user_id,
            stock_symbol: self.stock_symbol,
        })
    }
}

impl TryFrom<Split<'_, char>> for LoadTestUserIdStockSymbolCommand {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<'_, char>) -> Result<Self, Self::Error> {
        Ok(Self {
            user_id: value.user_id(0)?,
            stock_symbol: value.stock_symbol(1)?,
        })
    }
}

#[derive(PartialEq, Debug, clap::Args, Clone)]
struct LoadTestUserIdStockSymbolAmountCommand {
    user_id: String,
    stock_symbol: String,
    amount: f32,
}

impl IntoRequest<BuyRequest> for LoadTestUserIdStockSymbolAmountCommand {
    fn into_request(self) -> Request<BuyRequest> {
        Request::new(BuyRequest {
            user_id: self.user_id,
            stock_symbol: self.stock_symbol,
            amount: self.amount,
        })
    }
}

impl IntoRequest<SetBuyAmountRequest> for LoadTestUserIdStockSymbolAmountCommand {
    fn into_request(self) -> Request<SetBuyAmountRequest> {
        Request::new(SetBuyAmountRequest {
            user_id: self.user_id,
            stock_symbol: self.stock_symbol,
            amount: self.amount,
        })
    }
}

impl IntoRequest<SellRequest> for LoadTestUserIdStockSymbolAmountCommand {
    fn into_request(self) -> Request<SellRequest> {
        Request::new(SellRequest {
            user_id: self.user_id,
            stock_symbol: self.stock_symbol,
            amount: self.amount,
        })
    }
}

impl IntoRequest<SetSellAmountRequest> for LoadTestUserIdStockSymbolAmountCommand {
    fn into_request(self) -> Request<SetSellAmountRequest> {
        Request::new(SetSellAmountRequest {
            user_id: self.user_id,
            stock_symbol: self.stock_symbol,
            amount: self.amount,
        })
    }
}

impl IntoRequest<SetSellTriggerRequest> for LoadTestUserIdStockSymbolAmountCommand {
    fn into_request(self) -> Request<SetSellTriggerRequest> {
        Request::new(SetSellTriggerRequest {
            user_id: self.user_id,
            stock_symbol: self.stock_symbol,
            amount: self.amount,
        })
    }
}

impl IntoRequest<SetBuyTriggerRequest> for LoadTestUserIdStockSymbolAmountCommand {
    fn into_request(self) -> Request<SetBuyTriggerRequest> {
        Request::new(SetBuyTriggerRequest {
            user_id: self.user_id,
            stock_symbol: self.stock_symbol,
            amount: self.amount,
        })
    }
}

impl TryFrom<Split<'_, char>> for LoadTestUserIdStockSymbolAmountCommand {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<'_, char>) -> Result<Self, Self::Error> {
        Ok(Self {
            user_id: value.user_id(0)?,
            stock_symbol: value.stock_symbol(1)?,
            amount: value.amount(2)?,
        })
    }
}

#[derive(Debug, PartialEq, clap::Args, Clone)]
struct LoadTestUserIdCommand {
    user_id: String,
}

impl TryFrom<Split<'_, char>> for LoadTestUserIdCommand {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<'_, char>) -> Result<Self, Self::Error> {
        Ok(Self {
            user_id: value.user_id(0)?,
        })
    }
}

impl IntoRequest<CommitBuyRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<CommitBuyRequest> {
        Request::new(CommitBuyRequest {
            user_id: self.user_id,
        })
    }
}

impl IntoRequest<CommitSellRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<CommitSellRequest> {
        Request::new(CommitSellRequest {
            user_id: self.user_id,
        })
    }
}

impl IntoRequest<CancelSellRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<CancelSellRequest> {
        Request::new(CancelSellRequest {
            user_id: self.user_id,
        })
    }
}

impl IntoRequest<DisplaySummaryRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<DisplaySummaryRequest> {
        Request::new(DisplaySummaryRequest {
            user_id: self.user_id,
        })
    }
}

impl IntoRequest<CancelBuyRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<CancelBuyRequest> {
        Request::new(CancelBuyRequest {
            user_id: self.user_id,
        })
    }
}

trait CommandParseIterExt {
    fn get_next_str(
        &mut self,
        arg_name: &'static str,
        position: u8,
    ) -> Result<&str, CommandParseFailure>;
    fn get_next_float(
        &mut self,
        arg_name: &'static str,
        position: u8,
    ) -> Result<f32, CommandParseFailure>;
    fn user_id(&mut self, position: u8) -> Result<String, CommandParseFailure>;
    fn amount(&mut self, position: u8) -> Result<f32, CommandParseFailure>;
    fn stock_symbol(&mut self, position: u8) -> Result<String, CommandParseFailure>;
    fn file_name(&mut self, position: u8) -> Result<String, CommandParseFailure>;
}

impl CommandParseIterExt for Split<'_, char> {
    fn get_next_str(
        &mut self,
        arg_name: &'static str,
        position: u8,
    ) -> Result<&str, CommandParseFailure> {
        self.next().ok_or(MissingArgs {
            position,
            missing_arg_name: arg_name,
        })
    }

    fn get_next_float(
        &mut self,
        arg_name: &'static str,
        position: u8,
    ) -> Result<f32, CommandParseFailure> {
        let str = self.get_next_str(arg_name, position)?;
        str.parse().map_err(|parse| FloatParseError {
            arg_name: "amount",
            value: str.to_string(),
            error: parse,
        })
    }

    fn user_id(&mut self, position: u8) -> Result<String, CommandParseFailure> {
        self.get_next_str("user_id", position).map(str::to_string)
    }

    fn amount(&mut self, position: u8) -> Result<f32, CommandParseFailure> {
        self.get_next_float("amount", position)
    }

    fn stock_symbol(&mut self, position: u8) -> Result<String, CommandParseFailure> {
        self.get_next_str("stock_symbol", position)
            .map(str::to_string)
    }

    fn file_name(&mut self, position: u8) -> Result<String, CommandParseFailure> {
        self.get_next_str("file_name", position).map(str::to_string)
    }
}

#[derive(thiserror::Error, Debug, PartialEq)]
enum CommandParseFailure {
    #[error("missing an argument for {missing_arg_name}")]
    MissingArgs {
        position: u8,
        missing_arg_name: &'static str,
    },
    #[error("failed to parse argument {arg_name} to float from \"{value}\": {error:?}")]
    FloatParseError {
        arg_name: &'static str,
        value: String,
        error: ParseFloatError,
    },
}

impl TryFrom<Split<'_, char>> for LoadTestAdd {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<char>) -> Result<Self, Self::Error> {
        Ok(LoadTestAdd {
            user_id: value.user_id(0)?,
            amount: value.amount(1)?,
        })
    }
}

#[derive(Clone, Debug, clap::Args, PartialEq)]
struct LoadTestDumpLog {
    file_name: String,
}

impl TryFrom<Split<'_, char>> for LoadTestDumpLog {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<char>) -> Result<Self, Self::Error> {
        Ok(LoadTestDumpLog {
            file_name: value.file_name(0)?,
        })
    }
}

impl IntoRequest<DumplogRequest> for LoadTestDumpLog {
    fn into_request(self) -> Request<DumplogRequest> {
        Request::new(DumplogRequest {
            filename: self.file_name,
        })
    }
}

#[derive(Clone, Debug, clap::Args, PartialEq)]
struct LoadTestDumpLogUserIdFileName {
    user_id: String,
    file_name: String,
}

impl TryFrom<Split<'_, char>> for LoadTestDumpLogUserIdFileName {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<char>) -> Result<Self, Self::Error> {
        Ok(LoadTestDumpLogUserIdFileName {
            user_id: value.user_id(0)?,
            file_name: value.file_name(1)?,
        })
    }
}

impl IntoRequest<DumplogUserRequest> for LoadTestDumpLogUserIdFileName {
    fn into_request(self) -> Request<DumplogUserRequest> {
        Request::new(DumplogUserRequest {
            user_id: self.user_id,
            filename: self.file_name,
        })
    }
}

impl IntoRequest<DumplogRequest> for LoadTestDumpLogUserIdFileName {
    fn into_request(self) -> Request<DumplogRequest> {
        Request::new(DumplogRequest {
            filename: self.file_name,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ParseLoadTestCommandError::{MissingSpace, UnknownCommand};
    use pretty_assertions::assert_eq;

    #[test]
    fn test_parse_add_line_success() {
        let command = LoadTestCommand::try_from("[1] ADD,oY01WVirLr,63511.53");
        assert_eq!(
            command,
            Ok(LoadTestCommand::Add(LoadTestAdd {
                user_id: "oY01WVirLr".to_string(),
                amount: 63511.53,
            }))
        )
    }

    #[test]
    fn test_parse_add_line_failure_1() {
        let command = LoadTestCommand::try_from("ADD,oY01WVirLr,63511.53");
        assert_eq!(
            command,
            Err(MissingSpace {
                value: "ADD,oY01WVirLr,63511.53".to_string()
            })
        )
    }

    #[test]
    fn test_parse_add_line_failure_2() {
        let command = LoadTestCommand::try_from("[1] WEEWOO,oY01WVirLr,63511.53");
        assert_eq!(
            command,
            Err(UnknownCommand {
                value: "[1] WEEWOO,oY01WVirLr,63511.53".to_string(),
                command: "WEEWOO".to_string(),
            })
        )
    }

    #[test]
    fn test_parse_add_line_failure_3() {
        let command = LoadTestCommand::try_from("[1] ADD");
        assert_eq!(
            command,
            Err(ParseLoadTestCommandError::CommandParseFailure {
                command: "ADD".to_string(),
                value: "[1] ADD".to_string(),
                reason: MissingArgs {
                    position: 0,
                    missing_arg_name: "user_id",
                },
            })
        )
    }

    #[test]
    fn test_parse_add_line_failure_4() {
        let command = LoadTestCommand::try_from("[1] ADD,oY01WVirLr,a");
        assert_eq!(
            command,
            Err(ParseLoadTestCommandError::CommandParseFailure {
                command: "ADD".to_string(),
                value: "[1] ADD,oY01WVirLr,a".to_string(),
                reason: FloatParseError {
                    arg_name: "amount",
                    value: "a".to_string(),
                    error: "a".parse::<f32>().unwrap_err(),
                },
            })
        )
    }
}
