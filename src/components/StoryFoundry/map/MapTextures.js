/**
 * MapTextures.js
 * Procedural SVG texture pattern generators and image caching utilities for Konva Canvas rendering.
 * Provides 100% self-contained offline textures and high-resolution object sprites.
 */

// Helper to convert SVG string to Base64 Data URL
const svgToDataUrl = (svgString) => {
  const clean = svgString.trim();
  try {
    const base64 = typeof window !== 'undefined' && window.btoa ? window.btoa(unescape(encodeURIComponent(clean))) : '';
    return `data:image/svg+xml;base64,${base64}`;
  } catch (e) {
    const encoded = encodeURIComponent(clean).replace(/'/g, '%27').replace(/"/g, '%22');
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }
};

/**
 * PROCEDURAL SEAMLESS TERRAIN TEXTURE SVG PATTERNS
 */
export const TERRAIN_TEXTURE_PATTERNS = {
  deepSpaceVoid: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#030712"/>
      <circle cx="12" cy="18" r="1" fill="#ffffff" opacity="0.8"/>
      <circle cx="85" cy="34" r="1.5" fill="#38bdf8" opacity="0.9"/>
      <circle cx="45" cy="72" r="0.8" fill="#ffffff" opacity="0.6"/>
      <circle cx="110" cy="95" r="1.2" fill="#c026d3" opacity="0.7"/>
      <circle cx="68" cy="115" r="1" fill="#fef08a" opacity="0.8"/>
      <circle cx="92" cy="12" r="0.6" fill="#ffffff" opacity="0.5"/>
      <circle cx="28" cy="100" r="1.4" fill="#60a5fa" opacity="0.75"/>
    </svg>
  `),

  waterOcean: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#1e3a8a"/>
      <path d="M4 16 C 12 12, 20 20, 28 16 M36 48 C 44 44, 52 52, 60 48" fill="none" stroke="#3b82f6" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>
      <circle cx="45" cy="20" r="1.5" fill="#60a5fa" opacity="0.3"/>
      <circle cx="15" cy="50" r="1.2" fill="#93c5fd" opacity="0.3"/>
    </svg>
  `),

  grassland: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="#14532d"/>
      <path d="M10 20 L13 10 L16 20 M20 22 L24 8 L28 22" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
      <path d="M50 60 L53 50 L56 60 M60 62 L64 48 L68 62" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
      <path d="M35 40 L37 32 L40 40" fill="none" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `),

  forestCanopy: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">
      <rect width="90" height="90" fill="#052e16"/>
      <circle cx="25" cy="25" r="20" fill="#15803d" opacity="0.8"/>
      <circle cx="65" cy="30" r="22" fill="#047857" opacity="0.75"/>
      <circle cx="35" cy="65" r="24" fill="#166534" opacity="0.85"/>
      <circle cx="70" cy="70" r="18" fill="#22c55e" opacity="0.4"/>
    </svg>
  `),

  desertSand: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#9a3412"/>
      <path d="M2 18 C 14 14, 26 22, 38 18 M26 46 C 38 42, 50 50, 62 46" fill="none" stroke="#ea580c" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/>
      <circle cx="12" cy="40" r="1" fill="#fdba74" opacity="0.3"/>
      <circle cx="52" cy="12" r="1.2" fill="#f97316" opacity="0.4"/>
    </svg>
  `),

  volcanicLava: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#450a0a"/>
      <path d="M10 0 Q 30 40, 10 100 M50 0 Q 70 50, 40 100 M90 0 Q 60 60, 90 100" fill="none" stroke="#dc2626" stroke-width="6" opacity="0.9"/>
      <path d="M10 0 Q 30 40, 10 100 M50 0 Q 70 50, 40 100" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <circle cx="25" cy="30" r="3" fill="#fbbf24"/>
      <circle cx="75" cy="70" r="4" fill="#ef4444"/>
    </svg>
  `),

  cyberGrid: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
      <rect width="60" height="60" fill="#0f172a"/>
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0284c7" stroke-width="1.5" opacity="0.6"/>
      <circle cx="0" cy="0" r="3" fill="#38bdf8"/>
      <circle cx="60" cy="60" r="2" fill="#0284c7"/>
    </svg>
  `),

  toxicSludge: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">
      <rect width="90" height="90" fill="#1a2e05"/>
      <circle cx="20" cy="20" r="12" fill="#65a30d" opacity="0.6"/>
      <circle cx="65" cy="55" r="18" fill="#84cc16" opacity="0.5"/>
      <circle cx="30" cy="70" r="8" fill="#a3e635" opacity="0.7"/>
      <circle cx="70" cy="20" r="6" fill="#4d7c0f" opacity="0.8"/>
    </svg>
  `),

  iceSheet: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#0f172a"/>
      <path d="M10 20 L40 30 L80 15 M30 80 L70 60 L90 85" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.7"/>
      <path d="M0 50 L100 50 M50 0 L50 100" fill="none" stroke="#e0f2fe" stroke-width="1" opacity="0.3"/>
    </svg>
  `),

  topographicContour: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" fill="#334155"/>
      <circle cx="60" cy="60" r="50" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,2" opacity="0.5"/>
      <circle cx="60" cy="60" r="35" fill="none" stroke="#cbd5e1" stroke-width="1.5" opacity="0.6"/>
      <circle cx="60" cy="60" r="20" fill="none" stroke="#f8fafc" stroke-width="2" opacity="0.8"/>
    </svg>
  `),

  asphaltRoad: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="#1e293b"/>
      <circle cx="15" cy="20" r="1.5" fill="#475569"/>
      <circle cx="55" cy="45" r="2" fill="#334155"/>
      <circle cx="35" cy="70" r="1.5" fill="#64748b"/>
      <line x1="40" y1="0" x2="40" y2="80" stroke="#fef08a" stroke-width="2" stroke-dasharray="16,12" opacity="0.7"/>
    </svg>
  `),

  metalDecking: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
      <rect width="60" height="60" fill="#334155"/>
      <path d="M 0 0 L 60 60 M 20 0 L 60 40 M 0 20 L 40 60" stroke="#1e293b" stroke-width="2.5" opacity="0.7"/>
      <path d="M 0 60 L 60 0 M 0 40 L 40 0 M 20 60 L 60 20" stroke="#475569" stroke-width="1.5" opacity="0.5"/>
    </svg>
  `),

  chitinHive: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="#365314"/>
      <polygon points="40,10 65,25 65,55 40,70 15,55 15,25" fill="none" stroke="#a3e635" stroke-width="2" opacity="0.6"/>
      <circle cx="40" cy="40" r="12" fill="#65a30d" opacity="0.7"/>
    </svg>
  `),

  crystalSpire: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#3b0764"/>
      <polygon points="30,20 50,5 70,20 60,80 40,80" fill="#a855f7" opacity="0.7"/>
      <polygon points="50,5 70,20 60,80 50,80" fill="#c026d3" opacity="0.8"/>
      <polygon points="10,60 30,40 45,60 35,95 20,95" fill="#e879f9" opacity="0.6"/>
    </svg>
  `)
};

