use clap::Parser;
use proptest::prelude::{any_with, TestCaseError};
use proptest::strategy::SBoxedStrategy;
use proptest::test_runner::{Config, TestCaseResult, TestRunner};
use std::fs::{metadata, File};
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use tokio::task::JoinSet;
use tonic::transport::{Channel, Uri};
use tracing::{error, info};

use cli::command::LoadTestCommand;
use cli::fuzz::LoadTestCommandType;
use cli::services::DayTraderServicesStack;

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    let args = CliArgs::parse();

    let commands = command_list_from_cli_command(&args.command)?;

    let channel = Channel::builder(Uri::try_from(args.services_uri)?)
        .connect()
        .await?;

    let stack = DayTraderServicesStack::new(&channel);

    match commands {
        CommandList::Fuzz(cases, strat) => {
            let (send, mut recv) = tokio::sync::mpsc::channel::<(
                LoadTestCommand,
                tokio::sync::oneshot::Sender<TestCaseResult>,
            )>(32);

            tokio::task::spawn(async move {
                loop {
                    while let Some((command, send)) = recv.recv().await {
                        let mut services_stack = stack.clone();
                        let result = command
                            .execute(&mut services_stack)
                            .await
                            .map_err(|err| TestCaseError::fail(err.to_string()));
                        send.send(result).unwrap_or_else(|err| {
                            panic!("failed to send result via oneshot from worker: {err:?}")
                        })
                    }
                }
            });

            tokio::task::spawn_blocking(move || {
                let mut runner = TestRunner::new(Config::with_cases(cases));
                runner.run(&strat, |command| {
                    let (oneshot_send, oneshot_recv) = tokio::sync::oneshot::channel();
                    send.blocking_send((command, oneshot_send))
                        .expect("failed to send");
                    oneshot_recv.blocking_recv().expect("failed to revc")
                })
            })
            .await??;
        }
        CommandList::List(commands) => {
            let join_set = spawn_commands(commands, stack)?;
            join_all(join_set).await?;
        }
    }

    Ok(())
}

#[derive(clap::Parser, Debug, PartialEq)]
#[command(author, version, about, long_about = None)]

struct CliArgs {
    /// The uri of the gRPC services.
    #[arg(default_value_t = String::from("http://localhost:80"))]
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
    /// Fuzz the API
    Fuzz(Fuzz),
}

#[derive(clap::Subcommand, Clone, Debug, PartialEq, Eq)]
enum FuzzCommand {
    /// Fuzz with every possible command
    All,
    /// Fuzz with a subset of commands
    Some(FuzzMany),
}

impl FuzzCommand {
    const ALL: [LoadTestCommandType; 17] = [
        LoadTestCommandType::Add,
        LoadTestCommandType::Quote,
        LoadTestCommandType::Buy,
        LoadTestCommandType::CommitBuy,
        LoadTestCommandType::CancelBuy,
        LoadTestCommandType::Sell,
        LoadTestCommandType::CommitSell,
        LoadTestCommandType::CancelSell,
        LoadTestCommandType::SetBuyAmount,
        LoadTestCommandType::CancelSetBuy,
        LoadTestCommandType::SetBuyTrigger,
        LoadTestCommandType::SetSellAmount,
        LoadTestCommandType::SetSellTrigger,
        LoadTestCommandType::CancelSetSell,
        LoadTestCommandType::DisplaySummary,
        LoadTestCommandType::DumpLogFileName,
        LoadTestCommandType::DumpLogUser,
    ];
}

#[derive(clap::Args, Clone, Debug, PartialEq, Eq)]
struct Fuzz {
    #[arg(default_value_t = 1000)]
    number: u32,
    #[command(subcommand)]
    command: FuzzCommand,
}

#[derive(clap::Args, Clone, Debug, PartialEq, Eq)]
struct FuzzMany {
    pub commands: Vec<LoadTestCommandType>,
}

async fn join_all(mut join_set: JoinSet<()>) -> Result<(), anyhow::Error> {
    let start = SystemTime::now();
    let mut count = 0;
    while let Some(result) = join_set.join_next().await {
        count += 1;
        if let Err(err) = result {
            error!("Error joining task: {err}");
        }
    }
    let elapsed_millis = start.elapsed()?.as_millis();
    let requests_per_milli = count as f64 / elapsed_millis as f64;
    let requests_per_second = requests_per_milli * 1000.0;
    info!("Received {count} commands in {elapsed_millis}ms ({requests_per_second}rps)");
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
                error!("Error executing command: {err}");
            }
        });
    }
    let elapsed_millis = start.elapsed()?.as_millis();
    let requests_per_milli = len as f64 / elapsed_millis as f64;
    let requests_per_second = requests_per_milli * 1000.0;
    info!("Sent {len} commands in {elapsed_millis}ms, ({requests_per_second}rps)");
    Ok(join_set)
}

enum CommandList {
    Fuzz(u32, SBoxedStrategy<LoadTestCommand>),
    List(Vec<LoadTestCommand>),
}

fn command_list_from_cli_command(command: &CliCommand) -> Result<CommandList, anyhow::Error> {
    Ok(match command {
        CliCommand::File { file } => CommandList::List(parse_commands_from_file(file)?),
        CliCommand::Single(single) => CommandList::List(vec![single.clone()]),
        CliCommand::Fuzz(Fuzz { number, command }) => {
            let types = match command {
                FuzzCommand::All => FuzzCommand::ALL.to_vec(),
                FuzzCommand::Some(FuzzMany { commands }) => commands.to_vec(),
            };
            CommandList::Fuzz(number.to_owned(), any_with::<LoadTestCommand>(types))
        }
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
        "Parsed {} commands in {millis}ms ({mb_per_s} mb/s)",
        commands.len()
    );
    Ok(commands)
}

#[cfg(test)]
mod tests {
    use super::*;
    use cli::command::add::LoadTestAdd;
    use cli::command::command_user_id_file_name::LoadTestDumpLogUserIdFileName;
    use cli::command::dump_log::LoadTestDumpLogFileName;
    use cli::CommandParseFailure::{FloatParseError, MissingArgs};
    use cli::ParseLoadTestCommandError;
    use cli::ParseLoadTestCommandError::{MissingSpace, UnknownCommand};
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
