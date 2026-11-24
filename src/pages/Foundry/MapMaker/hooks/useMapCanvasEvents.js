import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { getTextureUrlFromColor } from '../map/MapTextures';
import { createWallSegment, WALL_TYPES } from '../../../../schemas/vttWallSchema.js';

export const useMapCanvasEvents = ({
  currentMap,
  activeMapId,
  updateMap,
  recordHistory,
  activeTool,
  lines,
  terrains,
  walls = [],
  fog,
  objects,
  tokens,
  texts,
  pencilColor,
  pencilWidth,
  selectedTerrain,
  terrainWidth = 30,
  softTerrainEdge = false,
  paintRoofLayer = false,
  selectedObjectType,
  selectedWallType = 'solid',
  doorLockDc = 14,
  // Dynamic Light properties
  selectedLightColor = '#f59e0b',
  selectedLightRadius = 180,
  selectedLightAnimation = 'flicker',
  lights = [],
  tokenType,
  tokenLabelInput,
  tokenOmnicortexData,
  textLabelInput,
  textColor,
  textSize,
  regions = [],
  selectedRegionType = 'roof_zone',
  onStampChunk
}) => {
  const latestRef = useRef({});
  latestRef.current = {
    walls,
    terrains,
    fog,
    lines,
    objects,
    tokens,
    texts,
    lights,
    regions
  };
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const cameraRef = useRef({ scale: 1, position: { x: 0, y: 0 } });
  cameraRef.current = { scale, position };
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [wallStartPoint, setWallStartPoint] = useState(null);
  const [wallPreviewEnd, setWallPreviewEnd] = useState(null);
  const lastDrawPointRef = useRef(null);
  const [rulerWaypoints, setRulerWaypoints] = useState([]);
  const [rulerPointer, setRulerPointer] = useState(null);
  const [chunkPointerPos, setChunkPointerPos] = useState(null);
  const [chunkCaptureMarquee, setChunkCaptureMarquee] = useState(null);

  const normalizeEvent = (e) => {
    const raw = e?.evt || e || {};
    const clientX = Number(e?.clientX ?? raw?.clientX ?? 0);
    const clientY = Number(e?.clientY ?? raw?.clientY ?? 0);
    const button = Number(e?.button ?? raw?.button ?? 0);
    const buttons = Number(e?.buttons ?? raw?.buttons ?? 0);
    const deltaY = Number(e?.deltaY ?? raw?.deltaY ?? 0);
    const shiftKey = Boolean(e?.shiftKey ?? raw?.shiftKey);
    const ctrlKey = Boolean(e?.ctrlKey ?? raw?.ctrlKey);
    const preventDefault = () => {
      if (typeof e?.preventDefault === 'function') e.preventDefault();
      if (typeof raw?.preventDefault === 'function') raw.preventDefault();
    };
    const stage = typeof e?.target?.getStage === 'function' ? e.target.getStage() : null;
    const pointerPos =
      e?.pointerPos ||
      stage?.getPointerPosition?.() ||
      { x: clientX, y: clientY };
    const cam = cameraRef.current;
    const safeScale = Math.max(0.05, cam.scale || 1);
    const worldPos =
      e?.worldPos ||
      stage?.getRelativePointerPosition?.() || {
        x: (pointerPos.x - cam.position.x) / safeScale,
        y: (pointerPos.y - cam.position.y) / safeScale
      };
    return { clientX, clientY, button, buttons, deltaY, shiftKey, ctrlKey, preventDefault, stage, pointerPos, worldPos };
  };

  // Global safety listener to release panning/drawing if mouse leaves canvas or context menu opens
  useEffect(() => {
    const handleGlobalRelease = () => {
      setIsPanning(false);
      setIsDrawing(false);
    };
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('blur', handleGlobalRelease);
    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('blur', handleGlobalRelease);
    };
  }, []);

  const handleWheel = (e) => {
    const ev = normalizeEvent(e);
    ev.preventDefault();
    // Ignore wheel click / middle click or zero/negligible delta to prevent zoom jump on click
    if ((ev.buttons & 4) || !ev.deltaY || Math.abs(ev.deltaY) < 1) return;
    const scaleBy = 1.1;
    const cam = cameraRef.current;
    const oldScale = ev.stage ? ev.stage.scaleX() : Math.max(0.05, cam.scale || 1);
    const posX = ev.stage ? ev.stage.x() : cam.position.x;
    const posY = ev.stage ? ev.stage.y() : cam.position.y;
    const ptr = ev.pointerPos;

    const mousePointTo = {
      x: ptr.x / oldScale - posX / oldScale,
      y: ptr.y / oldScale - posY / oldScale
    };

    let newScale = ev.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.05, Math.min(newScale, 20));

    setScale(newScale);
    setPosition({
      x: -(mousePointTo.x - ptr.x / newScale) * newScale,
      y: -(mousePointTo.y - ptr.y / newScale) * newScale
    });
  };

  const handleMouseDown = (e) => {
    const ev = normalizeEvent(e);
    const cam = cameraRef.current;
    if (ev.button === 1) {
      ev.preventDefault();
      setIsPanning(true);
      setPanStart({ x: ev.clientX - cam.position.x, y: ev.clientY - cam.position.y });
      return;
    }

    if (ev.button === 0 && currentMap) {
      if (activeTool === 'pan') {
        ev.preventDefault();
        setIsPanning(true);
        setPanStart({ x: ev.clientX - cam.position.x, y: ev.clientY - cam.position.y });
        return;
      }

      const pos = ev.worldPos;

      if (activeTool === 'chunk') {
        if (onStampChunk) {
          recordHistory();
          onStampChunk(pos);
        }
        return;
      }

      if (activeTool === 'select' && ev.shiftKey) {
        setIsDrawing(true);
        setChunkCaptureMarquee({
          startX: pos.x,
          startY: pos.y,
          endX: pos.x,
          endY: pos.y,
          active: true
        });
        return;
      }

      if (['pencil', 'terrain', 'fog', 'object', 'token', 'text', 'wall', 'curved_wall', 'hazard', 'light', 'region'].includes(activeTool)) {
        recordHistory();
      }

      if (activeTool === 'region') {
        const gSize = Math.max(20, currentMap?.gridSize || 50);
        const newRegion = {
          id: uuidv4(),
          name: `${selectedRegionType === 'hazard' ? 'Hazard' : selectedRegionType === 'teleport_deck' ? 'Teleport' : selectedRegionType === 'audio_zone' ? 'Audio' : 'Roof'} Zone`,
          triggerType: selectedRegionType || 'roof_zone',
          bounds: {
            x: Math.round(pos.x - gSize * 1.5),
            y: Math.round(pos.y - gSize * 1.5),
            width: gSize * 3,
            height: gSize * 3
          },
          autoTrigger: true,
          enabled: true,
          payload:
            selectedRegionType === 'hazard'
              ? { damage: 6, damageType: 'thermal' }
              : selectedRegionType === 'roof_zone'
              ? { radiusPx: 110 }
              : {}
        };
        updateMap(activeMapId, { regions: [...(latestRef.current.regions || []), newRegion] });
      } else if (activeTool === 'wall' || activeTool === 'curved_wall') {
        setIsDrawing(true);
        setWallStartPoint(pos);
        setWallPreviewEnd(pos);
      } else if (activeTool === 'ruler') {
        if (ev.shiftKey || ev.ctrlKey || rulerWaypoints.length === 0) {
          setRulerWaypoints(prev => [...prev, pos]);
        } else {
          // Reset or add
          setRulerWaypoints([pos]);
        }
      } else if (activeTool === 'pencil') {
        setIsDrawing(true);
        lastDrawPointRef.current = pos;
        updateMap(activeMapId, { lines: [...lines, { id: uuidv4(), color: pencilColor, strokeWidth: pencilWidth, points: [pos.x, pos.y] }] });
      } else if (activeTool === 'terrain') {
        setIsDrawing(true);
        lastDrawPointRef.current = pos;
        updateMap(activeMapId, {
          terrains: [...terrains, {
            id: uuidv4(),
            color: selectedTerrain.color || '#15803d',
            strokeWidth: terrainWidth || selectedTerrain.strokeWidth || 30,
            points: [pos.x, pos.y],
            terrainTypeId: selectedTerrain.id,
            label: selectedTerrain.label,
            textureUrl: selectedTerrain.textureUrl || getTextureUrlFromColor(selectedTerrain.color || selectedTerrain.id),
            softEdge: Boolean(softTerrainEdge),
            isRoofLayer: Boolean(paintRoofLayer)
          }]
        });
      } else if (activeTool === 'fog') {
        setIsDrawing(true);
        lastDrawPointRef.current = pos;
        updateMap(activeMapId, { fog: [...fog, { id: uuidv4(), points: [pos.x, pos.y] }] });
      } else if (activeTool === 'hazard') {
        const hazardObj = {
          id: uuidv4(),
          type: selectedObjectType?.id || 'plasma_hazard',
          label: selectedObjectType?.label || 'Hazard Zone',
          color: selectedObjectType?.color || '#f97316',
          shape: selectedObjectType?.shape || 'circle',
          radius: selectedObjectType?.radius || 35,
          width: selectedObjectType?.width || 70,
          height: selectedObjectType?.height || 70,
          hazard: selectedObjectType?.hazard || selectedObjectType?.label || 'Environmental Hazard',
          category: 'Hazards',
          desc: selectedObjectType?.desc || '',
          x: pos.x,
          y: pos.y
        };
        updateMap(activeMapId, { objects: [...objects, hazardObj] });
      } else if (activeTool === 'light') {
        const newLight = {
          id: uuidv4(),
          x: pos.x,
          y: pos.y,
          radius: selectedLightRadius || 180,
          color: selectedLightColor || '#f59e0b',
          animation: selectedLightAnimation || 'flicker',
          brightness: 0.8
        };
        updateMap(activeMapId, { lights: [...lights, newLight] });
      } else if (activeTool === 'object') {
        const newObj = {
          id: uuidv4(),
          type: selectedObjectType.id,
          label: selectedObjectType.label,
          color: selectedObjectType.color || '#3b82f6',
          shape: selectedObjectType.shape || 'rect',
          radius: selectedObjectType.radius || 25,
          width: selectedObjectType.width || (selectedObjectType.radius ? selectedObjectType.radius * 2 : 40),
          height: selectedObjectType.height || (selectedObjectType.radius ? selectedObjectType.radius * 2 : 40),
          scaleTarget: selectedObjectType.scaleTarget || null,
          hazard: selectedObjectType.hazard || null,
          resource: selectedObjectType.resource || null,
          category: selectedObjectType.category || null,
          imageUrl: selectedObjectType.imageUrl || null,
          x: pos.x,
          y: pos.y
        };
        updateMap(activeMapId, { objects: [...objects, newObj] });
      } else if (activeTool === 'token') {
        const newToken = {
          id: tokenType === 'link' ? 'link_' + Date.now() : 'token_' + Date.now(),
          type: tokenType,
          x: pos.x,
          y: pos.y,
          radius: 35,
          fill: tokenType === 'link' ? '#fcd34d' : '#3b82f6',
          label: tokenLabelInput || 'Token',
          targetMapId: null,
          hp: tokenOmnicortexData ? { current: tokenOmnicortexData.hp, max: tokenOmnicortexData.hp } : undefined
        };
        updateMap(activeMapId, { tokens: [...tokens, newToken] });
      } else if (activeTool === 'text') {
        const newTextNode = {
          id: uuidv4(),
          text: textLabelInput || 'Text Label',
          fill: textColor,
          fontSize: textSize,
          x: pos.x,
          y: pos.y
        };
        updateMap(activeMapId, { texts: [...texts, newTextNode] });
      }
    }
  };

  const handleMouseMove = (e) => {
    const ev = normalizeEvent(e);
    if (isPanning) {
      if (ev.buttons === 0) {
        setIsPanning(false);
        return;
      }
      ev.preventDefault();
      setPosition({ x: ev.clientX - panStart.x, y: ev.clientY - panStart.y });
      return;
    }

    if (currentMap) {
      const point = ev.worldPos;

      if (activeTool === 'ruler') {
        setRulerPointer(point);
      }

      if (activeTool === 'chunk') {
        setChunkPointerPos(point);
      }

      if (isDrawing) {
        if (chunkCaptureMarquee?.active) {
          setChunkCaptureMarquee(prev => (prev ? { ...prev, endX: point.x, endY: point.y } : null));
          return;
        }
        if (activeTool === 'wall' || activeTool === 'curved_wall') {
          setWallPreviewEnd(point);
        } else if (activeTool === 'pencil' || activeTool === 'terrain' || activeTool === 'fog') {
          const prevPt = lastDrawPointRef.current;
          if (prevPt) {
            const dx = point.x - prevPt.x;
            const dy = point.y - prevPt.y;
            if ((dx * dx + dy * dy) < 4) return;
          }
          lastDrawPointRef.current = point;

          const fieldKey = activeTool === 'pencil' ? 'lines' : (activeTool === 'terrain' ? 'terrains' : 'fog');
          updateMap(activeMapId, (prevMap) => {
            const prevList = Array.isArray(prevMap?.[fieldKey]) ? prevMap[fieldKey] : [];
            if (prevList.length === 0) return prevMap;
            const nextList = produce(prevList, draft => {
              const lastStroke = draft[draft.length - 1];
              if (lastStroke && Array.isArray(lastStroke.points)) {
                lastStroke.points.push(point.x, point.y);
              }
            });
            return { [fieldKey]: nextList };
          });
        }
      }
    }
  };

  const handleMouseUp = () => {
    lastDrawPointRef.current = null;
    if (isPanning) setIsPanning(false);
    if (isDrawing) {
      if (chunkCaptureMarquee?.active) {
        setChunkCaptureMarquee(prev => (prev ? { ...prev, active: false } : null));
      }
      if ((activeTool === 'wall' || activeTool === 'curved_wall') && wallStartPoint && wallPreviewEnd) {
        const dx = wallPreviewEnd.x - wallStartPoint.x;
        const dy = wallPreviewEnd.y - wallStartPoint.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
          let bezierControl;
          if (activeTool === 'curved_wall') {
            const mx = (wallStartPoint.x + wallPreviewEnd.x) / 2;
            const my = (wallStartPoint.y + wallPreviewEnd.y) / 2;
            const arcOffset = dist * 0.25;
            bezierControl = {
              x: Math.round(mx - (dy / dist) * arcOffset),
              y: Math.round(my + (dx / dist) * arcOffset)
            };
          }
          const newWall = createWallSegment(wallStartPoint, wallPreviewEnd, selectedWallType, {
            hackDc: doorLockDc,
            ...(bezierControl ? { bezierControl } : {})
          });
          updateMap(activeMapId, (prev) => ({
            walls: [...(prev?.walls || latestRef.current.walls || []), newWall]
          }));
        }
        setWallStartPoint(null);
        setWallPreviewEnd(null);
      }
      setIsDrawing(false);
    }
  };

  const clearRuler = () => {
    setRulerWaypoints([]);
    setRulerPointer(null);
  };

  const zoomBy = (factor) => {
    setScale(prev => Math.max(0.05, Math.min(prev * factor, 20)));
  };

  const panBy = (dx, dy) => {
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  return {
    scale, setScale,
    position, setPosition,
    isDrawing,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    wallStartPoint,
    wallPreviewEnd,
    rulerWaypoints,
    setRulerWaypoints,
    rulerPointer,
    setRulerPointer,
    clearRuler,
    zoomBy,
    panBy,
    chunkPointerPos,
    chunkCaptureMarquee,
    setChunkCaptureMarquee
  };
};
