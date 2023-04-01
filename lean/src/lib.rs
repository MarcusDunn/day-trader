use anyhow::anyhow;
use sqlx::{PgPool, Postgres, Transaction};
use tokio::sync::mpsc::Sender;
use tonic::transport::channel::Channel;
use tonic::{Request, Response, Status};
use tracing::{error, warn};

use crate::proto::day_trader_server::DayTrader;
use crate::proto::quote_client::QuoteClient;
use crate::proto::{
    AddRequest, AddResponse, BuyRequest, BuyResponse, CancelBuyRequest, CancelBuyResponse,
    CancelSellRequest, CancelSellResponse, CancelSetBuyRequest, CancelSetBuyResponse,
    CancelSetSellRequest, CancelSetSellResponse, CommitBuyRequest, CommitBuyResponse,
    CommitSellRequest, CommitSellResponse, DisplaySummaryRequest, DisplaySummaryResponse,
    DumpLogRequest, DumpLogResponse, DumpLogUserRequest, DumpLogUserResponse, QuoteRequest,
    QuoteRequestSimple, QuoteResponse, SellRequest, SellResponse, SetBuyAmountRequest,
    SetBuyAmountResponse, SetBuyTriggerRequest, SetBuyTriggerResponse, SetSellAmountRequest,
    SetSellAmountResponse, SetSellTriggerRequest, SetSellTriggerResponse,
};

#[tracing::instrument(skip_all)]
async fn begin_transaction(pool: &PgPool) -> sqlx::Result<Transaction<'static, Postgres>> {
    pool.begin().await
}

#[tracing::instrument(skip_all)]
async fn commit_transaction(transaction: Transaction<'static, Postgres>) -> sqlx::Result<()> {
    transaction.commit().await
}

pub mod proto {
    tonic::include_proto!("day_trader");
}

use crate::log::{CommandType, ErrorEventLog, Log, LogEntry, QuoteServerLog, UserCommandLog};
use crate::trigger::{Triggerer, UpdatedPrice};
use log::Logger;

mod trigger;

mod sell;

mod buy;

mod add;

mod log;

mod audit {}

