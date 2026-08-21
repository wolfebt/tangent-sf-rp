/**
 * Procedural Web Audio API Sound Synthesizer for Tangent SFF RP.
 * Zero external audio assets required; 100% generated in real-time.
 */

class ProceduralSciFiAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.droneOsc = null;
    this.muted = typeof window !== 'undefined' ? localStorage.getItem('tangent_audio_muted') === 'true' : false;
    this.volume = typeof window !== 'undefined' ? parseFloat(localStorage.getItem('tangent_audio_volume') || '0.35') : 0.35;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  setVolume(newVol) {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tangent_audio_volume', this.volume.toString());
    }
    if (this.masterGain && !this.muted && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tangent_audio_muted', this.muted.toString());
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.muted;
  }

  /**
   * High-tech tactile terminal beep for button clicks and menu navigation
   */
  playTerminalBeep(freq = 1100, duration = 0.035) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioService playback error:", e);
    }
  }

  /**
   * Synthesizes multi-impact polyhedral dice tumble
   */
  playDiceRollSound() {
    if (this.muted) return;
    this.init();

    const bounces = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < bounces; i++) {
      const delay = i * 40 + Math.random() * 15;
      const freq = 220 + Math.random() * 350;
      setTimeout(() => {
        if (!this.muted) this.playTerminalBeep(freq, 0.025);
      }, delay);
    }
  }

  /**
   * Critical success triumphant chord or critical fumble dissonant chime
   */
  playCriticalChime(isSuccess = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const chord = isSuccess 
        ? [523.25, 659.25, 783.99, 1046.50] // C Major arpeggio
        : [370.0, 311.13, 261.63, 196.0];   // Dark dissonance

      chord.forEach((freq, idx) => {
        setTimeout(() => {
          if (this.muted || !this.ctx) return;
          try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = isSuccess ? 'triangle' : 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.25);
          } catch (err) {
            // Ignore audio interruption
          }
        }, idx * 70);
      });
    } catch (e) {
      console.warn("AudioService chime error:", e);
    }
  }

  /**
   * Tactical combat hit / damage sound
   */
  playCombatHit(isCritical = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isCritical ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(isCritical ? 120 : 80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("AudioService hit sound error:", e);
    }
  }

  /**
   * Low-frequency ambient spaceship background hum
   */
  startAmbientDrone() {
    if (this.muted || this.droneOsc) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.droneOsc = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();

      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A1 note

      droneGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

      this.droneOsc.connect(droneGain);
      droneGain.connect(this.masterGain);
      this.droneOsc.start();
    } catch (e) {
      console.warn("AudioService drone error:", e);
    }
  }

  stopAmbientDrone() {
    if (this.droneOsc) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
      } catch (e) {
        // Ignore
      }
      this.droneOsc = null;
    }
  }
}

export const AudioService = new ProceduralSciFiAudio();
