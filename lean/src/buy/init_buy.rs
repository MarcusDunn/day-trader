use crate::log::AccountTransaction;
use crate::{begin_transaction, commit_transaction};
use sqlx::{PgConnection, PgPool, Postgres, Transaction};
use std::ops::DerefMut;

#[derive(Debug, PartialEq)]
pub struct AmountDollars {
    amount_dollars: f64,
}

#[tracing::instrument(skip(pool))]
pub async fn init_buy(
    pool: &PgPool,
    user_id: &str,
    stock_symbol: &str,
    quoted_price: f64,
    amount_dollars: f64,
) -> anyhow::Result<AccountTransaction> {
    let mut transaction = begin_transaction(pool).await?;

    let changes = delete_and_maybe_update(user_id, &mut transaction).await?;

    let changes =
        changes + update_trader_balance(user_id, amount_dollars, &mut transaction).await?;

    insert_queued_buy(
        user_id,
        stock_symbol,
        quoted_price,
        amount_dollars,
        &mut transaction,
    )
    .await?;

    commit_transaction(transaction).await?;

    Ok(changes)
}

#[tracing::instrument(skip_all)]
async fn insert_queued_buy(
    user_id: &str,
    stock_symbol: &str,
    quoted_price: f64,
    amount_dollars: f64,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<()> {
    let connection: &mut PgConnection = &mut *transaction;
    sqlx::query!(
        "INSERT INTO queued_buy (user_id, stock_symbol, quoted_price, amount_dollars)\
     VALUES ($1, $2, $3, $4)",
        user_id,
        stock_symbol,
        quoted_price,
        amount_dollars,
    )
    .execute(connection)
    .await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
async fn update_trader_balance(
    user_id: &str,
    amount_dollars: f64,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<AccountTransaction> {
    let connection = transaction.deref_mut();
    let postgres_result = sqlx::query!(
        "UPDATE trader SET balance = balance - $1 WHERE user_id = $2 AND balance >= $1",
        amount_dollars,
        user_id,
    )
    .execute(connection)
    .await?;

    if postgres_result.rows_affected() == 0 {
        anyhow::bail!("no trader for user_id {user_id}");
    }

    Ok(AccountTransaction(-amount_dollars))
}

#[tracing::instrument(skip_all)]
async fn delete_and_maybe_update(
    user_id: &str,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<AccountTransaction> {
    let connection = transaction.deref_mut();
    let old_buy = sqlx::query_as!(
        AmountDollars,
        "DELETE FROM queued_buy WHERE user_id = $1 RETURNING amount_dollars",
        user_id
    )
    .fetch_optional(&mut *connection)
    .await?;

    match old_buy {
        Some(AmountDollars { amount_dollars }) => {
            sqlx::query!(
                "UPDATE trader SET balance = balance + $1 WHERE user_id = $2",
                amount_dollars,
                user_id
            )
            .execute(&mut *connection)
            .await?;
            Ok(AccountTransaction(amount_dollars))
        }
        None => Ok(AccountTransaction(0.0)),
    }
}
