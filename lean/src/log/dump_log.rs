use super::DbLogEntry;

use crate::log::{
    AccountTransactionLog, CommandType, DebugLog, ErrorEventLog, Log, LogEntry, QuoteServerLog,
    SystemEventLog, UserCommandLog,
};

use anyhow::anyhow;
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use time::PrimitiveDateTime;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

/*
<xsd:complexType name="LogType">
<xsd:choice minOccurs="0" maxOccurs="unbounded">
<xsd:element name="userCommand" type="UserCommandType"/>
<xsd:element name="quoteServer" type="QuoteServerType"/>
<xsd:element name="accountTransaction" type="AccountTransactionType"/>
<xsd:element name="systemEvent" type="SystemEventType"/>
<xsd:element name="errorEvent" type="ErrorEventType"/>
<xsd:element name="debugEvent" type="DebugType"/>
</xsd:choice>
</xsd:complexType>
*/
#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
enum LogType {
    UserCommandType(UserCommandType),
    QuoteServerType(QuoteServerType),
    AccountTransactionType(AccountTransactionType),
    SystemEventType(SystemEventType),
    ErrorEventType(ErrorEventType),
    DebugEventType(DebugType),
}

/*
<xsd:complexType name="UserCommandType">
<xsd:all>
<xsd:element name="timestamp" type="unixTimeLimits"/>
<xsd:element name="server" type="xsd:string"/>
<xsd:element name="transactionNum" type="xsd:positiveInteger"/>
<xsd:element name="command" type="commandType"/>
<xsd:element name="username" type="xsd:string" minOccurs="0"/>
<xsd:element name="stockSymbol" type="stockSymbolType" minOccurs="0"/>
<xsd:element name="filename" type="xsd:string" minOccurs="0"/>
<xsd:element name="funds" type="xsd:decimal" minOccurs="0"/>
</xsd:all>
</xsd:complexType>
*/
#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
struct UserCommandType {
    timestamp: UnixTimeLimits,
    server: String,
    transaction_num: i32,
    command: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stock_symbol: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    filename: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    funds: Option<f64>,
}

/*
<xsd:simpleType name="unixTimeLimits">
 <xsd:restriction base="xsd:integer">
    <xsd:minInclusive value="1609459200000"/> <!-- Jan 1, 2021-->
    <xsd:maxInclusive value="1619827200000"/> <!-- May 1, 2021 -->
  </xsd:restriction>
</xsd:simpleType>
 */
#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
struct UnixTimeLimits(i64);

/*
<xsd:complexType name="QuoteServerType">
<xsd:all>
<xsd:element name="timestamp" type="unixTimeLimits"/>
<xsd:element name="server" type="xsd:string"/>
<xsd:element name="transactionNum" type="xsd:positiveInteger"/>
<xsd:element name="price" type="xsd:decimal"/>
<xsd:element name="stockSymbol" type="stockSymbolType"/>
<xsd:element name="username" type="xsd:string"/>
<xsd:element name="quoteServerTime" type="xsd:integer"/>
<xsd:element name="cryptokey" type="xsd:string"/>
</xsd:all>
</xsd:complexType>
 */
#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
struct QuoteServerType {
    timestamp: UnixTimeLimits,
    server: String,
    transaction_num: i32,
    price: f64,
    stock_symbol: String,
    username: String,
    quote_server_time: u64,
    cryptokey: String,
}

/*
<xsd:complexType name="SystemEventType">
<xsd:all>
<xsd:element name="timestamp" type="unixTimeLimits"/>
<xsd:element name="server" type="xsd:string"/>
<xsd:element name="transactionNum" type="xsd:positiveInteger"/>
<xsd:element name="command" type="commandType"/>
<xsd:element name="username" type="xsd:string" minOccurs="0"/>
<xsd:element name="stockSymbol" type="stockSymbolType" minOccurs="0"/>
<xsd:element name="filename" type="xsd:string" minOccurs="0"/>
<xsd:element name="funds" type="xsd:decimal" minOccurs="0"/>
</xsd:all>
</xsd:complexType>
*/
#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
struct SystemEventType {
    timestamp: UnixTimeLimits,
    server: String,
    transaction_num: i32,
    command: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stock_symbol: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    filename: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    funds: Option<f64>,
}

