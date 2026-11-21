import React, { useState } from 'react';
import { 
  PieChart, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import api from '../services/api';

export default function PortfolioManager({ 
  summary, 
  account, 
  onRefresh, 
  onNavigateToTrade 
}) {
  const [modalType, setModalType] = useState(null); // 'deposit' or 'withdraw'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleCashAction = async (e) => {
    e.preventDefault();
    if (!account?.id || !amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      if (modalType === 'deposit') {
        await api.depositFunds(account.id, { amount: parseFloat(amount), description });
        setStatusMsg({ type: 'success', text: `Successfully deposited $${parseFloat(amount).toLocaleString()} into trading account.` });
      } else {
        await api.withdrawFunds(account.id, { amount: parseFloat(amount), description });
        setStatusMsg({ type: 'success', text: `Successfully withdrew $${parseFloat(amount).toLocaleString()} from trading account.` });
      }
      setAmount('');
      setDescription('');
      setModalType(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Cash transaction failed.' });
    } finally {
      setLoading(false);
    }
  };

  const holdings = summary?.holdings || [];
  const totalEquity = summary ? parseFloat(summary.total_equity || 0) : 100000;
  const cashBalance = summary ? parseFloat(summary.cash_balance || 0) : 100000;
  const investedValue = summary ? parseFloat(summary.invested_value || 0) : 0;
  const totalCost = summary ? parseFloat(summary.total_cost || 0) : 0;
  const unrealizedPnl = summary ? parseFloat(summary.unrealized_pnl || 0) : 0;
  const returnPct = summary ? parseFloat(summary.return_percentage || 0) : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Portfolio Asset Management</span>
            <span className="badge-bull text-[11px]">Real-Time Accounting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Asset weights, cost basis, unrealized P&L, and liquidity management</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalType('deposit')}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            <span>Deposit Capital</span>
          </button>
          <button
            onClick={() => setModalType('withdraw')}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <MinusCircle size={14} />
            <span>Withdraw Cash</span>
          </button>
        </div>
      </div>

      {/* Status Feedback */}
      {statusMsg && (
        <div className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' 
            : 'bg-red-950/60 border-red-700 text-red-300'
        }`}>
          <CheckCircle2 size={16} />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 3 Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="card-base p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Account Equity
          </span>
          <div className="text-2xl font-bold text-white mono">
            ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Account #{account?.account_number || 'PP-100234'} ({account?.account_type || 'PAPER_TRADING'})
          </div>
        </div>

        <div className="card-base p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Invested Market Value
          </span>
          <div className="text-2xl font-bold text-blue-400 mono">
            ${investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Cost Basis: ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card-base p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Unrealized Return
          </span>
          <div className={`text-2xl font-bold mono ${unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {unrealizedPnl >= 0 ? `+$${unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-$${Math.abs(unrealizedPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Cumulative Return: <span className={unrealizedPnl >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{returnPct}%</span>
          </div>
        </div>

      </div>

      {/* Holdings Detailed Table */}
      <div className="card-base overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Position Inventory & Cost Accounting</h3>
            <p className="text-xs text-slate-400">Weighted individual equities and return metrics</p>
          </div>
          <span className="badge-neutral text-xs">{holdings.length} Positions Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Sector</th>
                <th className="text-right">Shares Held</th>
                <th className="text-right">Avg Entry Price</th>
                <th className="text-right">Current Price</th>
                <th className="text-right">Total Cost Basis</th>
                <th className="text-right">Current Value</th>
                <th className="text-right">Unrealized P&L</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length > 0 ? (
                holdings.map((h) => {
                  const pnl = parseFloat(h.unrealized_pnl);
                  const isGain = pnl >= 0;
                  return (
                    <tr key={h.id}>
                      <td>
                        <span className="font-bold text-white mono block">{h.symbol}</span>
                        <span className="text-xs text-slate-400">{h.company_name}</span>
                      </td>
                      <td><span className="badge-neutral text-[10px]">{h.sector}</span></td>
                      <td className="text-right mono text-white font-semibold">{h.shares}</td>
                      <td className="text-right mono text-slate-300">${parseFloat(h.average_buy_price).toFixed(2)}</td>
                      <td className="text-right mono font-semibold text-white">${parseFloat(h.current_price).toFixed(2)}</td>
                      <td className="text-right mono text-slate-300">${parseFloat(h.total_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="text-right mono font-bold text-white">${parseFloat(h.current_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className={`text-right mono font-bold ${isGain ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isGain ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
                        <div className="text-[10px] font-normal">{isGain ? `+${h.return_percentage}%` : `${h.return_percentage}%`}</div>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onNavigateToTrade(h.symbol)}
                            className="btn-buy text-[11px] py-1 px-2.5"
                          >
                            Buy / Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400 text-xs">
                    No active positions held. Visit the Trading Engine to place orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Deposit / Withdrawal Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Wallet className="text-blue-500" size={20} />
              <span>{modalType === 'deposit' ? 'Deposit Paper Trading Funds' : 'Withdraw Paper Trading Cash'}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Simulate cash injection or liquidity adjustment in your sandbox balance.
            </p>

            <form onSubmit={handleCashAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($ USD) *</label>
                <input
                  type="number"
                  step="100"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  required
                  className="form-input mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Memo / Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={modalType === 'deposit' ? 'Capital allocation deposit' : 'Cash reserve withdrawal'}
                  className="form-input text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 btn-secondary justify-center py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-2 rounded-lg font-semibold text-xs text-white justify-center ${
                    modalType === 'deposit' ? 'btn-buy' : 'btn-sell'
                  }`}
                >
                  {loading ? 'Processing...' : (modalType === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
