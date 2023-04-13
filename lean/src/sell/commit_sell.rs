use crate::log::AccountTransaction;
use crate::{begin_transaction, commit_transaction};
use anyhow::bail;
use sqlx::{PgPool, Postgres, Transaction};
use time::PrimitiveDateTime;

#[tracing::instrument(skip(pool))]
pub async fn commit_sell(pool: &PgPool, user_id: String) -> anyhow::Result<AccountTransaction> {
    let mut transaction = begin_transaction(pool).await?;

    let queued_sell = delete_queued_sell_by_user(&user_id, &mut transaction).await?;

    let now = time::OffsetDateTime::now_utc();
    let now = PrimitiveDateTime::new(now.date(), now.time());
    if queued_sell.time_created + time::Duration::minutes(5) < now {
        restore_stock(&user_id, &mut transaction, &queued_sell).await?;

        commit_transaction(transaction).await?;
        bail!("queued sell expired");
    }

    let acc_trans = update_balance(user_id, &mut transaction, queued_sell).await?;

    commit_transaction(transaction).await?;

    Ok(acc_trans)
}

async fn update_balance(
    user_id: String,
    transaction: &mut Transaction<'static, Postgres>,
    queued_sell: Record,
) -> anyhow::Result<AccountTransaction> {
    sqlx::query!(
        "
        UPDATE trader SET balance = balance + $1 WHERE user_id = $2;
        ",
        queued_sell.amount_dollars,
        user_id
    )
    .execute(transaction)
    .await?;

    Ok(AccountTransaction(queued_sell.amount_dollars))
}

#[tracing::instrument(skip_all)]
async fn restore_stock(
    user_id: &String,
    transaction: &mut Transaction<'static, Postgres>,
    queued_sell: &Record,
) -> anyhow::Result<()> {
    sqlx::query!(
        "UPDATE stock SET amount = amount + $1 WHERE owner_id = $2 AND stock_symbol = $3",
        queued_sell.amount_dollars / queued_sell.quoted_price,
        user_id,
        queued_sell.stock_symbol
    )
    .execute(transaction)
    .await?;

    Ok(())
}

struct Record {
    amount_dollars: f64,
    time_created: PrimitiveDateTime,
    quoted_price: f64,
    stock_symbol: String,
}

#[tracing::instrument(skip_all)]
async fn delete_queued_sell_by_user(
    user_id: &String,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<Record> {
    let Some(queued_sell) = sqlx::query_as!(Record,
        "DELETE FROM queued_sell WHERE user_id = $1 RETURNING amount_dollars, time_created, quoted_price, stock_symbol",
        user_id
    )
        .fetch_optional(transaction)
        .await? else {
        bail!("no queued sell for user_id {user_id}");
    };

    Ok(queued_sell)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::add::add;
    use crate::buy::{commit_buy, init_buy};
    use crate::sell::init_sell;
    use pretty_assertions::assert_eq;

    #[sqlx::test]
    async fn test_commit_sell_no_queued_sell(pool: PgPool) -> anyhow::Result<()> {
        let result = commit_sell(&pool, "test_user_id".to_string()).await;
        assert!(result.is_err());
        Ok(())
    }

    #[sqlx::test]
    async fn test_commit_sell_with_pending_sell(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 200_f64).await?;
        init_buy(&pool, "marcus", "AAPL", 100_f64, 100_f64).await?;
        commit_buy(&pool, "marcus").await?;

        init_sell::init_sell(&pool, "marcus", "AAPL", 100_f64, 100_f64).await?;

        let result = commit_sell(&pool, "marcus".to_string()).await;
        assert!(result.is_ok(), "expected ok but was {result:?}");

        let balance = sqlx::query!("SELECT balance FROM trader WHERE user_id = $1", "marcus")
            .fetch_one(&pool)
            .await?
            .balance;

        assert_eq!(balance, 200_f64);

        let stock_amount = sqlx::query!(
            "SELECT amount FROM stock WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?
        .amount;

        assert_eq!(stock_amount, 0_f64);

        let queued_sell = sqlx::query!("SELECT * FROM queued_sell WHERE user_id = $1", "marcus")
            .fetch_optional(&pool)
            .await?;

        assert!(
            queued_sell.is_none(),
            "expected no queued sell but was {queued_sell:?}"
        );

        Ok(())
    }

    #[sqlx::test]
    async fn test_commit_sell_with_expired_queued_sell(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 200_f64).await?;
        init_buy(&pool, "marcus", "AAPL", 100_f64, 100_f64).await?;
        commit_buy(&pool, "marcus").await?;

        init_sell::init_sell(&pool, "marcus", "AAPL", 100_f64, 100_f64).await?;

        // set time for queued sell to be expired
        sqlx::query!(
            "UPDATE queued_sell SET time_created = now() - interval '5 minutes' WHERE user_id = $1",
            "marcus"
        )
        .execute(&pool)
        .await?;

        let result = commit_sell(&pool, "marcus".to_string()).await;
        assert!(result.is_err(), "expected error but was {result:?}");

        let balance = sqlx::query!("SELECT balance FROM trader WHERE user_id = $1", "marcus")
            .fetch_one(&pool)
            .await?
            .balance;

        assert_eq!(balance, 100_f64);

        let stock_amount = sqlx::query!(
            "SELECT amount FROM stock WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?
        .amount;

        assert_eq!(stock_amount, 1_f64);

        Ok(())
    }
}
