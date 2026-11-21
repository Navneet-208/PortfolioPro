from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, TradingAccount, AccountTransaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'username', 'email', 'role', 'phone_number', 'address', 'kyc_status', 'risk_tolerance', 'created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default='CUSTOMER', write_only=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, write_only=True)
    address = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone_number', 'address']

    def create(self, validated_data):
        role = validated_data.pop('role', 'CUSTOMER')
        phone_number = validated_data.pop('phone_number', '')
        address = validated_data.pop('address', '')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=password
        )

        UserProfile.objects.create(
            user=user,
            role=role,
            phone_number=phone_number,
            address=address,
            kyc_status='VERIFIED'
        )

        # Automatically create default Paper Trading account with $100,000 demo balance
        account_number = f"PP-{user.id:04d}{hash(user.username) % 10000:04d}"
        account = TradingAccount.objects.create(
            user=user,
            account_number=account_number,
            account_type='PAPER_TRADING',
            balance=100000.00,
            status='ACTIVE'
        )

        AccountTransaction.objects.create(
            account=account,
            transaction_type='DEPOSIT',
            amount=100000.00,
            description='Initial paper trading capital allocation',
            status='COMPLETED'
        )

        return user


class AccountTransactionSerializer(serializers.ModelSerializer):
    account_number = serializers.CharField(source='account.account_number', read_only=True)
    username = serializers.CharField(source='account.user.username', read_only=True)

    class Meta:
        model = AccountTransaction
        fields = ['id', 'account', 'account_number', 'username', 'transaction_type', 'amount', 'description', 'status', 'created_at']
        read_only_fields = ['created_at']


class TradingAccountSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    transactions = AccountTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = TradingAccount
        fields = ['id', 'user', 'username', 'account_number', 'account_type', 'balance', 'currency', 'status', 'created_at', 'updated_at', 'transactions']
        read_only_fields = ['account_number', 'created_at', 'updated_at']
