/**
 * @file atmosphericPresets.js
 * @description Master Atmospheric & Weather Presets for ADE Studio.
 * Provides mechanical modifiers, sensory cues, and atmospheric conditions
 * for VTT stages and AIME sensory flavor layer grounding.
 */

export const ATMOSPHERIC_PRESETS = [
  {
    id: 'deep_space_vacuum',
    name: 'Deep Space Vacuum',
    icon: '🌌',
    category: 'Orbital',
    tint: '#020617',
    fogDensity: 0.05,
    audioProfile: 'vacuum_drone',
    sensoryAudio: 'Absolute void silence broken only by the rhythmic hum of internal suit rebreathers.',
    visualFX: 'Starfields glare without atmospheric diffusion against pitch-black bulkheads.',
    description: 'Zero atmosphere, total silence outside suit audio, micro-gravity drift.',
    modifiers: { attackMod: -1, defenseMod: 1, speedMod: -5, techMod: 0 },
    rule: 'Unsealed suits take 10 Void damage/round. Sound-based perception checks fail.'
  },
  {
    id: 'reactor_amber_alert',
    name: 'Reactor Amber Alert',
    icon: '⚠️',
    category: 'Industrial',
    tint: '#d97706',
    fogDensity: 0.35,
    audioProfile: 'amber_klaxon',
    sensoryAudio: 'Pulsing klaxons and pressurized coolant steam hissing violently from containment manifolds.',
    visualFX: 'Strobing amber emergency beacons casting long rhythmic shadows across grated catwalks.',
    description: 'Emergency containment breach, strobing amber beacons, coolant steam venting.',
    modifiers: { attackMod: 0, defenseMod: 0, speedMod: 0, techMod: -2 },
    rule: 'Radiation buildup: CON DC 13 every 3 rounds or gain 1 Rad Condition.'
  },
  {
    id: 'corrosive_acid_rain',
    name: 'Corrosive Acid Rain',
    icon: '🌧️',
    category: 'Exo-Planet',
    tint: '#84cc16',
    fogDensity: 0.5,
    audioProfile: 'heavy_hissing_rain',
    sensoryAudio: 'Sizzling precipitation eating into exterior plating with a noxious sulfur stench.',
    visualFX: 'Yellow-green chemical fog obscuring thermal optics beyond short range.',
    description: 'Atmospheric acid precipitation dissolves exterior armor and obscures optic sensors.',
    modifiers: { attackMod: -2, defenseMod: -1, speedMod: -5, techMod: -1 },
    rule: 'Optic range capped at 60ft. Non-hardened armor loses 1 Armor point per 5 rounds exposed.'
  },
  {
    id: 'cyberpunk_neon_rain',
    name: 'Cyberpunk Neon Rain',
    icon: '🏙️',
    category: 'Megacity',
    tint: '#06b6d4',
    fogDensity: 0.25,
    audioProfile: 'city_hum_rain',
    sensoryAudio: 'Steady patter of rain on slick plascrete mixed with distant hover-traffic rumble and synth music.',
    visualFX: 'Glistening wet asphalt reflecting polychromatic neon holoboards through misty downpours.',
    description: 'Damp asphalt reflections, holographic advertisements bleeding through mist.',
    modifiers: { attackMod: 0, defenseMod: 1, speedMod: 0, techMod: 1 },
    rule: 'High electronic density: +1 to Cyber and Hacking checks. Stealth +2 in shadow pockets.'
  },
  {
    id: 'geothermal_inferno',
    name: 'Geothermal Sub-Vent',
    icon: '🌋',
    category: 'Planetary',
    tint: '#e11d48',
    fogDensity: 0.4,
    audioProfile: 'volcanic_rumble',
    sensoryAudio: 'Deep sub-surface seismic grinding accompanied by explosive geyser bursts of superheated vapor.',
    visualFX: 'Crimson incandescent magma fissures causing shimmering heat haze across the terrain.',
    description: 'Superheated magma trenches, seismic tremors, thermal distortion plumes.',
    modifiers: { attackMod: -1, defenseMod: 0, speedMod: -10, techMod: -2 },
    rule: 'Extreme heat: STAMINA check DC 14 every round or suffer Heat Exhaustion.'
  },
  {
    id: 'solar_flare_radiation',
    name: 'Solar Flare / Ion Storm',
    icon: '☀️',
    category: 'Stellar',
    tint: '#f59e0b',
    fogDensity: 0.2,
    audioProfile: 'ion_static_crackle',
    sensoryAudio: 'High-frequency electromagnetic static buzzing directly in audio implants.',
    visualFX: 'Curtains of shifting auroral light dancing across shields with sparks leaping from metallic nodes.',
    sensorPenalty: -3,
    description: 'Intense coronal mass ejection triggering severe sensor interference and communications blackout.',
    modifiers: { attackMod: -1, defenseMod: 0, speedMod: 0, techMod: -3 },
    rule: 'Comms blackout beyond 100 meters. Energy shields lose 2 capacity per round.'
  }
];