pub struct DayTraderImpl {
    postgres: PgPool,
    quote: CachedQuote,
    log_sender: Sender<LogEntry>,
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    async fn log_cancel_set_sell_request(
        &self,
        CancelSetSellRequest {
            user_id,
            stock_symbol,
            request_num,
        }: CancelSetSellRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::CancelSetSell,
                stock_symbol: Some(stock_symbol),
                funds: None,
                filename: None,
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    async fn log_set_sell_trigger_request(
        &self,
        SetSellTriggerRequest {
            user_id,
            stock_symbol,
            amount,
            request_num,
        }: SetSellTriggerRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::SetSellTrigger,
                stock_symbol: Some(stock_symbol),
                funds: Some(amount),
                filename: None,
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    pub async fn log_set_sell_amount_request(
        &self,
        SetSellAmountRequest {
            user_id,
            stock_symbol,
            amount,
            request_num,
        }: SetSellAmountRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::SetSellAmount,
                stock_symbol: Some(stock_symbol),
                funds: Some(amount),
                filename: None,
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    async fn log_set_buy_trigger_request(
        &self,
        SetBuyTriggerRequest {
            user_id,
            stock_symbol,
            amount,
            request_num,
        }: SetBuyTriggerRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::SetBuyTrigger,
                stock_symbol: Some(stock_symbol),
                funds: Some(amount),
                filename: None,
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    pub async fn log_cancel_set_buy_request(
        &self,
        CancelSetBuyRequest {
            user_id,
            stock_symbol,
            request_num,
        }: CancelSetBuyRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::CancelSetBuy,
                stock_symbol: Some(stock_symbol),
                funds: None,
                filename: None,
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    pub async fn log_set_buy_amount_request(
        &self,
        SetBuyAmountRequest {
            user_id,
            stock_symbol,
            amount,
            request_num,
        }: SetBuyAmountRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::SetBuyAmount,
                stock_symbol: Some(stock_symbol),
                funds: Some(amount),
                filename: None,
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    async fn log_cancel_sell_request(
        &self,
        CancelSellRequest {
            user_id,
            request_num,
        }: CancelSellRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::CancelSell,
                stock_symbol: None,
                funds: None,
                filename: None,
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    pub async fn log_commit_sell_request(
        &self,
        CommitSellRequest {
            user_id,
            request_num,
        }: CommitSellRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::CommitSell,
                stock_symbol: None,
                funds: None,
                filename: None,
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    async fn log_sell_request(
        &self,
        SellRequest {
            user_id,
            stock_symbol,
            amount,
            request_num,
        }: SellRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::Sell,
                stock_symbol: Some(stock_symbol),
                funds: Some(amount),
                filename: None,
            }),
        );

        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    async fn log_cancel_buy_request(
        &self,
        CancelBuyRequest {
            user_id,
            request_num,
        }: &CancelBuyRequest,
    ) {
        let log_entry = LogEntry::new(
            *request_num,
            user_id.to_string(),
            Log::UserCommand(UserCommandLog {
                command: CommandType::CancelBuy,
                stock_symbol: None,
                funds: None,
                filename: None,
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    async fn log_dump_log_request(
        &self,
        DumpLogRequest {
            filename,
            request_num,
        }: &DumpLogRequest,
    ) {
        let log_entry = LogEntry::new(
            *request_num,
            "ADMIN".to_string(),
            Log::UserCommand(UserCommandLog {
                command: CommandType::DumpLog,
                stock_symbol: None,
                funds: None,
                filename: Some(filename.clone()),
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    async fn log_commit_buy_request(
        &self,
        CommitBuyRequest {
            user_id,
            request_num,
        }: CommitBuyRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::CommitBuy,
                stock_symbol: None,
                filename: None,
                funds: None,
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    async fn log_buy_request(
        &self,
        BuyRequest {
            user_id,
            stock_symbol,
            amount,
            request_num,
        }: BuyRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::Buy,
                stock_symbol: Some(stock_symbol),
                filename: None,
                funds: Some(amount),
            }),
        );

        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    #[tracing::instrument(skip_all)]
    async fn log_add_request(
        &self,
        AddRequest {
            user_id,
            amount,
            request_num,
        }: AddRequest,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::UserCommand(UserCommandLog {
                command: CommandType::Add,
                stock_symbol: None,
                filename: None,
                funds: Some(amount),
            }),
        );
        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

struct CachedQuote {
    cache: moka::future::Cache<String, f64>,
    quote: QuoteClient<Channel>,
    quote_update_sender: Sender<UpdatedPrice>,
    log_sender: Sender<LogEntry>,
}

impl CachedQuote {
    pub fn new(
        quote: QuoteClient<Channel>,
        quote_update_sender: Sender<UpdatedPrice>,
        log_sender: Sender<LogEntry>,
    ) -> Self {
        Self {
            cache: moka::future::Cache::new(100_000),
            quote,
            quote_update_sender,
            log_sender,
        }
    }

    #[tracing::instrument(skip(self))]
    async fn get_quote_maybe_cached(
        &self,
        request_num: i32,
        user_id: String,
        stock_symbol: String,
    ) -> anyhow::Result<f64> {
        self.cache
            .optionally_get_with(
                stock_symbol.clone(),
                self.quote_server_quote(
                    self.log_sender.clone(),
                    request_num,
                    user_id,
                    stock_symbol,
                ),
            )
            .await
            .ok_or_else(|| {
                error!("failed to get quote");
                anyhow!("failed to get quote")
            })
    }

    #[tracing::instrument(skip_all)]
    async fn quote_server_quote(
        &self,
        sender: Sender<LogEntry>,
        request_num: i32,
        user_id: String,
        stock_symbol: String,
    ) -> Option<f64> {
        warn!("cache miss for {stock_symbol}");

        let result = match self
            .quote
            .clone()
            .quote(QuoteRequest {
                user_id,
                stock_symbol: stock_symbol.clone(),
                request_num,
            })
            .await
        {
            Ok(quote_response) => {
                let quote_response = quote_response.into_inner();
                let quote = quote_response.quote;

                Self::log_quote_server_hit(sender, request_num, quote_response).await;

                Some(quote)
            }
            Err(e) => {
                error!("failed to get quote: {e}");
                None
            }
        };

        if let Some(result) = result {
            self.send_quote_update(stock_symbol, result).await;
        };

        result
    }

    #[tracing::instrument(skip_all)]
    async fn send_quote_update(&self, stock_symbol: String, result: f64) {
        if let Err(err) = self
            .quote_update_sender
            .send(UpdatedPrice {
                symbol: stock_symbol.to_string(),
                price: result,
            })
            .await
        {
            error!("failed to send quote update: {err}");
        }
    }

    #[tracing::instrument(skip_all)]
    async fn log_quote_server_hit(
        sender: Sender<LogEntry>,
        request_num: i32,
        QuoteResponse {
            quote,
            sym,
            user_id,
            timestamp,
            crypto_key,
        }: QuoteResponse,
    ) {
        let log_entry = LogEntry::new(
            request_num,
            user_id,
            Log::QuoteServerHits(QuoteServerLog {
                price: quote,
                stock_symbol: sym,
                quote_server_time: timestamp,
                cryptokey: crypto_key,
            }),
        );

        if sender.send(log_entry).await.is_err() {
            error!("failed to send log entry");
        };
    }
}

impl DayTraderImpl {
    async fn report_error(&self, request_num: i32, error_event_log: ErrorEventLog) {
        let log_entry = LogEntry::new(
            request_num,
            "legacy".to_string(),
            Log::ErrorMessages(error_event_log),
        );

        if let Err(err) = self.log_sender.send(log_entry).await {
            error!("failed to send log entry: {err}");
        }
    }
}

impl DayTraderImpl {
    pub fn new(postgres: PgPool, quote: QuoteClient<Channel>) -> Self {
        let (logger, log_sender) = Logger::new(postgres.clone());
        let (triggerer, quote_update_sender) = Triggerer::new(postgres.clone());

        tokio::spawn(logger.run());
        tokio::spawn(triggerer.run());

        Self {
            postgres,
            quote: CachedQuote::new(quote, quote_update_sender, log_sender.clone()),
            log_sender,
        }
    }

    #[tracing::instrument(skip_all)]
    async fn log_quote_request(
        &self,
        QuoteRequest {
            user_id,
            stock_symbol,
            request_num,
        }: &QuoteRequest,
    ) {
        let log_entry = LogEntry::new(
            *request_num,
            user_id.clone(),
            Log::UserCommand(UserCommandLog {
                command: CommandType::Quote,
                stock_symbol: Some(stock_symbol.clone()),
                filename: None,
                funds: None,
            }),
        );
        if self.log_sender.send(log_entry).await.is_err() {
            error!("failed to send log entry");
        }
    }
}

#[tonic::async_trait]
impl DayTrader for DayTraderImpl {
    #[tracing::instrument(skip_all, name = "grpc_dump_log_user")]
    async fn dump_log_user(
        &self,
        _request: Request<DumpLogUserRequest>,
    ) -> Result<Response<DumpLogUserResponse>, Status> {
        Err(Status::unimplemented("not implemented".to_string()))
    }

    #[tracing::instrument(skip_all, name = "grpc_dump_log")]
    async fn dump_log(
        &self,
        request: Request<DumpLogRequest>,
    ) -> Result<Response<DumpLogResponse>, Status> {
        let dump_log_request = request.into_inner();

        self.log_dump_log_request(&dump_log_request).await;

        let DumpLogRequest {
            filename,
            request_num,
        } = dump_log_request;

        match log::dump_log(&self.postgres, &filename.clone()).await {
            Ok(()) => Ok(Response::new(DumpLogResponse {
                xml: "check the file system".to_string(),
            })),
            Err(e) => {
                self.report_error(
                    request_num,
                    ErrorEventLog {
                        command: CommandType::DumpLog,
                        stock_symbol: None,
                        filename: Some(filename),
                        funds: None,
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                error!("failed to dump log: {e}");
                Err(Status::internal("failed to dump log".to_string()))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_display_summary")]
    async fn display_summary(
        &self,
        _request: Request<DisplaySummaryRequest>,
    ) -> Result<Response<DisplaySummaryResponse>, Status> {
        Err(Status::unimplemented("not implemented".to_string()))
    }

    #[tracing::instrument(skip_all, name = "grpc_add")]
    async fn add(&self, request: Request<AddRequest>) -> Result<Response<AddResponse>, Status> {
        let add_request = request.into_inner();
        let log = self.log_add_request(add_request.clone());

        let AddRequest {
            user_id, amount, ..
        } = add_request;

        let add = add::add(&self.postgres, &user_id, amount);

        let ((), add) = tokio::join!(log, add);

        match add {
            Ok(()) => Ok(Response::new(AddResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::Add,
                        stock_symbol: None,
                        filename: None,
                        funds: Some(amount),
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!("failed to add funds: {}", e)))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_buy")]
    async fn buy(&self, request: Request<BuyRequest>) -> Result<Response<BuyResponse>, Status> {
        let buy_request = request.into_inner();

        let log = self.log_buy_request(buy_request.clone());

        let BuyRequest {
            user_id,
            stock_symbol,
            amount,
            request_num,
        } = buy_request;

        let init_buy = async {
            let quote = self
                .quote
                .get_quote_maybe_cached(request_num, user_id.clone(), stock_symbol.clone())
                .await
                .map_err(|err| {
                    error!("failed to get quote: {}", err);
                    Status::internal(err.to_string())
                })?;

            buy::init_buy(&self.postgres, &user_id, &stock_symbol, quote, amount)
                .await
                .map_err(|err| {
                    error!("failed to buy: {}", err);
                    Status::internal(err.to_string())
                })?;

            Ok::<(), Status>(())
        };

        let ((), init_buy) = tokio::join!(log, init_buy);

        match init_buy {
            Ok(()) => Ok(Response::new(BuyResponse {})),
            Err(e) => {
                self.report_error(
                    request_num,
                    ErrorEventLog {
                        command: CommandType::Buy,
                        stock_symbol: Some(stock_symbol),
                        filename: None,
                        funds: Some(amount),
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!("failed to buy: {}", e)))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_commit_buy")]
    async fn commit_buy(
        &self,
        request: Request<CommitBuyRequest>,
    ) -> Result<Response<CommitBuyResponse>, Status> {
        let commit_buy_request = request.into_inner();

        let log = self.log_commit_buy_request(commit_buy_request.clone());

        let commit_buy = buy::commit_buy(&self.postgres, &commit_buy_request.user_id);

        let ((), commit_buy) = tokio::join!(log, commit_buy);

        match commit_buy {
            Ok(()) => Ok(Response::new(CommitBuyResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::CommitBuy,
                        stock_symbol: None,
                        filename: None,
                        funds: None,
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!("failed to commit buy: {}", e)))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_cancel_buy")]
    async fn cancel_buy(
        &self,
        request: Request<CancelBuyRequest>,
    ) -> Result<Response<CancelBuyResponse>, Status> {
        let cancel_buy_request = request.into_inner();

        let log = self.log_cancel_buy_request(&cancel_buy_request);

        let cancel = buy::cancel_buy(&self.postgres, &cancel_buy_request.user_id);

        let ((), cancel) = tokio::join!(log, cancel);

        match cancel {
            Ok(()) => Ok(Response::new(CancelBuyResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::CancelBuy,
                        stock_symbol: None,
                        filename: None,
                        funds: None,
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!("failed to cancel buy: {}", e)))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_sell")]
    async fn sell(&self, request: Request<SellRequest>) -> Result<Response<SellResponse>, Status> {
        let sell_request = request.into_inner();

        let log = self.log_sell_request(sell_request.clone());

        let SellRequest {
            user_id,
            stock_symbol,
            amount,
            request_num,
        } = sell_request;

        let init_sell = async {
            let quote = self
                .quote
                .get_quote_maybe_cached(request_num, user_id.clone(), stock_symbol.clone())
                .await
                .map_err(|err| {
                    error!("failed to get quote: {}", err);
                    Status::internal(err.to_string())
                })?;

            sell::init_sell(&self.postgres, &user_id, &stock_symbol, quote, amount)
                .await
                .map_err(|err| {
                    error!("failed to sell: {}", err);
                    Status::internal(err.to_string())
                })?;

            Ok::<(), Status>(())
        };

        let ((), init_sell) = tokio::join!(log, init_sell);

        match init_sell {
            Ok(()) => Ok(Response::new(SellResponse {})),
            Err(e) => {
                self.report_error(
                    request_num,
                    ErrorEventLog {
                        command: CommandType::Sell,
                        stock_symbol: Some(stock_symbol),
                        filename: None,
                        funds: Some(amount),
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!("failed to sell: {}", e)))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_commit_sell")]
    async fn commit_sell(
        &self,
        request: Request<CommitSellRequest>,
    ) -> Result<Response<CommitSellResponse>, Status> {
        let commit_sell_request = request.into_inner();

        let log = self.log_commit_sell_request(commit_sell_request.clone());

        let commit_sell = sell::commit_sell(&self.postgres, commit_sell_request.user_id);

        let ((), commit_sell) = tokio::join!(log, commit_sell);

        match commit_sell {
            Ok(()) => Ok(Response::new(CommitSellResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::CommitSell,
                        stock_symbol: None,
                        filename: None,
                        funds: None,
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!("failed to commit sell: {}", e)))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_cancel_sell")]
    async fn cancel_sell(
        &self,
        request: Request<CancelSellRequest>,
    ) -> Result<Response<CancelSellResponse>, Status> {
        let cancel_sell_request = request.into_inner();

        let log = self.log_cancel_sell_request(cancel_sell_request.clone());

        let cancel_sell = sell::cancel_sell(&self.postgres, cancel_sell_request.user_id);

        let ((), cancel_sell) = tokio::join!(log, cancel_sell);

        match cancel_sell {
            Ok(()) => Ok(Response::new(CancelSellResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::CancelSell,
                        stock_symbol: None,
                        filename: None,
                        funds: None,
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!("failed to cancel sell: {}", e)))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_set_buy_amount")]
    async fn set_buy_amount(
        &self,
        request: Request<SetBuyAmountRequest>,
    ) -> Result<Response<SetBuyAmountResponse>, Status> {
        let set_buy_amount_request = request.into_inner();

        let log = self.log_set_buy_amount_request(set_buy_amount_request.clone());

        let SetBuyAmountRequest {
            user_id,
            stock_symbol,
            amount,
            ..
        } = set_buy_amount_request;

        let set_buy_amount =
            trigger::set_buy_amount(&self.postgres, &user_id, &stock_symbol, amount);

        let ((), set_buy_amount) = tokio::join!(log, set_buy_amount);

        match set_buy_amount {
            Ok(()) => Ok(Response::new(SetBuyAmountResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::SetBuyAmount,
                        stock_symbol: Some(stock_symbol),
                        filename: None,
                        funds: Some(amount),
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!("failed to set buy amount: {}", e)))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_cancel_set_buy")]
    async fn cancel_set_buy(
        &self,
        request: Request<CancelSetBuyRequest>,
    ) -> Result<Response<CancelSetBuyResponse>, Status> {
        let cancel_set_buy_request = request.into_inner();

        let log = self.log_cancel_set_buy_request(cancel_set_buy_request.clone());

        let CancelSetBuyRequest {
            user_id,
            stock_symbol,
            ..
        } = cancel_set_buy_request;

        let cancel_set_buy = trigger::cancel_set_buy(&self.postgres, &user_id, &stock_symbol);

        let ((), cancel_set_buy) = tokio::join!(log, cancel_set_buy);

        match cancel_set_buy {
            Ok(()) => Ok(Response::new(CancelSetBuyResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::CancelSetBuy,
                        stock_symbol: Some(stock_symbol),
                        filename: None,
                        funds: None,
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!("failed to cancel set buy: {}", e)))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_set_buy_trigger")]
    async fn set_buy_trigger(
        &self,
        request: Request<SetBuyTriggerRequest>,
    ) -> Result<Response<SetBuyTriggerResponse>, Status> {
        let set_buy_trigger_request = request.into_inner();

        let log = self.log_set_buy_trigger_request(set_buy_trigger_request.clone());

        let SetBuyTriggerRequest {
            user_id,
            stock_symbol,
            amount,
            ..
        } = set_buy_trigger_request;

        let set_buy_trigger =
            trigger::set_buy_trigger(&self.postgres, &user_id, &stock_symbol, amount);

        let ((), set_buy_trigger) = tokio::join!(log, set_buy_trigger);

        match set_buy_trigger {
            Ok(()) => Ok(Response::new(SetBuyTriggerResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::SetBuyTrigger,
                        stock_symbol: Some(stock_symbol),
                        filename: None,
                        funds: Some(amount),
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!(
                    "failed to set buy trigger: {}",
                    e
                )))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_set_sell_amount")]
    async fn set_sell_amount(
        &self,
        request: Request<SetSellAmountRequest>,
    ) -> Result<Response<SetSellAmountResponse>, Status> {
        let set_sell_amount_request = request.into_inner();

        let log = self.log_set_sell_amount_request(set_sell_amount_request.clone());

        let SetSellAmountRequest {
            user_id,
            stock_symbol,
            amount,
            ..
        } = set_sell_amount_request;

        let set_sell_amount =
            trigger::set_sell_amount(&self.postgres, &user_id, &stock_symbol, amount);

        let ((), set_sell_amount) = tokio::join!(log, set_sell_amount);

        match set_sell_amount {
            Ok(()) => Ok(Response::new(SetSellAmountResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::SetSellAmount,
                        stock_symbol: Some(stock_symbol),
                        filename: None,
                        funds: Some(amount),
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!(
                    "failed to set sell amount: {}",
                    e
                )))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_set_sell_trigger")]
    async fn set_sell_trigger(
        &self,
        request: Request<SetSellTriggerRequest>,
    ) -> Result<Response<SetSellTriggerResponse>, Status> {
        let set_sell_trigger_request = request.into_inner();

        let log = self.log_set_sell_trigger_request(set_sell_trigger_request.clone());

        let SetSellTriggerRequest {
            user_id,
            stock_symbol,
            amount,
            ..
        } = set_sell_trigger_request;

        let set_sell_trigger =
            trigger::set_sell_trigger(&self.postgres, &user_id, &stock_symbol, amount);

        let ((), set_sell_trigger) = tokio::join!(log, set_sell_trigger);

        match set_sell_trigger {
            Ok(()) => Ok(Response::new(SetSellTriggerResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::SetSellTrigger,
                        stock_symbol: Some(stock_symbol),
                        filename: None,
                        funds: Some(amount),
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!(
                    "failed to set sell trigger: {}",
                    e
                )))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_cancel_set_sell")]
    async fn cancel_set_sell(
        &self,
        request: Request<CancelSetSellRequest>,
    ) -> Result<Response<CancelSetSellResponse>, Status> {
        let cancel_set_sell_request = request.into_inner();

        let log = self.log_cancel_set_sell_request(cancel_set_sell_request.clone());

        let CancelSetSellRequest {
            user_id,
            stock_symbol,
            ..
        } = cancel_set_sell_request;

        let cancel_set_sell = trigger::cancel_set_sell(&self.postgres, &user_id, &stock_symbol);

        let ((), cancel_set_sell) = tokio::join!(log, cancel_set_sell);

        match cancel_set_sell {
            Ok(()) => Ok(Response::new(CancelSetSellResponse {})),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::CancelSetSell,
                        stock_symbol: Some(stock_symbol),
                        filename: None,
                        funds: None,
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!(
                    "failed to cancel set sell: {}",
                    e
                )))
            }
        }
    }

    #[tracing::instrument(skip_all, name = "grpc_quote")]
    async fn quote(
        &self,
        request: Request<QuoteRequest>,
    ) -> Result<Response<QuoteRequestSimple>, Status> {
        let quote_request = request.into_inner();
        let log = self.log_quote_request(&quote_request);

        let QuoteRequest {
            user_id,
            stock_symbol,
            request_num,
        } = quote_request;

        let quote = self
            .quote
            .get_quote_maybe_cached(request_num, user_id, stock_symbol.clone());

        let ((), quote) = tokio::join!(log, quote);

        match quote {
            Ok(quote) => Ok(Response::new(QuoteRequestSimple { price: quote.price })),
            Err(e) => {
                self.report_error(
                    0,
                    ErrorEventLog {
                        command: CommandType::Quote,
                        stock_symbol: Some(stock_symbol),
                        filename: None,
                        funds: None,
                        error_message: Some(e.to_string()),
                    },
                )
                .await;
                Err(Status::internal(format!("failed to get quote: {}", e)))
            }
        }
    }
}
