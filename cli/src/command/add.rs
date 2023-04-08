use crate::protos::AddRequest;
use crate::split_ext::CommandParseIterExt;
use crate::CommandParseFailure;
use proptest_derive::Arbitrary;
use std::str::Split;
use tonic::{IntoRequest, Request};

#[derive(PartialEq, Debug, clap::Args, Clone, Arbitrary)]
pub struct LoadTestAdd {
    pub user_id: String,
    pub amount: f64,
    #[arg(default_value_t = -1)]
    pub request_num: i32,
}

impl IntoRequest<AddRequest> for LoadTestAdd {
    fn into_request(self) -> Request<AddRequest> {
        Request::new(AddRequest {
            user_id: self.user_id,
            amount: self.amount,
            request_num: self.request_num,
        })
    }
}

impl TryFrom<(i32, Split<'_, char>)> for LoadTestAdd {
    type Error = CommandParseFailure;

    fn try_from((request_num, mut value): (i32, Split<char>)) -> Result<Self, Self::Error> {
        let command = LoadTestAdd {
            user_id: value.user_id(0)?,
            amount: value.amount(1)?,
            request_num,
        };
        value.require_finished(2).map(|_| command)
    }
}
