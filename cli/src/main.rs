use crate::CommandParseFailure::{FloatParseError, MissingArgs, TooManyArguments};
use clap::Parser;
use cli::log_client::LogClient;
use cli::quote_client::QuoteClient;
use cli::transaction_client::TransactionClient;
use cli::trigger_client::TriggerClient;
use cli::{
    AddRequest, BuyRequest, CancelBuyRequest, CancelSellRequest, CancelSetBuyRequest,
    CancelSetSellRequest, CommitBuyRequest, CommitSellRequest, DisplaySummaryRequest,
    DumpLogRequest, DumpLogUserRequest, QuoteRequest, SellRequest, SetBuyAmountRequest,
    SetBuyTriggerRequest, SetSellAmountRequest, SetSellTriggerRequest,
};
use std::fs::{metadata, File};
use std::io::{BufRead, BufReader};
use std::num::ParseFloatError;
use std::path::{Path, PathBuf};
use std::str::Split;
use std::time::SystemTime;
use tokio::task::JoinSet;
use tonic::transport::{Channel, Uri};
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

    let commands = command_list_from_cli_command(&args.command)?;

    let channel = Channel::builder(Uri::try_from(args.services_uri)?)
        .connect()
        .await?;

    let stack = DayTraderServicesStack::new(&channel);

    let join_set = spawn_commands(commands, stack)?;
    join_all(join_set).await?;

    Ok(())
}

async fn join_all(mut join_set: JoinSet<()>) -> Result<(), anyhow::Error> {
    let start = SystemTime::now();
    let mut count = 0;
    while let Some(result) = join_set.join_next().await {
        count += 1;
        if let Err(err) = result {
            println!("Error joining task: {err}");
        }
    }
    let elapsed_millis = start.elapsed()?.as_millis();
    let requests_per_milli = count as f64 / elapsed_millis as f64;
    let requests_per_second = requests_per_milli * 1000.0;
    println!(
        "Received {} commands in {}ms ({}rps)",
        count, elapsed_millis, requests_per_second
    );
    Ok(())
}

fn spawn_commands(
    commands: Vec<LoadTestCommand>,
    stack: DayTraderServicesStack,
) -> Result<JoinSet<()>, anyhow::Error> {
    let len = commands.len();
    let start = SystemTime::now();
    let mut join_set = JoinSet::new();
    for command in commands {
        let mut stack = stack.clone();
        join_set.spawn(async move {
            if let Err(err) = command.execute(&mut stack).await {
                println!("Error executing command: {err}");
            }
        });
    }
    let elapsed_millis = start.elapsed()?.as_millis();
    let requests_per_milli = len as f64 / elapsed_millis as f64;
    let requests_per_second = requests_per_milli * 1000.0;
    println!(
        "Sent {} commands in {}ms, ({}rps)",
        len, elapsed_millis, requests_per_second
    );
    Ok(join_set)
}

fn command_list_from_cli_command(command: &CliCommand) -> Result<Vec<LoadTestCommand>, anyhow::Error> {
    Ok(match command {
        CliCommand::File { file } => parse_commands_from_file(file)?,
        CliCommand::Single(single) => vec![single.clone()],
    })
}

fn parse_commands_from_file(file: &Path) -> Result<Vec<LoadTestCommand>, anyhow::Error> {
    let parse_start = SystemTime::now();
    let commands = BufReader::new(File::open(file)?)
        .lines()
        .map(|line| line.map_err(|err| anyhow::anyhow!(err)))
        .map(|line| {
            line.and_then(|line| {
                LoadTestCommand::try_from(line.trim()).map_err(|err| anyhow::anyhow!(err))
            })
        })
        .collect::<Result<Vec<_>, _>>()?;

    let millis = parse_start.elapsed()?.as_millis();
    let bytes_per_ms = metadata(file)?.len() as f64 / millis as f64;
    let mb_per_s = bytes_per_ms / 1000.0;
    println!(
        "Parsed {} commands in {}ms ({} mb/s)",
        commands.len(),
        millis,
        mb_per_s
    );
    Ok(commands)
}

#[derive(Clone)]
struct DayTraderServicesStack {
    quote: QuoteClient<Channel>,
    log: LogClient<Channel>,
    transaction: TransactionClient<Channel>,
    trigger: TriggerClient<Channel>,
}

impl DayTraderServicesStack {
    fn new(channel: &Channel) -> Self {
        Self {
            quote: QuoteClient::new(channel.clone()),
            log: LogClient::new(channel.clone()),
            transaction: TransactionClient::new(channel.clone()),
            trigger: TriggerClient::new(channel.clone()),
        }
    }
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
    DumpLogFileName(LoadTestDumpLogFileName),
    /// Print out the history of the users transactions to the user specified file
    DumpLogUser(LoadTestDumpLogUserIdFileName),
}

