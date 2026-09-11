import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, Search, Filter, ArrowLeft, ArrowRight, Download } from 'lucide-react';

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDonations = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '15' });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/donations/history?${params.toString()}`);
      if (res.success) {
        setDonations(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations(1);
  };

  const exportCSV = () => {
    if (donations.length === 0) return;
    const headers = 'Transaction ID,Donor,Amount,Currency,Message,Method,Status,Date\n';
    const rows = donations.map(d =>
      `"${d.transaction_id}","${d.anonymous ? 'Anonymous' : d.donor_name}","${d.amount}","${d.currency}","${(d.message || '').replace(/"/g, '""')}","${d.payment_method}","${d.payment_status}","${d.created_at}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoee_donations_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <History className="w-6 h-6 text-brand-400" />
            Donation History
          </h2>
          <p className="text-xs text-slate-400">View and audit all incoming donor transactions</p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <Download className="w-4 h-4 text-accent-cyan" />
          Export CSV
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            placeholder="Search donor name, txn ID, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-brand-500 text-xs text-white placeholder-slate-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-brand-500 text-xs text-slate-300"
        >
          <option value="">All Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading donations...</div>
      ) : donations.length === 0 ? (
        <div className="py-16 text-center text-slate-400">No donations found matching criteria.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase font-mono border-b border-white/5">
              <tr>
                <th className="py-3 px-3">Txn ID</th>
                <th className="py-3 px-3">Donor</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Message</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                    {d.transaction_id}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {d.anonymous ? 'Anonymous' : d.donor_name}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-accent-cyan">
                    {d.currency === 'KHR' ? `${Number(d.amount).toLocaleString()} ៛` : `$${Number(d.amount).toFixed(2)}`}
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-[200px] truncate">
                    {d.message || '-'}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {d.payment_method}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.payment_status === 'PAID'
                        ? 'bg-accent-emerald/20 text-accent-emerald border border-emerald-500/30'
                        : d.payment_status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {d.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {new Date(d.created_at).toLocaleDateString()} {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
          <span>Page {meta.page} of {meta.totalPages} ({meta.total} total)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => fetchDonations(meta.page - 1)}
              className="p-1.5 rounded-lg border border-dark-border disabled:opacity-30 hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => fetchDonations(meta.page + 1)}
              className="p-1.5 rounded-lg border border-dark-border disabled:opacity-30 hover:bg-white/5"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
