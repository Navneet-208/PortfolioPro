# PortfolioPro - Screen Wireframes & UI/UX Specification
**Deliverable D02 (Sprint 0 - Epic P15-E01 / US03)**

## 1. Authentication Screens

### Login Wireframe
```
+---------------------------------------------------------------+
|                      PORTFOLIOPRO                             |
|          Advanced Stock Trading & Portfolio Suite             |
+---------------------------------------------------------------+
|                                                               |
|                  [ Sign In to Your Account ]                  |
|                                                               |
|   Username:     [ alex_trader                             ]   |
|   Password:     [ ****************                        ]   |
|                                                               |
|   [ Login as Trader ]          [ Demo Quick Fill Buttons: ]   |
|                                [ Trader Demo | Officer ]      |
|                                                               |
|   Don't have an account? [ Register Here ]                    |
+---------------------------------------------------------------+
```

---

## 2. Main Financial Dashboard Wireframe

```
+----------------------------------------------------------------------------------------------------+
|  PORTFOLIOPRO   [Search Tickers: AAPL, NVDA...]   Alerts (3)   Role: CUSTOMER   Alex Morgan [Logout]|
+----------------------------------------------------------------------------------------------------+
|  NAVIGATION:                                                                                       |
|  [ Dashboard ] [ Market Data ] [ Trade Engine ] [ Portfolio ] [ Risk ] [ Analysis ] [ Support ]    |
+----------------------------------------------------------------------------------------------------+
|  TOP KPI METRICS STRIP:                                                                            |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
|  | Total Equity       |  | Cash Balance       |  | Invested Capital   |  | Unrealized P&L     |    |
|  | $108,420.50        |  | $53,735.00         |  | $54,685.50         |  | +$8,420.50 (+8.4%) |    |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
|                                                                                                    |
|  MAIN CHART: 30-Day Equity Curve                  ASSET ALLOCATION (Chart.js Pie):                 |
|  +--------------------------------------------+  +-----------------------------------------------+ |
|  | $110k |             /\                     |  |  Technology:         48.2%                    | |
|  | $105k |       /\   /  \---\                |  |  Financial Services: 18.9%                    | |
|  | $100k |  ----/  \-/        \               |  |  Communication:      12.4%                    | |
|  |  $95k | /                                  |  |  Cash:               20.5%                    | |
|  |       +----------------------------        |  |                                               | |
|  |       Day 1                  Day 30        |  |                                               | |
|  +--------------------------------------------+  +-----------------------------------------------+ |
|                                                                                                    |
|  PORTFOLIO HOLDINGS SNAPSHOT:                                                                      |
|  [ Ticker ] [ Company ]    [ Shares ] [ Avg Buy ] [ Current ] [ Value ]      [ P&L ]       [ Trade ]|
|  AAPL       Apple Inc.     60         $210.00     $228.50     $13,710.00    +$1,110.00    [Trade]  |
|  NVDA       NVIDIA Corp.   100        $120.00     $138.25     $13,825.00    +$1,825.00    [Trade]  |
|  MSFT       Microsoft      35         $410.50     $428.15     $14,985.25    +$617.75      [Trade]  |
|  JPM       JPMorgan Chase  45         $230.00     $242.30     $10,903.50    +$553.50      [Trade]  |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Trading Engine Wireframe (Order Entry & Executions)

```
+----------------------------------------------------------------------------------------------------+
|  ORDER ENTRY FORM                             |  LIVE ORDER BOOK & STOCK PREVIEW:                   |
|                                               |  Ticker: AAPL - Apple Inc.                         |
|  Select Action:  [ BUY ]   [ SELL ]           |  Current Price: $228.50  (+1.47%)                  |
|                                               |  Day Range: $224.80 - $230.10                      |
|  Stock Symbol:   [ AAPL - Apple Inc.     v ]  |  Volume: 58,240,000 | PE: 34.2 | Beta: 1.12        |
|                                               |----------------------------------------------------|
|  Order Type:     (o) MARKET  ( ) LIMIT        |  TRANSACTION ESTIMATE:                             |
|                  ( ) STOP-LOSS                |  Quantity:             20 Shares                   |
|                                               |  Estimated Price:     $228.50                      |
|  Quantity:       [ 20                      ]  |  Total Consideration: $4,570.00                    |
|  Limit Price:    [ 228.50                  ]  |  Trading Fee:         $0.00 (Zero Commission)      |
|                                               |  Account Balance:     $53,735.00                   |
|  [ EXECUTE PAPER TRADE ]                      |  Post-Trade Balance:  $49,165.00                   |
+----------------------------------------------------------------------------------------------------+
|  RECENT ORDER EXECUTIONS & AUDIT TRAIL:                                                            |
|  [ Execution ID ]  [ Date/Time ]   [ Side ] [ Symbol ] [ Shares ] [ Fill Price ] [ Total Value ]   |
|  EX-7F4B9210       Today 14:22     BUY      NVDA       100        $120.00        $12,000.00        |
|  EX-3A19C08D       Yesterday       BUY      AAPL       60         $210.00        $12,600.00        |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Technical Analysis & Interactive Charting Wireframe

