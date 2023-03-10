use crate::command::command_user_id_file_name::LoadTestDumpLogUserIdFileName;
use crate::protos::DumpLogRequest;
use crate::split_ext::CommandParseIterExt;
use crate::CommandParseFailure;
use proptest_derive::Arbitrary;
use std::str::Split;
use tonic::{IntoRequest, Request};

#[derive(Clone, Debug, PartialEq)]
pub enum DumpLog {
    User(LoadTestDumpLogUserIdFileName),
    NoUser(LoadTestDumpLogFileName),
}

impl TryFrom<Split<'_, char>> for DumpLog {
    type Error = CommandParseFailure;

    fn try_from(mut value: Split<'_, char>) -> Result<Self, Self::Error> {
        let arg1 = value
            .get_next_str("user_id or filename (ambiguous)", 0)?
            .to_string();
        match value.next() {
            None => Ok(DumpLog::NoUser(LoadTestDumpLogFileName { file_name: arg1 })),
            Some(filename) => {
                let command = DumpLog::User(LoadTestDumpLogUserIdFileName {
                    user_id: arg1,
                    file_name: filename.to_string(),
                });
                value.require_finished(2).map(|_| command)
            }
        }
    }
}

#[derive(Clone, Debug, clap::Args, PartialEq, Arbitrary)]
pub struct LoadTestDumpLogFileName {
    pub file_name: String,
}

impl IntoRequest<DumpLogRequest> for LoadTestDumpLogFileName {
    fn into_request(self) -> Request<DumpLogRequest> {
        Request::new(DumpLogRequest {
            filename: self.file_name,
        })
    }
}
