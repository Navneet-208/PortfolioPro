# PortfolioPro - Advanced Stock Trading and Portfolio Management Application

**Project Code:** P15  
**Institution:** ABES Engineering College | MCA 2nd Year  
**Track:** FSD Python  
**Prepared For:** Program Manager, EdTech, HCLTech  
**Technology Stack:** Python 3.14 / Django 5.2 (REST Framework) + React 18 + MySQL 8.0 Community Server

---

## 1. Project Overview & Architecture

PortfolioPro is an institutional-grade, full-stack stock trading and portfolio management application built for retail investors and finance officers. It covers all 10 project modules:

1. **User Authentication:** Token & session authentication, role-based access control (`INVESTOR`, `FINANCE_OFFICER`, `ADMIN`).
2. **Account Management:** Virtual trading wallets, balance tracking, deposits, withdrawals, and full transaction history.
3. **Market Data:** Live & historical quotes for Indian equities (NSE/BSE like RELIANCE, TCS, INFY, HDFCBANK, etc.), sector categorization, and interactive watchlists.
4. **Trading Engine:** Paper trading engine supporting Market, Limit, and Stop orders with atomic balance deduction and trade executions.
5. **Portfolio Management:** Real-time holdings aggregation, profit/loss (P&L), return percentage, portfolio snapshot logging, and asset allocation breakdown.
6. **Risk Management:** Risk metrics calculations (Beta, Value at Risk / VaR, Sharpe ratio, Max Drawdown), portfolio risk limits, and exposure auditing.
7. **Technical Analysis:** On-the-fly technical indicators including Simple Moving Averages (SMA-20, SMA-50), Exponential Moving Average (EMA), Relative Strength Index (RSI-14), MACD, and Bollinger Bands.
8. **Fundamental Analysis:** Comprehensive company profiles, valuation metrics (P/E ratio, P/B ratio, Market Cap, Dividend Yield, EPS, ROE, Debt-to-Equity), and buy/hold/sell consensus ratings.
9. **Notifications & Alerts:** Real-time system notifications and user-configurable stock price threshold alert triggers.
10. **Customer Support:** Interactive ticketing system with threaded messages between traders and finance officers/support staff.

---

## 2. Directory Structure

```text
PortfolioPro/
│
├── accounts/           # User authentication, profiles, trading accounts & fund ledger
├── stocks/             # Market data, ticker profiles, price histories, watchlists
├── trading/            # Order placement, execution engine, order book
├── portfolio/          # Portfolio holdings, positions, valuation, snapshots
├── risk/               # Risk metrics (VaR, Beta, Sharpe), limits & exposure audit
├── analysis/           # Technical indicators (RSI, MACD, SMA) & Fundamental data
├── notifications/      # Notifications and price threshold alert triggers
├── support/            # Customer support tickets & threaded discussions
├── config/             # Django root configuration, URL routing, settings, WSGI/ASGI
├── database/           # MySQL 8.0 DDL schema (`schema.sql`) and seed data (`seed_data.sql`)
├── docs/               # Requirements summary, wireframes, and ER diagrams
├── frontend/           # React 18 frontend (Vite, Bootstrap, responsive trading UI)
│   ├── dist/           # Built and production-ready static assets served by Django
│   └── src/            # React source code & modules
├── tests/              # 13 comprehensive end-to-end integration tests (pytest-django)
├── manage.py           # Django management CLI
├── requirements.txt    # Python dependencies
├── pytest.ini          # Pytest configuration
├── .env                # Local environment variables (MySQL credentials, secret key)
└── README.md           # Project documentation
```

---

## 3. Database & MySQL Setup

The application connects to **MySQL 8.0 Community Server** (`portfoliopro` database) running on `127.0.0.1:3306`:
- **Database:** `portfoliopro`
- **User:** `portfolio_user`
- **Password:** `Navneet@12345`

### Pre-loaded Test & Demo Accounts:
- **Administrator:** `admin` / `Admin@12345`
- **Active Trader:** `trader_demo` / `Trader@12345`
- **Finance Officer:** `finance_officer` / `Officer@12345`

---

## 4. How to Run the Application

### Option A: Quick Launch (Interactive Batch Script)
Double-click `run_portfoliopro.bat` in the project root, or execute:
```powershell
.\run_portfoliopro.bat
```

### Option B: Manual Terminal Execution
```powershell
# 1. Activate Virtual Environment
.\venv\Scripts\Activate.ps1

# 2. Run Database Migrations (if needed)
python manage.py migrate

# 3. Start the Server
python manage.py runserver 127.0.0.1:8000
```

Open your browser at:
- **Web App (Trading UI):** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Interactive Swagger API Docs:** [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
- **Django Admin Portal:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## 5. Automated Test Suite

Run the full end-to-end test suite (13 comprehensive tests covering all modules):
```powershell
.\venv\Scripts\python.exe -m pytest
```
All 13 tests pass with 100% success rate:
- `test_user_registration_api` - PASSED
- `test_user_login_api` - PASSED
- `test_deposit_and_withdrawal` - PASSED
- `test_market_data_retrieval` - PASSED
- `test_execute_buy_order_paper_trading` - PASSED
- `test_execute_sell_order` - PASSED
- `test_insufficient_funds_rejection` - PASSED
- `test_portfolio_summary_calculations` - PASSED
- `test_risk_metrics_calculation` - PASSED
- `test_technical_indicators_engine` - PASSED
- `test_fundamental_report` - PASSED
- `test_notification_and_price_alert` - PASSED
- `test_customer_support_flow` - PASSED
