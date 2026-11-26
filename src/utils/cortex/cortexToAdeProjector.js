/**
 * @file cortexToAdeProjector.js
 * @description Projects OmniCortex DBM records & Persona Folio sheets into canonical ADE elements,
 *   and builds the unified federated ADE catalog.
 */

import {
  normalizeElementType,
  inferPropertySubcategory,
  inferMetaphysicsSubcategory
} from '../../pages/Foundry/ElementForge/elementSchemas.js';
import {
  convertFolioToPersonaElement,
  convertPersonaElementToFolio,
  convertMcmToFolioPersona,
  buildVttUnitFromPersona
} from '../personaBridge.js';
import {
  CORTEX_PROPERTY_COLLECTIONS,
  CORTEX_METAPHYSICS_COLLECTIONS,
  COLLECTION_TO_ADE_TYPE,
  COLLECTION_TO_CODEX_MATRIX,
  toText,
  pickLorebookFieldsFromRecord,
  buildPlainTextPreview,
  escapeHtml,
  buildSearchHaystack,
  mergePreferNonEmptyFields
} from './cortexCollectionMaps.js';
import {
  resolveSynthesisDescriptorsForAsset,
  appendSynthesisToContent
} from './cortexSynthesisDescriptors.js';

const projectedCortexWeakCache = new WeakMap();
const projectedFolioWeakCache = new WeakMap();

/**
 * Projects a single OmniCortex / Codex record into a canonical ADE ElementRecord,
 * embedding any matching CRISP Visual Synthesis descriptors directly into the asset's content and fields.
 */
