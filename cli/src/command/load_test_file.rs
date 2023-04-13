use crate::protos::FileRequest;
use proptest_derive::Arbitrary;
use tonic::{IntoRequest, Request};

#[derive(Debug, PartialEq, clap::Args, Clone, Arbitrary)]
pub struct LoadTestFileCommand {
    /// the filename to fetch
    file: String,
}

impl IntoRequest<FileRequest> for LoadTestFileCommand {
    fn into_request(self) -> Request<FileRequest> {
        Request::new(FileRequest {
            filename: self.file,
        })
    }
}
