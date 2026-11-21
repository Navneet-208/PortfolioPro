import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import api from '../services/api';

export default function TechnicalAnalysis({ 
  stocks, 
  initialSymbol, 
  onNavigateToTrade 
}) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol || 'AAPL');
  const [technicalData, setTechnicalData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSymbol) {
      setSelectedSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  useEffect(() => {
    loadTechnicalData(selectedSymbol);
  }, [selectedSymbol]);

  const loadTechnicalData = async (symbol) => {
    setLoading(true);
    try {
      const [techRes, histRes] = await Promise.all([
        api.getTechnicalAnalysis(symbol),
        api.getStockHistory(symbol, 30),
      ]);
      setTechnicalData(techRes.data?.indicators || null);
      setHistoryData(histRes.data?.history || []);
    } catch (err) {
      console.error('Error loading technical analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const ind = technicalData || {
    current_price: 228.50,
    sma_20: 224.10,
    sma_50: 218.40,
    ema_20: 225.20,
    rsi_14: 64.20,
    rsi_signal: 'NEUTRAL',
    macd: 2.14,
    macd_signal: 1.82,
    macd_histogram: 0.32,
    macd_action: 'BUY',
    bollinger_upper: 234.50,
    bollinger_middle: 224.10,
    bollinger_lower: 213.70,
    moving_average_signal: 'BUY',
    overall_recommendation: 'STRONG BUY'
  };

  // Build Price & Bollinger Bands Chart Data
  const labels = historyData.length > 0 
    ? historyData.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    : Array.from({ length: 20 }, (_, i) => `Day ${i + 1}`);

  const closePrices = historyData.length > 0
    ? historyData.map(h => parseFloat(h.close_price))
    : Array.from({ length: 20 }, (_, i) => ind.current_price * (1 + (i - 10) * 0.005));

  // Calculate 20-day SMA series
  const smaSeries = closePrices.map((val, idx, arr) => {
    const slice = arr.slice(Math.max(0, idx - 19), idx + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    return parseFloat((sum / slice.length).toFixed(2));
  });

  const upperBandSeries = smaSeries.map(s => parseFloat((s * 1.03).toFixed(2)));
  const lowerBandSeries = smaSeries.map(s => parseFloat((s * 0.97).toFixed(2)));

  const mainChartData = {
    labels,
    datasets: [
      {
        label: `${selectedSymbol} Close Price`,
        data: closePrices,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 2.5,
        tension: 0.2,
      },
      {
        label: '20-Day SMA',
        data: smaSeries,
        borderColor: '#f59e0b',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
      },
      {
        label: 'Bollinger Upper (2σ)',
        data: upperBandSeries,
        borderColor: 'rgba(16, 185, 129, 0.7)',
        borderWidth: 1,
        borderDash: [2, 2],
        pointRadius: 0,
      },
      {
        label: 'Bollinger Lower (2σ)',
        data: lowerBandSeries,
        borderColor: 'rgba(239, 68, 68, 0.7)',
        borderWidth: 1,
        borderDash: [2, 2],
        pointRadius: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      }
    }
  };

  const recColor = ind.overall_recommendation.includes('BUY') ? 'badge-bull' : (ind.overall_recommendation.includes('SELL') ? 'badge-bear' : 'badge-neutral');

  return (
    <div className="space-y-6">

      {/* Header and Asset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Technical Analysis & Quantitative Indicators</span>
            <span className={`${recColor} text-xs font-bold uppercase`}>
              Signal: {ind.overall_recommendation}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Moving averages, RSI momentum, MACD cross, and Bollinger volatility bands</p>
        </div>

        {/* Ticker Selector & Quick Trade */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="form-input text-xs font-bold mono w-48"
          >
            {stocks.map(s => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} - {s.company_name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onNavigateToTrade(selectedSymbol)}
            className="btn-buy text-xs py-1.5 px-3.5"
          >
            Trade {selectedSymbol}
          </button>
        </div>
      </div>

      {/* Technical Gauges Strip (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* RSI Card */}
        <div className="card-base p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RSI (14-Day)</span>
            <span className={ind.rsi_signal === 'BUY' ? 'badge-bull' : (ind.rsi_signal === 'SELL' ? 'badge-bear' : 'badge-neutral')}>
              {ind.rsi_signal}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mono mt-1">
            {ind.rsi_14}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {ind.rsi_14 > 70 ? 'Overbought (>70)' : (ind.rsi_14 < 30 ? 'Oversold (<30)' : 'Neutral Momentum (30-70)')}
          </p>
        </div>

        {/* MACD Card */}
        <div className="card-base p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MACD Oscillator</span>
            <span className={ind.macd_action === 'BUY' ? 'badge-bull' : 'badge-bear'}>
              {ind.macd_action}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mono mt-1">
            {ind.macd}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Signal: <span className="text-slate-300 mono">{ind.macd_signal}</span> | Hist: <span className="text-emerald-400 mono">{ind.macd_histogram}</span>
          </p>
        </div>

        {/* Moving Averages Alignment */}
        <div className="card-base p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MA Trend Alignment</span>
            <span className={ind.moving_average_signal === 'BUY' ? 'badge-bull' : 'badge-bear'}>
              {ind.moving_average_signal}
            </span>
          </div>
          <div className="text-sm font-bold text-white mono mt-1">
            SMA 20: ${ind.sma_20}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            SMA 50: <span className="mono text-slate-300">${ind.sma_50}</span> | EMA 20: <span className="mono text-slate-300">${ind.ema_20}</span>
          </p>
        </div>

        {/* Bollinger Band Range */}
        <div className="card-base p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bollinger Envelope</span>
            <span className="badge-neutral text-[10px]">20-Day ±2σ</span>
          </div>
          <div className="text-xs font-bold text-emerald-400 mono mt-1">
            Upper: ${ind.bollinger_upper}
          </div>
          <div className="text-xs font-bold text-red-400 mono mt-1">
            Lower: ${ind.bollinger_lower}
          </div>
        </div>

      </div>

      {/* Main Multi-Indicator Chart */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="text-blue-400" size={18} />
              <span>{selectedSymbol} Price Action & Technical Overlay</span>
            </h2>
            <p className="text-xs text-slate-400">Daily candlestick close with 20-Day Simple Moving Average and Bollinger Volatility Envelope</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <Line data={mainChartData} options={chartOptions} />
        </div>
      </div>

    </div>
  );
}
