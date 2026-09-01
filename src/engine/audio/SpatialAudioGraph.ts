/**
 * @file SpatialAudioGraph.ts
 * @description Stage 4.3: 3D Audio and physical occlusion on the Stage.
 * Maps audio sources (PannerNodes) to Stage spatial coordinates. Applies Head-Related 
 * Transfer Functions (HRTF) for binaural audio and dynamic low-pass filters for wall occlusion.
 */

export interface AudioContextNodes {
  source: any;
  panner: any;
  occlusionFilter: any;
  gain: any;
}

export class SpatialAudioGraph {
  private audioContext: any = null;
  private soundSources: Map<string, AudioContextNodes> = new Map();
  private masterGain: any = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initContext();
  }

  private initContext() {
    if (typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.isInitialized = true;
        console.log('[Spatial Audio] AudioContext initialized. State:', this.audioContext.state);
      }
    } catch (e) {
      console.warn('[Spatial Audio] Web Audio API initialization deferred/unsupported:', e);
    }
  }

  /**
   * Updates listener position (the active operative or camera focus on the Stage).
   */
  public updateListenerPosition(x: number, y: number, z: number = 0) {
    if (!this.audioContext) return;
    const listener = this.audioContext.listener;
    
    if (listener.positionX) {
      listener.positionX.setTargetAtTime(x, this.audioContext.currentTime, 0.1);
      listener.positionY.setTargetAtTime(y, this.audioContext.currentTime, 0.1);
      listener.positionZ.setTargetAtTime(z, this.audioContext.currentTime, 0.1);
    } else if (listener.setPosition) {
      listener.setPosition(x, y, z);
    }

    if (listener.forwardX) {
      listener.forwardX.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
      listener.forwardY.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
      listener.forwardZ.setTargetAtTime(-1, this.audioContext.currentTime, 0.1);
      listener.upX.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
      listener.upY.setTargetAtTime(-1, this.audioContext.currentTime, 0.1);
      listener.upZ.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
    } else if (listener.setOrientation) {
      listener.setOrientation(0, 0, -1, 0, -1, 0);
    }
  }

  /**
   * Creates a spatial sound source on the Stage grid.
   */
  public createSpatialSound(id: string, buffer: any, loop: boolean = true) {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;

    // 1. 3D Panner Node: Configured for HRTF (Binaural) rendering
    const panner = this.audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 100;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1.5;

    // 2. Biquad Filter Node: Muffles sound when line-of-sight is broken behind a bulkhead
    const occlusionFilter = this.audioContext.createBiquadFilter();
    occlusionFilter.type = 'lowpass';
    occlusionFilter.frequency.value = 20000;

    // 3. Gain Node: Volume control
    const gain = this.audioContext.createGain();

    source.connect(panner);
    panner.connect(occlusionFilter);
    occlusionFilter.connect(gain);
    gain.connect(this.masterGain);

    this.soundSources.set(id, { source, panner, occlusionFilter, gain });
    
    if (this.audioContext.state === 'running') {
      source.start(0);
    }
  }

  /**
   * Updates sound source coordinates.
   */
  public updateSoundPosition(id: string, x: number, y: number, z: number = 0) {
    const nodes = this.soundSources.get(id);
    if (!nodes || !this.audioContext) return;

    if (nodes.panner.positionX) {
      nodes.panner.positionX.setTargetAtTime(x, this.audioContext.currentTime, 0.1);
      nodes.panner.positionY.setTargetAtTime(y, this.audioContext.currentTime, 0.1);
      nodes.panner.positionZ.setTargetAtTime(z, this.audioContext.currentTime, 0.1);
    } else if (nodes.panner.setPosition) {
      nodes.panner.setPosition(x, y, z);
    }
  }

  /**
   * Dynamically adjusts low-pass filter frequency based on BVH wall intersections.
   */
  public applyOcclusion(id: string, isOccluded: boolean, wallThickness: number = 1.0) {
    const nodes = this.soundSources.get(id);
    if (!nodes || !this.audioContext) return;

    const targetFrequency = isOccluded ? Math.max(300, 2000 - (wallThickness * 500)) : 20000;
    nodes.occlusionFilter.frequency.setTargetAtTime(targetFrequency, this.audioContext.currentTime, 0.2);
  }

  public async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[Spatial Audio] Context resumed by user interaction.');
    }
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }
}
