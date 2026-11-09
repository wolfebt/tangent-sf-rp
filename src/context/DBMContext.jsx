import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db, auth, isFirestoreQuotaExhausted, handleFirestoreQuotaError } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { categoryConfig } from '../components/DBM/categoryConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { commitChunkedBatches, sanitizeFirestoreData } from '../utils/firestoreUtils';
import { validateDbmEntry } from '../utils/dbmValidators';

import { DEFAULT_ARCHETYPES } from '../data/archetypesData';
import { DEFAULT_SPECIES, SPECIES_LINEAGES, resolveSpeciesLineageName } from '../data/speciesData';
import { DEFAULT_SPECIES_TYPES } from '../data/speciesTypesData';
import { DEFAULT_OCCUPATIONS } from '../data/occupationsData';
import { DEFAULT_ORIGINS } from '../data/originsData';
import { DEFAULT_FACTIONS } from '../data/factionsData';
import { DEFAULT_FEATURES } from '../data/featuresData';
import { ALL_SPECIES_TRAITS, ALL_PILLAR_TRAITS, ALL_CANONICAL_TRAITS } from '../data/speciesTraitsData';
import { ALL_CANONICAL_SKILLS } from '../data/skillsData';
import { DEFAULT_SPECIES_DISADVANTAGES } from '../data/speciesDisadvantagesData';
import { DEFAULT_WEAPONRY } from '../data/weaponryData';
import { DEFAULT_ARMORING } from '../data/armoringData';
import { DEFAULT_GEAR } from '../data/gearData';
import { DEFAULT_MECHA } from '../data/mechaData';
import { DEFAULT_ARCHITECTURE } from '../data/architectureData';
import { DEFAULT_OTHER_PROPERTY } from '../data/otherPropertyData';
import { DEFAULT_AUGMENTATIONS } from '../data/augmentationsData';
import { DEFAULT_INVOCATIONS } from '../data/invocationsData';
import { DEFAULT_SYNTHESIS } from '../data/synthesisData';
import { DEFAULT_SPECIES_SIZES } from '../data/speciesSizeData';
import { DEFAULT_SPECIES_MOVEMENT } from '../data/speciesMovementData';
import {
  DEFAULT_AUGMENTATION_TYPES,
  DEFAULT_BODY_LOCATIONS,
  DEFAULT_AREA_PATTERNS,
  DEFAULT_EFFECT_TYPES,
  DEFAULT_RANGES,
  DEFAULT_TARGET_SPECIFICATIONS,
  DEFAULT_CRITICAL_EFFECTS,
  DEFAULT_CRITICAL_SUCCESS_EFFECTS,
  DEFAULT_CRITICAL_FAILURE_EFFECTS,
  DEFAULT_MATERIALS,
  DEFAULT_RESISTANCES,
  DEFAULT_MODES,
  DEFAULT_SPECIALS,
  DEFAULT_AVAILABILITY,
  DEFAULT_GEAR_CATEGORIES,
  DEFAULT_CLASSIFICATIONS,
  DEFAULT_CREATORS,
  DEFAULT_DESIGNS,
  DEFAULT_COMPONENTS,
  DEFAULT_PREREQUISITES,
  DEFAULT_MODIFIERS,
  DEFAULT_SOCIETAL_ENTRIES,
  DEFAULT_TECHNOLOGY,
  DEFAULT_ECONOMATRIX,
  DEFAULT_CONDITIONS,
  DEFAULT_DAMAGE_TYPES,
  DEFAULT_DISCIPLINES,
  DEFAULT_MANEUVERS,
  DEFAULT_RULES,
  DEFAULT_MASTER_SOCIETIES
} from '../data/supportingCatalogsData';
import { StorageService } from '../services/storageService';

const DBMContext = globalThis.__TANGENT_DBM_CONTEXT__ || (globalThis.__TANGENT_DBM_CONTEXT__ = createContext(null));

export const useDBM = () => useContext(DBMContext) || {};

export {
  TOMBSTONES_KEY,
  CUSTOM_ENTRIES_KEY,
  loadCompendiumCatalog,
  getOmnicortexCustomEntries,
  saveOmnicortexCustomEntry,
  removeOmnicortexCustomEntry,
  getOmnicortexTombstones,
  addOmnicortexTombstone,
  removeOmnicortexTombstones,
  clearOmnicortexTombstones,
  isOmnicortexDeleted,
  filterInitialData,
  mergeSeedsWithDocs,
  getFallbackSeedForCategory
} from '../utils/omnicortexPersistence.js';

import {
  TOMBSTONES_KEY,
  CUSTOM_ENTRIES_KEY,
  loadCompendiumCatalog,
  getOmnicortexCustomEntries,
  saveOmnicortexCustomEntry,
  removeOmnicortexCustomEntry,
  getOmnicortexTombstones,
  addOmnicortexTombstone,
  removeOmnicortexTombstones,
  clearOmnicortexTombstones,
  isOmnicortexDeleted,
  filterInitialData,
  mergeSeedsWithDocs,
  getFallbackSeedForCategory
} from '../utils/omnicortexPersistence.js';


