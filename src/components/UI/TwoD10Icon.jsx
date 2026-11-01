import React, { useId } from 'react';

/**
 * TwoD10Icon
 * Detailed custom SVG icon representing paired 10-sided dice (2d10) for the Tangent SF RP engine.
 * Features authentic 3D pentagonal trapezohedron kite-facet geometry, equatorial zig-zag belt,
 * multi-tone facet shading, and negative-space occlusion between foreground and background dice.
 */
export const TwoD10Icon = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.5,
  className = '',
  fill = 'none',
  style,
  ...props
}) => {
  const reactId = useId();
  const maskId = `two-d10-mask-${reactId.replace(/:/g, '')}`;

  // Die 1: Background d10 (offset top-right, tilted +12°)
  // Vertices: T(17.7,2.0), UL(11.2,6.2), LL(11.5,10.8), B(14.7,15.7), LR(19.7,12.5), UR(21.8,8.5)
  // Inner Kite: IL(13.8,8.6), EC(15.5,12.2), IR(18.5,9.6)
  const bgOutline = 'M 17.7 2.0 L 11.2 6.2 L 11.5 10.8 L 14.7 15.7 L 19.7 12.5 L 21.8 8.5 Z';
  const bgCenterKite = 'M 17.7 2.0 L 13.8 8.6 L 15.5 12.2 L 18.5 9.6 Z';
  const bgRightKite = 'M 17.7 2.0 L 18.5 9.6 L 19.7 12.5 L 21.8 8.5 Z';
  const bgLowerFacet = 'M 11.5 10.8 L 13.8 8.6 L 15.5 12.2 L 18.5 9.6 L 19.7 12.5 L 14.7 15.7 Z';
  const bgEquatorBelt = 'M 11.5 10.8 L 13.8 8.6 L 15.5 12.2 L 18.5 9.6 L 19.7 12.5';
  const bgUpperShoulders = 'M 11.2 6.2 L 13.8 8.6 M 18.5 9.6 L 21.8 8.5';
  const bgPolarSpine = 'M 15.5 12.2 L 14.7 15.7';

  // Die 2: Foreground d10 (lower-left, tilted -8°)
  // Vertices: T(7.0,7.0), UL(2.0,13.5), LL(4.0,18.0), B(9.0,21.6), LR(12.9,16.7), UR(13.5,11.9)
  // Inner Kite: IL(5.5,15.1), EC(8.5,18.0), IR(10.6,14.3)
  const fgOutline = 'M 7.0 7.0 L 2.0 13.5 L 4.0 18.0 L 9.0 21.6 L 12.9 16.7 L 13.5 11.9 Z';
  const fgCenterKite = 'M 7.0 7.0 L 5.5 15.1 L 8.5 18.0 L 10.6 14.3 Z';
  const fgLeftKite = 'M 7.0 7.0 L 2.0 13.5 L 4.0 18.0 L 5.5 15.1 Z';
  const fgLowerFacet = 'M 4.0 18.0 L 5.5 15.1 L 8.5 18.0 L 10.6 14.3 L 12.9 16.7 L 9.0 21.6 Z';
  const fgEquatorBelt = 'M 4.0 18.0 L 5.5 15.1 L 8.5 18.0 L 10.6 14.3 L 12.9 16.7';
  const fgUpperShoulders = 'M 2.0 13.5 L 5.5 15.1 M 10.6 14.3 L 13.5 11.9';
  const fgPolarSpine = 'M 8.5 18.0 L 9.0 21.6';

  const numStroke = Number(strokeWidth) || 1.5;
  const facetStroke = Math.max(0.95, Number((numStroke * 0.72).toFixed(2)));
  const cutoutStroke = (numStroke + 1.35).toFixed(2);

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
          <rect width="24" height="24" fill="white" />
          <path
            d={fgOutline}
            fill="black"
            stroke="black"
            strokeWidth={cutoutStroke}
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      {/* Die 1: Background d10 with negative space cutout from foreground die */}
      <g mask={`url(#${maskId})`} opacity={0.92}>
        {/* 3D Facet Shading */}
        <path d={bgCenterKite} fill={color} fillOpacity={0.22} stroke="none" />
        <path d={bgRightKite} fill={color} fillOpacity={0.1} stroke="none" />
        <path d={bgLowerFacet} fill={color} fillOpacity={0.32} stroke="none" />
        {/* Outer & Inner Facet Ridges */}
        <path d={bgOutline} />
        <path d={bgCenterKite} strokeWidth={facetStroke} opacity={0.9} />
        <path d={bgEquatorBelt} strokeWidth={facetStroke} opacity={0.85} />
        <path d={bgUpperShoulders} strokeWidth={facetStroke} opacity={0.75} />
        <path d={bgPolarSpine} strokeWidth={facetStroke} opacity={0.85} />
      </g>

      {/* Die 2: Foreground d10 */}
      <g>
        {/* 3D Facet Shading */}
        <path d={fgCenterKite} fill={color} fillOpacity={0.26} stroke="none" />
        <path d={fgLeftKite} fill={color} fillOpacity={0.12} stroke="none" />
        <path d={fgLowerFacet} fill={color} fillOpacity={0.35} stroke="none" />
        {/* Outer & Inner Facet Ridges */}
        <path d={fgOutline} />
        <path d={fgCenterKite} strokeWidth={facetStroke} opacity={0.95} />
        <path d={fgEquatorBelt} strokeWidth={facetStroke} opacity={0.9} />
        <path d={fgUpperShoulders} strokeWidth={facetStroke} opacity={0.8} />
        <path d={fgPolarSpine} strokeWidth={facetStroke} opacity={0.9} />
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
  strokeWidth = 1.6,
  className = '',
  fill = 'none',
  style,
  ...props
}) => {
  const outline = 'M 12 2.0 L 4.5 9.2 L 6.2 16.0 L 12 22.0 L 17.8 16.0 L 19.5 9.2 Z';
  const centerKite = 'M 12 2.0 L 8.2 11.4 L 12 15.8 L 15.8 11.4 Z';
  const leftKite = 'M 12 2.0 L 4.5 9.2 L 6.2 16.0 L 8.2 11.4 Z';
  const lowerFacet = 'M 6.2 16.0 L 8.2 11.4 L 12 15.8 L 15.8 11.4 L 17.8 16.0 L 12 22.0 Z';
  const equatorBelt = 'M 6.2 16.0 L 8.2 11.4 L 12 15.8 L 15.8 11.4 L 17.8 16.0';
  const upperShoulders = 'M 4.5 9.2 L 8.2 11.4 M 15.8 11.4 L 19.5 9.2';
  const polarSpine = 'M 12 15.8 L 12 22.0';

  const numStroke = Number(strokeWidth) || 1.6;
  const facetStroke = Math.max(1, Number((numStroke * 0.75).toFixed(2)));

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
      <path d={centerKite} fill={color} fillOpacity={0.24} stroke="none" />
      <path d={leftKite} fill={color} fillOpacity={0.12} stroke="none" />
      <path d={lowerFacet} fill={color} fillOpacity={0.34} stroke="none" />
      <path d={outline} />
      <path d={centerKite} strokeWidth={facetStroke} opacity={0.95} />
      <path d={equatorBelt} strokeWidth={facetStroke} opacity={0.9} />
      <path d={upperShoulders} strokeWidth={facetStroke} opacity={0.8} />
      <path d={polarSpine} strokeWidth={facetStroke} opacity={0.9} />
    </svg>
  );
};

export default TwoD10Icon;
