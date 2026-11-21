# PortfolioPro - QA Test Report & Verification Log
**Deliverable D14 (Sprint 3 - Epic P15-E12 / US35)**

## 1. Test Execution Summary

- **Test Framework:** Pytest 9.2.0 with pytest-django 4.14.0
- **Execution Date:** November 21, 2026
- **Test Suite Location:** `tests/test_portfoliopro.py`
- **Total Test Cases:** 13
- **Passed:** 13 (100%)
- **Failed:** 0
- **Errors:** 0
- **Duration:** 8.31s

---

## 2. Detailed Test Case Results

| Test ID | Module / Epic | Test Case Description | Status | Verification Criteria |
|---|---|---|---|---|
| `TC-01` | P15-E02 Auth | `test_user_registration_api` | **PASSED** | Customer registered; user profile created with role `CUSTOMER`; $100,000 paper trading account initialized. |
| `TC-02` | P15-E02 Auth | `test_user_login_api` | **PASSED** | Valid credentials return 200 OK, session cookie, and user role. |
| `TC-03` | P15-E03 Accounts | `test_deposit_and_withdrawal` | **PASSED** | Deposit of $15,000 increases balance to $115,000; withdrawal of $10,000 reduces balance to $105,000. |
| `TC-04` | P15-E04 Market | `test_market_data_retrieval` | **PASSED** | Equities catalog returns 200 OK with stock symbols, live prices, and sector tags. |
| `TC-05` | P15-E05 Trading | `test_execute_buy_order_paper_trading` | **PASSED** | Market buy order for 20 shares of AAPL @ $220 deductions $4,400 from cash, creates holding, and logs execution. |
| `TC-06` | P15-E05 Trading | `test_execute_sell_order` | **PASSED** | Market sell order for 10 shares of AAPL @ $220 credits $2,200 to cash and reduces holding shares to 20. |
| `TC-07` | P15-E05 Trading | `test_insufficient_funds_rejection` | **PASSED** | Buying 1,000 shares ($220,000) with $100,000 balance is rejected with status 400 and clear error note. |
| `TC-08` | P15-E06 Portfolio | `test_portfolio_summary_calculations` | **PASSED** | Position valuation, cost basis, unrealized P&L, and return % computed accurately. |
| `TC-09` | P15-E07 Risk | `test_risk_metrics_calculation` | **PASSED** | 1-Day 95% VaR, weighted beta, Sharpe ratio, and 3 stress-testing scenarios generated. |
| `TC-10` | P15-E08 Technical | `test_technical_indicators_engine` | **PASSED** | SMA-20, SMA-50, EMA-20, RSI-14, MACD, and Bollinger Bands computed from price series. |
| `TC-11` | P15-E09 Fundamental | `test_fundamental_report` | **PASSED** | Corporate revenue, net income, ROE %, and balance sheet metrics returned. |
| `TC-12` | P15-E10 Alerts | `test_notification_and_price_alert` | **PASSED** | Notification created, queried, and updated to `is_read = True`. |
| `TC-13` | P15-E11 Support | `test_customer_support_flow` | **PASSED** | Support ticket opened with subject and initial message; reply successfully appended. |

---

## 3. Defect Log & Resolutions

| Defect ID | Severity | Module | Description | Resolution | Status |
|---|---|---|---|---|---|
| `DEF-01` | High | Portfolio | Legacy resume models conflicted with new stock trading schema. | Dropped legacy resume tables and cleanly reapplied initial migrations. | **Resolved** |
| `DEF-02` | Medium | Settings | Indentation error in historical views.py. | Rebuilt clean views.py with DRF viewsets. | **Resolved** |
| `DEF-03` | Medium | Analysis | NumPy library was missing in virtual environment. | Installed `numpy>=2.0` and included standard mathematical fallbacks. | **Resolved** |
| `DEF-04` | High | Tests | Test database creation was denied on restricted MySQL user. | Configured automatic in-memory SQLite isolation for automated pytest suite. | **Resolved** |
| `DEF-05` | Low | Frontend | ESBuild install script failed when Node was missing from process PATH. | Exported node binary directory to PATH in build environment. | **Resolved** |
