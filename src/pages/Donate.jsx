import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import soundService from '../services/soundService';
import ttsService from '../services/ttsService';
import PaymentModal from '../components/PaymentModal';
import {
  Heart,
  Smartphone,
  ShieldCheck,
  Volume2,
  Sparkles,
  ArrowLeft,
  User,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const PRESET_AMOUNTS_USD = [1, 2, 5, 10, 20, 50];
const PRESET_AMOUNTS_KHR = [4000, 8000, 20000, 40000, 80000, 200000];

export default function Donate() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [streamer, setStreamer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedVoice, setSelectedVoice] = useState('khmer_natural');
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  // Form State
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('5');
  const [donorName, setDonorName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BAKONG_KHQR');

  // Checkout modal state
  const [submitting, setSubmitting] = useState(false);
  const [activePayment, setActivePayment] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/streamers/${username}`)
      .then(res => {
        if (res.success) setStreamer(res.data.streamer);
      })
      .catch(err => {
        setError(err.message || 'Streamer not found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  const handleCurrencyChange = (newCurr) => {
    setCurrency(newCurr);
    if (newCurr === 'KHR' && currency === 'USD') {
      setAmount((parseFloat(amount || 1) * 4100).toString());
    } else if (newCurr === 'USD' && currency === 'KHR') {
      setAmount(Math.max(1, Math.round(parseFloat(amount || 4100) / 4100)).toString());
    }
  };

  const handlePreviewTTS = () => {
    ttsService.stop();
    setIsPlayingTTS(true);
    setTimeout(() => {
      ttsService.speak({
        text: message || (currency === 'KHR' ? 'សួស្តីបង! ជូនពរសំណាងល្អ និងជោគជ័យក្នុងការផ្សាយផ្ទាល់!' : 'Keep up the amazing stream! Great gameplay!'),
        donorName: anonymous ? 'Anonymous' : (donorName || (currency === 'KHR' ? 'អ្នកគាំទ្រ' : 'A fan')),
        amount: amount || (currency === 'KHR' ? '20000' : '5'),
        currency,
        voice: selectedVoice,
        minAmount: 0
      });
      setTimeout(() => setIsPlayingTTS(false), 3800);
    }, 150);
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid donation amount greater than 0.');
      return;
    }

    if (streamer && numAmount < streamer.min_donation_amount && currency === 'USD') {
      setError(`Minimum donation amount is $${streamer.min_donation_amount}.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/donations', {
        streamerSlug: username,
        amount: numAmount,
        currency,
        donorName: anonymous ? 'Anonymous' : (donorName.trim() || 'Supporter'),
        anonymous,
        message,
        paymentMethod
      });

      if (res.success && res.data) {
        setActivePayment({
          ...res.data,
          aba_payway_link: streamer.aba_payway_link || res.data.aba_payway_link,
          aba_account_name: streamer.aba_account_name || res.data.aba_account_name,
          aba_account_number: streamer.aba_account_number || res.data.aba_account_number,
          aba_instructions: streamer.aba_instructions || res.data.aba_instructions,
          aba_qr_url: streamer.aba_qr_url || res.data.aba_qr_url
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate donation transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <span className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full mr-3"></span>
        Preparing donation checkout...
      </div>
    );
  }

  if (!streamer) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-card rounded-3xl text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Streamer Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'This creator does not exist.'}</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Back link */}
      <Link
        to={`/streamer/${username}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to @{username}'s profile
      </Link>

      {/* Streamer Header Card */}
      <div className="glass-card p-6 rounded-3xl border border-brand-500/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={streamer.profile?.avatar_url || '/zoee-avatar.png'}
            alt={streamer.slug}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500 shadow-xl"
          />
          <div>
            <h2 className="text-xl font-black text-white">{streamer.profile?.display_name || streamer.slug}</h2>
            <p className="text-xs text-slate-400 font-mono">@{streamer.slug}</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-accent-emerald font-semibold mt-1">
              <Sparkles className="w-3 h-3" /> Ready for Live Alerts
            </span>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Min. Donation</span>
          <p className="text-sm font-bold text-slate-200">${streamer.min_donation_amount || 1.00} USD</p>
        </div>
      </div>

      {/* Main Donation Form */}
      <form onSubmit={handleCreateDonation} className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/25 bg-dark-card space-y-8 shadow-2xl">
        {/* Guest Tip Notice */}
        <div className="flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold select-none">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>បរិច្ចាគភ្លាមៗ មិនបាច់បង្កើតគណនី (Instant Guest Tip · No sign-up required)</span>
        </div>
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-sm text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Amount Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white uppercase tracking-wider">
              1. Choose Amount
            </label>
            {/* Currency Toggle */}
            <div className="flex items-center bg-dark-surface p-1 rounded-xl border border-dark-border">
              <button
                type="button"
                onClick={() => handleCurrencyChange('USD')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${currency === 'USD' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyChange('KHR')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${currency === 'KHR' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                KHR (៛)
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {(currency === 'USD' ? PRESET_AMOUNTS_USD : PRESET_AMOUNTS_KHR).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className={`py-2.5 rounded-xl font-mono text-sm font-bold border transition-all ${
                  amount === val.toString()
                    ? 'bg-brand-600/30 border-brand-500 text-white shadow-lg shadow-brand-500/20 scale-105'
                    : 'bg-dark-surface/80 border-white/5 text-slate-300 hover:border-brand-500/40'
                }`}
              >
                {currency === 'USD' ? `$${val}` : `${val.toLocaleString()}៛`}
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-brand-400 font-mono">
              {currency === 'USD' ? '$' : '៛'}
            </span>
            <input
              type="number"
              min="0.10"
              step="any"
              placeholder="Or enter custom amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-dark-surface border border-dark-border focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-lg font-bold text-white font-mono placeholder-slate-500"
              required
            />
          </div>

          {/* Live AI Real Dollar Spoken Readout Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 rounded-2xl bg-dark-surface/90 border border-brand-500/30 text-xs shadow-inner gap-1.5">
            <span className="text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping"></span>
              🎙️ AI Spoken Real Amount:
            </span>
            <span className="font-bold text-accent-cyan font-mono text-xs">
              {currency === 'USD'
                ? `${ttsService.toKhmerSpokenAmount(amount || 0, 'USD')} (${ttsService.toEnglishSpokenAmount(amount || 0, 'USD')})`
                : ttsService.toKhmerSpokenAmount(amount || 0, 'KHR')}
            </span>
          </div>
        </div>

        {/* Donor Name & Anonymous Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white uppercase tracking-wider">
              2. Your Information
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-dark-border bg-dark-surface text-brand-600 focus:ring-brand-500"
              />
              Donate Anonymously
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={anonymous ? "Will be displayed as 'Anonymous'" : "Your Name / Nickname"}
              disabled={anonymous}
              value={anonymous ? '' : donorName}
              onChange={(e) => setDonorName(e.target.value)}
              maxLength={40}
              className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-sm text-white placeholder-slate-500 transition-all ${
                anonymous ? 'opacity-50 cursor-not-allowed' : 'focus:border-brand-500'
              }`}
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Message & Voice AI Reader */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-accent-cyan" />
              3. Message for Streamer (Voice AI Readout)
            </label>
            <span className="text-xs text-slate-500 font-mono">{message.length}/255</span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              placeholder="Cheer on your streamer! (Voice AI will read your message on stream)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={255}
              className="w-full p-4 rounded-2xl bg-dark-surface border border-dark-border focus:border-brand-500 text-sm text-white placeholder-slate-500 resize-none shadow-inner"
            />
          </div>

          {/* Quick Cheer Message Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">Quick Cheers:</span>
            {[
              { label: '🇰🇭 ជូនពរជោគជ័យ!', text: 'សួស្តីបង! ជូនពរសំណាងល្អ និងជោគជ័យក្នុងការផ្សាយផ្ទាល់!' },
              { label: '🇰🇭 លេងឡូយណាស់!', text: 'លេងឡូយណាស់បង! GG WP!' },
              { label: '🇰🇭 គាំទ្រជានិច្ច!', text: 'គាំទ្របងជានិច្ច! បន្តការខិតខំទៀតណា!' },
              { label: '🇺🇸 GG Streamer!', text: 'Awesome stream! Keep it up! 🚀' }
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMessage(chip.text)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:border-brand-500/40 text-slate-300 border border-white/10 transition-all active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Voice AI Persona Selector & Equalizer Controls */}
          <div className="p-3.5 rounded-2xl bg-dark-surface/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Voice AI:</span>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:border-accent-cyan font-semibold"
              >
                <option value="khmer_natural">🇰🇭 ស្វ័យប្រវត្ត (Khmer & English Auto)</option>
                <option value="khmer_female">🇰🇭 ស្រីពៅ - សំឡេងស្រី (Khmer Female)</option>
                <option value="khmer_male">🇰🇭 ពិសិដ្ឋ - សំឡេងប្រុស (Khmer Male)</option>
                <option value="en_natural">🇺🇸 English US Natural AI</option>
              </select>
            </div>

            {/* Voice AI Preview Button with Audio Wave Animation */}
            <button
              type="button"
              onClick={handlePreviewTTS}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md self-start sm:self-auto ${
                isPlayingTTS
                  ? 'bg-accent-cyan text-black shadow-cyan-500/30 scale-105'
                  : 'bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30'
              }`}
            >
              {isPlayingTTS ? (
                /* Animated Equalizer Wave Bars */
                <div className="flex items-center gap-0.5 h-3.5">
                  <span className="w-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  <span className="w-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></span>
                </div>
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              {isPlayingTTS ? 'Playing Voice AI...' : 'Listen to Voice AI (ស្ដាប់សំឡេង)'}
            </button>
          </div>
        </div>

        {/* Payment Provider Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white uppercase tracking-wider block">
              4. Payment Gateway
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'CUTLUY', name: 'ABA KHQR (CutLuy)', desc: 'Auto Instant · ABA Mobile & All Bank Apps', badge: 'Auto Live' },
              { id: 'BAKONG_KHQR', name: 'ABA KHQR Universal', desc: 'Universal EMVCo QR · All Banking Apps', badge: 'Universal' }
            ].map((p) => (
              <label
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === p.id
                    ? 'bg-brand-500/15 border-brand-500 shadow-lg shadow-brand-500/10'
                    : 'bg-dark-surface/60 border-white/5 hover:border-brand-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={p.id}
                    checked={paymentMethod === p.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-brand-600 bg-dark-surface border-dark-border focus:ring-brand-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                  {p.badge}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-brand-600 via-accent-fuchsia to-accent-cyan hover:brightness-110 active:scale-[0.99] shadow-xl shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            <>
              <Heart className="w-5 h-5 fill-white" />
              Pay {currency === 'KHR' ? `${Number(amount || 0).toLocaleString()} ៛` : `$${Number(amount || 0).toFixed(2)}`} & Send Alert
            </>
          )}
        </button>
      </form>

      {/* Interactive Payment Checkout Modal */}
      {activePayment && (
        <PaymentModal
          paymentData={activePayment}
          onClose={() => setActivePayment(null)}
          onPaymentSuccess={() => {
            setActivePayment(null);
            navigate(`/streamer/${username}`);
          }}
        />
      )}
    </div>
  );
}
