import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import soundService from '../../services/soundService';
import ttsService from '../../services/ttsService';
import api from '../../services/api';
import {
  Volume2,
  Sliders,
  Play,
  Copy,
  Check,
  Radio,
  Send,
  Sparkles,
  Zap,
  Palette,
  Eye,
  Heart,
  Plus,
  Trash2,
  ExternalLink,
  MessageSquare,
  Music,
  Video,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Image as ImageIcon,
  Upload,
  Smile,
  Film,
  HelpCircle,
  X
} from 'lucide-react';

// Curated Animated GIF Sticker Presets
const GIF_STICKER_PRESETS = [
  {
    id: 'money_rain',
    name: 'Money Rain 💸',
    category: 'Money',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXZ0NG4zZm93dzZ0ZnV3ejJubmRhN240aGFpNW92bW5mZjFod3J1NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0Ex6kAKAoFRsFh6M/giphy.gif'
  },
  {
    id: 'cheering_cat',
    name: 'Cheering Neko 🐱',
    category: 'Anime',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnB2N3B3bHhkdjc0a3VkaDN2eWNlZTN6dHh1ZXJ5ZDNnZmVlZ3U4MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/unQ3IJU2RG7DO/giphy.gif'
  },
  {
    id: 'gold_crown',
    name: 'Royal Crown 👑',
    category: 'VIP',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG9jOHpjaHdzMGJtY25rN2h2bzF5c3ZvaDF3bTZuN2N3NDdmaXN0NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif'
  },
  {
    id: 'pixel_victory',
    name: 'Pixel Trophy 🎮',
    category: 'Gaming',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWw3a2Rxdm0yMnNiaWttOW1ndnE5eG5mdTR6ODdzOHRkaGVmb2s0byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/artj92V8o75VPL7AeQ/giphy.gif'
  },
  {
    id: 'heart_shower',
    name: 'Kawaii Heart 💖',
    category: 'Love',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHhkdW9vYjFzZmxoamkzb2F1a21qZHVucW9va2Fia2h4eHlqd2k2eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26FLdmIp6wJr91JAI/giphy.gif'
  },
  {
    id: 'energy_dragon',
    name: 'Super Flame 🔥',
    category: 'Epic',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDVnbTFyZWoxMWkzbXdrbWpoanBwdmxqN3Y3eGhzODRna25hcmR6OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13HgwGsXF0aiGY/giphy.gif'
  }
];

// Curated Color Presets
const COLOR_PRESETS = [
  {
    id: 'cyber_gold',
    name: 'Cyber Gold',
    badge: 'bg-amber-400',
    headerColor: '#FFFFFF',
    bgColor: '#1F2430',
    borderColor: '#FFAA00',
    glowColor: '#FFAA00',
    glowSize: 18,
    amountBg: '#FFAA00',
    amountText: '#000000'
  },
  {
    id: 'electric_cyan',
    name: 'Electric Cyan',
    badge: 'bg-cyan-400',
    headerColor: '#FFFFFF',
    bgColor: '#0F2027',
    borderColor: '#00F0FF',
    glowColor: '#00F0FF',
    glowSize: 18,
    amountBg: '#00F0FF',
    amountText: '#000000'
  },
  {
    id: 'neon_violet',
    name: 'Neon Violet',
    badge: 'bg-purple-500',
    headerColor: '#FFFFFF',
    bgColor: '#1B122C',
    borderColor: '#A855F7',
    glowColor: '#C084FC',
    glowSize: 18,
    amountBg: '#A855F7',
    amountText: '#FFFFFF'
  },
  {
    id: 'hot_sakura',
    name: 'Hot Sakura',
    badge: 'bg-pink-500',
    headerColor: '#FFFFFF',
    bgColor: '#2B121E',
    borderColor: '#F43F5E',
    glowColor: '#FB7185',
    glowSize: 18,
    amountBg: '#F43F5E',
    amountText: '#FFFFFF'
  },
  {
    id: 'crimson_flame',
    name: 'Crimson Flame',
    badge: 'bg-rose-500',
    headerColor: '#FFFFFF',
    bgColor: '#2B1111',
    borderColor: '#EF4444',
    glowColor: '#F97316',
    glowSize: 18,
    amountBg: '#EF4444',
    amountText: '#FFFFFF'
  },
  {
    id: 'acid_emerald',
    name: 'Acid Emerald',
    badge: 'bg-emerald-400',
    headerColor: '#FFFFFF',
    bgColor: '#0D2818',
    borderColor: '#10B981',
    glowColor: '#34D399',
    glowSize: 18,
    amountBg: '#10B981',
    amountText: '#000000'
  }
];

