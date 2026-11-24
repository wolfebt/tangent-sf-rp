/**
 * @file canonRulesLinterService.ts
 * @description Live Tangent SF RP v6 Canonical Rules Drift Linter for Scenario prose & Element schemas.
 * Detects legacy d20 checks, Action Point terminology, synthetic Structure vs Vitality drift,
 * out-of-bounds TL/ML ratings, creation skill cap violations, and broken [[Wiki Links]].
 */

export type CanonLintSeverity = 'error' | 'warning' | 'info';

export interface CanonLintDiagnostic {
  id: string;
  ruleCode:
    | 'NO_D20_RESOLUTION'
    | 'NO_ACTION_POINTS'
    | 'NO_5E_TERMINOLOGY'
    | 'SYNTHETIC_STRUCTURE_CANON'
    | 'ORGANIC_BASELINE_VITALS'
    | 'TECH_LEVEL_BOUNDS'
    | 'META_LEVEL_BOUNDS'
    | 'SKILL_RANK_CAP'
    | 'UNRESOLVED_WIKI_LINK';
  severity: CanonLintSeverity;
  message: string;
  suggestion: string;
  matchText?: string;
  autoFixReplacement?: string;
}

const SAFE_AP_CONTEXT_RE =
  /\b(?:DR\s*\d+\s*[/|,-]\s*AP\s*\d+|AP\s*\d+|Armor\s+Penetration|Award\s+Points|\d+\s*AP\s+(?:penetration|piercing|ammo|round|rounds|shell|shells|slug|slugs))\b/gi;

function maskSafeApTokens(raw: string): string {
  return raw.replace(SAFE_AP_CONTEXT_RE, (m) => '\u0000'.repeat(m.length));
}

export interface CanonLintInput {
  text?: string;
  element?: Record<string, any> | null;
  knownTitles?: string[];
  isCreationPhase?: boolean;
}

