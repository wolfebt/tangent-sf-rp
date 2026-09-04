import { TERRAIN_TEXTURE_PATTERNS, PRESET_OBJECT_SPRITES } from './MapTextures';

export const MAP_TYPES = [
  'Sector',
  'Solar System',
  'Planetary',
  'Regional',
  'City/Town',
  'Exterior',
  'Interior',
  'Container'
];

export const SIDEBAR_TOOLS = [
  { id: 'select', label: 'Select / Move', icon: 'Pointer' },
  { id: 'wall', label: 'Wall & Door', icon: 'Shield' },
  { id: 'terrain', label: 'Terrain Brush', icon: 'Paintbrush' },
  { id: 'object', label: 'Place Object / Prop', icon: 'Box' },
  { id: 'hazard', label: 'Environmental Hazard', icon: 'Flame' },
  { id: 'light', label: 'Dynamic Lighting', icon: 'Sun' },
  { id: 'token', label: 'Unit / Portal', icon: 'Users' },
  { id: 'pencil', label: 'Freehand Draw', icon: 'Edit3' },
  { id: 'text', label: 'Text Label', icon: 'Type' },
  { id: 'ruler', label: 'Waypoint Ruler', icon: 'Compass' },
  { id: 'fog', label: 'Fog of War', icon: 'EyeOff' },
  { id: 'eraser', label: 'Eraser', icon: 'Eraser' }
];

export const PENCIL_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ffffff', '#000000'];
export const PENCIL_WIDTHS = [2, 5, 10, 20, 40];
export const TEXT_COLORS = ['#ffffff', '#fcd34d', '#60a5fa', '#ef4444', '#10b981', '#a855f7', '#94a3b8'];

export const DEFAULT_LAYERS = [
  { id: 'layer_terrain', name: 'Terrain & Ground', visible: true, locked: false },
  { id: 'layer_walls', name: 'Walls & Bulkheads', visible: true, locked: false },
  { id: 'layer_objects', name: 'Objects & Buildings', visible: true, locked: false },
  { id: 'layer_tokens', name: 'Tokens & Portals', visible: true, locked: false },
  { id: 'layer_annotations', name: 'Text & Labels', visible: true, locked: false },
  { id: 'layer_fog', name: 'Fog of War', visible: true, locked: false }
];

/**
 * MASTER ASSET CATALOG: BASE TERRAINS (BY SCALE)
 */
