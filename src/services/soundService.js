/**
 * Web Audio API Synthesizer & Audio Player for OBS Alert Songs & Sound Effects
 * Includes multi-track synthesized melody songs and custom audio/MP3 support.
 */
class SoundService {
  constructor() {
    this.audioCtx = null;
    this.currentAudio = null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Stop all active audio / music
   */
  stopAll() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (_) {}
      this.currentAudio = null;
    }
  }

  /**
   * Play alert sound or song by preset ID or direct audio URL
   */
  playSound(presetOrUrl = 'chime', volume = 0.85) {
    this.stopAll();

    // If it's a URL or base64 audio data
    if (typeof presetOrUrl === 'string' && (presetOrUrl.startsWith('http') || presetOrUrl.startsWith('data:audio/') || presetOrUrl.endsWith('.mp3') || presetOrUrl.endsWith('.wav') || presetOrUrl.endsWith('.ogg'))) {
      try {
        const audio = new Audio(presetOrUrl);
        audio.volume = Math.min(Math.max(volume, 0), 1.0);
        audio.play().catch(err => {
          console.warn('Custom song playback failed, falling back to synthesizer:', err.message);
          this.playSynthesizedSong('chime', volume);
        });
        this.currentAudio = audio;
        return;
      } catch (e) {
        console.warn('Audio tag error:', e);
      }
    }

    this.playSynthesizedSong(presetOrUrl, volume);
  }

  playSynthesizedSong(preset = 'chime', volume = 0.85) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0), 1.0), ctx.currentTime);
      masterGain.connect(ctx.destination);

      switch (preset) {
        case 'cash':
        case 'register':
        case 'bakong':
          this.playCashRegister(ctx, masterGain);
          break;
        case 'victory':
        case 'fanfare':
          this.playVictoryFanfare(ctx, masterGain);
          break;
        case 'party':
        case 'celebration':
          this.playPartyCelebration(ctx, masterGain);
          break;
        case 'kawaii':
        case 'anime_bell':
          this.playKawaiiBell(ctx, masterGain);
          break;
        case 'arcade':
        case 'retro':
          this.playArcadeChime(ctx, masterGain);
          break;
        case 'cyber':
        case 'synth_drop':
          this.playCyberDrop(ctx, masterGain);
          break;
        case 'brass':
        case 'epic_horn':
          this.playEpicBrass(ctx, masterGain);
          break;
        case 'guitar':
        case 'rock':
          this.playGuitarRiff(ctx, masterGain);
          break;
        case 'level_up':
          this.playLevelUp(ctx, masterGain);
          break;
        case 'ding':
          this.playBellDing(ctx, masterGain);
          break;
        case 'chime':
        default:
          this.playCosmicChime(ctx, masterGain);
          break;
      }
    } catch (err) {
      console.warn('Audio synthesis error:', err.message);
    }
  }

  // 1. Cosmic Chime 🔔
  playCosmicChime(ctx, destination) {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 1.4);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 1.5);
    });
  }

  // 2. Bakong & ABA Cash Register 💰
  playCashRegister(ctx, destination) {
    const sequence = [
      { freq: 880, time: 0, dur: 0.12, type: 'triangle' },
      { freq: 1320, time: 0.08, dur: 0.14, type: 'triangle' },
      { freq: 1760, time: 0.16, dur: 0.35, type: 'sine' },
      { freq: 2200, time: 0.22, dur: 0.55, type: 'sine' }
    ];
    sequence.forEach(s => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = s.type;
      osc.frequency.setValueAtTime(s.freq, ctx.currentTime + s.time);

      gain.gain.setValueAtTime(0, ctx.currentTime + s.time);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + s.time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.time + s.dur);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(ctx.currentTime + s.time);
      osc.stop(ctx.currentTime + s.time + s.dur + 0.05);
    });
  }

  // 3. Victory Epic Fanfare 🎺
  playVictoryFanfare(ctx, destination) {
    const melody = [
      { f: 523.25, t: 0, d: 0.15 },     // C5
      { f: 523.25, t: 0.15, d: 0.15 },  // C5
      { f: 523.25, t: 0.30, d: 0.15 },  // C5
      { f: 659.25, t: 0.45, d: 0.35 },  // E5
      { f: 783.99, t: 0.70, d: 0.20 },  // G5
      { f: 1046.50, t: 0.90, d: 0.70 }  // C6 (Triumphant hold)
    ];
    melody.forEach(m => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(m.f, ctx.currentTime + m.t);

      gain.gain.setValueAtTime(0, ctx.currentTime + m.t);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + m.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + m.t + m.d);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(ctx.currentTime + m.t);
      osc.stop(ctx.currentTime + m.t + m.d + 0.05);
    });
  }

  // 4. Party Celebration Horn 🥳
  playPartyCelebration(ctx, destination) {
    const chords = [
      { notes: [440, 554.37, 659.25], t: 0, d: 0.25 },
      { notes: [493.88, 622.25, 739.99], t: 0.28, d: 0.25 },
      { notes: [587.33, 739.99, 880], t: 0.56, d: 0.65 }
    ];
    chords.forEach(c => {
      c.notes.forEach(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + c.t);

        gain.gain.setValueAtTime(0, ctx.currentTime + c.t);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + c.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.t + c.d);

        osc.connect(gain);
        gain.connect(destination);
        osc.start(ctx.currentTime + c.t);
        osc.stop(ctx.currentTime + c.t + c.d + 0.05);
      });
    });
  }

  // 5. Kawaii Anime Bell 🎀
  playKawaiiBell(ctx, destination) {
    const notes = [659.25, 880, 987.77, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.9);
    });
  }

  // 6. Retro Arcade 🕹️
  playArcadeChime(ctx, destination) {
    const notes = [440, 659.25, 880, 1174.66, 1760];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
    });
  }

  // 7. Cyber Drop 🚀
  playCyberDrop(ctx, destination) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.85);
  }

  // 8. Epic Brass 🎷
  playEpicBrass(ctx, destination) {
    const notes = [329.63, 392.00, 493.88, 659.25]; // E4, G4, B4, E5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.9);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.95);
    });
  }

  // 9. Guitar Riff 🎸
  playGuitarRiff(ctx, destination) {
    const notes = [293.66, 329.63, 440.00, 587.33]; // D4, E4, A4, D5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.7);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.75);
    });
  }

  // 10. Level Up 🌟
  playLevelUp(ctx, destination) {
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.07 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.7);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(ctx.currentTime + idx * 0.07);
      osc.stop(ctx.currentTime + idx * 0.07 + 0.75);
    });
  }

  // 11. Soft Ding ✨
  playBellDing(ctx, destination) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.6);
  }
}

export default new SoundService();
