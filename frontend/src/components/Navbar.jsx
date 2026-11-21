import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  ShieldAlert, 
  Activity, 
  BookOpen, 
  Bell, 
  LifeBuoy, 
  Users, 
  LogOut, 
  Wallet,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  account, 
  notifications, 
  onLogout 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications ? notifications.filter(n => !n.is_read).length : 0;
  const isFinanceOfficer = user && user.role === 'FINANCE_OFFICER';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'market', label: 'Market Data', icon: BarChart3 },
    { id: 'trade', label: 'Trading Engine', icon: Activity },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'risk', label: 'Risk Analytics', icon: ShieldAlert },
    { id: 'technical', label: 'Technical Analysis', icon: Activity },
    { id: 'fundamental', label: 'Fundamentals', icon: BookOpen },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  if (isFinanceOfficer) {
    navItems.push({ id: 'auditor', label: 'Officer Audit', icon: Users });
  }

  return (
    <nav className="bg-[#0b1329] border-b border-slate-800 sticky top-0 z-50 px-4 lg:px-8 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <TrendingUp size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Portfolio<span className="text-blue-500">Pro</span></span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">v1.0</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Advanced Trading & Asset Suite</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Status Strip & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Account Balance Widget */}
          {account && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <Wallet size={15} className="text-emerald-400" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block leading-none">Paper Cash</span>
                <span className="text-xs font-semibold text-emerald-400 mono leading-tight">
                  ${parseFloat(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border bg-slate-900 border-slate-800">
            <UserCheck size={14} className={isFinanceOfficer ? "text-amber-400" : "text-blue-400"} />
            <span className={isFinanceOfficer ? "text-amber-300" : "text-blue-300"}>
              {isFinanceOfficer ? "Finance Officer" : "Customer / Trader"}
            </span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => setCurrentTab('notifications')}
            className={`relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${
              currentTab === 'notifications' ? 'bg-slate-800 text-blue-400' : ''
            }`}
            title="Notifications & Price Alerts"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition"
            title="Sign Out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left transition ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
