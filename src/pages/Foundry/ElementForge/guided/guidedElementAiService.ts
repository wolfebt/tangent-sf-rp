/**
 * @file guidedElementAiService.ts
 * @description Hybrid Step-Assist Service for ADE Element Forge Guided Studio.
 * Respects Bicameral AI Separation & Full Architect Authority:
 *   - AIME: Drafts structured Layer 2 traits, sensory prose, and Quick Blueprint Markdown.
 *   - BASTION: Deterministically calibrates Canonical v6 MCM vitals (30/30 or 60 SP),
 *     Economatrix EUFT CR ↔ Credits, and 2d10 Challenge Ratings (CR 15 baseline).
 *   - Omnicortex / Lorebook: Auto-derives trigger keys and recommends resonant Asset Hub links.
 */

import { generateContent } from '../../../../services/aimeService.js';
import { calculateCreditValue, calculateCRFromCredits } from '../../../../engines/tangentEconEngine.js';

const callAimeGenerate = generateContent as unknown as (params: {
  prompt: string;
  context?: Record<string, any> | string;
  enforceJson?: boolean;
  responseSchema?: Record<string, any> | null;
}) => Promise<string>;
import { extractAndResolveBracketContext } from '../../../../services/hyperlinkResolver.js';
import { ATMOSPHERIC_PRESETS } from '../../PresetsAndScripts/constants/atmosphericPresets.js';
import {
  getPlaybookForType,
  getCoreSchemaFieldsForStage3,
  mergeNonDestructiveTraits,
  parseChipKeywords
} from './elementPlaybooks.js';
import type {
  GuidedElementDraft,
  GuidedFieldDiff,
  BlueprintTemplateConfig,
  ResonantAssetSuggestion
} from '../../../../types/guidedForge';

/**
 * Builds an offline/local deterministic draft of Stage 3 fields when no live LLM key is active
 * or if network synthesis fails, ensuring 100% functional reliability in every environment.
 */
export function buildDeterministicTraitFallback(draft: GuidedElementDraft): {
  proposedFields: Record<string, string>;
  proposedProse: string;
} {
  const playbook = getPlaybookForType(draft.type);
  const stage3Fields = getCoreSchemaFieldsForStage3(draft.type);
  const title = draft.title?.trim() || `Untitled ${draft.type}`;
  const pitch = String(
    draft.fields?.[playbook.pitchKey] ||
      draft.fields?.summary ||
      draft.fields?.oneLinePitch ||
      `${playbook.familyLabel} grounded in the Tangent SFF universe.`
  ).trim();
  const genre = draft.guidance?.genre || draft.guidance?.Genre || 'Science Fantasy';
  const tone = draft.guidance?.tone || draft.guidance?.Tone || 'Gritty & Immersive';
  const tl = draft.fields?.['tech-level'] || draft.fields?.techLevel || '3';

  const proposedFields: Record<string, string> = {};

  for (const field of stage3Fields) {
    if (field.type === 'relational') continue;
    const k = field.key;
    if (k === 'name' || k === 'worldName' || k === 'settingName' || k === 'speciesName' || k === 'technologyName' || k === 'philosophyName' || k === 'sceneName') {
      proposedFields[k] = title;
    } else if (k === playbook.pitchKey) {
      proposedFields[k] = pitch;
    } else if (k.toLowerCase().includes('archetype') || k.toLowerCase().includes('classification') || k.toLowerCase().includes('category')) {
      proposedFields[k] = `${genre} ${playbook.familyLabel}`;
    } else if (k.toLowerCase().includes('physical') || k.toLowerCase().includes('sensory') || k.toLowerCase().includes('geography')) {
      proposedFields[k] = `TL-${tl} aesthetic profile for ${title}: worn composite surfaces, ambient holo-telemetry, and ${tone.toLowerCase()} atmospheric presence.`;
    } else if (k.toLowerCase().includes('goal') || k.toLowerCase().includes('function') || k.toLowerCase().includes('purpose')) {
      proposedFields[k] = `Driven by core mandate: ${pitch}`;
    } else if (k.toLowerCase().includes('flaw') || k.toLowerCase().includes('weakness') || k.toLowerCase().includes('stakes')) {
      proposedFields[k] = `High operational risk under sustained pressure; vulnerable if key faction or power dependencies are severed.`;
    } else {
      proposedFields[k] = `${field.label} for ${title} (${tone} ${genre} grounding).`;
    }
  }

  const proposedProse = `<p><strong>${title}</strong> — <em>${pitch}</em></p><p>Grounded at Tech Level ${tl} through a ${tone.toLowerCase()} ${genre.toLowerCase()} lens, ${title} serves as a playable anchor within the active story module.</p>`;

  return { proposedFields, proposedProse };
}

