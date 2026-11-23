/**
 * @file proAudioMixerService.ts
 * @description Pro 3-Bus Web Audio Mixer & Synced Tabletop Soundboard (Music / Ambient / SFX)
 *   with smooth GainNode crossfades, playlist queuing, custom URL/upload track registration,
 *   procedural noise/oscillator beds when offline, and LiveKit/Yjs remote cue synchronization.
 */

import { VttEventBus } from '../utils/vttEventBus.ts';
import { getVttMultiplayerSync } from './vttMultiplayerSyncService.ts';

export type AudioBusId = 'music' | 'ambient' | 'sfx';

export interface AudioTrackPreset {
  id: string;
  title: string;
  bus: AudioBusId;
  url?: string;
  synthFrequency?: number;
  synthMode?: 'drone' | 'pulse' | 'chime' | 'noise';
  loop?: boolean;
  tags?: string[];
}

export interface AudioBusState {
  bus: AudioBusId;
  volume: number;
  muted: boolean;
  activeTrackId: string | null;
  activeTitle: string | null;
  isPlaying: boolean;
  loop: boolean;
  queue: string[];
}

export const CANONICAL_AUDIO_CUES: AudioTrackPreset[] = [
  {
    id: 'bridge_hum',
    title: 'Starship Bridge Hum',
    bus: 'ambient',
    synthFrequency: 74,
    synthMode: 'drone',
    loop: true,
    tags: ['ship', 'interior', 'sci-fi']
  },
  {
    id: 'nebula_drift',
    title: 'Nebula Drift Synth',
    bus: 'music',
    synthFrequency: 196,
    synthMode: 'drone',
    loop: true,
    tags: ['exploration', 'space', 'calm']
  },
  {
    id: 'combat_pulse',
    title: 'Tactical Combat Pulse',
    bus: 'music',
    synthFrequency: 110,
    synthMode: 'pulse',
    loop: true,
    tags: ['combat', 'tension', 'action']
  },
  {
    id: 'acid_rain',
    title: 'Industrial Acid Rain',
    bus: 'ambient',
    synthFrequency: 420,
    synthMode: 'noise',
    loop: true,
    tags: ['weather', 'city', 'cyberpunk']
  },
  {
    id: 'airlock_hiss',
    title: 'Airlock Depressurization',
    bus: 'sfx',
    synthFrequency: 640,
    synthMode: 'noise',
    loop: false,
    tags: ['door', 'bulkhead', 'sfx']
  },
  {
    id: 'klaxon_alert',
    title: 'Red Alert Klaxon',
    bus: 'sfx',
    synthFrequency: 520,
    synthMode: 'pulse',
    loop: false,
    tags: ['alarm', 'hazard', 'sfx']
  },
  {
    id: 'plasma_discharge',
    title: 'Plasma Weapon Discharge',
    bus: 'sfx',
    synthFrequency: 310,
    synthMode: 'chime',
    loop: false,
    tags: ['weapon', 'combat', 'sfx']
  },
  {
    id: 'warp_chime',
    title: 'Quantum Gate Chime',
    bus: 'sfx',
    synthFrequency: 587,
    synthMode: 'chime',
    loop: false,
    tags: ['discovery', 'milestone', 'sfx']
  }
];

function createDefaultBusState(bus: AudioBusId): AudioBusState {
  return {
    bus,
    volume: bus === 'sfx' ? 0.85 : 0.65,
    muted: false,
    activeTrackId: null,
    activeTitle: null,
    isPlaying: false,
    loop: bus !== 'sfx',
    queue: []
  };
}

class ProAudioMixerService {
  private readonly tracks = new Map<string, AudioTrackPreset>();
  private readonly busStates: Record<AudioBusId, AudioBusState> = {
    music: createDefaultBusState('music'),
    ambient: createDefaultBusState('ambient'),
    sfx: createDefaultBusState('sfx')
  };
  private readonly listeners = new Set<() => void>();
  private crossfadeMs = 1200;

  private audioCtx: AudioContext | null = null;
  private readonly busGains: Partial<Record<AudioBusId, GainNode>> = {};
  private readonly activeStops: Partial<Record<AudioBusId, () => void>> = {};
  private remoteUnsub: (() => void) | null = null;

