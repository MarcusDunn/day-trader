pub use cancel_buy::cancel_buy;
pub use commit_buy::commit_buy;
pub use init_buy::init_buy;

mod cancel_buy;
mod commit_buy;
mod init_buy;

#[cfg(test)]
mod tests {
    use pretty_assertions::assert_eq;
    use sqlx::PgPool;
    use time::PrimitiveDateTime;

    use crate::buy::cancel_buy::cancel_buy;
    use crate::buy::init_buy::init_buy;

    use super::*;

    #[sqlx::test]
    async fn test_init_no_user(pool: PgPool) -> anyhow::Result<()> {
        let response = init_buy(&pool, "marcus", "APPL", 50_f64, 100_f64).await;
        assert!(response.is_err(), "expected error but was {response:?}");
        Ok(())
    }

    #[derive(Debug, PartialEq)]
    struct Balance {
        balance: f64,
    }

    #[derive(Debug, PartialEq)]
    struct QueuedBuyNoTime {
        user_id: String,
        stock_symbol: String,
        quoted_price: f64,
        amount_dollars: f64,
    }

    #[sqlx::test]
    async fn test_sufficient_funds(pool: PgPool) -> anyhow::Result<()> {
        let _log = crate::add::add(&pool, "marcus", 100_f64).await?;
        let buy = init_buy(&pool, "marcus", "APPL", 50_f64, 100_f64).await;

        assert!(buy.is_ok(), "expected ok but was {buy:?}");

        let Balance { balance } = sqlx::query_as!(
            Balance,
            "SELECT balance FROM trader WHERE user_id = 'marcus'"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(balance, 0_f64, "expected balance to be 0 but was {balance}");

        let queued_buy = sqlx::query_as!(
            QueuedBuyNoTime,
            "SELECT user_id, stock_symbol, quoted_price, amount_dollars FROM queued_buy WHERE user_id = 'marcus'"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(
            queued_buy,
            QueuedBuyNoTime {
                user_id: String::from("marcus"),
                stock_symbol: String::from("APPL"),
                quoted_price: 50_f64,
                amount_dollars: 100_f64,
            }
        );

        Ok(())
    }

    #[sqlx::test]
    async fn test_insufficient_funds(pool: PgPool) -> anyhow::Result<()> {
        let _log = crate::add::add(&pool, "marcus", 100_f64).await?;
        let buy = init_buy(&pool, "marcus", "AAPL", 50_f64, 200_f64).await;
        assert!(buy.is_err(), "expected error but was {buy:?}");
        Ok(())
    }

    #[sqlx::test]
    async fn test_override_queued_buy(pool: PgPool) -> anyhow::Result<()> {
        let _log = crate::add::add(&pool, "marcus", 400_f64).await?;
        let _log = init_buy(&pool, "marcus", "AAPL", 50_f64, 200_f64).await?;

        let buy = init_buy(&pool, "marcus", "TSLA", 50_f64, 100_f64).await;

        assert!(buy.is_ok(), "expected ok but was {buy:?}");

        let Balance { balance } = sqlx::query_as!(
            Balance,
            "SELECT balance FROM trader WHERE user_id = 'marcus'"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(
            balance, 300_f64,
            "expected balance to be 300 but was {balance}"
        );

        let queued_buy = sqlx::query_as!(
            QueuedBuyNoTime,
            "SELECT user_id, stock_symbol, quoted_price, amount_dollars FROM queued_buy WHERE user_id = 'marcus'"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(
            queued_buy,
            QueuedBuyNoTime {
                user_id: String::from("marcus"),
                stock_symbol: String::from("TSLA"),
                quoted_price: 50_f64,
                amount_dollars: 100_f64,
            }
        );

        Ok(())
    }

    #[sqlx::test]
    async fn init_buy_removes_funds(pool: PgPool) -> anyhow::Result<()> {
        let _log = crate::add::add(&pool, "marcus", 400_f64).await?;
        let _log = init_buy(&pool, "marcus", "AAPL", 50_f64, 200_f64).await?;

        let Balance { balance } = sqlx::query_as!(
            Balance,
            "SELECT balance FROM trader WHERE user_id = 'marcus'"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(
            balance, 200_f64,
            "expected balance to be 200 but was {balance}"
        );

        Ok(())
    }

    #[sqlx::test]
    async fn commit_buy_no_buy(pool: PgPool) -> anyhow::Result<()> {
        let buy = commit_buy(&pool, "marcus").await;
        assert!(buy.is_err(), "expected error but was {buy:?}");
        Ok(())
    }

    #[derive(Debug, PartialEq)]
    struct Stock {
        owner_id: String,
        stock_symbol: String,
        amount: f64,
    }

    #[derive(Debug, PartialEq)]
    struct QueuedBuy {
        user_id: String,
        stock_symbol: String,
        quoted_price: f64,
        amount_dollars: f64,
        time_created: PrimitiveDateTime,
    }

    #[sqlx::test]
    async fn commit_buy_with_buy(pool: PgPool) -> anyhow::Result<()> {
        let _log = crate::add::add(&pool, "marcus", 400_f64).await?;
        let _log = init_buy(&pool, "marcus", "AAPL", 50_f64, 200_f64).await?;
        let buy = commit_buy(&pool, "marcus").await;
        assert!(buy.is_ok(), "expected error but was {buy:?}");

        let queued_buy = sqlx::query_as!(
            QueuedBuy,
            "SELECT * FROM queued_buy WHERE user_id = 'marcus'"
        )
        .fetch_optional(&pool)
        .await?;

        assert_eq!(queued_buy, None);

        let appl = sqlx::query_as!(
            Stock,
            "SELECT * FROM stock WHERE owner_id = 'marcus' AND stock_symbol = 'AAPL'"
        )
        .fetch_optional(&pool)
        .await?;

        assert_eq!(
            appl,
            Some(Stock {
                owner_id: String::from("marcus"),
                stock_symbol: String::from("AAPL"),
                amount: 4_f64,
            })
        );

        Ok(())
    }

    #[sqlx::test]
    async fn commit_timed_out_buy(pool: PgPool) -> anyhow::Result<()> {
        let _log = crate::add::add(&pool, "marcus", 400_f64).await?;

        let _log = init_buy(&pool, "marcus", "AAPL", 50_f64, 200_f64).await?;

        sqlx::query!("UPDATE queued_buy SET time_created = time_created - interval '6 minutes' WHERE user_id = 'marcus'")
            .execute(&pool)
            .await?;

        let buy = commit_buy(&pool, "marcus").await;

        assert!(buy.is_err(), "expected error but was {buy:?}");

        let queued_buy = sqlx::query_as!(
            QueuedBuy,
            "SELECT * FROM queued_buy WHERE user_id = 'marcus'"
        )
        .fetch_optional(&pool)
        .await?;

        assert_eq!(queued_buy, None);

        let Balance { balance } = sqlx::query_as!(
            Balance,
            "SELECT balance FROM trader WHERE user_id = 'marcus'"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(balance, 400_f64);

        Ok(())
    }

    #[sqlx::test]
    async fn test_cancel_buy_with_no_pending_buy(pool: PgPool) -> anyhow::Result<()> {
        let cancel = cancel_buy(&pool, "marcus").await;
        assert!(cancel.is_err(), "expected error but was {cancel:?}");
        Ok(())
    }

    #[sqlx::test]
    async fn test_cancel_buy_with_pending_buy(pool: PgPool) -> anyhow::Result<()> {
        let _log = crate::add::add(&pool, "marcus", 400_f64).await?;
        let _log = init_buy(&pool, "marcus", "AAPL", 50_f64, 200_f64).await?;
        let cancel = cancel_buy(&pool, "marcus").await;
        assert!(cancel.is_ok(), "expected ok but was {cancel:?}");

        let queued_buy = sqlx::query_as!(
            QueuedBuy,
            "SELECT * FROM queued_buy WHERE user_id = 'marcus'"
        )
        .fetch_optional(&pool)
        .await?;

        assert_eq!(queued_buy, None);

        let Balance { balance } = sqlx::query_as!(
            Balance,
            "SELECT balance FROM trader WHERE user_id = 'marcus'"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(
            balance, 400_f64,
            "expected balance to be 400 but was {balance}"
        );

        Ok(())
    }

    #[sqlx::test]
    async fn test_cancel_buy_with_expired_queued_buy(pool: PgPool) -> anyhow::Result<()> {
        let _log = crate::add::add(&pool, "marcus", 400_f64).await?;
        let _log = init_buy(&pool, "marcus", "AAPL", 50_f64, 200_f64).await?;

        sqlx::query!("UPDATE queued_buy SET time_created = now() - interval '6 minutes' WHERE user_id = 'marcus'")
            .execute(&pool)
            .await?;

        let cancel = cancel_buy(&pool, "marcus").await;
        assert!(cancel.is_err(), "expected error but was {cancel:?}");

        let queued_buy = sqlx::query_as!(
            QueuedBuy,
            "SELECT * FROM queued_buy WHERE user_id = 'marcus'"
        )
        .fetch_optional(&pool)
        .await?;

        assert_eq!(queued_buy, None);

        let Balance { balance } = sqlx::query_as!(
            Balance,
            "SELECT balance FROM trader WHERE user_id = 'marcus'"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(
            balance, 400_f64,
            "expected balance to be 400 but was {balance}"
        );

        Ok(())
    }
}
