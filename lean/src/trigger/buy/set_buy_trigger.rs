use anyhow::bail;
use sqlx::PgPool;

#[tracing::instrument(skip(pool))]
pub async fn set_buy_trigger(
    pool: &PgPool,
    user_id: &str,
    stock_symbol: &str,
    trigger_price: f64,
) -> anyhow::Result<()> {
    let result = sqlx::query!(
        "UPDATE buy_trigger SET trigger_price = $3 WHERE owner_id = $1 AND stock_symbol = $2",
        user_id,
        stock_symbol,
        trigger_price
    )
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        bail!("No buy trigger set");
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::add::add;
    use crate::trigger::set_buy_amount;

    #[sqlx::test]
    async fn test_set_buy_trigger_with_no_set_buy(pool: PgPool) -> anyhow::Result<()> {
        let set = set_buy_trigger(&pool, "marcus", "AAPL", 100_f64).await;
        assert!(set.is_err(), "expected error but was {set:?}");

        Ok(())
    }

    #[sqlx::test]
    async fn test_set_buy_trigger_with_set_buy(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 1000_f64).await?;

        set_buy_amount(&pool, "marcus", "AAPL", 100_f64).await?;
        let set = set_buy_trigger(&pool, "marcus", "AAPL", 100_f64).await;
        assert!(set.is_ok(), "expected error but was {set:?}");

        let balance = sqlx::query!("SELECT balance FROM trader WHERE user_id = $1", "marcus")
            .fetch_one(&pool)
            .await?
            .balance;

        assert_eq!(balance, 900_f64);

        let buy_trigger = sqlx::query!(
            "SELECT * FROM buy_trigger WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(buy_trigger.amount_dollars, 100_f64);
        assert_eq!(buy_trigger.trigger_price, Some(100_f64));

        Ok(())
    }
}
