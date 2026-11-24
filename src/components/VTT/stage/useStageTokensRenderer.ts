import React, { useEffect } from 'react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { InteractiveObjectManager } from '../../../engine/assets/InteractiveObjectManager.ts';
import type { SceneInteractiveObject } from '../../../engine/assets/FoundryIngestion.ts';
import { LayerCompositor, ZLayer } from '../../../engine/canvas/LayerCompositor.ts';
import { useEngineStore, type FusedToken } from '../../../engine/state/VolatileSharder.ts';
import { AudioService } from '../../../services/audioService';
import { clearPixiContainer } from '../utils/pixiCleanup';

export interface UseStageTokensRendererParams {
  isCanvasReady: boolean;
  canvasGeneration: number;
  layerCompositorRef: React.MutableRefObject<LayerCompositor | null>;
  interactiveObjMgrRef: React.MutableRefObject<InteractiveObjectManager>;
  waypointsContainerRef: React.MutableRefObject<Container | null>;
  combatArbRef: React.MutableRefObject<any>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  viewportTransformRef: React.MutableRefObject<{ zoom: number; pan: { x: number; y: number } }>;
  tokens: FusedToken[];
  localObjects: SceneInteractiveObject[];
  currentMap: any;
  updateMap: any;
  selectedTokenId: string | null;
  setSelectedTokenId: React.Dispatch<React.SetStateAction<string | null>>;
  setStoreSelectedTokenId: (id: string | null) => void;
  targetTokenId: string | null;
  setTargetTokenId: React.Dispatch<React.SetStateAction<string | null>>;
  setStoreTargetTokenId: (id: string | null) => void;
  setRadialMenuState: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      position: { x: number; y: number };
      token: any;
    }>
  >;
  isVisionEnabled: boolean;
  torchRadiusFt: number;
  handleObjectClick: (obj: SceneInteractiveObject) => void;
}

/**
 * Renders Stage Interactive Objects, Spatial Waypoint Routes, and Fused Tokens with vitality bars and action pips.
 */
