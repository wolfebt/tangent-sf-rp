import { DEFAULT_SPECIES_TYPES } from '../data/speciesTypesData.js';
import { DEFAULT_SPECIES_SIZES } from '../data/speciesSizeData.js';
import { BASIC_MOVEMENT_MODES } from '../data/speciesMovementData.js';
import { ALL_CANONICAL_TRAITS } from '../data/speciesTraitsData.js';
import { DEFAULT_FEATURES } from '../data/featuresData.js';

/**
 * Curated knowledge base for known species inherent traits across the Tangent Omnicortex,
 * mapping canonical IDs and patterns to simple, clear names, categories, and explanatory tooltips.
 */
export const KNOWN_SPECIES_TRAIT_DESCRIPTIONS = {
  // Aeld
  'trait-aeld-lineage-traits': {
    name: 'Aeld Lineage',
    category: 'Trait',
    description: 'Inherent ancestral adaptations of the Aeld: Awakened (Arcane) [2], Lifespan 600+ [1], and Immune to Sleep [2].',
    rules: 'Awakened (Arcane), Extended Lifespan 600+, Sleep Immunity.'
  },
  'trait-alter-form-humanoid-special-ability': {
    name: 'Alter Form',
    category: 'Humanoid Special Ability',
    description: 'Mutable cellular matrix allowing the entity to alter its physical form, voice, and appearance to mimic other humanoid species (+5 to Disguise checks).',
    rules: 'Active shapechanging into humanoid forms; grants +5 bonus to Disguise and infiltration rolls.'
  },
  'trait-sense-alignment-intent': {
    name: 'Sense Alignment / Intent',
    category: 'Trait',
    description: 'Innate 60 ft radius detection of alignment, intent, or supernatural malice. Intrusively alerts senses when near extreme morality or vile planning.',
    rules: 'Uncontrolled sensory detection within 60 ft radius; senses targets with Extreme Morality or hostile intent.'
  },
  'trait-awakened-arcane': {
    name: 'Awakened (Arcane)',
    category: 'Trait',
    description: 'Innate biological attunement to mystical and arcane frequencies, allowing direct manipulation of meta-phenomena.',
    rules: 'Grants innate Metaphysics casting capability for Arcane disciplines.'
  },
  'trait-long-lived-600-years': {
    name: 'Extended Lifespan (600+ Years)',
    category: 'Trait',
    description: 'Cellular degradation is dramatically arrested, allowing a lifespan exceeding six centuries without frailty.',
    rules: 'Immune to natural age-related physical infirmity.'
  },
  'trait-sleepless-immune-to-sleep-effects': {
    name: 'Sleepless (Sleep Immunity)',
    category: 'Trait',
    description: 'The entity’s neurology does not require sleep and is biologically impervious to sleep spells, sedatives, and trance toxins.',
    rules: 'Immune to magical and biological sleep effects.'
  },

  // Asi
  'trait-asi-base-traits-ageless-obfuscate-sleepless': {
    name: 'Asi Base',
    category: 'Trait',
    description: 'Innate ancestral fey traits of the Asi lineages: Ageless [2], Obfuscate [2], and Sleepless [2].',
    rules: 'Ageless biological matrix, innate Obfuscate illusion aura, and sleep immunity.'
  },

  // Auluran
  'trait-auluran-traits-biotechnology-low-light-prehensile-scent': {
    name: 'Auluran Base',
    category: 'Trait',
    description: 'Biotechnological feline predator traits: Biotechnology [2], Low-Light Vision [1], Prehensile Feet/Tail [3], Scent [1], Natural Weapons [2].',
    rules: 'Enhanced sensory perception, natural claws, prehensile limbs, and innate biotechnology synergy.'
  },

  // Kitin
  'trait-kitin-base-traits-awakened-psychic-biotech-hive-connection-sleepless': {
    name: 'Kitin Base',
    category: 'Trait',
    description: 'Chitinous insectoid collective traits: Awakened (Psychic), Biotechnology, Hive Connection mesh, Sleepless.',
    rules: 'Sub-dermal chitin, shared hive telepathy mesh, and sleepless vigilance.'
  },
  'trait-kitin-base-traits': {
    name: 'Kitin Base Traits',
    category: 'Trait',
    description: 'The fundamental heritage of all Kitin Strains: Awakened (Psychic) [2], Biotechnology [2], Hive Connection / Hive-Link [2], Sleepless / Torpor [2].',
    rules: 'Awakened (Psychic), Biotechnology, Hive-Link telepathy, and Torpor conscious rest.'
  },
  'trait-mimetic-form': {
    name: 'Mimetic Form',
    category: 'Trait',
    description: 'Thin human-mimetic dermis and endoskeleton allowing disguise as human when antennae are concealed (+2 Disguise/Deception).',
    rules: '+2 Bonus to Disguise or Deception checks to pass as human (antennae must be concealed).'
  },
  'trait-genetic-memory': {
    name: 'Genetic Memory',
    category: 'Trait',
    description: 'Inheritance of ancestral knowledge, cultural memory, and Genomatrix blueprints passed through biological lineage.',
    rules: 'Grants ancestral recall on Lore/History/Science and intuitive comprehension of biotech blueprints.'
  },
  'trait-hive-link': {
    name: 'Hive-Link',
    category: 'Trait',
    description: 'Constant telepathic link to the Collective and all Kitin Strains, synchronizing thoughts with the psionic Chorus.',
    rules: 'Uninterrupted telepathic mesh with hive members; prevents surprise when allies are vigilant.'
  },
  'trait-torpor-universal': {
    name: 'Torpor (Universal)',
    category: 'Trait',
    description: 'Requires only 4 hours of conscious inactivity to rest; immune to involuntary sleep, stupor, and sleep-inducing magic.',
    rules: '4-hour conscious rest; complete immunity to sleep effects while maintaining situational awareness.'
  },
  'trait-blind-sense-scent-em': {
    name: 'Blind Sense (Scent/EM)',
    category: 'Trait',
    description: 'Delicate sensory antennae detect bio-energetic, electromagnetic, and olfactory plumes within 30 ft radius.',
    rules: '30 ft radius blindsense sensing movement, electrical signals, and scent plumes.'
  },
  'trait-enhanced-biotechnology': {
    name: 'Enhanced Biotechnology',
    category: 'Trait',
    description: 'Direct physiological compatibility and neural control over living technology, bio-grafts, and biomorphic carapaces.',
    rules: 'Instant integration with living items; Advantage on biotech calibration and commands.'
  },
  'trait-toxic-blood': {
    name: 'Toxic Blood',
    category: 'Trait',
    description: 'Copper-based hemocyanin blood contains defensive xenotoxins (Ingested DC 11 + 2xSta, Pain Incapacitation 1hr).',
    rules: 'Ingested toxin: DC 11 + 2xSta Fortitude save or suffer Pain Incapacitation for 1 hour (Severe Nausea on save).'
  },
  'trait-venomous-saliva': {
    name: 'Venomous Saliva',
    category: 'Trait',
    description: 'Needle-like teeth deliver injected paralytic neurotoxin on bite (Injected DC 11 + 2xSta, Paralytic 1hr).',
    rules: 'Injected bite venom: DC 11 + 2xSta Fortitude save or suffer Paralytic condition for 1 hour (Drugged on save).'
  },
  'trait-venom-spit': {
    name: 'Venom Spit',
    category: 'Trait',
    description: 'Contact ranged spit attack that blinds targets with ocular neurotoxin (Contact DC 11 + 2xSta, Blind for 10+ minutes).',
    rules: 'Contact ranged spit: DC 11 + 2xSta save or suffer Blindness for 10+ minutes.'
  },
  'trait-poison-immunity': {
    name: 'Poison Immunity',
    category: 'Trait',
    description: 'Impervious to all poisonous substances, environmental toxins, and chemical irritants.',
    rules: 'Automatically succeed on all saves versus any poisonous substances.'
  },
  'trait-multidextrous-4-arms': {
    name: 'Multidextrous (4 Arms)',
    category: 'Trait',
    description: 'Four articulate upper limbs terminating in sharp clawed digits with zero off-hand penalties.',
    rules: 'Zero off-hand attack or interaction penalty; can perform simultaneous multi-arm tasks; claw attacks deal 1d6 + Str.'
  },
  'trait-climber': {
    name: 'Climber',
    category: 'Trait',
    description: 'Mastery over vertical and inverted surface navigation without speed degradation.',
    rules: 'Traverse vertical walls and inverted ceilings at full ground speed (40 ft/rd); +2 on Athletics (Climbing) checks.'
  },
  'trait-dual-skeletal-structure': {
    name: 'Dual Skeletal Structure',
    category: 'Trait',
    description: 'Hybrid internal endoskeleton and external chitinous framework granting natural DR +5.',
    rules: '+5 Damage Reduction (DR 5) against all physical and kinetic trauma; immune to bone fractures from falls.'
  },
  'trait-chitinous-shell-armor': {
    name: 'Armor (Chitinous Shell)',
    category: 'Trait',
    description: 'Dense obsidian chitinous shell providing natural base DR 10 against physical, energy, and chemical trauma.',
    rules: 'Base 10 Damage Reduction (DR 10) against physical, direct energy, and chemical damage.'
  },
  'trait-enhanced-strength': {
    name: 'Enhanced Strength',
    category: 'Trait',
    description: 'Biomechanical musculature treating the creature as one size category larger for lift and carry.',
    rules: 'Counts as 1 size category larger (Medium counts as Large) for lifting capacity, dragging limit, and grappling.'
  },
  'trait-resin-secretion': {
    name: 'Resin Secretion',
    category: 'Trait',
    description: 'Fast-curing Hive-Resin glands for field repairs, patching vehicle/mecha breaches, and airtight seals.',
    rules: 'Restores 2d6 Structure Points or seals hull breaches in 1 round; cures to titanium-grade tensile strength.'
  },
  'trait-weaver': {
    name: 'Weaver',
    category: 'Trait',
    description: 'Spinnerets produce and manipulate high-tensile natural webbing made from specialized Hive-Resin.',
    rules: 'Ranged web snare out to 40 ft (entangles target; DC 15 + Sta to break); weave 200 ft rappels and safety nets.'
  },
  'trait-uncanny-senses-vibration': {
    name: 'Uncanny Senses (Vibration)',
    category: 'Trait',
    description: 'Sensory trichobothria detect surface micro-vibrations and structural stress through ground and hive-mesh.',
    rules: '60 ft tremorsense along surfaces (150 ft across web meshes); cannot be caught flat-footed or surprised by ground foes.'
  },
  'trait-quick': {
    name: 'Quick',
    category: 'Trait',
    description: 'Naturally swift locomotion and rapid reflex reaction times.',
    rules: '+10 feet to Base Movement Speed and +1 bonus to Initiative checks.'
  },
  'trait-leaper': {
    name: 'Leaper',
    category: 'Trait',
    description: 'Specialized legs for explosive horizontal and vertical leaps with running start velocity.',
    rules: 'Always counts as having a running start; all checks for jumping, leaping, and dropping made with Advantage.'
  },
  'trait-active-camouflage': {
    name: 'Camouflage (Active)',
    category: 'Trait',
    description: 'Chitin shifts texture and hue dynamically, including light-absorbing vanta-black and near-transparency.',
    rules: '+8 bonus to Stealth motionless, +4 moving; thermal and standard optical sensors suffer Disadvantage.'
  },
  'trait-quadruped-leaping': {
    name: 'Quadruped (Leaping)',
    category: 'Trait',
    description: 'Four specialized legs engineered for high-impact jumping, +4 Stability, and +10 ft Groundspeed.',
    rules: '+4 racial Stability against trips and knockdowns; +10 ft horizontal leap and +5 ft vertical jump bonus.'
  },
  'trait-awakened-psychic': {
    name: 'Awakened (Psychic)',
    category: 'Trait',
    description: 'Conductor of the Hive’s psionic Chorus, granting access to Attune and mental focus disciplines.',
    rules: 'Gains Attune skill and 2 mental discipline skills (Intellect or Wisdom focused).'
  },
  'trait-limited-flight': {
    name: 'Limited Flight',
    category: 'Trait',
    description: 'Elytra wing-bursts granting 2x Land Speed for 1 round of movement, 2x Jump distance, and Slow Fall.',
    rules: 'Fly at 2x Land Speed for 1 round; double jump distance; immune to falling damage via Slow Fall.'
  },
  'trait-hive-mind-swarm': {
    name: 'Hive Mind (Swarm)',
    category: 'Trait',
    description: 'Distributed swarm consciousness immune to single-target precision trauma and critical hits.',
    rules: 'Cannot be killed unless >75% of swarm biomass is destroyed by area-of-effect damage.'
  },
  'trait-telepathic': {
    name: 'Telepathic',
    category: 'Trait',
    description: 'Innate psychic mind-to-mind communication within the swarm and with external minds out to 100 ft.',
    rules: 'Communicate mentally with any sentient lifeform within 100 ft without speech.'
  },
  'trait-host-zombification': {
    name: 'Host Zombification',
    category: 'Trait',
    description: 'Swarm inhabits and mechanically puppets corpses or damaged biomorphic husks as armored shells.',
    rules: 'Adopts host size, base Strength, and native DR; husk absorbs damage first as an ablative shell.'
  },
  'trait-psionic-interference-static': {
    name: 'Psionic Interference (The Static)',
    category: 'Trait',
    description: 'Discordant psionic static causing mental feedback in orderly telepathic networks.',
    rules: 'Manelli within range suffer -2 on Psionic/Wisdom checks; Kitin Chorus communications within 30 ft rolled at Disadvantage.'
  },
  'trait-swarm-fast-heal-regeneration': {
    name: 'Fast Heal & Regeneration (Swarm)',
    category: 'Trait',
    description: 'Continuous internal birth cycle rapidly replenishes fallen insects and lost swarm mass.',
    rules: 'Recovers 2 Health/Vitality per round in combat; fully restores mass over a Light Rest.'
  },
  'trait-honey-paper-manufacture': {
    name: 'Honey & Paper Manufacture',
    category: 'Trait',
    description: 'Excretes biological adhesives, pulp, and amber ooze for nest building and restraint.',
    rules: 'Construct reinforced nests/barricades (DR 5, 30 SP); coat 10 ft areas in sticky amber ooze (DC 14 save).'
  },
  'trait-blind-sight-swarm': {
    name: 'Blind Sight (Swarm)',
    category: 'Trait',
    description: 'Distributed resonance allows precise non-visual targeting in a 30 ft radius or 60 ft cone.',
    rules: 'Accurately target unseen objects within 30 ft; completely immune to darkness and blinding effects.'
  },

  // Kitin Syndess (Pilot Expression)
  'trait-synaptic-integration': {
    name: 'Synaptic Integration',
    category: 'Trait',
    description: 'Can slot into Kitin mecha Synaptic Node, using own Intellect and Agility for vehicle checks and ignoring G-force penalties.',
    rules: '1-round bio-neural sync; use own Int/Agi for all vehicle checks; immune to G-force and high-velocity inertia.'
  },
  'trait-multidextrous-many-limbed': {
    name: 'Multidextrous (Many-Limbed)',
    category: 'Trait',
    description: '30+ micro-limbs for fine repairs, fluid nutrient routing, and concurrent subsystem multitasking.',
    rules: 'Manage 4 humanoid crew roles concurrently (pilot, gunner, engineer, sensor operator); fine internal maintenance.'
  },
  'trait-g-force-immunity': {
    name: 'G-Force Immunity',
    category: 'Trait',
    description: 'Internal fluid dampening allows survival through extreme supersonic turns and decelerations.',
    rules: 'Total physiological immunity to blackout, redout, vertigo, and high-G crushing forces.'
  },
  'trait-blind-sense-em-vibration': {
    name: 'Blind Sense (EM/Vibration)',
    category: 'Trait',
    description: 'Perceives environment through mecha sensors and external bio-arrays via electromagnetic and vibration resonance.',
    rules: '30 ft blindsense sensing subtle EM fields, hull stresses, and vibrations through mecha surface as personal skin.'
  },
  'trait-property-boon': {
    name: 'Property Boon',
    category: 'Trait',
    description: 'Special equipment allocation granting personal vehicle or biomorphic docking privileges; +4 Wealth for personal property.',
    rules: '+4 bonus to Wealth score dedicated specifically to acquiring or maintaining personal biomorphic mecha or gear.'
  },
  'trait-fragile-frame': {
    name: 'Fragile Frame',
    category: 'Disadvantage',
    description: 'Outside of a mecha or containment tube, the organism has a fragile physiology and suffers a -2 penalty to physical saves.',
    rules: '-2 penalty to all physical saving throws (Fortitude/Reflex/Stamina) when exposed outside of mecha or protective pod.'
  },
  'disadvantage-fragile-frame': {
    name: 'Fragile Frame',
    category: 'Disadvantage',
    description: 'Outside of a mecha or containment tube, the organism has a fragile physiology and suffers a -2 penalty to physical saves.',
    rules: '-2 penalty to all physical saving throws (Fortitude/Reflex/Stamina) when exposed outside of mecha or protective pod.'
  },

  // Kitin Murex (Foundation Expression)
  'trait-fatigue-resistance': {
    name: 'Fatigue Resistance',
    category: 'Trait',
    description: 'All Fatigue checks are made at Advantage and at twice the interval time.',
    rules: 'Advantage on all saves/checks against fatigue, exhaustion, and prolonged exertion; interval duration is doubled.'
  },
  'trait-pheromonal-synthesis': {
    name: 'Pheromonal Synthesis',
    category: 'Trait',
    description: 'Biological scent-marking for hive coordination, trail navigation, and silent aerosol alarms.',
    rules: 'Persistent chemical trails lasting 72 hours (+2 Navigation/Survival to allies); silent 60 ft aerosol alarm.'
  },
  'trait-hive-link-minor': {
    name: 'Hive-Link (Minor)',
    category: 'Trait',
    description: 'Basic telepathic receptivity to follow Collective commands and synchronize with hive leadership.',
    rules: 'Receives telepathic broadcasts within 5 miles; syncs Initiative with commanders; +2 saves vs non-collective mental effects.'
  },

  // Kitin Collective Faction Traits & Vulnerabilities
  'trait-radiation-advantage': {
    name: 'Radiation Advantage',
    category: 'Trait',
    description: 'Heavy-element chitin and cellular stability grant Advantage on all radiation checks and half radiation damage.',
    rules: 'Advantage on Stamina/Survival saves vs ionizing radiation/fallout; 50% damage reduction against radiation.'
  },
  'trait-biological-continuity': {
    name: 'Biological Continuity',
    category: 'Trait',
    description: 'Monogenetic genomic stabilization grants immunity to clone decay and allows effortless interface with biomorphic wetware.',
    rules: 'Immune to cellular senescence/retroviruses; ignores cellular rejection checks for organic sockets and mecha.'
  },
  'trait-psionic-gating': {
    name: 'Psionic Gating',
    category: 'Trait',
    description: 'Cryptographic Chorus filtering grants +2 Mental DR and imposes Disadvantage on foreign psionic intrusions.',
    rules: '+2 Mental DR; hostile telepathic scans and mind-control effects roll at Disadvantage.'
  },
  'disadvantage-psionic-static-susceptibility': {
    name: 'Psionic Static Susceptibility',
    category: 'Disadvantage',
    description: 'Acute neuro-sensory disruption and pain caused by Riezen frequency static or unaligned psychic turbulence.',
    rules: 'Disadvantage on Concentration and Metaphysics within Riezen broadcast range; DC 12 check or lose Minor Action.'
  },

  // Synthetic
  'trait-synthetic-base-traits': {
    name: 'Synthetic Chassis',
    category: 'Trait',
    description: 'Inorganic chassis properties: Digitized Mind, Robotic Strength, Resilient Design, Immune to biological poison and disease.',
    rules: 'Immune to biological toxins, disease, and asphyxiation; vulnerable to electromagnetic damage.'
  },

  // Draconian & Dragonkin
  'trait-dragonkin-traits-partial-scales-dr-1-heat-resistance': {
    name: 'Dragonkin',
    category: 'Trait',
    description: 'Partial scales providing Damage Reduction (DR 1) and natural thermal heat resistance.',
    rules: 'Grants natural +1 DR against physical attacks and thermal damage resistance.'
  },
  'trait-dragonkin-heritage-scales-dr-2': {
    name: 'Dragonkin Heritage (Scales DR 2)',
    category: 'Trait',
    description: 'Hardened draconic scales providing Damage Reduction (DR 2) and environmental resilience.',
    rules: 'Grants +2 DR natural armor.'
  },

  // Progenitor & Void
  'trait-matter-reshaping-special-ability': {
    name: 'Matter Reshaping',
    category: 'Special Ability',
    description: 'Precursor molecular manipulation ability allowing the alteration, synthesis, and reshaping of non-living matter.',
    rules: 'Active molecular control action to reshape inorganic materials.'
  },
  'trait-teleportal-special-ability-short-jump': {
    name: 'Teleportal (Short Jump)',
    category: 'Special Ability',
    description: 'Dimensional psionic ability allowing short instantaneous tactical teleportation across space.',
    rules: 'Instantaneous short-range tactical teleport as a move action.'
  },
  'trait-technokinesis-special-ability': {
    name: 'Technokinesis',
    category: 'Special Ability',
    description: 'Direct neural and electromagnetic command over computational arrays, hardware, and robotic constructs.',
    rules: 'Remotely interface with and influence electronic systems without physical data links.'
  },
  'trait-homing-special-ability-spatial-recall': {
    name: 'Homing (Spatial Recall)',
    category: 'Special Ability',
    description: 'Dimensional sanctuary lock providing instantaneous spatial awareness and return calibration to attuned points.',
    rules: 'Spatial memory recall and sanctuary coordinate attunement.'
  },
  'trait-alter-form-void-wisp-shadow-special-ability': {
    name: 'Alter Form (Void Wisp Shadow)',
    category: 'Special Ability',
    description: 'Dissolves physical form into a semi-corporeal shadowy void wisp, traversing barriers and avoiding detection.',
    rules: 'Phase into void wisp state; bypass non-airtight physical barriers.'
  }
};

