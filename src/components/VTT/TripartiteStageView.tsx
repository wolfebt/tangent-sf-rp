/**
 * @file TripartiteStageView.tsx
 * @description ADE STAGE — Architect Design Engine & Tabletop Stage Master Viewport.
 * Unifies the Tactical VTT and Cartographic Map Maker into a single live-action environment.
 * Houses:
 * - Left Navigation Rail: Operative Cockpit (Vitals, AP Budget, Locomotion Stances, BASTION Strikes)
 *   with integrated Module Catalog & Compendium tab.
 * - Center Zone: WebGPU Stage Viewport (Infinite Frustum, BVH Raycast LoS, Dynamic Lighting, Tokens).
 * - Right Navigation Rail: Architect Console (Wall Builder, Biomes, Object Stamps, Dynamic Lights, Compositor Layers).
 */

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Crosshair, 
  FolderTree, 
  Hammer,
  BookOpen,
  Sliders
} from 'lucide-react';
import { TripartiteLayout } from './TripartiteLayout';
import { StageBreadcrumbTabs } from './stage/StageBreadcrumbTabs';
import { StageViewportWrapper } from './stage/StageViewportWrapper';
import { ModuleCatalogPanel } from './catalog/ModuleCatalogPanel';
import { ADEScenarioStageDrawer } from './stage/ADEScenarioStageDrawer';
import VttModuleIngestionModal from './VttModuleIngestionModal';
import { StageSettingsModal } from './stage/StageSettingsModal';
import { OperativeCockpitRail } from '../../pages/Foundry/MapMaker/map/OperativeCockpitRail';
import { ArchitectConsoleRail } from '../../pages/Foundry/MapMaker/map/ArchitectConsoleRail';
import { DEFAULT_LAYERS } from '../../pages/Foundry/MapMaker/map/MapConstants';
import { adeElementToStageToken, adeElementToInteractiveObject } from '../../utils/storyAssetAdapter';
import { getStarterMapsCollection } from './stage/defaultMaps';

const OperativeCockpit = OperativeCockpitRail as unknown as React.ComponentType<any>;
const ArchitectConsole = ArchitectConsoleRail as unknown as React.ComponentType<any>;
import type { StageViewProps } from './StageView';
import { useCampaign } from '../../context/CampaignContext';
import { useAuth } from '../../context/AuthContext';
import { useFolio } from '../../context/FolioContext';
import { useBastion } from '../../context/BastionContext';
import { useEngineStore, selectAllFusedTokens, type StaticEntity } from '../../engine/state/VolatileSharder.ts';
import { useUILayoutStore, type UserVttRole } from './store/uiLayoutStore';
import { AudioService } from '../../services/audioService';
import { VttEventBus } from '../../utils/vttEventBus';
import { getVttMultiplayerSync } from '../../services/vttMultiplayerSyncService';
import { StageAudioMixerDrawer } from './stage/StageAudioMixerDrawer';
import { HandoutBroadcastOverlay } from './stage/HandoutBroadcastOverlay';
import { StageChatRollFeed, sanitizeCardForRole } from './stage/StageChatRollFeed';
import { StageTurnTrackerDrawer } from './stage/StageTurnTrackerDrawer';
import SyncConflictModal from '../StoryFoundry/SyncConflictModal';
import CommandPaletteModal from '../../pages/Foundry/StoryModule/CommandPaletteModal';
import { QuickJSSandbox } from '../../engine/scripting/QuickJSSandbox';
import { dispatchStageMacroActions } from '../../services/stageMacroDispatcher';
import { useAdeStore } from '../../pages/Foundry/store/adeStore';

const LazyAIMEChatBox = React.lazy(() =>
  import('../../pages/Foundry/AIME/AIMEChatBox').then((m) => ({
    default: (m.default || m) as React.ComponentType<any>
  }))
);
const LazyTacticalPlayModal = React.lazy(() =>
  import('../Folio/modals/TacticalPlayModal').then((m) => ({
    default: ((m as any).TacticalPlayModal || m.default) as React.ComponentType<any>
  }))
);
import { MobileTacticalBlocker } from '../StoryFoundry/MobileTacticalBlocker';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useWaypointEngine } from '../../pages/Foundry/hooks/useWaypointEngine';
import { compileStage } from '../../pages/Foundry/Stage/vttModuleCompilerService';
import { useStageStore } from '../../pages/Foundry/Stage/stageStore';
import { useStageTriggerEngine } from './stage/useStageTriggerEngine';

export interface TripartiteStageViewProps extends StageViewProps {
  defaultRole?: UserVttRole;
  onSwitchToWeaver?: () => void;
  mapId?: string;
  scenarioId?: string;
  compiledStage?: any;
  disableInternalWaypointEngine?: boolean;
}

