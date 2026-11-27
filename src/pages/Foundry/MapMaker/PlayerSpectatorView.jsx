import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { useCampaign } from '../../../context/CampaignContext';
import { computeVisibilityPolygon } from '../../../services/raycastVisionService';
import { expandWallsForGeometry } from '../../../schemas/vttWallSchema';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';
import { proAudioMixerService } from '../../../services/proAudioMixerService';
import { Maximize, Minimize, Compass, Volume2, VolumeX, Shield, Swords, X, FileText } from 'lucide-react';
import { MobileTacticalBlocker } from '../../../components/StoryFoundry/MobileTacticalBlocker';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { sanitizeMapForSpectator } from '../../../utils/spectatorSanitizer';
import { SpectatorPixiCanvas } from '../../../components/VTT/SpectatorPixiCanvas';
import { VttEventBus } from '../../../utils/vttEventBus';

export const PlayerSpectatorView = () => {
  const isMobile = useIsMobile();
  const blockMobileView = isMobile && (typeof window === 'undefined' ? true : window.innerWidth < 768);
  const { mapId } = useParams();
  const navigate = useNavigate();
  const { universeState, allMaps } = useCampaign();

  const [mapData, setMapData] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeHandout, setActiveHandout] = useState(null);
  const [activePings, setActivePings] = useState([]);
  const [stageDimensions, setStageDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720
  });

  const containerRef = useRef(null);

  // 1. Listen to Live sanitized Spectator Map document updates, with owner/local fallbacks
  useEffect(() => {
    if (blockMobileView || !mapId) return;

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
      const localPool = (Array.isArray(allMaps) && allMaps.length > 0 ? allMaps : universeState?.maps) || [];
      const localMap = localPool.find(m => m.id === mapId);
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
        const localPool = (Array.isArray(allMaps) && allMaps.length > 0 ? allMaps : universeState?.maps) || [];
        const localMap = localPool.find(m => m.id === mapId);
        if (localMap) setMapData(sanitizeMapForSpectator(localMap, auth?.currentUser));
      }
    } catch (e) {
      const localPool = (Array.isArray(allMaps) && allMaps.length > 0 ? allMaps : universeState?.maps) || [];
      const localMap = localPool.find(m => m.id === mapId);
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
  }, [blockMobileView, mapId, allMaps, universeState?.maps]);

  // Listen to pushed handouts, live multiplayer tokens/doors/fog/pings
  useEffect(() => {
    const sync = getVttMultiplayerSync();
    sync.init({ role: 'operative' });
    const unsubHandout = VttEventBus.on('stage-remote-handout', (handout) => {
      if (handout) setActiveHandout(handout);
    });
    const unsubDoor = VttEventBus.on('stage-remote-door-toggled', (payload) => {
      if (!payload?.wallId) return;
      setMapData((prev) => {
        if (!prev?.walls) return prev;
        return {
          ...prev,
          walls: prev.walls.map((w) =>
            w.id === payload.wallId
              ? {
                  ...w,
                  isOpen: Boolean(payload.isOpen),
                  ...(payload.doorState !== undefined ? { doorState: payload.doorState } : {}),
                  ...(payload.breachHp !== undefined ? { breachHp: payload.breachHp } : {})
                }
              : w
          )
        };
      });
    });
    const unsubPing = VttEventBus.on('stage-remote-ping', (ping) => {
      if (!ping) return;
      setActivePings((prev) => [...prev.slice(-11), { ...ping, expiresAt: Date.now() + 4500 }]);
    });
    const unsubFog = VttEventBus.on('stage-remote-fog-explored', (fogPayload) => {
      if (!fogPayload?.mapId || fogPayload.mapId !== mapId) return;
      setMapData((prev) =>
        prev
          ? {
              ...prev,
              ...(fogPayload.fogEnabled !== undefined ? { fogEnabled: fogPayload.fogEnabled } : {}),
              exploredFog: {
                ...(prev.exploredFog || {}),
                exploredPolygons: fogPayload.exploredAreas || [],
                hiddenPolygons: fogPayload.hiddenAreas || prev.exploredFog?.hiddenPolygons || []
              }
            }
          : prev
      );
    });
    const tokensMap = sync.getTacticalTokensMap();
    const onTokenMove = (event) => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          const pos = tokensMap.get(key);
          if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
            setMapData((prev) =>
              prev?.tokens
                ? {
                    ...prev,
                    tokens: prev.tokens.map((t) => (t.id === key ? { ...t, x: pos.x, y: pos.y } : t))
                  }
                : prev
            );
          }
        }
      });
    };
    tokensMap.observe(onTokenMove);
    const vitalsMap = sync.getDocument().getMap('token_vitals');
    const onVitals = (event) => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          const v = vitalsMap.get(key);
          if (v) {
            setMapData((prev) =>
              prev?.tokens
                ? {
                    ...prev,
                    tokens: prev.tokens.map((t) => (t.id === key ? { ...t, ...v } : t))
                  }
                : prev
            );
          }
        }
      });
    };
    vitalsMap.observe(onVitals);
    const pingTimer = setInterval(() => {
      setActivePings((prev) => prev.filter((p) => !p.expiresAt || p.expiresAt > Date.now()));
    }, 1000);
    return () => {
      unsubHandout();
      unsubDoor();
      unsubPing();
      unsubFog();
      tokensMap.unobserve(onTokenMove);
      vitalsMap.unobserve(onVitals);
      clearInterval(pingTimer);
    };
  }, [mapId]);

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

  const handleResetCamera = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheelZoom = (clientX, clientY, deltaY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const pointerX = rect ? clientX - rect.left : clientX;
    const pointerY = rect ? clientY - rect.top : clientY;
    const oldScale = scale;
    const mousePointTo = {
      x: (pointerX - position.x) / oldScale,
      y: (pointerY - position.y) / oldScale
    };
    const scaleBy = 1.08;
    const newScale = deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.2, Math.min(newScale, 3.5));

    setScale(clampedScale);
    setPosition({
      x: pointerX - mousePointTo.x * clampedScale,
      y: pointerY - mousePointTo.y * clampedScale
    });
  };

  // Security Sanitization: Strip GM-hidden tokens and layers
  const visibleTokens = useMemo(() => {
    if (!mapData?.tokens) return [];
    return mapData.tokens.filter(
      (t) => !t.isHidden && !t.hidden && !t.is_hidden && !t.isGmOnly && !t.gmOnly && t.visible !== false
    );
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
      if (w?.isSecret && !w?.isOpen && w?.doorState !== 'open') {
        const {
          isDynamic: _d,
          isDoor: _dr,
          wallType: _wt,
          doorState: _ds,
          hackDc: _hd,
          breachHp: _bh,
          label: _lb,
          ...plain
        } = w;
        return { ...plain, type: 'solid', isSecret: false, isOpen: false };
      }
      return w;
    });
  }, [mapData?.walls]);

  // Closed secret doors still occlude player line-of-sight even though hidden visually (with Bezier expansion)
  const occludingWalls = useMemo(() => {
    if (!mapData?.walls) return [];
    const blocking = mapData.walls.filter(
      w =>
        !w.isOpen &&
        w.doorState !== 'open' &&
        w.doorState !== 'breached' &&
        w.type !== 'window' &&
        w.wallType !== 'window' &&
        !w.isTransparent &&
        w.blocksVision !== false
    );
    return expandWallsForGeometry(blocking, 8);
  }, [mapData?.walls]);

  const heroTokens = useMemo(() => {
    const heroes = visibleTokens.filter(t => t.type === 'hero' || t.linkedHeroId || t.is_persona);
    return heroes.length > 0 ? heroes : visibleTokens.slice(0, 1);
  }, [visibleTokens]);

  const spectatorGridSize = Math.max(15, mapData?.gridSize || 50);
  const spectatorWidth = Math.max(4000, mapData?.width || (mapData?.gridWidth || 40) * spectatorGridSize);
  const spectatorHeight = Math.max(3000, mapData?.height || (mapData?.gridHeight || 30) * spectatorGridSize);

  const visibilityPolygons = useMemo(() => {
    return heroTokens
      .map((hero) =>
        computeVisibilityPolygon(
          { x: hero.x, y: hero.y },
          occludingWalls,
          {
            maxRadius: Number(hero.vision_radius_px || 1000),
            bounds: { width: spectatorWidth, height: spectatorHeight }
          }
        )
      )
      .filter((poly) => Array.isArray(poly) && poly.length >= 6);
  }, [heroTokens, occludingWalls, spectatorWidth, spectatorHeight]);
  const visibilityPolygon = visibilityPolygons[0] || null;

  const lines = mapData?.lines || [];
  const gridMode = mapData?.gridMode || 'hex';

  if (blockMobileView) {
    return (
      <MobileTacticalBlocker
        operation="vtt"
        customTitle="Tactical Spectator Canvas"
        customDescription="The Live VTT Spectator and Tactical Map Projector view is optimized for wide-format desktop displays and TV projections. It is currently unavailable on narrow mobile screens."
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
            LIVE SPECTATOR (PIXI):
          </span>
          <span className="text-slate-100 font-bold truncate max-w-xs sm:max-w-md">
            {mapData.title || mapData.name || 'Tactical Encounter'}
          </span>
          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
            {mapData.type || 'Sector'}
          </span>
        </div>

        {/* Floating Quick Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0d1117]/85 backdrop-blur-md border border-slate-800 shadow-lg pointer-events-auto">
          <button
            onClick={handleResetCamera}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Reset Camera View (100%)"
          >
            <Compass size={16} />
          </button>
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              (['music', 'ambient', 'sfx']).forEach((bus) => {
                const state = proAudioMixerService.getBusState(bus);
                if (state.muted !== nextMuted) {
                  proAudioMixerService.toggleBusMute(bus);
                }
              });
            }}
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
        <span>Active Hero Tokens: <strong className="text-cyan-300">{visibleTokens.filter(t => t.type === 'hero' || t.linkedHeroId || t.is_persona).length}</strong></span>
        <span className="text-slate-700">|</span>
        <Swords size={13} className="text-rose-400" />
        <span>Hostiles: <strong className="text-rose-300">{visibleTokens.filter(t => t.type !== 'hero' && !t.linkedHeroId && !t.is_persona && t.type !== 'link').length}</strong></span>
      </div>

      {/* Synchronized Player Handout Overlay */}
      {activeHandout && (
        <div className="absolute inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-[#0d1117] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold uppercase">
                <FileText size={14} />
                <span>{activeHandout.title || 'Tactical Handout'}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveHandout(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
                aria-label="Close Handout"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
              {activeHandout.imageUrl && (
                <img src={activeHandout.imageUrl} alt={activeHandout.title || 'Handout'} className="w-full rounded-xl border border-slate-800 object-contain max-h-96" />
              )}
              {activeHandout.text && (
                <p className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{activeHandout.text}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Optional Synchronized Animated Video Backdrop (Synced to Camera Pan & Zoom) */}
      {mapData.videoBackgroundUrl && (
        <video
          src={mapData.videoBackgroundUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          aria-hidden="true"
          className="absolute top-0 left-0 object-cover opacity-80 pointer-events-none"
          style={{
            width: `${spectatorWidth}px`,
            height: `${spectatorHeight}px`,
            transformOrigin: '0 0',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
          }}
        />
      )}

      {/* Unified PixiJS v8 Tabletop Canvas (with automatic Canvas2D fallback) */}
      <SpectatorPixiCanvas
        width={stageDimensions.width}
        height={stageDimensions.height}
        scale={scale}
        position={position}
        onPositionChange={setPosition}
        onWheelZoom={handleWheelZoom}
        mapData={mapData}
        gridMode={gridMode}
        gridSize={spectatorGridSize}
        worldWidth={spectatorWidth}
        worldHeight={spectatorHeight}
        visibleTerrains={visibleTerrains}
        lines={lines}
        visibleObjects={visibleObjects}
        visibleTexts={visibleTexts}
        visibleWalls={visibleWalls}
        visibleTokens={visibleTokens}
        visibleFog={visibleFog}
        visibilityPolygon={visibilityPolygon}
        visibilityPolygons={visibilityPolygons}
        activePings={activePings}
        fogEnabled={Boolean(mapData.fogEnabled)}
      />
    </div>
  );
};

export default PlayerSpectatorView;
