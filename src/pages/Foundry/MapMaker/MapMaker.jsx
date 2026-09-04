import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Stage, Layer, Rect, Circle, Text as KonvaText, Line, RegularPolygon, Image as KonvaImage, Group } from 'react-konva';
import { useCampaign, formatExportFilename } from '../../../context/CampaignContext';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import VttCommandDrawer from './map/VttCommandDrawer';
import OperativeTacticalHud from './map/OperativeTacticalHud';
import { createTacticalPing, filterExpiredPings } from '../../../services/mapPingService';
import { createDefaultTeamRoster, canUserControlToken, isUserArchitect, VTT_ROLES } from '../../../services/vttTeamService';

import { MAP_TYPES, DEFAULT_LAYERS, MASTER_TERRAINS, MASTER_OBJECTS, PENCIL_COLORS, PENCIL_WIDTHS, TEXT_COLORS } from './map/MapConstants';
import { MapObjectNode, TokenNode, TextLabelNode } from './map/MapObjectNode';
import MapWallNode from './map/MapWallNode';
import WaypointRulerOverlay from './map/WaypointRulerOverlay';
import TokenRadialActionWheel from './map/TokenRadialActionWheel';
import UvttImportModal from './map/UvttImportModal';
import { computeVisibilityPolygon } from '../../../services/raycastVisionService';
import { toggleDoorState, damageWallSegment } from '../../../schemas/vttWallSchema';
import SpatialAudio from '../../../services/spatialAudioService';
import MapToolbar from './map/MapToolbar';
import MapToolsPanel from './map/MapToolsPanel';
import MapLayersPanel from './map/MapLayersPanel';
import MapCombatTracker from './map/MapCombatTracker';
import MapMetadataPanel from './map/MapMetadataPanel';
import MapKeyPanel from './map/MapKeyPanel';
import StatusGemsModal from './map/StatusGemsModal';
import LandmassGeneratorModal from './map/LandmassGeneratorModal';
import MapAssetManagerModal from './map/MapAssetManagerModal';
import FolioHeroTokenDrawer from './map/FolioHeroTokenDrawer';
import OmnicortexAssetDrawer from './map/OmnicortexAssetDrawer';
import StoryElementsDrawer from './map/StoryElementsDrawer';
import StoryElementModal from './map/StoryElementModal';
import ReactiveAutomationConsole from './map/ReactiveAutomationConsole';
import { evaluateTrapTriggers } from '../../../services/reactiveVttService';
import { DBMItemModal } from '../../../components/DBM/DBMItemModal';
import FloatingCombatText from './map/FloatingCombatText';
import { StoryFoundryGuideModal } from '../../../components/StoryFoundry/StoryFoundryGuideModal';
import { useFolio } from '../../../context/FolioContext';
import { AudioService } from '../../../services/audioService';

import { useMapHistory } from './hooks/useMapHistory';
import { useMapCanvasEvents } from './hooks/useMapCanvasEvents';
import { UnifiedRelationalSelectorModal } from '../../../components/DBM/UnifiedRelationalSelectorModal';

import { getBiomeTextureUrl } from './map/landmassGenerator';
import { getTextureUrlFromColor } from './map/MapTextures';

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

