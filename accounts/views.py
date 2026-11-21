from rest_framework import status, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from decimal import Decimal

from .models import UserProfile, TradingAccount, AccountTransaction
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    RegisterSerializer,
    TradingAccountSerializer,
    AccountTransactionSerializer
)

class IsFinanceOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'profile') and request.user.profile.role == 'FINANCE_OFFICER'


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_api(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        profile = getattr(user, 'profile', None)
        return Response({
            'message': 'Registration successful. Paper trading account initialized with $100,000.',
            'user': UserSerializer(user).data,
            'role': profile.role if profile else 'CUSTOMER'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        # Ensure user has a trading account
        account = TradingAccount.objects.filter(user=user).first()
        if not account:
            account = TradingAccount.objects.create(
                user=user,
                account_number=f"PP-{user.id:04d}01",
                balance=100000.00
            )
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'role': profile.role,
            'account_number': account.account_number,
            'balance': str(account.balance)
        })
    return Response({'error': 'Invalid credentials. Please verify your username and password.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def logout_api(request):
    logout(request)
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET', 'PUT', 'PATCH'])
def current_user_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if request.method in ['PUT', 'PATCH']:
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(UserProfileSerializer(profile).data)


@api_view(['GET'])
@permission_classes([IsFinanceOfficer])
def all_users_list(request):
    """Finance Officer view to audit and monitor all system users."""
    profiles = UserProfile.objects.all().select_related('user')
    role_filter = request.query_params.get('role')
    search = request.query_params.get('search')
    if role_filter:
        profiles = profiles.filter(role=role_filter)
    if search:
        profiles = profiles.filter(user__username__icontains=search) | profiles.filter(user__email__icontains=search)
    return Response(UserProfileSerializer(profiles, many=True).data)


class TradingAccountViewSet(viewsets.ModelViewSet):
    serializer_class = TradingAccountSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return TradingAccount.objects.none()
        # Finance officers can view all accounts; customers only view their own
        if hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER':
            queryset = TradingAccount.objects.all().select_related('user')
        else:
            queryset = TradingAccount.objects.filter(user=user)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    @action(detail=True, methods=['post'])
    def deposit(self, request, pk=None):
        account = self.get_object()
        amount_raw = request.data.get('amount')
        try:
            amount = Decimal(str(amount_raw))
            if amount <= 0:
                return Response({'error': 'Deposit amount must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Invalid deposit amount.'}, status=status.HTTP_400_BAD_REQUEST)

        account.balance += amount
        account.save()

        AccountTransaction.objects.create(
            account=account,
            transaction_type='DEPOSIT',
            amount=amount,
            description=request.data.get('description', 'Funds deposit'),
            status='COMPLETED'
        )

        return Response({
            'message': f'Successfully deposited ${amount:,.2f}',
            'account': TradingAccountSerializer(account).data
        })

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        account = self.get_object()
        amount_raw = request.data.get('amount')
        try:
            amount = Decimal(str(amount_raw))
            if amount <= 0:
                return Response({'error': 'Withdrawal amount must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Invalid withdrawal amount.'}, status=status.HTTP_400_BAD_REQUEST)

        if account.balance < amount:
            return Response({'error': 'Insufficient funds for this withdrawal.'}, status=status.HTTP_400_BAD_REQUEST)

        account.balance -= amount
        account.save()

        AccountTransaction.objects.create(
            account=account,
            transaction_type='WITHDRAWAL',
            amount=amount,
            description=request.data.get('description', 'Funds withdrawal'),
            status='COMPLETED'
        )

        return Response({
            'message': f'Successfully withdrew ${amount:,.2f}',
            'account': TradingAccountSerializer(account).data
        })


class AccountTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AccountTransactionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AccountTransaction.objects.none()
        if hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER':
            qs = AccountTransaction.objects.all().select_related('account', 'account__user')
        else:
            qs = AccountTransaction.objects.filter(account__user=user)

        tx_type = self.request.query_params.get('type')
        if tx_type:
            qs = qs.filter(transaction_type=tx_type)
        return qs.order_by('-created_at')
