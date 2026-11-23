import React from 'react';
import { Group, Line, Circle, Rect, Text as KonvaText } from 'react-konva';
import { WALL_TYPES, DOOR_STATES, tessellateBezierWall } from '../../../../schemas/vttWallSchema';
import { AudioService } from '../../../../services/audioService';

export const MapWallNode = ({
  wall,
  isSelected = false,
  isEraser = false,
  isLocked = false,
  enableWallShadows = true,
  onSelect,
  onErase,
  onToggleDoor,
  zoomScale = 1
}) => {
  if (!wall || !wall.p1 || !wall.p2) return null;

  const { p1, p2, type, doorState, isOpen, isLocked: isDoorLocked, breachHp, maxBreachHp, label } = wall;

  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const isDoor = type === WALL_TYPES.DOOR;
  const isWindow = type === WALL_TYPES.WINDOW;
  const isEthereal = type === WALL_TYPES.ETHEREAL;

  let strokeColor = '#94a3b8'; // Default solid wall slate
  let strokeWidth = 5;

  if (isDoor) {
    if (doorState === DOOR_STATES.BREACHED) {
      strokeColor = '#ef4444'; // Red breached
    } else if (isOpen) {
      strokeColor = '#22c55e'; // Green open
    } else if (isDoorLocked) {
      strokeColor = '#f59e0b'; // Amber locked
    } else {
      strokeColor = '#3b82f6'; // Blue closed
    }
    strokeWidth = 6;
  } else if (isWindow) {
    strokeColor = '#38bdf8'; // Cyan window
    strokeWidth = 3;
  } else if (isEthereal) {
    strokeColor = '#c084fc'; // Purple ethereal
    strokeWidth = 4;
  }

  const handleDoorClick = (e) => {
    e.cancelBubble = true;
    if (isEraser && onErase) {
      onErase(wall.id);
      return;
    }
    if (isDoor && onToggleDoor) {
      if (doorState === DOOR_STATES.BREACHED) {
        AudioService.playMechanicalClank();
      } else if (isOpen) {
        AudioService.playDoorClose();
      } else {
        AudioService.playDoorOpen();
      }
      onToggleDoor(wall.id);
    }
  };

  const bezierSegments = wall.bezierControl
    ? tessellateBezierWall(p1, wall.bezierControl, p2, 12)
    : null;
  const linePoints = bezierSegments && bezierSegments.length > 0
    ? [bezierSegments[0].p1.x, bezierSegments[0].p1.y, ...bezierSegments.flatMap((s) => [s.p2.x, s.p2.y])]
    : [p1.x, p1.y, p2.x, p2.y];

  return (
    <Group
      onClick={(e) => {
        if (isEraser && onErase) {
          e.cancelBubble = true;
          onErase(wall.id);
        } else if (onSelect) {
          onSelect(wall.id);
        }
      }}
    >
      {/* Wall Drop Shadow Pass */}
      {enableWallShadows && !isOpen && (
        <Line
          x={4}
          y={5}
          points={linePoints}
          stroke="#020617"
          strokeWidth={(isSelected ? strokeWidth + 2 : strokeWidth) + 4}
          lineCap="round"
          lineJoin="round"
          opacity={0.42}
          listening={false}
        />
      )}

      {/* Base Wall Segment Line */}
      <Line
        points={linePoints}
        stroke={isSelected ? '#22d3ee' : strokeColor}
        strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
        lineCap="round"
        lineJoin="round"
        dash={isDoor && isOpen ? [6, 6] : (isEthereal ? [8, 4] : undefined)}
        shadowColor={isSelected ? '#22d3ee' : (isDoor ? strokeColor : undefined)}
        shadowBlur={isSelected ? 10 : (isDoor ? 4 : 0)}
        shadowOpacity={0.8}
      />

      {/* Wall Endpoints */}
      <Circle x={p1.x} y={p1.y} radius={strokeWidth / 2 + 1} fill={strokeColor} />
      <Circle x={p2.x} y={p2.y} radius={strokeWidth / 2 + 1} fill={strokeColor} />

      {/* Interactive Door Center Node */}
      {isDoor && (
        <Group
          x={midX}
          y={midY}
          rotation={angle}
          onClick={handleDoorClick}
          onTap={handleDoorClick}
        >
          {/* Clickable Hit Target */}
          <Rect
            x={-18}
            y={-14}
            width={36}
            height={28}
            fill="rgba(15, 23, 42, 0.85)"
            stroke={strokeColor}
            strokeWidth={1.5}
            cornerRadius={4}
            shadowColor="#000000"
            shadowBlur={6}
          />
          <KonvaText
            x={-16}
            y={-7}
            text={isOpen ? '🔓 OPEN' : (isDoorLocked ? '🔒 LOCK' : '🚪 DOOR')}
            fontSize={9}
            fontStyle="bold"
            fill={strokeColor}
            align="center"
            width={32}
          />
        </Group>
      )}

      {/* Window Crossbar Indicator */}
      {isWindow && (
        <Group x={midX} y={midY} rotation={angle}>
          <Line points={[0, -6, 0, 6]} stroke="#38bdf8" strokeWidth={2} />
        </Group>
      )}
    </Group>
  );
};

export default MapWallNode;
