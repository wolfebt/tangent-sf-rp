/**
 * @file assetVisualFallbacks.ts
 * @description High-fidelity self-contained SVG procedural textures and fallbacks for Tangent SF Assets.
 * Guarantees 100% offline rendering with zero broken images, 404s, or pitch-black boxes.
 */

import type { AssetUnit, AssetCategory } from '../../schemas/assetUnitSchema';

// Helper to convert SVG string to Base64 or URI Data URL
function svgToDataUrl(svgString: string): string {
  const clean = svgString.trim();
  try {
    if (typeof window !== 'undefined' && window.btoa) {
      return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(clean)))}`;
    }
    const maybeBuffer = typeof globalThis !== 'undefined' ? (globalThis as any).Buffer : undefined;
    if (maybeBuffer) {
      return `data:image/svg+xml;base64,${maybeBuffer.from(clean).toString('base64')}`;
    }
  } catch {
    // Fallback URI encoded
  }
  const encoded = encodeURIComponent(clean).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export const CORE_ASSET_SVGS = {
  // 1. Martian Regolith (Red-orange desert dunes & oxide ripples)
  martianRegolith: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="mrBase" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#c2410c"/>
          <stop offset="60%" stop-color="#9a3412"/>
          <stop offset="100%" stop-color="#7c2d12"/>
        </radialGradient>
      </defs>
      <rect width="128" height="128" fill="url(#mrBase)"/>
      <path d="M0 24 Q 32 16, 64 28 T 128 22" fill="none" stroke="#ea580c" stroke-width="3" opacity="0.6" stroke-linecap="round"/>
      <path d="M0 56 Q 40 46, 80 60 T 128 52" fill="none" stroke="#ea580c" stroke-width="2.5" opacity="0.5" stroke-linecap="round"/>
      <path d="M0 88 Q 30 78, 64 92 T 128 84" fill="none" stroke="#ea580c" stroke-width="3" opacity="0.6" stroke-linecap="round"/>
      <path d="M0 114 Q 50 106, 90 120 T 128 112" fill="none" stroke="#fdba74" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>
      <circle cx="28" cy="42" r="2.5" fill="#fdba74" opacity="0.5"/>
      <circle cx="94" cy="74" r="2" fill="#fed7aa" opacity="0.6"/>
      <circle cx="48" cy="102" r="1.5" fill="#f97316" opacity="0.7"/>
      <circle cx="112" cy="38" r="3" fill="#431407" opacity="0.4"/>
      <circle cx="72" cy="14" r="1.8" fill="#fdba74" opacity="0.5"/>
    </svg>
  `),

  // 2. Industrial Metal Deck (Tactical cross-hatch grating & rivets)
  industrialMetalDeck: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#1e293b"/>
      <path d="M 0 0 L 128 128 M 32 0 L 128 96 M 0 32 L 96 128 M 64 0 L 128 64 M 0 64 L 64 128" stroke="#0f172a" stroke-width="3" opacity="0.8"/>
      <path d="M 0 128 L 128 0 M 0 96 L 96 0 M 32 128 L 128 32 M 0 64 L 64 0 M 64 128 L 128 64" stroke="#334155" stroke-width="2" opacity="0.6"/>
      <rect x="4" y="4" width="120" height="120" fill="none" stroke="#475569" stroke-width="2" opacity="0.4" rx="4"/>
      <circle cx="8" cy="8" r="2.5" fill="#94a3b8"/>
      <circle cx="120" cy="8" r="2.5" fill="#94a3b8"/>
      <circle cx="8" cy="120" r="2.5" fill="#94a3b8"/>
      <circle cx="120" cy="120" r="2.5" fill="#94a3b8"/>
      <circle cx="64" cy="64" r="3" fill="#38bdf8" opacity="0.8"/>
    </svg>
  `),

  // 3. Bioluminescent Xenomoss (Organic flesh/moss with glowing spores)
  bioluminescentMoss: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="bioGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#10b981" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#052e16" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="128" height="128" fill="#052e16"/>
      <circle cx="36" cy="40" r="28" fill="#14532d" opacity="0.8"/>
      <circle cx="92" cy="48" r="24" fill="#065f46" opacity="0.75"/>
      <circle cx="60" cy="92" r="32" fill="#166534" opacity="0.85"/>
      <circle cx="36" cy="40" r="16" fill="url(#bioGlow)"/>
      <circle cx="92" cy="48" r="14" fill="url(#bioGlow)"/>
      <circle cx="60" cy="92" r="20" fill="url(#bioGlow)"/>
      <circle cx="36" cy="40" r="4" fill="#67e8f9"/>
      <circle cx="92" cy="48" r="3" fill="#a7f3d0"/>
      <circle cx="60" cy="92" r="5" fill="#6ee7b7"/>
      <circle cx="18" cy="85" r="2" fill="#38bdf8"/>
      <circle cx="108" cy="18" r="2.5" fill="#34d399"/>
    </svg>
  `),

  // 4. Holo Tactical Table (Sci-fi terminal with holo-projection)
  holoTacticalTable: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="24" fill="#0f172a" stroke="#0284c7" stroke-width="4"/>
      <ellipse cx="64" cy="64" rx="46" ry="34" fill="#0369a1" stroke="#38bdf8" stroke-width="2.5"/>
      <ellipse cx="64" cy="64" rx="30" ry="20" fill="#082f49" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="6,3"/>
      <circle cx="64" cy="64" r="8" fill="#22d3ee" opacity="0.9"/>
      <circle cx="48" cy="56" r="3" fill="#facc15"/>
      <circle cx="78" cy="70" r="3.5" fill="#f43f5e"/>
      <line x1="48" y1="56" x2="64" y2="64" stroke="#fef08a" stroke-width="1.5" opacity="0.7"/>
      <line x1="64" y1="64" x2="78" y2="70" stroke="#f43f5e" stroke-width="1.5" opacity="0.7"/>
      <rect x="20" y="104" width="88" height="8" rx="3" fill="#1e293b" stroke="#0284c7" stroke-width="1"/>
    </svg>
  `),

  // 5. Plastisteel Cargo Crate (Reinforced military sci-fi container)
  cargoCrate: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect x="12" y="24" width="104" height="80" rx="10" fill="#334155" stroke="#f59e0b" stroke-width="4"/>
      <rect x="20" y="32" width="88" height="64" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
      <line x1="20" y1="32" x2="108" y2="96" stroke="#f59e0b" stroke-width="3" opacity="0.7"/>
      <line x1="20" y1="96" x2="108" y2="32" stroke="#f59e0b" stroke-width="3" opacity="0.7"/>
      <rect x="52" y="52" width="24" height="24" rx="4" fill="#0f172a" stroke="#facc15" stroke-width="2"/>
      <circle cx="64" cy="64" r="4" fill="#22c55e"/>
      <circle cx="18" cy="30" r="3" fill="#94a3b8"/>
      <circle cx="110" cy="30" r="3" fill="#94a3b8"/>
      <circle cx="18" cy="98" r="3" fill="#94a3b8"/>
      <circle cx="110" cy="98" r="3" fill="#94a3b8"/>
    </svg>
  `),

  // 6. Cyber-Lich Mainframe (AI rack with skull matrix and LED racks)
  cyberLichMainframe: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect x="18" y="10" width="92" height="108" rx="8" fill="#090d16" stroke="#8b5cf6" stroke-width="4"/>
      <rect x="26" y="20" width="76" height="24" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
      <circle cx="36" cy="32" r="3" fill="#22c55e"/>
      <circle cx="46" cy="32" r="3" fill="#22c55e"/>
      <circle cx="56" cy="32" r="3" fill="#f43f5e"/>
      <circle cx="88" cy="32" r="4" fill="#38bdf8"/>
      <rect x="26" y="50" width="76" height="42" fill="#172554" stroke="#06b6d4" stroke-width="2"/>
      <!-- Digital Holographic Visage -->
      <polygon points="64,54 78,64 72,82 56,82 50,64" fill="#3b0764" stroke="#c026d3" stroke-width="2"/>
      <circle cx="58" cy="66" r="3" fill="#22d3ee"/>
      <circle cx="70" cy="66" r="3" fill="#22d3ee"/>
      <rect x="26" y="98" width="76" height="12" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    </svg>
  `),

  // 7. Titanium Blast Bulkhead (Heavy door hatch with hazard chevrons)
  blastBulkhead: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect x="8" y="8" width="112" height="112" rx="12" fill="#1e293b" stroke="#94a3b8" stroke-width="5"/>
      <rect x="20" y="20" width="88" height="88" fill="#0f172a" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="64" y1="20" x2="64" y2="108" stroke="#38bdf8" stroke-width="4"/>
      <circle cx="64" cy="64" r="16" fill="#334155" stroke="#f59e0b" stroke-width="3"/>
      <circle cx="64" cy="64" r="6" fill="#facc15"/>
      <!-- Hazard warning tabs -->
      <rect x="24" y="24" width="20" height="6" fill="#eab308"/>
      <rect x="84" y="24" width="20" height="6" fill="#eab308"/>
      <rect x="24" y="98" width="20" height="6" fill="#eab308"/>
      <rect x="84" y="98" width="20" height="6" fill="#eab308"/>
    </svg>
  `),

  // 8. Superheated Plasma Leak (Volcanic fissure with crackling discharge)
  plasmaLeak: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="plasmaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#facc15"/>
          <stop offset="70%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#18181b"/>
        </radialGradient>
      </defs>
      <rect width="128" height="128" fill="#18181b"/>
      <ellipse cx="64" cy="64" rx="52" ry="40" fill="url(#plasmaGlow)"/>
      <path d="M16 64 Q 40 40, 64 64 T 112 64" fill="none" stroke="#67e8f9" stroke-width="4" opacity="0.9"/>
      <path d="M64 16 Q 80 40, 64 64 T 64 112" fill="none" stroke="#fef08a" stroke-width="3.5" opacity="0.8"/>
      <circle cx="64" cy="64" r="10" fill="#ffffff"/>
      <circle cx="36" cy="50" r="3" fill="#f97316"/>
      <circle cx="90" cy="74" r="3.5" fill="#f43f5e"/>
    </svg>
  `),

  // 9. Bipedal Titan Mech (Heavy assault combat walker)
  titanMech: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <!-- Torso Chassis -->
      <polygon points="64,16 92,34 84,72 44,72 36,34" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
      <!-- Cockpit Visor -->
      <polygon points="52,38 76,38 72,50 56,50" fill="#22d3ee" stroke="#e0f2fe" stroke-width="1.5"/>
      <!-- Left Cannon -->
      <rect x="18" y="30" width="18" height="42" rx="4" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
      <line x1="27" y1="72" x2="27" y2="88" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
      <!-- Right Cannon -->
      <rect x="92" y="30" width="18" height="42" rx="4" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
      <line x1="101" y1="72" x2="101" y2="88" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
      <!-- Bipedal Legs -->
      <polygon points="44,72 36,104 26,114 48,114 48,96 52,72" fill="#334155" stroke="#64748b" stroke-width="2"/>
      <polygon points="84,72 92,104 102,114 80,114 80,96 76,72" fill="#334155" stroke="#64748b" stroke-width="2"/>
      <circle cx="64" cy="24" r="4" fill="#facc15"/>
    </svg>
  `),

  // 10. Cyber-Lich Avatar (Transcendent eldritch skull avatar)
  cyberLichAvatar: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="lichAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#a855f7" stop-opacity="0.8"/>
          <stop offset="60%" stop-color="#3b0764" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="56" fill="url(#lichAura)"/>
      <circle cx="64" cy="64" r="48" fill="none" stroke="#c026d3" stroke-width="2" stroke-dasharray="8,4"/>
      <!-- Floating Skull -->
      <ellipse cx="64" cy="56" rx="26" ry="24" fill="#090d16" stroke="#22d3ee" stroke-width="3"/>
      <rect x="52" y="70" width="24" height="16" fill="#090d16" stroke="#22d3ee" stroke-width="2"/>
      <!-- Eyes -->
      <circle cx="54" cy="54" r="5" fill="#22d3ee"/>
      <circle cx="74" cy="54" r="5" fill="#22d3ee"/>
      <circle cx="54" cy="54" r="2" fill="#ffffff"/>
      <circle cx="74" cy="54" r="2" fill="#ffffff"/>
      <!-- Matrix Data runes -->
      <path d="M40 30 L48 20 M88 30 L80 20 M64 14 L64 24" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/>
      <circle cx="64" cy="98" r="6" fill="#f43f5e" opacity="0.8"/>
    </svg>
  `)
};

/**
 * Mapping of seed unit IDs to canonical high-res SVG textures
 */
export const SEED_TEXTURE_MAP: Record<string, string> = {
  ter_martian_regolith: CORE_ASSET_SVGS.martianRegolith,
  ter_industrial_metal_deck: CORE_ASSET_SVGS.industrialMetalDeck,
  ter_bioluminescent_moss: CORE_ASSET_SVGS.bioluminescentMoss,
  prop_holo_tactical_table: CORE_ASSET_SVGS.holoTacticalTable,
  prop_plastisteel_cargo_crate: CORE_ASSET_SVGS.cargoCrate,
  prop_cyber_lich_mainframe: CORE_ASSET_SVGS.cyberLichMainframe,
  wall_titanium_blast_bulkhead: CORE_ASSET_SVGS.blastBulkhead,
  hazard_superheated_plasma_leak: CORE_ASSET_SVGS.plasmaLeak,
  veh_bipedal_titan_mech: CORE_ASSET_SVGS.titanMech,
  creature_cyber_lich_avatar: CORE_ASSET_SVGS.cyberLichAvatar
};

export interface TexturePresetOption {
  id: string;
  name: string;
  category: AssetCategory;
  dataUrl: string;
}

export const TEXTURE_PRESET_LIBRARY: TexturePresetOption[] = [
  { id: 'martian_regolith', name: 'Martian Regolith', category: 'terrain_brush', dataUrl: CORE_ASSET_SVGS.martianRegolith },
  { id: 'metal_deck', name: 'Industrial Deck Grating', category: 'terrain_brush', dataUrl: CORE_ASSET_SVGS.industrialMetalDeck },
  { id: 'bio_moss', name: 'Bioluminescent Moss', category: 'terrain_brush', dataUrl: CORE_ASSET_SVGS.bioluminescentMoss },
  { id: 'holo_table', name: 'Holo Tactical Console', category: 'doodad', dataUrl: CORE_ASSET_SVGS.holoTacticalTable },
  { id: 'cargo_crate', name: 'Cargo Crate', category: 'doodad', dataUrl: CORE_ASSET_SVGS.cargoCrate },
  { id: 'lich_mainframe', name: 'Mainframe Server', category: 'doodad', dataUrl: CORE_ASSET_SVGS.cyberLichMainframe },
  { id: 'blast_door', name: 'Titanium Blast Bulkhead', category: 'wall_portal', dataUrl: CORE_ASSET_SVGS.blastBulkhead },
  { id: 'plasma_leak', name: 'Plasma Vent Hazard', category: 'hazard', dataUrl: CORE_ASSET_SVGS.plasmaLeak },
  { id: 'titan_mech', name: 'Bipedal Titan Mech', category: 'vehicle', dataUrl: CORE_ASSET_SVGS.titanMech },
  { id: 'cyber_lich', name: 'Cyber-Lich Avatar', category: 'token', dataUrl: CORE_ASSET_SVGS.cyberLichAvatar }
];

/**
 * Fallback resolution logic: Inspects unit metadata and guarantees a valid texture URL.
 */
export function getAssetVisualFallback(unit?: Partial<AssetUnit> | null): string {
  if (!unit) return CORE_ASSET_SVGS.industrialMetalDeck;

  // 1. Direct seed ID match
  if (unit.unit_id && SEED_TEXTURE_MAP[unit.unit_id]) {
    return SEED_TEXTURE_MAP[unit.unit_id];
  }

  const query = `${unit.name || ''} ${unit.unit_id || ''} ${unit.tags?.join(' ') || ''} ${unit.tree_path?.join(' ') || ''}`.toLowerCase();

  // 2. Keyword heuristic
  if (query.includes('martian') || query.includes('desert') || query.includes('sand') || query.includes('regolith')) {
    return CORE_ASSET_SVGS.martianRegolith;
  }
  if (query.includes('metal') || query.includes('deck') || query.includes('hull') || query.includes('industrial') || query.includes('steel')) {
    return CORE_ASSET_SVGS.industrialMetalDeck;
  }
  if (query.includes('moss') || query.includes('bio') || query.includes('xeno') || query.includes('flesh') || query.includes('spore')) {
    return CORE_ASSET_SVGS.bioluminescentMoss;
  }
  if (query.includes('holo') || query.includes('table') || query.includes('terminal') || query.includes('console')) {
    return CORE_ASSET_SVGS.holoTacticalTable;
  }
  if (query.includes('crate') || query.includes('cargo') || query.includes('chest') || query.includes('box')) {
    return CORE_ASSET_SVGS.cargoCrate;
  }
  if (query.includes('server') || query.includes('mainframe') || query.includes('node') || query.includes('lich')) {
    return CORE_ASSET_SVGS.cyberLichMainframe;
  }
  if (query.includes('bulkhead') || query.includes('wall') || query.includes('door') || query.includes('portal')) {
    return CORE_ASSET_SVGS.blastBulkhead;
  }
  if (query.includes('plasma') || query.includes('lava') || query.includes('hazard') || query.includes('leak') || query.includes('fire')) {
    return CORE_ASSET_SVGS.plasmaLeak;
  }
  if (query.includes('mech') || query.includes('vehicle') || query.includes('tank') || query.includes('ship')) {
    return CORE_ASSET_SVGS.titanMech;
  }
  if (query.includes('token') || query.includes('creature') || query.includes('avatar') || query.includes('npc')) {
    return CORE_ASSET_SVGS.cyberLichAvatar;
  }

  // 3. Category Fallback
  switch (unit.category) {
    case 'terrain_brush':
      return CORE_ASSET_SVGS.industrialMetalDeck;
    case 'doodad':
      return CORE_ASSET_SVGS.cargoCrate;
    case 'wall_portal':
      return CORE_ASSET_SVGS.blastBulkhead;
    case 'hazard':
      return CORE_ASSET_SVGS.plasmaLeak;
    case 'vehicle':
      return CORE_ASSET_SVGS.titanMech;
    case 'creature':
    case 'token':
    default:
      return CORE_ASSET_SVGS.cyberLichAvatar;
  }
}

/**
 * Resolves a reliable image URL for an asset. If the declared baseTexture is missing
 * or known to be a placeholder/broken, returns the safe SVG fallback.
 */
export function resolveAssetTexture(unit?: Partial<AssetUnit> | null): string {
  if (!unit) return CORE_ASSET_SVGS.industrialMetalDeck;

  const base = unit.visuals?.baseTexture?.trim();
  const thumb = unit.visuals?.thumbnail?.trim();

  // If already an inline data URI (SVG, PNG, etc.), trust it
  if (base && base.startsWith('data:')) return base;
  if (thumb && thumb.startsWith('data:')) return thumb;

  // If pointing to non-existent /assets/ seed path, substitute canonical SVG
  if (unit.unit_id && SEED_TEXTURE_MAP[unit.unit_id]) {
    return SEED_TEXTURE_MAP[unit.unit_id];
  }

  // If a valid non-empty string that isn't a known broken seed path
  if (base && !base.startsWith('/assets/textures/') && !base.startsWith('/assets/props/') && !base.startsWith('/assets/walls/') && !base.startsWith('/assets/hazards/') && !base.startsWith('/assets/vehicles/') && !base.startsWith('/assets/tokens/')) {
    return base;
  }

  return getAssetVisualFallback(unit);
}
