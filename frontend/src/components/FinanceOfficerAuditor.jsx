import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Search,
  Filter,
  Activity,
  LifeBuoy
} from 'lucide-react';
import api from '../services/api';

export default function FinanceOfficerAuditor() {
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [riskAudit, setRiskAudit] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOfficerData();
  }, [activeTab]);

  const fetchOfficerData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await api.getAllUsers();
        setUsersList(res.data || []);
      } else if (activeTab === 'accounts') {
        const res = await api.getAccounts();
        setAllAccounts(res.data?.results || res.data || []);
      } else if (activeTab === 'risk') {
        const res = await api.getRiskAudit();
        setRiskAudit(res.data || []);
      } else if (activeTab === 'orders') {
        const res = await api.getOrders();
        setAllOrders(res.data?.results || res.data || []);
      }
    } catch (err) {
      console.error('Officer data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Finance Officer & Institutional Auditor Control Panel</span>
            <span className="badge-bull text-[11px]">Compliance Oversight</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Supervisory access to client accounts, transaction ledgers, risk profiles, and order book</p>
        </div>
      </div>

      {/* Sub-tabs for Auditor */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'users', label: 'Registered Clients Directory', icon: Users },
          { id: 'accounts', label: 'Trading Accounts & Balances', icon: DollarSign },
          { id: 'risk', label: 'System-Wide Risk Surveillance', icon: AlertTriangle },
          { id: 'orders', label: 'Consolidated Order Book Audit', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive 
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Client Users Directory */}
      {activeTab === 'users' && (
        <div className="card-base overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Client Accounts Directory</h3>
            <span className="text-xs text-slate-400">{usersList.length} users registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>KYC Status</th>
                  <th>Risk Tolerance</th>
                  <th>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((p) => (
                  <tr key={p.id}>
                    <td className="font-bold text-white mono">{p.username}</td>
                    <td className="text-slate-300 text-xs">{p.email || 'N/A'}</td>
                    <td>
                      <span className={p.role === 'FINANCE_OFFICER' ? 'badge-bear' : 'badge-bull'}>
                        {p.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge-neutral text-[10px]">{p.kyc_status}</span>
                    </td>
                    <td>
                      <span className="badge-neutral text-[10px]">{p.risk_tolerance}</span>
                    </td>
                    <td className="text-xs text-slate-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Accounts & Balances */}
      {activeTab === 'accounts' && (
        <div className="card-base overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Consolidated Client Accounts</h3>
            <span className="text-xs text-slate-400">{allAccounts.length} accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Client Username</th>
                  <th>Type</th>
                  <th className="text-right">Liquid Balance</th>
                  <th>Currency</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {allAccounts.map((acc) => (
                  <tr key={acc.id}>
                    <td className="font-mono text-xs text-blue-400 font-bold">{acc.account_number}</td>
                    <td className="font-semibold text-white">{acc.username}</td>
                    <td><span className="badge-neutral text-[10px]">{acc.account_type}</span></td>
                    <td className="text-right mono font-bold text-emerald-400">
                      ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="mono text-xs text-slate-400">{acc.currency}</td>
                    <td className="text-center">
                      <span className="badge-bull text-[10px]">{acc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Risk Surveillance */}
      {activeTab === 'risk' && (
        <div className="card-base overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Systemic Risk Surveillance Matrix</h3>
              <p className="text-xs text-slate-400">Automated monitoring for accounts exceeding risk score &gt; 70</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Client Username</th>
                  <th>Risk Score</th>
                  <th>Risk Tier</th>
                  <th className="text-right">Portfolio Beta</th>
                  <th className="text-right">1-Day 95% VaR</th>
                  <th className="text-right">Sharpe Ratio</th>
                  <th className="text-right">Annual Volatility</th>
                </tr>
              </thead>
              <tbody>
                {riskAudit.map((r, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-white">{r.username}</td>
                    <td>
                      <span className="mono font-bold text-white">{r.risk_score} / 100</span>
                    </td>
                    <td>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-400' : (r.risk_level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400')
                      }`}>
                        {r.risk_level}
                      </span>
                    </td>
                    <td className="text-right mono text-slate-200">{r.portfolio_beta}</td>
                    <td className="text-right mono font-bold text-red-400">${parseFloat(r.value_at_risk_95).toFixed(2)}</td>
                    <td className="text-right mono text-emerald-400 font-semibold">{r.sharpe_ratio}</td>
                    <td className="text-right mono text-slate-200">{r.volatility}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Order Book Audit */}
      {activeTab === 'orders' && (
        <div className="card-base overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">System-Wide Trade Orders Ledger</h3>
            <span className="text-xs text-slate-400">{allOrders.length} orders recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Side</th>
                  <th>Symbol</th>
                  <th className="text-right">Shares</th>
                  <th className="text-right">Target Price</th>
                  <th>Type</th>
                  <th>Created At</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs text-blue-400">#ORD-{o.id}</td>
                    <td className="font-medium text-white">{o.username}</td>
                    <td>
                      <span className={o.side === 'BUY' ? 'badge-bull' : 'badge-bear'}>
                        {o.side}
                      </span>
                    </td>
                    <td className="font-bold text-white mono">{o.stock_symbol}</td>
                    <td className="text-right mono text-white">{o.quantity}</td>
                    <td className="text-right mono text-slate-300">${parseFloat(o.price).toFixed(2)}</td>
                    <td><span className="badge-neutral text-[10px]">{o.order_type}</span></td>
                    <td className="text-xs text-slate-400">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        o.status === 'EXECUTED' ? 'badge-bull' : (o.status === 'REJECTED' ? 'badge-bear' : 'badge-neutral')
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
