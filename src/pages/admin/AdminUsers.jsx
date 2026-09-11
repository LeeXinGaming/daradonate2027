import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Shield, Ban, CheckCircle2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleUpdateUser = async (userId, updates) => {
    try {
      const res = await api.patch(`/admin/users/${userId}`, updates);
      if (res.success) {
        setMsg('User status updated successfully.');
        fetchUsers();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" />
            User & Streamer Management
          </h2>
          <p className="text-xs text-slate-400">View accounts, promote roles, and suspend malicious users</p>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald font-semibold text-center">
          {msg}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form
          onSubmit={(e) => { e.preventDefault(); fetchUsers(); }}
          className="relative flex-1"
        >
          <input
            type="text"
            placeholder="Search email, username, display name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white placeholder-slate-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-slate-300"
        >
          <option value="">All Roles</option>
          <option value="USER">USER</option>
          <option value="STREAMER">STREAMER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading user accounts...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase font-mono border-b border-white/5">
              <tr>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={u.username}
                        className="w-7 h-7 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <p className="font-bold text-white leading-none">{u.display_name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-accent-rose/20 text-accent-rose' : u.role === 'STREAMER' ? 'bg-brand-500/20 text-brand-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'ACTIVE' ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    {u.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleUpdateUser(u.id, { status: 'SUSPENDED' })}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold transition-colors"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateUser(u.id, { status: 'ACTIVE' })}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold transition-colors"
                      >
                        Unsuspend
                      </button>
                    )}
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
