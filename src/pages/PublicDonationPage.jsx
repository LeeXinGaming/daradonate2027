import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';
import {
  Heart,
  Share2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  User,
  MessageSquare,
  AlertCircle,
  Clock,
  Send,
  ExternalLink,
  Flame,
  Trophy,
  CheckCircle2,
  Music,
  Disc,
  Play,
  Radio,
  Video,
  LayoutGrid,
  Unlock,
  Clipboard,
  Upload,
  X
} from 'lucide-react';

export function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const PRESET_AMOUNTS_USD = ['1', '5', '10', '20', '50'];
const PRESET_AMOUNTS_KHR = ['4000', '20000', '40000', '80000', '200000'];

export default function PublicDonationPage() {
  const { username: rawUsername } = useParams();
  const username = (rawUsername || 'dara_gaming').replace(/^@/, '');
  const navigate = useNavigate();

  const [streamer, setStreamer] = useState(null);
  const [donationPageSettings, setDonationPageSettings] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [topSupporters, setTopSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  
  const [donorName, setDonorName] = useState(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('zoee_donor_name') || '') : '';
  });
  const [nameSaved, setNameSaved] = useState(false);

  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CUTLUY');
  const [songUrl, setSongUrl] = useState('');

  // Donor Avatar Upload
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Modal states
  const [submitting, setSubmitting] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic share URL - Official Tip Link
  const publicShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tip/${username}`
    : `https://zoeedonate.com/tip/${username}`;

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([
      api.get(`/streamers/${username}`).catch(() => null),
      api.get(`/donations/recent/${username}?limit=8`).catch(() => null)
    ])
      .then(([streamRes, recentRes]) => {
        if (streamRes?.success && streamRes.data) {
          setStreamer(streamRes.data.streamer);
          setDonationPageSettings(streamRes.data.donationPageSettings || null);
          setTopSupporters(streamRes.data.topSupporters || []);

          if (streamRes.data.streamer?.currency) {
            setCurrency(streamRes.data.streamer.currency);
          }

          const pageTitle = `Tip @${streamRes.data.streamer?.slug || username} | Zoee Donation`;
          document.title = pageTitle;
        } else {
          setError(`Streamer '@${username}' was not found.`);
        }

        if (recentRes?.success && Array.isArray(recentRes.data)) {
          setRecentDonations(recentRes.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load creator profile.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  const handleCurrencyChange = (newCurr) => {
    setCurrency(newCurr);
    setIsCustom(false);
    if (newCurr === 'KHR') {
      setAmount('4000');
    } else {
      setAmount('1');
    }
  };

  const handlePresetClick = (val) => {
    setIsCustom(false);
    setAmount(val);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    if (!customAmount) {
      setCustomAmount(amount);
    }
  };

  const handleSaveName = () => {
    if (donorName.trim()) {
      localStorage.setItem('zoee_donor_name', donorName.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  const handlePasteSongUrl = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setSongUrl(text.trim());
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError('File size exceeds 15MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = (e) => {
    e.stopPropagation();
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentAmountNum = isCustom ? parseFloat(customAmount || '0') : parseFloat(amount || '0');

  // Converted subtext calculation
  const convertedSubtext = currency === 'USD'
    ? `Custom: $${(currentAmountNum || 1).toFixed(2)} USD (≈ ${(Math.round((currentAmountNum || 1) * 4000)).toLocaleString()} ៛)`
    : `Custom: ${(currentAmountNum || 4000).toLocaleString()} ៛ (≈ $${((currentAmountNum || 4000) / 4000).toFixed(2)} USD)`;

  const handleCreateDonation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    const finalAmount = isCustom ? parseFloat(customAmount) : parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    const minAmount = donationPageSettings?.min_amount || streamer?.min_donation_amount || 0.10;
    if (currency === 'USD' && finalAmount < minAmount) {
      setError(`Minimum donation amount is $${minAmount.toFixed(2)} USD.`);
      return;
    }
    if (currency === 'KHR' && finalAmount < 100) {
      setError('Minimum donation amount is 100 ៛.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/donations', {
        streamerSlug: username,
        amount: finalAmount,
        currency,
        donorName: anonymous ? 'Anonymous' : (donorName.trim() || 'Supporter'),
        anonymous,
        message: message.trim(),
        paymentMethod,
        mediaUrl: songUrl.trim() || null,
        donorAvatar: avatarPreview || null
      });

      if (res.success && res.data) {
        setActivePayment({
          ...res.data,
          aba_payway_link: streamer.aba_payway_link,
          aba_qr_url: streamer.aba_qr_url,
          aba_account_name: streamer.aba_account_name,
          aba_account_number: streamer.aba_account_number,
          aba_instructions: streamer.aba_instructions,
          aba_enabled: streamer.aba_enabled,
          bakong_id: streamer.bakong_id || res.data?.bakong_id,
          bakong_name: streamer.bakong_name || res.data?.bakong_name
        });
      } else {
        setError(res.message || 'Failed to initiate donation transaction.');
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate donation transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-mono tracking-wide">Loading Creator Tip Page...</p>
      </div>
    );
  }

  if (!streamer) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel rounded-3xl text-center space-y-4 border border-white/10">
        <h2 className="text-xl font-bold text-white">Creator Not Found</h2>
        <p className="text-xs text-slate-400">{error || `No creator exists with username '@${username}'.`}</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-all">
          Return to Home
        </Link>
      </div>
    );
  }

  const displayName = streamer.profile?.display_name || streamer.slug || 'dara';
  const streamerInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'DA';

  const presets = currency === 'USD' ? PRESET_AMOUNTS_USD : PRESET_AMOUNTS_KHR;

  return (
    <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6 font-sans antialiased selection:bg-amber-500 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Quick Top Share Bar */}
        <div className="flex items-center justify-between px-2 text-xs">
          <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            ← Home
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Tip Link'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* MAIN TIP INTERFACE (Exact Match to Design) */}
        <div className="max-w-[490px] mx-auto w-full">
          <form
            onSubmit={handleCreateDonation}
            className="rounded-[32px] bg-[#0c101d] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 sm:p-8 space-y-6 relative overflow-hidden"
          >
            {/* Top Avatar with LIVE Badge */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-4 border-amber-400 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.5)] overflow-hidden">
                  {streamer.profile?.avatar_url ? (
                    <img
                      src={streamer.profile.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerText = streamerInitials;
                      }}
                    />
                  ) : (
                    <span className="text-3xl font-black text-black font-sans tracking-tight">
                      {streamerInitials}
                    </span>
                  )}
                </div>
                {/* LIVE Badge */}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#082215] border border-emerald-500/80 text-emerald-400 text-[10px] font-black tracking-wider flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE
                </div>
              </div>

              {/* Creator Names & Subtitle */}
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-4">
                {displayName}
              </h1>
              <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                @{streamer.slug}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                {donationPageSettings?.description || streamer.profile?.bio || 'Thank you for supporting my stream!'}
              </p>

              {/* Open Tip: No Account Needed Banner */}
              <div className="mt-3 inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold shadow-sm select-none">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>បរិច្ចាគភ្លាមៗ មិនបាច់បង្កើតគណនី (No sign-up needed · Tip as Guest)</span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Currency Switcher Buttons */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#121627] border border-white/10">
              <button
                type="button"
                onClick={() => handleCurrencyChange('USD')}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  currency === 'USD'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30'
                    : 'text-slate-300 hover:text-white font-bold'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyChange('KHR')}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  currency === 'KHR'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30'
                    : 'text-slate-300 hover:text-white font-bold'
                }`}
              >
                KHR (៛)
              </button>
            </div>

            {/* Featured Huge Amount Box */}
            <div className="rounded-3xl bg-[#090d19] border border-white/10 p-6 sm:p-7 text-center space-y-1 shadow-inner">
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono select-none">
                  {currency === 'USD' ? '$' : '៛'}
                </span>
                <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                  {isCustom ? (customAmount || '0.00') : (currency === 'USD' ? Number(amount).toFixed(2) : Number(amount).toLocaleString())}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono pt-1">
                {convertedSubtext}
              </p>
            </div>

            {/* Quick Preset Pills */}
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2">
                {presets.map((val) => {
                  const isSelected = !isCustom && amount === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetClick(val)}
                      className={`py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black border-amber-400 shadow-md shadow-amber-500/30 scale-105'
                          : 'bg-[#121627] text-white border-white/10 hover:border-amber-500/40'
                      }`}
                    >
                      {currency === 'USD' ? `$${val}` : `${val >= 1000 ? `${val / 1000}k` : val}`}
                    </button>
                  );
                })}
                {/* Custom Pill */}
                <button
                  type="button"
                  onClick={handleCustomClick}
                  className={`py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
                    isCustom
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black border-amber-400 shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-[#121627] text-white border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Inline Custom Amount Input if Custom Selected */}
              {isCustom && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-400 font-mono">
                      {currency === 'USD' ? '$' : '៛'}
                    </span>
                    <input
                      type="number"
                      min={currency === 'USD' ? '0.10' : '100'}
                      step="any"
                      placeholder="Enter custom amount..."
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#090d19] border border-amber-500/50 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 text-center font-bold"
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Field: Your Name + Save button + Anonymous Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Your Name (ឈ្មោះអ្នកផ្ញើ)</span>
                </label>
                {!anonymous && donorName.trim() && (
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {nameSaved ? 'Saved! ✅' : 'Save Name'}
                  </button>
                )}
              </div>
              <input
                type="text"
                value={anonymous ? 'Anonymous Supporter' : donorName}
                onChange={(e) => setDonorName(e.target.value)}
                disabled={anonymous}
                placeholder="e.g. Sokha, Fan, or Guest (Optional)"
                maxLength={50}
                className={`w-full px-4 py-3 rounded-2xl bg-[#090d19] border text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors font-medium ${
                  anonymous ? 'opacity-50 border-white/5 cursor-not-allowed bg-white/5 text-slate-400' : 'border-white/10 focus:border-amber-500'
                }`}
              />
              <div className="flex items-center justify-between pt-0.5 px-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded-lg bg-[#090d19] border-white/20 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="font-semibold">Donate Anonymously (មិនបញ្ចេញឈ្មោះ)</span>
                </label>
                <span className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Guest tip
                </span>
              </div>
            </div>

            {/* Field: Message + Counter 0/100 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Message</label>
                <span className="text-xs text-slate-500 font-mono">{message.length}/100</span>
              </div>
              <textarea
                rows={3}
                maxLength={100}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message for the stream..."
                className="w-full px-4 py-3 rounded-2xl bg-[#090d19] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none transition-colors"
              />
            </div>

            {/* Field: YouTube Media Share + Unlocked badge + Paste button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 fill-white text-white translate-x-0.5" />
                  </div>
                  <span className="text-xs font-bold text-white">តំណភ្ជាប់យូធូប (វីដេអូ)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <Unlock className="w-2.5 h-2.5" />
                  Unlocked
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={songUrl}
                  onChange={(e) => setSongUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-4 pr-24 py-3 rounded-2xl bg-[#090d19] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={handlePasteSongUrl}
                  className="absolute right-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors active:scale-95"
                >
                  <Clipboard className="w-3 h-3 text-slate-300" />
                  Paste
                </button>
              </div>

              {/* YouTube Thumbnail Preview */}
              {getYouTubeId(songUrl) && (
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/40 border border-amber-500/30 mt-2">
                  <img
                    src={`https://img.youtube.com/vi/${getYouTubeId(songUrl)}/mqdefault.jpg`}
                    alt="Song Thumbnail"
                    className="w-16 h-12 rounded-xl object-cover shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-accent-cyan text-[11px] font-bold">
                      <Disc className="w-3.5 h-3.5 animate-spin-slow" />
                      <span>YouTube Song Attached</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      ID: {getYouTubeId(songUrl)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Ready to Play
                  </span>
                </div>
              )}
            </div>

            {/* Field: Profile Photo (optional) Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Profile Photo (optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-amber-500/40 rounded-2xl p-5 text-center transition-colors cursor-pointer bg-[#090d19]/40 group"
              >
                {avatarPreview ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={avatarPreview} alt="Donor Avatar" className="w-10 h-10 rounded-full object-cover border border-amber-400" />
                      <span className="text-xs text-slate-200 font-medium">Photo uploaded successfully</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                      Click to upload a profile photo
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      JPG, PNG, GIF, WebP - Max 15MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* PAYMENT METHOD SELECTOR */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Payment Gateway (វិធីសាស្ត្របង់ប្រាក់)</span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">Auto Payment Live</span>
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {/* ABA KHQR Universal Card */}
                <div
                  onClick={() => setPaymentMethod('CUTLUY')}
                  className="p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 border-[#00E5FF] bg-gradient-to-r from-[#003853]/90 to-[#005F83]/70 shadow-lg shadow-cyan-500/20 scale-[1.00]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#003853] border border-[#00E5FF]/40 text-[#00E5FF] font-black text-xs flex items-center justify-center shadow-md">
                      ABA
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-white truncate">ABA KHQR</h4>
                        <span className="text-[9px] font-bold bg-[#00E5FF] text-slate-950 px-2 py-0.5 rounded-full">
                          Instant Auto Pay
                        </span>
                      </div>
                      <p className="text-[10px] text-cyan-200/90 truncate">
                        ABA Mobile & All Banking Apps
                      </p>
                    </div>
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 border-[#00E5FF] bg-[#00E5FF]">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                  </div>
                </div>
              </div>
            </div>

            {/* BIG AMBER DONATE BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-black text-base text-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-[0.99] shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {submitting ? (
                <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
              ) : (
                <>
                  <LayoutGrid className="w-5 h-5 text-black fill-black" />
                  <span>Donate</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 2. LOWER SECTION: Recent Donations & Top Supporters */}
        <div className="max-w-[490px] mx-auto w-full grid grid-cols-1 gap-6 pt-4">
          {/* Top 3 Supporters Widget */}
          <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-[#0c101d] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Top Supporters</h3>
              </div>
              <Link to={`/leaderboard-avatar/${username}`} className="text-[11px] font-bold text-amber-400 hover:text-amber-300">
                Full Leaderboard →
              </Link>
            </div>

            {topSupporters.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Be the first to join the leaderboard!</p>
            ) : (
              <div className="space-y-2">
                {topSupporters.slice(0, 3).map((supporter, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      idx === 0
                        ? 'bg-amber-500/15 border-amber-400/50'
                        : idx === 1
                        ? 'bg-slate-300/10 border-slate-300/30'
                        : 'bg-amber-800/15 border-amber-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                        idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-slate-300 text-black' : 'bg-amber-700 text-white'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white truncate">{supporter.donor_name || supporter.name}</span>
                    </div>
                    <span className="text-xs font-black font-mono text-amber-300 shrink-0 ml-2">
                      ${Number(supporter.total_amount || supporter.total).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Donations Feed */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-[#0c101d] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Recent Live Tips</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Live
              </span>
            </div>

            {recentDonations.length === 0 ? (
              <div className="text-center py-6 space-y-1">
                <p className="text-xs text-slate-400">No tips yet.</p>
                <p className="text-[11px] text-slate-500">Be the first to cheer on @{username}!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDonations.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#121627] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.avatar_url || '/zoee-avatar.png'}
                          alt={item.donor_name}
                          className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0"
                          onError={(e) => { e.currentTarget.src = '/zoee-avatar.png'; }}
                        />
                        <span className="text-xs font-bold text-white truncate">{item.donor_name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400 shrink-0 ml-2">
                        {item.currency === 'KHR' ? `${Number(item.amount).toLocaleString()} ៛` : `$${Number(item.amount).toFixed(2)}`}
                      </span>
                    </div>
                    {item.message && (
                      <p className="text-[11px] text-slate-300 italic line-clamp-2">
                        "{item.message}"
                      </p>
                    )}
                    <span className="text-[9px] text-slate-500 font-mono block">
                      {getRelativeTime(item.paid_at || item.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SHARE MODAL */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#121627] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-accent-cyan" /> Share Creator Tip Link
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono text-slate-400">Official Tip Link:</label>
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#090d19] border border-white/10">
                  <input
                    type="text"
                    readOnly
                    value={publicShareUrl}
                    className="w-full px-3 py-1.5 bg-transparent text-xs text-amber-300 font-mono focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-black shrink-0 flex items-center gap-1 shadow-md transition-all"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(publicShareUrl)}&text=${encodeURIComponent(`Support ${displayName} on Zoee Donation!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-[#229ED9] text-xs font-bold border border-[#229ED9]/30 text-center block transition-all"
                >
                  Telegram
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicShareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] text-xs font-bold border border-[#1877F2]/30 text-center block transition-all"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicShareUrl)}&text=${encodeURIComponent(`Send a donation to ${displayName} on Zoee Donation!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 text-center block transition-all"
                >
                  X (Twitter)
                </a>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT MODAL (Bakong KHQR, ABA PayWay & CutLuy) */}
        {activePayment && (
          <PaymentModal
            paymentData={activePayment}
            onClose={() => setActivePayment(null)}
            onPaymentSuccess={() => {
              setActivePayment(null);
              // Refresh recent donations
              api.get(`/donations/recent/${username}?limit=8`).then((res) => {
                if (res.success && Array.isArray(res.data)) setRecentDonations(res.data);
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
