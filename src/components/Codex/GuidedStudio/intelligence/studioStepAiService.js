/**
 * ════════════════════════════════════════════════════════════════════════════════
 * GUIDED STUDIO — DETERMINISTIC CALIBRATOR & STRICTLY USER-CUED AI CO-PILOT
 *
 * POLICY (USER CONFIRMED):
 * 1. Deterministic BASTION math calibration runs instantaneously with zero LLM calls.
 * 2. Generative AI prose / field synthesis NEVER runs proactively; it executes ONLY
 *    when explicitly cued by the user and returns a non-destructive field diff list.
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { getGeminiApiKey, fetchGeminiContent } from '../../../../services/bastionService.js';
import { sanitizePayloadStrings } from '../../../../pages/Codex/codexPromptRegistry.js';
import { normalizeStudioDomainKey } from '../studioPlaybooks.js';

const TSC_MICRO_MODIFIERS = [1.0, 1.3, 1.75, 2.3, 3.0];

/**
 * Computes canonical Tangent Standard Curve (TSC) Credit Value from Cost/Craft CR.
 * Formula: Base Value = 10 * 4^(floor(CR / 5)) * Micro-Modifier
 */
export function computeCanonicalTscCredits(crValue) {
  const cr = Math.max(0, Math.round(Number(crValue) || 0));
  const tier = Math.floor(cr / 5);
  const rem = ((cr % 5) + 5) % 5;
  const micro = TSC_MICRO_MODIFIERS[rem] || 1.0;
  return Math.round(10 * Math.pow(4, tier) * micro);
}

/**
 * Computes canonical Metaphysics Essence / Focus cost: ceil(CR / 5).
 */
export function computeCanonicalEssenceCost(crValue) {
  const cr = Math.max(1, Math.round(Number(crValue) || 15));
  return Math.max(1, Math.ceil(cr / 5));
}

/**
 * Runs deterministic BASTION math calibration for the active asset and returns
 * proposed synchronized updates `{ field, label, currentValue, proposedValue, reason }[]`.
 */
export function computeDeterministicCalibrationDiffs(formData = {}, rawDomainKey = 'gear', computedValues = {}, liveBuildCheck = null) {
  const key = normalizeStudioDomainKey(rawDomainKey);
  const diffs = [];

  const pushDiff = (field, label, proposedValue, reason) => {
    if (proposedValue === undefined || proposedValue === null) return;
    const currentValue = formData[field];
    if (JSON.stringify(currentValue) === JSON.stringify(proposedValue)) return;
    diffs.push({ field, label, currentValue, proposedValue, reason });
  };

  // 1. Hardware / Property: Synchronize Craft/Purchase CR -> TSC Credits & Material Cost
  if (['weaponry', 'armoring', 'augmentations', 'gear', 'mecha', 'architecture', 'other', 'meta-tech'].includes(key)) {
    const derivedCR = Number(
      computedValues?.final_dc ??
      computedValues?.craft_dc ??
      computedValues?.cost_cr ??
      formData.craft_dc ??
      formData.design_dc ??
      formData.dc ??
      15
    );
    const cleanCR = Math.max(1, Math.round(derivedCR));
    const tscCredits = computeCanonicalTscCredits(cleanCR);
    const matCost = Math.round(tscCredits * 0.5);

    if (Number(formData.craft_dc) !== cleanCR) {
      pushDiff('craft_dc', 'Canonical Purchase / Craft CR', cleanCR, 'Golden Rule of Tangent Wealth (Purchase CR = Craft CR)');
    }
    if (Number(formData.price || formData.cost_credits || 0) !== tscCredits) {
      pushDiff('price', 'TSC Market Value (Credits)', tscCredits, `TSC Formula: 10 * 4^floor(${cleanCR}/5) * Micro-Mod`);
      pushDiff('cost_credits', 'Credit Valuation Alias', tscCredits, 'Synchronize Omnicortex credit valuation');
    }
    const existingCosts = typeof formData.costs === 'object' && formData.costs ? formData.costs : {};
    if (Number(existingCosts.credits) !== tscCredits || Number(existingCosts.dc) !== cleanCR) {
      pushDiff(
        'costs',
        'Structured Economatrix Cost Block',
        { ...existingCosts, dc: cleanCR, credits: tscCredits, materials: matCost, ws: cleanCR },
        `Auto-Buy WS ${cleanCR} • Pristine Materials ${matCost.toLocaleString()} Cr (50%)`
      );
    }
  }

  // 2. Metaphysics: Invocations & Special Abilities -> Essence = ceil(CR / 5)
  if (key === 'invocations' || key === 'special_abilities') {
    const castCR = Number(
      computedValues?.finalDC ??
      computedValues?.final_dc ??
      computedValues?.manifestation_dc ??
      formData.manifestation_dc ??
      formData.craft_dc ??
      formData.base_dc ??
      15
    );
    const cleanCR = Math.max(5, Math.round(castCR));
    const essence = computeCanonicalEssenceCost(cleanCR);

    pushDiff('manifestation_dc', 'Manifestation CR', cleanCR, '5-Step Invocation Matrix Target CR');
    pushDiff('focus_cost', 'Essence / Focus Cost', essence, `Canonical Formula: ceil(${cleanCR} / 5) = ${essence}`);
    if (key === 'special_abilities' && !formData.cp) {
      pushDiff('cp', 'Special Ability Base CP', 5, 'Canonical 5 CP Special Ability baseline');
    }
  }

  // 3. Archetypes -> 80 CP Chassis Stamp
  if (key === 'archetypes' && Number(formData.bp_chassis) !== 80) {
    pushDiff('bp_chassis', 'Canonical Archetype Chassis Budget', 80, 'Operator Guide 1.02 strict 80 CP Archetype package');
  }

  // 4. Species -> Synchronize computed Species CP package
  if (key === 'species' && liveBuildCheck && typeof liveBuildCheck.expectedCost === 'number') {
    const currentBp = Number(formData.costs?.bp ?? formData.costs?.cp ?? formData.cp ?? NaN);
    if (currentBp !== liveBuildCheck.expectedCost) {
      pushDiff(
        'costs',
        'Species Dynamic CP Ledger',
        { ...(formData.costs || {}), cp: liveBuildCheck.expectedCost, bp: liveBuildCheck.expectedCost },
        `Synchronize calculated genetics ledger (${liveBuildCheck.expectedCost} CP)`
      );
    }
  }

  return diffs;
}

