import React, { useId } from 'react';

/**
 * TwoD10Icon
 * Custom SVG icon representing paired 10-sided dice (2d10) for the Tangent SF RP engine.
 * Features accurate pentagonal trapezohedron perspective geometry with negative-space occlusion.
 * Matches Lucide icon specifications (24x24 viewBox, stroke-current, configurable size & strokeWidth).
 */
export const TwoD10Icon = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.75,
  className = '',
  fill = 'none',
  style,
  ...props
}) => {
  const reactId = useId();
  const maskId = `two-d10-mask-${reactId.replace(/:/g, '')}`;

  // Die 1: Background Die (offset top-right, angled 14°)
  const bgOutline = 'M17.3 2.1 L12.1 5.9 L11.9 10.6 L14.3 14.3 L18.1 12.2 L20.1 7.9 Z';
  const bgSpine = 'M17.3 2.1 L15.6 9 L14.3 14.3';
  const bgShoulders = 'M12.1 5.9 L15.6 9 L20.1 7.9';
  const bgWaist = 'M11.9 10.6 L15.6 9 L18.1 12.2';

  // Die 2: Foreground Die (lower-left, angled -6°)
  const fgOutline = 'M7.7 8 L3.8 13.8 L5.3 18.7 L9.1 21.6 L12.2 18 L12.7 12.9 Z';
  const fgSpine = 'M7.7 8 L8.5 15.7 L9.1 21.6';
  const fgShoulders = 'M3.8 13.8 L8.5 15.7 L12.7 12.9';
  const fgWaist = 'M5.3 18.7 L8.5 15.7 L12.2 18';

  const numStroke = Number(strokeWidth) || 1.75;
  const facetStroke = Math.max(1, (numStroke * 0.8).toFixed(2));
  const cutoutStroke = (numStroke + 1.2).toFixed(2);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      stroke={color}
      strokeWidth={numStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 inline-block align-middle ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <mask id={maskId}>
          {/* Keep all of the canvas visible */}
          <rect width="24" height="24" fill="white" />
          {/* Mask out foreground die boundary plus negative space gap */}
          <path
            d={fgOutline}
            fill="black"
            stroke="black"
            strokeWidth={cutoutStroke}
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      {/* Die 1: Background Die with negative space cutout from foreground die */}
      <g mask={`url(#${maskId})`} opacity={0.88}>
        <path d={bgOutline} />
        <path d={bgSpine} strokeWidth={facetStroke} opacity={0.8} />
        <path d={bgShoulders} strokeWidth={facetStroke} opacity={0.8} />
        <path d={bgWaist} strokeWidth={facetStroke} opacity={0.7} />
      </g>

      {/* Die 2: Foreground Die */}
      <g>
        <path d={fgOutline} />
        <path d={fgSpine} strokeWidth={facetStroke} opacity={0.9} />
        <path d={fgShoulders} strokeWidth={facetStroke} opacity={0.9} />
        <path d={fgWaist} strokeWidth={facetStroke} opacity={0.8} />
      </g>
    </svg>
  );
};

/**
 * D10Icon
 * Single 10-sided die icon (pentagonal trapezohedron) centered in a 24x24 grid.
 */
export const D10Icon = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.75,
  className = '',
  fill = 'none',
  style,
  ...props
}) => {
  const outline = 'M12 2 L5.5 8.5 L6.8 17.5 L12 22 L17.2 17.5 L18.5 8.5 Z';
  const spine = 'M12 2 L12 12.5 L12 22';
  const shoulders = 'M5.5 8.5 L12 12.5 L18.5 8.5';
  const waist = 'M6.8 17.5 L12 12.5 L17.2 17.5';

  const numStroke = Number(strokeWidth) || 1.75;
  const facetStroke = Math.max(1, (numStroke * 0.8).toFixed(2));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      stroke={color}
      strokeWidth={numStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 inline-block align-middle ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    >
      <path d={outline} />
      <path d={spine} strokeWidth={facetStroke} opacity={0.85} />
      <path d={shoulders} strokeWidth={facetStroke} opacity={0.85} />
      <path d={waist} strokeWidth={facetStroke} opacity={0.75} />
    </svg>
  );
};

export default TwoD10Icon;
