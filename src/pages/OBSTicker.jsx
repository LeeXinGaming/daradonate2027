import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api, { getApiUrl } from '../services/api';


import { Heart, Sparkles, Trophy, Flame, Zap, Radio, Crown } from 'lucide-react';

const THEMES = {
  gaming: {
    container: 'bg-[#121420]/90 border border-brand-500/40 shadow-[0_0_25px_rgba(139,92,246,0.3)]',
    text: 'text-slate-100',
    name: 'text-brand-300 font-bold',
    amount: 'text-accent-cyan font-black',
    badge: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
    icon: 'text-brand-400'
  },
  neon: {
    container: 'bg-[#090a18]/95 border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.45)]',
    text: 'text-cyan-100',
    name: 'text-cyan-300 font-black tracking-wide',
    amount: 'text-fuchsia-400 font-black',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
    icon: 'text-cyan-300'
  },
  gold: {
    container: 'bg-[#18140a]/95 border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.45)]',
    text: 'text-amber-100',
    name: 'text-amber-300 font-black',
    amount: 'text-yellow-200 font-black',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
    icon: 'text-amber-400'
  },
  minimal: {
    container: 'bg-[#181a20]/80 border border-white/10 backdrop-blur-md',
    text: 'text-slate-200',
    name: 'text-white font-bold',
    amount: 'text-emerald-400 font-bold',
    badge: 'bg-white/10 text-slate-200 border-white/10',
    icon: 'text-slate-300'
  },
  cyber: {
    container: 'bg-[#06140e]/95 border-2 border-emerald-400/90 shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    text: 'text-emerald-100',
    name: 'text-emerald-300 font-mono font-black',
    amount: 'text-lime-300 font-mono font-black',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
    icon: 'text-emerald-400'
  },
  streamer: {
    container: 'bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-blue-900/90 border border-pink-400/60 shadow-[0_0_30px_rgba(244,114,182,0.35)]',
    text: 'text-pink-100',
    name: 'text-yellow-300 font-black',
    amount: 'text-cyan-300 font-black',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-400/50',
    icon: 'text-pink-400'
  }
};

