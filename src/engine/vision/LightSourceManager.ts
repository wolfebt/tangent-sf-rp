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
  | 'amber_alert'
  | 'toxic_smog'
  | 'deep_void'
  | 'sandstorm'
  | 'cyber_matrix'
  | 'geothermal_inferno'
  | 'ion_storm'
  | 'dim'
  | 'night_vision'
  | 'infra_red';

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
  amber_alert: {
    id: 'amber_alert',
    label: 'Reactor Amber Alert',
    ambientColor: '#d97706',
    ambientIntensity: 0.6,
    tintHex: 0xd97706,
    tintAlpha: 0.24,
    fogDensity: 0.35,
    description: 'Emergency containment breach, strobing amber beacons, coolant steam venting.'
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
    description: 'Pitch black stealth zone; operator flashlights provide primary vision.'
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
  },
  geothermal_inferno: {
    id: 'geothermal_inferno',
    label: 'Geothermal Sub-Vent',
    ambientColor: '#e11d48',
    ambientIntensity: 0.62,
    tintHex: 0xe11d48,
    tintAlpha: 0.26,
    fogDensity: 0.4,
    description: 'Superheated magma trenches, seismic tremors, and thermal distortion plumes.'
  },
  ion_storm: {
    id: 'ion_storm',
    label: 'Solar Flare / Ion Storm',
    ambientColor: '#f59e0b',
    ambientIntensity: 0.68,
    tintHex: 0xf59e0b,
    tintAlpha: 0.2,
    fogDensity: 0.2,
    description: 'Intense coronal mass ejection triggering sensor interference and auroral static.'
  },
  dim: {
    id: 'dim',
    label: 'Dim / Twilight',
    ambientColor: '#64748b',
    ambientIntensity: 0.45,
    tintHex: 0x0f172a,
    tintAlpha: 0.28,
    fogDensity: 0.1,
    description: 'Low-light tactical twilight requiring active light sources or low-light optics.'
  },
  night_vision: {
    id: 'night_vision',
    label: 'Night Vision NVG',
    ambientColor: '#10b981',
    ambientIntensity: 0.75,
    tintHex: 0x10b981,
    tintAlpha: 0.24,
    fogDensity: 0.05,
    description: 'Image-intensifier emerald optical spectrum highlighting dark corridors.'
  },
  infra_red: {
    id: 'infra_red',
    label: 'Thermal Infrared',
    ambientColor: '#a855f7',
    ambientIntensity: 0.55,
    tintHex: 0x4c1d95,
    tintAlpha: 0.30,
    fogDensity: 0.15,
    description: 'Long-wave thermal signature scan across darkened tactical sectors.'
  }
};

export const ATMOSPHERIC_PRESET_ALIASES: Record<string, AtmosphericWeatherType> = {
  deep_space_vacuum: 'deep_void',
  vacuum_breach: 'deep_void',
  vacuum_decomp: 'deep_void',
  zero_g: 'deep_void',
  pitch_black: 'deep_void',
  space: 'deep_void',
  reactor_amber_alert: 'amber_alert',
  corrosive_acid_rain: 'toxic_smog',
  acid_rain: 'toxic_smog',
  toxic_haze: 'toxic_smog',
  toxic: 'toxic_smog',
  cyberpunk_neon_rain: 'cyber_matrix',
  cyberpunk: 'cyber_matrix',
  neon: 'cyber_matrix',
  solar_flare_radiation: 'ion_storm',
  electrical_storm: 'ion_storm',
  radiation_leak: 'ion_storm',
  smoke_fog: 'sandstorm',
  plasma_surge: 'geothermal_inferno',
  normal: 'clear',
  interior: 'clear'
};

export interface Atmosphere3DLightingConfig {
  ambientColor: number;
  ambientIntensity: number;
  dirColor: number;
  dirIntensity: number;
  fogColor: number;
  fogDensity: number;
}

/**
 * Resolves any atmospheric / lighting key across 2D Stage, EnvironmentTab, RunTab, and 3D Viewport
 * into canonical Three.js ambient & directional lighting values.
 */
export function get3DAtmosphereLighting(presetKey?: string | null): Atmosphere3DLightingConfig {
  const raw = String(presetKey || 'clear').trim().toLowerCase();
  if (raw === 'interior') {
    return {
      ambientColor: 0x334155,
      ambientIntensity: 0.7,
      dirColor: 0xfef08a,
      dirIntensity: 0.9,
      fogColor: 0x1e293b,
      fogDensity: 0.1
    };
  }
  const canonical = normalizeAtmosphericPresetKey(raw);
  switch (canonical) {
    case 'deep_void':
      return {
        ambientColor: 0x0a0f1d,
        ambientIntensity: 0.3,
        dirColor: 0x93c5fd,
        dirIntensity: 1.5,
        fogColor: 0x060913,
        fogDensity: 0.3
      };
    case 'cyber_matrix':
      return {
        ambientColor: 0x1e1b4b,
        ambientIntensity: 0.5,
        dirColor: 0x06b6d4,
        dirIntensity: 1.0,
        fogColor: 0x082f49,
        fogDensity: 0.1
      };
    case 'toxic_smog':
      return {
        ambientColor: 0x14532d,
        ambientIntensity: 0.6,
        dirColor: 0x84cc16,
        dirIntensity: 0.8,
        fogColor: 0x1a2e05,
        fogDensity: 0.45
      };
    default: {
      const preset = resolveAtmosphericPreset(canonical);
      if (canonical === 'clear') {
        return {
          ambientColor: 0x1e293b,
          ambientIntensity: 0.65,
          dirColor: 0xf8fafc,
          dirIntensity: 1.2,
          fogColor: 0x060913,
          fogDensity: 0.0
        };
      }
      const hexNum = parseInt(preset.ambientColor.replace('#', ''), 16) || 0x1e293b;
      return {
        ambientColor: preset.tintHex || hexNum,
        ambientIntensity: preset.ambientIntensity,
        dirColor: hexNum,
        dirIntensity: Math.max(0.5, Math.min(1.4, preset.ambientIntensity + 0.35)),
        fogColor: preset.tintHex || hexNum,
        fogDensity: preset.fogDensity
      };
    }
  }
}

export function isKnownAtmosphericPreset(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const normalized = key.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(ATMOSPHERIC_PRESETS, normalized)
    || Object.prototype.hasOwnProperty.call(ATMOSPHERIC_PRESET_ALIASES, normalized);
}

export function normalizeAtmosphericPresetKey(key?: string | null): AtmosphericWeatherType {
  if (!key || typeof key !== 'string') return 'clear';
  const normalized = key.trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(ATMOSPHERIC_PRESETS, normalized)) {
    return normalized as AtmosphericWeatherType;
  }
  if (Object.prototype.hasOwnProperty.call(ATMOSPHERIC_PRESET_ALIASES, normalized)) {
    return ATMOSPHERIC_PRESET_ALIASES[normalized];
  }
  return 'clear';
}

export function resolveAtmosphericPreset(key?: string | null): AtmosphericPreset {
  return ATMOSPHERIC_PRESETS[normalizeAtmosphericPresetKey(key)];
}

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

  public clearLights(): void {
    this.lights.clear();
  }

  public setLights(lights: SceneLightSource[]): void {
    this.lights.clear();
    lights.forEach(l => this.lights.set(l.id, l));
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
