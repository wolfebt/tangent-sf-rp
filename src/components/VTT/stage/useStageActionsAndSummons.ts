import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BVHBuilder, type WallSegment } from '../../../engine/vision/BVHBuilder.ts';
import { InteractiveObjectManager } from '../../../engine/assets/InteractiveObjectManager.ts';
import type { SceneInteractiveObject } from '../../../engine/assets/FoundryIngestion.ts';
import {
  selectAllVehicles,
  useEngineStore,
  type FusedToken,
  type StaticEntity
} from '../../../engine/state/VolatileSharder.ts';
import {
  HazardParticleSimulator,
  type HazardField,
  type HazardType
} from '../../../engine/physics/HazardParticleSimulator.ts';
import {
  LightSourceManager,
  type LightAnimationType,
  type SceneLightSource
} from '../../../engine/vision/LightSourceManager';
import { type PaletteItem } from '../ArchitectDesignPalette';
import { AudioService } from '../../../services/audioService';
import { createTacticalPing } from '../../../services/mapPingService';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';
import { expandWallsForGeometry, createWallSegment, WALL_TYPES, DOOR_STATES } from '../../../schemas/vttWallSchema.js';
import { DEFAULT_LAYERS } from '../../../pages/Foundry/MapMaker/map/MapConstants';
import { VttEventBus } from '../../../utils/vttEventBus';
import { disarmTrap, TRAP_TYPES } from '../../../services/reactiveVttService';
import { executeStageAiDecision } from './stageAiDecisionExecutor';

export interface UseStageActionsAndSummonsParams {
  bvhBuilderRef: React.MutableRefObject<BVHBuilder>;
  interactiveObjMgrRef: React.MutableRefObject<InteractiveObjectManager>;
  hazardSimulatorRef: React.MutableRefObject<HazardParticleSimulator | null>;
  lightSourceMgrRef: React.MutableRefObject<LightSourceManager>;
  mouseWorldPosRef: React.MutableRefObject<{ x: number; y: number }>;
  selectedAssetIds: string[];
  setSelectedAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  localObjects: SceneInteractiveObject[];
  setLocalObjects: React.Dispatch<React.SetStateAction<SceneInteractiveObject[]>>;
  localWalls: WallSegment[];
  setLocalWalls: React.Dispatch<React.SetStateAction<WallSegment[]>>;
  localLights: SceneLightSource[];
  setLocalLights: React.Dispatch<React.SetStateAction<SceneLightSource[]>>;
  currentMap: any;
  addMap: any;
  updateMap: any;
  handleSelectMap: (mapId: string) => void;
  recordHistory: (action?: string) => void;
  gridSnap: boolean;
  randomizeRotation: boolean;
  randomizeScale: boolean;
  selectedLightRadius: number;
  selectedLightColor: string;
  selectedLightAnimation: LightAnimationType;
  setHazardCount: React.Dispatch<React.SetStateAction<number>>;
  setCombatLog: React.Dispatch<React.SetStateAction<string[]>>;
  setIsDesignModeActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSimulationPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setInspectingInteractiveObj: React.Dispatch<React.SetStateAction<any | null>>;
  selectedToken: FusedToken | null;
  targetToken: FusedToken | null;
  selectedTokenId: string | null;
  tokens: FusedToken[];
  isMultiplayerSimActive: boolean;
  toggleMultiplayerSim: () => void;
  setActivePings: React.Dispatch<React.SetStateAction<any[]>>;
  activeStance: 'normal' | 'guard' | 'overcharge' | 'aim';
  setActiveStance: React.Dispatch<React.SetStateAction<'normal' | 'guard' | 'overcharge' | 'aim'>>;
  setIsMoveModeActive: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveTab: React.Dispatch<React.SetStateAction<any>>;
  handleExecuteCombatStrike: () => void;
  isArchitectRole?: boolean;
}

/**
 * Encapsulates Stage batch editing, architect asset placement, interactive object triggers, landmass/UVTT commits, hero/codex summons, layer toggles, and radial action menu handlers.
 */
