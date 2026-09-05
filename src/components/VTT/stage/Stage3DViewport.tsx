/**
 * @file Stage3DViewport.tsx
 * @description Stage 3D: React 3D Holographic Tactical Viewport for Tangent SF RP.
 * Bridges Three.js Stage3DCompositor and TacticalCameraRig with useEngineStore and useCampaign.
 * Provides live 3D token interaction, altitude laser stalks, door breach/toggle clicks,
 * tactical isometric/orbit camera switching, multi-deck slicing, and volumetric LoS badges.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Stage3DRendererContext,
  TacticalCameraRig,
  Stage3DCompositor,
  type CameraMode3D,
  type LoSResult3D
} from '../../../engine/3d';
import { useCampaign } from '../../../context/CampaignContext';
import {
  useEngineStore,
  selectAllFusedTokens
} from '../../../engine';
import { toggleDoorState } from '../../../schemas/vttWallSchema.js';
import { AudioService } from '../../../services/audioService';
import { 
  Camera, 
  RotateCcw, 
  RotateCw, 
  Maximize2, 
  Layers, 
  Compass, 
  Eye, 
  EyeOff, 
  Target, 
  ArrowUpRight,
  Crosshair,
  Sparkles
} from 'lucide-react';

export interface Stage3DViewportProps {
  onSwitchTo2D?: () => void;
  activeTool?: string;
}

export const Stage3DViewport: React.FC<Stage3DViewportProps> = ({
  onSwitchTo2D,
  activeTool = 'select'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererContextRef = useRef<Stage3DRendererContext | null>(null);
  const cameraRigRef = useRef<TacticalCameraRig | null>(null);
  const compositorRef = useRef<Stage3DCompositor | null>(null);

  const { universeState, activeMapId, updateMap } = useCampaign();
  const currentMap = (universeState?.maps || []).find((m: any) => m.id === activeMapId) || universeState?.maps?.[0] || null;

  // Engine state
  const tokens = useEngineStore(selectAllFusedTokens);
  const updatePosition = useEngineStore(state => state.updatePosition);
  const setElevation = useEngineStore(state => state.setElevation);

  // Local selection & UI states
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(tokens[0]?.id || null);
  const [targetTokenId, setTargetTokenId] = useState<string | null>(tokens[1]?.id || null);
  const [cameraMode, setCameraMode] = useState<CameraMode3D>('tactical');
  const [activeDeckId, setActiveDeckId] = useState<string>('deck_0');
  const [isSliceActive, setIsSliceActive] = useState<boolean>(true);
  const [losEvaluation, setLosEvaluation] = useState<LoSResult3D | null>(null);

  // Dragging state for token movement and elevation adjustment
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const isShiftPressedRef = useRef(false);

  // Initialize 3D Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDestroyed = false;

    const renderer = new Stage3DRendererContext();
    const cameraRig = new TacticalCameraRig({ mode: cameraMode, initialDistance: 800 });
    const compositor = new Stage3DCompositor();

    rendererContextRef.current = renderer;
    cameraRigRef.current = cameraRig;
    compositorRef.current = compositor;

    const success = renderer.initialize(canvas, { shadows: true, antialias: true });
    if (!success || isDestroyed) {
      renderer.destroy();
      return;
    }

    cameraRig.attach(canvas);

    // Initial map sync
    compositor.syncFromMap(currentMap, tokens, selectedTokenId, targetTokenId, cameraRig.camera);

    // Render loop
    const unbindRender = renderer.onRender((delta, elapsed) => {
      cameraRig.update(delta);
      compositor.update(delta, elapsed, cameraRig.camera);
      renderer.renderScene(compositor.scene, cameraRig.camera);
    });

    // Handle shift key tracking for 3D elevation drag
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') isShiftPressedRef.current = true;
      if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.altKey) {
        // Toggle camera mode with C
        const nextMode = cameraRig.toggleMode();
        setCameraMode(nextMode);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') isShiftPressedRef.current = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      isDestroyed = true;
      unbindRender();
      cameraRig.detach();
      compositor.dispose();
      renderer.destroy();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      rendererContextRef.current = null;
      cameraRigRef.current = null;
      compositorRef.current = null;
    };
  }, []);

  // Sync map changes (walls, terrains, lights, background)
  useEffect(() => {
    const compositor = compositorRef.current;
    const cameraRig = cameraRigRef.current;
    if (!compositor || !currentMap) return;

    compositor.syncFromMap(currentMap, tokens, selectedTokenId, targetTokenId, cameraRig?.camera);
  }, [currentMap, currentMap?.walls, currentMap?.terrains, currentMap?.lights, currentMap?.background_url]);

  // Sync token changes (positions, health bars, conditions, selection)
  useEffect(() => {
    const compositor = compositorRef.current;
    const cameraRig = cameraRigRef.current;
    if (!compositor) return;

    compositor.syncTokens(tokens, selectedTokenId, targetTokenId, cameraRig?.camera);

    // Evaluate 3D Line-of-Sight between selected token and target
    const attacker = tokens.find(t => t.id === selectedTokenId);
    const target = tokens.find(t => t.id === targetTokenId);
    if (attacker && target && attacker.id !== target.id) {
      const los = compositor.evaluateLoS(attacker, target);
      setLosEvaluation(los);
    } else {
      setLosEvaluation(null);
    }
  }, [tokens, selectedTokenId, targetTokenId]);

  // Sync Deck settings
  useEffect(() => {
    const compositor = compositorRef.current;
    if (!compositor) return;
    compositor.deckManager.setActiveDeck(activeDeckId);
    compositor.deckManager.setSliceActive(isSliceActive);
  }, [activeDeckId, isSliceActive]);

  // Pointer Interaction Handlers
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const compositor = compositorRef.current;
    const cameraRig = cameraRigRef.current;
    if (!canvas || !compositor || !cameraRig) return;

    if (e.button !== 0) return; // Only process left click for interactions

    const rect = canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    // 1. Check if clicked a Token
    const hitToken = compositor.raycastToken(ndcX, ndcY, cameraRig.camera);
    if (hitToken) {
      if (e.altKey) {
        // Alt+Click sets as Combat Target
        setTargetTokenId(hitToken.id);
        AudioService.playCriticalChime(false);
      } else {
        // Normal click selects token and begins drag
        setSelectedTokenId(hitToken.id);
        setDraggingTokenId(hitToken.id);
      }
      return;
    }

    // 2. Check if clicked a Door or Interactive Wall
    const hitWall = compositor.raycastWall(ndcX, ndcY, cameraRig.camera);
    if (hitWall && hitWall.isWall && hitWall.originalWall?.type === 'door') {
      const wallId = hitWall.wallId;
      const updatedWalls = (currentMap.walls || []).map((w: any) => {
        if (w.id === wallId) {
          const toggled = toggleDoorState(w);
          if (toggled.isOpen) AudioService.playCriticalChime(true);
          return toggled;
        }
        return w;
      });

      if (updateMap && currentMap.id) {
        updateMap(currentMap.id, { walls: updatedWalls });
      }
      return;
    }

    // 3. Ruler tool start
    if (activeTool === 'ruler') {
      const groundHit = compositor.raycastGround(ndcX, ndcY, cameraRig.camera);
      if (groundHit) {
        compositor.waypointRuler.start(groundHit.x, groundHit.y, groundHit.z);
      }
    }
  }, [currentMap, activeTool, updateMap]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const compositor = compositorRef.current;
    const cameraRig = cameraRigRef.current;
    if (!canvas || !compositor || !cameraRig) return;

    const rect = canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    // Update Token Dragging (Position or Elevation)
    if (draggingTokenId) {
      const groundHit = compositor.raycastGround(ndcX, ndcY, cameraRig.camera);
      if (groundHit) {
        if (isShiftPressedRef.current || e.shiftKey) {
          // Shift + Drag modifies elevation!
          const currentToken = tokens.find(t => t.id === draggingTokenId);
          const currentElev = currentToken?.elevation_ft || 0;
          // Vertical movement based on pointer delta
          const newElev = Math.max(0, Math.min(100, currentElev + (e.movementY < 0 ? 2 : -2)));
          setElevation(draggingTokenId, newElev);
        } else {
          // Normal Drag moves on X, Y ground plane
          updatePosition(draggingTokenId, Math.round(groundHit.x), Math.round(groundHit.z));
        }
      }
      return;
    }

    // Update 3D Ruler Measurement
    if (activeTool === 'ruler') {
      const groundHit = compositor.raycastGround(ndcX, ndcY, cameraRig.camera);
      if (groundHit) {
        compositor.waypointRuler.updateEnd(groundHit.x, groundHit.y, groundHit.z);
      }
    }
  }, [draggingTokenId, activeTool, tokens, updatePosition, setElevation]);

  const handlePointerUp = useCallback(() => {
    if (draggingTokenId) {
      setDraggingTokenId(null);
    }
    if (activeTool === 'ruler') {
      // Keep ruler visible until cleared or new click
    }
  }, [draggingTokenId, activeTool]);

  const selectedToken = tokens.find(t => t.id === selectedTokenId);
  const targetToken = tokens.find(t => t.id === targetTokenId);

  return (
    <div className="relative w-full h-full bg-[#060913] select-none overflow-hidden font-mono">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full block touch-none cursor-crosshair"
      />

      {/* Top Floating Tactical Control Bar */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        {/* Left: Camera & Mode Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-[#0d1117]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs shadow-xl">
          {/* Switch to 2D Blueprint button */}
          {onSwitchTo2D && (
            <button
              onClick={onSwitchTo2D}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Switch back to 2D Blueprint Stage (Hotkey: V)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>2D VIEW</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Camera Mode Toggle */}
          <button
            onClick={() => {
              if (cameraRigRef.current) {
                const next = cameraRigRef.current.toggleMode();
                setCameraMode(next);
              }
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded font-semibold transition ${
              cameraMode === 'tactical'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
            }`}
            title="Toggle between Tactical Isometric and Free Orbit (Hotkey: C)"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{cameraMode === 'tactical' ? 'TACTICAL ISO' : 'FREE ORBIT'}</span>
          </button>

          {/* Rotate Azimuth Steps (Q/E) */}
          <button
            onClick={() => cameraRigRef.current?.rotateTacticalAzimuth(false)}
            className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
            title="Rotate Left 90° (Hotkey: Q)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={() => cameraRigRef.current?.rotateTacticalAzimuth(true)}
            className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
            title="Rotate Right 90° (Hotkey: E)"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => cameraRigRef.current?.resetView()}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 transition"
            title="Reset Camera to Default Center"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Multi-Deck & Slicing Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-[#0d1117]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs shadow-xl">
          <Layers className="w-3.5 h-3.5 text-cyan-400 mr-1" />
          <select
            value={activeDeckId}
            onChange={(e) => setActiveDeckId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-cyan-300 px-2 py-0.5 rounded text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="deck_0">Deck 1: Surface (0ft)</option>
            <option value="deck_1">Deck 2: Upper (15ft)</option>
            <option value="deck_roof">Roof Canopy (30ft)</option>
          </select>

          {/* X-Ray Cutaway / Slice Toggle */}
          <button
            onClick={() => setIsSliceActive(prev => !prev)}
            className={`p-1 rounded transition ${
              isSliceActive ? 'text-cyan-400 hover:bg-cyan-950/40' : 'text-slate-500 hover:bg-slate-800'
            }`}
            title={isSliceActive ? 'Ceiling Cutaway Active (Upper decks clipped)' : 'Showing All Decks'}
          >
            {isSliceActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right: Active Tokens & Elevation Pill */}
        {selectedToken && (
          <div className="flex items-center space-x-3 pointer-events-auto bg-[#0d1117]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs shadow-xl">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold text-slate-200">{selectedToken.name}</span>
            </div>

            {/* Dynamic Elevation Adjuster */}
            <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              <ArrowUpRight className="w-3 h-3 text-cyan-400" />
              <span className="text-[11px] text-cyan-300">{selectedToken.elevation_ft || 0} FT</span>
              <div className="flex flex-col ml-1">
                <button
                  onClick={() => setElevation(selectedToken.id, (selectedToken.elevation_ft || 0) + 5)}
                  className="text-[9px] text-cyan-400 hover:text-cyan-200 leading-none"
                  title="Climb +5ft"
                >
                  ▲
                </button>
                <button
                  onClick={() => setElevation(selectedToken.id, Math.max(0, (selectedToken.elevation_ft || 0) - 5))}
                  className="text-[9px] text-cyan-400 hover:text-cyan-200 leading-none"
                  title="Descend -5ft"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Focus Camera on Token */}
            <button
              onClick={() => cameraRigRef.current?.focusOn(selectedToken)}
              className="px-2 py-0.5 rounded bg-cyan-950/50 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-[11px]"
              title="Center Camera on Token"
            >
              FOCUS
            </button>
          </div>
        )}
      </div>

      {/* Bottom Floating Tactical Line-of-Sight & Cover Card */}
      {losEvaluation && selectedToken && targetToken && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0d1117]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 text-xs shadow-2xl flex items-center space-x-4 z-20 pointer-events-auto">
          <div className="flex items-center space-x-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">{selectedToken.name}</span>
            <span className="text-slate-500">➜</span>
            <Target className="w-4 h-4 text-rose-400" />
            <span className="font-bold text-slate-200">{targetToken.name}</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Range */}
          <div className="text-cyan-300 font-semibold">
            <span>{losEvaluation.distanceFt} FT</span>
          </div>

          {/* Cover Badge */}
          <div className={`px-2 py-0.5 rounded font-bold text-[11px] border ${
            losEvaluation.coverTier === 'NONE'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : losEvaluation.coverTier === 'HALF_COVER'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : losEvaluation.coverTier === 'THREE_QUARTERS'
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
          }`}>
            {losEvaluation.coverTier.replace('_', ' ')}
          </div>

          {/* Attack / Vantage Modifier */}
          {losEvaluation.attackModifier > 0 && (
            <div className="flex items-center space-x-1 text-emerald-400 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{losEvaluation.attackModifier} HIGH GROUND</span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 max-w-xs truncate" title={losEvaluation.reason}>
            {losEvaluation.reason}
          </div>
        </div>
      )}

      {/* Floating Instructions Toast in lower-left */}
      <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 bg-slate-900/75 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-none z-10 flex items-center space-x-3">
        <span><b className="text-cyan-400">WASD / Drag:</b> Pan</span>
        <span><b className="text-cyan-400">Right-Drag:</b> Orbit</span>
        <span><b className="text-cyan-400">Scroll:</b> Zoom</span>
        <span><b className="text-cyan-400">Shift+Drag:</b> Adjust Altitude</span>
        <span><b className="text-cyan-400">Q/E:</b> Rotate 90°</span>
        <span><b className="text-cyan-400">C:</b> Toggle Camera</span>
      </div>
    </div>
  );
};

export default Stage3DViewport;