const CANONICAL_SECTION_FALLBACK_SEEDS = {
  special_abilities: [
    {
      id: 'special-ability-aetheric-pulse',
      name: 'Aetheric Resonance Pulse',
      discipline: 'Energy',
      meta_skill: 'Channeling',
      area: ['Small Burst (10ft Radius) (+2 DC)'],
      effect: ['Kinetic / Force'],
      range: ['Close (30ft) (+2 DC)'],
      target: ['All Creatures in Area'],
      design_dc: 18,
      tech_level: 3,
      meta_level: 2,
      costs: { cp: 5, bp: 5, focus: 4 },
      description: 'Releases a concussive wave of resonant aetheric force that destabilizes nearby hostiles.',
      mechanic: '2d10 + Governing Attribute + Discipline Skill vs. CR 18 (Essence = ceil(18 / 5) = 4 Focus). Targets within 10ft suffer 2d8 Force damage and must pass a Fortitude save or be pushed 10ft.'
    },
    {
      id: 'special-ability-void-blink',
      name: 'Dimensional Phase Step',
      discipline: 'Dimension',
      meta_skill: 'Alteration',
      area: ['Single Target (+0 DC)'],
      effect: ['Spatial Displacement'],
      range: ['Close (30ft) (+2 DC)'],
      target: ['Self'],
      design_dc: 15,
      tech_level: 4,
      meta_level: 3,
      costs: { cp: 5, bp: 5, focus: 3 },
      description: 'Briefly folds local space-time to step instantaneously across tactical obstacles.',
      mechanic: 'Move Action; costs 3 Focus (ceil(15 / 5)). Teleport up to 30ft to an unoccupied space within line of sight without provoking reactions.'
    }
  ],
  modular_characters: [
    {
      id: 'mcm-syndicate-enforcer',
      name: 'Syndicate Heavy Enforcer',
      threatTier: 4,
      role: 'Tank',
      competencyRole: 'Tank',
      chassis_mode: 'Biological',
      designation: 'Adversary',
      bossType: 'Standard',
      sizeCategory: 'Medium',
      isSynthetic: false,
      tech_level: 4,
      meta_level: 1,
      craft_dc: 18,
      vitalityPoints: 45,
      healthPoints: 25,
      structurePoints: 0,
      armorDR: 8,
      description: 'Cybernetically reinforced corporate security operative deployed to secure high-value Syndicate assets.',
      mechanic: 'Role: Tank (Biological). Equipped with Heavy Riot Carapace (DR 8) and Mag-Shotgun (2d10+4 Kinetic, Penetration 2).'
    },
    {
      id: 'mcm-mekan-stalker-construct',
      name: 'Mekan Hunter-Seeker Construct',
      threatTier: 6,
      role: 'Skirmisher',
      competencyRole: 'Skirmisher',
      chassis_mode: 'Synthetic / Construct',
      designation: 'Adversary',
      bossType: 'Standard',
      sizeCategory: 'Medium',
      isSynthetic: true,
      tech_level: 4,
      meta_level: 0,
      craft_dc: 22,
      vitalityPoints: 0,
      healthPoints: 0,
      structurePoints: 65,
      armorDR: 10,
      description: 'Autonomous multi-limbed tactical reconnaissance and elimination unit operating on the Mekan collective grid.',
      mechanic: 'Role: Skirmisher (Synthetic / Construct). Immune to biological toxins and psychic fear; integrated Plasma Cutter (3d8 Plasma).'
    }
  ],
  companions: [
    {
      id: 'companion-cyber-hound-mk4',
      name: 'K-9 Cyber-Hound Mk IV',
      companion_type: 'Synthetic Drone / Automaton',
      form_package: 'Quadruped / Predator',
      function_packages: ['Recon / Scout', 'Guardian / Shield'],
      size: 'Medium',
      owner_tier: 2,
      companion_rank: 3,
      extra_features: ['Thermal Optics', 'Subvocal Telemetry Link'],
      cp: 3,
      description: 'Loyal quadruped tactical unit outfitted with multi-spectrum sensors and reinforced alloy jaws.',
      mechanic: 'Form: Quadruped / Predator; Functions: Recon / Scout, Guardian / Shield. Grants +2 to owner Perception/Tracking checks and can intercept melee attacks.'
    },
    {
      id: 'companion-aether-wisp-familiar',
      name: 'Luminous Aether-Wisp',
      companion_type: 'Metaphysical Familiar / Spirit',
      form_package: 'Amorphous / Spectral',
      function_packages: ['Arcane / Focus Conduit', 'Stealth / Infiltrator'],
      size: 'Tiny',
      owner_tier: 2,
      companion_rank: 2,
      extra_features: ['Resonance Battery', 'Phase Hover'],
      cp: 3,
      description: 'Sentient harmonic entity bound to an awakened practitioner’s aura, acting as a living focus conduit.',
      mechanic: 'Form: Amorphous / Spectral; Function: Arcane / Focus Conduit. Stores up to 4 reserve Focus points and grants +1 to Invocation checks.'
    }
  ],
  planetary_design: [
    {
      id: 'planet-prime-auriga',
      name: 'Auriga Prime',
      starClass: 'G',
      orbitalZone: 'BioZone (Habitable)',
      size: 6,
      size_code: 6,
      atmosphere: 4,
      atmosphere_code: 4,
      hydrography: 70,
      biosphere: 'Sophont',
      population: 10,
      population_code: 10,
      tech_level: 4,
      meta_level: 3,
      government: 4,
      lawLevel: 4,
      starport: 'A',
      uwp: 'A647A44-4',
      description: 'Core garden world and commercial nexus featuring orbital shipyards, deep-ocean arcologies, and ancient progenitor ruins.',
      highConcept: 'Cosmopolitan core world balancing high-tech trade with awakened metaphysical academies.'
    }
  ],
  world: [
    {
      id: 'world-auriga-prime',
      name: 'Auriga Prime',
      universe: 'Tangent Orion Arm',
      size: 6,
      size_code: 6,
      atmosphere: 4,
      atmosphere_code: 4,
      population: 10,
      population_code: 10,
      tech_level: 4,
      meta_level: 3,
      uwp: 'A647A44-4',
      starport: 'A',
      highConcept: 'Primary diplomatic and commercial hub of the Coalition of Independent Worlds.',
      description: 'A vibrant terrestrial world of sprawling spire-cities, orbital elevators, and resonant ley-line sanctuaries.',
      geography: 'Temperate continents separated by deep sapphire oceans and equatorial archipelagos.',
      culture: 'Pluralistic trade culture blending human, Aeld, and synthetic citizenry.'
    }
  ],
  universe: [
    {
      id: 'universe-tangent-prime',
      name: 'Tangent Space Continuum',
      scale: 'Galaxy',
      description: 'The primary sci-fi/metaphysical cosmos where relativistic starfaring civilizations intersect with dimensional Tangent Space and awakened psionic/arcane disciplines.',
      laws_of_physics: 'Standard relativistic physics augmented by Tangent Space FTL translation and the 6 Canonical Metaphysical Disciplines (Dimension, Energy, Entropy, Illusion, Matter, Mental).',
      thematicTone: 'High-stakes tactical space opera, cyber-occult intrigue, and frontier exploration.'
    }
  ],
  setting: [
    {
      id: 'setting-nexus-highport',
      name: 'Aegis Orbital Highport',
      world: 'Auriga Prime',
      description: 'Geosynchronous ring-station anchoring Auriga Prime’s primary orbital elevator, bustling with merchant hulls, syndicate brokers, and diplomatic envoys.',
      points_of_interest: 'Grand Spire Concourse, Dockyard Sector 7, The Null-G Bazaar, Diplomatic Enclave.',
      localRulesHazards: 'Law Level 5; concealed sidearms restricted, active neural-scan customs checkpoints.'
    }
  ],
  philosophy: [
    {
      id: 'philosophy-harmonic-convergence',
      name: 'The Harmonic Convergence',
      origin: 'Alterian & Aeld Mystic Orders',
      description: 'Philosophical tradition teaching that technological computation and metaphysical resonance are dual expressions of a single cosmic architecture.',
      coreDogmaTenets: 'Balance between mind, machine, and the dimensional weave; rejection of reckless entropy.',
      practices: 'Meditation within harmonic crystal chambers and disciplined Focus attunement.'
    }
  ],
  scene: [
    {
      id: 'scene-dockyard-ambush',
      name: 'Stand-Off at Dockyard Bay 14',
      scene_type: 'Action / Combat',
      dramatic_hook: 'Syndicate strike teams lock down the blast doors just as the courier vessel finishes fueling.',
      setting_location: 'Aegis Orbital Highport - Dockyard Sector 7',
      description: 'Sparks rain from overhead cargo gantries while mag-clamps seal the starship berth. The party must override the security terminal or breach the cordon before orbital defense cutters arrive.',
      mechanic: 'Computers or Engineering CR 20 to release docking clamps; low-gravity cargo cranes provide +2 cover.'
    }
  ],
  society_society: [
    {
      id: 'soc-gov-0-tribal',
      name: 'Stage 0: Tribal & Clan Councils',
      level: 0,
      category: 'society_society',
      sphere_key: 'society_society',
      description: 'Kinship bands, oral law, and localized chieftain or elder governance.'
    },
    {
      id: 'soc-gov-3-planetary',
      name: 'Stage 3: Unified Planetary & Interplanetary Governance',
      level: 3,
      category: 'society_society',
      sphere_key: 'society_society',
      description: 'System-wide constitutional federations, corporate directorates, and codified interstellar law.'
    },
    {
      id: 'soc-gov-5-post-scarcity',
      name: 'Stage 5: Post-Scarcity Consensus & Galactic Accord',
      level: 5,
      category: 'society_society',
      sphere_key: 'society_society',
      description: 'Instantaneous quantum-linked civic participation and post-scarcity resource allocation.'
    }
  ],
  society_synthetic_intelligence: [
    {
      id: 'soc-si-0-none',
      name: 'Stage 0: Mechanical Automation',
      level: 0,
      category: 'society_synthetic_intelligence',
      sphere_key: 'society_synthetic_intelligence',
      description: 'Purely mechanical clockwork and non-cognitive relay systems.'
    },
    {
      id: 'soc-si-3-self-aware',
      name: 'Stage 3: Self-Aware Automata (Theory of Mind)',
      level: 3,
      category: 'society_synthetic_intelligence',
      sphere_key: 'society_synthetic_intelligence',
      description: 'Sentient synthetic personas with independent initiative and emotional comprehension.'
    },
    {
      id: 'soc-si-4-agi',
      name: 'Stage 4: Artificial General Intelligence (AGI)',
      level: 4,
      category: 'society_synthetic_intelligence',
      sphere_key: 'society_synthetic_intelligence',
      description: 'Full cognitive parity and multi-domain synthesis across civic and scientific networks.'
    },
    {
      id: 'soc-si-5-asi',
      name: 'Stage 5: Hyper Intellect (ASI)',
      level: 5,
      category: 'society_synthetic_intelligence',
      sphere_key: 'society_synthetic_intelligence',
      description: 'Trans-sophont planetary computation cores and galactic strategic minds.'
    }
  ],
  society_science: [
    {
      id: 'soc-sci-3-advanced',
      name: 'Stage 3: Relativistic & Quantum Sciences',
      level: 3,
      category: 'society_science',
      sphere_key: 'society_science',
      description: 'Systematic mastery of high-energy physics, gravitics, and interstellar astrophysics.'
    }
  ],
  society_computation: [
    {
      id: 'soc-comp-3-quantum',
      name: 'Stage 3: Quantum & Neural Computation',
      level: 3,
      category: 'society_computation',
      sphere_key: 'society_computation',
      description: 'High-density optical and quantum processor cores with direct neural interface protocols.'
    }
  ],
  society_transportation: [
    {
      id: 'soc-trans-3-ftl',
      name: 'Stage 3: GEV & Reaction FTL Transit',
      level: 3,
      category: 'society_transportation',
      sphere_key: 'society_transportation',
      description: 'Gravitic surface transit, orbital shuttles, and interstellar FTL starship corridors.'
    }
  ]
};