/**
 * Uses AIME Structured JSON synthesis (with non-destructive merging) to draft Stage 3 Core Reality traits.
 */
export async function draftStructuredElementTraits({
  draft,
  catalog = [],
  campaignName = 'Tangent Universe',
  cronicle = null,
  dbData = null
}: {
  draft: GuidedElementDraft;
  catalog?: any[];
  campaignName?: string;
  cronicle?: any;
  dbData?: any;
}): Promise<{
  mergedFields: Record<string, any>;
  appliedKeys: string[];
  diffs: GuidedFieldDiff[];
  proposedProse: string;
  usedFallback: boolean;
}> {
  const stage3Fields = getCoreSchemaFieldsForStage3(draft.type).filter(
    (f: any) => f.type !== 'relational'
  );
  const playbook = getPlaybookForType(draft.type);

  const propertiesSchema: Record<string, any> = {
    narrativeProse: {
      type: 'STRING',
      description: 'Concise 2-paragraph evocative HTML/Markdown lore description grounded in Tangent SFF.'
    }
  };

  for (const f of stage3Fields) {
    propertiesSchema[f.key] = {
      type: 'STRING',
      description: `${f.label}: ${f.placeholder || f.label}`
    };
  }

  const responseSchema = {
    type: 'OBJECT',
    properties: propertiesSchema,
    required: ['narrativeProse']
  };

  const title = draft.title?.trim() || `New ${draft.type}`;
  const pitch = draft.fields?.[playbook.pitchKey] || draft.fields?.summary || '';
  const negRailguards = draft.fields?.negative_keywords
    ? `\nSTRICT NEGATIVE RAILGUARDS (DO NOT INCLUDE): ${draft.fields.negative_keywords}`
    : '';

  const prompt = `Draft structured Layer 2 Objective Reality traits for the [${draft.type}] element "${title}".
Concept / Pitch: "${pitch || 'Synthesize an evocative Tangent Science Fantasy concept.'}"
Playbook Family: ${playbook.familyLabel}${negRailguards}

Return a JSON object populating each trait concisely (1–3 crisp, sensory-rich sentences per field) plus "narrativeProse". Do not invent contradictory mechanics; honor Canonical v6 Tech/Meta Levels (TL 0-5 / ML 0-5).`;

  let proposedFields: Record<string, string> = {};
  let proposedProse = '';
  let usedFallback = false;

  try {
    const rawResponse = await callAimeGenerate({
      prompt,
      context: {
        projectName: campaignName,
        activeNode: {
          id: draft.id,
          title,
          type: draft.type,
          fields: draft.fields,
          content: draft.content
        },
        guidance: draft.guidance,
        assetHub: draft.assetHub,
        customCatalog: catalog,
        cronicle,
        dbData
      },
      enforceJson: true,
      responseSchema
    });

    const cleaned = String(rawResponse || '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    if (parsed && typeof parsed === 'object' && !parsed.gate) {
      const { narrativeProse, ...rest } = parsed;
      proposedFields = rest;
      proposedProse = narrativeProse || '';
    } else {
      usedFallback = true;
      const fb = buildDeterministicTraitFallback(draft);
      proposedFields = fb.proposedFields;
      proposedProse = fb.proposedProse;
    }
  } catch (_err) {
    usedFallback = true;
    const fb = buildDeterministicTraitFallback(draft);
    proposedFields = fb.proposedFields;
    proposedProse = fb.proposedProse;
  }

  const { mergedFields, appliedKeys, diffs } = mergeNonDestructiveTraits(
    draft.fields || {},
    proposedFields,
    stage3Fields
  );

  return {
    mergedFields,
    appliedKeys,
    diffs,
    proposedProse,
    usedFallback
  };
}

/**
 * Executes the 1-Click "Quick Markdown Dump" from Stage 1 Blueprints,
 * preserving fast Scenario Guide generation while populating summary & tags cleanly.
 */
