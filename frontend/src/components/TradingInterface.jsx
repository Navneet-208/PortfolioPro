import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

export default function TradingInterface({ 
  initialSymbol, 
  stocks, 
  account, 
  onTradeCompleted 
}) {
  const [symbol, setSymbol] = useState(initialSymbol || 'AAPL');
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState(10);
  const [customPrice, setCustomPrice] = useState('');
  const [notes, setNotes] = useState('');
  
  const [orders, setOrders] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const selectedStock = stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase()) || stocks[0] || {};
  const currentPrice = parseFloat(selectedStock.current_price || 0);
  const effectivePrice = orderType === 'MARKET' ? currentPrice : (parseFloat(customPrice) || currentPrice);
  const totalValue = quantity * effectivePrice;
  const cashBalance = account ? parseFloat(account.balance || 0) : 100000;
  const postBalance = side === 'BUY' ? cashBalance - totalValue : cashBalance + totalValue;
  const hasSufficientCash = side === 'SELL' || cashBalance >= totalValue;

  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  useEffect(() => {
    fetchOrdersAndExecutions();
  }, []);

  const fetchOrdersAndExecutions = async () => {
    try {
      const [ordRes, execRes] = await Promise.all([
        api.getOrders(),
        api.getExecutions(),
      ]);
      setOrders(ordRes.data?.results || ordRes.data || []);
      setExecutions(execRes.data?.results || execRes.data || []);
    } catch (err) {
      console.error('Error fetching trade history:', err);
    }
  };

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    setActionMessage(null);
    if (!hasSufficientCash && side === 'BUY') {
      setActionMessage({ type: 'error', text: 'Insufficient cash balance for this order.' });
      return;
    }
    if (quantity <= 0) {
      setActionMessage({ type: 'error', text: 'Quantity must be at least 1 share.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        symbol: selectedStock.symbol,
        order_type: orderType,
        side,
        quantity: parseInt(quantity),
        price: effectivePrice,
        notes: notes || `Paper trade ${side} ${quantity} ${selectedStock.symbol}`,
      };

      const res = await api.placeOrder(payload);
      setActionMessage({ 
        type: 'success', 
        text: `Order ${res.data.status}! ${side} ${quantity} shares of ${selectedStock.symbol} at $${effectivePrice.toFixed(2)}.`
      });
      fetchOrdersAndExecutions();
      if (onTradeCompleted) {
        onTradeCompleted();
      }
    } catch (err) {
      const errText = err.response?.data?.error || 'Order execution rejected. Check available holdings or balance.';
      setActionMessage({ type: 'error', text: errText });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.cancelOrder(orderId);
      setActionMessage({ type: 'success', text: 'Pending order successfully cancelled.' });
      fetchOrdersAndExecutions();
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Unable to cancel order.' });
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Trading Engine Terminal</span>
            <span className="badge-bull text-[11px]">Paper Execution Active</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Instant simulated market fills with automated account ledger updating</p>
        </div>

        <button 
          onClick={fetchOrdersAndExecutions}
          className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>Refresh Fills</span>
        </button>
      </div>

      {/* Alert / Feedback message */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' 
            : 'bg-red-950/60 border-red-700 text-red-300'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Order Entry Form & Preview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Order Form (7 Cols) */}
        <div className="lg:col-span-7 card-base p-6">
          <form onSubmit={handleExecuteTrade} className="space-y-5">
            
            {/* Buy / Sell Toggle Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                  side === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Buy (Long)
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                  side === 'SELL'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sell (Short / Close)
              </button>
            </div>

            {/* Stock Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Select Asset Ticker
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="form-input text-sm font-semibold mono"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.company_name} (${parseFloat(s.current_price).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Order Type Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Execution Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['MARKET', 'LIMIT', 'STOP_LOSS'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                      orderType === t
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Price Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Shares Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="form-input mono font-bold"
                />
                <div className="flex gap-1.5 mt-2">
                  {[10, 25, 50, 100].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantity(qty)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 mono"
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  {orderType === 'MARKET' ? 'Market Price ($)' : 'Limit Price ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={orderType === 'MARKET'}
                  value={orderType === 'MARKET' ? currentPrice.toFixed(2) : customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder={currentPrice.toFixed(2)}
                  className={`form-input mono font-bold ${orderType === 'MARKET' ? 'bg-slate-900/50 text-slate-400 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            {/* Submit Trade Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 ${
                side === 'BUY' 
                  ? 'btn-buy' 
                  : 'btn-sell'
              }`}
            >
              {loading ? 'Processing Fill...' : (
                <>
                  <span>Submit {side} Order for {quantity} {selectedStock.symbol}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right: Live Quote & Estimated Impact (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Stock Quote Card */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <span className="font-extrabold text-xl text-white mono">{selectedStock.symbol}</span>
                <p className="text-xs text-slate-400">{selectedStock.company_name}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-white mono block">${currentPrice.toFixed(2)}</span>
                <span className={`text-xs font-semibold inline-flex items-center gap-0.5 ${
                  parseFloat(selectedStock.change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {parseFloat(selectedStock.change || 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {parseFloat(selectedStock.change_percent || 0).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Day Range</span>
                <span className="font-semibold text-slate-200 mono">${parseFloat(selectedStock.day_low || 0).toFixed(2)} - ${parseFloat(selectedStock.day_high || 0).toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Sector</span>
                <span className="font-semibold text-slate-200">{selectedStock.sector || 'N/A'}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Beta</span>
                <span className="font-semibold text-slate-200 mono">{selectedStock.beta || '1.0'}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">P/E Ratio</span>
                <span className="font-semibold text-slate-200 mono">{selectedStock.pe_ratio || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Trade Consideration & Account Impact */}
          <div className="card-base p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Wallet size={15} className="text-blue-400" />
              <span>Trade Consideration Estimate</span>
            </h3>

            <div className="space-y-2 text-xs border-y border-slate-800 py-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Consideration:</span>
                <span className="font-bold text-white mono">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trading Commission:</span>
                <span className="text-emerald-400 font-semibold mono">$0.00 (Zero Fee)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Paper Cash:</span>
                <span className="font-semibold text-slate-300 mono">${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-800/60">
                <span className="text-slate-300">Est. Cash Post-Trade:</span>
                <span className={`mono ${postBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${postBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {!hasSufficientCash && side === 'BUY' && (
              <p className="text-[11px] text-red-400">
                * Warning: Insufficient cash balance to execute this trade. Reduce share quantity or deposit funds.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Orders and Executions Tabs */}
      <div className="card-base overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Trade Fills & Execution Audit Trail</h3>
            <p className="text-xs text-slate-400">Immutable ledger of executed and pending simulated orders</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Execution ID</th>
                <th>Side</th>
                <th>Symbol</th>
                <th className="text-right">Shares</th>
                <th className="text-right">Execution Price</th>
                <th className="text-right">Total Consideration</th>
                <th>Executed At</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {executions.length > 0 ? (
                executions.map((ex) => (
                  <tr key={ex.id}>
                    <td className="font-mono text-xs text-blue-400 font-semibold">{ex.execution_id}</td>
                    <td>
                      <span className={ex.side === 'BUY' ? 'badge-bull' : 'badge-bear'}>
                        {ex.side}
                      </span>
                    </td>
                    <td className="font-bold text-white mono">{ex.stock_symbol}</td>
                    <td className="text-right mono text-white">{ex.shares}</td>
                    <td className="text-right mono text-slate-300">${parseFloat(ex.price).toFixed(2)}</td>
                    <td className="text-right mono font-semibold text-white">
                      ${parseFloat(ex.total_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-xs text-slate-400">
                      {new Date(ex.executed_at).toLocaleString()}
                    </td>
                    <td className="text-center">
                      <span className="badge-bull text-[10px]">EXECUTED</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-slate-400 text-xs">
                    No trade executions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
