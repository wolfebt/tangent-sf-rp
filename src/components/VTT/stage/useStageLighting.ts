/**
 * @file useStageLighting.ts
 * @description Hook managing Stage dynamic lighting, atmospheric weather presets,
 * particle hazard synchronizer, and Pixi light source overlays.
 */

import { useState, useEffect } from 'react';
import { Graphics, Container } from 'pixi.js';
import { 
  type SceneLightSource,
  type AtmosphericWeatherType, 
  ATMOSPHERIC_PRESETS 
} from '../../../engine/vision/LightSourceManager';
import { HazardParticleSimulator, type HazardField } from '../../../engine/physics/HazardParticleSimulator.ts';
import { VttEventBus } from '../../../utils/vttEventBus';
import { AudioService } from '../../../services/audioService';

export interface UseStageLightingProps {
  currentMap: any;
  isCanvasReady: boolean;
  atmosphereOverlayRef: React.MutableRefObject<Container | null>;
  lightingContainerRef: React.MutableRefObject<Container | null>;
  hazardSimulatorRef: React.MutableRefObject<HazardParticleSimulator | null>;
  isDynamicLightingEnabled: boolean;
  toggleDynamicLighting: () => void;
  updateMap?: (mapId: string, updates: any) => void;
}

export function useStageLighting({
  currentMap,
  isCanvasReady,
  atmosphereOverlayRef,
  lightingContainerRef,
  hazardSimulatorRef,
  isDynamicLightingEnabled,
  toggleDynamicLighting,
  updateMap
}: UseStageLightingProps) {
  const [atmosphericWeather, setAtmosphericWeather] = useState<AtmosphericWeatherType>('clear');
  const [localLights, setLocalLights] = useState<SceneLightSource[]>([]);
  const [hazardCount, setHazardCount] = useState<number>(0);

  // Synchronize local lights with currentMap lights
  useEffect(() => {
    if (currentMap?.lights && Array.isArray(currentMap.lights)) {
      setLocalLights(currentMap.lights);
    }
  }, [currentMap?.id, currentMap?.lights]);

  // Render placed Light Sources onto lighting layer
  useEffect(() => {
    if (!isCanvasReady) return;
    const container = lightingContainerRef.current;
    if (!container) return;
    container.removeChildren();

    localLights.forEach(light => {
      const lightNode = new Container();
      lightNode.x = light.x;
      lightNode.y = light.y;

      const colorHex = typeof light.color === 'string' 
        ? parseInt(light.color.replace('#', '0x'), 16) || 0xf59e0b 
        : light.color;

      const g = new Graphics();
      // Outer subtle falloff halo
      g.circle(0, 0, light.radius);
      g.fill({ color: colorHex, alpha: 0.12 });
      g.stroke({ width: 1, color: colorHex, alpha: 0.25 });

      // Mid intensity circle
      g.circle(0, 0, light.radius * 0.5);
      g.fill({ color: colorHex, alpha: 0.2 });

      // Central core bulb
      g.circle(0, 0, 8);
      g.fill({ color: 0xffffff });
      g.stroke({ width: 2, color: colorHex });

      lightNode.addChild(g);
      container.addChild(lightNode);
    });
  }, [isCanvasReady, localLights, lightingContainerRef]);

  // Render Atmospheric Weather Tint Overlay
  useEffect(() => {
    if (!isCanvasReady) return;
    const container = atmosphereOverlayRef.current;
    if (!container) return;
    container.removeChildren();

    const preset = ATMOSPHERIC_PRESETS[atmosphericWeather] || ATMOSPHERIC_PRESETS.clear;
    if (preset.tintAlpha <= 0 && preset.fogDensity <= 0) return;

    const g = new Graphics();
    const width = 3840;
    const height = 2160;
    g.rect(0, 0, width, height);
    g.fill({ color: preset.tintHex, alpha: preset.tintAlpha });

    container.addChild(g);
  }, [isCanvasReady, atmosphericWeather, atmosphereOverlayRef]);

  // Synchronize environmental atmospheric weather preset from currentMap
  useEffect(() => {
    const mapPreset = currentMap?.environmental?.weatherPreset || currentMap?.atmosphericWeather;
    if (mapPreset && mapPreset !== atmosphericWeather && ATMOSPHERIC_PRESETS[mapPreset as AtmosphericWeatherType]) {
      setAtmosphericWeather(mapPreset as AtmosphericWeatherType);
    }
  }, [currentMap?.environmental?.weatherPreset, currentMap?.atmosphericWeather, atmosphericWeather]);

  // Event bus subscription for atmospheric preset
  useEffect(() => {
    const unsubPreset = VttEventBus.on('apply-atmospheric-preset', (payload) => {
      if (payload?.presetKey && ATMOSPHERIC_PRESETS[payload.presetKey as AtmosphericWeatherType]) {
        setAtmosphericWeather(payload.presetKey as AtmosphericWeatherType);
      }
    });

    const unsubHazard = VttEventBus.on('spawn-environmental-hazard', (payload) => {
      if (!hazardSimulatorRef.current || !payload?.type) return;
      const newHazard: HazardField = {
        id: `hazard-${Date.now()}`,
        type: payload.type,
        x: payload.x ?? 400,
        y: payload.y ?? 350,
        radius: payload.radius ?? 120,
        intensity: 1.0
      };
      hazardSimulatorRef.current.addHazardField(newHazard);
      setHazardCount(prev => prev + 1);
      AudioService.playCriticalChime(false);
    });

    const unsubClearHazards = VttEventBus.on('clear-environmental-hazards', () => {
      hazardSimulatorRef.current?.clearHazards();
      setHazardCount(0);
    });

    return () => {
      unsubPreset();
      unsubHazard();
      unsubClearHazards();
    };
  }, [hazardSimulatorRef]);

  // Synchronize dynamic particle hazard physics with weather
  useEffect(() => {
    if (!hazardSimulatorRef.current) return;
    const sim = hazardSimulatorRef.current;
    sim.clearHazards();

    if (atmosphericWeather === 'toxic_smog') {
      sim.addHazardField({ id: 'ambient-toxic-1', type: 'corrosive_gas', x: 450, y: 350, radius: 180, intensity: 0.8 });
      sim.addHazardField({ id: 'ambient-toxic-2', type: 'corrosive_gas', x: 850, y: 650, radius: 200, intensity: 0.9 });
    } else if (atmosphericWeather === 'red_alert') {
      sim.addHazardField({ id: 'ambient-plasma-1', type: 'plasma_fire', x: 600, y: 400, radius: 120, intensity: 1.0 });
    } else if (atmosphericWeather === 'deep_void') {
      sim.addHazardField({ id: 'ambient-void-1', type: 'void_mist', x: 500, y: 400, radius: 240, intensity: 0.7 });
    } else if (atmosphericWeather === 'sandstorm') {
      sim.addHazardField({ id: 'ambient-sand-1', type: 'smoke', x: 600, y: 450, radius: 260, intensity: 0.85 });
    }
    setHazardCount(sim.getActiveHazards().length);
  }, [atmosphericWeather, hazardSimulatorRef]);

  // Dynamic Lighting toggle handler
  const handleToggleDynamicLighting = () => {
    toggleDynamicLighting();
    AudioService.playTerminalBeep(!isDynamicLightingEnabled ? 1200 : 800, 0.03);
  };

  useEffect(() => {
    hazardSimulatorRef.current?.setDynamicLighting(isDynamicLightingEnabled);
  }, [isDynamicLightingEnabled, hazardSimulatorRef]);

  useEffect(() => {
    if (currentMap?.id && updateMap && currentMap?.atmosphericWeather !== atmosphericWeather) {
      updateMap(currentMap.id, { atmosphericWeather });
    }
  }, [atmosphericWeather, currentMap?.id, currentMap?.atmosphericWeather, updateMap]);

  return {
    atmosphericWeather,
    setAtmosphericWeather,
    localLights,
    setLocalLights,
    hazardCount,
    setHazardCount,
    handleToggleDynamicLighting
  };
}
