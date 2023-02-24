use crate::protos::{CancelSetBuyRequest, CancelSetSellRequest, QuoteRequest};
use crate::split_ext::CommandParseIterExt;
use crate::CommandParseFailure;
use proptest_derive::Arbitrary;
use std::str::Split;
use tonic::{IntoRequest, Request};

#[derive(PartialEq, Debug, clap::Args, Clone, Arbitrary)]
pub struct LoadTestUserIdStockSymbolCommand {
    pub user_id: String,
    pub stock_symbol: String,
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
