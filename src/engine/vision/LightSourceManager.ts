/**
 * @file LightSourceManager.ts
 * @description Manages dynamic 2D point lights, directional cone spotlights,
 * ambient illumination levels, and atmospheric weather post-processing filters.
 */

export type LightAnimationType = 'none' | 'pulse' | 'flicker' | 'strobe' | 'emergency';

export interface SceneLightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  falloff: 'linear' | 'smooth' | 'hard';
  animation: LightAnimationType;
  animationSpeed?: number;
  castShadows: boolean;
  label?: string;
}

export type AtmosphericWeatherType = 
  | 'clear'
  | 'red_alert'
  | 'toxic_smog'
  | 'deep_void'
  | 'sandstorm'
  | 'cyber_matrix';

export interface AtmosphericPreset {
  id: AtmosphericWeatherType;
  label: string;
  ambientColor: string;
  ambientIntensity: number;
  tintHex: number;
  tintAlpha: number;
  fogDensity: number;
  description: string;
}

export const ATMOSPHERIC_PRESETS: Record<AtmosphericWeatherType, AtmosphericPreset> = {
  clear: {
    id: 'clear',
    label: 'Standard Lighting',
    ambientColor: '#ffffff',
    ambientIntensity: 0.85,
    tintHex: 0x000000,
    tintAlpha: 0.0,
    fogDensity: 0.0,
    description: 'Clean facility interior with nominal tactical illumination.'
  },
  red_alert: {
    id: 'red_alert',
    label: 'Red Alert Protocol',
    ambientColor: '#ef4444',
    ambientIntensity: 0.65,
    tintHex: 0xdc2626,
    tintAlpha: 0.22,
    fogDensity: 0.15,
    description: 'Flashing hazard strobes and crimson tactical emergency gloom.'
  },
  toxic_smog: {
    id: 'toxic_smog',
    label: 'Toxic Smog Inversion',
    ambientColor: '#84cc16',
    ambientIntensity: 0.55,
    tintHex: 0x4d7c0f,
    tintAlpha: 0.28,
    fogDensity: 0.45,
    description: 'Corrosive chemical fog diffusing visibility and sensor ranges.'
  },
  deep_void: {
    id: 'deep_void',
    label: 'Deep Void Gloom',
    ambientColor: '#1e1b4b',
    ambientIntensity: 0.35,
    tintHex: 0x0f172a,
    tintAlpha: 0.45,
    fogDensity: 0.3,
    description: 'Pitch black stealth zone; operative flashlights provide primary vision.'
  },
  sandstorm: {
    id: 'sandstorm',
    label: 'Martian Sandstorm',
    ambientColor: '#ea580c',
    ambientIntensity: 0.6,
    tintHex: 0xc2410c,
    tintAlpha: 0.32,
    fogDensity: 0.5,
    description: 'High-density abrasive dust particulates scattering light rays.'
  },
  cyber_matrix: {
    id: 'cyber_matrix',
    label: 'Cyber Matrix Grid',
    ambientColor: '#06b6d4',
    ambientIntensity: 0.75,
    tintHex: 0x0891b2,
    tintAlpha: 0.18,
    fogDensity: 0.1,
    description: 'Omnicortex augmented-reality simulation grid overlay.'
  }
};

export const LIGHT_PRESETS: Omit<SceneLightSource, 'id' | 'x' | 'y'>[] = [
  {
    radius: 180,
    color: '#f59e0b',
    intensity: 1.0,
    falloff: 'smooth',
    animation: 'flicker',
    animationSpeed: 1.2,
    castShadows: true,
    label: 'Torch / Flare'
  },
  {
    radius: 220,
    color: '#38bdf8',
    intensity: 0.9,
    falloff: 'smooth',
    animation: 'pulse',
    animationSpeed: 0.8,
    castShadows: true,
    label: 'Computer Terminal Glow'
  },
  {
    radius: 260,
    color: '#ef4444',
    intensity: 1.2,
    falloff: 'hard',
    animation: 'strobe',
    animationSpeed: 2.0,
    castShadows: true,
    label: 'Emergency Strobe Beacon'
  },
  {
    radius: 320,
    color: '#ffffff',
    intensity: 1.0,
    falloff: 'linear',
    animation: 'none',
    animationSpeed: 1.0,
    castShadows: true,
    label: 'High-Bay Floodlight'
  },
  {
    radius: 150,
    color: '#10b981',
    intensity: 0.8,
    falloff: 'smooth',
    animation: 'pulse',
    animationSpeed: 0.5,
    castShadows: false,
    label: 'Bio-luminescent Pod'
  }
];

export class LightSourceManager {
  private lights: Map<string, SceneLightSource> = new Map();
  private atmosphere: AtmosphericWeatherType = 'clear';

  constructor(initialLights: SceneLightSource[] = []) {
    initialLights.forEach(l => this.lights.set(l.id, l));
  }

  public addLight(light: SceneLightSource): void {
    this.lights.set(light.id, light);
  }

  public removeLight(id: string): boolean {
    return this.lights.delete(id);
  }

  public getLight(id: string): SceneLightSource | undefined {
    return this.lights.get(id);
  }

  public getAllLights(): SceneLightSource[] {
    return Array.from(this.lights.values());
  }

  public updateLight(id: string, updates: Partial<SceneLightSource>): void {
    const existing = this.lights.get(id);
    if (existing) {
      this.lights.set(id, { ...existing, ...updates });
    }
  }

  public setAtmosphere(atmosphere: AtmosphericWeatherType): void {
    this.atmosphere = atmosphere;
  }

  public getAtmosphere(): AtmosphericWeatherType {
    return this.atmosphere;
  }

  public getAtmosphericPreset(): AtmosphericPreset {
    return ATMOSPHERIC_PRESETS[this.atmosphere] || ATMOSPHERIC_PRESETS.clear;
  }

  /**
   * Calculates dynamic light animation modulation multiplier based on elapsed time
   */
  public getAnimatedIntensity(light: SceneLightSource, timeSec: number): number {
    const speed = light.animationSpeed || 1.0;
    switch (light.animation) {
      case 'pulse': {
        const sinVal = Math.sin(timeSec * Math.PI * 2 * speed);
        return light.intensity * (0.8 + 0.2 * sinVal);
      }
      case 'flicker': {
        const noise = (Math.sin(timeSec * 23.1 * speed) + Math.cos(timeSec * 41.7 * speed)) * 0.5;
        return light.intensity * (0.85 + 0.15 * noise);
      }
      case 'strobe': {
        const isBright = Math.floor(timeSec * speed * 4) % 2 === 0;
        return isBright ? light.intensity * 1.3 : light.intensity * 0.2;
      }
      case 'emergency': {
        const val = Math.abs(Math.sin(timeSec * Math.PI * speed));
        return light.intensity * (0.3 + 0.7 * val);
      }
      case 'none':
      default:
        return light.intensity;
    }
  }
}