export async function synthesizeQuickBlueprintMarkdown({
  blueprint,
  title,
  directives = '',
  catalog = [],
  guidance = {}
}: {
  blueprint: BlueprintTemplateConfig;
  title: string;
  directives?: string;
  catalog?: any[];
  guidance?: Record<string, any>;
}): Promise<string> {
  const cleanTitle = title.trim() || blueprint.name;
  const rawTemplate = blueprint.promptTemplate.replace('{title}', cleanTitle);
  const prompt = `${rawTemplate}
Additional Context / Specific Directives: "${directives.trim() || 'High sci-fi / cyberpunk science fantasy RPG tone.'}"

Output Format: Provide structured markdown with rich sections, atmospheric read-aloud boxes, Architect secrets, Canonical v6 2d10 stat notes, and tactical hooks.`;

  const context = {
    projectName: 'ElementForge Compendium',
    activeNode: {
      type: blueprint.elementType,
      title: cleanTitle,
      fields: {
        category: blueprint.category,
        guideModule: blueprint.name,
        ...(blueprint.seedFields || {})
      }
    },
    guidance: Object.keys(guidance || {}).length > 0 ? guidance : (blueprint.seedGuidance || {}),
    guidanceGems: directives.trim() || 'High sci-fi / cyberpunk science fantasy RPG tone',
    customCatalog: catalog
  };

  return callAimeGenerate({ prompt, context });
}

/**
 * Deterministic BASTION Stage 4 Calibrator across all 5 Playbook Families.
 * Enforces Canonical v6 Rules:
 *   - 2d10 Dual Resolution (CR 15 Unopposed baseline; Defender wins ties)
 *   - Base Vitals: 30 VP / 30 HP (Organic) or 60 SP Structure (Synthetic)
 *   - Economatrix EUFT: Base Credits = 10 * 4^floor(CR/5); Purchase CR = Crafting CR = Cost CR
 */
