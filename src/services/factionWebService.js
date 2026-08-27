/**
 * TANGENT SFF RP: Faction Relational Web & Party Heat Engine Service
 * Manages inter-faction diplomatic webs, bilateral rivalries, party reputation, and 0–5 star heat ratings.
 */

export const CANONICAL_FACTIONS = [
  {
    id: 'tsc_directorate',
    name: 'TSC Sovereign Directorate',
    shortName: 'TSC Military',
    icon: '🏛️',
    color: '#3b82f6',
    type: 'Central Planetary Government',
    lawLevel: 8,
    homeSystem: 'Helios Prime',
    assets: 'Battlecruiser Fleets, Sub-Orbital Arcologies, Marine Corps',
    description: 'The authoritarian interstellar governing body enforcing trade laws, orbital customs, and military garrisons.'
  },
  {
    id: 'hyperion_consortium',
    name: 'Hyperion Megacorp Consortium',
    shortName: 'Hyperion Corp',
    icon: '🏢',
    color: '#f59e0b',
    type: 'Cybernetics & Arms Conglomerate',
    lawLevel: 6,
    homeSystem: 'Hyperion Alpha',
    assets: 'Private PMC Enforcers, Automated Drone Fabs, R&D Spire',
    description: 'A ruthless technological megacorporation controlling military hardware patents and deep-core mining concessions.'
  },
  {
    id: 'smuggler_syndicate',
    name: 'The Free Shadow Syndicate',
    shortName: 'Shadow Syndicate',
    icon: '🕶️',
    color: '#8b5cf6',
    type: 'Underworld Cartel & Fixers',
    lawLevel: 2,
    homeSystem: 'Onyx Void',
    assets: 'Black-Market Asteroid Havens, Blockade Runners, Netrunners',
    description: 'A decentralized network of smugglers, info-brokers, and outlaws operating in the lawless shadows.'
  },
  {
    id: 'astraea_synthetics',
    name: 'Astraea Synth Emancipation League',
    shortName: 'Astraea Synths',
    icon: '🤖',
    color: '#06b6d4',
    type: 'Sentient Android Enclave',
    lawLevel: 5,
    homeSystem: 'Astraea IV',
    assets: 'Neural Array Mainframe, Deep-Space Fabricators, Cyber-ICE',
    description: 'An independent collective of awakened AI and synthetic beings fighting for sentient civil rights.'
  },
  {
    id: 'kitin_hive_swarm',
    name: 'Kitin Bio-Chitin Swarm',
    shortName: 'Kitin Swarm',
    icon: '🦗',
    color: '#ef4444',
    type: 'Extraterrestrial Bio-Collective',
    lawLevel: 0,
    homeSystem: 'Cerberus-7',
    assets: 'Chitinous Hive Ships, Bio-Plasma Bio-Drones, Acid Harvesters',
    description: 'A terrifying organic swarm consuming raw biomass and minerals to expand their hive empire across the stars.'
  }
];

export const CANONICAL_RELATIONSHIPS = [
  { from: 'tsc_directorate', to: 'hyperion_consortium', status: 'allied', label: 'Commercial Contract Alliance', color: '#22c55e' },
  { from: 'tsc_directorate', to: 'smuggler_syndicate', status: 'hostile', label: 'Anti-Smuggling War', color: '#ef4444' },
  { from: 'tsc_directorate', to: 'kitin_hive_swarm', status: 'war', label: 'Total War / Extermination', color: '#dc2626' },
  { from: 'hyperion_consortium', to: 'astraea_synthetics', status: 'hostile', label: 'IP Property Dispute / Hostile', color: '#ef4444' },
  { from: 'smuggler_syndicate', to: 'astraea_synthetics', status: 'friendly', label: 'Black-Market Hardware Trade', color: '#38bdf8' }
];

export const HEAT_LEVELS = [
  { level: 0, stars: '☆☆☆☆☆', label: 'Ghost Operatives', color: '#22c55e', description: 'Zero law enforcement profile. Standard customs clearance.' },
  { level: 1, stars: '★☆☆☆☆', label: 'Local Security Alert', color: '#84cc16', description: 'Minor planetary security watch. Routine identification scans.' },
  { level: 2, stars: '★★☆☆☆', label: 'Under Active Investigation', color: '#f59e0b', description: 'Port security checkpoints active. +2 DC to social bluffs with law officers.' },
  { level: 3, stars: '★★★☆☆', label: 'Bounty Hunter Dispatch', color: '#f97316', description: 'Bounties posted across underworld hubs. Expect ambushes in lawless sectors.' },
  { level: 4, stars: '★★★★☆', label: 'Corporate Kill-Teams', color: '#ef4444', description: 'Military Black-Ops squads tracking party coordinates. Starport lockdown upon arrival.' },
  { level: 5, stars: '★★★★★', label: 'Apex Sovereign Threat', color: '#dc2626', description: 'Orbital strike authorization active. Full military fleets mobilize on sight.' }
];

export const getCanonicalFactions = () => CANONICAL_FACTIONS;
export const getCanonicalRelationships = () => CANONICAL_RELATIONSHIPS;

export const getHeatDefinition = (level = 0) => {
  const clamped = Math.max(0, Math.min(5, level));
  return HEAT_LEVELS[clamped];
};

/**
 * Adjusts party reputation with a specific faction (-3 to +3).
 */
export const adjustPartyReputation = (currentRep = 0, delta = 1) => {
  const nextRep = Math.max(-3, Math.min(3, currentRep + delta));
  let tierLabel = 'Neutral';
  if (nextRep === 3) tierLabel = 'Legendary Ally (+3)';
  else if (nextRep === 2) tierLabel = 'Honored Partner (+2)';
  else if (nextRep === 1) tierLabel = 'Favorable (+1)';
  else if (nextRep === 0) tierLabel = 'Neutral (0)';
  else if (nextRep === -1) tierLabel = 'Distrusted (-1)';
  else if (nextRep === -2) tierLabel = 'Hostile / Bountied (-2)';
  else if (nextRep === -3) tierLabel = 'Kill-on-Sight Enemy (-3)';

  return {
    reputation: nextRep,
    tierLabel,
    isAllied: nextRep >= 2,
    isHostile: nextRep <= -2
  };
};
