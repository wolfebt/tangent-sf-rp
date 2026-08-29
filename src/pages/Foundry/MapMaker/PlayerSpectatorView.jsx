import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Circle, Line, RegularPolygon, Group, Image as KonvaImage, Text } from 'react-konva';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useCampaign } from '../../../context/CampaignContext';
import { TokenNode, MapObjectNode, TextLabelNode } from './map/MapObjectNode';
import MapWallNode from './map/MapWallNode';
import { computeVisibilityPolygon } from '../../../services/raycastVisionService';
import { getBiomeTextureUrl } from './map/landmassGenerator';
import { getTextureUrlFromColor } from './map/MapTextures';
import { Maximize, Minimize, Compass, RotateCcw, Volume2, VolumeX, Shield, Swords, Eye } from 'lucide-react';

const SpectatorTerrainNode = ({ t }) => {
  const [patternImg, setPatternImg] = useState(null);
  const textureUrl = t.textureUrl || getBiomeTextureUrl(t.biomeType || t.terrainTypeId) || getTextureUrlFromColor(t.color || t.terrainTypeId);

  useEffect(() => {
    if (textureUrl) {
      const img = new window.Image();
      img.src = textureUrl;
      img.onload = () => setPatternImg(img);
      img.onerror = () => setPatternImg(null);
    }
  }, [textureUrl]);

  if (t.renderType === 'hexTile') {
    return (
      <RegularPolygon
        x={t.x}
        y={t.y}
        sides={6}
        radius={t.radius}
        fill={t.color}
        fillPatternImage={patternImg}
        fillPatternRepeat="repeat"
        stroke="rgba(0, 0, 0, 0.2)"
        strokeWidth={1}
      />
    );
  }

  if (t.closed || t.renderType === 'polygon') {
    return (
      <Line
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
      />
    );
  }

  return (
    <Line
      points={t.points}
      fill={t.color}
      fillPatternImage={patternImg}
      fillPatternRepeat="repeat"
      stroke={t.color}
      strokeWidth={t.strokeWidth || 30}
      tension={t.tension || 0.2}
      lineCap="round"
      lineJoin="round"
    />
  );
};

