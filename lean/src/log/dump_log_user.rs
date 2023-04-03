use crate::log::dump_log::write_entries;
use sqlx::PgPool;

pub async fn dump_log_user(
    pool: &PgPool,
    filename: &String,
    user_id: &String,
) -> anyhow::Result<()> {
    let file = tokio::fs::File::create(filename).await?;
    let mut writer = tokio::io::BufWriter::new(file);

    let mut entries = sqlx::query_as!(
        super::DbLogEntry,
        "SELECT timestamp, server, transaction_num, username, log FROM log_entry WHERE username = $1",
        user_id
    )
        .fetch(pool);

    write_entries(&mut writer, &mut entries).await?;

    Ok(())
}
