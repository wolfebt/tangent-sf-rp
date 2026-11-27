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
import { calculateNPCCombatBlock } from '../../../../engines/tangentEntityEngines.js';
import {
  resolveCompetencyRoleKey,
  resolveBossTypeKey,
  resolveDesignationKey
} from '../../../../utils/personaBridge.js';

function parseBoundedLevel(val: any, fallback: number, min = 0, max = 5): number {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') {
    return Number.isFinite(val) ? Math.max(min, Math.min(max, Math.round(val))) : fallback;
  }
  const match = String(val).match(/\d+/);
  if (!match) return fallback;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
}

const callAimeGenerate = generateContent as unknown as (params: {
  prompt: string;
  context?: Record<string, any> | string;
  enforceJson?: boolean;
  responseSchema?: Record<string, any> | null;
  signal?: AbortSignal;
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
  dbData = null,
  signal
}: {
  draft: GuidedElementDraft;
  catalog?: any[];
  campaignName?: string;
  cronicle?: any;
  dbData?: any;
  signal?: AbortSignal;
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
  const posKeywords = draft.fields?.keywords
    ? `\nPOSITIVE THEMATIC KEYWORDS (WEAVE NATURALLY): ${draft.fields.keywords}`
    : '';
  const negRailguards = draft.fields?.negative_keywords
    ? `\nSTRICT NEGATIVE RAILGUARDS (DO NOT INCLUDE): ${draft.fields.negative_keywords}`
    : '';

  const prompt = `Draft structured Layer 2 Objective Reality traits for the [${draft.type}] element "${title}".
Concept / Pitch: "${pitch || 'Synthesize an evocative Tangent Science Fantasy concept.'}"
Playbook Family: ${playbook.familyLabel}${posKeywords}${negRailguards}

Return a JSON object populating each trait concisely (1–3 crisp, sensory-rich sentences per field) plus "narrativeProse". Do not invent contradictory mechanics; honor Canonical v6 Tech/Meta Levels (TL 0-5 / ML 0-5).`;

  let proposedFields: Record<string, string> = {};
  let proposedProse = '';
  let usedFallback = false;

  try {
    if (signal?.aborted) {
      throw new DOMException('Drafting aborted', 'AbortError');
    }
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
      responseSchema,
      signal
    });

    if (signal?.aborted) {
      throw new DOMException('Drafting aborted', 'AbortError');
    }

    const cleaned = String(rawResponse || '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } else {
        throw new Error('Response did not contain valid JSON object.');
      }
    }

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
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw err;
    }
    console.warn('[guidedElementAiService] Falling back to deterministic Stage 3 traits:', err);
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
  guidance = {},
  keywords = '',
  negative_keywords = '',
  signal
}: {
  blueprint: BlueprintTemplateConfig;
  title: string;
  directives?: string;
  catalog?: any[];
  guidance?: Record<string, any>;
  keywords?: string;
  negative_keywords?: string;
  signal?: AbortSignal;
}): Promise<{ text: string; usedFallback: boolean }> {
  if (signal?.aborted) {
    throw new DOMException('Blueprint synthesis aborted', 'AbortError');
  }
  const cleanTitle = title.trim() || blueprint.name;
  const rawTemplate = blueprint.promptTemplate.replace('{title}', cleanTitle);
  const kwBlock = keywords ? `\nPositive Keywords (weave naturally): ${keywords}` : '';
  const negBlock = negative_keywords ? `\nBanned Tropes (exclude): ${negative_keywords}` : '';
  const prompt = `${rawTemplate}
Additional Context / Specific Directives: "${directives.trim() || 'High sci-fi / cyberpunk science fantasy RPG tone.'}"${kwBlock}${negBlock}

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

  const text = await callAimeGenerate({ prompt, context, signal });
  if (signal?.aborted) {
    throw new DOMException('Blueprint synthesis aborted', 'AbortError');
  }
  const isOfflineStub = String(text || '').trim().startsWith('[AIME LOCAL COGNITION]');
  return {
    text: String(text || ''),
    usedFallback: isOfflineStub
  };
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

  // 1. Persona Calibration (Canonical calculateNPCCombatBlock + v6 Vitals)
  if (draft.type === 'Persona') {
    const isBoss = /\b(boss|warlord|archon|commander|overlord|prime|leviathan)\b/.test(corpus);
    const isElite = /\b(elite|veteran|assassin|inquisitor|captain|cyborg|enforcer)\b/.test(corpus);
    const tier = parseBoundedLevel(fields.mcmTier, isBoss ? 8 : isElite ? 4 : 2, 0, 20);

    const isSlicer = /\b(hacker|slicer|engineer|scientist|medic|doctor|tech|analyst)\b/.test(corpus);
    const isSocial = /\b(diplomat|fixer|broker|ambassador|noble|merchant|envoy)\b/.test(corpus);
    const chassis = fields.mcmChassis || (isSlicer ? 'Specialist' : isSocial ? 'Socialite' : 'Combatant');
    const rawRole =
      fields.mcmRole ||
      (isBoss
        ? 'Leader'
        : isSlicer
        ? 'Technician'
        : isSocial
        ? 'Buffer'
        : 'Brute');
    const roleKey = resolveCompetencyRoleKey(rawRole);
    const bossType = resolveBossTypeKey(fields.mcmBossType || fields.bossType || (isBoss ? 'Boss' : 'Standard'));
    const designation = resolveDesignationKey(fields.mcmDesignation || fields['char-role'] || 'Adversary');
    const speciesSize = fields.speciesSize || fields['char-size'] || 'Medium';

    const isSynthetic =
      Boolean(fields.isSynthetic || fields.is_synthetic) ||
      fields.physiology === 'Synthetic' ||
      /\b(synthetic|android|droid|automaton|construct|mekan|ai|robot)\b/.test(
        `${fields['char-species'] || ''} ${corpus}`
      );

    const combatBlock = calculateNPCCombatBlock({
      tier,
      role: roleKey,
      bossType,
      size: speciesSize,
      designation,
      isSynthetic
    });

    const structurePoints = combatBlock.structurePoints ?? (isSynthetic ? 60 : 0);
    const health = isSynthetic ? structurePoints : (combatBlock.health ?? 30);
    const vitality = isSynthetic ? 0 : (combatBlock.vitality ?? 30);
    const defenseDc = combatBlock.defenseDC ?? 12;
    const attackBonus = combatBlock.attackBonus ?? 4;
    const armorDR = combatBlock.expectedDR ?? 0;
    const actionsPerRound = combatBlock.actionsPerRound ?? 1;

    const tl = parseBoundedLevel(fields['tech-level'] ?? fields.techLevel ?? fields.tech_level, 3, 0, 5);
    const weapons = Array.isArray(dbData?.weaponry) ? dbData.weaponry : [];
    const matchedWeapon =
      fields.weapon ||
      weapons.find((w: any) => parseBoundedLevel(w.tl ?? w.tech_level, 3) === tl)?.name ||
      'Plasma Carbine';

    const calibratedFields = {
      ...fields,
      mcmTier: String(tier),
      mcmDesignation: designation,
      mcmChassis: chassis,
      mcmRole: roleKey,
      mcmBossType: bossType,
      bossType,
      speciesSize,
      physiology: isSynthetic ? 'Synthetic' : 'Organic',
      isSynthetic,
      is_synthetic: isSynthetic,
      health: String(health),
      vitality: String(vitality),
      structure: isSynthetic ? String(structurePoints) : '',
      structurePoints: String(structurePoints),
      armorDR: String(armorDR),
      defense: String(defenseDc),
      defense_dc: String(defenseDc),
      attackBonus: String(attackBonus),
      attack_bonus: String(attackBonus),
      actions: String(actionsPerRound),
      actionsPerRound: String(actionsPerRound),
      'tech-level': String(tl),
      techLevel: String(tl),
      weapon: matchedWeapon
    };

    return {
      calibratedFields,
      summaryBadge: isSynthetic
        ? `T-${tier} ${roleKey} • ${structurePoints} SP • Def ${defenseDc} • +${attackBonus} Atk`
        : `T-${tier} ${roleKey} • ${vitality} VP / ${health} HP • Def ${defenseDc} • +${attackBonus} Atk`,
      rationale: `BASTION sealed Canonical v6 ${isSynthetic ? 'Synthetic (60 SP base)' : 'Organic (30 VP / 30 HP base)'} MCM profile at Threat Tier ${tier} (${roleKey}).`
    };
  }

  // 2. Relic / Property / Item / Technology Calibration (Economatrix EUFT)
  if (playbook.family === 'relic') {
    const isPrecursor = /\b(precursor|progenitor|relic|artifact|singularity|ancient)\b/.test(corpus);
    const isPrototype = /\b(prototype|hard-light|nanotech|experimental|quantum|masterwork)\b/.test(corpus);
    const tl = parseBoundedLevel(fields.techLevel ?? fields['tech-level'] ?? fields.tech_level, isPrecursor ? 5 : isPrototype ? 4 : 3);
    const ml = parseBoundedLevel(fields.metaLevel ?? fields['meta-level'] ?? fields.meta_level, /\b(psionic|aether|rune|awakened|soul)\b/.test(corpus) ? 3 : 0);
    const rarity = fields.rarity || (isPrecursor ? 'Artifact' : isPrototype ? 'Prototype' : 'Standard');

    const defaultCr = isPrecursor ? 25 : isPrototype ? 18 : 12;
    const rawCrField = fields.costCr !== undefined && fields.costCr !== '' ? fields.costCr : fields.craft_dc;
    const rawCreditField = fields.creditValue !== undefined && fields.creditValue !== '' ? fields.creditValue : fields.cost;
    const costCr = rawCrField !== undefined && rawCrField !== ''
      ? Math.max(0, Math.min(80, Number(rawCrField) || defaultCr))
      : rawCreditField
      ? calculateCRFromCredits(Number(rawCreditField) || 0)
      : defaultCr;
    const creditValue = calculateCreditValue(costCr);

    const calibratedFields = {
      ...fields,
      techLevel: String(tl),
      'tech-level': String(tl),
      tech_level: String(tl),
      metaLevel: String(ml),
      'meta-level': String(ml),
      meta_level: String(ml),
      rarity,
      costCr: String(costCr),
      craft_dc: String(costCr),
      creditValue: String(creditValue),
      cost: String(creditValue),
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
      ATMOSPHERIC_PRESETS.find((p) => corpus.includes(p.category.toLowerCase()) || corpus.includes(p.id.split('_')[0] || '')) ||
      ATMOSPHERIC_PRESETS[3] ||
      ATMOSPHERIC_PRESETS[0] || {
        id: 'neon_rain',
        icon: '🌧️',
        name: 'Neon Rain',
        visualFX: 'Wet neon reflections under overcast habitat domes.',
        sensoryAudio: 'Low thunder and steady stormwash.',
        rule: 'Standard visibility'
      };
    const cr = Number(fields.hazardCr || 15) || 15;
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
    const cr = Number(fields.analysisCr || 15) || 15;

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

  // 5A. Metaphysics (Invocations, Disciplines, Special Abilities)
  if (draft.type === 'Metaphysics') {
    const tl = parseBoundedLevel(fields['tech-level'] ?? fields.techLevel ?? fields.tech_level, 3);
    const ml = parseBoundedLevel(fields.meta_level ?? fields['meta-level'] ?? fields.metaLevel, 3);
    const designCr = Number(String(fields.design_dc || '').match(/\d+/)?.[0]) || (12 + ml * 3);
    const metaSkill = fields.meta_skill || fields.discipline || 'Meta-Psionics';
    const castTime = fields.cast_time || `Trained Action • ${Math.max(1, ml)} Strain`;

    const calibratedFields = {
      ...fields,
      'tech-level': String(tl),
      techLevel: String(tl),
      tech_level: String(tl),
      meta_level: String(ml),
      'meta-level': String(ml),
      metaLevel: String(ml),
      design_dc: String(designCr),
      meta_skill: metaSkill,
      cast_time: castTime
    };

    return {
      calibratedFields,
      summaryBadge: `ML-${ml} • ${metaSkill} • CR ${designCr}`,
      rationale: `Calibrated Metaphysics at ML-${ml} (${metaSkill}), Invocation Design CR ${designCr}, Action Cost "${castTime}".`
    };
  }

  // 5B. Species Baseline
  if (draft.type === 'Species') {
    const isSynthetic =
      Boolean(fields.isSynthetic || fields.is_synthetic) ||
      fields.physiology === 'Synthetic' ||
      /\b(synthetic|android|droid|automaton|construct|mekan|ai|robot)\b/.test(corpus);
    const physiology = fields.physiology || (isSynthetic ? 'Synthetic' : 'Organic');
    const tl = parseBoundedLevel(fields['tech-level'] ?? fields.techLevel ?? fields.tech_level, 3);
    const ml = parseBoundedLevel(fields['meta-level'] ?? fields.metaLevel ?? fields.meta_level, 1);

    const calibratedFields = {
      ...fields,
      physiology,
      isSynthetic,
      is_synthetic: isSynthetic,
      'tech-level': String(tl),
      techLevel: String(tl),
      tech_level: String(tl),
      'meta-level': String(ml),
      metaLevel: String(ml),
      meta_level: String(ml)
    };

    return {
      calibratedFields,
      summaryBadge: `${physiology} • TL-${tl} / ML-${ml}`,
      rationale: `Calibrated Species physiology (${physiology}) with baseline TL-${tl} / ML-${ml}.`
    };
  }

  // 5C. Faction Baseline
  if (draft.type === 'Faction') {
    const tl = parseBoundedLevel(fields['tech-level'] ?? fields.techLevel ?? fields.tech_level, 3);
    const ml = parseBoundedLevel(fields['meta-level'] ?? fields.metaLevel ?? fields.meta_level, 1);
    const disposition = fields.disposition || 'Neutral';
    const titleSlug = (draft.title || 'faction').trim();
    const clockGoal = fields.clockGoal || `[6-Segment Clock] Advance ${titleSlug} strategic mandate`;

    const calibratedFields = {
      ...fields,
      disposition,
      'tech-level': String(tl),
      techLevel: String(tl),
      tech_level: String(tl),
      'meta-level': String(ml),
      metaLevel: String(ml),
      meta_level: String(ml),
      clockGoal
    };

    return {
      calibratedFields,
      summaryBadge: `${disposition} • TL-${tl} / ML-${ml} • Clock Ready`,
      rationale: `Calibrated Faction posture (${disposition}), TL-${tl}/ML-${ml}, and 6-Segment Campaign Clock.`
    };
  }

  // 5D. Macro-Lore (World, Universe, Philosophy, Story Arc, Adventure)
  const tl = parseBoundedLevel(fields['tech-level'] ?? fields.techLevel ?? fields.tech_level, 3);
  const ml = parseBoundedLevel(fields['meta-level'] ?? fields.metaLevel ?? fields.meta_level, 3);
  const safeSlug = (draft.title || draft.type || 'module')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const calibratedFields = {
    ...fields,
    'tech-level': String(tl),
    techLevel: String(tl),
    tech_level: String(tl),
    'meta-level': String(ml),
    metaLevel: String(ml),
    meta_level: String(ml),
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
    const lastWord = titleParts[titleParts.length - 1];
    if (lastWord) {
      primarySet.add(lastWord);
    }
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
  const draftFactionRaw =
    draft.fields?.['char-faction'] || draft.fields?.linkedFaction || draft.fields?.faction || '';
  const draftFaction = String(draftFactionRaw).trim().toLowerCase();
  const draftKeywordSet = new Set(
    parseChipKeywords(
      [draft.fields?.keywords, draft.fields?.tags].filter(Boolean).join(', ')
    )
      .map((k) => k.toLowerCase())
      .filter((k) => k.length >= 4)
  );

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

  const scoredSuggestions: Array<{ priority: number; suggestion: ResonantAssetSuggestion }> = [];

  for (const elem of catalog) {
    if (!elem || !elem.id) continue;
    if (elem.id === currentElementId || elem.id === draft.id) continue;
    if (linkedIds.has(elem.id)) continue;

    const elemTitle = String(elem.title || elem.name || '').trim();
    if (elemTitle.length < 3) continue;
    const elemTitleLower = elemTitle.toLowerCase();

    const isBracketed = bracketIds.has(elem.id);
    let isTitleMentioned = false;
    if (!isBracketed && fullTextLower.includes(elemTitleLower)) {
      const escapedTitle = elemTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titleStart = /^\w/.test(elemTitle) ? '\\b' : '(?:^|[^A-Za-z0-9_])';
      const titleEnd = /\w$/.test(elemTitle) ? '\\b' : '(?=$|[^A-Za-z0-9_])';
      isTitleMentioned = new RegExp(`${titleStart}${escapedTitle}${titleEnd}`, 'i').test(fullTextLower);
    }

    // Also check shared faction affiliation
    const elemFaction = String(
      elem.fields?.['char-faction'] || elem.fields?.linkedFaction || elem.fields?.faction || elem.title || ''
    ).toLowerCase();
    const sharesFaction =
      draftFaction.length > 3 &&
      (elemFaction.includes(draftFaction) || (elem.type === 'Faction' && elemTitleLower.includes(draftFaction)));

    // Check shared thematic keywords/tags when not already matched by stronger signals
    const sharedKeywords: string[] = [];
    if (!isBracketed && !isTitleMentioned && !sharesFaction && draftKeywordSet.size > 0) {
      const elemTagsRaw = [
        ...parseChipKeywords([elem.fields?.keywords, elem.fields?.tags].filter(Boolean).join(', ')),
        ...(Array.isArray(elem.tags) ? elem.tags.map((t: any) => String(t || '').trim()) : [])
      ];
      const seenElemTokens = new Set<string>();
      for (const token of elemTagsRaw) {
        const lower = token.toLowerCase();
        if (lower.length >= 4 && draftKeywordSet.has(lower) && !seenElemTokens.has(lower)) {
          seenElemTokens.add(lower);
          sharedKeywords.push(lower);
        }
      }
    }
    const sharesTags = sharedKeywords.length >= 2;

    if (isBracketed || isTitleMentioned || sharesFaction || sharesTags) {
      const priority = isBracketed ? 4 : isTitleMentioned ? 3 : sharesFaction ? 2 : 1;
      const suggestedImportance = isBracketed || isTitleMentioned ? 'high' : 'typical';
      const matchReason = isBracketed
        ? 'Explicit [Bracket] reference in traits/prose'
        : isTitleMentioned
        ? `Mentioned directly in ${draft.title || 'element'} traits`
        : sharesFaction
        ? `Shared faction affiliation (${draftFactionRaw})`
        : `Shared thematic tags (${sharedKeywords.slice(0, 3).join(', ')})`;

      scoredSuggestions.push({
        priority,
        suggestion: {
          assetId: elem.id,
          assetTitle: elemTitle,
          assetType: elem.type || 'Element',
          suggestedImportance,
          suggestedAnnotation: `${matchReason}`,
          matchReason
        }
      });
    }
  }

  scoredSuggestions.sort((a, b) => b.priority - a.priority);
  return scoredSuggestions.slice(0, 6).map((entry) => entry.suggestion);
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
