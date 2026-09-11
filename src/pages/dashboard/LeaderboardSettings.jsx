import React, { useState, useEffect, useRef } from 'react';
import api, { getApiUrl } from '../../services/api';
import {
  Trophy,
  Crown,
  Sparkles,
  Sliders,
  Eye,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Save,
  AlertCircle,
  HelpCircle,
  Palette,
  Type,
  Layout,
  Clock,
  Layers,
  Shield,
  Zap,
  Flame,
  Radio,
  User,
  Heart
} from 'lucide-react';

const THEMES = [
  { id: 'Glow Neon (Default)', name: 'Glow Neon (Default)', bg: 'bg-[#121420]', border: 'border-brand-500/60', text: 'text-brand-300', accent: '#8b5cf6', badge: 'bg-brand-500/20 text-brand-300' },
  { id: 'Deep Space Galaxy (Cosmic Stardust Animation 🌌)', name: 'Deep Space Galaxy 🌌', bg: 'bg-[#0b0c16]', border: 'border-indigo-500/60', text: 'text-indigo-300', accent: '#6366f1', badge: 'bg-indigo-500/20 text-indigo-300' },
  { id: 'Imperial Golden Sheen (3D Gold Sheen ✨)', name: 'Imperial Golden Sheen ✨', bg: 'bg-[#18150c]', border: 'border-amber-400/80', text: 'text-amber-300', accent: '#f59e0b', badge: 'bg-amber-400/20 text-amber-300' },
  { id: 'Matrix Cyber Glitch (Electric Pulse Beam 🖥️)', name: 'Matrix Cyber Glitch 🖥️', bg: 'bg-[#08150e]', border: 'border-emerald-400/80', text: 'text-emerald-300', accent: '#10b981', badge: 'bg-emerald-400/20 text-emerald-300' },
  { id: 'Cyberpunk (Angular)', name: 'Cyberpunk (Angular)', bg: 'bg-[#160c18]', border: 'border-fuchsia-500/80', text: 'text-fuchsia-300', accent: '#d946ef', badge: 'bg-fuchsia-500/20 text-fuchsia-300' },
  { id: 'Minimalist (Sleek)', name: 'Minimalist (Sleek)', bg: 'bg-[#16181f]', border: 'border-slate-500/40', text: 'text-slate-200', accent: '#94a3b8', badge: 'bg-slate-700/50 text-slate-200' },
  { id: 'Sweet Pink (For Girls) 🌸', name: 'Sweet Pink (For Girls) 🌸', bg: 'bg-[#1f0f18]', border: 'border-pink-400/70', text: 'text-pink-300', accent: '#f472b6', badge: 'bg-pink-500/20 text-pink-300' },
  { id: 'Princess Rose 🌸', name: 'Princess Rose 🌸', bg: 'bg-[#210c14]', border: 'border-rose-400/70', text: 'text-rose-300', accent: '#fb7185', badge: 'bg-rose-500/20 text-rose-300' },
  { id: 'Royal Luxury 👑', name: 'Royal Luxury 👑', bg: 'bg-[#1a1208]', border: 'border-yellow-500/80', text: 'text-yellow-300', accent: '#eab308', badge: 'bg-yellow-500/20 text-yellow-300' },
  { id: 'Frosted Glassmorphism ✨', name: 'Frosted Glassmorphism ✨', bg: 'bg-white/10 backdrop-blur-xl', border: 'border-white/30', text: 'text-white', accent: '#38bdf8', badge: 'bg-white/20 text-white' },
  { id: 'Holographic Glass 💎', name: 'Holographic Glass 💎', bg: 'bg-[#0f172a]/90', border: 'border-cyan-400/80', text: 'text-cyan-300', accent: '#06b6d4', badge: 'bg-cyan-500/20 text-cyan-300' },
  { id: 'Neo-Brutalist Pop ⚡', name: 'Neo-Brutalist Pop ⚡', bg: 'bg-[#111111]', border: 'border-yellow-400 border-2', text: 'text-yellow-300', accent: '#facc15', badge: 'bg-yellow-400 text-black font-black' },
  { id: 'Tropical Beach & Lifebuoy 🏖️🌴', name: 'Tropical Beach 🏖️🌴', bg: 'bg-[#081a24]', border: 'border-teal-400/80', text: 'text-teal-300', accent: '#14b8a6', badge: 'bg-teal-500/20 text-teal-300' },
  { id: 'Dark Minimalist Luxe ✨', name: 'Dark Minimalist Luxe ✨', bg: 'bg-[#0f1015]', border: 'border-zinc-700', text: 'text-zinc-200', accent: '#a1a1aa', badge: 'bg-zinc-800 text-zinc-300' },
  { id: 'Hyper-Futuristic Cyber 🚀', name: 'Hyper-Futuristic Cyber 🚀', bg: 'bg-[#090e1f]', border: 'border-blue-400/80', text: 'text-blue-300', accent: '#3b82f6', badge: 'bg-blue-500/20 text-blue-300' },
  { id: 'Dark Neon Magic 🔮', name: 'Dark Neon Magic 🔮', bg: 'bg-[#13091f]', border: 'border-purple-400/80', text: 'text-purple-300', accent: '#a855f7', badge: 'bg-purple-500/20 text-purple-300' },
  { id: 'Sunset Violet 🌅', name: 'Sunset Violet 🌅', bg: 'bg-[#1a0f1e]', border: 'border-orange-400/80', text: 'text-orange-300', accent: '#f97316', badge: 'bg-orange-500/20 text-orange-300' },
  { id: 'Emerald Forest 💚', name: 'Emerald Forest 💚', bg: 'bg-[#081711]', border: 'border-emerald-500/80', text: 'text-emerald-300', accent: '#10b981', badge: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'Glacial Frost ❄️', name: 'Glacial Frost ❄️', bg: 'bg-[#0a1520]', border: 'border-sky-300/80', text: 'text-sky-200', accent: '#7dd3fc', badge: 'bg-sky-500/20 text-sky-200' },
  { id: 'Chroma RGB Wave 🌈', name: 'Chroma RGB Wave 🌈', bg: 'bg-[#101018]', border: 'border-gradient', text: 'text-white', accent: '#ec4899', badge: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white' }
];

const FONTS = [
  { id: 'Outfit (Recommended)', name: 'Outfit (Recommended)', family: 'Outfit, sans-serif' },
  { id: 'Inter (Sleek)', name: 'Inter (Sleek)', family: 'Inter, sans-serif' },
  { id: 'Kantumruy Pro (Khmer)', name: 'Kantumruy Pro (Khmer)', family: 'Kantumruy Pro, sans-serif' },
  { id: 'Orbitron (Digital)', name: 'Orbitron (Digital)', family: 'Orbitron, sans-serif' },
  { id: 'Poppins', name: 'Poppins', family: 'Poppins, sans-serif' },
  { id: 'Roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
  { id: 'Noto Sans Khmer', name: 'Noto Sans Khmer', family: 'Noto Sans Khmer, sans-serif' }
];

export default function LeaderboardSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [streamerSlug, setStreamerSlug] = useState('dara_gaming');
  const [activeTab, setActiveTab] = useState('general');

  // Real supporters for live preview
  const [previewSupporters, setPreviewSupporters] = useState([]);
  const [leaderboardStats, setLeaderboardStats] = useState({
    totalAmount: 0,
    totalCount: 0,
    uniqueDonors: 0
  });

  // All 25 Leaderboard Settings
  const [settings, setSettings] = useState({
    enabled: true,
    title: 'Top Supporters',
    description: 'Thank you to everyone supporting the stream! ❤️',
    ranking_type: 'Total Donations',
    time_period: 'All Time',
    max_entries: 10,
    show_rank: true,
    show_avatar: true,
    show_username: true,
    show_amount: true,
    show_donation_count: true,
    anonymous_mode: 'Show Anonymous',
    currency: 'USD ($)',
    number_format: '1,000.00',
    layout: 'Card',
    theme: 'Glow Neon (Default)',
    font: 'Outfit (Recommended)',
    font_size: 'Medium',
    highlight_top3: true,
    top3_style: 'Gold / Silver / Bronze',
    animation_enabled: true,
    animation_style: 'Glow',
    refresh_interval: '5 seconds',
    empty_message: 'No donations yet. Be the first supporter!'
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const loadLeaderboardData = async (slug) => {
    if (!slug) return;
    try {
      const leadRes = await api.get(`/leaderboard/${slug}?period=all`).catch(() => null);
      if (leadRes?.success && leadRes.data) {
        if (Array.isArray(leadRes.data.rankings)) {
          setPreviewSupporters(leadRes.data.rankings.map((r, i) => ({
            rank: r.rank || i + 1,
            name: r.donor_name || 'Anonymous',
            total: Number(r.total_amount || 0),
            count: r.donation_count || 1,
            avatar: r.avatar_url || null
          })));
        }
        if (leadRes.data.stats) {
          setLeaderboardStats({
            totalAmount: Number(leadRes.data.stats.totalAmount || 0),
            totalCount: Number(leadRes.data.stats.totalCount || 0),
            uniqueDonors: Number(leadRes.data.stats.uniqueDonors || 0)
          });
        }
      }
    } catch (err) {
      console.warn('Leaderboard refresh error:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [setRes, profRes] = await Promise.all([
        api.get('/leaderboard/settings').catch(() => null),
        api.get('/streamers/dashboard/profile').catch(() => null)
      ]);

      let slug = 'dara_gaming';
      if (profRes?.success && profRes.data?.slug) {
        slug = profRes.data.slug;
        setStreamerSlug(slug);
      }

      if (setRes?.success && setRes.data) {
        setSettings(prev => ({ ...prev, ...setRes.data }));
      }

      await loadLeaderboardData(slug);
    } catch (err) {
      console.error('Failed to load leaderboard settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Real-time SSE listener + resilient 5s interval polling
  useEffect(() => {
    if (!streamerSlug) return;

    let eventSource = null;
    try {
      eventSource = new EventSource(getApiUrl(`/leaderboard/stream/${streamerSlug}`));
      eventSource.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          if (payload.type === 'LEADERBOARD_UPDATE' || payload.type === 'NEW_DONATION') {
            loadLeaderboardData(streamerSlug);
          }
        } catch {
          loadLeaderboardData(streamerSlug);
        }
      };
    } catch (e) {
      console.warn('Leaderboard SSE connect warning:', e);
    }

    const interval = setInterval(() => {
      loadLeaderboardData(streamerSlug);
    }, 5000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [streamerSlug]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const res = await api.put('/leaderboard/settings', settings);
      if (res.success) {
        setSettings(res.data);
        showToast('Leaderboard settings saved successfully.', 'success');
      } else {
        showToast(res.message || 'Failed to save settings.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save leaderboard settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all leaderboard settings back to default?')) return;
    try {
      setSaving(true);
      const res = await api.post('/leaderboard/settings/reset', {});
      if (res.success) {
        setSettings(res.data);
        showToast('Leaderboard settings reset to defaults.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to reset settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Format currency display
  const formatAmount = (val) => {
    const num = Number(val || 0);
    const currSym = settings.currency.includes('KHR') ? '៛' : settings.currency.includes('THB') ? '฿' : settings.currency.includes('VND') ? '₫' : '$';

    if (settings.number_format === '1K' && num >= 1000) {
      return `${currSym}${(num / 1000).toFixed(1)}K`;
    }
    if (settings.number_format === '1.5K' && num >= 1000) {
      return `${currSym}${(num / 1000).toFixed(1)}K`;
    }
    if (settings.number_format === '1M' && num >= 1000000) {
      return `${currSym}${(num / 1000000).toFixed(1)}M`;
    }
    if (settings.number_format === '1,000') {
      return `${currSym}${Math.round(num).toLocaleString()}`;
    }
    return `${currSym}${num.toFixed(2)}`;
  };

  const activeThemeObj = THEMES.find(t => t.id === settings.theme) || THEMES[0];
  const activeFontObj = FONTS.find(f => f.id === settings.font) || FONTS[0];

  // Dynamic public Leaderboard Avatar page URL
  const publicLeaderboardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/leaderboard-avatar/${streamerSlug}`
    : `https://zoeedonate.com/leaderboard-avatar/${streamerSlug}`;

  // Dynamic parameterized OBS Overlay URL
  const obsLeaderboardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/overlay/supporters/${streamerSlug}?theme=${encodeURIComponent(settings.theme.toLowerCase().includes('amber') ? 'amber' : settings.theme.toLowerCase().includes('cyan') ? 'cyan' : settings.theme.toLowerCase().includes('emerald') ? 'emerald' : settings.theme.toLowerCase().includes('rose') ? 'rose' : 'violet')}&layout=${settings.layout.toLowerCase() === 'card' ? 'vertical' : 'horizontal'}`
    : `/overlay/supporters/${streamerSlug}`;

  const copyObsUrl = () => {
    navigator.clipboard.writeText(obsLeaderboardUrl);
    setCopiedUrl('obs');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyPublicLeaderboardUrl = () => {
    navigator.clipboard.writeText(publicLeaderboardUrl);
    setCopiedUrl('public');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold transition-all animate-in slide-in-from-bottom-5 ${
          toast.type === 'error' ? 'bg-red-500/90 text-white border border-red-400' : 'bg-brand-600/95 text-white border border-brand-400 shadow-brand-500/30'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-[#292D35] p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Leaderboard Settings</h2>
              <p className="text-xs text-slate-400">Configure ranking styles, themes, fonts, top-3 spotlights, and live OBS widgets</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={copyPublicLeaderboardUrl}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all shadow-md"
          >
            {copiedUrl === 'public' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedUrl === 'public' ? 'Copied Public Page!' : 'Copy Public Leaderboard'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-[#3A3E47] hover:bg-[#454A55] text-xs font-bold text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-lg shadow-brand-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Prominent Public & OBS Links Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1: Public Leaderboard Avatar Page */}
        <div className="bg-gradient-to-r from-amber-500/15 via-[#292D35] to-brand-500/15 p-4 sm:p-5 rounded-2xl border border-amber-500/30 shadow-xl flex flex-col justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40 shrink-0">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase">Public Leaderboard Page</h3>
              <p className="text-xs text-amber-300 font-mono mt-0.5 break-all line-clamp-1">{publicLeaderboardUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={copyPublicLeaderboardUrl}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black flex items-center justify-center gap-1.5 transition-all shadow-md font-mono"
            >
              {copiedUrl === 'public' ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUrl === 'public' ? 'Copied Link!' : 'Copy Public Link'}
            </button>
            <a
              href={publicLeaderboardUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
              title="Open Public Leaderboard"
            >
              <ExternalLink className="w-3.5 h-3.5 text-accent-cyan" />
            </a>
          </div>
        </div>

        {/* Banner 2: OBS Browser Source Link */}
        <div className="bg-gradient-to-r from-brand-500/15 via-[#292D35] to-accent-cyan/15 p-4 sm:p-5 rounded-2xl border border-brand-500/30 shadow-xl flex flex-col justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/40 shrink-0">
              <Radio className="w-4 h-4 animate-pulse text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase">OBS Transparent Browser Source</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5 break-all line-clamp-1">{obsLeaderboardUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={copyObsUrl}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-fuchsia hover:brightness-110 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md font-mono"
            >
              {copiedUrl === 'obs' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUrl === 'obs' ? 'Copied OBS Link!' : 'Copy OBS Overlay'}
            </button>
            <a
              href={obsLeaderboardUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
              title="Preview OBS Overlay"
            >
              <ExternalLink className="w-3.5 h-3.5 text-accent-cyan" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: All Settings Grouped (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#292D35] rounded-2xl border border-white/10 overflow-x-auto scrollbar-none">
            {[
              { id: 'general', label: 'General', icon: Sliders },
              { id: 'ranking', label: 'Ranking & Data', icon: Trophy },
              { id: 'display', label: 'Display Toggles', icon: Eye },
              { id: 'appearance', label: 'Appearance & Themes', icon: Palette },
              { id: 'animation', label: 'Animation & Sync', icon: Zap },
              { id: 'widget', label: 'OBS Studio Widget', icon: Radio }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Section 1: General Settings */}
          {activeTab === 'general' && (
            <div className="bg-[#292D35] p-6 rounded-2xl border border-white/10 space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                <Sliders className="w-4 h-4 text-brand-400" />
                1. General Settings
              </h3>

              {/* 1. Enable Leaderboard Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#3A3E47]/70 border border-white/5">
                <div>
                  <label className="text-xs font-bold text-white block">Enable Leaderboard</label>
                  <p className="text-[11px] text-slate-400">Display public rankings and activate real-time supporter calculations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>

              {/* 2. Leaderboard Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Leaderboard Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  placeholder="Top Supporters"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500 font-semibold"
                />
              </div>

              {/* 3. Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Description / Subtitle</label>
                <input
                  type="text"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Thank you to everyone supporting the stream! ❤️"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                />
              </div>

              {/* 24. Empty Leaderboard Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Empty Leaderboard Message</label>
                <input
                  type="text"
                  value={settings.empty_message}
                  onChange={(e) => setSettings({ ...settings, empty_message: e.target.value })}
                  placeholder="No donations yet. Be the first supporter!"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {/* Section 2: Ranking & Data */}
          {activeTab === 'ranking' && (
            <div className="bg-[#292D35] p-6 rounded-2xl border border-white/10 space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                2. Ranking & Data Filters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 4. Ranking Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Ranking Type</label>
                  <select
                    value={settings.ranking_type}
                    onChange={(e) => setSettings({ ...settings, ranking_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    <option value="Total Donations">Total Donations ($ Amount)</option>
                    <option value="Monthly Donations">Monthly Donations</option>
                    <option value="Weekly Donations">Weekly Donations</option>
                    <option value="Daily Donations">Daily Donations</option>
                    <option value="Number of Donations">Number of Donations (Tip Count)</option>
                    <option value="Top Supporters">Top Supporters (VIP)</option>
                  </select>
                </div>

                {/* 5. Time Period */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Time Period</label>
                  <select
                    value={settings.time_period}
                    onChange={(e) => setSettings({ ...settings, time_period: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    <option value="All Time">All Time (Lifetime)</option>
                    <option value="This Year">This Year</option>
                    <option value="This Month">This Month (30 Days)</option>
                    <option value="This Week">This Week (7 Days)</option>
                    <option value="Today">Today (24 Hours)</option>
                    <option value="Custom Date Range">Custom Date Range</option>
                  </select>
                </div>

                {/* 6. Maximum Entries */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Maximum Entries</label>
                  <select
                    value={settings.max_entries}
                    onChange={(e) => setSettings({ ...settings, max_entries: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    <option value={3}>Top 3 (OBS Stream Special)</option>
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10 (Default)</option>
                    <option value={20}>Top 20</option>
                    <option value={50}>Top 50</option>
                    <option value={100}>Top 100</option>
                  </select>
                </div>

                {/* 12. Anonymous Donations */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Anonymous Donations</label>
                  <select
                    value={settings.anonymous_mode}
                    onChange={(e) => setSettings({ ...settings, anonymous_mode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    <option value="Show Anonymous">Show Anonymous (Default)</option>
                    <option value="Hide Anonymous">Hide Anonymous</option>
                    <option value='Replace username with "Anonymous"'>Replace username with "Anonymous"</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Display Toggles */}
          {activeTab === 'display' && (
            <div className="bg-[#292D35] p-6 rounded-2xl border border-white/10 space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                <Eye className="w-4 h-4 text-accent-cyan" />
                3. Display Toggles & Column Visibility
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 7. Show Rank */}
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">7. Show Rank Number (#1, #2...)</span>
                  <input
                    type="checkbox"
                    checked={settings.show_rank}
                    onChange={(e) => setSettings({ ...settings, show_rank: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                  />
                </label>

                {/* 8. Show Avatar */}
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">8. Show Supporter Avatar</span>
                  <input
                    type="checkbox"
                    checked={settings.show_avatar}
                    onChange={(e) => setSettings({ ...settings, show_avatar: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                  />
                </label>

                {/* 9. Show Username */}
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">9. Show Username</span>
                  <input
                    type="checkbox"
                    checked={settings.show_username}
                    onChange={(e) => setSettings({ ...settings, show_username: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                  />
                </label>

                {/* 10. Show Donation Amount */}
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">10. Show Donation Amount ($)</span>
                  <input
                    type="checkbox"
                    checked={settings.show_amount}
                    onChange={(e) => setSettings({ ...settings, show_amount: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                  />
                </label>

                {/* 11. Show Donation Count */}
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">11. Show Donation Count (Tips)</span>
                  <input
                    type="checkbox"
                    checked={settings.show_donation_count}
                    onChange={(e) => setSettings({ ...settings, show_donation_count: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                  />
                </label>

                {/* 19. Highlight Top 3 */}
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    19. Highlight Top 3 Podium
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.highlight_top3}
                    onChange={(e) => setSettings({ ...settings, highlight_top3: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-border text-amber-500 focus:ring-amber-500"
                  />
                </label>
              </div>

              {/* 20. Top 3 Style */}
              {settings.highlight_top3 && (
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <label className="text-xs font-bold text-slate-300 uppercase">20. Top 3 Spotlight Badge Style</label>
                  <select
                    value={settings.top3_style}
                    onChange={(e) => setSettings({ ...settings, top3_style: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    <option value="Gold / Silver / Bronze">🥇 Gold / Silver / Bronze (Classic)</option>
                    <option value="Neon">⚡ Neon Cyber Badges</option>
                    <option value="Crown">👑 Crown / Tiara Badges</option>
                    <option value="Minimal">✦ Sleek Minimal Pills</option>
                    <option value="Animated">🔥 Animated Glow & Bounce</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Appearance & Themes */}
          {activeTab === 'appearance' && (
            <div className="bg-[#292D35] p-6 rounded-2xl border border-white/10 space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                <Palette className="w-4 h-4 text-accent-fuchsia" />
                4. Appearance, Layout & 20 Themes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 13. Currency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">13. Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="KHR (៛)">KHR (៛) - Khmer Riel</option>
                    <option value="THB (฿)">THB (฿) - Thai Baht</option>
                    <option value="VND (₫)">VND (₫) - Vietnamese Dong</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* 14. Number Formatting */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">14. Number Formatting</label>
                  <select
                    value={settings.number_format}
                    onChange={(e) => setSettings({ ...settings, number_format: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    <option value="1,000.00">1,000.00 (Precise Decimals)</option>
                    <option value="1,000">1,000 (Rounded)</option>
                    <option value="1K">1K (Compact)</option>
                    <option value="1.5K">1.5K (One Decimal K)</option>
                    <option value="1M">1M (Millions Compact)</option>
                  </select>
                </div>

                {/* 15. Leaderboard Layout */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">15. Leaderboard Layout</label>
                  <select
                    value={settings.layout}
                    onChange={(e) => setSettings({ ...settings, layout: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    <option value="Classic">Classic Table</option>
                    <option value="Modern">Modern Floating Glass</option>
                    <option value="Compact">Compact List</option>
                    <option value="Card">Podium Card (Vertical)</option>
                    <option value="Stream Overlay">Stream Overlay (Ticker Ribbon)</option>
                    <option value="Cyberpunk">Cyberpunk Neon HUD</option>
                    <option value="Minimalist">Minimalist Clean</option>
                  </select>
                </div>

                {/* 17. Font */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">17. Typography Font</label>
                  <select
                    value={settings.font}
                    onChange={(e) => setSettings({ ...settings, font: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    {FONTS.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {/* 18. Font Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">18. Font Size</label>
                  <select
                    value={settings.font_size}
                    onChange={(e) => setSettings({ ...settings, font_size: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    <option value="Small">Small (Compact UI)</option>
                    <option value="Medium">Medium (Balanced)</option>
                    <option value="Large">Large (Stream Highlights)</option>
                    <option value="Extra Large">Extra Large (Huge OBS Screen)</option>
                  </select>
                </div>

                {/* 16. Leaderboard Theme (All 20 Themes) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase flex items-center justify-between">
                    <span>16. Leaderboard Theme (20 Curated Styles)</span>
                    <span className="text-[10px] text-accent-cyan font-mono">Live Sync</span>
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500 font-bold"
                  >
                    {THEMES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Animation & Auto Refresh */}
          {activeTab === 'animation' && (
            <div className="bg-[#292D35] p-6 rounded-2xl border border-white/10 space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                5. Animation & Real-Time Refresh
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 21. Animation Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#3A3E47]/70 border border-white/5 sm:col-span-2">
                  <div>
                    <label className="text-xs font-bold text-white block">21. Animation Enabled</label>
                    <p className="text-[11px] text-slate-400">Enable micro-animations, glowing aura pulses, and entrance transitions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.animation_enabled}
                      onChange={(e) => setSettings({ ...settings, animation_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>

                {/* 22. Animation Style */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">22. Animation Style</label>
                  <select
                    value={settings.animation_style}
                    onChange={(e) => setSettings({ ...settings, animation_style: e.target.value })}
                    disabled={!settings.animation_enabled}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500 disabled:opacity-50"
                  >
                    <option value="None">None (Static)</option>
                    <option value="Fade">Smooth Fade In</option>
                    <option value="Slide Up">Slide Up Staggered</option>
                    <option value="Glow">Neon Breathe Glow</option>
                    <option value="Pulse">Rhythmic Pulse</option>
                    <option value="RGB">Chroma RGB Wave</option>
                    <option value="Particles">Floating Particles</option>
                    <option value="Cyber Glitch">Cyber Glitch Pulse</option>
                  </select>
                </div>

                {/* 23. Auto Refresh Interval */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">23. Auto Refresh Interval</label>
                  <select
                    value={settings.refresh_interval}
                    onChange={(e) => setSettings({ ...settings, refresh_interval: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                  >
                    <option value="Real-time">Real-time (Instant SSE)</option>
                    <option value="1 second">Every 1 Second</option>
                    <option value="3 seconds">Every 3 Seconds</option>
                    <option value="5 seconds">Every 5 Seconds (Recommended)</option>
                    <option value="10 seconds">Every 10 Seconds</option>
                    <option value="30 seconds">Every 30 Seconds</option>
                    <option value="1 minute">Every 1 Minute</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Custom Top 3 Donation Studio (OBS Widget) */}
          {activeTab === 'widget' && (
            <div className="bg-[#292D35] p-6 rounded-2xl border border-amber-500/40 space-y-4 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Custom Top 3 Donation Studio (OBS Widget)</h3>
                    <p className="text-xs text-slate-400">100% Transparent Background Browser Source for OBS Studio & Streamlabs</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-300 uppercase font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Parameterized OBS Browser Source URL
                </label>
                <div className="flex rounded-2xl overflow-hidden border border-amber-500/50 bg-[#1E2128] p-1.5 shadow-inner">
                  <input
                    type="text"
                    readOnly
                    value={obsLeaderboardUrl}
                    className="w-full px-3 py-2 bg-transparent text-xs text-amber-200 font-mono focus:outline-none select-all"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={copyObsUrl}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-xs font-bold text-black flex items-center gap-1.5 transition-all shadow-md"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                      {copiedUrl ? 'Copied!' : 'Copy OBS URL'}
                    </button>
                    <a
                      href={obsLeaderboardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      title="Preview in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Recommended OBS Browser Source Settings: Width: <strong>400</strong>, Height: <strong>480</strong> (Transparent)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 25. LIVE PREVIEW PANEL (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-accent-cyan animate-pulse" /> 25. Live Preview
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Sync ({settings.refresh_interval})
            </span>
          </div>

          {/* Real-time Money Summary */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 shadow-sm">
              <span className="text-[10px] text-amber-300 uppercase font-mono font-bold block">Total Raised</span>
              <span className="text-base font-black text-amber-400 font-mono">
                ${Number(leaderboardStats.totalAmount || 0).toFixed(2)}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-dark-surface border border-white/10 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Active Supporters</span>
              <span className="text-base font-black text-white font-mono">
                {leaderboardStats.uniqueDonors || previewSupporters.length}
              </span>
            </div>
          </div>

          {/* Styled Preview Container */}
          <div
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 shadow-2xl ${activeThemeObj.bg} ${activeThemeObj.border}`}
            style={{ fontFamily: activeFontObj.family }}
          >
            {/* Header / Title */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeThemeObj.badge}`}>
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{settings.title || 'Top Supporters'}</h4>
                  {settings.description && (
                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{settings.description}</p>
                  )}
                </div>
              </div>
              <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
            </div>

            {/* Supporter Rows List */}
            {!settings.enabled ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono">
                [Leaderboard is currently disabled]
              </div>
            ) : previewSupporters.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {settings.empty_message}
              </div>
            ) : (
              <div className="space-y-2">
                {previewSupporters.slice(0, settings.max_entries || 5).map((item, idx) => {
                  const isTop3 = settings.highlight_top3 && idx < 3;
                  const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${item.rank}`;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isTop3 && idx === 0
                          ? 'bg-amber-500/15 border-amber-400 shadow-md scale-[1.01]'
                          : isTop3 && idx === 1
                          ? 'bg-slate-300/10 border-slate-300/40'
                          : isTop3 && idx === 2
                          ? 'bg-amber-800/15 border-amber-700/40'
                          : 'bg-white/5 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* 7. Show Rank */}
                        {settings.show_rank && (
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            isTop3 && idx === 0 ? 'bg-amber-400 text-black' : isTop3 && idx === 1 ? 'bg-slate-300 text-black' : isTop3 && idx === 2 ? 'bg-amber-700 text-white' : 'bg-dark-surface text-slate-400 font-mono'
                          }`}>
                            {settings.top3_style === 'Gold / Silver / Bronze' && isTop3 ? medalEmoji : `#${item.rank}`}
                          </div>
                        )}

                        {/* 8. Show Avatar */}
                        {settings.show_avatar && (
                          <img
                            src={item.avatar || '/zoee-avatar.png'}
                            alt={item.name}
                            className="w-7 h-7 rounded-lg object-cover border border-white/20 shrink-0"
                          />
                        )}

                        {/* 9. Show Username */}
                        {settings.show_username && (
                          <div className="truncate">
                            <span className="text-xs font-bold text-white block truncate">{item.name}</span>
                            {/* 11. Show Donation Count */}
                            {settings.show_donation_count && (
                              <span className="text-[9px] text-slate-400 font-mono">{item.count} tips</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 10. Show Donation Amount */}
                      {settings.show_amount && (
                        <span className="text-xs font-mono font-bold text-accent-cyan shrink-0 ml-2">
                          {formatAmount(item.total)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Watermark */}
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span className="text-accent-emerald font-bold">● LIVE PODIUM</span>
              <span>{settings.time_period} · {settings.ranking_type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
