import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api, { getApiUrl } from '../services/api';
import { Trophy, Crown, Sparkles, Heart, Flame, Star, Shield } from 'lucide-react';

export default function OBSLeaderboard() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();

  // Customization URL Parameters
  const period = searchParams.get('period') || 'all'; // 'today' | 'week' | 'month' | 'all'
  const limit = parseInt(searchParams.get('limit') || '3', 10); // Strictly Top 3 default
  const layout = searchParams.get('layout') || 'vertical'; // 'vertical' | 'horizontal'
  const theme = searchParams.get('theme') || 'amber'; // 'amber' | 'cyan' | 'violet' | 'emerald' | 'rose'
  const customTitle = searchParams.get('title') || '';
  const anim = searchParams.get('anim') || 'pulse'; // 'pulse' | 'glow' | 'bounce' | 'none'
  const showCount = searchParams.get('count') !== 'false';
  const currencyOverride = searchParams.get('currency') || 'USD';

  const [supporters, setSupporters] = useState([]);
  const [streamer, setStreamer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set 100% transparent body & html for OBS
  useEffect(() => {
    document.body.classList.add('obs-overlay');
    document.documentElement.classList.add('obs-overlay');
    document.body.style.setProperty('background', 'transparent', 'important');
    document.body.style.setProperty('background-color', 'transparent', 'important');
    document.documentElement.style.setProperty('background', 'transparent', 'important');
    document.documentElement.style.setProperty('background-color', 'transparent', 'important');

    return () => {
      document.body.classList.remove('obs-overlay');
      document.documentElement.classList.remove('obs-overlay');
      document.body.style.background = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.background = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  const fetchSupporters = async () => {
    try {
      const [streamerRes, leaderRes] = await Promise.all([
        api.get(`/streamers/${username}`).catch(() => ({
          success: true,
          data: { streamer: { slug: username, profile: { display_name: username } } }
        })),
        api.get(`/leaderboard/${username}?period=${period}`).catch(() => ({
          success: true,
          data: { rankings: [] }
        }))
      ]);

      if (streamerRes?.success && streamerRes.data?.streamer) {
        setStreamer(streamerRes.data.streamer);
      }
      if (leaderRes?.success && leaderRes.data) {
        const rawList = leaderRes.data.rankings || leaderRes.data.top || [];
        setSupporters(rawList);
      }
    } catch (err) {
      console.error('Failed to load leaderboard overlay:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupporters();
    const interval = setInterval(fetchSupporters, 10000); // Polling fallback every 10s

    // Connect SSE for Instant Leaderboard Updates
    let eventSource = null;
    try {
      eventSource = new EventSource(getApiUrl(`/leaderboard/stream/${username}`));
      eventSource.onmessage = () => {
        fetchSupporters();
      };
    } catch (e) {
      console.warn('SSE connection error in overlay:', e);
    }

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [username, period]);


  if (loading && supporters.length === 0) {
    return (
      <div className="w-screen h-screen bg-transparent flex items-center justify-center p-4">
        {/* Transparent placeholder */}
      </div>
    );
  }

  // Theme Styles Configuration
  const themeConfig = {
    amber: {
      border: 'border-amber-500/60',
      shadow: 'shadow-[0_0_40px_rgba(245,158,11,0.35)]',
      badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
      accentText: 'text-amber-300',
      crownColor: 'text-amber-400 fill-amber-400',
      rank1Border: 'border-amber-400 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent',
      rank1Badge: 'bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-200 text-black shadow-lg shadow-amber-400/50'
    },
    cyan: {
      border: 'border-cyan-500/60',
      shadow: 'shadow-[0_0_40px_rgba(6,182,212,0.35)]',
      badgeBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
      accentText: 'text-cyan-300',
      crownColor: 'text-cyan-400 fill-cyan-400',
      rank1Border: 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent',
      rank1Badge: 'bg-gradient-to-tr from-cyan-400 via-cyan-300 to-blue-200 text-black shadow-lg shadow-cyan-400/50'
    },
    violet: {
      border: 'border-brand-500/60',
      shadow: 'shadow-[0_0_40px_rgba(139,92,246,0.35)]',
      badgeBg: 'bg-brand-500/20 border-brand-500/40 text-brand-300',
      accentText: 'text-brand-300',
      crownColor: 'text-brand-400 fill-brand-400',
      rank1Border: 'border-brand-400 bg-gradient-to-r from-brand-500/20 via-brand-500/10 to-transparent',
      rank1Badge: 'bg-gradient-to-tr from-brand-400 via-accent-fuchsia to-brand-300 text-white shadow-lg shadow-brand-500/50'
    },
    emerald: {
      border: 'border-emerald-500/60',
      shadow: 'shadow-[0_0_40px_rgba(16,185,129,0.35)]',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
      accentText: 'text-emerald-300',
      crownColor: 'text-emerald-400 fill-emerald-400',
      rank1Border: 'border-emerald-400 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent',
      rank1Badge: 'bg-gradient-to-tr from-emerald-400 via-emerald-300 to-teal-200 text-black shadow-lg shadow-emerald-400/50'
    },
    rose: {
      border: 'border-rose-500/60',
      shadow: 'shadow-[0_0_40px_rgba(244,63,94,0.35)]',
      badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
      accentText: 'text-rose-300',
      crownColor: 'text-rose-400 fill-rose-400',
      rank1Border: 'border-rose-400 bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-transparent',
      rank1Badge: 'bg-gradient-to-tr from-rose-500 via-rose-400 to-amber-300 text-white shadow-lg shadow-rose-500/50'
    }
  }[theme] || {
    border: 'border-amber-500/60',
    shadow: 'shadow-[0_0_40px_rgba(245,158,11,0.35)]',
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    accentText: 'text-amber-300',
    crownColor: 'text-amber-400 fill-amber-400',
    rank1Border: 'border-amber-400 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent',
    rank1Badge: 'bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-200 text-black shadow-lg shadow-amber-400/50'
  };

  const defaultPeriodLabel = {
    today: "Today's Top 3",
    week: "Weekly Top 3",
    month: "Monthly Top 3",
    all: "Top 3 Channel Supporters"
  }[period] || "Top 3 Channel Supporters";

  const displayTitle = customTitle || defaultPeriodLabel;

  const animClass = {
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    glow: 'animate-alert-neon',
    none: ''
  }[anim] || 'animate-pulse';

  if (layout === 'horizontal') {
    return (
      <div className="w-screen h-screen bg-transparent p-4 flex items-center justify-start pointer-events-none select-none overflow-hidden font-sans">
        <div className={`glass-panel bg-dark-card/95 border-2 ${themeConfig.border} ${themeConfig.shadow} rounded-2xl p-3 shadow-2xl flex items-center gap-4`}>
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <Crown className={`w-5 h-5 ${themeConfig.crownColor} ${animClass}`} />
            <span className={`text-xs font-black uppercase ${themeConfig.accentText} tracking-wider`}>
              {displayTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {supporters.slice(0, limit).map((s, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border ${
                  idx === 0
                    ? themeConfig.rank1Border
                    : idx === 1
                    ? 'bg-slate-300/10 border-slate-300/40 text-slate-200'
                    : 'bg-amber-700/10 border-amber-600/30 text-amber-300'
                }`}
              >
                <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ${
                  idx === 0 ? themeConfig.rank1Badge : idx === 1 ? 'bg-slate-300 text-black font-bold' : 'bg-amber-700 text-white font-bold'
                }`}>
                  #{s.rank}
                </span>
                <span className="text-xs font-bold text-white max-w-[110px] truncate">{s.name}</span>
                <span className="text-xs font-mono font-black text-accent-cyan">${Number(s.total).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default Vertical Top 3 Widget
  return (
    <div className="w-screen h-screen bg-transparent p-6 flex flex-col justify-start items-start pointer-events-none select-none overflow-hidden font-sans">
      <div className={`w-80 glass-panel bg-dark-card/95 border-2 ${themeConfig.border} ${themeConfig.shadow} rounded-3xl p-5 space-y-3.5 backdrop-blur-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${themeConfig.badgeBg} flex items-center justify-center shadow-inner`}>
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">{displayTitle}</h3>
              <p className="text-[10px] text-slate-400 font-mono">@{streamer?.slug || username}</p>
            </div>
          </div>
          <Crown className={`w-4 h-4 ${themeConfig.crownColor} ${animClass}`} />
        </div>

        {/* Top 3 Supporter Rows */}
        {supporters.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Waiting for supporters... 🚀</p>
        ) : (
          <div className="space-y-2.5">
            {supporters.slice(0, limit).map((s, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  idx === 0
                    ? themeConfig.rank1Border
                    : idx === 1
                    ? 'bg-slate-400/10 border-slate-300/40'
                    : 'bg-amber-800/10 border-amber-700/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    idx === 0
                      ? themeConfig.rank1Badge
                      : idx === 1
                      ? 'bg-gradient-to-tr from-slate-300 to-slate-100 text-black'
                      : 'bg-gradient-to-tr from-amber-700 to-amber-600 text-white'
                  }`}>
                    {idx === 0 ? <Crown className="w-4 h-4 fill-black" /> : `#${s.rank}`}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-white truncate block">{s.name}</span>
                    {showCount && (
                      <span className="text-[10px] text-slate-400">{s.donation_count || 1} donations</span>
                    )}
                  </div>
                </div>

                <span className="text-sm font-mono font-black text-accent-cyan ml-2 shrink-0">
                  ${Number(s.total).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Brand */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
          <span className="flex items-center gap-1 text-accent-emerald font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping"></span>
            LIVE PODIUM
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Zoee Donation
          </span>
        </div>
      </div>
    </div>
  );
}
