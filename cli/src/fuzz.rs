use crate::command::user_id_stock_symbol::LoadTestUserIdStockSymbolCommand;
use crate::command::LoadTestCommand;
use proptest::arbitrary::any;
use proptest::prelude::{Arbitrary, SBoxedStrategy};
use proptest::strategy::Strategy;
use crate::command::add::LoadTestAdd;
use crate::command::command_user_id_file_name::LoadTestDumpLogUserIdFileName;
use crate::command::dump_log::LoadTestDumpLogFileName;
use crate::command::user_id::LoadTestUserIdCommand;
use crate::command::user_id_stock_symbol_amount_created::LoadTestUserIdStockSymbolAmountCommand;

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
                LoadTestCommandType::Buy => {
                    any::<LoadTestUserIdStockSymbolAmountCommand>().prop_map(LoadTestCommand::Buy).sboxed()
                }
                LoadTestCommandType::CommitBuy => {
                    any::<LoadTestUserIdCommand>().prop_map(LoadTestCommand::CommitBuy).sboxed()
                }
                LoadTestCommandType::CancelBuy => {
                    any::<LoadTestUserIdCommand>().prop_map(LoadTestCommand::CancelBuy).sboxed()
                }
                LoadTestCommandType::Sell => {
                    any::<LoadTestUserIdStockSymbolAmountCommand>().prop_map(LoadTestCommand::Sell).sboxed()
                }
                LoadTestCommandType::CommitSell => {
                    any::<LoadTestUserIdCommand>().prop_map(LoadTestCommand::CommitSell).sboxed()
                }
                LoadTestCommandType::CancelSell => {
                    any::<LoadTestUserIdCommand>().prop_map(LoadTestCommand::CancelSell).sboxed()
                }
                LoadTestCommandType::SetBuyAmount => {
                    any::<LoadTestUserIdStockSymbolAmountCommand>().prop_map(LoadTestCommand::SetBuyAmount).sboxed()
                }
                LoadTestCommandType::CancelSetBuy => {
                    any::<LoadTestUserIdStockSymbolCommand>().prop_map(LoadTestCommand::CancelSetBuy).sboxed()
                }
                LoadTestCommandType::SetBuyTrigger => {
                    any::<LoadTestUserIdStockSymbolAmountCommand>().prop_map(LoadTestCommand::SetBuyTrigger).sboxed()
                }
                LoadTestCommandType::SetSellAmount => {
                    any::<LoadTestUserIdStockSymbolAmountCommand>().prop_map(LoadTestCommand::SetSellAmount).sboxed()
                }
                LoadTestCommandType::SetSellTrigger => {
                    any::<LoadTestUserIdStockSymbolAmountCommand>().prop_map(LoadTestCommand::SetSellTrigger).sboxed()
                }
                LoadTestCommandType::CancelSetSell => {
                    any::<LoadTestUserIdStockSymbolCommand>().prop_map(LoadTestCommand::CancelSetSell).sboxed()
                }
                LoadTestCommandType::DisplaySummary => {
                    any::<LoadTestUserIdCommand>().prop_map(LoadTestCommand::DisplaySummary).sboxed()
                }
                LoadTestCommandType::DumpLogFileName => {
                    any::<LoadTestDumpLogFileName>().prop_map(LoadTestCommand::DumpLogFileName).sboxed()
                }
                LoadTestCommandType::DumpLogUser => {
                    any::<LoadTestDumpLogUserIdFileName>().prop_map(LoadTestCommand::DumpLogUser).sboxed()
                }
            })
            .reduce(|a, b| a.prop_union(b).sboxed())
            .expect("at least one strategy should be passed")
    }

    type Strategy = SBoxedStrategy<LoadTestCommand>;
}

#[derive(clap::ValueEnum, Copy, Clone, Debug, PartialEq, Eq)]
pub enum LoadTestCommandType {
    Add,
    Quote,
    Buy,
    CommitBuy,
    CancelBuy,
    Sell,
    CommitSell,
    CancelSell,
    SetBuyAmount,
    CancelSetBuy,
    SetBuyTrigger,
    SetSellAmount,
    SetSellTrigger,
    CancelSetSell,
    DisplaySummary,
    DumpLogFileName,
    DumpLogUser,
}
