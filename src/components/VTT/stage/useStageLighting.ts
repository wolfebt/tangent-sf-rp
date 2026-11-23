/**
 * @file useStageLighting.ts
 * @description Hook managing Stage dynamic lighting, atmospheric weather presets,
 * particle hazard synchronizer, and Pixi light source overlays.
 */

import { useState, useEffect, useRef } from 'react';
import { Graphics, Container } from 'pixi.js';
import { 
  type SceneLightSource,
  type AtmosphericWeatherType, 
  isKnownAtmosphericPreset,
  normalizeAtmosphericPresetKey,
  resolveAtmosphericPreset
} from '../../../engine/vision/LightSourceManager';
import { clearPixiContainer } from '../utils/pixiCleanup';
import { HazardParticleSimulator, type HazardField } from '../../../engine/physics/HazardParticleSimulator.ts';
import { VttEventBus } from '../../../utils/vttEventBus';
import { AudioService } from '../../../services/audioService';

export interface UseStageLightingProps {
  currentMap: any;
  isCanvasReady: boolean;
  canvasGeneration?: number;
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
  canvasGeneration = isCanvasReady ? 1 : 0,
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

  const currentMapRef = useRef(currentMap);
  const updateMapRef = useRef(updateMap);
  currentMapRef.current = currentMap;
  updateMapRef.current = updateMap;

  // Synchronize local lights with currentMap lights
  useEffect(() => {
    if (currentMap?.lights && Array.isArray(currentMap.lights)) {
      setLocalLights(currentMap.lights);
    } else {
      setLocalLights([]);
    }
  }, [currentMap?.id, currentMap?.lights]);

  // Render placed Light Sources onto lighting layer
  useEffect(() => {
    if (!isCanvasReady) return;
    const container = lightingContainerRef.current;
    if (!container) return;
    clearPixiContainer(container);

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
  }, [isCanvasReady, canvasGeneration, localLights, lightingContainerRef]);

  // Render Atmospheric Weather Tint Overlay
  useEffect(() => {
    if (!isCanvasReady) return;
    const container = atmosphereOverlayRef.current;
    if (!container) return;
    clearPixiContainer(container);

    const preset = resolveAtmosphericPreset(atmosphericWeather);
    if (preset.tintAlpha <= 0 && preset.fogDensity <= 0) return;

    const g = new Graphics();
    const width = 3840;
    const height = 2160;
    g.rect(0, 0, width, height);
    g.fill({ color: preset.tintHex, alpha: preset.tintAlpha });

    container.addChild(g);
  }, [isCanvasReady, canvasGeneration, atmosphericWeather, atmosphereOverlayRef]);

  // Synchronize environmental atmospheric weather preset from currentMap
  useEffect(() => {
    const mapPreset =
      currentMap?.atmosphericPresetId ||
      currentMap?.weather?.presetId ||
      currentMap?.environmental?.weatherPreset ||
      currentMap?.atmosphericWeather ||
      currentMap?.lightingMode;
    if (mapPreset && isKnownAtmosphericPreset(mapPreset)) {
      setAtmosphericWeather(normalizeAtmosphericPresetKey(mapPreset));
    } else {
      setAtmosphericWeather('clear');
    }
  }, [
    currentMap?.id,
    currentMap?.atmosphericPresetId,
    currentMap?.weather?.presetId,
    currentMap?.environmental?.weatherPreset,
    currentMap?.atmosphericWeather,
    currentMap?.lightingMode
  ]);

  // Event bus subscription for atmospheric preset & quick lighting mode
  useEffect(() => {
    const applyPresetOrMode = (rawKey?: string) => {
      if (!rawKey || !isKnownAtmosphericPreset(rawKey)) return;
      const normalized = normalizeAtmosphericPresetKey(rawKey);
      setAtmosphericWeather(normalized);
      if (currentMapRef.current?.id && updateMapRef.current) {
        updateMapRef.current(currentMapRef.current.id, { atmosphericWeather: normalized });
      }
    };

    const unsubPreset = VttEventBus.on('apply-atmospheric-preset', (payload) => {
      applyPresetOrMode(payload?.presetKey);
    });

    const unsubLightMode = VttEventBus.on('change-lighting-mode', (payload) => {
      applyPresetOrMode(payload?.mode);
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
      unsubLightMode();
      unsubHazard();
      unsubClearHazards();
    };
  }, [hazardSimulatorRef]);

  // Synchronize dynamic particle hazard physics & ambient darkness with weather
  useEffect(() => {
    if (!hazardSimulatorRef.current) return;
    const sim = hazardSimulatorRef.current;
    const preset = resolveAtmosphericPreset(atmosphericWeather);
    sim.setAmbientDarkness(Math.max(0, Math.min(0.85, 1 - preset.ambientIntensity)));
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
  }, [isCanvasReady, canvasGeneration, atmosphericWeather, hazardSimulatorRef]);

  // Dynamic Lighting toggle handler
  const handleToggleDynamicLighting = () => {
    toggleDynamicLighting();
    AudioService.playTerminalBeep(!isDynamicLightingEnabled ? 1200 : 800, 0.03);
  };

  useEffect(() => {
    hazardSimulatorRef.current?.setDynamicLighting(isDynamicLightingEnabled);
  }, [isDynamicLightingEnabled, hazardSimulatorRef]);

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
