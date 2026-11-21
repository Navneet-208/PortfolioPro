-- =============================================================================
-- PortfolioPro - Advanced Stock Trading and Portfolio Management Application
-- MySQL 8.0 Normalized Relational Database Schema
-- Deliverable D03 (Sprint 0 - Epic P15-E01 / US02)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `portfoliopro` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `portfoliopro`;

-- Disable foreign key checks for clean creation
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Django Standard Authentication & Core User Table
CREATE TABLE IF NOT EXISTS `auth_user` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `password` VARCHAR(128) NOT NULL,
    `last_login` DATETIME(6) NULL,
    `is_superuser` TINYINT(1) NOT NULL DEFAULT 0,
    `username` VARCHAR(150) NOT NULL UNIQUE,
    `first_name` VARCHAR(150) NOT NULL DEFAULT '',
    `last_name` VARCHAR(150) NOT NULL DEFAULT '',
    `email` VARCHAR(254) NOT NULL DEFAULT '',
    `is_staff` TINYINT(1) NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `date_joined` DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Profiles & Role-Based Access Control
CREATE TABLE IF NOT EXISTS `accounts_userprofile` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `role` VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    `phone_number` VARCHAR(20) NOT NULL DEFAULT '',
    `address` VARCHAR(255) NOT NULL DEFAULT '',
    `kyc_status` VARCHAR(20) NOT NULL DEFAULT 'VERIFIED',
    `risk_tolerance` VARCHAR(20) NOT NULL DEFAULT 'MODERATE',
    `created_at` DATETIME(6) NOT NULL,
    `updated_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Trading Accounts (Paper Trading / Cash)
CREATE TABLE IF NOT EXISTS `accounts_tradingaccount` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `account_number` VARCHAR(30) NOT NULL UNIQUE,
    `account_type` VARCHAR(20) NOT NULL DEFAULT 'PAPER_TRADING',
    `balance` DECIMAL(14, 2) NOT NULL DEFAULT 100000.00,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(6) NOT NULL,
    `updated_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_account_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Account Cash Flow & Transactions
CREATE TABLE IF NOT EXISTS `accounts_accounttransaction` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `account_id` BIGINT NOT NULL,
    `transaction_type` VARCHAR(20) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    `created_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_transaction_account` FOREIGN KEY (`account_id`) REFERENCES `accounts_tradingaccount` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Market Stocks & Tickers
