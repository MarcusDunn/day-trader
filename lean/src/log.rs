use serde::{Deserialize, Serialize};
use sqlx::pool::PoolConnection;
use sqlx::types::JsonValue;
use sqlx::{PgExecutor, PgPool, Postgres};

use sqlx::types::time::PrimitiveDateTime;
use tracing::info;

struct DbLogEntry {
    timestamp: PrimitiveDateTime,
    server: String,
    transaction_num: i32,
    username: String,
    log: JsonValue,
}

pub struct Logger {
    pool: PgPool,
    receiver: tokio::sync::mpsc::Receiver<LogEntry>,
}

impl Logger {
    pub fn new(pool: PgPool) -> (Self, tokio::sync::mpsc::Sender<LogEntry>) {
        let channel_size = std::env::var("LOG_CHANNEL_SIZE")
            .unwrap_or_else(|_| "100000".to_string())
            .parse()
            .expect("LOG_CHANNEL_SIZE must be a number");

        let (sender, receiver) = tokio::sync::mpsc::channel(channel_size);
        (Self { pool, receiver }, sender)
    }

    pub async fn run(mut self) -> anyhow::Result<()> {
        let bulk_insert_size = std::env::var("BULK_INSERT_SIZE")
            .unwrap_or_else(|_| "10000".to_string())
            .parse()?;

        let mut timestamp: Vec<PrimitiveDateTime> = Vec::with_capacity(bulk_insert_size);
        let mut server: Vec<String> = Vec::with_capacity(bulk_insert_size);
        let mut transaction_num: Vec<i32> = Vec::with_capacity(bulk_insert_size);
        let mut username: Vec<String> = Vec::with_capacity(bulk_insert_size);
        let mut log: Vec<JsonValue> = Vec::with_capacity(bulk_insert_size);

        loop {
            // reuse the connection if there is more than bulk_insert_size items in the queue
            let mut connection: Option<PoolConnection<Postgres>> = None;

            loop {
                tokio::select! {
                    maybe_next = self.receiver.recv() => {
                        match maybe_next {
                            Some(entry) => {
                                timestamp.push(entry.timestamp);
                                server.push(entry.server);
                                transaction_num.push(entry.transaction_num);
                                username.push(entry.username);
                                log.push(serde_json::to_value(&entry.log)?);

                                if timestamp.len() >= bulk_insert_size {
                                    info!("flushing {} log entries to the database due to a full buffer", timestamp.len());
                                    self.flush_log_buffer(&mut connection, &timestamp, &server, &transaction_num, &username, &log)
                                        .await?;
                                    timestamp.clear();
                                    server.clear();
                                    transaction_num.clear();
                                    username.clear();
                                    log.clear();
                                }
                                continue;
                            }
                            None => {
                                break;
                            }
                        }
                    }
                    _ = tokio::time::sleep(std::time::Duration::from_secs(1)) => {
                        if !timestamp.is_empty() {
                            info!("flushing {} log entries to the database due to 1 second of inactivity", timestamp.len());
                            self.flush_log_buffer(&mut connection, &timestamp, &server, &transaction_num, &username, &log)
                                .await?;
                            timestamp.clear();
                            server.clear();
                            transaction_num.clear();
                            username.clear();
                            log.clear();
                        }
                        break;
                    }
                }
            }
        }
    }

    #[tracing::instrument(skip_all)]
    async fn flush_log_buffer(
        &mut self,
        connection: &mut Option<PoolConnection<Postgres>>,
        timestamp: &Vec<PrimitiveDateTime>,
        server: &Vec<String>,
        transaction_num: &Vec<i32>,
        username: &Vec<String>,
        log: &Vec<JsonValue>,
    ) -> anyhow::Result<()> {
        let mut conn = match connection.take() {
            None => self.pool.acquire().await?,
            Some(c) => c,
        };

        save_log_entry_bulk(&mut conn, timestamp, server, transaction_num, username, log).await?;

        *connection = Some(conn);

        Ok(())
    }
}

