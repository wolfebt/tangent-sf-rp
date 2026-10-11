import React, { useId } from 'react';

/**
 * RingedPlanetLogo - Tangent Science Fantasy Roleplaying Game Suite Brand Emblem
 * Features a high-fidelity cyan globe enveloped by tilted, dual-band metallic silver rings
 * with planetary bands, spherical shadows, atmospheric limb aura, and Cassini division.
 */
export const RingedPlanetLogo = ({ 
  size = 32, 
  className = '', 
  glow = true,
  style = {},
  ariaLabel = 'Tangent Ringed Planet Logo'
}) => {
  const rawId = useId();
  const idPrefix = 'rp-' + rawId.replace(/[^a-zA-Z0-9-_]/g, '');

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 64 64" 
      width={size} 
      height={size} 
      fill="none"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        {/* Cyan Globe Spherical Lighting Gradient (Directional light from ~10 o'clock) */}
        <radialGradient id={`${idPrefix}-globe`} cx="34%" cy="30%" r="66%">
          <stop offset="0%" stopColor="#ecfeff" />
          <stop offset="16%" stopColor="#a5f3fc" />
          <stop offset="38%" stopColor="#22d3ee" />
          <stop offset="68%" stopColor="#0891b2" />
          <stop offset="88%" stopColor="#0e4b5c" />
          <stop offset="100%" stopColor="#031b24" />
        </radialGradient>

        {/* Atmosphere Rim / Limb Glow */}
        <radialGradient id={`${idPrefix}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="76%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="93%" stopColor="#22d3ee" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#cffafe" stopOpacity="0.9" />
        </radialGradient>

        {/* Outer Silver Ring Gradient (Metallic Sheen) */}
        <linearGradient id={`${idPrefix}-silver-a`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="18%" stopColor="#f8fafc" />
          <stop offset="36%" stopColor="#cbd5e1" />
          <stop offset="52%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#64748b" />
          <stop offset="86%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Inner Silver Ring Gradient */}
        <linearGradient id={`${idPrefix}-silver-b`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="22%" stopColor="#cbd5e1" />
          <stop offset="48%" stopColor="#f8fafc" />
          <stop offset="76%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Planetary Disk Mask for Atmospheric Bands and Cast Shadows */}
        <clipPath id={`${idPrefix}-planet-clip`}>
          <circle cx="32" cy="32" r="15" />
        </clipPath>

        {/* Back Ring Clipping Box (Upper hemisphere behind planet) */}
        <clipPath id={`${idPrefix}-back-clip`}>
          <rect x="-20" y="-20" width="104" height="52" />
        </clipPath>

        {/* Front Ring Clipping Box (Lower hemisphere in front of planet) */}
        <clipPath id={`${idPrefix}-front-clip`}>
          <rect x="-20" y="32" width="104" height="52" />
        </clipPath>

        {/* Reusable Dual Silver Ring Geometry */}
        <g id={`${idPrefix}-rings`}>
          {/* Outer Ring A */}
          <path 
            d="M 32,23.5 A 30.5,8.5 0 1,0 32,40.5 A 30.5,8.5 0 1,0 32,23.5 Z M 32,24.8 A 26,7.24 0 1,1 32,39.2 A 26,7.24 0 1,1 32,24.8 Z" 
            fill={`url(#${idPrefix}-silver-a)`} 
            fillRule="evenodd" 
          />
          
          {/* Inner Ring B (separated by Cassini division) */}
          <path 
            d="M 32,25.18 A 24.5,6.82 0 1,0 32,38.82 A 24.5,6.82 0 1,0 32,25.18 Z M 32,26.54 A 19.5,5.43 0 1,1 32,37.46 A 19.5,5.43 0 1,1 32,26.54 Z" 
            fill={`url(#${idPrefix}-silver-b)`} 
            fillRule="evenodd" 
          />

          {/* Faint Crepe Ring C */}
          <path 
            d="M 32,26.9 A 18.2,5.07 0 1,0 32,37.1 A 18.2,5.07 0 1,0 32,26.9 Z M 32,27.35 A 16.6,4.62 0 1,1 32,36.65 A 16.6,4.62 0 1,1 32,27.35 Z" 
            fill="#94a3b8" 
            fillOpacity="0.32" 
            fillRule="evenodd" 
          />
        </g>
      </defs>

      {/* 1. BACK SECTION OF RING (Rendered behind globe) */}
      <g transform="rotate(-26 32 32)">
        <g clipPath={`url(#${idPrefix}-back-clip)`}>
          <use href={`#${idPrefix}-rings`} />
          {/* Shadow cast onto back ring by the spherical planetary body */}
          <ellipse cx="37.5" cy="27" rx="8" ry="4" fill="#02151f" fillOpacity="0.75" />
        </g>
      </g>

      {/* 2. GLOBE (Cyan Planetary Body) */}
      <g>
        {/* Base Spherical Gradient */}
        <circle cx="32" cy="32" r="15" fill={`url(#${idPrefix}-globe)`} />

        {/* Planetary Surface Bands & Cast Ring Shadow (Clipped to Globe) */}
        <g clipPath={`url(#${idPrefix}-planet-clip)`}>
          {/* Atmospheric Band 1 */}
          <path d="M 15,26 Q 32,29.5 49,26 L 49,29 Q 32,32.5 15,29 Z" fill="#0891b2" fillOpacity="0.4" />
          {/* Atmospheric Band 2 */}
          <path d="M 15,31.5 Q 32,35 49,31.5 L 49,34 Q 32,37.5 15,34 Z" fill="#22d3ee" fillOpacity="0.25" />
          {/* Atmospheric Band 3 */}
          <path d="M 15,36 Q 32,39.5 49,36 L 49,39 Q 32,42.5 15,39 Z" fill="#032533" fillOpacity="0.45" />

          {/* Ring Shadow Cast on Planet Surface */}
          <path d="M 15,30 Q 32,35.5 49,30 L 49,32.8 Q 32,38.3 15,32.8 Z" fill="#02121a" fillOpacity="0.65" />

          {/* Specular Polar Highlight */}
          <ellipse cx="25.5" cy="22.5" rx="5.5" ry="2.8" transform="rotate(-26 25.5 22.5)" fill="#ffffff" fillOpacity="0.5" />
        </g>

        {/* Atmospheric Limb / Rim Glow */}
        <circle cx="32" cy="32" r="15" fill={`url(#${idPrefix}-rim)`} />
        {/* Luminous Outer Perimeter Edge */}
        <circle cx="32" cy="32" r="15" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.85" />
      </g>

      {/* 3. FRONT SECTION OF RING (Rendered in front of globe) */}
      <g transform="rotate(-26 32 32)">
        <g clipPath={`url(#${idPrefix}-front-clip)`}>
          <use href={`#${idPrefix}-rings`} />
          {/* Specular Glint on Front Outer Rim */}
          <ellipse cx="32" cy="32" rx="28.5" ry="7.9" fill="none" stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.8" />
        </g>
      </g>
    </svg>
  );
};

export default RingedPlanetLogo;
