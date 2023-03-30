use crate::{begin_transaction, commit_transaction};
use sqlx::{PgPool, Postgres, Transaction};

#[tracing::instrument(skip(pool))]
pub async fn cancel_sell(pool: &PgPool, user_id: String) -> anyhow::Result<()> {
    let mut transaction = begin_transaction(pool).await?;

    let record = delete_queued_sell(&mut transaction, &user_id).await?;

    update_stock_holdings(&mut transaction, user_id, record).await?;

    commit_transaction(transaction).await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn update_stock_holdings(
    transaction: &mut Transaction<'static, Postgres>,
    user_id: String,
    record: Record,
) -> anyhow::Result<()> {
    sqlx::query!(
        "
        INSERT INTO stock (owner_id, stock_symbol, amount)
        VALUES ($1, $2, $3)
        ON CONFLICT (owner_id, stock_symbol)
        DO UPDATE SET
            amount = stock.amount + $3
        ",
        user_id,
        record.stock_symbol,
        record.amount_dollars / record.quoted_price
    )
    .execute(transaction)
    .await?;

    Ok(())
}

struct Record {
    amount_dollars: f64,
    stock_symbol: String,
    quoted_price: f64,
}

#[tracing::instrument(skip(transaction))]
async fn delete_queued_sell(
    transaction: &mut Transaction<'static, Postgres>,
    user_id: &str,
) -> anyhow::Result<Record> {
    let record = sqlx::query_as!(Record,
        "DELETE FROM queued_sell WHERE user_id = $1 RETURNING amount_dollars, stock_symbol, quoted_price",
        user_id
    )
        .fetch_one(transaction)
        .await?;
    Ok(record)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::add::add;
    use crate::buy::{commit_buy, init_buy};
    use crate::sell::init_sell;

    #[sqlx::test]
    async fn test_cancel_sell_no_queued_sell(pool: PgPool) -> anyhow::Result<()> {
        let cancel = cancel_sell(&pool, "marcus".to_string()).await;
        assert!(cancel.is_err(), "expected error but was {cancel:?}");

        Ok(())
    }

    #[sqlx::test]
    async fn test_cancel_sell_with_pending_sell(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 200_f64).await?;
        init_buy(&pool, "marcus", "AAPL", 100_f64, 100_f64).await?;
        commit_buy(&pool, "marcus").await?;

        init_sell(&pool, "marcus", "AAPL", 100_f64, 100_f64).await?;

        let cancel = cancel_sell(&pool, "marcus".to_string()).await;
        assert!(cancel.is_ok(), "expected ok but was {cancel:?}");

        let stock = sqlx::query!(
            "SELECT amount FROM stock WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(stock.amount, 1_f64);

        let queued_sell = sqlx::query!("SELECT * FROM queued_sell WHERE user_id = $1", "marcus")
            .fetch_optional(&pool)
            .await?;

        assert!(
            queued_sell.is_none(),
            "expected no queued sell but was {queued_sell:?}"
        );

        Ok(())
    }
}
