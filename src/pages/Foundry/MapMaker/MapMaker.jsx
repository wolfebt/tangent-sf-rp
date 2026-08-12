import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Line, RegularPolygon, Image as KonvaImage } from 'react-konva';
import { useCampaign, formatExportFilename } from '../../../context/CampaignContext';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';

import { MAP_TYPES, DEFAULT_LAYERS, MASTER_TERRAINS, MASTER_OBJECTS, PENCIL_COLORS, PENCIL_WIDTHS, TEXT_COLORS } from './map/MapConstants';
import { MapObjectNode, TokenNode, TextLabelNode } from './map/MapObjectNode';
import MapToolbar from './map/MapToolbar';
import MapToolsPanel from './map/MapToolsPanel';
import MapLayersPanel from './map/MapLayersPanel';
import MapCombatTracker from './map/MapCombatTracker';
import MapMetadataPanel from './map/MapMetadataPanel';
import MapKeyPanel from './map/MapKeyPanel';
import StatusGemsModal from './map/StatusGemsModal';
import LandmassGeneratorModal from './map/LandmassGeneratorModal';
import MapAssetManagerModal from './map/MapAssetManagerModal';

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
  const [showCombatTracker, setShowCombatTracker] = useState(false);
  const [showMetadataPanel, setShowMetadataPanel] = useState(false);
  const [showKeyPanel, setShowKeyPanel] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [activeTurnTokenId, setActiveTurnTokenId] = useState(null);

  // Tools & UI State
  const [activeTool, setActiveTool] = useState('select');
  const [gridMode, setGridMode] = useState('hex');
  const [terrainRenderMode, setTerrainRenderMode] = useState('organic'); // 'organic' (default smooth vector) or 'hex' (discrete hex tile grid)


  // Tool Sub-Options State
  const [selectedTerrain, setSelectedTerrain] = useState(MASTER_TERRAINS['Planetary'][0]);
  const [terrainWidth, setTerrainWidth] = useState(30);
  const [selectedObjectType, setSelectedObjectType] = useState(MASTER_OBJECTS['Planetary'][0]);
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
  const [selectedId, setSelectedId] = useState(null);

  // Map Creation Modal, Landmass Generator Modal, Asset Manager Modal & Shortcuts Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLandmassModalOpen, setIsLandmassModalOpen] = useState(false);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [newMapType, setNewMapType] = useState('Planetary');
  const [newMapTitle, setNewMapTitle] = useState('');
  const [newLayerNameInput, setNewLayerNameInput] = useState('');

  const currentMap = universeState.maps.find(m => m.id === activeMapId);
  const lines = currentMap?.lines || [];
  const tokens = currentMap?.tokens || [];
  const terrains = currentMap?.terrains || [];
  const objects = currentMap?.objects || [];
  const texts = currentMap?.texts || [];
  const fog = currentMap?.fog || [];
  const mapLayers = currentMap?.layers || DEFAULT_LAYERS;
  const { undoStack, redoStack, recordHistory, handleUndo, handleRedo } = useMapHistory({
    currentMap, lines, tokens, terrains, objects, texts, fog, mapLayers, updateMap, activeMapId
  });

  const {
    scale, setScale, position, setPosition,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
    zoomBy, panBy
  } = useMapCanvasEvents({
    currentMap, activeMapId, updateMap, recordHistory,
    activeTool, lines, terrains, fog, objects, tokens, texts,
    pencilColor, pencilWidth, selectedTerrain, terrainWidth, selectedObjectType,
    tokenType, tokenLabelInput, tokenOmnicortexData, textLabelInput, textColor, textSize
  });

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
      objects: objects.filter(item => item.id !== id),
      texts: texts.filter(item => item.id !== id),
      fog: fog.filter(item => item.id !== id)
    });
    if (selectedId === id) setSelectedId(null);
  };

  const handleClearMap = () => {
    recordHistory();
    updateMap(activeMapId, { lines: [], terrains: [], objects: [], texts: [], fog: [] });
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
      {/* Multi-Map Campaign Tab Switcher element & Hotkeys Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0 z-30">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mr-1 shrink-0">
            🗺️ Campaign Maps:
          </span>
          {(universeState.maps || []).map(m => {
            const isActive = m.id === activeMapId;
            return (
              <div
                key={m.id}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase transition-all shrink-0 border ${
                  isActive
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <button
                  onClick={() => setActiveMapId(m.id)}
                  className="truncate max-w-[120px] text-left"
                  title={m.title || 'Untitled Map'}
                >
                  {m.title || 'Untitled Map'}
                </button>
                {universeState.maps.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirmTypedDeletion(m.title || 'Untitled Map', 'map element')) {
                        deleteMap(m.id);
                      }
                    }}
                    className="text-slate-500 hover:text-red-400 font-bold ml-1"
                    title="Delete map element"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={() => {
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
            className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/60 border border-amber-500/50 text-amber-300 rounded text-xs font-bold uppercase shrink-0 transition-colors"
            title="Add new map element to campaign"
          >
            + New Map Tab
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"
            title="View Canvas Keyboard Shortcuts Legend element"
          >
            <span>⌨️</span> Hotkeys
          </button>
        </div>
      </div>

      {/* Canvas Keyboard Shortcuts Manager Legend Modal Element */}
      {isShortcutsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <span>⌨️</span> Canvas Hotkeys & Keyboard Shortcuts
              </h3>
              <button onClick={() => setIsShortcutsModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Toggle Grid Mode (Square / Hex / Off)</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-mono font-bold rounded border border-slate-700">G</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Toggle Fog of War Tool</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-mono font-bold rounded border border-slate-700">F</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Select Tool Mode</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-mono font-bold rounded border border-slate-700">V</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Pan Tool Mode</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-mono font-bold rounded border border-slate-700">H</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Delete Selected Canvas Node</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-red-400 font-mono font-bold rounded border border-slate-700">Del / Backspace</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-300 font-medium">Toggle Hotkeys Legend</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 font-mono font-bold rounded border border-slate-700">?</kbd>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setIsShortcutsModalOpen(false)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs uppercase"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 w-96 shadow-xl text-white">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">Create New Map</h3>
            <form onSubmit={createNewMap} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">Scale / Type</label>
                <select value={newMapType} onChange={e => setNewMapType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white p-2 rounded focus:border-amber-500 outline-none">
                  {MAP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">Map Title</label>
                <input type="text" value={newMapTitle} onChange={e => setNewMapTitle(e.target.value)} placeholder="E.g. Sol Sector" autoFocus className="w-full bg-slate-700 border border-slate-600 text-white p-2 rounded focus:border-amber-500 outline-none" required />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      />

      <LandmassGeneratorModal
        isOpen={isLandmassModalOpen}
        onClose={() => setIsLandmassModalOpen(false)}
        onCommitLandmass={handleCommitLandmass}
        defaultRenderMode={terrainRenderMode}
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

        const currentHp = item.hp?.current ?? 30;
        const maxHp = item.hp?.max ?? 30;
        const currentInit = item.initiative !== undefined && item.initiative !== null ? item.initiative : 10;
        const currentConditions = item.conditions || [];

        return (
          <div className="relative z-40 bg-[#161b22]/95 p-2 border-b border-[#0D5C63]/60 flex items-center justify-between text-xs gap-3 flex-wrap text-slate-200 backdrop-blur-md">
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

              {/* Unit Controls: HP, Initiative & Conditions */}
              {isUnit && (
                <>
                  <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">HP:</span>
                    <button onClick={() => updateItem({ hp: { current: Math.max(0, currentHp - 5), max: maxHp } })} className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] font-bold">-5</button>
                    <button onClick={() => updateItem({ hp: { current: Math.max(0, currentHp - 1), max: maxHp } })} className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] font-bold">-1</button>
                    <span className="font-mono text-white font-bold px-1">{currentHp} / {maxHp}</span>
                    <button onClick={() => updateItem({ hp: { current: Math.min(maxHp, currentHp + 1), max: maxHp } })} className="px-1.5 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[10px] font-bold">+1</button>
                    <button onClick={() => updateItem({ hp: { current: Math.min(maxHp, currentHp + 5), max: maxHp } })} className="px-1.5 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[10px] font-bold">+5</button>
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

      {/* Canvas + Floating Toolboxes Container */}
      <div className="flex-1 overflow-hidden relative">

        <MapToolsPanel
          showToolsPanel={showToolsPanel} setShowToolsPanel={setShowToolsPanel}
          showSettingsPanel={showSettingsPanel} setShowSettingsPanel={setShowSettingsPanel}
          activeTool={activeTool} setActiveTool={setActiveTool}
          selectedTerrain={selectedTerrain} setSelectedTerrain={setSelectedTerrain}
          terrainWidth={terrainWidth} setTerrainWidth={setTerrainWidth}
          selectedObjectType={selectedObjectType} setSelectedObjectType={setSelectedObjectType}
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
          onOpenAssetManager={() => setIsAssetManagerOpen(true)}
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

        <MapCombatTracker
          tokens={tokens}
          activeTurnTokenId={activeTurnTokenId}
          setActiveTurnTokenId={setActiveTurnTokenId}
          onNextTurn={handleNextTurn}
          showTracker={showCombatTracker}
          setShowTracker={setShowCombatTracker}
          onSelectToken={(id) => setSelectedId(id)}
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
        <div className={`w-full h-full relative ${activeTool === 'select' ? 'cursor-grab active:cursor-grabbing' : (activeTool === 'eraser' ? 'cursor-pointer' : 'cursor-crosshair')}`}>
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
              <Layer>
                <Rect x={0} y={0} width={4000} height={3000} fill="#111827" name="bgRect" />
              </Layer>

              {isLayerVisible('layer_terrain') && (
                <Layer>
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
                </Layer>
              )}

              {isLayerVisible('layer_objects') && (
                <Layer>
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
                </Layer>
              )}

              <Layer listening={false}>
                {renderGrid()}
              </Layer>

              {isLayerVisible('layer_annotations') && (
                <Layer>
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
                </Layer>
              )}

              {isLayerVisible('layer_tokens') && (
                <Layer>
                  {tokens.map((token) => (
                    <TokenNode
                      key={token.id}
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
                      }}
                    />
                  ))}
                </Layer>
              )}

              {isLayerVisible('layer_fog') && (
                <Layer>
                  {fogEnabled && <Rect x={0} y={0} width={4000} height={3000} fill="rgba(0, 0, 0, 0.75)" listening={false} />}
                  {fog.map((f, i) => (
                    <Line key={f.id || i} points={f.points} stroke="#000000" strokeWidth={50} tension={0.4} lineCap="round" lineJoin="round" onClick={() => !isLayerLocked('layer_fog') && activeTool === 'eraser' && eraseElement(f.id)} />
                  ))}
                </Layer>
              )}
            </Stage>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default MapPane;
