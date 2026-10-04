/**
 * @file GraphEdgeWire.jsx
 * @description SVG Bezier curve connection wire between narrative nodes.
 * Features click-to-select, directional arrow markers, midpoint condition pills (with DC badges),
 * animated flow pulses, and inline delete/edit actions.
 */

import React from 'react';
import { X, Edit3, ShieldAlert } from 'lucide-react';

export const GraphEdgeWire = ({
  link,
  sourcePos,
  targetPos,
  nodeWidth = 290,
  nodeHeight = 160,
  isSelected = false,
  isHovered = false,
  isHighlighted = false,
  onSelectEdge,
  onDeleteEdge,
  onEditEdge
}) => {
  if (!sourcePos || !targetPos) return null;

  // Ports are positioned at right-center of source and left-center of target
  const x1 = sourcePos.x + nodeWidth;
  const y1 = sourcePos.y + 75;
  const x2 = targetPos.x;
  const y2 = targetPos.y + 75;

  // Smooth cubic Bezier curvature calculation
  const dx = Math.max(Math.abs(x2 - x1) * 0.5, 60);
  const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

  // Midpoint calculation for condition badge
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const isChoice = link.type === 'choice' || Boolean(link.checkDc);
  const isWaypoint = link.type === 'waypoint';
  const isHierarchy = link.type === 'hierarchy';

  // Wire Color Scheme
  let strokeColor = '#64748b'; // default slate
  let markerId = 'url(#graph-arrow)';
  let strokeDasharray = undefined;

  if (isSelected) {
    strokeColor = '#38bdf8'; // glowing cyan
    markerId = 'url(#graph-arrow-selected)';
  } else if (isHighlighted) {
    strokeColor = '#10b981'; // active playhead green
    markerId = 'url(#graph-arrow-playhead)';
  } else if (isWaypoint) {
    strokeColor = '#06b6d4'; // tactical cyan
    markerId = 'url(#graph-arrow-waypoint)';
    strokeDasharray = '6,4';
  } else if (isChoice) {
    strokeColor = '#f59e0b'; // decision amber
    markerId = 'url(#graph-arrow-choice)';
    strokeDasharray = '5,3';
  } else if (isHierarchy) {
    strokeColor = '#475569';
    strokeDasharray = '2,4';
  }

  // Display label formatting
  const displayLabel = link.label || (isChoice ? 'Choice' : '');
  const dcText = link.checkDc ? `${link.attribute ? link.attribute.slice(0, 3).toUpperCase() + ' ' : ''}CR ${link.checkDc}` : null;

  return (
    <g
      className="graph-edge-group cursor-pointer select-none group transition-all"
      onClick={(e) => {
        e.stopPropagation();
        if (onSelectEdge) onSelectEdge(link);
      }}
    >
      {/* Invisible wider hit area for easy clicking */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        className="pointer-events-stroke"
      />

      {/* Selected Ambient Glow Backdrop */}
      {(isSelected || isHighlighted) && (
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={7}
          strokeOpacity={0.35}
          filter="url(#wire-glow)"
          className="pointer-events-none"
        />
      )}

      {/* Main Bezier Wire */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.8 : (isHighlighted ? 2.6 : (isChoice ? 2.2 : 1.8))}
        strokeDasharray={strokeDasharray}
        markerEnd={markerId}
        className={`pointer-events-none transition-colors ${
          isSelected || isHighlighted ? 'animate-pulse' : ''
        }`}
      />

      {/* Animated Flow Particle (When highlighted or in playhead mode) */}
      {isHighlighted && (
        <circle r={4} fill="#34d399" className="animate-pulse">
          <animateMotion path={pathD} dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Midpoint Condition Badge & Action Pills */}
      {(displayLabel || dcText || isSelected) && (
        <g
          transform={`translate(${midX}, ${midY})`}
          className="pointer-events-auto"
        >
          {/* Badge Background Pill */}
          <rect
            x={-55}
            y={-12}
            width={110}
            height={24}
            rx={8}
            fill="#090d16"
            stroke={isSelected ? '#38bdf8' : (isChoice ? '#f59e0b' : '#334155')}
            strokeWidth={isSelected ? 1.5 : 1}
            className="filter drop-shadow-md"
          />

          {/* Text Content */}
          <text
            x={isSelected ? -8 : 0}
            y={dcText ? -1 : 3}
            textAnchor="middle"
            fill={isSelected ? '#7dd3fc' : (isChoice ? '#fde047' : '#cbd5e1')}
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
            className="pointer-events-none select-none truncate"
          >
            {displayLabel.length > 13 ? `${displayLabel.slice(0, 12)}…` : displayLabel}
          </text>

          {/* Optional DC Sub-text */}
          {dcText && (
            <text
              x={isSelected ? -8 : 0}
              y={8}
              textAnchor="middle"
              fill="#fb923c"
              fontSize="7.5"
              fontFamily="monospace"
              fontWeight="bold"
              className="pointer-events-none select-none"
            >
              {dcText}
            </text>
          )}

          {/* Action Delete Button when edge is selected */}
          {isSelected && (
            <g
              transform="translate(38, -6)"
              onClick={(e) => {
                e.stopPropagation();
                if (onDeleteEdge) onDeleteEdge(link);
              }}
              className="hover:scale-125 transition-transform cursor-pointer"
            >
              <circle r={6} fill="#dc2626" />
              <line x1={-2.5} y1={-2.5} x2={2.5} y2={2.5} stroke="#ffffff" strokeWidth={1.2} />
              <line x1={2.5} y1={-2.5} x2={-2.5} y2={2.5} stroke="#ffffff" strokeWidth={1.2} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export default React.memo(GraphEdgeWire);
