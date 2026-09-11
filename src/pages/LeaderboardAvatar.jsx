import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getApiUrl } from '../services/api';

import {
  Trophy,
  Crown,
  Sparkles,
  Flame,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Share2,
  Copy,
  Check,
  User,
  Heart,
  Radio,
  ExternalLink,
  Shield
} from 'lucide-react';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' }
];

export default function LeaderboardAvatar() {
  const { username: rawUsername } = useParams();
  const username = (rawUsername || 'dara_gaming').replace(/^@/, '');

  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    streamer: null,
    settings: null,
    stats: null,
    top3: [],
    rankings: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'live' | 'connecting' | 'reconnecting'
  const [highlightedDonor, setHighlightedDonor] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Dynamic public share URL
  const publicLeaderboardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/leaderboard-avatar/${username}`
    : `https://zoeedonate.com/leaderboard-avatar/${username}`;

  const fetchLeaderboard = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get(`/leaderboard/${username}?period=${period}&page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.streamer) {
          document.title = `Top Supporters | ${res.data.streamer.displayName} Leaderboard`;
        }
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [username, period, page, searchQuery]);

  // Real-time SSE Connection
  useEffect(() => {
    if (!username) return;

    let eventSource = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      setConnectionStatus('connecting');
      eventSource = new EventSource(getApiUrl(`/leaderboard/stream/${username}`));

      eventSource.onopen = () => {

        setConnectionStatus('live');
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_DONATION' || payload.type === 'LEADERBOARD_UPDATE' || payload.type === 'TEST_ALERT') {
            const donorName = payload.data?.donor_name || 'Anonymous';
            setHighlightedDonor(donorName);
            setTimeout(() => setHighlightedDonor(null), 4000);
            fetchLeaderboard(true);
          }
        } catch (err) {
          console.error('SSE parsing error:', err);
        }
      };

      eventSource.onerror = () => {
        setConnectionStatus('reconnecting');
        if (eventSource) eventSource.close();
        reconnectTimeout = setTimeout(connectSSE, 4000);
      };
    };

    connectSSE();

    // Fallback periodic sync every 10s
    const pollInterval = setInterval(() => {
      fetchLeaderboard(true);
    }, 10000);

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
    };
  }, [username, period]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicLeaderboardUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Avatar resolution helper with initials fallback
  const renderAvatar = (url, name, sizeClass = 'w-12 h-12') => {
    const initials = (name || 'A')
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    if (url) {
      return (
        <img
          src={url}
          alt={name}
          className={`${sizeClass} rounded-full object-cover shadow-lg border-2 border-white/20`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }
          }}
        />
      );
    }

    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-tr from-brand-600 via-accent-fuchsia to-accent-cyan text-white font-black text-sm flex items-center justify-center shadow-lg border-2 border-white/20 select-none`}>
        {initials}
      </div>
    );
  };

  const top1 = data.top3 && data.top3[0] ? data.top3[0] : null;
  const top2 = data.top3 && data.top3[1] ? data.top3[1] : null;
  const top3 = data.top3 && data.top3[2] ? data.top3[2] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 font-sans">
      {/* 1. HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-brand-500/30 bg-[#161822]/90 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 shadow-xl shrink-0">
              <img
                src={data.streamer?.avatarUrl || '/zoee-avatar.png'}
                alt={username}
                className="w-full h-full rounded-xl object-cover bg-dark-card"
                onError={(e) => { e.currentTarget.src = '/zoee-avatar.png'; }}
              />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {data.settings?.title || `${data.streamer?.displayName || username}'s Leaderboard`}
                </h1>
                {/* Live Status Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border ${
                  connectionStatus === 'live'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'live' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`}></span>
                  {connectionStatus === 'live' ? 'Live Real-Time' : 'Syncing...'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {data.settings?.description || 'Honoring our top community supporters & stream VIPs! ❤️'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all shadow-md"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied Link!' : 'Share Leaderboard'}</span>
            </button>
            <Link
              to={`/@${username}`}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-fuchsia text-xs font-bold text-white shadow-lg shadow-brand-500/25 flex items-center gap-1.5 hover:brightness-110 transition-all"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Send Tip</span>
            </Link>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-dark-surface/60 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Donations</span>
            <span className="text-base sm:text-xl font-black text-accent-cyan font-mono">
              ${Number(data.stats?.total_donations_amount || 0).toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-dark-surface/60 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Donors</span>
            <span className="text-base sm:text-xl font-black text-white font-mono">
              {data.stats?.total_donors_count || 0}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-dark-surface/60 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Tips Sent</span>
            <span className="text-base sm:text-xl font-black text-accent-emerald font-mono">
              {data.stats?.total_donations_count || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PERIOD TABS */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-[#171923] border border-white/10 shadow-lg">
          {PERIODS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setPeriod(tab.id); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                period === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TOP 3 PODIUM STAGE */}
      <div className="pt-4 pb-2">
        <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-2xl mx-auto text-center">
          {/* #2 SILVER (Left) */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-4 sm:p-5 rounded-3xl border transition-all ${
              highlightedDonor === top2?.donor_name
                ? 'bg-slate-300/30 border-white ring-2 ring-white scale-105 shadow-2xl'
                : 'bg-[#181A26]/90 border-slate-400/30 shadow-xl'
            }`}
          >
            <div className="relative inline-block mb-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-slate-400 to-slate-200 shadow-md">
                <img
                  src={top2?.avatar_url || '/zoee-avatar.png'}
                  alt={top2?.donor_name || 'Rank 2'}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/zoee-avatar.png'; }}
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-slate-300 to-slate-100 text-black font-black text-[10px] shadow-md">
                #2
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-[140px] mx-auto">
              {top2 ? top2.donor_name : 'Empty'}
            </h4>
            <p className="text-xs sm:text-sm font-black text-slate-300 font-mono mt-1">
              ${top2 ? Number(top2.total_amount).toFixed(2) : '0.00'}
            </p>
            <span className="text-[10px] text-slate-400 font-mono">
              {top2 ? `${top2.donation_count} tips` : '—'}
            </span>
          </motion.div>

          {/* #1 GOLD (Center, Highlighted & Elevated) */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`p-5 sm:p-7 rounded-3xl border-2 transition-all relative ${
              highlightedDonor === top1?.donor_name
                ? 'bg-amber-500/30 border-amber-300 ring-4 ring-amber-400 scale-110 shadow-[0_0_50px_rgba(245,158,11,0.6)]'
                : 'bg-gradient-to-b from-amber-500/20 via-[#1F1C18] to-[#161822] border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.3)]'
            }`}
          >
            {/* Animated Crown Icon */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Crown className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-bounce" />
            </div>

            <div className="relative inline-block my-2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-200 shadow-2xl">
                <img
                  src={top1?.avatar_url || '/zoee-avatar.png'}
                  alt={top1?.donor_name || 'Rank 1'}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/zoee-avatar.png'; }}
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 text-black font-black text-xs shadow-lg">
                #1 👑
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white truncate max-w-[160px] mx-auto mt-2">
              {top1 ? top1.donor_name : 'Waiting for #1'}
            </h3>
            <p className="text-sm sm:text-lg font-black text-amber-300 font-mono mt-1">
              ${top1 ? Number(top1.total_amount).toFixed(2) : '0.00'}
            </p>
            <span className="text-[11px] text-amber-400/80 font-mono font-bold">
              {top1 ? `${top1.donation_count} donations` : 'Top Supporter'}
            </span>
          </motion.div>

          {/* #3 BRONZE (Right) */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-4 sm:p-5 rounded-3xl border transition-all ${
              highlightedDonor === top3?.donor_name
                ? 'bg-amber-800/30 border-amber-600 ring-2 ring-amber-500 scale-105 shadow-2xl'
                : 'bg-[#181A26]/90 border-amber-800/40 shadow-xl'
            }`}
          >
            <div className="relative inline-block mb-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 shadow-md">
                <img
                  src={top3?.avatar_url || '/zoee-avatar.png'}
                  alt={top3?.donor_name || 'Rank 3'}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/zoee-avatar.png'; }}
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-700 to-amber-600 text-white font-black text-[10px] shadow-md">
                #3
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-[140px] mx-auto">
              {top3 ? top3.donor_name : 'Empty'}
            </h4>
            <p className="text-xs sm:text-sm font-black text-amber-500 font-mono mt-1">
              ${top3 ? Number(top3.total_amount).toFixed(2) : '0.00'}
            </p>
            <span className="text-[10px] text-slate-400 font-mono">
              {top3 ? `${top3.donation_count} tips` : '—'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* 4. REMAINING DONORS TABLE (Rank 4+) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#161822]/95 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">All Supporters Rankings</h3>
              <p className="text-[11px] text-slate-400">Total {data.pagination?.total || 0} verified community donors</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search donor..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-surface border border-white/10 focus:border-brand-500 text-xs text-white placeholder-slate-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Donor List */}
        {data.rankings.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-bold text-slate-300">No donations found for this period.</p>
            <p className="text-xs text-slate-500">Be the first supporter to take the crown!</p>
            <Link
              to={`/@${username}`}
              className="inline-block mt-3 px-5 py-2 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-md"
            >
              Send a Tip Now ❤️
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {data.rankings.map((donor, idx) => {
                const rankNum = (page - 1) * 10 + idx + 1;
                const isHighlight = highlightedDonor === donor.donor_name;

                return (
                  <motion.div
                    key={donor.donor_name + '_' + idx}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isHighlight
                        ? 'bg-brand-500/25 border-brand-400 shadow-lg scale-[1.01]'
                        : rankNum === 1
                        ? 'bg-amber-500/10 border-amber-400/40'
                        : rankNum === 2
                        ? 'bg-slate-300/10 border-slate-300/30'
                        : rankNum === 3
                        ? 'bg-amber-800/15 border-amber-700/30'
                        : 'bg-[#1E2128]/80 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Rank Number */}
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        rankNum === 1 ? 'bg-amber-400 text-black shadow-md' : rankNum === 2 ? 'bg-slate-300 text-black shadow-md' : rankNum === 3 ? 'bg-amber-700 text-white shadow-md' : 'bg-dark-surface text-slate-400 font-mono'
                      }`}>
                        #{rankNum}
                      </span>

                      {/* Avatar */}
                      <img
                        src={donor.avatar_url || '/zoee-avatar.png'}
                        alt={donor.donor_name}
                        className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
                        onError={(e) => { e.currentTarget.src = '/zoee-avatar.png'; }}
                      />

                      {/* Name & Tips count */}
                      <div className="truncate">
                        <span className="text-xs sm:text-sm font-bold text-white truncate block">
                          {donor.donor_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {donor.donation_count || 1} donations
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-xs sm:text-sm font-black font-mono text-accent-cyan block">
                        ${Number(donor.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination Controls */}
        {data.pagination?.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs font-mono text-slate-400">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page >= data.pagination.totalPages}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