  constructor() {
    for (const preset of CANONICAL_AUDIO_CUES) {
      this.tracks.set(preset.id, preset);
    }
    if (typeof window !== 'undefined') {
      this.remoteUnsub = VttEventBus.on('stage-remote-audio-cue', (payload) => {
        if (!payload?.bus) return;
        if (payload.action === 'stop') {
          this.stopBus(payload.bus, false);
        } else if (payload.action === 'volume' && typeof payload.volume === 'number') {
          this.setBusVolume(payload.bus, payload.volume, false);
        } else if (payload.action === 'play' || payload.action === 'crossfade') {
          if (payload.trackUrl && payload.trackId) {
            this.registerCustomTrack({
              id: payload.trackId,
              title: payload.title || 'Remote Shared Track',
              bus: payload.bus,
              url: payload.trackUrl,
              loop: payload.bus !== 'sfx'
            });
          }
          if (payload.trackId) {
            void this.playCue(payload.bus, payload.trackId, false);
          }
        }
      });
    }
  }

  public getAllTracks(): AudioTrackPreset[] {
    return Array.from(this.tracks.values());
  }

  public getBusState(bus: AudioBusId): AudioBusState {
    const s = this.busStates[bus];
    return { ...s, queue: [...s.queue] };
  }

  public getAllBusStates(): Record<AudioBusId, AudioBusState> {
    return {
      music: this.getBusState('music'),
      ambient: this.getBusState('ambient'),
      sfx: this.getBusState('sfx')
    };
  }

  public getCrossfadeMs(): number {
    return this.crossfadeMs;
  }