export default function AlertSettings() {
  const { user, streamer } = useAuth();

  // Active Identifier
  const identifier = streamer?.slug || user?.username || 'dara_gaming';

  // Alert Settings state
  const [overlayToken, setOverlayToken] = useState('');
  const [animation, setAnimation] = useState('neon');
  const [preset, setPreset] = useState('cyber_gold');
  const [bgType, setBgType] = useState('transparent');
  const [headerColor, setHeaderColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#1F2430');
  const [borderColor, setBorderColor] = useState('#FFAA00');
  const [glowColor, setGlowColor] = useState('#FFAA00');
  const [glowSize, setGlowSize] = useState(15);
  const [actionText, setActionText] = useState('donated');
  const [mediaUrl, setMediaUrl] = useState('');
  const [soundUrl, setSoundUrl] = useState('chime');
  const [duration, setDuration] = useState(8);
  const [soundVolume, setSoundVolume] = useState(0.85);
  const [videoVolume, setVideoVolume] = useState(0.8);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsVolume, setTtsVolume] = useState(0.8);
  const [ttsVoice, setTtsVoice] = useState('khmer_natural');
  const [ttsTemplate, setTtsTemplate] = useState('{name} ឧបត្ថម្ភ {amount}! {message}');
  const [customTiers, setCustomTiers] = useState([
    { minAmount: 5, label: '$5+ Tier Alert', sound: 'cash', media: '' },
    { minAmount: 20, label: '$20+ VIP Alert', sound: 'victory', media: '' }
  ]);

  // Quick Test Alert Launcher state
  const [testDonorName, setTestDonorName] = useState('Top Supporter');
  const [testAmount, setTestAmount] = useState('10.00');
  const [testMessage, setTestMessage] = useState('រីករាយថ្ងៃកំណើត សូមជូនពរសុខភាពល្អ!');
  const [isAlertActive, setIsAlertActive] = useState(true);

  // Status & UI state
  const [copiedOverlay, setCopiedOverlay] = useState(false);
  const [showObsGuide, setShowObsGuide] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const obsOverlayUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/overlay/alert/${identifier}?token=${overlayToken || identifier}`
    : `https://zoeedonation.com/overlay/alert/${identifier}`;

  // Load existing alert settings
  useEffect(() => {
    if (!identifier) return;
    api.get(`/alerts/config/${identifier}`)
      .then(res => {
        if (res.success && res.data?.alertSettings) {
          const s = res.data.alertSettings;
          setOverlayToken(s.overlay_token || '');
          if (s.animation) setAnimation(s.animation);
          if (s.preset) setPreset(s.preset);
          if (s.bg_type) setBgType(s.bg_type);
          if (s.header_color) setHeaderColor(s.header_color);
          if (s.background_color) setBackgroundColor(s.background_color);
          if (s.border_color) setBorderColor(s.border_color);
          if (s.glow_color) setGlowColor(s.glow_color);
          if (s.glow_size !== undefined) setGlowSize(Number(s.glow_size));
          if (s.action_text) setActionText(s.action_text);
          if (s.media_url) setMediaUrl(s.media_url);
          if (s.sound_url) setSoundUrl(s.sound_url);
          if (s.duration) setDuration(Number(s.duration));
          if (s.sound_volume !== undefined) setSoundVolume(Number(s.sound_volume));
          if (s.video_volume !== undefined) setVideoVolume(Number(s.video_volume));
          if (s.tts_enabled !== undefined) setTtsEnabled(Boolean(s.tts_enabled));
          if (s.tts_volume !== undefined) setTtsVolume(Number(s.tts_volume));
          if (s.tts_voice) setTtsVoice(s.tts_voice);
          if (s.tts_template) setTtsTemplate(s.tts_template);
          if (Array.isArray(s.custom_tiers)) setCustomTiers(s.custom_tiers);
        }
      })
      .catch(err => {
        console.warn('Could not load alert settings:', err.message);
      });
  }, [identifier]);

  // Apply color preset
  const handleSelectPreset = (p) => {
    setPreset(p.id);
    setHeaderColor(p.headerColor);
    setBackgroundColor(p.bgColor);
    setBorderColor(p.borderColor);
    setGlowColor(p.glowColor);
    setGlowSize(p.glowSize);
  };

  // Copy Overlay URL
  const handleCopyOverlay = () => {
    navigator.clipboard.writeText(obsOverlayUrl);
    setCopiedOverlay(true);
    setTimeout(() => setCopiedOverlay(false), 2000);
  };

  // Launch Live OBS Popout Window
  const handleOpenObsPopout = () => {
    window.open(obsOverlayUrl, 'OBS_Alert_Overlay', 'width=800,height=600,menubar=no,toolbar=no,location=no,status=no');
  };

  // Save Alert Settings
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.put('/alerts/settings', {
        animation,
        preset,
        bg_type: bgType,
        header_color: headerColor,
        background_color: backgroundColor,
        border_color: borderColor,
        glow_color: glowColor,
        glow_size: glowSize,
        action_text: actionText,
        media_url: mediaUrl,
        sound_url: soundUrl,
        duration,
        sound_volume: soundVolume,
        video_volume: videoVolume,
        tts_enabled: ttsEnabled,
        tts_volume: ttsVolume,
        tts_voice: ttsVoice,
        tts_template: ttsTemplate,
        custom_tiers: customTiers
      });

      if (res.success) {
        setSuccessMsg('រក្សាទុកការកំណត់ Alert បានជោគជ័យ! (Alert settings saved successfully!)');
        soundService.playSound?.('cash', 0.6);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to save alert settings.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error saving alert configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Test Sound
  const handleTestAudio = () => {
    soundService.playSound?.(soundUrl || 'chime', soundVolume);
  };

  // Test Voice
  const handleTestVoice = () => {
    ttsService.speak?.({
      text: testMessage || 'សូមអរគុណសម្រាប់ការឧបត្ថម្ភ!',
      donorName: testDonorName || 'Supporter',
      amount: parseFloat(testAmount) || 10,
      currency: 'USD',
      voice: ttsVoice,
      volume: ttsVolume
    });
  };

  // Trigger Live Test Alert
  const handleTriggerLiveAlert = async () => {
    setTesting(true);
    setErrorMsg('');
    try {
      // 1. Trigger local preview animation
      setIsAlertActive(false);
      setTimeout(() => setIsAlertActive(true), 100);

      // 2. Play local audio & TTS
      soundService.playSound?.(soundUrl || 'chime', soundVolume);
      if (ttsEnabled) {
        setTimeout(() => {
          ttsService.speak?.({
            text: testMessage || 'សូមអរគុណសម្រាប់ការគាំទ្រ!',
            donorName: testDonorName || 'Supporter',
            amount: parseFloat(testAmount) || 10,
            currency: 'USD',
            voice: ttsVoice,
            volume: ttsVolume
          });
        }, 600);
      }

      // 3. Dispatch to OBS Overlay via WebSocket / Backend
      await api.post(`/alerts/test/${identifier}`, {
        streamerSlug: identifier,
        donorName: testDonorName || 'Top Supporter',
        amount: parseFloat(testAmount) || 10.00,
        currency: 'USD',
        message: testMessage || 'This is a live test donation alert!',
        mediaUrl: mediaUrl || null
      });

      setSuccessMsg('⚡ Live Test Alert triggered to OBS overlay!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn('Test alert dispatch warning:', err.message);
    } finally {
      setTesting(false);
    }
  };

  // Add custom alert tier
  const handleAddTier = () => {
    const nextAmount = (customTiers[customTiers.length - 1]?.minAmount || 20) + 30;
    setCustomTiers([
      ...customTiers,
      { minAmount: nextAmount, label: `$${nextAmount}+ Tier Alert`, sound: 'arcade', media: '' }
    ]);
  };

  const handleRemoveTier = (idx) => {
    setCustomTiers(customTiers.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans antialiased text-slate-100">
      {/* ── TOP HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            Alert Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Customize sound, photovideo media, custom action texts, and amount badge colors for pop-up alerts.
          </p>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono font-bold">@{identifier}</span>
          </div>

          <a
            href="https://discord.gg"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#7983F5] border border-[#5865F2]/40 font-bold transition-colors flex items-center gap-1.5"
          >
            Discord
          </a>

          <a
            href="https://t.me"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-cyan-300 border border-[#0088cc]/40 font-bold transition-colors flex items-center gap-1.5"
          >
            Telegram support
          </a>

          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Support</span>
          </button>
        </div>
      </div>

      {/* ── ALERT OVERLAY URL CARD & OBS CONTROL HUB ──────────────── */}
      <div className="rounded-2xl p-5 border border-white/10 space-y-4" style={{ background: '#12151D' }}>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Official OBS Browser Source Overlay URL</span>
              <span className="text-[10px] text-slate-400 font-mono">(Paste into OBS Studio / Streamlabs)</span>
            </div>
            {/* Dimensions Badge */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="text-slate-400">💡 ទទឹងនិងកម្ពស់ (Dimensions):</span>
              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono font-bold">
                800 × 600 px
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={obsOverlayUrl}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200 select-all focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyOverlay}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-98"
              >
                {copiedOverlay ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
                <span>{copiedOverlay ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenObsPopout}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-98"
                title="Open a live preview window for OBS"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Popout</span>
              </button>

              <button
                type="button"
                onClick={() => setShowObsGuide(!showObsGuide)}
                className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition-colors"
                title="View OBS Setup Instructions"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable OBS Setup Guide */}
        {showObsGuide && (
          <div className="p-4 rounded-xl bg-black/50 border border-amber-400/30 text-xs space-y-2 text-slate-300 animate-in fade-in">
            <h4 className="font-bold text-amber-400 flex items-center gap-2">
              <Radio className="w-4 h-4" />
              <span>របៀបដាក់ Alert ចូលក្នុង OBS Studio (Step-by-step OBS Guide):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] leading-relaxed">
              <li>បើកកម្មវិធី <strong>OBS Studio</strong> ឬ <strong>Streamlabs OBS</strong></li>
              <li>នៅផ្ទាំង <strong>Sources</strong> ចុចលើសញ្ញាបូក <strong className="text-white">(+)</strong> រួចជ្រើសរើស <strong className="text-amber-300">Browser Source</strong></li>
              <li>ដាក់ឈ្មោះឧទាហរណ៍ <em>"Zoee Live Alert"</em> រួចចុច <strong>OK</strong></li>
              <li>បិទភ្ជាប់ <strong>Alert Overlay URL</strong> ដែលបានចម្លងខាងលើចូលក្នុងប្រអប់ <strong>URL</strong></li>
              <li>កំណត់ទំហំ: <strong className="text-teal-300">Width: 800</strong> និង <strong className="text-teal-300">Height: 600</strong></li>
              <li>ចុច <strong>"Trigger Live Test Alert"</strong> ខាងក្រោម ដើម្បីតេស្តសាកល្បងភ្លាមៗ! 🎉</li>
            </ol>
          </div>
        )}
      </div>

      {/* ── TWO-COLUMN MAIN WORKSPACE ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: ALERT SETTINGS FORM (7 cols) ───────────── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl p-6 border border-white/10 space-y-6" style={{ background: '#12151D' }}>
            {/* Header */}
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Alert Settings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize sound, photovideo media, custom action texts, and amount badge colors for pop-up alerts.
              </p>
            </div>

            {/* ANIMATION VARIANT SELECTOR */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>បែបផែនចលនា Alert (Animation Style)</span>
                <span className="text-[10px] text-amber-400 font-mono">Current: {animation}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'neon', name: 'Neon Spring', desc: 'Glow & Spring' },
                  { id: 'bounce', name: 'Bouncy Pop', desc: 'High Bounce' },
                  { id: 'slide', name: 'Slide Motion', desc: 'Left to Center' },
                  { id: 'fade', name: 'Smooth Fade', desc: 'Blur & Fade' },
                  { id: 'zoom', name: 'Zoom Boom', desc: 'Scale Explosion' }
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAnimation(a.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      animation === a.id
                        ? 'bg-amber-400/20 border-amber-400 text-white shadow-md'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <p className="text-xs font-bold">{a.name}</p>
                    <p className="text-[10px] text-slate-400">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR PRESETS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>ជ្រើសរើសពណ៌ Presets (Color Presets)</span>
                <span className="text-[10px] text-amber-400 font-mono">Current: {preset}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                      preset === p.id
                        ? 'bg-white/15 border-amber-400 text-white shadow-md'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${p.badge}`}></span>
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ALERT BACKGROUND TYPE & DELETE BACKGROUND BUTTON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Alert Background Mode (ទម្រង់ផ្ទៃខាងក្រោយ Alert)
                </label>
                {bgType === 'transparent' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    ✓ Background Deleted (Transparent)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setBgType('transparent');
                      setBackgroundColor('transparent');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>លុប Background ចេញ (Delete Background)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'transparent', label: '🚫 Delete Background', desc: '100% Transparent' },
                  { id: 'solid', label: '⬛ Solid Dark', desc: 'Solid Card Fill' },
                  { id: 'glass', label: '🧊 Glass Frost', desc: 'Backdrop Blur' },
                  { id: 'neon', label: '⚡ Neon Glow', desc: 'Glowing Box' }
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setBgType(b.id);
                      if (b.id === 'transparent') {
                        setBackgroundColor('transparent');
                      } else if (backgroundColor === 'transparent') {
                        setBackgroundColor('#1F2430');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      bgType === b.id
                        ? 'bg-amber-400/20 border-amber-400 text-white shadow-md'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <p className="text-xs font-bold">{b.label}</p>
                    <p className="text-[10px] text-slate-400">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2-COLUMN COLOR CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Alert Amount Background Color */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">Card Background Color</label>
                  {bgType === 'transparent' && (
                    <span className="text-[10px] text-slate-500 italic">Disabled (Transparent)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-white/20 shrink-0"
                    style={{ backgroundColor: bgType === 'transparent' ? 'transparent' : backgroundColor }}
                  />
                  <input
                    type="text"
                    disabled={bgType === 'transparent'}
                    value={bgType === 'transparent' ? 'transparent' : backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200 disabled:opacity-50"
                  />
                  <label className={`px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300 cursor-pointer shrink-0 ${bgType === 'transparent' ? 'pointer-events-none opacity-50' : ''}`}>
                    Select
                    <input
                      type="color"
                      disabled={bgType === 'transparent'}
                      value={backgroundColor.startsWith('#') && backgroundColor.length === 7 ? backgroundColor : '#1F2430'}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Alert Amount Header Color */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Donor Name / Header Color</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-white/20 shrink-0"
                    style={{ backgroundColor: headerColor }}
                  />
                  <input
                    type="text"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200"
                  />
                  <label className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300 cursor-pointer shrink-0">
                    Select
                    <input
                      type="color"
                      value={headerColor.startsWith('#') && headerColor.length === 7 ? headerColor : '#FFFFFF'}
                      onChange={(e) => setHeaderColor(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Alert Border Glow Color */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Alert Border Glow Color</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-white/20 shrink-0"
                    style={{ backgroundColor: glowColor }}
                  />
                  <input
                    type="text"
                    value={glowColor}
                    onChange={(e) => setGlowColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200"
                  />
                  <label className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300 cursor-pointer shrink-0">
                    Select
                    <input
                      type="color"
                      value={glowColor.startsWith('#') && glowColor.length === 7 ? glowColor : '#FFAA00'}
                      onChange={(e) => setGlowColor(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Alert Amount Border / Stroke */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Alert Border Color</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-white/20 shrink-0"
                    style={{ backgroundColor: borderColor }}
                  />
                  <input
                    type="text"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200"
                  />
                  <label className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300 cursor-pointer shrink-0">
                    Select
                    <input
                      type="color"
                      value={borderColor.startsWith('#') && borderColor.length === 7 ? borderColor : '#FFAA00'}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* ALERT BORDER GLOW SIZE SLIDER */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Alert Border Glow Size ({glowSize}px)</span>
                <span className="text-[10px] text-amber-400 font-mono">{glowSize}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={glowSize}
                onChange={(e) => setGlowSize(Number(e.target.value))}
                className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* ALERT ACTION TEXT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Action Text (ពាក្យបង្ហាញ Donate)
              </label>
              <input
                type="text"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="e.g. donated or ឧបត្ថម្ភ"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* ── CUSTOM ALERT PHOTO & GIF STICKER ────────────────── */}
            <div className="pt-2 pb-2 space-y-3 rounded-2xl p-3.5 bg-black/30 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <ImageIcon className="w-4 h-4" />
                  <span>Custom Photo & GIF Sticker (រូបភាព / ស្ទិកឃ័រ GIF Alert)</span>
                </div>
                {mediaUrl && (
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo (លុបរូបភាព)</span>
                  </button>
                )}
              </div>

              {/* Active Photo/Sticker Preview Card */}
              {mediaUrl && (
                <div className="p-3 rounded-xl bg-black/50 border border-amber-400/40 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/60 border border-white/20 shrink-0 flex items-center justify-center relative shadow-md">
                    <img
                      src={mediaUrl}
                      alt="Selected Custom Visual"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Custom Photo Active</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                      {mediaUrl.startsWith('data:') ? 'Custom Uploaded Image (Base64)' : mediaUrl}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold shrink-0 transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* File Upload & Link Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black cursor-pointer shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition-all">
                    <Upload className="w-3.5 h-3.5 text-slate-950" />
                    <span>Upload Photo / GIF</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setMediaUrl(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="sr-only"
                    />
                  </label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Or paste image / GIF / video link..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                  {mediaUrl && (
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold shrink-0"
                      title="Clear"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  គាំទ្រ: PNG, JPG, GIF មានចលនា, WebP, SVG ឬ Link ពី Giphy/Tenor/Imgur
                </p>
              </div>

              {/* Preset GIF Sticker Gallery */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span>Popular GIF Stickers (ស្ទិកឃ័រ GIF ពេញនិយម 1-Click)</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {GIF_STICKER_PRESETS.map((sticker) => {
                    const isSelected = mediaUrl === sticker.url;
                    return (
                      <button
                        key={sticker.id}
                        type="button"
                        onClick={() => setMediaUrl(isSelected ? '' : sticker.url)}
                        className={`group relative p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-amber-400/25 border-amber-400 shadow-md shadow-amber-400/20 scale-105'
                            : 'bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-black/50">
                          <img
                            src={sticker.url}
                            alt={sticker.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 text-center truncate w-full">
                          {sticker.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ALERT SONG & SOUND TRACK LIBRARY */}
            <div className="space-y-2 rounded-2xl p-4 bg-black/30 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Music className="w-4 h-4" />
                  <span>Alert Song & Sound Track (ចម្រៀង និងសម្លេង Alert OBS)</span>
                </div>
                <button
                  type="button"
                  onClick={handleTestAudio}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-xs font-black text-black flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Play className="w-3.5 h-3.5 text-black fill-black" />
                  <span>Play Active Song</span>
                </button>
              </div>

              {/* Song Preset Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'chime', name: 'Cosmic Chime 🔔', desc: 'Star Melodic' },
                  { id: 'cash', name: 'Cash Register 💰', desc: 'ABA / Bakong' },
                  { id: 'victory', name: 'Victory Fanfare 🎺', desc: 'Epic Triumphant' },
                  { id: 'party', name: 'Party Horn 🥳', desc: 'Celebration' },
                  { id: 'kawaii', name: 'Kawaii Bell 🎀', desc: 'Anime Cute' },
                  { id: 'arcade', name: 'Retro Arcade 🕹️', desc: '8-bit Pixel' },
                  { id: 'cyber', name: 'Cyber Drop 🚀', desc: 'Sci-Fi Synth' },
                  { id: 'brass', name: 'Epic Brass 🎷', desc: 'Heroic Horn' },
                  { id: 'guitar', name: 'Rock Riff 🎸', desc: 'Electric Guitar' },
                  { id: 'level_up', name: 'Level Up 🌟', desc: 'Jingle Pop' },
                  { id: 'ding', name: 'Soft Crystal ✨', desc: 'Clean Tone' }
                ].map((s) => {
                  const isSelected = soundUrl === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSoundUrl(s.id);
                        soundService.playSound(s.id, soundVolume);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-amber-400/20 border-amber-400 text-white shadow-md'
                          : 'bg-black/40 border-white/10 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400">{s.desc}</p>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom MP3 / Song URL Input */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Custom Song URL / MP3 File (ចម្រៀងផ្ទាល់ខ្លួន)</span>
                  {soundUrl && (soundUrl.startsWith('http') || soundUrl.startsWith('data:audio/')) && (
                    <span className="text-[10px] text-amber-400 font-bold font-mono">Custom Song Active</span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-slate-200 cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Song</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setSoundUrl(reader.result);
                            soundService.playSound(reader.result, soundVolume);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="sr-only"
                    />
                  </label>
                  <input
                    type="text"
                    value={soundUrl}
                    onChange={(e) => setSoundUrl(e.target.value)}
                    placeholder="Or paste custom MP3 audio URL (e.g. https://.../song.mp3)"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                  {soundUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        soundService.playSound(soundUrl, soundVolume);
                      }}
                      className="p-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-400 border border-amber-400/40 text-xs shrink-0"
                      title="Test Audio"
                    >
                      <Play className="w-3.5 h-3.5 fill-amber-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── ALERT AUDIO & DURATION SETTINGS ───────────────────── */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Volume2 className="w-4 h-4" />
                <span>Alert Audio & Duration Settings (ការកំណត់សម្លេង និងរយៈពេល Alert)</span>
              </div>

              {/* Alert Duration */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Alert Duration (រយៈពេលបង្ហាញ Alert)</span>
                  <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-[10px] font-mono text-amber-400 font-bold">
                    {duration}s
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* MP3 & Video Volumes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>MP3 Sound / Chime (សម្លេង Alert)</span>
                    <span className="text-[10px] text-amber-400 font-mono">{Math.round(soundVolume * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => setSoundVolume(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleTestAudio}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[10px] font-bold text-slate-200 border border-white/10 shrink-0"
                    >
                      Test
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>YouTube / Video Alert (សម្លេងវីដេអូ)</span>
                    <span className="text-[10px] text-amber-400 font-mono">{Math.round(videoVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={videoVolume}
                    onChange={(e) => setVideoVolume(Number(e.target.value))}
                    className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* ── CUSTOM ALERT VARIATIONS BY AMOUNT ─────────────────── */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Custom Alert Variations by Amount (ការកំណត់ Alert តាមចំនួនប្រាក់)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    កំណត់រូបភាព GIF/វីដេអូ និងសម្លេងផ្សេងៗគ្នាសម្រាប់ចំនួនទឹកប្រាក់ Donate ផ្សេងៗគ្នា (ឧទាហរណ៍ $1, $5, $10, $50+)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-400 border border-amber-400/30 text-[11px] font-bold transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Alert Tier</span>
                </button>
              </div>

              {customTiers.length === 0 ? (
                <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center text-xs text-slate-500">
                  No custom tiers configured. Default alert settings will be used for all donation amounts.
                </div>
              ) : (
                <div className="space-y-2">
                  {customTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono font-bold text-[10px] shrink-0">
                          ≥ ${tier.minAmount}
                        </span>
                        <input
                          type="text"
                          value={tier.label}
                          onChange={(e) => {
                            const updated = [...customTiers];
                            updated[idx].label = e.target.value;
                            setCustomTiers(updated);
                          }}
                          className="flex-1 bg-transparent border-b border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400 py-0.5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── TEXT-TO-SPEECH (TTS) ──────────────────────────────── */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>Text-To-Speech (ការអានសំឡេង AI Voice)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Read Only 1 Active (No Overlap)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Enable TTS */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Enable TTS (បើក/បិទ)</label>
                  <select
                    value={ttsEnabled ? 'enable' : 'disable'}
                    onChange={(e) => setTtsEnabled(e.target.value === 'enable')}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="enable">Enable (បើក - AI អានម្ដងមួយសារ)</option>
                    <option value="disable">Disable (បិទ)</option>
                  </select>
                </div>

                {/* TTS Volume */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                    <span>TTS Volume ({Math.round(ttsVolume * 100)}%)</span>
                    <span className="text-[10px] text-amber-400 font-mono">{Math.round(ttsVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ttsVolume}
                    onChange={(e) => setTtsVolume(Number(e.target.value))}
                    className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2"
                  />
                </div>
              </div>

              {/* Voice Engine */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Voice Engine / Provider (ជ្រើសរើសសម្លេង TTS)
                </label>
                <select
                  value={ttsVoice}
                  onChange={(e) => setTtsVoice(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="khmer_natural">Khmer Natural - ស្រី (Khmer Natural Female 🇰🇭)</option>
                  <option value="khmer_male">Khmer Natural - ប្រុស (Khmer Radio Host 🎙️)</option>
                  <option value="anime_girl">Anime & Gamer Girl (កុលាប 🎀)</option>
                  <option value="en_female">English Studio (Olivia 🇺🇸)</option>
                  <option value="en_male">English Pro Gamer (Brian 🎮)</option>
                  <option value="cyber_synth">Cyberpunk Synth Bot 🤖</option>
                </select>
              </div>

              {/* TTS Template */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  TTS Template (គំរូសារអាន)
                </label>
                <input
                  type="text"
                  value={ttsTemplate}
                  onChange={(e) => setTtsTemplate(e.target.value)}
                  placeholder="សូមអរគុណដល់ {name} សម្រាប់ការឧបត្ថម្ភ {amount} និងការគាំទ្រ! {message}"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-500">
                  ស្លាកជំនួស: <span className="font-mono text-amber-300">{'{name}'}</span> ឬ <span className="font-mono text-amber-300">{'{donor}'}</span> ឈ្មោះអ្នកឧបត្ថម្ភ, <span className="font-mono text-amber-300">{'{amount}'}</span> ឬ <span className="font-mono text-amber-300">{'{price}'}</span> តម្លៃ/ចំនួនទឹកប្រាក់, <span className="font-mono text-amber-300">{'{message}'}</span> សារផ្ញើជូន
                </p>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span>សាកល្បងសំឡេង AI (Test Voice - Read 1)</span>
                </button>
              </div>
            </div>

            {/* ── SAVE BUTTON ───────────────────────────────────────── */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>កំពុងរក្សាទុក...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                    <span>រក្សាទុកការកំណត់ Alert (Save Alert Settings)</span>
                  </>
                )}
              </button>

              {successMsg && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold animate-in fade-in">
                  ✅ {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-bold animate-in fade-in">
                  ❌ {errorMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: MONITOR & TEST LAUNCHER (5 cols) ──────── */}
        <div className="lg:col-span-5 space-y-6">
          {/* LIVE ALERT MONITOR (PREVIEW) */}
          <div className="rounded-2xl p-5 border border-white/10 space-y-4" style={{ background: '#12151D' }}>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span>Live Alert Monitor (Preview)</span>
                </h2>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OBS Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                This shows what viewers see on stream in real-time when an alert triggers.
              </p>
            </div>

            {/* Realistic 16:9 Stream Stage */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center p-4"
              style={{
                background: 'radial-gradient(ellipse at center, #1e2433 0%, #0c0e14 100%)'
              }}
            >
              {/* Subtle Gaming Room Grid Pattern */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#FFAA00 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Alert Pop-Up */}
              {isAlertActive && (
                <div
                  className="relative z-10 max-w-[90%] p-4 rounded-2xl transition-all duration-500 animate-in zoom-in-95 text-center flex flex-col items-center gap-2.5"
                  style={{
                    backgroundColor: bgType === 'solid' ? backgroundColor : (bgType === 'glass' ? 'rgba(20,24,34,0.75)' : 'transparent'),
                    backdropFilter: bgType === 'glass' ? 'blur(16px)' : 'none',
                    border: `2px solid ${borderColor}`,
                    boxShadow: `0 0 ${glowSize}px ${glowColor}50, inset 0 0 ${glowSize / 2}px ${glowColor}25`
                  }}
                >
                  {/* Custom Photo / Sticker or Logo Medallion */}
                  <div className="relative flex items-center justify-center">
                    {mediaUrl ? (
                      <div className="relative p-1 rounded-2xl overflow-hidden max-h-28 max-w-[200px] flex items-center justify-center bg-black/40 border border-white/20 shadow-2xl">
                        <img
                          src={mediaUrl}
                          alt="Custom Alert Photo"
                          className="max-h-24 w-auto rounded-xl object-contain shadow-md"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src="/logo.png"
                        alt="Zoee"
                        className="w-14 h-14 rounded-2xl object-cover shadow-2xl border border-white/20"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div
                      className="absolute -inset-1 rounded-2xl -z-10 blur-sm opacity-60"
                      style={{ background: glowColor }}
                    />
                  </div>

                  {/* Donor & Action text */}
                  <div className="space-y-1">
                    <h3
                      className="text-base sm:text-lg font-black tracking-tight uppercase"
                      style={{ color: headerColor }}
                    >
                      {testDonorName || 'TOP SUPPORTER'}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-slate-950 font-mono shadow-md"
                      style={{
                        backgroundColor: borderColor,
                        boxShadow: `0 0 12px ${glowColor}80`
                      }}
                    >
                      <span>{actionText || 'donated'}</span>
                      <span>${Number(testAmount || 10).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Donor Message */}
                  {testMessage && (
                    <div className="px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-200 max-w-xs leading-relaxed">
                      "{testMessage}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* QUICK TEST ALERT LAUNCHER */}
          <div className="rounded-2xl p-5 border border-white/10 space-y-4" style={{ background: '#12151D' }}>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Quick Test Alert Launcher</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ធ្វើតេស្តសាកល្បង Alert លើ OBS, សម្លេង TTS, រូបភាព/វីដេអូ Animation ផ្ទាល់
              </p>
            </div>

            {/* PRESET CHIPS */}
            <div className="grid grid-cols-4 gap-2">
              {['1.00', '5.00', '10.00', '50.00'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTestAmount(amt)}
                  className={`py-2 px-1 rounded-xl text-xs font-black font-mono border transition-all text-center ${
                    testAmount === amt
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20'
                      : 'bg-black/40 text-slate-300 border-white/10 hover:bg-white/5'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* FORM INPUTS */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Donor Name</label>
                <input
                  type="text"
                  value={testDonorName}
                  onChange={(e) => setTestDonorName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Amount ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Message / TTS Text (សារបង្ហាញ)</label>
                <textarea
                  rows={2}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={handleTriggerLiveAlert}
                disabled={testing}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Broadcasting Alert to OBS...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>Trigger Live Test Alert</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
