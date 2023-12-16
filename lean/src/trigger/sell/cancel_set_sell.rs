use sqlx::PgPool;

#[tracing::instrument(skip(pool))]
pub async fn cancel_set_sell(
    pool: &PgPool,
    user_id: &str,
    stock_symbol: &str,
) -> anyhow::Result<()> {
    let record = delete_sell_trigger(pool, user_id, stock_symbol).await?;

    update_stock(pool, user_id, stock_symbol, record).await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn update_stock(
    pool: &PgPool,
    user_id: &str,
    stock_symbol: &str,
    record: Record,
) -> anyhow::Result<()> {
    sqlx::query!(
        "UPDATE stock SET amount = amount + $1 WHERE owner_id = $2 AND stock_symbol = $3",
        record.amount_stock,
        user_id,
        stock_symbol
    )
    .execute(pool)
    .await?;

    Ok(())
}

struct Record {
    amount_stock: f64,
}

#[tracing::instrument(skip_all)]
async fn delete_sell_trigger(
    pool: &PgPool,
    user_id: &str,
    stock_symbol: &str,
) -> anyhow::Result<Record> {
    let Some(record) =
        sqlx::query_as!(Record,
        "DELETE FROM sell_trigger WHERE owner_id = $1 AND stock_symbol = $2 RETURNING amount_stock",
        user_id,
        stock_symbol
    )
        .fetch_optional(pool)
        .await?
    else {
        return Err(anyhow::anyhow!(
            "no sell trigger set for {user_id} {stock_symbol}"
        ));
    };

    Ok(record)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::add::add;
    use crate::buy::{commit_buy, init_buy};
    use crate::trigger::{set_sell_amount, set_sell_trigger};

    #[sqlx::test]
    async fn test_cancel_set_sell_no_set_sell(pool: PgPool) -> anyhow::Result<()> {
        let result = cancel_set_sell(&pool, "marcus", "TEST").await;
        assert!(result.is_err(), "expected error but was {result:?}");

        Ok(())
    }

    #[sqlx::test]
    async fn test_cancel_set_sell_with_set_sell(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 100.0).await?;
        init_buy(&pool, "marcus", "TEST", 50_f64, 100.0).await?;
        commit_buy(&pool, "marcus").await?;
        set_sell_amount(&pool, "marcus", "TEST", 1.0).await?;
        set_sell_trigger(&pool, "marcus", "TEST", 40_f64).await?;

        let result = cancel_set_sell(&pool, "marcus", "TEST").await;
        assert!(result.is_ok(), "expected error but was {result:?}");

        let stock = sqlx::query!(
            "SELECT * FROM stock WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "TEST"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(stock.amount, 2_f64);

        let trigger = sqlx::query!(
            "SELECT * FROM sell_trigger WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "TEST"
        )
        .fetch_optional(&pool)
        .await?;

        assert!(trigger.is_none(), "expected no trigger but was {trigger:?}");

        Ok(())
    }
}