/**
 * Format Species Type (The Chassis)
 * Output label format: "[Name] - Species Type"
 */
export const formatSpeciesType = (rawType) => {
  if (Array.isArray(rawType)) rawType = rawType[0];
  if (typeof rawType === 'object' && rawType !== null) rawType = rawType.name || rawType.id || '';
  const str = String(rawType || 'Humanoid').trim();
  const cleanId = str.toLowerCase().replace(/^species_type-/, '').replace(/[-_]/g, ' ');

  const match = DEFAULT_SPECIES_TYPES.find(t =>
    t.id.toLowerCase() === str.toLowerCase() ||
    t.name.toLowerCase() === cleanId.toLowerCase() ||
    t.id.toLowerCase().includes(cleanId.toLowerCase())
  );

  const name = match ? match.name : (cleanId.charAt(0).toUpperCase() + cleanId.slice(1));
  const label = `${name} - Species Type`;

  return {
    id: match ? match.id : str,
    name,
    category: 'Species Type',
    label,
    tooltip: {
      title: `${name} (Species Type)`,
      badge: 'Species Type',
      description: match?.description || 'Species chassis defining physical constitution, baseline senses, and biological classification.',
      rules: match ? `Senses: ${match.senses || 'Standard'} | Physiology: ${match.physiology || 'Standard'} | Immunities: ${match.immunities || 'None'}` : '',
      cost: match ? `${match.cp ?? match.bp ?? 0} CP` : undefined
    }
  };
};

