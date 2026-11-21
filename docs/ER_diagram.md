# PortfolioPro - Entity Relationship (ER) Diagram & Data Model
**Deliverable D03 (Sprint 0 - Epic P15-E01 / US02)**

## 1. Database Architecture Overview
The database schema for **PortfolioPro** is normalized to 3NF (Third Normal Form) and implemented for **MySQL 8.0** with strict transactional integrity (InnoDB engine, foreign keys, cascade deletes, and indexing on frequent lookup fields such as `symbol`, `sector`, `date`, `user_id`).

---

## 2. Mermaid Entity Relationship (ER) Diagram

```mermaid
erDiagram
    auth_user ||--|| accounts_userprofile : has
    auth_user ||--o{ accounts_tradingaccount : owns
    auth_user ||--o{ trading_order : places
    auth_user ||--o{ trading_tradeexecution : executes
    auth_user ||--o{ portfolio_portfolioholding : holds
    auth_user ||--o{ portfolio_portfoliosnapshot : records
    auth_user ||--|| risk_riskmetric : evaluated_by
    auth_user ||--o{ risk_risklimit : sets
    auth_user ||--o{ notifications_notification : receives
    auth_user ||--o{ notifications_pricealert : sets
    auth_user ||--o{ support_supportticket : opens
    auth_user ||--o{ support_ticketmessage : sends

    accounts_tradingaccount ||--o{ accounts_accounttransaction : logs
    accounts_tradingaccount ||--o{ trading_order : funds
    accounts_tradingaccount ||--o{ portfolio_portfolioholding : balances

    stocks_stock ||--o{ stocks_stockpricehistory : tracks
    stocks_stock ||--o{ trading_order : target_of
    stocks_stock ||--o{ trading_tradeexecution : traded_in
    stocks_stock ||--o{ portfolio_portfolioholding : represented_in
    stocks_stock ||--|| analysis_fundamentalreport : has
    stocks_stock ||--o{ analysis_technicalindicatorcache : computes
    stocks_stock ||--o{ notifications_pricealert : monitored_by

    trading_order ||--o| trading_tradeexecution : results_in
    support_supportticket ||--o{ support_ticketmessage : contains

    auth_user {
        int id PK
        string username UK
        string email
        string first_name
        string last_name
        boolean is_staff
    }

    accounts_userprofile {
        bigint id PK
        int user_id FK
        string role "CUSTOMER | FINANCE_OFFICER"
        string kyc_status "PENDING | VERIFIED | REJECTED"
        string risk_tolerance "CONSERVATIVE | MODERATE | AGGRESSIVE"
    }

    accounts_tradingaccount {
        bigint id PK
        int user_id FK
        string account_number UK
        string account_type "PAPER_TRADING | MARGIN"
        decimal balance
        string status "ACTIVE | SUSPENDED"
    }

    stocks_stock {
        bigint id PK
        string symbol UK
        string company_name
        string sector
        decimal current_price
        decimal change
        decimal change_percent
        decimal pe_ratio
        decimal beta
    }

    trading_order {
        bigint id PK
        int user_id FK
        bigint account_id FK
        bigint stock_id FK
        string order_type "MARKET | LIMIT | STOP_LOSS"
        string side "BUY | SELL"
        int quantity
        decimal price
        string status "PENDING | EXECUTED | CANCELLED | REJECTED"
    }

    portfolio_portfolioholding {
        bigint id PK
        int user_id FK
        bigint account_id FK
        bigint stock_id FK
        int shares
        decimal average_buy_price
        decimal total_cost
    }

    risk_riskmetric {
        bigint id PK
        int user_id FK
        decimal portfolio_beta
        decimal value_at_risk_95
        decimal sharpe_ratio
        decimal volatility
        int risk_score
    }
```

---

## 3. Normalized Relational Table Summary

| Table Name | Primary Key | Foreign Keys | Purpose |
|---|---|---|---|
| `auth_user` | `id` | None | Django core user authentication table |
| `accounts_userprofile` | `id` | `user_id` -> `auth_user(id)` | User role (Customer, Finance Officer), KYC, contact details |
| `accounts_tradingaccount` | `id` | `user_id` -> `auth_user(id)` | Paper trading account balance, type, account number |
| `accounts_accounttransaction` | `id` | `account_id` -> `accounts_tradingaccount(id)` | Ledger of deposits, withdrawals, trade debits and credits |
| `stocks_stock` | `id` | None | Equities master catalog, current quotes, volume, market cap |
| `stocks_stockpricehistory` | `id` | `stock_id` -> `stocks_stock(id)` | Daily OHLCV price series for interactive charting |
| `stocks_watchlist` | `id` | `user_id` -> `auth_user(id)` | Saved user stock watchlists |
| `trading_order` | `id` | `user_id`, `account_id`, `stock_id` | Buy/Sell orders (Market, Limit, Stop-Loss) with life-cycle state |
| `trading_tradeexecution` | `id` | `order_id`, `user_id`, `stock_id` | Trade fill audit log with execution ID and timestamp |
| `portfolio_portfolioholding` | `id` | `user_id`, `account_id`, `stock_id` | Current position size, average entry price, total invested capital |
| `portfolio_portfoliosnapshot` | `id` | `user_id` -> `auth_user(id)` | Daily portfolio equity snapshots for historical performance curves |
| `risk_riskmetric` | `id` | `user_id` -> `auth_user(id)` | 95% VaR, Beta, Sharpe ratio, Volatility %, Composite Risk Score |
| `risk_risklimit` | `id` | `user_id` -> `auth_user(id)` | Risk controls: max position size %, stop-loss alert % |
| `analysis_fundamentalreport` | `id` | `stock_id` -> `stocks_stock(id)` | Annual income, balance sheet, ROE, debt-to-equity, summary |
| `analysis_technicalindicatorcache` | `id` | `stock_id` -> `stocks_stock(id)` | SMA-20, SMA-50, EMA-20, RSI-14, MACD, Bollinger Bands, signals |
| `notifications_notification` | `id` | `user_id` -> `auth_user(id)` | In-app alerts: trade executions, price movements, system events |
| `notifications_pricealert` | `id` | `user_id`, `stock_id` | User price trigger conditions (Crosses Above, Falls Below) |
| `support_supportticket` | `id` | `user_id` -> `auth_user(id)` | Customer service tickets with category, priority, and workflow status |
| `support_ticketmessage` | `id` | `ticket_id`, `sender_id` | Conversation thread between customer and finance/support officers |
