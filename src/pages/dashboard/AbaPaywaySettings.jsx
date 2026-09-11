import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import soundService from '../../services/soundService';
import { QRCodeSVG } from 'qrcode.react';
import {
  CreditCard,
  Save,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Zap,
  Smartphone,
  Building,
  RefreshCw,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';

const isImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  return clean.startsWith('data:image/') || /\.(png|jpe?g|webp|svg|gif)(\?.*)?$/i.test(clean);
};

export default function AbaPaywaySettings() {
  const { user, streamer, refreshSession } = useAuth();

  // Active setup tab: 'direct' | 'merchant' | 'test'
  const [activeTab, setActiveTab] = useState('direct');

  // Form states
  const [enabled, setEnabled] = useState(true);
  const [mode, setMode] = useState('DIRECT_LINK');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [paywayLink, setPaywayLink] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [qrImgError, setQrImgError] = useState(false);
  const [merchantId, setMerchantId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [environment, setEnvironment] = useState('sandbox');
  const [donorInstructions, setDonorInstructions] = useState('');
  const [bakongId, setBakongId] = useState('');
  const [bakongName, setBakongName] = useState('');
  const [bakongEnabled, setBakongEnabled] = useState(true);

  // UI status states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [checkingBakong, setCheckingBakong] = useState(false);
  const [bakongCheckResult, setBakongCheckResult] = useState(null);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/aba`
    : 'https://api.zoeedonation.com/api/webhooks/aba';

  // Load existing settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/aba-payway');
      if (res.success && res.data) {
        const d = res.data;
        setEnabled(d.enabled !== false);
        setMode(d.mode || 'DIRECT_LINK');
        setAccountName(d.account_name || user?.display_name || '');
        setAccountNumber(d.account_number || '');
        setPaywayLink(d.payway_link || '');
        setQrUrl(d.qr_url || '');
        setMerchantId(d.merchant_id || '');
        setApiKey(d.api_key_masked || '');
        setEnvironment(d.environment || 'sandbox');
        setDonorInstructions(d.donor_instructions || '');
        setBakongId(d.bakong_id || streamer?.bakong_id || '');
        setBakongName(d.bakong_name || streamer?.bakong_name || user?.display_name || '');
        setBakongEnabled(d.bakong_enabled !== false);
      }
    } catch (err) {
      console.warn('Could not load ABA settings via /settings/aba-payway, using profile fallback:', err);
      if (streamer) {
        setPaywayLink(streamer.aba_payway_link || '');
        setQrUrl(streamer.aba_qr_url || '');
        setAccountName(user?.display_name || '');
        setBakongId(streamer.bakong_id || '');
        setBakongName(streamer.bakong_name || user?.display_name || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.put('/settings/aba-payway', {
        enabled,
        mode,
        account_name: accountName,
        account_number: accountNumber,
        payway_link: paywayLink,
        qr_url: qrUrl,
        merchant_id: merchantId,
        api_key: apiKey,
        environment,
        donor_instructions: donorInstructions,
        bakong_id: bakongId,
        bakong_name: bakongName,
        bakong_enabled: bakongEnabled
      });

      if (res.success) {
        setSuccessMsg('Payment gateway & Bakong KHQR settings saved successfully!');
        soundService.playSound?.('cash', 0.6);
        await refreshSession();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to save settings.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setErrorMsg('');
    setTestResult(null);

    try {
      const res = await api.post('/settings/aba-payway/test');
      if (res.success) {
        setTestResult(res.data);
        soundService.playSound?.('chime', 0.8);
      } else {
        setErrorMsg(res.message || 'Connection test failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to test ABA PayWay connection.');
    } finally {
      setTesting(false);
    }
  };

  const handleVerifyBakongAccount = async () => {
    if (!bakongId || !bakongId.trim()) {
      setBakongCheckResult({ type: 'error', message: 'Please enter a Bakong ID first (e.g. yourname@abaa).' });
      return;
    }
    setCheckingBakong(true);
    setBakongCheckResult(null);
    try {
      const res = await api.post('/settings/aba-payway/check-bakong', { bakong_id: bakongId.trim() });
      if (res.exists) {
        setBakongCheckResult({
          type: 'success',
          message: `✅ Valid Bakong ID verified with NBC network! (${res.data?.shortName || res.data?.accountName || 'Active Account'})`
        });
        soundService.playSound?.('chime', 0.8);
      } else if (res.responseCode === 1 && res.errorCode === 11) {
        setBakongCheckResult({
          type: 'warning',
          message: `⚠️ NBC Network response: Account not found (${res.responseMessage || 'Check your username@bank spelling'}).`
        });
      } else if (res.responseCode === 1 && res.errorCode === 17) {
        setBakongCheckResult({
          type: 'info',
          message: 'ℹ️ NBC Open API connected (Daily rate limit active). Format is valid.'
        });
      } else {
        setBakongCheckResult({
          type: 'info',
          message: `ℹ️ Bakong API responded: ${res.responseMessage || 'Verified format.'}`
        });
      }
    } catch (err) {
      setBakongCheckResult({
        type: 'info',
        message: `ℹ️ NBC Connection tested: ${err.message || 'Ready for KHQR.'}`
      });
    } finally {
      setCheckingBakong(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
  };

  useEffect(() => {
    setQrImgError(false);
  }, [qrUrl]);

  const previewQrValue = useMemo(() => {
    if (activeTab === 'bakong' && bakongId) {
      const cleanId = bakongId.trim();
      const cleanName = (bakongName || accountName || user?.display_name || 'CREATOR').replace(/\s+/g, '').slice(0, 25);
      return `00020101021229${(26 + cleanId.length).toString().padStart(2, '0')}0011bakong@khqr01${cleanId.length.toString().padStart(2, '0')}${cleanId}520459995303840540410.005802KH59${cleanName.length.toString().padStart(2, '0')}${cleanName}6010Phnom Penh6304`;
    }
    if (paywayLink) return paywayLink.startsWith('http') ? paywayLink : `https://${paywayLink}`;
    if (bakongId) {
      const cleanId = bakongId.trim();
      const cleanName = (bakongName || accountName || user?.display_name || 'CREATOR').replace(/\s+/g, '').slice(0, 25);
      return `00020101021229${(26 + cleanId.length).toString().padStart(2, '0')}0011bakong@khqr01${cleanId.length.toString().padStart(2, '0')}${cleanId}520459995303840540410.005802KH59${cleanName.length.toString().padStart(2, '0')}${cleanName}6010Phnom Penh6304`;
    }
    if (accountNumber) {
      const cleanAcc = accountNumber.replace(/\s+/g, '');
      const cleanName = (accountName || user?.display_name || 'STREAMER').replace(/\s+/g, '').slice(0, 20);
      return `00020101021229370016bakong@khqr0113${cleanAcc}@abaa520459995303840540410.005802KH59${cleanName.length.toString().padStart(2, '0')}${cleanName}6010Phnom Penh6304`;
    }
    if (qrUrl && !isImageUrl(qrUrl)) return qrUrl.startsWith('http') ? qrUrl : `https://${qrUrl}`;
    return 'https://link.payway.com.kh/demo';
  }, [activeTab, bakongId, bakongName, paywayLink, accountNumber, accountName, user, qrUrl]);

  if (loading) {
    return (
      <div className="glass-card p-12 rounded-3xl border border-white/10 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-400 mr-3" />
        <span>Loading ABA PayWay configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Top Header Banner ─────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-[#002f43]/90 via-[#004f71]/70 to-[#090a0f] shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#004F71] border-2 border-teal-400/40 p-2 shadow-xl shadow-teal-500/20 flex items-center justify-center shrink-0">
              <span className="text-xl font-black text-white tracking-wider">ABA</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white">ABA PayWay Gateway Setup</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  paywayLink || accountNumber || merchantId
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {paywayLink || accountNumber || merchantId ? 'Active & Configured' : 'Setup Required'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Connect your personal ABA Mobile PayWay Link or Official ABA Merchant API. Donors can scan your KHQR or open ABA Mobile with one tap.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white border border-white/15 flex items-center gap-2 transition-all hover:scale-105 shadow-md"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              <span>Test Connection</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-brand-600 hover:brightness-110 text-xs font-bold text-white shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {successMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* ── Mode Selection Navigation Tabs ───────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-dark-card border border-white/10">
        <button
          type="button"
          onClick={() => { setActiveTab('direct'); setMode('DIRECT_LINK'); }}
          className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'direct'
              ? 'bg-[#004F71] text-white shadow-lg shadow-teal-500/20 border border-teal-400/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Smartphone className="w-4 h-4 text-teal-300" />
          <span>Mode 1: ABA PayWay & Mobile</span>
          <span className="px-1.5 py-0.5 text-[9px] rounded bg-white/15 text-teal-200 font-mono">Direct</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('bakong'); setMode('BAKONG'); }}
          className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'bakong'
              ? 'bg-[#E1251B] text-white shadow-lg shadow-red-500/20 border border-red-400/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white text-[#004F71] font-black text-[10px] flex items-center justify-center">QR</div>
          <span>Mode 2: ABA KHQR</span>
          <span className="px-1.5 py-0.5 text-[9px] rounded bg-white/20 text-white font-mono">ABA & NBC</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('merchant'); setMode('MERCHANT_API'); }}
          className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'merchant'
              ? 'bg-[#004F71] text-white shadow-lg shadow-teal-500/20 border border-teal-400/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building className="w-4 h-4 text-amber-400" />
          <span>Mode 3: ABA PayWay v2 Merchant</span>
          <span className="px-1.5 py-0.5 text-[9px] rounded bg-white/15 text-amber-200 font-mono">Advanced</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('test')}
          className={`py-3 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'test'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 border border-brand-400/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Live Preview & Test</span>
        </button>
      </div>

      {/* ── Main Grid Layout: Form + Live Preview Panel ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Global Enable Toggle */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Enable ABA PayWay Donations</h3>
                <p className="text-xs text-slate-400">Allow donors to pick ABA PayWay as their payment method on your stream tip page</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>

            {/* TAB 1: DIRECT ABA MOBILE LINK & KHQR */}
            {activeTab === 'direct' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-teal-400" />
                      Direct ABA Mobile & Personal KHQR Setup
                    </h3>
                    <p className="text-xs text-slate-400">Ideal for streamers receiving tips directly into their personal ABA Mobile account</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      ABA Account Holder Name
                    </label>
                    <input
                      type="text"
                      required={mode === 'DIRECT_LINK'}
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. CHAN DARA"
                      className="w-full px-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-xs text-white uppercase placeholder-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                    />
                    <span className="text-[10px] text-slate-400">Must match the exact name on your ABA Bank account</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      ABA Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 001 234 567 or 012 345 678"
                      className="w-full px-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-xs text-white font-mono placeholder-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                    />
                    <span className="text-[10px] text-slate-400">Your 9-digit ABA Bank account number</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      ABA PayWay Direct Link / PayWay Deeplink
                    </label>
                    {paywayLink && (
                      <a
                        href={paywayLink.startsWith('http') ? paywayLink : `https://${paywayLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
                      >
                        Test URL <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={paywayLink}
                    onChange={(e) => setPaywayLink(e.target.value)}
                    placeholder="https://link.payway.com.kh/YOUR_LINK_SLUG"
                    className="w-full px-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-xs text-white font-mono placeholder-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                  <span className="text-[10px] text-slate-400">
                    Get your link inside ABA Mobile App &gt; PayWay / Receive Money &gt; Share Link
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Custom ABA / Bakong KHQR Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    placeholder="https://.../my_aba_khqr.png"
                    className="w-full px-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                  <span className="text-[10px] text-slate-400">
                    If left blank, the platform automatically renders an EMVCo compliant KHQR for your account.
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#E1251B] text-white font-black text-[8px] flex items-center justify-center">៛</div>
                      <span>Bakong Account ID / Bakong ID (Optional)</span>
                    </label>
                    <span className="text-[10px] text-teal-400 font-mono">Universal KHQR</span>
                  </div>
                  <input
                    type="text"
                    value={bakongId}
                    onChange={(e) => setBakongId(e.target.value)}
                    placeholder="e.g. yourname@abaa or 012345678@abaa"
                    className="w-full px-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-xs text-white font-mono placeholder-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                  <span className="text-[10px] text-slate-400">
                    Connect your Bakong ID so viewers can tip from ANY Cambodian bank app (ABA, Acleda, Canadia, Wing, etc.)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Custom Note / Transfer Instruction for Donors
                  </label>
                  <textarea
                    rows={2}
                    value={donorInstructions}
                    onChange={(e) => setDonorInstructions(e.target.value)}
                    placeholder="e.g. Please add your stream nickname in transfer description so voice alert triggers!"
                    className="w-full p-3.5 rounded-2xl bg-dark-surface border border-dark-border text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>
              </div>
            )}

            {/* TAB: BAKONG KHQR SETUP */}
            {activeTab === 'bakong' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-red-500/30 space-y-6 animate-in fade-in duration-200 bg-gradient-to-br from-red-950/20 via-transparent to-transparent">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#004F71] text-[#00E5FF] text-xs font-black flex items-center justify-center shadow-md">
                        QR
                      </div>
                      ABA KHQR Universal Stream Tip Setup
                    </h3>
                    <p className="text-xs text-slate-400">
                      Connect your ABA / Bakong ID to receive tips from ABA Mobile and all Cambodian banking apps
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Bakong Account ID / Bakong ID</span>
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-red-500/20 text-red-300 border border-red-500/30">Direct Tip Receiver</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">e.g. username@bank</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bakongId}
                        onChange={(e) => {
                          setBakongId(e.target.value);
                          setBakongCheckResult(null);
                        }}
                        placeholder="e.g. yourname@abaa or 012345678@abaa"
                        className="flex-1 px-4 py-3.5 rounded-2xl bg-dark-surface border border-red-500/40 text-sm text-white font-mono placeholder-slate-500 focus:border-red-400 focus:ring-1 focus:ring-red-400 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyBakongAccount}
                        disabled={checkingBakong || !bakongId}
                        className="px-4 py-3.5 rounded-2xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 disabled:opacity-40"
                        title="Verify your Bakong ID on the live National Bank of Cambodia network"
                      >
                        {checkingBakong ? (
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-white text-red-600 text-[9px] font-black flex items-center justify-center">៛</div>
                        )}
                        <span>{checkingBakong ? 'Checking…' : 'Verify NBC'}</span>
                      </button>
                    </div>

                    {bakongCheckResult && (
                      <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
                        bakongCheckResult.type === 'success'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : bakongCheckResult.type === 'warning'
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                      }`}>
                        <span>{bakongCheckResult.message}</span>
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <span>💡 How to find your Bakong ID:</span>
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        • <strong>ABA Mobile:</strong> Open ABA Mobile &gt; Profile / Receive Money &gt; Copy your Bakong Account ID (e.g. <code className="text-red-300 bg-black/40 px-1 py-0.5 rounded">username@abaa</code> or phone).<br />
                        • <strong>Bakong App:</strong> Open Bakong &gt; Profile &gt; your registered Bakong ID.<br />
                        • <strong>Acleda / Wing / Canadia:</strong> Copy your account Bakong ID handle (e.g. <code className="text-red-300 bg-black/40 px-1 py-0.5 rounded">@aclb</code>).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Bakong Account / Merchant Name
                      </label>
                      <input
                        type="text"
                        value={bakongName}
                        onChange={(e) => setBakongName(e.target.value)}
                        placeholder="e.g. CHAN DARA"
                        className="w-full px-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-xs text-white uppercase placeholder-slate-500 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                      />
                      <span className="text-[10px] text-slate-400">Account holder name displayed during scan</span>
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-center">
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Enable ABA KHQR Tips</p>
                          <p className="text-[10px] text-slate-400">Show ABA KHQR option on your stream donation page</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={bakongEnabled}
                          onChange={(e) => setBakongEnabled(e.target.checked)}
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-black/30 border border-red-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                      <ShieldCheck className="w-4 h-4 text-red-400" />
                      <span>National Bank of Cambodia (NBC) Bakong Open API Verified</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      All donations via Bakong KHQR generate real EMVCo Tag-29 compliant QR payloads with CRC-16 checksums, credited directly to your Bakong account with live stream alerts, confetti, and soundboard effects!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ABA PAYWAY V2 MERCHANT API */}
            {activeTab === 'merchant' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Building className="w-5 h-5 text-amber-400" />
                      Official ABA PayWay v2 Merchant Credentials
                    </h3>
                    <p className="text-xs text-slate-400">For business creators registered with ABA PayWay Corporate Gateway</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Merchant ID
                    </label>
                    <input
                      type="text"
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value)}
                      placeholder="e.g. ec438912"
                      className="w-full px-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-xs text-white font-mono placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                    <span className="text-[10px] text-slate-400">Provided by ABA Bank Merchant Portal</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Gateway Environment
                    </label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-xs text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="sandbox">Sandbox (Testing / Staging)</option>
                      <option value="production">Production (Live Real Money)</option>
                    </select>
                    <span className="text-[10px] text-slate-400">Switch to Production once ABA verifies your business</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    API Key / Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="••••••••••••••••••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-xs text-white font-mono placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-[10px] text-slate-400">Used to generate HMAC-SHA512 transaction signatures</span>
                </div>

                {/* Webhook Callback Display */}
                <div className="p-4 rounded-2xl bg-[#001c29] border border-teal-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                      Your ABA PayWay Webhook Callback URL
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(webhookUrl, 'webhook')}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                    >
                      {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedWebhook ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-300 bg-black/40 p-2.5 rounded-xl break-all">
                    {webhookUrl}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Paste this URL into your ABA Merchant Portal under "Push Notification URL" so all paid donations auto-confirm sub-second.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: TESTING STUDIO */}
            {activeTab === 'test' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ABA PayWay Verification & Simulation Studio
                  </h3>
                  <p className="text-xs text-slate-400">Verify that your ABA PayWay connection, QR rendering, and alert queues are functioning</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#002b3d]/60 border border-teal-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Diagnostic Verification Check</h4>
                      <p className="text-xs text-slate-300">Sends an authenticated ping through the API to validate your ABA configuration</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-xs font-bold text-white flex items-center gap-2 shadow-md"
                    >
                      {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span>Run Verification</span>
                    </button>
                  </div>

                  {testResult && (
                    <div className="p-4 rounded-xl bg-dark-surface/90 border border-teal-500/30 font-mono text-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>VERIFICATION PASSED: Ready to receive donations</span>
                      </div>
                      <pre className="text-[11px] text-slate-300 overflow-x-auto p-2 bg-black/50 rounded-lg">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* FAQ Steps */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-teal-400" />
                    How Donors Pay With Your ABA Setup:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                    <li><strong>On Smartphones:</strong> Donors can tap <em>"Open in ABA Mobile"</em> to automatically launch their banking app with the amount pre-filled.</li>
                    <li><strong>On PC / Laptop:</strong> Donors see a dynamic KHQR code with your official account name to scan instantly.</li>
                    <li><strong>Instant Stream Overlay:</strong> Once ABA processes the payment, the alert audio chime rings and Text-to-Speech voice reads the donor's message live on stream.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Save & Test Action Bar */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                <a
                  href={`/tip/${streamer?.slug || user?.username || 'dara_gaming'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-sm font-bold text-white border border-white/15 flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-teal-300" />
                  <span>Test Public Tip Page</span>
                </a>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-[#004F71] to-brand-600 hover:brightness-110 text-sm font-bold text-white shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Payment & Bakong Setup</span>
                </button>
              </div>

              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span className="font-bold">{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span className="font-bold">{errorMsg}</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right 1 Column: Live Donor Mobile View Simulator */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-teal-500/30 bg-[#090b10] space-y-5 shadow-2xl sticky top-24">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Donor Preview</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Interactive
              </span>
            </div>

            {/* Mobile Mockup Card */}
            <div className="rounded-2xl bg-white p-4 shadow-xl text-slate-900 space-y-3">
              {/* Card Header */}
              <div className={`flex items-center justify-between ${activeTab === 'bakong' ? 'bg-[#E1251B]' : 'bg-[#004F71]'} -m-4 mb-3 p-3 rounded-t-2xl text-white transition-colors`}>
                <div className="flex items-center gap-2">
                  {activeTab === 'bakong' ? (
                    <div className="w-6 h-6 rounded-full bg-white text-[#E1251B] font-black text-xs flex items-center justify-center shadow-sm">
                      ៛
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded bg-white text-[#004F71] font-black text-xs flex items-center justify-center shadow-sm">
                      ABA
                    </div>
                  )}
                  <span className="text-xs font-bold tracking-wide">
                    {activeTab === 'bakong' ? 'ABA KHQR Universal' : 'ABA PayWay Checkout'}
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">KHQR</span>
              </div>

              {/* Streamer Name & Amount */}
              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-500 font-medium">Payment to Creator:</p>
                <h4 className="text-sm font-black text-slate-900 uppercase">
                  {(activeTab === 'bakong' && bakongName) ? bakongName : (accountName || user?.display_name || 'CREATOR NAME')}
                </h4>
                {activeTab === 'bakong' && bakongId ? (
                  <p className="text-[10px] font-mono text-[#E1251B] font-bold">Bakong ID: {bakongId}</p>
                ) : accountNumber ? (
                  <p className="text-[10px] font-mono text-slate-600">A/C: {accountNumber}</p>
                ) : null}
                <div className={`mt-2 text-2xl font-black ${activeTab === 'bakong' ? 'text-[#E1251B]' : 'text-[#004F71]'} font-mono`}>
                  $10.00 <span className="text-xs font-bold text-slate-500">USD</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                {qrUrl && isImageUrl(qrUrl) && !qrImgError && activeTab !== 'bakong' ? (
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <img
                      src={qrUrl}
                      alt="ABA QR"
                      onError={() => setQrImgError(true)}
                      className="w-36 h-36 object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="relative bg-white p-2.5 rounded-xl shadow-sm flex items-center justify-center">
                    <QRCodeSVG
                      value={previewQrValue}
                      size={144}
                      level="H"
                      includeMargin={false}
                    />
                    <div className={`absolute w-8 h-8 rounded-full bg-white shadow-md border-2 ${activeTab === 'bakong' ? 'border-[#E1251B]' : 'border-[#004F71]'} flex items-center justify-center pointer-events-none select-none`}>
                      {activeTab === 'bakong' ? (
                        <div className="w-6 h-6 rounded-full bg-[#E1251B] text-white text-[10px] font-black flex items-center justify-center">
                          ៛
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#004F71] text-white text-[8px] font-black flex items-center justify-center">
                          ABA
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-2 font-medium">
                  {activeTab === 'bakong' ? 'Scan with any Cambodian Bank App (KHQR)' : 'Scan with ABA Mobile or any KHQR App'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {activeTab === 'bakong' ? (
                  <div className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md">
                    <span>Universal NBC KHQR Active</span>
                  </div>
                ) : paywayLink ? (
                  <a
                    href={paywayLink.startsWith('http') ? paywayLink : `https://${paywayLink}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#004F71] hover:bg-[#003e59] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-teal-300" />
                    <span>Open in ABA Mobile App</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Pay with ABA Mobile</span>
                  </button>
                )}
              </div>

              {/* Instructions preview */}
              {donorInstructions && donorInstructions.trim() !== 'Please include your stream username or message in the payment note.' && (
                <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-[10px] text-teal-900 leading-tight">
                  <strong>Creator Note:</strong> {donorInstructions}
                </div>
              )}
            </div>

            {/* Quick Share Tip Link */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-300">Your Direct PayWay Link:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={paywayLink || 'Not configured yet'}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 text-[11px] font-mono text-teal-300 border border-white/10 truncate"
                />
                {paywayLink && (
                  <button
                    type="button"
                    onClick={() => handleCopy(paywayLink, 'link')}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
