use crate::{begin_transaction, commit_transaction};
use anyhow::bail;
use sqlx::postgres::PgQueryResult;
use sqlx::{PgPool, Postgres, Transaction};

#[derive(PartialEq, Debug)]
struct QueuedSell {
    user_id: String,
    stock_symbol: String,
    quoted_price: f64,
    amount_dollars: f64,
    time_created: time::PrimitiveDateTime,
}

#[tracing::instrument(skip(pool))]
pub async fn init_sell(
    pool: &PgPool,
    user_id: &str,
    stock_symbol: &str,
    quote: f64,
    dollar_amount: f64,
) -> anyhow::Result<()> {
    let mut transaction = begin_transaction(pool).await?;

    resolve_old_queued_sell(user_id, &mut transaction).await?;

    let query_result = update_stock_holdings(
        user_id,
        stock_symbol,
        quote,
        dollar_amount,
        &mut transaction,
    )
    .await?;

    if query_result.rows_affected() != 1 {
        bail!("not enough stocks to sell");
    }

    created_queued_sell(
        user_id,
        stock_symbol,
        quote,
        dollar_amount,
        &mut transaction,
    )
    .await?;

    commit_transaction(transaction).await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn resolve_old_queued_sell(
    user_id: &str,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<()> {
    if let Some(record) = sqlx::query!("DELETE FROM queued_sell WHERE user_id = $1 returning quoted_price, amount_dollars, stock_symbol", user_id)
        .fetch_optional(&mut *transaction)
        .await? {
        sqlx::query!("UPDATE stock SET amount = amount + $1 WHERE owner_id = $2 AND stock_symbol = $3", record.amount_dollars / record.quoted_price, user_id, record.stock_symbol)
            .execute(&mut *transaction)
            .await?;
    }

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn created_queued_sell(
    user_id: &str,
    stock_symbol: &str,
    quote: f64,
    dollar_amount: f64,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<()> {
    sqlx::query!(
        "
        INSERT INTO queued_sell (user_id, stock_symbol, quoted_price, amount_dollars)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET
            stock_symbol = $2,
            quoted_price = $3,
            amount_dollars = $4,
            time_created = NOW()
        ",
        user_id,
        stock_symbol,
        quote,
        dollar_amount
    )
    .execute(transaction)
    .await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn update_stock_holdings(
    user_id: &str,
    stock_symbol: &str,
    quote: f64,
    dollar_amount: f64,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<PgQueryResult> {
    let query_result = sqlx::query!(
        "
    UPDATE stock SET amount = amount - $1
    WHERE 
        owner_id = $2 AND
        stock_symbol = $3 AND
        amount >= $1
    ",
        dollar_amount / quote,
        user_id,
        stock_symbol
    )
    .execute(transaction)
    .await?;

    Ok(query_result)
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;

    #[sqlx::test]
    async fn test_init_sell_with_no_funds(pool: PgPool) -> anyhow::Result<()> {
        let sell = init_sell(&pool, "marcus", "APPL", 50_f64, 100_f64).await;
        assert!(sell.is_err(), "expected error but was {sell:?}");

        Ok(())
    }

    #[derive(PartialEq, Debug)]
    struct Stock {
        owner_id: String,
        stock_symbol: String,
        amount: f64,
    }

    #[sqlx::test]
    async fn test_init_sell_with_stocks_to_sell(pool: PgPool) -> anyhow::Result<()> {
        crate::add::add(&pool, "marcus", 100_f64).await?;
        crate::buy::init_buy(&pool, "marcus", "APPL", 50_f64, 100_f64).await?;
        crate::buy::commit_buy(&pool, "marcus").await?;

        let sell = init_sell(&pool, "marcus", "APPL", 50_f64, 100_f64).await;
        assert!(sell.is_ok(), "expected ok but was {sell:?}");

        let sell = sqlx::query_as!(
            QueuedSell,
            "
            SELECT * FROM queued_sell
            WHERE user_id = $1 AND stock_symbol = $2
            ",
            "marcus",
            "APPL",
        )
        .fetch_optional(&pool)
        .await?
        .expect("expected sell to exist");

        assert_eq!(
            sell,
            QueuedSell {
                user_id: "marcus".to_string(),
                stock_symbol: "APPL".to_string(),
                quoted_price: 50_f64,
                amount_dollars: 100_f64,
                time_created: sell.time_created,
            }
        );

        let stock = sqlx::query_as!(Stock, "SELECT * FROM stock WHERE owner_id = 'marcus'")
            .fetch_optional(&pool)
            .await?
            .expect("expected stock to exist");

        assert_eq!(
            stock,
            Stock {
                owner_id: "marcus".to_string(),
                stock_symbol: "APPL".to_string(),
                amount: 0_f64,
            }
        );

        Ok(())
    }

    #[sqlx::test]
    fn test_init_buy_with_insufficient_stocks_to_sell(pool: PgPool) -> anyhow::Result<()> {
        crate::add::add(&pool, "marcus", 100_f64).await?;
        crate::buy::init_buy(&pool, "marcus", "APPL", 50_f64, 100_f64).await?;
        crate::buy::commit_buy(&pool, "marcus").await?;

        let sell = init_sell(&pool, "marcus", "APPL", 50_f64, 200_f64).await;
        assert!(sell.is_err(), "expected error but was {sell:?}");

        let queued_sell = sqlx::query!("SELECT * FROM queued_sell WHERE user_id = 'marcus'")
            .fetch_optional(&pool)
            .await?;

        assert!(
            queued_sell.is_none(),
            "expected no queued sell but was {queued_sell:?}"
        );

        let stock = sqlx::query_as!(Stock, "SELECT * FROM stock WHERE owner_id = 'marcus'")
            .fetch_one(&pool)
            .await?;

        assert_eq!(
            stock,
            Stock {
                owner_id: "marcus".to_string(),
                stock_symbol: "APPL".to_string(),
                amount: 2_f64,
            }
        );

        Ok(())
    }

    #[sqlx::test]
    async fn test_override_queued_sell(pool: PgPool) -> anyhow::Result<()> {
        crate::add::add(&pool, "marcus", 400_f64).await?;
        crate::buy::init_buy(&pool, "marcus", "APPL", 50_f64, 200_f64).await?;
        crate::buy::commit_buy(&pool, "marcus").await?;

        init_sell(&pool, "marcus", "APPL", 50_f64, 200_f64).await?;
        let sell = init_sell(&pool, "marcus", "APPL", 50_f64, 100_f64).await;

        assert!(sell.is_ok(), "expected ok but was {sell:?}");

        let sell = sqlx::query_as!(
            QueuedSell,
            "
            SELECT * FROM queued_sell
            WHERE user_id = $1 AND stock_symbol = $2
            ",
            "marcus",
            "APPL",
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(
            sell,
            QueuedSell {
                user_id: "marcus".to_string(),
                stock_symbol: "APPL".to_string(),
                quoted_price: 50_f64,
                amount_dollars: 100_f64,
                time_created: sell.time_created,
            }
        );

        let stock = sqlx::query_as!(Stock, "SELECT * FROM stock WHERE owner_id = 'marcus'")
            .fetch_optional(&pool)
            .await?
            .expect("expected stock to exist");

        assert_eq!(
            stock,
            Stock {
                owner_id: "marcus".to_string(),
                stock_symbol: "APPL".to_string(),
                amount: 2_f64,
            }
        );

        Ok(())
    }
}
