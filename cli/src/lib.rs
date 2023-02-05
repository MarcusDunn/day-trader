use std::num::ParseFloatError;

mod protos { tonic::include_proto!("day_trader"); }
pub mod command;
pub mod services;
mod split_ext;

#[derive(thiserror::Error, Debug, PartialEq)]
pub enum ParseLoadTestCommandError {
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

#[derive(thiserror::Error, Debug, PartialEq)]
pub enum CommandParseFailure {
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
