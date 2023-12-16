use anyhow::bail;
use sqlx::PgPool;

#[tracing::instrument(skip_all)]
pub async fn set_sell_trigger(
    pool: &PgPool,
    user_id: &str,
    stock_symbol: &str,
    trigger_price: f64,
) -> anyhow::Result<()> {
    let result = sqlx::query!(
        "UPDATE sell_trigger SET trigger_price = $1 WHERE owner_id = $2 AND stock_symbol = $3",
        trigger_price,
        user_id,
        stock_symbol
    )
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        bail!("No sell trigger set");
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::add::add;
    use crate::buy::{commit_buy, init_buy};
    use crate::trigger::set_sell_amount;

    #[sqlx::test]
    async fn test_set_sell_trigger_no_set_amount(pool: PgPool) -> anyhow::Result<()> {
        let _log = add(&pool, "marcus", 100.0).await?;
        let _log = init_buy(&pool, "marcus", "TEST", 50_f64, 100.0).await?;
        commit_buy(&pool, "marcus").await?;

        let result = set_sell_trigger(&pool, "marcus", "TEST", 1.0).await;
        assert!(result.is_err(), "expected error but was {result:?}");

        let record = sqlx::query!(
            "SELECT * FROM sell_trigger WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "TEST"
        )
        .fetch_optional(&pool)
        .await?;

        assert!(record.is_none());

        Ok(())
    }

    #[sqlx::test]
    async fn test_set_sell_trigger_with_set_amount(pool: PgPool) -> anyhow::Result<()> {
        let _log = add(&pool, "marcus", 100.0).await?;
        let _log = init_buy(&pool, "marcus", "TEST", 50_f64, 100.0).await?;
        commit_buy(&pool, "marcus").await?;

        set_sell_amount(&pool, "marcus", "TEST", 1_f64).await?;
        set_sell_trigger(&pool, "marcus", "TEST", 60_f64).await?;

        let record = sqlx::query!(
            "SELECT * FROM sell_trigger WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "TEST"
        )
        .fetch_optional(&pool)
        .await?;

        assert!(record.is_some());
        let record = record.unwrap();
        assert_eq!(record.trigger_price, Some(60_f64));
        assert_eq!(record.amount_stock, 1_f64);

        Ok(())
    }
}
