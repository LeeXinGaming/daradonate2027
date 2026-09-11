import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Radio,
  Sparkles,
  Play,
  Save,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Eye,
  Sliders,
  Palette,
  Zap,
  Shield,
  Layers,
  Heart,
  Flame,
  Crown
} from 'lucide-react';

const THEMES = [
  { id: 'Gaming', name: 'Gaming (Default)', desc: 'Modern esports dark slate with violet & cyan aura' },
  { id: 'Neon', name: 'Electric Neon', desc: 'High-voltage electric cyan & magenta glowing outlines' },
  { id: 'Gold', name: 'Imperial Gold', desc: '3D Gold sheen with royal amber crowns' },
  { id: 'Minimal', name: 'Minimalist Clean', desc: 'Subtle translucent glassmorphism bar' },
  { id: 'Cyber', name: 'Cyberpunk Matrix', desc: 'High-tech terminal emerald green phosphor grid' },
  { id: 'Streamer', name: 'Vibrant Streamer', desc: 'Dynamic rainbow sunset live creator gradient' }
];

export default function TickerSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [streamerSlug, setStreamerSlug] = useState('dara_gaming');
  const [activeTab, setActiveTab] = useState('general');

  // Preview dummy donations
  const [previewDonations, setPreviewDonations] = useState([
    { id: 'p1', username: 'Dara Hero', amount: 20.00, currency: 'USD', message: 'Awesome gameplay! Keep going! ❤️', avatar: '/zoee-avatar.png' },
    { id: 'p2', username: 'Piseth Fan', amount: 10.00, currency: 'USD', message: 'Big love from Phnom Penh! 🔥', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { id: 'p3', username: 'Anonymous', amount: 5.00, currency: 'USD', message: 'Here is coffee money ☕', avatar: '/zoee-avatar.png' },
    { id: 'p4', username: 'Sokha Pro', amount: 50.00, currency: 'USD', message: 'Tournament champion support! 👑', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' }
  ]);

  // Full Ticker Settings State
  const [settings, setSettings] = useState({
    enabled: true,
    theme: 'Gaming',
    animation: 'Scroll Left',
    direction: 'left',
    speed: 40,
    font_size: 'Medium',
    font_weight: 'Bold',
    show_avatar: true,
    show_name: true,
    show_amount: true,
    show_message: true,
    show_currency: true,
    max_donations: 15,
    show_latest: true,
    show_largest: false,
    show_today: false,
    custom_text: '🎉 Live Supporter Feed •',
    avatar_size: 'Medium',
    spacing: 32,
    height: 64,
    pause_on_hover: true,
    infinite_loop: true,
    anonymous_mode: 'Show Anonymous'
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [setRes, profRes] = await Promise.all([
        api.get('/settings/ticker').catch(() => null),
        api.get('/streamers/dashboard/profile').catch(() => null)
      ]);

      if (setRes?.success && setRes.data) {
        setSettings(prev => ({ ...prev, ...setRes.data }));
      }
      if (profRes?.success && profRes.data?.slug) {
        setStreamerSlug(profRes.data.slug);
      }
    } catch (err) {
      console.error('Failed to load ticker settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const res = await api.put('/settings/ticker', settings);
      if (res.success) {
        setSettings(res.data);
        showToast('Donation Ticker settings saved successfully.', 'success');
      } else {
        showToast(res.message || 'Failed to save settings.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTicker = async () => {
    setTesting(true);
    try {
      // 1. Add to local live preview
      const testItem = {
        id: 'test-' + Date.now(),
        username: 'Demo Supporter',
        amount: 15.00,
        currency: 'USD',
        message: 'This is a live test donation for the OBS ticker! 🎉',
        avatar: '/zoee-avatar.png'
      };
      setPreviewDonations(prev => [testItem, ...prev]);

      // 2. Broadcast to live OBS via API
      await api.post('/ticker/test', {});
      showToast('🎉 Test ticker event sent! Check your preview & live OBS.', 'success');
    } catch (err) {
      showToast('Sent local preview test event!', 'success');
    } finally {
      setTesting(false);
    }
  };

  const obsTickerUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/ticker/${streamerSlug}?theme=${settings.theme.toLowerCase()}&speed=${settings.speed}&direction=${settings.direction}`
    : `/ticker/${streamerSlug}`;

  const copyObsUrl = () => {
    navigator.clipboard.writeText(obsTickerUrl);
    setCopied(true);
    showToast('OBS Ticker URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Preview theme palette
  const getThemePreviewStyles = () => {
    const t = settings.theme.toLowerCase();
    if (t === 'neon') return 'bg-[#090a18] border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]';
    if (t === 'gold') return 'bg-[#18140a] border-2 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]';
    if (t === 'minimal') return 'bg-[#181a20]/90 border border-white/10 text-slate-200';
    if (t === 'cyber') return 'bg-[#06140e] border-2 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
    if (t === 'streamer') return 'bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-blue-900/90 border border-pink-400 text-pink-200';
    return 'bg-[#121420] border border-brand-500/50 text-brand-300 shadow-[0_0_20px_rgba(139,92,246,0.3)]';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-600/95 text-white border border-brand-400 shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-accent-cyan" />
          {toast.message}
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-[#292D35] p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-fuchsia text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Real-Time Donation Ticker Studio</h2>
              <p className="text-xs text-slate-400">Continuous horizontal scrolling donation ribbon for OBS Studio & Streamlabs</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleTestTicker}
            disabled={testing}
            className="px-4 py-2.5 rounded-xl bg-accent-cyan/15 hover:bg-accent-cyan/25 text-xs font-bold text-accent-cyan border border-accent-cyan/40 flex items-center gap-1.5 transition-all shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-accent-cyan" />
            {testing ? 'Broadcasting...' : 'Test Ticker'}
          </button>
          <button
            type="button"
            onClick={copyObsUrl}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all shadow-md"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied OBS Link!' : 'Copy OBS URL'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-lg shadow-brand-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Prominent OBS URL Banner (Always Visible) */}
      <div className="bg-gradient-to-r from-brand-600/15 via-[#292D35] to-accent-cyan/15 p-4 sm:p-5 rounded-2xl border border-brand-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/40 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">OBS Ticker Browser Source URL</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Transparent · 60 FPS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 break-all line-clamp-1">{obsTickerUrl}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={copyObsUrl}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-xs font-bold text-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 font-mono"
          >
            {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy OBS URL'}
          </button>
          <a
            href={obsTickerUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10"
            title="Open OBS Ticker in new tab"
          >
            <ExternalLink className="w-4 h-4 text-accent-cyan" />
          </a>
        </div>
      </div>

      {/* 6. LIVE INTERACTIVE TICKER PREVIEW PANEL */}
      <div className="bg-[#1E2128] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-accent-cyan animate-pulse" /> Live Ticker Preview ({settings.theme} Theme · {settings.animation})
          </span>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Real-Time Feed
          </span>
        </div>

        {/* Live Scrolling Preview Container */}
        <div className="w-full bg-[#0c0d14] rounded-2xl border border-white/10 p-3 overflow-hidden relative min-h-[72px] flex items-center">
          {settings.custom_text && (
            <span className="mr-3 z-10 shrink-0 px-3 py-1.5 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold shadow-md">
              {settings.custom_text}
            </span>
          )}

          <div
            className={`flex items-center gap-5 whitespace-nowrap will-change-transform ${
              settings.direction === 'right' ? 'animate-marquee-reverse' : 'animate-marquee'
            }`}
            style={{ animationDuration: `${Math.max(10, settings.speed || 40)}s` }}
          >
            {previewDonations.map((d, i) => (
              <div
                key={i}
                className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl ${getThemePreviewStyles()} backdrop-blur-xl shrink-0 transition-transform`}
              >
                {settings.show_avatar && (
                  <img
                    src={d.avatar}
                    alt={d.username}
                    className="w-7 h-7 rounded-xl object-cover border border-white/20 shrink-0"
                  />
                )}
                <div className="flex items-center gap-1.5 text-xs">
                  {settings.show_name && (
                    <span className="font-bold text-white">{d.username}</span>
                  )}
                  {settings.show_amount && (
                    <span className="px-2 py-0.5 rounded-lg bg-white/10 text-[11px] font-mono font-bold text-accent-cyan">
                      {settings.show_currency && '$'}{d.amount.toFixed(2)}
                    </span>
                  )}
                  {settings.show_message && d.message && (
                    <span className="text-slate-300 font-medium">— "{d.message}"</span>
                  )}
                </div>
                <Sparkles className="w-3.5 h-3.5 text-accent-cyan shrink-0 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="bg-[#292D35] p-6 rounded-2xl border border-white/10 space-y-6">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'general', label: '1. General & Toggles', icon: Sliders },
            { id: 'animation', label: '2. Animation & Speed', icon: Zap },
            { id: 'appearance', label: '3. Appearance & 6 Themes', icon: Palette },
            { id: 'content', label: '4. Content & Privacy', icon: Shield },
            { id: 'obs', label: '5. OBS Integration Guide', icon: Radio }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-4 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Enable Real-Time Ticker</span>
                  <span className="text-[11px] text-slate-400">Activate live marquee streaming ribbon</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Show Donor Avatars</span>
                  <span className="text-[11px] text-slate-400">Display supporter profile photos</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_avatar}
                  onChange={(e) => setSettings({ ...settings, show_avatar: e.target.checked })}
                  className="w-5 h-5 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Show Donor Names</span>
                  <span className="text-[11px] text-slate-400">Display username / display name</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_name}
                  onChange={(e) => setSettings({ ...settings, show_name: e.target.checked })}
                  className="w-5 h-5 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Show Donation Amounts ($)</span>
                  <span className="text-[11px] text-slate-400">Display amount tipped</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_amount}
                  onChange={(e) => setSettings({ ...settings, show_amount: e.target.checked })}
                  className="w-5 h-5 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Show Supporter Messages</span>
                  <span className="text-[11px] text-slate-400">Display custom messages on the ribbon</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_message}
                  onChange={(e) => setSettings({ ...settings, show_message: e.target.checked })}
                  className="w-5 h-5 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Show Currency Symbols</span>
                  <span className="text-[11px] text-slate-400">Prefix with $ or ៛</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_currency}
                  onChange={(e) => setSettings({ ...settings, show_currency: e.target.checked })}
                  className="w-5 h-5 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-300 uppercase">Maximum Visible Donations</label>
              <select
                value={settings.max_donations}
                onChange={(e) => setSettings({ ...settings, max_donations: parseInt(e.target.value, 10) })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
              >
                <option value={5}>5 Recent Donations</option>
                <option value={10}>10 Recent Donations</option>
                <option value={15}>15 Recent Donations (Recommended)</option>
                <option value={25}>25 Recent Donations</option>
                <option value={50}>50 Recent Donations</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 2: Animation */}
        {activeTab === 'animation' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Animation Mode</label>
                <select
                  value={settings.animation}
                  onChange={(e) => setSettings({ ...settings, animation: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                >
                  <option value="Scroll Left">Scroll Left (← ← ← Continuous Marquee)</option>
                  <option value="Scroll Right">Scroll Right (→ → → Reverse Marquee)</option>
                  <option value="Fade">Fade In / Out</option>
                  <option value="Slide">Slide In</option>
                  <option value="Static">Static Fixed Rotation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Scroll Direction</label>
                <select
                  value={settings.direction}
                  onChange={(e) => setSettings({ ...settings, direction: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                >
                  <option value="left">Left (Normal)</option>
                  <option value="right">Right (Reverse)</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase">Animation Speed: {settings.speed}s per cycle</label>
                  <span className="text-[10px] text-slate-400 font-mono">Lower = Faster</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={settings.speed}
                  onChange={(e) => setSettings({ ...settings, speed: parseInt(e.target.value, 10) })}
                  className="w-full accent-brand-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Appearance & 6 Themes */}
        {activeTab === 'appearance' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <label className="text-xs font-bold text-slate-300 uppercase block">Select Preset Theme</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {THEMES.map(th => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, theme: th.id })}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    settings.theme === th.id
                      ? 'bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'bg-[#1E2128] border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold text-white block">{th.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">{th.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Content & Privacy */}
        {activeTab === 'content' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Custom Text Prefix</label>
              <input
                type="text"
                value={settings.custom_text}
                onChange={(e) => setSettings({ ...settings, custom_text: e.target.value })}
                placeholder="🎉 Live Supporter Feed •"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Anonymous Privacy Mode</label>
              <select
                value={settings.anonymous_mode}
                onChange={(e) => setSettings({ ...settings, anonymous_mode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
              >
                <option value="Show Anonymous">Show Anonymous (Default)</option>
                <option value="Hide Anonymous">Hide Anonymous Donations</option>
                <option value='Replace username with "Anonymous"'>Replace with "Anonymous"</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 5: OBS Guide */}
        {activeTab === 'obs' && (
          <div className="p-5 rounded-2xl bg-[#1E2128] border border-white/10 space-y-3 animate-in fade-in duration-200">
            <h4 className="text-sm font-bold text-white">How to add to OBS Studio / Streamlabs</h4>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2">
              <li>Open <strong>OBS Studio</strong> and click the <strong>+</strong> icon under Sources.</li>
              <li>Select <strong>Browser Source</strong> and name it <em>"Zoee Donation Ticker"</em>.</li>
              <li>Paste your URL: <strong className="text-amber-300 select-all">{obsTickerUrl}</strong></li>
              <li>Set Width: <strong>1920</strong>, Height: <strong>100</strong>, FPS: <strong>60</strong>.</li>
              <li>Check <strong>"Shutdown source when not visible"</strong> and click <strong>OK</strong>!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
