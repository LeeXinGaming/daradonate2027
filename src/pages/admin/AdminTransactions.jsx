import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, Search, CheckCircle2, Clock, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const res = await api.get(`/admin/transactions?${params.toString()}`);
      if (res.success) {
        setTransactions(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [status]);

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-accent-rose" />
          Platform Transactions & Payment Auditing
        </h2>
        <p className="text-xs text-slate-400">Inspect system-wide donation logs and payment provider reference numbers</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form
          onSubmit={(e) => { e.preventDefault(); fetchTransactions(1); }}
          className="relative flex-1"
        >
          <input
            type="text"
            placeholder="Search txn ID, donor, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white placeholder-slate-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </form>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-slate-300"
        >
          <option value="">All Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="py-12 text-center text-slate-400">No transactions found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase font-mono border-b border-white/5">
              <tr>
                <th className="py-3 px-3">Txn ID</th>
                <th className="py-3 px-3">Donor</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Gateway</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3">Paid At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-300 font-bold">
                    {t.transaction_id}
                  </td>
                  <td className="py-3 px-3 text-white font-semibold">
                    {t.donor_name}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-accent-cyan">
                    ${Number(t.amount).toFixed(2)} {t.currency}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {t.payment_method}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.payment_status === 'PAID' ? 'bg-accent-emerald/20 text-accent-emerald' : t.payment_status === 'PENDING' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {t.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {t.paid_at ? new Date(t.paid_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
          <span>Page {meta.page} of {meta.totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => fetchTransactions(meta.page - 1)}
              className="p-1.5 rounded-lg border border-dark-border disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => fetchTransactions(meta.page + 1)}
              className="p-1.5 rounded-lg border border-dark-border disabled:opacity-30"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