impl LoadTestCommand {
    async fn execute(self, client: &mut DayTraderServicesStack) -> Result<(), Status> {
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
                client.log.dump_log(dump_log).await.map(|ok| {
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
                client.log.dump_log_user(dump_log_user).await.map(|ok| {
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
        let mut iter = rest.split(',');
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
                    let cmd = DumpLog::try_from(iter).map_err(|reason| CommandParseFailure {
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
        let command = Self {
            user_id: value.user_id(0)?,
            stock_symbol: value.stock_symbol(1)?,
        };
        value.require_finished(2).map(|_| command)
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
        let command = Self {
            user_id: value.user_id(0)?,
            stock_symbol: value.stock_symbol(1)?,
            amount: value.amount(2)?,
        };
        value.require_finished(3).map(|_| command)
    }
}

#[derive(Debug, PartialEq, clap::Args, Clone)]
struct LoadTestUserIdCommand {
    user_id: String,
}

impl TryFrom<Split<'_, char>> for LoadTestUserIdCommand {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<'_, char>) -> Result<Self, Self::Error> {
        let command = LoadTestUserIdCommand {
            user_id: value.user_id(0)?,
        };
        value.require_finished(1).map(|_| command)
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
    fn require_finished(&mut self, expected_count: u8) -> Result<(), CommandParseFailure>;
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

    fn require_finished(&mut self, expected_count: u8) -> Result<(), CommandParseFailure> {
        if let Some(next) = self.next() {
            Err(TooManyArguments {
                expected_count,
                unexpected_arg: next.to_string(),
            })
        } else {
            Ok(())
        }
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
    #[error("too many arguments, expected {expected_count} but next was \"{unexpected_arg}\" instead of None")]
    TooManyArguments {
        expected_count: u8,
        unexpected_arg: String,
    },
}

impl TryFrom<Split<'_, char>> for LoadTestAdd {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<char>) -> Result<Self, Self::Error> {
        let command = LoadTestAdd {
            user_id: value.user_id(0)?,
            amount: value.amount(1)?,
        };
        value.require_finished(2).map(|_| command)
    }
}

#[derive(Clone, Debug, PartialEq)]
enum DumpLog {
    User(LoadTestDumpLogUserIdFileName),
    NoUser(LoadTestDumpLogFileName),
}

impl TryFrom<Split<'_, char>> for DumpLog {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<'_, char>) -> Result<Self, Self::Error> {
        let arg1 = value
            .get_next_str("user_id or filename (ambiguous)", 0)?
            .to_string();
        match value.next() {
            None => Ok(DumpLog::NoUser(LoadTestDumpLogFileName { file_name: arg1 })),
            Some(filename) => {
                let command = DumpLog::User(LoadTestDumpLogUserIdFileName {
                    user_id: arg1,
                    file_name: filename.to_string(),
                });
                value.require_finished(2).map(|_| command)
            }
        }
    }
}

#[derive(Clone, Debug, clap::Args, PartialEq)]
struct LoadTestDumpLogFileName {
    file_name: String,
}

impl TryFrom<Split<'_, char>> for LoadTestDumpLogFileName {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<char>) -> Result<Self, Self::Error> {
        let dump_log = LoadTestDumpLogFileName {
            file_name: value.file_name(0)?,
        };
        value.require_finished(1).map(|_| dump_log)
    }
}

impl IntoRequest<DumpLogRequest> for LoadTestDumpLogFileName {
    fn into_request(self) -> Request<DumpLogRequest> {
        Request::new(DumpLogRequest {
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
        let command = LoadTestDumpLogUserIdFileName {
            user_id: value.user_id(0)?,
            file_name: value.file_name(1)?,
        };
        value.require_finished(2).map(|_| command)
    }
}

impl IntoRequest<DumpLogUserRequest> for LoadTestDumpLogUserIdFileName {
    fn into_request(self) -> Request<DumpLogUserRequest> {
        Request::new(DumpLogUserRequest {
            user_id: self.user_id,
            filename: self.file_name,
        })
    }
}

impl IntoRequest<DumpLogRequest> for LoadTestDumpLogUserIdFileName {
    fn into_request(self) -> Request<DumpLogRequest> {
        Request::new(DumpLogRequest {
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

    #[test]
    fn check_can_parse_users_10() {
        let path = PathBuf::from("workloads/10-user-workload");
        let result = parse_commands_from_file(&path).unwrap();
        assert_eq!(result.len(), 10000);
    }

    #[test]
    fn parse_dump_log_file() {
        assert_eq!(
            Ok(LoadTestCommand::DumpLogFileName(LoadTestDumpLogFileName {
                file_name: "abc.xml".to_string(),
            })),
            LoadTestCommand::try_from("[1] DUMPLOG,abc.xml")
        );
    }

    #[test]
    fn parse_dump_log_user_file() {
        assert_eq!(
            Ok(LoadTestCommand::DumpLogUser(
                LoadTestDumpLogUserIdFileName {
                    user_id: "hello".to_string(),
                    file_name: "abc.xml".to_string(),
                }
            )),
            LoadTestCommand::try_from("[1] DUMPLOG,hello,abc.xml")
        );
    }
}
