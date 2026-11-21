import React, { useState } from 'react';
import { TrendingUp, Lock, User, Mail, Phone, ArrowRight, Shield } from 'lucide-react';

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'CUSTOMER',
    phone_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onRegisterSuccess(formData);
    } catch (err) {
      const errData = err.response?.data;
      if (typeof errData === 'object') {
        const firstKey = Object.keys(errData)[0];
        setError(`${firstKey}: ${errData[firstKey]}`);
      } else {
        setError('Registration failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500"></div>

        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-blue-600 items-center justify-center text-white mb-3 shadow-lg shadow-emerald-500/25">
            <TrendingUp size={26} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Open PortfolioPro Account</h2>
          <p className="text-xs text-slate-400 mt-1">Instant $100,000 paper trading balance upon registration</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-input"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-input"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User size={16} />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input pl-9"
                placeholder="e.g. jdoe_trader"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input pl-9"
                placeholder="name@domain.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input pl-9"
                  placeholder="Min 6 chars"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Phone size={16} />
                </div>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="form-input pl-9"
                  placeholder="+1 (555) 000"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Platform Role *</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${
                formData.role === 'CUSTOMER' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="CUSTOMER"
                  checked={formData.role === 'CUSTOMER'}
                  onChange={handleChange}
                  className="hidden"
                />
                <TrendingUp size={16} />
                <span className="text-xs font-medium">Customer / Trader</span>
              </label>

              <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${
                formData.role === 'FINANCE_OFFICER' ? 'bg-amber-600/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="FINANCE_OFFICER"
                  checked={formData.role === 'FINANCE_OFFICER'}
                  onChange={handleChange}
                  className="hidden"
                />
                <Shield size={16} />
                <span className="text-xs font-medium">Finance Officer</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-2.5 text-sm mt-2 font-semibold"
          >
            {loading ? 'Creating Account...' : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-xs text-slate-400 hover:text-blue-400 transition"
          >
            Already have an account? <span className="text-blue-500 font-semibold underline">Sign In</span>
          </button>
        </div>

      </div>
    </div>
  );
}