/**
 * Format Species Size
 * Output label format: "[Name] - Species Size"
 */
export const formatSpeciesSize = (rawSize) => {
  if (Array.isArray(rawSize)) rawSize = rawSize[0];
  if (typeof rawSize === 'object' && rawSize !== null) rawSize = rawSize.name || rawSize.id || '';
  const str = String(rawSize || 'Medium').trim();
  const cleanId = str.toLowerCase().replace(/^species_size-/, '').replace(/[-_]/g, ' ');

  const match = DEFAULT_SPECIES_SIZES.find(s =>
    s.id.toLowerCase() === str.toLowerCase() ||
    s.name.toLowerCase() === cleanId.toLowerCase() ||
    s.id.toLowerCase().includes(cleanId.toLowerCase())
  );

  const name = match ? match.name : (cleanId.charAt(0).toUpperCase() + cleanId.slice(1));
  const label = `${name} - Species Size`;

  return {
    id: match ? match.id : str,
    name,
    category: 'Species Size',
    label,
    tooltip: {
      title: `${name} (Species Size)`,
      badge: 'Species Size',
      description: match?.description || 'Species physical volume, height, weight scale, and size modifiers.',
      rules: match ? `Height: ${match.height_length_range || '—'} | Weight: ${match.weight_range || '—'} | Reach: ${match.reach || '5 ft'} | Scaling: ${match.scaling_display || '1.0'}` : ''
    }
  };
};