export const MASTER_TERRAINS = {
  'Sector': [
    { id: 'deepSpaceVoid', label: 'Deep Space Void', color: '#030712', textureUrl: TERRAIN_TEXTURE_PATTERNS.deepSpaceVoid, strokeWidth: 50, desc: 'Dark void with customizable star density.', engineProps: 'Transit Speed: 1.0x | Sensor Interference: None' },
    { id: 'galacticCore', label: 'Galactic Core', color: '#fef08a', strokeWidth: 60, desc: 'High-density, blindingly bright star cluster.', engineProps: 'High sensor glare; FTL jump accuracy -25%' },
    { id: 'emissionNebula', label: 'Emission Nebula', color: '#dc2626', strokeWidth: 55, desc: 'Vibrant gas cloud concealing distant stars.', engineProps: 'Disables long-range radar; fleet stealth' },
    { id: 'darkDustNebula', label: 'Dark Dust Nebula', color: '#1e1b4b', strokeWidth: 55, desc: 'Opaque interstellar dust obscuring sight.', engineProps: 'LOS occlusion; warp velocity -30%' },
    { id: 'planetaryNebula', label: 'Planetary Nebula', color: '#06b6d4', strokeWidth: 50, desc: 'Ionized gas envelope surrounding dead star.', engineProps: 'Light shield degradation over time' },
    { id: 'supernovaRemnant', label: 'Supernova Remnant', color: '#ea580c', textureUrl: TERRAIN_TEXTURE_PATTERNS.volcanicLava, strokeWidth: 50, desc: 'Expanding shockwave with plasma filaments.', engineProps: 'Severe radiation hazard; periodic hull damage' },
    { id: 'magnetarVectorField', label: 'Magnetar Field', color: '#9333ea', textureUrl: TERRAIN_TEXTURE_PATTERNS.cyberGrid, strokeWidth: 45, desc: 'Dynamic electromagnetic grid lines.', engineProps: 'Disables electronic warfare; scrambles warp' },
    { id: 'gravitationalAnomaly', label: 'Gravitational Anomaly', color: '#312e81', textureUrl: TERRAIN_TEXTURE_PATTERNS.topographicContour, strokeWidth: 50, desc: 'Warped spacetime surrounding singularities.', engineProps: 'Gravitational pull; +15% FTL fuel cost' },
    { id: 'hyperlaneSubspaceLattice', label: 'Hyperlane Channel', color: '#38bdf8', strokeWidth: 35, desc: 'High-speed transit corridor mesh.', engineProps: 'Hyper-transit speed bonus (3.0x)' },
    { id: 'voidAbyss', label: 'Void Abyss', color: '#000000', textureUrl: TERRAIN_TEXTURE_PATTERNS.deepSpaceVoid, strokeWidth: 60, desc: 'Ultra-sparse intergalactic void.', engineProps: 'Morale penalty; zero refueling potential' },
    { id: 'ionizedSubspaceStorm', label: 'Ionized Subspace Storm', color: '#c026d3', strokeWidth: 55, desc: 'Violet energy web pulsing across sectors.', engineProps: 'Forces FTL dropout; propulsion damage' },
    { id: 'progenitorEnergyMesh', label: 'Progenitor Energy Mesh', color: '#10b981', textureUrl: TERRAIN_TEXTURE_PATTERNS.cyberGrid, strokeWidth: 40, desc: 'Ancient artificial cyber-grid network.', engineProps: 'Instant subspace comms across mesh' },
    { id: 'tachyonicField', label: 'Tachyonic Field', color: '#f43f5e', strokeWidth: 45, desc: 'Translucent chromatic FTL particle stream.', engineProps: 'Fleet tactical speed +50%' },
    { id: 'cosmicDustCloud', label: 'Cosmic Dust Cloud', color: '#64748b', strokeWidth: 50, desc: 'Fine particulate field scattering light.', engineProps: 'Optical targeting range -40%' },
    { id: 'antimatterVolatilityZone', label: 'Antimatter Volatility', color: '#9f1239', strokeWidth: 50, desc: 'Crimson haze flickering with energy bursts.', engineProps: 'Explosive hazard; energy weapon dmg +100%' }
  ],

  'Solar System': [
    { id: 'eclipticGrid', label: 'Ecliptic Grid Plane', color: '#1e293b', textureUrl: TERRAIN_TEXTURE_PATTERNS.cyberGrid, strokeWidth: 30, desc: 'Standard orbital plane lines with AU markers.', engineProps: 'Tactical navigation reference layer' },
    { id: 'asteroidBelt', label: 'Asteroid Belt Debris', color: '#78350f', strokeWidth: 45, desc: 'Dense ring of tumbling rocky fragments.', engineProps: 'Collision hazard; sub-light speed -50%; cover +30%' },
    { id: 'solarRadiationZone', label: 'Solar Radiation Zone', color: '#f59e0b', strokeWidth: 50, desc: 'Glowing inner perimeter around central star.', engineProps: 'Thermal risk; 5 HP/sec continuous damage' },
    { id: 'protoplanetaryDisk', label: 'Protoplanetary Disk', color: '#b45309', strokeWidth: 55, desc: 'Swirling gas & dust dampening sensors.', engineProps: 'Blocks long-range targeting; radar -75%' },
    { id: 'kuiperBeltIceField', label: 'Kuiper Belt Ice Field', color: '#38bdf8', textureUrl: TERRAIN_TEXTURE_PATTERNS.iceSheet, strokeWidth: 45, desc: 'Distant volatile ice chunks & methane.', engineProps: 'Cold hazard; freezes exposed thruster nozzles' },
    { id: 'planetaryRingSystem', label: 'Planetary Ring System', color: '#cbd5e1', strokeWidth: 40, desc: 'Dense particle band encircling gas giants.', engineProps: 'Conceals small vessels; high collision risk' },
    { id: 'coronalMassEjection', label: 'Coronal Mass Track', color: '#ef4444', strokeWidth: 35, desc: 'Dynamic solar flare energy vector.', engineProps: 'Deals 100 energy damage in linear corridor' },
    { id: 'subspaceAnomalyRift', label: 'Subspace Anomaly Rift', color: '#8b5cf6', strokeWidth: 45, desc: 'Localized gravimetric wave warping flight.', engineProps: 'Thrust vectors drift toward rift center' },
    { id: 'lagrangePoint', label: 'Lagrange Equilibrium', color: '#10b981', strokeWidth: 35, desc: 'Gravitationally stable parking orbit zone.', engineProps: 'Zero fuel consumption for holding pattern' },
    { id: 'solarWindCurrent', label: 'Solar Wind Current', color: '#06b6d4', strokeWidth: 40, desc: 'Continuous stream of charged particles.', engineProps: 'Solar sails +40% speed outbound' },
    { id: 'magnetosphericShield', label: 'Magnetospheric Shield', color: '#6366f1', strokeWidth: 45, desc: 'Magnetic field envelope around giant planet.', engineProps: 'Protects from solar flares; disrupts radar' },
    { id: 'debrisFieldGraveyard', label: 'Battle Graveyard Debris', color: '#475569', strokeWidth: 45, desc: 'Shattered metal plating and hull scrap.', engineProps: 'High salvage resources; structural hull risk' }
  ],

  'Planetary': [
    { id: 'continentalCrust', label: 'Continental Crust', color: '#475569', textureUrl: TERRAIN_TEXTURE_PATTERNS.topographicContour, strokeWidth: 40, desc: 'Terrestrial landmass contours & plateaus.', engineProps: 'Baseline ground surface (1.0x speed)' },
    { id: 'oceanMass', label: 'Ocean / Water Mass', color: '#1d4ed8', textureUrl: TERRAIN_TEXTURE_PATTERNS.waterOcean, strokeWidth: 50, desc: 'Surface liquid ocean with wave dynamics.', engineProps: 'Impassable for non-amphibious ground craft' },
    { id: 'polarIceCap', label: 'Polar Ice Cap', color: '#e2e8f0', textureUrl: TERRAIN_TEXTURE_PATTERNS.iceSheet, strokeWidth: 45, desc: 'Reflective white/blue frozen ice sheets.', engineProps: 'Low friction (+25% stop distance); cold risk' },
    { id: 'ecumenopolisTerrain', label: 'Ecumenopolis Cityscape', color: '#6366f1', textureUrl: TERRAIN_TEXTURE_PATTERNS.metalDecking, strokeWidth: 40, desc: 'Cityscape grid covering entire world surface.', engineProps: 'Urban infrastructure; zero natural resources' },
    { id: 'volcanicWasteland', label: 'Volcanic Basalt / Lava', color: '#b91c1c', textureUrl: TERRAIN_TEXTURE_PATTERNS.volcanicLava, strokeWidth: 45, desc: 'Cracked crust with glowing lava fissures.', engineProps: 'Extreme heat; vehicle thermal damage' },
    { id: 'terranGrassland', label: 'Terran Grassland / Plains', color: '#15803d', textureUrl: TERRAIN_TEXTURE_PATTERNS.grassland, strokeWidth: 40, desc: 'Rolling arable green plains and rivers.', engineProps: 'Ideal settlement ground; high food yield' },
    { id: 'aridSavannaDesert', label: 'Arid Savanna & Desert', color: '#d97706', textureUrl: TERRAIN_TEXTURE_PATTERNS.desertSand, strokeWidth: 40, desc: 'Scorched landmasses with dune patterns.', engineProps: 'Sandstorms cause optical sensor blackouts' },
    { id: 'denseJungleCanopy', label: 'Dense Jungle Canopy', color: '#047857', textureUrl: TERRAIN_TEXTURE_PATTERNS.forestCanopy, strokeWidth: 45, desc: 'Thick global rainforest canopy.', engineProps: 'Total orbital visual concealment for ground units' },
    { id: 'gasGiantCloudTops', label: 'Gas Giant Cloud Tops', color: '#eab308', strokeWidth: 55, desc: 'Swirling storm bands with deep lightning.', engineProps: 'Extreme atmospheric pressure' },
    { id: 'moltenMagmaSeas', label: 'Molten Magma Seas', color: '#dc2626', textureUrl: TERRAIN_TEXTURE_PATTERNS.volcanicLava, strokeWidth: 50, desc: 'Exposed planetary mantle liquid fire.', engineProps: 'Instant destruction for non-shielded craft' },
    { id: 'crystalSpireBadlands', label: 'Crystal Spire Badlands', color: '#a855f7', textureUrl: TERRAIN_TEXTURE_PATTERNS.crystalSpire, strokeWidth: 40, desc: 'Prismatic crags refracting laser sweeps.', engineProps: 'Laser targeting systems suffer -60% accuracy' },
    { id: 'subterraneanCavernMesh', label: 'Subterranean Cavern Mesh', color: '#334155', strokeWidth: 40, desc: 'Under-crust honeycomb entrance grid.', engineProps: 'Immune to orbital bombardment' },
    { id: 'toxicChemicalSludge', label: 'Toxic Chemical Sludge', color: '#84cc16', textureUrl: TERRAIN_TEXTURE_PATTERNS.toxicSludge, strokeWidth: 45, desc: 'Caustic industrial liquid waste basins.', engineProps: 'Corrodes vehicle chassis; requires Hazmat' },
    { id: 'radioactiveWasteland', label: 'Scorched Irradiated Soil', color: '#16a34a', textureUrl: TERRAIN_TEXTURE_PATTERNS.toxicSludge, strokeWidth: 45, desc: 'Vitrified soil crater field glowing green.', engineProps: 'Radiation hazard (+10 rads/sec)' }
  ],

  'Regional': [
    { id: 'denseForestJungle', label: 'Dense Forest / Jungle', color: '#15803d', textureUrl: TERRAIN_TEXTURE_PATTERNS.forestCanopy, strokeWidth: 35, desc: 'Thick tree cover restricting vehicles.', engineProps: 'Move cost: 2; infantry cover +2; vehicle speed halved' },
    { id: 'aridDesertDunes', label: 'Arid Desert Dunes', color: '#d97706', textureUrl: TERRAIN_TEXTURE_PATTERNS.desertSand, strokeWidth: 35, desc: 'Open sand fields with shifting dunes.', engineProps: 'Move cost: 1.5; wheeled vehicles DEX check' },
    { id: 'swampMarshland', label: 'Swamp / Marshland', color: '#0f766e', textureUrl: TERRAIN_TEXTURE_PATTERNS.toxicSludge, strokeWidth: 40, desc: 'Shallow mud waterways and high humidity.', engineProps: 'Move cost: 3; tracked vehicle advantage' },
    { id: 'jaggedCanyons', label: 'Jagged Canyon Pass', color: '#78350f', strokeWidth: 30, desc: 'Steep ravines requiring bridges or flight.', engineProps: 'Impassable without climbing/jets; natural chokepoint' },
    { id: 'tundraSnowfield', label: 'Tundra / Snowfield', color: '#f1f5f9', textureUrl: TERRAIN_TEXTURE_PATTERNS.iceSheet, strokeWidth: 35, desc: 'Slick snow cover with visible track lines.', engineProps: 'Move cost: 1.5; tracks stay visible 10 turns' },
    { id: 'coastalReefShallows', label: 'Coastal Reef Shallows', color: '#38bdf8', textureUrl: TERRAIN_TEXTURE_PATTERNS.waterOcean, strokeWidth: 40, desc: 'Shallow tidal waters navigable by hovercraft.', engineProps: 'Move cost: 2 ground; standard speed hovercraft' },
    { id: 'alpineMountainCrags', label: 'Alpine Mountain Crags', color: '#475569', strokeWidth: 35, desc: 'High elevation rock walls blocking passage.', engineProps: 'Impassable for ground vehicles; air travel needed' },
    { id: 'volcanicAshFields', label: 'Volcanic Ash Fields', color: '#334155', strokeWidth: 35, desc: 'Loose ash reducing sight and clogging engines.', engineProps: 'Engine failure risk 10%/turn; sight cap 2 hexes' },
    { id: 'bioluminescentForest', label: 'Bioluminescent Canopy', color: '#06b6d4', textureUrl: TERRAIN_TEXTURE_PATTERNS.forestCanopy, strokeWidth: 35, desc: 'Alien fungal forest emitting spore fogs.', engineProps: 'Night vision unneeded; spore fog hallucionations' },
    { id: 'karstSinkholePlateau', label: 'Karst Sinkhole Floor', color: '#64748b', strokeWidth: 35, desc: 'Collapsible limestone floor with caves.', engineProps: 'Terrain collapse risk (5% per heavy vehicle)' },
    { id: 'irradiatedBadlands', label: 'Irradiated Badlands', color: '#65a30d', textureUrl: TERRAIN_TEXTURE_PATTERNS.toxicSludge, strokeWidth: 35, desc: 'Blasted wasteland with persistent radiation.', engineProps: 'Units suffer 1 RAD per turn without shielding' },
    { id: 'crystallineSaltFlats', label: 'Crystalline Salt Flats', color: '#ffffff', strokeWidth: 35, desc: 'Blindingly bright white expanse with zero cover.', engineProps: 'Move cost: 1; max sight range; zero cover' },
    { id: 'mudslideCorridor', label: 'Mudslide Corridor', color: '#92400e', strokeWidth: 35, desc: 'Unstable wet hillside prone to mudflows.', engineProps: 'Variable move cost (2-4); washed downhill risk' },
    { id: 'petrifiedForest', label: 'Petrified Stone Flora', color: '#71717a', strokeWidth: 35, desc: 'Ancient calcified trees providing hard stone cover.', engineProps: 'Move cost: 1.5; provides hard cover (+4 DEF)' }
  ],

  'City/Town': [
    { id: 'asphaltPavedRoad', label: 'Asphalt / Paved Road', color: '#1e293b', textureUrl: TERRAIN_TEXTURE_PATTERNS.asphaltRoad, strokeWidth: 30, desc: 'Standard vehicle transit lanes with markings.', engineProps: 'Baseline urban speed (1.0x); optimal traction' },
    { id: 'concretePlaza', label: 'Concrete Plaza Floor', color: '#64748b', strokeWidth: 35, desc: 'Wide pedestrian areas with tiled concrete.', engineProps: 'Open sight lines; minimal cover except pillars' },
    { id: 'metalDeckingGrid', label: 'Metal Decking Grid', color: '#475569', textureUrl: TERRAIN_TEXTURE_PATTERNS.metalDecking, strokeWidth: 30, desc: 'Steel grating used in docks and sky-cities.', engineProps: 'Can see lower levels; step sound radius +10%' },
    { id: 'slumDirtMud', label: 'Slum Dirt / Mud Path', color: '#78350f', strokeWidth: 30, desc: 'Rough uneven ground in outer rim zones.', engineProps: 'Movement speed -25%; leaves wheel rut tracks' },
    { id: 'waterCanals', label: 'Urban Water Canal', color: '#0284c7', textureUrl: TERRAIN_TEXTURE_PATTERNS.waterOcean, strokeWidth: 35, desc: 'Sunken artificial waterways between blocks.', engineProps: 'Requires swimming/boats; low-profile cover' },
    { id: 'cobblestoneHeritage', label: 'Cobblestone Paving', color: '#71717a', strokeWidth: 30, desc: 'Historical stone paving causing vibration.', engineProps: 'Vehicle speed capped at 80% max speed' },
    { id: 'rooftopPark', label: 'Rooftop Park Turf', color: '#16a34a', textureUrl: TERRAIN_TEXTURE_PATTERNS.grassland, strokeWidth: 35, desc: 'Cultivated garden terrace atop high-rises.', engineProps: 'Elevated sniper position; fall dmg -15%' },
    { id: 'industrialScaffolding', label: 'Industrial Scaffolding', color: '#0284c7', strokeWidth: 25, desc: 'Open structural steel walkways between towers.', engineProps: 'High elevation hazard; falling risk on blasts' },
    { id: 'sludgeDrainageChannel', label: 'Sludge Drainage Channel', color: '#65a30d', textureUrl: TERRAIN_TEXTURE_PATTERNS.toxicSludge, strokeWidth: 30, desc: 'Open chemical sewer with acidic runoff.', engineProps: 'Caustic liquid; minor chemical footwear corrosion' },
    { id: 'maglevTrackClearance', label: 'Maglev Rail Clearance', color: '#a855f7', strokeWidth: 25, desc: 'High-voltage transit trench with glowing rails.', engineProps: '50 shock damage on contact; train collision risk' },
    { id: 'underCityBrickSewer', label: 'Under-City Brick Sewer', color: '#334155', strokeWidth: 35, desc: 'Dark subterranean conduit system below roads.', engineProps: 'Underground cover; bypasses street gates' },
    { id: 'glassChromeAtrium', label: 'Glass & Chrome Atrium', color: '#e0f2fe', strokeWidth: 35, desc: 'Luxury indoor/outdoor floor in corporate plaza.', engineProps: 'Footsteps echo; tiles shatter under explosives' },
    { id: 'sunkenHighwayTrench', label: 'Sunken Highway Trench', color: '#334155', strokeWidth: 40, desc: 'Multi-lane expressway cut into bedrock.', engineProps: 'High-speed corridor; limits lateral exit points' }
  ],

  'Exterior': [
    { id: 'packedSoilDirt', label: 'Packed Soil / Dirt', color: '#78350f', strokeWidth: 30, desc: 'Standard packed dirt surface.', engineProps: 'Move cost: 1.0; neutral footing' },
    { id: 'mudPuddles', label: 'Mud & Water Puddles', color: '#451a03', strokeWidth: 35, desc: 'Wet churned earth with deep puddles.', engineProps: 'Move cost: 1.5; footprint tracking enhanced' },
    { id: 'tarmacConcretePad', label: 'Tarmac / Concrete Pad', color: '#334155', textureUrl: TERRAIN_TEXTURE_PATTERNS.asphaltRoad, strokeWidth: 35, desc: 'Level hardtop for landing pads & lots.', engineProps: '+10% speed bonus for wheeled vehicles' },
    { id: 'gravelField', label: 'Loose Gravel Field', color: '#94a3b8', strokeWidth: 30, desc: 'Shifting stone surface crunching underfoot.', engineProps: 'Stealth checks suffer -3 noise penalty' },
    { id: 'cultivatedLawn', label: 'Cultivated Lawn', color: '#16a34a', textureUrl: TERRAIN_TEXTURE_PATTERNS.grassland, strokeWidth: 30, desc: 'Manicured synthetic or natural lawn.', engineProps: 'Standard move cost; clear visibility' },
    { id: 'industrialSlagYard', label: 'Industrial Slag Yard', color: '#52525b', strokeWidth: 30, desc: 'Sharp metal refuse and broken glass debris.', engineProps: 'Prone units take 1 HP/turn; tire puncture risk' },
    { id: 'softSandDunes', label: 'Soft Sand Sinking', color: '#d97706', textureUrl: TERRAIN_TEXTURE_PATTERNS.desertSand, strokeWidth: 35, desc: 'Deep sand giving way under foot pressure.', engineProps: 'Move cost: 2.0 foot; vehicles -50% speed' },
    { id: 'scorchedCraterGround', label: 'Scorched Crater Ground', color: '#1c1917', strokeWidth: 35, desc: 'Glassified impact pit from explosive shells.', engineProps: 'Provides partial cover (+2 AC); thermal heat' },
    { id: 'marshyWetlandEdge', label: 'Marshy Wetland Edge', color: '#0f766e', strokeWidth: 35, desc: 'Slippery waterlogged turf with bog plants.', engineProps: 'DEX check required when sprinting to avoid falling' },
    { id: 'frozenSlickIce', label: 'Frozen Slick Ice', color: '#e0f2fe', textureUrl: TERRAIN_TEXTURE_PATTERNS.iceSheet, strokeWidth: 30, desc: 'Zero-friction smooth ice patch.', engineProps: 'Acrobatics check needed if moving fast' },
    { id: 'overgrownBriarPatch', label: 'Overgrown Briar Patch', color: '#15803d', textureUrl: TERRAIN_TEXTURE_PATTERNS.forestCanopy, strokeWidth: 35, desc: 'Entangling razor flora providing concealment.', engineProps: 'Move cost: 2.0; deals 1d4 piercing damage' },
    { id: 'razorWireField', label: 'Razor Wire Security Field', color: '#dc2626', strokeWidth: 25, desc: 'Coiled military wire strung across path.', engineProps: 'Severe move penalty; bleeding damage & entangle' },
    { id: 'fuelSoakedSoil', label: 'Fuel-Soaked Soil', color: '#292524', strokeWidth: 30, desc: 'Darkened earth saturated with jet fuel.', engineProps: 'Ignites when exposed to fire/energy weapon impact' }
  ],

  'Interior': [
    { id: 'steelGrating', label: 'Industrial Steel Grating', color: '#475569', textureUrl: TERRAIN_TEXTURE_PATTERNS.metalDecking, strokeWidth: 30, desc: 'Heavy metal floor plates with ventilation slots.', engineProps: 'LOS extends vertically down; dropped items fall' },
    { id: 'ceramicTile', label: 'Sterile Ceramic Tile', color: '#f8fafc', strokeWidth: 30, desc: 'High-gloss smooth tiles in medical/labs.', engineProps: 'Clean surface; blood spills create slide patches' },
    { id: 'carpetFabric', label: 'Padded Fabric Carpet', color: '#1e293b', strokeWidth: 30, desc: 'Soft interior carpet dampening noise.', engineProps: 'Stealth noise -50% (+2 Stealth checks)' },
    { id: 'rawRockCave', label: 'Raw Rock / Cave Floor', color: '#52525b', strokeWidth: 35, desc: 'Uneven cavern floor with jagged stone.', engineProps: 'Move cost: 1.5; trip risk during dash' },
    { id: 'raisedServerFloor', label: 'Raised Server Floor', color: '#0284c7', textureUrl: TERRAIN_TEXTURE_PATTERNS.cyberGrid, strokeWidth: 30, desc: 'Removable square panels covering cable raceways.', engineProps: 'Can hide small items/explosives under floor' },
    { id: 'linoleumVinyl', label: 'Utilitarian Linoleum', color: '#94a3b8', strokeWidth: 30, desc: 'Durable synthetic floor for hallways.', engineProps: 'Durable neutral surface; scuff marks' },
    { id: 'polishedHardwood', label: 'Executive Hardwood', color: '#78350f', strokeWidth: 30, desc: 'High-end wood flooring in executive suites.', engineProps: 'Refined aesthetic; burn marks from plasma' },
    { id: 'corrodedRustPlate', label: 'Corroded Rust Plate', color: '#b45309', strokeWidth: 30, desc: 'Fractured floor plate severely degraded.', engineProps: 'Structural hazard; collapses under heavy weight' },
    { id: 'pouredEpoxy', label: 'Poured Epoxy Chemical Seal', color: '#059669', strokeWidth: 30, desc: 'Seamless non-reactive chemical coating.', engineProps: 'Resistant to acid/corrosive spills' },
    { id: 'rubberizedAcousticMat', label: 'Rubberized Acoustic Mat', color: '#0f172a', strokeWidth: 30, desc: 'Tactical dampening flooring canceling step audio.', engineProps: 'Completely silences footstep audio pings' },
    { id: 'utilityTrench', label: 'Sub-Level Utility Trench', color: '#334155', strokeWidth: 25, desc: 'Sunken channel running cabling under floor.', engineProps: 'Units in trench gain half-cover (+2 AC)' },
    { id: 'organoChitinMatrix', label: 'Organo-Chitin Hive Matrix', color: '#84cc16', textureUrl: TERRAIN_TEXTURE_PATTERNS.chitinHive, strokeWidth: 35, desc: 'Living alien hive flooring pulsing rhythmically.', engineProps: 'Accelerates alien speed +25%; slows humans' },
    { id: 'shatteredGlass', label: 'Shattered Glass Surface', color: '#bae6fd', strokeWidth: 30, desc: 'Floor littered with sharp window shards.', engineProps: 'Stepping without boots takes 1d2 dmg and alerts' }
  ],

  'Container': [
    { id: 'paddedFoamInlay', label: 'Padded Foam Inlay Grid', color: '#0f172a', strokeWidth: 30, desc: 'High-density foam cutout tray for sensitive gear.', engineProps: 'High impact shock dampening' },
    { id: 'moldedHardcase', label: 'Molded Hardcase Grid', color: '#1e293b', strokeWidth: 30, desc: 'Heavy-duty poly-case lining with custom slots.', engineProps: 'Waterproof & pressure sealed' },
    { id: 'corrodedMetalStash', label: 'Corroded Metal Stash Box', color: '#78350f', strokeWidth: 30, desc: 'Rust-stained scrap metal container interior.', engineProps: 'Scratched grid layout; lock pick difficulty +1' },
    { id: 'leatherPouchLining', label: 'Leather Pouch Lining', color: '#92400e', strokeWidth: 30, desc: 'Soft stitched leather interior pocket grid.', engineProps: 'Silent opening; lightweight stash' },
    { id: 'cryoLockerBay', label: 'Cryo-Locker Chilled Bay', color: '#0284c7', strokeWidth: 30, desc: 'Frost-covered refrigerated container grid.', engineProps: 'Preserves biological samples & organ stims' },
    { id: 'bioOrganicNest', label: 'Bio-Organic Chitin Sack', color: '#65a30d', strokeWidth: 35, desc: 'Pulsing organic tissue pouch holding items.', engineProps: 'Items covered in slime; requires cleaning' },
    { id: 'velvetLuxuryTray', label: 'Velvet Luxury Display Tray', color: '#881337', strokeWidth: 30, desc: 'Plush crimson velvet tray for precious artifacts.', engineProps: 'High-value display grid' },
    { id: 'weatheredCanvasPack', label: 'Weathered Canvas Pack', color: '#475569', strokeWidth: 30, desc: 'Surplus military canvas compartment lining.', engineProps: 'Modular pouch expansion compatible' }
  ]
};

