import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Activity, 
  DollarSign, 
  Clock 
} from 'lucide-react';
import api from '../services/api';

export default function NotificationsPanel({ 
  stocks, 
  notifications, 
  onRefreshNotifications 
}) {
  const [alerts, setAlerts] = useState([]);
  const [newSymbol, setNewSymbol] = useState(stocks[0]?.symbol || 'AAPL');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('ABOVE');
  const [savingAlert, setSavingAlert] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchPriceAlerts();
  }, []);

  const fetchPriceAlerts = async () => {
    try {
      const res = await api.getPriceAlerts();
      setAlerts(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      if (onRefreshNotifications) onRefreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      if (onRefreshNotifications) onRefreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!targetPrice || parseFloat(targetPrice) <= 0) return;

    setSavingAlert(true);
    setFeedback(null);
    try {
      await api.createPriceAlert({
        symbol: newSymbol,
        target_price: parseFloat(targetPrice),
        condition
      });
      setFeedback({ type: 'success', text: `Alert set for ${newSymbol} when price crosses ${condition} $${targetPrice}.` });
      setTargetPrice('');
      fetchPriceAlerts();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to create price alert.' });
    } finally {
      setSavingAlert(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await api.deletePriceAlert(id);
      fetchPriceAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Alerts & Notifications Center</span>
            <span className="badge-neutral text-[11px]">Real-Time Webhooks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Execution fills, price boundary triggers, and risk surveillance events</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto"
        >
          <CheckCircle2 size={14} />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Notifications Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
            Activity & Event Stream
          </h2>

          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-3 ${
                  n.is_read ? 'bg-[#0f172a] border-slate-800/80 opacity-75' : 'bg-[#131c31] border-blue-500/30 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    n.notification_type === 'ORDER_FILLED' ? 'bg-emerald-500/10 text-emerald-400' : (
                      n.notification_type === 'PRICE_ALERT' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                    )
                  }`}>
                    <Bell size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{n.title}</span>
                      <span className="badge-neutral text-[9px]">{n.notification_type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 mt-2 block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="card-base p-8 text-center text-xs text-slate-400">
              No recent notifications in your feed.
            </div>
          )}
        </div>

        {/* Right: Price Alert Creator & Active Triggers (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* New Price Alert Form */}
          <div className="card-base p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Plus size={15} className="text-blue-400" />
              <span>Set Automated Price Alert</span>
            </h3>

            {feedback && (
              <div className={`p-3 rounded-lg mb-3 text-xs flex items-center gap-2 ${
                feedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-red-950/60 border border-red-800 text-red-300'
              }`}>
                <CheckCircle2 size={14} />
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Asset</label>
                <select
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="form-input text-xs font-bold mono"
                >
                  {stocks.map(s => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} (${parseFloat(s.current_price).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Trigger Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="form-input text-xs font-semibold"
                  >
                    <option value="ABOVE">Crosses Above (&gt;=)</option>
                    <option value="BELOW">Falls Below (&lt;=)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g. 235.00"
                    required
                    className="form-input text-xs mono font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingAlert}
                className="w-full btn-primary justify-center text-xs py-2 mt-1"
              >
                {savingAlert ? 'Arming Alert...' : 'Arm Price Trigger'}
              </button>
            </form>
          </div>

          {/* Active Price Triggers List */}
          <div className="card-base p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Active Trigger Monitors ({alerts.length})
            </h3>

            <div className="space-y-2">
              {alerts.length > 0 ? (
                alerts.map((al) => (
                  <div key={al.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold mono text-white">
                        <span>{al.stock_symbol}</span>
                        <span className={al.condition === 'ABOVE' ? 'text-emerald-400' : 'text-red-400'}>
                          {al.condition} ${parseFloat(al.target_price).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {al.is_triggered ? 'Status: TRIGGERED' : 'Status: ARMED & MONITORING'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(al.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition"
                      title="Delete Alert"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No active price alert triggers set.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
