import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Radio, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function BecomeStreamer() {
  const { user, isStreamer, refreshSession } = useAuth();
  const navigate = useNavigate();

  const [slug, setSlug] = useState(user?.username || '');
  const [minAmount, setMinAmount] = useState('1.00');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/streamers/profile', {
        slug: slug.toLowerCase().trim(),
        min_donation_amount: parseFloat(minAmount),
        currency
      });

      if (res.success) {
        await refreshSession();
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to create streamer profile.');
    } finally {
      setLoading(false);
    }
  };

  if (isStreamer) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-card rounded-3xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-accent-emerald/20 border border-accent-emerald flex items-center justify-center text-accent-emerald mx-auto">
          <Check className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">You are already a registered streamer!</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold shadow-lg"
        >
          Go to Streamer Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 mx-auto">
          <Radio className="w-7 h-7 animate-pulse" />
        </div>
        <h1 className="text-3xl font-black text-white">Start Receiving Stream Donations</h1>
        <p className="text-sm text-slate-400">Set up your public donation URL and OBS alert link in under 1 minute</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-sm text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-brand-500/25 bg-dark-card space-y-6 shadow-2xl">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Streamer Slug / Public Link
          </label>
          <div className="flex rounded-2xl overflow-hidden border border-dark-border bg-dark-surface focus-within:border-brand-500">
            <span className="px-4 py-3 bg-white/5 text-slate-400 text-sm font-mono flex items-center">
              zoee.me/tip/
            </span>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="your_channel_name"
              className="w-full px-4 py-3 bg-transparent text-sm text-white font-mono placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Min. Donation ($)
            </label>
            <input
              type="number"
              min="0.10"
              step="0.10"
              required
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-dark-surface border border-dark-border focus:border-brand-500 text-sm text-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Primary Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-dark-surface border border-dark-border focus:border-brand-500 text-sm text-white"
            >
              <option value="USD">USD ($)</option>
              <option value="KHR">KHR (៛)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-brand-600 via-accent-fuchsia to-accent-cyan hover:brightness-110 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Create Streamer Profile & Get OBS URL
            </>
          )}
        </button>
      </form>
    </div>
  );
}
