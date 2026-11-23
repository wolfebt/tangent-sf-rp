/**
 * @file SpectatorPixiCanvas.tsx
 * @description Read-only PixiJS v8 projection canvas for PlayerSpectatorView (/spectator/:mapId).
 * Shares RendererContext + LayerCompositor with StageView for 1:1 visual fidelity,
 * with automatic Canvas2D fallback when WebGPU/WebGL are unavailable (e.g. headless/jsdom).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Graphics, Container, Text as PixiText, TextStyle, Assets, Sprite } from 'pixi.js';
import { RendererContext } from '../../engine/canvas/RendererContext';
import { LayerCompositor, ZLayer } from '../../engine/canvas/LayerCompositor';
import { resolveAtmosphericPreset } from '../../engine/vision/LightSourceManager';
import { clearPixiContainer } from './utils/pixiCleanup';

export interface SpectatorPixiCanvasProps {
  width: number;
  height: number;
  scale: number;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  onWheelZoom: (clientX: number, clientY: number, deltaY: number) => void;
  mapData: any;
  gridMode: string;
  gridSize: number;
  worldWidth: number;
  worldHeight: number;
  visibleTerrains: any[];
  lines: any[];
  visibleObjects: any[];
  visibleTexts: any[];
  visibleWalls: any[];
  visibleTokens: any[];
  visibleFog: any[];
  visibilityPolygon: number[] | null;
  fogEnabled: boolean;
}

function parseHexColor(color: unknown, fallback = 0x06b6d4): number {
  if (typeof color === 'number' && Number.isFinite(color)) return color;
  if (typeof color === 'string') {
    const clean = color.trim().replace(/^#/, '');
    const parsed = parseInt(clean, 16);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export const SpectatorPixiCanvas: React.FC<SpectatorPixiCanvasProps> = ({
  width,
  height,
  scale,
  position,
  onPositionChange,
  onWheelZoom,
  mapData,
  gridMode,
  gridSize,
  worldWidth,
  worldHeight,
  visibleTerrains,
  lines,
  visibleObjects,
  visibleTexts,
  visibleWalls,
  visibleTokens,
  visibleFog,
  visibilityPolygon,
  fogEnabled
}) => {
  const pixiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<RendererContext | null>(null);
  const compositorRef = useRef<LayerCompositor | null>(null);

  const [isPixiReady, setIsPixiReady] = useState(false);
  const [useCanvas2DFallback, setUseCanvas2DFallback] = useState(false);

  const isPanningRef = useRef(false);
  const dragOriginRef = useRef({ x: 0, y: 0 });
  const posRef = useRef(position);
  posRef.current = position;

  // 1. Initialize PixiJS RendererContext + LayerCompositor (with Canvas2D fallback)
  useEffect(() => {
    const canvas = pixiCanvasRef.current;
    if (!canvas || useCanvas2DFallback) return;

    let cancelled = false;
    const renderer = new RendererContext();
    rendererRef.current = renderer;

    (async () => {
      await renderer.initialize(canvas);
      if (cancelled) {
        await renderer.destroy();
        return;
      }

      if (!renderer.getIsInitialized()) {
        setUseCanvas2DFallback(true);
        return;
      }

      const app = renderer.getApp();
      if (!app || !app.stage) {
        setUseCanvas2DFallback(true);
        return;
      }

      const compositor = new LayerCompositor(app);
      compositorRef.current = compositor;
      app.stage.scale.set(scale);
      app.stage.position.set(position.x, position.y);
      setIsPixiReady(true);
    })();

    return () => {
      cancelled = true;
      setIsPixiReady(false);
      compositorRef.current?.destroy?.();
      compositorRef.current = null;
      rendererRef.current?.destroy?.();
      rendererRef.current = null;
    };
  }, [useCanvas2DFallback]);

  // 2. Sync camera transform
  useEffect(() => {
    if (!isPixiReady || !rendererRef.current?.getIsInitialized()) return;
    const app = rendererRef.current.getApp();
    if (!app?.stage) return;
    app.stage.scale.set(scale);
    app.stage.position.set(position.x, position.y);
  }, [isPixiReady, scale, position.x, position.y]);

  // 3. Render PixiJS scene graph across ZLayers
  useEffect(() => {
    if (!isPixiReady || useCanvas2DFallback) return;
    const compositor = compositorRef.current;
    if (!compositor) return;
    let isCancelled = false;

    const bgLayer = compositor.getLayer(ZLayer.BackgroundMap);
    const debrisLayer = compositor.getLayer(ZLayer.UnderlayDebris);
    const objLayer = compositor.getLayer(ZLayer.InteractiveObjects);
    const tokenLayer = compositor.getLayer(ZLayer.Tokens);
    const fxLayer = compositor.getLayer(ZLayer.DynamicFX);
    const lightLayer = compositor.getLayer(ZLayer.LightingDarkness);
    const fogLayer = compositor.getLayer(ZLayer.FogOfWar);
    const uiLayer = compositor.getLayer(ZLayer.ForegroundUI);

    if (bgLayer) {
      clearPixiContainer(bgLayer);

      // Background mat + board
      const mat = new Graphics();
      mat.rect(-5000, -5000, 14000, 13000);
      mat.fill({ color: 0x070a12 });
      mat.rect(0, 0, worldWidth, worldHeight);
      mat.fill({ color: 0x0a0e17 });
      mat.stroke({ width: 2, color: 0x1e293b });
      bgLayer.addChild(mat);

      // Background plate image if present
      if (mapData?.background_url) {
        Assets.load(mapData.background_url)
          .then((tex) => {
            if (!isCancelled && !bgLayer.destroyed && tex) {
              const sprite = new Sprite(tex);
              sprite.x = 0;
              sprite.y = 0;
              sprite.alpha = 0.9;
              bgLayer.addChildAt(sprite, 1);
            }
          })
          .catch(() => {});
      }

      // Terrains
      const tg = new Graphics();
      visibleTerrains.forEach((t: any) => {
        const isImg = t.renderType === 'canvasImage' || t.renderType === 'image' || (!t.points && Boolean(t.imageUrl));
        if (isImg && t.imageUrl) {
          Assets.load(t.imageUrl)
            .then((tex) => {
              if (!isCancelled && !bgLayer.destroyed && tex) {
                const sp = new Sprite(tex);
                sp.x = t.x || 0;
                sp.y = t.y || 0;
                if (t.width) sp.width = t.width;
                if (t.height) sp.height = t.height;
                bgLayer.addChild(sp);
              }
            })
            .catch(() => {});
          return;
        }

        const colorHex = parseHexColor(t.color, 0x14532d);
        if (t.renderType === 'hexTile' && t.x !== undefined && t.y !== undefined) {
          const radius = t.radius || 40;
          const pts: number[] = [];
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            pts.push(t.x + radius * Math.cos(angle), t.y + radius * Math.sin(angle));
          }
          tg.poly(pts);
          tg.fill({ color: colorHex, alpha: 0.85 });
          tg.stroke({ width: 1, color: 0x000000, alpha: 0.25 });
        } else if (t.renderType === 'rect') {
          tg.rect(t.x || 0, t.y || 0, t.width || 40, t.height || 40);
          tg.fill({ color: colorHex, alpha: t.opacity ?? 0.88 });
        } else if (Array.isArray(t.points) && t.points.length >= 4) {
          if (t.closed || t.renderType === 'polygon') {
            tg.poly(t.points);
            tg.fill({ color: colorHex, alpha: 0.85 });
            tg.stroke({ width: t.strokeWidth || 2, color: colorHex, alpha: 0.95 });
          } else {
            tg.moveTo(t.points[0], t.points[1]);
            for (let i = 2; i < t.points.length; i += 2) {
              tg.lineTo(t.points[i], t.points[i + 1]);
            }
            tg.stroke({ width: t.strokeWidth || 30, color: colorHex, cap: 'round', join: 'round', alpha: 0.85 });
          }
        }
      });
      bgLayer.addChild(tg);

      // Grid overlay
      if (gridMode === 'square' || gridMode === 'hex') {
        const gg = new Graphics();
        const step = Math.max(15, gridSize || 50);
        if (gridMode === 'square') {
          for (let x = 0; x <= worldWidth; x += step) {
            gg.moveTo(x, 0);
            gg.lineTo(x, worldHeight);
          }
          for (let y = 0; y <= worldHeight; y += step) {
            gg.moveTo(0, y);
            gg.lineTo(worldWidth, y);
          }
        } else {
          const hexRadius = step / 1.5;
          const rowStep = hexRadius * 1.5;
          const colStep = hexRadius * Math.sqrt(3);
          for (let y = 0, row = 0; y <= worldHeight; y += rowStep, row++) {
            const xOff = row % 2 === 1 ? colStep / 2 : 0;
            for (let x = xOff; x <= worldWidth; x += colStep) {
              const pts: number[] = [];
              for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                pts.push(x + hexRadius * Math.cos(a), y + hexRadius * Math.sin(a));
              }
              gg.poly(pts);
            }
          }
        }
        gg.stroke({ width: 1, color: 0xffffff, alpha: 0.08 });
        bgLayer.addChild(gg);
      }
    }

    // Freehand Lines + Walls
    if (debrisLayer) {
      clearPixiContainer(debrisLayer);
      const lg = new Graphics();
      lines.forEach((l: any) => {
        if (Array.isArray(l.points) && l.points.length >= 4) {
          lg.moveTo(l.points[0], l.points[1]);
          for (let i = 2; i < l.points.length; i += 2) {
            lg.lineTo(l.points[i], l.points[i + 1]);
          }
          lg.stroke({ width: l.width || l.strokeWidth || 3, color: parseHexColor(l.color, 0x22d3ee), cap: 'round', join: 'round' });
        }
      });

      visibleWalls.forEach((w: any) => {
        const p1 = w.p1 || { x: w.x1 || 0, y: w.y1 || 0 };
        const p2 = w.p2 || { x: w.x2 || 0, y: w.y2 || 0 };
        const isDoor = Boolean(w.isDynamic || w.isDoor || w.type === 'door' || w.wallType === 'door');
        const isOpen = Boolean(w.isOpen || w.doorState === 'open' || w.doorState === 'breached');
        const isWindow = Boolean(w.isTransparent || w.type === 'window' || w.wallType === 'window');
        const colorHex = isDoor ? (isOpen ? 0x10b981 : 0xf59e0b) : isWindow ? 0x38bdf8 : 0x06b6d4;
        lg.moveTo(p1.x, p1.y);
        if (w.bezierControl && typeof w.bezierControl.x === 'number' && typeof w.bezierControl.y === 'number') {
          lg.quadraticCurveTo(w.bezierControl.x, w.bezierControl.y, p2.x, p2.y);
        } else {
          lg.lineTo(p2.x, p2.y);
        }
        lg.stroke({ width: isDoor ? 5 : isWindow ? 3 : 4, color: colorHex, alpha: isOpen ? 0.35 : 0.95 });
      });
      debrisLayer.addChild(lg);
    }

    // Interactive Objects
    if (objLayer) {
      clearPixiContainer(objLayer);
      visibleObjects.forEach((obj: any) => {
        const c = new Container();
        c.x = obj.x || 0;
        c.y = obj.y || 0;
        const g = new Graphics();
        const col = parseHexColor(obj.color, 0x3b82f6);
        const w = obj.width || 30;
        const h = obj.height || 30;
        if (obj.shape === 'circle') {
          g.circle(0, 0, Math.max(w, h) / 2);
        } else {
          g.roundRect(-w / 2, -h / 2, w, h, 4);
        }
        g.fill({ color: col, alpha: 0.8 });
        g.stroke({ width: 1.5, color: 0xffffff, alpha: 0.7 });
        c.addChild(g);
        if (obj.label || obj.name) {
          const txt = new PixiText({
            text: obj.label || obj.name,
            style: new TextStyle({ fontFamily: 'monospace', fontSize: 9, fill: 0xe2e8f0 })
          });
          txt.anchor.set(0.5, 1);
          txt.y = -h / 2 - 4;
          c.addChild(txt);
        }
        objLayer.addChild(c);
      });
    }

    // Tokens
    if (tokenLayer) {
      clearPixiContainer(tokenLayer);
      visibleTokens.forEach((tok: any) => {
        const c = new Container();
        c.x = tok.x || 0;
        c.y = tok.y || 0;
        const isHero = tok.type === 'hero' || tok.linkedHeroId || tok.is_persona;
        const g = new Graphics();
        const r = tok.radius || 22;
        g.circle(0, 0, r);
        g.fill({ color: isHero ? 0x06b6d4 : 0x8b5cf6, alpha: 0.9 });
        g.stroke({ width: 2.5, color: 0xffffff });
        c.addChild(g);

        const label = new PixiText({
          text: tok.label || tok.name || 'Unit',
          style: new TextStyle({ fontFamily: 'monospace', fontSize: 10, fill: 0xffffff, fontWeight: 'bold' })
        });
        label.anchor.set(0.5, -1.6);
        c.addChild(label);
        tokenLayer.addChild(c);
      });
    }

    // Dynamic Lights & Atmospheric Weather Tint
    if (lightLayer && fxLayer) {
      clearPixiContainer(lightLayer);
      clearPixiContainer(fxLayer);
      const lights = Array.isArray(mapData?.lights) ? mapData.lights : [];
      if (lights.length > 0) {
        const lg = new Graphics();
        lights.forEach((l: any) => {
          const col = parseHexColor(l.color, 0xf59e0b);
          const rad = l.radius || 180;
          lg.circle(l.x || 0, l.y || 0, rad);
          lg.fill({ color: col, alpha: 0.14 });
        });
        lightLayer.addChild(lg);
      }

      const preset = resolveAtmosphericPreset(mapData?.atmosphericWeather || mapData?.lightingMode || 'clear');
      if (preset.tintAlpha > 0) {
        const ag = new Graphics();
        ag.rect(0, 0, worldWidth, worldHeight);
        ag.fill({ color: preset.tintHex, alpha: preset.tintAlpha });
        fxLayer.addChild(ag);
      }
    }

    // Fog of War Mask + LoS Cutout
    if (fogLayer) {
      clearPixiContainer(fogLayer);
      if (fogEnabled || visibleFog.length > 0) {
        const fg = new Graphics();
        if (fogEnabled) {
          fg.rect(-5000, -5000, 14000, 13000);
          fg.fill({ color: 0x05070a, alpha: 0.92 });
          if (visibilityPolygon && visibilityPolygon.length >= 6) {
            fg.poly(visibilityPolygon);
            fg.cut();
          }
        }
        visibleFog.forEach((f: any) => {
          if (Array.isArray(f.points) && f.points.length >= 6) {
            fg.poly(f.points);
            if (f.isEraser || f.erase) {
              fg.cut();
            } else {
              fg.fill({ color: 0x05070a, alpha: 0.94 });
            }
          }
        });
        fogLayer.addChild(fg);
      }
    }

    // Labels
    if (uiLayer) {
      clearPixiContainer(uiLayer);
      visibleTexts.forEach((t: any) => {
        const txt = new PixiText({
          text: t.text || 'Label',
          style: new TextStyle({ fontFamily: 'monospace', fontSize: t.fontSize || 16, fill: t.fill || '#22d3ee', fontWeight: 'bold' })
        });
        txt.x = t.x || 0;
        txt.y = t.y || 0;
        uiLayer.addChild(txt);
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [
    isPixiReady,
    useCanvas2DFallback,
    mapData,
    gridMode,
    gridSize,
    worldWidth,
    worldHeight,
    visibleTerrains,
    lines,
    visibleObjects,
    visibleTexts,
    visibleWalls,
    visibleTokens,
    visibleFog,
    visibilityPolygon,
    fogEnabled
  ]);

  // 4. Canvas2D Fallback Renderer (used only when WebGPU/WebGL cannot boot in headless/jsdom environments)
  useEffect(() => {
    if (!useCanvas2DFallback) return;
    const canvas = fallbackCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, worldWidth, worldHeight);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    const step = Math.max(15, gridSize || 50);
    for (let x = 0; x <= worldWidth; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, worldHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= worldHeight; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(worldWidth, y);
      ctx.stroke();
    }

    // Walls
    visibleWalls.forEach((w: any) => {
      const p1 = w.p1 || { x: w.x1 || 0, y: w.y1 || 0 };
      const p2 = w.p2 || { x: w.x2 || 0, y: w.y2 || 0 };
      ctx.strokeStyle = w.isDoor || w.isDynamic ? (w.isOpen ? '#10b981' : '#f59e0b') : '#06b6d4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // Tokens
    visibleTokens.forEach((tok: any) => {
      ctx.fillStyle = tok.type === 'hero' || tok.is_persona ? '#06b6d4' : '#8b5cf6';
      ctx.beginPath();
      ctx.arc(tok.x || 0, tok.y || 0, tok.radius || 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.restore();
  }, [useCanvas2DFallback, width, height, scale, position.x, position.y, gridSize, worldWidth, worldHeight, visibleWalls, visibleTokens]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPanningRef.current = true;
    dragOriginRef.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPanningRef.current) return;
    onPositionChange({
      x: e.clientX - dragOriginRef.current.x,
      y: e.clientY - dragOriginRef.current.y
    });
  };

  const handlePointerUp = () => {
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    onWheelZoom(e.clientX, e.clientY, e.deltaY);
  };

  if (useCanvas2DFallback) {
    return (
      <canvas
        ref={fallbackCanvasRef}
        data-testid="spectator-canvas-2d-fallback"
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />
    );
  }

  return (
    <canvas
      ref={pixiCanvasRef}
      data-testid="spectator-pixi-canvas"
      width={width}
      height={height}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      className="w-full h-full block cursor-grab active:cursor-grabbing"
    />
  );
};

export default SpectatorPixiCanvas;