/**
 * Format Species Movement
 * Output label format: "[Name] - Species Movement"
 */
export const formatSpeciesMovement = (rawMovement) => {
  if (Array.isArray(rawMovement)) rawMovement = rawMovement[0];
  if (typeof rawMovement === 'object' && rawMovement !== null) rawMovement = rawMovement.name || rawMovement.id || '';
  const str = String(rawMovement || 'species_movement-bipedal').trim();
  const cleanId = str.toLowerCase().replace(/^species_movement-/, '').replace(/[-_]/g, ' ');

  const match = BASIC_MOVEMENT_MODES.find(m =>
    m.id.toLowerCase() === str.toLowerCase() ||
    m.name.toLowerCase().includes(cleanId) ||
    cleanId.includes(m.target_mode?.toLowerCase() || '') ||
    cleanId.includes(m.type?.toLowerCase() || '')
  );

  let shortName = match ? match.name.replace(/ Locomotion$/i, '') : (cleanId.charAt(0).toUpperCase() + cleanId.slice(1));
  if (shortName.toLowerCase() === 'bipedal') shortName = 'Bipedal';
  const label = `${shortName} - Species Movement`;

  return {
    id: match ? match.id : str,
    name: match?.name || shortName,
    shortName,
    category: 'Species Movement',
    label,
    tooltip: {
      title: `${match?.name || shortName} (Species Movement)`,
      badge: 'Species Movement',
      description: match?.description?.split('\n\n### Tactical')[0] || match?.description || 'Species locomotion mode and baseline tactical travel speeds.',
      rules: match ? `Base Speed: ${match.base_speed || match.speed || 30} ft/round (${match.type || 'Ground'})` : ''
    }
  };
};