```
+----------------------------------------------------------------------------------------------------+
|  TECHNICAL ANALYSIS SUITE  | Symbol: [ NVDA v ] | Timeframe: [ 30D ] [ 90D ] [ 1Y ]                |
+----------------------------------------------------------------------------------------------------+
|  KEY TECHNICAL GAUGES:                                                                             |
|  Overall Recommendation: [ STRONG BUY ]  |  RSI (14): 64.2 [ NEUTRAL ]  | MACD: +1.84 [ BULLISH ]   |
|  20-Day SMA: $132.40     | 50-Day SMA: $124.10  | Bollinger Upper: $142.10 | Lower: $122.70        |
|                                                                                                    |
|  CANDLESTICK / LINE PRICE CHART WITH SMA-20 & BOLLINGER OVERLAY:                                   |
|  +-----------------------------------------------------------------------------------------------+ |
|  | $145 |                                              .--- Upper BB                             | |
|  | $140 |                                       /\_/\ /                                          | |
|  | $135 |                                      /     V  <-- Price                                | |
|  | $130 |                          /\_/\_/\_--'          <-- SMA 20                              | |
|  | $125 |                    _/\--'                                                              | |
|  | $120 |                 --'                           .--- Lower BB                            | |
|  +-----------------------------------------------------------------------------------------------+ |
|                                                                                                    |
|  MOMENTUM SUB-PANE (RSI & MACD HISTOGRAM):                                                         |
|  +-----------------------------------------------------------------------------------------------+ |
|  | 70 | ---------------------- Overbought Threshold -------------------------------------------- | |
|  | 50 |              /\_/\_                                                                      | |
|  | 30 | ------------'------'-- Oversold Threshold ---------------------------------------------- | |
|  +-----------------------------------------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 5. Risk Management Wireframe

```
+----------------------------------------------------------------------------------------------------+
|  PORTFOLIO RISK DASHBOARD & STRESS TESTING                                                         |
+----------------------------------------------------------------------------------------------------+
|  RISK METRIC GAUGES:                                                                               |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
|  | Risk Score         |  | 1-Day 95% VaR      |  | Portfolio Beta     |  | Sharpe Ratio       |    |
|  | 48 / 100 [MODERATE]|  | $2,840.50          |  | 1.18               |  | 1.94 [EXCELLENT]   |    |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
|                                                                                                    |
|  MACROECONOMIC STRESS TESTING SCENARIOS:                                                           |
|  Scenario                                  Market Shock    Estimated Portfolio Loss   Severity     |
|  ----------------------------------------  ------------    ------------------------   --------     |
|  2008 Financial Crisis Repeat              -25.0%          -$16,127.22                [ HIGH ]     |
|  Tech Sector Correction                    -15.0%          -$9,676.33                 [ MEDIUM ]   |
|  Fed +100bps Interest Rate Hike            -6.0%           -$3,870.53                 [ LOW ]      |
+----------------------------------------------------------------------------------------------------+
```
