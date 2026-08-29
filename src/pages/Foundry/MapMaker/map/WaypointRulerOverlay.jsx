import React from 'react';
import { Group, Line, Circle, Rect, Text as KonvaText } from 'react-konva';

/**
 * WaypointRulerOverlay renders the interactive multi-segment measurement ruler
 * and AP consumption preview on top of the Konva canvas.
 */
export const WaypointRulerOverlay = ({
  waypoints = [],
  currentPointer = null,
  gridSize = 40,
  gridMode = 'hex',
  measurementUnit = 'meters',
  availableAp = 4,
  zoomScale = 1
}) => {
  if (!waypoints || waypoints.length === 0) return null;

  const points = [...waypoints];
  if (currentPointer) {
    points.push(currentPointer);
  }

  if (points.length < 2) return null;

  // Flatten points for Konva Line: [x0, y0, x1, y1, ...]
  const flatPoints = [];
  let totalDistanceMeters = 0;
  const segmentStats = [];

  for (let i = 0; i < points.length; i++) {
    flatPoints.push(points[i].x, points[i].y);

    if (i > 0) {
      const pPrev = points[i - 1];
      const pCurr = points[i];
      const distPx = Math.hypot(pCurr.x - pPrev.x, pCurr.y - pPrev.y);
      // Grid unit calculation: 1 grid unit (e.g. 40px) = 2 meters in Tangent system
      const distMeters = Math.round((distPx / gridSize) * 2 * 10) / 10;
      totalDistanceMeters += distMeters;

      segmentStats.push({
        midX: (pPrev.x + pCurr.x) / 2,
        midY: (pPrev.y + pCurr.y) / 2,
        distMeters,
        cumMeters: Math.round(totalDistanceMeters * 10) / 10
      });
    }
  }

  // Calculate Action Point (AP) cost: standard move is 2 meters per 1 AP
  const apCost = Math.max(1, Math.ceil(totalDistanceMeters / 2));
  
  let pathColor = '#22c55e'; // Green - within AP
  if (apCost > availableAp && apCost <= availableAp * 2) {
    pathColor = '#f59e0b'; // Amber - Sprint / Overdrive
  } else if (apCost > availableAp * 2) {
    pathColor = '#ef4444'; // Red - Exceeds max move
  }

  const lastPt = points[points.length - 1];

  return (
    <Group listening={false}>
      {/* Path Line */}
      <Line
        points={flatPoints}
        stroke={pathColor}
        strokeWidth={3 / zoomScale}
        lineCap="round"
        lineJoin="round"
        dash={[8 / zoomScale, 4 / zoomScale]}
        shadowColor={pathColor}
        shadowBlur={8}
        shadowOpacity={0.8}
      />

      {/* Waypoint Markers */}
      {points.map((pt, idx) => (
        <Group key={`wp_${idx}`} x={pt.x} y={pt.y}>
          <Circle
            radius={6 / zoomScale}
            fill={idx === 0 ? '#38bdf8' : (idx === points.length - 1 ? pathColor : '#f8fafc')}
            stroke="#0f172a"
            strokeWidth={1.5 / zoomScale}
          />
        </Group>
      ))}

      {/* Total Distance & AP Spend Banner at End Point */}
      <Group x={lastPt.x + 15 / zoomScale} y={lastPt.y - 25 / zoomScale}>
        <Rect
          x={0}
          y={0}
          width={130 / zoomScale}
          height={42 / zoomScale}
          fill="rgba(15, 23, 42, 0.92)"
          stroke={pathColor}
          strokeWidth={1.5 / zoomScale}
          cornerRadius={6 / zoomScale}
          shadowColor="#000000"
          shadowBlur={10}
        />
        <KonvaText
          x={6 / zoomScale}
          y={6 / zoomScale}
          text={`📏 ${Math.round(totalDistanceMeters * 10) / 10}m (${Math.round(totalDistanceMeters / 2)} Hex)`}
          fontSize={11 / zoomScale}
          fontStyle="bold"
          fill="#f8fafc"
        />
        <KonvaText
          x={6 / zoomScale}
          y={22 / zoomScale}
          text={`⚡ AP Cost: ${apCost} / ${availableAp} AP`}
          fontSize={10 / zoomScale}
          fontStyle="bold"
          fill={pathColor}
        />
      </Group>
    </Group>
  );
};

export default WaypointRulerOverlay;
