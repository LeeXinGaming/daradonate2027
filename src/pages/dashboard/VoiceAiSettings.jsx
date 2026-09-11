import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ttsService from '../../services/ttsService';
import {
  Mic,
  Volume2,
  Play,
  Square,
  Save,
  RotateCcw,
  Sparkles,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Languages,
  SlidersHorizontal,
  Layers,
  Bot,
  AlertCircle,
  Radio,
  Zap
} from 'lucide-react';

const VOICE_PRESETS = [
  {
    id: 'khmer_natural',
    name: 'Khmer Natural (ស្រីមុំ)',
    description: 'Natural, warm, and friendly Cambodian female voice for cozy streams',
    lang: 'km-KH',
    badge: 'Popular 🇰🇭',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: '🌸',
    sampleText: 'សូមអរគុណសម្រាប់ការឧបត្ថម្ភ និងការគាំទ្រដល់ Channel ខ្ញុំបាទ/នាងខ្ញុំ!'
  },
  {
    id: 'khmer_male',
    name: 'Khmer Radio Host (ពិសិដ្ឋ)',
    description: 'Deep, crisp, and charismatic broadcaster voice for gaming streams',
    lang: 'km-KH',
    badge: 'Crisp & Deep 🎙️',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: '🎙️',
    sampleText: 'វ៉ោវ! សូមអរគុណបងប្អូនទាំងអស់គ្នាសម្រាប់ការចូលរួមបរិច្ចាគ!'
  },
  {
    id: 'anime_girl',
    name: 'Anime & Gamer Girl (កុលាប)',
    description: 'High-energy, cute, and upbeat anime voice style with cheerful pitch',
    lang: 'km-KH',
    badge: 'Anime & Cute 🎀',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    icon: '🎀',
    sampleText: 'អរគុណច្រើនមែនទែនណា៎! សប្បាយចិត្តខ្លាំងណាស់!'
  },
  {
    id: 'english_female',
    name: 'English AI Studio (Olivia)',
    description: 'Crystal-clear, natural studio American female English voice',
    lang: 'en-US',
    badge: 'Global Studio 🇺🇸',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: '✨',
    sampleText: 'Thank you so much for the wonderful donation and support!'
  },
  {
    id: 'english_male',
    name: 'English Pro Gamer (Brian)',
    description: 'Dynamic hype male voice tailored for esports and intense gaming highlights',
    lang: 'en-US',
    badge: 'Hype Esports 🎮',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: '🎮',
    sampleText: 'Huge shoutout and massive respect for dropping that donation!'
  },
  {
    id: 'cyber_synth',
    name: 'Cyberpunk Synth Bot',
    description: 'Futuristic robotic synthesizer voice for sci-fi and tech creators',
    lang: 'en-US',
    badge: 'Sci-Fi Synth 🤖',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: '🤖',
    sampleText: 'Donation packet received and verified. Thank you creator unit!'
  }
];

const TEMPLATE_PRESETS = [
  {
    label: '🇰🇭 សូមអរគុណសម្រាប់ការឧបត្ថម្ភ និងការគាំទ្រ (Recommended)',
    template: 'សូមអរគុណដល់ {donor} សម្រាប់ការឧបត្ថម្ភចំនួន {amount} និងការគាំទ្រ! សារ៖ {message}'
  },
  {
    label: '🇰🇭 Khmer Thank You Respectful',
    template: 'សូមអរគុណដល់បង {donor} សម្រាប់ការបរិច្ចាគ {amount}$ និងការគាំទ្រដល់ការផ្សាយផ្ទាល់! {message}'
  },
  {
    label: '🇰🇭 Khmer Gamer Hype',
    template: '🎉 វ៉ោវ! សូមអរគុណដល់ {donor} បាញ់មក {amount} ដុល្លារយ៉ាងកក្រើក! សារ៖ {message}'
  },
  {
    label: '🇬🇧 English Thank You for Support',
    template: 'Thank you {donor} for supporting with {amount}! Thank you so much for your support! {message}'
  },
  {
    label: '🇬🇧 English Hype Shoutout',
    template: 'Huge shoutout to {donor} for tipping {amount}! Thank you for your support! Message: {message}'
  }
];

