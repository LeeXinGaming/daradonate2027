import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Send, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function TelegramScanLogin({ onSuccess }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);

  const { setDirectSession } = useAuth();
  const pollIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Initialize a new Telegram QR session
  const initSession = async () => {
    setLoading(true);
    setError('');
    setAuthenticated(false);
    try {
      const res = await api.post('/auth/telegram/session');
      if (res.success && res.data) {
        setSession(res.data);
        setTimeLeft(res.data.expiresIn || 300);
      } else {
        setError('Failed to generate Telegram login QR code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to Telegram auth server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSession();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Poll for authorization status
  useEffect(() => {
    if (!session?.sessionToken || authenticated) return;

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        setChecking(true);
        const res = await api.get(`/auth/telegram/check-session/${session.sessionToken}`);
        if (res.success && res.authenticated && res.token) {
          clearInterval(pollIntervalRef.current);
          setAuthenticated(true);

          // Trigger festive confetti
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch (e) {
            // ignore
          }

          // Save auth session into context & localStorage
          setDirectSession(res.token, res.user, res.streamer);

          setTimeout(() => {
            if (onSuccess) {
              onSuccess(res.user);
            }
          }, 800);
        } else if (res.status === 'EXPIRED') {
          clearInterval(pollIntervalRef.current);
          setError('QR Code expired. Click refresh below to generate a new scan.');
        }
      } catch (err) {
        // Continue polling unless 404
        if (err.response?.status === 404) {
          clearInterval(pollIntervalRef.current);
        }
      } finally {
        setChecking(false);
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [session?.sessionToken, authenticated]);

  // Countdown timer
  useEffect(() => {
    if (!session) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [session]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="space-y-5 text-center">
      {authenticated ? (
        <div className="py-8 px-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">Login Approved!</h3>
            <p className="text-xs text-emerald-300">Telegram authentication confirmed. Redirecting to Dashboard...</p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs text-slate-400">Loading your creator profile...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-2.5 text-xs text-red-300 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={initSession}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 font-bold underline text-[11px]"
              >
                Retry
              </button>
            </div>
          )}

          {/* QR Code Container */}
          <div className="relative inline-block mx-auto p-4 rounded-3xl bg-white/95 shadow-2xl border-4 border-sky-400/40 group">
            {loading ? (
              <div className="w-52 h-52 flex flex-col items-center justify-center gap-3 bg-slate-900 rounded-2xl">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                <span className="text-[11px] font-mono text-slate-400">Generating QR...</span>
              </div>
            ) : session?.qrData ? (
              <div className="relative">
                <QRCodeSVG
                  value={session.qrData}
                  size={208}
                  level="H"
                  includeMargin={false}
                  className="rounded-xl"
                />

                {/* Center Telegram Logo Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-sky-500 border-2 border-white shadow-md flex items-center justify-center text-white">
                    <Send className="w-5 h-5 ml-0.5" />
                  </div>
                </div>

                {/* Animated Scanner Laser Bar */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent shadow-[0_0_8px_#38bdf8] opacity-75 animate-[scan_2.5s_ease-in-out_infinite] pointer-events-none" />
              </div>
            ) : null}
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Scan with Phone or Telegram App
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Scan this QR code with your phone camera or click below to open in Telegram
            </p>
          </div>

          {/* 1-Click Open in Telegram Button */}
          {session?.deepLink && (
            <a
              href={session.deepLink}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-98 text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all text-center"
            >
              <Send className="w-4 h-4" />
              Open in Telegram (@{session.botUsername || 'darastore_bot'})
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
            </a>
          )}

          {/* Footer Status & Expiration */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${checking ? 'bg-sky-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>Waiting for scan...</span>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span>Expires: {formattedTime}</span>
              <button
                onClick={initSession}
                title="Refresh QR Code"
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
