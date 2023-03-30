
use crate::protos::quote_client::QuoteClient;
use tonic::transport::Channel;
use crate::protos::day_trader_client::DayTraderClient;

#[derive(Clone)]
pub struct DayTraderServicesStack {
    pub quote: QuoteClient<Channel>,
    pub day_trader: DayTraderClient<Channel>,
}

impl DayTraderServicesStack {
    pub fn new(channel: &Channel) -> Self {
        Self {
            quote: QuoteClient::new(channel.clone()),
            day_trader: DayTraderClient::new(channel.clone()),
        }
    }
}

pub trait DayTraderCall {
    type Response;
    fn execute(client: DayTraderServicesStack) -> Self::Response;
}
