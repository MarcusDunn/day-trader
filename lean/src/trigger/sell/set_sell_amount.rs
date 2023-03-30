use crate::{begin_transaction, commit_transaction};
use anyhow::bail;
use sqlx::postgres::PgQueryResult;
use sqlx::{PgPool, Postgres, Transaction};

#[tracing::instrument(skip_all)]
pub async fn set_sell_amount(
    pool: &PgPool,
    user_id: &str,
    stock_symbol: &str,
    amount_stock: f64,
) -> anyhow::Result<()> {
    let mut transaction = begin_transaction(pool).await?;

    remove_prev_sell_trigger(user_id, stock_symbol, &mut transaction).await?;

    let result = remove_stock(user_id, stock_symbol, amount_stock, &mut transaction).await?;

    if result.rows_affected() == 0 {
        bail!("Insufficient stock");
    }

    insert_sell_trigger(user_id, stock_symbol, amount_stock, &mut transaction).await?;

    commit_transaction(transaction).await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn insert_sell_trigger(
    user_id: &str,
    stock_symbol: &str,
    amount_stock: f64,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<()> {
    sqlx::query!(
        "INSERT INTO sell_trigger (owner_id, stock_symbol, amount_stock) VALUES ($1, $2, $3)",
        user_id,
        stock_symbol,
        amount_stock
    )
    .execute(transaction)
    .await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn remove_stock(
    user_id: &str,
    stock_symbol: &str,
    amount_stock: f64,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<PgQueryResult> {
    let result = sqlx::query!(
        "UPDATE stock SET amount = amount - $1 WHERE owner_id = $2 AND stock_symbol = $3 AND amount >= $1",
        amount_stock,
        user_id,
        stock_symbol
    ).execute(transaction).await?;
    Ok(result)
}

#[tracing::instrument(skip_all)]
async fn remove_prev_sell_trigger(
    user_id: &str,
    stock_symbol: &str,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<()> {
    if let Some(record) = sqlx::query!(
        "DELETE FROM sell_trigger WHERE owner_id = $1 AND stock_symbol = $2 RETURNING amount_stock",
        user_id,
        stock_symbol
    )
    .fetch_optional(&mut *transaction)
    .await?
    {
        sqlx::query!(
            "UPDATE stock SET amount = amount + $1 WHERE owner_id = $2 AND stock_symbol = $3",
            record.amount_stock,
            user_id,
            stock_symbol
        )
        .execute(&mut *transaction)
        .await?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::add::add;
    use crate::buy::{commit_buy, init_buy};
    use crate::trigger::sell::set_sell_amount;
    use pretty_assertions::assert_eq;

    #[sqlx::test]
    async fn test_set_sell_amount_no_stock(pool: PgPool) -> anyhow::Result<()> {
        let set = set_sell_amount(&pool, "marcus", "AAPL", 100_f64).await;
        assert!(set.is_err(), "expected error but was {set:?}");

        Ok(())
    }

    #[sqlx::test]
    async fn test_set_sell_amount_with_stock(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 1000_f64).await?;
        init_buy(&pool, "marcus", "AAPL", 50_f64, 100_f64).await?;
        commit_buy(&pool, "marcus").await?;

        let stock = sqlx::query!(
            "SELECT amount FROM stock WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(stock.amount, 2_f64);

        let set = set_sell_amount(&pool, "marcus", "AAPL", 1_f64).await;

        assert!(set.is_ok(), "expected error but was {set:?}");

        let stock = sqlx::query!(
            "SELECT amount FROM stock WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(stock.amount, 1_f64);

        let sell_trigger = sqlx::query!(
            "SELECT * FROM sell_trigger WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(sell_trigger.amount_stock, 1_f64);
        assert_eq!(sell_trigger.trigger_price, None);

        Ok(())
    }

    #[sqlx::test]
    async fn test_set_sell_amount_with_prev_sell_trigger(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 1000_f64).await?;
        init_buy(&pool, "marcus", "AAPL", 50_f64, 100_f64).await?;
        commit_buy(&pool, "marcus").await?;

        set_sell_amount(&pool, "marcus", "AAPL", 2_f64).await?;

        let set_sell_amount = set_sell_amount(&pool, "marcus", "AAPL", 1_f64).await;

        assert!(
            set_sell_amount.is_ok(),
            "expected error but was {set_sell_amount:?}"
        );

        let stock = sqlx::query!(
            "SELECT * FROM stock WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(stock.amount, 1_f64);

        let sell_trigger = sqlx::query!(
            "SELECT * FROM sell_trigger WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(sell_trigger.amount_stock, 1_f64);
        assert_eq!(sell_trigger.trigger_price, None);

        Ok(())
    }
}
