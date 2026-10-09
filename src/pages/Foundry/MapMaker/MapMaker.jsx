import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Circle, Text as KonvaText, Line, RegularPolygon, Image as KonvaImage, Group } from 'react-konva';
import { useCampaign, formatExportFilename } from '../../../context/CampaignContext';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { showToast } from '../../../context/ToastContext';
import VttCommandDrawer from './map/VttCommandDrawer';
import { createTacticalPing, filterExpiredPings } from '../../../services/mapPingService';
import { createDefaultTeamRoster, canUserControlToken, isUserArchitect, VTT_ROLES } from '../../../services/vttTeamService';

import { MAP_TYPES, DEFAULT_LAYERS, MASTER_TERRAINS, MASTER_OBJECTS, PENCIL_COLORS, PENCIL_WIDTHS, TEXT_COLORS } from './map/MapConstants';
import { MapObjectNode, TokenNode, TextLabelNode } from './map/MapObjectNode';
import MapWallNode from './map/MapWallNode';
import WaypointRulerOverlay from './map/WaypointRulerOverlay';
import UvttImportModal from './map/UvttImportModal';
import { computeVisibilityPolygon } from '../../../services/raycastVisionService';
import { toggleDoorState, damageWallSegment } from '../../../schemas/vttWallSchema';
import SpatialAudio from '../../../services/spatialAudioService';
import MapToolbar from './map/MapToolbar';
import ArchitectConsoleRail from './map/ArchitectConsoleRail';
import MapToolsPanel from './map/MapToolsPanel';
import MapLayersPanel from './map/MapLayersPanel';
import MapMetadataPanel from './map/MapMetadataPanel';
import MapKeyPanel from './map/MapKeyPanel';
import MapAssetManagerModal from './map/MapAssetManagerModal';
import OmnicortexAssetDrawer from './map/OmnicortexAssetDrawer';
import StoryElementsDrawer from './map/StoryElementsDrawer';
import StoryElementModal from './map/StoryElementModal';
import { DBMItemModal } from '../../../components/DBM/DBMItemModal';
import { StoryFoundryGuideModal } from '../../../components/StoryFoundry/StoryFoundryGuideModal';
import { useFolio } from '../../../context/FolioContext';
import { AudioService } from '../../../services/audioService';
import MapMaker3DPreviewModal from './components/MapMaker3DPreviewModal';

import { useMapHistory } from './hooks/useMapHistory';
import { useMapCanvasEvents } from './hooks/useMapCanvasEvents';
import { UnifiedRelationalSelectorModal } from '../../../components/DBM/UnifiedRelationalSelectorModal';
import { 
  getStarterMapsCollection, 
  createDerelictStarshipMap, 
  createResearchOutpostMap 
} from '../../../components/VTT/stage/defaultMaps';

import { getBiomeTextureUrl } from './map/landmassGenerator';
import { getTextureUrlFromColor } from './map/MapTextures';
import { VttEventBus } from '../../../utils/vttEventBus';
import { MapMakerTabBar } from './components/MapMakerTabBar';
import { AssetStudioTab } from './components/AssetStudioTab';
import { PcgAiStudioTab } from './components/PcgAiStudioTab';
import { VttExportTab } from './components/VttExportTab';
import { MobileTacticalBlocker } from '../../../components/StoryFoundry/MobileTacticalBlocker';
import { useIsMobile } from '../../../hooks/useIsMobile';

const TerrainImageNode = ({ t, isEraser, isLocked, onErase }) => {
  const [imageObj, setImageObj] = useState(null);

  useEffect(() => {
    if (t.imageUrl) {
      const img = new window.Image();
      img.src = t.imageUrl;
      img.onload = () => setImageObj(img);
    }
  }, [t.imageUrl]);

  if (!imageObj) return null;

  return (
    <KonvaImage
      image={imageObj}
      x={t.x || 0}
      y={t.y || 0}
      width={t.width}
      height={t.height}
      onClick={() => !isLocked && isEraser && onErase(t.id)}
    />
  );
};

const TexturedTerrainNode = ({ t, isLocked, isEraser, onErase }) => {
  const shapeRef = useRef(null);
  const [patternImg, setPatternImg] = useState(null);
  const [strokePattern, setStrokePattern] = useState(null);

  const textureUrl = t.textureUrl || getBiomeTextureUrl(t.biomeType || t.terrainTypeId) || getTextureUrlFromColor(t.color || t.terrainTypeId);

  useEffect(() => {
    if (textureUrl) {
      const img = new window.Image();
      img.src = textureUrl;
      img.onload = () => {
        setPatternImg(img);
        try {
          const cvs = document.createElement('canvas');
          const w = img.naturalWidth || img.width || 64;
          const h = img.naturalHeight || img.height || 64;
          cvs.width = w;
          cvs.height = h;
          const ctx = cvs.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const ptn = ctx.createPattern(cvs, 'repeat');
          setStrokePattern(ptn);
        } catch (e) {
          console.warn('Stroke pattern create error:', e);
        }
      };
      img.onerror = () => {
        setPatternImg(null);
        setStrokePattern(null);
      };
    }
  }, [textureUrl]);

  // Caching effect: Pre-renders shape to offscreen canvas once pattern/texture is available
  useEffect(() => {
    if (shapeRef.current) {
      try {
        shapeRef.current.clearCache();
        shapeRef.current.cache({ pixelRatio: 2 });
      } catch (e) {
        // Fallback gracefully if node bounds cannot be computed immediately
      }
    }
  }, [patternImg, strokePattern, t.points, t.x, t.y, t.radius, t.color]);

  if (t.renderType === 'hexTile') {
    return (
      <RegularPolygon
        ref={shapeRef}
        x={t.x}
        y={t.y}
        sides={6}
        radius={t.radius}
        fill={t.color}
        fillPatternImage={patternImg}
        fillPatternRepeat="repeat"
        stroke="rgba(0, 0, 0, 0.15)"
        strokeWidth={1}
        onClick={() => !isLocked && isEraser && onErase(t.id)}
      />
    );
  }

  if (t.closed || t.renderType === 'polygon') {
    return (
      <Line
        ref={shapeRef}
        points={t.points}
        fill={t.color}
        fillPatternImage={patternImg}
        fillPatternRepeat="repeat"
        stroke={t.strokeColor || t.color}
        strokeWidth={t.strokeWidth || 1.5}
        closed={true}
        tension={t.tension || 0.35}
        lineCap="round"
        lineJoin="round"
        onClick={() => !isLocked && isEraser && onErase(t.id)}
      />
    );
  }

  return (
    <Line
      ref={shapeRef}
      points={t.points}
      fill={t.color}
      fillPatternImage={patternImg}
      fillPatternRepeat="repeat"
      stroke={strokePattern || t.color}
      strokeWidth={t.strokeWidth || 30}
      tension={t.tension || 0.2}
      lineCap={t.lineCap || "round"}
      lineJoin="round"
      onClick={() => !isLocked && isEraser && onErase(t.id)}
    />
  );
};

