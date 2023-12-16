use std::ops::DerefMut;
use crate::log::AccountTransaction;
use crate::{begin_transaction, commit_transaction};
use anyhow::bail;

use sqlx::{PgPool, Postgres, Transaction};

#[tracing::instrument(skip(pool))]
pub async fn set_buy_amount(
    pool: &PgPool,
    user_id: &str,
    stock_symbol: &str,
    amount_dollars: f64,
) -> anyhow::Result<AccountTransaction> {
    let mut transaction = begin_transaction(pool).await?;

    let acc_trans = remove_requisite_balance(user_id, amount_dollars, &mut transaction).await?;

    let acc_trans =
        acc_trans + remove_previous_buy_trigger(user_id, stock_symbol, &mut transaction).await?;

    create_buy_trigger(&mut transaction, user_id, stock_symbol, amount_dollars).await?;

    commit_transaction(transaction).await?;

    Ok(acc_trans)
}

#[tracing::instrument(skip_all)]
async fn create_buy_trigger(
    transaction: &mut Transaction<'static, Postgres>,
    user_id: &str,
    stock_symbol: &str,
    amount_dollars: f64,
) -> anyhow::Result<()> {
    sqlx::query!(
        "INSERT INTO buy_trigger (owner_id, stock_symbol, amount_dollars) VALUES ($1, $2, $3)",
        user_id,
        stock_symbol,
        amount_dollars,
    )
    .execute(transaction.deref_mut())
    .await?;

    Ok(())
}

async fn remove_previous_buy_trigger(
    user_id: &str,
    stock_symbol: &str,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<AccountTransaction> {
    let transaction = transaction.deref_mut();
    Ok(match sqlx::query!("DELETE FROM buy_trigger WHERE owner_id = $1 AND stock_symbol = $2 RETURNING amount_dollars", user_id, stock_symbol)
        .fetch_optional(&mut *transaction)
        .await? {
        Some(record) => {
            sqlx::query!(
                "UPDATE trader SET balance = balance + $1 WHERE user_id = $2",
                record.amount_dollars,
                user_id
            )
                .execute(&mut *transaction)
                .await?;

            AccountTransaction(record.amount_dollars)
        }
        None => AccountTransaction(0.0)
    })
}

#[tracing::instrument(skip_all)]
async fn remove_requisite_balance(
    user_id: &str,
    amount_dollars: f64,
    transaction: &mut Transaction<'static, Postgres>,
) -> anyhow::Result<AccountTransaction> {
    let result = sqlx::query!(
        "UPDATE trader SET balance = balance - $1 WHERE user_id = $2 AND balance >= $1 RETURNING balance",
        amount_dollars,
        user_id,
    )
        .fetch_one(transaction.deref_mut())
        .await?;

    if result.balance.is_sign_positive() {
        Ok(AccountTransaction(-amount_dollars))
    } else {
        bail!("Insufficient funds")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::add::add;

    #[sqlx::test]
    async fn test_set_buy_amount_no_user(pool: PgPool) -> anyhow::Result<()> {
        let set = set_buy_amount(&pool, "marcus", "AAPL", 100_f64).await;
        assert!(set.is_err(), "expected error but was {set:?}");

        Ok(())
    }

    #[sqlx::test]
    async fn test_set_buy_amount_sufficient_funds(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 200_f64).await?;

        let set = set_buy_amount(&pool, "marcus", "AAPL", 100_f64).await;
        assert!(set.is_ok(), "expected ok but was {set:?}");

        let buy_trigger = sqlx::query!(
            "SELECT * FROM buy_trigger WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(buy_trigger.amount_dollars, 100_f64);

        let trader = sqlx::query!("SELECT * FROM trader WHERE user_id = $1", "marcus")
            .fetch_one(&pool)
            .await?;

        assert_eq!(trader.balance, 100_f64);

        Ok(())
    }

    #[sqlx::test]
    async fn test_set_buy_with_already_existing_buy(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 200_f64).await?;

        let set = set_buy_amount(&pool, "marcus", "AAPL", 100_f64).await;
        assert!(set.is_ok(), "expected ok but was {set:?}");

        let set = set_buy_amount(&pool, "marcus", "AAPL", 50_f64).await;
        assert!(set.is_ok(), "expected ok but was {set:?}");

        let buy_trigger = sqlx::query!(
            "SELECT * FROM buy_trigger WHERE owner_id = $1 AND stock_symbol = $2",
            "marcus",
            "AAPL"
        )
        .fetch_one(&pool)
        .await?;

        assert_eq!(buy_trigger.amount_dollars, 50_f64);

        let trader = sqlx::query!("SELECT * FROM trader WHERE user_id = $1", "marcus")
            .fetch_one(&pool)
            .await?;

        assert_eq!(trader.balance, 150_f64);

        Ok(())
    }
}
