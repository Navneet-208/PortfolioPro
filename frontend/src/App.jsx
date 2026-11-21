import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MarketData from './components/MarketData';
import TradingInterface from './components/TradingInterface';
import PortfolioManager from './components/PortfolioManager';
import RiskDashboard from './components/RiskDashboard';
import TechnicalAnalysis from './components/TechnicalAnalysis';
import FundamentalAnalysis from './components/FundamentalAnalysis';
import NotificationsPanel from './components/NotificationsPanel';
import CustomerSupport from './components/CustomerSupport';
import FinanceOfficerAuditor from './components/FinanceOfficerAuditor';
import api from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [prefilledSymbol, setPrefilledSymbol] = useState('AAPL');

  // Core Data
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check initial session
  useEffect(() => {
    checkInitialSession();
  }, []);

  const checkInitialSession = async () => {
    try {
      const res = await api.getProfile();
      if (res.data) {
        setUser({
          ...res.data.user,
          role: res.data.role,
          kyc_status: res.data.kyc_status,
          risk_tolerance: res.data.risk_tolerance,
        });
        await refreshUserData();
      }
    } catch (err) {
      // User is not authenticated yet
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const [stocksRes, summaryRes, riskRes, notifRes, accRes] = await Promise.all([
        api.getStocks(),
        api.getPortfolioSummary(),
        api.getRiskMetrics(),
        api.getNotifications(),
        api.getAccounts(),
      ]);

      setStocks(stocksRes.data?.results || stocksRes.data || []);
      setSummary(summaryRes.data || null);
      setRiskData(riskRes.data || null);
      setNotifications(notifRes.data?.results || notifRes.data || []);
      
      const accList = accRes.data?.results || accRes.data || [];
      if (accList.length > 0) {
        setAccount(accList[0]);
      }
    } catch (err) {
      console.error('Error refreshing platform data:', err);
    }
  };

  const handleLoginSuccess = async (credentials) => {
    const res = await api.login(credentials);
    setUser({
      ...res.data.user,
      role: res.data.role,
      account_number: res.data.account_number,
    });
    await refreshUserData();
    setCurrentTab('dashboard');
  };

  const handleRegisterSuccess = async (userData) => {
    const res = await api.register(userData);
    setUser({
      ...res.data.user,
      role: res.data.role,
    });
    await refreshUserData();
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      setAccount(null);
      setSummary(null);
      setAuthView('login');
      setCurrentTab('dashboard');
    }
  };

  const navigateToTrade = (symbol = 'AAPL') => {
    setPrefilledSymbol(symbol);
    setCurrentTab('trade');
  };

  const navigateToTechnical = (symbol = 'AAPL') => {
    setPrefilledSymbol(symbol);
    setCurrentTab('technical');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-slate-300">Initializing PortfolioPro Financial Engine...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show Login or Register view
  if (!user) {
    return authView === 'login' ? (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthView('register')}
      />
    ) : (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        account={account}
        notifications={notifications}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            summary={summary}
            stocks={stocks}
            riskData={riskData}
            onNavigateToTrade={navigateToTrade}
            onNavigateToTechnical={navigateToTechnical}
          />
        )}

        {currentTab === 'market' && (
          <MarketData
            stocks={stocks}
            onNavigateToTrade={navigateToTrade}
            onNavigateToTechnical={navigateToTechnical}
          />
        )}

        {currentTab === 'trade' && (
          <TradingInterface
            initialSymbol={prefilledSymbol}
            stocks={stocks}
            account={account}
            onTradeCompleted={refreshUserData}
          />
        )}

        {currentTab === 'portfolio' && (
          <PortfolioManager
            summary={summary}
            account={account}
            onRefresh={refreshUserData}
            onNavigateToTrade={navigateToTrade}
          />
        )}

        {currentTab === 'risk' && (
          <RiskDashboard
            riskData={riskData}
            onRefresh={refreshUserData}
          />
        )}

        {currentTab === 'technical' && (
          <TechnicalAnalysis
            stocks={stocks}
            initialSymbol={prefilledSymbol}
            onNavigateToTrade={navigateToTrade}
          />
        )}

        {currentTab === 'fundamental' && (
          <FundamentalAnalysis
            stocks={stocks}
            initialSymbol={prefilledSymbol}
            onNavigateToTrade={navigateToTrade}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationsPanel
            stocks={stocks}
            notifications={notifications}
            onRefreshNotifications={refreshUserData}
          />
        )}

        {currentTab === 'support' && (
          <CustomerSupport
            user={user}
          />
        )}

        {currentTab === 'auditor' && user.role === 'FINANCE_OFFICER' && (
          <FinanceOfficerAuditor />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070a12] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 PortfolioPro Financial Technologies Inc. All rights reserved.</span>
          <span className="mono text-[11px] text-slate-600">Simulated Paper Trading Mode &bull; MySQL 8.0 &bull; Django REST &bull; React.js</span>
        </div>
      </footer>
    </div>
  );
}
