use crate::log::{DbLogEntry, Log, LogEntry};
use crate::proto::{AccountTransaction, DisplaySummaryResponse, UserCommand};
use futures::StreamExt;
use sqlx::PgPool;

#[tracing::instrument(skip(pool))]
pub async fn display_summary(
    pool: &PgPool,
    user_id: &str,
) -> anyhow::Result<DisplaySummaryResponse> {
    sqlx::query_as!(
        DbLogEntry,
        "SELECT * FROM log_entry WHERE username = $1",
        user_id
    )
    .fetch(pool)
    .fold(
        Ok(DisplaySummaryResponse {
            user_commands: vec![],
            account_transactions: vec![],
        }),
        |resp, entry| async move {
            let mut resp = resp?;
            let entry = entry
                .map_err(|e| anyhow::anyhow!(e).context("Failed to fetch log entry"))
                .and_then(|log| {
                    LogEntry::try_from(log)
                        .map_err(|e| anyhow::anyhow!(e).context("failed to parse from db"))
                })?;

            match entry.log {
                Log::UserCommand(command) => {
                    resp.user_commands.push(UserCommand {
                        transaction_num: entry.transaction_num,
                        timestamp: entry.timestamp.assume_utc().unix_timestamp().try_into()?,
                        server: entry.server,
                        command: command.command.into(),
                        username: entry.username,
                        stock_symbol: command
                            .stock_symbol
                            .unwrap_or_else(|| "no stock symbol".to_string()),
                        funds: command.funds.unwrap_or(0.0),
                    });
                }
                Log::AccountChanges(transaction) => {
                    resp.account_transactions.push(AccountTransaction {
                        transaction_num: entry.transaction_num,
                        timestamp: entry.timestamp.assume_utc().unix_timestamp().try_into()?,
                        server: entry.server,
                        action: transaction.action,
                        username: entry.username,
                        funds: transaction.funds,
                    });
                }
                _ => {}
            }
            Ok(resp)
        },
    )
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[sqlx::test]
    async fn test_account_empty(pool: PgPool) -> anyhow::Result<()> {
        let resp = display_summary(&pool, "marcus").await?;
        assert_eq!(resp.user_commands.len(), 0);
        assert_eq!(resp.account_transactions.len(), 0);
        Ok(())
    }
}
