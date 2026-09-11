import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Heart,
  Target,
  Trophy,
  History,
  Share2,
  ExternalLink,
  ShieldCheck,
  Check,
  Radio,
  Sparkles
} from 'lucide-react';

export default function StreamerProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/streamers/${username}`)
      .then(res => {
        if (res.success) setData(res.data);
      })
      .catch(err => {
        setError(err.message || 'Failed to load streamer profile.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <span className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full mr-3"></span>
        Loading streamer profile...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-card rounded-3xl text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Streamer Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'This creator profile does not exist.'}</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold">
          Return to Home
        </Link>
      </div>
    );
  }

  const { streamer, activeGoal, recentDonations, topSupporters } = data;
  const goalPercent = activeGoal
    ? Math.min(100, Math.round((activeGoal.current_amount / activeGoal.target_amount) * 100))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner & Profile Header */}
      <div className="glass-card rounded-3xl overflow-hidden border border-brand-500/20 shadow-2xl">
        <div className="relative h-48 sm:h-72 w-full bg-slate-800">
          <img
            src={streamer.profile?.banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-90" />
        </div>

        <div className="p-6 sm:p-8 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <img
              src={streamer.profile?.avatar_url || '/zoee-avatar.png'}
              alt={streamer.slug}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-dark-card shadow-2xl bg-dark-surface"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-black text-white">{streamer.profile?.display_name || streamer.slug}</h1>
                <span className="p-1 rounded-full bg-accent-cyan/20 text-accent-cyan" title="Verified Streamer">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono">@{streamer.slug}</p>
              <p className="text-sm text-slate-300 max-w-xl pt-2">{streamer.profile?.bio || 'Support my channel with live donations!'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="p-3.5 rounded-2xl glass-panel hover:bg-white/10 text-slate-300 transition-colors"
              title="Share profile link"
            >
              {copied ? <Check className="w-5 h-5 text-accent-emerald" /> : <Share2 className="w-5 h-5" />}
            </button>
            <Link
              to={`/donate/${streamer.slug}`}
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-brand-600 via-accent-fuchsia to-accent-cyan hover:brightness-110 shadow-xl shadow-brand-500/25 transition-all text-center flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5 fill-white animate-pulse" />
              Donate Now
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Goals, Supporters, Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Goal & Recent Donations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Goal */}
          {activeGoal && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 bg-dark-card/90 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{activeGoal.title}</h3>
                    <p className="text-xs text-slate-400">{activeGoal.description}</p>
                  </div>
                </div>
                <span className="text-xl font-mono font-black text-accent-cyan">{goalPercent}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-dark-surface rounded-full h-4 overflow-hidden border border-white/10 p-0.5">
                <div
                  className="bg-gradient-to-r from-brand-500 via-accent-cyan to-accent-emerald h-full rounded-full transition-all duration-1000 shadow-lg shadow-cyan-500/40"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">
                  Raised: <strong className="text-white font-bold">${Number(activeGoal.current_amount).toFixed(2)}</strong>
                </span>
                <span className="text-slate-400">
                  Goal: <strong className="text-slate-200">${Number(activeGoal.target_amount).toFixed(2)}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Recent Donations */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-brand-400" />
              Recent Support Feed
            </h3>

            {recentDonations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Be the first to donate to {streamer.profile?.display_name || streamer.slug}! 🚀</p>
            ) : (
              <div className="space-y-3">
                {recentDonations.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-dark-surface/60 border border-white/5 hover:border-brand-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                        <Heart className="w-4 h-4 fill-brand-400/40" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{d.anonymous ? 'Anonymous' : d.donor_name}</p>
                        {d.message && <p className="text-xs text-slate-300 italic mt-0.5">"{d.message}"</p>}
                      </div>
                    </div>
                    <span className="text-sm font-mono font-bold text-accent-cyan">
                      {d.currency === 'KHR' ? `${Number(d.amount).toLocaleString()} ៛` : `$${Number(d.amount).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Top Supporters & Quick Donate CTA */}
        <div className="space-y-6">
          {/* Quick Donate Box */}
          <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 bg-gradient-to-b from-brand-950/40 to-dark-card text-center space-y-4">
            <Sparkles className="w-8 h-8 text-brand-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Support Stream Broadcast</h4>
            <p className="text-xs text-slate-400">Instant ABA KHQR scan with live soundboard alerts!</p>
            <Link
              to={`/donate/${streamer.slug}`}
              className="w-full block py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-brand-600 to-accent-fuchsia hover:brightness-110 shadow-lg shadow-brand-500/25 transition-all"
            >
              Send Donation
            </Link>
          </div>

          {/* Top Supporters */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Top Channel Supporters
              </h4>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/overlay/supporters/${streamer.slug}`;
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 transition-colors"
                title="Copy transparent leaderboard overlay URL for OBS Studio"
              >
                {copied ? <Check className="w-3 h-3 text-accent-emerald" /> : <Sparkles className="w-3 h-3" />}
                {copied ? 'Copied' : 'OBS Widget'}
              </button>
            </div>

            {topSupporters.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No top supporters yet.</p>
            ) : (
              <div className="space-y-2.5">
                {topSupporters.map((supporter, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-dark-surface/50 border border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-black w-5 h-5 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-amber-400 text-black' : 'bg-white/10 text-slate-300'}`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{supporter.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-accent-cyan">
                      ${Number(supporter.total).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
