import React, { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { lazyWithRetry } from '../../../utils/lazyWithRetry';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MapMakerPixiCanvas from './pixi/MapMakerPixiCanvas';
import { useCampaign, formatExportFilename } from '../../../context/CampaignContext';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { showToast } from '../../../context/ToastContext';
import VttCommandDrawer from './map/VttCommandDrawer';
import { createTacticalPing, filterExpiredPings } from '../../../services/mapPingService';
import { createDefaultTeamRoster, canUserControlToken, isUserArchitect, VTT_ROLES } from '../../../services/vttTeamService';

import { MAP_TYPES, DEFAULT_LAYERS, MASTER_TERRAINS, MASTER_OBJECTS, PENCIL_COLORS, PENCIL_WIDTHS, TEXT_COLORS } from './map/MapConstants';
import UvttImportModal from './map/UvttImportModal';
import { computeVisibilityPolygon } from '../../../services/raycastVisionService';
import { toggleDoorState, damageWallSegment, createWallSegment, WALL_TYPES, DOOR_STATES } from '../../../schemas/vttWallSchema';
import { useMapBezierAndExport } from './hooks/useMapBezierAndExport';
import MapUnderlayCalibrationModal from './map/MapUnderlayCalibrationModal';
import SpatialAudio from '../../../services/spatialAudioService';
import MapToolbar from './map/MapToolbar';
import ArchitectConsoleRail from './map/ArchitectConsoleRail';
import MapLayersPanel from './map/MapLayersPanel';
import MapMetadataPanel from './map/MapMetadataPanel';
import MapKeyPanel from './map/MapKeyPanel';
import MapAssetManagerModal from './map/MapAssetManagerModal';
import OmnicortexAssetDrawer from './map/OmnicortexAssetDrawer';
import StoryElementsDrawer from './map/StoryElementsDrawer';
import StoryElementModal from './map/StoryElementModal';
import { normalizeElementType } from '../ElementForge/elementSchemas';
import { DBMItemModal } from '../../../components/DBM/DBMItemModal';
import { StoryFoundryGuideModal } from '../../../components/StoryFoundry/StoryFoundryGuideModal';
import { useFolio } from '../../../context/FolioContext';
import { AudioService } from '../../../services/audioService';
const MapMaker3DPreviewModal = lazyWithRetry(() => import('./components/MapMaker3DPreviewModal'));

import { useMapHistory } from './hooks/useMapHistory';
import { useMapCanvasEvents } from './hooks/useMapCanvasEvents';
import { UnifiedRelationalSelectorModal } from '../../../components/DBM/UnifiedRelationalSelectorModal';
import { 
  getStarterMapsCollection, 
  createDerelictStarshipMap, 
  createResearchOutpostMap 
} from '../../../components/VTT/stage/defaultMaps';

import { getBiomeTextureUrl } from './map/landmassGenerator';
import { VttEventBus } from '../../../utils/vttEventBus';
import { MapMakerTabBar } from './components/MapMakerTabBar';
import { AssetStudioTab } from './components/AssetStudioTab';
import { PcgAiStudioTab } from './components/PcgAiStudioTab';
import { VttExportTab } from './components/VttExportTab';
import { compileAssetUnitStamp } from '../../../engine/assets/assetStampCompiler';
import { useAssetUnitStore } from '../../../engine/assets/assetUnitStore';
import { auth } from '../../../firebase';
import { snapPointToGrid } from './map/gridGeometry';
import { normalizeMapObject } from '../../../utils/storyAssetAdapter';
import { SelectedElementInspectorBar } from './map/SelectedElementInspectorBar';
import { MobileTacticalBlocker } from '../../../components/StoryFoundry/MobileTacticalBlocker';
import { useIsMobile } from '../../../hooks/useIsMobile';
const ChunkStudioModal = lazyWithRetry(() => import('./components/ChunkStudioModal'));
import { PlacedChunkInspectorBar } from './map/PlacedChunkInspectorBar';
import { SCIENCE_FANTASY_SEED_CHUNKS } from '../../../data/seed_chunks/science_fantasy_chunks';
import {
  compileChunkToMapElements,
  transformChunkBlueprint,
  computeWorldPerimeterSockets,
  findBestSocketSnap,
  weldChunkWallsAndDoors,
  retransformPlacedChunkInstance,
  explodeChunkInstance,
  deletePlacedChunkInstance,
  extractChunkFromMapSelection
} from '../../../services/mapChunkCompilerService';

const MapPane = ({ mapExportPngRef, defaultRole = 'architect', onBackToStory, onSwitchView }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // Floating Toolboxes Toggle State
  const [showOmnicortexDrawer, setShowOmnicortexDrawer] = useState(false);
  const [showStoryDrawer, setShowStoryDrawer] = useState(false);
  const [inspectingStoryElement, setInspectingStoryElement] = useState(null);
  const [inspectingOmnicortexItem, setInspectingOmnicortexItem] = useState(null);
  const [showMetadataPanel, setShowMetadataPanel] = useState(false);
  const [showKeyPanel, setShowKeyPanel] = useState(true);

  // Tools & UI State
  const [activeTool, setActiveTool] = useState('select');
  const [gridMode, setGridMode] = useState('hex');
  const [terrainRenderMode, setTerrainRenderMode] = useState('organic'); // 'organic' (default smooth vector) or 'hex' (discrete hex tile grid)


  // Tool Sub-Options State
  const [selectedTerrain, setSelectedTerrain] = useState(MASTER_TERRAINS['Planetary'][0]);
  const [terrainWidth, setTerrainWidth] = useState(30);
  const [softTerrainEdge, setSoftTerrainEdge] = useState(true);
  const [paintRoofLayer, setPaintRoofLayer] = useState(false);
  const [isUnderlayModalOpen, setIsUnderlayModalOpen] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState(MASTER_OBJECTS['Planetary'][0]);
  const [selectedWallType, setSelectedWallType] = useState('solid');
  const [doorLockDc, setDoorLockDc] = useState(14);
  const [selectedRegionType, setSelectedRegionType] = useState('roof_zone');
  const [rulerSelectedPace, setRulerSelectedPace] = useState('walk');
  const [activeSensorMode, setActiveSensorMode] = useState('standard_optical');
  const [pencilColor, setPencilColor] = useState(PENCIL_COLORS[0]);
  const [pencilWidth, setPencilWidth] = useState(PENCIL_WIDTHS[1]);
  const [tokenType, setTokenType] = useState('standard');
  const [tokenLabelInput, setTokenLabelInput] = useState('Unit');
  const [tokenOmnicortexData, setTokenOmnicortexData] = useState(null);
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [textLabelInput, setTextLabelInput] = useState('Sector Alpha');
  const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
  const [textSize, setTextSize] = useState(24);
  const [fogEnabled, setFogEnabled] = useState(false);
  // Dynamic Light Tool State
  const [selectedLightColor, setSelectedLightColor] = useState('#f59e0b');
  const [selectedLightRadius, setSelectedLightRadius] = useState(180);
  const [selectedLightAnimation, setSelectedLightAnimation] = useState('flicker');
  const [isUvttModalOpen, setIsUvttModalOpen] = useState(false);
  const [is3DPreviewOpen, setIs3DPreviewOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const {
    universeState,
    allMaps: contextAllMaps,
    activeMapId,
    setActiveMapId,
    addMap,
    updateMap,
    deleteMap,
    addCustomTerrain,
    updateCustomTerrain,
    deleteCustomTerrain,
    addCustomObject,
    updateCustomObject,
    deleteCustomObject,
    addCustomChunk,
    updateCustomChunk,
    deleteCustomChunk,
    publishSpectatorMap,
    isStoryReadOnly = false
  } = useCampaign();

  const availableMaps = useMemo(
    () => (Array.isArray(contextAllMaps) && contextAllMaps.length > 0 ? contextAllMaps : (universeState?.maps || [])),
    [contextAllMaps, universeState?.maps]
  );

  // Bi-directional synchronization with ?mapId= URL parameter
  useEffect(() => {
    const urlMapId = searchParams.get('mapId');
    if (urlMapId && urlMapId !== activeMapId) {
      const exists = availableMaps.some(m => m.id === urlMapId);
      if (exists) {
        setActiveMapId(urlMapId);
      }
    }
  }, [searchParams, availableMaps]);

  useEffect(() => {
    if (activeMapId && searchParams.get('mapId') !== activeMapId) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('mapId', activeMapId);
        return next;
      }, { replace: true });
    }
  }, [activeMapId]);

  const [selectedId, setSelectedId] = useState(null);

  // VTT Tactical Role, Teams, System Options & Ping State
  const [vttRole, setVttRole] = useState(defaultRole); // 'architect' | 'co_architect' | 'operative' | 'spectator'
  const [isVttDrawerOpen, setIsVttDrawerOpen] = useState(false);
  const [teamRoster, setTeamRoster] = useState(() => createDefaultTeamRoster());
  const [activePings, setActivePings] = useState([]);
  const [gridSnap, setGridSnap] = useState(true);
  const [gridSize, setGridSize] = useState(50);
  const [measurementUnit, setMeasurementUnit] = useState('meters');

  // Studio Tabbed Mode & Right Architect Console Rail
  const [activeStudioTab, setActiveStudioTab] = useState('canvas'); // 'canvas' | 'assets' | 'pcg' | 'export'
  const [isRightRailCollapsed, setIsRightRailCollapsed] = useState(false);
  const [isRightRailPinned, setIsRightRailPinned] = useState(false);

  // Hybrid Chunk / Tile System State
  const [selectedChunk, setSelectedChunk] = useState(() => SCIENCE_FANTASY_SEED_CHUNKS[0] || null);
  const [chunkRotationDeg, setChunkRotationDeg] = useState(0);
  const [chunkFlipX, setChunkFlipX] = useState(false);
  const [chunkFlipY, setChunkFlipY] = useState(false);
  const [magneticSnapEnabled, setMagneticSnapEnabled] = useState(true);
  const [chunkSettings, setChunkSettings] = useState(() => ({
    powerState: 'nominal',
    securityTier: 2,
    conditionState: 'pristine',
    biomeThemeOverride: 'chunk_default',
    customParameters: {}
  }));
  const [chunkSlotOverrides, setChunkSlotOverrides] = useState({});
  const [chunkStudioInitialBlueprint, setChunkStudioInitialBlueprint] = useState(null);

  const handleOpenInStage = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    const targetMapId = activeMapId || currentMap?.id;
    if (onSwitchView) {
      onSwitchView('stage', 'setup');
    } else {
      navigate(targetMapId ? `/foundry/story?view=stage&tab=setup&mapId=${targetMapId}` : '/foundry/story?view=stage&tab=setup');
    }
  };

  useEffect(() => {
    if (universeState?.customAssets) {
      useAssetUnitStore.getState().migrateLegacyCustomAssets(universeState.customAssets);
    }
  }, [universeState?.customAssets]);

  const handleStampAssetOnMap = (unit) => {
    if (!currentMap || !unit) return;
    if (isStoryReadOnly) {
      showToast({ type: 'warn', text: 'Story preview is read-only. Fork or open in Architect Mode to stamp assets.' });
      return;
    }
    recordHistory();
    const mapZoomScale =
      typeof currentMap.scale === 'number' && Number.isFinite(currentMap.scale) && currentMap.scale > 0
        ? currentMap.scale
        : 1;
    const rawX = Math.round((stageSize.width || 800) / (2 * mapZoomScale) / gridSize) * gridSize;
    const rawY = Math.round((stageSize.height || 600) / (2 * mapZoomScale) / gridSize) * gridSize;
    const compiled = compileAssetUnitStamp(unit, {
      x: rawX,
      y: rawY,
      gridSize,
      mapScale: currentMap.type
    });

    const updates = {};
    if (compiled.object) {
      updates.objects = [...(currentMap.objects || []), compiled.object];
    }
    if (compiled.token) {
      updates.tokens = [...(currentMap.tokens || []), compiled.token];
    }
    if (compiled.terrain) {
      updates.terrains = [...(currentMap.terrains || []), compiled.terrain];
    }
    if (compiled.walls.length > 0) {
      updates.walls = [...(currentMap.walls || []), ...compiled.walls];
    }
    if (compiled.lights.length > 0) {
      updates.lights = [...(currentMap.lights || []), ...compiled.lights];
    }

    updateMap(activeMapId, updates);
    const primaryItem = compiled.object || compiled.token || compiled.terrain || compiled.walls[0];
    if (primaryItem?.id) {
      setSelectedId(primaryItem.id);
    }

    const extras = [];
    if (compiled.lights.length > 0) extras.push(`${compiled.lights.length} light`);
    if (compiled.walls.length > 0) extras.push(`${compiled.walls.length} wall${compiled.walls.length > 1 ? 's' : ''}`);
    const suffix = extras.length > 0 ? ` (+ ${extras.join(', ')})` : '';
    showToast({ type: 'success', text: `Stamped "${unit.name}" as ${compiled.target}${suffix}!` });
    setActiveStudioTab('canvas');
  };

  const handleEquipTerrainBrush = (unit) => {
    if (!unit) return;
    const terrainProps = unit.vtt_properties?.terrain;
    setSelectedTerrain({
      id: unit.unit_id || unit.id,
      name: unit.name,
      label: unit.name,
      color: unit.color || '#334155',
      textureUrl: unit.visuals?.baseTexture || unit.visuals?.thumbnail || '',
      material: terrainProps?.material || 'metal_deck',
      movementCost: terrainProps?.movementCost ?? 1,
      assetUnit: unit
    });
    setActiveTool('terrain');
    setActiveStudioTab('canvas');
    showToast({ type: 'success', text: `Equipped terrain brush "${unit.name}". Paint directly on canvas!` });
  };

  const handleApplyPcgTerrain = (grid, biomeKey, replaceExisting = false) => {
    if (!currentMap || !grid) return;
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    recordHistory();
    const gSize = Math.max(15, currentMap?.gridSize || gridSize || 50);
    const newTerrains = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c]) {
          newTerrains.push({
            id: `pcg-ter-${Date.now()}-${r}-${c}`,
            renderType: 'rect',
            label: biomeKey || 'Procedural Terrain',
            x: c * gSize,
            y: r * gSize,
            width: gSize,
            height: gSize,
            biomeType: biomeKey || 'rock_cavern',
            color: '#334155'
          });
        }
      }
    }
    updateMap(activeMapId, {
      terrains: replaceExisting ? newTerrains : [...(currentMap.terrains || []), ...newTerrains]
    });
    showToast({ type: 'success', text: `Generated ${newTerrains.length} procedural terrain tiles!` });
    setActiveStudioTab('canvas');
  };

  const handleApplyDecorations = (entities = [], atmosphere = null, lights = [], doors = []) => {
    if (!currentMap) return;
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    recordHistory();

    const newObjects = (entities || []).map(e => ({
      id: e.id || `entity-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: e.unit_name,
      label: e.unit_name,
      unit_id: e.unit_id,
      x: e.col * gridSize,
      y: e.row * gridSize,
      width: (e.width || 1) * gridSize,
      height: (e.height || 1) * gridSize,
      category: e.category,
      type: e.category === 'token' ? 'npc' : 'doodad',
      isHazard: e.isHazard,
      hazardDamage: e.hazardDamage,
      isCover: e.isCover,
      coverRating: e.coverRating,
      isDecal: e.isDecal,
      decalType: e.decalType
    }));

    // Interactive Doors (both portal objects and wall barrier segments)
    const newDoorObjects = [];
    const newWalls = [];

    (doors || []).forEach(d => {
      const isBarricaded = Boolean(d.isBarricaded);
      const doorName = isBarricaded 
        ? 'Barricaded Blast Door' 
        : (d.doorType === 'airlock' ? 'Airlock Blast Door' : 'Security Bulkhead');

      newDoorObjects.push({
        id: `portal-${Date.now()}-${d.col}-${d.row}`,
        name: doorName,
        label: isBarricaded ? 'Barricaded Door' : (d.doorType === 'airlock' ? 'Airlock' : 'Door'),
        x: d.col * gridSize + gridSize / 2,
        y: d.row * gridSize + gridSize / 2,
        width: gridSize,
        height: gridSize,
        category: 'door',
        type: 'portal',
        color: isBarricaded ? '#ef4444' : (d.doorType === 'airlock' ? '#38bdf8' : '#f59e0b'),
        isOpen: false,
        isLocked: isBarricaded || Boolean(d.isLocked),
        isBarricaded
      });

      newWalls.push(createWallSegment(
        { x: d.col * gridSize, y: d.row * gridSize + gridSize / 2 },
        { x: (d.col + 1) * gridSize, y: d.row * gridSize + gridSize / 2 },
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
      ));
    });

    // Dynamic Lights
    const newLights = (lights || []).map(lt => {
      const anim = lt.animation || 'steady';
      return {
        id: lt.id || `light-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: anim === 'flicker' ? 'Flickering Luminary' : anim === 'pulse' ? 'Warning Beacon' : 'Tactical Luminary',
        x: lt.col * gridSize + gridSize / 2,
        y: lt.row * gridSize + gridSize / 2,
        radius: (lt.radius || 3.5) * gridSize,
        color: lt.color || '#f59e0b',
        intensity: lt.intensity ?? 0.85,
        animation: anim
      };
    });

    const updatePayload = {
      objects: [...(currentMap.objects || []), ...newObjects, ...newDoorObjects],
      walls: [...(currentMap.walls || []), ...newWalls],
      lights: [...(currentMap.lights || []), ...newLights]
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

    updateMap(activeMapId, updatePayload);
    showToast({
      type: 'success',
      text: `Spatial Decorator injected ${newObjects.length} entities, ${newLights.length} lights, and ${newDoorObjects.length} doors!`
    });
    setActiveStudioTab('canvas');
  };

  // Sync defaultRole prop
  useEffect(() => {
    if (defaultRole && defaultRole !== vttRole) {
      setVttRole(defaultRole);
    }
  }, [defaultRole]);

  // Synchronize rails with VTT role
  useEffect(() => {
    if (vttRole === 'operative') {
      setIsRightRailCollapsed(true);
    }
  }, [vttRole]);

  // Auto-bootstrap starter maps if universe has no maps
  useEffect(() => {
    if (availableMaps.length === 0 && addMap) {
      const starters = getStarterMapsCollection();
      starters.forEach(m => addMap(m));
      if (starters[0] && setActiveMapId) {
        setActiveMapId(starters[0].id);
      }
    }
  }, [availableMaps.length, addMap, setActiveMapId]);

  // Listen for scene & map control events from rail
  useEffect(() => {
    const handleOpenNewMap = () => setIsModalOpen(true);
    const handleLoadStarship = () => {
      if (addMap) {
        const starship = createDerelictStarshipMap();
        addMap(starship);
        if (setActiveMapId) setActiveMapId(starship.id);
        AudioService.playCriticalChime(true);
      }
    };
    const handleLoadOutpost = () => {
      if (addMap) {
        const outpost = createResearchOutpostMap();
        addMap(outpost);
        if (setActiveMapId) setActiveMapId(outpost.id);
        AudioService.playCriticalChime(true);
      }
    };

    const offNewMap = VttEventBus.on('open-new-map-modal', handleOpenNewMap);
    const offStarship = VttEventBus.on('load-preset-starship', handleLoadStarship);
    const offOutpost = VttEventBus.on('load-preset-outpost', handleLoadOutpost);

    return () => {
      offNewMap();
      offStarship();
      offOutpost();
    };
  }, [addMap, setActiveMapId]);

  const handleSelectToken = (tokenId) => {
    setSelectedId(tokenId);
  };

  // Ping Auto-Decay Timer
  useEffect(() => {
    if (activePings.length === 0) return;
    const interval = setInterval(() => {
      setActivePings(prev => filterExpiredPings(prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [activePings.length]);

  // Handler to drop tactical radar pings
  const handleDropTacticalPing = (pingType, targetX = null, targetY = null) => {
    const safeScale = scale || 1;
    const px = targetX !== null ? targetX : Math.round((-position.x + stageSize.width / 2) / safeScale);
    const py = targetY !== null ? targetY : Math.round((-position.y + stageSize.height / 2) / safeScale);
    const newPing = createTacticalPing(px, py, pingType, null, vttRole === 'operative' ? 'Operator' : 'Architect', '#06b6d4');
    setActivePings(prev => [...prev, newPing]);
    AudioService.playTerminalBeep(newPing.soundFreq, 0.1);
  };

  // Map Creation Modal, Asset Manager Modal & Shortcuts Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [newMapType, setNewMapType] = useState('Planetary');
  const [newMapTitle, setNewMapTitle] = useState('');
  const [newLayerNameInput, setNewLayerNameInput] = useState('');

  const mapFileInputRef = useRef(null);

  const handleSaveMapToFile = () => {
    if (!currentMap) return;
    const exportPayload = {
      type: "TangentMap",
      version: "1.0",
      map: currentMap
    };
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatExportFilename(currentMap.title || 'map', 'map', 'json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMapFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          let mapToLoad = data.type === "TangentMap" && data.map ? data.map : (data.id && data.title ? data : null);
          if (mapToLoad) {
            const mapId = uuidv4();
            const newMap = { ...mapToLoad, id: mapId };
            addMap(newMap);
            setActiveMapId(mapId);
          } else {
            showToast({ type: 'error', text: 'Invalid map JSON file format.' });
          }
        } catch (err) {
          console.error(err);
          showToast({ type: 'error', text: 'Failed to parse map JSON file.' });
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleDeleteActiveMap = async () => {
    if (!currentMap) return;
    const targetTitle = currentMap.title || 'Untitled Map';
    if (availableMaps.length <= 1) {
      if (await confirmTypedDeletion(targetTitle, 'tactical sector map and reset to blank')) {
        const newBlankId = uuidv4();
        addMap({
          id: newBlankId,
          title: 'New Sector Map',
          type: 'Sector',
          gridMode: 'hex',
          lines: [],
          tokens: [],
          terrains: [],
          objects: [],
          texts: [],
          fog: [],
          layers: DEFAULT_LAYERS
        });
        deleteMap(currentMap.id);
        setActiveMapId(newBlankId);
      }
      return;
    }
    if (await confirmTypedDeletion(targetTitle, 'tactical sector map')) {
      const nextMap = availableMaps.find(m => m.id !== currentMap.id);
      deleteMap(currentMap.id);
      if (nextMap) {
        setActiveMapId(nextMap.id);
      }
    }
  };

  const currentMap = availableMaps.find(m => m.id === activeMapId);
  const lines = currentMap?.lines || [];
  const tokens = currentMap?.tokens || [];
  const terrains = currentMap?.terrains || [];
  const objects = currentMap?.objects || [];
  const texts = currentMap?.texts || [];
  const walls = currentMap?.walls || [];
  const lights = currentMap?.lights || [];
  const fog = currentMap?.fog || [];
  const regions = currentMap?.regions || [];
  const mapLayers = React.useMemo(() => {
    const raw = currentMap?.layers || DEFAULT_LAYERS;
    if (raw.some((l) => l.id === 'layer_roof')) return raw;
    const roofEntry = { id: 'layer_roof', name: 'Roof & Upper Canopy', visible: true, locked: false };
    const idx = raw.findIndex((l) => l.id === 'layer_annotations');
    if (idx === -1) return [...raw, roofEntry];
    return [...raw.slice(0, idx), roofEntry, ...raw.slice(idx)];
  }, [currentMap?.layers]);
  const chunkInstances = currentMap?.chunkInstances || [];

  useEffect(() => {
    if (currentMap?.gridSize) setGridSize(currentMap.gridSize);
    if (currentMap?.gridMode) setGridMode(currentMap.gridMode);
  }, [currentMap?.id]);
  const allAvailableChunks = React.useMemo(() => {
    const customList = universeState?.customAssets?.chunks || [];
    return [...customList, ...SCIENCE_FANTASY_SEED_CHUNKS];
  }, [universeState?.customAssets?.chunks]);

  const handleStampChunkAtPos = (pos) => {
    if (!currentMap || !selectedChunk) return;
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    const gSize = Math.max(15, gridSize || 50);
    let targetCol = Math.floor(pos.x / gSize);
    let targetRow = Math.floor(pos.y / gSize);

    let snapMatch = null;
    if (magneticSnapEnabled && chunkInstances.length > 0) {
      snapMatch = findBestSocketSnap(
        selectedChunk,
        targetCol,
        targetRow,
        gSize,
        chunkRotationDeg,
        chunkFlipX,
        chunkFlipY,
        chunkInstances,
        allAvailableChunks
      );
      if (snapMatch) {
        targetCol = snapMatch.snappedCol;
        targetRow = snapMatch.snappedRow;
      }
    }

    const compiled = compileChunkToMapElements(selectedChunk, {
      targetCol,
      targetRow,
      gridSize: gSize,
      rotationDeg: chunkRotationDeg,
      flipX: chunkFlipX,
      flipY: chunkFlipY,
      settings: chunkSettings,
      slotOverrides: chunkSlotOverrides
    });

    // Gather existing world sockets for automatic door welding
    const existingSockets = [];
    for (const inst of chunkInstances) {
      const bp = inst.blueprintSnapshot || allAvailableChunks.find(b => b.chunkId === inst.chunkId);
      if (!bp) continue;
      const transExisting = transformChunkBlueprint(bp, inst.rotationDeg, inst.flipX, inst.flipY);
      existingSockets.push(
        ...computeWorldPerimeterSockets(
          transExisting,
          inst.col * gSize,
          inst.row * gSize,
          gSize,
          inst.instanceId
        )
      );
    }

    const weldedWalls = weldChunkWallsAndDoors(
      walls,
      compiled.walls,
      compiled.worldSockets,
      existingSockets
    );

    updateMap(activeMapId, {
      terrains: [...terrains, ...compiled.terrains],
      walls: weldedWalls,
      objects: [...objects, ...compiled.objects],
      lights: [...lights, ...compiled.lights],
      chunkInstances: [...chunkInstances, compiled.instanceRecord]
    });

    if (compiled.objects[0]) {
      setSelectedId(compiled.objects[0].id);
    } else if (compiled.terrains[0]) {
      setSelectedId(compiled.terrains[0].id);
    }

    AudioService.playTerminalBeep(1040, 0.06);
    showToast({
      type: 'success',
      text: `Stamped "${selectedChunk.name}" (North: ${compiled.instanceRecord.northSide}${snapMatch ? ' • Socket Welded!' : ''})`
    });
  };

  const handleRetransformChunkInstance = (instanceId, updates) => {
    if (!currentMap) return;
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    recordHistory('Transform Placed Chunk');
    const updatedMap = retransformPlacedChunkInstance(
      currentMap,
      instanceId,
      updates,
      allAvailableChunks
    );
    updateMap(activeMapId, {
      terrains: updatedMap.terrains,
      walls: updatedMap.walls,
      objects: updatedMap.objects,
      lights: updatedMap.lights,
      chunkInstances: updatedMap.chunkInstances
    });
    AudioService.playTerminalBeep(960, 0.04);
  };

  const handleExplodeChunkInstance = (instanceId) => {
    if (!currentMap) return;
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    recordHistory('Unpack Chunk to Standalone Tiles');
    const updatedMap = explodeChunkInstance(currentMap, instanceId);
    updateMap(activeMapId, {
      terrains: updatedMap.terrains,
      walls: updatedMap.walls,
      objects: updatedMap.objects,
      lights: updatedMap.lights,
      chunkInstances: updatedMap.chunkInstances
    });
    showToast({ type: 'info', text: 'Unpacked chunk instance into standalone tiles, walls, and props.' });
  };

  const handleDeleteChunkInstance = (instanceId) => {
    if (!currentMap) return;
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    recordHistory('Delete Placed Chunk');
    const updatedMap = deletePlacedChunkInstance(currentMap, instanceId);
    updateMap(activeMapId, {
      terrains: updatedMap.terrains,
      walls: updatedMap.walls,
      objects: updatedMap.objects,
      lights: updatedMap.lights,
      chunkInstances: updatedMap.chunkInstances
    });
    setSelectedId(null);
    showToast({ type: 'info', text: 'Deleted placed chunk instance.' });
  };

  const handleSaveInstanceAsBlueprint = (chunkInstance) => {
    const baseBp =
      chunkInstance.blueprintSnapshot ||
      allAvailableChunks.find(b => b.chunkId === chunkInstance.chunkId);
    if (!baseBp) return;
    const baked = transformChunkBlueprint(
      baseBp,
      chunkInstance.rotationDeg,
      chunkInstance.flipX,
      chunkInstance.flipY
    );
    const customVariant = {
      ...baked,
      chunkId: `chunk_custom_${Date.now()}`,
      name: `${baseBp.name} (${chunkInstance.northSide} Variant)`,
      defaultSettings: { ...chunkInstance.settings },
      isCustom: true,
      updatedAt: new Date().toISOString()
    };
    if (addCustomChunk) addCustomChunk(customVariant);
    setSelectedChunk(customVariant);
    showToast({
      type: 'success',
      text: `Saved "${customVariant.name}" to your Custom Chunk Library!`
    });
  };
  const { undoStack, redoStack, recordHistory, handleUndo, handleRedo } = useMapHistory({
    currentMap, lines, tokens, terrains, objects, texts, walls, lights, regions, fog, mapLayers, updateMap, activeMapId,
    enabled: activeStudioTab === 'canvas'
  });

  const isLayerVisible = useCallback((layerId) => {
    const l = mapLayers.find(item => item.id === layerId);
    return l ? l.visible : true;
  }, [mapLayers]);

  const isLayerLocked = useCallback((layerId) => {
    const l = mapLayers.find(item => item.id === layerId);
    return l ? l.locked : false;
  }, [mapLayers]);

  const handleBlockedCanvasAction = useCallback((reason, layerId) => {
    if (reason === 'readonly') {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    if (reason === 'locked') {
      const layerName = mapLayers.find(l => l.id === layerId)?.name || layerId || 'target layer';
      showToast({ type: 'warning', text: `Layer locked: unlock "${layerName}" to edit.` });
    }
  }, [mapLayers]);

  const {
    scale, setScale, position, setPosition,
    isDrawing,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
    wallStartPoint, wallPreviewEnd, rulerWaypoints, setRulerWaypoints, rulerPointer, setRulerPointer, clearRuler,
    zoomBy, panBy, chunkPointerPos, chunkCaptureMarquee, setChunkCaptureMarquee
  } = useMapCanvasEvents({
    currentMap, activeMapId, updateMap, recordHistory,
    activeTool, lines, terrains, walls, fog, objects, tokens, texts, lights,
    pencilColor, pencilWidth, selectedTerrain, terrainWidth, softTerrainEdge, paintRoofLayer, selectedObjectType,
    selectedWallType, doorLockDc,
    selectedLightColor, selectedLightRadius, selectedLightAnimation,
    tokenType, tokenLabelInput, tokenOmnicortexData, textLabelInput, textColor, textSize,
    regions, selectedRegionType,
    onStampChunk: handleStampChunkAtPos,
    isStoryReadOnly,
    isLayerLocked,
    gridSnap,
    gridSize: currentMap?.gridSize || gridSize,
    gridMode: currentMap?.gridMode || gridMode,
    terrainRenderMode,
    onBlockedAction: handleBlockedCanvasAction
  });

  // Compute live Ghost Preview & Magnetic Socket Snap for activeTool === 'chunk'
  const chunkGhostPreviewData = React.useMemo(() => {
    if (activeTool !== 'chunk' || !selectedChunk || !chunkPointerPos) return null;
    const gSize = Math.max(15, gridSize || 50);
    let targetCol = Math.floor(chunkPointerPos.x / gSize);
    let targetRow = Math.floor(chunkPointerPos.y / gSize);

    let snapCandidate = null;
    if (magneticSnapEnabled && chunkInstances.length > 0) {
      snapCandidate = findBestSocketSnap(
        selectedChunk,
        targetCol,
        targetRow,
        gSize,
        chunkRotationDeg,
        chunkFlipX,
        chunkFlipY,
        chunkInstances,
        allAvailableChunks
      );
      if (snapCandidate) {
        targetCol = snapCandidate.snappedCol;
        targetRow = snapCandidate.snappedRow;
      }
    }

    const transformedBlueprint = transformChunkBlueprint(
      selectedChunk,
      chunkRotationDeg,
      chunkFlipX,
      chunkFlipY
    );
    const originX = targetCol * gSize;
    const originY = targetRow * gSize;
    const worldSockets = computeWorldPerimeterSockets(
      transformedBlueprint,
      originX,
      originY,
      gSize,
      'ghost'
    );

    return {
      originX,
      originY,
      targetCol,
      targetRow,
      transformedBlueprint,
      worldSockets,
      snapCandidate
    };
  }, [
    activeTool,
    selectedChunk,
    chunkPointerPos,
    gridSize,
    magneticSnapEnabled,
    chunkInstances,
    chunkRotationDeg,
    chunkFlipX,
    chunkFlipY,
    allAvailableChunks
  ]);

  // Identify if the currently selected element belongs to a PlacedChunkInstance
  const selectedChunkInstance = React.useMemo(() => {
    if (!selectedId || !chunkInstances.length) return null;
    const directInst = chunkInstances.find(inst => inst.instanceId === selectedId);
    if (directInst) return directInst;

    const matchEl =
      objects.find(o => o.id === selectedId) ||
      walls.find(w => w.id === selectedId) ||
      terrains.find(t => t.id === selectedId) ||
      lights.find(l => l.id === selectedId);
    if (matchEl?.chunkInstanceId) {
      return chunkInstances.find(inst => inst.instanceId === matchEl.chunkInstanceId) || null;
    }
    return null;
  }, [selectedId, chunkInstances, objects, walls, terrains, lights]);

  const handleCaptureMarqueeAsChunk = () => {
    if (!currentMap || !chunkCaptureMarquee) return;
    const minX = Math.min(chunkCaptureMarquee.startX, chunkCaptureMarquee.endX);
    const minY = Math.min(chunkCaptureMarquee.startY, chunkCaptureMarquee.endY);
    const width = Math.max(50, Math.abs(chunkCaptureMarquee.endX - chunkCaptureMarquee.startX));
    const height = Math.max(50, Math.abs(chunkCaptureMarquee.endY - chunkCaptureMarquee.startY));

    const capturedBp = extractChunkFromMapSelection(
      currentMap,
      { x: minX, y: minY, width, height },
      Math.max(15, gridSize || 50),
      {
        name: `${currentMap.title || 'Sector'} Module (${Math.round(width / (gridSize || 50))}x${Math.round(height / (gridSize || 50))})`,
        category: 'custom',
        scale: currentMap.type || 'Interior'
      }
    );
    if (addCustomChunk) addCustomChunk(capturedBp);
    setSelectedChunk(capturedBp);
    setChunkStudioInitialBlueprint(capturedBp);
    setChunkCaptureMarquee(null);
    setActiveStudioTab('chunks');
    showToast({
      type: 'success',
      text: `Captured ${capturedBp.widthCells}×${capturedBp.heightCells} region as Map Chunk! Opened in Chunk Forge Studio.`
    });
  };

  // Calculate dynamic Line-of-Sight visibility polygon for the active / selected token
  const activeVisionToken = tokens.find(t => t.id === selectedId) || tokens[0];
  const visibilityPolygon = React.useMemo(() => {
    if (!activeVisionToken || !currentMap || walls.length === 0) return null;
    return computeVisibilityPolygon(
      { x: activeVisionToken.x, y: activeVisionToken.y },
      walls,
      {
        maxRadius: 1000,
        bounds: { width: currentMap.width || 3000, height: currentMap.height || 2000 },
        sensorMode: activeSensorMode
      }
    );
  }, [activeVisionToken?.x, activeVisionToken?.y, walls, currentMap?.width, currentMap?.height, activeSensorMode]);

  // Update Spatial Audio listener coordinate whenever active token moves
  useEffect(() => {
    if (isMobile) return;
    if (activeVisionToken) {
      SpatialAudio.setListenerPosition(activeVisionToken.x, activeVisionToken.y, gridSize);
    }
  }, [isMobile, activeVisionToken?.x, activeVisionToken?.y, gridSize]);

  // Door toggle and breach helpers
  const handleToggleDoor = (wallId) => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    const targetWall = walls.find(w => w.id === wallId);
    if (!targetWall) return;
    recordHistory();
    const updatedWall = toggleDoorState(targetWall);
    const nextWalls = walls.map(w => w.id === wallId ? updatedWall : w);
    updateMap(activeMapId, { walls: nextWalls });
  };

  const handleUpdateToken = (tokenId, updates = {}) => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;
    recordHistory();
    const nextTokens = produce(tokens, draft => {
      const target = draft.find(t => t.id === tokenId);
      if (target) Object.assign(target, updates);
    });
    updateMap(activeMapId, { tokens: nextTokens });
  };

  const handleSummonOmnicortexAsset = (item, category, targetPos = null) => {
    if (!currentMap) return;
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }

    const posX = targetPos?.x !== undefined ? targetPos.x : Math.round((-position.x + stageSize.width / 2) / scale);
    const posY = targetPos?.y !== undefined ? targetPos.y : Math.round((-position.y + stageSize.height / 2) / scale);

    const cat = (category || item.category || item._categoryKey || '').toLowerCase();
    const isUnit = ['bestiary', 'adversaries', 'creatures', 'npc', 'enemies'].some(k => cat.includes(k)) || item.type === 'adversary' || item.type === 'npc';
    const isVehicle = ['vehicles', 'starships', 'mechs'].some(k => cat.includes(k));
    const isHazard = ['hazards', 'traps', 'environment'].some(k => cat.includes(k));

    recordHistory();

    if (isUnit || isVehicle) {
      const newUnitToken = {
        id: `token_omnicortex_${item.id || Date.now()}_${Math.floor(Math.random()*1000)}`,
        type: isVehicle ? 'vehicle' : 'hostile',
        omnicortexId: item.id,
        omnicortexCategory: category || item.category || item._categoryKey,
        linkedOmnicortexItem: item,
        label: item.name || item.title || (isVehicle ? 'Vehicle' : 'Adversary'),
        avatarUrl: item.avatarUrl || item.imageUrl || null,
        x: posX,
        y: posY,
        radius: isVehicle ? 45 : 35,
        fill: isVehicle ? '#eab308' : '#ef4444',
        layerId: 'layer_tokens'
      };

      updateMap(activeMapId, { tokens: [...tokens, newUnitToken] });
      AudioService.playTerminalBeep(1100, 0.03);
      showToast(`Added ${newUnitToken.label} to map`, 'success');
    } else {
      // Weapon / Armor / Gear / Loot or Hazard Placeable Object
      const newObject = {
        id: `obj_omnicortex_${item.id || Date.now()}_${Math.floor(Math.random()*1000)}`,
        type: isHazard ? 'hazard' : 'loot_cache',
        shape: isHazard ? 'circle' : 'rect',
        x: posX - 25,
        y: posY - 25,
        width: 50,
        height: 50,
        radius: 25,
        label: item.name || item.title || (isHazard ? 'Hazard' : 'Loot Cache'),
        color: isHazard ? '#f97316' : '#22d3ee',
        layerId: 'layer_objects',
        omnicortexId: item.id,
        omnicortexCategory: category || item.category || item._categoryKey,
        linkedOmnicortexItem: item,
        isInteractive: true,
        hazard: isHazard
      };

      updateMap(activeMapId, { objects: [...objects, newObject] });
      AudioService.playTerminalBeep(950, 0.05);
      showToast(`Added ${newObject.label} to map`, 'success');
    }
  };

  const handleSummonStoryElement = (element, targetPos = null) => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone project before placing elements onto the map.' });
      return;
    }
    if (!currentMap || !element) return;

    const posX = targetPos?.x !== undefined ? targetPos.x : Math.round((-position.x + stageSize.width / 2) / scale);
    const posY = targetPos?.y !== undefined ? targetPos.y : Math.round((-position.y + stageSize.height / 2) / scale);

    const rawType = element.type || 'Scene';
    const type = element.fields?.isTrap || rawType === 'Hazard' ? 'Hazard' : normalizeElementType(rawType);
    recordHistory();

    if (type === 'Persona') {
      const pFields = element.fields || element;

      // Ingest authored autonomous script if present
      let parsedScript = null;
      const rawScript = pFields.vttScript || element.script;
      if (rawScript) {
        if (typeof rawScript === 'object') {
          parsedScript = rawScript;
        } else if (typeof rawScript === 'string') {
          try {
            parsedScript = JSON.parse(rawScript);
          } catch (e) {
            parsedScript = null;
          }
        }
      }

      if (!parsedScript) {
        parsedScript = {
          type: 'dialogue_bark',
          behaviorProfile: pFields.mcmRole?.toLowerCase() || 'tactical',
          moraleThreshold: 0.25,
          alertBark: pFields.voice || pFields.mannerisms || 'Greetings, operator.'
        };
      }

      // Initialize patrol waypoints if not yet populated
      if (parsedScript.type === 'patrol' && (!Array.isArray(parsedScript.waypoints) || parsedScript.waypoints.length === 0)) {
        parsedScript.waypoints = [
          { x: posX, y: posY },
          { x: posX + 160, y: posY },
          { x: posX + 160, y: posY + 140 },
          { x: posX, y: posY + 140 }
        ];
      }

      const designation = pFields.mcmDesignation || element.designation || 'Adversary';
      const tokenFill = designation === 'Ally' ? '#10b981' : (designation === 'Adversary' ? '#ef4444' : '#a855f7');

      const newNpcToken = {
        id: `token_persona_${element.id || Date.now()}_${Math.floor(Math.random()*1000)}`,
        type: 'npc',
        storyElementId: element.id,
        storyElementType: 'Persona',
        linkedStoryElement: element,
        label: pFields['char-name'] || element.name || element.title || 'NPC Persona',
        name: pFields['char-name'] || element.name || element.title || 'NPC Persona',
        avatarUrl: element.avatarUrl || element.imageUrl || null,
        x: posX,
        y: posY,
        radius: 35,
        fill: tokenFill,
        layerId: 'layer_tokens',
        designation,
        role: pFields.mcmRole || 'Tactical',
        behaviorProfile: parsedScript.behaviorProfile || pFields.mcmRole?.toLowerCase() || 'tactical',
        weapon: pFields.weapon || 'Plasma Carbine',
        armor: pFields.armor || 'Standard Armor',
        script: parsedScript,
        relations: {
          stance: pFields.relationsStance || 'Hostile',
          vipTarget: pFields.vipTarget || null,
          rivalTarget: pFields.rivalTarget || null
        }
      };
      updateMap(activeMapId, { tokens: [...tokens, newNpcToken] });
      AudioService.playTerminalBeep(1100, 0.1);
      showToast({ type: 'success', text: `Placed NPC: ${newNpcToken.label}` });
    } else if (type === 'Hazard' || type === 'Trap' || type === 'hazard') {
      const newTrap = normalizeMapObject({
        id: `obj_trap_${element.id || Date.now()}_${Math.floor(Math.random()*1000)}`,
        type: 'hazard',
        isTrap: true,
        trapType: element.trapType || 'proximity_plasma_mine',
        trapState: 'armed',
        storyElementId: element.id,
        storyElementType: 'Hazard',
        linkedStoryElement: element,
        label: element.name || element.title || 'Reactive Trap',
        color: '#ef4444',
        shape: 'circle',
        x: posX - 25,
        y: posY - 25,
        radius: 30,
        width: 60,
        height: 60,
        saveDc: element.dc || 14,
        damageDice: element.damage || '2d10',
        baseDamage: 14,
        hazard: 'plasma',
        layerId: 'layer_objects'
      });
      updateMap(activeMapId, { objects: [...objects, newTrap] });
      AudioService.playTerminalBeep(880, 0.08);
      showToast({ type: 'info', text: `Placed Trap: ${newTrap.label}` });
    } else {
      const glyphColors = {
        Scene: '#f43f5e',
        Clue: '#f59e0b',
        Handout: '#38bdf8',
        Item: '#10b981',
        Encounter: '#ef4444',
        Faction: '#6366f1',
        Technology: '#d946ef',
        World: '#0ea5e9'
      };
      const nodeColor = glyphColors[type] || '#22d3ee';
      const newStoryObject = normalizeMapObject({
        id: `obj_ade_${element.id || Date.now()}_${Math.floor(Math.random()*1000)}`,
        type: 'story_element',
        isStoryElement: true,
        storyElementType: type,
        storyElementId: element.id,
        linkedStoryElement: element,
        label: element.name || element.title || `${type} Node`,
        color: nodeColor,
        shape: type === 'Clue' || type === 'Item' ? 'star' : (type === 'Scene' ? 'circle' : 'rect'),
        x: posX - 25,
        y: posY - 25,
        width: 50,
        height: 50,
        radius: 25,
        imageUrl: element.imageUrl || element.avatarUrl || '',
        layerId: 'layer_objects',
        isInteractive: true
      });
      updateMap(activeMapId, { objects: [...objects, newStoryObject] });
      AudioService.playTerminalBeep(920, 0.08);
      showToast({ type: 'success', text: `Placed Story Node: ${newStoryObject.label}` });
    }
  };

  const handleStageDrop = (e) => {
    e.preventDefault();
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    const raw = e.dataTransfer.getData('application/json');
    if (!raw || !currentMap) return;

    try {
      const data = JSON.parse(raw);
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const gSize = Math.max(15, currentMap?.gridSize || gridSize || 50);
      const activeGridMode = currentMap?.gridMode || gridMode || 'hex';
      const worldPt = snapPointToGrid(
        { x: (mouseX - position.x) / scale, y: (mouseY - position.y) / scale },
        gSize,
        activeGridMode,
        gridSnap
      );

      if (data.type === 'story_element') {
        handleSummonStoryElement(data.element, worldPt);
      } else if (data.type === 'folio_hero_token') {
        handleSummonHeroToken(data, worldPt);
      } else if (data.type === 'omnicortex_asset') {
        handleSummonOmnicortexAsset(data.item, data.category, worldPt);
      } else if (data.assetUnit || data.defaultProps?.assetUnit) {
        const droppedUnit = data.assetUnit || data.defaultProps.assetUnit;
        recordHistory('Drop Studio Asset');
        const compiled = compileAssetUnitStamp(droppedUnit, {
          x: worldPt.x,
          y: worldPt.y,
          gridSize: gSize,
          mapScale: currentMap.type
        });
        const updates = {};
        if (compiled.object) updates.objects = [...(currentMap.objects || []), compiled.object];
        if (compiled.token) updates.tokens = [...(currentMap.tokens || []), compiled.token];
        if (compiled.terrain) updates.terrains = [...(currentMap.terrains || []), compiled.terrain];
        if (compiled.walls.length > 0) updates.walls = [...(currentMap.walls || []), ...compiled.walls];
        if (compiled.lights.length > 0) updates.lights = [...(currentMap.lights || []), ...compiled.lights];
        updateMap(activeMapId, updates);
        const primary = compiled.object || compiled.token || compiled.terrain || compiled.walls[0];
        if (primary?.id) setSelectedId(primary.id);
        showToast({ type: 'success', text: `Stamped "${droppedUnit.name || 'Asset'}" at canvas drop.` });
      }
    } catch (err) {
      console.warn('Failed to parse dropped token/asset:', err);
    }
  };

  const handleSummonHeroToken = (data, targetPos = null) => {
    if (!currentMap) return;
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }

    const posX = targetPos ? targetPos.x : Math.round((-position.x + stageSize.width / 2) / scale);
    const posY = targetPos ? targetPos.y : Math.round((-position.y + stageSize.height / 2) / scale);

    const newHeroToken = {
      id: `token_hero_${data.heroId || Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: 'hero',
      linkedHeroId: data.heroId,
      label: data.name || 'Hero',
      name: data.name || 'Hero',
      avatarUrl: data.avatarUrl || null,
      x: posX,
      y: posY,
      radius: 35,
      fill: '#0284c7',
      layerId: 'layer_tokens'
    };

    recordHistory();
    updateMap(activeMapId, { tokens: [...tokens, newHeroToken] });
    AudioService.playTerminalBeep(880, 0.08);
    showToast({ type: 'success', text: `Placed Hero: ${newHeroToken.label}` });
  };

  // Keyboard Shortcuts Hotkeys Manager Listener Element
  useEffect(() => {
    if (isMobile || activeStudioTab !== 'canvas') return;
    const handleKeyDown = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }

      if (e.key === 'Escape') {
        if (isModalOpen) {
          setIsModalOpen(false);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isVttDrawerOpen) {
          setIsVttDrawerOpen(false);
          return;
        }
        if (isUvttModalOpen) {
          setIsUvttModalOpen(false);
          return;
        }
        if (rulerWaypoints && rulerWaypoints.length > 0) {
          clearRuler();
          return;
        }
        if (selectedId) {
          setSelectedId(null);
          return;
        }
        if (activeTool !== 'select') {
          setActiveTool('select');
          return;
        }
      }

      // Do not trigger single-key canvas shortcuts when Ctrl, Alt, or Meta modifiers are held
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        if (activeTool === 'chunk') {
          setChunkRotationDeg(prev => ((prev + 90) % 360));
          return;
        } else if (selectedChunkInstance) {
          handleRetransformChunkInstance(selectedChunkInstance.instanceId, {
            rotationDeg: ((selectedChunkInstance.rotationDeg + 90) % 360)
          });
          return;
        }
      } else if (e.key === 'x' || e.key === 'X') {
        if (activeTool === 'chunk') {
          setChunkFlipX(prev => !prev);
          return;
        } else if (selectedChunkInstance) {
          handleRetransformChunkInstance(selectedChunkInstance.instanceId, {
            flipX: !selectedChunkInstance.flipX
          });
          return;
        }
      } else if (e.key === 'y' || e.key === 'Y') {
        if (activeTool === 'chunk') {
          setChunkFlipY(prev => !prev);
          return;
        } else if (selectedChunkInstance) {
          handleRetransformChunkInstance(selectedChunkInstance.instanceId, {
            flipY: !selectedChunkInstance.flipY
          });
          return;
        }
      } else if (e.key === 'b' || e.key === 'B') {
        setActiveTool(prev => (prev === 'chunk' ? 'select' : 'chunk'));
        return;
      }

      if (e.key === 'g' || e.key === 'G') {
        const nextGrid = (!gridMode || gridMode === 'none' || gridMode === 'off')
          ? 'hex'
          : (gridMode === 'hex' ? 'square' : 'none');
        setGridMode(nextGrid);
        if (activeMapId) updateMap(activeMapId, { gridMode: nextGrid });
      } else if (e.key === 'm' || e.key === 'M') {
        if (activeTool === 'ruler') {
          clearRuler();
          setActiveTool('select');
        } else {
          setActiveTool('ruler');
        }
      } else if (e.key === 'f' || e.key === 'F') {
        setActiveTool(prev => prev === 'fog' ? 'select' : 'fog');
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveTool('pan');
      } else if (e.key === 'w' || e.key === 'W') {
        panBy(0, 50);
      } else if (e.key === 's' || e.key === 'S') {
        panBy(0, -50);
      } else if (e.key === 'a' || e.key === 'A') {
        panBy(50, 0);
      } else if (e.key === 'd' || e.key === 'D') {
        panBy(-50, 0);
      } else if (e.key === '+' || e.key === '=') {
        zoomBy(1.1);
      } else if (e.key === '-' || e.key === '_') {
        zoomBy(1/1.1);
      } else if (e.key === ' ' && !e.repeat && activeTool !== 'pan') {
        e.preventDefault();
        window.__prevMapTool = activeTool;
        setActiveTool('pan');
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setIsShortcutsModalOpen(prev => !prev);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        if (isStoryReadOnly) {
          showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
          return;
        }
        recordHistory();
        updateMap(activeMapId, {
          objects: objects.filter(o => o.id !== selectedId),
          terrains: terrains.filter(t => t.id !== selectedId),
          walls: walls.filter(w => w.id !== selectedId),
          lights: lights.filter(l => l.id !== selectedId),
          lines: lines.filter(l => l.id !== selectedId),
          tokens: tokens.filter(tk => tk.id !== selectedId),
          texts: texts.filter(txt => txt.id !== selectedId),
          fog: fog.filter(f => f.id !== selectedId),
          regions: regions.filter(r => r.id !== selectedId),
          chunkInstances: chunkInstances.filter(ci => ci.instanceId !== selectedId)
        });
        setSelectedId(null);
      }
    };

    const handleKeyUp = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      if (e.key === ' ' && window.__prevMapTool) {
        e.preventDefault();
        setActiveTool(window.__prevMapTool);
        window.__prevMapTool = null;
      }
    };

    const handleWindowBlur = () => {
      if (window.__prevMapTool) {
        setActiveTool(window.__prevMapTool);
        window.__prevMapTool = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isMobile, activeStudioTab, activeMapId, gridMode, currentMap?.gridMode, selectedId, objects, terrains, walls, lights, lines, tokens, texts, fog, regions, chunkInstances, activeTool, zoomBy, panBy, recordHistory, updateMap, isShortcutsModalOpen, isModalOpen, isVttDrawerOpen, isUvttModalOpen, rulerWaypoints, clearRuler, selectedChunkInstance, isStoryReadOnly]);

  const handleCommitPcgSector = ({
    terrains: generatedTerrains = [],
    objects: generatedObjects = [],
    lines: generatedLines = [],
    lights: generatedLights = [],
    walls: generatedWalls = [],
    replaceExisting = true
  }) => {
    let targetId = activeMapId;
    if (!targetId || universeState.maps.length === 0) {
      if (isStoryReadOnly) {
        showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
        return;
      }
      targetId = uuidv4();
      addMap({
        id: targetId,
        type: 'Standard',
        title: 'Generated Sector',
        lines: generatedLines,
        tokens: [],
        terrains: generatedTerrains,
        objects: generatedObjects,
        texts: [],
        fog: [],
        fogEnabled: false,
        gridSize: gridSize || 50,
        lights: generatedLights,
        walls: generatedWalls,
        layers: DEFAULT_LAYERS
      });
      setActiveMapId(targetId);
      showToast({ type: 'success', text: 'Created new Sector from PCG Studio!' });
      setActiveStudioTab('canvas');
      return;
    }
    recordHistory();
    const nextTerrains = replaceExisting ? generatedTerrains : [...terrains, ...generatedTerrains];
    const nextObjects = replaceExisting ? generatedObjects : [...objects, ...generatedObjects];
    const nextLines = replaceExisting ? generatedLines : [...lines, ...generatedLines];
    const nextLights = replaceExisting ? generatedLights : [...(currentMap?.lights || []), ...generatedLights];
    const nextWalls = replaceExisting ? generatedWalls : [...(currentMap?.walls || []), ...generatedWalls];

    updateMap(targetId, {
      terrains: nextTerrains,
      objects: nextObjects,
      lines: nextLines,
      lights: nextLights,
      walls: nextWalls
    });
    showToast({
      type: 'success',
      text: `Deployed PCG Sector: ${generatedTerrains.length} terrains, ${generatedObjects.length} objects, ${generatedLines.length} walls!`
    });
    setActiveStudioTab('canvas');
  };

  const handleCommitLandmass = ({ terrains: generatedTerrains, objects: generatedObjects, replaceExisting }) => {
    handleCommitPcgSector({ terrains: generatedTerrains, objects: generatedObjects, replaceExisting });
  };


  // Layer Helpers
  const toggleLayerVisibility = (layerId) => {
    recordHistory();
    const nextLayers = produce(mapLayers, draft => {
      const layer = draft.find(l => l.id === layerId);
      if (layer) layer.visible = !layer.visible;
    });
    updateMap(activeMapId, { layers: nextLayers });
  };

  const toggleLayerLock = (layerId) => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    recordHistory();
    const nextLayers = produce(mapLayers, draft => {
      const layer = draft.find(l => l.id === layerId);
      if (layer) layer.locked = !layer.locked;
    });
    updateMap(activeMapId, { layers: nextLayers });
  };

  const addCustomLayer = (e) => {
    e.preventDefault();
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    if (!newLayerNameInput.trim()) return;
    recordHistory();
    const newLayer = {
      id: 'layer_' + Date.now(),
      name: newLayerNameInput.trim(),
      visible: true,
      locked: false
    };
    updateMap(activeMapId, { layers: [...mapLayers, newLayer] });
    setNewLayerNameInput('');
  };

  const deleteCustomLayer = async (layerId) => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    if (mapLayers.length <= 1) {
      showToast({ type: 'warning', text: 'Must have at least one layer!' });
      return;
    }
    const targetLayer = mapLayers.find(l => l.id === layerId);
    const layerName = targetLayer?.name || 'this layer';
    if (!await confirmTypedDeletion(layerName, 'map layer')) return;
    recordHistory();
    updateMap(activeMapId, { layers: mapLayers.filter(l => l.id !== layerId) });
  };

  useEffect(() => {
    if (isMobile || !containerRef.current) return;
    const handleResize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    handleResize();

    const ro = new ResizeObserver(() => handleResize());
    ro.observe(containerRef.current);
    window.addEventListener('resize', handleResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile, activeStudioTab]);

  useEffect(() => {
    if (universeState.maps.length > 0 && !activeMapId) {
      setActiveMapId(universeState.maps[0].id);
    }
  }, [universeState.maps, activeMapId, setActiveMapId]);

  const eraseElement = (id) => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    recordHistory();
    updateMap(activeMapId, {
      lines: lines.filter(l => l.id !== id),
      tokens: tokens.filter(t => t.id !== id),
      terrains: terrains.filter(t => t.id !== id),
      walls: walls.filter(w => w.id !== id),
      objects: objects.filter(item => item.id !== id),
      lights: lights.filter(item => item.id !== id),
      texts: texts.filter(item => item.id !== id),
      fog: fog.filter(item => item.id !== id),
      regions: regions.filter(item => item.id !== id),
      chunkInstances: chunkInstances.filter(ci => ci.instanceId !== id)
    });
    if (selectedId === id) setSelectedId(null);
  };

  useEffect(() => {
    setFogEnabled(Boolean(currentMap?.fogEnabled));
  }, [currentMap?.id, currentMap?.fogEnabled]);

  const handleSetFogEnabled = useCallback((nextOrUpdater) => {
    setFogEnabled(prev => {
      const resolved = typeof nextOrUpdater === 'function' ? nextOrUpdater(prev) : Boolean(nextOrUpdater);
      if (activeMapId) {
        updateMap(activeMapId, { fogEnabled: resolved });
      }
      return resolved;
    });
  }, [activeMapId, updateMap]);

  const handleApplyEnvironmentPreset = useCallback((rawPreset) => {
    const presetId = typeof rawPreset === 'string' ? rawPreset : rawPreset?.id;
    if (!presetId) return;
    if (activeMapId) {
      recordHistory('Apply Environment Preset');
      updateMap(activeMapId, { environment: presetId });
    }
    VttEventBus.emit('apply-atmospheric-preset', presetId);
    showToast({ type: 'info', text: `ENVIRONMENT: ${presetId.toUpperCase()}` });
  }, [activeMapId, recordHistory, updateMap]);

  const handleBatchTokenAction = useCallback((action) => {
    if (!activeMapId || !currentMap) return;
    const list = currentMap.tokens || [];
    if (list.length === 0) {
      showToast({ type: 'info', text: `No tokens on map for ${action}.` });
      return;
    }
    recordHistory(`Batch Token Action: ${action}`);
    let nextTokens = list;
    if (action === 'reveal_all') {
      nextTokens = list.map(t => ({ ...t, hidden: false, isHidden: false }));
    } else if (action === 'stealth_all') {
      nextTokens = list.map(t =>
        t.type === 'hero' || t.isPlayer
          ? t
          : { ...t, hidden: true, isHidden: true }
      );
    } else if (action === 'heal_party') {
      nextTokens = list.map(t => {
        const maxVit = t.base_vitality ?? t.maxVitality ?? t.vitality?.max ?? t.base_health ?? t.maxHp ?? 30;
        const maxStruct = t.base_structure ?? t.maxStructure ?? (t.is_synthetic ? 60 : 10);
        const maxHp =
          t.base_health ??
          t.baseHp ??
          (typeof t.health === 'object' && t.health !== null ? t.health.max : undefined) ??
          (typeof t.hp === 'object' && t.hp !== null ? t.hp.max : undefined) ??
          t.maxHp ??
          maxVit;
        return {
          ...t,
          hp: typeof t.hp === 'object' && t.hp !== null ? { ...t.hp, current: maxHp, max: maxHp } : maxHp,
          health: typeof t.health === 'object' && t.health !== null ? { ...t.health, current: maxHp, max: maxHp } : t.health,
          current_health: maxHp,
          current_hp: maxHp,
          current_vitality: maxVit,
          current_structure: maxStruct,
          conditions: [],
          active_conditions: []
        };
      });
    }
    updateMap(activeMapId, { tokens: nextTokens });
    showToast({ type: 'success', text: `BATCH ACTION: ${action.toUpperCase()}` });
  }, [activeMapId, currentMap, recordHistory, updateMap]);

  const handleClearMap = async () => {
    if (!currentMap || !activeMapId) return;
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
      return;
    }
    const confirmed = await confirmTypedDeletion(currentMap?.title || 'Active Map', 'map canvas contents');
    if (!confirmed) return;
    recordHistory('Clear Map Canvas');
    updateMap(activeMapId, {
      lines: [],
      terrains: [],
      walls: [],
      objects: [],
      lights: [],
      texts: [],
      fog: [],
      regions: [],
      chunkInstances: [],
      underlay: null,
      underlays: [],
      videoBackgroundUrl: ''
    });
    setSelectedId(null);
  };

  const { handleExportPNG, computeWallPreviewPoints } = useMapBezierAndExport({
    currentMap,
    stageRef,
    setSelectedId,
    showToast,
    mapExportPngRef
  });

  /**
   * Traverse to Child Scale Map on Node Double Click
   */
  const handleObjectDoubleClick = (obj) => {
    if (obj.isStoryElement || obj.linkedStoryElement || obj.storyElementType || obj.isTrap) {
      setInspectingStoryElement(obj.linkedStoryElement || obj);
      return;
    }

    if (!obj.scaleTarget) return;

    // Check if a linked child map already exists for this object
    if (obj.linkedMapId) {
      const existingMap = universeState.maps.find(m => m.id === obj.linkedMapId);
      if (existingMap) {
        setActiveMapId(existingMap.id);
        setSelectedId(null);
        return;
      }
    }

    // Find if a map of the target scale already exists
    const matchingChildMap = universeState.maps.find(m => m.type === obj.scaleTarget && m.parentMapId === activeMapId);
    if (matchingChildMap) {
      setActiveMapId(matchingChildMap.id);
      setSelectedId(null);
      return;
    }

    // Create a new child scale map
    const newChildId = uuidv4();
    const childTitle = `${obj.label || 'Child Node'} [${obj.scaleTarget}]`;

    addMap({
      id: newChildId,
      type: obj.scaleTarget,
      title: childTitle,
      parentMapId: activeMapId,
      parentVector: { x: obj.x, y: obj.y },
      lines: [], tokens: [], terrains: [], objects: [], texts: [], fog: [], layers: DEFAULT_LAYERS
    });

    // Update current object with linkedMapId reference anchor
    const nextObjects = produce(objects, draft => {
      const item = draft.find(o => o.id === obj.id);
      if (item) item.linkedMapId = newChildId;
    });
    updateMap(activeMapId, { objects: nextObjects });

    setActiveMapId(newChildId);
    setSelectedId(null);
  };

  const createNewMap = (e) => {
    e.preventDefault();
    addMap({
      id: uuidv4(),
      type: newMapType,
      title: newMapTitle,
      lines: [], tokens: [], terrains: [], objects: [], texts: [], fog: [], layers: DEFAULT_LAYERS
    });
    setNewMapTitle('');
    setIsModalOpen(false);
  };

  if (isMobile) {
    return <MobileTacticalBlocker operation="map" onBack={onBackToStory} />;
  }

  return (
    <div className="h-full w-full bg-gray-950 flex flex-col">

      {/* Canvas Keyboard Shortcuts Manager Legend Modal Element */}
      {isShortcutsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShortcutsModalOpen(false);
          }}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans"
        >
          <div className="bg-slate-900 border border-cyan-500/50 rounded-xl w-full max-w-md p-5 text-slate-100 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                <span>⌨️</span> Canvas Hotkeys & Shortcuts
              </h3>
              <button onClick={() => setIsShortcutsModalOpen(false)} className="text-slate-400 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Toggle Grid Mode (Hex / Square / Off)</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-bold rounded border border-slate-700">G</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Deploy Tactical Laser Rangefinder</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-bold rounded border border-slate-700">M</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Toggle Fog of War Tool</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-bold rounded border border-slate-700">F</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Select Tool Mode</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-bold rounded border border-slate-700">V</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Pan Tool / Temporary Pan</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-bold rounded border border-slate-700">H / Space + Drag</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Cancel Action / Clear Ruler / Deselect</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-cyan-400 font-bold rounded border border-slate-700">Esc</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Delete Selected Canvas Node</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-red-400 font-bold rounded border border-slate-700">Del / Backspace</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Toggle Hotkeys Legend</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-bold rounded border border-slate-700">?</kbd>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setIsShortcutsModalOpen(false)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded text-xs uppercase font-mono shadow-md"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans"
        >
          <div className="bg-slate-900 border border-cyan-500/50 rounded-xl p-6 w-full max-w-md shadow-[0_0_30px_rgba(6,182,212,0.3)] text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2">
                <span>🗺️</span> Create New Map
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={createNewMap} className="flex flex-col gap-4 font-mono">
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">Scale / Type</label>
                <select
                  value={newMapType}
                  onChange={e => setNewMapType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:border-cyan-400 outline-none text-xs"
                >
                  {MAP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">Map Title</label>
                <input
                  type="text"
                  value={newMapTitle}
                  onChange={e => setNewMapTitle(e.target.value)}
                  placeholder="E.g. Sol Sector"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:border-cyan-400 outline-none text-xs font-sans"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
                >
                  Create Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Map JSON File Input */}
      <input
        type="file"
        accept=".json"
        ref={mapFileInputRef}
        style={{ display: 'none' }}
        onChange={handleMapFileImport}
      />

      <MapToolbar
        setIsModalOpen={setIsModalOpen}
        undoStack={undoStack}
        redoStack={redoStack}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        gridMode={gridMode}
        setGridMode={setGridMode}
        terrainRenderMode={terrainRenderMode}
        setTerrainRenderMode={setTerrainRenderMode}
        showOmnicortexDrawer={showOmnicortexDrawer}
        setShowOmnicortexDrawer={setShowOmnicortexDrawer}
        showStoryDrawer={showStoryDrawer}
        setShowStoryDrawer={setShowStoryDrawer}
        onOpenInStage={handleOpenInStage}
        showMetadataPanel={showMetadataPanel}
        setShowMetadataPanel={setShowMetadataPanel}
        showKeyPanel={showKeyPanel}
        setShowKeyPanel={setShowKeyPanel}
        selectedId={selectedId}
        eraseElement={eraseElement}
        onClearMap={handleClearMap}
        onResetView={() => { setScale(1); setPosition({x:0, y:0}); }}
        onExportPNG={handleExportPNG}
        onOpenLandmassGenerator={() => setActiveStudioTab('pcg')}
        onOpenAssetManager={() => setActiveStudioTab('assets')}
        onOpenUvttImport={() => setIsUvttModalOpen(true)}
        onSaveMapToFile={handleSaveMapToFile}
        onLoadMapFromFile={() => mapFileInputRef.current?.click()}
        onDeleteActiveMap={handleDeleteActiveMap}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onAddNewMapTab={() => {
          const newId = uuidv4();
          const mapCount = (universeState.maps || []).length + 1;
          const newMapObj = {
            id: newId,
            title: `Map Sector ${mapCount}`,
            type: 'Standard',
            lines: [], tokens: [], terrains: [], objects: [], texts: [], fog: [], layers: DEFAULT_LAYERS
          };
          addMap(newMapObj);
        }}
        onDeleteMapTab={async (mapId, title) => {
          if (await confirmTypedDeletion(title || 'Untitled Map', 'map element')) {
            deleteMap(mapId);
          }
        }}
        isVttDrawerOpen={isVttDrawerOpen}
        onToggleVttDrawer={() => setIsVttDrawerOpen(prev => !prev)}
        is3DPreviewOpen={is3DPreviewOpen}
        onToggle3DPreview={() => setIs3DPreviewOpen(prev => !prev)}
      />

      {is3DPreviewOpen && (
        <Suspense fallback={null}>
          <MapMaker3DPreviewModal
            isOpen={is3DPreviewOpen}
            onClose={() => setIs3DPreviewOpen(false)}
            currentMap={currentMap}
            tokens={tokens}
          />
        </Suspense>
      )}

      <StoryFoundryGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialTab="map-maker"
      />


      {/* Post-Placement Chunk Instance Inspector Bar */}
      {selectedChunkInstance && (
        <PlacedChunkInspectorBar
          chunkInstance={selectedChunkInstance}
          onRetransformInstance={handleRetransformChunkInstance}
          onExplodeInstance={handleExplodeChunkInstance}
          onSaveInstanceAsBlueprint={handleSaveInstanceAsBlueprint}
          onDeleteInstance={handleDeleteChunkInstance}
        />
      )}

      {/* In-Situ Marquee Region Capture Banner */}
      {chunkCaptureMarquee && !chunkCaptureMarquee.active && (
        <div className="relative z-[82] bg-emerald-950/95 px-3 py-1.5 border-b border-emerald-400/60 flex items-center justify-between text-xs font-mono text-emerald-100">
          <span>
            📐 Selected Map Region ({Math.max(1, Math.round(Math.abs(chunkCaptureMarquee.endX - chunkCaptureMarquee.startX) / (gridSize || 50)))}×
            {Math.max(1, Math.round(Math.abs(chunkCaptureMarquee.endY - chunkCaptureMarquee.startY) / (gridSize || 50)))} cells) ready to package as a reusable Map Chunk!
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCaptureMarqueeAsChunk}
              className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer shadow-sm"
            >
              Save Selection as Map Chunk
            </button>
            <button
              type="button"
              onClick={() => setChunkCaptureMarquee(null)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Unified Selected Element Inspector Bar (Tokens, Objects, Walls/Doors, Lights, Texts, Regions) */}
      <SelectedElementInspectorBar
        currentMap={currentMap}
        selectedId={selectedId}
        isStoryReadOnly={isStoryReadOnly}
        availableMaps={universeState.maps || []}
        activeMapId={activeMapId}
        onRecordHistory={recordHistory}
        onDeleteSelected={eraseElement}
        onClose={() => setSelectedId(null)}
        onInspectOmnicortexItem={(item) => setInspectingOmnicortexItem(item)}
        onInspectStoryElement={(element) => setInspectingStoryElement(element)}
        onUpdateToken={(updatedToken) => {
          if (isStoryReadOnly || !updatedToken) return;
          const nextTokens = produce(tokens, (draft) => {
            const target = draft.find((t) => t.id === updatedToken.id);
            if (target) Object.assign(target, updatedToken);
          });
          updateMap(activeMapId, { tokens: nextTokens });
        }}
        onUpdateObject={(updatedObj) => {
          if (isStoryReadOnly || !updatedObj) return;
          const nextObjects = produce(objects, (draft) => {
            const target = draft.find((o) => o.id === updatedObj.id);
            if (target) Object.assign(target, updatedObj);
          });
          updateMap(activeMapId, { objects: nextObjects });
        }}
        onUpdateWall={(wallId, patch) => {
          if (isStoryReadOnly) return;
          const nextWalls = walls.map((w) => (w.id === wallId ? { ...w, ...patch } : w));
          updateMap(activeMapId, { walls: nextWalls });
        }}
        onUpdateLight={(lightId, patch) => {
          if (isStoryReadOnly) return;
          const nextLights = lights.map((lt) => (lt.id === lightId ? { ...lt, ...patch } : lt));
          updateMap(activeMapId, { lights: nextLights });
        }}
        onUpdateText={(updatedText) => {
          if (isStoryReadOnly || !updatedText) return;
          const nextTexts = texts.map((txt) => (txt.id === updatedText.id ? updatedText : txt));
          updateMap(activeMapId, { texts: nextTexts });
        }}
        onUpdateRegion={(regionId, patch) => {
          if (isStoryReadOnly) return;
          const nextRegions = regions.map((rg) => (rg.id === regionId ? { ...rg, ...patch } : rg));
          updateMap(activeMapId, { regions: nextRegions });
        }}
      />

      {/* Primary Workspace Tab Bar: Tabs in place of split windows */}
      <MapMakerTabBar activeTab={activeStudioTab} onSelectTab={setActiveStudioTab} onOpenInStage={handleOpenInStage} />

      {/* Studio Work Area: Tabbed Mode */}
      {activeStudioTab === 'canvas' && (
        <div className="flex-1 flex overflow-hidden relative">

        <OmnicortexAssetDrawer
          showDrawer={showOmnicortexDrawer}
          setShowDrawer={setShowOmnicortexDrawer}
          onSummonAsset={(item, cat) => handleSummonOmnicortexAsset(item, cat)}
        />

        <StoryElementsDrawer
          showDrawer={showStoryDrawer}
          setShowDrawer={setShowStoryDrawer}
          onSummonElement={(element) => handleSummonStoryElement(element)}
          onInspectElement={(element) => setInspectingStoryElement(element)}
        />

        {inspectingStoryElement && (
          <StoryElementModal
            isOpen={!!inspectingStoryElement}
            onClose={() => setInspectingStoryElement(null)}
            element={inspectingStoryElement}
            isStoryReadOnly={isStoryReadOnly}
            mapObjectNode={objects.find(o => o.id === inspectingStoryElement.id || o.storyElementId === inspectingStoryElement.id)}
            onUpdateMapObject={(objId, updates) => {
              if (isStoryReadOnly) return;
              recordHistory();
              const nextObjs = objects.map(o => o.id === objId ? { ...o, ...updates } : o);
              updateMap(activeMapId, { objects: nextObjs });
            }}
            onTriggerFloatingText={(x, y, msg) => showToast({ type: 'info', text: String(msg) })}
            scale={scale}
            position={position}
          />
        )}

        <MapMetadataPanel
          showPanel={showMetadataPanel}
          setShowPanel={setShowMetadataPanel}
          currentMap={currentMap}
          updateMap={updateMap}
          universeState={universeState}
          setActiveMapId={setActiveMapId}
          isStoryReadOnly={isStoryReadOnly}
        />

        <MapAssetManagerModal
          isOpen={isAssetManagerOpen}
          onClose={() => setIsAssetManagerOpen(false)}
          customAssets={universeState.customAssets || { terrains: [], objects: [] }}
          onAddCustomTerrain={addCustomTerrain}
          onUpdateCustomTerrain={updateCustomTerrain}
          onDeleteCustomTerrain={deleteCustomTerrain}
          onAddCustomObject={addCustomObject}
          onUpdateCustomObject={updateCustomObject}
          onDeleteCustomObject={deleteCustomObject}
          currentScale={currentMap?.type || 'Planetary'}
        />

        {/* Canvas Area */}
        <div
          ref={containerRef}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={handleStageDrop}
          onContextMenu={(e) => {
            e.preventDefault();
          }}
          className={`flex-1 h-full min-w-0 relative ${activeTool === 'select' || activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : (activeTool === 'eraser' ? 'cursor-pointer' : 'cursor-crosshair')}`}
        >

          {/* Map Key Panel (Docked safely inside Canvas area to avoid overlapping rails) */}
          <MapKeyPanel
            showKeyPanel={showKeyPanel}
            setShowKeyPanel={setShowKeyPanel}
            currentMap={currentMap}
            setSelectedId={setSelectedId}
            selectedId={selectedId}
            setPosition={setPosition}
            scale={scale}
            stageSize={stageSize}
          />

          {/* Floating Canvas Quick Launchers & Tactical HUD (Adjustment Sliders) */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            {/* Tactical Adjustment Sliders HUD */}
            <div className="flex items-center gap-2 bg-slate-950/90 border border-cyan-500/50 rounded-xl px-2.5 py-1.5 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl font-mono text-xs">
              {/* Zoom Slider */}
              <div className="flex items-center gap-1.5 border-r border-slate-800 pr-2">
                <span className="text-[10px] text-cyan-400 font-bold uppercase">ZOOM</span>
                <button
                  type="button"
                  onClick={() => zoomBy(0.85)}
                  className="w-5 h-5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center font-bold cursor-pointer transition-colors"
                  title="Zoom Out"
                >
                  -
                </button>
                <input
                  type="range"
                  min={0.15}
                  max={3.0}
                  step={0.05}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-16 h-1 accent-cyan-400 bg-slate-800 rounded cursor-pointer"
                  title={`Zoom: ${Math.round(scale * 100)}%`}
                />
                <button
                  type="button"
                  onClick={() => zoomBy(1.15)}
                  className="w-5 h-5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center font-bold cursor-pointer transition-colors"
                  title="Zoom In"
                >
                  +
                </button>
                <span className="text-[10px] font-bold text-cyan-300 w-9 text-right">{Math.round(scale * 100)}%</span>
              </div>

              {/* Grid Size Slider */}
              <div className="flex items-center gap-1.5 border-r border-slate-800 pr-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase">GRID</span>
                <input
                  type="range"
                  min={25}
                  max={120}
                  step={5}
                  value={gridSize}
                  onChange={(e) => {
                    const nextSize = Number(e.target.value);
                    setGridSize(nextSize);
                    if (activeMapId) updateMap?.(activeMapId, { gridSize: nextSize });
                  }}
                  className="w-14 h-1 accent-amber-400 bg-slate-800 rounded cursor-pointer"
                  title={`Grid Size: ${gridSize}px`}
                />
                <span className="text-[10px] font-bold text-amber-300 w-7 text-right">{gridSize}px</span>
              </div>

              {/* Recenter Map Button */}
              <button
                type="button"
                onClick={() => {
                  setScale(1);
                  const mapW = currentMap?.width || 2800;
                  const mapH = currentMap?.height || 2100;
                  const centerX = (stageSize.width - mapW) / 2;
                  const centerY = (stageSize.height - mapH) / 2;
                  setPosition({ x: centerX, y: centerY });
                  AudioService.playTerminalBeep(1100, 0.05);
                }}
                className="px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/60 hover:bg-cyan-500 hover:text-black text-cyan-300 text-[10px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                title="Center Map View"
              >
                <span>🎯</span>
                <span className="hidden md:inline">Center</span>
              </button>
            </div>

            {/* Pro Cartography & Animated Underlay Controls */}
            <button
              type="button"
              onClick={() => setIsUnderlayModalOpen(true)}
              className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all shadow-lg backdrop-blur-md flex items-center gap-1 cursor-pointer border ${
                currentMap?.videoBackgroundUrl || currentMap?.underlay?.url
                  ? 'bg-amber-950/85 border-amber-400 text-amber-200'
                  : 'bg-black/80 hover:bg-slate-900 border-slate-700 text-slate-300'
              }`}
              title="Calibrate Blueprint Underlay or Animated .webm/.mp4 Video Battlemap"
            >
              <span>🎬</span>
              <span>Underlay</span>
            </button>
            <button
              type="button"
              onClick={() => updateMap(activeMapId, { enableWallShadows: currentMap?.enableWallShadows === false })}
              className={`px-2 py-1.5 rounded-xl font-mono text-[10px] font-bold transition-all backdrop-blur-md cursor-pointer border ${
                currentMap?.enableWallShadows !== false
                  ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200'
                  : 'bg-black/80 border-slate-700 text-slate-400'
              }`}
              title="Toggle Wall Drop-Shadow Pass"
            >
              Shadows
            </button>
            <button
              type="button"
              onClick={() => setSoftTerrainEdge(prev => !prev)}
              className={`px-2 py-1.5 rounded-xl font-mono text-[10px] font-bold transition-all backdrop-blur-md cursor-pointer border ${
                softTerrainEdge
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                  : 'bg-black/80 border-slate-700 text-slate-400'
              }`}
              title="Toggle Soft Terrain Brush Feathering"
            >
              Soft Brush
            </button>
            <button
              type="button"
              onClick={() => setPaintRoofLayer(prev => !prev)}
              className={`px-2 py-1.5 rounded-xl font-mono text-[10px] font-bold transition-all backdrop-blur-md cursor-pointer border ${
                paintRoofLayer
                  ? 'bg-purple-950/80 border-purple-500/60 text-purple-200'
                  : 'bg-black/80 border-slate-700 text-slate-400'
              }`}
              title="Toggle Painting Onto Roof Canopy Layer"
            >
              Roof
            </button>

            {/* VTT Console Launcher */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(950, 0.05);
                setIsVttDrawerOpen(prev => !prev);
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5 cursor-pointer border ${
                isVttDrawerOpen
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-black/80 hover:bg-slate-900 border-cyan-500/60 text-cyan-300'
              }`}
            >
              <span>🎮</span>
              <span>VTT Console ({vttRole.toUpperCase()})</span>
            </button>
          </div>

          {!currentMap ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold text-xl italic">
              Please create or select a map.
            </div>
          ) : (
            <>
              {currentMap?.videoBackgroundUrl && (
                <video
                  src={currentMap.videoBackgroundUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-hidden="true"
                  className="absolute top-0 left-0 object-cover pointer-events-none"
                  style={{
                    width: `${currentMap?.width || 2800}px`,
                    height: `${currentMap?.height || 2100}px`,
                    opacity: currentMap?.underlay?.visible === false ? 0 : (currentMap?.underlay?.opacity ?? 0.85),
                    transformOrigin: '0 0',
                    transform: `translate(${position.x + (currentMap?.underlay?.offsetX || 0) * scale}px, ${position.y + (currentMap?.underlay?.offsetY || 0) * scale}px) scale(${scale * (currentMap?.underlay?.scale || 1)})`
                  }}
                />
              )}
              <MapMakerPixiCanvas
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                scale={scale}
                position={position}
                currentMap={currentMap}
                gridMode={gridMode}
                gridSize={gridSize}
                terrains={terrains}
                lines={lines}
                objects={objects}
                walls={walls}
                lights={lights}
                texts={texts}
                tokens={tokens}
                regions={regions}
                fog={fog}
                fogEnabled={fogEnabled}
                visibilityPolygon={visibilityPolygon}
                activePings={activePings}
                rulerWaypoints={rulerWaypoints}
                rulerPointer={rulerPointer}
                chunkGhostPreviewData={chunkGhostPreviewData}
                chunkCaptureMarquee={chunkCaptureMarquee}
                activeTool={activeTool}
                selectedId={selectedId}
                wallStartPoint={wallStartPoint}
                wallPreviewEnd={wallPreviewEnd}
                computeWallPreviewPoints={computeWallPreviewPoints}
                selectedWallType={selectedWallType}
                paintRoofLayer={paintRoofLayer}
                measurementUnit={measurementUnit}
                rulerSelectedPace={rulerSelectedPace}
                isStoryReadOnly={isStoryReadOnly}
                isLayerVisible={isLayerVisible}
                isLayerLocked={isLayerLocked}
                onWheel={handleWheel}
                onPointerDownEmptyOrTool={handleMouseDown}
                onPointerMove={handleMouseMove}
                onPointerUp={handleMouseUp}
                onStagePan={setPosition}
                onSelect={(id) => {
                  if (id === null) setSelectedId(null);
                  else if (activeTool === 'select') setSelectedId(id);
                }}
                onSelectToken={(tokenId) => {
                  if (activeTool === 'select' && !isLayerLocked('layer_tokens')) handleSelectToken(tokenId);
                }}
                onErase={eraseElement}
                onToggleDoor={handleToggleDoor}
                onUpdateWall={(wallId, patch) => {
                  if (isStoryReadOnly) {
                    showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
                    return;
                  }
                  recordHistory('Edit Wall Geometry');
                  const gSz = currentMap?.gridSize || gridSize || 50;
                  const gMode = currentMap?.gridMode || gridMode || 'hex';
                  const snappedPatch = {
                    ...patch,
                    ...(patch.p1 ? { p1: snapPointToGrid(patch.p1, gSz, gMode, gridSnap) } : {}),
                    ...(patch.p2 ? { p2: snapPointToGrid(patch.p2, gSz, gMode, gridSnap) } : {})
                  };
                  const nextWalls = walls.map((item) => (item.id === wallId ? { ...item, ...snappedPatch } : item));
                  updateMap(activeMapId, { walls: nextWalls });
                }}
                onUpdateObject={(newAttrs) => {
                  if (isStoryReadOnly) {
                    showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
                    return;
                  }
                  recordHistory('Move Object');
                  const gSz = currentMap?.gridSize || gridSize || 50;
                  const gMode = currentMap?.gridMode || gridMode || 'hex';
                  const snappedPt = snapPointToGrid({ x: newAttrs.x, y: newAttrs.y }, gSz, gMode, gridSnap);
                  const nextObj = { ...newAttrs, x: snappedPt.x, y: snappedPt.y };
                  const nextObjects = produce(objects, (draft) => {
                    const index = draft.findIndex((o) => o.id === nextObj.id);
                    if (index !== -1) draft[index] = nextObj;
                  });
                  updateMap(activeMapId, { objects: nextObjects });
                }}
                onUpdateToken={(newAttrs) => {
                  if (isStoryReadOnly) {
                    showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
                    return;
                  }
                  recordHistory('Move Token');
                  const gSz = currentMap?.gridSize || gridSize || 50;
                  const gMode = currentMap?.gridMode || gridMode || 'hex';
                  const snappedPt = snapPointToGrid({ x: newAttrs.x, y: newAttrs.y }, gSz, gMode, gridSnap);
                  const nextTk = { ...newAttrs, x: snappedPt.x, y: snappedPt.y };
                  const nextTokens = produce(tokens, (draft) => {
                    const index = draft.findIndex((t) => t.id === nextTk.id);
                    if (index !== -1) draft[index] = nextTk;
                  });
                  updateMap(activeMapId, { tokens: nextTokens });
                }}
                onUpdateLight={(lightId, lx, ly) => {
                  if (isStoryReadOnly) {
                    showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
                    return;
                  }
                  recordHistory('Move Light');
                  const gSz = currentMap?.gridSize || gridSize || 50;
                  const gMode = currentMap?.gridMode || gridMode || 'hex';
                  const snappedPt = snapPointToGrid({ x: lx, y: ly }, gSz, gMode, gridSnap);
                  const nextLights = produce(lights, (draft) => {
                    const idx = draft.findIndex((item) => item.id === lightId);
                    if (idx !== -1) {
                      draft[idx].x = snappedPt.x;
                      draft[idx].y = snappedPt.y;
                    }
                  });
                  updateMap(activeMapId, { lights: nextLights });
                }}
                onUpdateText={(newAttrs) => {
                  if (isStoryReadOnly) {
                    showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
                    return;
                  }
                  recordHistory('Move Text');
                  const gSz = currentMap?.gridSize || gridSize || 50;
                  const gMode = currentMap?.gridMode || gridMode || 'hex';
                  const snappedPt = snapPointToGrid({ x: newAttrs.x, y: newAttrs.y }, gSz, gMode, gridSnap);
                  const nextTxt = { ...newAttrs, x: snappedPt.x, y: snappedPt.y };
                  const nextTexts = produce(texts, (draft) => {
                    const index = draft.findIndex((t) => t.id === nextTxt.id);
                    if (index !== -1) draft[index] = nextTxt;
                  });
                  updateMap(activeMapId, { texts: nextTexts });
                }}
                onUpdateRegion={(regionId, bounds) => {
                  if (isStoryReadOnly) {
                    showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
                    return;
                  }
                  recordHistory('Move Region');
                  const gSz = currentMap?.gridSize || gridSize || 50;
                  const gMode = currentMap?.gridMode || gridMode || 'hex';
                  const snappedPt = snapPointToGrid({ x: bounds.x, y: bounds.y }, gSz, gMode, gridSnap);
                  const nextBounds = { ...bounds, x: snappedPt.x, y: snappedPt.y };
                  const nextRegions = regions.map((r) => (r.id === regionId ? { ...r, bounds: nextBounds } : r));
                  updateMap(activeMapId, { regions: nextRegions });
                }}
                onObjectDoubleClick={handleObjectDoubleClick}
                onTokenDoubleClick={(token) => {
                  if (token.type === 'link' && token.targetMapId) {
                    setActiveMapId(token.targetMapId);
                    setSelectedId(null);
                  }
                }}
                onTokenDragMove={(worldPos, token, nativeEvt) => {
                  if (nativeEvt?.shiftKey || activeTool === 'ruler') {
                    setRulerWaypoints([{ x: token.x, y: token.y }]);
                    setRulerPointer({ x: worldPos.x, y: worldPos.y });
                  }
                }}
                onTokenDragEnd={() => {
                  if (rulerWaypoints?.length > 0 && activeTool !== 'ruler') {
                    clearRuler();
                  }
                }}
              />
            </>
          )}
        </div>

        {/* Secondary Right Nav Rail: Architect Console (World-building & Director, hidden in operative role) */}
        {vttRole !== 'operative' && (
          <ArchitectConsoleRail
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            isCollapsed={isRightRailCollapsed}
            onToggleCollapse={() => setIsRightRailCollapsed(prev => !prev)}
            isPinned={isRightRailPinned}
            onTogglePin={() => setIsRightRailPinned(prev => !prev)}
            selectedTerrain={selectedTerrain}
            setSelectedTerrain={setSelectedTerrain}
            terrainWidth={terrainWidth}
            setTerrainWidth={setTerrainWidth}
            selectedObjectType={selectedObjectType}
            setSelectedObjectType={setSelectedObjectType}
            selectedWallType={selectedWallType}
            setSelectedWallType={setSelectedWallType}
            doorLockDc={doorLockDc}
            setDoorLockDc={setDoorLockDc}
            selectedRegionType={selectedRegionType}
            setSelectedRegionType={setSelectedRegionType}
            enableWallShadows={currentMap?.enableWallShadows !== false}
            onToggleWallShadows={() => updateMap(activeMapId, { enableWallShadows: currentMap?.enableWallShadows === false })}
            paintRoofLayer={paintRoofLayer}
            onTogglePaintRoofLayer={() => setPaintRoofLayer((prev) => !prev)}
            rulerSelectedPace={rulerSelectedPace}
            setRulerSelectedPace={setRulerSelectedPace}
            measurementUnit={measurementUnit}
            setMeasurementUnit={setMeasurementUnit}
            activeSensorMode={activeSensorMode}
            setActiveSensorMode={setActiveSensorMode}
            pencilColor={pencilColor}
            setPencilColor={setPencilColor}
            pencilWidth={pencilWidth}
            setPencilWidth={setPencilWidth}
            tokenType={tokenType}
            setTokenType={setTokenType}
            tokenLabelInput={tokenLabelInput}
            setTokenLabelInput={setTokenLabelInput}
            tokenOmnicortexData={tokenOmnicortexData}
            onOpenOmnicortexLink={() => setIsTokenSelectorOpen(true)}
            textLabelInput={textLabelInput}
            setTextLabelInput={setTextLabelInput}
            textColor={textColor}
            setTextColor={setTextColor}
            textSize={textSize}
            setTextSize={setTextSize}
            fogEnabled={fogEnabled}
            setFogEnabled={handleSetFogEnabled}
            currentMapScale={currentMap?.type || 'Planetary'}
            customAssets={universeState.customAssets || { terrains: [], objects: [] }}
            selectedLightColor={selectedLightColor}
            setSelectedLightColor={setSelectedLightColor}
            selectedLightRadius={selectedLightRadius}
            setSelectedLightRadius={setSelectedLightRadius}
            selectedLightAnimation={selectedLightAnimation}
            setSelectedLightAnimation={setSelectedLightAnimation}
            mapLayers={mapLayers}
            onToggleLayerVisibility={toggleLayerVisibility}
            onToggleLayerLock={toggleLayerLock}
            onDeleteCustomLayer={deleteCustomLayer}
            newLayerNameInput={newLayerNameInput}
            setNewLayerNameInput={setNewLayerNameInput}
            onAddCustomLayer={addCustomLayer}
            onApplyEnvironmentPreset={handleApplyEnvironmentPreset}
            onBatchTokenAction={handleBatchTokenAction}
            onBroadcastMessage={(msg) => {
              showToast({ type: 'info', text: msg });
            }}
            onOpenAssetManager={() => setActiveStudioTab('assets')}
            onOpenStoryDrawer={() => setShowStoryDrawer(true)}
            onOpenOmnicortexDrawer={() => setShowOmnicortexDrawer(true)}
            onOpenLandmassGenerator={() => setActiveStudioTab('pcg')}
            onOpenPcgStudio={() => setActiveStudioTab('pcg')}
            onOpenAssetStudio={() => setActiveStudioTab('assets')}
            onOpenAssetIngestion={() => setActiveStudioTab('assets')}
            onOpenUvttImport={() => setIsUvttModalOpen(true)}
            selectedChunk={selectedChunk}
            setSelectedChunk={setSelectedChunk}
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
            onOpenChunkStudio={() => setActiveStudioTab('chunks')}
          />
        )}
      </div>
      )}

      {/* Tab: Asset Studio & Property Forge */}
      {activeStudioTab === 'assets' && (
        <AssetStudioTab
          onStampAssetOnMap={handleStampAssetOnMap}
          onEquipTerrainBrush={handleEquipTerrainBrush}
          onOpenChunkStudio={() => setActiveStudioTab('chunks')}
        />
      )}

      {/* Tab: Chunk Forge Studio & Construction Point Workbench */}
      {activeStudioTab === 'chunks' && (
        <Suspense fallback={null}>
          <ChunkStudioModal
            isEmbeddedTab={true}
            initialChunk={chunkStudioInitialBlueprint || selectedChunk}
            customChunks={universeState?.customAssets?.chunks || []}
            onSaveChunk={(savedChunk) => {
              const exists = (universeState?.customAssets?.chunks || []).some(
                c => c.chunkId === savedChunk.chunkId
              );
              if (exists && updateCustomChunk) {
                updateCustomChunk(savedChunk.chunkId, savedChunk);
              } else if (addCustomChunk) {
                addCustomChunk(savedChunk);
              }
              setSelectedChunk(savedChunk);
            }}
            onDeleteChunk={(chunkId) => {
              if (deleteCustomChunk) deleteCustomChunk(chunkId);
            }}
            onSelectChunkToStamp={(chunk, initialTransform) => {
              setSelectedChunk(chunk);
              if (initialTransform) {
                setChunkRotationDeg(initialTransform.rotationDeg || 0);
                setChunkFlipX(Boolean(initialTransform.flipX));
                setChunkFlipY(Boolean(initialTransform.flipY));
              }
              setActiveTool('chunk');
              setActiveStudioTab('canvas');
              showToast({
                type: 'info',
                text: `Ready to stamp "${chunk.name}" on canvas! Hover & click to place (R: rotate 90° CW, X/Y: flip).`
              });
            }}
          />
        </Suspense>
      )}

      {/* Tab: PCG & AI Co-Pilot */}
      {activeStudioTab === 'pcg' && (
        <PcgAiStudioTab
          currentMap={currentMap}
          mapWidthCells={currentMap?.gridWidth || 40}
          mapHeightCells={currentMap?.gridHeight || 30}
          gridSize={gridSize || 50}
          stageWidth={currentMap?.gridWidth ? currentMap.gridWidth * gridSize : 4000}
          stageHeight={currentMap?.gridHeight ? currentMap.gridHeight * gridSize : 3000}
          terrainRenderMode={terrainRenderMode}
          onCommitPcgSector={handleCommitPcgSector}
          onApplyPcgTerrain={handleApplyPcgTerrain}
          onApplyDecorations={handleApplyDecorations}
          onDeployToCanvas={() => setActiveStudioTab('canvas')}
        />
      )}

      {/* Tab: Universal VTT (.dd2vtt) & Foundry Compendium Export */}
      {activeStudioTab === 'export' && (
        <VttExportTab
          currentMap={currentMap}
          onExportPNG={handleExportPNG}
        />
      )}

      {/* Universal VTT (.dd2vtt) Importer Modal */}
      <UvttImportModal
        isOpen={isUvttModalOpen}
        onClose={() => setIsUvttModalOpen(false)}
        onImportComplete={(importedMap) => {
          if (isStoryReadOnly) {
            showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
            return;
          }
          addMap(importedMap);
          setActiveMapId(importedMap.id);
          showToast({ type: 'success', text: `Universal VTT Imported: ${importedMap.title}` });
        }}
      />

      {/* Unified Tactical VTT Command Drawer */}
      <VttCommandDrawer
        isOpen={isVttDrawerOpen}
        onClose={() => setIsVttDrawerOpen(false)}
        vttRole={vttRole}
        onChangeVttRole={setVttRole}
        activeMapId={activeMapId}
        allMaps={universeState.maps}
        tokens={tokens}
        teamRoster={teamRoster}
        onUpdateTeamRoster={setTeamRoster}
        gridSnap={gridSnap}
        onToggleGridSnap={() => setGridSnap(prev => !prev)}
        gridSize={gridSize}
        onChangeGridSize={(nextSize) => {
          setGridSize(nextSize);
          if (activeMapId) updateMap?.(activeMapId, { gridSize: nextSize });
        }}
        gridMode={gridMode}
        onChangeGridMode={(nextMode) => {
          setGridMode(nextMode);
          if (activeMapId) updateMap?.(activeMapId, { gridMode: nextMode });
        }}
        measurementUnit={measurementUnit}
        onChangeMeasurementUnit={setMeasurementUnit}
        fogEnabled={fogEnabled}
        onToggleFog={() => handleSetFogEnabled(prev => !prev)}
        onDropPing={(pingType) => handleDropTacticalPing(pingType)}
        onApplyEnvironmentPreset={handleApplyEnvironmentPreset}
        onBatchTokenAction={handleBatchTokenAction}
        onBroadcastMessage={(msg) => showToast({ type: 'info', text: msg })}
        onPublishSpectator={() => {
          if (publishSpectatorMap && activeMapId) {
            publishSpectatorMap(activeMapId);
          }
        }}
      />

      <UnifiedRelationalSelectorModal
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        sourceCollection="Bestiary"
        isMulti={false}
        selectedValues={[]}
        onChange={(selection) => {
          if (selection && selection.length > 0) {
            const item = selection[0];
            setTokenLabelInput(item.name || item.title || 'Unit');
            const health = parseInt(item.health) || parseInt(item.vitality) || parseInt(item.hp) || 30;
            setTokenOmnicortexData({ hp: health, entityId: item.id });
          }
          setIsTokenSelectorOpen(false);
        }}
        fieldLabel="Import Stats"
      />

      {/* Blueprint & Video Underlay Calibration Modal */}
      <MapUnderlayCalibrationModal
        isOpen={isUnderlayModalOpen}
        onClose={() => setIsUnderlayModalOpen(false)}
        currentUnderlay={currentMap?.underlay}
        currentVideoUrl={currentMap?.videoBackgroundUrl || ''}
        userId={auth?.currentUser?.uid || null}
        mapId={activeMapId || 'map'}
        onApplyUnderlay={(cfg) => {
          if (isStoryReadOnly) {
            showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
            return;
          }
          recordHistory('Apply Map Underlay');
          updateMap(activeMapId, {
            underlay: cfg,
            videoBackgroundUrl: cfg.videoBackgroundUrl || ''
          });
          showToast({
            type: 'success',
            text: cfg.videoBackgroundUrl ? 'Animated video map underlay applied!' : 'Blueprint underlay calibrated.'
          });
        }}
        onClearUnderlay={() => {
          if (isStoryReadOnly) {
            showToast({ type: 'warning', text: 'Story is read-only. Map edits are disabled.' });
            return;
          }
          recordHistory('Clear Map Underlay');
          updateMap(activeMapId, { underlay: null, videoBackgroundUrl: '' });
          showToast({ type: 'info', text: 'Map underlay cleared.' });
        }}
      />

      {/* Omnicortex Compendium Item Sheet Modal */}
      {inspectingOmnicortexItem && (
        <DBMItemModal
          isOpen={!!inspectingOmnicortexItem}
          onClose={() => setInspectingOmnicortexItem(null)}
          categoryKey={inspectingOmnicortexItem._categoryKey || inspectingOmnicortexItem.category || 'compendium'}
          initialItem={inspectingOmnicortexItem}
        />
      )}
    </div>
  );
};

export default MapPane;
