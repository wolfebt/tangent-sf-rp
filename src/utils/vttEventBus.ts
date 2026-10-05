/**
 * @file vttEventBus.ts
 * @description Strongly-typed Event Bus for VTT & ADE UI events, modals, and inter-panel signals.
 */

export interface VttEventMap {
  'open-landmass-modal': void;
  'open-uvtt-modal': void;
  'open-asset-manager': void;
  'open-hero-drawer': void;
  'open-omnicortex-drawer': void;
  'open-underlay-modal': void;
  'open-layers-panel': void;
  'open-new-map-modal': void;
  'open-module-ingestion-modal': void;
  'open-stage-options': void;
  'load-preset-starship': void;
  'load-preset-outpost': void;
  'export-stage-png': void;
  'open-tactical-play-modal': { token?: any } | void;
  'companion-deploy-toggle': {
    companionId: string;
    companion?: any;
    parentOperativeId?: string;
    parentOperativeName?: string;
    is_deployed?: boolean;
    isDeploying?: boolean;
  };
  'sentry-alert': { detectedHero: any; alertBark: string; facingAngleDeg: number; distance?: number };
  'story-foundry-milestone-reached': { 
    scenarioId?: string; 
    scenarioTitle?: string; 
    timestamp?: string; 
    milestoneId?: string; 
    waypointName?: string; 
    beat?: string;
    beatIndex?: number;
    beatText?: string;
    isCompleted?: boolean;
    completedBeats?: number[];
  };
  'stage-cyberdeck-breach': { targetNode?: any; timestamp?: number; unlockedBulkheadId?: string };
  'pan-stage-to': { x: number; y: number; zoom?: number };
  'story-waypoint-tripped': {
    waypoint: any;
    token?: any;
    scenarioId?: string;
    scenarioTitle?: string;
    action?: 'ADVANCE_SCENARIO' | 'REVEAL_BEAT' | 'TRIGGER_AIME' | 'ALERT_GM';
    targetScenarioId?: string;
    beat?: string;
  };
  'reset-stage-waypoints': void;
  'toggle-stage-design-mode': { active?: boolean };
  'arm-stage-tool': { tool: string };
  'spawn-environmental-hazard': { type: 'plasma_fire' | 'corrosive_gas' | 'void_mist' | 'smoke'; x?: number; y?: number; radius?: number };
  'clear-environmental-hazards': void;
  'apply-atmospheric-preset': { presetKey: string };
  'token-defeated': { token?: any; entityId?: string; name?: string; type?: string; status?: string; excessDamage?: number; killer?: string; [key: string]: any };
  'stage-bulkhead-toggled': { bulkheadId?: string; objectId?: string; isOpen?: boolean; operativeId?: string; storyElementId?: string; [key: string]: any };
  'stage-hazard-toggled': { hazardId?: string; objectId?: string; isActive?: boolean; hazardType?: string; [key: string]: any };
  'omnicortex-loot-dispensed': { omnicortexGearId?: string; operativeId?: string; containerId?: string; objectId?: string; itemName?: string; [key: string]: any };
  'story-foundry-node-triggered': { action?: string; nodeId?: string; objectId?: string; storyElementId?: string; operativeId?: string; [key: string]: any };
  'mechanical-mandate-executed': { mandate: any };
}

type VttEventCallback<K extends keyof VttEventMap> =
  VttEventMap[K] extends void
    ? () => void
    : (payload: VttEventMap[K]) => void;

export const VttEventBus = {
  emit<K extends keyof VttEventMap>(
    event: K,
    ...args: VttEventMap[K] extends void ? [undefined?] : [VttEventMap[K]]
  ): void {
    const detail = args[0] !== undefined ? args[0] : undefined;
    window.dispatchEvent(new CustomEvent(event, { detail }));
  },

  on<K extends keyof VttEventMap>(
    event: K,
    handler: VttEventCallback<K>
  ): () => void {
    const wrapped = (e: Event) => {
      const ce = e as CustomEvent;
      (handler as any)(ce.detail);
    };
    window.addEventListener(event, wrapped);
    return () => window.removeEventListener(event, wrapped);
  },
};
