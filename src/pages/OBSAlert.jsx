import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Sparkles, Zap, Star, Music, Disc, Video, Radio, Volume2 } from 'lucide-react';
import soundService from '../services/soundService';
import ttsService from '../services/ttsService';
import api, { getApiUrl } from '../services/api';

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function isAudioFile(url) {
  if (!url) return false;
  return /\.(mp3|wav|ogg|m4a|aac)($|\?)/i.test(url) || /^data:audio\//i.test(url);
}

function isVideoFile(url) {
  if (!url) return false;
  return /\.(mp4|webm|mov|mkv)($|\?)/i.test(url) || /^data:video\//i.test(url);
}

function isImageOrGif(url) {
  if (!url) return false;
  if (getYouTubeId(url) || isAudioFile(url) || isVideoFile(url)) return false;
  return /^data:image\//i.test(url) || /\.(png|jpe?g|gif|webp|svg|avif|bmp)($|\?)/i.test(url) || url.startsWith('http') || url.startsWith('/');
}


// ─── Animation Variants ──────────────────────────────────────────────────────
const ANIMATION_VARIANTS = {
  neon: {
    initial: { opacity: 0, scale: 0.7, y: 60, filter: 'blur(12px)' },
    animate: {
      opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 280, damping: 22, duration: 0.55 }
    },
    exit: {
      opacity: 0, scale: 0.8, y: -50, filter: 'blur(8px)',
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  },
  bounce: {
    initial: { opacity: 0, scale: 0.4, y: -120 },
    animate: {
      opacity: 1, scale: 1, y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 18, duration: 0.6 }
    },
    exit: {
      opacity: 0, scale: 0.85, y: 80,
      transition: { duration: 0.35, ease: 'easeIn' }
    }
  },
  slide: {
    initial: { opacity: 0, x: -500, skewX: -12 },
    animate: {
      opacity: 1, x: 0, skewX: 0,
      transition: { type: 'spring', stiffness: 200, damping: 24, duration: 0.6 }
    },
    exit: {
      opacity: 0, x: 500,
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  },
  fade: {
    initial: { opacity: 0, scale: 0.92, filter: 'blur(4px)' },
    animate: {
      opacity: 1, scale: 1, filter: 'blur(0px)',
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: {
      opacity: 0, scale: 0.95,
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  },
  zoom: {
    initial: { opacity: 0, scale: 2.5, rotate: -5 },
    animate: {
      opacity: 1, scale: 1, rotate: 0,
      transition: { type: 'spring', stiffness: 320, damping: 25, duration: 0.55 }
    },
    exit: {
      opacity: 0, scale: 0.4, rotate: 8,
      transition: { duration: 0.35, ease: 'easeIn' }
    }
  }
};

// ─── Glowing Particle Burst (decorative sparkles) ────────────────────────────
function ParticleBurst({ active }) {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(i => {
        const angle = (i / 12) * 360;
        const dist = 60 + Math.random() * 80;
        const size = 4 + Math.random() * 6;
        const colors = ['#a78bfa', '#f472b6', '#22d3ee', '#fbbf24', '#34d399'];
        const color = colors[i % colors.length];
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size, height: size,
              backgroundColor: color,
              left: '50%', top: '50%',
              boxShadow: `0 0 8px 2px ${color}80`
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              opacity: 0,
              scale: 0.2
            }}
            transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

// ─── Progress / Countdown Bar ────────────────────────────────────────────────
// ─── Progress / Countdown Bar ────────────────────────────────────────────────
function CountdownBar({ durationSec, playing, glowColor = '#FFAA00' }) {
  const [progress, setProgress] = useState(100);
  useEffect(() => {
    if (!playing) { setProgress(100); return; }
    setProgress(100);
    const step = 100 / (durationSec * 20); // update 20x/sec
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev - step;
        if (next <= 0) { clearInterval(timer); return 0; }
        return next;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [playing, durationSec]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-3xl overflow-hidden bg-white/10">
      <motion.div
        className="h-full"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, #7c3aed, ${glowColor})`,
          boxShadow: `0 0 10px ${glowColor}`
        }}
        transition={{ ease: 'linear' }}
      />
    </div>
  );
}

// ─── Alert Card ───────────────────────────────────────────────────────────────
function AlertCard({ alertData, alertSettings, streamer, animation = 'neon', onDone }) {
  const [burst, setBurst] = useState(true);
  // Merge alert-specific settings or active streamer settings
  const currentSettings = alertData._settings || alertSettings || {};
  const activeMedia = alertData.media_url || currentSettings.media_url || '';
  const youtubeId = getYouTubeId(activeMedia);
  const durationSec = activeMedia
    ? Math.max(currentSettings.duration || 12, 18)
    : (currentSettings.duration || 8);
  const formattedAmount = alertData.currency === 'KHR'
    ? `${Number(alertData.amount).toLocaleString()} ៛`
    : `$${Number(alertData.amount).toFixed(2)}`;

  // Extracted Theme & Styling Tokens
  const bgColor = currentSettings.background_color || '#1F2430';
  const borderColor = currentSettings.border_color || '#FFAA00';
  const glowColor = currentSettings.glow_color || '#FFAA00';
  const glowSize = Number(currentSettings.glow_size ?? 18);
  const headerColor = currentSettings.header_color || '#FFFFFF';
  const actionText = currentSettings.action_text || 'donated';
  const bgType = currentSettings.bg_type || 'solid';

  // Compute card background fill
  let cardBackground = 'rgba(20, 24, 39, 0.94)';
  const isTransparent = bgType === 'transparent' || bgType === 'none' || bgType === 'deleted';
  
  if (isTransparent) {
    cardBackground = 'transparent';
  } else if (bgType === 'solid') {
    cardBackground = bgColor;
  } else if (bgType === 'gradient') {
    cardBackground = `linear-gradient(135deg, ${bgColor} 0%, rgba(13, 16, 29, 0.98) 100%)`;
  } else if (bgType === 'glass') {
    cardBackground = 'rgba(15, 20, 32, 0.65)';
  }

  const variants = ANIMATION_VARIANTS[animation] || ANIMATION_VARIANTS.neon;

  useEffect(() => {
    const t = setTimeout(() => setBurst(false), 900);
    return () => clearTimeout(t);
  }, []);

  const isTest = alertData.isTest;

  return (
    <motion.div
      key={alertData.id}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative"
    >
      <ParticleBurst active={burst} />

      {/* Main Alert Card Box - Streamer's Custom Alert Theme & Glow */}
      <div
        className="relative overflow-hidden"
        style={{
          background: cardBackground,
          backgroundColor: isTransparent ? 'transparent' : (bgType === 'solid' ? bgColor : undefined),
          border: isTransparent ? `1.5px solid ${borderColor}50` : `2px solid ${borderColor}`,
          borderRadius: '24px',
          boxShadow: isTransparent 
            ? `0 0 ${glowSize}px ${glowColor}40` 
            : `0 0 ${glowSize}px ${glowColor}99, 0 14px 44px rgba(0, 0, 0, 0.85)`,
          minWidth: 340,
          maxWidth: 540,
          backdropFilter: isTransparent ? 'none' : 'blur(16px)',
          WebkitBackdropFilter: isTransparent ? 'none' : 'blur(16px)',
          filter: isTransparent ? 'none' : 'drop-shadow(0 8px 30px rgba(0, 0, 0, 0.7))'
        }}
      >
        {/* Test badge */}
        {isTest && (
          <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/60 text-amber-300 text-[9px] font-black uppercase tracking-widest shadow-md">
            TEST ALERT
          </div>
        )}

        <div className="p-5 space-y-3.5">
          {/* Header Row: icon + badge */}
          <div className="flex items-center gap-3">
            {/* Pulsing Icon */}
            <motion.div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${borderColor}, ${glowColor})`,
                boxShadow: `0 0 20px ${glowColor}90`
              }}
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  `0 0 16px ${glowColor}60`,
                  `0 0 28px ${glowColor}99`,
                  `0 0 16px ${glowColor}60`
                ]
              }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: glowColor }}>
                  {isTest ? '🎭 Test Alert' : '🔴 New Donation'}
                </span>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: glowColor }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>
              {streamer && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  @{streamer.slug} · Zoee Donation Live
                </p>
              )}
            </div>

            {/* Amount Badge */}
            <motion.div
              className="shrink-0 px-3.5 py-1.5 rounded-xl font-black text-base font-mono text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${borderColor}, ${glowColor})`,
                boxShadow: `0 0 16px ${glowColor}80`
              }}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
            >
              {formattedAmount}
            </motion.div>
          </div>

          {/* Donor Name & Action Header */}
          <div className="space-y-1">
            <motion.h2
              className="text-2xl font-black tracking-tight"
              style={{
                color: headerColor,
                textShadow: `0 0 16px ${glowColor}80`,
                lineHeight: 1.15
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {alertData.donor_name || 'Anonymous'}
            </motion.h2>
            <motion.p
              className="text-xs font-semibold text-slate-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <span style={{ color: glowColor }}>{actionText}</span>{' '}
              <span className="font-bold text-white">{formattedAmount}</span>
              {alertData.payment_method ? ` · ${alertData.payment_method}` : ''}
            </motion.p>
          </div>

          {/* Message */}
          {alertData.message && (
            <motion.div
              className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-white leading-relaxed backdrop-blur-md"
              style={{
                background: isTransparent ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.55)',
                border: isTransparent ? `1px solid ${borderColor}40` : '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: isTransparent ? `0 0 12px ${glowColor}30` : '0 4px 20px rgba(0, 0, 0, 0.6)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <span className="font-black mr-1" style={{ color: glowColor }}>"</span>
              {alertData.message}
              <span className="font-black ml-1" style={{ color: glowColor }}>"</span>
            </motion.div>
          )}

          {/* 🖼️ Custom Photo / Animated GIF Sticker */}
          {activeMedia && isImageOrGif(activeMedia) && (
            <motion.div
              className="my-2 flex items-center justify-center relative overflow-hidden rounded-2xl p-1"
              style={{
                background: isTransparent ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.45)',
                border: `1.5px solid ${borderColor}60`,
                boxShadow: `0 0 16px ${glowColor}50`
              }}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
            >
              <img
                src={activeMedia}
                alt="Custom Alert Visual"
                className="max-h-40 sm:max-h-48 w-auto rounded-xl object-contain shadow-2xl transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </motion.div>
          )}

          {/* 🎬 Custom Video File Loop */}
          {activeMedia && isVideoFile(activeMedia) && (
            <motion.div
              className="my-2 w-full max-h-48 rounded-2xl overflow-hidden border relative shadow-xl"
              style={{ borderColor: `${glowColor}60` }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <video
                autoPlay
                loop
                playsInline
                src={activeMedia}
                className="w-full h-full object-cover max-h-48"
              />
            </motion.div>
          )}

          {/* 🎵 Song Request (Media Share) Live Player */}
          {activeMedia && (youtubeId || isAudioFile(activeMedia)) && (
            <motion.div
              className="p-3 rounded-2xl border bg-black/60 backdrop-blur-md shadow-xl space-y-2 relative overflow-hidden"
              style={{ borderColor: `${glowColor}60` }}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="relative w-8 h-8 rounded-full p-0.5 animate-spin-slow shrink-0"
                    style={{ background: `linear-gradient(to top right, ${borderColor}, ${glowColor})` }}
                  >
                    <div className="w-full h-full rounded-full bg-[#0d101d] flex items-center justify-center">
                      <Disc className="w-4 h-4" style={{ color: glowColor }} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider" style={{ color: glowColor }}>
                      <Music className="w-3 h-3 animate-pulse" />
                      <span>Live Song Playing</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate max-w-[260px]">
                      {youtubeId ? `YouTube Track (ID: ${youtubeId})` : activeMedia}
                    </p>
                  </div>
                </div>

                {/* Animated Audio Equalizer Bars */}
                <div className="flex items-end gap-1 h-5 px-1 shrink-0">
                  <span className="w-1 rounded-full animate-pulse h-3" style={{ backgroundColor: glowColor }}></span>
                  <span className="w-1 rounded-full animate-pulse h-5" style={{ backgroundColor: borderColor, animationDelay: '0.15s' }}></span>
                  <span className="w-1 bg-accent-fuchsia rounded-full animate-pulse h-4" style={{ animationDelay: '0.3s' }}></span>
                  <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-2" style={{ animationDelay: '0.45s' }}></span>
                  <span className="w-1 rounded-full animate-pulse h-4" style={{ backgroundColor: glowColor, animationDelay: '0.2s' }}></span>
                </div>
              </div>

              {/* YouTube Autoplay Embed or HTML5 Audio */}
              {youtubeId ? (
                <div className="w-full h-28 rounded-xl overflow-hidden border border-white/10 relative shadow-inner">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=1&loop=1&playlist=${youtubeId}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                    title="Live Requested Song"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : isAudioFile(activeMedia) ? (
                <audio autoPlay src={activeMedia} />
              ) : null}
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            className="flex items-center justify-between pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              Zoee Donation · Live Stream Support
            </div>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                >
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Countdown progress bar */}
        <CountdownBar durationSec={durationSec} playing={true} glowColor={glowColor} />
      </div>
    </motion.div>
  );
}

// ─── Main OBSAlert Component ──────────────────────────────────────────────────
export default function OBSAlert() {
  const { username: rawUsername } = useParams();
  const [searchParams] = useSearchParams();
  const username = (rawUsername || '').replace(/^@/, '');
  const token = searchParams.get('token') || username;
  const position = searchParams.get('pos') || 'center';

  const positionClasses = (() => {
    switch (position) {
      case 'bottom-left': return 'items-end justify-start p-8';
      case 'bottom-right': return 'items-end justify-end p-8';
      case 'top-center': return 'items-start justify-center p-8';
      case 'top-left': return 'items-start justify-start p-8';
      case 'top-right': return 'items-start justify-end p-8';
      case 'center':
      default: return 'items-center justify-center p-6';
    }
  })();

  const [alertSettings, setAlertSettings] = useState(null);
  const [streamer, setStreamer] = useState(null);
  const [currentAlert, setCurrentAlert] = useState(null);

  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const sseRef = useRef(null);

  // ── 1. Set 100% transparent background for OBS Browser Source ─────────────
  useEffect(() => {
    document.body.classList.add('obs-overlay');
    document.documentElement.classList.add('obs-overlay');
    document.body.style.setProperty('background', 'transparent', 'important');
    document.body.style.setProperty('background-color', 'transparent', 'important');
    document.documentElement.style.setProperty('background', 'transparent', 'important');
    document.documentElement.style.setProperty('background-color', 'transparent', 'important');
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.setProperty('background', 'transparent', 'important');
      rootEl.style.setProperty('background-color', 'transparent', 'important');
    }

    return () => {
      document.body.classList.remove('obs-overlay');
      document.documentElement.classList.remove('obs-overlay');
      document.body.style.background = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.background = '';
      document.documentElement.style.backgroundColor = '';
      if (rootEl) {
        rootEl.style.background = '';
        rootEl.style.backgroundColor = '';
      }
    };
  }, []);

  // ── 2. Load alert settings ─────────────────────────────────────────────────
  const primaryIdentifier = username || token;

  useEffect(() => {
    if (!primaryIdentifier) return;
    api.get(`/alerts/config/${primaryIdentifier}`)
      .then(res => {
        if (res.success && res.data) {
          setAlertSettings(res.data.alertSettings);
          setStreamer(res.data.streamer);
        }
      })
      .catch(err => console.warn('[OBSAlert] Failed to load config:', err.message));
  }, [primaryIdentifier]);

  const seenDonationIdsRef = useRef(new Set());
  const initialPollerRanRef = useRef(false);

  // ── 3. Process alert queue (sequential, waits for current alert to finish) ─
  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;

    isProcessingRef.current = true;
    const nextAlert = queueRef.current.shift();
    setCurrentAlert(nextAlert);

    // Auto-resume audio context if suspended in OBS CEF
    soundService.getAudioContext();

    const settings = nextAlert._settings || alertSettings || {};

    // Check custom tiers: if amount qualifies for a higher alert sound tier
    let soundPreset = settings?.sound_url || 'chime';
    if (Array.isArray(settings?.custom_tiers) && settings.custom_tiers.length > 0) {
      const match = [...settings.custom_tiers]
        .filter(t => Number(nextAlert.amount) >= Number(t.minAmount || 0))
        .sort((a, b) => Number(b.minAmount) - Number(a.minAmount))[0];
      if (match && match.sound) {
        soundPreset = match.sound;
      }
    }

    const volume = settings?.sound_volume ?? 0.85;
    const durationSec = nextAlert.media_url
      ? Math.max(settings?.duration || 12, 18)
      : (settings?.duration || 8);

    // Play Alert Song / Sound Chime
    soundService.playSound(soundPreset, volume);

    // Read TTS with strict Read-Only-1 policy (No speech collisions)
    if (settings?.tts_enabled !== false && nextAlert.tts_enabled !== false) {
      const minTTS = Number(settings?.minimum_tts_amount ?? 1.0);
      const voiceAiConfig = streamer?.social_links?.voice_ai || {};
      ttsService.speak({
        text: nextAlert.message || '',
        donorName: nextAlert.donor_name || 'Supporter',
        amount: Number(nextAlert.amount),
        currency: nextAlert.currency || 'USD',
        minAmount: minTTS,
        voice: settings?.tts_voice || voiceAiConfig.tts_voice || 'khmer_natural',
        rate: Number(settings?.tts_speed || voiceAiConfig.tts_speed || 1.0),
        pitch: Number(settings?.tts_pitch || voiceAiConfig.tts_pitch || 1.0),
        volume: Number(settings?.tts_volume || voiceAiConfig.tts_volume || 0.85),
        template: settings?.tts_template || voiceAiConfig.tts_template || '',
        tier1_template: settings?.tier1_template || voiceAiConfig.tier1_template || '',
        tier2_template: settings?.tier2_template || voiceAiConfig.tier2_template || '',
        tier3_template: settings?.tier3_template || voiceAiConfig.tier3_template || '',
        profanity_filter: settings?.profanity_filter !== false && voiceAiConfig.profanity_filter !== false,
        spam_filter: settings?.spam_filter !== false && voiceAiConfig.spam_filter !== false,
        max_chars: settings?.max_chars || voiceAiConfig.max_chars || 180,
        streamerName: nextAlert._streamerSlug || streamer?.slug || '',
        readOnlyOne: true // AI Read Only 1 Message guarantee
      });
    }

    // Clear after duration and stop any lingering audio
    setTimeout(() => {
      ttsService.stop();
      soundService.stopAll();
      setCurrentAlert(null);
      setTimeout(() => {
        isProcessingRef.current = false;
        processQueue(); // process next in queue cleanly
      }, 500); // 500ms safety buffer between alerts
    }, durationSec * 1000);
  }, [alertSettings, streamer]);

  // ── 4. SSE Connection with auto-reconnect ──────────────────────────────────
  useEffect(() => {
    if (!primaryIdentifier) return;

    let reconnectTimer = null;
    let retryDelay = 3000;

    const connect = () => {
      if (sseRef.current) {
        sseRef.current.close();
      }

      const es = new EventSource(getApiUrl(`/alerts/stream/${primaryIdentifier}?token=${encodeURIComponent(token || '')}`));

      sseRef.current = es;

      es.onopen = () => {
        console.log('[OBSAlert] SSE connected ✅');
        retryDelay = 3000; // reset on success
      };

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          // Handle dynamic setting updates from dashboard without needing OBS reload
          if (payload.type === 'SETTINGS_UPDATED') {
            console.log('[OBSAlert] Realtime settings updated 🎨', payload.settings);
            setAlertSettings(prev => ({ ...prev, ...payload.settings }));
            return;
          }

          if (payload.type === 'NEW_DONATION' || payload.type === 'TEST_ALERT') {
            const donationId = payload.data.id || `alert-${Date.now()}`;
            if (seenDonationIdsRef.current.has(donationId)) {
              return;
            }
            seenDonationIdsRef.current.add(donationId);

            const alertData = {
              ...payload.data,
              id: donationId,
              _settings: payload.data.settings || alertSettings,
              _streamerSlug: streamer?.slug || username || token
            };
            queueRef.current.push(alertData);
            processQueue();
          }
        } catch (err) {
          console.warn('[OBSAlert] SSE parse error:', err);
        }
      };

      es.onerror = () => {
        console.warn(`[OBSAlert] SSE error. Reconnecting in ${retryDelay}ms...`);
        es.close();
        retryDelay = Math.min(retryDelay * 1.5, 30000); // exponential backoff
        reconnectTimer = setTimeout(connect, retryDelay);
      };
    };

    connect();

    return () => {
      if (sseRef.current) sseRef.current.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [token, alertSettings, streamer, processQueue, username]);

  // ── 5. Backup Payment Poller (Guarantees zero missed payments on OBS) ─────
  useEffect(() => {
    if (!token && !username) return;
    const targetSlug = streamer?.slug || username || token;

    const pollRecent = async () => {
      try {
        const res = await api.get(`/donations/recent/${targetSlug}?limit=6`);
        if (res.success && Array.isArray(res.data)) {
          // On first run, seed existing donations so historical donations aren't re-alerted
          if (!initialPollerRanRef.current) {
            res.data.forEach(d => seenDonationIdsRef.current.add(d.id));
            initialPollerRanRef.current = true;
            return;
          }

          // On subsequent runs, find any newly completed donations not yet queued
          const newDonations = res.data.filter(d => !seenDonationIdsRef.current.has(d.id));
          if (newDonations.length > 0) {
            newDonations.reverse().forEach(d => {
              seenDonationIdsRef.current.add(d.id);
              const alertData = {
                id: d.id,
                streamer_id: d.streamer_id,
                donor_name: d.donor_name,
                amount: d.amount,
                currency: d.currency,
                message: d.message,
                anonymous: d.anonymous,
                tts_enabled: d.tts_enabled,
                media_url: d.media_url || null,
                payment_method: d.payment_method || 'KHQR',
                paid_at: d.paid_at,
                _settings: alertSettings,
                _streamerSlug: targetSlug
              };
              queueRef.current.push(alertData);
            });
            processQueue();
          }
        }
      } catch (err) {
        // Silent background catch
      }
    };

    pollRecent();
    const interval = setInterval(pollRecent, 4000);
    return () => clearInterval(interval);
  }, [token, username, streamer, alertSettings, processQueue]);

  // ── Manual test trigger from overlay UI ──────────────────────────────────────
  const [triggeringTest, setTriggeringTest] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);

  const handleManualTestAlert = async () => {
    setTriggeringTest(true);
    // Unlock Web Audio & SpeechSynthesis
    soundService.playSound('chime', 0.1);
    setAudioUnlocked(true);

    try {
      const testData = {
        id: `test-alert-${Date.now()}`,
        donor_name: 'Zoee Stream Champion',
        amount: 15.00,
        currency: 'USD',
        message: 'This is a live test donation alert on OBS Studio! 🚀❤️',
        payment_method: 'KHQR',
        isTest: true,
        tts_enabled: true,
        _settings: alertSettings,
        _streamerSlug: streamer?.slug || token
      };

      // Broadcast via API to sync across all overlays and local queue
      await api.post(`/alerts/test/${token}`, {
        streamerSlug: streamer?.slug || token,
        donorName: testData.donor_name,
        amount: testData.amount,
        currency: testData.currency,
        message: testData.message
      }).catch(() => null);

      // Also ensure local queue receives it instantly
      queueRef.current.push(testData);
      processQueue();
    } catch (err) {
      console.error('Manual test alert error:', err);
    } finally {
      setTimeout(() => setTriggeringTest(false), 1000);
    }
  };

  const animStyle = alertSettings?.animation || 'neon';

  const [browserPreviewBg, setBrowserPreviewBg] = useState('transparent');

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={`fixed inset-0 select-none overflow-hidden obs-overlay ${
        !window.obsstudio && browserPreviewBg === 'dark' ? 'bg-[#090b14]' : ''
      }`}
      style={{
        background: !window.obsstudio && browserPreviewBg === 'dark' ? '#090b14' : 'transparent',
        backgroundColor: !window.obsstudio && browserPreviewBg === 'dark' ? '#090b14' : 'transparent'
      }}
      onClick={() => {
        if (!audioUnlocked) {
          soundService.playSound('chime', 0.05);
          setAudioUnlocked(true);
        }
      }}
    >
      {/* Studio Overlay Test Controls (Only visible in browser preview on hover, hidden in OBS Studio) */}
      {!window.obsstudio && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 pointer-events-auto bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            OBS Live
          </span>
          <button
            type="button"
            onClick={() => setBrowserPreviewBg(prev => prev === 'dark' ? 'transparent' : 'dark')}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono text-slate-300 transition-colors"
            title="Toggle preview background for browser testing"
          >
            {browserPreviewBg === 'dark' ? '🌙 Dark Preview' : '✨ 100% Transparent'}
          </button>
          <button
            type="button"
            onClick={handleManualTestAlert}
            disabled={triggeringTest}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-brand-600 to-accent-fuchsia text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {triggeringTest ? 'Triggering...' : 'Trigger Test Alert'}
          </button>
        </div>
      )}

      {/* Main Alert Popup Area */}
      <div className={`absolute inset-0 flex ${positionClasses} pointer-events-none`}>
        <AnimatePresence mode="wait">
          {currentAlert && (
            <AlertCard
              key={currentAlert.id}
              alertData={currentAlert}
              alertSettings={alertSettings}
              streamer={streamer}
              animation={animStyle}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

