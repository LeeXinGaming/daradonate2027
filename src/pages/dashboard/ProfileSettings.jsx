import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Sliders, User, DollarSign, Image, Save, Check } from 'lucide-react';

export default function ProfileSettings() {
  const { user, streamer, refreshSession } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [bannerUrl, setBannerUrl] = useState(user?.banner_url || '');
  const [minDonation, setMinDonation] = useState(streamer?.min_donation_amount || 1.00);
  const [currency, setCurrency] = useState(streamer?.currency || 'USD');
  const [abaAccountName, setAbaAccountName] = useState(streamer?.aba_account_name || '');
  const [abaAccountNumber, setAbaAccountNumber] = useState(streamer?.aba_account_number || '');
  const [abaPaywayLink, setAbaPaywayLink] = useState(streamer?.aba_payway_link || '');
  const [abaQrUrl, setAbaQrUrl] = useState(streamer?.aba_qr_url || '');
  const [bakongId, setBakongId] = useState(streamer?.bakong_id || '');
  const [donationEnabled, setDonationEnabled] = useState(streamer?.donation_enabled !== false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      const res = await api.put('/streamers/settings', {
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        min_donation_amount: parseFloat(minDonation),
        currency,
        aba_account_name: abaAccountName,
        aba_account_number: abaAccountNumber,
        aba_payway_link: abaPaywayLink,
        aba_qr_url: abaQrUrl,
        bakong_id: bakongId,
        donation_enabled: donationEnabled
      });

      if (res.success) {
        setMsg('Profile & payment preferences saved successfully!');
        await refreshSession();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-brand-400" />
          Streamer Profile & Payment Preferences
        </h2>
        <p className="text-xs text-slate-400">Customize how your public donation page looks and functions</p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald font-semibold text-center">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Min. Donation ($ USD)</label>
            <input
              type="number"
              min="0.10"
              step="0.10"
              required
              value={minDonation}
              onChange={(e) => setMinDonation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white font-mono focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase">Bio / Description</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-4 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Banner Image URL</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
            />
          </div>
        </div>

        {/* ABA PayWay Auto Payment Setup */}
        <div className="p-6 rounded-2xl bg-dark-surface/90 border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#003853] border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] font-black text-xs shadow-md font-sans">
                ABA
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">ABA PayWay Auto Payment Setup</h4>
                <p className="text-xs text-slate-400">Direct In-App Checkout, ABA Mobile Deep Link & Instant Auto Verification</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono">
              Auto Pay Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-300 uppercase">ABA Account Name (ឈ្មោះគណនី)</label>
              <input
                type="text"
                value={abaAccountName}
                onChange={(e) => setAbaAccountName(e.target.value)}
                placeholder="e.g. SOTORE KIRA"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white uppercase placeholder-slate-600 focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-300 uppercase">ABA Account Number (លេខគណនី)</label>
              <input
                type="text"
                value={abaAccountNumber}
                onChange={(e) => setAbaAccountNumber(e.target.value)}
                placeholder="e.g. 000 123 456 (9 digits)"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-mono placeholder-slate-600 focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyan-300 uppercase">ABA PayWay Direct / Deep Link URL</label>
            <input
              type="url"
              value={abaPaywayLink}
              onChange={(e) => setAbaPaywayLink(e.target.value)}
              placeholder="https://link.ababank.com/... or https://payway.ababank.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-mono placeholder-slate-600 focus:border-cyan-400"
            />
            <span className="text-[10px] text-slate-400">
              When viewers tip with ABA PayWay, this opens the ABA Mobile App directly for instant 1-touch payment.
            </span>
          </div>
        </div>

        {/* ABA KHQR Setup */}
        <div className="p-6 rounded-2xl bg-dark-surface/90 border border-[#00E5FF]/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#004F71] to-[#00E5FF] flex items-center justify-center text-white font-black text-sm shadow-md">
                ABA
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">ABA KHQR Universal Setup</h4>
                <p className="text-xs text-slate-400">Receive donations directly from ABA Mobile & all Cambodian banking apps</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#00E5FF] uppercase flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#004F71] text-[#00E5FF] font-black text-[8px] flex items-center justify-center">QR</span>
                <span>ABA Account / Bakong ID (ABA KHQR)</span>
              </label>
              <input
                type="text"
                value={bakongId}
                onChange={(e) => setBakongId(e.target.value)}
                placeholder="e.g. yourname@abaa or 012345678@abaa"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-mono placeholder-slate-600 focus:border-[#00E5FF]"
              />
              <span className="text-[10px] text-slate-400">
                Allows viewers using ABA Mobile and all Cambodian banking apps to tip directly to your account.
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Donors will see your verified dynamic KHQR code during tipping with automatic instant audio/TTS stream alerts.
          </p>
        </div>

        {/* Telegram Account Integration */}
        <div className="p-6 rounded-2xl bg-dark-surface/90 border border-sky-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-black text-sm shadow-md">
                TG
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Linked Telegram Account</h4>
                <p className="text-xs text-slate-400">Synced Telegram handle for instant push alerts and 1-click login</p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              user?.telegram_id || user?.telegram_username
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
            }`}>
              {user?.telegram_id || user?.telegram_username ? 'SYNCHRONIZED' : 'TELEGRAM READY'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-dark-card border border-white/5 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Telegram Username</span>
              <p className="text-xs font-mono font-bold text-sky-300">
                {user?.telegram_username ? `@${user.telegram_username}` : (user?.username ? `@${user.username}` : 'Not linked')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-dark-card border border-white/5 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Bot Push Notifications</span>
              <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>@darastore_bot Active</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-dark-surface border border-dark-border">
          <div>
            <p className="text-sm font-bold text-white">Accepting Donations</p>
            <p className="text-xs text-slate-400">Toggle whether visitors can submit new donations to your page</p>
          </div>
          <input
            type="checkbox"
            checked={donationEnabled}
            onChange={(e) => setDonationEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-dark-border bg-dark-card text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile Preferences'}
        </button>
      </form>
    </div>
  );
}
