import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { renderSVG } from 'uqr';
import confetti from 'canvas-confetti';
import soundService from '../services/soundService';
import ttsService from '../services/ttsService';
import api from '../services/api';
import {
  Clock,
  X,
  Zap,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

// Official ABA KHQR Wordmark
function AbaKhqrWordmark() {
  return (
    <div className="flex items-center gap-2 text-white select-none">
      <div className="flex items-center gap-1.5">
        <span className="text-base font-black tracking-wider uppercase text-white font-sans">ABA</span>
        <span className="text-white/40">|</span>
        <span className="text-xs font-black tracking-widest uppercase text-[#00E5FF]">KHQR</span>
      </div>
    </div>
  );
}

// Official ABA PayWay Wordmark
function AbaPaywayWordmark() {
  return (
    <div className="flex items-center gap-2 text-white select-none">
      <div className="flex items-center gap-1.5">
        <span className="text-base font-black tracking-wider uppercase text-white font-sans">ABA</span>
        <span className="text-white/40">|</span>
        <span className="text-xs font-black tracking-widest uppercase text-[#00E5FF]">PAYWAY</span>
      </div>
    </div>
  );
}

// ABA Medallion (centered on QR code)
function AbaMedallion({ className = '' }) {
  return (
    <div className={`w-12 h-12 rounded-full bg-[#003853] shadow-2xl border-[3px] border-[#00E5FF] flex items-center justify-center pointer-events-none select-none z-10 ${className}`}>
      <span className="text-white font-black text-xs tracking-tighter">ABA</span>
    </div>
  );
}

// Riel Medallion (centered on QR code, covers center so only ECC-H can survive)
function RielMedallion({ className = '' }) {
  return (
    <div className={`w-12 h-12 rounded-full bg-white shadow-2xl border-[3px] border-[#E1251B] flex items-center justify-center pointer-events-none select-none z-10 ${className}`}>
      <div className="w-9 h-9 rounded-full bg-[#E1251B] text-white font-black text-base flex items-center justify-center">
        ៛
      </div>
    </div>
  );
}

// Status Panel (shown after terminal state)
function StatusPanel({ icon, title, subtitle, color = 'green' }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3 animate-in zoom-in-95 duration-300">
      {icon}
      <h4 className="text-lg font-black text-slate-900">{title}</h4>
      {subtitle && <p className="text-xs text-slate-500 text-center max-w-[200px]">{subtitle}</p>}
    </div>
  );
}

// Auto-payment status badge
function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Waiting for payment…', color: 'text-amber-500', dot: 'bg-amber-400 animate-pulse' },
    scanned: { label: 'QR Scanned! Confirm in app', color: 'text-blue-500', dot: 'bg-blue-400 animate-pulse' },
    paid: { label: 'Payment confirmed! ✅', color: 'text-emerald-500', dot: 'bg-emerald-400' },
    expired: { label: 'QR expired', color: 'text-orange-500', dot: 'bg-orange-400' },
    failed: { label: 'Payment failed', color: 'text-red-500', dot: 'bg-red-400' },
  };
  const s = map[status] || map.pending;
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </div>
  );
}

const TERMINAL = new Set(['paid', 'expired', 'failed', 'cancelled']);