  public setCrossfadeMs(ms: number): void {
    this.crossfadeMs = Math.max(0, Math.min(5000, Math.round(ms)));
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {}
    }
  }

  public registerCustomTrack(track: AudioTrackPreset): AudioTrackPreset {
    const normalized: AudioTrackPreset = {
      ...track,
      loop: track.loop ?? track.bus !== 'sfx'
    };
    this.tracks.set(normalized.id, normalized);
    this.notify();
    return normalized;
  }

  public enqueueTrack(bus: AudioBusId, trackId: string): void {
    if (!this.tracks.has(trackId)) return;
    this.busStates[bus].queue.push(trackId);
    this.notify();
  }

  public nextTrack(bus: AudioBusId, broadcast = false): string | null {
    const nextId = this.busStates[bus].queue.shift() || null;
    if (nextId) {
      void this.playCue(bus, nextId, broadcast);
    } else {
      this.stopBus(bus, broadcast);
    }
    return nextId;
  }

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    }
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    try {
      this.audioCtx = new Ctx();
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  private ensureBusGain(bus: AudioBusId): GainNode | null {
    const ctx = this.ensureAudioContext();
    if (!ctx) return null;
    let gain = this.busGains[bus];
    if (!gain) {
      gain = ctx.createGain();
      const s = this.busStates[bus];
      gain.gain.value = s.muted ? 0 : s.volume;
      gain.connect(ctx.destination);
      this.busGains[bus] = gain;
    }
    return gain;
  }

  public setBusVolume(bus: AudioBusId, volume: number, broadcast = false): void {
    const clamped = Math.max(0, Math.min(1, Number(volume) || 0));
    this.busStates[bus].volume = clamped;
    const gain = this.busGains[bus];
    if (gain && this.audioCtx && !this.busStates[bus].muted) {
      try {
        gain.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
      } catch {
        gain.gain.value = clamped;
      }
    }
    if (broadcast) {
      getVttMultiplayerSync().broadcastAudioCue({
        bus,
        action: 'volume',
        volume: clamped
      });
    }
    this.notify();
  }

  public toggleBusMute(bus: AudioBusId): void {
    const nextMuted = !this.busStates[bus].muted;
    this.busStates[bus].muted = nextMuted;
    const gain = this.busGains[bus];
    if (gain && this.audioCtx) {
      const target = nextMuted ? 0 : this.busStates[bus].volume;
      try {
        gain.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.04);
      } catch {
        gain.gain.value = target;
      }
    }
    this.notify();
  }

  public async playCue(bus: AudioBusId, trackId: string, broadcast = false): Promise<boolean> {
    const track = this.tracks.get(trackId);
    if (!track) return false;

    this.stopAudioNodesOnly(bus);

    this.busStates[bus] = {
      ...this.busStates[bus],
      activeTrackId: track.id,
      activeTitle: track.title,
      isPlaying: true,
      loop: track.loop ?? bus !== 'sfx'
    };

    const gain = this.ensureBusGain(bus);
    const ctx = this.audioCtx;
    if (ctx && gain) {
      const targetVol = this.busStates[bus].muted ? 0 : this.busStates[bus].volume;
      const fadeSec = Math.max(0.05, this.crossfadeMs / 1000);
      try {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(Math.max(0.001, targetVol), ctx.currentTime + (bus === 'sfx' ? 0.03 : fadeSec));
      } catch {}

      if (track.url && typeof Audio !== 'undefined') {
        try {
          const el = new Audio(track.url);
          el.crossOrigin = 'anonymous';
          el.loop = Boolean(track.loop ?? bus !== 'sfx');
          const srcNode = ctx.createMediaElementSource(el);
          srcNode.connect(gain);
          el.onended = () => {
            if (!el.loop) {
              this.busStates[bus].isPlaying = false;
              this.notify();
            }
          };
          void el.play().catch(() => {});
          this.activeStops[bus] = () => {
            try {
              el.pause();
              el.src = '';
              srcNode.disconnect();
            } catch {}
          };
        } catch {
          this.startSynthFallback(bus, track, ctx, gain);
        }
      } else {
        this.startSynthFallback(bus, track, ctx, gain);
      }
    }

    if (broadcast) {
      getVttMultiplayerSync().broadcastAudioCue({
        bus,
        action: bus === 'sfx' ? 'play' : 'crossfade',
        trackId: track.id,
        title: track.title,
        ...(track.url ? { trackUrl: track.url } : {}),
        volume: this.busStates[bus].volume
      });
    }

    this.notify();
    return true;
  }

  private startSynthFallback(
    bus: AudioBusId,
    track: AudioTrackPreset,
    ctx: AudioContext,
    gain: GainNode
  ): void {
    try {
      const osc = ctx.createOscillator();
      const subGain = ctx.createGain();
      osc.type = track.synthMode === 'pulse' ? 'sawtooth' : track.synthMode === 'chime' ? 'triangle' : 'sine';
      osc.frequency.value = track.synthFrequency || 140;
      subGain.gain.value = bus === 'sfx' ? 0.14 : 0.04;
      osc.connect(subGain);
      subGain.connect(gain);
      osc.start();
      if (bus === 'sfx' && !track.loop) {
        const durSec = 0.35;
        subGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durSec);
        osc.stop(ctx.currentTime + durSec + 0.02);
        this.busStates[bus].isPlaying = false;
      }
      this.activeStops[bus] = () => {
        try {
          osc.stop();
          osc.disconnect();
          subGain.disconnect();
        } catch {}
      };
    } catch {}
  }

  private stopAudioNodesOnly(bus: AudioBusId): void {
    const stopFn = this.activeStops[bus];
    if (stopFn) {
      stopFn();
      delete this.activeStops[bus];
    }
  }

  public stopBus(bus: AudioBusId, broadcast = false): void {
    this.stopAudioNodesOnly(bus);
    this.busStates[bus] = {
      ...this.busStates[bus],
      isPlaying: false
    };
    if (broadcast) {
      getVttMultiplayerSync().broadcastAudioCue({
        bus,
        action: 'stop'
      });
    }
    this.notify();
  }

  public destroy(): void {
    this.stopAudioNodesOnly('music');
    this.stopAudioNodesOnly('ambient');
    this.stopAudioNodesOnly('sfx');
    if (this.remoteUnsub) {
      this.remoteUnsub();
      this.remoteUnsub = null;
    }
    this.listeners.clear();
  }
}

export const proAudioMixerService = new ProAudioMixerService();
export default proAudioMixerService;