/*
<xsd:complexType name="ErrorEventType">
<xsd:all>
<xsd:element name="timestamp" type="unixTimeLimits"/>
<xsd:element name="server" type="xsd:string"/>
<xsd:element name="transactionNum" type="xsd:positiveInteger"/>
<xsd:element name="command" type="commandType"/>
<xsd:element name="username" type="xsd:string" minOccurs="0"/>
<xsd:element name="stockSymbol" type="stockSymbolType" minOccurs="0"/>
<xsd:element name="filename" type="xsd:string" minOccurs="0"/>
<xsd:element name="funds" type="xsd:decimal" minOccurs="0"/>
<xsd:element name="errorMessage" type="xsd:string" minOccurs="0"/>
</xsd:all>
</xsd:complexType>
*/
#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
struct ErrorEventType {
    timestamp: UnixTimeLimits,
    server: String,
    transaction_num: i32,
    command: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stock_symbol: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    filename: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    funds: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error_message: Option<String>,
}

/*
<xsd:complexType name="DebugType">
<xsd:all>
<xsd:element name="timestamp" type="unixTimeLimits"/>
<xsd:element name="server" type="xsd:string"/>
<xsd:element name="transactionNum" type="xsd:positiveInteger"/>
<xsd:element name="command" type="commandType"/>
<xsd:element name="username" type="xsd:string" minOccurs="0"/>
<xsd:element name="stockSymbol" type="stockSymbolType" minOccurs="0"/>
<xsd:element name="filename" type="xsd:string" minOccurs="0"/>
<xsd:element name="funds" type="xsd:decimal" minOccurs="0"/>
<xsd:element name="debugMessage" type="xsd:string" minOccurs="0"/>
</xsd:all>
</xsd:complexType>
*/
#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
struct DebugType {
    timestamp: UnixTimeLimits,
    server: String,
    transaction_num: i32,
    command: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stock_symbol: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    filename: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    funds: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    debug_message: Option<String>,
}

/*
<xsd:complexType name="AccountTransactionType">
 <xsd:all>
  <xsd:element name="timestamp" type="unixTimeLimits"/>
  <xsd:element name="server" type="xsd:string"/>
  <xsd:element name="transactionNum" type="xsd:positiveInteger"/>
  <xsd:element name="action" type="xsd:string"/>
  <xsd:element name="username" type="xsd:string"/>
  <xsd:element name="funds" type="xsd:decimal"/>
 </xsd:all>
</xsd:complexType>
*/
#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
struct AccountTransactionType {
    timestamp: UnixTimeLimits,
    server: String,
    transaction_num: i32,
    action: String,
    username: String,
    funds: f64,
}

