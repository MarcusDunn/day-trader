use crate::protos::AddRequest;
use crate::split_ext::CommandParseIterExt;
use crate::CommandParseFailure;
use std::str::Split;
use tonic::{IntoRequest, Request};

#[derive(PartialEq, Debug, clap::Args, Clone)]
pub struct LoadTestAdd {
    pub user_id: String,
    pub amount: f32,
}

impl IntoRequest<AddRequest> for LoadTestAdd {
    fn into_request(self) -> Request<AddRequest> {
        Request::new(AddRequest {
            user_id: self.user_id,
            amount: self.amount,
        })
    }
}

impl TryFrom<Split<'_, char>> for LoadTestAdd {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<char>) -> Result<Self, Self::Error> {
        let command = LoadTestAdd {
            user_id: value.user_id(0)?,
            amount: value.amount(1)?,
        };
        value.require_finished(2).map(|_| command)
    }
}