const MapPane = ({ mapExportPngRef }) => {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // Floating Toolboxes Toggle State
  const [showToolsPanel, setShowToolsPanel] = useState(true);
  const [showSettingsPanel, setShowSettingsPanel] = useState(true);
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showHeroDrawer, setShowHeroDrawer] = useState(false);
  const [showOmnicortexDrawer, setShowOmnicortexDrawer] = useState(false);
  const [showStoryDrawer, setShowStoryDrawer] = useState(false);
  const [showAutomationConsole, setShowAutomationConsole] = useState(false);
  const [inspectingStoryElement, setInspectingStoryElement] = useState(null);
  const [isAutomationActive, setIsAutomationActive] = useState(true);
  const [inspectingOmnicortexItem, setInspectingOmnicortexItem] = useState(null);
  const [showCombatTracker, setShowCombatTracker] = useState(false);
  const [showMetadataPanel, setShowMetadataPanel] = useState(false);
  const [showKeyPanel, setShowKeyPanel] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [activeTurnTokenId, setActiveTurnTokenId] = useState(null);
  const [activeFloats, setActiveFloats] = useState([]);

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
  const [rulerAvailableAp, setRulerAvailableAp] = useState(4);
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
  const [radialMenuState, setRadialMenuState] = useState({ isOpen: false, position: { x: 0, y: 0 }, token: null });

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
  const [vttRole, setVttRole] = useState('architect'); // 'architect' | 'co_architect' | 'operative' | 'spectator'
  const [isVttDrawerOpen, setIsVttDrawerOpen] = useState(false);
  const [teamRoster, setTeamRoster] = useState(() => createDefaultTeamRoster());
  const [activePings, setActivePings] = useState([]);
  const [gridSnap, setGridSnap] = useState(true);
  const [gridSize, setGridSize] = useState(40);
  const [measurementUnit, setMeasurementUnit] = useState('meters');

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

  // Map Creation Modal, Landmass Generator Modal, Asset Manager Modal & Shortcuts Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLandmassModalOpen, setIsLandmassModalOpen] = useState(false);
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
            alert("Invalid map JSON file format.");
          }
        } catch (err) {
          console.error(err);
          alert("Failed to parse map JSON file.");
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleDeleteActiveMap = () => {
    if (!currentMap) return;
    const targetTitle = currentMap.title || 'Untitled Map';
    if (universeState.maps.length <= 1) {
      if (confirmTypedDeletion(targetTitle, 'tactical sector map and reset to blank')) {
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
    if (confirmTypedDeletion(targetTitle, 'tactical sector map')) {
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
  const activeVisionToken = tokens.find(t => t.id === activeTurnTokenId) || tokens.find(t => t.id === selectedId) || tokens[0];
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

  const handleRadialActionSelect = (actionId, token) => {
    if (actionId === 'omnicortex') {
      setInspectingOmnicortexItem(token.linkedOmnicortexItem || { id: token.omnicortexId, name: token.label, category: token.omnicortexCategory || 'compendium' });
      setRadialMenuState({ isOpen: false, position: { x: 0, y: 0 }, token: null });
      return;
    } else if (actionId === 'attack') {
      triggerFloatingCombatText(window.innerWidth / 2, window.innerHeight - 150, `${token.name || token.label}: 2d10 ENGAGED`, 'damage');
    } else if (actionId === 'defend') {
      triggerFloatingCombatText(window.innerWidth / 2, window.innerHeight - 150, `${token.name || token.label}: DEFENSE STANCE (+2 DEF)`, 'karma');
    } else if (actionId === 'move') {
      setActiveTool('ruler');
      setShowSettingsPanel(true);
    } else if (actionId === 'stim') {
      triggerFloatingCombatText(window.innerWidth / 2, window.innerHeight - 150, `${token.name || token.label}: STIM APPLIED (+15 HP)`, 'heal');
    } else if (actionId === 'cyber') {
      triggerFloatingCombatText(window.innerWidth / 2, window.innerHeight - 150, `${token.name || token.label}: CYBER SLICE INITIATED`, 'vitality_damage');
    } else if (actionId === 'sensor') {
      const modes = ['standard_optical', 'thermal_ir', 'cyber_radar', 'meta_attunement'];
      const nextIdx = (modes.indexOf(activeSensorMode) + 1) % modes.length;
      setActiveSensorMode(modes[nextIdx]);
      triggerFloatingCombatText(window.innerWidth / 2, window.innerHeight - 150, `SENSOR: ${modes[nextIdx].toUpperCase()}`, 'karma');
    }
  };

  const { updateCharacterHealth, updateCharacterVitality, updateCharacterStructure, updateCharacterHp } = useFolio();

  const triggerFloatingCombatText = (screenX, screenY, text, type = 'damage') => {
    const newFloat = {
      id: `float_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      screenX,
      screenY,
      text,
      type
    };
    setActiveFloats(prev => [...prev, newFloat]);
    setTimeout(() => {
      setActiveFloats(prev => prev.filter(f => f.id !== newFloat.id));
    }, 1200);
  };

  const handleUpdateTokenHealth = (tokenId, newHealth, isDamage = true, deltaAmount = 1) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    recordHistory();
    const nextTokens = produce(tokens, draft => {
      const target = draft.find(t => t.id === tokenId);
      if (target) {
        if (!target.health) target.health = { current: 30, max: 30 };
        target.health.current = newHealth;
        if (target.hp) target.hp.current = newHealth; // sync legacy field
      }
    });
    updateMap(activeMapId, { tokens: nextTokens });

    // Play tactical combat hit audio
    AudioService.playCombatHit(deltaAmount >= 15);

    // Trigger floating combat text at token position
    const screenX = (token.x || 0) * scale + position.x;
    const screenY = (token.y || 0) * scale + position.y;
    triggerFloatingCombatText(
      screenX,
      screenY,
      isDamage ? `-${deltaAmount} HEALTH` : `+${deltaAmount} HEALTH`,
      isDamage ? 'damage' : 'heal'
    );

    // Sync to Folio roster if linked to a character
    if (token.linkedHeroId) {
      if (updateCharacterHealth) updateCharacterHealth(token.linkedHeroId, newHealth);
      else if (updateCharacterHp) updateCharacterHp(token.linkedHeroId, newHealth);
    }
  };

  const handleUpdateTokenVitality = (tokenId, newVitality, isDamage = true, deltaAmount = 1) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    recordHistory();
    const nextTokens = produce(tokens, draft => {
      const target = draft.find(t => t.id === tokenId);
      if (target) {
        if (!target.vitality) target.vitality = { current: 30, max: 30 };
        target.vitality.current = newVitality;
      }
    });
    updateMap(activeMapId, { tokens: nextTokens });

    // Play tactical combat audio
    AudioService.playCombatHit(false);

    // Trigger floating combat text at token position
    const screenX = (token.x || 0) * scale + position.x;
    const screenY = (token.y || 0) * scale + position.y;
    triggerFloatingCombatText(
      screenX,
      screenY,
      isDamage ? `-${deltaAmount} VIT` : `+${deltaAmount} VIT`,
      isDamage ? 'vitality_damage' : 'vitality_heal'
    );

    // Sync to Folio roster if linked to a character
    if (token.linkedHeroId && updateCharacterVitality) {
      updateCharacterVitality(token.linkedHeroId, newVitality);
    }
  };

  const handleUpdateTokenStructure = (tokenId, newStructure, isDamage = true, deltaAmount = 1) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    recordHistory();
    const nextTokens = produce(tokens, draft => {
      const target = draft.find(t => t.id === tokenId);
      if (target) {
        if (!target.structure) target.structure = { current: 60, max: 60 };
        target.structure.current = newStructure;
      }
    });
    updateMap(activeMapId, { tokens: nextTokens });

    AudioService.playCombatHit(deltaAmount >= 15);

    const screenX = (token.x || 0) * scale + position.x;
    const screenY = (token.y || 0) * scale + position.y;
    triggerFloatingCombatText(
      screenX,
      screenY,
      isDamage ? `-${deltaAmount} STRUCT` : `+${deltaAmount} STRUCT`,
      isDamage ? 'structure_damage' : 'structure_heal'
    );

    if (token.linkedHeroId && updateCharacterStructure) {
      updateCharacterStructure(token.linkedHeroId, newStructure);
    }
  };

  const handleUpdateTokenHp = handleUpdateTokenHealth;

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

  const handleUpdateTokenConditions = (tokenId, nextConditions) => {
    handleUpdateToken(tokenId, { conditions: nextConditions });
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
      const curHealth = parseInt(item.health || item.vitality || item.hp || item.derived_max_hp || 30, 10);
      const maxHealth = parseInt(item.maxHealth || curHealth, 10);
      const curVitality = parseInt(item.vitality || 20, 10);
      const maxVitality = parseInt(item.maxVitality || curVitality, 10);
      const curStructure = parseInt(item.structure || curHealth + curVitality, 10);
      const maxStructure = parseInt(item.maxStructure || curStructure, 10);
      const derivedInit = item.agility ? parseInt(item.agility, 10) : (item.initiative || 10);

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
        layerId: 'layer_tokens',
        health: { current: curHealth, max: maxHealth },
        vitality: { current: curVitality, max: maxVitality },
        structure: { current: curStructure, max: maxStructure },
        toughness: parseInt(item.toughness || item.armor || 0, 10),
        defense: parseInt(item.defense || 12, 10),
        actionPoints: parseInt(item.actionPoints || item.ap || 3, 10),
        initiative: derivedInit,
        conditions: [],
        attacks: item.attacks || item.weaponry || []
      };

      updateMap(activeMapId, { tokens: [...tokens, newUnitToken] });
      AudioService.playCombatHit(false);
      triggerFloatingCombatText(targetPos ? (posX * scale + position.x) : stageSize.width / 2, targetPos ? (posY * scale + position.y) : stageSize.height / 2, `+ ${item.name || 'Adversary'}`, 'crit_fail');
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
        hazard: isHazard,
        damageDice: item.damage || item.damageDice || '2d10',
        saveDc: item.saveDc || item.dc || 14
      };

      updateMap(activeMapId, { objects: [...objects, newObject] });
      AudioService.playTerminalBeep(950, 0.05);
      triggerFloatingCombatText(targetPos ? (posX * scale + position.x) : stageSize.width / 2, targetPos ? (posY * scale + position.y) : stageSize.height / 2, `+ ${item.name || 'Asset'}`, 'heal');
    }
  };

  const handleSummonStoryElement = (element, targetPos = null) => {
    if (!currentMap || !element) return;

    const posX = targetPos?.x !== undefined ? targetPos.x : Math.round((-position.x + stageSize.width / 2) / scale);
    const posY = targetPos?.y !== undefined ? targetPos.y : Math.round((-position.y + stageSize.height / 2) / scale);

    const type = element.type || 'Scene';
    recordHistory();

    if (type === 'Persona') {
      const curHealth = parseInt(element['health'] || element.health || 25, 10);
      const curVitality = parseInt(element['vitality'] || element.vitality || 20, 10);
      const newNpcToken = {
        id: `token_persona_${element.id || Date.now()}_${Math.floor(Math.random()*1000)}`,
        type: 'npc',
        storyElementId: element.id,
        storyElementType: 'Persona',
        linkedStoryElement: element,
        label: element['char-name'] || element.name || element.title || 'NPC Persona',
        avatarUrl: element.avatarUrl || null,
        x: posX,
        y: posY,
        radius: 35,
        fill: '#a855f7',
        layerId: 'layer_tokens',
        health: { current: curHealth, max: curHealth },
        vitality: { current: curVitality, max: curVitality },
        defense: parseInt(element.defense || 12, 10),
        actionPoints: 3,
        initiative: 11,
        conditions: [],
        script: {
          type: 'dialogue_bark',
          alertBark: element.voice || element.mannerisms || 'Greetings, operative.'
        }
      };
      updateMap(activeMapId, { tokens: [...tokens, newNpcToken] });
      AudioService.playTerminalBeep(1100, 0.1);
      triggerFloatingCombatText(targetPos ? (posX * scale + position.x) : stageSize.width / 2, targetPos ? (posY * scale + position.y) : stageSize.height / 2, `+ ${newNpcToken.label}`, 'heal');
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
      AudioService.playCombatHit(false);
      triggerFloatingCombatText(targetPos ? (posX * scale + position.x) : stageSize.width / 2, targetPos ? (posY * scale + position.y) : stageSize.height / 2, `+ Trap: ${newTrap.label}`, 'crit_fail');
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
      triggerFloatingCombatText(targetPos ? (posX * scale + position.x) : stageSize.width / 2, targetPos ? (posY * scale + position.y) : stageSize.height / 2, `+ ${newStoryObject.label}`, 'heal');
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

        // Transform window/client coordinates to Stage canvas space
        const canvasX = (mouseX - position.x) / scale;
        const canvasY = (mouseY - position.y) / scale;

        const derivedInitiative = data.agility ? parseInt(data.agility, 10) : 10;
        const curHealth = data.currentHealth !== undefined ? data.currentHealth : (data.maxHealth || data.currentHp || 30);
        const maxHealth = data.maxHealth || data.maxHp || 30;
        const curVitality = data.currentVitality !== undefined ? data.currentVitality : (data.maxVitality || 30);
        const maxVitality = data.maxVitality || 30;
        const curStructure = data.currentStructure !== undefined ? data.currentStructure : (data.maxStructure || curHealth + curVitality);
        const maxStructure = data.maxStructure || (maxHealth + maxVitality);
        const isSynthetic = data.isSynthetic || false;
        const toughness = data.toughness !== undefined ? data.toughness : 0;

        const newHeroToken = {
          id: `token_hero_${data.heroId}_${Date.now()}`,
          type: 'hero',
          linkedHeroId: data.heroId,
          label: data.name || 'Hero',
          avatarUrl: data.avatarUrl || null,
          x: Math.round(canvasX),
          y: Math.round(canvasY),
          radius: 35,
          fill: '#0284c7',
          layerId: 'layer_tokens',
          health: {
            current: curHealth,
            max: maxHealth
          },
          vitality: {
            current: curVitality,
            max: maxVitality
          },
          structure: {
            current: curStructure,
            max: maxStructure
          },
          isSynthetic,
          toughness,
          hp: {
            current: curHealth,
            max: maxHealth
          },
          defense: data.defense || 12,
          actionPoints: data.actionPoints || 3,
          initiative: derivedInitiative,
          conditions: [],
          karma: data.karma !== undefined ? data.karma : 3,
          maxKarma: data.maxKarma || 3,
          charisma: data.charisma || 10,
          earned_ap: data.earned_ap || 0,
          available_ap: data.available_ap || 0
        };

        recordHistory();
        updateMap(activeMapId, { tokens: [...tokens, newHeroToken] });
        AudioService.playTerminalBeep(880, 0.08);
        triggerFloatingCombatText(mouseX, mouseY, `+ ${data.name}`, 'heal');
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

  const handleSummonHeroToken = (data) => {
    if (!currentMap) return;

    const centerX = (-position.x + stageSize.width / 2) / scale;
    const centerY = (-position.y + stageSize.height / 2) / scale;
    const derivedInitiative = data.agility ? parseInt(data.agility, 10) : 10;
    const curHealth = data.currentHealth !== undefined ? data.currentHealth : (data.maxHealth || data.currentHp || 30);
    const maxHealth = data.maxHealth || data.maxHp || 30;
    const curVitality = data.currentVitality !== undefined ? data.currentVitality : (data.maxVitality || 30);
    const maxVitality = data.maxVitality || 30;
    const curStructure = data.currentStructure !== undefined ? data.currentStructure : (data.maxStructure || curHealth + curVitality);
    const maxStructure = data.maxStructure || (maxHealth + maxVitality);
    const isSynthetic = data.isSynthetic || false;
    const toughness = data.toughness !== undefined ? data.toughness : 0;

    const newHeroToken = {
      id: `token_hero_${data.heroId}_${Date.now()}`,
      type: 'hero',
      linkedHeroId: data.heroId,
      label: data.name || 'Hero',
      avatarUrl: data.avatarUrl || null,
      x: Math.round(centerX),
      y: Math.round(centerY),
      radius: 35,
      fill: '#0284c7',
      layerId: 'layer_tokens',
      health: {
        current: curHealth,
        max: maxHealth
      },
      vitality: {
        current: curVitality,
        max: maxVitality
      },
      structure: {
        current: curStructure,
        max: maxStructure
      },
      isSynthetic,
      toughness,
      hp: {
        current: curHealth,
        max: maxHealth
      },
      defense: data.defense || 12,
      actionPoints: data.actionPoints || 3,
      initiative: derivedInitiative,
      conditions: [],
      karma: data.karma !== undefined ? data.karma : 3,
      maxKarma: data.maxKarma || 3,
      charisma: data.charisma || 10,
      earned_ap: data.earned_ap || 0,
      available_ap: data.available_ap || 0
    };

    recordHistory();
    updateMap(activeMapId, { tokens: [...tokens, newHeroToken] });
    AudioService.playTerminalBeep(880, 0.08);
    triggerFloatingCombatText(stageSize.width / 2, stageSize.height / 2, `+ ${data.name}`, 'heal');
  };

  // Keyboard Shortcuts Hotkeys Manager Listener Element
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
        return;
      }

      if (e.key === 'g' || e.key === 'G') {
        const nextGrid = !currentMap?.gridMode || currentMap.gridMode === 'off' ? 'square' : (currentMap.gridMode === 'square' ? 'hex' : 'off');
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

  const handleCommitLandmass = ({ terrains: generatedTerrains, objects: generatedObjects, replaceExisting }) => {
    let targetId = activeMapId;
    if (!targetId || universeState.maps.length === 0) {
      targetId = uuidv4();
      addMap({
        id: targetId,
        type: 'Planetary',
        title: 'Generated World',
        lines: [], tokens: [], terrains: generatedTerrains, objects: generatedObjects, texts: [], fog: [], layers: DEFAULT_LAYERS
      });
      setActiveMapId(targetId);
      return;
    }
    recordHistory();
    const nextTerrains = replaceExisting ? generatedTerrains : [...terrains, ...generatedTerrains];
    const nextObjects = [...objects, ...generatedObjects];
    updateMap(targetId, { terrains: nextTerrains, objects: nextObjects });
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

  const deleteCustomLayer = (layerId) => {
    if (mapLayers.length <= 1) return alert("Must have at least one layer!");
    const targetLayer = mapLayers.find(l => l.id === layerId);
    const layerName = targetLayer?.name || 'this layer';
    if (!confirmTypedDeletion(layerName, 'map layer')) return;
    recordHistory();
    updateMap(activeMapId, { layers: mapLayers.filter(l => l.id !== layerId) });
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        alert("Failed to export PNG map image.");
      }
    }, 50);
  };

  useEffect(() => {
    if (mapExportPngRef) {
      mapExportPngRef.current = handleExportPNG;
    }
  });

  const handleNextTurn = () => {
    const sortedTokens = [...tokens]
      .filter(t => t.type !== 'link')
      .sort((a, b) => {
        const initA = a.initiative !== undefined && a.initiative !== null ? a.initiative : -99;
        const initB = b.initiative !== undefined && b.initiative !== null ? b.initiative : -99;
        return initB - initA;
      });

    if (sortedTokens.length === 0) return;
    const currentIndex = sortedTokens.findIndex(t => t.id === activeTurnTokenId);
    const nextIndex = (currentIndex + 1) % sortedTokens.length;
    setActiveTurnTokenId(sortedTokens[nextIndex].id);
  };

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
      const gridSize = 50, width = 4000, height = 3000;
      const gridLines = [];
      for (let i = 0; i <= width; i += gridSize) gridLines.push(<Line key={`v-${i}`} points={[i, 0, i, height]} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1} />);
      for (let j = 0; j <= height; j += gridSize) gridLines.push(<Line key={`h-${j}`} points={[0, j, width, j]} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1} />);
      return gridLines;
    }

    if (gridMode === 'hex') {
      const hexRadius = 50, hexWidth = Math.sqrt(3) * hexRadius, hexHeight = 2 * hexRadius;
      const cols = Math.ceil(4000 / hexWidth), rows = Math.ceil(3000 / (hexHeight * 0.75));
      const hexes = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let x = c * hexWidth;
          if (r % 2 !== 0) x += hexWidth / 2;
          let y = r * hexHeight * 0.75;
          hexes.push(<RegularPolygon key={`${r}-${c}`} x={x} y={y} sides={6} radius={hexRadius} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1} />);
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
        showHeroDrawer={showHeroDrawer}
        setShowHeroDrawer={setShowHeroDrawer}
        showOmnicortexDrawer={showOmnicortexDrawer}
        setShowOmnicortexDrawer={setShowOmnicortexDrawer}
        showCombatTracker={showCombatTracker}
        setShowCombatTracker={setShowCombatTracker}
        showMetadataPanel={showMetadataPanel}
        setShowMetadataPanel={setShowMetadataPanel}
        showKeyPanel={showKeyPanel}
        setShowKeyPanel={setShowKeyPanel}
        selectedId={selectedId}
        eraseElement={eraseElement}
        onClearMap={handleClearMap}
        onResetView={() => { setScale(1); setPosition({x:0, y:0}); }}
        onExportPNG={handleExportPNG}
        onOpenLandmassGenerator={() => setIsLandmassModalOpen(true)}
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
        onDeleteMapTab={(mapId, title) => {
          if (confirmTypedDeletion(title || 'Untitled Map', 'map element')) {
            deleteMap(mapId);
          }
        }}
        isVttDrawerOpen={isVttDrawerOpen}
        onToggleVttDrawer={() => setIsVttDrawerOpen(prev => !prev)}
      />

      <LandmassGeneratorModal
        isOpen={isLandmassModalOpen}
        onClose={() => setIsLandmassModalOpen(false)}
        onCommitLandmass={handleCommitLandmass}
        defaultRenderMode={terrainRenderMode}
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

        const currentHealth = item.health?.current ?? (item.hp?.current ?? 30);
        const maxHealth = item.health?.max ?? (item.hp?.max ?? 30);
        const currentVitality = item.vitality?.current ?? 30;
        const maxVitality = item.vitality?.max ?? 30;
        const currentInit = item.initiative !== undefined && item.initiative !== null ? item.initiative : 10;
        const currentConditions = item.conditions || [];

        return (
          <div className="relative z-20 bg-[#161b22]/95 p-2 border-b border-[#0D5C63]/60 flex items-center justify-between text-xs gap-3 flex-wrap text-slate-200 backdrop-blur-md">
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

              {/* Unit Controls: Health, Vitality, Initiative & Conditions */}
              {isUnit && (
                <>
                  {/* Health Controls (Physical) */}
                  <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">HLTH:</span>
                    <button onClick={() => handleUpdateTokenHealth(item.id, Math.max(0, currentHealth - 5), true, 5)} className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] font-bold">-5</button>
                    <button onClick={() => handleUpdateTokenHealth(item.id, Math.max(0, currentHealth - 1), true, 1)} className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] font-bold">-1</button>
                    <span className="font-mono text-emerald-300 font-bold px-1">{currentHealth} / {maxHealth}</span>
                    <button onClick={() => handleUpdateTokenHealth(item.id, Math.min(maxHealth, currentHealth + 1), false, 1)} className="px-1.5 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[10px] font-bold">+1</button>
                    <button onClick={() => handleUpdateTokenHealth(item.id, Math.min(maxHealth, currentHealth + 5), false, 5)} className="px-1.5 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[10px] font-bold">+5</button>
                  </div>

                  {/* Vitality Controls (Mental / Energy) */}
                  <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase">VIT:</span>
                    <button onClick={() => handleUpdateTokenVitality(item.id, Math.max(0, currentVitality - 5), true, 5)} className="px-1.5 py-0.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 rounded text-[10px] font-bold">-5</button>
                    <button onClick={() => handleUpdateTokenVitality(item.id, Math.max(0, currentVitality - 1), true, 1)} className="px-1.5 py-0.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 rounded text-[10px] font-bold">-1</button>
                    <span className="font-mono text-cyan-300 font-bold px-1">{currentVitality} / {maxVitality}</span>
                    <button onClick={() => handleUpdateTokenVitality(item.id, Math.min(maxVitality, currentVitality + 1), false, 1)} className="px-1.5 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded text-[10px] font-bold">+1</button>
                    <button onClick={() => handleUpdateTokenVitality(item.id, Math.min(maxVitality, currentVitality + 5), false, 5)} className="px-1.5 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded text-[10px] font-bold">+5</button>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Init:</span>
                    <input
                      type="number"
                      value={currentInit}
                      onChange={(e) => updateItem({ initiative: parseInt(e.target.value || 0, 10) })}
                      className="w-10 bg-[#161b22] border border-[#0D5C63]/60 text-amber-300 font-mono text-center font-bold rounded text-xs outline-none"
                    />
                    <button
                      onClick={() => updateItem({ initiative: Math.floor(Math.random() * 20) + 1 })}
                      className="px-1.5 py-0.5 bg-amber-950 hover:bg-amber-900 border border-amber-600 text-amber-300 rounded text-[10px] font-bold"
                    >
                      🎲
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentConditions.map(cond => (
                      <button
                        key={cond}
                        onClick={() => {
                          const next = currentConditions.filter(c => c !== cond);
                          updateItem({ conditions: next });
                        }}
                        className="px-2 py-0.5 bg-cyan-950 text-cyan-200 border border-cyan-400/80 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-red-950 hover:text-red-300 transition-colors group"
                      >
                        <span>{cond}</span>
                        <span className="text-[9px] opacity-60 group-hover:opacity-100">×</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setIsStatusModalOpen(true)}
                      className="px-2.5 py-0.5 bg-cyan-950/80 hover:bg-cyan-900 border border-[#22d3ee]/60 text-[#22d3ee] rounded text-[10px] font-bold tracking-wider uppercase transition-all shadow-[0_0_6px_rgba(34,211,238,0.3)] flex items-center gap-1"
                    >
                      <span>CONDITIONS...</span>
                    </button>
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

      {/* Studio Work Area: Docked VTT Left Menu + Canvas Container */}
      <div className="flex-1 flex overflow-hidden relative">

        <MapToolsPanel
          showToolsPanel={showToolsPanel} setShowToolsPanel={setShowToolsPanel}
          showSettingsPanel={showSettingsPanel} setShowSettingsPanel={setShowSettingsPanel}
          activeTool={activeTool} setActiveTool={setActiveTool}
          selectedTerrain={selectedTerrain} setSelectedTerrain={setSelectedTerrain}
          terrainWidth={terrainWidth} setTerrainWidth={setTerrainWidth}
          selectedObjectType={selectedObjectType} setSelectedObjectType={setSelectedObjectType}
          selectedWallType={selectedWallType} setSelectedWallType={setSelectedWallType}
          doorLockDc={doorLockDc} setDoorLockDc={setDoorLockDc}
          rulerAvailableAp={rulerAvailableAp} setRulerAvailableAp={setRulerAvailableAp}
          activeSensorMode={activeSensorMode} setActiveSensorMode={setActiveSensorMode}
          pencilColor={pencilColor} setPencilColor={setPencilColor}
          pencilWidth={pencilWidth} setPencilWidth={setPencilWidth}
          tokenType={tokenType} setTokenType={setTokenType}
          tokenLabelInput={tokenLabelInput} setTokenLabelInput={setTokenLabelInput}
          tokenOmnicortexData={tokenOmnicortexData}
          onOpenOmnicortexLink={() => setIsTokenSelectorOpen(true)}
          textLabelInput={textLabelInput} setTextLabelInput={setTextLabelInput}
          textColor={textColor} setTextColor={setTextColor}
          textSize={textSize} setTextSize={setTextSize}
          fogEnabled={fogEnabled} setFogEnabled={setFogEnabled}
          currentMapScale={currentMap?.type || 'Planetary'}
          customAssets={universeState.customAssets || { terrains: [], objects: [] }}
          selectedLightColor={selectedLightColor} setSelectedLightColor={setSelectedLightColor}
          selectedLightRadius={selectedLightRadius} setSelectedLightRadius={setSelectedLightRadius}
          selectedLightAnimation={selectedLightAnimation} setSelectedLightAnimation={setSelectedLightAnimation}
          onOpenAssetManager={() => setIsAssetManagerOpen(true)}
          onOpenHeroDrawer={() => setShowHeroDrawer(true)}
          onOpenOmnicortexDrawer={() => setShowOmnicortexDrawer(true)}
          showStoryDrawer={showStoryDrawer}
          setShowStoryDrawer={setShowStoryDrawer}
          showAutomationConsole={showAutomationConsole}
          setShowAutomationConsole={setShowAutomationConsole}
          onOpenLandmassGenerator={() => setIsLandmassModalOpen(true)}
          onOpenUvttImport={() => setIsUvttModalOpen(true)}
          onOpenLayersPanel={() => setShowLayersPanel(true)}
        />

        <MapLayersPanel
          showLayersPanel={showLayersPanel} setShowLayersPanel={setShowLayersPanel}
          mapLayers={mapLayers}
          toggleLayerVisibility={toggleLayerVisibility}
          toggleLayerLock={toggleLayerLock}
          deleteCustomLayer={deleteCustomLayer}
          newLayerNameInput={newLayerNameInput}
          setNewLayerNameInput={setNewLayerNameInput}
          addCustomLayer={addCustomLayer}
        />

        <FolioHeroTokenDrawer
          showDrawer={showHeroDrawer}
          setShowDrawer={setShowHeroDrawer}
          onSummonToken={handleSummonHeroToken}
        />

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

        <ReactiveAutomationConsole
          isOpen={showAutomationConsole}
          onClose={() => setShowAutomationConsole(false)}
          tokens={tokens}
          objects={objects}
          onUpdateTokens={(next) => {
            recordHistory();
            updateMap(activeMapId, { tokens: next });
          }}
          onUpdateObjects={(next) => {
            recordHistory();
            updateMap(activeMapId, { objects: next });
          }}
          onTriggerFloatingText={triggerFloatingCombatText}
          isAutomationActive={isAutomationActive}
          onToggleAutomation={() => setIsAutomationActive(prev => !prev)}
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
            onTriggerFloatingText={triggerFloatingCombatText}
            scale={scale}
            position={position}
          />
        )}

        <MapCombatTracker
          tokens={tokens}
          activeTurnTokenId={activeTurnTokenId}
          setActiveTurnTokenId={setActiveTurnTokenId}
          onNextTurn={handleNextTurn}
          showTracker={showCombatTracker}
          setShowTracker={setShowCombatTracker}
          onSelectToken={(id) => setSelectedId(id)}
          onUpdateTokenHealth={handleUpdateTokenHealth}
          onUpdateTokenVitality={handleUpdateTokenVitality}
          onUpdateTokenStructure={handleUpdateTokenStructure}
          onUpdateTokenHp={handleUpdateTokenHealth}
          onUpdateToken={handleUpdateToken}
          onUpdateTokenConditions={handleUpdateTokenConditions}
          onTriggerFloatingText={triggerFloatingCombatText}
          scale={scale}
          position={position}
        />

        <MapMetadataPanel
          showPanel={showMetadataPanel}
          setShowPanel={setShowMetadataPanel}
          currentMap={currentMap}
          updateMap={updateMap}
          universeState={universeState}
          setActiveMapId={setActiveMapId}
        />

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

        <StatusGemsModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          selectedToken={tokens.find(t => t.id === selectedId)}
          activeConditions={tokens.find(t => t.id === selectedId)?.conditions || []}
          onToggleCondition={(cond) => {
            const token = tokens.find(t => t.id === selectedId);
            if (!token) return;
            const currentConditions = token.conditions || [];
            const hasCond = currentConditions.includes(cond);
            const nextConds = hasCond ? currentConditions.filter(c => c !== cond) : [...currentConditions, cond];
            recordHistory();
            const nextTokens = produce(tokens, draft => {
              const item = draft.find(t => t.id === selectedId);
              if (item) item.conditions = nextConds;
            });
            updateMap(activeMapId, { tokens: nextTokens });
          }}
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
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={handleStageDrop}
          className={`flex-1 h-full min-w-0 relative ${activeTool === 'select' ? 'cursor-grab active:cursor-grabbing' : (activeTool === 'eraser' ? 'cursor-pointer' : 'cursor-crosshair')}`}
        >
          <FloatingCombatText activeFloats={activeFloats} />

          {/* Floating VTT Quick Launcher */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
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

          {/* Operative Player Tactical HUD */}
          {vttRole === 'operative' && (
            <OperativeTacticalHud
              userControlledTokens={tokens}
              activeTokenId={selectedId || tokens[0]?.id}
              onSelectActiveToken={(id) => setSelectedId(id)}
              targetToken={tokens.find(t => t.id !== selectedId && t.type !== 'link')}
              onTriggerAttack={(attId, tgtId) => {
                triggerFloatingCombatText(window.innerWidth / 2, window.innerHeight - 150, `TARGET ENGAGED: 2d10 ATTACK`, 'damage');
              }}
              onDropPing={(pingType) => handleDropTacticalPing(pingType)}
              onTriggerFloatingText={triggerFloatingCombatText}
            />
          )}

          {!currentMap ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold text-xl italic">
              Please create or select a map.
            </div>
          ) : (
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              onWheel={handleWheel}
              onMouseDown={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'bgRect';
                if (clickedOnEmpty && activeTool === 'select') setSelectedId(null);
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
                <Rect x={0} y={0} width={4000} height={3000} fill="#111827" name="bgRect" />
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
                          const stage = e.target.getStage();
                          const mousePos = stage.getPointerPosition();
                          setRadialMenuState({
                            isOpen: true,
                            position: { x: e.evt.clientX, y: e.evt.clientY },
                            token: token
                          });
                        }}
                      >
                        <TokenNode
                          shapeProps={token}
                          isSelected={token.id === selectedId}
                          isActiveTurn={token.id === activeTurnTokenId}
                          isEraser={activeTool === 'eraser'}
                          isLocked={isLayerLocked('layer_tokens')}
                          onErase={eraseElement}
                          onSelect={() => { if (activeTool === 'select' && !isLayerLocked('layer_tokens')) setSelectedId(token.id); }}
                          onDoubleClick={() => { if (token.type === 'link' && token.targetMapId) { setActiveMapId(token.targetMapId); setSelectedId(null); } }}
                          onChange={(newAttrs) => {
                            const nextTokens = produce(tokens, draft => {
                              const index = draft.findIndex(t => t.id === token.id);
                              if (index !== -1) draft[index] = newAttrs;
                            });
                            updateMap(activeMapId, { tokens: nextTokens });

                            // Autonomous Reactive Traps & Hazards Detection
                            if (isAutomationActive && (token.x !== newAttrs.x || token.y !== newAttrs.y)) {
                              const triggered = evaluateTrapTriggers(newAttrs, objects, tokens);
                              triggered.forEach(evt => {
                                triggerFloatingCombatText(
                                  (newAttrs.x || 0) * scale + position.x,
                                  (newAttrs.y || 0) * scale + position.y,
                                  evt.isAlarm ? '🚨 ALARM TRIPPED!' : `💥 -${evt.damage} DAMAGE (TRAP)`,
                                  evt.isAlarm ? 'crit_fail' : 'damage'
                                );
                                if (evt.damage > 0) {
                                  handleUpdateTokenHealth(newAttrs.id, Math.max(0, (newAttrs.health?.current || 30) - evt.damage), true, evt.damage);
                                }
                              });
                            }
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
                  availableAp={rulerAvailableAp}
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
      </div>

      {/* Contextual Radial Action Wheel */}
      <TokenRadialActionWheel
        isOpen={radialMenuState.isOpen}
        onClose={() => setRadialMenuState({ isOpen: false, position: { x: 0, y: 0 }, token: null })}
        position={radialMenuState.position}
        token={radialMenuState.token}
        onActionSelect={handleRadialActionSelect}
      />

      {/* Universal VTT (.dd2vtt) Importer Modal */}
      <UvttImportModal
        isOpen={isUvttModalOpen}
        onClose={() => setIsUvttModalOpen(false)}
        onImportComplete={(importedMap) => {
          addMap(importedMap);
          setActiveMapId(importedMap.id);
          triggerFloatingCombatText(window.innerWidth / 2, 100, `UNIVERSAL VTT IMPORTED: ${importedMap.title}`, 'heal');
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
          triggerFloatingCombatText(window.innerWidth / 2, 100, `ENVIRONMENT: ${envId.toUpperCase()}`, 'karma');
        }}
        onBatchTokenAction={(action) => {
          triggerFloatingCombatText(window.innerWidth / 2, 100, `BATCH ACTION: ${action.toUpperCase()}`, 'heal');
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