const MapPane = ({ mapExportPngRef, defaultRole = 'architect', onBackToStory, onSwitchView }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (isMobile) {
    return <MobileTacticalBlocker operation="map" onBack={onBackToStory} />;
  }

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // Floating Toolboxes Toggle State
  const [showToolsPanel, setShowToolsPanel] = useState(true);
  const [showSettingsPanel, setShowSettingsPanel] = useState(true);
  const [showLayersPanel, setShowLayersPanel] = useState(true);
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
  const [selectedObjectType, setSelectedObjectType] = useState(MASTER_OBJECTS['Planetary'][0]);
  const [selectedWallType, setSelectedWallType] = useState('solid');
  const [doorLockDc, setDoorLockDc] = useState(14);
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
    deleteCustomObject
  } = useCampaign();

  // Bi-directional synchronization with ?mapId= URL parameter
  useEffect(() => {
    const urlMapId = searchParams.get('mapId');
    if (urlMapId && urlMapId !== activeMapId) {
      const exists = universeState?.maps?.some(m => m.id === urlMapId);
      if (exists) {
        setActiveMapId(urlMapId);
      }
    }
  }, [searchParams, universeState?.maps]);

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
  const [gridSize, setGridSize] = useState(40);
  const [measurementUnit, setMeasurementUnit] = useState('meters');

  // Studio Tabbed Mode & Right Architect Console Rail
  const [activeStudioTab, setActiveStudioTab] = useState('canvas'); // 'canvas' | 'assets' | 'pcg' | 'export'
  const [isRightRailCollapsed, setIsRightRailCollapsed] = useState(false);
  const [isRightRailPinned, setIsRightRailPinned] = useState(false);

  const handleOpenInStage = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    const targetMapId = activeMapId || currentMap?.id;
    if (onSwitchView) {
      onSwitchView('stage', 'setup');
    } else {
      navigate(targetMapId ? `/foundry/story?view=stage&tab=setup&mapId=${targetMapId}` : '/foundry/story?view=stage&tab=setup');
    }
  };

  const handleStampAssetOnMap = (unit) => {
    if (!currentMap) return;
    recordHistory();
    const newObj = {
      id: `obj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: unit.name,
      label: unit.name,
      unit_id: unit.unit_id,
      x: Math.round((stageSize.width || 800) / (2 * (currentMap.scale || 1)) / gridSize) * gridSize,
      y: Math.round((stageSize.height || 600) / (2 * (currentMap.scale || 1)) / gridSize) * gridSize,
      width: ((Array.isArray(unit.dimensions) ? unit.dimensions[0] : unit.dimensions?.width) || 1) * gridSize,
      height: ((Array.isArray(unit.dimensions) ? unit.dimensions[1] : unit.dimensions?.height) || 1) * gridSize,
      imageUrl: unit.visuals?.baseTexture || unit.visuals?.thumbnail,
      category: unit.category,
      type: unit.category === 'token' ? 'npc' : 'doodad'
    };
    updateMap(activeMapId, { objects: [...(currentMap.objects || []), newObj] });
    setSelectedId(newObj.id);
    showToast({ type: 'success', text: `Stamped "${unit.name}" on Tactical Canvas!` });
    setActiveStudioTab('canvas');
  };

  const handleApplyPcgTerrain = (grid, biomeKey) => {
    if (!currentMap || !grid) return;
    recordHistory();
    const newTerrains = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c]) {
          newTerrains.push({
            id: `pcg-ter-${Date.now()}-${r}-${c}`,
            x: c * gridSize,
            y: r * gridSize,
            width: gridSize,
            height: gridSize,
            biomeType: biomeKey || 'rock_cavern',
            color: '#334155'
          });
        }
      }
    }
    updateMap(activeMapId, { terrains: [...(currentMap.terrains || []), ...newTerrains] });
    showToast({ type: 'success', text: `Generated ${newTerrains.length} procedural terrain tiles!` });
    setActiveStudioTab('canvas');
  };

  const handleApplyDecorations = (entities) => {
    if (!currentMap || !entities) return;
    recordHistory();
    const newObjects = entities.map(e => ({
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
      hazardDamage: e.hazardDamage
    }));
    updateMap(activeMapId, { objects: [...(currentMap.objects || []), ...newObjects] });
    showToast({ type: 'success', text: `Spatial Decorator placed ${newObjects.length} tactical entities!` });
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
    if ((!universeState?.maps || universeState.maps.length === 0) && addMap) {
      const starters = getStarterMapsCollection();
      starters.forEach(m => addMap(m));
      if (starters[0] && setActiveMapId) {
        setActiveMapId(starters[0].id);
      }
    }
  }, [universeState?.maps?.length, addMap, setActiveMapId]);

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
    const px = targetX !== null ? targetX : (position.x + stageSize.width / 2);
    const py = targetY !== null ? targetY : (position.y + stageSize.height / 2);
    const newPing = createTacticalPing(px, py, pingType, null, vttRole === 'operative' ? 'Operative' : 'Architect', '#06b6d4');
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
    if (universeState.maps.length <= 1) {
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
      const nextMap = universeState.maps.find(m => m.id !== currentMap.id);
      deleteMap(currentMap.id);
      if (nextMap) {
        setActiveMapId(nextMap.id);
      }
    }
  };

  const currentMap = universeState.maps.find(m => m.id === activeMapId);
  const lines = currentMap?.lines || [];
  const tokens = currentMap?.tokens || [];
  const terrains = currentMap?.terrains || [];
  const objects = currentMap?.objects || [];
  const texts = currentMap?.texts || [];
  const walls = currentMap?.walls || [];
  const lights = currentMap?.lights || [];
  const fog = currentMap?.fog || [];
  const mapLayers = currentMap?.layers || DEFAULT_LAYERS;
  const { undoStack, redoStack, recordHistory, handleUndo, handleRedo } = useMapHistory({
    currentMap, lines, tokens, terrains, objects, texts, walls, lights, fog, mapLayers, updateMap, activeMapId
  });

  const {
    scale, setScale, position, setPosition,
    isDrawing,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
    wallStartPoint, wallPreviewEnd, rulerWaypoints, rulerPointer, clearRuler,
    zoomBy, panBy
  } = useMapCanvasEvents({
    currentMap, activeMapId, updateMap, recordHistory,
    activeTool, lines, terrains, walls, fog, objects, tokens, texts, lights,
    pencilColor, pencilWidth, selectedTerrain, terrainWidth, selectedObjectType,
    selectedWallType, doorLockDc,
    selectedLightColor, selectedLightRadius, selectedLightAnimation,
    tokenType, tokenLabelInput, tokenOmnicortexData, textLabelInput, textColor, textSize
  });

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
    if (activeVisionToken) {
      SpatialAudio.setListenerPosition(activeVisionToken.x, activeVisionToken.y, gridSize);
    }
  }, [activeVisionToken?.x, activeVisionToken?.y, gridSize]);

  // Door toggle and breach helpers
  const handleToggleDoor = (wallId) => {
    const targetWall = walls.find(w => w.id === wallId);
    if (!targetWall) return;
    recordHistory();
    const updatedWall = toggleDoorState(targetWall);
    const nextWalls = walls.map(w => w.id === wallId ? updatedWall : w);
    updateMap(activeMapId, { walls: nextWalls });
  };

  const handleUpdateToken = (tokenId, updates = {}) => {
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
    if (!currentMap || !element) return;

    const posX = targetPos?.x !== undefined ? targetPos.x : Math.round((-position.x + stageSize.width / 2) / scale);
    const posY = targetPos?.y !== undefined ? targetPos.y : Math.round((-position.y + stageSize.height / 2) / scale);

    const type = element.type || 'Scene';
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
          alertBark: pFields.voice || pFields.mannerisms || 'Greetings, operative.'
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
      const newTrap = {
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
      };
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
      const newStoryObject = {
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
        layerId: 'layer_objects',
        isInteractive: true
      };
      updateMap(activeMapId, { objects: [...objects, newStoryObject] });
      AudioService.playTerminalBeep(920, 0.08);
      showToast({ type: 'success', text: `Placed Story Node: ${newStoryObject.label}` });
    }
  };

  const handleStageDrop = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      if (data.type === 'story_element') {
        if (!currentMap) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const canvasX = (mouseX - position.x) / scale;
        const canvasY = (mouseY - position.y) / scale;
        handleSummonStoryElement(data.element, { x: Math.round(canvasX), y: Math.round(canvasY) });
      } else if (data.type === 'folio_hero_token') {
        if (!currentMap) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const canvasX = (mouseX - position.x) / scale;
        const canvasY = (mouseY - position.y) / scale;
        handleSummonHeroToken(data, { x: Math.round(canvasX), y: Math.round(canvasY) });
      } else if (data.type === 'omnicortex_asset') {
        if (!currentMap) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const canvasX = (mouseX - position.x) / scale;
        const canvasY = (mouseY - position.y) / scale;
        handleSummonOmnicortexAsset(data.item, data.category, { x: Math.round(canvasX), y: Math.round(canvasY) });
      }
    } catch (err) {
      console.warn('Failed to parse dropped token/asset:', err);
    }
  };

  const handleSummonHeroToken = (data, targetPos = null) => {
    if (!currentMap) return;

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
    const handleKeyDown = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
        return;
      }

      if (e.key === 'g' || e.key === 'G') {
        const nextGrid = !currentMap?.gridMode || currentMap.gridMode === 'off' ? 'hex' : (currentMap.gridMode === 'hex' ? 'square' : 'off');
        if (activeMapId) updateMap(activeMapId, { gridMode: nextGrid });
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
        recordHistory();
        updateMap(activeMapId, {
          objects: objects.filter(o => o.id !== selectedId),
          terrains: terrains.filter(t => t.id !== selectedId),
          tokens: tokens.filter(tk => tk.id !== selectedId),
          texts: texts.filter(txt => txt.id !== selectedId)
        });
        setSelectedId(null);
      }
    };

    const handleKeyUp = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if (e.key === ' ' && window.__prevMapTool) {
        e.preventDefault();
        setActiveTool(window.__prevMapTool);
        window.__prevMapTool = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeMapId, currentMap?.gridMode, selectedId, objects, terrains, tokens, texts, activeTool, zoomBy, panBy, recordHistory, updateMap]);

  const handleCommitPcgSector = ({
    terrains: generatedTerrains = [],
    objects: generatedObjects = [],
    lines: generatedLines = [],
    lights: generatedLights = [],
    replaceExisting = true
  }) => {
    let targetId = activeMapId;
    if (!targetId || universeState.maps.length === 0) {
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
        lights: generatedLights,
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

    updateMap(targetId, {
      terrains: nextTerrains,
      objects: nextObjects,
      lines: nextLines,
      lights: nextLights
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
    recordHistory();
    const nextLayers = produce(mapLayers, draft => {
      const layer = draft.find(l => l.id === layerId);
      if (layer) layer.locked = !layer.locked;
    });
    updateMap(activeMapId, { layers: nextLayers });
  };

  const addCustomLayer = (e) => {
    e.preventDefault();
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
    if (!containerRef.current) return;
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
  }, []);

  useEffect(() => {
    if (universeState.maps.length > 0 && !activeMapId) {
      setActiveMapId(universeState.maps[0].id);
    }
  }, [universeState.maps, activeMapId, setActiveMapId]);

  const eraseElement = (id) => {
    recordHistory();
    updateMap(activeMapId, {
      lines: lines.filter(l => l.id !== id),
      tokens: tokens.filter(t => t.id !== id),
      terrains: terrains.filter(t => t.id !== id),
      walls: walls.filter(w => w.id !== id),
      objects: objects.filter(item => item.id !== id),
      lights: lights.filter(item => item.id !== id),
      texts: texts.filter(item => item.id !== id),
      fog: fog.filter(item => item.id !== id)
    });
    if (selectedId === id) setSelectedId(null);
  };

  const handleClearMap = () => {
    recordHistory();
    updateMap(activeMapId, { lines: [], terrains: [], walls: [], objects: [], lights: [], texts: [], fog: [] });
  };

  const handleExportPNG = () => {
    if (!stageRef.current || !currentMap) return;
    setSelectedId(null);
    setTimeout(() => {
      try {
        const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = formatExportFilename(currentMap.title || 'map', 'map', 'png');
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("PNG export error:", err);
        showToast({ type: 'error', text: 'Failed to export PNG map image.' });
      }
    }, 50);
  };

  useEffect(() => {
    if (mapExportPngRef) {
      mapExportPngRef.current = handleExportPNG;
    }
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

  const renderGrid = () => {
    if (gridMode === 'none') return null;

    if (gridMode === 'square') {
      const gSize = Math.max(15, gridSize || 50);
      const margin = gSize * 2;
      const startX = (-position.x - margin) / scale;
      const endX = (stageSize.width - position.x + margin) / scale;
      const startY = (-position.y - margin) / scale;
      const endY = (stageSize.height - position.y + margin) / scale;

      const minCol = Math.floor(startX / gSize);
      const maxCol = Math.ceil(endX / gSize);
      const minRow = Math.floor(startY / gSize);
      const maxRow = Math.ceil(endY / gSize);

      const clampedMinCol = Math.max(minCol, -300);
      const clampedMaxCol = Math.min(maxCol, 300);
      const clampedMinRow = Math.max(minRow, -300);
      const clampedMaxRow = Math.min(maxRow, 300);

      const gridLines = [];
      const minY = clampedMinRow * gSize;
      const maxY = clampedMaxRow * gSize;
      const minX = clampedMinCol * gSize;
      const maxX = clampedMaxCol * gSize;

      for (let c = clampedMinCol; c <= clampedMaxCol; c++) {
        const x = c * gSize;
        const isMajor = Math.abs(c) % 5 === 0;
        gridLines.push(
          <Line 
            key={`v-${c}`} 
            points={[x, minY, x, maxY]} 
            stroke={isMajor ? "rgba(34, 211, 238, 0.35)" : "rgba(255, 255, 255, 0.18)"} 
            strokeWidth={isMajor ? 1.5 : 1} 
            strokeScaleEnabled={false}
          />
        );
      }
      for (let r = clampedMinRow; r <= clampedMaxRow; r++) {
        const y = r * gSize;
        const isMajor = Math.abs(r) % 5 === 0;
        gridLines.push(
          <Line 
            key={`h-${r}`} 
            points={[minX, y, maxX, y]} 
            stroke={isMajor ? "rgba(34, 211, 238, 0.35)" : "rgba(255, 255, 255, 0.18)"} 
            strokeWidth={isMajor ? 1.5 : 1} 
            strokeScaleEnabled={false}
          />
        );
      }
      return gridLines;
    }

    if (gridMode === 'hex') {
      const hexRadius = Math.max(15, gridSize || 50);
      const hexWidth = Math.sqrt(3) * hexRadius;
      const rowHeight = hexRadius * 1.5;

      const marginX = hexWidth * 2;
      const marginY = hexRadius * 3;
      const startX = (-position.x - marginX) / scale;
      const endX = (stageSize.width - position.x + marginX) / scale;
      const startY = (-position.y - marginY) / scale;
      const endY = (stageSize.height - position.y + marginY) / scale;

      const minCol = Math.floor(startX / hexWidth) - 1;
      const maxCol = Math.ceil(endX / hexWidth) + 1;
      const minRow = Math.floor(startY / rowHeight) - 1;
      const maxRow = Math.ceil(endY / rowHeight) + 1;

      // Bound visible range to avoid extreme loops if scaled out massively
      const clampedMinCol = Math.max(minCol, -200);
      const clampedMaxCol = Math.min(maxCol, 200);
      const clampedMinRow = Math.max(minRow, -200);
      const clampedMaxRow = Math.min(maxRow, 200);

      const hexes = [];
      for (let r = clampedMinRow; r <= clampedMaxRow; r++) {
        const isOddRow = (((r % 2) + 2) % 2) === 1;
        const rowOffsetX = isOddRow ? (hexWidth / 2) : 0;
        const y = r * rowHeight;
        for (let c = clampedMinCol; c <= clampedMaxCol; c++) {
          const x = c * hexWidth + rowOffsetX;
          hexes.push(
            <RegularPolygon 
              key={`hex-${r}-${c}`} 
              x={x} 
              y={y} 
              sides={6} 
              radius={hexRadius} 
              stroke="rgba(34, 211, 238, 0.25)" 
              strokeWidth={1} 
              strokeScaleEnabled={false}
            />
          );
        }
      }
      return hexes;
    }
    return null;
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

  const isLayerVisible = (layerId) => {
    const l = mapLayers.find(item => item.id === layerId);
    return l ? l.visible : true;
  };

  const isLayerLocked = (layerId) => {
    const l = mapLayers.find(item => item.id === layerId);
    return l ? l.locked : false;
  };

  return (
    <div className="h-full w-full bg-gray-950 flex flex-col" ref={containerRef}>

      {/* Canvas Keyboard Shortcuts Manager Legend Modal Element */}
      {isShortcutsModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
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
                <span className="text-slate-300 font-medium">Toggle Grid Mode (Square / Hex / Off)</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-bold rounded border border-slate-700">G</kbd>
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
                <span className="text-slate-300 font-medium">Pan Tool Mode</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-bold rounded border border-slate-700">H</kbd>
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
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
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
        showToolsPanel={showToolsPanel}
        setShowToolsPanel={setShowToolsPanel}
        showSettingsPanel={showSettingsPanel}
        setShowSettingsPanel={setShowSettingsPanel}
        showLayersPanel={showLayersPanel}
        setShowLayersPanel={setShowLayersPanel}
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
        onOpenAssetManager={() => setIsAssetManagerOpen(true)}
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

      <MapMaker3DPreviewModal
        isOpen={is3DPreviewOpen}
        onClose={() => setIs3DPreviewOpen(false)}
        currentMap={currentMap}
        tokens={tokens}
      />

      <StoryFoundryGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialTab="map-maker"
      />


      {/* Unified Selected Element Inspector Bar (Objects, Units, Portals) */}
      {selectedId && (() => {
        const selectedToken = tokens.find(t => t.id === selectedId);
        const selectedObject = objects.find(o => o.id === selectedId);
        const item = selectedToken || selectedObject;

        if (!item) return null;

        const isToken = !!selectedToken;
        const isPortal = isToken && selectedToken.type === 'link';
        const isUnit = isToken && !isPortal;
        const isObject = !isToken;

        const updateItem = (updates) => {
          recordHistory();
          if (isToken) {
            const nextTokens = produce(tokens, draft => {
              const target = draft.find(t => t.id === selectedId);
              if (target) Object.assign(target, updates);
            });
            updateMap(activeMapId, { tokens: nextTokens });
          } else if (isObject) {
            const nextObjects = produce(objects, draft => {
              const target = draft.find(o => o.id === selectedId);
              if (target) Object.assign(target, updates);
            });
            updateMap(activeMapId, { objects: nextObjects });
          }
        };

        return (
          <div className="relative z-[80] bg-[#161b22]/95 p-2 border-b border-[#0D5C63]/60 flex items-center justify-between text-xs gap-3 flex-wrap text-slate-200 backdrop-blur-md">
            <div className="flex items-center gap-3 flex-wrap w-full">
              {/* Type Badge */}
              <div className="flex items-center gap-1 font-bold">
                <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono ${
                  isPortal
                    ? 'bg-purple-950 text-purple-300 border-purple-700'
                    : isUnit
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-cyan-950 text-cyan-300 border-[#0D5C63]'
                }`}>
                  {isPortal ? '🌌 Portal' : isUnit ? '⚔️ Unit' : '🏢 Object'}
                </span>
              </div>

              {/* 1. Naming Option (Label Input) */}
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Label:</span>
                <input
                  type="text"
                  value={item.label || ''}
                  onChange={(e) => updateItem({ label: e.target.value })}
                  placeholder="Element name..."
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs outline-none focus:border-[#22d3ee] w-36 font-semibold"
                />
              </div>

              {/* 2. Halo Option (Glow/Aura with Color Selector) */}
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                  <span>😇</span> Halo:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateItem({ haloColor: null })}
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded border transition-colors ${
                      !item.haloColor
                        ? 'border-[#22d3ee] bg-cyan-950 text-[#22d3ee]'
                        : 'border-[#0D5C63]/40 bg-[#161b22] text-slate-400 hover:text-white'
                    }`}
                    title="Turn Off Halo"
                  >
                    Off
                  </button>

                  {[
                    { name: 'Cyan', color: '#22d3ee' },
                    { name: 'Blue', color: '#3b82f6' },
                    { name: 'Gold', color: '#eab308' },
                    { name: 'Green', color: '#22c55e' },
                    { name: 'Red', color: '#ef4444' },
                    { name: 'Purple', color: '#a855f7' },
                    { name: 'Pink', color: '#ec4899' },
                    { name: 'White', color: '#ffffff' }
                  ].map(swatch => (
                    <button
                      key={swatch.color}
                      onClick={() => updateItem({ haloColor: swatch.color })}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        item.haloColor === swatch.color
                          ? 'border-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: swatch.color }}
                      title={`${swatch.name} Halo`}
                    />
                  ))}
                </div>
              </div>

              {/* Unit Controls: Faction, Role & Size */}
              {isUnit && (
                <>
                  {/* Unit Designation / Faction */}
                  <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Faction:</span>
                    <select
                      className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs font-semibold outline-none focus:border-amber-400"
                      value={item.designation || 'Adversary'}
                      onChange={(e) => {
                        const des = e.target.value;
                        const fill = des === 'Ally' ? '#10b981' : (des === 'Adversary' ? '#ef4444' : (des === 'Player' ? '#0284c7' : '#a855f7'));
                        updateItem({ designation: des, fill });
                      }}
                    >
                      <option value="Player">Player</option>
                      <option value="Ally">Ally</option>
                      <option value="Adversary">Adversary</option>
                      <option value="Neutral">Neutral</option>
                    </select>
                  </div>

                  {/* Unit Role / Profile */}
                  <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase">Role:</span>
                    <input
                      type="text"
                      value={item.role || ''}
                      onChange={(e) => updateItem({ role: e.target.value })}
                      placeholder="Role (e.g. Tactical)..."
                      className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs outline-none focus:border-[#22d3ee] w-24 font-semibold"
                    />
                  </div>

                  {/* Token Radius / Scale */}
                  <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Size:</span>
                    <select
                      className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs font-semibold outline-none focus:border-cyan-400"
                      value={item.radius || 35}
                      onChange={(e) => updateItem({ radius: parseInt(e.target.value, 10) })}
                    >
                      <option value="25">Small (25px)</option>
                      <option value="35">Medium (35px)</option>
                      <option value="50">Large (50px)</option>
                      <option value="70">Huge (70px)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Omnicortex Linked Item Sheet Inspection Button */}
              {(item.linkedOmnicortexItem || item.omnicortexId) && (
                <button
                  type="button"
                  onClick={() => setInspectingOmnicortexItem(item.linkedOmnicortexItem || { id: item.omnicortexId, name: item.label, category: item.omnicortexCategory || 'compendium' })}
                  className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                  title="Open Omnicortex Compendium Item Sheet"
                >
                  <span>🧠</span> Omnicortex Sheet
                </button>
              )}

              {/* Portal Target Map Dropdown */}
              {isPortal && (
                <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                  <span className="text-[10px] font-bold text-purple-400 uppercase">Target Map:</span>
                  <select
                    className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs font-semibold outline-none focus:border-purple-400 relative z-10"
                    value={item.targetMapId || ''}
                    onChange={(e) => {
                      const targetMap = universeState.maps.find(m => m.id === e.target.value);
                      updateItem({
                        targetMapId: e.target.value,
                        label: targetMap ? targetMap.title : item.label
                      });
                    }}
                  >
                    <option value="" disabled>Select Target Map...</option>
                    {universeState.maps.filter(m => m.id !== activeMapId).map(m => (
                      <option key={m.id} value={m.id}>{m.title} [{m.type}]</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
            mapObjectNode={objects.find(o => o.id === inspectingStoryElement.id || o.storyElementId === inspectingStoryElement.id)}
            onUpdateMapObject={(objId, updates) => {
              recordHistory();
              const nextObjs = objects.map(o => o.id === objId ? { ...o, ...updates } : o);
              updateMap(activeMapId, { objects: nextObjs });
            }}
            onTriggerFloatingText={(x, y, msg) => showToast(msg)}
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
          className={`flex-1 h-full min-w-0 relative ${activeTool === 'select' ? 'cursor-grab active:cursor-grabbing' : (activeTool === 'eraser' ? 'cursor-pointer' : 'cursor-crosshair')}`}
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
                  onChange={(e) => setGridSize(Number(e.target.value))}
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
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              onContextMenu={(e) => {
                e.evt?.preventDefault?.();
              }}
              onWheel={handleWheel}
              onMouseDown={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'bgRect';
                if (clickedOnEmpty && activeTool === 'select') {
                  setSelectedId(null);
                }
                handleMouseDown(e);
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              scaleX={scale}
              scaleY={scale}
              x={position.x}
              y={position.y}
              draggable={activeTool === 'select' && selectedId === null}
              onDragEnd={(e) => {
                if (activeTool === 'select' && e.target === e.target.getStage()) {
                  setPosition({ x: e.target.x(), y: e.target.y() });
                }
              }}
            >
              {/* Layer 1: Background & Tactical Grid */}
              <Layer id="layer_bg_grid">
                <Rect x={-100000} y={-100000} width={200000} height={200000} fill="#111827" name="bgRect" />
                {/* Primary Tactical Sector Boundary Frame */}
                <Rect
                  x={0}
                  y={0}
                  width={currentMap?.width || 2800}
                  height={currentMap?.height || 2100}
                  stroke="rgba(34, 211, 238, 0.45)"
                  strokeWidth={2}
                  dash={[12, 6]}
                  listening={false}
                />
                <Group listening={false}>
                  {renderGrid()}
                </Group>
              </Layer>

              {/* Layer 2: World Terrain & Objects */}
              <Layer id="layer_world">
                {isLayerVisible('layer_terrain') && (
                  <Group>
                    {terrains.map((t, i) => {
                      if (t.renderType === 'canvasImage') {
                        return (
                          <TerrainImageNode
                            key={t.id || i}
                            t={t}
                            isLocked={isLayerLocked('layer_terrain')}
                            isEraser={activeTool === 'eraser'}
                            onErase={eraseElement}
                          />
                        );
                      }
                      return (
                        <TexturedTerrainNode
                          key={t.id || i}
                          t={t}
                          isLocked={isLayerLocked('layer_terrain')}
                          isEraser={activeTool === 'eraser'}
                          onErase={eraseElement}
                        />
                      );
                    })}
                    {lines.map((l, i) => (
                      <Line key={l.id || i} points={l.points} stroke={l.color || "#ef4444"} strokeWidth={l.strokeWidth || 5} tension={0.5} lineCap="round" lineJoin="round" onClick={() => !isLayerLocked('layer_terrain') && activeTool === 'eraser' && eraseElement(l.id)} />
                    ))}
                  </Group>
                )}

                {isLayerVisible('layer_objects') && (
                  <Group>
                    {objects.map((obj) => (
                      <MapObjectNode
                        key={obj.id}
                        shapeProps={obj}
                        isSelected={obj.id === selectedId}
                        isEraser={activeTool === 'eraser'}
                        isLocked={isLayerLocked('layer_objects')}
                        zoomScale={scale}
                        onErase={eraseElement}
                        onSelect={() => { if (activeTool === 'select' && !isLayerLocked('layer_objects')) setSelectedId(obj.id); }}
                        onDoubleClick={() => handleObjectDoubleClick(obj)}
                        onChange={(newAttrs) => {
                          const nextObjects = produce(objects, draft => {
                            const index = draft.findIndex(o => o.id === obj.id);
                            if (index !== -1) draft[index] = newAttrs;
                          });
                          updateMap(activeMapId, { objects: nextObjects });
                        }}
                      />
                    ))}
                  </Group>
                )}
              </Layer>

              {/* Layer 2.5: Walls, Bulkheads & Interactive Doors */}
              {isLayerVisible('layer_walls') && (
                <Layer id="layer_walls">
                  {walls.map((w) => (
                    <MapWallNode
                      key={w.id}
                      wall={w}
                      isSelected={w.id === selectedId}
                      isEraser={activeTool === 'eraser'}
                      isLocked={isLayerLocked('layer_walls')}
                      zoomScale={scale}
                      onSelect={(id) => { if (activeTool === 'select' && !isLayerLocked('layer_walls')) setSelectedId(id); }}
                      onErase={(id) => eraseElement(id)}
                      onToggleDoor={handleToggleDoor}
                    />
                  ))}
                  {/* Active Wall Drawing Line Preview */}
                  {isDrawing && activeTool === 'wall' && wallStartPoint && wallPreviewEnd && (
                    <Line
                      points={[wallStartPoint.x, wallStartPoint.y, wallPreviewEnd.x, wallPreviewEnd.y]}
                      stroke={selectedWallType === 'door' ? '#f59e0b' : (selectedWallType === 'window' ? '#38bdf8' : (selectedWallType === 'ethereal' ? '#c084fc' : '#22d3ee'))}
                      strokeWidth={5}
                      dash={[6, 4]}
                    />
                  )}
                </Layer>
              )}

              {/* Layer 2.75: Dynamic Lights & Ambient Luminance Emitters */}
              <Layer id="layer_lights">
                {lights.map((lt) => (
                  <Group
                    key={lt.id}
                    x={lt.x}
                    y={lt.y}
                    draggable={activeTool === 'select' && !isLayerLocked('layer_objects')}
                    onClick={() => {
                      if (activeTool === 'eraser') eraseElement(lt.id);
                      else if (activeTool === 'select') setSelectedId(lt.id);
                    }}
                    onDragEnd={(e) => {
                      const nextLights = produce(lights, draft => {
                        const idx = draft.findIndex(item => item.id === lt.id);
                        if (idx !== -1) {
                          draft[idx].x = e.target.x();
                          draft[idx].y = e.target.y();
                        }
                      });
                      updateMap(activeMapId, { lights: nextLights });
                    }}
                  >
                    {/* Outer ambient glow halo */}
                    <Circle
                      radius={lt.radius || 180}
                      fill={lt.color || '#f59e0b'}
                      opacity={lt.id === selectedId ? 0.28 : 0.18}
                      listening={false}
                    />
                    {/* Inner illumination ring */}
                    <Circle
                      radius={(lt.radius || 180) * 0.45}
                      fill={lt.color || '#f59e0b'}
                      opacity={0.35}
                      listening={false}
                    />
                    {/* Emitter source center point */}
                    <Circle
                      radius={10}
                      fill="#ffffff"
                      stroke={lt.color || '#f59e0b'}
                      strokeWidth={3}
                      shadowColor={lt.color || '#f59e0b'}
                      shadowBlur={12}
                      shadowOpacity={0.9}
                    />
                  </Group>
                ))}
              </Layer>

              {/* Layer 3: Annotations, Tokens, Units & Tactical Radar Pings */}
              <Layer id="layer_entities">
                {isLayerVisible('layer_annotations') && (
                  <Group>
                    {texts.map((txt) => (
                      <TextLabelNode
                        key={txt.id} shapeProps={txt} isSelected={txt.id === selectedId} isEraser={activeTool === 'eraser'} isLocked={isLayerLocked('layer_annotations')}
                        onErase={eraseElement}
                        onSelect={() => { if (activeTool === 'select' && !isLayerLocked('layer_annotations')) setSelectedId(txt.id); }}
                        onChange={(newAttrs) => {
                          const nextTexts = produce(texts, draft => {
                            const index = draft.findIndex(t => t.id === txt.id);
                            if (index !== -1) draft[index] = newAttrs;
                          });
                          updateMap(activeMapId, { texts: nextTexts });
                        }}
                      />
                    ))}
                  </Group>
                )}

                {isLayerVisible('layer_tokens') && (
                  <Group>
                    {tokens.map((token) => (
                      <Group
                        key={token.id}
                        onContextMenu={(e) => {
                          e.evt.preventDefault();
                        }}
                      >
                        <TokenNode
                          shapeProps={token}
                          isSelected={token.id === selectedId}
                          isActiveTurn={false}
                          isEraser={activeTool === 'eraser'}
                          isLocked={isLayerLocked('layer_tokens')}
                          onErase={eraseElement}
                          onSelect={() => { if (activeTool === 'select' && !isLayerLocked('layer_tokens')) handleSelectToken(token.id); }}
                          onDoubleClick={() => { if (token.type === 'link' && token.targetMapId) { setActiveMapId(token.targetMapId); setSelectedId(null); } }}
                          onChange={(newAttrs) => {
                            const nextTokens = produce(tokens, draft => {
                              const index = draft.findIndex(t => t.id === token.id);
                              if (index !== -1) draft[index] = newAttrs;
                            });
                            updateMap(activeMapId, { tokens: nextTokens });
                          }}
                        />
                      </Group>
                    ))}
                  </Group>
                )}

                {/* Tactical Waypoint Movement Ruler Overlay */}
                <WaypointRulerOverlay
                  waypoints={rulerWaypoints}
                  currentPointer={rulerPointer}
                  gridSize={gridSize}
                  gridMode={gridMode}
                  measurementUnit={measurementUnit}
                  selectedPace={rulerSelectedPace}
                  zoomScale={scale}
                />

                {/* Tactical Radar Pings */}
                {activePings.map(ping => (
                  <Group key={ping.id} x={ping.x} y={ping.y}>
                    <Circle radius={30} stroke={ping.color} strokeWidth={2} opacity={0.7} />
                    <Circle radius={14} fill={ping.color} opacity={0.6} />
                    <KonvaText
                      text={`${ping.icon} ${ping.label}`}
                      fontSize={12}
                      fontStyle="bold"
                      fill="#ffffff"
                      align="center"
                      y={-28}
                      x={-60}
                      width={120}
                    />
                  </Group>
                ))}
              </Layer>

              {/* Layer 4: Fog of War & Dynamic Line of Sight */}
              {isLayerVisible('layer_fog') && (
                <Layer id="layer_fog">
                  {fogEnabled && (
                    <Group>
                      <Rect x={0} y={0} width={4000} height={3000} fill="rgba(0, 0, 0, 0.75)" listening={false} />
                      {/* Dynamic Line-of-Sight Cutout */}
                      {visibilityPolygon && (
                        <Line
                          points={visibilityPolygon}
                          fill="#000000"
                          closed={true}
                          globalCompositeOperation="destination-out"
                          listening={false}
                        />
                      )}
                    </Group>
                  )}
                  {fog.map((f, i) => (
                    <Line key={f.id || i} points={f.points} stroke="#000000" strokeWidth={50} tension={0.4} lineCap="round" lineJoin="round" onClick={() => !isLayerLocked('layer_fog') && activeTool === 'eraser' && eraseElement(f.id)} />
                  ))}
                </Layer>
              )}
            </Stage>
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
            rulerSelectedPace={rulerSelectedPace}
            setRulerSelectedPace={setRulerSelectedPace}
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
            setFogEnabled={setFogEnabled}
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
            onApplyEnvironmentPreset={(envId) => {
              showToast({ type: 'info', text: `ENVIRONMENT: ${envId.toUpperCase()}` });
            }}
            onBatchTokenAction={(action) => {
              showToast({ type: 'info', text: `BATCH ACTION: ${action.toUpperCase()}` });
            }}
            onBroadcastMessage={(msg) => {
              showToast({ type: 'info', text: msg });
            }}
            onOpenAssetManager={() => setIsAssetManagerOpen(true)}
            onOpenStoryDrawer={() => setShowStoryDrawer(true)}
            onOpenOmnicortexDrawer={() => setShowOmnicortexDrawer(true)}
            onOpenLandmassGenerator={() => setActiveStudioTab('pcg')}
            onOpenPcgStudio={() => setActiveStudioTab('pcg')}
            onOpenAssetStudio={() => setActiveStudioTab('assets')}
            onOpenAssetIngestion={() => setIsAssetManagerOpen(true)}
            onOpenUvttImport={() => setIsUvttModalOpen(true)}
          />
        )}
      </div>
      )}

      {/* Tab: Asset Studio & Property Forge */}
      {activeStudioTab === 'assets' && (
        <AssetStudioTab onStampAssetOnMap={handleStampAssetOnMap} />
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
        onChangeGridSize={setGridSize}
        gridMode={gridMode}
        onChangeGridMode={setGridMode}
        measurementUnit={measurementUnit}
        onChangeMeasurementUnit={setMeasurementUnit}
        fogEnabled={fogEnabled}
        onToggleFog={() => setFogEnabled(prev => !prev)}
        onDropPing={(pingType) => handleDropTacticalPing(pingType)}
        onApplyEnvironmentPreset={(envId) => {
          showToast({ type: 'info', text: `ENVIRONMENT: ${envId.toUpperCase()}` });
        }}
        onBatchTokenAction={(action) => {
          showToast({ type: 'info', text: `BATCH ACTION: ${action.toUpperCase()}` });
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
