use crate::{begin_transaction, commit_transaction};
use sqlx::types::time::{OffsetDateTime, PrimitiveDateTime};
use sqlx::{PgPool, Postgres, Transaction};
use std::time::Duration;

#[derive(Debug, PartialEq)]
pub struct AmountDollarsTimeCreated {
    amount_dollars: f64,
    time_created: PrimitiveDateTime,
}

#[tracing::instrument(skip(pool))]
pub async fn cancel_buy(pool: &PgPool, user_id: &str) -> anyhow::Result<()> {
    let mut transaction = begin_transaction(pool).await?;

    let amount_dollars_time_created = delete_queued_buy(user_id, &mut transaction).await?;

    update_trader_balance(user_id, &mut transaction, &amount_dollars_time_created).await?;

    let now = OffsetDateTime::now_utc();
    let now = PrimitiveDateTime::new(now.date(), now.time());
    if amount_dollars_time_created.time_created + Duration::from_secs(60) < now {
        commit_transaction(transaction).await?;
        anyhow::bail!("no queued buy for user_id {user_id}");
    }

    commit_transaction(transaction).await?;

    Ok(())
}

#[tracing::instrument]
async fn update_trader_balance(
    user_id: &str,
    transaction: &mut Transaction<'static, Postgres>,
    amount_dollars_time_created: &AmountDollarsTimeCreated,
) -> anyhow::Result<()> {
    sqlx::query!(
        "UPDATE trader SET balance = balance + $1 WHERE user_id = $2",
        amount_dollars_time_created.amount_dollars,
        user_id
    )
    .execute(transaction)
    .await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn delete_queued_buy(
    user_id: &str,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<AmountDollarsTimeCreated> {
    let Some(amount_dollars_time_created) = sqlx::query_as!(
        AmountDollarsTimeCreated,
        "DELETE FROM queued_buy WHERE user_id = $1 RETURNING amount_dollars, time_created",
        user_id
    )
        .fetch_optional(transaction)
        .await? else {
        anyhow::bail!("no queued buy for user_id {user_id}");
    };

    Ok(amount_dollars_time_created)
}
