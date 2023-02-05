use crate::protos::{
    CancelBuyRequest, CancelSellRequest, CommitBuyRequest, CommitSellRequest, DisplaySummaryRequest,
};
use crate::split_ext::CommandParseIterExt;
use crate::CommandParseFailure;
use std::str::Split;
use tonic::{IntoRequest, Request};

#[derive(Debug, PartialEq, clap::Args, Clone)]
pub struct LoadTestUserIdCommand {
    pub user_id: String,
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
