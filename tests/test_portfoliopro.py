import pytest
from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from accounts.models import UserProfile, TradingAccount, AccountTransaction
from stocks.models import Stock, StockPriceHistory
from trading.models import Order, TradeExecution
from portfolio.models import PortfolioHolding
from risk.models import RiskMetric, RiskLimit
from analysis.models import FundamentalReport, TechnicalIndicatorCache
from notifications.models import Notification, PriceAlert
from support.models import SupportTicket, TicketMessage

@pytest.mark.django_db
class TestPortfolioProSuite:

    @pytest.fixture(autouse=True)
    def setup_data(self):
        self.client = APIClient()
        
        # Create Customer Trader
        self.trader_user = User.objects.create_user(
            username='alex_trader_test',
            email='alex@test.com',
            password='TestPassword@123'
        )
        self.trader_profile = UserProfile.objects.create(
            user=self.trader_user,
            role='CUSTOMER',
            kyc_status='VERIFIED'
        )
        self.trader_account = TradingAccount.objects.create(
            user=self.trader_user,
            account_number='PP-TEST-001',
            balance=Decimal('100000.00'),
            status='ACTIVE'
        )

        # Create Finance Officer
        self.officer_user = User.objects.create_user(
            username='sarah_officer_test',
            email='sarah@test.com',
            password='OfficerPassword@123'
        )
        self.officer_profile = UserProfile.objects.create(
            user=self.officer_user,
            role='FINANCE_OFFICER',
            kyc_status='VERIFIED'
        )

        # Create Sample Stock
        self.stock = Stock.objects.create(
            symbol='AAPL',
            company_name='Apple Inc.',
            sector='Technology',
            industry='Consumer Electronics',
            current_price=Decimal('220.00'),
            previous_close=Decimal('218.00'),
            day_high=Decimal('222.00'),
            day_low=Decimal('217.50'),
            volume=50000000,
            market_cap=3400000000000,
            pe_ratio=Decimal('33.5'),
            beta=Decimal('1.10'),
            fifty_two_week_high=Decimal('235.00'),
            fifty_two_week_low=Decimal('165.00')
        )

    # 1. User Authentication Tests (US05, US06, US07)
    def test_user_registration_api(self):
        payload = {
            'username': 'new_investor',
            'email': 'new@test.com',
            'password': 'SecurePassword@2026',
            'first_name': 'David',
            'last_name': 'Kim',
            'role': 'CUSTOMER'
        }
        res = self.client.post('/api/accounts/auth/register/', payload, format='json')
        assert res.status_code == 201
        assert res.data['user']['username'] == 'new_investor'
        # Verify automatic paper trading balance of $100,000 was credited
        user = User.objects.get(username='new_investor')
        acc = TradingAccount.objects.get(user=user)
        assert acc.balance == Decimal('100000.00')

    def test_user_login_api(self):
        res = self.client.post('/api/accounts/auth/login/', {
            'username': 'alex_trader_test',
            'password': 'TestPassword@123'
        }, format='json')
        assert res.status_code == 200
        assert res.data['role'] == 'CUSTOMER'

    # 2. Account Management & Cash Flow Tests (US08, US09, US10)
    def test_deposit_and_withdrawal(self):
        self.client.force_authenticate(user=self.trader_user)
        # Deposit $15,000
        res = self.client.post(f'/api/accounts/accounts/{self.trader_account.id}/deposit/', {
            'amount': 15000,
            'description': 'Additional wire deposit'
        }, format='json')
        assert res.status_code == 200
        self.trader_account.refresh_from_db()
        assert self.trader_account.balance == Decimal('115000.00')

        # Withdraw $10,000
        res_w = self.client.post(f'/api/accounts/accounts/{self.trader_account.id}/withdraw/', {
            'amount': 10000,
            'description': 'Liquidity withdrawal'
        }, format='json')
        assert res_w.status_code == 200
        self.trader_account.refresh_from_db()
        assert self.trader_account.balance == Decimal('105000.00')

    # 3. Market Data Tests (US11, US12, US13)
    def test_market_data_retrieval(self):
        res = self.client.get('/api/stocks/stocks/')
        assert res.status_code == 200
        data = res.data.get('results') if isinstance(res.data, dict) else res.data
        symbols = [s['symbol'] for s in data]
        assert 'AAPL' in symbols

    # 4. Trading Engine Tests (US14, US15, US16)
    def test_execute_buy_order_paper_trading(self):
        self.client.force_authenticate(user=self.trader_user)
        order_payload = {
            'symbol': 'AAPL',
            'order_type': 'MARKET',
            'side': 'BUY',
            'quantity': 20
        }
        res = self.client.post('/api/trading/orders/', order_payload, format='json')
        assert res.status_code == 201
        assert res.data['status'] == 'EXECUTED'
        
        # Check holding created
        holding = PortfolioHolding.objects.get(user=self.trader_user, stock=self.stock)
        assert holding.shares == 20
        assert holding.average_buy_price == Decimal('220.00')
        
        # Check cash deducted: 100000 - (20 * 220) = 95600
        self.trader_account.refresh_from_db()
        assert self.trader_account.balance == Decimal('95600.00')

        # Check TradeExecution record created
        assert TradeExecution.objects.filter(user=self.trader_user, stock=self.stock).exists()

    def test_execute_sell_order(self):
        self.client.force_authenticate(user=self.trader_user)
        # Create initial holding of 30 shares
        PortfolioHolding.objects.create(
            user=self.trader_user,
            account=self.trader_account,
            stock=self.stock,
            shares=30,
            average_buy_price=Decimal('200.00'),
            total_cost=Decimal('6000.00')
        )
        
        # Sell 10 shares @ current price $220
        order_payload = {
            'symbol': 'AAPL',
            'order_type': 'MARKET',
            'side': 'SELL',
            'quantity': 10
        }
        res = self.client.post('/api/trading/orders/', order_payload, format='json')
        assert res.status_code == 201
        assert res.data['status'] == 'EXECUTED'

        holding = PortfolioHolding.objects.get(user=self.trader_user, stock=self.stock)
        assert holding.shares == 20
        # Balance increases by 10 * 220 = $2,200 => $102,200
        self.trader_account.refresh_from_db()
        assert self.trader_account.balance == Decimal('102200.00')

    def test_insufficient_funds_rejection(self):
        self.client.force_authenticate(user=self.trader_user)
        # Attempt to buy 1,000 shares @ $220 = $220,000 (exceeds $100k balance)
        order_payload = {
            'symbol': 'AAPL',
            'order_type': 'MARKET',
            'side': 'BUY',
            'quantity': 1000
        }
        res = self.client.post('/api/trading/orders/', order_payload, format='json')
        assert res.status_code == 400
        assert 'Insufficient funds' in res.data['error']

    # 5. Portfolio Management Tests (US17, US18, US19)
    def test_portfolio_summary_calculations(self):
        self.client.force_authenticate(user=self.trader_user)
        PortfolioHolding.objects.create(
            user=self.trader_user,
            account=self.trader_account,
            stock=self.stock,
            shares=50,
            average_buy_price=Decimal('200.00'),
            total_cost=Decimal('10000.00')
        )
        res = self.client.get('/api/portfolio/summary/')
        assert res.status_code == 200
        # Invested value: 50 * 220 = $11,000
        assert float(res.data['invested_value']) == 11000.0
        # Unrealized P&L: 11000 - 10000 = $1,000
        assert float(res.data['unrealized_pnl']) == 1000.0
        # Return % = 10.0%
        assert res.data['return_percentage'] == 10.0

    # 6. Risk Analytics Tests (US20, US21, US22)
    def test_risk_metrics_calculation(self):
        self.client.force_authenticate(user=self.trader_user)
        res = self.client.get('/api/risk/metrics/')
        assert res.status_code == 200
        assert 'metrics' in res.data
        assert 'stress_testing' in res.data
        assert len(res.data['stress_testing']) == 3

    # 7. Technical Analysis Tests (US23, US24, US25)
    def test_technical_indicators_engine(self):
        # Create some historical price bars
        for i in range(25):
            StockPriceHistory.objects.create(
                stock=self.stock,
                date=f'2026-10-{i+1:02d}',
                open_price=Decimal('210.00') + Decimal(str(i * 0.5)),
                high_price=Decimal('212.00') + Decimal(str(i * 0.5)),
                low_price=Decimal('209.00') + Decimal(str(i * 0.5)),
                close_price=Decimal('211.00') + Decimal(str(i * 0.5)),
                volume=40000000
            )
        res = self.client.get('/api/analysis/technical/AAPL/')
        assert res.status_code == 200
        indicators = res.data['indicators']
        assert 'sma_20' in indicators
        assert 'rsi_14' in indicators
        assert 'macd' in indicators
        assert 'bollinger_upper' in indicators
        assert 'overall_recommendation' in indicators

    # 8. Fundamental Analysis Tests (US26, US27, US28)
    def test_fundamental_report(self):
        FundamentalReport.objects.create(
            stock=self.stock,
            fiscal_year=2025,
            revenue=390000000000,
            net_income=100000000000,
            total_assets=350000000000,
            total_debt=105000000000,
            operating_cash_flow=115000000000,
            roe=Decimal('32.40'),
            debt_to_equity=Decimal('0.62'),
            profit_margin=Decimal('25.60'),
            summary='Dominant market leader with robust free cash flows.'
        )
        res = self.client.get('/api/analysis/fundamentals/AAPL/detail/')
        assert res.status_code == 200
        assert res.data['fiscal_year'] == 2025
        assert float(res.data['roe']) == 32.40

    # 9. Notifications and Alerts Tests (US29, US30, US31)
    def test_notification_and_price_alert(self):
        self.client.force_authenticate(user=self.trader_user)
        # Create notification
        notif = Notification.objects.create(
            user=self.trader_user,
            title='Test Alert',
            message='Stock hit target',
            notification_type='PRICE_ALERT'
        )
        res = self.client.get('/api/notifications/notifications/')
        assert res.status_code == 200
        
        # Mark as read
        res_read = self.client.post(f'/api/notifications/notifications/{notif.id}/mark_as_read/')
        assert res_read.status_code == 200
        notif.refresh_from_db()
        assert notif.is_read is True

    # 10. Customer Support Tests (US32, US33, US34)
    def test_customer_support_flow(self):
        self.client.force_authenticate(user=self.trader_user)
        # Create ticket
        res = self.client.post('/api/support/tickets/', {
            'subject': 'Order Execution Query',
            'category': 'TRADING',
            'priority': 'HIGH',
            'initial_message': 'Why was my stop-loss order placed in pending?'
        }, format='json')
        assert res.status_code == 201
        tkt_num = res.data['ticket_number']

        # Add message
        res_msg = self.client.post(f'/api/support/tickets/{tkt_num}/add_message/', {
            'message': 'Also wanted to check execution fees.'
        }, format='json')
        assert res_msg.status_code == 201