/**
 * Strictly USER-CUED AI synthesis for the active step.
 * Never called automatically. Returns field-level diff proposals so the user retains 100% control.
 */
export async function requestUserCuedStepSynthesis({
  step,
  playbook,
  formData = {},
  domainKey = 'gear',
  exemplars = [],
  ragCitations = [],
  userCuePrompt = ''
}) {
  const key = normalizeStudioDomainKey(domainKey);
  const targetFields = resolveStepTargetFields(step, key);
  const apiKey = getGeminiApiKey();

  const exemplarContext = exemplars
    .slice(0, 3)
    .map((e) => {
      const it = e.item || e;
      return `- ${it.name || it.title}: ${it.mechanic || it.description || ''}`.slice(0, 240);
    })
    .join('\n');

  const ragText = ragCitations
    .slice(0, 3)
    .map((r) => `- [${r.chunk?.citation || 'Rule'}] ${r.chunk?.title || ''}: ${(r.chunk?.text || '').slice(0, 260)}`)
    .join('\n');

  const systemPrompt = [
    `You are BASTION, the canonical rules & worldbuilding architect for Tangent SFF RPG (2d10 Dual Resolution, 150 CP Operator economy, Economatrix TSC, UDU 10:1 socket hierarchy, Essence = ceil(CR / 5), Penetration, 30 VP / 30 HP bio vs 60 SP synthetic).`,
    `The user explicitly requested assistance on Step ${step?.stepNumber || 1} ("${step?.label || 'Configuration'}") of "${playbook?.title || key}".`,
    `Output ONLY a valid JSON object containing suggested values for these step fields: ${targetFields.join(', ')}.`,
    `Do NOT use LaTeX dollar math ($...$) inside string values. Keep terminology strictly v6 canonical.`
  ].join('\n');

  const userPayload = [
    `DOMAIN: ${key}`,
    `ACTIVE DRAFT SNAPSHOT: ${JSON.stringify({
      name: formData.name,
      category: formData.category || formData.type,
      tech_level: formData.tech_level ?? formData.tl,
      meta_level: formData.meta_level ?? formData.ml,
      discipline: formData.discipline,
      parent_species: formData.parent_species,
      description: formData.description,
      mechanic: formData.mechanic
    })}`,
    exemplarContext ? `COMPARABLE CORTEX EXEMPLARS:\n${exemplarContext}` : '',
    ragText ? `CANONICAL RULES CONTEXT:\n${ragText}` : '',
    userCuePrompt ? `USER SPECIFIC CUE: ${userCuePrompt}` : 'USER CUE: Propose balanced, canonical values for the current step.'
  ]
    .filter(Boolean)
    .join('\n\n');

  let generatedObj = null;

  try {
    const response = await fetchGeminiContent(apiKey, {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPayload }] }],
      generationConfig: {
        temperature: 0.55,
        responseMimeType: 'application/json'
      }
    });

    const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    if (cleaned) {
      generatedObj = sanitizePayloadStrings(JSON.parse(cleaned));
    }
  } catch {
    // Graceful deterministic Cortex-exemplar synthesis fallback when offline or unconfigured
    generatedObj = buildOfflineCuedFallback(targetFields, formData, key, exemplars, userCuePrompt);
  }

  if (!generatedObj || typeof generatedObj !== 'object') {
    generatedObj = buildOfflineCuedFallback(targetFields, formData, key, exemplars, userCuePrompt);
  }

  const diffs = [];
  for (const field of targetFields) {
    const proposed = generatedObj[field];
    if (proposed === undefined || proposed === null || proposed === '') continue;
    if (JSON.stringify(formData[field]) === JSON.stringify(proposed)) continue;
    diffs.push({
      field,
      label: field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      currentValue: formData[field],
      proposedValue: proposed,
      reason: 'BASTION Cortex-grounded step suggestion'
    });
  }

  return diffs;
}

