/**
 * @file cortexAdeConsolidation.test.mjs
 * @description End-to-end verification of the OmniCortex / Codex ↔ ADE Element Consolidation:
 *   1. OmniCortex `CATEGORY_CONFIG` consolidated ADE fields & `validateDbmEntry` compatibility
 *   2. `Property` consolidation (renaming `Item` + `Technology` -> `Property` with 8 Cortex subcategories)
 *   3. `omnicortexPersistence.js` fallback hydration for newly hydrated collections (`modular_characters`, `planetary_design`, `universe`, `world`, `setting`, `philosophy`, `scene`, `special_abilities`)
 *   4. `cortexAdeAssetBridge.js` projection of Cortex Species, Factions, 8 Property collections, Folio Personas, and MCM units into ADE, deduplication with Story Module pins, and lossless bidirectional consolidation back into Cortex payloads.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  categoryConfig as CATEGORY_CONFIG,
  ADE_CONSOLIDATED_LOREBOOK_FIELDS,
  ADE_CONSOLIDATED_PROPERTY_FIELDS,
  ADE_CONSOLIDATED_METAPHYSICS_FIELDS
} from '../../src/components/DBM/categoryConfig.js';
import { validateDbmEntry } from '../../src/utils/dbmValidators.js';
import { filterInitialData, getFallbackSeedForCategory } from '../../src/utils/omnicortexPersistence.js';
import {
  ELEMENT_TYPES,
  PROPERTY_SUBCATEGORIES,
  PERSONA_SUBCATEGORIES,
  METAPHYSICS_SUBCATEGORIES,
  ELEMENT_SCHEMAS,
  normalizeElementType,
  inferPropertySubcategory,
  inferMetaphysicsSubcategory,
  getElementFileExtension
} from '../../src/pages/Foundry/ElementForge/elementSchemas.js';
import {
  CORTEX_PROPERTY_COLLECTIONS,
  CORTEX_METAPHYSICS_COLLECTIONS,
  projectOmnicortexRecordToAdeElement,
  projectFolioPersonaToAdeElement,
  buildUnifiedAdeCatalog,
  resolveTargetCortexCollection,
  consolidateAdeElementToCortexPayload
} from '../../src/utils/cortexAdeAssetBridge.js';

test('Phase 1: OmniCortex CATEGORY_CONFIG consolidates ADE fields across Species, Factions, 8 Property subcategories, MCM, and World/Narrative categories', () => {
  assert.ok(ADE_CONSOLIDATED_LOREBOOK_FIELDS.oneLinePitch);
  assert.ok(ADE_CONSOLIDATED_LOREBOOK_FIELDS.primaryTriggers);
  assert.ok(ADE_CONSOLIDATED_PROPERTY_FIELDS.mechanismPowerSource);

  // Personal Property parent includes all 7 canonical property subcategories (technology is in Dev Fields)
  const propSubs = CATEGORY_CONFIG.personal_property.subItems;
  for (const expected of ['gear', 'weaponry', 'armoring', 'augmentations', 'mecha', 'architecture', 'other']) {
    assert.ok(propSubs.includes(expected), `personal_property.subItems should include "${expected}"`);
    assert.ok(CATEGORY_CONFIG[expected], `CATEGORY_CONFIG.${expected} must exist`);
    assert.ok(CATEGORY_CONFIG[expected].fields.oneLinePitch, `CATEGORY_CONFIG.${expected} must consolidate oneLinePitch`);
    assert.ok(CATEGORY_CONFIG[expected].fields.primaryTriggers, `CATEGORY_CONFIG.${expected} must consolidate primaryTriggers`);
  }
  assert.ok(!propSubs.includes('technology'), 'personal_property.subItems should not include "technology" (it resides in Dev Fields)');
  assert.equal(CATEGORY_CONFIG.technology.parent, undefined);
  assert.equal(CATEGORY_CONFIG.technology.hideFromMenu, true);

  // Species, Factions & Modular Characters consolidate ADE narrative fields
  assert.ok(CATEGORY_CONFIG.species.fields.physiologyBiology);
  assert.ok(CATEGORY_CONFIG.species.fields.cultureSociety);
  assert.ok(CATEGORY_CONFIG.species.fields.roleInSetting);
  assert.ok(CATEGORY_CONFIG.factions.fields.publicAgenda);
  assert.ok(CATEGORY_CONFIG.factions.fields.hiddenAgenda);
  assert.ok(CATEGORY_CONFIG.factions.fields.territoriesAssets);
  assert.ok(CATEGORY_CONFIG.modular_characters.fields.appearance);
  assert.ok(CATEGORY_CONFIG.modular_characters.fields.motivationsGoals);
  assert.ok(CATEGORY_CONFIG.modular_characters.fields.npcRoutine);

  // Newly hydrated Cortex worldbuilding & metaphysics categories exist and include Lorebook triggers
  for (const cat of ['planetary_design', 'universe', 'world', 'setting', 'philosophy', 'scene']) {
    assert.ok(CATEGORY_CONFIG[cat], `CATEGORY_CONFIG.${cat} must exist`);
    assert.ok(CATEGORY_CONFIG[cat].fields.primaryTriggers, `CATEGORY_CONFIG.${cat} must include primaryTriggers`);
  }

  assert.ok(ADE_CONSOLIDATED_METAPHYSICS_FIELDS.metaphysicsSubcategory);
  assert.ok(ADE_CONSOLIDATED_METAPHYSICS_FIELDS.manifestationSensory);
  for (const metaCat of ['invocations', 'disciplines', 'special_abilities']) {
    assert.ok(CATEGORY_CONFIG[metaCat], `CATEGORY_CONFIG.${metaCat} must exist`);
    assert.ok(CATEGORY_CONFIG[metaCat].fields.metaphysicsSubcategory, `CATEGORY_CONFIG.${metaCat} must consolidate metaphysicsSubcategory`);
    assert.ok(CATEGORY_CONFIG[metaCat].fields.primaryTriggers, `CATEGORY_CONFIG.${metaCat} must consolidate primaryTriggers`);
  }
  assert.equal(CATEGORY_CONFIG.synthesis.fields.metaphysicsSubcategory, undefined, 'synthesis is a visual descriptor table, not a Metaphysics subcategory');
});

test('Phase 1: omnicortexPersistence hydrates custom local entries across all newly registered Cortex categories', () => {
  // Verify filterInitialData(getFallbackSeedForCategory(cat), cat) — the exact DBMContext hydration path — returns clean arrays
  const categories = [
    'species',
    'factions',
    'weaponry',
    'armoring',
    'augmentations',
    'gear',
    'mecha',
    'architecture',
    'technology',
    'other',
    'modular_characters',
    'special_abilities',
    'planetary_design',
    'universe',
    'world',
    'setting',
    'philosophy',
    'scene'
  ];
  const hydrated = Object.fromEntries(
    categories.map((cat) => [cat, filterInitialData(getFallbackSeedForCategory(cat), cat)])
  );

  assert.ok(Array.isArray(hydrated.species) && hydrated.species.length > 0, 'Species canonical seed should hydrate');
  assert.ok(Array.isArray(hydrated.factions) && hydrated.factions.length > 0, 'Factions canonical seed should hydrate');
  assert.ok(Array.isArray(hydrated.weaponry) && hydrated.weaponry.length > 0, 'Weaponry canonical seed should hydrate');
  for (const newlyHydrated of ['modular_characters', 'special_abilities', 'planetary_design', 'universe', 'world', 'setting', 'philosophy', 'scene', 'technology']) {
    assert.ok(Array.isArray(hydrated[newlyHydrated]), `${newlyHydrated} should hydrate to an array`);
  }
});

test('Phase 2: Property consolidates Item & Technology, and Metaphysics is separated from Philosophy across 17 canonical ELEMENT_TYPES', () => {
  assert.equal(ELEMENT_TYPES.length, 17);
  assert.ok(ELEMENT_TYPES.includes('Property'));
  assert.ok(ELEMENT_TYPES.includes('Metaphysics'));
  assert.ok(ELEMENT_TYPES.includes('Philosophy'));
  assert.ok(!ELEMENT_TYPES.includes('Item'));
  assert.ok(!ELEMENT_TYPES.includes('Technology'));

  assert.equal(PROPERTY_SUBCATEGORIES.length, 8);
  assert.deepEqual(
    PROPERTY_SUBCATEGORIES.map(s => s.id),
    ['weaponry', 'armoring', 'augmentations', 'gear', 'mecha', 'architecture', 'technology', 'other']
  );
  assert.equal(PERSONA_SUBCATEGORIES.length, 3);
  assert.deepEqual(
    PERSONA_SUBCATEGORIES.map(s => s.id),
    ['folio', 'mcm', 'story']
  );
  assert.equal(METAPHYSICS_SUBCATEGORIES.length, 3);
  assert.deepEqual(
    METAPHYSICS_SUBCATEGORIES.map(s => s.id),
    ['invocations', 'disciplines', 'special_abilities']
  );

  // Backward-compatible aliases normalize cleanly
  for (const alias of ['Property', 'Item', 'Equipment', 'Weapon', 'Armor', 'Augmentation', 'Cyberware', 'Mecha', 'Architecture', 'Technology', 'Technology Forge', 'Personal Property']) {
    assert.equal(normalizeElementType(alias), 'Property', `Alias "${alias}" must normalize to Property`);
  }
  for (const metaAlias of ['Metaphysics', 'Invocation', 'Invocations', 'Discipline', 'Disciplines', 'Special Ability', 'Special Abilities', 'Psionics']) {
    assert.equal(normalizeElementType(metaAlias), 'Metaphysics', `Alias "${metaAlias}" must normalize to Metaphysics`);
  }
  assert.notEqual(normalizeElementType('Synthesis'), 'Metaphysics', 'Synthesis descriptors do not belong to Metaphysics');
  assert.equal(normalizeElementType('Philosophy'), 'Philosophy');

  // Subcategory inference handles explicit fields, legacy Technology type, and keyword hints
  assert.equal(inferPropertySubcategory({ originalType: 'Technology', title: 'Zero-Point Capacitor' }), 'technology');
  assert.equal(inferPropertySubcategory({ fields: { itemCategory: 'Weaponry' } }), 'weaponry');
  assert.equal(inferPropertySubcategory({ fields: { propertySubcategory: 'augmentations' } }), 'augmentations');
  assert.equal(inferPropertySubcategory({ title: 'Heavy Exo-Mecha Walker' }), 'mecha');
  assert.equal(inferMetaphysicsSubcategory({ dbmCategory: 'disciplines' }), 'disciplines');
  assert.equal(inferMetaphysicsSubcategory({ fields: { metaphysicsSubcategory: 'special_abilities' } }), 'special_abilities');
  assert.equal(inferMetaphysicsSubcategory({ title: 'Gravity Singularity Lance' }), 'invocations');
  assert.equal(getElementFileExtension('Property'), '.property');
  assert.equal(getElementFileExtension('Property', 'technology'), '.tech');
  assert.equal(getElementFileExtension('Metaphysics'), '.metaphysics');
  assert.equal(getElementFileExtension('Philosophy'), '.philosophy');

  // Consolidated schemas registered
  assert.ok(Array.isArray(ELEMENT_SCHEMAS.Property) && ELEMENT_SCHEMAS.Property.length >= 15);
  assert.equal(ELEMENT_SCHEMAS.Property, ELEMENT_SCHEMAS.Item);
  assert.equal(ELEMENT_SCHEMAS.Property, ELEMENT_SCHEMAS.Technology);
  assert.ok(Array.isArray(ELEMENT_SCHEMAS.Metaphysics) && ELEMENT_SCHEMAS.Metaphysics.length >= 8);
  assert.notEqual(ELEMENT_SCHEMAS.Metaphysics, ELEMENT_SCHEMAS.Philosophy);
});

test('Phase 3: cortexAdeAssetBridge projects Cortex Species, Factions, 8 Property collections, Folio Personas, and MCM units into unified ADE catalog', () => {
  const sampleDbData = {
    species: [
      { id: 'sp_aeld', name: 'Celestine Aeld', parent_species: 'Independent', cp: 20, tech_level: 4, description: 'Luminous void-born lineage.' }
    ],
    factions: [
      { id: 'fac_entari', name: 'Entari Combine', faction_type: 'Megacorporation', driving_mandate: 'Monopolize warp telemetry.', tech_level: 4 }
    ],
    weaponry: [
      { id: 'wpn_lance', name: 'Phase Lance', damage: '3d8+4 Energy', range: '80m', craft_dc: 20, tech_level: 4 }
    ],
    armoring: [
      { id: 'arm_weave', name: 'Ballistic Weave', dr: 6, sp: 20, craft_dc: 15, tech_level: 3 }
    ],
    augmentations: [
      { id: 'aug_optics', name: 'Kiroshi Tactics Optic', nodes_consumed: 2, location: 'Ocular', craft_dc: 18, tech_level: 4 }
    ],
    gear: [
      { id: 'gr_medkit', name: 'Trauma Auto-Injector', craft_dc: 12, tech_level: 3 }
    ],
    mecha: [
      { id: 'mch_strider', name: 'Valkyrie Strike Frame', sp: 120, dr: 14, craft_dc: 28, tech_level: 4 }
    ],
    architecture: [
      { id: 'arc_bastion', name: 'Orbital Listening Post', sp: 400, craft_dc: 30, tech_level: 4 }
    ],
    technology: [
      { id: 'tch_capacitor', name: 'Zero-Point Micro-Capacitor', mechanismPowerSource: 'Vacuum fluctuation tap', craft_dc: 25, tech_level: 5 }
    ],
    other: [
      { id: 'oth_relic', name: 'Precursor Resonance Shard', craft_dc: 30, meta_level: 4 }
    ],
    modular_characters: [
      { id: 'mcm_enforcer', name: 'Combine Heavy Enforcer', threatTier: 5, competencyRole: 'Tank', designation: 'Adversary', bossType: 'Elite', healthPoints: 55, vitalityPoints: 45 }
    ],
    archetypes: [
      { id: 'arch_slicer', name: 'Void Slicer', sphere: 'Tech', core_concept: 'Infiltrates orbital mainframes.' }
    ],
    planetary_design: [
      { id: 'pl_kestrel', name: 'Kestrel Prime', starClass: 'G', orbitalZone: 'BioZone', starport: 'A', highConcept: 'Storm-lashed shipyard world.' }
    ],
    philosophy: [
      { id: 'phil_void_creed', name: 'The Concordance of Stillness', coreTenet: 'Entropy is sacred.', adherents: 'Monks of Vesper' }
    ],
    invocations: [
      { id: 'inv_singularity', name: 'Astral Singularity', discipline: 'Meta-Dimensional', design_dc: 24, meta_level: 3, cast_time: '2 AP', range: '60m', effect: 'Implodes local gravity well.' }
    ],
    disciplines: [
      { id: 'disc_psionics', name: 'Meta-Psionics', attribute: 'Wisdom', description: 'Telepathic and telekinetic projection.' }
    ],
    special_abilities: [
      { id: 'sa_void_sight', name: 'Void Sight', ability_type: 'Metaphysical', cp: 10, description: 'Perceive phase-shifted entities.' }
    ],
    synthesis: [
      { id: 'syn_psiblade', name: 'Resonant Psi-Conduit', tech_level: 4, meta_level: 3, craft_dc: 22, description: 'Hybrid lattice channeling raw invocations.' }
    ]
  };

  const sampleFolioRoster = [
    {
      'character-doc-id': 'char_eva_01',
      'char-name': 'Captain Eva Rostova',
      'char-species': 'Human',
      'char-occu': 'Starship Commander',
      'char-faction': 'Independent',
      is_locked: true
    }
  ];

  // Include a Story Module pinned override for wpn_lance plus a legacy 'Item' and a standalone 'Story Arc'
  const sampleElementsCatalog = [
    {
      id: 'pin_lance_custom',
      title: 'Captain Eva\'s Custom Phase Lance',
      type: 'Item',
      dbmCategory: 'weaponry',
      dbmId: 'wpn_lance',
      fields: {
        oneLinePitch: 'Heirloom overcharged phase lance.'
      }
    },
    {
      id: 'legacy_tech_1',
      title: 'Subspace Beacon',
      type: 'Technology',
      fields: {
        functionPurpose: 'Transmits distress telemetry across sectors.'
      }
    },
    {
      id: 'arc_act_1',
      title: 'The Kestrel Blockade',
      type: 'Story Arc',
      fields: {
        summary: 'Three-act siege of Kestrel Prime.'
      }
    }
  ];

  const unified = buildUnifiedAdeCatalog({
    elementsCatalog: sampleElementsCatalog,
    dbData: sampleDbData,
    folioRoster: sampleFolioRoster,
    publicPersonas: []
  });

  // Verify Species & Factions
  const speciesEls = unified.filter(e => e.type === 'Species');
  assert.equal(speciesEls.length, 1);
  assert.equal(speciesEls[0].title, 'Celestine Aeld');
  assert.equal(speciesEls[0].codexMatrixId, 'species');

  const factionEls = unified.filter(e => e.type === 'Faction');
  assert.equal(factionEls.length, 1);
  assert.equal(factionEls[0].title, 'Entari Combine');
  assert.equal(factionEls[0].fields.oneLinePitch, 'Monopolize warp telemetry.');
  assert.ok(
    factionEls[0].content.includes('## Visual Synthesis & Aesthetic Descriptors'),
    'Faction content must embed its matching CRISP Visual Synthesis descriptors directly'
  );
  assert.ok(
    factionEls[0].content.includes('The Entari Combine Architectural Keyframe Synthesis'),
    'Faction content must include its Architectural Keyframe Synthesis description'
  );
  assert.ok(
    factionEls[0].content.includes('The Entari Combine Formal Attire & Uniforms Synthesis'),
    'Faction content must include its Formal Attire & Uniforms Synthesis description'
  );
  assert.ok(factionEls[0].fields.architecture.includes('The Entari Combine'));
  assert.ok(factionEls[0].fields.gear_aesthetic.includes('The Entari Combine'));

  // Verify all 8 Property subcategories + legacy Technology migrated cleanly without duplicating pinned wpn_lance
  const propertyEls = unified.filter(e => e.type === 'Property');
  assert.equal(propertyEls.length, 9, '8 Cortex property entries (1 deduplicated with pin) + 1 legacy module Technology entry = 9');
  for (const sub of CORTEX_PROPERTY_COLLECTIONS) {
    assert.ok(
      propertyEls.some(p => p.propertySubcategory === sub),
      `Unified Property catalog must represent subcategory "${sub}"`
    );
  }
  const pinnedLance = propertyEls.find(p => p.dbmId === 'wpn_lance');
  assert.ok(pinnedLance.isPinnedToModule, 'Pinned Cortex weapon should merge cleanly without duplicate card');
  assert.equal(pinnedLance.title, 'Captain Eva\'s Custom Phase Lance');
  assert.equal(pinnedLance.fields.damage, '3d8+4 Energy');

  const migratedBeacon = propertyEls.find(p => p.id === 'legacy_tech_1');
  assert.equal(migratedBeacon.type, 'Property');
  assert.equal(migratedBeacon.propertySubcategory, 'technology');

  // Verify Personas: Folio + MCM represented under Persona (Archetypes are a component of a Persona, not standalone Persona elements)
  const personaEls = unified.filter(e => e.type === 'Persona');
  assert.equal(personaEls.length, 2);
  const evaFolio = personaEls.find(p => p.personaSubcategory === 'folio' && p.title === 'Captain Eva Rostova');
  assert.ok(evaFolio && evaFolio.isFolioPersona);
  assert.ok(
    evaFolio.content.includes('## Visual Synthesis & Aesthetic Descriptors'),
    'Folio Persona content must embed matching occupational/character visual synthesis descriptions'
  );
  const combineEnforcer = personaEls.find(p => p.personaSubcategory === 'mcm' && p.title === 'Combine Heavy Enforcer');
  assert.ok(combineEnforcer && combineEnforcer.fields.mcmTier === '5');
  assert.ok(
    combineEnforcer.content.includes('## Visual Synthesis & Aesthetic Descriptors'),
    'MCM Persona content must embed matching occupational/character visual synthesis descriptions'
  );
  assert.ok(!personaEls.some(p => p.dbmCategory === 'archetypes' || p.personaSubcategory === 'archetypes'));

  // Verify Planetary Design projects into World and embeds matching origin scenery synthesis in content
  const worldEls = unified.filter(e => e.type === 'World');
  assert.equal(worldEls.length, 1);
  assert.equal(worldEls[0].title, 'Kestrel Prime');
  assert.ok(
    worldEls[0].content.includes('## Visual Synthesis & Aesthetic Descriptors'),
    'World content must embed matching origin scenery synthesis descriptions'
  );

  // Verify Philosophy and Metaphysics are strictly separated and synthesis is NEVER projected as Metaphysics
  const philosophyEls = unified.filter(e => e.type === 'Philosophy');
  assert.equal(philosophyEls.length, 1);
  assert.equal(philosophyEls[0].title, 'The Concordance of Stillness');
  assert.equal(philosophyEls[0].dbmCategory, 'philosophy');

  const metaphysicsEls = unified.filter(e => e.type === 'Metaphysics');
  assert.equal(metaphysicsEls.length, 3, 'Metaphysics only projects invocations, disciplines, and special_abilities (never synthesis)');
  assert.ok(!metaphysicsEls.some(m => m.dbmCategory === 'synthesis' || m.metaphysicsSubcategory === 'synthesis'));
  for (const metaSub of CORTEX_METAPHYSICS_COLLECTIONS) {
    assert.ok(
      metaphysicsEls.some(m => m.metaphysicsSubcategory === metaSub),
      `Unified Metaphysics catalog must represent subcategory "${metaSub}"`
    );
  }
  const astralInv = metaphysicsEls.find(m => m.dbmId === 'inv_singularity');
  assert.equal(astralInv.codexMatrixId, 'invocation');
  assert.equal(astralInv.fields.design_dc, '24');
});

test('Phase 3 & 4: consolidateAdeElementToCortexPayload produces valid DBM entries across Species, Factions, Property subcategories, MCM & Worlds', () => {
  // 1. Property -> Augmentations round-trip & validator pass
  const adeAugment = {
    id: 'elem_cyber_arm',
    title: 'Titan-Weave Cyberarm',
    type: 'Property',
    propertySubcategory: 'augmentations',
    guidance: { genre: 'Sci-Fi', tone: 'Cynical' },
    fields: {
      propertySubcategory: 'augmentations',
      oneLinePitch: 'Reinforced hydraulic combat prosthetic.',
      functionPurpose: 'Increases melee strike force and houses concealed micro-tools.',
      techLevel: '4',
      metaLevel: '0',
      craft_dc: '20',
      cost: '2560',
      nodes_consumed: '3',
      location: 'Right Arm',
      primaryTriggers: 'Titan-Weave, cyberarm'
    }
  };

  assert.equal(resolveTargetCortexCollection(adeAugment), 'augmentations');
  const augConsolidated = consolidateAdeElementToCortexPayload(adeAugment);
  assert.equal(augConsolidated.targetCollection, 'augmentations');
  assert.equal(augConsolidated.payload.name, 'Titan-Weave Cyberarm');
  assert.equal(augConsolidated.payload.nodes_consumed, 3);
  assert.equal(augConsolidated.payload.craft_dc, 20);
  assert.equal(augConsolidated.payload.primaryTriggers, 'Titan-Weave, cyberarm');

  const augValidation = validateDbmEntry('augmentations', augConsolidated.payload);
  assert.equal(augValidation.valid, true, `Augmentations validation errors: ${augValidation.errors.join(', ')}`);

  // Round-trip back to ADE Element preserves consolidated fields
  const reprojectedAug = projectOmnicortexRecordToAdeElement(augConsolidated.payload, 'augmentations');
  assert.equal(reprojectedAug.type, 'Property');
  assert.equal(reprojectedAug.propertySubcategory, 'augmentations');
  assert.equal(reprojectedAug.fields.oneLinePitch, 'Reinforced hydraulic combat prosthetic.');
  assert.equal(reprojectedAug.fields.nodes_consumed, '3');

  // 2. Modular Character Matrix (MCM) Persona -> modular_characters validation
  const mcmPersona = {
    id: 'elem_mcm_boss',
    title: 'Archon Vex',
    type: 'Persona',
    personaSubcategory: 'mcm',
    fields: {
      oneLinePitch: 'Psionic warlord commanding the Void Choir.',
      mcmTier: '8',
      mcmRole: 'Psion',
      mcmChassis: 'Boss',
      mcmDesignation: 'Adversary',
      health: '96',
      vitality: '58',
      physicalDescription: 'Clad in levitating obsidian shards.',
      vttScript: 'Open with Gravity Singularity, then teleport to high ground.'
    }
  };
  const mcmConsolidated = consolidateAdeElementToCortexPayload(mcmPersona);
  assert.equal(mcmConsolidated.targetCollection, 'modular_characters');
  const mcmValidation = validateDbmEntry('modular_characters', mcmConsolidated.payload);
  assert.equal(mcmValidation.valid, true, `MCM validation errors: ${mcmValidation.errors.join(', ')}`);
  assert.equal(mcmConsolidated.payload.threatTier, 8);
  assert.equal(mcmConsolidated.payload.npcRoutine, 'Open with Gravity Singularity, then teleport to high ground.');

  // 3. Folio Persona stays managed by Folio (resolveTargetCortexCollection === null)
  const folioProjected = projectFolioPersonaToAdeElement({
    'character-doc-id': 'folio_jax_99',
    'char-name': 'Jax Vance',
    'char-species': 'Human'
  });
  assert.equal(resolveTargetCortexCollection(folioProjected), null);

  // 4. Metaphysics -> invocations & Philosophy -> philosophy round-trip & validator pass
  const adeInvocation = {
    id: 'elem_inv_pulse',
    title: 'Chrono Stasis Pulse',
    type: 'Metaphysics',
    metaphysicsSubcategory: 'invocations',
    fields: {
      metaphysicsSubcategory: 'invocations',
      oneLinePitch: 'Freezes local temporal flow in a 6m sphere.',
      meta_skill: 'Meta-Temporal',
      design_dc: '22',
      meta_level: '3',
      cast_time: '2 AP • 2 Strain',
      range: '45m • 6m Sphere',
      effect: 'Targets test Endurance vs DC 22 or lose 2 AP.',
      strainBacklash: '1d6 Vitality burn on critical mishap.',
      primaryTriggers: 'Chrono Stasis, temporal pulse'
    }
  };
  assert.equal(resolveTargetCortexCollection(adeInvocation), 'invocations');
  const invConsolidated = consolidateAdeElementToCortexPayload(adeInvocation);
  assert.equal(invConsolidated.targetCollection, 'invocations');
  assert.equal(invConsolidated.payload.design_dc, '22');
  assert.equal(invConsolidated.payload.meta_level, 3);
  assert.equal(invConsolidated.payload.discipline, 'Meta-Temporal');
  const invValidation = validateDbmEntry('invocations', invConsolidated.payload);
  assert.equal(invValidation.valid, true, `Invocations validation errors: ${invValidation.errors.join(', ')}`);

  const reprojectedInv = projectOmnicortexRecordToAdeElement(invConsolidated.payload, 'invocations');
  assert.equal(reprojectedInv.type, 'Metaphysics');
  assert.equal(reprojectedInv.metaphysicsSubcategory, 'invocations');
  assert.equal(reprojectedInv.fields.strainBacklash, '1d6 Vitality burn on critical mishap.');

  const adePhilosophy = {
    id: 'elem_phil_order',
    title: 'Order of the Ashen Lens',
    type: 'Philosophy',
    fields: {
      coreTenet: 'Observation alters destiny.',
      adherents: 'Navigator Guilds'
    }
  };
  assert.equal(resolveTargetCortexCollection(adePhilosophy), 'philosophy');
  const philConsolidated = consolidateAdeElementToCortexPayload(adePhilosophy);
  assert.equal(philConsolidated.targetCollection, 'philosophy');
  const philValidation = validateDbmEntry('philosophy', philConsolidated.payload);
  assert.equal(philValidation.valid, true, `Philosophy validation errors: ${philValidation.errors.join(', ')}`);

  // 5. Verify WeakMap record projection memoization, plain-text previewText, searchHaystack, and buildUnifiedAdeCatalog reference-tuple caching
  const cachedReproject = projectOmnicortexRecordToAdeElement(invConsolidated.payload, 'invocations');
  assert.equal(cachedReproject, reprojectedInv, 'projectOmnicortexRecordToAdeElement must return memoized reference from WeakMap on repeated calls');
  assert.ok(cachedReproject.previewText.includes('Freezes local temporal flow'));
  assert.ok(cachedReproject.searchHaystack.includes('chrono stasis pulse'));

  const emptyElements = [];
  const emptyFolio = [];
  const emptyPublic = [];
  const dbRef = { invocations: [invConsolidated.payload] };
  const firstCatalog = buildUnifiedAdeCatalog({
    elementsCatalog: emptyElements,
    dbData: dbRef,
    folioRoster: emptyFolio,
    publicPersonas: emptyPublic
  });
  const secondCatalog = buildUnifiedAdeCatalog({
    elementsCatalog: emptyElements,
    dbData: dbRef,
    folioRoster: emptyFolio,
    publicPersonas: emptyPublic
  });
  assert.equal(secondCatalog, firstCatalog, 'buildUnifiedAdeCatalog must return cached array reference when input references are unchanged');
});
