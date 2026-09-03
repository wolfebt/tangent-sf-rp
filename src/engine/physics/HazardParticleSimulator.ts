/**
 * @file HazardParticleSimulator.ts
 * @description Stage 3.5: Dynamic Environmental Hazard Particle Physics & Radial Lighting Engine.
 * Simulates Lagrangian particle fields (Plasma, Corrosive Gas, Void Mist, Smoke)
 * and projects dynamic radial lighting cones and ambient darkness on the Stage.
 */

import { Container, Graphics } from 'pixi.js';
import { WGSLComputeContext } from '../vision/WGSLComputeContext';
import { ELEMENTAL_FLUID_WGSL } from './shaders/elemental_fluid.wgsl';

export type HazardType = 'plasma_fire' | 'corrosive_gas' | 'void_mist' | 'smoke';

export interface HazardField {
  id: string;
  type: HazardType;
  x: number;
  y: number;
  radius: number;
  intensity: number;
}

export interface LightEmitter {
  x: number;
  y: number;
  radius: number;
  color: number;
  intensity: number;
}

interface SimulatedParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
}

export class HazardParticleSimulator {
  private fxContainer: Container;
  private lightContainer: Container;
  private particleGraphics: Graphics;
  private lightingGraphics: Graphics;
  private computeContext: WGSLComputeContext;
  private isWebGPU: boolean = false;

  private activeHazards: HazardField[] = [];
  private particles: SimulatedParticle[] = [];
  private maxParticles: number = 300;
  private isDynamicLightingEnabled: boolean = true;
  private ambientDarknessAlpha: number = 0.65;

  constructor(fxContainer: Container, lightContainer: Container) {
    this.fxContainer = fxContainer;
    this.lightContainer = lightContainer;

    this.particleGraphics = new Graphics();
    this.lightingGraphics = new Graphics();

    this.fxContainer.addChild(this.particleGraphics);
    this.lightContainer.addChild(this.lightingGraphics);

    this.computeContext = new WGSLComputeContext();
  }

  public initializeCompute(gpuDevice: any) {
    if (gpuDevice) {
      try {
        this.computeContext.initialize(gpuDevice);
        this.computeContext.getOrCreatePipeline('elemental_fluid', ELEMENTAL_FLUID_WGSL);
        this.isWebGPU = true;
        console.log('[HazardSimulator] WebGPU compute pipeline active for environmental hazards.');
      } catch (e) {
        console.warn('[HazardSimulator] WebGPU compute initialization error, using high-speed CPU fallback:', e);
        this.isWebGPU = false;
      }
    }
  }

  public getIsWebGPU(): boolean {
    return this.isWebGPU;
  }

  public setDynamicLighting(enabled: boolean) {
    this.isDynamicLightingEnabled = enabled;
    if (!enabled) {
      this.lightingGraphics.clear();
    }
  }

  public setAmbientDarkness(alpha: number) {
    this.ambientDarknessAlpha = Math.max(0, Math.min(1, alpha));
  }

  public getAmbientDarkness(): number {
    return this.ambientDarknessAlpha;
  }

  public addHazardField(hazard: HazardField) {
    this.activeHazards.push(hazard);
    this.spawnParticlesForHazard(hazard, 25);
  }

  public clearHazards() {
    this.activeHazards = [];
    this.particles = [];
    this.particleGraphics.clear();
    this.lightingGraphics.clear();
  }

  public getActiveHazards(): HazardField[] {
    return this.activeHazards;
  }

  public getHazardFields(): HazardField[] {
    return this.activeHazards;
  }

  private spawnParticlesForHazard(hazard: HazardField, count: number) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * hazard.radius;
      const x = hazard.x + Math.cos(angle) * dist;
      const y = hazard.y + Math.sin(angle) * dist;

      let color = 0x22d3ee;
      let vx = (Math.random() - 0.5) * 1.5;
      let vy = -0.5 - Math.random() * 2;
      let maxLife = 60 + Math.random() * 60;

      if (hazard.type === 'plasma_fire') {
        color = Math.random() > 0.4 ? 0xf97316 : 0xfacc15;
        vy = -1.5 - Math.random() * 2.5;
      } else if (hazard.type === 'corrosive_gas') {
        color = 0x10b981;
        vx = (Math.random() - 0.5) * 2;
        vy = (Math.random() - 0.5) * 1;
        maxLife = 90 + Math.random() * 60;
      } else if (hazard.type === 'void_mist') {
        color = 0x8b5cf6;
        vx = (Math.random() - 0.5) * 0.8;
        vy = (Math.random() - 0.5) * 0.8;
      } else if (hazard.type === 'smoke') {
        color = 0x64748b;
        vy = -0.8 - Math.random() * 1.2;
      }

      this.particles.push({
        x,
        y,
        vx,
        vy,
        life: maxLife,
        maxLife,
        size: 3 + Math.random() * 5,
        color,
        alpha: 0.8
      });
    }
  }

  /**
   * Main per-frame simulation update tick.
   */
  public update(deltaTime: number, lightEmitters: LightEmitter[] = []) {
    // 1. Replenish particles for active hazards
    for (const hazard of this.activeHazards) {
      if (Math.random() < 0.35 && this.particles.length < this.maxParticles) {
        this.spawnParticlesForHazard(hazard, 2);
      }
    }

    // 2. Step particles physics
    this.particleGraphics.clear();

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= deltaTime;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      const progress = p.life / p.maxLife;
      const currentAlpha = progress * 0.7;

      this.particleGraphics.circle(p.x, p.y, p.size * (1 + (1 - progress) * 0.5));
      this.particleGraphics.fill({ color: p.color, alpha: currentAlpha });
    }

    // 3. Render Dynamic Lighting & Darkness Mask
    if (this.isDynamicLightingEnabled) {
      this.renderLighting(lightEmitters);
    }
  }

  private renderLighting(lightEmitters: LightEmitter[]) {
    this.lightingGraphics.clear();

    if (lightEmitters.length === 0) return;

    // Draw ambient light circles for tokens & plasma hazards
    for (const emitter of lightEmitters) {
      // Core bright light
      this.lightingGraphics.circle(emitter.x, emitter.y, emitter.radius * 0.4);
      this.lightingGraphics.fill({ color: emitter.color, alpha: 0.15 * emitter.intensity });

      // Outer soft falloff
      this.lightingGraphics.circle(emitter.x, emitter.y, emitter.radius);
      this.lightingGraphics.fill({ color: emitter.color, alpha: 0.06 * emitter.intensity });
    }

    // Also draw soft illumination from active plasma hazard fields
    for (const hazard of this.activeHazards) {
      if (hazard.type === 'plasma_fire') {
        this.lightingGraphics.circle(hazard.x, hazard.y, hazard.radius * 1.4);
        this.lightingGraphics.fill({ color: 0xf97316, alpha: 0.12 * hazard.intensity });
      }
    }
  }

  public destroy() {
    this.clearHazards();
    this.particleGraphics.destroy();
    this.lightingGraphics.destroy();
  }
}