export const PlayerSpectatorView = () => {
  const { mapId } = useParams();
  const navigate = useNavigate();
  const { universeState } = useCampaign();

  const [mapData, setMapData] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeFloats, setActiveFloats] = useState([]);
  const [stageDimensions, setStageDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const containerRef = useRef(null);
  const stageRef = useRef(null);

  // 1. Listen to Live Firestore Map document updates, with fallback to local state
  useEffect(() => {
    if (!mapId) return;

    let unsub = () => {};

    try {
      if (db) {
        unsub = onSnapshot(
          doc(db, 'story_maps', mapId),
          (snapshot) => {
            if (snapshot.exists()) {
              setMapData(snapshot.data());
            } else {
              // Local fallback if document does not exist in cloud yet
              const localMap = universeState?.maps?.find(m => m.id === mapId);
              if (localMap) setMapData(localMap);
            }
          },
          (err) => {
            console.warn('Firestore spectator stream fallback to local state:', err);
            const localMap = universeState?.maps?.find(m => m.id === mapId);
            if (localMap) setMapData(localMap);
          }
        );
      } else {
        const localMap = universeState?.maps?.find(m => m.id === mapId);
        if (localMap) setMapData(localMap);
      }
    } catch (e) {
      const localMap = universeState?.maps?.find(m => m.id === mapId);
      if (localMap) setMapData(localMap);
    }

    const handleResize = () => {
      setStageDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      unsub();
      window.removeEventListener('resize', handleResize);
    };
  }, [mapId, universeState?.maps]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Center / Fit Camera to Map
  const handleResetCamera = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom with Wheel
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale
    };

    const scaleBy = 1.08;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.2, Math.min(newScale, 3.5));

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale
    });
  };

  // Pan with drag on stage
  const handleDragEnd = (e) => {
    if (e.target === stageRef.current) {
      setPosition({ x: e.target.x(), y: e.target.y() });
    }
  };

  // Security Sanitization: Strip GM-hidden tokens and layers
  const visibleTokens = useMemo(() => {
    if (!mapData?.tokens) return [];
    return mapData.tokens.filter(t => !t.isHidden && !t.isGmOnly && t.visible !== false);
  }, [mapData?.tokens]);

  const visibleObjects = useMemo(() => {
    if (!mapData?.objects) return [];
    return mapData.objects.filter(o => !o.isHidden && !o.isGmOnly && o.visible !== false);
  }, [mapData?.objects]);

  const visibleTexts = useMemo(() => {
    if (!mapData?.texts) return [];
    return mapData.texts.filter(t => !t.isHidden && !t.isGmOnly && t.visible !== false);
  }, [mapData?.texts]);

  const visibleTerrains = useMemo(() => {
    if (!mapData?.terrains) return [];
    return mapData.terrains.filter(t => !t.isHidden && !t.isGmOnly && t.visible !== false);
  }, [mapData?.terrains]);

  const visibleFog = useMemo(() => {
    if (!mapData?.fog) return [];
    return mapData.fog.filter(f => !f.isHidden);
  }, [mapData?.fog]);

  const visibleWalls = useMemo(() => {
    if (!mapData?.walls) return [];
    return mapData.walls.filter(w => !w.isSecret || w.isOpen);
  }, [mapData?.walls]);

  const activeHeroToken = useMemo(() => {
    return visibleTokens.find(t => t.type === 'hero' || t.linkedHeroId) || visibleTokens[0];
  }, [visibleTokens]);

  const visibilityPolygon = useMemo(() => {
    if (!activeHeroToken || visibleWalls.length === 0) return null;
    return computeVisibilityPolygon(
      { x: activeHeroToken.x, y: activeHeroToken.y },
      visibleWalls,
      {
        maxRadius: 1000,
        bounds: { width: mapData?.width || 3000, height: mapData?.height || 2000 }
      }
    );
  }, [activeHeroToken?.x, activeHeroToken?.y, visibleWalls, mapData?.width, mapData?.height]);

  const lines = mapData?.lines || [];
  const gridMode = mapData?.gridMode || 'hex';

  // Grid Generator
  const renderGrid = () => {
    if (gridMode === 'none' || gridMode === 'off') return null;

    if (gridMode === 'square') {
      const gridSize = 50, width = 4000, height = 3000;
      const gridLines = [];
      for (let i = 0; i <= width; i += gridSize) {
        gridLines.push(<Line key={`v-${i}`} points={[i, 0, i, height]} stroke="rgba(255, 255, 255, 0.08)" strokeWidth={1} />);
      }
      for (let j = 0; j <= height; j += gridSize) {
        gridLines.push(<Line key={`h-${j}`} points={[0, j, width, j]} stroke="rgba(255, 255, 255, 0.08)" strokeWidth={1} />);
      }
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
          hexes.push(
            <RegularPolygon
              key={`${r}-${c}`}
              x={x}
              y={y}
              sides={6}
              radius={hexRadius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={1}
            />
          );
        }
      }
      return hexes;
    }
    return null;
  };

  if (!mapData) {
    return (
      <div className="w-screen h-screen bg-[#07090e] flex flex-col items-center justify-center font-mono text-cyan-400 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-base font-bold tracking-widest uppercase">
            CONNECTING TO TACTICAL SPECTATOR STREAM...
          </span>
        </div>
        <p className="text-xs text-slate-500 font-sans">
          Map ID: <span className="font-mono text-slate-400">{mapId || 'None'}</span>
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen bg-[#07090e] overflow-hidden relative select-none font-sans"
    >
      {/* Top HUD: Spectator Stream Telemetry Header */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        
        {/* Stream Live Pulse & Name */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0d1117]/85 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-slate-200 shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="font-bold text-cyan-300 uppercase tracking-wider">
            LIVE SPECTATOR:
          </span>
          <span className="text-slate-100 font-bold truncate max-w-xs sm:max-w-md">
            {mapData.title || mapData.name || 'Tactical Encounter'}
          </span>
          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
            {mapData.type || 'Sector'}
          </span>
        </div>

        {/* Floating Quick Controls (Fullscreen, Reset Camera, Mute) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0d1117]/85 backdrop-blur-md border border-slate-800 shadow-lg pointer-events-auto">
          <button
            onClick={handleResetCamera}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Reset Camera View (100%)"
          >
            <Compass size={16} />
          </button>
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter TV Fullscreen (F11)'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>

      </div>

      {/* Floating Combat Feedback / Tokens HUD */}
      <div className="absolute bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-400">
        <Shield size={13} className="text-cyan-400" />
        <span>Active Hero Tokens: <strong className="text-cyan-300">{visibleTokens.filter(t => t.type === 'hero' || t.linkedHeroId).length}</strong></span>
        <span className="text-slate-700">|</span>
        <Swords size={13} className="text-rose-400" />
        <span>Hostiles: <strong className="text-rose-300">{visibleTokens.filter(t => t.type !== 'hero' && !t.linkedHeroId && t.type !== 'link').length}</strong></span>
      </div>

      {/* Main Konva Tabletop Canvas */}
      <Stage
        ref={stageRef}
        width={stageDimensions.width}
        height={stageDimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={true}
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
      >
        {/* Layer 1: Background & Terrain & Grid */}
        <Layer id="spectator_terrain">
          <Rect
            x={-5000}
            y={-5000}
            width={14000}
            height={13000}
            fill="#0a0e17"
          />

          {/* Grid lines */}
          {renderGrid()}

          {/* Terrains */}
          {visibleTerrains.map((t) => (
            <SpectatorTerrainNode key={t.id} t={t} />
          ))}

          {/* Freehand pencil lines */}
          {lines.map((l) => (
            <Line
              key={l.id}
              points={l.points}
              stroke={l.color || '#22d3ee'}
              strokeWidth={l.width || 3}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>

        {/* Layer 2: Player-Visible POI Objects & Labels */}
        <Layer id="spectator_objects">
          {visibleObjects.map((obj) => (
            <MapObjectNode
              key={obj.id}
              shapeProps={obj}
              isSelected={false}
              isLocked={true}
              onSelect={() => {}}
              onChange={() => {}}
              isEraser={false}
              onErase={() => {}}
              zoomScale={scale}
            />
          ))}

          {visibleTexts.map((txt) => (
            <TextLabelNode
              key={txt.id}
              shapeProps={txt}
              isSelected={false}
              isLocked={true}
              onSelect={() => {}}
              onChange={() => {}}
              isEraser={false}
              onErase={() => {}}
            />
          ))}
        </Layer>

        {/* Layer 2.5: Visible Walls, Bulkheads & Doors */}
        {visibleWalls.length > 0 && (
          <Layer id="spectator_walls">
            {visibleWalls.map((w) => (
              <MapWallNode
                key={w.id}
                wall={w}
                isSelected={false}
                isLocked={true}
                zoomScale={scale}
                onSelect={() => {}}
                onErase={() => {}}
                onToggleDoor={() => {}}
              />
            ))}
          </Layer>
        )}

        {/* Layer 3: Player-Visible Tokens & Initiative Tracker */}
        <Layer id="spectator_tokens">
          {visibleTokens.map((token) => (
            <TokenNode
              key={token.id}
              shapeProps={token}
              isSelected={false}
              isActiveTurn={false}
              isLocked={true}
              onSelect={() => {}}
              onChange={() => {}}
              isEraser={false}
              onErase={() => {}}
            />
          ))}
        </Layer>

        {/* Layer 4: Dynamic Fog of War Mask & Line of Sight */}
        {(visibleFog.length > 0 || (mapData.fogEnabled && visibilityPolygon)) && (
          <Layer id="spectator_fog" opacity={0.94}>
            {mapData.fogEnabled && (
              <Group>
                <Rect x={-5000} y={-5000} width={14000} height={13000} fill="#05070a" listening={false} />
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
            {visibleFog.map((f) => (
              <Line
                key={f.id}
                points={f.points}
                fill="#05070a"
                closed={true}
                tension={0.2}
              />
            ))}
          </Layer>
        )}
      </Stage>
    </div>
  );
};

export default PlayerSpectatorView;
