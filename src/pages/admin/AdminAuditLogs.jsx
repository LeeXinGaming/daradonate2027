import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Shield, Search } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-accent-rose" />
          Security Audit Logs
        </h2>
        <p className="text-xs text-slate-400">Immutable trail of administrative operations and security events</p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Filter audit actions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white placeholder-slate-500"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading audit trail...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase font-mono border-b border-white/5">
              <tr>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3">Entity ID</th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-accent-rose">
                    {log.action}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                      {log.entity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {log.entity_id || '-'}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {log.ip_address}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
