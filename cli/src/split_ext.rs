use crate::CommandParseFailure;
use crate::CommandParseFailure::{FloatParseError, MissingArgs, TooManyArguments};
use std::str::Split;

pub trait CommandParseIterExt {
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
