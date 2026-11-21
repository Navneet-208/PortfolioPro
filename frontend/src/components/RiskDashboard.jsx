import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  TrendingDown, 
  AlertTriangle, 
  Sliders, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';

export default function RiskDashboard({ riskData, onRefresh }) {
  const [limits, setLimits] = useState({
    max_position_size_pct: '25.0',
    stop_loss_alert_pct: '10.0',
    daily_loss_limit: '5000.00',
  });
  const [savingLimits, setSavingLimits] = useState(false);
  const [limitSavedMessage, setLimitSavedMessage] = useState(false);

  const metrics = riskData?.metrics || {
    risk_score: 48,
    portfolio_beta: '1.18',
    value_at_risk_95: '2,840.50',
    sharpe_ratio: '1.94',
    volatility: '15.20',
    max_drawdown: '7.40',
  };

  const stressTests = riskData?.stress_testing || [
    {
      scenario: '2008 Financial Crisis (-25% Market)',
      portfolio_impact_pct: -29.50,
      estimated_loss_usd: 16127.22,
      severity: 'HIGH'
    },
    {
      scenario: 'Tech Sector Correction (-15% Tech)',
      portfolio_impact_pct: -17.70,
      estimated_loss_usd: 9676.33,
      severity: 'MEDIUM'
    },
    {
      scenario: 'Fed +100bps Rate Hike (-6% Market)',
      portfolio_impact_pct: -7.08,
      estimated_loss_usd: 3870.53,
      severity: 'LOW'
    }
  ];

  const riskScore = metrics.risk_score || 45;
  const riskCategory = riskScore <= 35 ? 'CONSERVATIVE' : (riskScore <= 65 ? 'MODERATE' : 'AGGRESSIVE');

  const handleSaveLimits = async (e) => {
    e.preventDefault();
    setSavingLimits(true);
    try {
      await api.createRiskLimit(limits);
      setLimitSavedMessage(true);
      setTimeout(() => setLimitSavedMessage(false), 3000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLimits(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Risk Management & Quantitative Analytics</span>
            <span className="badge-neutral text-[11px]">Basel III Simulation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Value at Risk, volatility decomposition, and systemic stress testing</p>
        </div>
      </div>

      {/* Primary Quantitative Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Risk Score Card with Visual Gauge */}
        <div className="card-base p-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Composite Risk Score</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              riskScore <= 35 ? 'bg-emerald-500/20 text-emerald-400' : (riskScore <= 65 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400')
            }`}>
              {riskCategory}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white mono mt-1">
            {riskScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
          </div>
          {/* Progress Meter Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                riskScore <= 35 ? 'bg-emerald-500' : (riskScore <= 65 ? 'bg-amber-500' : 'bg-red-500')
              }`}
              style={{ width: `${riskScore}%` }}
            ></div>
          </div>
        </div>

        {/* 1-Day 95% VaR */}
        <div className="card-base p-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">1-Day 95% VaR</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-red-400 mono mt-1">
            ${metrics.value_at_risk_95}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Max expected 24h loss with 95% statistical confidence
          </p>
        </div>

        {/* Portfolio Beta */}
        <div className="card-base p-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weighted Beta</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mono mt-1">
            {metrics.portfolio_beta}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {parseFloat(metrics.portfolio_beta) > 1 
              ? 'Higher volatility than the benchmark S&P 500' 
              : 'Lower market sensitivity than broad benchmark'}
          </p>
        </div>

        {/* Sharpe Ratio & Volatility */}
        <div className="card-base p-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sharpe Ratio</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mono mt-1">
            {metrics.sharpe_ratio}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>Annual Volatility:</span>
            <span className="text-slate-200 mono font-semibold">{metrics.volatility}%</span>
          </div>
        </div>

      </div>

      {/* Stress Testing Section */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={18} />
              <span>Macroeconomic Stress Testing & Crisis Simulation</span>
            </h2>
            <p className="text-xs text-slate-400">Estimated mark-to-market drawdown under severe systemic economic shocks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stressTests.map((st, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-200">{st.scenario}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  st.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : (st.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400')
                }`}>
                  {st.severity} RISK
                </span>
              </div>

              <div>
                <div className="text-xl font-bold text-red-400 mono">
                  {st.portfolio_impact_pct}%
                </div>
                <div className="text-xs text-slate-400 mono mt-0.5">
                  Est. Impact: -${parseFloat(st.estimated_loss_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Limit Controls Form */}
      <div className="card-base p-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <Sliders className="text-blue-400" size={18} />
          <span>Configurable Risk Guardrails & Safety Limits</span>
        </h2>
        <p className="text-xs text-slate-400 mb-5">Set automated thresholds for position concentration and drawdown alerts</p>

        {limitSavedMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>Risk parameters updated and committed to database!</span>
          </div>
        )}

        <form onSubmit={handleSaveLimits} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Max Position Size Limit (%)</label>
            <input
              type="number"
              step="1"
              value={limits.max_position_size_pct}
              onChange={(e) => setLimits({ ...limits, max_position_size_pct: e.target.value })}
              className="form-input mono"
              placeholder="25.0"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Prevents overconcentration in single equity</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Stop-Loss Alert Threshold (%)</label>
            <input
              type="number"
              step="1"
              value={limits.stop_loss_alert_pct}
              onChange={(e) => setLimits({ ...limits, stop_loss_alert_pct: e.target.value })}
              className="form-input mono"
              placeholder="10.0"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Triggers notification if holding falls past limit</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Max Loss Tolerance ($)</label>
            <input
              type="number"
              step="500"
              value={limits.daily_loss_limit}
              onChange={(e) => setLimits({ ...limits, daily_loss_limit: e.target.value })}
              className="form-input mono"
              placeholder="5000.00"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Simulated margin stop limit</span>
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={savingLimits}
              className="btn-primary text-xs py-2 px-4"
            >
              {savingLimits ? 'Saving Parameters...' : 'Save Risk Guardrails'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
