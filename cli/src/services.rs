use crate::protos::log_client::LogClient;
use crate::protos::quote_client::QuoteClient;
use crate::protos::transaction_client::TransactionClient;
use crate::protos::trigger_client::TriggerClient;
use tonic::transport::Channel;

#[derive(Clone)]
pub struct DayTraderServicesStack {
    pub quote: QuoteClient<Channel>,
    pub log: LogClient<Channel>,
    pub transaction: TransactionClient<Channel>,
    pub trigger: TriggerClient<Channel>,
}

impl DayTraderServicesStack {
    pub fn new(channel: &Channel) -> Self {
        Self {
            quote: QuoteClient::new(channel.clone()),
            log: LogClient::new(channel.clone()),
            transaction: TransactionClient::new(channel.clone()),
            trigger: TriggerClient::new(channel.clone()),
        }
    }
}

pub trait DayTraderCall {
    type Response;
    fn execute(client: DayTraderServicesStack) -> Self::Response;
}
