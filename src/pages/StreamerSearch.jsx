import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Users, Heart, ArrowRight, Zap, Copy, Check, Sparkles } from 'lucide-react';

export default function StreamerSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isTipRoute = location.pathname === '/tip';

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [streamers, setStreamers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const handleCopyTip = (slug) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    navigator.clipboard.writeText(`${origin}/tip/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const fetchStreamers = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/streamers/search?q=${encodeURIComponent(q)}`);
      if (res.success) {
        setStreamers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreamers(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = query.trim().replace(/^@/, '');
    setSearchParams(clean ? { q: clean } : {});
    fetchStreamers(clean);
  };

  const handleDirectTip = (e) => {
    e.preventDefault();
    const clean = query.trim().replace(/^@/, '');
    if (clean) {
      navigate(`/tip/${clean}`);
    } else {
      fetchStreamers('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          {isTipRoute ? 'Official Tip Link Directory' : 'Live Streamer Directory'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
          {isTipRoute ? (
            <>
              <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
              <span>Send a Tip to a Creator</span>
            </>
          ) : (
            <>
              <Search className="w-8 h-8 text-brand-400" />
              <span>Explore Creators</span>
            </>
          )}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {isTipRoute
            ? 'Enter a creator username or select from active streamers to open their official Tip Link and donate.'
            : 'Find your favorite streamers and support their channel with instant alerts and voice TTS.'}
        </p>
      </div>

      <form onSubmit={isTipRoute ? handleDirectTip : handleSearch} className="max-w-2xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search creator by @username, slug, or display name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-dark-card border border-dark-border focus:border-brand-500 text-sm text-white placeholder-slate-500 shadow-xl font-medium"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSearch}
            className="px-5 py-3 rounded-2xl font-bold text-xs text-slate-200 bg-white/10 hover:bg-white/15 transition-all border border-white/10"
          >
            Search
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-accent-fuchsia hover:brightness-110 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Go to Tip Link</span>
          </button>
        </div>
      </form>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-3">
          <span className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full"></span>
          Searching creators...
        </div>
      ) : streamers.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-3xl p-8 border border-white/5 space-y-3">
          <Users className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No creators found</h3>
          <p className="text-sm text-slate-400">Try searching with a different username or slug.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {streamers.map((s) => (
            <div
              key={s.id}
              className="glass-card rounded-2xl overflow-hidden border border-brand-500/20 hover:border-brand-500/50 transition-all group flex flex-col justify-between"
            >
              <div className="relative h-28 bg-slate-800">
                <img
                  src={s.profile?.banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'}
                  alt={s.slug}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <img
                  src={s.profile?.avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150'}
                  alt={s.slug}
                  className="absolute -bottom-4 left-6 w-12 h-12 rounded-xl object-cover border-2 border-brand-500 shadow-xl"
                />
              </div>

              <div className="p-6 pt-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                    {s.profile?.display_name || s.slug}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">@{s.slug}</p>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {s.profile?.bio || 'Full-time live streamer on Zoee Donation.'}
                  </p>
                </div>

                {/* Tip Link Bar */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-300">
                  <span className="truncate text-slate-400">/tip/{s.slug}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyTip(s.slug)}
                    className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 shrink-0 ml-2"
                  >
                    {copiedSlug === s.slug ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-accent-cyan">
                    ${Number(s.total_received || 0).toFixed(2)} raised
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/tip/${s.slug}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Send Tip</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
