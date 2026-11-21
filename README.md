# PortfolioPro – Advanced Stock Trading and Portfolio Management Application

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.2-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Tests-13%20Passed-brightgreen.svg)](tests/)

> **PortfolioPro** is an institutional-grade financial suite combining real-time equity market data, zero-risk paper trading simulation, automated portfolio accounting, quantitative risk evaluation (1-Day 95% VaR, Beta, Sharpe ratio), algorithmic technical analysis (SMA, EMA, RSI, MACD, Bollinger Bands), corporate fundamental valuation, and multi-tier role-based access control (Customer vs Finance Officer).

---

## 📑 Complete 13-Page Project Documentation
The comprehensive 13-page academic and industrial project report is located in:
👉 **[PROJECT_DOCUMENTATION.md](file:///c:/Users/nikki/OneDrive/Desktop/PortfolioPro/docs/PROJECT_DOCUMENTATION.md)**

---

## 🚀 Key Features

1. **Simulated Paper Trading Engine:** Instant execution of Market, Limit, and Stop-Loss orders with virtual $100,000 capital.
2. **Real-Time Portfolio Accounting:** Mark-to-market position valuation, automated cost basis, unrealized P&L, and sector allocation breakdown.
3. **Quantitative Risk Management:** Parametric Value at Risk (1-Day 95% VaR), weighted portfolio beta, Sharpe ratio, and 3 macroeconomic stress test simulations.
4. **Technical Analysis Screener:** Automated computation of SMA-20, SMA-50, EMA-20, RSI-14, MACD, and Bollinger Bands (±2σ) with algorithmic buy/sell recommendations.
5. **Corporate Fundamental Analysis:** Financial ratios (P/E, EPS, ROE %, Profit Margin %, Debt-to-Equity, Quick Ratio) and balance sheet audits.
6. **Role-Based Operational Security:** Segregated roles separating retail **Customers** from administrative **Finance Officers** (auditing, order book supervision, risk surveillance).
7. **Customer Support Desk:** Ticket creation, category/priority tagging, and two-way messaging between customers and compliance staff.
8. **Interactive OpenAPI 3.0 / Swagger UI:** Auto-generated API documentation at `/api/docs/` powered by `drf-spectacular`.

---

## 👥 Demo User Accounts (Pre-Seeded)

| Account Role | Username | Password | Purpose & Capabilities |
|---|---|---|---|
| **Customer / Trader** | `trader_demo` | `Trader@2026` | Retail trading terminal, portfolio management, risk analytics, and orders |
| **Finance Officer** | `finance_officer` | `Officer@2026` | Supervisory audit: client directory, all accounts balances, risk matrix |
| **Platform Admin** | `admin` | `Admin@2026` | Full Django administration and backend control |

---

## 🛠️ Technology Stack

- **Frontend:** React.js 18, Vite 6, Chart.js 4.4, Lucide Icons, Axios, Modern Dark Terminal CSS
- **Backend:** Python 3.14, Django 5.2, Django REST Framework 3.18, NumPy, drf-spectacular
- **Database:** MySQL 8.0 (InnoDB Engine, 19 Normalized Relational Tables in 3NF)
- **Testing:** Pytest 9.2, pytest-django 4.14

---

## ⚙️ Quick Installation and Setup

### 1. Clone & Activate Virtual Environment
```bash
git clone https://github.com/mca2-fsdpython-portfoliopro.git
cd PortfolioPro

# Activate virtual environment
.\venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Database (.env)
Create a `.env` file in the project root:
```env
DB_NAME=portfoliopro
DB_USER=portfolio_user
DB_PASSWORD=Navneet@12345
DB_HOST=127.0.0.1
DB_PORT=3306
SECRET_KEY=django-insecure-portfoliopro-super-secret-key-2026
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 4. Database Migrations & Seeding
```bash
# Apply MySQL migrations
python manage.py migrate

# Seed 12 equities, historical prices, demo users, and initial portfolio
python manage.py seed_db
```

### 5. Frontend Build
```bash
cd frontend
npm install
npm run build
cd ..
```

### 6. Run the Servers

**Option A: Unified Server (Django serves production React SPA)**
```bash
python manage.py runserver 127.0.0.1:8000
```
- Open `http://127.0.0.1:8000/` in your browser.
- Interactive Swagger API: `http://127.0.0.1:8000/api/docs/`

**Option B: Independent Frontend Development Server (Vite)**
```bash
# Terminal 1: Backend
python manage.py runserver 127.0.0.1:8000

# Terminal 2: Frontend (with proxy)
cd frontend
npm run dev
```
- Access at `http://localhost:3000/`

---

## 🧪 Automated Testing

Run the automated test suite with pytest:
```bash
python -m pytest tests/test_portfoliopro.py -v
```
All **13 test suites pass** covering Authentication, Accounts, Market Data, Trading, Portfolio, Risk, Technical Indicators, Fundamentals, Notifications, and Support.

---

## 📁 Project Structure

```
PortfolioPro/
├── accounts/               # User auth, RBAC profiles, trading cash accounts
├── stocks/                 # Equities catalog, 30-day OHLCV prices, watchlists
├── trading/                # Paper order matching, executions, trade ledger
├── portfolio/              # Holdings accounting, cost basis, equity curves
├── risk/                   # 1-day 95% VaR, weighted beta, stress testing
├── analysis/               # Technical indicator engine & fundamental reports
├── notifications/          # Alert system, price boundary triggers, webhooks
├── support/                # Customer service ticketing & staff message thread
├── config/                 # Django settings, root URLs, ASGI/WSGI
├── database/               # MySQL schema.sql and seed_data.sql
├── docs/                   # 13-page project docs, wireframes, test reports
│   └── PROJECT_DOCUMENTATION.md
├── frontend/               # React 18 SPA (Vite, Chart.js, Tailwind theme)
│   ├── src/components/     # Modular view components (Dashboard, Market, Trade...)
│   └── src/services/api.js # Axios REST client
├── tests/                  # Automated pytest verification suite
├── requirements.txt        # Python dependency manifest
└── package.json            # NPM project configuration
```

---

## 📜 Deliverables Index (Guide 2 Requirements)

- **D01:** Git repository setup and branching instructions
- **D02:** [docs/requirements_summary.md](file:///c:/Users/nikki/OneDrive/Desktop/PortfolioPro/docs/requirements_summary.md) & [docs/wireframes.md](file:///c:/Users/nikki/OneDrive/Desktop/PortfolioPro/docs/wireframes.md)
- **D03:** [database/schema.sql](file:///c:/Users/nikki/OneDrive/Desktop/PortfolioPro/database/schema.sql), [database/seed_data.sql](file:///c:/Users/nikki/OneDrive/Desktop/PortfolioPro/database/seed_data.sql) & [docs/ER_diagram.md](file:///c:/Users/nikki/OneDrive/Desktop/PortfolioPro/docs/ER_diagram.md)
- **D04 - D13:** Modules 1 through 11 (Auth, Account, Market, Trading, Portfolio, Risk, Technical, Fundamental, Alerts, Support)
- **D14:** [docs/test-report.md](file:///c:/Users/nikki/OneDrive/Desktop/PortfolioPro/docs/test-report.md)
- **D15:** Interactive Swagger UI at `/api/docs/`
- **D16 - D17:** Final Release v1.0.0 Documentation & Presentation Guide
