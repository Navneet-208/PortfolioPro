# PortfolioPro - Requirements Summary & Architecture Specification
**Deliverable D02 (Sprint 0 - Epic P15-E01 / US03)**

## 1. Problem Statement
Retail traders and financial analysts face fragmented tools: charting software is disconnected from trading accounts, portfolio tracking spreadsheets lack automated risk calculations, and institutional compliance tools are inaccessible to modern individual investors. 

**PortfolioPro** solves this problem by delivering an integrated, high-performance web platform that unites:
- Live market data streaming and interactive charting
- Zero-risk paper trading simulation with realistic fill logic
- Real-time portfolio accounting, P&L calculations, and asset allocation
- Quantitative risk metrics (1-day 95% Value at Risk, Beta, Sharpe Ratio, Volatility)
- Algorithmic technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
- In-depth fundamental analysis and financial ratio assessment
- Multi-channel notification alerts and customer support issue tracking
- Institutional role-based access control separating **Customer / Trader** and **Finance Officer / Auditor**

---

## 2. User Roles & Permission Matrix

| Feature Module | Customer / Trader Role | Finance Officer / Auditor Role |
|---|---|---|
| **Authentication & Profile** | Register, Login, view and edit own profile & risk tolerance | Full user audit directory, inspect all profiles & KYC statuses |
| **Trading Account** | View own paper trading balance, deposit, withdraw | Audit all accounts, view system-wide balances, inspect transaction audit log |
| **Market Data** | Browse equities, view real-time quotes, sector filters, watchlists | Browse equities, edit market quotes, manage ticker catalog |
| **Trading Engine** | Place Buy/Sell orders (Market, Limit, Stop-Loss), cancel pending | View all orders across all accounts, audit trade executions |
| **Portfolio Management** | View own active holdings, position value, unrealized P&L, sector pie chart | Audit any client's portfolio, inspect consolidated asset allocation |
| **Risk Management** | View own VaR (95%), Beta, Sharpe, Volatility, stress tests, set limits | System-wide risk overview, flag high-risk portfolios (Risk Score > 70) |
| **Technical Analysis** | Calculate and view SMA-20, SMA-50, EMA-20, RSI, MACD, Bollinger Bands | Full access to technical indicator cache and historical price feeds |
| **Fundamental Analysis**| Review revenue, net income, ROE, P/E, EPS, debt-to-equity | Inspect and update corporate financial reports |
| **Notifications & Alerts**| Receive order execution alerts, set price triggers | Broadcast system notices, view triggered alerts |
| **Customer Support** | Submit tickets, reply to inquiries, track resolution status | Manage ticket queue, assign priorities, post official staff replies |
