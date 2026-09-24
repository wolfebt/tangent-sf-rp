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
  'story-foundry-milestone-reached': { scenarioId?: string; scenarioTitle?: string; timestamp?: string; milestoneId?: string };
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