#[tracing::instrument(skip(pool))]
pub async fn dump_log(pool: &PgPool, filename: &str) -> anyhow::Result<()> {
    let file = File::create(filename)
        .await
        .map_err(|e| anyhow!("failed to create file: {e}"))?;
    let mut file = tokio::io::BufWriter::new(file);

    let mut rows =
        sqlx::query_as!(DbLogEntry, "SELECT * FROM log_entry ORDER BY timestamp ASC").fetch(pool);

    file.write_all(b"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r")
        .await?;
    file.write_all(b"<log>").await?;

    while let Some(row) = rows.next().await {
        // db log entry
        let row = row.map_err(|e| anyhow!("failed to fetch row: {e}"))?;
        // validated log entry
        let row = LogEntry::try_from(row).map_err(|e| anyhow!("failed to convert row: {e}"))?;
        // xmlifyable log entry
        let row = LogType::from(row);
        // xml
        let row =
            serde_xml_rs::to_string(&row).map_err(|e| anyhow!("failed to serialize row: {e}"))?;
        // xml with header removed
        let row = row.replace(r#"<?xml version="1.0" encoding="UTF-8"?>"#, "");
        // write to file
        file.write_all(row.as_bytes())
            .await
            .map_err(|e| anyhow!("failed to write row: {e}"))?;
    }

    file.write_all(b"</log>").await?;

    file.flush().await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::log::save_log_entry_bulk;
    use std::path::Path;
    use tokio::io::AsyncReadExt;

    #[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
    struct XmlLog {
        #[serde(rename = "$value")]
        log: Vec<LogType>,
    }

    #[sqlx::test]
    async fn test_dump_log(pool: PgPool) -> anyhow::Result<()> {
        let entry1 = LogEntry {
            timestamp: time::macros::datetime!(2020-01-02 03:04:05),
            server: "sheet".to_string(),
            transaction_num: 1,
            username: "daws".to_string(),
            log: Log::UserCommand(UserCommandLog {
                command: CommandType::Quote,
                stock_symbol: None,
                filename: None,
                funds: None,
            }),
        };
        let entry2 = LogEntry {
            timestamp: time::macros::datetime!(2020-01-02 03:04:05),
            server: "yeet".to_string(),
            transaction_num: 1,
            username: "marcus".to_string(),
            log: Log::UserCommand(UserCommandLog {
                command: CommandType::Add,
                stock_symbol: None,
                filename: None,
                funds: None,
            }),
        };

        save_log_entry_bulk(&pool, &mut vec![entry1.clone(), entry2.clone()]).await?;

        dump_log(&pool, "log.xml").await?;

        let file = File::open("log.xml").await?;
        let mut file = tokio::io::BufReader::new(file);
        let mut contents = String::new();
        file.read_to_string(&mut contents).await?;

        let XmlLog { log: entries } = serde_xml_rs::from_str(&contents)
            .map_err(|e| anyhow!("failed to deserialize contents: {e}"))?;

        assert_eq!(entries.len(), 2);
        assert_eq!(entries[0], LogType::from(entry1));
        assert_eq!(entries[1], LogType::from(entry2));

        tokio::fs::remove_file(Path::new("log.xml")).await?;

        Ok(())
    }

    #[test]
    fn check_ser_de_of_log_type() {
        let log = LogType::ErrorEventType(ErrorEventType {
            timestamp: time::macros::datetime!(2020-01-02 03:04:05).into(),
            server: "sheet".to_string(),
            transaction_num: 1,
            command: "ADD".to_string(),
            username: "daws".to_string().into(),
            stock_symbol: None,
            filename: None,
            funds: None,
            error_message: "error".to_string().into(),
        });

        let xml = serde_xml_rs::to_string(&log).expect("failed to serialize log");
        let log2 = serde_xml_rs::from_str(&xml).expect("failed to deserialize log");

        assert_eq!(log, log2);
    }
}

struct RestOfTheLog {
    pub timestamp: PrimitiveDateTime,
    pub server: String,
    pub transaction_num: i32,
    pub username: String,
}

impl From<LogEntry> for LogType {
    fn from(
        LogEntry {
            timestamp,
            server,
            transaction_num,
            username,
            log,
        }: LogEntry,
    ) -> Self {
        let rest_of_the_log = RestOfTheLog {
            timestamp,
            server,
            transaction_num,
            username,
        };
        match log {
            Log::UserCommand(user_command) => {
                Self::UserCommandType((rest_of_the_log, user_command).into())
            }
            Log::QuoteServerHits(quote_server_hits) => {
                Self::QuoteServerType((rest_of_the_log, quote_server_hits).into())
            }
            Log::AccountChanges(account_changes) => {
                Self::AccountTransactionType((rest_of_the_log, account_changes).into())
            }
            Log::SystemEvents(system_events) => {
                Self::SystemEventType((rest_of_the_log, system_events).into())
            }
            Log::ErrorMessages(error_messages) => {
                Self::ErrorEventType((rest_of_the_log, error_messages).into())
            }
            Log::DebugMessages(debug_messages) => {
                Self::DebugEventType((rest_of_the_log, debug_messages).into())
            }
        }
    }
}

impl From<(RestOfTheLog, UserCommandLog)> for UserCommandType {
    fn from(
        (
            RestOfTheLog {
                timestamp,
                server,
                transaction_num,
                username,
            },
            UserCommandLog {
                command,
                stock_symbol,
                filename,
                funds,
            },
        ): (RestOfTheLog, UserCommandLog),
    ) -> Self {
        Self {
            timestamp: timestamp.into(),
            server,
            transaction_num,
            command: command.into(),
            username: Some(username),
            stock_symbol,
            filename,
            funds,
        }
    }
}

impl From<CommandType> for String {
    fn from(value: CommandType) -> Self {
        use CommandType::*;
        String::from(match value {
            Add => "ADD",
            Quote => "QUOTE",
            Buy => "BUY",
            CommitBuy => "COMMIT_BUY",
            CancelBuy => "CANCEL_BUY",
            Sell => "SELL",
            CommitSell => "COMMIT_SELL",
            CancelSell => "CANCEL_SELL",
            SetBuyAmount => "SET_BUY_AMOUNT",
            CancelSetBuy => "CANCEL_SET_BUY",
            SetBuyTrigger => "SET_BUY_TRIGGER",
            SetSellAmount => "SET_SELL_AMOUNT",
            SetSellTrigger => "SET_SELL_TRIGGER",
            CancelSetSell => "CANCEL_SET_SELL",
            DumpLog => "DUMP_LOG",
            DisplaySummary => "DISPLAY_SUMMARY",
        })
    }
}

impl From<PrimitiveDateTime> for UnixTimeLimits {
    fn from(value: PrimitiveDateTime) -> Self {
        UnixTimeLimits(value.assume_utc().unix_timestamp())
    }
}

impl From<(RestOfTheLog, QuoteServerLog)> for QuoteServerType {
    fn from(
        (
            RestOfTheLog {
                timestamp,
                server,
                transaction_num,
                username,
            },
            QuoteServerLog {
                price,
                stock_symbol,
                quote_server_time,
                cryptokey,
            },
        ): (RestOfTheLog, QuoteServerLog),
    ) -> Self {
        Self {
            timestamp: timestamp.into(),
            server,
            transaction_num,
            price,
            stock_symbol,
            username,
            quote_server_time,
            cryptokey,
        }
    }
}

impl From<(RestOfTheLog, AccountTransactionLog)> for AccountTransactionType {
    fn from(
        (
            RestOfTheLog {
                timestamp,
                server,
                transaction_num,
                username,
            },
            AccountTransactionLog { action, funds },
        ): (RestOfTheLog, AccountTransactionLog),
    ) -> Self {
        Self {
            timestamp: timestamp.into(),
            server,
            transaction_num,
            action,
            username,
            funds,
        }
    }
}

impl From<(RestOfTheLog, SystemEventLog)> for SystemEventType {
    fn from(
        (
            RestOfTheLog {
                timestamp,
                server,
                transaction_num,
                username,
            },
            SystemEventLog {
                command,
                stock_symbol,
                filename,
                funds,
            },
        ): (RestOfTheLog, SystemEventLog),
    ) -> Self {
        Self {
            timestamp: timestamp.into(),
            server,
            transaction_num,
            command: command.into(),
            username: Some(username),
            stock_symbol,
            filename,
            funds,
        }
    }
}

impl From<(RestOfTheLog, ErrorEventLog)> for ErrorEventType {
    fn from(
        (
            RestOfTheLog {
                timestamp,
                server,
                transaction_num,
                username,
            },
            ErrorEventLog {
                command,
                stock_symbol,
                filename,
                funds,
                error_message,
            },
        ): (RestOfTheLog, ErrorEventLog),
    ) -> Self {
        Self {
            timestamp: timestamp.into(),
            server,
            transaction_num,
            command: command.into(),
            username: Some(username),
            stock_symbol,
            filename,
            funds,
            error_message,
        }
    }
}

impl From<(RestOfTheLog, DebugLog)> for DebugType {
    fn from(
        (
            RestOfTheLog {
                timestamp,
                server,
                transaction_num,
                username,
            },
            DebugLog {
                command,
                stock_symbol,
                filename,
                funds,
                debug_message,
            },
        ): (RestOfTheLog, DebugLog),
    ) -> Self {
        Self {
            timestamp: timestamp.into(),
            server,
            transaction_num,
            command: command.into(),
            username: Some(username),
            stock_symbol,
            filename,
            funds,
            debug_message,
        }
    }
}
