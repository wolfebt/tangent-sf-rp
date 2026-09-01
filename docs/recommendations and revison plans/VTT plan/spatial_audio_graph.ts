/**
 * @file SpatialAudioGraph.ts
 * @description Stage 4.3: 3D Audio and physical occlusion.
 * Maps audio sources (PannerNodes) to PixiJS spatial coordinates. Applies Head-Related 
 * Transfer Functions (HRTF) for binaural audio and dynamic low-pass filters for wall occlusion.
 */

export class SpatialAudioGraph {
  private audioContext: AudioContext;
  private soundSources: Map<string, AudioContextNodes> = new Map();
  
  // The global volume control for the SFX/Ambient layer
  private masterGain: GainNode;

  constructor() {
    // Initialize standard Web Audio API
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    
    console.log('[Spatial Audio] AudioContext initialized. State:', this.audioContext.state);
  }

  /**
   * Updates the position of the Listener (the active selected token or camera focus).
   * All HRTF panning is relative to this coordinate.
   */
  public updateListenerPosition(x: number, y: number, z: number = 0) {
    const listener = this.audioContext.listener;
    
    // Modern Web Audio API uses AudioParams for automation, with fallback to legacy methods
    if (listener.positionX) {
      listener.positionX.setTargetAtTime(x, this.audioContext.currentTime, 0.1);
      listener.positionY.setTargetAtTime(y, this.audioContext.currentTime, 0.1);
      listener.positionZ.setTargetAtTime(z, this.audioContext.currentTime, 0.1);
    } else {
      listener.setPosition(x, y, z);
    }

    // Assume standard top-down perspective where "up" is negative Y on the screen
    if (listener.forwardX) {
      listener.forwardX.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
      listener.forwardY.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
      listener.forwardZ.setTargetAtTime(-1, this.audioContext.currentTime, 0.1);
      listener.upX.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
      listener.upY.setTargetAtTime(-1, this.audioContext.currentTime, 0.1);
      listener.upZ.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
    } else {
      listener.setOrientation(0, 0, -1, 0, -1, 0);
    }
  }

  /**
   * Registers a new spatial sound source on the tactical grid.
   * Creates a GainNode (Volume), BiquadFilterNode (Occlusion), and PannerNode (3D Space).
   */
  public createSpatialSound(id: string, buffer: AudioBuffer, loop: boolean = true) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;

    // 1. 3D Panner Node: Configured for HRTF (Binaural) rendering
    const panner = this.audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 100; // Radius where volume begins to drop
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1.5;

    // 2. Biquad Filter Node: Used to muffle sound when LoS is broken (e.g., behind a wall)
    const occlusionFilter = this.audioContext.createBiquadFilter();
    occlusionFilter.type = 'lowpass';
    occlusionFilter.frequency.value = 20000; // Wide open by default (no muffling)

    // 3. Gain Node: Individual volume control
    const gain = this.audioContext.createGain();

    // Wire the graph: Source -> Panner -> Filter -> Gain -> Master
    source.connect(panner);
    panner.connect(occlusionFilter);
    occlusionFilter.connect(gain);
    gain.connect(this.masterGain);

    this.soundSources.set(id, { source, panner, occlusionFilter, gain });
    
    // Start playing immediately. Browsers require user interaction before audio works,
    // so this assumes the user has already clicked somewhere on the VTT canvas.
    if (this.audioContext.state === 'running') {
      source.start(0);
    }
  }

  /**
   * Moves the audio source to match the visual PixiJS sprite position.
   */
  public updateSoundPosition(id: string, x: number, y: number, z: number = 0) {
    const nodes = this.soundSources.get(id);
    if (!nodes) return;

    if (nodes.panner.positionX) {
      nodes.panner.positionX.setTargetAtTime(x, this.audioContext.currentTime, 0.1);
      nodes.panner.positionY.setTargetAtTime(y, this.audioContext.currentTime, 0.1);
      nodes.panner.positionZ.setTargetAtTime(z, this.audioContext.currentTime, 0.1);
    } else {
      nodes.panner.setPosition(x, y, z);
    }
  }

  /**
   * Dynamically adjusts the low-pass filter frequency based on BVH wall intersections.
   * Called by the Vision engine when a wall is detected between the listener and the sound.
   */
  public applyOcclusion(id: string, isOccluded: boolean, wallThickness: number = 1.0) {
    const nodes = this.soundSources.get(id);
    if (!nodes) return;

    // If occluded, drop high frequencies (muffled effect). The thicker the wall, the lower the cutoff.
    // If clear, restore to 20,000Hz (full spectrum).
    const targetFrequency = isOccluded ? Math.max(300, 2000 - (wallThickness * 500)) : 20000;
    
    // Ramp the frequency smoothly over 0.2 seconds to prevent audio popping
    nodes.occlusionFilter.frequency.setTargetAtTime(targetFrequency, this.audioContext.currentTime, 0.2);
  }

  /**
   * Resumes the AudioContext. Required by modern browsers to handle autoplay policies.
   */
  public async resumeContext() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[Spatial Audio] Context resumed by user interaction.');
    }
  }
}

interface AudioContextNodes {
  source: AudioBufferSourceNode;
  panner: PannerNode;
  occlusionFilter: BiquadFilterNode;
  gain: GainNode;
}