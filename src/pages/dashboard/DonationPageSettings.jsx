import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Heart,
  Sliders,
  Eye,
  Check,
  Copy,
  ExternalLink,
  RotateCcw,
  Save,
  RefreshCw,
  AlertCircle,
  Sparkles,
  DollarSign,
  Share2,
  Lock,
  MessageSquare
} from 'lucide-react';

export default function DonationPageSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [streamerSlug, setStreamerSlug] = useState('dara_gaming');

  const [settings, setSettings] = useState({
    enabled: true,
    title: 'Donate For Dara Gaming KH ❤️',
    description: 'Support Dara by sending a donation! Your support helps improve stream broadcasts, new tournaments, and gaming gear. All donations trigger live voice alerts on stream!',
    currency: 'USD',
    min_amount: 1.00,
    max_amount: 5000.00,
    preset_amounts: [1, 5, 10, 20, 50, 100],
    custom_amount_enabled: true,
    anonymous_enabled: true,
    show_donor_name: true,
    show_donor_email: true,
    show_donor_message: true,
    show_recent_donations: true,
    show_social_links: true
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [setRes, profRes] = await Promise.all([
        api.get('/settings/donation-page').catch(() => null),
        api.get('/streamers/dashboard/profile').catch(() => null)
      ]);

      if (setRes?.success && setRes.data) {
        setSettings(prev => ({ ...prev, ...setRes.data }));
      }
      const resolvedSlug = profRes?.data?.slug || profRes?.data?.streamer?.slug || profRes?.data?.profile?.username;
      if (resolvedSlug) {
        setStreamerSlug(resolvedSlug);
      }
    } catch (err) {
      console.error('Failed to load donation page settings:', err);
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
      const res = await api.put('/settings/donation-page', settings);
      if (res.success) {
        setSettings(res.data);
        showToast('Donation page settings saved successfully.', 'success');
      } else {
        showToast(res.message || 'Failed to save settings.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save donation page settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all donation page settings to default?')) return;
    try {
      setSaving(true);
      const res = await api.post('/settings/donation-page/reset', {});
      if (res.success) {
        setSettings(res.data);
        showToast('Donation page settings reset to defaults.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to reset settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://zoeedonate.com';
  const publicDonateUrl = `${originUrl}/@${streamerSlug}`;
  const directDonateUrl = `${originUrl}/${streamerSlug}`;

  const copyPublicUrl = (urlToCopy = publicDonateUrl) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    showToast('Public Donation URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold transition-all ${
          toast.type === 'error' ? 'bg-red-500/90 text-white border border-red-400' : 'bg-brand-600/95 text-white border border-brand-400'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-[#292D35] p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/30">
              <Heart className="w-5 h-5 text-accent-fuchsia" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Public Donation Page Settings</h2>
              <p className="text-xs text-slate-400">Configure your public tipping page (/@{streamerSlug}), preset amounts, and live forms</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => copyPublicUrl(publicDonateUrl)}
            className="px-4 py-2.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-xs font-bold text-brand-300 border border-brand-500/40 flex items-center gap-1.5 transition-all shadow-md"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedUrl ? 'Copied Public Link!' : 'Copy Public URL'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-[#3A3E47] hover:bg-[#454A55] text-xs font-bold text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
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

      {/* Prominent Public Page Copier Banner */}
      <div className="bg-gradient-to-r from-brand-500/15 via-[#292D35] to-accent-cyan/15 p-4 sm:p-5 rounded-2xl border border-brand-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/40 shrink-0">
            <Share2 className="w-5 h-5 text-accent-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Your Public Donation Profile URL</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live & Active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <p className="text-xs text-brand-300 font-mono break-all">{publicDonateUrl}</p>
              <span className="text-slate-500 text-[10px] hidden sm:inline">|</span>
              <p className="text-xs text-slate-400 font-mono break-all hidden sm:inline">{directDonateUrl}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <a
            href={`/tip/${streamerSlug}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-brand-600 hover:brightness-110 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md"
            title={`Open Test Tip page for @${streamerSlug}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Test Tip</span>
          </a>
          <button
            type="button"
            onClick={() => copyPublicUrl(publicDonateUrl)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-fuchsia hover:brightness-110 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg font-mono"
          >
            {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedUrl ? 'Copied to Clipboard!' : 'Copy Donation Link'}
          </button>
          <a
            href={publicDonateUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10"
            title="Open Public Donation Page in new tab"
          >
            <ExternalLink className="w-4 h-4 text-accent-cyan" />
          </a>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SETTINGS FORM (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* General Page Settings */}
          <div className="bg-[#292D35] p-6 rounded-2xl border border-white/10 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <Sliders className="w-4 h-4 text-brand-400" />
              1. General Page Settings
            </h3>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#3A3E47]/70 border border-white/5">
              <div>
                <label className="text-xs font-bold text-white block">Enable Public Donation Page</label>
                <p className="text-[11px] text-slate-400">Allow donors to visit /@{streamerSlug} and send tips</p>
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

            {/* Donation Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Donation Page Title</label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="Donate For Dara Gaming KH ❤️"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500 font-semibold"
              />
            </div>

            {/* Description / Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Description / Message to Supporters</label>
              <textarea
                rows={3}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Support my stream and content creation! Every donation triggers live on-stream alerts."
                className="w-full p-3 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500 resize-none"
              />
            </div>

            {/* Currency & Min/Max Amounts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Min. Donation ($)</label>
                <input
                  type="number"
                  min="0.10"
                  step="any"
                  value={settings.min_amount}
                  onChange={(e) => setSettings({ ...settings, min_amount: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Max. Donation ($)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={settings.max_amount}
                  onChange={(e) => setSettings({ ...settings, max_amount: parseFloat(e.target.value) || 5000 })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2128] border border-white/10 text-xs text-white focus:border-brand-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Form Fields & Display Toggles */}
          <div className="bg-[#292D35] p-6 rounded-2xl border border-white/10 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <Eye className="w-4 h-4 text-accent-cyan" />
              2. Form Fields & Display Toggles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                <span className="text-xs font-bold text-slate-200">Custom Amount Input</span>
                <input
                  type="checkbox"
                  checked={settings.custom_amount_enabled}
                  onChange={(e) => setSettings({ ...settings, custom_amount_enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                <span className="text-xs font-bold text-slate-200">Allow Anonymous Tips</span>
                <input
                  type="checkbox"
                  checked={settings.anonymous_enabled}
                  onChange={(e) => setSettings({ ...settings, anonymous_enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                <span className="text-xs font-bold text-slate-200">Show Email Receipt Field</span>
                <input
                  type="checkbox"
                  checked={settings.show_donor_email}
                  onChange={(e) => setSettings({ ...settings, show_donor_email: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer">
                <span className="text-xs font-bold text-slate-200">Show Recent Donations Feed</span>
                <input
                  type="checkbox"
                  checked={settings.show_recent_donations}
                  onChange={(e) => setSettings({ ...settings, show_recent_donations: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#3A3E47]/70 border border-white/5 cursor-pointer sm:col-span-2">
                <span className="text-xs font-bold text-slate-200">Show Social Links on Profile</span>
                <input
                  type="checkbox"
                  checked={settings.show_social_links}
                  onChange={(e) => setSettings({ ...settings, show_social_links: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-border text-brand-600 focus:ring-brand-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-accent-cyan animate-pulse" /> Live Page Preview
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              ● Ready for @{streamerSlug}
            </span>
          </div>

          <div className="w-full p-5 rounded-2xl border-2 border-brand-500/40 bg-[#161822] shadow-2xl space-y-4">
            {/* Header Preview */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-brand-500 to-accent-cyan shrink-0">
                <img src="/zoee-avatar.png" alt="Avatar" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-black text-white truncate">{settings.title || 'Donate to Creator'}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">{settings.description}</p>
              </div>
            </div>

            {/* Presets Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400">Preset Amounts:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 5, 10, 20, 50, 100].map(val => (
                  <div key={val} className="py-1.5 text-center rounded-lg bg-[#1E2128] border border-white/5 text-[11px] font-mono font-bold text-slate-300">
                    ${val}
                  </div>
                ))}
              </div>
            </div>

            {/* Gateways Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400">Gateways:</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                <div className="p-2 rounded-lg bg-brand-500/15 border border-brand-500/40 text-brand-300 text-center">
                  ABA PayWay
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-center">
                  ABA KHQR
                </div>
              </div>
            </div>

            <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-fuchsia text-white font-bold text-xs text-center shadow-lg">
              Preview: Send Tip & Alert
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
