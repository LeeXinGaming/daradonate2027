/**
 * Voice AI & Text-to-Speech (TTS) Service with Khmer (ភាសាខ្មែរ) & Multi-language Support
 * Enhanced with "Strict Single-Active / Read Only 1 Message" safety guard,
 * zero-overlap mutex, natural numeral pronunciation, custom template tags,
 * tier-based greetings, profanity/anti-spam filtering, and instant preview.
 */
class TTSService {
  constructor() {
    this.queue = [];
    this.isSpeaking = false;
    this.voices = [];
    this.listeners = new Set();
    this.speechTimeout = null;
    this.readOnlyOneMode = true; // Strict single-active speech mode

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        this.voices = window.speechSynthesis.getVoices();
        this.notifyListeners();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  onVoicesChanged(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(this.voices); } catch (_) {}
    });
  }

  /**
   * Check if text contains Khmer Unicode characters
   */
  isKhmer(text) {
    if (!text) return false;
    return /[\u1780-\u17FF\u19E0-\u19FF]/.test(text);
  }

  /**
   * Convert numbers to spoken Khmer text
   */
  toKhmerSpokenAmount(rawAmount, currency = 'USD') {
    const num = parseFloat(rawAmount) || 0;
    if (currency === 'KHR') {
      if (num >= 10000 && num % 10000 === 0) {
        const meun = num / 10000;
        return `${meun} ម៉ឺន រៀល`;
      }
      if (num >= 1000 && num % 1000 === 0) {
        const poan = num / 1000;
        return `${poan} ពាន់ រៀល`;
      }
      return `${num.toLocaleString()} រៀល`;
    }

    // USD Currency
    const dollars = Math.floor(num);
    const cents = Math.round((num - dollars) * 100);

    if (cents > 0) {
      return `${dollars} ដុល្លារ ${cents} សេន`;
    }
    return `${dollars} ដុល្លារ`;
  }

  /**
   * Convert numbers to spoken English text
   */
  toEnglishSpokenAmount(rawAmount, currency = 'USD') {
    const num = parseFloat(rawAmount) || 0;
    if (currency === 'KHR') {
      return `${num.toLocaleString()} Riel`;
    }

    const dollars = Math.floor(num);
    const cents = Math.round((num - dollars) * 100);

    if (cents > 0) {
      return `${dollars} dollars and ${cents} cents`;
    }
    return `${dollars} dollar${dollars === 1 ? '' : 's'}`;
  }

  /**
   * Filter and clean text (anti-spam, URLs, repeated chars, profanity)
   */
  cleanText(text, options = {}) {
    if (!text) return '';
    let cleaned = String(text);

    // Remove URLs
    cleaned = cleaned.replace(/https?:\/\/\S+/gi, '');

    // Remove raw emojis that crash or confuse TTS synthesis
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    // Anti-spam repeated characters (e.g. "aaaaaahhhhhh" -> "aah")
    if (options.spam_filter !== false) {
      cleaned = cleaned.replace(/(.)\1{4,}/g, '$1$1');
      cleaned = cleaned.replace(/(ha|ja|55|ww){4,}/gi, '$1$1');
    }

    // Profanity Filter
    if (options.profanity_filter !== false) {
      const badWords = [
        'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt',
        'kdoe', 'kdot', 'kdey', 'kdan', 'choy', 'mray', 'ah choy'
      ];
      badWords.forEach(w => {
        const regex = new RegExp(`\\b${w}\\b`, 'gi');
        cleaned = cleaned.replace(regex, '***');
      });
    }

    const maxLen = options.max_chars || 180;
    return cleaned.trim().slice(0, maxLen);
  }

  /**
   * Get available TTS voices
   */
  getAvailableVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.voices.length === 0) {
        this.voices = window.speechSynthesis.getVoices();
      }
    }
    return this.voices;
  }

  /**
   * Find best matching voice for language & style
   */
  findVoice(voicePreset, isKhmerText) {
    if (!this.voices || this.voices.length === 0) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.voices = window.speechSynthesis.getVoices();
      }
    }

    // 1. If Khmer is requested or detected, look for km-KH / km / Khmer voice
    if (voicePreset?.includes('khmer') || isKhmerText) {
      const khmerVoice = this.voices.find(v =>
        v.lang === 'km-KH' ||
        v.lang === 'km' ||
        v.name.toLowerCase().includes('khmer') ||
        v.name.toLowerCase().includes('cambodia')
      );
      if (khmerVoice) return khmerVoice;
    }

    // 2. Look for English voices matching specific presets
    if (voicePreset === 'english_female' || voicePreset === 'anime_girl') {
      const female = this.voices.find(v => (v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('joanna') || v.name.toLowerCase().includes('olivia'))));
      if (female) return female;
    }

    if (voicePreset === 'english_male' || voicePreset === 'cyber_synth') {
      const male = this.voices.find(v => (v.lang.startsWith('en') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('brian') || v.name.toLowerCase().includes('matthew') || v.name.toLowerCase().includes('guy'))));
      if (male) return male;
    }

    // 3. Fallback: English or default system voice
    const defaultVoice = this.voices.find(v => v.lang.startsWith('en') && v.default) ||
      this.voices.find(v => v.lang.startsWith('en')) ||
      this.voices[0] ||
      null;

    return defaultVoice;
  }

  /**
   * Format message template using custom tags
   */
  renderTemplate({ template, donorName = 'Anonymous', amount = 0, currency = 'USD', message = '', streamerName = 'Streamer', isKhmerText = false }) {
    const spokenKhmerAmt = this.toKhmerSpokenAmount(amount, currency);
    const spokenEnglishAmt = this.toEnglishSpokenAmount(amount, currency);
    const targetAmount = isKhmerText ? spokenKhmerAmt : spokenEnglishAmt;

    if (template && template.trim()) {
      return template
        .replace(/\{donor\}/gi, donorName)
        .replace(/\{donorName\}/gi, donorName)
        .replace(/\{name\}/gi, donorName)
        .replace(/\{price\}/gi, targetAmount)
        .replace(/\{amount\}/gi, targetAmount)
        .replace(/\{money\}/gi, targetAmount)
        .replace(/\{currency\}/gi, currency)
        .replace(/\{streamer\}/gi, streamerName)
        .replace(/\{streamerName\}/gi, streamerName)
        .replace(/\{message\}/gi, message)
        .replace(/\{msg\}/gi, message);
    }

    if (isKhmerText) {
      return message
        ? `សូមអរគុណដល់ ${donorName} សម្រាប់ការឧបត្ថម្ភចំនួន ${spokenKhmerAmt} និងការគាំទ្រ! សារជូនពរ៖ ${message}`
        : `សូមអរគុណដល់ ${donorName} សម្រាប់ការឧបត្ថម្ភចំនួន ${spokenKhmerAmt} និងការគាំទ្រដល់ការផ្សាយផ្ទាល់!`;
    }

    return message
      ? `Thank you ${donorName} for supporting with ${spokenEnglishAmt}! Message: ${message}`
      : `Thank you ${donorName} for supporting with ${spokenEnglishAmt}! Thank you for your support!`;
  }

  /**
   * Queue a donation message to be read aloud by Voice AI
   * Enforces "Read Only 1" single-active reading policy
   */
  speak({
    text = '',
    donorName = 'Anonymous',
    amount = 0,
    currency = 'USD',
    rate = 1.0,
    pitch = 1.0,
    volume = 0.85,
    voice = 'khmer_natural',
    template = '',
    tier1_template = '',
    tier2_template = '',
    tier3_template = '',
    streamerName = '',
    minAmount = 0,
    profanity_filter = true,
    spam_filter = true,
    max_chars = 180,
    readOnlyOne = true
  }) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const numAmount = Number(amount) || 0;
    if (numAmount < Number(minAmount || 0)) return;

    // Clean donor text message
    const cleanMsg = this.cleanText(text, { profanity_filter, spam_filter, max_chars });
    const isKhmerText = this.isKhmer(cleanMsg) || this.isKhmer(donorName) || this.isKhmer(template) || voice?.includes('khmer');

    // Select template based on donation amount tier
    let activeTemplate = template;
    if (numAmount >= 20 && tier3_template && tier3_template.trim()) {
      activeTemplate = tier3_template;
    } else if (numAmount >= 5 && tier2_template && tier2_template.trim()) {
      activeTemplate = tier2_template;
    } else if (tier1_template && tier1_template.trim()) {
      activeTemplate = tier1_template;
    }

    const speechText = this.renderTemplate({
      template: activeTemplate,
      donorName,
      amount: numAmount,
      currency,
      message: cleanMsg,
      streamerName,
      isKhmerText
    });

    const speechLang = isKhmerText ? 'km-KH' : 'en-US';

    // Voice Pitch / Rate Adjustments based on Preset
    let effectivePitch = Number(pitch) || 1.0;
    let effectiveRate = Number(rate) || 1.0;

    if (voice === 'khmer_female' || voice === 'anime_girl') {
      effectivePitch = Math.min(effectivePitch * 1.25, 2.0);
      effectiveRate = effectiveRate * 1.02;
    } else if (voice === 'khmer_male' || voice === 'cyber_synth') {
      effectivePitch = Math.max(effectivePitch * 0.8, 0.5);
      effectiveRate = effectiveRate * 0.92;
    }

    // In Read-Only-1 mode, cancel any existing active speech to guarantee strictly 1 speech at a time
    if (readOnlyOne) {
      this.stop();
    }

    this.queue.push({
      text: speechText,
      lang: speechLang,
      rate: effectiveRate,
      pitch: effectivePitch,
      volume: Math.min(Math.max(Number(volume) || 0.85, 0), 1.0),
      voicePreset: voice,
      isKhmer: isKhmerText
    });

    this.processQueue();
  }

  /**
   * Process speech queue sequentially with strict single-active mutex
   */
  processQueue() {
    if (this.isSpeaking || this.queue.length === 0) return;

    const item = this.queue.shift();
    this.isSpeaking = true;

    try {
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.rate = item.rate || 1.0;
      utterance.pitch = item.pitch || 1.0;
      utterance.volume = item.volume !== undefined ? item.volume : 0.85;
      utterance.lang = item.lang || (item.isKhmer ? 'km-KH' : 'en-US');

      const matchedVoice = this.findVoice(item.voicePreset, item.isKhmer);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      const finishSpeech = () => {
        if (this.speechTimeout) {
          clearTimeout(this.speechTimeout);
          this.speechTimeout = null;
        }
        this.isSpeaking = false;
        setTimeout(() => this.processQueue(), 120);
      };

      utterance.onend = finishSpeech;
      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        finishSpeech();
      };

      // 12s safety timeout in case speech engine hangs
      this.speechTimeout = setTimeout(finishSpeech, 12000);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('TTS error:', err);
      this.isSpeaking = false;
      this.processQueue();
    }
  }

  /**
   * Preview a voice sample immediately (cancels current audio for instant response)
   */
  previewVoice({
    text = 'សូមអរគុណសម្រាប់ការឧបត្ថម្ភ និងការគាំទ្រ!',
    voicePreset = 'khmer_natural',
    rate = 1.0,
    pitch = 1.0,
    volume = 0.85
  }) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.stop();

    const isKhmerText = this.isKhmer(text) || voicePreset?.includes('khmer');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isKhmerText ? 'km-KH' : 'en-US';

    let effectivePitch = Number(pitch) || 1.0;
    let effectiveRate = Number(rate) || 1.0;

    if (voicePreset === 'khmer_female' || voicePreset === 'anime_girl') {
      effectivePitch = Math.min(effectivePitch * 1.25, 2.0);
      effectiveRate = effectiveRate * 1.02;
    } else if (voicePreset === 'khmer_male' || voicePreset === 'cyber_synth') {
      effectivePitch = Math.max(effectivePitch * 0.8, 0.5);
      effectiveRate = effectiveRate * 0.92;
    }

    utterance.pitch = effectivePitch;
    utterance.rate = effectiveRate;
    utterance.volume = Math.min(Math.max(Number(volume) || 0.85, 0), 1.0);

    const matchedVoice = this.findVoice(voicePreset, isKhmerText);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    this.queue = [];
    this.isSpeaking = false;
  }
}

export default new TTSService();
