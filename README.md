# Day-Trader 
[![Quote Server Adaptor](https://github.com/MarcusDunn/day-trader/actions/workflows/quote-server-adaptor.yml/badge.svg)](https://github.com/MarcusDunn/day-trader/actions/workflows/quote-server-adaptor.yml)[![CLI CI](https://github.com/MarcusDunn/day-trader/actions/workflows/cli.yml/badge.svg)](https://github.com/MarcusDunn/day-trader/actions/workflows/cli.yml)

This is an implementation of a scalable day trading application for UVic's Scalable Systems offering (SENG 468).

## Architecture

```mermaid
graph TD
    WebBrowser[Web Browser]
    NextServer[Next Server]
    CLI[CLI + Load Tester]
    DistributionServer[Distribution Server]
    LogDB[Log Database]
    AuditService[Audit Service]
    TransactionServer[Transaction Server]
    DB[Postgres Database]
    UQS[Uvic Quote Server]
    QSA[Quote Server Adaptor]
    WebBrowser -->|requests| NextServer
    NextServer -->|html + js + css| WebBrowser
    NextServer <-->|gRPC calls| DistributionServer
    CLI <--> |gRPC calls| DistributionServer
    DistributionServer <--> |gRPC calls| TransactionServer
    DistributionServer --> |calls recived events| AuditService
    LogDB -->|normalized logs| AuditService
    AuditService --> |normalized events| LogDB
    AuditService -->|formatted logs| DistributionServer
    DistributionServer --> |audit requests| AuditService
    DistributionServer <-->|gRPC calls| QSA
    TransactionServer --> |processed events| AuditService
    TransactionServer --> |gRPC calls| QSA
    DB --> |user data| TransactionServer
    TransactionServer --> |updates and queries| DB
    QSA <-->|TCP socket| UQS
```

## Database Schema

```mermaid
erDiagram
    USER {
        number balance
    }
    USER ||--|{ BUY_TRIGGER : has
    BUY_TRIGGER {
        string ticker
        number trigger_point
    }
    USER ||--|{ SELL_TRIGGER : has
    SELL_TRIGGER {
        string ticker
        number trigger_point
    }
    USER ||--|{ OWNED_STOCK : has
    OWNED_STOCK {
        string ticker
        number amount
    }
 ```
