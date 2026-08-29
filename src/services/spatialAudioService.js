/**
 * spatialAudioService.js
 * Positional 3D spatial audio engine using Web Audio API HRTF / Exponential distance models for Tangent SF RP.
 */

class SpatialAudioEngine {
  constructor() {
    this.ctx = null;
    this.emitters = new Map();
    this.listenerPos = { x: 0, y: 0 };
    this.masterGain = null;
    this.isMuted = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('Spatial Audio Engine initialization error:', e);
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setListenerPosition(x, y, gridScale = 40) {
    this.listenerPos = { x, y };
    if (!this.ctx) return;

    // Convert pixel coordinates to meter space (e.g. 40px = 2 meters)
    const meterX = x / gridScale;
    const meterY = y / gridScale;

    try {
      if (this.ctx.listener.positionX) {
        this.ctx.listener.positionX.setValueAtTime(meterX, this.ctx.currentTime);
        this.ctx.listener.positionY.setValueAtTime(meterY, this.ctx.currentTime);
        this.ctx.listener.positionZ.setValueAtTime(1, this.ctx.currentTime);
      } else {
        this.ctx.listener.setPosition(meterX, meterY, 1);
      }
    } catch (e) {
      // Fallback silently if listener API not ready
    }
  }

  /**
   * Creates a synthesized procedural spatial sound emitter (e.g. reactor hum, power drone, hazard siren)
   */
  createProceduralEmitter(emitterId, { x, y, type = 'reactor_hum', maxDistance = 25, gridScale = 40 }) {
    this.ensureContext();
    if (!this.ctx) return null;

    this.removeEmitter(emitterId);

    const meterX = x / gridScale;
    const meterY = y / gridScale;

    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'exponential';
    panner.refDistance = 2;
    panner.maxDistance = maxDistance;
    panner.rolloffFactor = 1.8;

    if (panner.positionX) {
      panner.positionX.setValueAtTime(meterX, this.ctx.currentTime);
      panner.positionY.setValueAtTime(meterY, this.ctx.currentTime);
      panner.positionZ.setValueAtTime(0, this.ctx.currentTime);
    } else {
      panner.setPosition(meterX, meterY, 0);
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'reactor_hum') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    } else if (type === 'cyber_alarm') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    } else if (type === 'toxic_vent') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    }

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

    osc.start();

    const emitter = { id: emitterId, x, y, osc, gain, panner, type };
    this.emitters.set(emitterId, emitter);
    return emitter;
  }

  updateEmitterPosition(emitterId, x, y, gridScale = 40) {
    const emitter = this.emitters.get(emitterId);
    if (!emitter || !this.ctx) return;

    emitter.x = x;
    emitter.y = y;
    const meterX = x / gridScale;
    const meterY = y / gridScale;

    if (emitter.panner.positionX) {
      emitter.panner.positionX.setValueAtTime(meterX, this.ctx.currentTime);
      emitter.panner.positionY.setValueAtTime(meterY, this.ctx.currentTime);
    } else {
      emitter.panner.setPosition(meterX, meterY, 0);
    }
  }

  removeEmitter(emitterId) {
    const emitter = this.emitters.get(emitterId);
    if (emitter) {
      try {
        emitter.osc.stop();
        emitter.osc.disconnect();
        emitter.gain.disconnect();
        emitter.panner.disconnect();
      } catch (e) {
        // Node already stopped
      }
      this.emitters.delete(emitterId);
    }
  }

  clearAllEmitters() {
    for (const id of this.emitters.keys()) {
      this.removeEmitter(id);
    }
  }
}

export const SpatialAudio = new SpatialAudioEngine();
export default SpatialAudio;