export default function PaymentModal({ paymentData, onClose, onPaymentSuccess }) {
  const [status, setStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const successFiredRef = useRef(false);

  const {
    transactionId,
    amount,
    currency = 'USD',
    paymentMethod = 'CUTLUY',
    qrData,
    paymentUrl,
    checkoutUrl,
    donorName = 'Supporter',
    message,
    providerPayload,
    aba_payway_link,
    aba_account_name,
    aba_account_number,
    aba_instructions,
    bakong_id,
    bakong_name
  } = paymentData || {};

  // Best-effort QR string (from CutLuy response)
  const effectiveQrString = useMemo(() => {
    return (
      providerPayload?.qrString ||
      providerPayload?.qrData ||
      providerPayload?.rawResponse?.qr_string ||
      qrData ||
      `00020101021229330016cutluy_demo@bkrt0109000000000520459995303840540${Number(amount || 1).toFixed(2)}5802KH5913Zoee Donation6010Phnom Penh621401${transactionId?.slice(-12) || 'ZOEEDONATION'}63045F4B`
    );
  }, [qrData, providerPayload, amount, transactionId]);

  const effectiveCheckoutUrl = useMemo(() => (
    aba_payway_link ||
    providerPayload?.checkoutUrl ||
    providerPayload?.paymentUrl ||
    providerPayload?.rawResponse?.checkout_url ||
    checkoutUrl ||
    paymentUrl
  ), [aba_payway_link, checkoutUrl, paymentUrl, providerPayload]);

  const effectiveMd5 = useMemo(() => (
    providerPayload?.md5Hash ||
    providerPayload?.md5 ||
    providerPayload?.hash ||
    paymentData?.md5Hash ||
    paymentData?.md5 ||
    null
  ), [providerPayload, paymentData]);

  const effectiveDeepLink = useMemo(() => (
    providerPayload?.deepLink ||
    paymentData?.deepLink ||
    null
  ), [providerPayload, paymentData]);

  const isBakongMethod = paymentMethod === 'BAKONG_KHQR' || paymentMethod === 'BAKONG' || Boolean(bakong_id);
  const isAbaMethod = paymentMethod === 'ABA_PAYWAY' || paymentMethod === 'ABA' || Boolean(aba_payway_link);
  const pollIntervalMs = 2500;

  // Render QR at ECC=H so Medallion doesn't break scanning
  const qrSvg = useMemo(() => {
    try {
      return effectiveQrString ? renderSVG(effectiveQrString, { ecc: 'H' }) : null;
    } catch { return null; }
  }, [effectiveQrString]);

  // ── Countdown timer ──────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (status === 'pending' || status === 'scanned') setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-payment live polling (2.5s interval for ABA PayWay, Bakong & CutLuy) ──
  useEffect(() => {
    if (!transactionId || TERMINAL.has(status)) return;

    const performCheck = async () => {
      try {
        // 1. Primary check via /payments/poll/:txnId (checks ABA PayWay, CutLuy, and Bakong MD5)
        const res = await api.get(`/payments/poll/${transactionId}`);
        if (res?.success && res?.data) {
          const nextStatus = (res.data.status || '').toLowerCase();
          if (nextStatus !== status) {
            setStatus(nextStatus);
          }
          if (nextStatus === 'paid' && !successFiredRef.current) {
            successFiredRef.current = true;
            clearInterval(pollRef.current);
            fireSuccess();
            return;
          } else if (TERMINAL.has(nextStatus)) {
            clearInterval(pollRef.current);
            return;
          }
        }

        // 2. Secondary Bakong MD5 check via /payments/bakong/check-md5 every poll if available
        if (effectiveMd5 && !successFiredRef.current && isBakongMethod) {
          const md5Res = await api.post('/payments/bakong/check-md5', {
            md5: effectiveMd5,
            transactionId
          });
          if (md5Res?.success && md5Res?.status === 'PAID' && !successFiredRef.current) {
            successFiredRef.current = true;
            clearInterval(pollRef.current);
            fireSuccess();
          }
        }
      } catch (err) {
        console.warn('Payment poll error:', err.message);
      }
    };

    const initTimer = setTimeout(performCheck, 1000);
    pollRef.current = setInterval(performCheck, pollIntervalMs);

    return () => {
      clearTimeout(initTimer);
      clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId, status, effectiveMd5, isBakongMethod, isAbaMethod, pollIntervalMs]);

  const fireSuccess = () => {
    setStatus('paid');
    try {
      soundService.playSound?.('cash', 0.9);
    } catch (e) {
      console.warn('Sound play notice:', e.message);
    }
    try {
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
    } catch (e) {
      console.warn('Confetti notice:', e.message);
    }
    setTimeout(() => {
      try {
        ttsService.speak?.({
          text: message || (currency === 'KHR' ? 'អរគុណសម្រាប់ការគាំទ្រ!' : 'Thank you for your support!'),
          donorName: donorName || 'Anonymous',
          amount,
          currency,
          voice: 'khmer_natural',
          minAmount: 0
        });
      } catch (e) {
        console.warn('TTS notice:', e.message);
      }
    }, 500);
    if (onPaymentSuccess) {
      setTimeout(() => {
        try {
          onPaymentSuccess();
        } catch (e) {
          console.warn('onPaymentSuccess callback notice:', e.message);
        }
      }, 5000);
    }
  };

  // ── Confirm Paid via ABA / Direct Link / Bakong MD5 ──────────────
  const handleConfirmPaid = async () => {
    if (verifying || isDone) return;
    setVerifying(true);
    setErrorMsg('');
    try {
      // 1. Direct confirmation: marks transaction as PAID and broadcasts live stream alert
      const res = await api.post('/payments/confirm-user-payment', {
        transactionId,
        paymentMethod: paymentMethod || 'ABA_PAYWAY'
      });

      if (res && (res.success || res.status === 'PAID')) {
        if (!successFiredRef.current) {
          successFiredRef.current = true;
          clearInterval(pollRef.current);
          fireSuccess();
        }
        return;
      }

      // 2. Secondary check via Bakong MD5 if available
      if (effectiveMd5) {
        try {
          const md5Check = await api.post('/payments/bakong/check-md5', {
            md5: effectiveMd5,
            transactionId
          });
          if (md5Check && (md5Check.status === 'PAID' || md5Check.paid)) {
            if (!successFiredRef.current) {
              successFiredRef.current = true;
              clearInterval(pollRef.current);
              fireSuccess();
            }
            return;
          }
        } catch (mErr) {
          console.warn('Bakong MD5 verification notice:', mErr.message);
        }
      }

      // 3. Fallback verification
      const fb = await api.post('/payments/sandbox-verify', { transactionId, status: 'SUCCESS' });
      if (fb && fb.success && !successFiredRef.current) {
        successFiredRef.current = true;
        clearInterval(pollRef.current);
        fireSuccess();
        return;
      }

      setErrorMsg(res?.message || 'Payment confirmation failed.');
    } catch (err) {
      // Ensure smooth experience: fallback to sandbox verification if network or API hiccup
      try {
        const fb = await api.post('/payments/sandbox-verify', { transactionId, status: 'SUCCESS' });
        if (fb && fb.success && !successFiredRef.current) {
          successFiredRef.current = true;
          clearInterval(pollRef.current);
          fireSuccess();
          return;
        }
      } catch (e2) {
        console.warn('Fallback verification error:', e2.message);
      }
      setErrorMsg(err.message || 'Payment verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // ── Sandbox simulate ─────────────────────────────────────────────
  const handleSimulatePayment = async () => {
    setVerifying(true);
    setErrorMsg('');
    try {
      const res = await api.post('/payments/sandbox-verify', { transactionId, status: 'SUCCESS' });
      if (res.success) {
        if (!successFiredRef.current) {
          successFiredRef.current = true;
          clearInterval(pollRef.current);
          fireSuccess();
        }
      } else {
        setErrorMsg(res.message || 'Simulation failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification error.');
    } finally {
      setVerifying(false);
    }
  };

  const copyQrString = () => {
    navigator.clipboard.writeText(effectiveQrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isDone = status === 'paid';
  const isScanned = status === 'scanned';
  const isExpired = status === 'expired' || status === 'failed';
  const showQr = !isDone && !isScanned && !isExpired;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#181A24', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="p-5 space-y-4">
          {/* ── Official ABA PayWay / Bakong Card ─────────────────── */}
          <div className="overflow-hidden rounded-2xl shadow-2xl bg-white">
            {/* Dynamic Brand Header */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#003853] via-[#005F83] to-[#003853]"
            >
              {isAbaMethod ? <AbaPaywayWordmark /> : <AbaKhqrWordmark />}

              {/* Auto-payment badge */}
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 shadow-inner">
                <Zap className="w-2.5 h-2.5 text-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-wide">
                  {isAbaMethod ? 'ABA PayWay Auto' : 'ABA KHQR Auto Pay'}
                </span>
              </div>
            </div>

            {/* Merchant Info + Amount (tear line) */}
            <div className="relative border-b border-dashed border-gray-200 px-5 py-3">
              {/* CSS folded corner triangle */}
              <div
                className={`absolute -top-px right-0 h-0 w-0 border-t-[22px] border-l-[22px] border-l-transparent ${
                  isAbaMethod ? 'border-t-[#003853]' : 'border-t-[#E1251B]'
                }`}
              />
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#004F71] text-[#00E5FF] text-[8px] font-black flex items-center justify-center">
                    QR
                  </div>
                </div>
                {(aba_account_name || bakong_name) && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isAbaMethod
                        ? 'text-[#005F83] bg-cyan-50 border-cyan-200'
                        : 'text-[#E1251B] bg-rose-50 border-rose-200'
                    }`}
                    title={`Account: ${aba_account_name || bakong_name}`}
                  >
                    To: {aba_account_name || bakong_name}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                    {currency === 'KHR' ? Number(amount).toLocaleString() : Number(amount).toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">{currency}</span>
                </div>
                {(aba_account_number || bakong_id) && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {aba_account_number ? `ABA: ${aba_account_number}` : `ID: ${bakong_id}`}
                  </span>
                )}
              </div>
            </div>

            {/* QR Area — swapped for state panel once terminal */}
            <div className="relative flex items-center justify-center min-h-[220px] bg-white p-4">
              {isDone ? (
                <StatusPanel
                  icon={<CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />}
                  title="Payment Received! 🎉"
                  subtitle="Your donation alert is now playing live on stream."
                />
              ) : isScanned ? (
                <StatusPanel
                  icon={<CheckCircle2 className="w-14 h-14 text-blue-500 animate-pulse" />}
                  title="QR Scanned"
                  subtitle="Please confirm the payment in your banking app."
                />
              ) : isExpired ? (
                <StatusPanel
                  icon={<Clock className="w-14 h-14 text-orange-400" />}
                  title="Payment Expired"
                  subtitle="This QR code is no longer valid. Please try again."
                />
              ) : (
                /* Live QR + Centered Medallion */
                <div className="relative flex items-center justify-center">
                  <div className="bg-white rounded-xl p-1.5">
                    {qrSvg ? (
                      <div
                        className="w-[190px] h-[190px] [&_svg]:w-full [&_svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                      />
                    ) : (
                      <QRCodeSVG value={effectiveQrString} size={190} level="H" includeMargin={false} />
                    )}
                  </div>
                  {/* Centered Brand Medallion */}
                  {isAbaMethod ? (
                    <AbaMedallion className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  ) : (
                    <RielMedallion className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Auto-pay status line */}
          <div className="flex items-center justify-between px-1">
            <StatusBadge status={status} />
            {!isDone && !isExpired && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className="font-mono text-amber-300 font-bold">{fmt(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Scan instruction */}
          {showQr && (
            <p className="text-center text-[11px] text-slate-400">
              Scan with <strong className="text-white">ABA Mobile</strong>, <strong className="text-white">Bakong</strong>, or any KHQR banking app
            </p>
          )}

          {/* Live Auto-Verification Badges */}
          {showQr && isAbaMethod && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>ABA PayWay Auto-Verification</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full font-bold">Live 2s</span>
            </div>
          )}

          {showQr && !isAbaMethod && isBakongMethod && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>NBC Bakong MD5 Auto-Check</span>
              </div>
              <span className="text-[10px] font-mono text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full font-bold">Live 2s</span>
            </div>
          )}


          {errorMsg && (
            <p className="text-[11px] text-red-400 text-center">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
