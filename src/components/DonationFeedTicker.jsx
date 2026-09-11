import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Heart, Sparkles, Flame, DollarSign } from 'lucide-react';

export default function DonationFeedTicker({ streamerSlug = null }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const url = streamerSlug ? `/donations/feed?streamerSlug=${streamerSlug}&limit=10` : '/donations/feed?limit=10';
      const res = await api.get(url);
      if (res.success && res.data) {
        setDonations(res.data);
      }
    } catch (err) {
      console.error('Ticker feed error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 8000); // Poll every 8s for live ticker
    return () => clearInterval(interval);
  }, [streamerSlug]);

  if (loading && donations.length === 0) {
    return (
      <div className="w-full bg-dark-card/60 border-y border-white/5 py-2 px-4 flex items-center justify-center text-xs text-slate-500 animate-pulse">
        Connecting to live donation stream...
      </div>
    );
  }

  if (donations.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-dark-surface via-dark-card to-dark-surface border-y border-white/10 py-2.5 overflow-hidden relative">
      <div className="flex items-center">
        <div className="flex items-center gap-2 pl-4 pr-3 border-r border-white/10 shrink-0 z-10 bg-dark-surface/90">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-accent-rose animate-bounce" /> Live Feed
          </span>
        </div>

        <div className="flex items-center gap-6 animate-[marquee_25s_linear_infinite] whitespace-nowrap px-4 hover:[animation-play-state:paused]">
          {donations.map((d, i) => (
            <div
              key={d.id || i}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs text-slate-200"
            >
              <Heart className="w-3 h-3 text-brand-400 fill-brand-400" />
              <span className="font-semibold text-white">{d.donorName}</span>
              <span className="text-accent-cyan font-mono font-bold">
                {d.currency === 'KHR' ? `${Number(d.amount).toLocaleString()} ៛` : `$${Number(d.amount).toFixed(2)}`}
              </span>
              {d.message && (
                <span className="text-slate-400 italic max-w-[200px] truncate">
                  "{d.message}"
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