export function projectOmnicortexRecordToAdeElement(record, collectionKey, options = {}) {
  if (!record || typeof record !== 'object' || !collectionKey) return null;

  const hasCustomSynth = Array.isArray(options.synthesisCatalog) && options.synthesisCatalog.length > 0;
  if (!hasCustomSynth) {
    const byCol = projectedCortexWeakCache.get(record);
    if (byCol && byCol.has(collectionKey)) {
      return byCol.get(collectionKey);
    }
  }

  const rawId = String(record.id || record.name || '').trim();
  if (!rawId) return null;

  const adeType = COLLECTION_TO_ADE_TYPE[collectionKey] || 'Custom';
  const title = String(record.name || record.title || 'Untitled Cortex Asset').trim();
  const codexMatrixId = COLLECTION_TO_CODEX_MATRIX[collectionKey] || null;
  const baseLorebook = pickLorebookFieldsFromRecord(record);
  const synthesis = resolveSynthesisDescriptorsForAsset(record, collectionKey, options.synthesisCatalog);

  let fields = {
    ...baseLorebook,
    dbmCategory: collectionKey,
    dbmId: rawId,
    ...(synthesis.summaryText ? { visualSynthesis: synthesis.summaryText } : {})
  };

  let sourceOrigin = 'omnicortex';
  let propertySubcategory = undefined;
  let personaSubcategory = undefined;
  let metaphysicsSubcategory = undefined;
  let mcmPersonaData = null;

  if (collectionKey === 'species') {
    fields = {
      ...fields,
      speciesName: title,
      parent_species: toText(record.parent_species),
      classification: toText(record.type || record.species_type || 'Humanoid'),
      size: toText(record.size || 'Medium'),
      oneLinePitch: record.oneLinePitch || toText(record.stigma) || '',
      physicalDescription: record.physiologyBiology || record.description || record.body || synthesis.summaryText || '',
      abilitiesPowers: record.mechanic || toText(record.trait) || toText(record.inherent_features) || '',
      behaviorDiet: record.cultureSociety || record.dietaryLifecycle || '',
      habitatOrigin: record.homeworld || synthesis.sceneryText || '',
      roleInWorld: record.roleInSetting || '',
      cp: String(record.cp ?? 0),
      tech_level: String(record.tech_level ?? 3),
      meta_level: String(record.meta_level ?? 0),
      movement: toText(record.movement),
      dbmSpeciesRef: rawId
    };
  } else if (collectionKey === 'factions') {
    fields = {
      ...fields,
      name: title,
      faction_type: toText(record.faction_type),
      archetype: toText(record.archetype),
      oneLinePitch: record.oneLinePitch || record.driving_mandate || '',
      motto: record.motto || record.symbol_sigil || '',
      description: record.description || synthesis.summaryText || '',
      ideology: record.core_beliefs || record.attitude || '',
      goals: record.publicAgenda || record.goals || record.driving_mandate || '',
      government: (record.government_type && record.leadership && String(record.government_type).includes(String(record.leadership)))
        ? String(record.government_type)
        : [record.government_type, record.leadership].filter(Boolean).join(' — '),
      alliesEnemies: record.alliesEnemies || record.relationship_to_others || record.outsider_view || '',
      territory: record.territoriesAssets || record.capital_world || '',
      resources: (record.primary_exports && record.economic_model && String(record.primary_exports).includes(String(record.economic_model)))
        ? String(record.primary_exports)
        : [record.primary_exports, record.economic_model].filter(Boolean).join(' | '),
      military_doctrine: record.military_doctrine || record.key_units || '',
      architecture: record.architecture || synthesis.architectureText || '',
      gear_aesthetic: record.gear_aesthetic || synthesis.attireText || '',
      design_language: record.design_language || [synthesis.architectureText, synthesis.attireText].filter(Boolean).join(' | ') || '',
      tech_level: String(record.tech_level ?? record.tl ?? 3),
      meta_level: String(record.meta_level ?? record.ml ?? 0),
      prominent_species: toText(record.prominent_species),
      mechanic: record.mechanic || '',
      dbmFactionRef: rawId
    };
  } else if (CORTEX_PROPERTY_COLLECTIONS.includes(collectionKey)) {
    propertySubcategory = collectionKey;
    const resolvedDc = record.craft_dc ?? record.design_dc ?? record.base_dc ?? '';
    const resolvedCost = record.costs?.credits ?? record.cost ?? '';
    const synthAesthetic = collectionKey === 'architecture'
      ? (synthesis.architectureText || synthesis.sceneryText || synthesis.summaryText)
      : (synthesis.attireText || synthesis.architectureText || synthesis.summaryText);
    fields = {
      ...fields,
      name: title,
      propertySubcategory: collectionKey,
      itemCategory: collectionKey,
      oneLinePitch: record.oneLinePitch || '',
      techLevel: String(record.techLevel ?? record.tech_level ?? record.tl ?? 3),
      metaLevel: String(record.metaLevel ?? record.meta_level ?? record.ml ?? 0),
      rarity: toText(record.availability || record.quality || 'Standard'),
      functionPurpose: record.description || record.primary_purpose || '',
      aestheticForm: record.aestheticForm || toText(record.faction_skin || record.style || '') || synthAesthetic || '',
      craft_dc: resolvedDc !== '' ? String(resolvedDc) : '',
      cost: resolvedCost !== '' ? String(resolvedCost) : '',
      weight: record.weight !== undefined ? String(record.weight) : '',
      mechanic: record.mechanic || '',
      damage: toText(record.damage),
      range: toText(record.range),
      ap: record.ap !== undefined ? String(record.ap) : '',
      dr: (record.dr ?? record.dr_rating) !== undefined ? String(record.dr ?? record.dr_rating) : '',
      sp: (record.sp ?? record.durability) !== undefined ? String(record.sp ?? record.durability) : '',
      nodes_consumed: (record.nodes_consumed ?? record.nodes) !== undefined ? String(record.nodes_consumed ?? record.nodes) : '',
      location: toText(record.location || record.body_locations || record.coverage || record.footprint || record.frame),
      mechanismPowerSource: record.mechanismPowerSource || toText(record.power_source || record.propulsion),
      socialEconomicImpact: record.societalImpact || record.socialEconomicImpact || '',
      weaknesses: record.limitationsCosts || record.weaknesses || '',
      originContext: record.originHistory || toText(record.creator || record.origin),
      interactiveType: record.interactiveType || 'none',
      vttInteractionDC: record.vttInteractionDC !== undefined ? String(record.vttInteractionDC) : '',
      lootTable: record.lootTable || ''
    };
  } else if (collectionKey === 'modular_characters') {
    sourceOrigin = 'mcm';
    personaSubcategory = 'mcm';
    mcmPersonaData = convertMcmToFolioPersona(record, { targetFolio: false });
    const convertedEl = convertFolioToPersonaElement(mcmPersonaData, { id: `cortex_${collectionKey}_${rawId}` });
    const tier = mcmPersonaData?.mcmTier ?? record.threatTier ?? record.threat_tier ?? 3;
    const role = mcmPersonaData?.mcmRole || record.competencyRole || record.role || 'Tank';
    const bossType = mcmPersonaData?.mcmBossType || record.bossType || record.boss_type || 'Standard';
    const designation = mcmPersonaData?.mcmDesignation || record.designation || 'Adversary';
    fields = {
      ...(convertedEl?.fields || {}),
      ...fields,
      name: title,
      'char-name': title,
      'char-species': mcmPersonaData?.['char-species'] || record.species || 'Human',
      'char-archetype': mcmPersonaData?.['char-archetype'] || record.archetype || 'Everyman',
      'char-origin': mcmPersonaData?.['char-origin'] || record.origin || '',
      'char-occu': mcmPersonaData?.['char-occu'] || record.occupation || role,
      'char-faction': mcmPersonaData?.['char-faction'] || record.faction || '',
      'char-size': mcmPersonaData?.['char-size'] || record.size_category || record.size || 'Medium',
      archetype: `${bossType} ${role}`.trim(),
      oneLinePitch: record.oneLinePitch || `${designation} • Tier ${tier} ${role}`,
      physicalDescription: record.appearance || record.description || synthesis.characterText || synthesis.attireText || synthesis.summaryText || '',
      personalityMannerisms: record.voiceMannerisms || record.mannerisms || '',
      goalsMotivations: record.motivationsGoals || record['char-motive'] || '',
      roleInStory: designation,
      relationships: record.relationships || record.keyRelationships || '',
      mcmTier: String(tier),
      mcmDesignation: designation,
      mcmChassis: bossType,
      mcmBossType: bossType,
      mcmRole: role,
      isSynthetic: Boolean(mcmPersonaData?.isSynthetic ?? record.isSynthetic),
      health: String(mcmPersonaData?.health ?? record.healthPoints ?? record.health ?? 30),
      vitality: String(mcmPersonaData?.vitality ?? record.vitalityPoints ?? record.vitality ?? 30),
      structure: String(mcmPersonaData?.structure ?? record.structurePoints ?? record.structure_points ?? 60),
      armorDR: String(mcmPersonaData?.armor_dr ?? record.armorDR ?? record.expected_dr ?? 0),
      defense_dc: String(mcmPersonaData?.defense_dc ?? record.defense_dc ?? 12),
      attack_bonus: String(mcmPersonaData?.attack_bonus ?? record.attack_bonus ?? 4),
      actions: String(mcmPersonaData?.actions_per_round ?? record.actions_per_round ?? 2),
      speed: String(mcmPersonaData?.speed_ft ?? 30),
      'tech-level': String(mcmPersonaData?.['tech-level'] ?? record.tech_level ?? 3),
      'magic-level': String(mcmPersonaData?.['magic-level'] ?? record.meta_level ?? 1),
      vttScript: record.npcRoutine || record.vttScript || '',
      mechanic: record.mechanic || ''
    };
  } else if (collectionKey === 'planetary_design' || collectionKey === 'world') {
    fields = {
      ...fields,
      worldName: title,
      corePremise: record.highConcept || record.oneLinePitch || record.description || '',
      majorFactions: record.societiesGovernance || record.dominant_faction || record.factionArchetype || record.culture || '',
      historyTimeline: record.historicalTimeline || '',
      cosmologyPhysics: record.physicsMetaphysics || record.quirks || record.hazards || '',
      starSystem: record.starSystem || (record.starClass ? `Star Class ${record.starClass} • ${record.orbitalZone || 'BioZone'} • Starport ${record.starport || 'C'}` : ''),
      continents: record.planetaryGeography || record.geography || record.settlements || synthesis.sceneryText || '',
      cataclysms: record.cataclysms || '',
      demographics: record.demographics || '',
      techLevel: record.techLevel ?? record.tech_level ?? '',
      magic: record.magic || '',
      pantheons: record.pantheons || '',
      themes: record.adventureHooks || '',
      inspirations: record.inspirations || '',
      gmNotes: record.gmNotes || ''
    };
  } else if (collectionKey === 'universe') {
    fields = {
      ...fields,
      designation: record.oneLinePitch || `${title}${record.scale ? ` (${record.scale})` : ''}`,
      ontological: record.cosmologyDimensions || record.description || '',
      lawsPhysics: record.fundamentalLaws || record.laws_of_physics || '',
      natureMagic: record.natureMagic || '',
      cosmological: record.cosmological || '',
      creation: record.creation || '',
      entities: record.entities || '',
      interplanar: record.interplanar || '',
      centralQuestion: record.centralQuestion || '',
      ...(record['tech-level'] !== undefined || record.tech_level !== undefined ? { 'tech-level': String(record['tech-level'] ?? record.tech_level) } : {}),
      ...(record['meta-level'] !== undefined || record.meta_level !== undefined ? { 'meta-level': String(record['meta-level'] ?? record.meta_level) } : {}),
      ...(record.storyFlagKey !== undefined ? { storyFlagKey: record.storyFlagKey } : {})
    };
  } else if (collectionKey === 'setting') {
    fields = {
      ...fields,
      settingName: title,
      parentWorld: toText(record.world),
      scale: record.scale || '',
      genreTech: record.genreTech || '',
      geographyArchitecture: record.architecturalLayout || record.description || synthesis.architectureText || synthesis.sceneryText || '',
      populationDemographics: record.inhabitantsDenizens || record.inhabitants || '',
      functionPurpose: record.functionPurpose || record.oneLinePitch || '',
      primaryConflict: record.primaryConflict || '',
      climateWeather: record.climateWeather || '',
      sensoryDetails: record.sensoryAtmosphere || synthesis.sceneryText || synthesis.summaryText || '',
      landmarksSecrets: (record.pointsOfInterest || record.points_of_interest) && record.secretsPlotHooks && String(record.pointsOfInterest || record.points_of_interest).includes(String(record.secretsPlotHooks))
        ? String(record.pointsOfInterest || record.points_of_interest)
        : [record.pointsOfInterest || record.points_of_interest, record.secretsPlotHooks].filter(Boolean).join('\n'),
      gmNotes: record.gmNotes || ''
    };
  } else if (collectionKey === 'scene') {
    fields = {
      ...fields,
      sceneName: title,
      scenePurpose: record.scenePurpose || '',
      stateChange: record.stateChange || '',
      location: record.setting_location || '',
      sensoryDetails: record.sensoryDetails || synthesis.sceneryText || '',
      moodAtmosphere: record.lightingAtmosphere || record.dramatic_hook || '',
      keyObjects: record.rewards_loot || record.participants || '',
      sceneBeats: record.sceneBeats || record.description || '',
      readAloud: record.readAloud || '',
      gmNotes: record.gmNotes || ''
    };
  } else if (collectionKey === 'philosophy') {
    fields = {
      ...fields,
      philosophyName: title,
      coreQuestion: record.coreQuestion || '',
      coreTenets: record.coreDogmaTenets || record.coreTenet || record.description || '',
      ritualsPractices: record.ritualsPractices || record.practices || '',
      symbolsIconography: record.symbolsIconography || '',
      influenceSociety: record.institutionalStructure || '',
      freeWill: record.freeWill || '',
      truthEpistemology: record.truthEpistemology || '',
      ethics: record.moralCodeTaboos || '',
      cosmology: record.cosmologyWorldview || record.origin || '',
      ...(record.disposition !== undefined ? { disposition: record.disposition } : {}),
      gmNotes: record.gmNotes || ''
    };
  } else if (CORTEX_METAPHYSICS_COLLECTIONS.includes(collectionKey)) {
    metaphysicsSubcategory = collectionKey;
    const costParts = [];
    if (record.costs && typeof record.costs === 'object') {
      if (record.costs.ap) costParts.push(`${record.costs.ap} AP`);
      if (record.costs.strain) costParts.push(`${record.costs.strain} Strain`);
      if (record.costs.focus) costParts.push(`${record.costs.focus} Focus`);
      if (record.costs.bp) costParts.push(`${record.costs.bp} BP`);
    }
    fields = {
      ...fields,
      name: title,
      metaphysicsSubcategory: collectionKey,
      discipline: toText(record.discipline || ''),
      oneLinePitch: record.oneLinePitch || record.description || record.mechanic || '',
      description: record.description || '',
      meta_skill: toText(record.meta_skill || record.discipline_skills || ''),
      meta_level: String(record.meta_level ?? record.ml ?? 1),
      design_dc: record.design_dc !== undefined && record.design_dc !== null ? String(record.design_dc) : '',
      cast_time: record.cast_time || '',
      duration: record.duration || '',
      range: toText(record.range),
      area: toText(record.area),
      target: toText(record.target),
      effect: toText(record.effect),
      mechanic: record.mechanic || '',
      strainBacklash: record.strainBacklash || costParts.join(', ') || '',
      manifestationSensory: record.manifestationSensory || '',
      originLore: record.originLore || record.note || ''
    };
  }

  const summaryText =
    record.oneLinePitch ||
    record.description ||
    record.driving_mandate ||
    record.core_concept ||
    record.mechanic ||
    '';

  const baseContent = record.body || record.full_text || (summaryText ? `<p>${escapeHtml(summaryText)}</p>` : '');
  const enrichedContent = appendSynthesisToContent(baseContent, synthesis.markdownSection);
  const previewText = fields.oneLinePitch || fields.summary || buildPlainTextPreview(summaryText || baseContent);

  const isMcmCollection = collectionKey === 'modular_characters';

  const projected = {
    id: `cortex_${collectionKey}_${rawId}`,
    title,
    name: title,
    type: adeType,
    ...(propertySubcategory ? { propertySubcategory } : {}),
    ...(personaSubcategory ? { personaSubcategory } : {}),
    ...(metaphysicsSubcategory ? { metaphysicsSubcategory } : {}),
    sourceOrigin,
    isCortexAsset: true,
    isMcmPersona: isMcmCollection,
    isLockedForVtt: isMcmCollection ? true : false,
    isReadyForVtt: isMcmCollection ? true : false,
    isPinnedToModule: false,
    dbmCategory: collectionKey,
    dbmId: rawId,
    codexMatrixId,
    imageUrl: record.imageUrl || record.avatarUrl || mcmPersonaData?.imageUrl || '',
    content: record.content || record.narrativeProse || mcmPersonaData?.content || enrichedContent,
    previewText,
    customFields: Array.isArray(record.customFields)
      ? record.customFields
      : (Array.isArray(mcmPersonaData?.customFields) ? mcmPersonaData.customFields : []),
    guidance: record.guidance || mcmPersonaData?.guidance || {
      genre: '',
      tone: '',
      pacing: '',
      pov: '',
      literaryDevices: [],
      structure: ''
    },
    fields,
    ...(mcmPersonaData ? {
      personaData: mcmPersonaData,
      vttUnitData: mcmPersonaData.vttUnitData
    } : {}),
    assetHub: Array.isArray(record.assetHub)
      ? record.assetHub
      : (Array.isArray(mcmPersonaData?.assetHub) ? mcmPersonaData.assetHub : []),
    tags: Array.isArray(record.tags)
      ? record.tags
      : (record.keywords ? String(record.keywords).split(',').map(s => s.trim()).filter(Boolean) : []),
    cortexRaw: record,
    updatedAt: record.updatedAt || null
  };
  projected.searchHaystack = buildSearchHaystack(projected);

  if (!hasCustomSynth) {
    let byCol = projectedCortexWeakCache.get(record);
    if (!byCol) {
      byCol = new Map();
      projectedCortexWeakCache.set(record, byCol);
    }
    byCol.set(collectionKey, projected);
  }

  return projected;
}

