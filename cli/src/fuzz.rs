use crate::command::add::LoadTestAdd;
use crate::command::command_user_id_file_name::LoadTestDumpLogUserIdFileName;
use crate::command::dump_log::LoadTestDumpLogFileName;
use crate::command::user_id::LoadTestUserIdCommand;
use crate::command::user_id_stock_symbol::LoadTestUserIdStockSymbolCommand;
use crate::command::user_id_stock_symbol_amount_created::LoadTestUserIdStockSymbolAmountCommand;
use crate::command::LoadTestCommand;
use proptest::arbitrary::any;
use proptest::prelude::{Arbitrary, SBoxedStrategy};
use proptest::strategy::Strategy;

impl Arbitrary for LoadTestCommand {
    type Parameters = Vec<LoadTestCommandType>;

    fn arbitrary_with(args: Self::Parameters) -> Self::Strategy {
        args.iter()
            .map(|it| match it {
                LoadTestCommandType::Add => {
                    any::<LoadTestAdd>().prop_map(LoadTestCommand::Add).sboxed()
                }
                LoadTestCommandType::Quote => any::<LoadTestUserIdStockSymbolCommand>()
                    .prop_map(LoadTestCommand::Quote)
                    .sboxed(),
                LoadTestCommandType::Buy => any::<LoadTestUserIdStockSymbolAmountCommand>()
                    .prop_map(LoadTestCommand::Buy)
                    .sboxed(),
                LoadTestCommandType::CommitBuy => any::<LoadTestUserIdCommand>()
                    .prop_map(LoadTestCommand::CommitBuy)
                    .sboxed(),
                LoadTestCommandType::CancelBuy => any::<LoadTestUserIdCommand>()
                    .prop_map(LoadTestCommand::CancelBuy)
                    .sboxed(),
                LoadTestCommandType::Sell => any::<LoadTestUserIdStockSymbolAmountCommand>()
                    .prop_map(LoadTestCommand::Sell)
                    .sboxed(),
                LoadTestCommandType::CommitSell => any::<LoadTestUserIdCommand>()
                    .prop_map(LoadTestCommand::CommitSell)
                    .sboxed(),
                LoadTestCommandType::CancelSell => any::<LoadTestUserIdCommand>()
                    .prop_map(LoadTestCommand::CancelSell)
                    .sboxed(),
                LoadTestCommandType::SetBuyAmount => {
                    any::<LoadTestUserIdStockSymbolAmountCommand>()
                        .prop_map(LoadTestCommand::SetBuyAmount)
                        .sboxed()
                }
                LoadTestCommandType::CancelSetBuy => any::<LoadTestUserIdStockSymbolCommand>()
                    .prop_map(LoadTestCommand::CancelSetBuy)
                    .sboxed(),
                LoadTestCommandType::SetBuyTrigger => {
                    any::<LoadTestUserIdStockSymbolAmountCommand>()
                        .prop_map(LoadTestCommand::SetBuyTrigger)
                        .sboxed()
                }
                LoadTestCommandType::SetSellAmount => {
                    any::<LoadTestUserIdStockSymbolAmountCommand>()
                        .prop_map(LoadTestCommand::SetSellAmount)
                        .sboxed()
                }
                LoadTestCommandType::SetSellTrigger => {
                    any::<LoadTestUserIdStockSymbolAmountCommand>()
                        .prop_map(LoadTestCommand::SetSellTrigger)
                        .sboxed()
                }
                LoadTestCommandType::CancelSetSell => any::<LoadTestUserIdStockSymbolCommand>()
                    .prop_map(LoadTestCommand::CancelSetSell)
                    .sboxed(),
                LoadTestCommandType::DisplaySummary => any::<LoadTestUserIdCommand>()
                    .prop_map(LoadTestCommand::DisplaySummary)
                    .sboxed(),
                LoadTestCommandType::DumpLogFileName => any::<LoadTestDumpLogFileName>()
                    .prop_map(LoadTestCommand::DumpLogFileName)
                    .sboxed(),
                LoadTestCommandType::DumpLogUser => any::<LoadTestDumpLogUserIdFileName>()
                    .prop_map(LoadTestCommand::DumpLogUser)
                    .sboxed(),
            })
            .reduce(|a, b| a.prop_union(b).sboxed())
            .expect("at least one strategy should be passed")
    }

    type Strategy = SBoxedStrategy<LoadTestCommand>;
}

#[derive(clap::ValueEnum, Copy, Clone, Debug, PartialEq, Eq)]
pub enum LoadTestCommandType {
    /// Add the given amount of money to the user's account
    Add,
    /// Get the current quote for the stock for the specified user
    Quote,
    /// Buy the dollar amount of the stock for the specified user at the current price.
    Buy,
    /// Commits the most recently executed BUY command
    CommitBuy,
    /// Cancels the most recently executed BUY Command
    CancelBuy,
    /// Sell the specified dollar mount of the stock currently held by the specified user at the current price.
    Sell,
    /// Commits the most recently executed SELL command
    CommitSell,
    /// Cancels the most recently executed SELL Command
    CancelSell,
    /// Sets a defined amount of the given stock to buy when the current stock price is less than or equal to the BUY_TRIGGER
    SetBuyAmount,
    /// Cancels a SET_BUY command issued for the given stock
    CancelSetBuy,
    /// Sets the trigger point base on the current stock price when any SET_BUY will execute.
    SetBuyTrigger,
    /// Sets a defined amount of the specified stock to sell when the current stock price is equal or greater than the sell trigger point
    SetSellAmount,
    /// Sets the stock price trigger point for executing any SET_SELL triggers associated with the given stock and user
    SetSellTrigger,
    /// Cancels the SET_SELL associated with the given stock and user
    CancelSetSell,
    /// Provides a summary to the client of the given user's transaction history and the current status of their accounts as well as any set buy or sell triggers and their parameters
    DisplaySummary,
    /// Print out to the specified file the complete set of transactions that have occurred in the system.
    DumpLogFileName,
    /// Print out the history of the users transactions to the user specified file
    DumpLogUser,
}
