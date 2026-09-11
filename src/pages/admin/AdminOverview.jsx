import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldAlert,
  DollarSign,
  Users,
  Radio,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/overview')
      .then(res => {
        if (res.success) setStats(res.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-slate-400">Loading system metrics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-accent-rose/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Platform GMV</span>
            <DollarSign className="w-4 h-4 text-accent-rose" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${Number(stats?.totalVolumeUSD || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-accent-emerald flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> Cumulative settled volume
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-brand-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {stats?.totalUsers || 0}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">{stats?.totalStreamers || 0} verified creators</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-accent-cyan/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Completed Donations</span>
            <Activity className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {stats?.totalDonationsCount || 0}
          </p>
          <span className="text-[11px] text-accent-cyan font-mono">Successful paid txns</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Pending Txns</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {stats?.pendingCount || 0}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">In payment window</span>
        </div>
      </div>

      {/* Payment Gateway Health Monitor */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-accent-rose" />
          Active Gateway Integrations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-dark-surface border border-brand-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">ABA PayWay v2</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-emerald/20 text-accent-emerald border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">HMAC-SHA512 Signature & Webhook Verification Enabled</p>
          </div>

          <div className="p-4 rounded-2xl bg-dark-surface border border-accent-cyan/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Bakong / KHQR Open API</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-emerald/20 text-accent-emerald border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">NBC EMVCo CRC-16 Checksum & MD5 Status Polling Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
