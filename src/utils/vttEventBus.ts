/**
 * @file vttEventBus.ts
 * @description Strongly-typed Event Bus for VTT & ADE UI events, modals, and inter-panel signals.
 */

export interface VttEventMap {
  'open-landmass-modal': void;
  'open-pcg-modal': void;
  'open-asset-studio': void;
  'open-asset-ingestion': void;
  'open-sprite-cutter': void;
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
  'apply-atmospheric-preset': { presetKey: string; tint?: string; fogDensity?: number };
  'change-lighting-mode': { mode: string };
  'toggle-stage-aime': void;
  'toggle-stage-audio-mixer': { open?: boolean } | void;
  'toggle-stage-handout-push': { open?: boolean } | void;
  'request-tactical-ping': { type?: string };
  'toggle-stage-fog': { enabled: boolean };
  'token-defeated': { token?: any; entityId?: string; name?: string; type?: string; status?: string; excessDamage?: number; killer?: string; [key: string]: any };
  'stage-bulkhead-toggled': { bulkheadId?: string; objectId?: string; isOpen?: boolean; operativeId?: string; storyElementId?: string; [key: string]: any };
  'stage-hazard-toggled': { hazardId?: string; objectId?: string; isActive?: boolean; hazardType?: string; [key: string]: any };
  'omnicortex-loot-dispensed': { omnicortexGearId?: string; operativeId?: string; containerId?: string; objectId?: string; itemName?: string; [key: string]: any };
  'story-foundry-node-triggered': { action?: string; nodeId?: string; objectId?: string; storyElementId?: string; operativeId?: string; [key: string]: any };
  'mechanical-mandate-executed': { mandate: any };
  'ai-action-requested': { request: any };
  'ai-action-adjudicated': { request: any; mandate: any; appliedDelta?: any; error?: string };
  'stage-ai-decision': { tokenId: string; decision: Record<string, any> };
  'vtt-spawn-entity': { name: string; hp?: number; armorDr?: number; isPersona?: boolean; storyElementId?: string; [key: string]: any };
  'chat-message': { sender: string; text: string; type?: string; timestamp?: string; [key: string]: any };
  'stage-remote-door-toggled': { wallId: string; isOpen: boolean; doorState?: string; breachHp?: number; timestamp?: number };
  'stage-remote-turn-update': { roundNumber: number; currentTurnIndex: number; initiativeScores?: Record<string, number>; timestamp?: number };
  'stage-remote-ping': { id?: string; x: number; y: number; type?: string; color?: string; label?: string; author?: string; timestamp: number; [key: string]: any };
  'stage-remote-handout': { id: string; title: string; imageUrl?: string; text?: string; sender?: string; targetOperativeIds?: string[]; timestamp: number };
  'stage-remote-audio-cue': { bus: 'music' | 'ambient' | 'sfx'; action: 'play' | 'stop' | 'volume' | 'crossfade'; trackId?: string; trackUrl?: string; title?: string; volume?: number; timestamp?: number };
  'stage-remote-fog-explored': { mapId: string; exploredAreas: any[]; hiddenAreas?: any[]; fogEnabled?: boolean; timestamp?: number };
  'stage-chat-card': {
    id: string;
    timestamp: string;
    sender: string;
    senderRole?: string;
    senderId?: string;
    recipientIds?: string[];
    visibility: 'public' | 'whisper_gm' | 'blind_gm';
    kind: 'attack' | 'aoe' | 'dice' | 'effect' | 'handout' | 'narration' | 'system';
    title: string;
    body: string;
    diceBreakdown?: { d1: number; d2: number; modifier?: number; total: number; dcOrCr?: number; outcome?: string; crit?: boolean; fumble?: boolean };
    damagePayload?: { targetTokenId?: string; targetLabel?: string; rawDamage: number; netDamage?: number; damageType?: string; isLethal?: boolean; saveType?: string; saveCr?: number; damageApplied?: boolean };
    handoutPayload?: { id: string; title: string; imageUrl?: string; text?: string };
    remote?: boolean;
  };
  'stage-aoe-resolved': { presetId: string; label: string; affectedCount: number; results: any[]; origin?: { x: number; y: number } };
  'stage-sensor-mode-changed': { mode: 'standard_optical' | 'night_vision' | 'thermal_infrared' | 'cyber_motion_radar' | 'meta_attunement'; tokenId?: string | null };
  'stage-region-triggered': { regionId: string; regionName: string; triggerType: string; tokenId: string; payload?: any };
  'stage-theater-mode-changed': { mode: '2d' | '3d' | 'theater' };
  'arm-stage-chunk': {
    chunk: any;
    rotationDeg: number;
    flipX: boolean;
    flipY: boolean;
    settings?: any;
    slotOverrides?: any;
  };
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
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
    const detail = args[0] !== undefined ? args[0] : undefined;
    window.dispatchEvent(new CustomEvent(event, { detail }));
  },

  on<K extends keyof VttEventMap>(
    event: K,
    handler: VttEventCallback<K>
  ): () => void {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
      return () => {};
    }
    const wrapped = (e: Event) => {
      const ce = e as CustomEvent;
      (handler as any)(ce.detail);
    };
    window.addEventListener(event, wrapped);
    return () => window.removeEventListener(event, wrapped);
  },
};
