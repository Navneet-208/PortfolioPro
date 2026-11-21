import React, { useState } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, Star, Activity, BarChart2 } from 'lucide-react';

export default function MarketData({ 
  stocks, 
  onNavigateToTrade, 
  onNavigateToTechnical 
}) {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedExchange, setSelectedExchange] = useState('ALL');

  const sectors = ['ALL', 'Technology', 'Communication Services', 'Consumer Cyclical', 'Financial Services', 'Healthcare', 'Energy'];

  const filteredStocks = stocks.filter(s => {
    const matchesSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) || 
                          s.company_name.toLowerCase().includes(search.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || s.sector.toLowerCase() === selectedSector.toLowerCase();
    const matchesExchange = selectedExchange === 'ALL' || s.exchange === selectedExchange;
    return matchesSearch && matchesSector && matchesExchange;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Market Data & Equities Feed</span>
            <span className="badge-bull text-[11px]">Real-Time Streaming</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Explore institutional quotes, valuation multiples, and price action</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card-base p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol (AAPL, NVDA) or name..."
            className="form-input pl-9 text-xs"
          />
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedSector === sec
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Exchange Filter */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-slate-400">Exchange:</span>
          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 outline-none"
          >
            <option value="ALL">All Exchanges</option>
            <option value="NASDAQ">NASDAQ</option>
            <option value="NYSE">NYSE</option>
          </select>
        </div>

      </div>

      {/* Stock Cards / Grid Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Ticker & Name</th>
                <th>Sector / Exchange</th>
                <th className="text-right">Price</th>
                <th className="text-right">Day Change</th>
                <th className="text-right">Day Range</th>
                <th className="text-right">52-Week Range</th>
                <th className="text-right">P/E & Beta</th>
                <th className="text-right">Market Cap</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => {
                const change = parseFloat(stock.change || 0);
                const isGain = change >= 0;
                const price = parseFloat(stock.current_price);
                const w52h = parseFloat(stock.fifty_two_week_high);
                const w52l = parseFloat(stock.fifty_two_week_low);
                const rangePct = w52h > w52l ? Math.min(100, Math.max(0, ((price - w52l) / (w52h - w52l)) * 100)) : 50;

                return (
                  <tr key={stock.symbol}>
                    {/* Ticker & Name */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-blue-400 mono">
                          {stock.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <span className="font-bold text-white mono block">{stock.symbol}</span>
                          <span className="text-xs text-slate-400 line-clamp-1">{stock.company_name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Sector / Exchange */}
                    <td>
                      <div>
                        <span className="badge-neutral text-[10px] block w-fit mb-0.5">{stock.sector}</span>
                        <span className="text-[10px] text-slate-400">{stock.exchange}</span>
                      </div>
                    </td>

                    {/* Current Price */}
                    <td className="text-right mono font-bold text-white text-sm">
                      ${price.toFixed(2)}
                    </td>

                    {/* Change */}
                    <td className="text-right mono">
                      <span className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded ${
                        isGain ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                      }`}>
                        {isGain ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isGain ? `+${change.toFixed(2)} (+${parseFloat(stock.change_percent).toFixed(2)}%)` : `${change.toFixed(2)} (${parseFloat(stock.change_percent).toFixed(2)}%)`}
                      </span>
                    </td>

                    {/* Day Range */}
                    <td className="text-right mono text-xs text-slate-300">
                      ${parseFloat(stock.day_low).toFixed(2)} - ${parseFloat(stock.day_high).toFixed(2)}
                    </td>

                    {/* 52-Week Range Bar */}
                    <td className="text-right">
                      <div className="w-28 ml-auto">
                        <div className="flex justify-between text-[10px] text-slate-400 mono mb-1">
                          <span>${w52l.toFixed(0)}</span>
                          <span>${w52h.toFixed(0)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${rangePct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* P/E & Beta */}
                    <td className="text-right mono text-xs">
                      <div className="text-slate-200">PE: {stock.pe_ratio || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">Beta: {stock.beta}</div>
                    </td>

                    {/* Market Cap */}
                    <td className="text-right mono text-xs text-slate-300">
                      ${(stock.market_cap / 1e9).toFixed(1)}B
                    </td>

                    {/* Action Buttons */}
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onNavigateToTrade(stock.symbol)}
                          className="btn-buy text-xs py-1 px-2.5"
                          title="Execute Buy/Sell Order"
                        >
                          Trade
                        </button>
                        <button
                          onClick={() => onNavigateToTechnical(stock.symbol)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-blue-400 transition"
                          title="Technical Chart & Indicators"
                        >
                          <BarChart2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
