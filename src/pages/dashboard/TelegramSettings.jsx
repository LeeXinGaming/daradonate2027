import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Send, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, Bell, AlertTriangle, Unlink, Sparkles } from 'lucide-react';

export default function TelegramSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/telegram/status');
      if (res.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto refresh status every 5 seconds if disconnected to detect when user links via Telegram
    const interval = setInterval(() => {
      api.get('/telegram/status').then(res => {
        if (res.success) setData(res.data);
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/telegram/generate-code');
      if (res.success) {
        setData(prev => ({
          ...prev,
          pairingCode: res.data.pairingCode,
          deepLink: res.data.deepLink || prev.deepLink
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendTestAlert = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post('/telegram/test');
      if (res.success) {
        setTestResult({ success: true, message: '🎉 Test alert sent! Check your Telegram chat.' });
      } else {
        setTestResult({ success: false, message: res.message || 'Failed to send test alert.' });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.response?.data?.message || 'Error sending test alert.' });
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 6000);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Telegram notifications?')) return;
    setDisconnecting(true);
    try {
      const res = await api.post('/telegram/disconnect');
      if (res.success) {
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-400" />
        <p className="text-sm font-medium">Loading Telegram connection...</p>
      </div>
    );
  }

  const { connected, chatId, pairingCode, botUsername, botLink, deepLink } = data || {};
  const activeBotUsername = botUsername || 'darastore_bot';
  const effectiveDeepLink = deepLink || (pairingCode ? `https://t.me/${activeBotUsername}?start=${pairingCode.replace(/-/g, '_')}` : `https://t.me/${activeBotUsername}`);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Main Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
              <Send className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Telegram Push Alerts</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  @{activeBotUsername}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Receive instant push notifications in your private Telegram chat whenever a fan tips or donates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider flex items-center gap-1.5 shadow-sm ${
              connected 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-amber-500/10'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {connected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
      </div>

      {/* Connected State Card */}
      {connected ? (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Live Telegram Alerts Active</h4>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Connected to Chat ID: <span className="font-mono font-bold text-emerald-200">{chatId}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSendTestAlert}
                disabled={testing}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                Send Test Alert
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Unlink className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in ${
              testResult.success 
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-200 border border-red-500/30'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
              {testResult.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-dark-card/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Alert Speed</span>
              <p className="text-sm font-black text-sky-300">Instant (&lt; 0.5s)</p>
              <p className="text-[11px] text-slate-400">Directly triggered upon KHQR or ABA webhook</p>
            </div>
            <div className="p-4 rounded-2xl bg-dark-card/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included Details</span>
              <p className="text-sm font-black text-brand-300">Donor, Amount, Message</p>
              <p className="text-[11px] text-slate-400">USD & KHR conversions with transaction ref</p>
            </div>
            <div className="p-4 rounded-2xl bg-dark-card/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bot Handle</span>
              <p className="text-sm font-black text-emerald-300">@{activeBotUsername}</p>
              <p className="text-[11px] text-slate-400">Type /test or /help anytime in Telegram</p>
            </div>
          </div>
        </div>
      ) : (
        /* Disconnected State: Setup & Connect Flow */
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">How to Connect in 2 Steps</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1: 1-Click Connect Button */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-500/10 to-transparent border border-sky-500/20 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-extrabold uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">1</span>
                  Fast Method (Recommended)
                </div>
                <h4 className="text-lg font-black text-white">One-Click Telegram Connect</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click the button below to open Telegram with your unique pairing code pre-filled. Just tap <strong>START</strong> to activate!
                </p>
              </div>

              <a
                href={effectiveDeepLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-98 text-sm font-black text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all text-center"
              >
                <Send className="w-4 h-4" />
                Connect on Telegram (@{activeBotUsername})
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
              </a>
            </div>

            {/* Step 2: Manual Pairing Code */}
            <div className="p-6 rounded-2xl bg-dark-card/60 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">2</span>
                  Manual Method
                </div>
                <h4 className="text-lg font-black text-white">Pair with Secret Code</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Open Telegram, search for <span className="font-bold text-sky-400">@{activeBotUsername}</span>, press <strong>/start</strong>, and send your pairing code:
                </p>
              </div>

              {pairingCode ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-dark-surface border border-sky-500/30">
                  <span className="text-base font-mono font-black text-sky-300 tracking-wider flex-1 text-center select-all">
                    {pairingCode}
                  </span>
                  <button
                    onClick={() => copyCode(pairingCode)}
                    className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateCode}
                  disabled={generating}
                  className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
                >
                  {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Generate Pairing Code'}
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/5">
            <button
              onClick={fetchStatus}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Connection Status
            </button>

            <span className="text-[11px] text-slate-500">
              Live Polling Status: Listening for @{activeBotUsername}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
