import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  DollarSign,
  Users,
  Calendar,
  Clock,
  Heart,
  Target,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Radio,
  Share2,
  Zap,
  Volume2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedTipLink, setCopiedTipLink] = useState(false);
  const [copiedAlertLink, setCopiedAlertLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    api.get('/streamers/dashboard/stats')
      .then(res => {
        if (res.success) setData(res.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-3">
        <span className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full"></span>
        Loading channel statistics...
      </div>
    );
  }

  const { metrics, activeGoal, recentDonations, streamer } = data || {};
  const streamerSlug = streamer?.slug || 'streamer';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const tipUrl = `${origin}/tip/${streamerSlug}`;
  const alertUrl = `${origin}/alert/${streamerSlug}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'tip') {
      setCopiedTipLink(true);
      setTimeout(() => setCopiedTipLink(false), 2500);
    } else if (type === 'alert') {
      setCopiedAlertLink(true);
      setTimeout(() => setCopiedAlertLink(false), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {/* 🚀 OFFICIAL CREATOR TIP LINK & OBS OVERLAYS HUB */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-brand-500/30 bg-gradient-to-br from-[#121420]/95 via-[#1a1333]/90 to-[#121420]/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
        {/* Glow ambient background aura */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-accent-cyan/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-[11px] font-extrabold text-brand-300 uppercase tracking-wider shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Your Official Tip Link System
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot"></span>
                ACTIVE
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Share Your Tip Link With Viewers
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Viewers scan with ABA KHQR using ABA Mobile or any Cambodian bank app. Tips trigger instant OBS alerts, sound chimes, and TTS on your stream.
            </p>

            {/* Tip Link Field */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-black/50 border border-brand-500/30 text-white font-mono text-xs sm:text-sm shadow-inner group">
                <LinkIcon className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="truncate select-all text-slate-200 font-semibold">{tipUrl}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(tipUrl, 'tip')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg ${
                    copiedTipLink
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                      : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/25 hover:scale-105'
                  }`}
                >
                  {copiedTipLink ? (
                    <>
                      <Check className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Tip Link
                    </>
                  )}
                </button>

                <a
                  href={tipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl font-bold text-xs text-slate-200 glass-card hover:bg-white/10 hover:border-brand-500/50 transition-all flex items-center justify-center gap-1.5"
                  title="Open Tip Page in New Tab"
                >
                  <ExternalLink className="w-4 h-4 text-accent-cyan" />
                  <span>Test Tip</span>
                </a>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-3.5 py-2.5 rounded-xl font-bold text-xs text-slate-200 glass-card hover:bg-white/10 hover:border-brand-500/50 transition-all flex items-center justify-center gap-1.5"
                  title="View Tip QR Code"
                >
                  <QrCode className="w-4 h-4 text-accent-fuchsia" />
                  <span>QR</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Overlay Links Column */}
          <div className="w-full lg:w-auto p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3 shrink-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-accent-cyan" />
              OBS Stream Overlays
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300">Tip Alert Box:</span>
                <button
                  onClick={() => copyToClipboard(alertUrl, 'alert')}
                  className="text-[11px] font-mono text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold"
                >
                  {copiedAlertLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedAlertLink ? 'Copied' : 'Copy Alert URL'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300">Supporters Leaderboard:</span>
                <button
                  onClick={() => copyToClipboard(`${origin}/overlay/leaderboard/${streamerSlug}`, 'alert')}
                  className="text-[11px] font-mono text-accent-cyan hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3 h-3" /> Copy URL
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300">Donation Goal Bar:</span>
                <button
                  onClick={() => copyToClipboard(`${origin}/overlay/goal/${streamerSlug}`, 'alert')}
                  className="text-[11px] font-mono text-accent-fuchsia hover:text-fuchsia-300 flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3 h-3" /> Copy URL
                </button>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <Link
                  to="/dashboard/client"
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Configure & Test OBS Alerts →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl glass-panel bg-[#141622] border border-brand-500/30 p-6 text-center space-y-5 shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-400 uppercase tracking-widest font-bold">Direct Tip QR Code</span>
              <h3 className="text-lg font-black text-white">@{streamerSlug}</h3>
              <p className="text-xs text-slate-400">Display this QR code in OBS or print for live broadcasts</p>
            </div>

            <div className="p-4 bg-white rounded-2xl mx-auto w-fit shadow-2xl border-4 border-brand-500/40">
              <QRCodeSVG
                value={tipUrl}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-mono text-slate-400 break-all px-2 select-all">{tipUrl}</p>
              <button
                onClick={() => copyToClipboard(tipUrl, 'tip')}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2 transition-colors"
              >
                {copiedTipLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedTipLink ? 'Tip Link Copied!' : 'Copy Direct Tip Link'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-brand-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Raised</span>
            <DollarSign className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${Number(metrics?.totalReceived || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-accent-emerald flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> All-time earnings
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-accent-cyan/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Today's Total</span>
            <Calendar className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${Number(metrics?.todayTotal || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">24-hour window</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-accent-fuchsia/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>This Month</span>
            <Clock className="w-4 h-4 text-accent-fuchsia" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${Number(metrics?.monthTotal || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">Monthly earnings</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Supporters</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {metrics?.supporterCount || 0}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">{metrics?.totalDonationsCount || 0} total donations</span>
        </div>
      </div>

      {/* Active Goal Highlight */}
      {activeGoal && (
        <div className="glass-panel p-6 rounded-3xl border border-brand-500/25 bg-dark-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{activeGoal.title}</h3>
                <p className="text-xs text-slate-400">Active Live Donation Target</p>
              </div>
            </div>
            <Link to="/dashboard/goals" className="text-xs text-brand-400 hover:text-brand-300 font-bold">
              Manage Goal →
            </Link>
          </div>

          <div className="w-full bg-dark-surface rounded-full h-3 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-brand-500 via-accent-cyan to-accent-emerald h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((activeGoal.current_amount / activeGoal.target_amount) * 100))}%`
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span>${Number(activeGoal.current_amount).toFixed(2)} raised</span>
            <span className="text-accent-cyan font-bold">
              {Math.min(100, Math.round((activeGoal.current_amount / activeGoal.target_amount) * 100))}%
            </span>
            <span>Target: ${Number(activeGoal.target_amount).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-400" />
            Recent Donations
          </h3>
          <Link to="/dashboard/donations" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
            View All History →
          </Link>
        </div>

        {recentDonations?.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No donations received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-mono border-b border-white/5">
                <tr>
                  <th className="py-3 px-3">Donor</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Message</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentDonations?.map((d) => (
                  <tr key={d.id} className="hover:bg-white/5 transition-colors">
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
                      {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
