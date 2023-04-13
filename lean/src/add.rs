use anyhow::bail;
use sqlx::{query, PgPool};
use crate::log::AccountTransaction;

#[tracing::instrument(skip(pool))]
pub async fn add(pool: &PgPool, user_id: &str, amount: f64) -> anyhow::Result<AccountTransaction> {
    if !amount.is_sign_positive() {
        bail!("amount must be positive")
    }
    
    query!(
        "INSERT INTO trader (user_id, balance) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET balance = trader.balance + $2",
        user_id,
        amount
    )
    .execute(pool)
    .await?;

    Ok(AccountTransaction(amount))
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;

    #[sqlx::test]
    async fn test_add_new_user(pool: PgPool) -> anyhow::Result<()> {
        add(&pool, "marcus", 100_f64).await?;

        struct Trader {
            user_id: String,
            balance: f64,
        }

        let Trader { user_id, balance } =
            sqlx::query_as!(Trader, "SELECT * FROM trader WHERE user_id = 'marcus'")
                .fetch_one(&pool)
                .await?;

        assert_eq!(user_id, "marcus");
        assert_eq!(balance, 100_f64);

        Ok(())
    }

    #[sqlx::test]
    async fn test_add_old_user(pool: PgPool) -> anyhow::Result<()> {
        let add1 = add(&pool, "marcus", 100_f64);
        let add2 = add(&pool, "marcus", 100_f64);
        tokio::try_join!(add1, add2)?;

        struct Trader {
            user_id: String,
            balance: f64,
        }

        let Trader { user_id, balance } =
            sqlx::query_as!(Trader, "SELECT * FROM trader WHERE user_id = 'marcus'")
                .fetch_one(&pool)
                .await?;

        assert_eq!(user_id, "marcus");
        assert_eq!(balance, 200_f64);

        Ok(())
    }
}
