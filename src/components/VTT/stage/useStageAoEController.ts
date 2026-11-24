/**
 * @file useStageAoEController.ts
 * @description Measured Area-of-Effect (Circle, Cone, Line) template controller & PixiJS renderer for StageView.
 * Wires canonical aoeHazardService.js presets, footprint targeting, 2d10 saves, and vitals damage into StageView.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Graphics, Container, Text as PixiText, TextStyle } from 'pixi.js';
import {
  CANONICAL_AOE_PRESETS,
  getAoEPreset,
  getTokensInCircle,
  getTokensInCone,
  getTokensInLine,
  resolveAoEImpact
} from '../../../services/aoeHazardService.js';
import { useEngineStore, type FusedToken } from '../../../engine/state/VolatileSharder';
import { clearPixiContainer } from '../utils/pixiCleanup';
import { AudioService } from '../../../services/audioService';
import { VttEventBus } from '../../../utils/vttEventBus';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';

export interface UseStageAoEControllerOptions {
  aoeContainerRef: React.MutableRefObject<Container | null>;
  isCanvasReady: boolean;
  canvasGeneration?: number;
  tokens: FusedToken[];
  selectedAoEPresetId: string;
  isAoEToolActive: boolean;
  setCombatLog: React.Dispatch<React.SetStateAction<string[]>>;
}

export interface AoEAffectedResult {
  token: any;
  distancePx: number;
  isInside: boolean;
  zone: string;
}

export function useStageAoEController({
  aoeContainerRef,
  isCanvasReady,
  canvasGeneration = isCanvasReady ? 1 : 0,
  tokens,
  selectedAoEPresetId,
  isAoEToolActive,
  setCombatLog
}: UseStageAoEControllerOptions) {
  const [aoeOrigin, setAoEOrigin] = useState<{ x: number; y: number } | null>(null);
  const [aoeTarget, setAoETarget] = useState<{ x: number; y: number } | null>(null);
  const [isAimingAoE, setIsAimingAoE] = useState<boolean>(false);
  const [hasCommittedTemplate, setHasCommittedTemplate] = useState<boolean>(false);

  const activePreset = useMemo(() => getAoEPreset(selectedAoEPresetId), [selectedAoEPresetId]);

  const clearAoETemplate = useCallback(() => {
    setAoEOrigin(null);
    setAoETarget(null);
    setIsAimingAoE(false);
    setHasCommittedTemplate(false);
  }, []);

  const startAoETemplate = useCallback((pos: { x: number; y: number }) => {
    setAoEOrigin(pos);
    setAoETarget(pos);
    setIsAimingAoE(true);
    setHasCommittedTemplate(false);
    AudioService.playTerminalBeep(1150, 0.03);
  }, []);

  const updateAoETarget = useCallback((pos: { x: number; y: number }) => {
    setAoETarget(pos);
  }, []);

  const commitAoETemplate = useCallback((pos?: { x: number; y: number }) => {
    if (pos) setAoETarget(pos);
    setIsAimingAoE(false);
    setHasCommittedTemplate(true);
    AudioService.playTerminalBeep(1320, 0.04);
  }, []);

  // Normalize tokens into the shape expected by aoeHazardService.js
  const normalizedTokens = useMemo(() => {
    return (tokens || []).map((t) => {
      const isSynthetic = Boolean(t.is_synthetic);
      const saves = (t as any).saves || {};
      const attrs = (t as any).attributes || {};
      return {
        ...t,
        label: t.name || 'Combatant',
        armorDr: t.armor_dr ?? 0,
        stamina: Number(attrs.sta ?? t.stamina_dr ?? 0),
        fortitude: Number(saves.fortitude ?? (t as any).fortitude ?? attrs.sta ?? t.stamina_dr ?? 2),
        reflex: Number(saves.reflex ?? (t as any).reflex ?? attrs.agi ?? attrs.dex ?? 2),
        isSynthetic,
        structure: isSynthetic ? (t.base_structure ?? 0) : 0,
        conditions: t.active_conditions || []
      };
    });
  }, [tokens]);

  const affectedResults: AoEAffectedResult[] = useMemo(() => {
    if (!aoeOrigin || !activePreset) return [];
    const target = aoeTarget || aoeOrigin;

    if (activePreset.shape === 'circle') {
      const radiusPx = activePreset.radiusPx || 75;
      return getTokensInCircle(aoeOrigin, radiusPx, normalizedTokens) as AoEAffectedResult[];
    }

    if (activePreset.shape === 'cone') {
      const dx = target.x - aoeOrigin.x;
      const dy = target.y - aoeOrigin.y;
      const angleDeg = dx === 0 && dy === 0 ? 0 : Math.atan2(dy, dx) * (180 / Math.PI);
      const rangePx = activePreset.rangePx || 120;
      const coneAngleDeg = activePreset.coneAngleDeg || 60;
      return getTokensInCone(aoeOrigin, angleDeg, coneAngleDeg, rangePx, normalizedTokens) as AoEAffectedResult[];
    }

    // Line beam
    const dx = target.x - aoeOrigin.x;
    const dy = target.y - aoeOrigin.y;
    const len = Math.hypot(dx, dy);
    const maxLen = activePreset.lengthPx || 200;
    const endPoint =
      len > 5
        ? {
            x: aoeOrigin.x + (dx / len) * maxLen,
            y: aoeOrigin.y + (dy / len) * maxLen
          }
        : { x: aoeOrigin.x + maxLen, y: aoeOrigin.y };

    return getTokensInLine(aoeOrigin, endPoint, activePreset.widthPx || 30, normalizedTokens) as AoEAffectedResult[];
  }, [aoeOrigin, aoeTarget, activePreset, normalizedTokens]);

  const resolveActiveAoE = useCallback(() => {
    if (!aoeOrigin || !activePreset) return [];
    const impactResults = resolveAoEImpact(activePreset, affectedResults);
    const engStore = useEngineStore.getState();
    const sync = getVttMultiplayerSync();

    impactResults.forEach((res: any) => {
      const tok = tokens.find((t) => t.id === res.tokenId);
      if (!tok) return;

      if (tok.is_synthetic) {
        const cur = tok.current_structure ?? tok.current_hp ?? 60;
        const nextStruct = Math.max(0, cur - (res.structureDamage || res.finalDamage));
        engStore.setStructure(tok.id, nextStruct);
      } else {
        if (res.vitalityDamage > 0) {
          const curVit = tok.current_vitality ?? tok.base_vitality ?? 30;
          engStore.setVitality(tok.id, Math.max(0, curVit - res.vitalityDamage));
        }
        if (res.healthDamage > 0) {
          engStore.applyDamage(tok.id, res.healthDamage, true);
        }
      }

      if (res.appliedCondition) {
        engStore.addCondition(tok.id, res.appliedCondition);
      }

      const updatedEph = useEngineStore.getState().ephemeralData[tok.id];
      if (updatedEph) {
        sync.broadcastTokenVitals(tok.id, {
          current_hp: updatedEph.current_hp,
          ...(updatedEph.current_health !== undefined ? { current_health: updatedEph.current_health } : {}),
          ...(updatedEph.current_vitality !== undefined ? { current_vitality: updatedEph.current_vitality } : {}),
          ...(updatedEph.current_structure !== undefined ? { current_structure: updatedEph.current_structure } : {}),
          active_conditions: updatedEph.active_conditions
        });
      }
    });

    AudioService.playCombatHit(true);

    const summaryLines = impactResults.map(
      (r: any) =>
        `${r.tokenLabel}: ${r.saved ? 'SAVED (Half)' : 'FAILED'} [Roll ${r.saveRoll} vs ${activePreset.saveType} CR ${r.saveCr}] → ${r.finalDamage} DMG${r.appliedCondition ? ` + ${r.appliedCondition}` : ''}`
    );

    const logSummary =
      impactResults.length > 0
        ? `[AOE BLAST] ${activePreset.label} struck ${impactResults.length} target(s): ${summaryLines.join(' | ')}`
        : `[AOE BLAST] ${activePreset.label} detonated with 0 targets in footprint.`;

    setCombatLog((prev) => [logSummary, ...prev.slice(0, 8)]);

    const card = {
      id: `aoe-card-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'TACTICAL ORDNANCE',
      visibility: 'public' as const,
      kind: 'aoe' as const,
      title: `${activePreset.icon || '💥'} ${activePreset.label}`,
      body: summaryLines.length > 0 ? summaryLines.join('\n') : 'No combatants inside template radius.',
      damagePayload: {
        rawDamage: activePreset.baseDamage,
        damageType: activePreset.damageType,
        saveType: activePreset.saveType,
        saveCr: activePreset.saveCr
      }
    };
    VttEventBus.emit('stage-chat-card', card);
    sync.broadcastChatCard(card);
    VttEventBus.emit('stage-aoe-resolved', {
      presetId: activePreset.id,
      label: activePreset.label,
      affectedCount: impactResults.length,
      results: impactResults,
      origin: aoeOrigin
    });

    clearAoETemplate();
    return impactResults;
  }, [aoeOrigin, activePreset, affectedResults, tokens, setCombatLog, clearAoETemplate]);

  // Render measured AoE template + highlighted target rings onto ZLayer.DynamicFX
  useEffect(() => {
    const container = aoeContainerRef.current;
    if (!container) return;
    clearPixiContainer(container);

    if (!aoeOrigin || !activePreset || (!isAoEToolActive && !isAimingAoE && !hasCommittedTemplate)) return;

    const target = aoeTarget || aoeOrigin;
    const strokeHex =
      activePreset.damageType === 'concussive'
        ? 0x38bdf8
        : activePreset.id === 'hazard_radiation'
          ? 0xa3e635
          : 0xf97316;

    const g = new Graphics();

    if (activePreset.shape === 'circle') {
      const r = activePreset.radiusPx || 75;
      g.circle(aoeOrigin.x, aoeOrigin.y, r);
      g.fill({ color: strokeHex, alpha: 0.18 });
      g.stroke({ width: 2.5, color: strokeHex, alpha: 0.92 });

      if (activePreset.falloff) {
        g.circle(aoeOrigin.x, aoeOrigin.y, r * 0.5);
        g.stroke({ width: 1.5, color: 0xfef08a, alpha: 0.75 });
      }
    } else if (activePreset.shape === 'cone') {
      const dx = target.x - aoeOrigin.x;
      const dy = target.y - aoeOrigin.y;
      const dirRad = dx === 0 && dy === 0 ? 0 : Math.atan2(dy, dx);
      const halfRad = ((activePreset.coneAngleDeg || 60) * Math.PI) / 360;
      const rangePx = activePreset.rangePx || 120;
      const steps = 16;
      const pts: number[] = [aoeOrigin.x, aoeOrigin.y];
      for (let i = 0; i <= steps; i++) {
        const a = dirRad - halfRad + (2 * halfRad * i) / steps;
        pts.push(aoeOrigin.x + Math.cos(a) * rangePx, aoeOrigin.y + Math.sin(a) * rangePx);
      }
      g.poly(pts);
      g.fill({ color: strokeHex, alpha: 0.2 });
      g.stroke({ width: 2.5, color: strokeHex, alpha: 0.92 });
    } else {
      const dx = target.x - aoeOrigin.x;
      const dy = target.y - aoeOrigin.y;
      const len = Math.hypot(dx, dy);
      const angle = len > 1 ? Math.atan2(dy, dx) : 0;
      const maxLen = activePreset.lengthPx || 200;
      const halfW = (activePreset.widthPx || 30) / 2;
      const ux = Math.cos(angle);
      const uy = Math.sin(angle);
      const nx = -uy * halfW;
      const ny = ux * halfW;
      const endX = aoeOrigin.x + ux * maxLen;
      const endY = aoeOrigin.y + uy * maxLen;

      g.poly([
        aoeOrigin.x + nx,
        aoeOrigin.y + ny,
        endX + nx,
        endY + ny,
        endX - nx,
        endY - ny,
        aoeOrigin.x - nx,
        aoeOrigin.y - ny
      ]);
      g.fill({ color: strokeHex, alpha: 0.22 });
      g.stroke({ width: 2.5, color: strokeHex, alpha: 0.92 });
    }

    // Highlight every token inside footprint
    affectedResults.forEach(({ token, zone }) => {
      const ringRadius = 28 + (token.size_modifier || 0) * 8;
      g.circle(token.x, token.y, ringRadius);
      g.stroke({ width: 3, color: zone === 'core' ? 0xef4444 : 0xfacc15, alpha: 0.95 });
    });

    container.addChild(g);

    const badge = new PixiText({
      text: `${activePreset.label} • ${affectedResults.length} TARGET${affectedResults.length === 1 ? '' : 'S'}`,
      style: new TextStyle({
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: 'bold',
        fill: 0xffffff
      })
    });
    badge.anchor.set(0.5, 1);
    badge.x = aoeOrigin.x;
    badge.y = aoeOrigin.y - 18;
    container.addChild(badge);
  }, [
    aoeContainerRef,
    isCanvasReady,
    canvasGeneration,
    aoeOrigin,
    aoeTarget,
    activePreset,
    affectedResults,
    isAoEToolActive,
    isAimingAoE,
    hasCommittedTemplate
  ]);

  return {
    aoePresets: CANONICAL_AOE_PRESETS,
    activePreset,
    aoeOrigin,
    aoeTarget,
    isAimingAoE,
    hasCommittedTemplate,
    affectedResults,
    startAoETemplate,
    updateAoETarget,
    commitAoETemplate,
    clearAoETemplate,
    resolveActiveAoE
  };
}
