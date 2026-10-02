/**
 * @file ade.ts
 * @description Core TypeScript contracts and interfaces for the Adventure Development Environment (ADE).
 */

export interface AdeElementFieldValues {
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
  createdAt?: string | number;
  updatedAt?: string | number;
  authorId?: string;
  tags?: string[];
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
  linkedElements?: string[];
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
