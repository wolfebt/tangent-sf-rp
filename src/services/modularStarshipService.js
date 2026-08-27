/**
 * TANGENT SFF RP: Modular Starship & Mecha Hardpoint Forge Service
 * Manages hull chassis, reactor energy budgets, weapon hardpoints, subsystem modulators, and vessel telemetry.
 */

export const CANONICAL_CHASSIS = [
  {
    id: 'scout_sloop_100',
    name: 'Scout Sloop (100 Tons)',
    category: 'Starship',
    tonnage: 100,
    baseHullSp: 40,
    baseArmorDr: 2,
    baseDefenseDc: 14,
    baseSpeed: 5,
    maxHardpoints: 2,
    reactorOutputMw: 60,
    baseCost: 250000,
    crewRequired: 2,
    description: 'Fast, agile courier vessel suited for deep-space recon, smuggling, and VIP transport.'
  },
  {
    id: 'strike_corvette_200',
    name: 'Strike Corvette (200 Tons)',
    category: 'Starship',
    tonnage: 200,
    baseHullSp: 80,
    baseArmorDr: 4,
    baseDefenseDc: 12,
    baseSpeed: 4,
    maxHardpoints: 4,
    reactorOutputMw: 110,
    baseCost: 650000,
    crewRequired: 6,
    description: 'Multi-role patrol gunship equipped with dedicated fire control and defensive turret mounts.'
  },
  {
    id: 'combat_frigate_400',
    name: 'Heavy Combat Frigate (400 Tons)',
    category: 'Starship',
    tonnage: 400,
    baseHullSp: 160,
    baseArmorDr: 6,
    baseDefenseDc: 10,
    baseSpeed: 3,
    maxHardpoints: 6,
    reactorOutputMw: 220,
    baseCost: 1800000,
    crewRequired: 15,
    description: 'Heavily armored line combatant featuring spinal weaponry and multi-vector deflector barriers.'
  },
  {
    id: 'apex_assault_mech_s5',
    name: 'Apex Assault Frame (Size 5 Mecha)',
    category: 'Mecha / Assault Frame',
    tonnage: 35,
    baseHullSp: 60,
    baseArmorDr: 5,
    baseDefenseDc: 13,
    baseSpeed: 6,
    maxHardpoints: 3,
    reactorOutputMw: 50,
    baseCost: 180000,
    crewRequired: 1,
    description: 'Bipedal heavy combat chassis designed for high-mobility surface and boarding operations.'
  }
];

export const CANONICAL_HARDPOINTS = [
  {
    id: 'spinal_particle_lance',
    name: 'Spinal Particle Lance',
    icon: '⚡',
    category: 'Energy Spinal',
    energyMw: 35,
    damageDice: '4d10+10',
    avgDamage: 32,
    range: 'Long / Extreme',
    cost: 120000,
    traits: ['Armor-Piercing', 'Spinal Mount']
  },
  {
    id: 'twin_turbo_laser',
    name: 'Twin Heavy Turbo-Laser Turret',
    icon: '🔴',
    category: 'Energy Turret',
    energyMw: 20,
    damageDice: '3d10+6',
    avgDamage: 22,
    range: 'Medium / Long',
    cost: 65000,
    traits: ['Rapid Fire', 'Thermal Melt']
  },
  {
    id: 'vls_torpedo_bay',
    name: 'VLS Proton Torpedo Silo',
    icon: '🚀',
    category: 'Kinetic Ordnance',
    energyMw: 10,
    damageDice: '5d10+15',
    avgDamage: 42,
    range: 'Extreme',
    cost: 95000,
    traits: ['Concussive Blast', 'Ammo-Dependent']
  },
  {
    id: 'pd_rotary_railgun',
    name: 'Point-Defense Rotary Railgun',
    icon: '🎯',
    category: 'Kinetic PD',
    energyMw: 8,
    damageDice: '2d10+4',
    avgDamage: 15,
    range: 'Point-Blank / Short',
    cost: 35000,
    traits: ['Anti-Missile Intercept', 'Shredding']
  },
  {
    id: 'plasma_scatter_cannon',
    name: 'Heavy Plasma Scatter Cannon',
    icon: '🔥',
    category: 'Plasma Blast',
    energyMw: 15,
    damageDice: '3d8+5',
    avgDamage: 18,
    range: 'Short / Medium',
    cost: 48000,
    traits: ['Overblast AoE', 'Shield Drain']
  }
];

