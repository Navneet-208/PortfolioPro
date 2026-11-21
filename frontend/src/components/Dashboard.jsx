import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  PieChart as PieIcon, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Layers
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function Dashboard({ 
  summary, 
  stocks, 
  riskData, 
  onNavigateToTrade, 
  onNavigateToTechnical 
}) {
  const totalEquity = summary ? parseFloat(summary.total_equity || 0) : 100000;
  const cashBalance = summary ? parseFloat(summary.cash_balance || 0) : 100000;
  const investedValue = summary ? parseFloat(summary.invested_value || 0) : 0;
  const unrealizedPnl = summary ? parseFloat(summary.unrealized_pnl || 0) : 0;
  const returnPct = summary ? parseFloat(summary.return_percentage || 0) : 0;
  const isPositive = unrealizedPnl >= 0;

  // 1. Prepare Equity Performance Chart Data
  const history = summary?.performance_history || [];
  const chartLabels = history.length > 0 
    ? history.map(h => new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    : ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Today'];

  const chartPoints = history.length > 0
    ? history.map(h => parseFloat(h.total_equity))
    : [96000, 97500, 98200, 99100, 102400, 105800, totalEquity];

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Portfolio Equity ($)',
        data: chartPoints,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#94a3b8',
        bodyColor: '#38bdf8',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` Equity: $${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { 
          color: '#64748b', 
          font: { size: 10 },
          callback: (value) => `$${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  // 2. Prepare Sector Allocation Doughnut Chart
  const sectorAllocations = summary?.sector_allocations || [
    { sector: 'Technology', percentage: 55 },
    { sector: 'Financial Services', percentage: 20 },
    { sector: 'Cash Reserve', percentage: 25 },
  ];

  const doughnutColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'
  ];

  const doughnutData = {
    labels: sectorAllocations.map(s => s.sector),
    datasets: [
      {
        data: sectorAllocations.map(s => s.percentage),
        backgroundColor: doughnutColors.slice(0, sectorAllocations.length),
        borderColor: '#0f172a',
        borderWidth: 2,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
          boxWidth: 12,
          padding: 10
        }
      }
    },
    cutout: '72%'
  };

  return (
    <div className="space-y-6">

      {/* Hero Welcome & Market Ticker Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Trading Terminal Overview</span>
            <span className="badge-bull text-[11px]">Paper Simulation Active</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time equity valuation, risk limits, and asset breakdown</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => onNavigateToTrade()}
            className="btn-buy text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Activity size={14} />
            <span>New Order</span>
          </button>
          <button 
            onClick={() => onNavigateToTechnical()}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Layers size={14} />
            <span>Technical Screener</span>
          </button>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Equity */}
        <div className="card-base p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Portfolio Equity</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mono">
            ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={isPositive ? "text-emerald-400 flex items-center" : "text-red-400 flex items-center"}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {isPositive ? `+${returnPct}%` : `${returnPct}%`}
            </span>
            <span className="text-slate-400">overall return</span>
          </div>
        </div>

        {/* Card 2: Cash Balance */}
        <div className="card-base p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Cash</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mono">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Liquid paper capital for buy orders
          </div>
        </div>

        {/* Card 3: Unrealized P&L */}
        <div className="card-base p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Unrealized P&L</span>
            <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
          </div>
          <div className={`text-2xl font-bold mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? `+$${unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-$${Math.abs(unrealizedPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Cost basis: ${parseFloat(summary?.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 4: Quantitative Risk Metric */}
        <div className="card-base p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Risk Score & Beta</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white mono">
              {riskData?.metrics?.risk_score || 48}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
            <span className="badge-neutral text-[10px] ml-auto">
              Beta {riskData?.metrics?.portfolio_beta || 1.18}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            1-Day 95% VaR: <span className="text-amber-400 font-semibold mono">${riskData?.metrics?.value_at_risk_95 || '2,840.50'}</span>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: 30-Day Equity Curve (2 Cols) */}
        <div className="lg:col-span-2 card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Portfolio Performance Curve</span>
                <span className="text-xs font-normal text-slate-400">(30-Day Series)</span>
              </h2>
              <p className="text-xs text-slate-400">Mark-to-market valuation including cash and active equities</p>
            </div>
            <span className="badge-bull">Active Feed</span>
          </div>
          <div className="h-64 w-full">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Right: Sector Allocation Doughnut (1 Col) */}
        <div className="card-base p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <PieIcon size={16} className="text-blue-400" />
              <span>Asset Allocation</span>
            </h2>
            <p className="text-xs text-slate-400">Diversification across economic sectors</p>
          </div>
          <div className="h-56 w-full my-auto py-2">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

      </div>

      {/* Active Holdings Table */}
      <div className="card-base overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Current Portfolio Holdings</h3>
            <p className="text-xs text-slate-400">Live positions updated with current market prices</p>
          </div>
          <button 
            onClick={() => onNavigateToTrade()} 
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Manage Holdings &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Sector</th>
                <th className="text-right">Shares</th>
                <th className="text-right">Avg Entry</th>
                <th className="text-right">Current Price</th>
                <th className="text-right">Market Value</th>
                <th className="text-right">Unrealized P&L</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {summary?.holdings && summary.holdings.length > 0 ? (
                summary.holdings.map((h) => {
                  const pnl = parseFloat(h.unrealized_pnl);
                  const isGain = pnl >= 0;
                  return (
                    <tr key={h.id}>
                      <td className="font-bold text-blue-400 mono">{h.symbol}</td>
                      <td className="text-slate-300 font-medium">{h.company_name}</td>
                      <td><span className="badge-neutral text-[10px]">{h.sector}</span></td>
                      <td className="text-right mono text-white">{h.shares}</td>
                      <td className="text-right mono text-slate-300">${parseFloat(h.average_buy_price).toFixed(2)}</td>
                      <td className="text-right mono font-semibold text-white">${parseFloat(h.current_price).toFixed(2)}</td>
                      <td className="text-right mono font-semibold text-white">${parseFloat(h.current_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className={`text-right mono font-semibold ${isGain ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isGain ? `+$${pnl.toFixed(2)} (+${h.return_percentage}%)` : `-$${Math.abs(pnl).toFixed(2)} (${h.return_percentage}%)`}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => onNavigateToTrade(h.symbol)}
                          className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-medium transition"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400">
                    No active stock holdings in your portfolio. Go to <button onClick={() => onNavigateToTrade()} className="text-blue-400 underline">Trading Engine</button> to open positions.
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