export function calibrateElementWithBastion({
  draft,
  dbData = {}
}: {
  draft: GuidedElementDraft;
  dbData?: Record<string, any>;
}): {
  calibratedFields: Record<string, any>;
  summaryBadge: string;
  rationale: string;
} {
  const playbook = getPlaybookForType(draft.type);
  const fields = { ...(draft.fields || {}) };
  const corpus = [
    draft.title,
    draft.content,
    ...Object.values(fields).map((v) => (typeof v === 'string' ? v : ''))
  ]
    .join(' ')
    .toLowerCase();

  // 1. Persona Calibration (MCM + Canonical v6 Vitals)
  if (draft.type === 'Persona') {
    const isBoss = /\b(boss|warlord|archon|commander|overlord|prime|leviathan)\b/.test(corpus);
    const isElite = /\b(elite|veteran|assassin|inquisitor|captain|cyborg|enforcer)\b/.test(corpus);
    const tier = Number(fields.mcmTier) || (isBoss ? 8 : isElite ? 4 : 2);

    const isSlicer = /\b(hacker|slicer|engineer|scientist|medic|doctor|tech|analyst)\b/.test(corpus);
    const isSocial = /\b(diplomat|fixer|broker|ambassador|noble|merchant|envoy)\b/.test(corpus);
    const chassis = fields.mcmChassis || (isSlicer ? 'Specialist' : isSocial ? 'Socialite' : 'Combatant');
    const role =
      fields.mcmRole ||
      (isBoss
        ? 'Sector Boss / Commander'
        : isSlicer
        ? 'Slicer / Tech Operative'
        : isSocial
        ? 'Tactical / Commando'
        : 'Bruiser / Vanguard');

    const isSynthetic = /\b(synthetic|android|droid|automaton|construct|mekan|ai|robot)\b/.test(
      `${fields['char-species'] || ''} ${corpus}`
    );

    const roleHealthBonus = isBoss ? 30 : role.includes('Bruiser') ? 10 : 5;
    const roleDefBonus = isBoss ? 5 : 3;
    const agi = chassis === 'Combatant' ? 2 : 1;
    const primaryAttr = 3;

    const health = (isSynthetic ? 60 : 30) + Math.max(0, tier - 1) * 6 + roleHealthBonus;
    const vitality = isSynthetic ? 0 : 30 + Math.max(0, tier - 1) * 4;
    const defense = 10 + agi + roleDefBonus + Math.floor(tier / 2);
    const attackBonus = primaryAttr + tier + 2;

    const tl = Number(fields['tech-level'] ?? 3);
    const weapons = Array.isArray(dbData?.weaponry) ? dbData.weaponry : [];
    const matchedWeapon =
      fields.weapon ||
      weapons.find((w: any) => Number(w.tl ?? w.tech_level ?? 3) === tl)?.name ||
      'Plasma Carbine';

    const calibratedFields = {
      ...fields,
      mcmTier: String(tier),
      mcmDesignation: fields.mcmDesignation || 'Adversary',
      mcmChassis: chassis,
      mcmRole: role,
      physiology: isSynthetic ? 'Synthetic' : 'Organic',
      health: String(health),
      vitality: String(vitality),
      structure: isSynthetic ? String(health) : '',
      defense: String(defense),
      attackBonus: String(attackBonus),
      'tech-level': String(tl),
      weapon: matchedWeapon
    };

    return {
      calibratedFields,
      summaryBadge: isSynthetic
        ? `T-${tier} ${chassis} • ${health} SP • Def ${defense} • +${attackBonus} Atk`
        : `T-${tier} ${chassis} • ${vitality} VP / ${health} HP • Def ${defense} • +${attackBonus} Atk`,
      rationale: `BASTION sealed Canonical v6 ${isSynthetic ? 'Synthetic (60 SP base)' : 'Organic (30 VP / 30 HP base)'} MCM profile at Threat Tier ${tier}.`
    };
  }

  // 2. Relic / Item / Technology Calibration (Economatrix EUFT)
  if (playbook.family === 'relic') {
    const isPrecursor = /\b(precursor|progenitor|relic|artifact|singularity|ancient)\b/.test(corpus);
    const isPrototype = /\b(prototype|hard-light|nanotech|experimental|quantum|masterwork)\b/.test(corpus);
    const tl = Number(fields.techLevel || fields['tech-level'] || (isPrecursor ? 5 : isPrototype ? 4 : 3));
    const ml = Number(fields['meta-level'] ?? (/\b(psionic|aether|rune|awakened|soul)\b/.test(corpus) ? 3 : 0));
    const rarity = fields.rarity || (isPrecursor ? 'Artifact' : isPrototype ? 'Prototype' : 'Standard');

    const defaultCr = isPrecursor ? 25 : isPrototype ? 18 : 12;
    const costCr = fields.costCr !== undefined && fields.costCr !== ''
      ? Number(fields.costCr)
      : fields.creditValue
      ? calculateCRFromCredits(Number(fields.creditValue))
      : defaultCr;
    const creditValue = calculateCreditValue(costCr);

    const calibratedFields = {
      ...fields,
      techLevel: `TL-${tl}`,
      'tech-level': String(tl),
      'meta-level': String(ml),
      rarity,
      costCr: String(costCr),
      creditValue: String(creditValue),
      mechanic:
        fields.mechanic ||
        `Canonical v6 (TL-${tl}): Unopposed operation CR 15; Crafting/Purchase CR ${costCr} (${creditValue.toLocaleString()} Cr EUFT).`
    };

    return {
      calibratedFields,
      summaryBadge: `TL-${tl} ${rarity} • CR ${costCr} (${creditValue.toLocaleString()} Cr)`,
      rationale: `BASTION Economatrix Golden Rule applied: Cost CR = Purchase CR = Crafting CR ${costCr} (${creditValue.toLocaleString()} Credits).`
    };
  }

  // 3. Locations, Scenes, Encounters & Maps
  if (playbook.family === 'location') {
    const preset =
      ATMOSPHERIC_PRESETS.find((p) => corpus.includes(p.category.toLowerCase()) || corpus.includes(p.id.split('_')[0])) ||
      ATMOSPHERIC_PRESETS[3]; // Cyberpunk Neon Rain default
    const cr = Number(fields.hazardCr || 15);
    const title = draft.title?.trim() || 'Active Sector';

    const calibratedFields = {
      ...fields,
      weatherPreset: fields.weatherPreset || preset.id,
      hazardCr: String(cr),
      sceneBeats:
        fields.sceneBeats ||
        `1. Approach & Recon (${title})\n2. Escalation / Hazard Check (2d10 vs CR ${cr})\n3. Climax Objective & Exfiltration`,
      readAloud:
        fields.readAloud ||
        `${preset.visualFX} ${preset.sensoryAudio}`
    };

    return {
      calibratedFields,
      summaryBadge: `${preset.icon} ${preset.name} • Hazard CR ${cr}`,
      rationale: `Calibrated sequential VTT beats, sensory read-aloud, and ${preset.name} (${preset.rule}).`
    };
  }

  // 4. Epistemic Props (Clue, Handout, Custom)
  if (playbook.family === 'epistemic') {
    const isCyber = /\b(encrypted|terminal|log|datapad|comms|cipher|code)\b/.test(corpus);
    const skill = fields.analysisSkill || (isCyber ? 'Slicing / Computers' : 'Perception / Forensics');
    const cr = Number(fields.analysisCr || 15);

    const calibratedFields = {
      ...fields,
      analysisSkill: skill,
      analysisCr: String(cr),
      highDegreeBonus:
        fields.highDegreeBonus ||
        `Margin +5 (CR ${cr + 5}): Reveals origin signature, timestamp metadata, and linked faction handler.`
    };

    return {
      calibratedFields,
      summaryBadge: `2d10 ${skill} vs CR ${cr} (+5 High-Degree)`,
      rationale: `BASTION set Canonical v6 Dual Resolution gate at CR ${cr} with +5 High-Degree revelation.`
    };
  }

  // 5. Macro-Lore (World, Universe, Philosophy, Story Arc, Adventure, Species, Faction)
  const tl = Number(fields['tech-level'] ?? 3);
  const ml = Number(fields['meta-level'] ?? 3);
  const safeSlug = (draft.title || draft.type || 'module')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const calibratedFields = {
    ...fields,
    'tech-level': String(tl),
    'meta-level': String(ml),
    storyFlagKey: fields.storyFlagKey || `${safeSlug}_active`
  };

  return {
    calibratedFields,
    summaryBadge: `Baseline TL-${tl} / ML-${ml} • Flag: ${calibratedFields.storyFlagKey}`,
    rationale: `Anchored setting baseline at TL-${tl} / ML-${ml} with story flag key "${calibratedFields.storyFlagKey}".`
  };
}

