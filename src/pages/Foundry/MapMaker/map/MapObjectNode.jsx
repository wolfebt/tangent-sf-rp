import React, { useRef, useEffect, useState } from 'react';
import { Group, Circle, RegularPolygon, Rect, Star, Line, Text, Transformer, Image as KonvaImage } from 'react-konva';
import { getLoadedImage } from './MapTextures';

export const CONDITION_COLORS = {
  Stunned: '#ef4444',   // Red
  Shielded: '#3b82f6',  // Blue
  Cover: '#10b981',     // Green
  Invisible: '#a855f7', // Purple
  Poisoned: '#84cc16'   // Lime
};

export const MapObjectNode = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  isEraser,
  onErase,
  isLocked,
  zoomScale = 1
}) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [imageObj, setImageObj] = useState(null);

  useEffect(() => {
    if (shapeProps.imageUrl) {
      const img = getLoadedImage(shapeProps.imageUrl, (loadedImg) => {
        setImageObj(loadedImg);
      });
      if (img && img.complete) {
        setImageObj(img);
      }
    } else {
      setImageObj(null);
    }
  }, [shapeProps.imageUrl]);

  useEffect(() => {
    if (isSelected && trRef.current && !isLocked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isLocked]);

  const handleClick = (e) => {
    if (isLocked) return;
    if (isEraser) {
      onErase(shapeProps.id);
    } else {
      onSelect(e);
    }
  };

  const isLODOut = zoomScale < 0.65;
  const radius = shapeProps.radius || 25;
  const width = shapeProps.width || radius * 2;
  const height = shapeProps.height || radius * 2;
  const fillColor = shapeProps.color || '#3b82f6';
  const hasScaleTarget = !!shapeProps.scaleTarget;
  const hasHazard = !!shapeProps.hazard;
  const hasResource = !!shapeProps.resource;

  const renderShapeGeometry = () => {
    // LOD Zoomed Out: Render simplified vector icon
    if (isLODOut) {
      return (
        <Circle
          ref={shapeRef}
          radius={Math.max(16, radius)}
          fill={fillColor}
          stroke={isSelected ? '#ffffff' : (hasScaleTarget ? '#f59e0b' : '#000000')}
          strokeWidth={isSelected ? 3 : 2}
          shadowColor={hasScaleTarget ? '#f59e0b' : '#000000'}
          shadowBlur={hasScaleTarget ? 10 : 4}
        />
      );
    }

    if (imageObj) {
      return (
        <KonvaImage
          ref={shapeRef}
          image={imageObj}
          width={width}
          height={height}
          offsetX={width / 2}
          offsetY={height / 2}
          stroke={isSelected ? '#22d3ee' : 'transparent'}
          strokeWidth={isSelected ? 3 : 0}
        />
      );
    }

    // Full Detailed Geometry Rendering
    switch (shapeProps.shape) {
      case 'star':
        return (
          <Group ref={shapeRef}>
            {hasHazard && (
              <Circle
                radius={radius + 8}
                stroke="#ef4444"
                strokeWidth={2}
                dash={[4, 4]}
              />
            )}
            <Star
              numPoints={5}
              innerRadius={radius * 0.5}
              outerRadius={radius}
              fill={fillColor}
              stroke={isSelected ? '#ffffff' : '#000000'}
              strokeWidth={2}
              shadowColor={fillColor}
              shadowBlur={6}
            />
          </Group>
        );
      case 'hexagon':
        return (
          <Group ref={shapeRef}>
            {hasScaleTarget && (
              <RegularPolygon
                sides={6}
                radius={radius + 6}
                stroke="#f59e0b"
                strokeWidth={2}
                dash={[6, 4]}
              />
            )}
            <RegularPolygon
              sides={6}
              radius={radius}
              fill={fillColor}
              stroke={isSelected ? '#ffffff' : '#000000'}
              strokeWidth={2}
            />
          </Group>
        );
      case 'triangle':
        return (
          <RegularPolygon
            ref={shapeRef}
            sides={3}
            radius={radius}
            fill={fillColor}
            stroke={isSelected ? '#ffffff' : '#000000'}
            strokeWidth={2}
          />
        );
      case 'cloud':
        return (
          <Group ref={shapeRef}>
            <Circle x={-radius * 0.4} y={0} radius={radius * 0.6} fill={fillColor} opacity={0.8} />
            <Circle x={radius * 0.4} y={0} radius={radius * 0.6} fill={fillColor} opacity={0.8} />
            <Circle x={0} y={-radius * 0.3} radius={radius * 0.75} fill={fillColor} opacity={0.9} />
            <Circle
              x={0} y={0} radius={radius}
              stroke={isSelected ? '#ffffff' : '#000000'} strokeWidth={2}
            />
          </Group>
        );
      case 'line':
        return (
          <Line
            ref={shapeRef}
            points={[-width / 2, 0, width / 2, 0]}
            stroke={fillColor}
            strokeWidth={height || 12}
            lineCap="round"
          />
        );
      case 'rect':
      default:
        return (
          <Group ref={shapeRef}>
            {hasScaleTarget && (
              <Rect
                x={-width / 2 - 4}
                y={-height / 2 - 4}
                width={width + 8}
                height={height + 8}
                stroke="#f59e0b"
                strokeWidth={2}
                dash={[6, 4]}
                cornerRadius={4}
              />
            )}
            <Rect
              x={-width / 2}
              y={-height / 2}
              width={width}
              height={height}
              fill={fillColor}
              stroke={isSelected ? '#ffffff' : '#000000'}
              strokeWidth={2}
              cornerRadius={2}
            />
          </Group>
        );
    }
  };

  return (
    <React.Fragment>
      <Group
        x={shapeProps.x}
        y={shapeProps.y}
        draggable={!isEraser && !isLocked}
        onClick={handleClick}
        onTap={handleClick}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      >
        {/* Halo Glow Aura */}
        {shapeProps.haloColor && (
          <Circle
            radius={radius + 8}
            stroke={shapeProps.haloColor}
            strokeWidth={4}
            shadowColor={shapeProps.haloColor}
            shadowBlur={16}
            shadowOpacity={0.9}
            opacity={0.85}
          />
        )}

        {renderShapeGeometry()}

        {/* Scale Conversion Target Indicator Badge */}
        {hasScaleTarget && !isLODOut && (
          <Group y={-radius - 16}>
            <Rect
              x={-45}
              y={0}
              width={90}
              height={14}
              fill="rgba(15, 23, 42, 0.9)"
              stroke="#f59e0b"
              strokeWidth={1}
              cornerRadius={3}
            />
            <Text
              text={`Portal: ${shapeProps.scaleTarget}`}
              fontSize={8}
              fontStyle="bold"
              fill="#fcd34d"
              align="center"
              width={90}
              x={-45}
              y={2}
            />
          </Group>
        )}

        {/* Hazard / Resource Badges */}
        {(hasHazard || hasResource) && !isLODOut && (
          <Group y={radius + 4}>
            <Rect
              x={-40}
              y={0}
              width={80}
              height={12}
              fill={hasHazard ? 'rgba(153, 27, 27, 0.9)' : 'rgba(6, 95, 70, 0.9)'}
              stroke={hasHazard ? '#ef4444' : '#10b981'}
              strokeWidth={1}
              cornerRadius={3}
            />
            <Text
              text={hasHazard ? (shapeProps.trapState ? `⚠️ ${shapeProps.trapState.toUpperCase()}` : '⚠️ Hazard') : '💎 Resource'}
              fontSize={8}
              fontStyle="bold"
              fill="#ffffff"
              align="center"
              width={80}
              x={-40}
              y={2}
            />
          </Group>
        )}

        {/* Story Module ADE Element Badge */}
        {(shapeProps.isStoryElement || shapeProps.storyElementType) && !isLODOut && (
          <Group y={radius + 4}>
            <Rect
              x={-45}
              y={0}
              width={90}
              height={14}
              fill="rgba(8, 51, 68, 0.95)"
              stroke="#06b6d4"
              strokeWidth={1}
              cornerRadius={3}
            />
            <Text
              text={`📖 ${shapeProps.storyElementType || 'ADE Element'}`}
              fontSize={8}
              fontStyle="bold"
              fill="#67e8f9"
              align="center"
              width={90}
              x={-45}
              y={2}
            />
          </Group>
        )}

        {/* Node Title Label */}
        {(!shapeProps.hideLabel && (isSelected || (shapeProps.label !== 'Dense Foliage' && shapeProps.label !== 'Mountain Ridge'))) && (
          <Text
            text={shapeProps.label || ''}
            fontSize={11}
            fontStyle="bold"
            fill="#ffffff"
            align="center"
            width={120}
            offsetX={60}
            offsetY={-radius - (hasHazard || hasResource || shapeProps.isStoryElement ? 20 : (hasScaleTarget ? 8 : 12))}
            shadowColor="#000000"
            shadowBlur={4}
          />
        )}
      </Group>

      {isSelected && !isEraser && !isLocked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export const TokenNode = ({ shapeProps, isSelected, isActiveTurn, onSelect, onChange, onDoubleClick, isEraser, onErase, isLocked }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [tokenImgObj, setTokenImgObj] = useState(null);

  const imgSource = shapeProps.avatarUrl || shapeProps.imageUrl;

  useEffect(() => {
    if (imgSource) {
      const img = new window.Image();
      img.src = imgSource;
      img.onload = () => setTokenImgObj(img);
      img.onerror = () => setTokenImgObj(null);
    } else {
      setTokenImgObj(null);
    }
  }, [imgSource]);

  useEffect(() => {
    if (isSelected && trRef.current && !isLocked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isLocked]);

  const isLink = shapeProps.type === 'link';
  const isHero = shapeProps.type === 'hero' || !!shapeProps.linkedHeroId;
  const radius = shapeProps.radius || 35;
  const health = shapeProps.health || shapeProps.hp || null;
  const vitality = shapeProps.vitality || null;
  const initiative = shapeProps.initiative !== undefined && shapeProps.initiative !== null ? shapeProps.initiative : null;
  const defense = shapeProps.defense !== undefined && shapeProps.defense !== null ? shapeProps.defense : null;
  const conditions = shapeProps.conditions || [];

  let healthRatio = 1;
  let healthColor = '#10b981';
  if (health && health.max > 0) {
    healthRatio = Math.max(0, Math.min(1, health.current / health.max));
    if (healthRatio <= 0.25) healthColor = '#ef4444';
    else if (healthRatio <= 0.5) healthColor = '#f59e0b';
  }

  let vitalityRatio = 1;
  let vitalityColor = '#22d3ee';
  if (vitality && vitality.max > 0) {
    vitalityRatio = Math.max(0, Math.min(1, vitality.current / vitality.max));
    if (vitalityRatio <= 0.25) vitalityColor = '#a855f7';
  }

  const hasHealthBar = health && health.max > 0;
  const hasVitalityBar = vitality && vitality.max > 0;
  const barOffset = (hasHealthBar && hasVitalityBar) ? 26 : ((hasHealthBar || hasVitalityBar) ? 20 : 14);

  const handleClick = (e) => {
    if (isLocked) return;
    if (isEraser) {
      onErase(shapeProps.id);
    } else {
      onSelect(e);
    }
  };

  return (
    <React.Fragment>
      <Group
        x={shapeProps.x}
        y={shapeProps.y}
        draggable={!isEraser && !isLocked}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={onDoubleClick}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      >
        {/* Halo Glow Aura */}
        {shapeProps.haloColor && (
          <Circle
            radius={radius + 8}
            stroke={shapeProps.haloColor}
            strokeWidth={4}
            shadowColor={shapeProps.haloColor}
            shadowBlur={16}
            shadowOpacity={0.9}
            opacity={0.85}
          />
        )}

        {/* Hero Outer Ring Accent */}
        {isHero && !isActiveTurn && (
          <Circle
            radius={radius + 3}
            stroke="#22d3ee"
            strokeWidth={1.5}
            dash={[4, 4]}
            opacity={0.75}
          />
        )}

        {isActiveTurn && (
          <Circle
            radius={radius + 8}
            stroke="#22d3ee"
            strokeWidth={3}
            dash={[6, 4]}
            shadowColor="#22d3ee"
            shadowBlur={12}
          />
        )}

        {tokenImgObj ? (
          <KonvaImage
            ref={shapeRef}
            image={tokenImgObj}
            width={radius * 2}
            height={radius * 2}
            offsetX={radius}
            offsetY={radius}
            stroke={isSelected ? '#ffffff' : (isLink ? '#f59e0b' : (isHero ? '#22d3ee' : '#000000'))}
            strokeWidth={isLink || isHero ? 3 : (isSelected ? 3 : 1)}
          />
        ) : (
          <Group ref={shapeRef}>
            <Circle
              radius={radius}
              fill={shapeProps.fill || (isHero ? '#0e7490' : '#3b82f6')}
              stroke={isSelected ? '#ffffff' : (isLink ? '#f59e0b' : (isHero ? '#22d3ee' : 'transparent'))}
              strokeWidth={isLink || isHero ? 3 : (isSelected ? 2 : 0)}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.5}
            />
            {isHero && (
              <Text
                text={shapeProps.label ? shapeProps.label.charAt(0).toUpperCase() : 'H'}
                fontSize={radius}
                fontStyle="bold"
                fill="#e0f2fe"
                align="center"
                width={radius * 2}
                offsetX={radius}
                offsetY={radius * 0.55}
              />
            )}
          </Group>
        )}

        {/* Health Bar (Physical) */}
        {hasHealthBar && (
          <Group y={-radius - (hasVitalityBar ? 16 : 12)}>
            <Rect
              x={-radius}
              y={0}
              width={radius * 2}
              height={hasVitalityBar ? 5 : 6}
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#334155"
              strokeWidth={1}
              cornerRadius={2.5}
            />
            <Rect
              x={-radius}
              y={0}
              width={radius * 2 * healthRatio}
              height={hasVitalityBar ? 5 : 6}
              fill={healthColor}
              cornerRadius={2.5}
            />
          </Group>
        )}

        {/* Vitality Bar (Mental / Energy) */}
        {hasVitalityBar && (
          <Group y={-radius - 9}>
            <Rect
              x={-radius}
              y={0}
              width={radius * 2}
              height={4}
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#1e293b"
              strokeWidth={1}
              cornerRadius={2}
            />
            <Rect
              x={-radius}
              y={0}
              width={radius * 2 * vitalityRatio}
              height={4}
              fill={vitalityColor}
              cornerRadius={2}
            />
          </Group>
        )}

        {initiative !== null && (
          <Group x={radius - 6} y={-radius + 4}>
            <Circle
              radius={10}
              fill="#0f172a"
              stroke="#f59e0b"
              strokeWidth={1.5}
            />
            <Text
              text={String(initiative)}
              fontSize={10}
              fontStyle="bold"
              fill="#fcd34d"
              align="center"
              width={20}
              offsetX={10}
              offsetY={5}
            />
          </Group>
        )}

        {defense !== null && (
          <Group x={-radius + 6} y={-radius + 4}>
            <Circle
              radius={9}
              fill="#0f172a"
              stroke="#0ea5e9"
              strokeWidth={1.5}
            />
            <Text
              text={String(defense)}
              fontSize={9}
              fontStyle="bold"
              fill="#7dd3fc"
              align="center"
              width={18}
              offsetX={9}
              offsetY={4.5}
            />
          </Group>
        )}

        {conditions.length > 0 && (
          <Group x={-radius} y={radius + 4}>
            {conditions.map((cond, idx) => (
              <Circle
                key={cond}
                x={idx * 10 + 5}
                y={0}
                radius={4}
                fill={CONDITION_COLORS[cond] || '#ffffff'}
                stroke="#000000"
                strokeWidth={1}
              />
            ))}
          </Group>
        )}

        {/* Autonomous NPC Script Badge */}
        {shapeProps.script && shapeProps.script.type && (
          <Group x={radius - 6} y={radius - 6}>
            <Circle
              radius={9}
              fill="#0f172a"
              stroke="#06b6d4"
              strokeWidth={1.5}
            />
            <Text
              text={
                shapeProps.script.type === 'patrol' ? '🚶' :
                shapeProps.script.type === 'sentry' ? '👁️' :
                shapeProps.script.type === 'ambush' ? '🥷' : '🤖'
              }
              fontSize={9}
              align="center"
              width={16}
              offsetX={8}
              offsetY={4.5}
            />
          </Group>
        )}

        <Text
          text={shapeProps.label || ''}
          fontSize={12}
          fontStyle="bold"
          fill="#ffffff"
          align="center"
          width={radius * 2 + 40}
          offsetX={radius + 20}
          offsetY={-radius - barOffset}
        />
      </Group>

      {isSelected && !isEraser && !isLocked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export const TextLabelNode = ({ shapeProps, isSelected, onSelect, onChange, isEraser, onErase, isLocked }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && !isLocked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isLocked]);

  const handleClick = (e) => {
    if (isLocked) return;
    if (isEraser) {
      onErase(shapeProps.id);
    } else {
      onSelect(e);
    }
  };

  return (
    <React.Fragment>
      <Group
        x={shapeProps.x}
        y={shapeProps.y}
        draggable={!isEraser && !isLocked}
        onClick={handleClick}
        onTap={handleClick}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      >
        <Text
          ref={shapeRef}
          text={shapeProps.text || 'Label'}
          fontSize={shapeProps.fontSize || 16}
          fill={shapeProps.fill || '#ffffff'}
          stroke={isSelected ? '#3b82f6' : 'transparent'}
          strokeWidth={isSelected ? 1 : 0}
        />
      </Group>
      {isSelected && !isEraser && !isLocked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};