/**
 * PRESET OBJECT SPRITE SVG DATA URLS
 */
export const PRESET_OBJECT_SPRITES = {
  sprawlMegacity: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="20" fill="#0f172a"/>
      <rect x="20" y="40" width="24" height="68" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <rect x="48" y="20" width="32" height="88" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
      <rect x="84" y="52" width="24" height="56" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="64,4 80,20 48,20" fill="#22d3ee"/>
      <circle cx="64" cy="40" r="4" fill="#fef08a"/>
      <circle cx="32" cy="60" r="3" fill="#fef08a"/>
      <circle cx="96" cy="70" r="3" fill="#fef08a"/>
    </svg>
  `),

  terrestrialPlanet: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="planetGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="50%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#030712"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="56" fill="url(#planetGrad)" stroke="#60a5fa" stroke-width="2"/>
      <path d="M30 40 Q 50 20, 80 40 T 110 70" fill="none" stroke="#22c55e" stroke-width="12" opacity="0.7" stroke-linecap="round"/>
      <path d="M20 75 Q 60 95, 90 75" fill="none" stroke="#15803d" stroke-width="10" opacity="0.8" stroke-linecap="round"/>
    </svg>
  `),

  gasGiantPlanet: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="gasGrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="60%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#451a03"/>
        </radialGradient>
      </defs>
      <ellipse cx="64" cy="64" rx="58" ry="40" fill="none" stroke="#f59e0b" stroke-width="6" opacity="0.5" transform="rotate(-15 64 64)"/>
      <circle cx="64" cy="64" r="48" fill="url(#gasGrad)" stroke="#b45309" stroke-width="2"/>
      <path d="M20 50 Q 64 65, 108 50" fill="none" stroke="#ea580c" stroke-width="6" opacity="0.6"/>
      <path d="M18 70 Q 64 85, 110 70" fill="none" stroke="#78350f" stroke-width="5" opacity="0.7"/>
    </svg>
  `),

  spaceStation: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="24" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
      <circle cx="64" cy="64" r="8" fill="#38bdf8"/>
      <rect x="8" y="58" width="112" height="12" fill="#0284c7" rx="4" stroke="#e0f2fe" stroke-width="1.5"/>
      <rect x="58" y="8" width="12" height="112" fill="#0284c7" rx="4" stroke="#e0f2fe" stroke-width="1.5"/>
      <circle cx="16" cy="64" r="6" fill="#f59e0b"/>
      <circle cx="112" cy="64" r="6" fill="#f59e0b"/>
    </svg>
  `),

  starshipArmada: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <path d="M64 12 L96 108 L64 92 L32 108 Z" fill="#0f172a" stroke="#22d3ee" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="64,28 80,88 64,78 48,88" fill="#0284c7"/>
      <circle cx="64" cy="50" r="6" fill="#38bdf8"/>
      <path d="M48 88 L36 104 M80 88 L92 104" stroke="#ef4444" stroke-width="3"/>
    </svg>
  `),

  portalGateway: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="54" fill="none" stroke="#a855f7" stroke-width="10" stroke-dasharray="16,8"/>
      <circle cx="64" cy="64" r="40" fill="#3b0764" stroke="#c026d3" stroke-width="4"/>
      <circle cx="64" cy="64" r="22" fill="#e879f9" opacity="0.8"/>
    </svg>
  `),

  outpostBunker: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <polygon points="64,16 112,44 112,100 16,100 16,44" fill="#334155" stroke="#94a3b8" stroke-width="5" stroke-linejoin="round"/>
      <rect x="44" y="60" width="40" height="40" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
      <circle cx="64" cy="40" r="10" fill="#f59e0b"/>
    </svg>
  `),

  defenseCitadel: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <polygon points="64,10 118,45 98,118 30,118 10,45" fill="#1e293b" stroke="#dc2626" stroke-width="4"/>
      <circle cx="64" cy="64" r="30" fill="#991b1b" stroke="#f87171" stroke-width="3"/>
      <line x1="64" y1="10" x2="64" y2="118" stroke="#ef4444" stroke-width="3"/>
      <line x1="10" y1="45" x2="118" y2="45" stroke="#ef4444" stroke-width="3"/>
    </svg>
  `),

  blackHoleSingularity: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="58" fill="none" stroke="#a855f7" stroke-width="6" opacity="0.6"/>
      <circle cx="64" cy="64" r="44" fill="#020617" stroke="#c026d3" stroke-width="5"/>
      <ellipse cx="64" cy="64" rx="60" ry="16" fill="none" stroke="#f43f5e" stroke-width="4" transform="rotate(-25 64 64)"/>
    </svg>
  `),

  tacticalConsole: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect x="12" y="24" width="104" height="80" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="4"/>
      <rect x="20" y="32" width="88" height="48" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
      <polyline points="28,64 44,44 60,56 76,40 92,60" fill="none" stroke="#fef08a" stroke-width="3"/>
      <circle cx="36" cy="92" r="5" fill="#22c55e"/>
      <circle cx="56" cy="92" r="5" fill="#ef4444"/>
      <circle cx="76" cy="92" r="5" fill="#f59e0b"/>
    </svg>
  `),

  supplyChest: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect x="16" y="32" width="96" height="72" rx="8" fill="#78350f" stroke="#f59e0b" stroke-width="5"/>
      <rect x="16" y="32" width="96" height="24" fill="#b45309" stroke="#f59e0b" stroke-width="3"/>
      <rect x="56" y="48" width="16" height="24" fill="#fef08a" stroke="#d97706" stroke-width="2" rx="3"/>
    </svg>
  `)
};

/**
 * IMAGE CACHE SYSTEM FOR KONVA PATTERNS AND OBJECT SPRITES
 */
const imageCache = new Map();

export const getLoadedImage = (src, onLoadCallback) => {
  if (!src) return null;
  if (imageCache.has(src)) {
    const cached = imageCache.get(src);
    if (cached.complete && typeof onLoadCallback === 'function') {
      onLoadCallback(cached);
    }
    return cached;
  }

  const img = new window.Image();
  imageCache.set(src, img);
  img.src = src;

  img.onload = () => {
    if (typeof onLoadCallback === 'function') {
      onLoadCallback(img);
    }
  };
  return img;
};

/**
 * Fallback helper to resolve a seamless texture URL from color hex code or terrain type ID
 */
export function getTextureUrlFromColor(colorHexOrType) {
  if (!colorHexOrType) return TERRAIN_TEXTURE_PATTERNS.grassland;
  const c = String(colorHexOrType).toLowerCase();
  if (c.includes('ocean') || c.includes('water') || c.includes('river') || c.includes('1e3a8a') || c.includes('0284c7') || c.includes('3b82f6') || c.includes('0369a1') || c.includes('2563eb') || c.includes('38bdf8')) {
    return TERRAIN_TEXTURE_PATTERNS.waterOcean;
  }
  if (c.includes('forest') || c.includes('jungle') || c.includes('052e16') || c.includes('15803d') || c.includes('166534') || c.includes('047857')) {
    return TERRAIN_TEXTURE_PATTERNS.forestCanopy;
  }
  if (c.includes('grass') || c.includes('plains') || c.includes('14532d') || c.includes('16a34a') || c.includes('22c55e') || c.includes('4ade80')) {
    return TERRAIN_TEXTURE_PATTERNS.grassland;
  }
  if (c.includes('desert') || c.includes('sand') || c.includes('beach') || c.includes('savanna') || c.includes('9a3412') || c.includes('ea580c') || c.includes('f97316') || c.includes('d97706')) {
    return TERRAIN_TEXTURE_PATTERNS.desertSand;
  }
  if (c.includes('volcanic') || c.includes('lava') || c.includes('magma') || c.includes('ash') || c.includes('450a0a') || c.includes('dc2626') || c.includes('b91c1c') || c.includes('ef4444')) {
    return TERRAIN_TEXTURE_PATTERNS.volcanicLava;
  }
  if (c.includes('snow') || c.includes('ice') || c.includes('polar') || c.includes('tundra') || c.includes('38bdf8') || c.includes('e0f2fe') || c.includes('67e8f9')) {
    return TERRAIN_TEXTURE_PATTERNS.iceSheet;
  }
  if (c.includes('mountain') || c.includes('crag') || c.includes('rock') || c.includes('hill') || c.includes('475569') || c.includes('64748b') || c.includes('52525b') || c.includes('78350f')) {
    return TERRAIN_TEXTURE_PATTERNS.topographicContour;
  }
  if (c.includes('cyber') || c.includes('scifi') || c.includes('grid') || c.includes('0f172a')) {
    return TERRAIN_TEXTURE_PATTERNS.cyberGrid;
  }
  return TERRAIN_TEXTURE_PATTERNS.grassland;
}