export default function OBSTicker() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();

  // URL overrides
  const urlTheme = (searchParams.get('theme') || 'gaming').toLowerCase();
  const urlSpeed = parseInt(searchParams.get('speed') || '40', 10);
  const urlDirection = searchParams.get('direction') || 'left';

  const [settings, setSettings] = useState({
    enabled: true,
    theme: 'Gaming',
    animation: 'Scroll Left',
    direction: urlDirection,
    speed: urlSpeed,
    show_avatar: true,
    show_name: true,
    show_amount: true,
    show_message: true,
    show_currency: true,
    custom_text: '🎉 Live Supporter Feed •',
    pause_on_hover: true,
    infinite_loop: true
  });

  const [donations, setDonations] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'CONNECTING' | 'CONNECTED' | 'RECONNECTING'
  const seenIds = useRef(new Set());
  const [currentIndex, setCurrentIndex] = useState(0); // for Fade & Slide modes

  // Enforce 100% transparent body & html for OBS Studio
  useEffect(() => {
    document.body.classList.add('obs-overlay');
    document.documentElement.classList.add('obs-overlay');
    document.body.style.setProperty('background', 'transparent', 'important');
    document.body.style.setProperty('background-color', 'transparent', 'important');
    document.documentElement.style.setProperty('background', 'transparent', 'important');
    document.documentElement.style.setProperty('background-color', 'transparent', 'important');

    return () => {
      document.body.classList.remove('obs-overlay');
      document.documentElement.classList.remove('obs-overlay');
      document.body.style.background = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.background = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  // Fetch Ticker Config & Initial Donations
  const loadInitialData = async () => {
    try {
      const [configRes, donRes] = await Promise.all([
        api.get(`/ticker/${username || 'dara_gaming'}`).catch(() => null),
        api.get(`/ticker/${username || 'dara_gaming'}/donations`).catch(() => null)
      ]);

      if (configRes?.success && configRes.data?.settings) {
        setSettings(prev => ({
          ...prev,
          ...configRes.data.settings,
          direction: searchParams.get('direction') || configRes.data.settings.direction || 'left',
          speed: parseInt(searchParams.get('speed') || configRes.data.settings.speed || '40', 10)
        }));
      }

      if (donRes?.success && Array.isArray(donRes.data) && donRes.data.length > 0) {
        const unique = [];
        donRes.data.forEach(d => {
          if (!seenIds.current.has(d.id)) {
            seenIds.current.add(d.id);
            unique.push(d);
          }
        });
        setDonations(unique);
      } else if (donations.length === 0) {
        // Fallback demo feed so OBS always has an active animated ribbon
        const sampleFeed = [
          { id: 'demo-1', username: 'Sokha Hero', amount: 25.00, currency: 'USD', message: 'Amazing live broadcast! Keep going! ❤️', avatar: '/zoee-avatar.png' },
          { id: 'demo-2', username: 'Piseth Pro', amount: 10.00, currency: 'USD', message: 'Good luck with the matches! 🔥', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
          { id: 'demo-3', username: 'Bora Fan', amount: 5.00, currency: 'USD', message: 'Always supporting from Phnom Penh! 🚀', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' },
          { id: 'demo-4', username: 'Chanthy', amount: 50.00, currency: 'USD', message: 'Huge support for the channel! 👑', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' }
        ];
        sampleFeed.forEach(d => seenIds.current.add(d.id));
        setDonations(sampleFeed);
      }
    } catch (err) {
      console.error('Failed to load initial ticker data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [username]);

  // Connect to SSE for Instant Real-Time Updates
  useEffect(() => {
    let eventSource = null;
    let retryTimeout = null;

    const connectSSE = () => {
      setConnectionStatus('CONNECTING');
      const sseUrl = getApiUrl(`/alerts/stream/${username || 'dara_gaming'}`);

      eventSource = new EventSource(sseUrl);


      eventSource.onopen = () => {
        setConnectionStatus('CONNECTED');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'DONATION_PAID' || data.type === 'TEST_TICKER') {
            const donationId = data.donationId || data.transactionId || 'live-' + Date.now();
            if (!seenIds.current.has(donationId)) {
              seenIds.current.add(donationId);
              const newDonation = {
                id: donationId,
                username: data.donorName || data.username || 'Anonymous',
                amount: Number(data.amount || 0),
                currency: data.currency || 'USD',
                message: data.message || '',
                avatar: data.avatar || data.donorAvatar || '/zoee-avatar.png',
                timestamp: data.timestamp || new Date().toISOString()
              };
              setDonations(prev => [newDonation, ...prev.slice(0, (settings.max_donations || 15) - 1)]);
            }
          }
        } catch (e) {
          console.error('Error parsing SSE ticker event:', e);
        }
      };

      eventSource.onerror = () => {
        setConnectionStatus('RECONNECTING');
        if (eventSource) eventSource.close();
        retryTimeout = setTimeout(connectSSE, 5000); // Reconnect backoff
      };
    };

    connectSSE();

    // Fallback sync polling every 10s
    const pollInterval = setInterval(loadInitialData, 10000);

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimeout) clearTimeout(retryTimeout);
      clearInterval(pollInterval);
    };
  }, [username, settings.max_donations]);

  // Cycle animation for Fade / Slide modes
  useEffect(() => {
    if (settings.animation === 'Fade' || settings.animation === 'Slide' || settings.animation === 'Static') {
      if (donations.length === 0) return;
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % donations.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [settings.animation, donations.length]);

  const activeTheme = THEMES[urlTheme] || THEMES[settings.theme?.toLowerCase()] || THEMES.gaming;

  if (!settings.enabled) {
    return null;
  }

  // Render a Single Donation Pill Item
  const renderDonationItem = (item, key) => (
    <div
      key={key}
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl ${activeTheme.container} backdrop-blur-xl shrink-0 transition-transform duration-300 hover:scale-105`}
    >
      {/* Avatar */}
      {settings.show_avatar && (
        <img
          src={item.avatar || '/zoee-avatar.png'}
          alt={item.username}
          className="w-7 h-7 rounded-xl object-cover border border-white/20 shrink-0 shadow-sm"
        />
      )}

      {/* Name & Amount */}
      <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-sans">
        {settings.show_name && (
          <span className={activeTheme.name}>{item.username}</span>
        )}

        {settings.show_amount && (
          <span className={`px-2 py-0.5 rounded-lg ${activeTheme.badge} text-[11px] font-mono`}>
            {settings.show_currency && (item.currency === 'KHR' ? '៛' : '$')}
            {Number(item.amount).toFixed(2)}
          </span>
        )}

        {/* Message */}
        {settings.show_message && item.message && (
          <span className={`text-slate-300 font-medium ${activeTheme.text}`}>
            — "{item.message}"
          </span>
        )}
      </div>

      <Sparkles className={`w-3.5 h-3.5 ${activeTheme.icon} shrink-0 animate-pulse`} />
    </div>
  );

  return (
    <div className="w-screen h-screen bg-transparent p-3 flex items-center justify-start pointer-events-none select-none overflow-hidden font-sans">
      {/* Ticker Outer Box */}
      <div className="w-full relative overflow-hidden flex items-center py-2">
        {/* Optional Custom Prefix Badge */}
        {settings.custom_text && (
          <div className="mr-3 z-10 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${activeTheme.badge} text-xs font-bold shadow-md`}>
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              {settings.custom_text}
            </span>
          </div>
        )}

        {/* Animation Mode 1: Infinite Horizontal Scrolling (Scroll Left / Scroll Right) */}
        {(settings.animation === 'Scroll Left' || settings.animation === 'Scroll Right' || !settings.animation) && (
          <div
            className={`flex items-center gap-6 whitespace-nowrap will-change-transform ${
              settings.direction === 'right' ? 'animate-marquee-reverse' : 'animate-marquee'
            }`}
            style={{
              animationDuration: `${Math.max(10, settings.speed || 40)}s`
            }}
          >
            {/* Repeated set for seamless infinite looping */}
            {donations.map((item, idx) => renderDonationItem(item, `a-${idx}`))}
            {donations.map((item, idx) => renderDonationItem(item, `b-${idx}`))}
            {donations.map((item, idx) => renderDonationItem(item, `c-${idx}`))}
          </div>
        )}

        {/* Animation Mode 2: Fade */}
        {settings.animation === 'Fade' && donations.length > 0 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {renderDonationItem(donations[currentIndex], 'fade-item')}
          </div>
        )}

        {/* Animation Mode 3: Slide */}
        {settings.animation === 'Slide' && donations.length > 0 && (
          <div className="animate-in slide-in-from-right-10 duration-500">
            {renderDonationItem(donations[currentIndex], 'slide-item')}
          </div>
        )}

        {/* Animation Mode 4: Static */}
        {settings.animation === 'Static' && donations.length > 0 && (
          <div>
            {renderDonationItem(donations[currentIndex], 'static-item')}
          </div>
        )}
      </div>
    </div>
  );
}