/**
 * Deterministically derives clean Pass-1 Primary and Pass-2 Secondary Lorebook Trigger keys
 * from the element's identity, archetype, faction, location, and keywords.
 */
export function deriveLorebookTriggersFromDraft(draft: GuidedElementDraft): {
  primaryTriggers: string;
  secondaryTriggers: string;
  loreScanPriority: number;
  loreBudgetTokens: number;
} {
  const fields = draft.fields || {};
  const primarySet = new Set<string>();
  const secondarySet = new Set<string>();

  const addTokens = (target: Set<string>, raw?: any) => {
    for (const chip of parseChipKeywords(raw)) {
      const cleaned = chip.replace(/^["']|["']$/g, '').trim();
      if (cleaned.length >= 3) target.add(cleaned);
    }
  };

  if (draft.title?.trim()) primarySet.add(draft.title.trim());
  addTokens(primarySet, fields.name);
  addTokens(primarySet, fields.worldName || fields.settingName || fields.speciesName || fields.technologyName || fields.philosophyName);

  // If title has multiple words (e.g. "Commander Vane"), also include distinctive surname/designation
  const titleParts = (draft.title || '')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !/^(the|and|for|sector|outpost|lord|lady|doctor|captain)$/i.test(w));
  if (titleParts.length > 1) {
    primarySet.add(titleParts[titleParts.length - 1]);
  }

  addTokens(secondarySet, fields.archetype);
  addTokens(secondarySet, fields['char-faction'] || fields.dbmFactionRef || fields.linkedFaction);
  addTokens(secondarySet, fields['char-species'] || fields.dbmSpeciesRef);
  addTokens(secondarySet, fields.parentWorld || fields.location || fields.locationFound);
  addTokens(secondarySet, fields.keywords || fields.tags);

  for (const p of primarySet) {
    secondarySet.delete(p);
  }

  return {
    primaryTriggers: Array.from(primarySet).slice(0, 6).join(', '),
    secondaryTriggers: Array.from(secondarySet).slice(0, 8).join(', '),
    loreScanPriority: Number(fields.loreScanPriority) || 50,
    loreBudgetTokens: Number(fields.loreBudgetTokens) || 250
  };
}

/**
 * Scans the campaign's elementsCatalog against the current draft to recommend
 * resonant Layer 3 Asset Hub links (via explicit [Brackets] and entity/keyword mentions).
 */
export function recommendResonantAssets({
  draft,
  catalog = [],
  currentElementId = null
}: {
  draft: GuidedElementDraft;
  catalog: any[];
  currentElementId?: string | null;
}): ResonantAssetSuggestion[] {
  if (!Array.isArray(catalog) || catalog.length === 0) return [];

  const linkedIds = new Set(
    (draft.assetHub || []).map((a: any) => (typeof a === 'string' ? a : a.assetId))
  );

  const rawTexts = [
    draft.title,
    draft.content,
    ...Object.values(draft.fields || {}).map((v) => (typeof v === 'string' ? v : ''))
  ].filter(Boolean);

  const fullTextLower = rawTexts.join(' ').toLowerCase();

  // 1. Check explicit [Bracket] references first
  const bracketIds = new Set<string>();
  try {
    const resolved = extractAndResolveBracketContext(rawTexts, {
      elementsCatalog: catalog,
      dbData: {}
    }) as Array<{ id?: string; targetType?: string; rawEntity?: { id?: string } }>;
    for (const item of resolved || []) {
      const hitId = item?.rawEntity?.id || item?.id;
      if (hitId) bracketIds.add(hitId);
    }
  } catch (_e) {
    // Ignore bracket resolution errors in pure scan
  }

  const suggestions: ResonantAssetSuggestion[] = [];

  for (const elem of catalog) {
    if (!elem || !elem.id) continue;
    if (elem.id === currentElementId || elem.id === draft.id) continue;
    if (linkedIds.has(elem.id)) continue;

    const elemTitle = String(elem.title || elem.name || '').trim();
    if (elemTitle.length < 3) continue;

    const isBracketed = bracketIds.has(elem.id);
    const isTitleMentioned = fullTextLower.includes(elemTitle.toLowerCase());

    // Also check shared faction/world/tags overlap
    const draftFaction = String(draft.fields?.['char-faction'] || draft.fields?.linkedFaction || '').toLowerCase();
    const elemFaction = String(elem.fields?.['char-faction'] || elem.title || '').toLowerCase();
    const sharesFaction =
      draftFaction.length > 3 &&
      (elemFaction.includes(draftFaction) || (elem.type === 'Faction' && elemTitle.toLowerCase().includes(draftFaction)));

    if (isBracketed || isTitleMentioned || sharesFaction) {
      const suggestedImportance = isBracketed || isTitleMentioned ? 'high' : 'typical';
      const matchReason = isBracketed
        ? 'Explicit [Bracket] reference in traits/prose'
        : isTitleMentioned
        ? `Mentioned directly in ${draft.title || 'element'} traits`
        : `Shared faction affiliation (${draft.fields?.['char-faction'] || draft.fields?.linkedFaction})`;

      suggestions.push({
        assetId: elem.id,
        assetTitle: elemTitle,
        assetType: elem.type || 'Element',
        suggestedImportance,
        suggestedAnnotation: `${matchReason}`,
        matchReason
      });
    }
  }

  return suggestions.slice(0, 6);
}

/**
 * Builds a rich, pre-hydrated visual art prompt from the guided draft for 1-click Artist Hub launch.
 */
export function buildArtistHubVisualBrief(draft: GuidedElementDraft): string {
  const fields = draft.fields || {};
  const guidance = draft.guidance || {};
  const parts: string[] = [];

  if (draft.title?.trim()) {
    parts.push(`${draft.title.trim()} (${draft.type})`);
  } else {
    parts.push(`Tangent SFF ${draft.type}`);
  }

  const visualTrait =
    fields.physicalDescription ||
    fields.sensoryDetails ||
    fields.geographyArchitecture ||
    fields.symbolsIconography ||
    fields.oneLinePitch ||
    fields.corePremise ||
    fields.summary;

  if (visualTrait) {
    parts.push(String(visualTrait).slice(0, 180));
  }

  const tl = fields['tech-level'] || fields.techLevel;
  if (tl) parts.push(`Tech Level ${tl}`);

  const styleTags = [guidance.genre || guidance.Genre, guidance.tone || guidance.Tone, guidance.Mood].filter(Boolean);
  if (styleTags.length > 0) {
    parts.push(`Tone: ${styleTags.join(', ')}`);
  }

  return parts.join(' — ');
}
