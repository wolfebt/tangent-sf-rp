import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { getTextureUrlFromColor } from '../map/MapTextures';

export const useMapCanvasEvents = ({
  currentMap,
  activeMapId,
  updateMap,
  recordHistory,
  activeTool,
  lines,
  terrains,
  fog,
  objects,
  tokens,
  texts,
  pencilColor,
  pencilWidth,
  selectedTerrain,
  terrainWidth = 30,
  selectedObjectType,
  tokenType,
  tokenLabelInput,
  textLabelInput,
  textColor,
  textSize
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    if (!e.evt.deltaY || Math.abs(e.evt.deltaY) < 0.1) return;
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();

    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.05, Math.min(newScale, 20));

    setScale(newScale);
    setPosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  const handleMouseDown = (e, setSelectedId) => {
    if (e.evt.button === 1) {
      e.evt.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.evt.clientX - position.x, y: e.evt.clientY - position.y });
      return;
    }

    if (e.evt.button === 0 && currentMap) {
      const pos = e.target.getStage().getRelativePointerPosition();

      if (['pencil', 'terrain', 'fog', 'object', 'token', 'text'].includes(activeTool)) {
        recordHistory();
      }

      if (activeTool === 'pencil') {
        setIsDrawing(true);
        updateMap(activeMapId, { lines: [...lines, { id: uuidv4(), color: pencilColor, strokeWidth: pencilWidth, points: [pos.x, pos.y] }] });
      } else if (activeTool === 'terrain') {
        setIsDrawing(true);
        updateMap(activeMapId, {
          terrains: [...terrains, {
            id: uuidv4(),
            color: selectedTerrain.color || '#15803d',
            strokeWidth: terrainWidth || selectedTerrain.strokeWidth || 30,
            points: [pos.x, pos.y],
            terrainTypeId: selectedTerrain.id,
            label: selectedTerrain.label,
            textureUrl: selectedTerrain.textureUrl || getTextureUrlFromColor(selectedTerrain.color || selectedTerrain.id)
          }]
        });
      } else if (activeTool === 'fog') {
        setIsDrawing(true);
        updateMap(activeMapId, { fog: [...fog, { id: uuidv4(), points: [pos.x, pos.y] }] });
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
          targetMapId: null
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
    if (isPanning) {
      e.evt.preventDefault();
      setPosition({ x: e.evt.clientX - panStart.x, y: e.evt.clientY - panStart.y });
      return;
    }

    if (isDrawing && currentMap) {
      const stage = e.target.getStage();
      const point = stage.getRelativePointerPosition();

      if (activeTool === 'pencil') {
        const nextLines = produce(lines, draft => {
          const lastLine = draft[draft.length - 1];
          if (lastLine) lastLine.points.push(point.x, point.y);
        });
        updateMap(activeMapId, { lines: nextLines });
      } else if (activeTool === 'terrain') {
        const nextTerrains = produce(terrains, draft => {
          const lastTerrain = draft[draft.length - 1];
          if (lastTerrain) lastTerrain.points.push(point.x, point.y);
        });
        updateMap(activeMapId, { terrains: nextTerrains });
      } else if (activeTool === 'fog') {
        const nextFog = produce(fog, draft => {
          const lastFog = draft[draft.length - 1];
          if (lastFog) lastFog.points.push(point.x, point.y);
        });
        updateMap(activeMapId, { fog: nextFog });
      }
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
    if (isDrawing) setIsDrawing(false);
  };

  return {
    scale, setScale,
    position, setPosition,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};