export const CANONICAL_SUBSYSTEMS = [
  {
    id: 'deflector_shields',
    name: 'Deflector Shield Emitter Mk-IV',
    icon: '🛡️',
    energyMw: 25,
    shieldSp: 30,
    cost: 75000,
    description: 'Generates an energy barrier absorbing 30 SP before hull damage is sustained.'
  },
  {
    id: 'ecm_ghost_suite',
    name: 'ECM Ghost Sensor Jammer',
    icon: '📡',
    energyMw: 15,
    defenseBonus: 2,
    cost: 45000,
    description: 'Blinds enemy tracking sensors, granting +2 Defense DC.'
  },
  {
    id: 'hyperdrive_core_mk3',
    name: 'Hyperdrive Jump Core Mk-III',
    icon: '🌌',
    energyMw: 30,
    jumpRating: 3,
    cost: 150000,
    description: 'Enables interstellar transit up to 3 parsecs per hyper-jump.'
  },
  {
    id: 'reinforced_armor_plating',
    name: 'Reactive Composite Armor Plating',
    icon: '🧱',
    energyMw: 0,
    armorDrBonus: 2,
    hullSpBonus: 20,
    cost: 50000,
    description: 'Bolsters hull integrity point-for-point (+2 DR, +20 Hull SP).'
  },
  {
    id: 'fire_control_targeting',
    name: 'Advanced Fire-Control Array',
    icon: '🎯',
    energyMw: 10,
    attackBonus: 2,
    cost: 40000,
    description: 'Optical AI predictive targeting granting +2 Attack to all weapon hardpoints.'
  }
];

export const getCanonicalChassis = () => CANONICAL_CHASSIS;
export const getCanonicalHardpointWeapons = () => CANONICAL_HARDPOINTS;
export const getCanonicalSubsystems = () => CANONICAL_SUBSYSTEMS;

/**
 * Computes complete telemetry for a customized starship or mecha frame.
 */
export const computeVesselStats = (chassisId = 'strike_corvette_200', installedHardpointIds = [], installedSubsystemIds = []) => {
  const chassis = CANONICAL_CHASSIS.find(c => c.id === chassisId) || CANONICAL_CHASSIS[1];

  const hardpoints = installedHardpointIds
    .map(id => CANONICAL_HARDPOINTS.find(h => h.id === id))
    .filter(Boolean);

  const subsystems = installedSubsystemIds
    .map(id => CANONICAL_SUBSYSTEMS.find(s => s.id === id))
    .filter(Boolean);

  let totalEnergyUsedMw = 0;
  let totalCostCredits = chassis.baseCost;
  let totalShieldSp = 0;
  let totalArmorDr = chassis.baseArmorDr;
  let totalHullSp = chassis.baseHullSp;
  let effectiveDefenseDc = chassis.baseDefenseDc;
  let attackBonus = 0;
  let jumpRating = 0;

  hardpoints.forEach(h => {
    totalEnergyUsedMw += h.energyMw;
    totalCostCredits += h.cost;
  });

  subsystems.forEach(s => {
    totalEnergyUsedMw += s.energyMw;
    totalCostCredits += s.cost;
    if (s.shieldSp) totalShieldSp += s.shieldSp;
    if (s.defenseBonus) effectiveDefenseDc += s.defenseBonus;
    if (s.armorDrBonus) totalArmorDr += s.armorDrBonus;
    if (s.hullSpBonus) totalHullSp += s.hullSpBonus;
    if (s.attackBonus) attackBonus += s.attackBonus;
    if (s.jumpRating) jumpRating = Math.max(jumpRating, s.jumpRating);
  });

  const isPowerDeficit = totalEnergyUsedMw > chassis.reactorOutputMw;
  const powerMarginMw = chassis.reactorOutputMw - totalEnergyUsedMw;

  return {
    chassis,
    hardpoints,
    subsystems,
    totalEnergyUsedMw,
    maxReactorOutputMw: chassis.reactorOutputMw,
    powerMarginMw,
    isPowerDeficit,
    totalHullSp,
    totalShieldSp,
    totalArmorDr,
    effectiveDefenseDc,
    attackBonus,
    jumpRating,
    totalCostCredits,
    hardpointSlotsUsed: hardpoints.length,
    maxHardpoints: chassis.maxHardpoints
  };
};