export const useStageActionsAndSummons = ({
  bvhBuilderRef,
  interactiveObjMgrRef,
  hazardSimulatorRef,
  lightSourceMgrRef,
  mouseWorldPosRef,
  selectedAssetIds,
  setSelectedAssetIds,
  localObjects,
  setLocalObjects,
  localWalls,
  setLocalWalls,
  localLights,
  setLocalLights,
  currentMap,
  addMap,
  updateMap,
  handleSelectMap,
  recordHistory,
  gridSnap,
  randomizeRotation,
  randomizeScale,
  selectedLightRadius,
  selectedLightColor,
  selectedLightAnimation,
  setHazardCount,
  setCombatLog,
  setIsDesignModeActive,
  setIsSimulationPaused,
  setInspectingInteractiveObj,
  selectedToken,
  targetToken,
  selectedTokenId,
  tokens,
  isMultiplayerSimActive,
  toggleMultiplayerSim,
  setActivePings,
  activeStance,
  setActiveStance,
  setIsMoveModeActive,
  setActiveTab,
  handleExecuteCombatStrike,
  isArchitectRole = true
}: UseStageActionsAndSummonsParams) => {
  const aiContextRef = useRef({
    tokens,
    currentMap,
    updateMap,
    isArchitectRole
  });
  aiContextRef.current = {
    tokens,
    currentMap,
    updateMap,
    isArchitectRole
  };

  useEffect(() => {
    const offAi = VttEventBus.on('stage-ai-decision', ({ tokenId, decision }) => {
      const ctx = aiContextRef.current;
      const sync = getVttMultiplayerSync();
      executeStageAiDecision({
        tokenId,
        decision,
        tokens: ctx.tokens,
        currentMap: ctx.currentMap,
        engineStore: useEngineStore.getState(),
        updateMap: ctx.updateMap,
        broadcastTokenMove: (id, x, y, elev) => sync.broadcastTokenMove(id, x, y, elev),
        broadcastTokenVitals: (id, vitals) => sync.broadcastTokenVitals(id, vitals),
        broadcastChatCard: (card) => sync.broadcastChatCard(card),
        emitChatCard: (card) => VttEventBus.emit('stage-chat-card', card),
        setCombatLog,
        isArchitectRole: ctx.isArchitectRole
      });
    });
    return () => {
      offAi();
    };
  }, [setCombatLog]);
  // ── Batch Multi-Asset Selection Actions ──
  const handleBatchDelete = useCallback(() => {
    if (selectedAssetIds.length === 0) return;
    recordHistory(`Delete ${selectedAssetIds.length} Assets`);

    const engineStore = useEngineStore.getState();
    const nextObjects = localObjects.filter(o => !selectedAssetIds.includes(o.id));
    const nextWalls = localWalls.filter(w => !selectedAssetIds.includes(w.id));
    const nextLights = localLights.filter(l => !selectedAssetIds.includes(l.id));
    const nextTexts = (currentMap?.texts || []).filter((t: any) => !selectedAssetIds.includes(t.id));
    const nextLines = (currentMap?.lines || []).filter((l: any) => !selectedAssetIds.includes(l.id));
    const nextTerrains = (currentMap?.terrains || []).filter((t: any) => !selectedAssetIds.includes(t.id));

    const matchedTokenIds = Object.keys(engineStore.staticData).filter((tokId) =>
      selectedAssetIds.includes(tokId)
    );
    matchedTokenIds.forEach((tokId) => {
      engineStore.removeEntity(tokId);
    });
    const nextTokens = Array.isArray(currentMap?.tokens)
      ? currentMap.tokens.filter((t: any) => !selectedAssetIds.includes(t?.id))
      : undefined;

    setLocalObjects(nextObjects);
    setLocalWalls(nextWalls);
    setLocalLights(nextLights);
    interactiveObjMgrRef.current.loadObjects(nextObjects);
    bvhBuilderRef.current.build(expandWallsForGeometry(nextWalls) as any);

    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        objects: nextObjects,
        walls: nextWalls,
        lights: nextLights,
        texts: nextTexts,
        lines: nextLines,
        terrains: nextTerrains,
        ...(nextTokens !== undefined ? { tokens: nextTokens } : {})
      });
    }

    AudioService.playTerminalBeep(700, 0.04);
    setCombatLog(prev => [`[BATCH DELETE] Purged ${selectedAssetIds.length} assets from sector.`, ...prev.slice(0, 8)]);
    setSelectedAssetIds([]);
  }, [selectedAssetIds, localObjects, localWalls, localLights, currentMap, updateMap, recordHistory]);

  const handleBatchDuplicate = useCallback(() => {
    if (selectedAssetIds.length === 0) return;
    recordHistory(`Duplicate ${selectedAssetIds.length} Assets`);

    const offset = gridSnap ? 70 : 25;
    const newSelectedIds: string[] = [];
    const engineStore = useEngineStore.getState();

    // Duplicate Objects
    const clonedObjects: SceneInteractiveObject[] = [];
    localObjects.forEach(o => {
      if (selectedAssetIds.includes(o.id)) {
        const newId = `obj-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        clonedObjects.push({
          ...o,
          id: newId,
          name: `${o.name} (Copy)`,
          x: o.x + offset,
          y: o.y + offset
        });
        newSelectedIds.push(newId);
      }
    });

    // Duplicate Walls
    const clonedWalls: WallSegment[] = [];
    localWalls.forEach(w => {
      if (selectedAssetIds.includes(w.id)) {
        const newId = `wall-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        clonedWalls.push({
          ...w,
          id: newId,
          p1: { x: w.p1.x + offset, y: w.p1.y + offset },
          p2: { x: w.p2.x + offset, y: w.p2.y + offset }
        });
        newSelectedIds.push(newId);
      }
    });

    // Duplicate Lights
    const clonedLights: SceneLightSource[] = [];
    localLights.forEach(l => {
      if (selectedAssetIds.includes(l.id)) {
        const newId = `light-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        clonedLights.push({
          ...l,
          id: newId,
          x: l.x + offset,
          y: l.y + offset
        });
        newSelectedIds.push(newId);
      }
    });

    // Duplicate Tokens
    const baseTokens = Array.isArray(currentMap?.tokens) ? currentMap.tokens : [];
    const clonedTokens: any[] = [];
    const selectedTokenIds = Object.keys(engineStore.staticData).filter((tokId) =>
      selectedAssetIds.includes(tokId)
    );
    selectedTokenIds.forEach((tokId, idx) => {
      const srcMapTok = baseTokens.find((t: any) => t?.id === tokId);
      const srcStatic = engineStore.staticData[tokId];
      const srcEph = engineStore.ephemeralData[tokId];
      const baseTok = srcMapTok || srcStatic;
      if (!baseTok) return;
      const cloneId = `tok_dup_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`;
      const nextX = Number(srcEph?.x ?? baseTok.x ?? 140) + offset;
      const nextY = Number(srcEph?.y ?? baseTok.y ?? 140) + offset;
      const clonedTok = {
        ...baseTok,
        id: cloneId,
        name: `${baseTok.name || 'Operative'} (Copy)`,
        x: nextX,
        y: nextY
      };
      clonedTokens.push(clonedTok);
      if (srcStatic) {
        engineStore.loadStaticEntity({
          ...srcStatic,
          id: cloneId,
          name: clonedTok.name
        });
        engineStore.updatePosition(cloneId, nextX, nextY, Number(srcEph?.elevation_ft ?? srcEph?.z ?? 0) || 0);
      }
      newSelectedIds.push(cloneId);
    });

    const nextObjects = [...localObjects, ...clonedObjects];
    const nextWalls = [...localWalls, ...clonedWalls];
    const nextLights = [...localLights, ...clonedLights];
    const nextTokens = clonedTokens.length > 0 ? [...baseTokens, ...clonedTokens] : undefined;

    setLocalObjects(nextObjects);
    setLocalWalls(nextWalls);
    setLocalLights(nextLights);
    interactiveObjMgrRef.current.loadObjects(nextObjects);
    clonedWalls.forEach(w => bvhBuilderRef.current.addWall(w));

    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        objects: nextObjects,
        walls: nextWalls,
        lights: nextLights,
        ...(nextTokens !== undefined ? { tokens: nextTokens } : {})
      });
    }
    setSelectedAssetIds(newSelectedIds);
    AudioService.playCriticalChime(true);
    setCombatLog(prev => [`[DUPLICATE] Cloned ${newSelectedIds.length} assets with +${offset}px offset.`, ...prev.slice(0, 8)]);
  }, [selectedAssetIds, localObjects, localWalls, localLights, gridSnap, currentMap, updateMap, recordHistory]);

  const handleBatchNudge = useCallback((dx: number, dy: number) => {
    if (selectedAssetIds.length === 0) return;

    const nextObjects = localObjects.map(o => selectedAssetIds.includes(o.id) ? { ...o, x: o.x + dx, y: o.y + dy } : o);
    const nextWalls = localWalls.map(w => selectedAssetIds.includes(w.id) ? {
      ...w,
      p1: { x: w.p1.x + dx, y: w.p1.y + dy },
      p2: { x: w.p2.x + dx, y: w.p2.y + dy }
    } : w);
    const nextLights = localLights.map(l => selectedAssetIds.includes(l.id) ? { ...l, x: l.x + dx, y: l.y + dy } : l);

    const engineStore = useEngineStore.getState();
    const sync = getVttMultiplayerSync();
    const nudgedTokenIds = Object.keys(engineStore.staticData).filter((tokId) =>
      selectedAssetIds.includes(tokId)
    );
    nudgedTokenIds.forEach((tokId) => {
      const eph = engineStore.ephemeralData[tokId];
      if (!eph) return;
      const nextX = eph.x + dx;
      const nextY = eph.y + dy;
      engineStore.updatePosition(tokId, nextX, nextY);
      sync.broadcastTokenMove(tokId, nextX, nextY, eph.elevation_ft ?? 0);
    });
    const nextTokens =
      nudgedTokenIds.length > 0 && Array.isArray(currentMap?.tokens)
        ? currentMap.tokens.map((t: any) =>
            selectedAssetIds.includes(t?.id)
              ? { ...t, x: Number(t.x ?? 0) + dx, y: Number(t.y ?? 0) + dy }
              : t
          )
        : undefined;

    setLocalObjects(nextObjects);
    setLocalWalls(nextWalls);
    setLocalLights(nextLights);
    interactiveObjMgrRef.current.loadObjects(nextObjects);
    bvhBuilderRef.current.build(expandWallsForGeometry(nextWalls) as any);

    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        objects: nextObjects,
        walls: nextWalls,
        lights: nextLights,
        ...(nextTokens !== undefined ? { tokens: nextTokens } : {})
      });
    }
  }, [selectedAssetIds, localObjects, localWalls, localLights, currentMap, updateMap]);

  const handleDeselectAll = useCallback(() => {
    setSelectedAssetIds([]);
    AudioService.playTerminalBeep(900, 0.02);
  }, []);

  // ── Deploy Item from Architect Design Palette onto the Stage ──
  const deployArchitectItem = (item: PaletteItem, targetX: number, targetY: number) => {
    recordHistory(`Deploy ${item.label}`);
    AudioService.playTerminalBeep(1350, 0.03);

    // Calculate natural scatter jitter
    let targetRotation = 0;
    let targetScale = 1.0;
    if (randomizeRotation) {
      targetRotation = Math.round((Math.random() - 0.5) * 30);
    }
    if (randomizeScale) {
      targetScale = Number((0.85 + Math.random() * 0.3).toFixed(2));
    }

    if (item.type === 'wall') {
      const newWallId = `wall-${Date.now()}`;
      const newWall: WallSegment = {
        id: newWallId,
        p1: { x: targetX, y: targetY },
        p2: { x: targetX + (item.defaultProps?.length || 70), y: targetY },
        isDynamic: Boolean(item.defaultProps?.isDynamic),
        isOpen: false,
        isTransparent: Boolean(item.defaultProps?.isTransparent)
      };
      bvhBuilderRef.current.addWall(newWall);
      const updatedWalls = [...localWalls, newWall];
      setLocalWalls(updatedWalls);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { walls: updatedWalls });
      }

      setCombatLog(prev => [
        `[ARCHITECT] Placed ${item.label} at (${targetX}, ${targetY}). BVH tree rebuilt.`,
        ...prev.slice(0, 8)
      ]);
    } else if (item.type === 'object') {
      const newObjId = `obj-${Date.now()}`;
      const newObj: SceneInteractiveObject = {
        id: newObjId,
        name: item.defaultProps?.name || item.label,
        type: (item.subType || 'terminal') as any,
        x: targetX,
        y: targetY,
        storyElementId: item.defaultProps?.storyElementId || `story-${Date.now()}`
      };
      (newObj as any).rotation = targetRotation;
      (newObj as any).scale = targetScale;

      interactiveObjMgrRef.current.loadObjects([...interactiveObjMgrRef.current.getAllObjects(), newObj]);
      const updatedObjects = [...localObjects, newObj];
      setLocalObjects(updatedObjects);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { objects: updatedObjects });
      }

      setCombatLog(prev => [
        `[ARCHITECT] Placed interactive object "${newObj.name}" at (${targetX}, ${targetY})${randomizeRotation || randomizeScale ? ` [Rot: ${targetRotation}°, Scale: ${targetScale}x]` : ''}.`,
        ...prev.slice(0, 8)
      ]);
    } else if (item.type === 'hazard') {
      if (hazardSimulatorRef.current) {
        const newHazard: HazardField = {
          id: `hazard-${Date.now()}`,
          x: targetX,
          y: targetY,
          radius: item.defaultProps?.radius || 75,
          type: (item.defaultProps?.hazardType || 'plasma_fire') as HazardType,
          intensity: 1.0
        };
        hazardSimulatorRef.current.addHazardField(newHazard);
        setHazardCount(hazardSimulatorRef.current.getActiveHazards().length);
      }
      setCombatLog(prev => [
        `[ARCHITECT] Created ${item.label} zone at (${targetX}, ${targetY}).`,
        ...prev.slice(0, 8)
      ]);
    } else if (item.type === 'prop') {
      const newWallId = `cover-${Date.now()}`;
      const newWall: WallSegment = {
        id: newWallId,
        p1: { x: targetX, y: targetY },
        p2: { x: targetX + 50, y: targetY + 20 },
        isDynamic: false,
        isOpen: false
      };
      bvhBuilderRef.current.addWall(newWall);
      const updatedWalls = [...localWalls, newWall];
      setLocalWalls(updatedWalls);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { walls: updatedWalls });
      }

      setCombatLog(prev => [
        `[ARCHITECT] Placed ${item.label} [${item.defaultProps?.coverType || 'Cover'}] at (${targetX}, ${targetY}).`,
        ...prev.slice(0, 8)
      ]);
    } else if (item.type === 'token') {
      const newTokId = `tok-${Date.now()}`;
      const newTok: StaticEntity = {
        id: newTokId,
        name: item.label,
        base_hp: item.defaultProps?.base_hp || 35,
        tech_level: item.defaultProps?.tech_level || 3,
        armor_dr: item.defaultProps?.armor_dr || 10,
        size_modifier: item.defaultProps?.size_modifier || 0,
        speed_ft: item.defaultProps?.speed_ft || 30,
        species: item.subType === 'drone' ? 'Automaton' : item.subType === 'mech' ? 'Mecha' : 'Human',
        archetype: item.label,
        is_persona: Boolean(item.defaultProps?.is_persona)
      };
      useEngineStore.getState().loadStaticEntitiesBatch([newTok]);
      useEngineStore.getState().updatePosition(newTokId, targetX, targetY);

      if (currentMap && updateMap) {
        const existingTokens = currentMap.tokens || [];
        updateMap(currentMap.id, {
          tokens: [...existingTokens, { ...newTok, x: targetX, y: targetY }]
        });
      }

      setCombatLog(prev => [
        `[ARCHITECT] Spawned ${item.label} at (${targetX}, ${targetY}).`,
        ...prev.slice(0, 8)
      ]);
    } else if (item.type === 'light') {
      const newLightId = `light-${Date.now()}`;
      const newLight: SceneLightSource = {
        id: newLightId,
        x: targetX,
        y: targetY,
        radius: item.defaultProps?.radius || selectedLightRadius,
        color: item.defaultProps?.color || selectedLightColor,
        intensity: 1.0,
        falloff: 'smooth',
        animation: (item.defaultProps?.animation || selectedLightAnimation) as LightAnimationType,
        castShadows: true,
        label: item.label || 'Light Fixture'
      };
      lightSourceMgrRef.current.addLight(newLight);
      const nextLights = [...localLights, newLight];
      setLocalLights(nextLights);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { lights: nextLights });
      }
      setCombatLog(prev => [
        `[ARCHITECT] Deployed ${newLight.label} at (${targetX}, ${targetY}).`,
        ...prev.slice(0, 8)
      ]);
    }
  };

  const handleToggleDesignMode = () => {
    setIsDesignModeActive(prev => {
      const next = !prev;
      setIsSimulationPaused(next);
      AudioService.playTerminalBeep(next ? 1500 : 900, 0.04);
      setCombatLog(p => [
        next
          ? `[ARCHITECT MODE] In-situ map design mode active. Tactical simulation paused.`
          : `[ARCHITECT MODE] Resumed live tactical simulation. All assets synchronized.`,
        ...p.slice(0, 8)
      ]);
      return next;
    });
  };

  const handleObjectClick = (obj: SceneInteractiveObject) => {
    setInspectingInteractiveObj(obj);
    AudioService.playTerminalBeep(1300, 0.04);
  };

  const persistInteractiveState = useCallback((objId: string) => {
    const syncedObjects = interactiveObjMgrRef.current.getAllObjects();
    const updatedTarget = interactiveObjMgrRef.current.getObject(objId);
    setLocalObjects(syncedObjects);

    if (updatedTarget?.bvhWallId) {
      setLocalWalls(prev => prev.map(w => (
        w.id === updatedTarget.bvhWallId
          ? { ...w, isOpen: Boolean(updatedTarget.isOpen), doorState: updatedTarget.isOpen ? 'open' : 'closed' } as any
          : w
      )));
    }

    if (currentMap?.id && updateMap) {
      updateMap(currentMap.id, (prevMap: any) => {
        const nextObjects = (prevMap?.objects || []).map((o: any) => (
          o.id === objId && updatedTarget
            ? { ...o, isOpen: updatedTarget.isOpen, isHacked: updatedTarget.isHacked }
            : o
        ));
        const nextWalls = updatedTarget?.bvhWallId
          ? (prevMap?.walls || []).map((w: any) => (
              w.id === updatedTarget.bvhWallId
                ? { ...w, isOpen: Boolean(updatedTarget.isOpen), doorState: updatedTarget.isOpen ? 'open' : 'closed' }
                : w
            ))
          : prevMap?.walls;
        return {
          objects: nextObjects,
          ...(nextWalls ? { walls: nextWalls } : {})
        };
      });
    }
  }, [currentMap?.id, updateMap]);

  const handleToggleBulkhead = (objId: string) => {
    if (!selectedTokenId) return;
    const res = interactiveObjMgrRef.current.interact(objId, selectedTokenId);
    if (res.success) {
      persistInteractiveState(objId);
      const targetObj = interactiveObjMgrRef.current.getObject(objId);
      const mapObj = currentMap?.objects?.find((o: any) => o?.id === objId);
      const attachedMacro = (mapObj as any)?.macroScript || (targetObj as any)?.macroScript;
      if (attachedMacro && typeof attachedMacro === 'string' && attachedMacro.trim()) {
        Promise.all([
          import('../../../engine/scripting/QuickJSSandbox'),
          import('../../../services/stageMacroDispatcher')
        ])
          .then(async ([{ QuickJSSandbox }, { dispatchStageMacroActions }]) => {
            const sandbox = new QuickJSSandbox();
            const { actions } = await sandbox.executeWithActions(attachedMacro, {
              targetAsset: { id: objId, title: mapObj?.name || targetObj?.name || objId, type: mapObj?.type || targetObj?.type },
              timestamp: Date.now()
            });
            if (Array.isArray(actions) && actions.length > 0) {
              dispatchStageMacroActions(actions, {
                role: isArchitectRole ? 'architect' : 'operative',
                allowedTokenIds: selectedTokenId ? [selectedTokenId] : []
              });
            }
          })
          .catch((err) => console.warn('[Stage] Attached macro execution failed:', err));
      }
      if (targetObj?.bvhWallId) {
        getVttMultiplayerSync().broadcastDoorToggle(
          targetObj.bvhWallId,
          Boolean(res.data?.isOpen),
          res.data?.isOpen ? 'open' : 'closed'
        );
      }
      AudioService.playTerminalBeep(800, 0.06);
      setCombatLog(prev => [
        `[OBJECT] ${selectedToken?.name || 'Operator'} toggled ${objId} => ${res.data.isOpen ? 'OPEN' : 'SEALED'}`,
        ...prev.slice(0, 8)
      ]);
      setInspectingInteractiveObj(null);
    }
  };

  // Listen for CyberDeck intrusion breach events and resolve on-map bulkheads/nodes
  useEffect(() => {
    const unsub = VttEventBus.on('stage-cyberdeck-breach', (payload) => {
      AudioService.playCriticalChime(true);
      const objects = interactiveObjMgrRef.current.getAllObjects();
      const targetObj = objects.find(o => o.type === 'bulkhead' || o.type === 'terminal');
      if (targetObj) {
        const res = interactiveObjMgrRef.current.interact(targetObj.id, selectedTokenId || 'operative');
        if (res.success) {
          persistInteractiveState(targetObj.id);
          setCombatLog(prev => [
            `⚡ [CYBERDECK BREACH]: System override granted for node "${payload?.targetNode?.label || targetObj.id}"!`,
            ...prev.slice(0, 8)
          ]);
        }
      }
    });
    return unsub;
  }, [selectedTokenId, persistInteractiveState]);

  // Environmental hazard spawn handler (invoked by Tactical Console)
  const handleSpawnHazard = (type: HazardType) => {
    const activeTok = selectedToken || tokens[0];
    const spawnX = (activeTok?.x || 350) + (Math.random() - 0.5) * 140;
    const spawnY = (activeTok?.y || 250) + (Math.random() - 0.5) * 140;

    const newHazard: HazardField = {
      id: `hazard-${Date.now()}`,
      type,
      x: spawnX,
      y: spawnY,
      radius: 70,
      intensity: 1.0
    };

    hazardSimulatorRef.current?.addHazardField(newHazard);
    setHazardCount(prev => prev + 1);
    AudioService.playTerminalBeep(1400, 0.04);
    setCombatLog(prev => [
      `[HAZARD] Environmental ${type.replace('_', ' ').toUpperCase()} particle field deployed at (${Math.round(spawnX)}, ${Math.round(spawnY)}).`,
      ...prev.slice(0, 8)
    ]);
  };

  const handleClearHazards = () => {
    hazardSimulatorRef.current?.clearHazards();
    setHazardCount(0);
    AudioService.playTerminalBeep(900, 0.03);
    setCombatLog(prev => [
      `[HAZARD] All active environmental particle fields purged from The Stage.`,
      ...prev.slice(0, 8)
    ]);
  };

  const handleToggleMultiplayerSim = () => {
    toggleMultiplayerSim();
    const next = !isMultiplayerSimActive;
    AudioService.playTerminalBeep(next ? 1300 : 750, 0.04);
    setCombatLog(p => [
      next ? `[NETWORK] LiveKit WebRTC peer telemetry active. Synchronizing 3 remote operator streams.` : `[NETWORK] Local mode engaged.`,
      ...p.slice(0, 8)
    ]);
  };

  // Drop Tactical Radar Ping
  const handleDropTacticalPing = (pingType: string = 'move') => {
    const px = mouseWorldPosRef.current.x;
    const py = mouseWorldPosRef.current.y;
    const newPing = createTacticalPing(px, py, pingType, null, 'Architect', null);
    setActivePings(prev => [...prev, newPing]);
    getVttMultiplayerSync().broadcastPing(newPing);
    AudioService.playTerminalBeep(newPing.soundFreq, 0.1);
  };

  // Commit Procedural Landmass / PCG Sector
  const handleCommitLandmass = ({
    terrains = [],
    objects = [],
    walls = [],
    lights = [],
    lines = [],
    replaceExisting = false
  }: any) => {
    recordHistory();
    const existingTerrains = replaceExisting ? [] : (currentMap?.terrains || []);
    const existingObjects = replaceExisting ? [] : (currentMap?.objects || []);
    const existingWalls = replaceExisting ? [] : (currentMap?.walls || []);
    const existingLights = replaceExisting ? [] : (currentMap?.lights || []);
    const existingLines = replaceExisting ? [] : (currentMap?.lines || []);

    const normalizedWalls = (walls || []).map((w: any) => ({
      ...w,
      id: w.id || `pcg-wall-${uuidv4()}`,
      p1: w.p1 || { x: w.x1 || 0, y: w.y1 || 0 },
      p2: w.p2 || { x: w.x2 || 0, y: w.y2 || 0 },
      isDynamic: Boolean(w.isDynamic || w.isDoor || w.type === 'door' || w.wallType?.includes('door')),
      isOpen: Boolean(w.isOpen || w.doorState === 'open'),
      isTransparent: Boolean(w.isTransparent || w.type === 'window' || w.type === 'ethereal')
    }));

    const normalizedLights = (lights || []).map((l: any) => ({
      ...l,
      id: l.id || `pcg-light-${uuidv4()}`,
      falloff: l.falloff || 'smooth',
      castShadows: l.castShadows ?? true,
      animation: l.animation === 'steady' ? 'none' : (l.animation || 'none'),
      label: l.label || l.name || 'Sector Light'
    }));

    const normalizedLines = (lines || []).map((ln: any) => ({
      ...ln,
      color: ln.color || ln.stroke || '#0284c7',
      strokeWidth: ln.strokeWidth || ln.width || 4
    }));

    const updatedTerrains = [...existingTerrains, ...(terrains || [])];
    const updatedObjects = [...existingObjects, ...(objects || [])];
    const updatedWalls = [...existingWalls, ...normalizedWalls];
    const updatedLights = [...existingLights, ...normalizedLights];
    const updatedLines = [...existingLines, ...normalizedLines];

    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        terrains: updatedTerrains,
        objects: updatedObjects,
        walls: updatedWalls,
        lights: updatedLights,
        lines: updatedLines
      });
    }

    bvhBuilderRef.current.build(expandWallsForGeometry(updatedWalls) as any);
    setLocalWalls(updatedWalls);

    lightSourceMgrRef.current.clearLights();
    updatedLights.forEach((l: any) => lightSourceMgrRef.current.addLight(l));
    setLocalLights(updatedLights);

    const preservedObjects: SceneInteractiveObject[] = updatedObjects.map((obj: any) => ({
      ...obj,
      id: obj.id,
      name: obj.name || obj.label || 'Terrain Feature',
      type: (obj.type || 'prop') as any,
      x: obj.x ?? 100,
      y: obj.y ?? 100,
      storyElementId: obj.storyElementId || obj.id
    }));
    interactiveObjMgrRef.current.loadObjects(preservedObjects);
    setLocalObjects(preservedObjects);

    AudioService.playCriticalChime(true);
    setCombatLog(prev => [
      `[PCG DEPLOY] Deployed sector (${terrains.length} terrains, ${normalizedWalls.length} walls, ${normalizedLights.length} lights, ${objects.length} scatters).`,
      ...prev.slice(0, 8)
    ]);
  };

  const handleApplyStageDecorations = (entities: any[] = [], atmosphere: any = null, lights: any[] = [], doors: any[] = []) => {
    if (!currentMap) return;
    recordHistory('Spatial Decorator');
    const gridSize = Number(currentMap.gridSize || 50) || 50;
    const baseObjects = Array.isArray(currentMap.objects) ? currentMap.objects : localObjects;
    const baseWalls = Array.isArray(currentMap.walls) ? currentMap.walls : localWalls;
    const baseLights = Array.isArray(currentMap.lights) ? currentMap.lights : localLights;

    const newObjects = (entities || []).map((e: any) => ({
      id: e.id || `entity-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: e.unit_name || e.name || 'Decorated Prop',
      label: e.unit_name || e.name || 'Decorated Prop',
      unit_id: e.unit_id,
      x: (e.col || 0) * gridSize,
      y: (e.row || 0) * gridSize,
      width: (e.width || 1) * gridSize,
      height: (e.height || 1) * gridSize,
      category: e.category || 'Decor',
      type: e.category === 'token' ? 'npc' : 'prop',
      isHazard: Boolean(e.isHazard),
      hazardDamage: e.hazardDamage,
      isCover: Boolean(e.isCover),
      coverRating: e.coverRating,
      isDecal: Boolean(e.isDecal),
      decalType: e.decalType
    }));

    const newDoorObjects: any[] = [];
    const newWalls: any[] = [];
    (doors || []).forEach((d: any) => {
      const isBarricaded = Boolean(d.isBarricaded);
      const doorName = isBarricaded
        ? 'Barricaded Blast Door'
        : (d.doorType === 'airlock' ? 'Airlock Blast Door' : 'Security Bulkhead');
      newDoorObjects.push({
        id: `portal-${Date.now()}-${d.col}-${d.row}`,
        name: doorName,
        label: isBarricaded ? 'Barricaded Door' : (d.doorType === 'airlock' ? 'Airlock' : 'Door'),
        x: (d.col || 0) * gridSize + gridSize / 2,
        y: (d.row || 0) * gridSize + gridSize / 2,
        width: gridSize,
        height: gridSize,
        category: 'door',
        type: 'portal',
        color: isBarricaded ? '#ef4444' : (d.doorType === 'airlock' ? '#38bdf8' : '#f59e0b'),
        isOpen: false,
        isLocked: isBarricaded || Boolean(d.isLocked),
        isBarricaded
      });
      newWalls.push(
        createWallSegment(
          { x: (d.col || 0) * gridSize, y: (d.row || 0) * gridSize + gridSize / 2 },
          { x: ((d.col || 0) + 1) * gridSize, y: (d.row || 0) * gridSize + gridSize / 2 },
          WALL_TYPES.DOOR,
          {
            id: `wall-door-${Date.now()}-${d.col}-${d.row}`,
            label: doorName,
            doorState: isBarricaded ? DOOR_STATES.LOCKED : DOOR_STATES.CLOSED,
            breachHp: isBarricaded ? 80 : 40,
            athleticsDc: isBarricaded ? 22 : 16,
            hackDc: isBarricaded ? 18 : 14,
            color: isBarricaded ? '#ef4444' : (d.doorType === 'airlock' ? '#38bdf8' : '#f59e0b')
          }
        )
      );
    });

    const newLights: SceneLightSource[] = (lights || []).map((lt: any) => ({
      id: lt.id || `light-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: lt.animation === 'flicker' ? 'Flickering Luminary' : lt.animation === 'pulse' ? 'Warning Beacon' : 'Tactical Luminary',
      x: (lt.col || 0) * gridSize + gridSize / 2,
      y: (lt.row || 0) * gridSize + gridSize / 2,
      radius: (lt.radius || 3.5) * gridSize,
      color: lt.color || '#f59e0b',
      intensity: lt.intensity ?? 0.85,
      falloff: 'smooth',
      castShadows: true,
      animation: lt.animation === 'steady' ? 'none' : (lt.animation || 'none')
    }));

    const updatedWalls = [...baseWalls, ...newWalls];
    const updatedLights = [...baseLights, ...newLights];
    const mergedRawObjects = [...baseObjects, ...newObjects, ...newDoorObjects];
    const preservedObjects: SceneInteractiveObject[] = mergedRawObjects.map((obj: any) => ({
      ...obj,
      id: obj.id,
      name: obj.name || obj.label || 'Decorated Prop',
      type: (obj.type || 'prop') as any,
      x: obj.x ?? 100,
      y: obj.y ?? 100,
      storyElementId: obj.storyElementId || obj.id
    }));

    const updatePayload: Record<string, any> = {
      objects: preservedObjects,
      walls: updatedWalls,
      lights: updatedLights
    };
    if (atmosphere?.ambient_color) {
      updatePayload.ambientLight = atmosphere.ambient_color;
      updatePayload.ambientLightColor = atmosphere.ambient_color;
    }
    if (atmosphere?.weather) {
      updatePayload.weatherFx = atmosphere.weather;
      updatePayload.atmosphericWeather = atmosphere.weather;
      updatePayload.atmosphericPresetId = atmosphere.weather;
    }
    if (atmosphere?.ambient_color || atmosphere?.weather) {
      updatePayload.lighting = {
        ...(currentMap.lighting || {}),
        ...(atmosphere?.ambient_color ? { tint: atmosphere.ambient_color, ambientColor: atmosphere.ambient_color } : {}),
        ...(atmosphere?.weather ? { presetId: atmosphere.weather } : {})
      };
    }

    if (updateMap) {
      updateMap(currentMap.id, updatePayload);
    }

    bvhBuilderRef.current.build(expandWallsForGeometry(updatedWalls) as any);
    setLocalWalls(updatedWalls);
    lightSourceMgrRef.current.clearLights();
    updatedLights.forEach((l: any) => lightSourceMgrRef.current.addLight(l));
    setLocalLights(updatedLights);
    interactiveObjMgrRef.current.loadObjects(preservedObjects);
    setLocalObjects(preservedObjects);

    AudioService.playCriticalChime(true);
    setCombatLog(prev => [
      `[SPATIAL DECORATOR] Injected ${newObjects.length} entities, ${newLights.length} lights, and ${newDoorObjects.length} doors.`,
      ...prev.slice(0, 8)
    ]);
  };

  // Commit UVTT Import
  const handleImportCompleteUvtt = (importedMap: any) => {
    recordHistory();
    if (importedMap) {
      const mapId = uuidv4();
      const formattedMap = {
        ...importedMap,
        id: mapId
      };
      if (addMap) addMap(formattedMap);
      handleSelectMap(mapId);
      AudioService.playCriticalChime(true);
      setCombatLog(prev => [
        `[UVTT IMPORT] Ingested battlemap "${formattedMap.title || 'UVTT Battlemap'}" (${(formattedMap.walls || []).length} walls).`,
        ...prev.slice(0, 8)
      ]);
    }
  };

  // Summon Hero Token from Folio
  const handleSummonHeroToken = (heroPayload: any) => {
    recordHistory();
    const spawnX = Math.round(mouseWorldPosRef.current.x || 200);
    const spawnY = Math.round(mouseWorldPosRef.current.y || 200);
    const newTokId = heroPayload.heroId || `hero-${Date.now()}`;

    const newTok: StaticEntity = {
      id: newTokId,
      name: heroPayload.name || 'Hero Operator',
      base_hp: heroPayload.maxHealth || 35,
      tech_level: 3,
      armor_dr: heroPayload.toughness || 10,
      size_modifier: 0,
      speed_ft: 35,
      species: 'Human',
      archetype: 'Operator',
      is_persona: true
    };

    useEngineStore.getState().loadStaticEntitiesBatch([newTok]);
    useEngineStore.getState().updatePosition(newTokId, spawnX, spawnY);

    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        tokens: [...(currentMap.tokens || []), { ...newTok, x: spawnX, y: spawnY }]
      });
    }

    AudioService.playCriticalChime(true);
    setCombatLog(prev => [`[FOLIO HERO] Summoned ${newTok.name} at (${spawnX}, ${spawnY}).`, ...prev.slice(0, 8)]);
  };

  // Summon Omnicortex Asset
  const handleSummonOmnicortexAsset = (assetData: any) => {
    recordHistory();
    const spawnX = Math.round(mouseWorldPosRef.current.x || 250);
    const spawnY = Math.round(mouseWorldPosRef.current.y || 250);

    if (assetData._categoryKey === 'bestiary' || assetData.hp || assetData.dr) {
      const newTokId = `codex-${assetData.id || Date.now()}`;
      const newTok: StaticEntity = {
        id: newTokId,
        name: assetData._resolvedName || assetData.name || 'Codex Unit',
        base_hp: assetData.hp || 30,
        tech_level: assetData.techLevel || 3,
        armor_dr: assetData.dr || 8,
        size_modifier: assetData.sizeModifier || 0,
        speed_ft: assetData.speed || 30,
        species: assetData.species || 'Creature / Adversary',
        archetype: assetData.archetype || 'Adversary',
        is_persona: false
      };
      useEngineStore.getState().loadStaticEntitiesBatch([newTok]);
      useEngineStore.getState().updatePosition(newTokId, spawnX, spawnY);

      if (currentMap && updateMap) {
        updateMap(currentMap.id, {
          tokens: [...(currentMap.tokens || []), { ...newTok, x: spawnX, y: spawnY }]
        });
      }
    } else {
      const newObjId = `item-${assetData.id || Date.now()}`;
      const newObj: SceneInteractiveObject = {
        id: newObjId,
        name: assetData._resolvedName || assetData.name || 'Item Cache',
        type: 'loot_container',
        x: spawnX,
        y: spawnY,
        storyElementId: assetData.id
      };
      const updatedObjects = [...localObjects, newObj];
      setLocalObjects(updatedObjects);
      interactiveObjMgrRef.current.loadObjects(updatedObjects);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { objects: updatedObjects });
      }
    }

    AudioService.playCriticalChime(true);
    setCombatLog(prev => [`[OMNICORTEX] Deployed ${assetData._resolvedName || assetData.name} at (${spawnX}, ${spawnY}).`, ...prev.slice(0, 8)]);
  };

  // Layers panel callbacks
  const toggleLayerVisibility = (layerId: string) => {
    if (!currentMap || !updateMap) return;
    const layers = currentMap.layers || DEFAULT_LAYERS;
    const updated = layers.map((l: any) => l.id === layerId ? { ...l, visible: !l.visible } : l);
    updateMap(currentMap.id, { layers: updated });
  };

  const toggleLayerLock = (layerId: string) => {
    if (!currentMap || !updateMap) return;
    const layers = currentMap.layers || DEFAULT_LAYERS;
    const updated = layers.map((l: any) => l.id === layerId ? { ...l, locked: !l.locked } : l);
    updateMap(currentMap.id, { layers: updated });
  };

  // Proximity detection for Contextual Token Radial Menu
  const downedAllyNearby = useMemo(() => {
    if (!selectedToken) return null;
    return tokens.find(t =>
      t.id !== selectedToken.id &&
      t.current_hp <= 0 &&
      !t.active_conditions?.includes('status_dead') &&
      Math.hypot(t.x - selectedToken.x, t.y - selectedToken.y) <= 120
    ) || null;
  }, [selectedToken, tokens]);

  const nearbyInteractiveObj = useMemo(() => {
    if (!selectedToken) return null;
    return interactiveObjMgrRef.current.getAllObjects().find(o =>
      Math.hypot(o.x - selectedToken.x, o.y - selectedToken.y) <= 120
    ) || null;
  }, [selectedToken]);

  const nearbyVehicle = useMemo(() => {
    if (!selectedToken) return null;
    const allVehicles = selectAllVehicles(useEngineStore.getState());
    return allVehicles.find(v => {
      const vCenterX = v.col * 50 + (v.gridFootprint[0] * 50) / 2;
      const vCenterY = v.row * 50 + (v.gridFootprint[1] * 50) / 2;
      return Math.hypot(vCenterX - selectedToken.x, vCenterY - selectedToken.y) <= 120;
    }) || null;
  }, [selectedToken]);

  const isPointBlankTarget = useMemo(() => {
    if (!selectedToken || !targetToken) return false;
    const distPx = Math.hypot(targetToken.x - selectedToken.x, targetToken.y - selectedToken.y);
    return (distPx / 70) * 5 <= 5;
  }, [selectedToken, targetToken]);

  const nearbyArmedTrap = useMemo(() => {
    if (!selectedToken) return null;
    const allObjs = localObjects.length > 0 ? localObjects : interactiveObjMgrRef.current.getAllObjects();
    return (
      allObjs.find((o: any) => {
        const isTrapObj =
          Boolean(o?.isTrap) ||
          o?.type === 'hazard' ||
          o?.category === 'hazard' ||
          Boolean((TRAP_TYPES as Record<string, any>)[o?.trapType || o?.type]);
        if (!isTrapObj) return false;
        if (o?.trapState === 'disarmed') return false;
        if (o?.trapState === 'triggered' && !o?.isRepeating) return false;
        const cx = (o.x || 0) + (o.width ? o.width / 2 : 0);
        const cy = (o.y || 0) + (o.height ? o.height / 2 : 0);
        return Math.hypot(cx - selectedToken.x, cy - selectedToken.y) <= 120;
      }) || null
    );
  }, [selectedToken, localObjects]);

  const handleDisarmTrap = useCallback(
    (trapObj: any) => {
      if (!trapObj) return null;
      const intStat = Number((selectedToken as any)?.attributes?.int ?? (selectedToken as any)?.intellect ?? 0);
      const operativeBonus = Number.isFinite(intStat) && intStat !== 0 ? 2 + intStat * 2 : 4;
      const res = disarmTrap(trapObj, operativeBonus);
      const actorName = selectedToken?.name || (selectedToken as any)?.label || 'Operator';
      const trapLabel = trapObj.label || trapObj.name || 'Armed Hazard';

      if (res.success) {
        recordHistory(`Disarm Trap: ${trapLabel}`);
        const baseObjects = localObjects.length > 0 ? localObjects : (currentMap?.objects || []);
        const nextObjects = baseObjects.map((o: any) =>
          o?.id === trapObj.id ? { ...o, trapState: 'disarmed', isTriggered: true } : o
        );
        setLocalObjects(nextObjects);
        interactiveObjMgrRef.current.loadObjects(nextObjects);
        if (currentMap?.id && updateMap) {
          updateMap(currentMap.id, { objects: nextObjects });
        }
        AudioService.playCriticalChime(true);
      }

      const card = {
        id: `trap_disarm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        sender: actorName,
        visibility: 'public' as const,
        kind: 'system' as const,
        title: res.success ? `Trap Disarmed: ${trapLabel}` : `Disarm Failed: ${trapLabel}`,
        body: res.message
      };
      VttEventBus.emit('stage-chat-card', card);
      getVttMultiplayerSync().broadcastChatCard(card);
      setCombatLog((prev) => [res.message, ...prev.slice(0, 8)]);
      return res;
    },
    [selectedToken, localObjects, currentMap, updateMap, recordHistory, setLocalObjects, setCombatLog]
  );

  // Handle Action Selected from Token Radial Menu
  const handleRadialSelectAction = (actionId: string) => {
    if (!selectedToken) return;

    if (actionId === 'strike') {
      handleExecuteCombatStrike();
    } else if (actionId === 'move') {
      setIsMoveModeActive(prev => !prev);
    } else if (actionId === 'stance') {
      const stances: Array<'normal' | 'guard' | 'overcharge' | 'aim'> = ['normal', 'guard', 'aim', 'overcharge'];
      const nextIdx = (stances.indexOf(activeStance) + 1) % stances.length;
      const nextStance = stances[nextIdx] ?? 'normal';
      setActiveStance(nextStance);
      setCombatLog(prev => [
        `[STANCE] ${selectedToken.name} shifted stance to ${nextStance.toUpperCase()}.`,
        ...prev.slice(0, 8)
      ]);
    } else if (actionId === 'stabilize') {
      if (downedAllyNearby) {
        const d1 = Math.floor(Math.random() * 10) + 1;
        const d2 = Math.floor(Math.random() * 10) + 1;
        const medRoll = d1 + d2 + 4;
        if (medRoll >= 15) {
          useEngineStore.getState().stabilizeEntity(downedAllyNearby.id);
          const stabEph = useEngineStore.getState().ephemeralData[downedAllyNearby.id];
          if (stabEph) {
            getVttMultiplayerSync().broadcastTokenVitals(downedAllyNearby.id, stabEph);
          }
          AudioService.playCriticalChime(true);
          setCombatLog(prev => [
            `[FIRST AID SUCCESS] ${selectedToken.name} stabilized ${downedAllyNearby.name} (Roll: ${d1}+${d2}+4 = ${medRoll} vs CR 15). Bleeding out halted!`,
            ...prev.slice(0, 8)
          ]);
        } else {
          setCombatLog(prev => [
            `[FIRST AID FAILED] ${selectedToken.name} attempted to stabilize ${downedAllyNearby.name} (Roll: ${medRoll} vs CR 15).`,
            ...prev.slice(0, 8)
          ]);
        }
      }
    } else if (actionId === 'interact') {
      if (nearbyInteractiveObj) {
        handleToggleBulkhead(nearbyInteractiveObj.id);
      }
    } else if (actionId === 'disarm_trap') {
      if (nearbyArmedTrap) {
        handleDisarmTrap(nearbyArmedTrap);
      }
    } else if (actionId === 'vehicle_dismount') {
      if (selectedToken?.parent_vehicle_id) {
        useEngineStore.getState().dismountPassenger(selectedToken.parent_vehicle_id, selectedToken.id);
        setCombatLog(prev => [
          `[VEHICLE] ${selectedToken.name} dismounted from vehicle.`,
          ...prev.slice(0, 8)
        ]);
      }
    } else if (actionId === 'vehicle_board') {
      if (nearbyVehicle) {
        const availableNode = nearbyVehicle.passengerNodes.find(n => !n.seatedTokenId);
        if (availableNode) {
          useEngineStore.getState().mountPassenger(nearbyVehicle.id, availableNode.id, selectedToken.id, 50);
          setCombatLog(prev => [
            `[VEHICLE] ${selectedToken.name} boarded ${nearbyVehicle.name} (${availableNode.role.toUpperCase()}).`,
            ...prev.slice(0, 8)
          ]);
        }
      }
    } else if (actionId === 'folio') {
      setActiveTab('spawner');
    }
  };

  return {
    handleBatchDelete,
    handleBatchDuplicate,
    handleBatchNudge,
    handleDeselectAll,
    deployArchitectItem,
    handleToggleDesignMode,
    handleObjectClick,
    persistInteractiveState,
    handleToggleBulkhead,
    handleSpawnHazard,
    handleClearHazards,
    handleToggleMultiplayerSim,
    handleDropTacticalPing,
    handleCommitLandmass,
    handleApplyStageDecorations,
    handleImportCompleteUvtt,
    handleSummonHeroToken,
    handleSummonOmnicortexAsset,
    toggleLayerVisibility,
    toggleLayerLock,
    downedAllyNearby,
    nearbyInteractiveObj,
    nearbyArmedTrap,
    nearbyVehicle,
    isPointBlankTarget,
    handleDisarmTrap,
    handleRadialSelectAction
  };
};