const hydrateSectionItemsWithFallback = (items, catKey) => {
  const list = Array.isArray(items) ? items : [];
  if (list.length > 0) return list;
  const fallback = CANONICAL_SECTION_FALLBACK_SEEDS[catKey];
  if (!Array.isArray(fallback) || fallback.length === 0) return list;
  const tombstones = getOmnicortexTombstones();
  return fallback.filter(seed => !isOmnicortexDeleted(seed, tombstones));
};

export const DBMProvider = ({ children }) => {
  const [dbData, setDbData] = useState(() => {
    const initial = {
      compendium: filterInitialData(getFallbackSeedForCategory('compendium'), 'compendium'),
      archetypes: filterInitialData(DEFAULT_ARCHETYPES, 'archetypes'),
      species: filterInitialData(DEFAULT_SPECIES, 'species'),
      species_lineage: filterInitialData(SPECIES_LINEAGES, 'species_lineage'),
      species_type: filterInitialData(DEFAULT_SPECIES_TYPES, 'species_type'),
      species_size: filterInitialData(DEFAULT_SPECIES_SIZES, 'species_size'),
      species_movement: filterInitialData(DEFAULT_SPECIES_MOVEMENT, 'species_movement'),
      occupations: filterInitialData(DEFAULT_OCCUPATIONS, 'occupations'),
      origins: filterInitialData(DEFAULT_ORIGINS, 'origins'),
      factions: filterInitialData(DEFAULT_FACTIONS, 'factions'),
      features: filterInitialData(DEFAULT_FEATURES, 'features'),
      trait: filterInitialData(ALL_SPECIES_TRAITS, 'trait'),
      traits: filterInitialData(ALL_PILLAR_TRAITS, 'traits'),
      skills: filterInitialData(ALL_CANONICAL_SKILLS, 'skills'),
      disadvantages: filterInitialData(DEFAULT_SPECIES_DISADVANTAGES, 'disadvantages'),
      weaponry: filterInitialData(DEFAULT_WEAPONRY, 'weaponry'),
      armoring: filterInitialData(DEFAULT_ARMORING, 'armoring'),
      gear: filterInitialData(DEFAULT_GEAR, 'gear'),
      mecha: filterInitialData(DEFAULT_MECHA, 'mecha'),
      architecture: filterInitialData(DEFAULT_ARCHITECTURE, 'architecture'),
      other: filterInitialData(DEFAULT_OTHER_PROPERTY, 'other'),
      augmentations: filterInitialData(DEFAULT_AUGMENTATIONS, 'augmentations'),
      invocations: filterInitialData(DEFAULT_INVOCATIONS, 'invocations'),
      synthesis: filterInitialData(DEFAULT_SYNTHESIS, 'synthesis'),
      augmentation_type: filterInitialData(DEFAULT_AUGMENTATION_TYPES, 'augmentation_type'),
      body_location: filterInitialData(DEFAULT_BODY_LOCATIONS, 'body_location'),
      disciplines: filterInitialData(DEFAULT_DISCIPLINES, 'disciplines'),
      area: filterInitialData(DEFAULT_AREA_PATTERNS, 'area'),
      effect: filterInitialData(DEFAULT_EFFECT_TYPES, 'effect'),
      range: filterInitialData(DEFAULT_RANGES, 'range'),
      target: filterInitialData(DEFAULT_TARGET_SPECIFICATIONS, 'target'),
      critical_effect: filterInitialData(DEFAULT_CRITICAL_EFFECTS, 'critical_effect'),
      critical_success_effect: filterInitialData(DEFAULT_CRITICAL_SUCCESS_EFFECTS, 'critical_success_effect'),
      critical_failure_effect: filterInitialData(DEFAULT_CRITICAL_FAILURE_EFFECTS, 'critical_failure_effect'),
      material: filterInitialData(DEFAULT_MATERIALS, 'material'),
      resistance: filterInitialData(DEFAULT_RESISTANCES, 'resistance'),
      mode: filterInitialData(DEFAULT_MODES, 'mode'),
      special: filterInitialData(DEFAULT_SPECIALS, 'special'),
      availability: filterInitialData(DEFAULT_AVAILABILITY, 'availability'),
      gear_category: filterInitialData(DEFAULT_GEAR_CATEGORIES, 'gear_category'),
      classification: filterInitialData(DEFAULT_CLASSIFICATIONS, 'classification'),
      creator: filterInitialData(DEFAULT_CREATORS, 'creator'),
      design: filterInitialData(DEFAULT_DESIGNS, 'design'),
      component: filterInitialData(DEFAULT_COMPONENTS, 'component'),
      prerequisite: filterInitialData(DEFAULT_PREREQUISITES, 'prerequisite'),
      modifier: filterInitialData(DEFAULT_MODIFIERS, 'modifier'),
      technology: filterInitialData(DEFAULT_TECHNOLOGY, 'technology'),
      economatrix: filterInitialData(DEFAULT_ECONOMATRIX, 'economatrix'),
      rules: filterInitialData(DEFAULT_RULES, 'rules'),
      conditions: filterInitialData(DEFAULT_CONDITIONS, 'conditions'),
      damage_types: filterInitialData(DEFAULT_DAMAGE_TYPES, 'damage_types'),
      maneuvers: filterInitialData(DEFAULT_MANEUVERS, 'maneuvers'),
      societies: filterInitialData(DEFAULT_MASTER_SOCIETIES, 'societies'),
      modular_characters: hydrateSectionItemsWithFallback(filterInitialData(CANONICAL_SECTION_FALLBACK_SEEDS.modular_characters, 'modular_characters'), 'modular_characters'),
      companions: hydrateSectionItemsWithFallback(filterInitialData(CANONICAL_SECTION_FALLBACK_SEEDS.companions, 'companions'), 'companions'),
      special_abilities: hydrateSectionItemsWithFallback(filterInitialData(CANONICAL_SECTION_FALLBACK_SEEDS.special_abilities, 'special_abilities'), 'special_abilities'),
      planetary_design: hydrateSectionItemsWithFallback(filterInitialData(CANONICAL_SECTION_FALLBACK_SEEDS.planetary_design, 'planetary_design'), 'planetary_design'),
      universe: hydrateSectionItemsWithFallback(filterInitialData(CANONICAL_SECTION_FALLBACK_SEEDS.universe, 'universe'), 'universe'),
      world: hydrateSectionItemsWithFallback(filterInitialData(CANONICAL_SECTION_FALLBACK_SEEDS.world, 'world'), 'world'),
      setting: hydrateSectionItemsWithFallback(filterInitialData(CANONICAL_SECTION_FALLBACK_SEEDS.setting, 'setting'), 'setting'),
      philosophy: hydrateSectionItemsWithFallback(filterInitialData(CANONICAL_SECTION_FALLBACK_SEEDS.philosophy, 'philosophy'), 'philosophy'),
      scene: hydrateSectionItemsWithFallback(filterInitialData(CANONICAL_SECTION_FALLBACK_SEEDS.scene, 'scene'), 'scene')
    };

    [
      'society_agriculture',
      'society_architecture',
      'society_biotechnology',
      'society_commerce',
      'society_communication',
      'society_computation',
      'society_devices',
      'society_education',
      'society_energy',
      'society_manufacturing',
      'society_materials',
      'society_medicine',
      'society_science',
      'society_society',
      'society_synthetic_intelligence',
      'society_synthetics',
      'society_transportation',
      'society_weaponry'
    ].forEach(sphereKey => {
      const sphereSeeds = DEFAULT_SOCIETAL_ENTRIES.filter(
        e => e.category === sphereKey || e.sphere_key === sphereKey
      );
      const effectiveSeeds = sphereSeeds.length > 0
        ? sphereSeeds
        : (CANONICAL_SECTION_FALLBACK_SEEDS[sphereKey] || []);
      initial[sphereKey] = hydrateSectionItemsWithFallback(
        filterInitialData(effectiveSeeds, sphereKey),
        sphereKey
      );
    });

    return initial;
  });
  const [currentUser, setCurrentUser] = useState(auth?.currentUser || null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Maintain resilient ref for rollbacks without re-creating callbacks
  const latestDbDataRef = useRef(dbData);
  useEffect(() => {
    latestDbDataRef.current = dbData;
  }, [dbData]);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const showToast = useCallback((toast) => {
    if (typeof toast === 'string') {
      setToastMessage({ type: 'info', text: toast });
    } else {
      setToastMessage(toast);
    }
  }, []);

  // Listen to Auth state changes
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Real-time Firestore Subscriptions for core mutable collections (Quota-Safe)
  useEffect(() => {
    if (isFirestoreQuotaExhausted()) {
      setIsLoading(false);
      return;
    }

    const unsubs = [];
    // Subscribe only to primary user-customizable collections; static reference tables
    // and the 300+ article compendium are already 100% locally seeded & merged with localStorage.
    const syncedCatKeys = [
      'archetypes',
      'species',
      'occupations',
      'origins',
      'factions',
      'features',
      'trait',
      'traits',
      'skills',
      'disadvantages',
      'weaponry',
      'armoring',
      'gear',
      'mecha',
      'architecture',
      'other',
      'augmentations',
      'invocations',
      'technology',
      'modular_characters',
      'companions',
      'special_abilities',
      'planetary_design',
      'universe',
      'world',
      'setting',
      'philosophy',
      'scene'
    ];

    let pendingCount = syncedCatKeys.length;
    let cancelled = false;

    const cleanupAll = () => {
      cancelled = true;
      while (unsubs.length > 0) {
        const u = unsubs.pop();
        if (typeof u === 'function') {
          try { u(); } catch (_) {}
        }
      }
    };

    syncedCatKeys.forEach(catK => {
      if (cancelled || isFirestoreQuotaExhausted()) return;
      try {
        const refCol = collection(db, catK);
        const unsubRef = onSnapshot(
          refCol,
          (snapshot) => {
            if (cancelled) return;
            const tombstones = getOmnicortexTombstones();
            const rawDocs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
            const items = hydrateSectionItemsWithFallback(
              mergeSeedsWithDocs(rawDocs, catK, tombstones),
              catK
            );

            setDbData(prev => ({
              ...prev,
              [catK]: items
            }));
            pendingCount--;
            if (pendingCount <= 0) {
              setIsLoading(false);
            }
          },
          (err) => {
            if (handleFirestoreQuotaError(err)) {
              cleanupAll();
              setIsLoading(false);
              return;
            }
            const tombstones = getOmnicortexTombstones();
            const items = hydrateSectionItemsWithFallback(
              mergeSeedsWithDocs([], catK, tombstones),
              catK
            );
            setDbData(prev => ({ ...prev, [catK]: items }));
            pendingCount--;
            if (pendingCount <= 0) {
              setIsLoading(false);
            }
          }
        );
        unsubs.push(unsubRef);
      } catch (e) {
        if (handleFirestoreQuotaError(e)) {
          cleanupAll();
          setIsLoading(false);
          return;
        }
        const tombstones = getOmnicortexTombstones();
        const items = hydrateSectionItemsWithFallback(
          mergeSeedsWithDocs([], catK, tombstones),
          catK
        );
        setDbData(prev => ({ ...prev, [catK]: items }));
        pendingCount--;
        if (pendingCount <= 0) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      cleanupAll();
    };
  }, []);

  // Lazy-load compendium seed on demand
  const ensureCompendiumLoaded = useCallback(async () => {
    const seed = await loadCompendiumCatalog();
    if (latestDbDataRef.current.compendium?.length === seed.length && seed.length > 0) {
      return latestDbDataRef.current.compendium;
    }
    const tombstones = getOmnicortexTombstones();
    setDbData(prev => {
      const merged = mergeSeedsWithDocs(prev.compendium || [], 'compendium', tombstones);
      return { ...prev, compendium: merged };
    });
    return seed;
  }, []);

  // Sync all Canonical Compendium Articles to Firestore Cloud (and purge legacy non-canonical articles)
  const syncCanonicalCompendium = useCallback(async () => {
    try {
      const seed = await loadCompendiumCatalog();
      const canonicalIds = new Set(seed.map(item => item.id));
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${seed.length} canonical articles to cloud...` });
      const operations = seed.map(item => ({
        ref: doc(db, 'compendium', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      try {
        const snap = await getDocs(collection(db, 'compendium'));
        for (const d of snap.docs) {
          if (!canonicalIds.has(d.id)) {
            await deleteDoc(doc(db, 'compendium', d.id));
          }
        }
      } catch (cleanupErr) {
        console.warn('[DBMContext] Could not purge legacy compendium docs:', cleanupErr);
      }

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Compendium Synced',
        text: `All ${seed.length} canonical articles successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalCompendium failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync compendium to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all Canonical Species to Firestore Cloud
  const syncCanonicalSpecies = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${DEFAULT_SPECIES.length} canonical species to cloud...` });
      const activeLineages = latestDbDataRef.current?.species_lineage?.length
        ? latestDbDataRef.current.species_lineage
        : SPECIES_LINEAGES;
      removeOmnicortexCustomEntry('species', 'species-aeld-celestine');
      removeOmnicortexCustomEntry('species', 'species-aeld-nocturne');
      const resolvedSpeciesList = DEFAULT_SPECIES.map(item => {
        removeOmnicortexCustomEntry('species', item.id);
        return {
          ...item,
          parent_species: resolveSpeciesLineageName(item, activeLineages) || item.parent_species,
          updatedAt: new Date().toISOString()
        };
      });
      setDbData(prev => ({
        ...prev,
        species: mergeSeedsWithDocs(resolvedSpeciesList, 'species')
      }));
      const operations = resolvedSpeciesList.map(item => ({
        ref: doc(db, 'species', item.id),
        data: item,
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      try {
        await deleteDoc(doc(db, 'species', 'species-aeld-celestine'));
        await deleteDoc(doc(db, 'species', 'species-aeld-nocturne'));
      } catch (_) {}
      showToast({
        type: 'success',
        title: 'Species Synced',
        text: `All ${DEFAULT_SPECIES.length} canonical species successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalSpecies failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync species to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all Canonical Factions to Firestore Cloud
  const syncCanonicalFactions = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${DEFAULT_FACTIONS.length} canonical factions to cloud...` });
      
      // Remove any tombstone records for canonical factions
      const canonicalIdentifiers = DEFAULT_FACTIONS.flatMap(f => [
        f.id,
        f.name,
        f.title
      ]).filter(Boolean);
      removeOmnicortexTombstones(canonicalIdentifiers);

      // Immediately ensure all canonical factions are present in local state
      setDbData(prev => {
        const existing = prev['factions'] || [];
        const existingIds = new Set(existing.map(i => (i.id || '').toString().toLowerCase().trim()));
        const missing = DEFAULT_FACTIONS.filter(f => !existingIds.has((f.id || '').toString().toLowerCase().trim()));
        return {
          ...prev,
          factions: [...existing, ...missing]
        };
      });

      const operations = DEFAULT_FACTIONS.map(item => ({
        ref: doc(db, 'factions', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Factions Synced',
        text: `All ${DEFAULT_FACTIONS.length} canonical factions successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalFactions failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync factions to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all Canonical Origins to Firestore Cloud
  const syncCanonicalOrigins = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${DEFAULT_ORIGINS.length} canonical origins to cloud...` });
      const operations = DEFAULT_ORIGINS.map(item => ({
        ref: doc(db, 'origins', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Origins Synced',
        text: `All ${DEFAULT_ORIGINS.length} canonical origins successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalOrigins failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync origins to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all Canonical Occupations to Firestore Cloud
  const syncCanonicalOccupations = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${DEFAULT_OCCUPATIONS.length} canonical occupations to cloud...` });
      const operations = DEFAULT_OCCUPATIONS.map(item => ({
        ref: doc(db, 'occupations', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Occupations Synced',
        text: `All ${DEFAULT_OCCUPATIONS.length} canonical occupations successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalOccupations failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync occupations to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all Canonical Invocations to Firestore Cloud
  const syncCanonicalInvocations = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${DEFAULT_INVOCATIONS.length} canonical invocations to cloud...` });
      const operations = DEFAULT_INVOCATIONS.map(item => ({
        ref: doc(db, 'invocations', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Invocations Synced',
        text: `All ${DEFAULT_INVOCATIONS.length} canonical invocations successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalInvocations failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync invocations to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all 5 foundational recommendation datasets to Firestore Cloud
  const syncCanonicalAllRecommendations = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing All Recommendations...', text: 'Syncing species, factions, origins, occupations, and invocations...' });
      await syncCanonicalSpecies();
      await syncCanonicalFactions();
      await syncCanonicalOrigins();
      await syncCanonicalOccupations();
      await syncCanonicalInvocations();
      showToast({
        type: 'success',
        title: 'Full Recommendations Synced',
        text: 'All canonical recommendation and guidance directives successfully synced to Firestore.'
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalAllRecommendations failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not complete full recommendations sync.'
      });
      return false;
    }
  }, [showToast, syncCanonicalSpecies, syncCanonicalFactions, syncCanonicalOrigins, syncCanonicalOccupations, syncCanonicalInvocations]);

  // Sync Master Species Matrix (Types, Sizes, Movements, Traits, Disadvantages, Species) to Firestore Cloud
  const syncMasterSpeciesMatrix = useCallback(async () => {
    try {
      showToast({
        type: 'info',
        title: 'Syncing Species Matrix...',
        text: 'Syncing complete Canonical Species Matrix (Types, Sizes, Movement, Traits, Disadvantages, Species) to cloud...'
      });

      const operations = [];

      const activeLineages = latestDbDataRef.current?.species_lineage?.length
        ? latestDbDataRef.current.species_lineage
        : SPECIES_LINEAGES;

      // 0. Species Lineages
      activeLineages.forEach(item => {
        operations.push({
          ref: doc(db, 'species_lineage', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 1. Species Types
      DEFAULT_SPECIES_TYPES.forEach(item => {
        operations.push({
          ref: doc(db, 'species_type', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 2. Species Sizes
      DEFAULT_SPECIES_SIZES.forEach(item => {
        operations.push({
          ref: doc(db, 'species_size', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 3. Species Movement
      DEFAULT_SPECIES_MOVEMENT.forEach(item => {
        operations.push({
          ref: doc(db, 'species_movement', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 4. Species Traits ('trait') and Pillar Traits ('traits')
      ALL_SPECIES_TRAITS.forEach(item => {
        operations.push({
          ref: doc(db, 'trait', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });
      ALL_PILLAR_TRAITS.forEach(item => {
        operations.push({
          ref: doc(db, 'traits', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 5. Species Disadvantages
      DEFAULT_SPECIES_DISADVANTAGES.forEach(item => {
        operations.push({
          ref: doc(db, 'disadvantages', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 6. Species
      DEFAULT_SPECIES.forEach(item => {
        operations.push({
          ref: doc(db, 'species', item.id),
          data: {
            ...item,
            parent_species: resolveSpeciesLineageName(item, activeLineages) || item.parent_species,
            updatedAt: new Date().toISOString()
          },
          merge: true
        });
      });

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Species Matrix Synced',
        text: `Successfully synced ${operations.length} species matrix records to Firestore Cloud!`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncMasterSpeciesMatrix failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync species matrix to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Safe Save Entry with Local Persistence, Schema Validation & Cloud Sync
  const saveEntry = useCallback(async (rawPayload, key) => {
    if (!rawPayload || !key) {
      const errorMsg = 'Cannot save DBM entry: missing payload or category key.';
      console.warn(`[DBMContext] ${errorMsg}`);
      setToastMessage({ type: 'error', text: errorMsg });
      return false;
    }

    const payload = { ...rawPayload };
    const docId = payload.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    payload.id = docId;

    if (key === 'species') {
      const activeLineages = latestDbDataRef.current?.species_lineage || SPECIES_LINEAGES;
      payload.parent_species = resolveSpeciesLineageName(payload, activeLineages) || payload.parent_species;
    } else if (key === 'species_lineage') {
      const prevLineages = latestDbDataRef.current?.species_lineage || SPECIES_LINEAGES;
      const prevLin = prevLineages.find(l => (l.id || '').toString().toLowerCase() === docId.toString().toLowerCase());
      const seedLin = SPECIES_LINEAGES.find(l => (l.id || '').toString().toLowerCase() === docId.toString().toLowerCase());
      payload.aliases = Array.from(new Set([
        ...(seedLin?.aliases || []),
        ...(prevLin?.aliases || []),
        ...(Array.isArray(payload.aliases) ? payload.aliases : []),
        seedLin?.name,
        prevLin?.name,
        payload.name
      ].filter(Boolean)));
    }

    // 1. Schema Validation
    const validation = validateDbmEntry(key, payload);
    if (!validation.valid) {
      const errorSummary = validation.errors.join(' ');
      console.warn(`[DBMContext] Validation failed for entry "${docId}":`, errorSummary);
      setToastMessage({
        type: 'error',
        title: 'Validation Error',
        text: errorSummary
      });
      return false;
    }

    const sanitizedEntry = {
      ...payload,
      updatedAt: new Date().toISOString()
    };

    // 2. Persist locally to storage immediately so edits are NEVER lost
    saveOmnicortexCustomEntry(key, sanitizedEntry);

    // 3. Optimistic UI update
    setDbData(prev => {
      const existing = prev[key] || [];
      const idx = existing.findIndex(i => (i.id || '').toString().toLowerCase() === docId.toString().toLowerCase());
      const updated = idx >= 0
        ? existing.map(i => (i.id || '').toString().toLowerCase() === docId.toString().toLowerCase() ? sanitizedEntry : i)
        : [...existing, sanitizedEntry];

      if (key === 'species_lineage') {
        const customSpeciesMap = getOmnicortexCustomEntries()['species'] || {};
        const updatedSpecies = (prev.species || []).map(sp => {
          const resolvedParent = resolveSpeciesLineageName(sp, updated) || sp.parent_species;
          if (sp.parent_species === resolvedParent && (!sp.lineage || sp.lineage === resolvedParent)) {
            return sp;
          }
          const nextSp = {
            ...sp,
            parent_species: resolvedParent,
            ...(sp.lineage !== undefined ? { lineage: resolvedParent } : {})
          };
          const spId = (sp.id || '').toString().toLowerCase().trim();
          if (spId && customSpeciesMap[spId]) {
            saveOmnicortexCustomEntry('species', nextSp);
          }
          return nextSp;
        });
        return { ...prev, [key]: updated, species: updatedSpecies };
      }

      return { ...prev, [key]: updated };
    });

    // 4. Firestore persistence if authenticated and quota available
    if ((auth.currentUser || currentUser) && !isFirestoreQuotaExhausted()) {
      try {
        const docRef = doc(db, key, docId);
        const cleanPayload = sanitizeFirestoreData(sanitizedEntry);
        await setDoc(docRef, cleanPayload, { merge: true });
      } catch (err) {
        handleFirestoreQuotaError(err);
        // Do NOT rollback local state! Local storage and state have preserved the changes.
      }
    }

    return true;
  }, [currentUser]);

  // Backward-compatible alias supporting saveItem(key, rawPayload) signature used by ADE bridge callers
  const saveItem = useCallback(async (key, rawPayload) => {
    return saveEntry(rawPayload, key);
  }, [saveEntry]);

  // Safe Delete Entry with Multi-Collection Scan & Tombstone Persistence
  const deleteEntry = useCallback(async (docId, key) => {
    if (!docId) return false;

    // 1. Capture snapshot from resilient ref
    const previousSnapshot = latestDbDataRef.current;
    let targetName = null;

    // 2. Search local dbData to locate target item name
    for (const k of Object.keys(previousSnapshot)) {
      if (Array.isArray(previousSnapshot[k])) {
        const match = previousSnapshot[k].find(
          i => i.id === docId || (i.name && i.name.toString().toLowerCase() === docId.toString().toLowerCase())
        );
        if (match) {
          targetName = (match.name || match.title || '').trim();
          break;
        }
      }
    }
    if (!targetName && typeof docId === 'string' && docId.trim()) {
      targetName = docId.trim();
    }

    const displayName = targetName || docId;

    // Persist tombstone by docId so seed arrays and caches never resurrect this specific deleted entry
    addOmnicortexTombstone(docId);
    removeOmnicortexCustomEntry(key, docId);

    // 3. Optimistic local removal across collections (by docId ONLY)
    setDbData(prev => {
      const nextState = { ...prev };
      Object.keys(nextState).forEach(k => {
        if (Array.isArray(nextState[k])) {
          nextState[k] = nextState[k].filter(i =>
            i.id !== docId &&
            i.id?.toString().toLowerCase() !== docId.toString().toLowerCase()
          );
        }
      });
      return nextState;
    });

    // 4. Cloud delete execution across related reference collections (by docId ONLY)
    if (auth.currentUser || currentUser) {
      try {
        const collectionsToScan = Array.from(new Set([
          key,
          'rules_codex',
          'rules',
          'lore',
          'compendium',
          'compendium_rules',
          'omnicortex',
          'articles',
          'wiki'
        ])).filter(Boolean);

        for (const scanKey of collectionsToScan) {
          try {
            const colRef = collection(db, scanKey);
            const allDocs = await getDocs(colRef);

            for (const d of allDocs.docs) {
              const data = d.data() || {};
              const dId = (d.id || '').toString().toLowerCase();
              const payloadId = (data.id || '').toString().toLowerCase();

              // Match ONLY by document ID to avoid deleting separate records that share a name!
              const isMatch =
                dId === docId.toString().toLowerCase() ||
                payloadId === docId.toString().toLowerCase();

              if (isMatch) {
                await deleteDoc(d.ref);
              }
            }
          } catch (scanErr) {
            console.warn(`[DBMContext deleteEntry] Scan error on collection "${scanKey}":`, scanErr.message);
          }
        }
      } catch (err) {
        console.warn(`[DBMContext] Cloud delete notice for "${docId}":`, err.message);
      }
    }

    setToastMessage({
      type: 'success',
      title: 'Deleted',
      text: `"${displayName}" successfully removed.`
    });
    return true;
  }, [currentUser]);

  // Safe Batch JSON Import with Schema Validation & Chunking
  const importJSON = useCallback(async (list, key) => {
    if (!Array.isArray(list) || list.length === 0 || !key) {
      setToastMessage({ type: 'warning', text: 'No entries to import.' });
      return false;
    }

    // 1. Prepare and validate each item
    const preparedList = [];
    const validationErrors = [];

    list.forEach((item, index) => {
      const docId = item.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const candidate = {
        ...item,
        id: docId,
        updatedAt: new Date().toISOString()
      };
      const validation = validateDbmEntry(key, candidate);
      if (!validation.valid) {
        validationErrors.push(`Item #${index + 1} (${candidate.name || 'Unnamed'}): ${validation.errors.join(', ')}`);
      } else {
        preparedList.push(candidate);
      }
    });

    if (preparedList.length === 0) {
      setToastMessage({
        type: 'error',
        title: 'Import Validation Failed',
        text: validationErrors.slice(0, 3).join(' | ')
      });
      return false;
    }

    // 2. Persist locally to storage immediately
    preparedList.forEach(item => {
      saveOmnicortexCustomEntry(key, item);
    });

    // 3. Optimistic UI update
    setDbData(prev => {
      const existing = prev[key] || [];
      const existingIds = new Set(existing.map(i => (i.id || '').toString().toLowerCase()));
      const newItems = preparedList.filter(i => !existingIds.has((i.id || '').toLowerCase()));
      const updatedExisting = existing.map(item => {
        const match = preparedList.find(p => (p.id || '').toString().toLowerCase() === (item.id || '').toString().toLowerCase());
        return match || item;
      });
      const updatedList = [...updatedExisting, ...newItems];
      if (key === 'species_lineage') {
        const updatedSpecies = (prev.species || []).map(sp => {
          const resolvedParent = resolveSpeciesLineageName(sp, updatedList) || sp.parent_species;
          if (sp.parent_species === resolvedParent && (!sp.lineage || sp.lineage === resolvedParent)) {
            return sp;
          }
          return {
            ...sp,
            parent_species: resolvedParent,
            ...(sp.lineage !== undefined ? { lineage: resolvedParent } : {})
          };
        });
        return { ...prev, [key]: updatedList, species: updatedSpecies };
      }
      return { ...prev, [key]: updatedList };
    });

    // If no authenticated user, keep optimistic state
    if (!auth.currentUser && !currentUser) {
      setToastMessage({
        type: 'success',
        text: `Imported ${preparedList.length} item(s) locally.`
      });
      return true;
    }

    // 4. Chunked cloud commit
    try {
      const operations = preparedList.map(item => ({
        ref: doc(db, key, item.id),
        data: sanitizeFirestoreData(item),
        merge: true
      }));
      await commitChunkedBatches(operations, 450);
      setToastMessage({
        type: 'success',
        title: 'Import Complete',
        text: `Successfully imported ${preparedList.length} entry/entries.`
      });
      return true;
    } catch (err) {
      console.warn('[DBMContext] importJSON batch write failed:', err);
      setToastMessage({
        type: 'info',
        title: 'Import Complete (Local)',
        text: `Imported ${preparedList.length} entries locally (cloud sync offline).`
      });
      return true;
    }
  }, [currentUser]);

  // Master Database Backup Export & Restore Import
  const handleExportMasterJSON = useCallback(async () => {
    try {
      const allKeys = Object.keys(categoryConfig).filter(
        k => !categoryConfig[k].isParent && categoryConfig[k].viewType !== 'guide'
      );
      const masterCollections = {};
      
      for (const colKey of allKeys) {
        if (dbData[colKey] && dbData[colKey].length > 0) {
          masterCollections[colKey] = dbData[colKey];
        } else {
          try {
            const snap = await getDocs(collection(db, colKey));
            masterCollections[colKey] = snap.docs.map(d => ({ ...d.data(), id: d.id }));
          } catch (e) {
            masterCollections[colKey] = [];
          }
        }
      }

      const backup = {
        type: "OmnicortexMasterDatabase",
        version: "2.0",
        exportedAt: new Date().toISOString(),
        collections: masterCollections
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omnicortex_universe_master_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast({ type: 'success', text: 'Master Database backup exported successfully.' });
    } catch (err) {
      console.error("Master Export error:", err);
      showToast({ type: 'error', text: "Failed to export Master Database: " + err.message });
    }
  }, [dbData, showToast]);

  const handleImportMasterJSON = useCallback((e) => {
    const file = e?.target?.files?.[0] || e;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const collections = parsed.collections || (parsed.type === "OmnicortexMasterDatabase" ? parsed : null);
        if (!collections) {
          showToast({ type: 'error', text: "Invalid master database format. Expected 'collections' map." });
          return;
        }
        let totalCount = 0;
        for (const [colKey, items] of Object.entries(collections)) {
          if (Array.isArray(items) && items.length > 0) {
            await importJSON(items, colKey);
            totalCount += items.length;
          }
        }
        showToast({ type: 'success', text: `Successfully imported Master Backup (${totalCount} entries across ${Object.keys(collections).length} collections)!` });
      } catch (err) {
        console.error("Master Import error:", err);
        showToast({ type: 'error', text: "Invalid Master JSON file format." });
      }
    };
    reader.readAsText(file);
    if (e?.target) e.target.value = '';
  }, [importJSON, showToast]);

  // Omnicortex Navigation History & Global State
  const [activeCategory, setActiveCategory] = useState('species');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [history, setHistory] = useState(['species']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sidebar Menu Drawer State (Open by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBastionOpen, setIsBastionOpen] = useState(false);
  const [isArchitectModalOpen, setIsArchitectModalOpen] = useState(false);

  const navigateToCategory = useCallback((catKey, subKey = null) => {
    setActiveCategory(catKey);
    setActiveSubcategory(subKey);

    setHistory(prevHistory => {
      const nextHistory = prevHistory.slice(0, historyIndex + 1);
      nextHistory.push(subKey ? `${catKey}:${subKey}` : catKey);
      setHistoryIndex(nextHistory.length - 1);
      return nextHistory;
    });
  }, [historyIndex]);

  const handleBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const target = history[prevIdx];
      setHistoryIndex(prevIdx);
      if (target.includes(':')) {
        const [cat, sub] = target.split(':');
        setActiveCategory(cat);
        setActiveSubcategory(sub);
      } else {
        setActiveCategory(target);
        setActiveSubcategory(null);
      }
    }
  }, [history, historyIndex]);

  const handleForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const target = history[nextIdx];
      setHistoryIndex(nextIdx);
      if (target.includes(':')) {
        const [cat, sub] = target.split(':');
        setActiveCategory(cat);
        setActiveSubcategory(sub);
      } else {
        setActiveCategory(target);
        setActiveSubcategory(null);
      }
    }
  }, [history, historyIndex]);

  return (
    <DBMContext.Provider value={{
      dbData,
      isLoading,
      loadError,
      toastMessage,
      clearToast,
      showToast,
      saveEntry,
      saveItem,
      deleteEntry,
      importJSON,
      syncCanonicalCompendium,
      ensureCompendiumLoaded,
      loadCompendiumCatalog,
      syncCanonicalSpecies,
      syncCanonicalFactions,
      syncCanonicalOrigins,
      syncCanonicalOccupations,
      syncCanonicalInvocations,
      syncCanonicalAllRecommendations,
      syncMasterSpeciesMatrix,
      removeOmnicortexTombstones,
      clearOmnicortexTombstones,
      clearTombstonesForCategory: clearOmnicortexTombstones,
      handleExportMasterJSON,
      handleImportMasterJSON,
      activeCategory,
      setActiveCategory,
      activeSubcategory,
      setActiveSubcategory,
      history,
      historyIndex,
      navigateToCategory,
      handleBack,
      handleForward,
      isSidebarOpen,
      setIsSidebarOpen,
      isBastionOpen,
      setIsBastionOpen,
      isArchitectModalOpen,
      setIsArchitectModalOpen
    }}>
      {children}
    </DBMContext.Provider>
  );
};
