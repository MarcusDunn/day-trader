
use clap::Parser;
use std::fs::{metadata, File};
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use tokio::task::JoinSet;
use tonic::transport::{Channel, Uri};

use cli::command::LoadTestCommand;
use cli::services::DayTraderServicesStack;

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


#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;
    use cli::command::add::LoadTestAdd;
    use cli::command::command_user_id_file_name::LoadTestDumpLogUserIdFileName;
    use cli::command::dump_log::LoadTestDumpLogFileName;
    use cli::CommandParseFailure::{FloatParseError, MissingArgs};
    use cli::ParseLoadTestCommandError;
    use cli::ParseLoadTestCommandError::{MissingSpace, UnknownCommand};

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
