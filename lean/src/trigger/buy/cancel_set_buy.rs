use std::ops::DerefMut;
use crate::log::AccountTransaction;
use crate::{begin_transaction, commit_transaction};
use sqlx::{PgPool, Postgres, Transaction};

#[tracing::instrument(skip(pool))]
pub async fn cancel_set_buy(
    pool: &PgPool,
    user_id: &str,
    stock_symbol: &str,
) -> anyhow::Result<AccountTransaction> {
    let mut transaction = begin_transaction(pool).await?;

    let record = delete_buy_trigger(user_id, stock_symbol, &mut transaction).await?;

    let acc_trans = update_trader_balance(user_id, &mut transaction, record).await?;

    commit_transaction(transaction).await?;

    Ok(acc_trans)
}

#[tracing::instrument(skip_all)]
async fn update_trader_balance(
    user_id: &str,
    transaction: &mut Transaction<'static, Postgres>,
    record: Record,
) -> anyhow::Result<AccountTransaction> {
    sqlx::query!(
        "UPDATE trader SET balance = balance + $1 WHERE user_id = $2",
        record.amount_dollars,
        user_id
    )
    .execute(transaction.deref_mut())
    .await?;

    Ok(AccountTransaction(record.amount_dollars))
}

struct Record {
    amount_dollars: f64,
}

#[tracing::instrument(skip_all)]
async fn delete_buy_trigger(
    user_id: &str,
    stock_symbol: &str,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<Record> {
    let record = sqlx::query_as!(Record,
        "DELETE FROM buy_trigger WHERE owner_id = $1 AND stock_symbol = $2 RETURNING amount_dollars",
        user_id,
        stock_symbol
    )
        .fetch_one(transaction.deref_mut())
        .await?;

    Ok(record)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::add::add;
    use crate::trigger::set_buy_amount;

    #[sqlx::test]
    async fn test_cancel_set_buy_no_buy(pool: PgPool) -> anyhow::Result<()> {
        let cancel = cancel_set_buy(&pool, "marcus", "AAPL").await;
        assert!(cancel.is_err(), "expected error but was {cancel:?}");
        Ok(())
    }

    #[sqlx::test]
    async fn test_cancel_set_buy_with_buy(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 100_f64).await?;
        set_buy_amount(&pool, "marcus", "APPL", 100_f64).await?;

        let cancel = cancel_set_buy(&pool, "marcus", "APPL").await;
        assert!(cancel.is_ok(), "expected ok but was {cancel:?}");

        let balance = sqlx::query!("SELECT balance FROM trader WHERE user_id = 'marcus'")
            .fetch_one(&pool)
            .await?
            .balance;

        assert_eq!(balance, 100_f64);

        let buy_trigger = sqlx::query!(
            "SELECT * FROM buy_trigger WHERE owner_id = 'marcus' AND stock_symbol = 'APPL'"
        )
        .fetch_optional(&pool)
        .await?;

        assert!(
            buy_trigger.is_none(),
            "expected no buy trigger but was {buy_trigger:?}"
        );

        Ok(())
    }
}