/**
 * MASTER ASSET CATALOG: PLACEABLE OBJECTS & STRUCTURES (BY SCALE)
 */
export const MASTER_OBJECTS = {
  'Sector': [
    // Stellar Systems & Astronomical Phenomena
    { id: 'blueSupergiantNode', label: 'O-Type Blue Supergiant Node', category: 'Stellar Systems', scaleTarget: 'Solar System', hazard: 'Radiation Sweep', color: '#38bdf8', shape: 'star', radius: 45, desc: 'Massive high-luminosity star emitting extreme UV radiation.' },
    { id: 'binaryTrinarySystem', label: 'Binary / Trinary Star System', category: 'Stellar Systems', scaleTarget: 'Solar System', color: '#f59e0b', shape: 'circle', radius: 40, desc: 'Complex gravitational nodes creating multiple orbital equilibrium pockets.' },
    { id: 'supermassiveBlackHole', label: 'Supermassive Black Hole', category: 'Stellar Systems', hazard: 'Gravity Well / LOS Blocker', color: '#020617', shape: 'circle', radius: 50, stroke: '#9333ea', desc: 'Extreme gravitational sink bending nearby flight vectors and light paths.' },
    { id: 'pulsarMagnetarBeam', label: 'Pulsar / Magnetar Beam Node', category: 'Stellar Systems', hazard: 'Hazard Sweep', color: '#a855f7', shape: 'star', radius: 35, desc: 'Periodically sweeps a high-intensity radiation vector across neighboring hexes.' },
    { id: 'protostellarGasNursery', label: 'Protostellar Gas Nursery', category: 'Stellar Systems', resource: 'Volatile Gas', color: '#f43f5e', shape: 'cloud', radius: 40, desc: 'Raw star-forming cloud node yielding unrefined volatile gas and heavy elements.' },
    { id: 'kugelblitzSingularity', label: 'Kugelblitz Singularity', category: 'Stellar Systems', hazard: 'Artificial Singularity', color: '#312e81', shape: 'circle', radius: 30, desc: 'Concentrated artificial black hole acting as a gravity trap or weapon test site.' },
    { id: 'whiteDwarfNode', label: 'Hyper-Dense White Dwarf Node', category: 'Stellar Systems', resource: 'Exotic Isotopes', color: '#f8fafc', shape: 'circle', radius: 25, desc: 'Compact stellar core emitting high gravitational shear forces and rare isotopes.' },
    { id: 'rogueDarkPlanet', label: 'Rogue Dark Planet Vector', category: 'Stellar Systems', color: '#334155', shape: 'circle', radius: 25, desc: 'Starless frozen planet drifting slowly across sectors along an unmapped vector.' },
    { id: 'quasarRadiationJet', label: 'Quasar Radiation Jet', category: 'Stellar Systems', hazard: 'Linear Multi-Sector Beam', color: '#06b6d4', shape: 'line', width: 120, height: 20, desc: 'Continuous multi-sector energy beam destroying unshielded probes.' },

    // Megastructures
    { id: 'dysonSwarm', label: 'Dyson Swarm / Ringworld Array', category: 'Megastructures', scaleTarget: 'Solar System', imageUrl: PRESET_OBJECT_SPRITES.spaceStation, interactable: true, color: '#eab308', shape: 'hexagon', radius: 45, desc: 'Imperial star-encircling solar collection network producing immense energy.' },
    { id: 'matrioshkaBrain', label: 'Matrioshka Brain Computer', category: 'Megastructures', imageUrl: PRESET_OBJECT_SPRITES.tacticalConsole, hackable: true, color: '#3b82f6', shape: 'hexagon', radius: 40, desc: 'Nested star-powered supercomputing cluster processing sector data streams.' },
    { id: 'shkadovThruster', label: 'Shkadov Stellar Thruster', category: 'Megastructures', color: '#f97316', shape: 'rect', width: 60, height: 40, desc: 'Propulsion megastructure capable of altering a star system coordinate location.' },
    { id: 'hyperSpaceRelay', label: 'Interstellar Hyper-Space Relay', category: 'Megastructures', imageUrl: PRESET_OBJECT_SPRITES.portalGateway, fastTravel: true, color: '#0284c7', shape: 'star', radius: 35, desc: 'Deep-space transit anchor point linking major sector trade corridors.' },
    { id: 'deepSpaceFortress', label: 'Deep Space Fortress Citadel', category: 'Megastructures', imageUrl: PRESET_OBJECT_SPRITES.defenseCitadel, defensive: true, color: '#64748b', shape: 'hexagon', radius: 45, desc: 'Heavy imperial stronghold offering repair bays and local interdiction fields.' },
    { id: 'blackHoleHarvester', label: 'Black Hole Energy Harvester', category: 'Megastructures', imageUrl: PRESET_OBJECT_SPRITES.blackHoleSingularity, resource: 'Ergosphere Energy', color: '#8b5cf6', shape: 'rect', width: 50, height: 50, desc: 'Specialized siphon rig extracting ergosphere energy from spinning singularities.' },
    { id: 'progenitorVaultGate', label: 'Progenitor Vault Gate', category: 'Megastructures', imageUrl: PRESET_OBJECT_SPRITES.portalGateway, locked: true, color: '#10b981', shape: 'hexagon', radius: 40, desc: 'Ancient alien ring structure requiring artifact keys to unlock deep subspace.' },
    { id: 'automatedSensorArray', label: 'Automated Sensor Listening Array', category: 'Megastructures', intel: true, color: '#06b6d4', shape: 'star', radius: 30, desc: 'High-sensitivity intelligence array monitoring fleet movements across 3 sectors.' },
    { id: 'miningStarForge', label: 'Automated Mining Star-Forge', category: 'Megastructures', imageUrl: PRESET_OBJECT_SPRITES.spaceStation, production: true, color: '#d97706', shape: 'rect', width: 55, height: 45, desc: 'Automated shipyard consuming nearby asteroids to construct drone fleets.' },
    { id: 'subspaceInterdictionBeacon', label: 'Subspace Interdiction Array', category: 'Megastructures', areaDenial: true, color: '#dc2626', shape: 'circle', radius: 35, desc: 'Network of deep-space buoys locking down FTL travel across hex cluster.' },
    { id: 'tachyonTransmitter', label: 'Tachyon Transmitter Tower', category: 'Megastructures', comms: true, color: '#ec4899', shape: 'star', radius: 30, desc: 'Broadcasts instant system commands across multiple sector sectors.' },

    // Fleets & Spaceborne Entities
    { id: 'sectorArmada', label: 'Sector Armada Fleet Icon', category: 'Fleets & Entities', imageUrl: PRESET_OBJECT_SPRITES.starshipArmada, movable: true, color: '#22d3ee', shape: 'triangle', radius: 30, desc: 'Combined tactical fleet unit with customizable hull composition and power rating.' },
    { id: 'merchantCaravan', label: 'Deep Space Merchant Caravan', category: 'Fleets & Entities', imageUrl: PRESET_OBJECT_SPRITES.starshipArmada, trader: true, color: '#10b981', shape: 'triangle', radius: 25, desc: 'Mobile commercial fleet offering high-grade tech and commodity trading.' },
    { id: 'pirateFlotilla', label: 'Pirate Raiding Flotilla', category: 'Fleets & Entities', imageUrl: PRESET_OBJECT_SPRITES.starshipArmada, hostile: true, color: '#ef4444', shape: 'triangle', radius: 25, desc: 'Aggressive mobile unit seeking to ambush supply caravans and mining platforms.' },
    { id: 'generationShip', label: 'Nomadic Generation Ship', category: 'Fleets & Entities', neutral: true, color: '#94a3b8', shape: 'rect', width: 50, height: 25, desc: 'Gigantic self-contained colony vessel drifting along pre-warp vectors.' },
    { id: 'derelictMegastructure', label: 'Derelict Megastructure Hulk', category: 'Fleets & Entities', salvage: true, color: '#64748b', shape: 'rect', width: 45, height: 35, desc: 'Shattered remains of a capital platform containing rare technology schematics.' },
    { id: 'cosmicLeviathan', label: 'Void Entity / Cosmic Leviathan', category: 'Fleets & Entities', boss: true, color: '#a855f7', shape: 'star', radius: 50, desc: 'Massive organic space creature capable of consuming starships.' },
    { id: 'subspaceEntitySwarm', label: 'Subspace Entity Swarm', category: 'Fleets & Entities', hazard: 'Aggressive Swarm', color: '#c026d3', shape: 'circle', radius: 30, desc: 'Cluster of non-corporeal entities hunting ships using active FTL engines.' },
    { id: 'planetCrusherBarge', label: 'Automated Planet-Crusher Barge', category: 'Fleets & Entities', destructive: true, color: '#b45309', shape: 'rect', width: 65, height: 35, desc: 'Capital-scale mining vessel capable of breaking small worlds into asteroids.' },
    { id: 'stealthReconDrone', label: 'Stealth Reconnaissance Drone', category: 'Fleets & Entities', stealth: true, color: '#475569', shape: 'circle', radius: 15, desc: 'Small automated surveillance unit cloaked from normal visual sector overlays.' },

    // Governance Overlays
    { id: 'sovereignFactionBorder', label: 'Sovereign Faction Border', category: 'Territorial Overlays', overlay: true, color: '#3b82f6', shape: 'hexagon', radius: 60, desc: 'Defines empire jurisdiction, tax rates, and diplomatic entry restrictions.' },
    { id: 'contestedDemarcation', label: 'Contested Demarcation Vector', category: 'Territorial Overlays', conflict: true, color: '#f59e0b', shape: 'rect', width: 80, height: 30, desc: 'Active combat zone granting combat experience bonuses.' },
    { id: 'interdictedQuarantine', label: 'Interdicted Quarantine Sphere', category: 'Territorial Overlays', blockade: true, color: '#dc2626', shape: 'circle', radius: 55, desc: 'Restricted space zone enforcing automated shoot-on-sight defense parameters.' },
    { id: 'freeTradeCorridor', label: 'Anarchist Free-Trade Zone', category: 'Territorial Overlays', lawless: true, color: '#10b981', shape: 'rect', width: 90, height: 40, desc: 'Unregulated space sector immune to imperial taxes, but prone to pirates.' }
  ],

  'Solar System': [
    // Celestial Bodies
    { id: 'terrestrialWorld', label: 'Terrestrial World Node', category: 'Celestial Bodies', scaleTarget: 'Planetary', imageUrl: PRESET_OBJECT_SPRITES.terrestrialPlanet, color: '#0284c7', shape: 'circle', radius: 35, desc: 'Standard rocky world supporting surface maps, atmosphere types, and biomes.' },
    { id: 'gasGiantNode', label: 'Gas Giant Platform Node', category: 'Celestial Bodies', scaleTarget: 'Planetary', imageUrl: PRESET_OBJECT_SPRITES.gasGiantPlanet, color: '#eab308', shape: 'circle', radius: 50, desc: 'Massive gas giant with atmospheric harvesting rigs and deep cloud zones.' },
    { id: 'volatileIceWorld', label: 'Volatile Ice World Node', category: 'Celestial Bodies', scaleTarget: 'Planetary', imageUrl: PRESET_OBJECT_SPRITES.terrestrialPlanet, color: '#38bdf8', shape: 'circle', radius: 30, desc: 'Frozen world containing rich methane, water-ice, and sub-surface ocean access.' },
    { id: 'tidallyLockedWorld', label: 'Tidally Locked World Node', category: 'Celestial Bodies', scaleTarget: 'Planetary', imageUrl: PRESET_OBJECT_SPRITES.terrestrialPlanet, color: '#f97316', shape: 'circle', radius: 35, desc: 'Extreme world featuring permanent scorching day and freezing night sides.' },
    { id: 'trojanAsteroidCluster', label: 'Trojan Asteroid Cluster', category: 'Celestial Bodies', resource: 'High Ore Density', color: '#78350f', shape: 'hexagon', radius: 30, desc: 'Stable asteroid pocket suitable for concealed bases and heavy mining.' },
    { id: 'volatileComet', label: 'Long-Period Volatile Comet', category: 'Celestial Bodies', dynamic: true, color: '#67e8f9', shape: 'star', radius: 25, desc: 'High-velocity object trailing a volatile tail across orbit lines over time.' },
    { id: 'ringedGasDwarf', label: 'Ringed Gas Dwarf Planet', category: 'Celestial Bodies', scaleTarget: 'Planetary', imageUrl: PRESET_OBJECT_SPRITES.gasGiantPlanet, color: '#a855f7', shape: 'circle', radius: 32, desc: 'Dense sub-giant world with thin, razor-sharp metallic ring systems.' },
    { id: 'shatteredPlanetoid', label: 'Shattered Planetoid Remnant', category: 'Celestial Bodies', hazard: 'Orbital Debris', color: '#57534e', shape: 'hexagon', radius: 28, desc: 'Fractured crust of an exploded world floating in high orbital tension.' },
    { id: 'hotJupiter', label: 'Super-Volcanic Hot-Jupiter', category: 'Celestial Bodies', scaleTarget: 'Planetary', imageUrl: PRESET_OBJECT_SPRITES.gasGiantPlanet, color: '#ef4444', shape: 'circle', radius: 48, desc: 'Scorching close-orbit gas giant surrounded by ionized atmospheric plumes.' },

    // Infrastructure & Stations
    { id: 'orbitalDefenseCitadel', label: 'Orbital Defense Citadel', category: 'Infrastructure & Stations', imageUrl: PRESET_OBJECT_SPRITES.defenseCitadel, hostile: true, color: '#dc2626', shape: 'hexagon', radius: 35, desc: 'High-durability station armed with heavy laser batteries and torpedo tubes.' },
    { id: 'asteroidMiningRefinery', label: 'Asteroid Mining Refinery', category: 'Infrastructure & Stations', imageUrl: PRESET_OBJECT_SPRITES.spaceStation, resource: 'Ore Processing', color: '#d97706', shape: 'rect', width: 45, height: 35, desc: 'Industrial station converting raw ore into construction metals and fuel.' },
    { id: 'gasSkimmerPlatform', label: 'Gas Skimmer Harvesting Rig', category: 'Infrastructure & Stations', imageUrl: PRESET_OBJECT_SPRITES.spaceStation, fuel: true, color: '#0284c7', shape: 'rect', width: 40, height: 40, desc: 'Atmospheric floating platform harvesting Helium-3 and hydrogen.' },
    { id: 'orbitalDrydock', label: 'Orbital Drydock & Ship Refit', category: 'Infrastructure & Stations', imageUrl: PRESET_OBJECT_SPRITES.spaceStation, repair: true, color: '#10b981', shape: 'rect', width: 55, height: 35, desc: 'Engineering station providing hull restoration, engine tuning, and upgrades.' },
    { id: 'customsCheckpoint', label: 'Customs Inspection Station', category: 'Infrastructure & Stations', imageUrl: PRESET_OBJECT_SPRITES.outpostBunker, interdiction: true, color: '#64748b', shape: 'rect', width: 35, height: 35, desc: 'Planetary entrance hub monitoring cargo manifests and scanning contraband.' },
    { id: 'observatoryDish', label: 'Deep Space Observatory Dish', category: 'Infrastructure & Stations', intel: true, color: '#06b6d4', shape: 'star', radius: 30, desc: 'Long-range optical array revealing hidden cloaked ships in adjacent sectors.' },
    { id: 'solarEnergyArray', label: 'Solar Energy Harvest Collector', category: 'Infrastructure & Stations', power: true, color: '#f59e0b', shape: 'rect', width: 50, height: 25, desc: 'Close-orbit collector station transmitting power beams to inner system colonies.' },
    { id: 'solarSailLaserRing', label: 'Solar Sail Acceleration Ring', category: 'Infrastructure & Stations', imageUrl: PRESET_OBJECT_SPRITES.portalGateway, propulsion: true, color: '#a855f7', shape: 'circle', radius: 30, desc: 'Energy ring firing laser beams to accelerate light-sail craft across orbits.' },
    { id: 'lagrangeLogisticsDepot', label: 'Lagrange Logistics Terminal', category: 'Infrastructure & Stations', imageUrl: PRESET_OBJECT_SPRITES.spaceStation, trade: true, color: '#3b82f6', shape: 'rect', width: 40, height: 30, desc: 'Automated refueling and cargo staging hub positioned in gravity balance points.' },
    { id: 'subspaceBuoyNet', label: 'Automated Sub-Space Buoy Net', category: 'Infrastructure & Stations', surveillance: true, color: '#06b6d4', shape: 'circle', radius: 20, desc: 'Sensor mesh pinging unauthorized vessel movements across ecliptic plane.' },

    // Navigation & Tactical
    { id: 'navigationalBuoy', label: 'Automated Navigational Buoy', category: 'Navigation & Tactical', pathfinder: true, color: '#10b981', shape: 'circle', radius: 15, desc: 'Emits sub-space telemetry signals providing path accuracy bonuses.' },
    { id: 'quantumDistressBeacon', label: 'Quantum Distress Beacon', category: 'Navigation & Tactical', mission: true, color: '#f43f5e', shape: 'star', radius: 20, desc: 'Transmits encrypted emergency message inviting rescue or trap encounters.' },
    { id: 'orbitalMissileSilo', label: 'Orbital Missile Silo Platform', category: 'Navigation & Tactical', offense: true, color: '#b91c1c', shape: 'rect', width: 30, height: 30, desc: 'Automated defensive pod launching system-wide interceptor missiles.' },
    { id: 'stealthSensorBuoy', label: 'Stealth Sensor Buoy Array', category: 'Navigation & Tactical', stealth: true, color: '#475569', shape: 'circle', radius: 15, desc: 'Hidden surveillance pod revealing enemy fleet trajectories.' },
    { id: 'salvageWreckGraveyard', label: 'Salvage Wreck Graveyard', category: 'Navigation & Tactical', loot: true, color: '#d97706', shape: 'hexagon', radius: 30, desc: 'Multi-ship crash debris yielding high-grade component scrap and databanks.' },
    { id: 'asteroidMinefield', label: 'Asteroid Minefield Grid', category: 'Navigation & Tactical', trap: true, color: '#dc2626', shape: 'star', radius: 25, desc: 'Dense cluster of proximity-triggered space mines hidden among asteroids.' },
    { id: 'decoyHologramDrone', label: 'Decoy Signal Hologram Drone', category: 'Navigation & Tactical', decoy: true, color: '#38bdf8', shape: 'circle', radius: 20, desc: 'Emits fake sensor signatures mimicking a capital-class starship fleet.' },
    { id: 'wreckedShipyardFrame', label: 'Wrecked Orbital Shipyard', category: 'Navigation & Tactical', cover: true, color: '#52525b', shape: 'rect', width: 60, height: 40, desc: 'Huge skeletal station ruin providing physical cover for starships.' }
  ],

  'Planetary': [
    // Major Settlements
    { id: 'sprawlMegacity', label: 'Sprawl Megacity Node', category: 'Major Settlements', scaleTarget: 'Regional', imageUrl: PRESET_OBJECT_SPRITES.sprawlMegacity, color: '#3b82f6', shape: 'hexagon', radius: 45, desc: 'High-density metropolis featuring millions of structures and corporate districts.' },
    { id: 'capitalArcology', label: 'Capital Arcology Monolith', category: 'Major Settlements', scaleTarget: 'Regional', imageUrl: PRESET_OBJECT_SPRITES.sprawlMegacity, color: '#6366f1', shape: 'rect', width: 50, height: 60, desc: 'Self-contained vertical city spire housing government chambers and defenses.' },
    { id: 'orbitalElevator', label: 'Orbital Elevator Surface Hub', category: 'Major Settlements', transit: true, color: '#eab308', shape: 'star', radius: 35, desc: 'Massive tether anchor facility transferring cargo between surface and orbit.' },
    { id: 'subterraneanNestCity', label: 'Subterranean Nest City Gate', category: 'Major Settlements', scaleTarget: 'Regional', imageUrl: PRESET_OBJECT_SPRITES.outpostBunker, color: '#78350f', shape: 'hexagon', radius: 35, desc: 'Underground burrow city entrance protected from harsh surface conditions.' },
    { id: 'floatingAtmosphericHabitat', label: 'Floating Cloud Habitat', category: 'Major Settlements', scaleTarget: 'Regional', imageUrl: PRESET_OBJECT_SPRITES.sprawlMegacity, color: '#38bdf8', shape: 'circle', radius: 40, desc: 'Cloud-suspended settlement optimized for gas giants or toxic atmosphere worlds.' },
    { id: 'underseaDomeComplex', label: 'Undersea Dome Complex', category: 'Major Settlements', scaleTarget: 'Regional', imageUrl: PRESET_OBJECT_SPRITES.sprawlMegacity, color: '#0284c7', shape: 'circle', radius: 40, desc: 'Submerged aquatic colony protected by high-pressure transparent force domes.' },
    { id: 'sunSynchronousCity', label: 'Sun-Synchronous Crawler City', category: 'Major Settlements', scaleTarget: 'Regional', imageUrl: PRESET_OBJECT_SPRITES.sprawlMegacity, color: '#f97316', shape: 'rect', width: 60, height: 40, desc: 'Sprawling crawler metropolis moving along tracks to stay in daylight.' },
    { id: 'geothermalMiningColony', label: 'Geothermal Trench Mining', category: 'Major Settlements', scaleTarget: 'Regional', imageUrl: PRESET_OBJECT_SPRITES.outpostBunker, color: '#dc2626', shape: 'hexagon', radius: 35, desc: 'Sub-crust industrial complex extracting super-heated minerals from vents.' },

    // Geographical Landmarks
    { id: 'tectonicRiftFault', label: 'Tectonic Rift Fault Line', category: 'Geographical Landmarks', barrier: true, color: '#b91c1c', shape: 'line', width: 100, height: 15, desc: 'Massive continental tear exposing subsurface lava or deep canyon passes.' },
    { id: 'supervolcanoCaldera', label: 'Supervolcano Caldera', category: 'Geographical Landmarks', hazard: 'Volcanic Ash', color: '#ea580c', shape: 'circle', radius: 45, desc: 'Active volcanic opening spewing planetary ash clouds and magma rivers.' },
    { id: 'continentalImpactCrater', label: 'Continental Impact Crater', category: 'Geographical Landmarks', resource: 'Extraterrestrial Minerals', color: '#78350f', shape: 'circle', radius: 40, desc: 'Ancient impact basin filled with rare minerals and shock-formed glass.' },
    { id: 'crystallineSpireRidge', label: 'Crystalline Monolith Ridge', category: 'Geographical Landmarks', interference: true, color: '#a855f7', shape: 'hexagon', radius: 35, desc: 'Geological crystal formations disrupting satellite scanning grids.' },
    { id: 'geothermalVentField', label: 'Geothermal Vent Field', category: 'Geographical Landmarks', power: true, color: '#f59e0b', shape: 'circle', radius: 30, desc: 'High-energy thermal output region ideal for geothermal power plants.' },
    { id: 'precursorTitanSkeleton', label: 'Precursor Titan Skeleton', category: 'Geographical Landmarks', fossil: true, color: '#cbd5e1', shape: 'rect', width: 70, height: 25, desc: 'Gigantic fossilized skeletal remains of an ancient organism.' },
    { id: 'magneticPoleAnomaly', label: 'Magnetic Pole Anomaly Ground', category: 'Geographical Landmarks', navigation: true, color: '#06b6d4', shape: 'star', radius: 35, desc: 'Natural magnetic disturbance scrambling automated air transit navigation.' },

    // Strategic Defense
    { id: 'planetaryDefenseCannon', label: 'Planetary Defense Cannon (PDC)', category: 'Strategic Installations', weapon: true, color: '#dc2626', shape: 'rect', width: 50, height: 50, desc: 'Massive surface-to-orbit kinetic/plasma battery targeting orbiting starships.' },
    { id: 'globalForcefieldGenerator', label: 'Global Forcefield Generator', category: 'Strategic Installations', shield: true, color: '#0284c7', shape: 'hexagon', radius: 45, desc: 'Primary shield emitter granting total immunity against planetary orbital strikes.' },
    { id: 'terraformingProcessor', label: 'Terraforming Atmosphere Tower', category: 'Strategic Installations', environment: true, color: '#10b981', shape: 'rect', width: 40, height: 60, desc: 'Industrial tower modifying planetary air composition, temp, and weather.' },
    { id: 'intercontinentalMissileSilo', label: 'Intercontinental Missile Silo', category: 'Strategic Installations', artillery: true, color: '#991b1b', shape: 'rect', width: 45, height: 45, desc: 'Heavy strategic missile bank capable of targeting any continental region.' },
    { id: 'planetaryCommsDish', label: 'Planetary Deep-Space Dish', category: 'Strategic Installations', comms: true, color: '#38bdf8', shape: 'star', radius: 35, desc: 'Massive communication dish broadcasting sector-wide messages.' },
    { id: 'surfaceMassDriver', label: 'Surface Orbital Mass Driver', category: 'Strategic Installations', industrial: true, color: '#d97706', shape: 'rect', width: 65, height: 30, desc: 'Electromagnetic launch rail launching heavy mined payload pods into orbit.' },
    { id: 'weatherControlSpire', label: 'Atmospheric Weather Spire', category: 'Strategic Installations', weather: true, color: '#06b6d4', shape: 'star', radius: 35, desc: 'Facility capable of triggering localized hurricanes, blizzards, or clear skies.' }
  ],

  'Regional': [
    // Settlements & Outposts
    { id: 'frontierMiningSettlement', label: 'Frontier Mining Settlement', category: 'Settlements & Outposts', scaleTarget: 'City/Town', color: '#d97706', shape: 'rect', width: 45, height: 35, desc: 'Isolated mining community providing raw materials and worker trade.' },
    { id: 'fortifiedMilitaryOutpost', label: 'Fortified Military Outpost', category: 'Settlements & Outposts', scaleTarget: 'City/Town', color: '#dc2626', shape: 'hexagon', radius: 35, desc: 'Reinforced garrison featuring radar towers, turrets, and landing pads.' },
    { id: 'smugglerHaven', label: 'Smuggler Haven / Pirate Cove', category: 'Settlements & Outposts', scaleTarget: 'City/Town', color: '#78350f', shape: 'rect', width: 40, height: 30, desc: 'Hidden lawless black-market hub nestled in canyons or dense jungle.' },
    { id: 'researchStation', label: 'Scientific Research Enclave', category: 'Settlements & Outposts', scaleTarget: 'City/Town', color: '#0284c7', shape: 'hexagon', radius: 30, desc: 'High-tech laboratory studying alien fauna and flora anomalies.' },
    { id: 'tribalEncampment', label: 'Indigenous Tribal Encampment', category: 'Settlements & Outposts', neutral: true, color: '#16a34a', shape: 'circle', radius: 25, desc: 'Local native habitat providing regional pathfinding knowledge and guides.' },
    { id: 'refugeeTentCity', label: 'Refugee Tent City', category: 'Settlements & Outposts', civilian: true, color: '#eab308', shape: 'rect', width: 45, height: 30, desc: 'Crowded temporary encampment vulnerable to resource shortages.' },
    { id: 'borderCheckpointGate', label: 'Fortified Border Checkpoint', category: 'Settlements & Outposts', chokepoint: true, color: '#64748b', shape: 'rect', width: 50, height: 20, desc: 'Armored wall segment spanning a mountain pass to control vehicle transit.' },
    { id: 'smugglerAirfield', label: 'Smuggler Black-Market Airfield', category: 'Settlements & Outposts', transit: true, color: '#57534e', shape: 'rect', width: 60, height: 25, desc: 'Hidden dirt runway for illicit cargo drops surrounded by anti-air guns.' },

    // Infrastructure
    { id: 'maglevMonorailTrack', label: 'Maglev Monorail Track Line', category: 'Infrastructure', transit: true, color: '#38bdf8', shape: 'line', width: 100, height: 10, desc: 'High-speed rail network facilitating rapid unit transit across regions.' },
    { id: 'pavedHighway', label: 'Paved Arterial Highway', category: 'Infrastructure', speedBonus: true, color: '#334155', shape: 'line', width: 100, height: 12, desc: 'Reinforced roadway increasing ground vehicle speed by +50%.' },
    { id: 'heavySuspensionBridge', label: 'Heavy Suspension Bridge', category: 'Infrastructure', destructible: true, color: '#475569', shape: 'rect', width: 60, height: 15, desc: 'Steel bridge spanning wide ravines; vulnerable to demolition charges.' },
    { id: 'highPressurePipeline', label: 'High-Pressure Gas Pipeline', category: 'Infrastructure', explosive: true, color: '#ef4444', shape: 'line', width: 90, height: 8, desc: 'Explosive energy conduit running across provinces; explodes if breached.' },
    { id: 'hydroelectricDam', label: 'Hydroelectric Dam Complex', category: 'Infrastructure', power: true, color: '#0284c7', shape: 'rect', width: 70, height: 25, desc: 'Massive water barrier regulating river flow and supplying city power.' },
    { id: 'regionalSolarFarm', label: 'Regional Solar Panel Farm', category: 'Infrastructure', power: true, color: '#f59e0b', shape: 'rect', width: 55, height: 40, desc: 'Sprawling energy field providing clean electrical power to settlements.' },
    { id: 'geothermalBoreStation', label: 'Geothermal Bore Station', category: 'Infrastructure', power: true, color: '#b91c1c', shape: 'hexagon', radius: 30, desc: 'Industrial drill rig harnessing volcanic heat for manufacturing.' },
    { id: 'automatedRadarArray', label: 'Automated Radar Array Station', category: 'Infrastructure', intel: true, color: '#06b6d4', shape: 'star', radius: 25, desc: 'High-frequency antenna revealing unit movements across neighboring hexes.' },
    { id: 'subSurfaceMaglevDepot', label: 'Sub-Surface Maglev Depot', category: 'Infrastructure', covert: true, color: '#1e1b4b', shape: 'rect', width: 50, height: 35, desc: 'Underground train depot allowing covert movement beneath enemy territory.' },

    // Exploration POIs
    { id: 'ancientAlienTemple', label: 'Ancient Alien Temple Ruins', category: 'Exploration POIs', lore: true, color: '#10b981', shape: 'hexagon', radius: 35, desc: 'Unknown stone or metallic structures harboring artifacts and traps.' },
    { id: 'crashedCapitalShip', label: 'Crashed Capital Ship Hulk', category: 'Exploration POIs', dungeon: true, color: '#64748b', shape: 'rect', width: 75, height: 40, desc: 'Massive starship wreck providing multi-level exploration opportunities.' },
    { id: 'deepCaveEntrance', label: 'Deep Cave System Entrance', category: 'Exploration POIs', scaleTarget: 'Interior', color: '#1e293b', shape: 'circle', radius: 30, desc: 'Entrance to underground caverns, spider nests, or subterranean bases.' },
    { id: 'oreVeinOutcrop', label: 'High-Yield Ore Vein Outcrop', category: 'Exploration POIs', resource: true, color: '#b45309', shape: 'hexagon', radius: 25, desc: 'Exposed geological seam containing copper, titanium, or exotic isotopes.' },
    { id: 'alienFaunaBreeding', label: 'Alien Fauna Breeding Ground', category: 'Exploration POIs', hostile: true, color: '#84cc16', shape: 'circle', radius: 35, desc: 'High-density predator nest posing extreme danger to unarmored caravans.' },
    { id: 'precursorObelisk', label: 'Precursor Obelisk Monolith', category: 'Exploration POIs', buff: true, color: '#a855f7', shape: 'star', radius: 30, desc: 'Glowing monolith granting temporary sensor buffs or psionic status effects.' },
    { id: 'fallenSatelliteDebris', label: 'Fallen Satellite Debris Field', category: 'Exploration POIs', salvage: true, color: '#94a3b8', shape: 'rect', width: 40, height: 30, desc: 'Downed surveillance satellite offering valuable encryption keys and tech.' },
    { id: 'toxicSpillCrater', label: 'Toxic Chemical Spill Crater', category: 'Exploration POIs', hazard: true, color: '#16a34a', shape: 'circle', radius: 30, desc: 'Hazardous industrial crash site requiring hazmat suits to scavenge.' }
  ],

  'City/Town': [
    // Architectural Buildings
    { id: 'corporateHQ', label: 'Corporate Headquarters Tower', category: 'Architectural Buildings', scaleTarget: 'Exterior', color: '#3b82f6', shape: 'rect', width: 65, height: 65, desc: 'High-rise skyscraper with glass facade, rooftop helipad, and heavy security.' },
    { id: 'tenementHousing', label: 'Tenement Housing Block', category: 'Architectural Buildings', scaleTarget: 'Exterior', color: '#64748b', shape: 'rect', width: 55, height: 50, desc: 'High-density apartment residential unit with alleyways and fire escapes.' },
    { id: 'manufactoryComplex', label: 'Industrial Manufactory Complex', category: 'Architectural Buildings', scaleTarget: 'Exterior', color: '#d97706', shape: 'rect', width: 70, height: 55, desc: 'Heavy manufacturing plant with smokestacks, assembly lines, and docks.' },
    { id: 'commercialPlazaMall', label: 'Commercial Plaza Mall', category: 'Architectural Buildings', scaleTarget: 'Exterior', color: '#10b981', shape: 'rect', width: 60, height: 60, desc: 'Multi-story shopping center with atrium spaces, storefronts, and escalators.' },
    { id: 'subSurfaceTransitHub', label: 'Sub-Surface Transit Hub', category: 'Architectural Buildings', scaleTarget: 'Exterior', color: '#0284c7', shape: 'hexagon', radius: 35, desc: 'Underground train terminal connecting city districts.' },
    { id: 'governmentArcology', label: 'Government Arcology Center', category: 'Architectural Buildings', scaleTarget: 'Exterior', color: '#6366f1', shape: 'hexagon', radius: 45, desc: 'Heavily armored bureaucratic center with courtrooms and archives.' },
    { id: 'undergroundCantina', label: 'Underground Cantina Speakeasy', category: 'Architectural Buildings', scaleTarget: 'Interior', color: '#9333ea', shape: 'rect', width: 40, height: 35, desc: 'Low-lit nightlife establishment for mercenary recruitment and info brokering.' },
    { id: 'traumaMedicalCenter', label: 'Trauma Medical Center', category: 'Architectural Buildings', scaleTarget: 'Exterior', color: '#ef4444', shape: 'rect', width: 55, height: 45, desc: 'Modern hospital featuring intensive care units, bio-labs, and ambulance bays.' },
    { id: 'executivePenthouse', label: 'Executive Corporate Penthouse', category: 'Architectural Buildings', scaleTarget: 'Interior', color: '#f59e0b', shape: 'star', radius: 35, desc: 'Luxury high-rise suite featuring private security grids and landing pads.' },
    { id: 'blackMarketBazaar', label: 'Underground Black Market Bazaar', category: 'Architectural Buildings', scaleTarget: 'Interior', color: '#78350f', shape: 'hexagon', radius: 40, desc: 'Crowded subterranean network of illicit tech vendors and arms dealers.' },
    { id: 'automatedFactoryPlant', label: 'Automated Factory Plant', category: 'Architectural Buildings', scaleTarget: 'Exterior', color: '#475569', shape: 'rect', width: 65, height: 50, desc: 'Robotic production plant filled with active machinery and conveyer belts.' },

    // Defensive & Transit
    { id: 'perimeterWallSection', label: 'Modular Perimeter Wall', category: 'Defensive & Infrastructure', blocker: true, color: '#334155', shape: 'rect', width: 60, height: 15, desc: 'Heavy concrete/steel wall insulating high-security corporate sectors.' },
    { id: 'securityCheckpointGate', label: 'Automated Security Checkpoint', category: 'Defensive & Infrastructure', hackable: true, color: '#38bdf8', shape: 'rect', width: 40, height: 20, desc: 'Controlled vehicle access gate equipped with ID scanners and turrets.' },
    { id: 'skybridgeWalkway', label: 'Skybridge Overhead Walkway', category: 'Defensive & Infrastructure', elevated: true, color: '#06b6d4', shape: 'rect', width: 70, height: 12, desc: 'Enclosed glass walkway connecting upper levels of opposite buildings.' },
    { id: 'electricalSubstation', label: 'High-Voltage Substation', category: 'Defensive & Infrastructure', explosive: true, color: '#eab308', shape: 'rect', width: 45, height: 35, desc: 'Power grid relay node; explodes violently if subjected to heavy gunfire.' },
    { id: 'drainageGateValve', label: 'Underground Drainage Gate Valve', category: 'Defensive & Infrastructure', covert: true, color: '#52525b', shape: 'circle', radius: 20, desc: 'Sewer maintenance access point facilitating covert infiltrations.' },
    { id: 'policeRiotBarrier', label: 'Police Anti-Riot Barrier', category: 'Defensive & Infrastructure', cover: true, color: '#1d4ed8', shape: 'rect', width: 35, height: 10, desc: 'Portable energetic or physical barricade deployed during martial law.' },
    { id: 'automatedSentryTurret', label: 'Automated Sentry Turret Nest', category: 'Defensive & Infrastructure', hostile: true, color: '#dc2626', shape: 'circle', radius: 18, desc: 'Fixed ceiling or ground turret targeting unsanctioned personnel on sight.' },

    // Street Props & Clutter
    { id: 'neonBillboard', label: 'Holographic Neon Billboard', category: 'Street Props & Clutter', light: true, color: '#c026d3', shape: 'rect', width: 40, height: 10, desc: 'Animated advertising projection casting dynamic ambient color light.' },
    { id: 'streetlampPole', label: 'Streetlamp Light Pole', category: 'Street Props & Clutter', destructible: true, color: '#fef08a', shape: 'circle', radius: 10, desc: 'Provides localized street illumination; can be shot out for stealth.' },
    { id: 'dumpsterBin', label: 'Industrial Dumpster Bin', category: 'Street Props & Clutter', hideout: true, color: '#16a34a', shape: 'rect', width: 25, height: 15, desc: 'Metal trash container providing total cover or a place to hide bodies.' },
    { id: 'parkedGroundcraft', label: 'Parked Groundcraft / Hovercar', category: 'Street Props & Clutter', explosive: true, color: '#3b82f6', shape: 'rect', width: 35, height: 20, desc: 'Street vehicle providing half-cover; engine explodes on critical damage.' },
    { id: 'vendingKiosk', label: 'Automated Vending Kiosk', category: 'Street Props & Clutter', interactable: true, color: '#06b6d4', shape: 'rect', width: 20, height: 15, desc: 'Dispenses food, medical stims, or drinks upon credit chit insertion.' },
    { id: 'busStopShelter', label: 'Elevated Bus Stop Shelter', category: 'Street Props & Clutter', cover: true, color: '#94a3b8', shape: 'rect', width: 30, height: 12, desc: 'Glass-and-steel passenger bench offering light cover.' },
    { id: 'newsTerminal', label: 'Interactive News Terminal', category: 'Street Props & Clutter', lore: true, color: '#38bdf8', shape: 'rect', width: 18, height: 12, desc: 'Public display broadcasting regional propaganda and security warnings.' },
    { id: 'trashCompactor', label: 'Industrial Trash Compactor', category: 'Street Props & Clutter', hazard: true, color: '#475569', shape: 'rect', width: 35, height: 30, desc: 'Heavy hydraulic crushing unit capable of pulverizing objects or agents.' },
    { id: 'oxygenDispenser', label: 'Emergency Oxygen Booth', category: 'Street Props & Clutter', healing: true, color: '#10b981', shape: 'rect', width: 20, height: 20, desc: 'Street-side respiratory booth restoring stamina in toxic city air.' },
    { id: 'armoredTransport', label: 'Parked Armored Transport', category: 'Street Props & Clutter', driveable: true, color: '#1e293b', shape: 'rect', width: 45, height: 25, desc: 'Reinforced armored police van capable of being hotwired and driven.' }
  ],

  'Exterior': [
    // Cover & Barriers
    { id: 'concreteJerseyBarrier', label: 'Concrete Jersey Barrier', category: 'Cover & Barriers', cover: '+2 AC', color: '#64748b', shape: 'rect', width: 35, height: 12, desc: 'Heavy pre-cast barrier absorbing kinetic bullet fire (+2 AC).' },
    { id: 'sandbagFortification', label: 'Sandbag Fortification Wall', category: 'Cover & Barriers', destructible: true, color: '#d97706', shape: 'rect', width: 40, height: 14, desc: 'Stacked sandbags absorbing blast fragments and small arms fire.' },
    { id: 'naturalBoulder', label: 'Natural Boulder Formation', category: 'Cover & Barriers', cover: '+4 AC', color: '#475569', shape: 'hexagon', radius: 22, desc: 'Hard stone outcropping completely blocking line of sight.' },
    { id: 'foliageTreeTrunk', label: 'Dense Foliage / Tree Trunk', category: 'Cover & Barriers', concealment: true, color: '#15803d', shape: 'circle', radius: 20, desc: 'Tree trunks provide half cover (+2 AC); bushes conceal.' },
    { id: 'intermodalCargoCrate', label: 'Intermodal Cargo Crate Stack', category: 'Cover & Barriers', cover: 'Full', color: '#0284c7', shape: 'rect', width: 45, height: 25, desc: 'Industrial metal shipping containers blocking sight lines.' },
    { id: 'scrapMetalPile', label: 'Scrap Metal Scrap Pile', category: 'Cover & Barriers', cover: 'Variable', color: '#78350f', shape: 'hexagon', radius: 25, desc: 'Irregular pile of compressed vehicle parts offering partial cover.' },
    { id: 'destroyedVehicle', label: 'Destroyed Vehicle Wreckage', category: 'Cover & Barriers', cover: 'Full', color: '#334155', shape: 'rect', width: 40, height: 22, desc: 'Burnt-out chassis providing heavy structural cover; leaks smoke.' },
    { id: 'infantryTrench', label: 'Entrenched Infantry Trench', category: 'Cover & Barriers', cover: '+4 DEF', color: '#92400e', shape: 'line', width: 70, height: 16, desc: 'Earthwork trench granting +4 Defense against direct surface fire.' },
    { id: 'dragonsTeeth', label: 'Reinforced Dragon\'s Teeth', category: 'Cover & Barriers', antiVehicle: true, color: '#71717a', shape: 'triangle', radius: 18, desc: 'Heavy triangular concrete blocks stopping ground vehicles.' },
    { id: 'sandbagBunker', label: 'Sandbag Bunker Emplacement', category: 'Cover & Barriers', roof: true, color: '#b45309', shape: 'rect', width: 45, height: 35, desc: 'Fortified firing position providing overhead protection from mortars.' },
    { id: 'crashedDropship', label: 'Crashed Dropship Chassis', category: 'Cover & Barriers', cover: 'Full', color: '#1e293b', shape: 'rect', width: 60, height: 30, desc: 'Burning transport hull acting as central cover and holding supplies.' },
    { id: 'retainingWall', label: 'Modular Concrete Retaining Wall', category: 'Cover & Barriers', cover: 'Full', color: '#52525b', shape: 'rect', width: 50, height: 15, desc: 'Thick construction wall segment preventing lateral line of sight.' },

    // Site Access & Features
    { id: 'facilityOuterWall', label: 'Reinforced Facility Outer Wall', category: 'Site Features', boundary: true, color: '#1e1b4b', shape: 'rect', width: 80, height: 18, desc: 'Thick composite wall defining perimeter bounds.' },
    { id: 'mainAirlockDoor', label: 'Heavy Main Airlock Door', category: 'Site Features', scaleTarget: 'Interior', color: '#eab308', shape: 'rect', width: 35, height: 15, desc: 'Primary pressure-sealed entrance leading into interior floor plans.' },
    { id: 'loadingAccessRamp', label: 'Concrete Loading Access Ramp', category: 'Site Features', elevation: true, color: '#475569', shape: 'rect', width: 50, height: 30, desc: 'Sloped roadway enabling vehicle access into subterranean bays.' },
    { id: 'guardSecurityBooth', label: 'Guard Security Booth', category: 'Site Features', sentry: true, color: '#3b82f6', shape: 'rect', width: 25, height: 25, desc: 'Lightly armored sentry shack with terminal controls for outer gates.' },
    { id: 'industrialGantries', label: 'Industrial Gantries & Stairs', category: 'Site Features', elevated: true, color: '#06b6d4', shape: 'rect', width: 55, height: 20, desc: 'Framework walkways allowing rooftop or catwalk combat positioning.' },
    { id: 'chainlinkFence', label: 'Razor Wire Chainlink Fence', category: 'Site Features', interdictor: true, color: '#94a3b8', shape: 'line', width: 60, height: 8, desc: 'Restricts foot movement; can be cut with wire cutters or breached.' },
    { id: 'hardenedLandingPad', label: 'Hardened Landing Pad / Helipad', category: 'Site Features', extraction: true, color: '#f59e0b', shape: 'circle', radius: 45, desc: 'Concrete/steel circular pad marked with navigation lighting.' },
    { id: 'fuelStorageRamp', label: 'Fuel Storage Access Ramp', category: 'Site Features', underground: true, color: '#b91c1c', shape: 'rect', width: 45, height: 25, desc: 'Sloped concrete ramp leading to underground volatile fuel depots.' },
    { id: 'securityDogEnclosure', label: 'Security Guard Dog Enclosure', category: 'Site Features', hostile: true, color: '#dc2626', shape: 'rect', width: 35, height: 30, desc: 'High-fenced pen housing automated attack hounds or security beasts.' },

    // Tactical Machinery
    { id: 'dieselFusionGenerator', label: 'Diesel / Fusion Generator Unit', category: 'Tactical Machinery', power: true, color: '#0284c7', shape: 'rect', width: 35, height: 25, desc: 'Supplies electrical power to compound floodlights and turrets.' },
    { id: 'volatileFuelTank', label: 'Volatile Fuel Storage Tank', category: 'Tactical Machinery', explosive: true, color: '#dc2626', shape: 'circle', radius: 25, desc: 'Massive pressurized tank; detonates in a 15-ft radius if destroyed.' },
    { id: 'hvacAirUnit', label: 'HVAC Exterior Air Handling Unit', category: 'Tactical Machinery', soundMask: true, color: '#64748b', shape: 'rect', width: 30, height: 25, desc: 'Generates loud ambient fan noise, masking player footstep sound.' },
    { id: 'floodlightAssembly', label: 'High-Intensity Floodlight', category: 'Tactical Machinery', light: true, color: '#fef08a', shape: 'star', radius: 20, desc: 'Rotatable light post illuminating stealth units caught in its cone.' },
    { id: 'securityCameraNode', label: 'Perimeter Security Camera', category: 'Tactical Machinery', surveillance: true, color: '#06b6d4', shape: 'circle', radius: 15, desc: 'Swiveling camera sweep detecting intruders and triggering alarms.' },
    { id: 'satelliteDishArray', label: 'Satellite Sensor Array Dish', category: 'Tactical Machinery', objective: true, color: '#38bdf8', shape: 'star', radius: 25, desc: 'Parabolic dish array transmitting encrypted data to orbital assets.' },
    { id: 'explosiveFuelBarrel', label: 'Explosive Red Fuel Barrel', category: 'Tactical Machinery', hazard: '10-ft Radius Fire', color: '#ef4444', shape: 'circle', radius: 12, desc: 'Classic tactical barrel exploding in a 10-ft fire radius on destruction.' },
    { id: 'industrialTowerCrane', label: 'Heavy Industrial Tower Crane', category: 'Tactical Machinery', interactive: true, color: '#eab308', shape: 'rect', width: 60, height: 35, desc: 'Massive crane capable of swinging hanging crates to alter cover.' },
    { id: 'perimeterMinefield', label: 'Perimeter Minefield Marker', category: 'Tactical Machinery', minefield: true, color: '#991b1b', shape: 'hexagon', radius: 25, desc: 'Zone seeded with buried anti-personnel proximity landmines.' },
    { id: 'acousticMotionSensor', label: 'Portable Acoustic Motion Sensor', category: 'Tactical Machinery', detection: true, color: '#a855f7', shape: 'circle', radius: 12, desc: 'Small tripod device pinging movement through smoke or darkness.' }
  ],

  'Interior': [
    // Structural Elements
    { id: 'interiorWallPanel', label: 'Modular Interior Wall Panel', category: 'Structural Elements', blocker: true, color: '#334155', shape: 'rect', width: 45, height: 10, desc: 'Standard dry/composite interior wall segment blocking sight & movement.' },
    { id: 'glassPartition', label: 'Glass Soundproof Partition', category: 'Structural Elements', transparent: true, color: '#38bdf8', shape: 'rect', width: 45, height: 8, desc: 'Blocks foot movement & sound while permitting clear line of sight.' },
    { id: 'slidingAirlockDoor', label: 'Motorized Sliding Airlock Door', category: 'Structural Elements', interactable: true, color: '#10b981', shape: 'rect', width: 30, height: 10, desc: 'Automated door opening on proximity or keycard swipe.' },
    { id: 'reinforcedBlastDoor', label: 'Heavy Reinforced Blast Door', category: 'Structural Elements', locked: true, color: '#dc2626', shape: 'rect', width: 35, height: 12, desc: 'High-HP door requiring thermal lances, breaching charges, or hacking.' },
    { id: 'floorHatchLadder', label: 'Floor Hatch Door & Ladder', category: 'Structural Elements', transition: true, color: '#d97706', shape: 'circle', radius: 15, desc: 'Access hatch opening to lower sub-deck levels or crawlspaces.' },
    { id: 'crawlspaceVent', label: 'Maintenance Crawlspace Vent', category: 'Structural Elements', flank: true, color: '#64748b', shape: 'rect', width: 20, height: 10, desc: 'Narrow duct passable only by crouching infantry, bypassing guards.' },
    { id: 'elevatorShaft', label: 'Elevator Shaft Assembly', category: 'Structural Elements', vertical: true, color: '#0284c7', shape: 'rect', width: 30, height: 30, desc: 'Multi-floor lift car or open shaft with climbing cables.' },
    { id: 'reinforcedBulkhead', label: 'Heavy Bulkhead Gate', category: 'Structural Elements', pressureSeal: true, color: '#991b1b', shape: 'rect', width: 40, height: 12, desc: 'Airtight warship door locking down compartments experiencing air leaks.' },
    { id: 'observationBayWindow', label: 'Bulletproof Observation Window', category: 'Structural Elements', transparent: true, color: '#93c5fd', shape: 'rect', width: 50, height: 8, desc: 'Heavy armored window withstanding high kinetic fire.' },

    // Tech & Processing
    { id: 'mainframeServerRack', label: 'Mainframe Server Rack Cabinet', category: 'Tech & Processing', hackable: true, color: '#0284c7', shape: 'rect', width: 25, height: 35, desc: 'Tall electronics rack providing half-cover and holding encrypted files.' },
    { id: 'holographicCommandTable', label: 'Holographic Strategy Table', category: 'Tech & Processing', interactable: true, color: '#06b6d4', shape: 'circle', radius: 25, desc: 'Displays active site map schematics; grants vision when activated.' },
    { id: 'diagnosticsConsole', label: 'Diagnostics Control Console', category: 'Tech & Processing', terminal: true, color: '#38bdf8', shape: 'rect', width: 25, height: 18, desc: 'Interface terminal used to toggle room lighting, doors, or fans.' },
    { id: 'cryoStasisChamber', label: 'Cryo-Stasis Chamber Pod', category: 'Tech & Processing', scaleTarget: 'Container', color: '#67e8f9', shape: 'rect', width: 22, height: 35, desc: 'Frozen hibernation capsule holding personnel or specimen targets.' },
    { id: 'bioContainmentTank', label: 'Bio-Containment Isolation Tank', category: 'Tech & Processing', destructible: true, color: '#84cc16', shape: 'circle', radius: 20, desc: 'Glass liquid cylinder holding specimens; spills biohazard on breach.' },
    { id: 'surgicalPod', label: 'Automated Surgical Pod', category: 'Tech & Processing', healing: true, color: '#10b981', shape: 'rect', width: 30, height: 20, desc: 'Medical pod capable of treating trauma or installing cyberware.' },
    { id: 'industrialWorkstation', label: 'Heavy Industrial Workstation', category: 'Tech & Processing', crafting: true, color: '#d97706', shape: 'rect', width: 35, height: 25, desc: 'Tool bench equipped with plasma torches for repairing hardware.' },
    { id: 'deconShowerBooth', label: 'Decontamination Shower Booth', category: 'Tech & Processing', purge: true, color: '#06b6d4', shape: 'rect', width: 22, height: 22, desc: 'High-pressure chemical wash booth neutralizing radiation & toxins.' },
    { id: 'quantumProcessingCore', label: 'Quantum Processing Core', category: 'Tech & Processing', objective: true, color: '#a855f7', shape: 'star', radius: 25, desc: 'Central computing sphere emitting hum and particle glows.' },

    // Living Quarters & Amenity
    { id: 'bunkBedUnit', label: 'Bunk Bed Unit', category: 'Living & Amenity', rest: true, color: '#475569', shape: 'rect', width: 30, height: 18, desc: 'Stacked crew sleeping bunks providing rest and search opportunities.' },
    { id: 'officerDesk', label: 'Officer Executive Desk', category: 'Living & Amenity', intel: true, color: '#78350f', shape: 'rect', width: 28, height: 18, desc: 'Wood or steel desk holding datapads and keycards.' },
    { id: 'messHallTable', label: 'Modular Mess Hall Table', category: 'Living & Amenity', cover: true, color: '#64748b', shape: 'rect', width: 35, height: 20, desc: 'Long dining table offering low-profile cover.' },
    { id: 'gunLockerRacks', label: 'Armored Gun Locker Racks', category: 'Living & Amenity', scaleTarget: 'Container', color: '#1e293b', shape: 'rect', width: 35, height: 15, desc: 'Secured firearms storage containing ammo and sidearms.' },
    { id: 'synthesizerBar', label: 'Synthesizer Bar Terminal', category: 'Living & Amenity', consumable: true, color: '#ec4899', shape: 'rect', width: 30, height: 15, desc: 'Food and drink dispenser for crew morale.' },
    { id: 'medicalExamBed', label: 'Medical Examination Bed', category: 'Living & Amenity', healing: true, color: '#ef4444', shape: 'rect', width: 28, height: 16, desc: 'Adjustable clinical bed with health monitor displays.' },
    { id: 'personalLocker', label: 'Personal Storage Locker', category: 'Living & Amenity', scaleTarget: 'Container', color: '#52525b', shape: 'rect', width: 18, height: 18, desc: 'Individual footlocker holding personal effects and credits.' },

    // Security & Environment
    { id: 'ceilingTurret', label: 'Automated Ceiling Turret', category: 'Security & Environment', hostile: true, color: '#dc2626', shape: 'circle', radius: 15, desc: 'Ceiling-mounted weapon pod firing on unsanctioned targets.' },
    { id: 'laserBarrierGrid', label: 'Security Laser Barrier Grid', category: 'Security & Environment', alarm: true, color: '#ef4444', shape: 'line', width: 40, height: 5, desc: 'Invisible or visible laser beam tripwire triggering lockdown.' },
    { id: 'fireExtinctionCylinder', label: 'Fire Extinction Cylinder', category: 'Security & Environment', smoke: true, color: '#38bdf8', shape: 'circle', radius: 12, desc: 'Pressurized cylinder dispersing fire retardant cloud masking vision.' },
    { id: 'emergencyWallLight', label: 'Emergency Wall Light', category: 'Security & Environment', light: true, color: '#f59e0b', shape: 'circle', radius: 10, desc: 'Red ambient strobe light indicating lockdown or low power.' },
    { id: 'pressureReliefVent', label: 'Pressure Relief Vent', category: 'Security & Environment', hazard: true, color: '#94a3b8', shape: 'rect', width: 15, height: 15, desc: 'Vents super-heated steam periodically across hallway.' },
    { id: 'exposedVoltageCable', label: 'Exposed High-Voltage Cable', category: 'Security & Environment', shock: true, color: '#eab308', shape: 'line', width: 30, height: 6, desc: 'Sparks periodically dealing electric shock to passing units.' },
    { id: 'hazmatBarrelStack', label: 'Hazardous Material Barrels', category: 'Security & Environment', toxic: true, color: '#84cc16', shape: 'circle', radius: 16, desc: 'Yellow chemical containers leaking toxic fumes.' }
  ],

  'Container': [
    // Weapons & Armament
    { id: 'plasmaRifle', label: 'Plasma Assault Rifle', category: 'Weapons & Armament', slots: 6, color: '#38bdf8', shape: 'rect', width: 40, height: 15, desc: 'High-energy plasma rifle dealing severe thermal/energy damage.' },
    { id: 'kineticSmg', label: 'Kinetic Submachine Gun', category: 'Weapons & Armament', slots: 4, color: '#94a3b8', shape: 'rect', width: 30, height: 15, desc: 'Compact rapid-fire ballistic weapon for close quarters.' },
    { id: 'powerBlade', label: 'High-Frequency Power Blade', category: 'Weapons & Armament', slots: 3, color: '#a855f7', shape: 'rect', width: 35, height: 10, desc: 'Vibrating monomolecular blade cutting through composite armor.' },
    { id: 'antimatterCannon', label: 'Heavy Antimatter Cannon', category: 'Weapons & Armament', slots: 10, color: '#991b1b', shape: 'rect', width: 55, height: 20, desc: 'Massive heavy ordnance weapon obliterating armored targets.' },
    { id: 'pulsePistol', label: 'Pulse Pistol', category: 'Weapons & Armament', slots: 2, color: '#0284c7', shape: 'rect', width: 20, height: 12, desc: 'Reliable sidearm firing condensed energy bolts.' },
    { id: 'thermalGrenade', label: 'Thermal Detonator Grenade', category: 'Weapons & Armament', slots: 1, color: '#ef4444', shape: 'circle', radius: 10, desc: 'High-yield explosive sphere generating fusion heat.' },
    { id: 'empBreachCharge', label: 'EMP Breach Charge', category: 'Weapons & Armament', slots: 2, color: '#06b6d4', shape: 'rect', width: 18, height: 14, desc: 'Directional charge disabling electronics and blast doors.' },
    { id: 'microMissilePod', label: 'Micro-Missile Pod', category: 'Weapons & Armament', slots: 6, color: '#d97706', shape: 'rect', width: 35, height: 18, desc: 'Shoulder-mounted pod launching guided micro-projectiles.' },
    { id: 'railgunSniper', label: 'Precision Railgun Sniper', category: 'Weapons & Armament', slots: 8, color: '#334155', shape: 'rect', width: 50, height: 12, desc: 'Hyper-velocity electromagnetic rifle for long-range targets.' },
    { id: 'particleBeamSidearm', label: 'Particle Beam Sidearm', category: 'Weapons & Armament', slots: 2, color: '#ec4899', shape: 'rect', width: 22, height: 12, desc: 'High-tech pistol projecting focused charged particles.' },

    // Armor & Gear
    { id: 'compositePowerArmor', label: 'Heavy Composite Power Armor', category: 'Armor & Gear', slots: 12, color: '#475569', shape: 'rect', width: 45, height: 35, desc: 'Fully enclosed powered exoskeleton with built-in kinetic plating.' },
    { id: 'stealthSuit', label: 'Tactical Recon Stealth Suit', category: 'Armor & Gear', slots: 6, color: '#1e1b4b', shape: 'rect', width: 35, height: 25, desc: 'Lightweight suit equipped with optical bending cloaking weaves.' },
    { id: 'hazmatSuit', label: 'Hazmat Environmental Suit', category: 'Armor & Gear', slots: 6, color: '#eab308', shape: 'rect', width: 35, height: 25, desc: 'Sealed environmental suit shielding against radiation and biohazards.' },
    { id: 'energyShieldGen', label: 'Kinetic Energy Shield Gen', category: 'Armor & Gear', slots: 3, color: '#3b82f6', shape: 'circle', radius: 15, desc: 'Personal generator projecting deflection barrier.' },
    { id: 'thermalCamouflageCloak', label: 'Thermal Camouflage Cloak', category: 'Armor & Gear', slots: 3, color: '#0f766e', shape: 'rect', width: 25, height: 20, desc: 'Dampens infrared thermal signatures to evade heat sensors.' },
    { id: 'combatHelmet', label: 'Reinforced Combat Helmet', category: 'Armor & Gear', slots: 4, color: '#52525b', shape: 'circle', radius: 16, desc: 'Tactical helmet equipped with night vision HUD and comms.' },
    { id: 'exoskeletonFrame', label: 'Exoskeleton Power Frame', category: 'Armor & Gear', slots: 8, color: '#b45309', shape: 'rect', width: 40, height: 30, desc: 'Motorized frame increasing carrying capacity and melee force.' },
    { id: 'atmosphericMask', label: 'Atmospheric Filtration Mask', category: 'Armor & Gear', slots: 2, color: '#64748b', shape: 'rect', width: 16, height: 14, desc: 'Filters airborne neurotoxins and hazardous dust particulates.' },

    // Ammo & Fuel
    { id: 'kineticAmmoBox', label: 'High-Caliber Kinetic Ammo Box', category: 'Ammo & Fuel', slots: 2, color: '#d97706', shape: 'rect', width: 20, height: 12, desc: 'Container holding 120 rounds of high-velocity ammunition.' },
    { id: 'microFusionCell', label: 'Micro-Fusion Energy Cell', category: 'Ammo & Fuel', slots: 1, color: '#38bdf8', shape: 'rect', width: 14, height: 14, desc: 'Compact fusion cell powering energy weapons and gadgets.' },
    { id: 'plasmaCanister', label: 'Volatile Plasma Canister', category: 'Ammo & Fuel', slots: 2, color: '#ef4444', shape: 'rect', width: 16, height: 20, desc: 'Pressurized magnetic flask containing super-heated plasma fuel.' },
    { id: 'hydrogenFuelCell', label: 'Liquid Hydrogen Fuel Cell', category: 'Ammo & Fuel', slots: 3, color: '#0284c7', shape: 'rect', width: 20, height: 22, desc: 'Cryogenic fuel cell powering starship auxiliary engines.' },
    { id: 'gaussSpikeMag', label: 'Gauss Spike Magazine', category: 'Ammo & Fuel', slots: 2, color: '#64748b', shape: 'rect', width: 18, height: 10, desc: 'Ferromagnetic projectile magazine for railguns.' },
    { id: 'naniteBatteryPack', label: 'Nanite Battery Pack', category: 'Ammo & Fuel', slots: 2, color: '#10b981', shape: 'rect', width: 16, height: 16, desc: 'Rechargeable power unit for cybernetic augmentations.' },
    { id: 'mortarShells', label: 'Explosive Mortar Shells', category: 'Ammo & Fuel', slots: 4, color: '#991b1b', shape: 'rect', width: 25, height: 15, desc: 'Heavy explosive artillery rounds.' },

    // Medical & Consumables
    { id: 'traumaMedkit', label: 'Trauma Emergency Medkit', category: 'Medical & Consumables', slots: 3, color: '#ef4444', shape: 'rect', width: 22, height: 18, desc: 'Complete field surgical kit restoring health and closing wounds.' },
    { id: 'adrenalineStim', label: 'Adrenaline Injector Stim', category: 'Medical & Consumables', slots: 1, color: '#f59e0b', shape: 'rect', width: 10, height: 16, desc: 'Combat stimulant boosting movement speed and reflex initiative.' },
    { id: 'syntheticBloodPack', label: 'Synthetic Blood Pack', category: 'Medical & Consumables', slots: 2, color: '#b91c1c', shape: 'rect', width: 14, height: 18, desc: 'Artificial blood fluid for emergency transfusion treatment.' },
    { id: 'bioRepairNanites', label: 'Bio-Repair Nanite Canister', category: 'Medical & Consumables', slots: 2, color: '#10b981', shape: 'rect', width: 14, height: 16, desc: 'Microscopic medical machines repairing internal cell damage.' },
    { id: 'radPurgePill', label: 'Radiation Purge Pill Bottle', category: 'Medical & Consumables', slots: 1, color: '#84cc16', shape: 'circle', radius: 10, desc: 'Chelation tablets purging radioactive isotope contamination.' },
    { id: 'deconPatch', label: 'Decontamination Patch', category: 'Medical & Consumables', slots: 1, color: '#06b6d4', shape: 'rect', width: 12, height: 12, desc: 'Dermal patch neutralizing biological virus toxins.' },
    { id: 'rationPackMRE', label: 'High-Density Ration Pack MRE', category: 'Medical & Consumables', slots: 1, color: '#78350f', shape: 'rect', width: 16, height: 12, desc: 'Nutrient-rich survival food pack restoring stamina.' },

    // Tech & Artifacts
    { id: 'encryptedDataCore', label: 'Encrypted Data Core Datapad', category: 'Tech & Artifacts', slots: 2, color: '#38bdf8', shape: 'rect', width: 16, height: 20, desc: 'Hardened datapad storing classified intelligence and schematics.' },
    { id: 'securityKeycard', label: 'Master Security Keycard', category: 'Tech & Artifacts', slots: 1, color: '#f59e0b', shape: 'rect', width: 12, height: 8, desc: 'Encrypted access pass unlocking high-security blast doors.' },
    { id: 'quantumProcessingChip', label: 'Quantum Processing Chip', category: 'Tech & Artifacts', slots: 1, color: '#a855f7', shape: 'hexagon', radius: 10, desc: 'Advanced micro-processor component for high-tech crafting.' },
    { id: 'subspaceTransceiver', label: 'Subspace Transceiver Chip', category: 'Tech & Artifacts', slots: 2, color: '#0284c7', shape: 'rect', width: 14, height: 14, desc: 'Deep-space communications component for long-range signals.' },
    { id: 'biometricDecryptionDeck', label: 'Biometric Decryption Deck', category: 'Tech & Artifacts', slots: 3, color: '#ec4899', shape: 'rect', width: 22, height: 16, desc: 'Hacking device bypassing biometric palm scanners.' },
    { id: 'hacktoolCyberdeck', label: 'Hacktool Cyber-Deck', category: 'Tech & Artifacts', slots: 4, color: '#10b981', shape: 'rect', width: 28, height: 18, desc: 'Mobile terminal designed for penetrating corporate mainframe networks.' },
    { id: 'progenitorRelic', label: 'Progenitor Relic Artifact', category: 'Tech & Artifacts', slots: 3, color: '#eab308', shape: 'star', radius: 15, desc: 'Mysterious ancient alien device glowing with energy.' },
    { id: 'neuralInterfacePlug', label: 'Neural Interface Plug', category: 'Tech & Artifacts', slots: 1, color: '#6366f1', shape: 'circle', radius: 10, desc: 'Direct neural link connector for pilot augmentation.' },
    { id: 'powerConduitConverter', label: 'Power Conduit Converter', category: 'Tech & Artifacts', slots: 2, color: '#d97706', shape: 'rect', width: 16, height: 16, desc: 'Heavy electrical transformer for repairing generators.' },

    // Raw Materials & Commodities
    { id: 'titaniumIngot', label: 'Refined Titanium Ingot', category: 'Materials & Commodities', slots: 2, color: '#94a3b8', shape: 'rect', width: 18, height: 12, desc: 'High-purity metal bar used in starship hull fabrication.' },
    { id: 'volatileOre', label: 'Unrefined Volatile Ore', category: 'Materials & Commodities', slots: 3, color: '#b45309', shape: 'hexagon', radius: 14, desc: 'Raw mining rock rich in explosive plasma elements.' },
    { id: 'exoticMatterCanister', label: 'Exotic Matter Canister', category: 'Materials & Commodities', slots: 2, color: '#c026d3', shape: 'rect', width: 14, height: 18, desc: 'Stasis flask containing dark matter isotopes.' },
    { id: 'syntheticPolymerSheet', label: 'Synthetic Polymer Sheet', category: 'Materials & Commodities', slots: 2, color: '#475569', shape: 'rect', width: 20, height: 14, desc: 'Durable composite plastic sheet for suit crafting.' },
    { id: 'rareEarthLump', label: 'Rare Earth Element Lump', category: 'Materials & Commodities', slots: 2, color: '#65a30d', shape: 'hexagon', radius: 12, desc: 'Valuable mineral deposit used in laser optics.' },
    { id: 'salvagedCircuitry', label: 'Salvaged Circuitry Scrap', category: 'Materials & Commodities', slots: 2, color: '#334155', shape: 'rect', width: 16, height: 14, desc: 'Recycled electronic components from destroyed drones.' },
    { id: 'goldBullionBar', label: 'Gold Bullion Bar', category: 'Materials & Commodities', slots: 2, color: '#eab308', shape: 'rect', width: 18, height: 10, desc: 'Pure physical precious metal bar for black-market trading.' },
    { id: 'radioactiveIsotopeVial', label: 'Radioactive Isotope Vial', category: 'Materials & Commodities', slots: 1, color: '#84cc16', shape: 'circle', radius: 10, desc: 'Enriched nuclear isotope vial for power cores.' }
  ]
};

