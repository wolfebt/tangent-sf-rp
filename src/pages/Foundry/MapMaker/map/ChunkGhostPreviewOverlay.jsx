/**
 * @file ChunkGhostPreviewOverlay.jsx
 * @description Konva Layer overlay that renders the live Ghost Preview of a MapChunkBlueprint
 * prior to stamping on the canvas, including D4 (90° CW North-Side Rotation + H/V Flip) geometry,
 * North-Side Compass Reference Indicator, Perimeter Snap Sockets, Magnetic Socket Snap Weld Indicator,
 * and Shift+Drag Marquee Region Capture overlay.
 */

import React from 'react';
import { Group, Rect, Line, Circle, Text as KonvaText } from 'react-konva';

export const ChunkGhostPreviewOverlay = ({
  activeTool,
  ghostPreviewData,
  gridSize = 50,
  chunkCaptureMarquee
}) => {
  return (
    <Group listening={false}>
      {/* 1. Shift+Drag Marquee Region Capture Box */}
      {chunkCaptureMarquee && (
        <Group>
          <Rect
            x={Math.min(chunkCaptureMarquee.startX, chunkCaptureMarquee.endX)}
            y={Math.min(chunkCaptureMarquee.startY, chunkCaptureMarquee.endY)}
            width={Math.abs(chunkCaptureMarquee.endX - chunkCaptureMarquee.startX)}
            height={Math.abs(chunkCaptureMarquee.endY - chunkCaptureMarquee.startY)}
            fill="rgba(16, 185, 129, 0.14)"
            stroke="#10b981"
            strokeWidth={2}
            dash={[8, 4]}
          />
          <KonvaText
            x={Math.min(chunkCaptureMarquee.startX, chunkCaptureMarquee.endX) + 6}
            y={Math.min(chunkCaptureMarquee.startY, chunkCaptureMarquee.endY) - 18}
            text="CAPTURE REGION AS MAP CHUNK"
            fill="#34d399"
            fontSize={11}
            fontStyle="bold"
            fontFamily="monospace"
          />
        </Group>
      )}

      {/* 2. Live Chunk Stamp Ghost Preview */}
      {activeTool === 'chunk' && ghostPreviewData && (() => {
        const {
          originX,
          originY,
          transformedBlueprint,
          snapCandidate,
          worldSockets = []
        } = ghostPreviewData;
        if (!transformedBlueprint) return null;

        const W = transformedBlueprint.widthCells;
        const H = transformedBlueprint.heightCells;
        const widthPx = W * gridSize;
        const heightPx = H * gridSize;
        const northSide = transformedBlueprint.northSide || 'N';

        // North-Side Reference Banner coordinates
        let northBadgeX = originX + widthPx / 2 - 48;
        let northBadgeY = originY - 22;
        if (northSide === 'S') {
          northBadgeX = originX + widthPx / 2 - 48;
          northBadgeY = originY + heightPx + 6;
        } else if (northSide === 'E') {
          northBadgeX = originX + widthPx + 6;
          northBadgeY = originY + heightPx / 2 - 9;
        } else if (northSide === 'W') {
          northBadgeX = originX - 102;
          northBadgeY = originY + heightPx / 2 - 9;
        }

        const northLabel =
          northSide === 'N'
            ? 'NORTH ▲'
            : northSide === 'E'
            ? 'NORTH ▶'
            : northSide === 'S'
            ? 'NORTH ▼'
            : 'NORTH ◀';

        return (
          <Group>
            {/* Ghost Floor Tiles */}
            {(transformedBlueprint.tiles || []).map((t, idx) => (
              <Rect
                key={`gt_${idx}`}
                x={originX + t.col * gridSize}
                y={originY + t.row * gridSize}
                width={gridSize}
                height={gridSize}
                fill={t.color || '#334155'}
                opacity={0.55}
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth={1}
              />
            ))}

            {/* Ghost Placed Assets */}
            {(transformedBlueprint.assets || []).map((a, idx) => (
              <Rect
                key={`ga_${idx}`}
                x={originX + a.col * gridSize + 4}
                y={originY + a.row * gridSize + 4}
                width={(a.widthCells || 1) * gridSize - 8}
                height={(a.heightCells || 1) * gridSize - 8}
                fill={a.color || '#38bdf8'}
                opacity={0.7}
                cornerRadius={4}
              />
            ))}

            {/* Ghost Internal Construction Point Hardpoints */}
            {(transformedBlueprint.constructionPoints || [])
              .filter((cp) => cp.kind === 'internal_slot')
              .map((cp, idx) => {
                const [fw, fh] = cp.footprintCells || [1, 1];
                const cx = originX + (cp.col + fw / 2) * gridSize;
                const cy = originY + (cp.row + fh / 2) * gridSize;
                return (
                  <Circle
                    key={`gcp_${idx}`}
                    x={cx}
                    y={cy}
                    radius={Math.min(fw, fh) * gridSize * 0.28}
                    fill={cp.defaultColor || '#22d3ee'}
                    opacity={0.8}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                );
              })}

            {/* Ghost Walls & Portals */}
            {(transformedBlueprint.walls || []).map((w, idx) => (
              <Line
                key={`gw_${idx}`}
                points={[
                  originX + w.p1.x * gridSize,
                  originY + w.p1.y * gridSize,
                  originX + w.p2.x * gridSize,
                  originY + w.p2.y * gridSize
                ]}
                stroke={
                  w.type === 'door'
                    ? '#f59e0b'
                    : w.type === 'window'
                    ? '#38bdf8'
                    : '#e2e8f0'
                }
                strokeWidth={w.type === 'door' ? 6 : 4}
                dash={w.type === 'door' ? [8, 4] : undefined}
                opacity={0.85}
              />
            ))}

            {/* Outer Chunk Footprint Bounding Frame */}
            <Rect
              x={originX}
              y={originY}
              width={widthPx}
              height={heightPx}
              stroke={snapCandidate ? '#10b981' : '#38bdf8'}
              strokeWidth={snapCandidate ? 3 : 2}
              dash={[10, 5]}
            />

            {/* Perimeter Snap Socket Markers */}
            {worldSockets.map((sock, idx) => (
              <Circle
                key={`gsock_${idx}`}
                x={sock.worldMid.x}
                y={sock.worldMid.y}
                radius={7}
                fill="#10b981"
                stroke="#052e16"
                strokeWidth={2}
              />
            ))}

            {/* Magnetic Socket Snap Weld Indicator */}
            {snapCandidate && (
              <Group>
                <Circle
                  x={snapCandidate.targetSocket.worldMid.x}
                  y={snapCandidate.targetSocket.worldMid.y}
                  radius={14}
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="rgba(16, 185, 129, 0.35)"
                />
                <KonvaText
                  x={snapCandidate.targetSocket.worldMid.x - 65}
                  y={snapCandidate.targetSocket.worldMid.y - 26}
                  text="⚡ SOCKET SNAP & WELD"
                  fill="#34d399"
                  fontSize={11}
                  fontStyle="bold"
                  fontFamily="monospace"
                />
              </Group>
            )}

            {/* Prominent North-Side Reference Indicator Pill */}
            <Group x={northBadgeX} y={northBadgeY}>
              <Rect
                x={0}
                y={0}
                width={96}
                height={18}
                cornerRadius={9}
                fill="#f59e0b"
                stroke="#0f172a"
                strokeWidth={1.5}
              />
              <KonvaText
                x={0}
                y={3}
                width={96}
                align="center"
                text={`${northLabel} (${northSide})`}
                fill="#020617"
                fontSize={10}
                fontStyle="bold"
                fontFamily="monospace"
              />
            </Group>
          </Group>
        );
      })()}
    </Group>
  );
};
export default ChunkGhostPreviewOverlay;
