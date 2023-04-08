use crate::protos::{
    CancelBuyRequest, CancelSellRequest, CommitBuyRequest, CommitSellRequest,
    DisplaySummaryRequest, GetUserInfoRequest,
};
use crate::split_ext::CommandParseIterExt;
use crate::CommandParseFailure;
use proptest_derive::Arbitrary;
use std::str::Split;
use tonic::{IntoRequest, Request};

#[derive(Debug, PartialEq, clap::Args, Clone, Arbitrary)]
pub struct LoadTestUserIdCommand {
    pub user_id: String,
    pub request_num: i32,
}

impl TryFrom<(i32, Split<'_, char>)> for LoadTestUserIdCommand {
    type Error = CommandParseFailure;

    fn try_from((request_num, mut value): (i32, Split<'_, char>)) -> Result<Self, Self::Error> {
        let command = LoadTestUserIdCommand {
            request_num,
            user_id: value.user_id(0)?,
        };
        value.require_finished(1).map(|_| command)
    }
}

impl IntoRequest<CommitBuyRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<CommitBuyRequest> {
        Request::new(CommitBuyRequest {
            user_id: self.user_id,
            request_num: self.request_num,
        })
    }
}

impl IntoRequest<CommitSellRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<CommitSellRequest> {
        Request::new(CommitSellRequest {
            user_id: self.user_id,
            request_num: self.request_num,
        })
    }
}

impl IntoRequest<CancelSellRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<CancelSellRequest> {
        Request::new(CancelSellRequest {
            user_id: self.user_id,
            request_num: self.request_num,
        })
    }
}

impl IntoRequest<DisplaySummaryRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<DisplaySummaryRequest> {
        Request::new(DisplaySummaryRequest {
            user_id: self.user_id,
            request_num: self.request_num,
        })
    }
}

impl IntoRequest<CancelBuyRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<CancelBuyRequest> {
        Request::new(CancelBuyRequest {
            user_id: self.user_id,
            request_num: self.request_num,
        })
    }
}

impl IntoRequest<GetUserInfoRequest> for LoadTestUserIdCommand {
    fn into_request(self) -> Request<GetUserInfoRequest> {
        Request::new(GetUserInfoRequest {
            user_id: self.user_id,
        })
    }
}