CREATE TABLE IF NOT EXISTS `stocks_stock` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `symbol` VARCHAR(10) NOT NULL UNIQUE,
    `company_name` VARCHAR(150) NOT NULL,
    `sector` VARCHAR(100) NOT NULL,
    `industry` VARCHAR(100) NOT NULL,
    `exchange` VARCHAR(50) NOT NULL DEFAULT 'NASDAQ',
    `current_price` DECIMAL(10, 2) NOT NULL,
    `previous_close` DECIMAL(10, 2) NOT NULL,
    `change` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `change_percent` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    `day_high` DECIMAL(10, 2) NOT NULL,
    `day_low` DECIMAL(10, 2) NOT NULL,
    `volume` BIGINT NOT NULL DEFAULT 0,
    `market_cap` BIGINT NOT NULL DEFAULT 0,
    `pe_ratio` DECIMAL(8, 2) NULL,
    `eps` DECIMAL(8, 2) NULL,
    `dividend_yield` DECIMAL(5, 2) NULL,
    `beta` DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    `fifty_two_week_high` DECIMAL(10, 2) NOT NULL,
    `fifty_two_week_low` DECIMAL(10, 2) NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `updated_at` DATETIME(6) NOT NULL,
    INDEX `idx_stock_symbol` (`symbol`),
    INDEX `idx_stock_sector` (`sector`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Historical Stock Prices (OHLCV)
CREATE TABLE IF NOT EXISTS `stocks_stockpricehistory` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `stock_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `open_price` DECIMAL(10, 2) NOT NULL,
    `high_price` DECIMAL(10, 2) NOT NULL,
    `low_price` DECIMAL(10, 2) NOT NULL,
    `close_price` DECIMAL(10, 2) NOT NULL,
    `volume` BIGINT NOT NULL,
    UNIQUE KEY `unique_stock_date` (`stock_id`, `date`),
    CONSTRAINT `fk_price_history_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. User Watchlists
CREATE TABLE IF NOT EXISTS `stocks_watchlist` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL DEFAULT 'My Watchlist',
    `created_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_watchlist_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stocks_watchlist_stocks` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `watchlist_id` BIGINT NOT NULL,
    `stock_id` BIGINT NOT NULL,
    UNIQUE KEY `unique_watchlist_stock` (`watchlist_id`, `stock_id`),
    CONSTRAINT `fk_wls_watchlist` FOREIGN KEY (`watchlist_id`) REFERENCES `stocks_watchlist` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_wls_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Trading Orders
CREATE TABLE IF NOT EXISTS `trading_order` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `account_id` BIGINT NOT NULL,
    `stock_id` BIGINT NOT NULL,
    `order_type` VARCHAR(20) NOT NULL DEFAULT 'MARKET',
    `side` VARCHAR(10) NOT NULL,
    `quantity` INT UNSIGNED NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `executed_price` DECIMAL(10, 2) NULL,
    `executed_at` DATETIME(6) NULL,
    `notes` LONGTEXT NOT NULL,
    `created_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_account` FOREIGN KEY (`account_id`) REFERENCES `accounts_tradingaccount` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Trade Executions
CREATE TABLE IF NOT EXISTS `trading_tradeexecution` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL UNIQUE,
    `execution_id` VARCHAR(64) NOT NULL UNIQUE,
    `user_id` INT NOT NULL,
    `stock_id` BIGINT NOT NULL,
    `side` VARCHAR(10) NOT NULL,
    `shares` INT UNSIGNED NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `total_value` DECIMAL(12, 2) NOT NULL,
    `commission` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    `executed_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_execution_order` FOREIGN KEY (`order_id`) REFERENCES `trading_order` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_execution_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_execution_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Portfolio Holdings
CREATE TABLE IF NOT EXISTS `portfolio_portfolioholding` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `account_id` BIGINT NOT NULL,
    `stock_id` BIGINT NOT NULL,
    `shares` INT UNSIGNED NOT NULL DEFAULT 0,
    `average_buy_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(6) NOT NULL,
    `updated_at` DATETIME(6) NOT NULL,
    UNIQUE KEY `unique_user_account_stock` (`user_id`, `account_id`, `stock_id`),
    CONSTRAINT `fk_holding_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_holding_account` FOREIGN KEY (`account_id`) REFERENCES `accounts_tradingaccount` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_holding_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Portfolio Historical Snapshots
CREATE TABLE IF NOT EXISTS `portfolio_portfoliosnapshot` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `total_equity` DECIMAL(14, 2) NOT NULL,
    `cash_balance` DECIMAL(14, 2) NOT NULL,
    `invested_value` DECIMAL(14, 2) NOT NULL,
    `unrealized_pnl` DECIMAL(12, 2) NOT NULL,
    `realized_pnl` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `recorded_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_snapshot_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Risk Metrics & Analytics
CREATE TABLE IF NOT EXISTS `risk_riskmetric` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `portfolio_beta` DECIMAL(6, 2) NOT NULL DEFAULT 1.05,
    `value_at_risk_95` DECIMAL(10, 2) NOT NULL DEFAULT 2450.00,
    `sharpe_ratio` DECIMAL(6, 2) NOT NULL DEFAULT 1.85,
    `volatility` DECIMAL(6, 2) NOT NULL DEFAULT 14.50,
    `max_drawdown` DECIMAL(6, 2) NOT NULL DEFAULT 8.20,
    `risk_score` INT NOT NULL DEFAULT 45,
    `calculated_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_risk_metric_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Risk Limits & Controls
CREATE TABLE IF NOT EXISTS `risk_risklimit` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `max_position_size_pct` DECIMAL(5, 2) NOT NULL DEFAULT 25.00,
    `stop_loss_alert_pct` DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    `daily_loss_limit` DECIMAL(12, 2) NOT NULL DEFAULT 5000.00,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_risk_limit_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Fundamental Company Reports
CREATE TABLE IF NOT EXISTS `analysis_fundamentalreport` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `stock_id` BIGINT NOT NULL UNIQUE,
    `fiscal_year` INT NOT NULL DEFAULT 2025,
    `revenue` BIGINT NOT NULL,
    `net_income` BIGINT NOT NULL,
    `total_assets` BIGINT NOT NULL,
    `total_debt` BIGINT NOT NULL,
    `operating_cash_flow` BIGINT NOT NULL,
    `roe` DECIMAL(6, 2) NOT NULL,
    `debt_to_equity` DECIMAL(6, 2) NOT NULL,
    `profit_margin` DECIMAL(6, 2) NOT NULL,
    `quick_ratio` DECIMAL(6, 2) NOT NULL DEFAULT 1.20,
    `summary` LONGTEXT NOT NULL,
    `updated_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_fundamental_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Technical Analysis Indicators Cache
CREATE TABLE IF NOT EXISTS `analysis_technicalindicatorcache` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `stock_id` BIGINT NOT NULL,
    `indicator_name` VARCHAR(50) NOT NULL,
    `value` DECIMAL(12, 4) NOT NULL,
    `signal` VARCHAR(20) NOT NULL DEFAULT 'NEUTRAL',
    `calculated_at` DATETIME(6) NOT NULL,
    UNIQUE KEY `unique_stock_indicator` (`stock_id`, `indicator_name`),
    CONSTRAINT `fk_technical_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. User Notifications
CREATE TABLE IF NOT EXISTS `notifications_notification` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `notification_type` VARCHAR(30) NOT NULL DEFAULT 'SYSTEM_NOTICE',
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Price Alerts
CREATE TABLE IF NOT EXISTS `notifications_pricealert` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `stock_id` BIGINT NOT NULL,
    `target_price` DECIMAL(10, 2) NOT NULL,
    `condition` VARCHAR(10) NOT NULL DEFAULT 'ABOVE',
    `is_triggered` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_pricealert_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pricealert_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Customer Support Tickets
CREATE TABLE IF NOT EXISTS `support_supportticket` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `ticket_number` VARCHAR(30) NOT NULL UNIQUE,
    `user_id` INT NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `category` VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    `priority` VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    `status` VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    `created_at` DATETIME(6) NOT NULL,
    `updated_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_support_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Support Ticket Messages / Conversation
CREATE TABLE IF NOT EXISTS `support_ticketmessage` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `ticket_id` BIGINT NOT NULL,
    `sender_id` INT NOT NULL,
    `message` LONGTEXT NOT NULL,
    `is_staff_reply` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_message_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_supportticket` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
