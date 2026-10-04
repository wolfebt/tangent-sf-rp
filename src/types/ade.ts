/**
 * @file ade.ts
 * @description Core TypeScript contracts and interfaces for the Adventure Development Environment (ADE)
 * and AIME Creative Suite ("The Art of AI Crafting").
 */

export interface AdeElementFieldValues {
  [key: string]: any;
}

/**
 * Importance rankings for linked assets in AIME Layer 3 (Asset Hub).
 * Controls how prominence and weighting are synthesized into generative prompts.
 */
export type AssetHubImportance = 'high' | 'typical' | 'low' | 'non_informative';

/**
 * Rich contextual link representation in the AIME Asset Hub.
 */
export interface LinkedAssetRef {
  assetId: string;
  assetType?: string;
  assetTitle?: string;
  importance: AssetHubImportance;
  annotation?: string; // Directorial note / the "why"
}

/**
 * Directorial guidance settings in AIME Layer 1 (Guidance Gems).
 */
export interface AimeGuidanceSettings {
  genre?: string;
  tone?: string;
  pacing?: string;
  pov?: string;
  literaryDevices?: string[];
  structure?: string;
  customGems?: Record<string, string[]>;
  [key: string]: any;
}

export interface AdeElementRecord {
  id: string;
  title: string;
  type: string;
  category?: string;
  icon?: string;
  content?: string;
  description?: string;
  fields?: AdeElementFieldValues;
  guidance?: AimeGuidanceSettings;
  assetHub?: LinkedAssetRef[];
  linkedElements?: (string | LinkedAssetRef)[];
  createdAt?: string | number;
  updatedAt?: string | number;
  authorId?: string;
  tags?: string[];
  imageUrl?: string | null;
  [key: string]: any;
}

export interface AdePreflightIssue {
  id?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  targetId?: string;
}

export interface AdePreflightTelemetry {
  score: number;
  issues: string[];
  warnings: string[];
}

export interface AdeScenarioRecord {
  id: string;
  title?: string;
  type?: string;
  content?: string;
  guidance?: AimeGuidanceSettings;
  assetHub?: LinkedAssetRef[];
  linkedElements?: (string | LinkedAssetRef)[];
  completedBeats?: number[];
  fields?: {
    goal?: string;
    summary?: string;
    sceneBeats?: string;
    completedBeats?: number[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CronicleDeltaRecord {
  id: string;
  action?: string;
  target?: string;
  entityId?: string;
  explanation?: string;
  value?: any;
  [key: string]: any;
}
