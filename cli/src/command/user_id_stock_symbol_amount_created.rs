use crate::protos::{
    BuyRequest, SellRequest, SetBuyAmountRequest, SetBuyTriggerRequest, SetSellAmountRequest,
    SetSellTriggerRequest,
};
use crate::split_ext::CommandParseIterExt;
use crate::CommandParseFailure;
use proptest_derive::Arbitrary;
use std::str::Split;
use tonic::{IntoRequest, Request};

#[derive(PartialEq, Debug, clap::Args, Clone, Arbitrary)]
pub struct LoadTestUserIdStockSymbolAmountCommand {
    pub user_id: String,
    pub stock_symbol: String,
    pub amount: f32,
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
