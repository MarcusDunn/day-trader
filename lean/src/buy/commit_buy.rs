use std::ops::DerefMut;
use crate::{begin_transaction, commit_transaction};
use sqlx::types::time::{OffsetDateTime, PrimitiveDateTime};
use sqlx::{PgPool, Postgres, Transaction};
use std::time::Duration;

#[derive(Debug, PartialEq)]
pub struct QueuedBuyNoUserId {
    stock_symbol: String,
    quoted_price: f64,
    amount_dollars: f64,
    time_created: PrimitiveDateTime,
}

#[tracing::instrument(skip(pool))]
pub async fn commit_buy(pool: &PgPool, user_id: &str) -> anyhow::Result<()> {
    let mut transaction = begin_transaction(pool).await?;

    let queued_buy_no_user_id = delete_queued_buy(user_id, &mut transaction).await?;

    let now = OffsetDateTime::now_utc();
    let now = PrimitiveDateTime::new(now.date(), now.time());
    if queued_buy_no_user_id.time_created + Duration::from_secs(60) < now {
        update_trader_balance(user_id, &mut transaction, &queued_buy_no_user_id).await?;
        commit_transaction(transaction).await?;
        anyhow::bail!("no queued buy for user_id {user_id}");
    }

    update_stock(user_id, &mut transaction, queued_buy_no_user_id).await?;

    commit_transaction(transaction).await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn update_trader_balance(
    user_id: &str,
    transaction: &mut Transaction<'static, Postgres>,
    queued_buy_no_user_id: &QueuedBuyNoUserId,
) -> anyhow::Result<()> {
    let connection = transaction.deref_mut();
    sqlx::query!(
        "UPDATE trader SET balance = balance + $1 WHERE user_id = $2",
        queued_buy_no_user_id.amount_dollars,
        user_id
    )
    .execute(&mut *connection)
    .await?;
    Ok(())
}

#[tracing::instrument]
async fn update_stock(
    user_id: &str,
    transaction: &mut Transaction<'static, Postgres>,
    queued_buy_no_user_id: QueuedBuyNoUserId,
) -> anyhow::Result<()> {
    let connection = transaction.deref_mut();
    sqlx::query!(
    "INSERT INTO stock (owner_id, stock_symbol, amount) VALUES ($1, $2, $3) ON CONFLICT (owner_id, stock_symbol) DO UPDATE SET amount = stock.amount + $3",
    user_id,
    queued_buy_no_user_id.stock_symbol,
    queued_buy_no_user_id.amount_dollars / queued_buy_no_user_id.quoted_price,
)
        .execute(&mut *connection)
        .await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn delete_queued_buy(
    user_id: &str,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<QueuedBuyNoUserId> {
    let connection = transaction.deref_mut();
    let Some(queued_buy_no_user_id) = sqlx::query_as!(
        QueuedBuyNoUserId,
        "DELETE FROM queued_buy WHERE user_id = $1 RETURNING stock_symbol, quoted_price, amount_dollars, time_created",
        user_id
    )
        .fetch_optional(&mut *connection)
        .await? else {
        anyhow::bail!("no queued buy for user_id {user_id}");
    };

    Ok(queued_buy_no_user_id)
}
