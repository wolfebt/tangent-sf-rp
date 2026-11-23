import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Circle, Line, RegularPolygon, Group, Image as KonvaImage, Text, Shape } from 'react-konva';
import { drawSquareGridOnCanvas, drawHexGridOnCanvas } from './map/gridGeometry';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { useCampaign } from '../../../context/CampaignContext';
import { TokenNode, MapObjectNode, TextLabelNode } from './map/MapObjectNode';
import MapWallNode from './map/MapWallNode';
import { computeVisibilityPolygon } from '../../../services/raycastVisionService';
import { getBiomeTextureUrl } from './map/landmassGenerator';
import { getTextureUrlFromColor } from './map/MapTextures';
import { Maximize, Minimize, Compass, RotateCcw, Volume2, VolumeX, Shield, Swords, Eye } from 'lucide-react';
import { MobileTacticalBlocker } from '../../../components/StoryFoundry/MobileTacticalBlocker';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { sanitizeMapForSpectator } from '../../../utils/spectatorSanitizer';

const SpectatorTerrainNode = ({ t }) => {
  const [patternImg, setPatternImg] = useState(null);
  const [canvasImg, setCanvasImg] = useState(null);
  const isImageTerrain = t.renderType === 'canvasImage' || t.renderType === 'image' || (!t.points && Boolean(t.imageUrl));
  const textureUrl = !isImageTerrain
    ? (t.textureUrl || getBiomeTextureUrl(t.biomeType || t.terrainTypeId) || getTextureUrlFromColor(t.color || t.terrainTypeId))
    : null;

  useEffect(() => {
    if (isImageTerrain && t.imageUrl) {
      let cancelled = false;
      const img = new window.Image();
      if (typeof t.imageUrl === 'string' && !t.imageUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => { if (!cancelled) setCanvasImg(img); };
      img.onerror = () => { if (!cancelled) setCanvasImg(null); };
      img.src = t.imageUrl;
      return () => { cancelled = true; };
    }
    setCanvasImg(null);
    return undefined;
  }, [isImageTerrain, t.imageUrl]);

  useEffect(() => {
    if (textureUrl) {
      let cancelled = false;
      const img = new window.Image();
      if (typeof textureUrl === 'string' && !textureUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => { if (!cancelled) setPatternImg(img); };
      img.onerror = () => { if (!cancelled) setPatternImg(null); };
      img.src = textureUrl;
      return () => { cancelled = true; };
    }
    setPatternImg(null);
    return undefined;
  }, [textureUrl]);

  if (isImageTerrain) {
    if (!canvasImg) return null;
    return (
      <KonvaImage
        image={canvasImg}
        x={t.x || 0}
        y={t.y || 0}
        width={t.width}
        height={t.height}
        listening={false}
      />
    );
  }

  if (t.renderType === 'rect') {
    return (
      <Rect
        x={t.x || 0}
        y={t.y || 0}
        width={t.width || 40}
        height={t.height || 40}
        fill={t.color}
        fillPatternImage={patternImg}
        fillPatternRepeat="repeat"
        stroke={t.strokeColor || t.color}
        strokeWidth={t.strokeWidth || 1}
        listening={false}
      />
    );
  }

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

  if (!Array.isArray(t.points) || t.points.length < 2) {
    return null;
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
  const isMobile = useIsMobile();
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

  // 1. Listen to Live sanitized Spectator Map document updates, with owner/local fallbacks
  useEffect(() => {
    if (isMobile || !mapId) return;

    let unsub = () => {};

    const applyFallbackMap = async () => {
      if (db && auth?.currentUser) {
        try {
          const ownerSnap = await getDoc(doc(db, 'story_maps', mapId));
          if (ownerSnap.exists()) {
            setMapData(sanitizeMapForSpectator(ownerSnap.data(), auth.currentUser));
            return;
          }
        } catch {}
      }
      const localMap = universeState?.maps?.find(m => m.id === mapId);
      if (localMap) setMapData(sanitizeMapForSpectator(localMap, auth?.currentUser));
    };

    try {
      if (db) {
        unsub = onSnapshot(
          doc(db, 'spectator_maps', mapId),
          (snapshot) => {
            if (snapshot.exists()) {
              setMapData(sanitizeMapForSpectator(snapshot.data(), auth?.currentUser));
            } else {
              applyFallbackMap();
            }
          },
          (err) => {
            console.warn('Firestore spectator stream fallback to local/owner state:', err);
            applyFallbackMap();
          }
        );
      } else {
        const localMap = universeState?.maps?.find(m => m.id === mapId);
        if (localMap) setMapData(sanitizeMapForSpectator(localMap, auth?.currentUser));
      }
    } catch (e) {
      const localMap = universeState?.maps?.find(m => m.id === mapId);
      if (localMap) setMapData(sanitizeMapForSpectator(localMap, auth?.currentUser));
    }

    const handleResize = () => {
      setStageDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      unsub();
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile, mapId, universeState?.maps]);

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
    return mapData.tokens.filter(t => !t.isHidden && !t.hidden && !t.isGmOnly && t.visible !== false);
  }, [mapData?.tokens]);

  const visibleObjects = useMemo(() => {
    if (!mapData?.objects) return [];
    return mapData.objects.filter(
      o => !o.isHidden && !o.isGmOnly && o.visible !== false && !o.isTrap && !o.secret && !o.isSecret
    );
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
    return mapData.walls.map(w => {
      if (w?.isSecret && !w?.isOpen) {
        return { ...w, type: 'solid', isSecret: false, isOpen: false };
      }
      return w;
    });
  }, [mapData?.walls]);

  // Closed secret doors still occlude player line-of-sight even though hidden visually
  const occludingWalls = useMemo(() => {
    if (!mapData?.walls) return [];
    return mapData.walls.filter(
      w =>
        !w.isOpen &&
        w.doorState !== 'open' &&
        w.doorState !== 'breached' &&
        w.type !== 'window' &&
        w.wallType !== 'window' &&
        !w.isTransparent &&
        w.blocksVision !== false
    );
  }, [mapData?.walls]);

  const activeHeroToken = useMemo(() => {
    return visibleTokens.find(t => t.type === 'hero' || t.linkedHeroId) || visibleTokens[0];
  }, [visibleTokens]);

  const spectatorGridSize = Math.max(15, mapData?.gridSize || 50);
  const spectatorWidth = Math.max(4000, mapData?.width || (mapData?.gridWidth || 40) * spectatorGridSize);
  const spectatorHeight = Math.max(3000, mapData?.height || (mapData?.gridHeight || 30) * spectatorGridSize);

  const visibilityPolygon = useMemo(() => {
    if (!activeHeroToken) return null;
    return computeVisibilityPolygon(
      { x: activeHeroToken.x, y: activeHeroToken.y },
      occludingWalls,
      {
        maxRadius: 1000,
        bounds: { width: spectatorWidth, height: spectatorHeight }
      }
    );
  }, [activeHeroToken?.x, activeHeroToken?.y, occludingWalls, spectatorWidth, spectatorHeight]);

  const lines = mapData?.lines || [];
  const gridMode = mapData?.gridMode || 'hex';

  // Grid Generator (single-Shape canvas render for 60 FPS performance)
  const renderGrid = () => {
    if (gridMode !== 'square' && gridMode !== 'hex') return null;

    return (
      <Shape
        listening={false}
        perfectDrawEnabled={false}
        sceneFunc={(ctx) => {
          const boundedBox = { width: spectatorWidth, height: spectatorHeight };
          if (gridMode === 'square') {
            drawSquareGridOnCanvas(ctx, null, spectatorGridSize, {
              minorStroke: 'rgba(255, 255, 255, 0.08)',
              majorStroke: null,
              boundedBox
            });
          } else {
            drawHexGridOnCanvas(ctx, null, spectatorGridSize, {
              stroke: 'rgba(255, 255, 255, 0.08)',
              boundedBox
            });
          }
        }}
      />
    );
  };

  if (isMobile) {
    return (
      <MobileTacticalBlocker
        operation="vtt"
        customTitle="Tactical Spectator Canvas"
        customDescription="The Live VTT Spectator and Tactical Map Projector view is optimized for wide-format desktop displays and TV projections. It is currently unavailable on mobile screens."
        onBack={() => navigate('/folio')}
      />
    );
  }

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
        {(visibleFog.length > 0 || mapData.fogEnabled) && (
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
            {visibleFog.map((f) =>
              f.closed ? (
                <Line
                  key={f.id}
                  points={f.points}
                  fill="#05070a"
                  closed={true}
                  tension={0.2}
                  globalCompositeOperation={f.isEraser || f.erase ? 'destination-out' : 'source-over'}
                  listening={false}
                />
              ) : (
                <Line
                  key={f.id}
                  points={f.points}
                  stroke={f.color || '#05070a'}
                  strokeWidth={f.strokeWidth || 50}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={f.isEraser || f.erase ? 'destination-out' : 'source-over'}
                  listening={false}
                />
              )
            )}
          </Layer>
        )}
      </Stage>
    </div>
  );
};

export default PlayerSpectatorView;
