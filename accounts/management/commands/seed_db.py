from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone
import random
import uuid

from accounts.models import UserProfile, TradingAccount, AccountTransaction
from stocks.models import Stock, StockPriceHistory, Watchlist
from trading.models import Order, TradeExecution
from portfolio.models import PortfolioHolding, PortfolioSnapshot
from risk.models import RiskMetric, RiskLimit
from analysis.models import FundamentalReport, TechnicalIndicatorCache
from notifications.models import Notification, PriceAlert
from support.models import SupportTicket, TicketMessage

class Command(BaseCommand):
    help = 'Seeds database with realistic financial and user data for PortfolioPro'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting PortfolioPro database seeding...'))

        # 1. Create Demo Users
        users_config = [
            {
                'username': 'trader_demo',
                'email': 'trader@portfoliopro.com',
                'password': 'Trader@2026',
                'first_name': 'Alex',
                'last_name': 'Morgan',
                'role': 'CUSTOMER',
                'kyc': 'VERIFIED',
                'risk': 'MODERATE',
                'balance': Decimal('100000.00'),
                'account_number': 'PP-TRADER-001'
            },
            {
                'username': 'finance_officer',
                'email': 'officer@portfoliopro.com',
                'password': 'Officer@2026',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'role': 'FINANCE_OFFICER',
                'kyc': 'VERIFIED',
                'risk': 'CONSERVATIVE',
                'balance': Decimal('250000.00'),
                'account_number': 'PP-OFFICER-001'
            },
            {
                'username': 'admin',
                'email': 'admin@portfoliopro.com',
                'password': 'Admin@2026',
                'first_name': 'Platform',
                'last_name': 'Admin',
                'role': 'FINANCE_OFFICER',
                'kyc': 'VERIFIED',
                'risk': 'CONSERVATIVE',
                'balance': Decimal('500000.00'),
                'account_number': 'PP-ADMIN-001',
                'is_staff': True,
                'is_superuser': True
            }
        ]

        created_users = {}
        for u in users_config:
            user, created = User.objects.get_or_create(username=u['username'], defaults={'email': u['email'], 'first_name': u['first_name'], 'last_name': u['last_name']})
            user.set_password(u['password'])
            if u.get('is_staff'):
                user.is_staff = True
                user.is_superuser = True
            user.save()

            UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    'role': u['role'],
                    'kyc_status': u['kyc'],
                    'risk_tolerance': u['risk'],
                    'phone_number': '+1 (555) 234-5678',
                    'address': 'Wall Street Financial Plaza, New York, NY'
                }
            )

            account, _ = TradingAccount.objects.update_or_create(
                user=user,
                defaults={
                    'account_number': u['account_number'],
                    'balance': u['balance'],
                    'account_type': 'PAPER_TRADING',
                    'status': 'ACTIVE'
                }
            )
            created_users[u['username']] = (user, account)

        trader_user, trader_acc = created_users['trader_demo']
        officer_user, officer_acc = created_users['finance_officer']

        # 2. Populate 12 Stocks
        stocks_data = [
            {
                'symbol': 'AAPL', 'name': 'Apple Inc.', 'sector': 'Technology', 'industry': 'Consumer Electronics',
                'price': Decimal('228.50'), 'prev': Decimal('225.20'), 'high': Decimal('230.10'), 'low': Decimal('224.80'),
                'vol': 58240000, 'mcap': 3480000000000, 'pe': Decimal('34.2'), 'eps': Decimal('6.68'), 'div': Decimal('0.44'),
                'beta': Decimal('1.12'), 'w52h': Decimal('237.23'), 'w52l': Decimal('164.08')
            },
            {
                'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'sector': 'Technology', 'industry': 'Software - Infrastructure',
                'price': Decimal('428.15'), 'prev': Decimal('422.80'), 'high': Decimal('430.50'), 'low': Decimal('421.90'),
                'vol': 24150000, 'mcap': 3180000000000, 'pe': Decimal('36.8'), 'eps': Decimal('11.63'), 'div': Decimal('0.70'),
                'beta': Decimal('0.98'), 'w52h': Decimal('468.35'), 'w52l': Decimal('366.50')
            },
            {
                'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'sector': 'Technology', 'industry': 'Semiconductors',
                'price': Decimal('138.25'), 'prev': Decimal('135.40'), 'high': Decimal('140.20'), 'low': Decimal('134.80'),
                'vol': 82340000, 'mcap': 3390000000000, 'pe': Decimal('52.4'), 'eps': Decimal('2.64'), 'div': Decimal('0.03'),
                'beta': Decimal('1.68'), 'w52h': Decimal('144.42'), 'w52l': Decimal('45.11')
            },
            {
                'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'sector': 'Communication Services', 'industry': 'Internet Content & Information',
                'price': Decimal('178.60'), 'prev': Decimal('176.90'), 'high': Decimal('180.10'), 'low': Decimal('176.20'),
                'vol': 28940000, 'mcap': 2210000000000, 'pe': Decimal('24.8'), 'eps': Decimal('7.20'), 'div': Decimal('0.45'),
                'beta': Decimal('1.05'), 'w52h': Decimal('191.75'), 'w52l': Decimal('129.40')
            },
            {
                'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'sector': 'Consumer Cyclical', 'industry': 'Internet Retail',
                'price': Decimal('198.40'), 'prev': Decimal('195.10'), 'high': Decimal('200.25'), 'low': Decimal('194.80'),
                'vol': 41200000, 'mcap': 2070000000000, 'pe': Decimal('44.1'), 'eps': Decimal('4.50'), 'div': Decimal('0.00'),
                'beta': Decimal('1.18'), 'w52h': Decimal('201.20'), 'w52l': Decimal('118.35')
            },
            {
                'symbol': 'TSLA', 'name': 'Tesla Inc.', 'sector': 'Consumer Cyclical', 'industry': 'Auto Manufacturers',
                'price': Decimal('325.80'), 'prev': Decimal('318.50'), 'high': Decimal('332.00'), 'low': Decimal('315.20'),
                'vol': 76400000, 'mcap': 1040000000000, 'pe': Decimal('88.5'), 'eps': Decimal('3.68'), 'div': Decimal('0.00'),
                'beta': Decimal('2.24'), 'w52h': Decimal('358.64'), 'w52l': Decimal('138.80')
            },
            {
                'symbol': 'META', 'name': 'Meta Platforms Inc.', 'sector': 'Communication Services', 'industry': 'Internet Content & Information',
                'price': Decimal('568.20'), 'prev': Decimal('562.40'), 'high': Decimal('572.50'), 'low': Decimal('559.10'),
                'vol': 17800000, 'mcap': 1440000000000, 'pe': Decimal('27.3'), 'eps': Decimal('20.81'), 'div': Decimal('0.35'),
                'beta': Decimal('1.21'), 'w52h': Decimal('602.95'), 'w52l': Decimal('279.40')
            },
            {
                'symbol': 'JPM', 'name': 'JPMorgan Chase & Co.', 'sector': 'Financial Services', 'industry': 'Banks - Diversified',
                'price': Decimal('242.30'), 'prev': Decimal('240.10'), 'high': Decimal('244.10'), 'low': Decimal('239.50'),
                'vol': 11450000, 'mcap': 692000000000, 'pe': Decimal('13.1'), 'eps': Decimal('18.50'), 'div': Decimal('2.05'),
                'beta': Decimal('0.85'), 'w52h': Decimal('248.88'), 'w52l': Decimal('147.20')
            },
            {
                'symbol': 'JNJ', 'name': 'Johnson & Johnson', 'sector': 'Healthcare', 'industry': 'Drug Manufacturers',
                'price': Decimal('154.20'), 'prev': Decimal('155.10'), 'high': Decimal('156.00'), 'low': Decimal('153.80'),
                'vol': 8920000, 'mcap': 371000000000, 'pe': Decimal('17.2'), 'eps': Decimal('8.96'), 'div': Decimal('3.20'),
                'beta': Decimal('0.54'), 'w52h': Decimal('168.96'), 'w52l': Decimal('143.16')
            },
            {
                'symbol': 'V', 'name': 'Visa Inc.', 'sector': 'Financial Services', 'industry': 'Credit Services',
                'price': Decimal('310.50'), 'prev': Decimal('308.20'), 'high': Decimal('312.40'), 'low': Decimal('307.80'),
                'vol': 6850000, 'mcap': 635000000000, 'pe': Decimal('31.4'), 'eps': Decimal('9.89'), 'div': Decimal('0.72'),
                'beta': Decimal('0.92'), 'w52h': Decimal('315.60'), 'w52l': Decimal('242.10')
            },
            {
                'symbol': 'XOM', 'name': 'Exxon Mobil Corporation', 'sector': 'Energy', 'industry': 'Oil & Gas Integrated',
                'price': Decimal('118.90'), 'prev': Decimal('120.40'), 'high': Decimal('121.20'), 'low': Decimal('118.10'),
                'vol': 15600000, 'mcap': 468000000000, 'pe': Decimal('14.2'), 'eps': Decimal('8.37'), 'div': Decimal('3.25'),
                'beta': Decimal('0.78'), 'w52h': Decimal('126.34'), 'w52l': Decimal('97.48')
            },
            {
                'symbol': 'DIS', 'name': 'The Walt Disney Company', 'sector': 'Communication Services', 'industry': 'Entertainment',
                'price': Decimal('112.40'), 'prev': Decimal('110.80'), 'high': Decimal('113.50'), 'low': Decimal('110.20'),
                'vol': 13200000, 'mcap': 204000000000, 'pe': Decimal('22.8'), 'eps': Decimal('4.93'), 'div': Decimal('0.80'),
                'beta': Decimal('1.35'), 'w52h': Decimal('123.74'), 'w52l': Decimal('83.91')
            }
        ]

        stock_objects = {}
        for s in stocks_data:
            stock, _ = Stock.objects.update_or_create(
                symbol=s['symbol'],
                defaults={
                    'company_name': s['name'],
                    'sector': s['sector'],
                    'industry': s['industry'],
                    'exchange': 'NASDAQ' if s['symbol'] in ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'META'] else 'NYSE',
                    'current_price': s['price'],
                    'previous_close': s['prev'],
                    'day_high': s['high'],
                    'day_low': s['low'],
                    'volume': s['vol'],
                    'market_cap': s['mcap'],
                    'pe_ratio': s['pe'],
                    'eps': s['eps'],
                    'dividend_yield': s['div'],
                    'beta': s['beta'],
                    'fifty_two_week_high': s['w52h'],
                    'fifty_two_week_low': s['w52l'],
                    'is_active': True
                }
            )
            stock_objects[s['symbol']] = stock

            # Generate 30 days of historical price bars
            today = date.today()
            base_p = float(s['price'])
            for i in range(30, 0, -1):
                day_date = today - timedelta(days=i)
                factor = 1.0 + (random.uniform(-0.02, 0.025))
                day_close = round(base_p * (1.0 - (i * 0.003)) * factor, 2)
                day_open = round(day_close * (1.0 + random.uniform(-0.01, 0.01)), 2)
                day_high = round(max(day_open, day_close) * (1.0 + random.uniform(0.002, 0.015)), 2)
                day_low = round(min(day_open, day_close) * (1.0 - random.uniform(0.002, 0.015)), 2)
                day_vol = int(s['vol'] * random.uniform(0.8, 1.25))

                StockPriceHistory.objects.update_or_create(
                    stock=stock,
                    date=day_date,
                    defaults={
                        'open_price': Decimal(str(day_open)),
                        'high_price': Decimal(str(day_high)),
                        'low_price': Decimal(str(day_low)),
                        'close_price': Decimal(str(day_close)),
                        'volume': day_vol
                    }
                )

            # Generate Fundamental Report
            rev = int(s['mcap'] * 0.22)
            net_inc = int(rev * (float(s['pe']) / 100.0) if s['pe'] else rev * 0.15)
            FundamentalReport.objects.update_or_create(
                stock=stock,
                defaults={
                    'fiscal_year': 2025,
                    'revenue': rev,
                    'net_income': net_inc,
                    'total_assets': int(rev * 1.8),
                    'total_debt': int(rev * 0.45),
                    'operating_cash_flow': int(net_inc * 1.25),
                    'roe': Decimal('28.50'),
                    'debt_to_equity': Decimal('0.65'),
                    'profit_margin': Decimal('21.40'),
                    'quick_ratio': Decimal('1.35'),
                    'summary': f"{s['name']} is a global leader in {s['industry']}, exhibiting resilient free cash flow, durable competitive advantages, and strong return on invested capital."
                }
            )

        # 3. Create Sample Watchlist
        watchlist, _ = Watchlist.objects.get_or_create(user=trader_user, name='Tech Giants & Bluechips')
        watchlist.stocks.set([stock_objects['AAPL'], stock_objects['NVDA'], stock_objects['MSFT'], stock_objects['AMZN']])

        # 4. Create Initial Holdings for Alex (trader_demo)
        holdings_to_create = [
            ('AAPL', 60, Decimal('210.00')),
            ('MSFT', 35, Decimal('410.50')),
            ('NVDA', 100, Decimal('120.00')),
            ('JPM', 45, Decimal('230.00')),
        ]

        invested_total = Decimal('0.00')
        for sym, shares, avg_p in holdings_to_create:
            stk = stock_objects[sym]
            cost = Decimal(str(shares)) * avg_p
            invested_total += cost
            PortfolioHolding.objects.update_or_create(
                user=trader_user,
                account=trader_acc,
                stock=stk,
                defaults={
                    'shares': shares,
                    'average_buy_price': avg_p,
                    'total_cost': cost
                }
            )

            # Create matched executed order and execution
            order, _ = Order.objects.get_or_create(
                user=trader_user,
                account=trader_acc,
                stock=stk,
                side='BUY',
                quantity=shares,
                defaults={
                    'order_type': 'MARKET',
                    'price': avg_p,
                    'status': 'EXECUTED',
                    'executed_price': avg_p,
                    'executed_at': timezone.now() - timedelta(days=15)
                }
            )

            TradeExecution.objects.update_or_create(
                order=order,
                defaults={
                    'execution_id': f"EX-{uuid.uuid4().hex[:12].upper()}",
                    'user': trader_user,
                    'stock': stk,
                    'side': 'BUY',
                    'shares': shares,
                    'price': avg_p,
                    'total_value': cost,
                    'commission': Decimal('0.00'),
                    'executed_at': timezone.now() - timedelta(days=15)
                }
            )

        # Update remaining cash balance
        trader_acc.balance = Decimal('100000.00') - invested_total
        trader_acc.save()

        # 5. Create Portfolio Snapshot history
        today = date.today()
        base_eq = 95000.00
        for i in range(14, 0, -1):
            snap_date = timezone.now() - timedelta(days=i)
            cur_eq = Decimal(str(round(base_eq + (14 - i) * 620.0 + random.uniform(-400, 700), 2)))
            PortfolioSnapshot.objects.create(
                user=trader_user,
                total_equity=cur_eq,
                cash_balance=trader_acc.balance,
                invested_value=cur_eq - trader_acc.balance,
                unrealized_pnl=cur_eq - Decimal('100000.00'),
                realized_pnl=Decimal('1250.00'),
                recorded_at=snap_date
            )

        # 6. Risk Metrics and Limits
        RiskMetric.objects.update_or_create(
            user=trader_user,
            defaults={
                'portfolio_beta': Decimal('1.18'),
                'value_at_risk_95': Decimal('2840.50'),
                'sharpe_ratio': Decimal('1.94'),
                'volatility': Decimal('15.20'),
                'max_drawdown': Decimal('7.40'),
                'risk_score': 48,
            }
        )

        RiskLimit.objects.update_or_create(
            user=trader_user,
            defaults={
                'max_position_size_pct': Decimal('30.00'),
                'stop_loss_alert_pct': Decimal('10.00'),
                'daily_loss_limit': Decimal('5000.00'),
                'is_active': True
            }
        )

        # 7. Notifications and Alerts
        Notification.objects.create(
            user=trader_user,
            title="Welcome to PortfolioPro",
            message="Your paper trading account has been credited with $100,000 USD virtual capital. Start trading real market assets in simulated mode.",
            notification_type='SYSTEM_NOTICE',
            is_read=True
        )
        Notification.objects.create(
            user=trader_user,
            title="Dividend Announcement: AAPL",
            message="Apple Inc. announced a quarterly dividend of $0.25 per share payable on next month's settlement date.",
            notification_type='ACCOUNT_UPDATE',
            is_read=False
        )
        Notification.objects.create(
            user=trader_user,
            title="Price Alert Triggered: NVDA",
            message="NVIDIA Corporation (NVDA) crossed above your target price of $135.00.",
            notification_type='PRICE_ALERT',
            is_read=False
        )

        PriceAlert.objects.update_or_create(
            user=trader_user,
            stock=stock_objects['NVDA'],
            target_price=Decimal('145.00'),
            defaults={'condition': 'ABOVE', 'is_triggered': False}
        )
        PriceAlert.objects.update_or_create(
            user=trader_user,
            stock=stock_objects['TSLA'],
            target_price=Decimal('300.00'),
            defaults={'condition': 'BELOW', 'is_triggered': False}
        )

        # 8. Support Tickets
        tkt, _ = SupportTicket.objects.update_or_create(
            ticket_number='TKT-100234',
            defaults={
                'user': trader_user,
                'subject': 'Inquiry about Extended Hours Market Orders',
                'category': 'TRADING',
                'priority': 'MEDIUM',
                'status': 'IN_PROGRESS'
            }
        )
        TicketMessage.objects.get_or_create(
            ticket=tkt,
            sender=trader_user,
            message="Hello, do paper trading limit orders execute during pre-market and after-hours sessions?",
            defaults={'is_staff_reply': False}
        )
        TicketMessage.objects.get_or_create(
            ticket=tkt,
            sender=officer_user,
            message="Hi Alex, currently paper trading executions simulate regular market hours (9:30 AM to 4:00 PM EST). We will support extended hours in our upcoming v1.1 release.",
            defaults={'is_staff_reply': True}
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded PortfolioPro database!'))