export const TripartiteStageView: React.FC<TripartiteStageViewProps> = ({
  defaultRole,
  ...props
}) => {
  const isMobile = useIsMobile();

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenarioIdParam = props.scenarioId || searchParams.get('scenarioId') || undefined;
  const mapIdParam = props.mapId || searchParams.get('mapId') || undefined;
  const stageIdParam = (props as any).stageId || searchParams.get('stageId') || undefined;
  const normalizedPath = (location.pathname || '').replace(/\/+$/, '');
  const isFoundryRoute = normalizedPath.startsWith('/foundry');

  const isCommandPaletteOpen = useAdeStore((s) => Boolean(s.modals?.commandPalette));
  const setAdeModal = useAdeStore((s) => s.setModal);
  const setAdeView = useAdeStore((s) => s.setActiveView);
  const setStoryTab = useAdeStore((s) => s.setStoryWorkspaceTab);
  const setStageTab = useAdeStore((s) => s.setStageWorkspaceTab);


  // Layout & Tool Reactive State
  const {
    userRole,
    setUserRole,
    isLeftCollapsed,
    isRightCollapsed,
    toggleLeftCollapse,
    setLeftCollapsed,
    toggleRightCollapse,
    setRightCollapsed,
    activeLeftTab,
    setActiveLeftTab,
    selectedTokenId,
    setSelectedTokenId,
    targetTokenId,
    setTargetTokenId,
    activeArchitectTool,
    setActiveArchitectTool,
    selectedTerrain,
    setSelectedTerrain,
    terrainBrushWidth,
    setTerrainBrushWidth,
    selectedWallType,
    setSelectedWallType,
    doorLockDc,
    setDoorLockDc,
    selectedLightColor,
    setSelectedLightColor,
    selectedLightRadius,
    setSelectedLightRadius,
    selectedLightAnimation,
    setSelectedLightAnimation,
    pencilColor,
    setPencilColor,
    pencilWidth,
    setPencilWidth,
    textLabelInput,
    setTextLabelInput,
    textColor,
    setTextColor,
    textSize,
    setTextSize,
    rulerSelectedPace,
    setRulerSelectedPace,
    measurementUnit,
    setMeasurementUnit,
    tokenType,
    setTokenType,
    selectedObjectType,
    setSelectedObjectType,
    activeSensorMode,
    setActiveSensorMode,
    unreadChatCardCount,
    pushStageChatCard,
    resetUnreadChatCards,
    roundNumber,
    isTurnTrackerOpen,
    setTurnTrackerOpen,
    toggleTurnTracker,
    tokenLabelInput,
    setTokenLabelInput,
    selectedRegionType,
    setSelectedRegionType
  } = useUILayoutStore();

  const [fogEnabled, setFogEnabled] = useState(false);
  const [newLayerNameInput, setNewLayerNameInput] = useState('');
  const [isModuleIngestionOpen, setIsModuleIngestionOpen] = useState(false);
  const [isStageSettingsOpen, setIsStageSettingsOpen] = useState(false);
  const [isStageAimeOpen, setIsStageAimeOpen] = useState(false);
  const [isAudioMixerOpen, setIsAudioMixerOpen] = useState(false);
  const [isHandoutPushOpen, setIsHandoutPushOpen] = useState(false);
  const [isRollFeedOpen, setIsRollFeedOpen] = useState(false);
  const [isMacroQuickRunOpen, setIsMacroQuickRunOpen] = useState(false);
  const [macroRunStatus, setMacroRunStatus] = useState<string | null>(null);
  const macroSandboxRef = useRef(new QuickJSSandbox());
  const [selectedChunk, setSelectedChunk] = useState<any>(null);
  const [chunkRotationDeg, setChunkRotationDeg] = useState<number>(0);
  const [chunkFlipX, setChunkFlipX] = useState<boolean>(false);
  const [chunkFlipY, setChunkFlipY] = useState<boolean>(false);
  const [chunkSettings, setChunkSettings] = useState<any>({});
  const [chunkSlotOverrides, setChunkSlotOverrides] = useState<any>({});
  const [magneticSnapEnabled, setMagneticSnapEnabled] = useState<boolean>(true);
  const [tacticalPlayCharacter, setTacticalPlayCharacter] = useState<any | null>(null);
  const [activeStageTab, setActiveStageTab] = useState<'map' | 'tree' | 'architect'>('map');
  const hasBootstrappedStartersRef = useRef(false);

  const { currentUser, isAdmin, isGM } = (useAuth() as any) || {};
  const {
    universeState,
    allMaps,
    activeMapId,
    setActiveMapId,
    updateMap,
    addMap,
    activeScenarioId: contextActiveScenarioId,
    setActiveScenarioId,
    getActiveGemsText,
    elementsCatalog,
    cronicle,
    applyCronicleDelta,
    syncConflict,
    resolveConflictOverwrite,
    resolveConflictPull,
    resolveConflictCancel
  } = useCampaign() as any;

  const queryRole = searchParams.get('role')?.toLowerCase();
  const isRemoteNonGm = Boolean(
    universeState?.ownerId &&
      universeState.ownerId !== 'local' &&
      currentUser?.uid &&
      universeState.ownerId !== currentUser.uid &&
      !isAdmin &&
      !isGM &&
      !(Array.isArray(universeState?.gmIds) && universeState.gmIds.includes(currentUser.uid))
  );
  const isRoleLockedOperative =
    queryRole === 'operative' ||
    queryRole === 'player' ||
    queryRole === 'spectator' ||
    defaultRole === 'operative' ||
    defaultRole === 'player' ||
    defaultRole === 'spectator' ||
    isRemoteNonGm;

  const effectiveRole: UserVttRole = isRoleLockedOperative ? 'operative' : (userRole || 'architect');
  const isArchitectRole = !isRoleLockedOperative && (effectiveRole === 'architect' || effectiveRole === 'gm');
  const isRollFeedOpenRef = useRef(isRollFeedOpen);
  isRollFeedOpenRef.current = isRollFeedOpen;
  const isArchitectRoleRef = useRef(isArchitectRole);
  isArchitectRoleRef.current = isArchitectRole;

  useEffect(() => {
    if (isRoleLockedOperative) {
      if (userRole !== 'operative') setUserRole('operative');
      setRightCollapsed(true);
      getVttMultiplayerSync().setRole('operative');
      if (activeStageTab === 'architect') setActiveStageTab('map');
      VttEventBus.emit('toggle-stage-design-mode', { active: false });
    }
  }, [isRoleLockedOperative, userRole, activeStageTab, setUserRole, setRightCollapsed]);

  useEffect(() => {
    if (!isArchitectRole && activeLeftTab === 'scenario') {
      setActiveLeftTab('cockpit');
    }
  }, [isArchitectRole, activeLeftTab, setActiveLeftTab]);

  useEffect(() => {
    if (isFoundryRoute || !isArchitectRole) return undefined;
    const handleStandaloneKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAdeModal('commandPalette', !useAdeStore.getState().modals?.commandPalette);
      }
    };
    window.addEventListener('keydown', handleStandaloneKey);
    return () => window.removeEventListener('keydown', handleStandaloneKey);
  }, [isFoundryRoute, isArchitectRole, setAdeModal]);

  const handleSelectStageTab = (tab: 'map' | 'tree' | 'architect') => {
    if (tab === 'architect' && isRoleLockedOperative) {
      setActiveStageTab('map');
      return;
    }
    setActiveStageTab(tab);
    if (tab === 'map') {
      setLeftCollapsed(true);
      setRightCollapsed(true);
      VttEventBus.emit('toggle-stage-design-mode', { active: false });
    } else if (tab === 'tree') {
      setActiveLeftTab('catalog');
      setLeftCollapsed(false);
      setRightCollapsed(true);
      VttEventBus.emit('toggle-stage-design-mode', { active: false });
    } else if (tab === 'architect') {
      setUserRole('architect');
      setRightCollapsed(false);
      setLeftCollapsed(true);
      VttEventBus.emit('toggle-stage-design-mode', { active: true });
    }
  };

  // Ensure clean, uncluttered Stage on initial mount (default to Map tab with rails closed)
  useEffect(() => {
    if (isMobile) return;
    setActiveStageTab('map');
    setLeftCollapsed(true);
    setRightCollapsed(true);
    VttEventBus.emit('toggle-stage-design-mode', { active: false });
  }, [isMobile]);

  // Check URL query parameters for ?options=true to auto-open settings
  useEffect(() => {
    if (searchParams.get('options') === 'true') {
      setIsStageSettingsOpen(true);
    }
  }, [searchParams]);

  // Listen for open-module-ingestion-modal and open-stage-options from top bar, menus, or hotkeys
  useEffect(() => {
    const offIngest = VttEventBus.on('open-module-ingestion-modal', () => {
      AudioService.playTerminalBeep(1200, 0.03);
      setIsModuleIngestionOpen(true);
    });
    const offOptions = VttEventBus.on('open-stage-options', () => {
      AudioService.playTerminalBeep(1200, 0.03);
      setIsStageSettingsOpen(true);
    });
    const offAudioMixer = VttEventBus.on('toggle-stage-audio-mixer', (payload) => {
      setIsAudioMixerOpen((prev) => (typeof payload?.open === 'boolean' ? payload.open : !prev));
    });
    const offHandoutPush = VttEventBus.on('toggle-stage-handout-push', (payload) => {
      setIsHandoutPushOpen((prev) => (typeof payload?.open === 'boolean' ? payload.open : !prev));
    });
    const offChatCard = VttEventBus.on('stage-chat-card', (card) => {
      const safeCard = sanitizeCardForRole(card, isArchitectRoleRef.current);
      if (safeCard) {
        pushStageChatCard(safeCard, !isRollFeedOpenRef.current);
      }
    });
    const offChatMsg = VttEventBus.on('chat-message', (msg) => {
      if (!msg || !msg.text) return;
      pushStageChatCard(
        {
          id: (msg as any).id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: msg.timestamp || new Date().toISOString(),
          sender: msg.sender || 'Stage',
          visibility: 'public',
          kind: msg.type === 'system' ? 'system' : 'narration',
          title: (msg as any).title || msg.sender || 'Stage Comms',
          body: msg.text
        },
        !isRollFeedOpenRef.current
      );
    });
    return () => {
      offIngest();
      offOptions();
      offAudioMixer();
      offHandoutPush();
      offChatCard();
      offChatMsg();
    };
  }, [pushStageChatCard]);

  const { personaRoster = [], roster = [] } = (useFolio() as any) || {};
  const availableMaps = (Array.isArray(allMaps) && allMaps.length > 0 ? allMaps : universeState?.maps) || [];
  const currentMap = availableMaps.find((m: any) => m.id === (mapIdParam || activeMapId)) || availableMaps[0];
  const currentMapRef = useRef<any>(currentMap);
  currentMapRef.current = currentMap;
  const updateMapRef = useRef<any>(updateMap);
  updateMapRef.current = updateMap;

  useEffect(() => {
    setFogEnabled(Boolean(currentMap?.fogEnabled));
  }, [currentMap?.id, currentMap?.fogEnabled]);
  const folioRosterRef = useRef<any[]>(personaRoster.length ? personaRoster : roster);
  folioRosterRef.current = personaRoster.length ? personaRoster : roster;
  const universeCharsRef = useRef<any[]>(universeState?.characters || []);
  universeCharsRef.current = universeState?.characters || [];

  // Auto-bootstrap starter maps collection exactly once if universe is empty
  useEffect(() => {
    if (isMobile) return;
    if (availableMaps.length > 0) {
      hasBootstrappedStartersRef.current = true;
      return;
    }
    if (availableMaps.length === 0 && addMap && !hasBootstrappedStartersRef.current) {
      hasBootstrappedStartersRef.current = true;
      const starters = getStarterMapsCollection();
      starters.forEach((m) => addMap(m));
      if (starters[0]) {
        if (setActiveMapId) setActiveMapId(starters[0].id);
      }
    }
  }, [isMobile, availableMaps.length, addMap, setActiveMapId]);

  // Listen for Stage AIME toggle, Tactical Play Modal & Bestiary vtt-spawn-entity (works in both 2D & 3D)
  useEffect(() => {
    const offAime = VttEventBus.on('toggle-stage-aime', () => {
      setIsStageAimeOpen(prev => !prev);
    });

    const offTacticalPlay = VttEventBus.on('open-tactical-play-modal', (payload) => {
      const rawToken = payload?.token || selectAllFusedTokens(useEngineStore.getState()).find((t: any) => t.is_selected) || null;
      if (!rawToken) return;
      const matchId = rawToken.character_doc_id || rawToken.source_persona_id || rawToken.id;
      const allPersonas = [...(folioRosterRef.current || []), ...(universeCharsRef.current || [])];
      const matched = allPersonas.find(
        (c: any) =>
          c &&
          ((c['character-doc-id'] && c['character-doc-id'] === matchId) ||
            (c.id && c.id === matchId))
      );
      setTacticalPlayCharacter(matched || rawToken);
    });

    const offSpawnEntity = VttEventBus.on('vtt-spawn-entity', (payload) => {
      if (!payload?.name) return;
      const map = currentMapRef.current;
      const x = typeof payload.x === 'number' ? payload.x : Math.round(((map?.width || 1200) / 2) + (Math.random() - 0.5) * 120);
      const y = typeof payload.y === 'number' ? payload.y : Math.round(((map?.height || 800) / 2) + (Math.random() - 0.5) * 120);
      const tokenId = `tok_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const maxHp = Number(payload.hp) || 30;
      const newToken: StaticEntity = {
        ...payload,
        id: tokenId,
        unit_id: payload.unit_id || tokenId,
        name: payload.name,
        base_hp: maxHp,
        base_health: maxHp,
        base_vitality: payload.vitality ?? maxHp,
        base_structure: payload.structure ?? maxHp * 2,
        is_synthetic: Boolean(payload.is_synthetic),
        tech_level: payload.tech_level ?? 3,
        armor_dr: payload.armorDr ?? payload.armor_dr ?? 4,
        defense_dc: payload.defense ?? payload.defense_dc ?? 12,
        attack_bonus: payload.attack_bonus ?? 3,
        actions_per_round: payload.actions_per_round ?? 2,
        size_modifier: payload.size_modifier ?? 0,
        speed_ft: payload.speed_ft ?? 30,
        species: payload.species || 'Entity',
        archetype: payload.archetype || 'Adversary',
        is_persona: Boolean(payload.isPersona)
      };

      const eng = useEngineStore.getState();
      eng.loadStaticEntity(newToken);
      eng.updatePosition(tokenId, x, y);
      eng.clearSelection();
      eng.setSelection(tokenId, true);
      setSelectedTokenId(tokenId);

      if (map?.id && updateMapRef.current) {
        updateMapRef.current(map.id, {
          tokens: [...(map.tokens || []), { ...newToken, x, y, ...(payload.storyElementId ? { storyElementId: payload.storyElementId } : {}) }]
        });
      }
      AudioService.playCriticalChime(true);
    });

    const offBulkhead = VttEventBus.on('stage-bulkhead-toggled', (payload) => {
      const targetWallId = payload?.wallId || payload?.bulkheadId || payload?.objectId;
      const map = currentMapRef.current;
      if (!targetWallId || !map?.id || !updateMapRef.current || !Array.isArray(map.walls)) return;
      let changed = false;
      const updatedWalls = map.walls.map((w: any) => {
        if (w?.id === targetWallId || w?.label === targetWallId) {
          changed = true;
          const nextOpen = typeof payload?.isOpen === 'boolean' ? payload.isOpen : !w.isOpen;
          return {
            ...w,
            isOpen: nextOpen,
            doorState: payload?.doorState || (nextOpen ? 'open' : 'closed')
          };
        }
        return w;
      });
      if (changed) {
        updateMapRef.current(map.id, { walls: updatedWalls });
      }
    });

    const offMandate = VttEventBus.on('mechanical-mandate-executed', (payload) => {
      const m = payload?.mandate;
      if (!m) return;
      pushStageChatCard(
        {
          id: `mandate_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          sender: m.initiatorName || 'AIME Arbitrator',
          visibility: 'public',
          kind: 'dice',
          title: `Mandate: ${m.actionName || m.systemIntent || 'Check'}`,
          body: m.narrativeBounds?.prescribedOutcome || `${m.systemIntent || 'RESOLVED'}`,
          ...(m.diceSummary ? { diceBreakdown: m.diceSummary } : {})
        },
        !isRollFeedOpenRef.current
      );
    });

    const offAoeResolved = VttEventBus.on('stage-aoe-resolved', (payload) => {
      if (!payload) return;
      pushStageChatCard(
        {
          id: `aoe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          sender: 'Stage AoE Engine',
          visibility: 'public',
          kind: 'aoe',
          title: `AoE Resolved: ${payload.label || payload.presetId || 'Blast'}`,
          body: `Affected ${payload.affectedCount ?? 0} target(s).`
        },
        !isRollFeedOpenRef.current
      );
    });

    return () => {
      offAime();
      offTacticalPlay();
      offSpawnEntity();
      offBulkhead();
      offMandate();
      offAoeResolved();
    };
  }, [setSelectedTokenId, pushStageChatCard]);

  useEffect(() => {
    if (scenarioIdParam && setActiveLeftTab) {
      setActiveLeftTab('scenario');
    }
  }, [scenarioIdParam, setActiveLeftTab]);

  useEffect(() => {
    if (mapIdParam && mapIdParam !== activeMapId && setActiveMapId) {
      setActiveMapId(mapIdParam);
    }
  }, [mapIdParam, activeMapId, setActiveMapId]);

  const handleDeployElementFromDrawer = (element: any, customPos?: { x: number; y: number }) => {
    if (!element) return;
    const pos = customPos || { x: 350 + (Math.random() - 0.5) * 60, y: 350 + (Math.random() - 0.5) * 60 };
    if (element.type === 'Persona') {
      const token = adeElementToStageToken(element, pos);
      if (token) {
        useEngineStore.getState().loadStaticEntity(token as any);
        useEngineStore.getState().updatePosition(token.id, pos.x, pos.y);
        useEngineStore.getState().clearSelection();
        useEngineStore.getState().setSelection(token.id, true);
        if (currentMap && updateMap) {
          updateMap(currentMap.id, {
            tokens: [...(currentMap.tokens || []), { ...token, x: pos.x, y: pos.y }]
          });
        }
      }
    } else {
      const obj = adeElementToInteractiveObject(element, pos);
      if (obj && currentMap && updateMap) {
        updateMap(currentMap.id, {
          objects: [...(currentMap.objects || []), obj]
        });
      }
    }
    AudioService.playCriticalChime(true);
  };

  const handleDeployAllElementsFromDrawer = (elements: any[]) => {
    elements.forEach((elem, idx) => {
      const angle = (idx / Math.max(1, elements.length)) * Math.PI * 2;
      const radius = 110;
      const x = Math.round(380 + Math.cos(angle) * radius);
      const y = Math.round(350 + Math.sin(angle) * radius);
      handleDeployElementFromDrawer(elem, { x, y });
    });
  };

  // Initialize Role if defaultRole specified (without overriding operative locks)
  useEffect(() => {
    if (!isRoleLockedOperative && defaultRole && userRole !== defaultRole) {
      setUserRole(defaultRole);
      if (defaultRole === 'architect' || defaultRole === 'gm') {
        setRightCollapsed(false);
      }
    }
  }, [isRoleLockedOperative, defaultRole, userRole, setUserRole, setRightCollapsed]);

  // Live tokens from engine store
  const tokens = useEngineStore(selectAllFusedTokens);

  // Spatial Waypoint Collision & Scenario Trigger Engine for Live VTT
  const effectiveScenarioId = scenarioIdParam || contextActiveScenarioId;
  const flatScenarios = useMemo(() => {
    const list: any[] = [];
    const traverse = (nodes: any[]) => {
      (nodes || []).forEach((n) => {
        list.push(n);
        if (n.children?.length) traverse(n.children);
      });
    };
    traverse(universeState?.scenarios || []);
    return list;
  }, [universeState?.scenarios]);

  const activeScenario = useMemo(() => {
    return flatScenarios.find((s) => s.id === effectiveScenarioId) || flatScenarios[0] || null;
  }, [flatScenarios, effectiveScenarioId]);

  const { registerSurfaceContext, unregisterSurfaceContext } = (useBastion() as any) || {};
  useEffect(() => {
    if (typeof registerSurfaceContext !== 'function') return undefined;
    registerSurfaceContext('vtt-stage', {
      surfaceType: 'vtt',
      role: effectiveRole,
      mapId: currentMap?.id || null,
      mapTitle: currentMap?.title || '',
      scenarioId: activeScenario?.id || null,
      scenarioTitle: activeScenario?.title || ''
    });
    return () => unregisterSurfaceContext?.('vtt-stage');
  }, [
    registerSurfaceContext,
    unregisterSurfaceContext,
    effectiveRole,
    currentMap?.id,
    currentMap?.title,
    activeScenario?.id,
    activeScenario?.title
  ]);

  const effectiveCompiledStage = useMemo(() => {
    if (props.compiledStage) return props.compiledStage;
    if (!stageIdParam) return null;
    const stageState = useStageStore.getState();
    const storyStages = Array.isArray(universeState?.stages) ? universeState.stages : [];
    const scopedBucket = stageState?.manifestsByStory?.[universeState?.id || 'default'] || [];
    const matchedManifest =
      storyStages.find((s: any) => s?.id === stageIdParam) ||
      scopedBucket.find((s: any) => s?.id === stageIdParam) ||
      (stageState?.stageManifest?.id === stageIdParam ? stageState.stageManifest : null);
    if (!matchedManifest) return null;
    const boundMap = availableMaps.find((m: any) => m.id === matchedManifest.mapId) || currentMap || null;
    const boundScenario = flatScenarios.find((s: any) => s.id === matchedManifest.storyId) || activeScenario || null;
    try {
      return compileStage({
        manifest: matchedManifest,
        mapAsset: boundMap,
        storyAsset: boundScenario,
        elementsCatalog: elementsCatalog || [],
        universeState
      });
    } catch {
      return null;
    }
  }, [props.compiledStage, stageIdParam, universeState, availableMaps, currentMap, flatScenarios, activeScenario, elementsCatalog]);

  // Seed adeStore storyFlags from compiledStage.variables
  useEffect(() => {
    const vars = effectiveCompiledStage?.variables;
    if (!vars || typeof vars !== 'object') return;
    const adeState = useAdeStore.getState();
    for (const [key, val] of Object.entries(vars)) {
      if (key && val !== undefined) {
        adeState.setStoryFlag?.(key, val as any);
      }
    }
  }, [effectiveCompiledStage?.stageId, effectiveCompiledStage?.variables]);

  const effectiveMapForWaypoints = useMemo(() => {
    if (effectiveCompiledStage?.map && (!currentMap || effectiveCompiledStage.map.id === currentMap.id)) {
      return {
        ...currentMap,
        ...effectiveCompiledStage.map,
        waypoints: effectiveCompiledStage.map.waypoints || currentMap?.waypoints || []
      };
    }
    return currentMap;
  }, [currentMap, effectiveCompiledStage]);

  const openFloatingAimeWithStagePrompt = React.useCallback((promptText: string) => {
    if (promptText && typeof promptText === 'string' && promptText.trim()) {
      useAdeStore.getState().setPendingAimePrefillPrompt?.(promptText);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aime-prefill-prompt', { detail: { prompt: promptText } }));
      }
    }
    setIsStageAimeOpen(true);
  }, []);

  const {
    pendingTriggerPrompt,
    confirmPendingTrigger,
    dismissPendingTrigger
  } = useStageTriggerEngine({
    compiledStage: effectiveCompiledStage,
    liveTokens: tokens as any,
    currentMap,
    updateMap,
    setActiveMapId,
    applyCronicleDelta,
    openFloatingAimeWithPrompt: openFloatingAimeWithStagePrompt,
    enabled: Boolean(effectiveCompiledStage)
  });

  const {
    waypointPromptData,
    setWaypointPromptData,
    handleConfirmWaypointBeat
  }: any = useWaypointEngine({
    activeMap: props.disableInternalWaypointEngine ? null : effectiveMapForWaypoints,
    updateMap,
    activeScenario,
    flatScenarios,
    setActiveScenarioId,
    storyContext: {
      universeState,
      activeScenario,
      linkedMap: currentMap,
      cronicle
    },
    applyCronicleDelta,
    openFloatingAimeWithPrompt: openFloatingAimeWithStagePrompt,
    studioMode: 'live_session',
    liveTokens: tokens as any,
    enableProximityInDev: !props.disableInternalWaypointEngine
  } as any);

  const targetToken = useMemo(() => {
    return tokens.find((t) => t.id === targetTokenId) || null;
  }, [tokens, targetTokenId]);

  if (isMobile) {
    return <MobileTacticalBlocker operation="vtt" onBack={props.onSwitchToWeaver} />;
  }

  // Handle layer toggles
  const handleToggleLayerVisibility = (layerId: string) => {
    if (!currentMap || !updateMap) return;
    const existing = currentMap.layers || DEFAULT_LAYERS;
    const updated = existing.map((l: any) =>
      l.id === layerId ? { ...l, visible: !l.visible } : l
    );
    updateMap(currentMap.id, { layers: updated });
    AudioService.playTerminalBeep(1050, 0.02);
  };

  const handleToggleLayerLock = (layerId: string) => {
    if (!currentMap || !updateMap) return;
    const existing = currentMap.layers || DEFAULT_LAYERS;
    const updated = existing.map((l: any) =>
      l.id === layerId ? { ...l, locked: !l.locked } : l
    );
    updateMap(currentMap.id, { layers: updated });
    AudioService.playTerminalBeep(950, 0.02);
  };

  // Left Panel: Dual Mode (Tactical Cockpit vs Module Catalog)
  const renderLeftPanel = () => (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#0c1017]">
      {/* Tab Switcher Header */}
      <div className="h-9 shrink-0 flex items-center border-b border-slate-800/80 bg-[#090d14] px-1.5 gap-1 z-10 select-none">
        <button
          type="button"
          onClick={() => {
            setActiveLeftTab('cockpit');
            AudioService.playTerminalBeep(1100, 0.02);
          }}
          className={`flex-1 h-7 rounded text-[10px] font-mono font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeLeftTab === 'cockpit'
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
          }`}
          title="Tactical Operator Cockpit (Token Vitals, AP, Strikes)"
        >
          <Crosshair size={12} className={activeLeftTab === 'cockpit' ? 'text-cyan-400' : 'text-slate-500'} />
          <span>COCKPIT</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveLeftTab('catalog');
            AudioService.playTerminalBeep(900, 0.02);
          }}
          className={`flex-1 h-7 rounded text-[10px] font-mono font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeLeftTab === 'catalog'
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
          }`}
          title="Module Catalog & Campaign Outliner (Scenes, Armory, Bestiary)"
        >
          <FolderTree size={12} className={activeLeftTab === 'catalog' ? 'text-amber-400' : 'text-slate-500'} />
          <span>CATALOG</span>
        </button>

        {isArchitectRole && (
          <button
            type="button"
            onClick={() => {
              setActiveLeftTab('scenario');
              AudioService.playTerminalBeep(1250, 0.02);
            }}
            className={`flex-1 h-7 rounded text-[10px] font-mono font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              activeLeftTab === 'scenario'
                ? 'bg-purple-950/60 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
            }`}
            title="ADE Story & Scenario Stage Drawer (Live Beats & Element Deployer)"
          >
            <BookOpen size={12} className={activeLeftTab === 'scenario' ? 'text-purple-400' : 'text-slate-500'} />
            <span>SCENARIO</span>
          </button>
        )}
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeLeftTab === 'cockpit' && (
          <div className="w-full h-full overflow-hidden">
            <OperativeCockpit
              embedded={true}
              isCollapsed={isLeftCollapsed}
              onToggleCollapse={toggleLeftCollapse}
              tokens={tokens}
              activeTokenId={selectedTokenId || tokens[0]?.id}
              onSelectActiveToken={(id: string) => {
                setSelectedTokenId(id);
                useEngineStore.getState().clearSelection();
                useEngineStore.getState().setSelection(id, true);
              }}
              targetToken={targetToken}
              onSelectTargetToken={(id: string) => setTargetTokenId(id)}
              vttRole={effectiveRole}
              activeSensorMode={activeSensorMode}
              onChangeSensorMode={(mode: any) => {
                setActiveSensorMode(mode);
                const targetId = selectedTokenId || tokens[0]?.id;
                if (targetId) {
                  useEngineStore.getState().setSensorMode(targetId, mode);
                }
              }}
              onDropPing={(pingType: string) => {
                VttEventBus.emit('request-tactical-ping', { type: pingType });
              }}
              onTriggerAttack={(attackerId: string, defenderId: string, netDamage: number) => {
                const sync = getVttMultiplayerSync();
                if (!isArchitectRole && !sync.canMoveToken(attackerId)) return;
                const amt = Math.max(0, Math.round(Number(netDamage) || 0));
                if (amt > 0) {
                  useEngineStore.getState().applyDamage(defenderId, amt);
                  const eph = useEngineStore.getState().ephemeralData[defenderId];
                  if (eph) sync.broadcastTokenVitals(defenderId, eph);
                }
              }}
              onBroadcastMessage={(text: string) => {
                VttEventBus.emit('chat-message', {
                  sender: isArchitectRole ? 'Architect' : 'Operative',
                  text,
                  type: 'tactical',
                  timestamp: new Date().toISOString()
                });
              }}
              onUpdateTokenHealth={(id: string, hp: number) => {
                const sync = getVttMultiplayerSync();
                if (!isArchitectRole && !sync.canMoveToken(id)) return;
                useEngineStore.getState().setHealth(id, hp);
                const eph = useEngineStore.getState().ephemeralData[id];
                if (eph) sync.broadcastTokenVitals(id, eph);
              }}
              onUpdateTokenVitality={(id: string, vit: number) => {
                const sync = getVttMultiplayerSync();
                if (!isArchitectRole && !sync.canMoveToken(id)) return;
                useEngineStore.getState().setVitality(id, vit);
                const eph = useEngineStore.getState().ephemeralData[id];
                if (eph) sync.broadcastTokenVitals(id, eph);
              }}
              onUpdateTokenStructure={(id: string, struct: number) => {
                const sync = getVttMultiplayerSync();
                if (!isArchitectRole && !sync.canMoveToken(id)) return;
                useEngineStore.getState().setStructure(id, struct);
                const eph = useEngineStore.getState().ephemeralData[id];
                if (eph) sync.broadcastTokenVitals(id, eph);
              }}
              objects={currentMap?.objects || []}
              currentMap={currentMap}
              onUpdateToken={(id: string, updates: any) => {
                const sync = getVttMultiplayerSync();
                if (!isArchitectRole && !sync.canMoveToken(id)) return;
                if (isArchitectRole && currentMap && updateMap) {
                  const nextTokens = (currentMap.tokens || []).map((t: any) => t.id === id ? { ...t, ...updates } : t);
                  updateMap(currentMap.id, { tokens: nextTokens });
                }
                if (updates.current_hp !== undefined) {
                  useEngineStore.getState().setHealth(id, updates.current_hp);
                } else if (updates.current_health !== undefined) {
                  useEngineStore.getState().setHealth(id, updates.current_health);
                }
                if (updates.current_vitality !== undefined) {
                  useEngineStore.getState().setVitality(id, updates.current_vitality);
                }
                if (updates.current_structure !== undefined) {
                  useEngineStore.getState().setStructure(id, updates.current_structure);
                }
                const eph = useEngineStore.getState().ephemeralData[id];
                if (eph) {
                  sync.broadcastTokenVitals(id, eph);
                }
              }}
              onUpdateObject={(id: string, updates: any) => {
                if (!isArchitectRole) return;
                if (currentMap && updateMap) {
                  const nextObjs = (currentMap.objects || []).map((o: any) => o.id === id ? { ...o, ...updates } : o);
                  updateMap(currentMap.id, { objects: nextObjs });
                }
              }}
              onDeleteToken={(id: string) => {
                if (!isArchitectRole) return;
                if (currentMap && updateMap) {
                  const nextTokens = (currentMap.tokens || []).filter((t: any) => t.id !== id);
                  updateMap(currentMap.id, { tokens: nextTokens });
                }
                useEngineStore.getState().clearSelection();
                if (selectedTokenId === id) setSelectedTokenId(null);
              }}
              onDeleteObject={(id: string) => {
                if (!isArchitectRole) return;
                if (currentMap && updateMap) {
                  const nextObjs = (currentMap.objects || []).filter((o: any) => o.id !== id);
                  updateMap(currentMap.id, { objects: nextObjs });
                }
              }}
              onDuplicateToken={(id: string) => {
                if (!isArchitectRole) return;
                const tok = (currentMap?.tokens || []).find((t: any) => t.id === id);
                if (!tok || !currentMap || !updateMap) return;
                const clone = {
                  ...tok,
                  id: `token-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: `${tok.name || tok.label || 'Unit'} (Copy)`,
                  label: `${tok.label || tok.name || 'Unit'} (Copy)`,
                  x: (tok.x || 300) + 40,
                  y: (tok.y || 300) + 40
                };
                updateMap(currentMap.id, { tokens: [...(currentMap.tokens || []), clone] });
                useEngineStore.getState().loadStaticEntity(clone as any);
                setSelectedTokenId(clone.id);
              }}
              onDuplicateObject={(id: string) => {
                if (!isArchitectRole) return;
                const obj = (currentMap?.objects || []).find((o: any) => o.id === id);
                if (!obj || !currentMap || !updateMap) return;
                const clone = {
                  ...obj,
                  id: `obj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: `${obj.name || obj.label || 'Object'} (Copy)`,
                  label: `${obj.label || obj.name || 'Object'} (Copy)`,
                  x: (obj.x || 300) + 40,
                  y: (obj.y || 300) + 40
                };
                updateMap(currentMap.id, { objects: [...(currentMap.objects || []), clone] });
              }}
              onDeployAsset={(asset: any, pos?: { x: number; y: number }) => {
                if (!isArchitectRole) return;
                handleDeployElementFromDrawer(asset, pos);
              }}
              onOpenTacticalModal={(token: any) => {
                VttEventBus.emit('open-tactical-play-modal', { token });
              }}
            />
          </div>
        )}

        {activeLeftTab === 'catalog' && (
          <ModuleCatalogPanel
            isArchitectRole={isArchitectRole}
            onSelectMap={(id) => {
              if (setActiveMapId) setActiveMapId(id);
            }}
          />
        )}

        {isArchitectRole && activeLeftTab === 'scenario' && (
          <ADEScenarioStageDrawer
            isOpen={true}
            isInline={true}
            onClose={() => setActiveLeftTab('catalog')}
            activeScenarioId={scenarioIdParam}
            onDeployElement={handleDeployElementFromDrawer}
            onDeployAllElements={handleDeployAllElementsFromDrawer}
          />
        )}
      </div>
    </div>
  );

  // Sync armed chunk config to StageView when chunk tool is edited from rail
  useEffect(() => {
    if (!selectedChunk) return;
    VttEventBus.emit('arm-stage-chunk', {
      chunk: selectedChunk,
      rotationDeg: chunkRotationDeg,
      flipX: chunkFlipX,
      flipY: chunkFlipY,
      settings: chunkSettings,
      slotOverrides: chunkSlotOverrides
    });
  }, [selectedChunk, chunkRotationDeg, chunkFlipX, chunkFlipY, chunkSettings, chunkSlotOverrides]);

  // Right Panel: Architect Console (Cartography & World-Building)
  const renderRightPanel = () => {
    if (!isArchitectRole) return null;

    return (
      <div className="w-full h-full flex flex-col overflow-hidden bg-[#0c1017]">
        {/* Architect Rail Sub-Header */}
        <div className="h-9 shrink-0 flex items-center justify-between border-b border-slate-800/80 bg-[#090d14] px-3 z-10 select-none">
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-amber-400 tracking-wider">
            <Hammer size={12} className="text-amber-400" />
            <span>ARCHITECT CONSOLE</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50">
            IN-SITU WEBGPU
          </span>
        </div>

        {/* Architect Tools & Layers */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ArchitectConsole
            isCollapsed={isRightCollapsed}
            onToggleCollapse={toggleRightCollapse}
            activeTool={activeArchitectTool}
            setActiveTool={setActiveArchitectTool}
            selectedTerrain={selectedTerrain}
            setSelectedTerrain={setSelectedTerrain}
            terrainWidth={terrainBrushWidth}
            setTerrainWidth={setTerrainBrushWidth}
            selectedWallType={selectedWallType}
            setSelectedWallType={setSelectedWallType}
            doorLockDc={doorLockDc}
            setDoorLockDc={setDoorLockDc}
            pencilColor={pencilColor}
            setPencilColor={setPencilColor}
            pencilWidth={pencilWidth}
            setPencilWidth={setPencilWidth}
            textLabelInput={textLabelInput}
            setTextLabelInput={setTextLabelInput}
            textColor={textColor}
            setTextColor={setTextColor}
            textSize={textSize}
            setTextSize={setTextSize}
            rulerSelectedPace={rulerSelectedPace}
            setRulerSelectedPace={setRulerSelectedPace}
            measurementUnit={measurementUnit}
            setMeasurementUnit={setMeasurementUnit}
            tokenType={tokenType}
            setTokenType={setTokenType}
            selectedLightColor={selectedLightColor}
            setSelectedLightColor={setSelectedLightColor}
            selectedLightRadius={selectedLightRadius}
            setSelectedLightRadius={setSelectedLightRadius}
            selectedLightAnimation={selectedLightAnimation}
            setSelectedLightAnimation={setSelectedLightAnimation}
            selectedObjectType={selectedObjectType}
            setSelectedObjectType={(obj: any) => {
              setSelectedObjectType(obj);
              setActiveArchitectTool('object');
              AudioService.playTerminalBeep(1200, 0.02);
            }}
            tokenLabelInput={tokenLabelInput}
            setTokenLabelInput={setTokenLabelInput}
            selectedRegionType={selectedRegionType}
            setSelectedRegionType={setSelectedRegionType}
            fogEnabled={fogEnabled}
            setFogEnabled={(val: boolean) => {
              const next = Boolean(val);
              setFogEnabled(next);
              VttEventBus.emit('toggle-stage-fog', { enabled: next });
            }}
            currentMapScale={currentMap?.scale || currentMap?.type || 'Encounter'}
            mapLayers={currentMap?.layers || DEFAULT_LAYERS}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onToggleLayerLock={handleToggleLayerLock}
            newLayerNameInput={newLayerNameInput}
            setNewLayerNameInput={setNewLayerNameInput}
            onAddCustomLayer={(nameOrEvt?: any) => {
              if (nameOrEvt && typeof nameOrEvt.preventDefault === 'function') {
                nameOrEvt.preventDefault();
              }
              if (!currentMap || !updateMap) return;
              const rawName = typeof nameOrEvt === 'string' ? nameOrEvt : newLayerNameInput;
              const trimmed = String(rawName || '').trim();
              if (!trimmed) return;
              const existing = currentMap.layers || DEFAULT_LAYERS;
              const createdLayer = {
                id: `custom_${Date.now()}`,
                name: trimmed,
                visible: true,
                locked: false,
                custom: true,
                opacity: 1
              };
              updateMap(currentMap.id, { layers: [...existing, createdLayer] });
              setNewLayerNameInput('');
              AudioService.playTerminalBeep(1200, 0.03);
            }}
            onDeleteCustomLayer={(layerId: string) => {
              if (!currentMap || !updateMap) return;
              const existing = currentMap.layers || DEFAULT_LAYERS;
              const updated = existing.filter((l: any) => l.id !== layerId);
              updateMap(currentMap.id, { layers: updated });
              AudioService.playTerminalBeep(850, 0.03);
            }}
            onBatchTokenAction={(action: string) => {
              const eng = useEngineStore.getState();
              const sync = getVttMultiplayerSync();
              const allToks = selectAllFusedTokens(eng);
              if (action === 'reveal_all' || action === 'stealth_all') {
                const nextHidden = action === 'stealth_all';
                allToks.forEach((tok: any) => {
                  eng.setHidden(tok.id, nextHidden);
                  const eph = useEngineStore.getState().ephemeralData[tok.id];
                  if (eph) sync.broadcastTokenVitals(tok.id, eph);
                });
                if (currentMap && updateMap) {
                  updateMap(currentMap.id, {
                    tokens: (currentMap.tokens || []).map((t: any) => ({ ...t, is_hidden: nextHidden }))
                  });
                }
                AudioService.playTerminalBeep(nextHidden ? 750 : 1200, 0.03);
              } else if (action === 'heal_party' || action === 'rest_party') {
                allToks.forEach((tok: any) => {
                  const maxHp = tok.base_health ?? tok.base_hp ?? 20;
                  const maxVit = tok.base_vitality ?? 20;
                  const maxStruct = tok.base_structure ?? 40;
                  eng.setHealth(tok.id, maxHp);
                  eng.setVitality(tok.id, maxVit);
                  eng.setStructure(tok.id, maxStruct);
                  const eph = useEngineStore.getState().ephemeralData[tok.id];
                  if (eph) sync.broadcastTokenVitals(tok.id, eph);
                });
                VttEventBus.emit('chat-message', {
                  sender: 'Architect',
                  text: 'Full Rest / Party Restore applied across all active Stage tokens.',
                  type: 'system',
                  timestamp: new Date().toISOString()
                });
                AudioService.playCriticalChime(true);
              }
            }}
            onBroadcastMessage={(text: string) => {
              VttEventBus.emit('chat-message', {
                sender: 'Architect',
                text,
                type: 'system',
                timestamp: new Date().toISOString()
              });
            }}
            customAssets={universeState?.customAssets || { terrains: [], objects: [] }}
            onApplyEnvironmentPreset={(presetOrId: any) => {
              const presetKey = typeof presetOrId === 'string' ? presetOrId : presetOrId?.id;
              if (presetKey) {
                VttEventBus.emit('apply-atmospheric-preset', { presetKey });
              }
            }}
            onOpenLandmassGenerator={() => VttEventBus.emit('open-pcg-modal')}
            onOpenPcgStudio={() => VttEventBus.emit('open-pcg-modal')}
            onOpenAssetStudio={() => VttEventBus.emit('open-asset-studio')}
            onOpenAssetIngestion={() => VttEventBus.emit('open-asset-ingestion')}
            onOpenSpriteSheetCutter={() => VttEventBus.emit('open-sprite-cutter')}
            onOpenUvttImport={() => VttEventBus.emit('open-uvtt-modal')}
            onOpenAssetManager={() => VttEventBus.emit('open-asset-manager')}
            onOpenHeroDrawer={() => VttEventBus.emit('open-hero-drawer')}
            onOpenOmnicortexDrawer={() => VttEventBus.emit('open-omnicortex-drawer')}
            selectedChunk={selectedChunk}
            setSelectedChunk={(chunk: any) => {
              setSelectedChunk(chunk);
              if (chunk) setActiveArchitectTool('chunk');
            }}
            chunkRotationDeg={chunkRotationDeg}
            setChunkRotationDeg={setChunkRotationDeg}
            chunkFlipX={chunkFlipX}
            setChunkFlipX={setChunkFlipX}
            chunkFlipY={chunkFlipY}
            setChunkFlipY={setChunkFlipY}
            chunkSettings={chunkSettings}
            setChunkSettings={setChunkSettings}
            chunkSlotOverrides={chunkSlotOverrides}
            setChunkSlotOverrides={setChunkSlotOverrides}
            magneticSnapEnabled={magneticSnapEnabled}
            setMagneticSnapEnabled={setMagneticSnapEnabled}
            onOpenChunkStudio={() => {
              setSelectedChunk((c: any) => c);
              setActiveArchitectTool('chunk');
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <TripartiteLayout
        topBar={
          <StageBreadcrumbTabs
            currentMapId={activeMapId || ''}
            onSelectMap={(id) => {
              if (setActiveMapId) setActiveMapId(id);
            }}
            onOpenMapMaker={() => {
              if (isRoleLockedOperative) return;
              setUserRole('architect');
              setRightCollapsed(false);
              AudioService.playTerminalBeep(1200, 0.04);
            }}
            onOpenUnderlayModal={() => {
              if (isRoleLockedOperative) return;
              VttEventBus.emit('open-underlay-modal');
            }}
            onOpenStageOptions={() => {
              setIsStageSettingsOpen(true);
            }}
            activeStageTab={activeStageTab}
            onSelectStageTab={handleSelectStageTab}
            onSwitchToWeaver={props.onSwitchToWeaver}
            onOpenAudioMixer={() => setIsAudioMixerOpen(true)}
            onOpenHandoutPush={() => setIsHandoutPushOpen(true)}
            isArchitectRole={isArchitectRole}
            isRollFeedOpen={isRollFeedOpen}
            onToggleRollFeed={() =>
              setIsRollFeedOpen((v) => {
                const next = !v;
                if (next) resetUnreadChatCards();
                return next;
              })
            }
            unreadRollCount={unreadChatCardCount}
            isTurnTrackerOpen={isTurnTrackerOpen}
            onToggleTurnTracker={toggleTurnTracker}
            roundNumber={roundNumber}
            onOpenMacroQuickRun={() => setIsMacroQuickRunOpen((v) => !v)}
          />
        }
        leftPanel={renderLeftPanel()}
        centerStage={
          <StageViewportWrapper
            {...props}
            compiledStage={effectiveCompiledStage}
            isArchitectRole={isArchitectRole}
            onOpenMapMaker={() => {
              if (isRoleLockedOperative) return;
              setUserRole('architect');
              setRightCollapsed(false);
              AudioService.playTerminalBeep(1200, 0.04);
            }}
          />
        }
        rightPanel={renderRightPanel()}
        className="w-full h-full"
      />

      {/* Spatial Waypoint Trigger Confirmation HUD */}
      {!props.disableInternalWaypointEngine && waypointPromptData && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-[#0b101d]/95 backdrop-blur-md border-2 border-amber-500/80 rounded-2xl px-4 py-3 flex items-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] font-mono text-xs max-w-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              ⚡ Waypoint Perimeter Reached: {waypointPromptData.waypoint?.name || 'Sector Objective'}
            </div>
            {waypointPromptData.linkedBeat && (
              <p className="text-[11px] text-slate-200 truncate mt-0.5">{waypointPromptData.linkedBeat}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleConfirmWaypointBeat(waypointPromptData)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
            >
              Execute Trigger
            </button>
            <button
              type="button"
              onClick={() => setWaypointPromptData(null)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Compiled Stage Trigger Confirmation HUD */}
      {pendingTriggerPrompt && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 bg-[#0b101d]/95 backdrop-blur-md border-2 border-purple-500/80 rounded-2xl px-4 py-3 flex items-center gap-4 shadow-[0_0_30px_rgba(168,85,247,0.3)] font-mono text-xs max-w-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-purple-300">
              Stage Trigger Ready: {pendingTriggerPrompt.trigger?.name || pendingTriggerPrompt.anchor?.name || 'Event'}
            </div>
            <p className="text-[11px] text-slate-300 truncate mt-0.5">
              Anchor: {pendingTriggerPrompt.anchor?.name || pendingTriggerPrompt.trigger?.anchorId}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={confirmPendingTrigger}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
            >
              Execute
            </button>
            <button
              type="button"
              onClick={dismissPendingTrigger}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Active Situational & Temporary Modifiers HUD Strip */}
      {universeState?.galleryModifiers && universeState.galleryModifiers.filter((m: any) => m.isActive).length > 0 && (
        <div className="absolute bottom-3 left-3 z-30 bg-[#080d18]/92 backdrop-blur-md border border-purple-500/40 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-2xl font-mono text-xs select-none max-w-[38vw] overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-1.5 text-purple-400 font-bold uppercase text-[10px] shrink-0 pr-1.5 border-r border-slate-700/80">
            <Sliders size={12} />
            <span>Active Mods:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {universeState.galleryModifiers.filter((m: any) => m.isActive).map((mod: any) => (
              <div
                key={mod.id}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-slate-200 text-[10px] hover:border-purple-400 transition-colors"
                title={`${mod.name}: ${mod.description || 'Active situational modifier.'}`}
              >
                <span className="font-bold text-purple-300">{mod.name}</span>
                {mod.effects?.metaphysicMod !== 0 && (
                  <span className="text-purple-400 font-bold">
                    {mod.effects.metaphysicMod > 0 ? `+${mod.effects.metaphysicMod}` : mod.effects.metaphysicMod} Meta
                  </span>
                )}
                {mod.effects?.techMod !== 0 && (
                  <span className="text-cyan-400 font-bold">
                    {mod.effects.techMod > 0 ? `+${mod.effects.techMod}` : mod.effects.techMod} Tech
                  </span>
                )}
                {mod.effects?.attackMod !== 0 && (
                  <span className={mod.effects.attackMod > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {mod.effects.attackMod > 0 ? `+${mod.effects.attackMod}` : mod.effects.attackMod} ATK
                  </span>
                )}
                {mod.isTemporary && (
                  <span className="text-amber-400 font-mono text-[9px]">
                    ({mod.remainingRounds}r)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VTT Story Module Ingestion Modal */}
      <VttModuleIngestionModal
        isOpen={isModuleIngestionOpen}
        onClose={() => setIsModuleIngestionOpen(false)}
      />

      {/* VTT Stage Settings & Tactical Operations Console */}
      <StageSettingsModal
        isOpen={isStageSettingsOpen}
        onClose={() => setIsStageSettingsOpen(false)}
        activeMapId={activeMapId || ''}
        onSelectMap={(id) => {
          if (setActiveMapId) setActiveMapId(id);
        }}
        onDeployElement={handleDeployElementFromDrawer}
      />

      {/* Floating Stage AIME Co-Pilot Chat */}
      {isStageAimeOpen && (
        <div className="relative z-[180]">
          <Suspense fallback={null}>
            <LazyAIMEChatBox
              onClose={() => setIsStageAimeOpen(false)}
              activeNode={flatScenarios.find((s: any) => s.id === effectiveScenarioId) || null}
              cronicle={universeState?.cronicle || null}
              contextData={{
                projectName: universeState?.projectName || 'Tangent Stage',
                guidanceGems: typeof getActiveGemsText === 'function' ? getActiveGemsText() : ''
              }}
            />
          </Suspense>
        </div>
      )}

      {/* Tactical Play Modal launched from Token Contextual Pill / Cockpit */}
      {tacticalPlayCharacter && (
        <Suspense fallback={null}>
          <LazyTacticalPlayModal
            isOpen={Boolean(tacticalPlayCharacter)}
            onClose={() => setTacticalPlayCharacter(null)}
            character={tacticalPlayCharacter}
          />
        </Suspense>
      )}

      {/* Docked Stage Chat & Roll Feed Drawer (Reachable across all viewport modes) */}
      {isRollFeedOpen && (
        <div
          role="dialog"
          aria-label="Stage Roll Feed"
          className="fixed bottom-4 right-4 z-[175] w-88 max-w-[360px] bg-[#0a0f1d]/95 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
        >
          <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-emerald-300 uppercase">Roll Feed & Combat Log</span>
            <button
              type="button"
              onClick={() => setIsRollFeedOpen(false)}
              className="text-slate-400 hover:text-white px-1 cursor-pointer"
              aria-label="Close Roll Feed"
            >
              ×
            </button>
          </div>
          <StageChatRollFeed
            selectedToken={tokens.find((t) => t.id === selectedTokenId) || null}
            targetToken={targetToken}
            userRole={effectiveRole}
            useGlobalListener={false}
          />
        </div>
      )}

      {/* Docked Initiative & Turn Tracker Drawer */}
      <StageTurnTrackerDrawer
        isOpen={isTurnTrackerOpen}
        onClose={() => setTurnTrackerOpen(false)}
        tokens={tokens}
        selectedTokenId={selectedTokenId}
        onSelectToken={(id) => {
          setSelectedTokenId(id);
          useEngineStore.getState().clearSelection();
          useEngineStore.getState().setSelection(id, true);
        }}
        isArchitectRole={isArchitectRole}
      />

      {/* Live Macro Quick-Run Popover (Architect Only) */}
      {isArchitectRole && isMacroQuickRunOpen && (
        <div
          role="dialog"
          aria-label="Stage Macro Quick-Run"
          className="fixed top-14 right-4 z-[185] w-80 bg-[#0b101d]/95 border border-cyan-500/40 rounded-2xl shadow-2xl p-3 font-mono text-xs backdrop-blur-xl space-y-2"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-cyan-300 uppercase text-[11px]">Stage Macro Quick-Run</span>
            <button
              type="button"
              onClick={() => setIsMacroQuickRunOpen(false)}
              className="text-slate-400 hover:text-white px-1 cursor-pointer"
            >
              ×
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto space-y-1.5">
            {(() => {
              const baseScripts = Array.isArray(universeState?.scripts) ? universeState.scripts : [];
              const stageMacros = (Array.isArray(effectiveCompiledStage?.macros) ? effectiveCompiledStage.macros : []).map((m: any) => {
                const matchedScript = baseScripts.find((s: any) => s.id === m.scriptId || s.title === m.scriptId);
                return {
                  id: m.id || `stage-macro-${m.scriptId}`,
                  title: m.title || m.name || matchedScript?.title || m.scriptId || 'Stage Macro',
                  code: m.code || matchedScript?.code || '',
                  actions: m.actions,
                  isStageBinding: true
                };
              });
              const mergedMacros = [
                ...baseScripts,
                ...stageMacros.filter((sm: any) => !baseScripts.some((bs: any) => bs.id === sm.id))
              ];
              if (mergedMacros.length === 0) {
                return (
                  <div className="text-[10.5px] text-slate-400 py-2">
                    No saved macros yet. Author StageAPI scripts in Presets &amp; Scripts.
                  </div>
                );
              }
              return mergedMacros.map((scr: any) => (
                <div
                  key={scr.id || scr.title}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800"
                >
                  <span className="truncate text-[11px] font-bold text-slate-200">
                    {scr.title || scr.name || 'Macro'}
                    {scr.isStageBinding && <span className="ml-1.5 text-[9px] text-purple-300 uppercase">[Stage]</span>}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const adeState = useAdeStore.getState();
                        const workingFlags: Record<string, string | number | boolean> = {};
                        for (const [k, rec] of Object.entries(adeState.storyFlags || {})) {
                          const val = rec && typeof rec === 'object' && 'value' in rec ? (rec as any).value : rec;
                          if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                            workingFlags[k] = val;
                          }
                        }
                        let executedActions: any[] = [];
                        if (scr.code && String(scr.code).trim()) {
                          const { actions } = await macroSandboxRef.current.executeWithActions(scr.code, {
                            storyFlags: workingFlags,
                            timestamp: Date.now()
                          });
                          executedActions = Array.isArray(actions) ? actions : [];
                        } else if (Array.isArray(scr.actions)) {
                          executedActions = scr.actions;
                        }
                        for (const [fk, fv] of Object.entries(workingFlags)) {
                          const prevRec = adeState.storyFlags?.[fk];
                          const prevVal = prevRec && typeof prevRec === 'object' && 'value' in prevRec ? (prevRec as any).value : prevRec;
                          if (prevVal !== fv) adeState.setStoryFlag(fk, fv);
                        }
                        if (executedActions.length > 0) {
                          dispatchStageMacroActions(executedActions, {
                            role: 'architect',
                            onSetStoryFlag: (k, v) => adeState.setStoryFlag(k, v),
                            onToggleDoor: (wallId: string) => {
                              const map = currentMapRef.current;
                              if (!map?.id || !updateMapRef.current) return;
                              const targetWall = (map.walls || []).find((w: any) => w?.id === wallId || w?.label === wallId);
                              const nextOpen = targetWall ? !targetWall.isOpen : true;
                              VttEventBus.emit('stage-bulkhead-toggled', {
                                wallId,
                                bulkheadId: wallId,
                                isOpen: nextOpen,
                                doorState: nextOpen ? 'open' : 'closed'
                              });
                            }
                          });
                        }
                        setMacroRunStatus(`Executed "${scr.title || 'Macro'}" (${executedActions.length} actions).`);
                        AudioService.playCriticalChime(true);
                      } catch (err: any) {
                        setMacroRunStatus(`Error: ${err?.message || 'Execution failed'}`);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] shrink-0 cursor-pointer"
                  >
                    Run
                  </button>
                </div>
              ));
            })()}
          </div>
          {macroRunStatus && (
            <div className="text-[10px] text-emerald-300 border-t border-slate-800 pt-1.5">{macroRunStatus}</div>
          )}
        </div>
      )}

      <StageAudioMixerDrawer
        isOpen={isAudioMixerOpen}
        onClose={() => setIsAudioMixerOpen(false)}
        isArchitect={isArchitectRole}
      />
      <HandoutBroadcastOverlay
        isPushModalOpen={isHandoutPushOpen}
        onClosePushModal={() => setIsHandoutPushOpen(false)}
        isArchitect={isArchitectRole}
      />

      {!isFoundryRoute && (
        <>
          <SyncConflictModal
            isOpen={!!syncConflict}
            conflictData={syncConflict}
            onOverwrite={resolveConflictOverwrite}
            onPull={resolveConflictPull}
            onCancel={resolveConflictCancel}
          />
          {isArchitectRole && isCommandPaletteOpen && (
            <CommandPaletteModal
              isOpen={isCommandPaletteOpen}
              onClose={() => setAdeModal('commandPalette', false)}
              universeState={universeState}
              elementsCatalog={elementsCatalog}
              onSelectScenario={(scId: string) => {
                setActiveScenarioId?.(scId);
                navigate(`/foundry?view=scenarios&tab=write&scenarioId=${encodeURIComponent(scId)}`);
              }}
              onEditElement={(el: any) => {
                useAdeStore.getState().openGuidedElementCreator({ element: el, mode: 'sheet' });
                navigate('/foundry?view=elements');
              }}
              onOpenNewElement={() => {
                useAdeStore.getState().openGuidedElementCreator({ mode: 'guided' });
                navigate('/foundry?view=elements');
              }}
              onSelectMap={(mapId: string) => {
                setActiveMapId?.(mapId);
                navigate(`/foundry/stage?mapId=${encodeURIComponent(mapId)}`);
              }}
              onSwitchView={(view: string, tab?: string) => {
                if (view === 'stage') {
                  setAdeView('stage');
                  if (tab) setStageTab(tab as any);
                  navigate('/foundry/stage');
                } else {
                  if (view) setAdeView(view as any);
                  if (tab) setStoryTab(tab as any);
                  navigate(`/foundry?view=${encodeURIComponent(view || 'scenarios')}${tab ? `&tab=${encodeURIComponent(tab)}` : ''}`);
                }
              }}
              onToggleSplitView={() => {
                useAdeStore.getState().setIsSplitView(!useAdeStore.getState().isSplitView);
                navigate('/foundry?view=scenarios');
              }}
              onOpenModal={(key: string) => {
                setAdeModal(key as any, true);
                navigate('/foundry');
              }}
            />
          )}
        </>
      )}

    </div>
  );
};

export default TripartiteStageView;