export default function VoiceAiSettings() {
  const { user, streamer } = useAuth();

  // Settings State
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsVoice, setTtsVoice] = useState('khmer_natural');
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [ttsVolume, setTtsVolume] = useState(0.85);
  const [minAmount, setMinAmount] = useState(1.0);
  const [ttsTemplate, setTtsTemplate] = useState('{donor} បានឧបត្ថម្ភចំនួន {amount}! សារជូនពរ៖ {message}');
  const [tier1Template, setTier1Template] = useState('');
  const [tier2Template, setTier2Template] = useState('');
  const [tier3Template, setTier3Template] = useState('');
  const [showTierEditor, setShowTierEditor] = useState(false);

  // Safety & Moderation
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [spamFilter, setSpamFilter] = useState(true);
  const [maxChars, setMaxChars] = useState(180);

  // Simulator / Test State
  const [testDonor, setTestDonor] = useState('Sokha Gaming');
  const [testAmount, setTestAmount] = useState('10.00');
  const [testCurrency, setTestCurrency] = useState('USD');
  const [testMessage, setTestMessage] = useState('រីករាយថ្ងៃកំណើត សូមជូនពរសុខភាពល្អ ជោគជ័យគ្រប់ភារកិច្ច!');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'voices' | 'moderation'

  // Status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Load Settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings/voice-ai');
      if (res.success && res.data) {
        const d = res.data;
        if (d.tts_enabled !== undefined) setTtsEnabled(Boolean(d.tts_enabled));
        if (d.tts_voice) setTtsVoice(d.tts_voice);
        if (d.tts_speed !== undefined) setTtsSpeed(Number(d.tts_speed));
        if (d.tts_pitch !== undefined) setTtsPitch(Number(d.tts_pitch));
        if (d.tts_volume !== undefined) setTtsVolume(Number(d.tts_volume));
        if (d.minimum_tts_amount !== undefined) setMinAmount(Number(d.minimum_tts_amount));
        if (d.tts_template) setTtsTemplate(d.tts_template);
        if (d.tier1_template !== undefined) setTier1Template(d.tier1_template);
        if (d.tier2_template !== undefined) setTier2Template(d.tier2_template);
        if (d.tier3_template !== undefined) setTier3Template(d.tier3_template);
        if (d.profanity_filter !== undefined) setProfanityFilter(Boolean(d.profanity_filter));
        if (d.spam_filter !== undefined) setSpamFilter(Boolean(d.spam_filter));
        if (d.max_chars !== undefined) setMaxChars(Number(d.max_chars));
      }
    } catch (err) {
      console.warn('Could not load voice AI settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      const payload = {
        tts_enabled: ttsEnabled,
        tts_voice: ttsVoice,
        tts_speed: ttsSpeed,
        tts_pitch: ttsPitch,
        tts_volume: ttsVolume,
        minimum_tts_amount: minAmount,
        tts_template: ttsTemplate,
        tier1_template: tier1Template,
        tier2_template: tier2Template,
        tier3_template: tier3Template,
        profanity_filter: profanityFilter,
        spam_filter: spamFilter,
        max_chars: maxChars
      };

      const res = await api.put('/settings/voice-ai', payload);
      if (res.success) {
        setSaveSuccess('Voice AI & Custom Message settings saved successfully!');
        setTimeout(() => setSaveSuccess(''), 3500);
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset Voice AI settings to default values?')) return;
    try {
      const res = await api.post('/settings/voice-ai/reset');
      if (res.success && res.data) {
        const d = res.data;
        setTtsEnabled(d.tts_enabled);
        setTtsVoice(d.tts_voice);
        setTtsSpeed(d.tts_speed);
        setTtsPitch(d.tts_pitch);
        setTtsVolume(d.tts_volume);
        setMinAmount(d.minimum_tts_amount);
        setTtsTemplate(d.tts_template);
        setTier1Template(d.tier1_template || '');
        setTier2Template(d.tier2_template || '');
        setTier3Template(d.tier3_template || '');
        setProfanityFilter(d.profanity_filter);
        setSpamFilter(d.spam_filter);
        setMaxChars(d.max_chars);
        setSaveSuccess('Reset to defaults');
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      setSaveError(err.message);
    }
  };

  const insertTag = (tag) => {
    setTtsTemplate(prev => `${prev} ${tag}`);
  };

  const handleAuditionPreset = (preset) => {
    ttsService.previewVoice({
      text: preset.sampleText,
      voicePreset: preset.id,
      rate: ttsSpeed,
      pitch: ttsPitch,
      volume: ttsVolume
    });
  };

  const handlePlaySimulator = () => {
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    ttsService.speak({
      text: testMessage,
      donorName: testDonor,
      amount: parseFloat(testAmount) || 0,
      currency: testCurrency,
      rate: ttsSpeed,
      pitch: ttsPitch,
      volume: ttsVolume,
      voice: ttsVoice,
      template: ttsTemplate,
      tier1_template: tier1Template,
      tier2_template: tier2Template,
      tier3_template: tier3Template,
      streamerName: streamer?.slug || user?.username || 'Dara Gaming',
      profanity_filter: profanityFilter,
      spam_filter: spamFilter,
      max_chars: maxChars
    });

    setTimeout(() => {
      setIsPlaying(false);
    }, 5500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/40 via-brand-900/30 to-purple-950/40 border border-brand-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI TTS Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Mic className="w-8 h-8 text-brand-400 animate-pulse" />
              Custom AI Voice Messages
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Customize natural Khmer (ភាសាខ្មែរ) and English AI Voice alerts for your live stream.
              Configure custom Thank-You messages, tier announcements, realistic spoken currency, and test audio in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {saveSuccess && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}
        {saveError && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'templates'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Languages className="w-4 h-4" /> Message Templates & Tags
        </button>
        <button
          onClick={() => setActiveTab('voices')}
          className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'voices'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" /> AI Voice Profiles & Fine-Tuning
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'moderation'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Safety & Content Moderation
        </button>
      </div>

      {/* TAB 1: Templates & Message Customization */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Template Editor */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Languages className="w-5 h-5 text-brand-400" />
                    Custom AI Spoken Template
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    This message will be spoken by AI Voice whenever a viewer tips on your live stream.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Enable AI TTS:</span>
                  <input
                    type="checkbox"
                    checked={ttsEnabled}
                    onChange={(e) => setTtsEnabled(e.target.checked)}
                    className="toggle-checkbox h-5 w-9 rounded-full bg-slate-700 checked:bg-brand-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Tag Insertion Helper */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Insert Dynamic Variables (ចុចបញ្ចូល Tag):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { tag: '{donor}', label: '👤 {donor} (ឈ្មោះអ្នកបរិច្ចាគ)' },
                    { tag: '{price}', label: '💵 {price} (តម្លៃ / ចំនួនទឹកប្រាក់)' },
                    { tag: '{amount}', label: '💰 {amount} (ចំនួនទឹកប្រាក់)' },
                    { tag: '{currency}', label: '🇰🇭 {currency} (រូបិយប័ណ្ណ)' },
                    { tag: '{message}', label: '💬 {message} (សារអ្នកគាំទ្រ)' },
                    { tag: '{streamer}', label: '👑 {streamer} (ឈ្មោះ Streamer)' },
                  ].map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => insertTag(item.tag)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-brand-500/20 hover:border-brand-500/50 border border-slate-700 text-xs font-mono text-brand-300 transition flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3 text-brand-400" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Textarea */}
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={ttsTemplate}
                  onChange={(e) => setTtsTemplate(e.target.value)}
                  placeholder="{donor} បានឧបត្ថម្ភចំនួន {amount}! សារជូនពរ៖ {message}"
                  className="w-full bg-slate-900/80 border border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl p-4 text-white text-base font-medium placeholder-slate-500 transition leading-relaxed"
                />
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Voice AI will convert numeric amounts (e.g. $5.00) to natural spoken Khmer: <span className="text-brand-300 font-semibold">«៥ ដុល្លារ»</span> or English: <span className="text-indigo-300 font-semibold">«5 dollars»</span>.
                </p>
              </div>

              {/* Quick Template Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Quick Khmer & English Presets:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TEMPLATE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTtsTemplate(p.template)}
                      className="p-2.5 text-left rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-brand-500/40 text-xs transition space-y-1"
                    >
                      <div className="font-semibold text-white">{p.label}</div>
                      <div className="text-slate-400 line-clamp-1 text-[11px] font-mono">{p.template}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Donation Tier Greetings */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-400" />
                    Tier-Based Custom Greetings (តាមកម្រិតបរិច្ចាគ)
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Set high-energy celebration messages for Super Tips ($5+) and VIP Whale Donors ($20+).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTierEditor(!showTierEditor)}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-brand-400 border border-slate-700 hover:bg-slate-700 transition"
                >
                  {showTierEditor ? 'Hide Tiers' : 'Customize Tiers'}
                </button>
              </div>

              {showTierEditor && (
                <div className="space-y-4 pt-3 border-t border-slate-800 animate-fade-in">
                  {/* Tier 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Standard Tier (&lt; $5)</span>
                      <span className="text-[10px] font-semibold text-slate-500">Normal greeting</span>
                    </div>
                    <input
                      type="text"
                      value={tier1Template}
                      onChange={(e) => setTier1Template(e.target.value)}
                      placeholder="{donor} បានឧបត្ថម្ភចំនួន {amount}! {message}"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-brand-500"
                    />
                  </div>

                  {/* Tier 2 */}
                  <div className="p-3.5 rounded-xl bg-brand-950/20 border border-brand-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-400">🔥 Super Tier ($5 - $19.99)</span>
                      <span className="text-[10px] font-semibold text-brand-500">Medium celebration</span>
                    </div>
                    <input
                      type="text"
                      value={tier2Template}
                      onChange={(e) => setTier2Template(e.target.value)}
                      placeholder="អរគុណច្រើនបង {donor} សម្រាប់ការឧបត្ថម្ភ {amount}! {message}"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-brand-500"
                    />
                  </div>

                  {/* Tier 3 */}
                  <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">👑 VIP Mega Tier ($20+)</span>
                      <span className="text-[10px] font-semibold text-purple-400">Maximum Hype</span>
                    </div>
                    <input
                      type="text"
                      value={tier3Template}
                      onChange={(e) => setTier3Template(e.target.value)}
                      placeholder="🎉 វ៉ោវ! មហាសេដ្ឋី {donor} បានបាញ់ {amount} ដុល្លារយ៉ាងកក្រើក! សារជូនពរ៖ {message}"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Simulator & Live Audio Test */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-brand-500/30 bg-gradient-to-b from-brand-950/20 to-slate-900/60 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-brand-400 animate-pulse" />
                  Live Voice AI Audition
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Real-time Synthesizer
                </span>
              </div>

              {/* Interactive Test Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Test Donor Name:</label>
                  <input
                    type="text"
                    value={testDonor}
                    onChange={(e) => setTestDonor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Amount ($):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={testAmount}
                      onChange={(e) => setTestAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Currency:</label>
                    <select
                      value={testCurrency}
                      onChange={(e) => setTestCurrency(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white mt-1"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="KHR">KHR (រៀល)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Donor Spoken Message:</label>
                  <textarea
                    rows={2}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white mt-1"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handlePlaySimulator}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-500/30'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-4 h-4 fill-current" /> Stop Audio (កំពុងចាក់សំឡេង...)
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Test AI Voice (ស្ដាប់សំឡេង Voice AI)
                  </>
                )}
              </button>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Selected Voice:</div>
                <div className="text-brand-300 font-mono">
                  {VOICE_PRESETS.find(v => v.id === ttsVoice)?.name || ttsVoice}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Voice Profiles & Fine Tuning */}
      {activeTab === 'voices' && (
        <div className="space-y-8">
          {/* Preset Voice Cards */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand-400" />
              Available AI Voice Profiles
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Choose the AI personality that fits your live stream theme. Click "Audition Voice" to preview each preset immediately.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {VOICE_PRESETS.map((preset) => {
                const isSelected = ttsVoice === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-brand-950/40 border-brand-500 shadow-xl shadow-brand-500/10 ring-1 ring-brand-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                    onClick={() => setTtsVoice(preset.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{preset.icon}</span>
                          <div>
                            <h4 className="font-bold text-white text-sm">{preset.name}</h4>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border mt-0.5 ${preset.badgeColor}`}>
                              {preset.badge}
                            </span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="voicePreset"
                          checked={isSelected}
                          onChange={() => setTtsVoice(preset.id)}
                          className="text-brand-500 focus:ring-brand-500 h-4 w-4 bg-slate-800 border-slate-700"
                        />
                      </div>

                      <p className="text-slate-400 text-xs leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAuditionPreset(preset);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
                      >
                        <Play className="w-3 h-3 text-brand-400 fill-current" /> Audition Voice
                      </button>

                      {isSelected && (
                        <span className="text-xs font-bold text-brand-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio Fine-Tuning Controls */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-brand-400" />
              Acoustic & Speech Fine-Tuning
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Speed Rate Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Speech Rate (ល្បឿន):</label>
                  <span className="text-xs font-mono font-bold text-brand-400">{ttsSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.8"
                  step="0.05"
                  value={ttsSpeed}
                  onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.6x (Slow)</span>
                  <span>1.0x (Normal)</span>
                  <span>1.8x (Fast)</span>
                </div>
              </div>

              {/* Pitch Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Voice Pitch (សម្លេង):</label>
                  <span className="text-xs font-mono font-bold text-brand-400">{ttsPitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={ttsPitch}
                  onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Deep / Bass</span>
                  <span>Natural</span>
                  <span>High / Cute</span>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Volume (កម្រិតសម្លេង):</label>
                  <span className="text-xs font-mono font-bold text-brand-400">{Math.round(ttsVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={ttsVolume}
                  onChange={(e) => setTtsVolume(parseFloat(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Mute</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Min Amount Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Minimum TTS ($):</label>
                  <span className="text-xs font-mono font-bold text-brand-400">${minAmount.toFixed(2)}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Only read messages for tips &ge; this amount.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Safety & Content Moderation */}
      {activeTab === 'moderation' && (
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              Smart Content Moderation & Spam Shield
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Protect your live stream and audience from abusive text, repetitive character spam, and profanity.
            </p>
          </div>

          <div className="space-y-4">
            {/* Profanity Filter */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="space-y-0.5">
                <div className="font-bold text-white text-sm">Bilingual Profanity Filter</div>
                <div className="text-xs text-slate-400">
                  Automatically filters inappropriate English and Khmer vulgar terms before AI voice reading.
                </div>
              </div>
              <input
                type="checkbox"
                checked={profanityFilter}
                onChange={(e) => setProfanityFilter(e.target.checked)}
                className="h-5 w-9 rounded-full bg-slate-700 checked:bg-brand-500 cursor-pointer"
              />
            </div>

            {/* Anti-Spam Repeats */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="space-y-0.5">
                <div className="font-bold text-white text-sm">Anti-Spam Character Reducer</div>
                <div className="text-xs text-slate-400">
                  Compresses repetitive characters (e.g., "55555555" or "aaaaaaa") to prevent TTS stall.
                </div>
              </div>
              <input
                type="checkbox"
                checked={spamFilter}
                onChange={(e) => setSpamFilter(e.target.checked)}
                className="h-5 w-9 rounded-full bg-slate-700 checked:bg-brand-500 cursor-pointer"
              />
            </div>

            {/* Max Characters */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Max Spoken Characters Limit</div>
                  <div className="text-xs text-slate-400">Limit how long a message can be read aloud.</div>
                </div>
                <span className="text-sm font-mono font-bold text-brand-400">{maxChars} characters</span>
              </div>
              <input
                type="range"
                min="40"
                max="300"
                step="10"
                value={maxChars}
                onChange={(e) => setMaxChars(parseInt(e.target.value, 10))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
