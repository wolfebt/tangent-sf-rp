/**
 * @file MapMaker3DPreviewModal.jsx
 * @description Dockable & Floating Live 3D Architectural Preview for the Tangent Map Maker.
 * Extrudes 2D cartography in real-time into a Three.js 3D viewport, allowing GMs to inspect
 * verticality, wall heights, biome topography, and dynamic lighting while editing.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Stage3DRendererContext,
  TacticalCameraRig,
  Stage3DCompositor
} from '../../../../engine/3d';
import { 
  Box, 
  X, 
  Maximize2, 
  Minimize2, 
  Camera, 
  Sun, 
  Layers, 
  RotateCcw, 
  RotateCw, 
  Sparkles,
  Compass
} from 'lucide-react';

export const MapMaker3DPreviewModal = ({
  isOpen,
  onClose,
  currentMap,
  tokens = []
}) => {
  const canvasRef = useRef(null);
  const rendererContextRef = useRef(null);
  const cameraRigRef = useRef(null);
  const compositorRef = useRef(null);

  const [isMaximized, setIsMaximized] = useState(false);
  const [cameraMode, setCameraMode] = useState('tactical');
  const [atmosphere, setAtmosphere] = useState('clear');
  const [activeDeckId, setActiveDeckId] = useState('deck_0');
  const [isSliceActive, setIsSliceActive] = useState(true);

  // Initialize 3D Scene
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDestroyed = false;

    const renderer = new Stage3DRendererContext();
    const cameraRig = new TacticalCameraRig({ mode: cameraMode, initialDistance: 900 });
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
    compositor.syncFromMap(currentMap, tokens, null, null, cameraRig.camera);

    const unbindRender = renderer.onRender((delta, elapsed) => {
      cameraRig.update(delta);
      compositor.update(delta, elapsed, cameraRig.camera);
      renderer.renderScene(compositor.scene, cameraRig.camera);
    });

    return () => {
      isDestroyed = true;
      unbindRender();
      cameraRig.detach();
      compositor.dispose();
      renderer.destroy();
      rendererContextRef.current = null;
      cameraRigRef.current = null;
      compositorRef.current = null;
    };
  }, [isOpen]);

  // Synchronize live changes from 2D Map Maker
  useEffect(() => {
    if (!isOpen) return;
    const compositor = compositorRef.current;
    const cameraRig = cameraRigRef.current;
    if (!compositor || !currentMap) return;

    compositor.syncFromMap(currentMap, tokens, null, null, cameraRig?.camera);
  }, [
    isOpen,
    currentMap,
    currentMap?.walls,
    currentMap?.terrains,
    currentMap?.objects,
    currentMap?.lights,
    currentMap?.tokens,
    currentMap?.background_url
  ]);

  // Sync Atmosphere preset
  useEffect(() => {
    if (!isOpen) return;
    compositorRef.current?.lightingManager.setAtmosphere(atmosphere);
  }, [isOpen, atmosphere]);

  // Sync Deck Slicing
  useEffect(() => {
    if (!isOpen) return;
    const compositor = compositorRef.current;
    if (!compositor) return;
    compositor.deckManager.setActiveDeck(activeDeckId);
    compositor.deckManager.setSliceActive(isSliceActive);
  }, [isOpen, activeDeckId, isSliceActive]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed z-50 transition-all duration-200 flex flex-col bg-[#0b0f19] border border-cyan-500/40 shadow-2xl rounded-xl overflow-hidden font-mono ${
        isMaximized 
          ? 'inset-4 w-auto h-auto' 
          : 'bottom-6 right-6 w-[560px] h-[400px]'
      }`}
    >
      {/* Modal Header */}
      <div className="h-9 px-3 bg-slate-900 border-b border-cyan-500/30 flex items-center justify-between text-xs text-slate-200 select-none">
        <div className="flex items-center space-x-2">
          <Box className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold tracking-wider text-cyan-300">3D HOLOGRAPHIC ARCHITECT PREVIEW</span>
          <span className="text-[10px] text-slate-500">| Live Extrusion</span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Atmosphere Preset */}
          <select
            value={atmosphere}
            onChange={(e) => setAtmosphere(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-cyan-400 px-1.5 py-0.5 rounded text-[11px] focus:outline-none"
            title="Atmospheric Environment Lighting"
          >
            <option value="clear">Daylight Clear</option>
            <option value="space">Deep Space Void</option>
            <option value="cyberpunk">Neon Cyberpunk</option>
            <option value="toxic">Toxic Haze</option>
            <option value="interior">Warm Bulkhead</option>
          </select>

          {/* Maximize / Restore */}
          <button
            onClick={() => setIsMaximized(prev => !prev)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
            title={isMaximized ? 'Restore window size' : 'Expand preview'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-red-950/80 text-slate-400 hover:text-rose-400 transition"
            title="Close 3D Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Body */}
      <div className="relative flex-1 w-full h-full bg-[#050811] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block touch-none cursor-grab active:cursor-grabbing"
        />

        {/* Floating In-Viewport Camera Controls */}
        <div className="absolute top-2 left-2 flex items-center space-x-1.5 bg-[#0d1117]/80 backdrop-blur px-2 py-1 rounded-md border border-cyan-500/30 text-[11px]">
          <button
            onClick={() => {
              if (cameraRigRef.current) {
                const next = cameraRigRef.current.toggleMode();
                setCameraMode(next);
              }
            }}
            className={`px-1.5 py-0.5 rounded font-semibold transition ${
              cameraMode === 'tactical'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-purple-500/20 text-purple-300'
            }`}
            title="Toggle between Tactical Isometric and Free Orbit"
          >
            {cameraMode === 'tactical' ? 'ISO' : 'ORBIT'}
          </button>

          <button
            onClick={() => cameraRigRef.current?.rotateTacticalAzimuth(false)}
            className="p-1 hover:bg-slate-800 rounded text-slate-300"
            title="Rotate Left 90°"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
          </button>
          <button
            onClick={() => cameraRigRef.current?.rotateTacticalAzimuth(true)}
            className="p-1 hover:bg-slate-800 rounded text-slate-300"
            title="Rotate Right 90°"
          >
            <RotateCw className="w-3 h-3 text-cyan-400" />
          </button>
          <button
            onClick={() => cameraRigRef.current?.resetView()}
            className="p-1 hover:bg-slate-800 rounded text-slate-400"
            title="Reset Camera"
          >
            <Compass className="w-3 h-3" />
          </button>
        </div>

        {/* Floating Deck Slicer */}
        <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-[#0d1117]/80 backdrop-blur px-2 py-1 rounded-md border border-cyan-500/30 text-[11px]">
          <Layers className="w-3 h-3 text-cyan-400" />
          <select
            value={activeDeckId}
            onChange={(e) => setActiveDeckId(e.target.value)}
            className="bg-transparent text-cyan-300 text-[11px] focus:outline-none"
          >
            <option value="deck_0" className="bg-slate-900">Deck 1 (0ft)</option>
            <option value="deck_1" className="bg-slate-900">Deck 2 (15ft)</option>
            <option value="deck_roof" className="bg-slate-900">Roof (30ft)</option>
          </select>
        </div>

        {/* Helpful Tips Overlay */}
        <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-slate-950/70 backdrop-blur px-2 py-0.5 rounded pointer-events-none">
          Drag to Rotate | Shift+Drag to Pan | Scroll to Zoom
        </div>
      </div>
    </div>
  );
};

export default MapMaker3DPreviewModal;
