import React from 'react';

/**
 * BastionStarburstIcon
 * Custom 8-point starburst SVG icon for the BASTION AI Assistant.
 * Combines 4 primary cardinal rays and 4 secondary diagonal rays with a luminous inner core.
 */
export const BastionStarburstIcon = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.6,
  className = '',
  style,
  ...props
}) => {
  // 8-point starburst polygon centered at (12, 12)
  // Primary cardinal points (N, E, S, W) at r=10.5; diagonal points (NE, SE, SW, NW) at r=7.5; inner valleys at r=3.0
  const starburstPath = [
    'M 12 1.5',
    'L 13.15 9.23',
    'L 17.3 6.7',
    'L 14.77 10.85',
    'L 22.5 12',
    'L 14.77 13.15',
    'L 17.3 17.3',
    'L 13.15 14.77',
    'L 12 22.5',
    'L 10.85 14.77',
    'L 6.7 17.3',
    'L 9.23 13.15',
    'L 1.5 12',
    'L 9.23 10.85',
    'L 6.7 6.7',
    'L 10.85 9.23',
    'Z'
  ].join(' ');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 inline-block align-middle ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    >
      {/* Subtle inner glow fill */}
      <path
        d={starburstPath}
        fill={color}
        fillOpacity={0.22}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Radiant inner core diamond */}
      <path
        d="M 12 8.8 L 15.2 12 L 12 15.2 L 8.8 12 Z"
        fill={color}
        fillOpacity={0.45}
        stroke="none"
      />
      <circle cx="12" cy="12" r="1.35" fill={color} stroke="none" />
    </svg>
  );
};

export default BastionStarburstIcon;