/**
 * Projects a Persona Folio character record into a live ADE Persona element,
 * embedding matching CRISP Visual Synthesis descriptors (occupation, faction attire, origin scenery) into its content and fields.
 */
export function projectFolioPersonaToAdeElement(folioChar, options = {}) {
  if (!folioChar || typeof folioChar !== 'object') return null;
  const hasCustomSynth = Array.isArray(options.synthesisCatalog) && options.synthesisCatalog.length > 0;
  if (!hasCustomSynth && projectedFolioWeakCache.has(folioChar)) {
    return projectedFolioWeakCache.get(folioChar);
  }

  const docId = String(folioChar['character-doc-id'] || folioChar.id || '').trim();
  const charName = String(folioChar['char-name'] || folioChar.name || folioChar.title || '').trim();
  if (!docId && !charName) return null;

  const stableId = `folio_persona_${docId || charName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  const converted = convertFolioToPersonaElement(folioChar, { id: stableId });
  if (!converted) return null;

  const species = folioChar['char-species'] || '';
  const occu = folioChar['char-occu'] || '';
  const faction = folioChar['char-faction'] || '';
  const archetype = folioChar['char-archetype'] || folioChar['char-concept'] || '';
  const autoPitch = [species, occu, faction ? `(${faction})` : ''].filter(Boolean).join(' • ');
  const synthesis = resolveSynthesisDescriptorsForAsset(folioChar, 'folio', options.synthesisCatalog);
  const enrichedContent = appendSynthesisToContent(converted.content || '', synthesis.markdownSection);
  const resolvedPitch = folioChar.summary || folioChar['char-concept'] || autoPitch || 'Persona Folio Character Sheet';
  const vttUnitData = converted.vttUnitData || buildVttUnitFromPersona(folioChar, { uniqueInstance: false });

  const projected = {
    ...converted,
    id: stableId,
    title: charName || converted.title,
    name: charName || converted.title,
    type: 'Persona',
    personaSubcategory: 'folio',
    sourceOrigin: 'folio',
    isFolioPersona: true,
    isCortexAsset: false,
    isPinnedToModule: false,
    folioDocId: docId || stableId,
    isLockedForVtt: Boolean(folioChar.is_locked || folioChar.is_ready_for_vtt || folioChar.folio_phase === 'locked'),
    isReadyForVtt: true,
    vttUnitData,
    content: enrichedContent,
    previewText: resolvedPitch,
    fields: {
      ...(converted.fields || {}),
      name: charName || converted.title,
      archetype: archetype || converted.fields?.archetype || 'Folio Operator',
      oneLinePitch: resolvedPitch,
      physicalDescription: folioChar.appearance || folioChar['char-style'] || synthesis.characterText || synthesis.attireText || synthesis.summaryText || '',
      personalityMannerisms: folioChar.mannerisms || folioChar.personalityType || '',
      backgroundHistory: folioChar.backstory || '',
      goalsMotivations: folioChar['char-motive'] || folioChar.goals || '',
      roleInStory: folioChar.role || 'Operative / Protagonist',
      relationships: folioChar.keyRelationships || '',
      ...(synthesis.summaryText ? { visualSynthesis: synthesis.summaryText } : {})
    }
  };
  projected.searchHaystack = buildSearchHaystack(projected);

  if (!hasCustomSynth) {
    projectedFolioWeakCache.set(folioChar, projected);
  }

  return projected;
}

/**
 * Normalizes a campaign-local ADE element (e.g. migrating legacy 'Item' or 'Technology' to 'Property'),
 * and embeds any matching CRISP Visual Synthesis descriptors into its content and fields.
 */
export function normalizeStoryModuleElement(el, options = {}) {
  if (!el || typeof el !== 'object') return null;
  const rawType = el.type || 'Custom';
  const canonicalType = normalizeElementType(rawType);
  const next = {
    ...el,
    originalType: el.originalType || rawType,
    type: canonicalType,
    sourceOrigin: el.sourceOrigin || 'module',
    isPinnedToModule: true
  };

  if (canonicalType === 'Property') {
    const subcat = inferPropertySubcategory({ ...el, originalType: rawType });
    next.propertySubcategory = subcat;
    next.fields = {
      ...(el.fields || {}),
      propertySubcategory: el.fields?.propertySubcategory || subcat
    };
  } else if (canonicalType === 'Persona') {
    const inferredPersonaSub =
      el.personaSubcategory && el.personaSubcategory !== 'archetypes'
        ? el.personaSubcategory
        : (el.folioDocId || el.personaData ? 'folio' : (el.dbmCategory === 'modular_characters' ? 'mcm' : 'story'));
    next.personaSubcategory = inferredPersonaSub;
    if (!next.personaData || typeof next.personaData !== 'object') {
      next.personaData = inferredPersonaSub === 'mcm'
        ? convertMcmToFolioPersona(next, { targetFolio: false })
        : convertPersonaElementToFolio(next);
    }
    next.vttUnitData = next.vttUnitData || buildVttUnitFromPersona(next.personaData || next, { uniqueInstance: false });
    next.isReadyForVtt = true;
  } else if (canonicalType === 'Metaphysics') {
    const metaSub = inferMetaphysicsSubcategory({ ...el, originalType: rawType });
    next.metaphysicsSubcategory = metaSub;
    next.fields = {
      ...(el.fields || {}),
      metaphysicsSubcategory: el.fields?.metaphysicsSubcategory || metaSub
    };
  } else if (canonicalType === 'Philosophy' && CORTEX_METAPHYSICS_COLLECTIONS.includes(el.dbmCategory || el.fields?.dbmCategory)) {
    const metaSub = el.dbmCategory || el.fields?.dbmCategory;
    next.type = 'Metaphysics';
    next.metaphysicsSubcategory = metaSub;
    next.fields = {
      ...(el.fields || {}),
      metaphysicsSubcategory: metaSub
    };
  }

  const synthType = next.type || canonicalType;
  const synthContextKey =
    synthType === 'Faction'
      ? 'factions'
      : synthType === 'Property'
      ? (next.propertySubcategory || 'gear')
      : synthType.toLowerCase();
  const synthesis = resolveSynthesisDescriptorsForAsset(
    { ...next, ...(next.fields || {}) },
    synthContextKey,
    options.synthesisCatalog
  );
  if (synthesis.markdownSection) {
    next.content = appendSynthesisToContent(next.content || '', synthesis.markdownSection);
    next.fields = {
      ...(next.fields || {}),
      visualSynthesis: next.fields?.visualSynthesis || synthesis.summaryText
    };
  }

  next.previewText = next.fields?.oneLinePitch || next.fields?.summary || buildPlainTextPreview(next.content);
  next.searchHaystack = buildSearchHaystack(next);

  return next;
}

let lastUnifiedCache = {
  elementsCatalog: null,
  dbData: null,
  folioRoster: null,
  publicPersonas: null,
  result: null
};

/**
 * Builds the deduplicated, unified ADE asset catalog combining:
 *   1. Story Module (`elementsCatalog`)
 *   2. OmniCortex / Codex (`dbData`)
 *   3. Persona Folio (`folioRoster` + `publicPersonas`)
 */
export function buildUnifiedAdeCatalog({
  elementsCatalog = [],
  dbData = {},
  folioRoster = [],
  publicPersonas = []
} = {}) {
  if (
    lastUnifiedCache.result &&
    lastUnifiedCache.elementsCatalog === elementsCatalog &&
    lastUnifiedCache.dbData === dbData &&
    lastUnifiedCache.folioRoster === folioRoster &&
    lastUnifiedCache.publicPersonas === publicPersonas
  ) {
    return lastUnifiedCache.result;
  }

  const synthesisCatalog = Array.isArray(dbData?.synthesis) ? dbData.synthesis : [];
  const normalizedModuleElements = (Array.isArray(elementsCatalog) ? elementsCatalog : [])
    .map(el => normalizeStoryModuleElement(el, { synthesisCatalog }))
    .filter(Boolean);

  const pinnedByCortexKey = new Map();
  const pinnedByFolioId = new Map();
  const pinnedById = new Map();
  const consumedModuleIds = new Set();

  for (const modEl of normalizedModuleElements) {
    if (modEl.id) {
      pinnedById.set(modEl.id, modEl);
    }
    const dbmCat = modEl.dbmCategory || modEl.fields?.dbmCategory;
    const dbmId = modEl.dbmId || modEl.fields?.dbmId || modEl.fields?.dbmRef || modEl.dbmRef || modEl.fields?.dbmSpeciesRef || modEl.fields?.dbmFactionRef;
    if (dbmCat && dbmId) {
      pinnedByCortexKey.set(`${String(dbmCat).toLowerCase()}:${String(dbmId).toLowerCase()}`, modEl);
    }
    const fId = modEl.folioDocId || modEl.personaData?.['character-doc-id'];
    if (fId) {
      pinnedByFolioId.set(String(fId).toLowerCase(), modEl);
    }
  }

  const unified = [];

  // 1. Project Persona Folio characters (deduplicated across roster + publicPersonas)
  const seenFolioIds = new Set();
  const combinedFolio = [
    ...(Array.isArray(folioRoster) ? folioRoster : []),
    ...(Array.isArray(publicPersonas) ? publicPersonas : [])
  ];

  for (const folioChar of combinedFolio) {
    if (!folioChar || typeof folioChar !== 'object') continue;
    const fKey = String(folioChar['character-doc-id'] || folioChar.id || folioChar['char-name'] || '').trim().toLowerCase();
    if (!fKey || seenFolioIds.has(fKey)) continue;
    seenFolioIds.add(fKey);

    const projected = projectFolioPersonaToAdeElement(folioChar, { synthesisCatalog });
    if (!projected) continue;

    const pinned = pinnedByFolioId.get(String(projected.folioDocId).toLowerCase()) ||
      pinnedById.get(projected.id);

    if (pinned) {
      consumedModuleIds.add(pinned.id);
      const mergedFolio = {
        ...projected,
        ...pinned,
        id: pinned.id,
        moduleElementId: pinned.id,
        type: 'Persona',
        personaSubcategory: 'folio',
        sourceOrigin: 'folio',
        isFolioPersona: true,
        isPinnedToModule: true,
        folioDocId: projected.folioDocId,
        personaData: folioChar,
        content: pinned.content || projected.content,
        previewText: pinned.previewText || projected.previewText,
        fields: mergePreferNonEmptyFields(projected.fields, pinned.fields)
      };
      mergedFolio.searchHaystack = buildSearchHaystack(mergedFolio);
      unified.push(mergedFolio);
    } else {
      unified.push(projected);
    }
  }

  // 2. Project all OmniCortex / Codex collections mapped to ADE categories (deduplicating Faction/Setting)
  const seenSingletonKeys = new Set();
  const normalizeSingletonKey = (typeName, item) => {
    if (typeName !== 'Faction' && typeName !== 'Setting') return '';
    const titleKey = String(item?.title || item?.name || '').trim().toLowerCase();
    return titleKey ? `${typeName}:${titleKey}` : '';
  };

  const cortexCollections = Object.keys(COLLECTION_TO_ADE_TYPE);
  for (const colKey of cortexCollections) {
    const records = Array.isArray(dbData?.[colKey]) ? dbData[colKey] : [];
    for (const rec of records) {
      const projected = projectOmnicortexRecordToAdeElement(rec, colKey, { synthesisCatalog });
      if (!projected) continue;

      const lookupKey = `${colKey.toLowerCase()}:${String(projected.dbmId).toLowerCase()}`;
      const pinned = pinnedByCortexKey.get(lookupKey) ||
        pinnedById.get(projected.id);

      const singletonKey = normalizeSingletonKey(projected.type, pinned || projected);
      if (singletonKey) {
        if (seenSingletonKeys.has(singletonKey)) {
          if (pinned) consumedModuleIds.add(pinned.id);
          continue;
        }
        seenSingletonKeys.add(singletonKey);
      }

      if (pinned) {
        consumedModuleIds.add(pinned.id);
        const mergedCortex = {
          ...projected,
          ...pinned,
          id: pinned.id,
          moduleElementId: pinned.id,
          type: projected.type,
          ...(projected.propertySubcategory ? { propertySubcategory: projected.propertySubcategory } : {}),
          ...(projected.personaSubcategory ? { personaSubcategory: projected.personaSubcategory } : {}),
          ...(projected.metaphysicsSubcategory ? { metaphysicsSubcategory: projected.metaphysicsSubcategory } : {}),
          sourceOrigin: projected.sourceOrigin,
          isCortexAsset: true,
          isPinnedToModule: true,
          dbmCategory: colKey,
          dbmId: projected.dbmId,
          codexMatrixId: projected.codexMatrixId,
          cortexRaw: rec,
          content: pinned.content || projected.content,
          previewText: pinned.previewText || projected.previewText,
          fields: mergePreferNonEmptyFields(projected.fields, pinned.fields)
        };
        mergedCortex.searchHaystack = buildSearchHaystack(mergedCortex);
        unified.push(mergedCortex);
      } else {
        unified.push(projected);
      }
    }
  }

  // 3. Append remaining Story Module elements
  for (const modEl of normalizedModuleElements) {
    if (!consumedModuleIds.has(modEl.id)) {
      const singletonKey = normalizeSingletonKey(modEl.type, modEl);
      if (singletonKey) {
        if (seenSingletonKeys.has(singletonKey)) continue;
        seenSingletonKeys.add(singletonKey);
      }
      unified.push(modEl);
    }
  }

  lastUnifiedCache = {
    elementsCatalog,
    dbData,
    folioRoster,
    publicPersonas,
    result: unified
  };

  return unified;
}

/**
 * Returns the unified Persona listing composed from Folio Roster, MCM, and Story Module Personas.
 */
export function buildUnifiedPersonaList({
  elementsCatalog = [],
  dbData = {},
  folioRoster = [],
  publicPersonas = []
} = {}) {
  const catalog = buildUnifiedAdeCatalog({
    elementsCatalog,
    dbData,
    folioRoster,
    publicPersonas
  });
  return catalog.filter((el) => el && el.type === 'Persona');
}