/**
 * SCALE SYSTEM PROPERTIES & METADATA SCHEMAS
 */
export const SCALE_METADATA_SCHEMAS = {
  'Sector': {
    title: 'Sector System Metadata',
    fields: [
      { key: 'faction', label: 'Faction Ownership', type: 'text', default: 'Imperial Domain' },
      { key: 'hazardIndex', label: 'Travel Hazard Index (0-5)', type: 'number', min: 0, max: 5, step: 0.1, default: 1.0 },
      { key: 'interdictionRadius', label: 'Subspace Interdiction Radius (AU)', type: 'number', default: 15.0 },
      { key: 'taxRate', label: 'Sector Trade Tax Rate (%)', type: 'number', default: 5 }
    ]
  },
  'Solar System': {
    title: 'Solar System Metadata',
    fields: [
      { key: 'primaryStarClass', label: 'Primary Star Spectral Class', type: 'select', options: ['O-Type Blue', 'B-Type Blue-White', 'G-Type Yellow', 'M-Type Red Dwarf', 'White Dwarf', 'Neutron Star'], default: 'G-Type Yellow' },
      { key: 'stellarRadiationIndex', label: 'Stellar Radiation Index', type: 'number', min: 0, max: 10, default: 2.5 },
      { key: 'resourceYieldIndex', label: 'Resource Yield Potential', type: 'select', options: ['Low', 'Standard', 'Rich', 'Extreme Volatile'], default: 'Standard' },
      { key: 'orbitalCount', label: 'Tracked Orbital Bodies', type: 'number', default: 8 }
    ]
  },
  'Planetary': {
    title: 'Planetary Metadata',
    fields: [
      { key: 'atmosphere', label: 'Atmospheric Profile', type: 'select', options: ['Breathable Terran', 'Toxic Chemical', 'Corrosive Acid', 'Vacuum', 'High Pressure Dense', 'Irradiated'], default: 'Breathable Terran' },
      { key: 'gravity', label: 'Surface Gravity (g)', type: 'number', min: 0.1, max: 5.0, step: 0.1, default: 1.0 },
      { key: 'orbitalShielding', label: 'Global Forcefield Active', type: 'boolean', default: false },
      { key: 'climateType', label: 'Primary Climate Biome', type: 'text', default: 'Temperate Oceanic' }
    ]
  },
  'Regional': {
    title: 'Regional Metadata',
    fields: [
      { key: 'weatherCondition', label: 'Active Weather Overlay', type: 'select', options: ['Clear Skies', 'Sandstorm', 'Acid Rain', 'Blizzard', 'Ash Fallout', 'Spore Fog'], default: 'Clear Skies' },
      { key: 'movementCostMult', label: 'Regional Travel Cost Multiplier', type: 'number', min: 0.5, max: 5.0, step: 0.1, default: 1.0 },
      { key: 'supplyLineIntegrity', label: 'Supply Line Connection (%)', type: 'number', min: 0, max: 100, default: 100 },
      { key: 'controllingGarrison', label: 'Local Military Garrison', type: 'text', default: 'Regional Defense Force' }
    ]
  },
  'City/Town': {
    title: 'City / District Metadata',
    fields: [
      { key: 'dangerIndex', label: 'District Threat Index (1-5)', type: 'number', min: 1, max: 5, default: 2 },
      { key: 'powerGridMatrix', label: 'Power Grid Online', type: 'boolean', default: true },
      { key: 'surveillanceRatio', label: 'Surveillance Coverage (%)', type: 'number', min: 0, max: 100, default: 65 },
      { key: 'securityResponseTime', label: 'Security Response Time (min)', type: 'number', default: 3 }
    ]
  },
  'Exterior': {
    title: 'Tactical Site Metadata',
    fields: [
      { key: 'lightingState', label: 'Lighting Condition', type: 'select', options: ['Daylight', 'Low-Light Twilight', 'Pitch Black', 'Searchlight Swept'], default: 'Daylight' },
      { key: 'coverDensity', label: 'Tactical Cover Density', type: 'select', options: ['Sparse Open Field', 'Moderate Urban', 'Heavy Entrenched'], default: 'Moderate Urban' },
      { key: 'perimeterAlert', label: 'Perimeter Alarm Status', type: 'select', options: ['Green (Patrol)', 'Yellow (Caution)', 'Red (Lockdown Combat)'], default: 'Green (Patrol)' }
    ]
  },
  'Interior': {
    title: 'Interior Floor Metadata',
    fields: [
      { key: 'atmosphericSealing', label: 'Pressurized Air Sealed', type: 'boolean', default: true },
      { key: 'roomHazardProfile', label: 'Room Hazard Level', type: 'select', options: ['Clear', 'Biohazard Leak', 'Radiation Spill', 'Fire Hazard', 'Vacuum Breach'], default: 'Clear' },
      { key: 'coverArmorRating', label: 'Structural Wall Rating (AC)', type: 'number', default: 4 },
      { key: 'securityTerminalLocked', label: 'Terminal Hack Lockout', type: 'boolean', default: false }
    ]
  },
  'Container': {
    title: 'Container Inventory Metadata',
    fields: [
      { key: 'gridCapacity', label: 'Total Inventory Grid Capacity (Slots)', type: 'number', default: 30 },
      { key: 'maxWeight', label: 'Maximum Weight Limit (kg)', type: 'number', default: 50.0 },
      { key: 'lockDifficulty', label: 'Lock Pick Difficulty (DC)', type: 'number', min: 0, max: 30, default: 15 },
      { key: 'encryptionLevel', label: 'Access Encryption Level', type: 'select', options: ['None (Open)', 'Basic Keycard', 'Biometric Lock', 'Quantum Military Override'], default: 'Basic Keycard' }
    ]
  }
};