export function lintCanonContent(input: CanonLintInput): CanonLintDiagnostic[] {
  const diagnostics: CanonLintDiagnostic[] = [];
  const rawText = String(input.text || '');
  const plainText = rawText.replace(/<[^>]+>/g, ' ');

  // 1. Legacy d20 references -> 2d10 Dual Resolution
  const d20Match = plainText.match(/\b(?:1d20|d20)\b/i);
  if (d20Match) {
    diagnostics.push({
      id: `lint_d20_${diagnostics.length}`,
      ruleCode: 'NO_D20_RESOLUTION',
      severity: 'error',
      message: `Detected non-canonical dice token "${d20Match[0]}". Tangent v6 strictly uses 2d10 Dual Resolution.`,
      suggestion: 'Replace d20 checks with 2d10 + Modifier vs CR/Defense.',
      matchText: d20Match[0],
      autoFixReplacement: '2d10'
    });
  }

  // 2. Legacy Action Points / AP cost terminology -> Skill Tier Action Economy
  // Ignore Armor Penetration ("DR 6 / AP 4", "AP 4", "Armor Penetration") and "Award Points"
  const maskedForAp = maskSafeApTokens(plainText);
  const apMatch = maskedForAp.match(/\b(\d+\s*AP|Action Points?)\b/i);
  if (apMatch) {
    diagnostics.push({
      id: `lint_ap_${diagnostics.length}`,
      ruleCode: 'NO_ACTION_POINTS',
      severity: 'warning',
      message: `Detected legacy Action Point phrase "${apMatch[0]}". Tangent v6 uses Skill Tier Action Economy.`,
      suggestion: 'Express action budget via Skill Stage (Trained/Veteran/Master Actions).',
      matchText: apMatch[0],
      autoFixReplacement: 'Action Tier'
    });
  }

  // 2b. Non-canonical 5e terminology -> Tangent v6 Skill Actions / Focus
  const dnd5eMatch = plainText.match(/\b(bonus\s+actions?|legendary\s+actions?|proficiency\s+bonus|spell\s+slots?)\b/i);
  if (dnd5eMatch) {
    diagnostics.push({
      id: `lint_5e_${diagnostics.length}`,
      ruleCode: 'NO_5E_TERMINOLOGY',
      severity: 'warning',
      message: `Detected non-Tangent 5e term "${dnd5eMatch[0]}". Tangent v6 uses Skill Actions & Metaphysics Focus.`,
      suggestion: 'Replace 5e mechanics with Tangent v6 Skill Actions or Resonance cost.',
      matchText: dnd5eMatch[0],
      autoFixReplacement: 'Skill Action'
    });
  }

  // 3. Unresolved [[Wiki Links]]
  if (Array.isArray(input.knownTitles) && input.knownTitles.length > 0 && plainText.includes('[[')) {
    const normalizedTitles = new Set(input.knownTitles.map((t) => String(t).trim().toLowerCase()));
    const linkMatches = plainText.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);
    for (const m of linkMatches) {
      const target = String(m[1] || '').trim();
      if (target && !normalizedTitles.has(target.toLowerCase())) {
        diagnostics.push({
          id: `lint_wiki_${target}_${diagnostics.length}`,
          ruleCode: 'UNRESOLVED_WIKI_LINK',
          severity: 'info',
          message: `Unlinked reference [[${target}]] does not match any Element in the active catalog.`,
          suggestion: `Create a Story Element titled "${target}" or fix spelling.`,
          matchText: m[0]
        });
      }
    }
  }

  // 4. Structured Element Mechanical Canon Checks
  const elem = input.element;
  if (elem && typeof elem === 'object') {
    const fields = elem.fields || {};
    const species = String(fields.species || elem.species || '').toLowerCase();
    const isSynthetic = Boolean(
      fields.is_synthetic ||
        elem.is_synthetic ||
        species.includes('synthetic') ||
        species.includes('android') ||
        species.includes('automaton') ||
        species.includes('mecha')
    );

    if (isSynthetic) {
      const structure = Number(fields.structure ?? fields.base_structure ?? elem.base_structure ?? 0);
      const vitality = Number(fields.vitality ?? fields.base_vitality ?? 0);
      if (vitality > 0 || (structure > 0 && structure < 60)) {
        diagnostics.push({
          id: `lint_synth_${diagnostics.length}`,
          ruleCode: 'SYNTHETIC_STRUCTURE_CANON',
          severity: 'warning',
          message: 'Synthetic entities combine Vitality + Health into a 60+ Structure Point (SP) pool with 0 Vitality.',
          suggestion: 'Set Vitality to 0 and baseline Structure to at least 60 SP.'
        });
      }
    } else if (elem.type === 'Persona') {
      const vit = fields.vitality ?? fields.base_vitality;
      const hp = fields.health ?? fields.base_health;
      if ((vit !== undefined && Number(vit) > 0 && Number(vit) < 30) || (hp !== undefined && Number(hp) > 0 && Number(hp) < 30)) {
        diagnostics.push({
          id: `lint_org_${diagnostics.length}`,
          ruleCode: 'ORGANIC_BASELINE_VITALS',
          severity: 'info',
          message: 'Standard Tangent v6 Organic Personas initialize with 30 Vitality / 30 Health (+5 per 1 CP).',
          suggestion: 'Confirm lower pool values are intentional for sub-medium/frail NPCs.'
        });
      }
    }

    const rawTl = fields['tech-level'] ?? fields.tech_level ?? elem.tech_level;
    if (rawTl !== undefined && rawTl !== '') {
      const tlNum = Number(String(rawTl).replace(/[^0-9.-]/g, ''));
      if (Number.isFinite(tlNum) && (tlNum < 0 || tlNum > 5)) {
        diagnostics.push({
          id: `lint_tl_${diagnostics.length}`,
          ruleCode: 'TECH_LEVEL_BOUNDS',
          severity: 'error',
          message: `Tech Level TL-${tlNum} is outside canonical TL 0–5 bounds.`,
          suggestion: 'Clamp Tech Level between TL 0 (Archaic) and TL 5 (Theoretical).'
        });
      }
    }

    const rawMl = fields['meta-level'] ?? fields.meta_level ?? elem.meta_level;
    if (rawMl !== undefined && rawMl !== '') {
      const mlNum = Number(String(rawMl).replace(/[^0-9.-]/g, ''));
      if (Number.isFinite(mlNum) && (mlNum < 0 || mlNum > 5)) {
        diagnostics.push({
          id: `lint_ml_${diagnostics.length}`,
          ruleCode: 'META_LEVEL_BOUNDS',
          severity: 'error',
          message: `Meta Level ML-${mlNum} is outside canonical ML 0–5 bounds.`,
          suggestion: 'Clamp Meta Level between ML 0 (Null) and ML 5 (Ascendant).'
        });
      }
    }

    const skills = (fields.skills || elem.skills || {}) as Record<string, any>;
    const maxAllowedRank = input.isCreationPhase ? 11 : 30;
    for (const [skillName, rawVal] of Object.entries(skills)) {
      const rank = Number(rawVal);
      if (Number.isFinite(rank) && rank > maxAllowedRank) {
        diagnostics.push({
          id: `lint_skill_${skillName}_${diagnostics.length}`,
          ruleCode: 'SKILL_RANK_CAP',
          severity: 'warning',
          message: `Skill "${skillName}" rank ${rank} exceeds ${input.isCreationPhase ? 'creation cap (11)' : 'maximum cap (30)'}.`,
          suggestion: `Reduce "${skillName}" rank to <= ${maxAllowedRank}.`
        });
      }
    }
  }

  return diagnostics;
}

export function applyAutoFix(text: string, diagnostic: CanonLintDiagnostic): string {
  if (!diagnostic.autoFixReplacement) return text;
  if (diagnostic.ruleCode === 'NO_D20_RESOLUTION') {
    return String(text || '').replace(/\b(?:1d20|d20)\b/gi, diagnostic.autoFixReplacement);
  }
  if (diagnostic.ruleCode === 'NO_ACTION_POINTS') {
    const src = String(text || '');
    const masked = maskSafeApTokens(src);
    let out = '';
    let last = 0;
    for (const m of masked.matchAll(/\b(\d+\s*AP|Action Points?)\b/gi)) {
      const idx = m.index ?? 0;
      out += src.slice(last, idx) + diagnostic.autoFixReplacement;
      last = idx + m[0].length;
    }
    return out + src.slice(last);
  }
  if (diagnostic.ruleCode === 'NO_5E_TERMINOLOGY') {
    return String(text || '').replace(
      /\b(bonus\s+actions?|legendary\s+actions?|proficiency\s+bonus|spell\s+slots?)\b/gi,
      diagnostic.autoFixReplacement
    );
  }
  return text;
}