export const useStageTokensRenderer = ({
  isCanvasReady,
  canvasGeneration,
  layerCompositorRef,
  interactiveObjMgrRef,
  waypointsContainerRef,
  combatArbRef,
  canvasRef,
  viewportTransformRef,
  tokens,
  localObjects,
  currentMap,
  updateMap,
  selectedTokenId,
  setSelectedTokenId,
  setStoreSelectedTokenId,
  targetTokenId,
  setTargetTokenId,
  setStoreTargetTokenId,
  setRadialMenuState,
  isVisionEnabled,
  torchRadiusFt,
  handleObjectClick
}: UseStageTokensRendererParams) => {
  // Render Interactive Objects on the Stage
  useEffect(() => {
    if (!isCanvasReady) return;
    const compositor = layerCompositorRef.current;
    if (!compositor) return;

    const objLayer = compositor.getLayer(ZLayer.InteractiveObjects);
    if (!objLayer) return;

    clearPixiContainer(objLayer);

    const objects = interactiveObjMgrRef.current.getAllObjects();
    objects.forEach(obj => {
      const container = new Container();
      container.x = obj.x;
      container.y = obj.y;
      container.eventMode = 'static';
      container.cursor = 'pointer';

      const g = new Graphics();
      if (obj.type === 'bulkhead') {
        const state = interactiveObjMgrRef.current.getObject(obj.id);
        const isOpen = state?.isOpen || false;
        g.rect(-20, -10, 40, 20);
        g.fill({ color: isOpen ? 0x10b981 : 0xef4444, alpha: 0.8 });
        g.stroke({ width: 2, color: 0xffffff });
      } else if (obj.type === 'terminal') {
        g.rect(-15, -15, 30, 30);
        g.fill({ color: 0x3b82f6, alpha: 0.8 });
        g.stroke({ width: 2, color: 0x60a5fa });
      } else {
        g.rect(-12, -12, 24, 24);
        g.fill({ color: 0xf59e0b, alpha: 0.8 });
        g.stroke({ width: 2, color: 0xfbbf24 });
      }

      container.addChild(g);

      container.on('pointerdown', (e) => {
        e.stopPropagation();
        handleObjectClick(obj);
      });

      objLayer.addChild(container);
    });
  }, [isCanvasReady, canvasGeneration, tokens, localObjects]);

  // ── Render Spatial Waypoints & Tactical Route on the Stage ──
  useEffect(() => {
    if (!isCanvasReady) return;
    const container = waypointsContainerRef.current;
    if (!container) return;
    clearPixiContainer(container);

    const waypoints = currentMap?.waypoints || [];
    if (waypoints.length === 0) return;

    // 1. Inter-waypoint connecting route vector lines
    if (waypoints.length > 1) {
      const routeGraphics = new Graphics();
      for (let i = 0; i < waypoints.length - 1; i++) {
        const wpA = waypoints[i];
        const wpB = waypoints[i + 1];
        if (typeof wpA.x === 'number' && typeof wpA.y === 'number' &&
            typeof wpB.x === 'number' && typeof wpB.y === 'number') {
          routeGraphics.moveTo(wpA.x, wpA.y);
          routeGraphics.lineTo(wpB.x, wpB.y);
          routeGraphics.stroke({ width: 3, color: 0xf59e0b, alpha: 0.7 });
        }
      }
      container.addChild(routeGraphics);
    }

    // 2. Render each Waypoint Beacon and Activation Perimeter
    waypoints.forEach((wp: any, idx: number) => {
      if (typeof wp.x !== 'number' || typeof wp.y !== 'number') return;
      const wpGroup = new Container();
      wpGroup.x = wp.x;
      wpGroup.y = wp.y;
      wpGroup.eventMode = 'static';
      wpGroup.cursor = 'grab';

      const radius = wp.radius || 60;
      const isTriggered = !!wp.isTriggered;
      const action = wp.triggerAction || 'REVEAL_BEAT';

      // Dynamic Palette by Trigger State and Action Type
      let zoneColor = 0xf59e0b;
      let coreColor = 0x451a03;
      let strokeColor = 0xfbbf24;
      let textColor = 0xfde68a;
      let actionTag = 'BEAT';

      if (isTriggered) {
        zoneColor = 0x10b981; // emerald
        coreColor = 0x064e3b;
        strokeColor = 0x34d399;
        textColor = 0xa7f3d0;
        actionTag = 'DONE';
      } else if (action === 'ADVANCE_SCENARIO') {
        zoneColor = 0x06b6d4; // cyan
        coreColor = 0x083344;
        strokeColor = 0x38bdf8;
        textColor = 0xbae6fd;
        actionTag = 'SCENARIO';
      } else if (action === 'TRIGGER_AIME') {
        zoneColor = 0xa855f7; // purple
        coreColor = 0x3b0764;
        strokeColor = 0xc084fc;
        textColor = 0xe9d5ff;
        actionTag = 'AIME';
      } else if (action === 'ALERT_GM') {
        zoneColor = 0xf43f5e; // rose
        coreColor = 0x4c0519;
        strokeColor = 0xfb7185;
        textColor = 0xfecdd3;
        actionTag = 'ALERT';
      }

      const markerG = new Graphics();

      // Outer Perimeter Zone
      markerG.circle(0, 0, radius);
      markerG.fill({ color: zoneColor, alpha: isTriggered ? 0.16 : 0.08 });
      markerG.stroke({ width: isTriggered ? 2 : 1.5, color: strokeColor, alpha: isTriggered ? 0.85 : 0.65 });

      // Core Beacon Target
      markerG.circle(0, 0, 14);
      markerG.fill({ color: coreColor, alpha: 0.95 });
      markerG.stroke({ width: 2, color: strokeColor, alpha: 1.0 });

      wpGroup.addChild(markerG);

      // Letter / Index badge or checkmark
      const letter = String.fromCharCode(65 + (idx % 26));
      const badgeText = new Text({
        text: isTriggered ? '✓' : letter,
        style: new TextStyle({
          fontFamily: 'monospace',
          fontSize: isTriggered ? 12 : 10,
          fontWeight: 'bold',
          fill: textColor,
          align: 'center'
        })
      });
      badgeText.anchor.set(0.5, 0.5);
      wpGroup.addChild(badgeText);

      // Waypoint Name Header with Action Tag
      const labelText = new Text({
        text: `🚩 ${wp.name || `Waypoint ${letter}`} [${actionTag}]`,
        style: new TextStyle({
          fontFamily: 'monospace',
          fontSize: 9,
          fontWeight: 'bold',
          fill: textColor
        })
      });
      labelText.anchor.set(0.5, 1.0);
      labelText.y = -18;
      wpGroup.addChild(labelText);

      // Drag waypoint interaction
      let isDragging = false;
      wpGroup.on('pointerdown', (e: any) => {
        if (e.button === 0) {
          isDragging = true;
          wpGroup.cursor = 'grabbing';
          e.stopPropagation();
        }
      });

      wpGroup.on('globalpointermove', (e: any) => {
        if (!isDragging) return;
        const localPos = container.toLocal(e.global);
        wpGroup.x = Math.round(localPos.x);
        wpGroup.y = Math.round(localPos.y);
      });

      const handlePointerUp = () => {
        if (isDragging) {
          isDragging = false;
          wpGroup.cursor = 'grab';
          if (currentMap && updateMap) {
            const updatedWaypoints = waypoints.map((w: any, wIdx: number) => {
              if (w.id === wp.id || (wIdx === idx && !w.id)) {
                return { ...w, x: Math.round(wpGroup.x), y: Math.round(wpGroup.y) };
              }
              return w;
            });
            updateMap(currentMap.id, { waypoints: updatedWaypoints });
          }
        }
      };

      wpGroup.on('pointerup', handlePointerUp);
      wpGroup.on('pointerupoutside', handlePointerUp);

      container.addChild(wpGroup);
    });
  }, [isCanvasReady, canvasGeneration, currentMap?.waypoints, updateMap]);

  // Render Tokens on the Stage with Action Pips & Mortality Indicators
  useEffect(() => {
    if (!isCanvasReady) return;
    const compositor = layerCompositorRef.current;
    if (!compositor) return;

    const tokenLayer = compositor.getLayer(ZLayer.Tokens);
    if (!tokenLayer) return;

    clearPixiContainer(tokenLayer);

    const style = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 10,
      fill: 0xffffff,
      align: 'center'
    });

    tokens.forEach(token => {
      const container = new Container();
      container.x = token.x;
      container.y = token.y;
      container.eventMode = 'static';
      container.cursor = 'pointer';

      const g = new Graphics();
      const isSelected = token.id === selectedTokenId;
      const isTarget = token.id === targetTokenId;
      const isSynthetic = !!token.is_synthetic || (token.species?.toLowerCase().includes('synthetic') ?? false);
      const isDowned = isSynthetic
        ? (token.current_structure ?? token.base_structure ?? 60) <= 0
        : (token.current_health ?? token.current_hp ?? 30) <= 0;
      const fillColor = isDowned
        ? 0xef4444
        : token.is_persona
          ? 0x06b6d4
          : 0x8b5cf6;

      const radius = 22 + (token.size_modifier || 0) * 8;

      g.circle(0, 0, radius);
      g.fill({ color: fillColor, alpha: isDowned ? 0.6 : 0.85 });

      if (isSelected) {
        g.stroke({ width: 3.5, color: 0xfacc15 });
      } else if (isTarget) {
        g.stroke({ width: 3.5, color: 0xef4444 });
      } else {
        g.stroke({ width: 1.5, color: 0xffffff });
      }

      // Flashlight indicator
      if (isSelected && isVisionEnabled) {
        const torchPx = (torchRadiusFt / 5) * 70;
        const torchG = new Graphics();
        torchG.circle(0, 0, torchPx);
        torchG.stroke({ width: 1, color: 0xfacc15, alpha: 0.3 });
        torchG.fill({ color: 0xfef08a, alpha: 0.05 });
        container.addChild(torchG);
      }

      container.addChild(g);

      // Render Dual Vitality & Health mini-bars (or Structure for synthetics)
      const barsG = new Graphics();
      const barWidth = Math.max(34, radius * 1.5);
      const barHeight = 2.5;
      const barY = -radius - 7;

      if (isSynthetic) {
        const sCur = token.current_structure ?? token.base_structure ?? 60;
        const sMax = token.base_structure ?? 60;
        const sRatio = Math.max(0, Math.min(1, sCur / sMax));
        barsG.rect(-barWidth / 2, barY, barWidth, barHeight + 1);
        barsG.fill({ color: 0x1e293b, alpha: 0.8 });
        barsG.rect(-barWidth / 2, barY, barWidth * sRatio, barHeight + 1);
        barsG.fill({ color: 0xf59e0b, alpha: 0.95 });
      } else {
        const vCur = token.current_vitality ?? token.base_vitality ?? 30;
        const vMax = token.base_vitality ?? 30;
        const vRatio = Math.max(0, Math.min(1, vCur / vMax));
        const hCur = token.current_health ?? token.current_hp ?? 30;
        const hMax = token.base_health ?? token.base_hp ?? 30;
        const hRatio = Math.max(0, Math.min(1, hCur / hMax));

        // VP Bar (Cyan)
        barsG.rect(-barWidth / 2, barY - 3.5, barWidth, barHeight);
        barsG.fill({ color: 0x1e293b, alpha: 0.8 });
        barsG.rect(-barWidth / 2, barY - 3.5, barWidth * vRatio, barHeight);
        barsG.fill({ color: 0x06b6d4, alpha: 0.95 });

        // HP Bar (Rose)
        barsG.rect(-barWidth / 2, barY, barWidth, barHeight);
        barsG.fill({ color: 0x1e293b, alpha: 0.8 });
        barsG.rect(-barWidth / 2, barY, barWidth * hRatio, barHeight);
        barsG.fill({ color: hCur <= 0 ? 0x991b1b : 0xf43f5e, alpha: 0.95 });
      }
      container.addChild(barsG);

      // Render Action Pips based on Skill Rank
      const skillRank = (token as any).skill_rank ?? 8;
      const actionTier = combatArbRef.current.getActionTier(skillRank);
      const actionCount = actionTier.actionsCount;
      const pipsG = new Graphics();
      const pipsSpacing = 7;
      const startX = -((actionCount - 1) * pipsSpacing) / 2;
      for (let p = 0; p < actionCount; p++) {
        const px = startX + p * pipsSpacing;
        const py = -radius - 14;
        pipsG.poly([px, py - 3, px + 3, py, px, py + 3, px - 3, py]);
        pipsG.fill({ color: 0x06b6d4, alpha: 0.95 });
        pipsG.stroke({ width: 0.8, color: 0xffffff });
      }
      container.addChild(pipsG);

      // Bleeding out state
      if (isDowned) {
        const mortG = new Graphics();
        mortG.circle(0, 0, radius + 4);
        mortG.stroke({ width: 2.5, color: 0xf59e0b, alpha: 0.9 });
        container.addChild(mortG);

        const mortText = new Text({
          text: isSynthetic ? `STRUCTURE COMPROMISED` : `BLEEDING OUT`,
          style: new TextStyle({ fontFamily: 'monospace', fontSize: 8.5, fill: 0xf59e0b, fontWeight: 'bold' })
        });
        mortText.anchor.set(0.5, 2.7);
        container.addChild(mortText);
      }

      // Name & Vitals Label
      const vitHealthText = isSynthetic
        ? `${token.current_structure ?? 60} SP`
        : `${token.current_vitality ?? 30} VP | ${token.current_health ?? token.current_hp ?? 30} HP`;
      const seatSuffix = token.vehicle_node_id ? ` [${token.vehicle_node_id.replace('node-', '').toUpperCase()}]` : '';
      const label = new Text({ text: `${token.name}${seatSuffix} (${vitHealthText})`, style });
      label.anchor.set(0.5, -1.8);
      container.addChild(label);

      // Pointer listeners
      container.on('pointerdown', (e: any) => {
        e.stopPropagation();
        if (e.button === 2 || e.buttons === 2) {
          e.nativeEvent?.preventDefault?.();
          setSelectedTokenId(token.id);
          setStoreSelectedTokenId(token.id);
          const eng = useEngineStore.getState();
          eng.clearSelection();
          eng.setSelection(token.id, true);
          const canvasBounds = canvasRef.current?.getBoundingClientRect();
          const { zoom: curZoom, pan: curPan } = viewportTransformRef.current;
          const screenX = canvasBounds ? canvasBounds.left + token.x * curZoom + curPan.x : token.x;
          const screenY = canvasBounds ? canvasBounds.top + token.y * curZoom + curPan.y : token.y;
          setRadialMenuState({
            isOpen: true,
            position: { x: screenX, y: screenY },
            token
          });
          AudioService.playTerminalBeep(1350, 0.04);
        } else if (e.shiftKey) {
          setTargetTokenId(token.id);
          setStoreTargetTokenId(token.id);
          AudioService.playTerminalBeep(950, 0.03);
        } else {
          setSelectedTokenId(token.id);
          setStoreSelectedTokenId(token.id);
          const eng = useEngineStore.getState();
          eng.clearSelection();
          eng.setSelection(token.id, true);
          AudioService.playTerminalBeep(1200, 0.03);
        }
      });

      tokenLayer.addChild(container);
    });
  }, [isCanvasReady, canvasGeneration, tokens, selectedTokenId, targetTokenId, isVisionEnabled, torchRadiusFt]);
};
