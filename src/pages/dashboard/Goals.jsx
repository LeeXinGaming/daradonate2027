import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Target, Plus, Check, Edit2, AlertCircle, Copy, ExternalLink, Sparkles, Sliders } from 'lucide-react';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [streamerSlug, setStreamerSlug] = useState('');
  const [theme, setTheme] = useState('violet');

  // New goal form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchGoals = async () => {
    try {
      const [goalsRes, profileRes] = await Promise.all([
        api.get('/streamers/dashboard/goals'),
        api.get('/streamers/dashboard/profile').catch(() => null)
      ]);
      if (goalsRes.success) setGoals(goalsRes.data);
      if (profileRes?.success && profileRes?.data?.slug) {
        setStreamerSlug(profileRes.data.slug);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/streamers/dashboard/goals', {
        title,
        description,
        target_amount: parseFloat(targetAmount)
      });

      if (res.success) {
        setTitle('');
        setDescription('');
        setTargetAmount('');
        setShowModal(false);
        fetchGoals();
      }
    } catch (err) {
      setError(err.message || 'Failed to create goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGoalStatus = async (goalId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    try {
      await api.put(`/streamers/dashboard/goals/${goalId}`, { status: nextStatus });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const goalWidgetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/overlay/goal/${streamerSlug || 'dara_gaming'}?theme=${theme}`
    : `/overlay/goal/${streamerSlug || 'dara_gaming'}?theme=${theme}`;

  const copyWidgetUrl = () => {
    navigator.clipboard.writeText(goalWidgetUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-accent-cyan" />
            Donation Targets & Goals
          </h2>
          <p className="text-xs text-slate-400">Set community milestone targets for streaming hardware, travel, or tournaments</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Goal
        </button>
      </div>

      {/* OBS Goal Overlay Link Box */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-dark-card space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-accent-cyan flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">OBS Donation Goal Bar Widget URL</h3>
              <p className="text-xs text-slate-400">Add directly as an OBS Studio Browser Source (100% Transparent Background)</p>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-dark-surface border border-white/10 text-xs text-slate-200 font-semibold focus:border-accent-cyan"
            >
              <option value="violet">💜 Zoee Violet</option>
              <option value="amber">🏆 Gold Amber</option>
              <option value="cyan">⚡ Neon Cyan</option>
              <option value="emerald">🟢 Matrix Emerald</option>
              <option value="rose">🔥 Ruby Rose</option>
            </select>
          </div>
        </div>

        <div className="flex rounded-2xl overflow-hidden border border-cyan-500/40 bg-dark-surface p-1.5 shadow-inner">
          <input
            type="text"
            readOnly
            value={goalWidgetUrl}
            className="w-full px-3 py-2 bg-transparent text-xs text-cyan-200 font-mono focus:outline-none select-all"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={copyWidgetUrl}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              {copiedUrl ? 'Copied!' : 'Copy Goal URL'}
            </button>
            <a
              href={goalWidgetUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Preview in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 font-mono">
          OBS Studio Settings: Width: <strong>600</strong>, Height: <strong>140</strong> (Transparent)
        </p>
      </div>

      {/* Goals List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-white/5 text-center space-y-3">
          <Target className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Donation Goals Configured</h3>
          <p className="text-xs text-slate-400">Create a goal to motivate your viewers to support your stream.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((g) => {
            const percent = Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100));
            return (
              <div key={g.id} className="glass-panel p-6 rounded-3xl border border-brand-500/20 bg-dark-card space-y-4 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{g.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        g.status === 'ACTIVE' ? 'bg-accent-emerald/20 text-accent-emerald border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {g.status}
                      </span>
                    </div>
                    {g.description && <p className="text-xs text-slate-400 mt-1">{g.description}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleGoalStatus(g.id, g.status)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    >
                      {g.status === 'ACTIVE' ? 'Pause / Archive' : 'Activate'}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-dark-surface rounded-full h-4 overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="bg-gradient-to-r from-brand-500 via-accent-cyan to-accent-emerald h-full rounded-full transition-all duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">
                    Raised: <strong className="text-accent-cyan font-bold">${Number(g.current_amount).toFixed(2)}</strong>
                  </span>
                  <span className="text-white font-bold">{percent}%</span>
                  <span className="text-slate-400">
                    Target: <strong className="text-slate-200">${Number(g.target_amount).toFixed(2)}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl bg-dark-card border border-brand-500/30 space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Donation Goal</h3>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Shure SM7B Mic 🎙️"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-sm text-white focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Details for your audience..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 px-4 py-2 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase">Target Amount ($ USD)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="500.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-sm text-white font-mono focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-lg"
                >
                  {submitting ? 'Creating...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