/**
 * Detects auto-generated runtime/timestamp IDs (e.g., "trait_1792223406019_9e80", "trait_species_1792223406019_1qrv")
 */
export const isGeneratedTraitId = (str) => {
  if (!str) return false;
  const s = String(str).trim();
  return /\d{10,}(?:[-_\s]+[a-z0-9]{2,10})?/i.test(s) ||
         /^(?:trait|species|feat|feature|item|dis|aug|mod|spec|awakened|inv)[-_](?:sp[-_]|species[-_]|arch[-_]|fac[-_]|custom[-_])?\d{8,}/i.test(s);
};

/**
 * Detects corrupted or generic fallback descriptions that should be replaced by canonical descriptions
 */
export const isCorruptedTraitDescription = (desc) => {
  if (!desc) return true;
  const s = String(desc).trim();
  if (!s) return true;
  if (/\b\d{10,}\b/.test(s)) return true;
  if (/is an innate (?:trait|special ability|humanoid special ability) granted by this species lineage\.?$/i.test(s)) return true;
  if (/^Character trait from chosen identity column\.?$/i.test(s)) return true;
  if (/^Inherent trait granted by .+\.?$/i.test(s)) return true;
  if (/species trait\.$/i.test(s) && s.split(/\s+/).length <= 5) return true;
  return false;
};

