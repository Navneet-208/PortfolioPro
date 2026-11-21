import React, { useState } from 'react';
import { TrendingUp, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('trader_demo');
  const [password, setPassword] = useState('Trader@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLoginSuccess({ username, password });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/25">
            <TrendingUp size={26} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome to PortfolioPro</h2>
          <p className="text-xs text-slate-400 mt-1">Institutional-grade stock trading & portfolio analytics suite</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User size={16} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input pl-9"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input pl-9"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-2.5 text-sm mt-2 font-semibold"
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to Terminal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick-Fill Demo Credentials */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            1-Click Demo Accounts (Pre-configured)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('trader_demo', 'Trader@2026')}
              className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 text-left transition group"
            >
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                <CheckCircle2 size={13} />
                <span>Alex Trader</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Customer Role ($100k)</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('finance_officer', 'Officer@2026')}
              className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500 text-left transition group"
            >
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <ShieldCheck size={13} />
                <span>Sarah Officer</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Finance Auditor Role</p>
            </button>
          </div>
        </div>

        {/* Switch to Registration */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-xs text-slate-400 hover:text-blue-400 transition"
          >
            Don't have an account? <span className="text-blue-500 font-semibold underline">Register Now</span>
          </button>
        </div>

      </div>
    </div>
  );
}