function resolveStepTargetFields(step, key) {
  if (!step) return ['description', 'mechanic'];
  if (step.viewType === 'blueprint_specs') {
    const base = ['name', 'description'];
    if (key === 'species') base.push('title', 'homeworld');
    if (key === 'factions') base.push('faction_type', 'capital_world');
    if (key === 'archetypes') base.push('core_concept', 'sphere');
    return base;
  }
  if (step.viewType === 'final_review') {
    return ['mechanic', 'body', 'note'];
  }
  if (key === 'factions') {
    if (step.configuratorSection === 'operator_package') return ['skill_package', 'recommended_features', 'mechanic'];
    if (step.configuratorSection === 'military_economy') return ['military_doctrine', 'key_units', 'economic_model', 'primary_exports'];
  }
  return ['mechanic', 'description'];
}

function buildOfflineCuedFallback(targetFields, formData, key, exemplars, userCuePrompt) {
  const topEx = exemplars?.[0]?.item || exemplars?.[0] || {};
  const name = formData.name || (userCuePrompt ? userCuePrompt.slice(0, 36) : '') || topEx.name || `Canonical ${key.replace(/_/g, ' ')}`;
  const tl = formData.tech_level ?? formData.tl ?? topEx.tech_level ?? 3;
  const ml = formData.meta_level ?? formData.ml ?? topEx.meta_level ?? 1;

  const out = {};
  for (const f of targetFields) {
    if (f === 'name' && !formData.name) {
      out.name = topEx.name ? `${topEx.name} Mk II` : `${name}`;
    } else if (f === 'description') {
      out.description = `${name} — TL ${tl}${ml > 0 ? ` / ML ${ml}` : ''} canonical ${key.replace(/_/g, ' ')} specification calibrated to Omnicortex benchmarks.`;
    } else if (f === 'mechanic') {
      out.mechanic = topEx.mechanic || `Operates under Tangent 2d10 Dual-Resolution baseline (CR 15 standard unopposed check; TL ${tl} operational profile).`;
    } else if (f === 'body') {
      out.body = `## Overview\n**${name}** occupies a defined niche within TL ${tl} Tangent Space operations.\n\n### Operational Profile\n${formData.description || topEx.description || 'Engineered to meet rigorous field reliability and tactical integration standards.'}`;
    } else if (f === 'note') {
      out.note = `Architect Reference: Benchmarked against ${exemplars.length || 'canonical'} Omnicortex ${key} entries.`;
    } else if (topEx[f] !== undefined) {
      out[f] = topEx[f];
    }
  }
  return out;
}
