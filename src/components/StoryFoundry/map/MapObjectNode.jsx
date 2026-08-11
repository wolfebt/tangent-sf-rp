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

export const MapObjectNode = React.memo(({
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
              text={hasHazard ? '⚠️ Hazard' : '💎 Resource'}
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
            offsetY={-radius - (hasHazard || hasResource ? 20 : (hasScaleTarget ? 8 : 12))}
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
});

export const TokenNode = React.memo(({ shapeProps, isSelected, isActiveTurn, onSelect, onChange, onDoubleClick, isEraser, onErase, isLocked }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [tokenImgObj, setTokenImgObj] = useState(null);

  useEffect(() => {
    if (shapeProps.imageUrl) {
      const img = new window.Image();
      img.src = shapeProps.imageUrl;
      img.onload = () => setTokenImgObj(img);
      img.onerror = () => setTokenImgObj(null);
    } else {
      setTokenImgObj(null);
    }
  }, [shapeProps.imageUrl]);

  useEffect(() => {
    if (isSelected && trRef.current && !isLocked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isLocked]);

  const isLink = shapeProps.type === 'link';
  const radius = shapeProps.radius || 35;
  const hp = shapeProps.hp || null;
  const initiative = shapeProps.initiative !== undefined && shapeProps.initiative !== null ? shapeProps.initiative : null;
  const conditions = shapeProps.conditions || [];

  let hpRatio = 1;
  let hpColor = '#10b981';
  if (hp && hp.max > 0) {
    hpRatio = Math.max(0, Math.min(1, hp.current / hp.max));
    if (hpRatio <= 0.25) hpColor = '#ef4444';
    else if (hpRatio <= 0.5) hpColor = '#f59e0b';
  }

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
            stroke={isSelected ? '#ffffff' : (isLink ? '#f59e0b' : '#000000')}
            strokeWidth={isLink ? 3 : (isSelected ? 3 : 1)}
          />
        ) : (
          <Circle
            ref={shapeRef}
            radius={radius}
            fill={shapeProps.fill || '#3b82f6'}
            stroke={isSelected ? '#ffffff' : (isLink ? '#f59e0b' : 'transparent')}
            strokeWidth={isLink ? 3 : (isSelected ? 2 : 0)}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.5}
          />
        )}

        {hp && hp.max > 0 && (
          <Group y={-radius - 12}>
            <Rect
              x={-radius}
              y={0}
              width={radius * 2}
              height={6}
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#334155"
              strokeWidth={1}
              cornerRadius={3}
            />
            <Rect
              x={-radius}
              y={0}
              width={radius * 2 * hpRatio}
              height={6}
              fill={hpColor}
              cornerRadius={3}
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

        <Text
          text={shapeProps.label || ''}
          fontSize={12}
          fontStyle="bold"
          fill="#ffffff"
          align="center"
          width={radius * 2 + 40}
          offsetX={radius + 20}
          offsetY={-radius - (hp ? 22 : 14)}
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
});

export const TextLabelNode = React.memo(({ shapeProps, isSelected, onSelect, onChange, isEraser, onErase, isLocked }) => {
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
});
