import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Target, Sparkles, Trophy, Crown } from 'lucide-react';

export default function OBSGoal() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();

  // URL customization parameters
  const rawTheme = searchParams.get('theme') || 'violet';
  const rawLayout = searchParams.get('layout') || 'card'; // 'card' | 'bar' | 'compact'
  const customTitle = searchParams.get('title');

  const [activeGoal, setActiveGoal] = useState(null);
  const [streamer, setStreamer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set 100% transparent body & html for OBS Studio
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

  const fetchGoal = async () => {
    try {
      const res = await api.get(`/streamers/${username || 'dara_gaming'}`);
      if (res.success && res.data) {
        setStreamer(res.data.streamer);
        if (res.data.activeGoal) {
          setActiveGoal(res.data.activeGoal);
        } else {
          // Fallback demo active goal
          setActiveGoal({
            title: 'Stream Upgrade & Setup Goal 🎙️✨',
            current_amount: res.data.streamer?.total_received || 345.00,
            target_amount: 1000.00
          });
        }
      }
    } catch (err) {
      console.error('Failed to load OBS goal:', err);
      // Fallback
      setActiveGoal({
        title: 'Stream Upgrade & Setup Goal 🎙️✨',
        current_amount: 345.00,
        target_amount: 1000.00
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
    const interval = setInterval(fetchGoal, 5000); // Live sync every 5s
    return () => clearInterval(interval);
  }, [username]);

  // Determine Theme Palette
  const getThemeStyles = () => {
    const t = rawTheme.toLowerCase();
    if (t.includes('amber') || t.includes('gold') || t.includes('imperial')) {
      return {
        cardBg: 'bg-[#18150c]/95',
        border: 'border-amber-400/80',
        shadow: 'shadow-[0_0_35px_rgba(245,158,11,0.4)]',
        bar: 'from-amber-500 via-amber-400 to-yellow-200',
        text: 'text-amber-300',
        badge: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
        accentIcon: 'text-amber-400'
      };
    }
    if (t.includes('cyan') || t.includes('neon') || t.includes('holo')) {
      return {
        cardBg: 'bg-[#0b1524]/95',
        border: 'border-cyan-400/80',
        shadow: 'shadow-[0_0_35px_rgba(6,182,212,0.4)]',
        bar: 'from-cyan-500 via-cyan-400 to-teal-200',
        text: 'text-cyan-300',
        badge: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
        accentIcon: 'text-cyan-400'
      };
    }
    if (t.includes('emerald') || t.includes('matrix') || t.includes('green')) {
      return {
        cardBg: 'bg-[#081810]/95',
        border: 'border-emerald-400/80',
        shadow: 'shadow-[0_0_35px_rgba(16,185,129,0.4)]',
        bar: 'from-emerald-500 via-emerald-400 to-lime-200',
        text: 'text-emerald-300',
        badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
        accentIcon: 'text-emerald-400'
      };
    }
    if (t.includes('rose') || t.includes('pink') || t.includes('ruby')) {
      return {
        cardBg: 'bg-[#210c14]/95',
        border: 'border-rose-400/80',
        shadow: 'shadow-[0_0_35px_rgba(244,63,94,0.4)]',
        bar: 'from-rose-500 via-rose-400 to-amber-300',
        text: 'text-rose-300',
        badge: 'bg-rose-400/20 text-rose-300 border-rose-400/40',
        accentIcon: 'text-rose-400'
      };
    }
    // Default: Zoee Cyber Violet
    return {
      cardBg: 'bg-[#121424]/95',
      border: 'border-brand-500/80',
      shadow: 'shadow-[0_0_35px_rgba(139,92,246,0.45)]',
      bar: 'from-brand-600 via-accent-fuchsia to-accent-cyan',
      text: 'text-brand-300',
      badge: 'bg-brand-500/20 text-brand-300 border-brand-500/40',
      accentIcon: 'text-brand-400'
    };
  };

  const themeStyles = getThemeStyles();
  const current = Number(activeGoal?.current_amount || 0);
  const target = Number(activeGoal?.target_amount || 1000);
  const percent = Math.min(100, Math.round((current / target) * 100));

  if (loading && !activeGoal) {
    return <div className="w-screen h-screen bg-transparent p-4"></div>;
  }

  return (
    <div className="w-screen h-screen bg-transparent p-4 flex items-start justify-start pointer-events-none select-none overflow-hidden font-sans">
      {rawLayout === 'bar' ? (
        /* Horizontal Stream Ticker Bar */
        <div className={`w-full max-w-2xl glass-panel ${themeStyles.cardBg} border-2 ${themeStyles.border} ${themeStyles.shadow} rounded-2xl p-3 px-4 flex items-center justify-between gap-4 backdrop-blur-xl`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${themeStyles.badge}`}>
              <Target className={`w-4 h-4 ${themeStyles.accentIcon} animate-pulse`} />
            </div>
            <div className="truncate">
              <span className="text-xs font-black text-white truncate block">
                {customTitle || activeGoal?.title || 'Stream Goal'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">@{streamer?.slug || username}</span>
            </div>
          </div>

          <div className="flex-1 max-w-xs space-y-1">
            <div className="relative w-full h-3.5 bg-dark-surface rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${themeStyles.bar} transition-all duration-700 ease-out relative`}
                style={{ width: `${percent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-black text-accent-cyan">${current.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-mono block">/ ${target.toFixed(2)} ({percent}%)</span>
          </div>
        </div>
      ) : (
        /* Vertical Deluxe Card Widget (Default) */
        <div className={`w-full max-w-md glass-panel ${themeStyles.cardBg} border-2 ${themeStyles.border} ${themeStyles.shadow} rounded-3xl p-5 space-y-3.5 backdrop-blur-2xl`}>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${themeStyles.badge}`}>
                <Target className={`w-4 h-4 ${themeStyles.accentIcon} animate-pulse`} />
              </div>
              <div className="truncate">
                <h3 className="text-sm font-black text-white truncate leading-tight">
                  {customTitle || activeGoal?.title || 'Donation Target Goal'}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">@{streamer?.slug || username}</p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border shrink-0 ${themeStyles.badge}`}>
              {percent}%
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative w-full h-4 bg-[#090a0f] rounded-full overflow-hidden border border-white/15 p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${themeStyles.bar} transition-all duration-700 ease-out relative`}
              style={{ width: `${percent}%` }}
            >
              {/* Shimmer light sweep */}
              <div className="absolute inset-0 bg-white/25 animate-shimmer" />
            </div>
          </div>

          {/* Amounts & Status Footer */}
          <div className="flex items-center justify-between text-xs font-mono pt-0.5">
            <span className="text-slate-300 font-bold">
              Raised: <strong className="text-accent-cyan font-black">${current.toFixed(2)}</strong>
            </span>
            <span className="text-slate-400">
              Target: <strong className="text-slate-200 font-black">${target.toFixed(2)}</strong>
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span className="text-accent-emerald font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping"></span>
              ● LIVE GOAL
            </span>
            <span>Zoee Donation Platform</span>
          </div>
        </div>
      )}
    </div>
  );
}
