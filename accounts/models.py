from django.db import models
from django.contrib.auth.models import User
import uuid

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('CUSTOMER', 'Customer / Trader'),
        ('FINANCE_OFFICER', 'Finance Officer / Auditor'),
    )
    KYC_CHOICES = (
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    )
    RISK_CHOICES = (
        ('CONSERVATIVE', 'Conservative'),
        ('MODERATE', 'Moderate'),
        ('AGGRESSIVE', 'Aggressive'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    phone_number = models.CharField(max_length=20, blank=True, default='')
    address = models.CharField(max_length=255, blank=True, default='')
    kyc_status = models.CharField(max_length=20, choices=KYC_CHOICES, default='VERIFIED')
    risk_tolerance = models.CharField(max_length=20, choices=RISK_CHOICES, default='MODERATE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"


class TradingAccount(models.Model):
    ACCOUNT_TYPE_CHOICES = (
        ('PAPER_TRADING', 'Paper Trading (Demo)'),
        ('MARGIN', 'Margin Account'),
        ('RETIREMENT', 'Retirement Account'),
    )
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('SUSPENDED', 'Suspended'),
        ('CLOSED', 'Closed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trading_accounts')
    account_number = models.CharField(max_length=30, unique=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='PAPER_TRADING')
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=100000.00)
    currency = models.CharField(max_length=10, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.account_number} - {self.user.username} (${self.balance:,.2f})"


class AccountTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ('DEPOSIT', 'Funds Deposit'),
        ('WITHDRAWAL', 'Funds Withdrawal'),
        ('TRADE_BUY', 'Trade Purchase'),
        ('TRADE_SELL', 'Trade Sale'),
        ('DIVIDEND', 'Dividend Payment'),
        ('FEE', 'Platform Fee'),
    )
    STATUS_CHOICES = (
        ('COMPLETED', 'Completed'),
        ('PENDING', 'Pending'),
        ('FAILED', 'Failed'),
    )

    account = models.ForeignKey(TradingAccount, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.account.account_number} - {self.transaction_type}: ${self.amount} ({self.status})"