/**
 * Extracts inline markdown mechanic from description if present (e.g., "... *+2 Piloting and Navigation* #")
 */
export const extractInlineMarkdownMechanic = (desc) => {
  if (!desc) return '';
  const s = String(desc).trim().replace(/\s+#+\s*$/, '').trim();
  const match = s.match(/\*([^*]+)\*\s*$/);
  return match ? match[1].replace(/\\([+-])/g, '$1').trim() : '';
};

/**
 * Cleans trailing markdown artifacts (e.g., "*+2 Piloting and Navigation* #" or trailing "#") from trait descriptions
 */
export const cleanTraitDescriptionText = (desc, mechanic = '') => {
  if (!desc) return '';
  let s = String(desc).trim();
  s = s.replace(/\s+#+\s*$/, '').trim();
  s = s.replace(/\s*\*([^*]+)\*\s*$/, (_, inner) => {
    const cleanInner = inner.replace(/\\([+-])/g, '$1').trim();
    if (!mechanic || mechanic.toLowerCase().includes(cleanInner.toLowerCase()) || /^[+-]\d/.test(cleanInner) || /advantage|disadvantage|check|bonus|reroll|karma/i.test(cleanInner)) {
      return '';
    }
    return ` (${cleanInner})`;
  }).trim();
  s = s.replace(/\s+#+\s*$/, '').trim();
  return s;
};

/**
 * Normalizes a trait/feature identifier or name for resilient fuzzy matching across hyphens, underscores, and prefixes
 */
export const normalizeTraitLookupKey = (str) => {
  if (!str || isGeneratedTraitId(str)) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/^(?:trait|feature)[-_](?:sig[-_])?/i, '')
    .replace(/[-_]?traits?$/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

const KNOWN_SPECIES_TRAIT_NORMALIZED_MAP = (() => {
  const map = new Map();
  Object.entries(KNOWN_SPECIES_TRAIT_DESCRIPTIONS).forEach(([key, val]) => {
    map.set(key.toLowerCase(), { key, val });
    const normK = normalizeTraitLookupKey(key);
    if (normK && !map.has(normK)) map.set(normK, { key, val });
    const normN = normalizeTraitLookupKey(val.name);
    if (normN && !map.has(normN)) map.set(normN, { key, val });
  });
  return map;
})();

/**
 * Clean and format trait names from slugs or raw strings.
 */
export const cleanTraitName = (rawStr) => {
  if (!rawStr || isGeneratedTraitId(rawStr)) return '';
  let s = String(rawStr || '').trim();
  // Strip category prefixes
  s = s.replace(/^(trait|feature)[-_]/i, '');
  // Strip trailing trait/traits
  s = s.replace(/[-_]traits?$/i, '');
  // Format specific known patterns
  s = s.replace(/[-_]ft/gi, ' ft');
  s = s.replace(/dr[-_](\d+)/gi, 'DR $1');
  s = s.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  return s.replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Format Species Trait (including Humanoid Special Ability, Special Ability, or Trait)
 * Output label format: "[Name] - [Category]"
 * where Category is "Humanoid Special Ability", "Special Ability", or "Trait"
 */
export const formatSpeciesTrait = (rawTrait, speciesContext = null) => {
  if (!rawTrait) return { name: '', category: 'Trait', label: '', description: '', mechanic: '', tooltip: {} };

  const candidates = typeof rawTrait === 'object'
    ? [rawTrait.id, rawTrait.name, rawTrait.title].filter(c => c && !isGeneratedTraitId(c)).map(c => String(c).trim())
    : (!isGeneratedTraitId(rawTrait) ? [String(rawTrait).trim()] : []);

  const rawId = candidates[0] || (typeof rawTrait === 'object' ? (rawTrait.name || rawTrait.title || '') : String(rawTrait));
  const cleanId = String(rawId || '').toLowerCase().trim();
  const normCandidates = candidates.map(c => normalizeTraitLookupKey(c)).filter(Boolean);

  const rawObjDesc = typeof rawTrait === 'object' ? (rawTrait.description || rawTrait.desc || '') : '';
  const inlineMech = extractInlineMarkdownMechanic(rawObjDesc);
  const objMech = (typeof rawTrait === 'object' ? (rawTrait.mechanic || rawTrait.mechanics || rawTrait.bonus || '') : '') || inlineMech;
  const objDesc = isCorruptedTraitDescription(rawObjDesc) ? '' : cleanTraitDescriptionText(rawObjDesc, objMech);

  // 0. Check pillar context traits_detail (e.g. Occupation or Origin specific trait definitions)
  if (speciesContext && Array.isArray(speciesContext.traits_detail)) {
    const detailMatch = speciesContext.traits_detail.find(t => {
      const tId = (t.id || '').toLowerCase();
      const tName = (t.name || t.title || '').toLowerCase();
      const tNormId = normalizeTraitLookupKey(tId);
      const tNormName = normalizeTraitLookupKey(tName);
      return candidates.some(c => {
        const cl = c.toLowerCase();
        return tId === cl || tName === cl || tId === `trait-${cl}`;
      }) || normCandidates.some(nc => nc === tNormId || nc === tNormName);
    });
    if (detailMatch) {
      const name = detailMatch.name || cleanTraitName(cleanId);
      const mechanic = (detailMatch.mechanic || detailMatch.mechanics || detailMatch.bonus || objMech || '').replace(/^\[|\]$/g, '');
      const description = cleanTraitDescriptionText(detailMatch.description || detailMatch.desc || objDesc || '', mechanic);
      return {
        id: detailMatch.id || rawId,
        name,
        category: 'Trait',
        label: `${name} - Trait`,
        description,
        mechanic,
        tooltip: {
          title: `${name} (Trait)`,
          badge: 'Trait',
          description,
          formula: mechanic ? `[${mechanic}]` : undefined,
          rules: mechanic ? `[${mechanic}]` : ''
        }
      };
    }
  }

  // 1. Check known curated trait descriptions across all non-generated candidates
  let knownHit = null;
  for (const cand of candidates) {
    const cl = cand.toLowerCase();
    if (KNOWN_SPECIES_TRAIT_DESCRIPTIONS[cl]) {
      knownHit = { key: cl, val: KNOWN_SPECIES_TRAIT_DESCRIPTIONS[cl] };
      break;
    }
    if (KNOWN_SPECIES_TRAIT_DESCRIPTIONS[`trait-${cl}`]) {
      knownHit = { key: `trait-${cl}`, val: KNOWN_SPECIES_TRAIT_DESCRIPTIONS[`trait-${cl}`] };
      break;
    }
    const norm = normalizeTraitLookupKey(cand);
    if (norm && KNOWN_SPECIES_TRAIT_NORMALIZED_MAP.has(norm)) {
      knownHit = KNOWN_SPECIES_TRAIT_NORMALIZED_MAP.get(norm);
      break;
    }
  }

  if (knownHit) {
    const k = knownHit.val;
    const mechanic = (k.rules || objMech || '').replace(/\.$/, '');
    return {
      id: knownHit.key || rawId,
      name: k.name,
      category: k.category,
      label: `${k.name} - ${k.category}`,
      description: k.description,
      mechanic,
      tooltip: {
        title: `${k.name} (${k.category})`,
        badge: k.category,
        description: k.description,
        formula: mechanic ? `[${mechanic}]` : undefined,
        rules: k.rules
      }
    };
  }

  // 2. Check canonical traits database
  const canonical = ALL_CANONICAL_TRAITS.find(t => {
    const tId = (t.id || '').toLowerCase();
    const tName = (t.name || t.title || '').toLowerCase();
    const tNormId = normalizeTraitLookupKey(tId);
    const tNormName = normalizeTraitLookupKey(tName);
    return candidates.some(c => {
      const cl = c.toLowerCase();
      return tId === cl || tName === cl || tId === `trait-${cl}` || tId === `trait-sig-${cl}`;
    }) || normCandidates.some(nc => nc === tNormId || nc === tNormName);
  });

  if (canonical) {
    let cat = 'Trait';
    if (canonical.category === 'special_ability' || canonical.trait_type?.toLowerCase().includes('special ability')) {
      cat = cleanId.includes('humanoid') ? 'Humanoid Special Ability' : 'Special Ability';
    }
    const name = canonical.name;
    const label = `${name} - ${cat}`;
    const mechanic = (objMech || canonical.mechanic || canonical.mechanics || '').replace(/^\[|\]$/g, '');
    const rawCanonDesc = objDesc || canonical.description || canonical.desc || canonical.body?.split('\n\n## Description\n')?.[1]?.split('\n\n')[0] || `${name} trait.`;
    const description = cleanTraitDescriptionText(rawCanonDesc, mechanic);
    return {
      id: canonical.id || rawId,
      name,
      category: cat,
      label,
      description,
      mechanic,
      tooltip: {
        title: `${name} (${cat})`,
        badge: cat,
        description,
        formula: mechanic ? `[${mechanic}]` : undefined,
        rules: canonical.special_rules || canonical.rules || canonical.notes || '',
        cost: canonical.bp ? `${canonical.bp} BP` : undefined
      }
    };
  }

  // 2b. Check canonical features database (for species inherent_features like special-sense-uncontrolled)
  const canonicalFeat = DEFAULT_FEATURES.find(f => {
    const fId = (f.id || '').toLowerCase();
    const fName = (f.name || f.title || '').toLowerCase();
    const fNormId = normalizeTraitLookupKey(fId);
    const fNormName = normalizeTraitLookupKey(fName);
    return candidates.some(c => {
      const cl = c.toLowerCase();
      return fId === cl || fName === cl;
    }) || normCandidates.some(nc => nc === fNormId || nc === fNormName);
  });

  if (canonicalFeat) {
    const cat = 'Trait';
    const name = canonicalFeat.name;
    const label = `${name} - ${cat}`;
    const mechanic = (objMech || canonicalFeat.mechanic || canonicalFeat.mechanics || '').replace(/^\[|\]$/g, '');
    const description = cleanTraitDescriptionText(objDesc || canonicalFeat.description || `${name} innate feature.`, mechanic);
    return {
      id: canonicalFeat.id || rawId,
      name,
      category: cat,
      label,
      description,
      mechanic,
      tooltip: {
        title: `${name} (${cat})`,
        badge: cat,
        description,
        formula: mechanic ? `[${mechanic}]` : undefined,
        rules: canonicalFeat.special_rules || canonicalFeat.rules || mechanic || ''
      }
    };
  }

  // 3. Fallback smart parsing for ad-hoc trait identifiers
  let category = 'Trait';
  let innerStr = (!isGeneratedTraitId(cleanId) ? cleanId : '').replace(/^(trait|feature)[-_]/i, '');

  if (innerStr.includes('humanoid-special-ability') || innerStr.includes('humanoid_special_ability')) {
    category = 'Humanoid Special Ability';
    innerStr = innerStr.replace(/[-_]?humanoid[-_]special[-_]ability/i, '');
  } else if (innerStr.includes('special-ability') || innerStr.includes('special_ability')) {
    category = 'Special Ability';
    innerStr = innerStr.replace(/[-_]?special[-_]ability/i, '');
  }

  let name = cleanTraitName(innerStr);
  if (!name) name = 'Species Adaptation';

  // Quality of life improvements for common species trait labels
  if (name.toLowerCase() === 'aeld' || name.toLowerCase() === 'aeld lineage') {
    name = 'Aeld Lineage';
  } else if (name.toLowerCase().includes('sense alignment') || name.toLowerCase().includes('sense evil')) {
    name = 'Sense Alignment / Intent';
  } else if (name.toLowerCase() === 'alter form') {
    name = 'Alter Form';
  }

  const label = `${name} - ${category}`;
  const fallbackDesc = objDesc || `${name} is an innate ${category.toLowerCase()} granted by this species lineage.`;

  return {
    id: !isGeneratedTraitId(rawId) ? rawId : `trait-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    category,
    label,
    description: fallbackDesc,
    mechanic: objMech || '',
    tooltip: {
      title: `${name} (${category})`,
      badge: category,
      description: fallbackDesc,
      rules: objMech || ''
    }
  };
};

/**
 * Retrieve the clean, deduplicated array of all inherent guaranteed traits
 * from a selectedSpecies object across traits, species_traits, inherent_traits, and inherent_features.
 */
export const getInherentSpeciesTraits = (selectedSpecies) => {
  if (!selectedSpecies) return [];

  const rawPool = [
    ...(Array.isArray(selectedSpecies.inherent_traits) ? selectedSpecies.inherent_traits : []),
    ...(Array.isArray(selectedSpecies.traits) ? selectedSpecies.traits : []),
    ...(Array.isArray(selectedSpecies.species_traits) ? selectedSpecies.species_traits : []),
    ...(Array.isArray(selectedSpecies.inherent_features) ? selectedSpecies.inherent_features : [])
  ];

  const seen = new Set();
  const result = [];

  rawPool.forEach(item => {
    const rawKey = typeof item === 'object'
      ? ((!isGeneratedTraitId(item.id) && item.id) || item.name || item.title || '')
      : String(item);
    const cleanKey = normalizeTraitLookupKey(rawKey) || rawKey.toLowerCase().trim();
    if (cleanKey && !seen.has(cleanKey)) {
      seen.add(cleanKey);
      result.push(item);
    }
  });

  return result;
};