#[tracing::instrument(skip_all)]
async fn save_log_entry_bulk(
    pool: impl PgExecutor<'_>,
    timestamp: &Vec<PrimitiveDateTime>,
    server: &Vec<String>,
    transaction_num: &Vec<i32>,
    username: &Vec<String>,
    log: &Vec<JsonValue>,
) -> anyhow::Result<()> {
    sqlx::query!(
        "
    INSERT INTO log_entry (timestamp, server, transaction_num, username, log) 
    SELECT * FROM UNNEST ($1::timestamp[],$2::text[],$3::int[],$4::text[],$5::jsonb[])
    ",
        &timestamp,
        &server,
        &transaction_num,
        &username,
        &log
    )
    .execute(pool)
    .await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::PgPool;

    #[sqlx::test]
    async fn check_bulk_insert(pool: PgPool) -> anyhow::Result<()> {
        let entry1 = LogEntry {
            timestamp: time::macros::datetime!(2020-01-02 03:04:05),
            server: "sheet".to_string(),
            transaction_num: 1,
            username: "daws".to_string(),
            log: Log::UserCommand(UserCommandLog {
                command: CommandType::Quote,
                stock_symbol: None,
                filename: None,
                funds: None,
            }),
        };
        let entry2 = LogEntry {
            timestamp: time::macros::datetime!(2020-01-02 03:04:05),
            server: "yeet".to_string(),
            transaction_num: 1,
            username: "marcus".to_string(),
            log: Log::UserCommand(UserCommandLog {
                command: CommandType::Add,
                stock_symbol: None,
                filename: None,
                funds: None,
            }),
        };

        let entry1_clone = entry1.clone();
        let entry2_clone = entry2.clone();

        save_log_entry_bulk(
            &pool,
            &vec![entry1_clone.timestamp, entry2_clone.timestamp],
            &vec![entry1_clone.server, entry2_clone.server],
            &vec![entry1_clone.transaction_num, entry2_clone.transaction_num],
            &vec![entry1_clone.username, entry2_clone.username],
            &vec![
                serde_json::to_value(&entry1_clone.log)?,
                serde_json::to_value(&entry2_clone.log)?,
            ],
        )
        .await
        .expect("failed to save log entries");

        let entries = sqlx::query_as!(
            DbLogEntry,
            "SELECT timestamp, server, transaction_num, username, log FROM log_entry"
        )
        .fetch_all(&pool)
        .await
        .expect("failed to fetch log entries");

        let mut iter = entries.into_iter().map(LogEntry::try_from);
        let db_entry1 = iter.next().expect("expected 2 entries")?;
        let db_entry2 = iter.next().expect("expected 2 entries")?;

        assert_eq!(db_entry1, entry1);
        assert_eq!(db_entry2, entry2);

        Ok(())
    }
}

impl TryFrom<DbLogEntry> for LogEntry {
    type Error = serde_json::Error;

    fn try_from(value: DbLogEntry) -> Result<Self, Self::Error> {
        Ok(LogEntry {
            timestamp: value.timestamp,
            server: value.server,
            transaction_num: value.transaction_num,
            username: value.username,
            log: serde_json::from_value(value.log)?,
        })
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct LogEntry {
    pub timestamp: PrimitiveDateTime,
    pub server: String,
    // todo - add this to CLI
    pub transaction_num: i32,
    pub username: String,
    pub log: Log,
}

impl LogEntry {
    pub fn new(transaction_num: i32, username: String, log: Log) -> Self {
        let now = time::OffsetDateTime::now_utc();
        Self {
            timestamp: PrimitiveDateTime::new(now.date(), now.time()),
            server: String::from("legacy"),
            transaction_num,
            username,
            log,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub enum Log {
    UserCommand(UserCommandLog),
    QuoteServerHits(QuoteServerLog),
    AccountChanges(AccountTransactionLog),
    SystemEvents(SystemEventLog),
    ErrorMessages(ErrorEventLog),
    DebugMessages(DebugLog),
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct UserCommandLog {
    pub command: CommandType,
    pub stock_symbol: Option<String>,
    pub filename: Option<String>,
    pub funds: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Hash, Clone)]
pub enum CommandType {
    Add,
    Quote,
    Buy,
    CommitBuy,
    CancelBuy,
    Sell,
    CommitSell,
    CancelSell,
    SetBuyAmount,
    CancelSetBuy,
    SetBuyTrigger,
    SetSellAmount,
    SetSellTrigger,
    CancelSetSell,
    DumpLog,
    DisplaySummary,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct QuoteServerLog {
    pub price: f64,
    pub stock_symbol: String,
    pub quote_server_time: u64,
    pub cryptokey: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct AccountTransactionLog {
    pub action: String,
    pub funds: f64,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct SystemEventLog {
    pub command: CommandType,
    pub stock_symbol: Option<String>,
    pub filename: Option<String>,
    pub funds: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct ErrorEventLog {
    pub command: CommandType,
    pub stock_symbol: Option<String>,
    pub filename: Option<String>,
    pub funds: Option<f64>,
    pub error_message: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct DebugLog {
    pub command: CommandType,
    pub stock_symbol: Option<String>,
    pub filename: Option<String>,
    pub funds: Option<f64>,
    pub debug_message: Option<String>,
}

pub use dump_log::dump_log;

mod dump_log;

pub use dump_log_user::dump_log_user;

mod dump_log_user;
