/**
 * TANGENT SFF RP: Interactive Galaxy Sector & Planetary Starmap Service
 * Generates procedural star systems, UWP world profiles, hyperspace jump lanes, and navigation routing.
 */

export const CANONICAL_SECTORS = [
  {
    id: 'hyperion_core',
    name: 'Hyperion Core Sector',
    securityLevel: 'High Security (Law 8)',
    dominantFaction: 'TSC Sovereign Directorate',
    description: 'The industrial beating heart of civilization, boasting orbital shipyards, mega-arcologies, and heavily patrolled jump corridors.'
  },
  {
    id: 'outer_fringe_veil',
    name: 'Outer Fringe Veil',
    securityLevel: 'Low Security / Lawless (Law 2)',
    dominantFaction: 'Free Smuggler Syndicate',
    description: 'A perilous nebula borderland teeming with asteroid pirate havens, black-market salvage yards, and untamed frontier colonies.'
  },
  {
    id: 'perseus_expanse',
    name: 'Perseus Rift Expanse',
    securityLevel: 'Contested Zone (Law 4)',
    dominantFaction: 'Mega-Corpo Consortium',
    description: 'A resource-dense expanse rich in rare hyper-matter deposits and precursor ruins, constantly contested by corporate strike fleets.'
  }
];

export const STAR_TYPES = [
  { type: 'Yellow Dwarf (G-Type)', color: '#fbbf24', size: 1.0, habitability: 'High' },
  { type: 'Red Dwarf (M-Type)', color: '#f87171', size: 0.7, habitability: 'Moderate' },
  { type: 'Blue Giant (O-Type)', color: '#60a5fa', size: 1.5, habitability: 'Low / Harsh' },
  { type: 'Binary Pair', color: '#c084fc', size: 1.3, habitability: 'Unstable' },
  { type: 'Neutron Star / Pulsar', color: '#2dd4bf', size: 0.5, habitability: 'Lethal Radiation' }
];

export const CANONICAL_POIS = [
  'Orbital Heavy Drydocks & Refueling Rig',
  'Sub-Surface Deep Core Mining Outpost',
  'Ancient Precursor Monolith & Vault',
  'Megacorp Cybernetics Research Spire',
  'Black-Market Smuggler Asteroid Haven',
  'Automated Military Defense Fortress',
  'Agricultural Hydro-Dome Archipelago'
];

/**
 * Generates an 8x6 parsec sector grid with 8–12 star systems.
 */
export const generateSectorStarmap = (sectorId = 'hyperion_core', seed = 42) => {
  const sector = CANONICAL_SECTORS.find(s => s.id === sectorId) || CANONICAL_SECTORS[0];

  const systemNames = [
    'Helios Prime', 'Vanguard Station', 'Cerberus-7', 'Astraea IV', 'Onyx Void',
    'Hyperion Alpha', 'Titan Reach', 'Nova Arcadia', 'Perseus Outpost', 'Kryptos Minor'
  ];

  const systems = systemNames.map((name, index) => {
    const gridX = (index % 4) * 2 + 1 + ((index * 3) % 2);
    const gridY = Math.floor(index / 4) * 2 + 1 + ((index * 2) % 2);
    const starType = STAR_TYPES[index % STAR_TYPES.length];

    const size = (index * 2 + 3) % 10;
    const atmos = (index * 3 + 4) % 12;
    const hydro = (index * 2 + 2) % 10;
    const pop = (index * 2 + 5) % 11;
    const gov = (index + 3) % 9;
    const law = Math.max(1, (index + 4) % 9);
    const tl = 8 + (index % 6);

    const portLetter = ['A', 'B', 'C', 'D', 'E'][(index + 1) % 5];
    const uwp = `${portLetter}${size.toString(16).toUpperCase()}${atmos.toString(16).toUpperCase()}${hydro.toString(16).toUpperCase()}${pop.toString(16).toUpperCase()}${gov.toString(16).toUpperCase()}${law.toString(16).toUpperCase()}-${tl}`;

    const tradeCodes = [];
    if (atmos >= 4 && atmos <= 9 && hydro >= 4 && pop >= 5) tradeCodes.push('Agri');
    if (pop >= 8) tradeCodes.push('High-Pop');
    if (tl >= 12) tradeCodes.push('High-Tech');
    if (size === 0 || atmos === 0) tradeCodes.push('Asteroid/Vacuum');
    if (tradeCodes.length === 0) tradeCodes.push('Industrial');

    return {
      id: `sys_${index + 1}`,
      name,
      gridX,
      gridY,
      starType: starType.type,
      starColor: starType.color,
      starSize: starType.size,
      uwp,
      starport: portLetter,
      techLevel: tl,
      tradeCodes: tradeCodes.join(', '),
      poi: CANONICAL_POIS[index % CANONICAL_POIS.length],
      faction: index % 3 === 0 ? 'TSC Sovereign Directorate' : index % 3 === 1 ? 'Corpo Consortium' : 'Free Outlaws'
    };
  });

  // Generate jump lanes (connections between systems within distance <= 3 parsecs)
  const jumpLanes = [];
  for (let i = 0; i < systems.length; i++) {
    for (let j = i + 1; j < systems.length; j++) {
      const dist = Math.hypot(systems[i].gridX - systems[j].gridX, systems[i].gridY - systems[j].gridY);
      if (dist <= 3.2) {
        jumpLanes.push({
          id: `lane_${systems[i].id}_${systems[j].id}`,
          fromId: systems[i].id,
          toId: systems[j].id,
          distanceParsecs: Math.max(1, Math.round(dist))
        });
      }
    }
  }

  return {
    sector,
    systems,
    jumpLanes
  };
};

/**
 * Computes hyperspace jump requirements between two systems.
 */
export const calculateHyperspaceJumpRoute = (originSystem, destSystem, jumpDriveRating = 2) => {
  if (!originSystem || !destSystem) return null;

  const dx = originSystem.gridX - destSystem.gridX;
  const dy = originSystem.gridY - destSystem.gridY;
  const distance = Math.hypot(dx, dy);
  const distanceParsecs = Math.max(1, Math.round(distance));

  const isReachable = distanceParsecs <= jumpDriveRating;
  const fuelTonsRequired = distanceParsecs * 10; // 10% of ship hull per jump parsec
  const travelDays = distanceParsecs * 2; // 2 days in hyper-space per parsec

  return {
    originName: originSystem.name,
    destName: destSystem.name,
    distanceParsecs,
    isReachable,
    jumpDriveRating,
    fuelTonsRequired,
    travelDays,
    navigationDc: 10 + distanceParsecs * 2
  };
};
