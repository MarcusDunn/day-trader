pub use buy::cancel_set_buy;
pub use buy::set_buy_amount;
pub use buy::set_buy_trigger;
use sqlx::PgPool;
use tracing::info;

pub use sell::cancel_set_sell;
pub use sell::set_sell_amount;
pub use sell::set_sell_trigger;

mod buy;

mod sell;

#[derive(Debug, Clone)]
pub struct UpdatedPrice {
    pub(crate) symbol: String,
    pub(crate) price: f64,
}

pub struct Triggerer /*reeeeeee*/ {
    pool: PgPool,
    receiver: tokio::sync::mpsc::Receiver<UpdatedPrice>,
}

impl Triggerer {
    pub fn new(pool: PgPool) -> (Self, tokio::sync::mpsc::Sender<UpdatedPrice>) {
        let trigger_channel_size = std::env::var("TRIGGER_CHANNEL_SIZE")
            .unwrap_or_else(|_| "100".to_string())
            .parse::<usize>()
            .expect("TRIGGER_CHANNEL_SIZE must be a number");

        let (sender, receiver) = tokio::sync::mpsc::channel(trigger_channel_size);
        (Self { pool, receiver }, sender)
    }

    pub async fn run(mut self) -> anyhow::Result<()> {
        loop {
            while let Some(next) = self.receiver.recv().await {
                let for_buy = next.clone();
                let pool = self.pool.clone();
                tokio::spawn(async move { Self::check_buy_triggers(&pool, &for_buy).await });
                let pool = self.pool.clone();
                tokio::spawn(async move { Self::check_sell_triggers(&pool, &next).await });
            }
        }
    }

    async fn check_sell_triggers(pool: &PgPool, next: &UpdatedPrice) -> anyhow::Result<()> {
        let sell_triggers = sqlx::query_as!(
            SellTrigger,
            "DELETE FROM sell_trigger WHERE trigger_price <= $1 AND stock_symbol = $2 RETURNING owner_id, amount_stock",
            &next.price,
            &next.symbol,
        )
        .fetch_all(pool)
        .await?;

        if !sell_triggers.is_empty() {
            info!(
                "executing {}, sell triggers for {}",
                sell_triggers.len(),
                &next.symbol
            );
            execute_sell_triggers(pool, sell_triggers, next.price).await?;
        }

        Ok(())
    }

    async fn check_buy_triggers(pool: &PgPool, next: &UpdatedPrice) -> anyhow::Result<()> {
        let buy_triggers = sqlx::query_as!(
            BuyTrigger,
            "
                        DELETE FROM buy_trigger
                        WHERE trigger_price >= $1 AND stock_symbol = $2 RETURNING owner_id, amount_dollars
                        ",
            &next.price,
            &next.symbol,
        )
        .fetch_all(pool)
        .await?;

        if !buy_triggers.is_empty() {
            info!(
                "executing {}, buy triggers for {}",
                buy_triggers.len(),
                &next.symbol
            );
            execute_buy_triggers(pool, buy_triggers, &next.symbol, next.price).await?;
        }

        Ok(())
    }
}

struct SellTrigger {
    owner_id: String,
    amount_stock: f64,
}

struct BuyTrigger {
    owner_id: String,
    amount_dollars: f64,
}

#[tracing::instrument(skip_all)]
async fn execute_buy_triggers(
    pool: &PgPool,
    buy: Vec<BuyTrigger>,
    symbol: &str,
    quote: f64,
) -> anyhow::Result<()> {
    for trigger in buy {
        let amount = trigger.amount_dollars / quote;

        sqlx::query!(
            "
        INSERT INTO stock (owner_id, stock_symbol, amount)
        VALUES ($1, $2, $3)
        ON CONFLICT (owner_id, stock_symbol)
        DO UPDATE SET
            amount = stock.amount + $3
        ",
            trigger.owner_id,
            symbol,
            amount
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}

async fn execute_sell_triggers(
    pool: &PgPool,
    sell: Vec<SellTrigger>,
    quote: f64,
) -> anyhow::Result<()> {
    for trigger in sell {
        let amount = trigger.amount_stock * quote;

        sqlx::query!(
            "UPDATE trader SET balance = balance + $2 WHERE user_id = $1",
            trigger.owner_id,
            amount
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::add::add;

    #[sqlx::test]
    async fn test_execute_buy_trigger(pool: PgPool) -> anyhow::Result<()> {
        let trigger = BuyTrigger {
            owner_id: "test".to_string(),
            amount_dollars: 100.0,
        };

        add(&pool, "test", 100_f64).await?;

        execute_buy_triggers(&pool, vec![trigger], "APPL", 1_f64).await?;

        let stock = sqlx::query!(
            "SELECT amount FROM stock WHERE owner_id = $1 AND stock_symbol = $2",
            "test",
            "APPL"
        )
        .fetch_all(&pool)
        .await?;

        assert_eq!(stock.len(), 1);
        assert_eq!(stock[0].amount, 100_f64);

        Ok(())
    }
}
