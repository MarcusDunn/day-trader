use crate::protos::{DumpLogRequest, DumpLogUserRequest};
use proptest_derive::Arbitrary;
use tonic::{IntoRequest, Request};

#[derive(Clone, Debug, clap::Args, PartialEq, Arbitrary)]
pub struct LoadTestDumpLogUserIdFileName {
    pub user_id: String,
    pub file_name: String,
    pub request_num: i32,
}

impl IntoRequest<DumpLogUserRequest> for LoadTestDumpLogUserIdFileName {
    fn into_request(self) -> Request<DumpLogUserRequest> {
        Request::new(DumpLogUserRequest {
            user_id: self.user_id,
            filename: self.file_name,
            request_num: self.request_num,
        })
    }
}

impl IntoRequest<DumpLogRequest> for LoadTestDumpLogUserIdFileName {
    fn into_request(self) -> Request<DumpLogRequest> {
        Request::new(DumpLogRequest {
            filename: self.file_name,
            request_num: self.request_num,
        })
    }
}
