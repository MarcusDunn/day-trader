# Day-Trader 
[![Quote Server Adaptor](https://github.com/MarcusDunn/day-trader/actions/workflows/quote-server-adaptor.yml/badge.svg)](https://github.com/MarcusDunn/day-trader/actions/workflows/quote-server-adaptor.yml)[![CLI CI](https://github.com/MarcusDunn/day-trader/actions/workflows/cli.yml/badge.svg)](https://github.com/MarcusDunn/day-trader/actions/workflows/cli.yml)

This is an implementation of a scalable day trading application for UVic's Scalable Systems offering (SENG 468).

## Architecture

```mermaid
graph TD
    WebBrowser[Web Browser]
    NextServer[Next Server]
    CLI[CLI + Load Tester]
    TransactionServer[Transaction Server]
    DB[Postgres Database]
    QSA[Quote Server Adaptor]
    UQS[Uvic Quote Server]
    WebBrowser -->|requests| NextServer
    NextServer -->|html + js + css| WebBrowser
    NextServer <-->|gRPC calls| DistributionServer
    CLI <--> |gRPC calls| DistributionServer
    DistributionServer <--> |gRPC calls| TransactionServer
    TransactionServer --> |gRPC calls| QSA
    DB --> |user data| TransactionServer
    TransactionServer --> |updates and queries| DB
    QSA <-->|TCP socket| UQS
```

## Database Schema

```mermaid
erDiagram
    trader {
        double balance
        user_id text
    }
    stock {
        text owner_id 
        text stock_symbol 
        double amount
    }
    trader ||--|{ stock : owns
    sell_trigger {
        text owner_id
        text stock_symbol
        amount_stock double
        trigger_price double
    }
    trader ||--|{ sell_trigger : has
    buy_trigger {
        text owner_id
        text stock_symbol
        amount_dollars double
        trigger_price double
    }
    trader ||--|{ buy_trigger : has
    queued_sell {
        text owner_id
        text stock_symbol
        double amount_dollars
        double quoted_price
        timestamp time_created
    }
    trader ||--|| queued_sell : has
    queued_buy {
        text owner_id
        text stock_symbol
        double amount_dollars
        double quoted_price
        timestamp time_created
    }
    trader ||--|| queued_buy : has
    log_entry {
        timestamp timestamp
        text server
        int transaction_num
        text username
        jsonb log 
    }
 ```
