/**
 * @file lorebookScanner.ts
 * @description Dynamic Recursive Lorebook Architecture & Scanning Engine for Tangent ADE.
 * Grounded in Phase 1 Architectural Specs:
 * - Upgraded AIME schemas with primary and secondary trigger keys.
 * - Regex matching with character codes (e.g. /\\b(AET-[0-9]{2,4}|aethelgard)\\b/i).
 * - Constrained recursive associative scanning (strictly capped at 1 to 3 passes).
 * - Story Flag Ledger condition evaluation for dynamic lore suppression / requirements.
 * - Deterministic token budget allocation with configurable default of 1,200 tokens.
 */

import { evaluateConditionExpression } from '../pages/Foundry/store/adeStore.ts';
import type { LoreTriggerLogic } from '../types/ade.ts';

export interface InjectedLoreEntry {
  id: string;
  title: string;
  type: string;
  passMatched: number;
  triggerMatched: string;
  priority: number;
  allocatedTokens: number;
  snippet: string;
  rawElement: any;
}

export interface LorebookScanOptions {
  input?: string;
  activeScenario?: any;
  catalog?: any[];
  storyFlags?: Record<string, any>;
  userHandle?: string;
  targetCharName?: string;
  config?: {
    maxTokens?: number;
    maxRecursionPasses?: number;
    enableRecursiveScanning?: boolean;
    enablePrefixCaching?: boolean;
  };
}

export interface LorebookScanResult {
  injectedEntries: InjectedLoreEntry[];
  formattedPromptContext: string;
  tokensUsed: number;
  tokenBudget: number;
  passesExecuted: number;
  candidateCount: number;
  suppressedCount: number;
  unmatchedCount: number;
}

/**
 * Heuristic token estimation: ~4 characters per token for English text.
 */
export function estimateTokenCount(text: string = ''): number {
  if (!text) return 0;
  return Math.ceil(text.trim().length / 4);
}

/**
 * Normalizes comma-separated string or array of trigger phrases into a trimmed string array.
 */
export function normalizeTriggers(raw: string[] | string | undefined | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(t => String(t || '').trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Safely compiles a string representation of a regular expression or regex literal.
 * Supports /pattern/flags format as well as raw patterns.
 * Supports speaker code expansion: {{user}} and {{char}}, ASCII \x01 delimiters,
 * and tagged speaker brackets like [User: {{user}}] or [NPC: {{char}}].
 */
export function compileTriggerRegex(
  patternStr: string = '',
  userHandle: string = 'Operative',
  charName: string = 'NPC'
): RegExp | null {
  if (!patternStr || typeof patternStr !== 'string') return null;
  let trimmed = patternStr.trim();
  if (!trimmed) return null;

  try {
    const escapedUser = (userHandle || 'Operative').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedChar = (charName || 'NPC').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Replace {{user}} and {{char}} placeholders
    trimmed = trimmed
      .replace(/\{\{user\}\}/gi, escapedUser)
      .replace(/\{\{char\}\}/gi, escapedChar);

    if (trimmed.startsWith('/') && trimmed.lastIndexOf('/') > 0) {
      const lastSlash = trimmed.lastIndexOf('/');
      const body = trimmed.slice(1, lastSlash);
      const flags = trimmed.slice(lastSlash + 1) || 'i';
      return new RegExp(body, flags);
    }
    return new RegExp(trimmed, 'i');
  } catch (err) {
    console.warn(`[LorebookScanner] Invalid regex pattern "${trimmed}":`, err);
    return null;
  }
}

/**
 * Strips HTML formatting and normalizes whitespace.
 */
function sanitizeText(str: string = ''): string {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Returns all matching keywords from a trigger list found within the scanned text.
 */
export function testKeywordList(keywords: string[] = [], textToScan: string = ''): string[] {
  if (!keywords || keywords.length === 0 || !textToScan) return [];
  const matches: string[] = [];

  for (const trig of keywords) {
    if (!trig) continue;
    const escaped = trig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(textToScan)) {
      matches.push(trig);
    }
  }
  return matches;
}

/**
 * Evaluates selective boolean logic (OR, AND_ANY, AND_ALL, NOT_ANY, NOT_ALL).
 */
export function evaluateSelectiveBooleanLogic({
  triggerLogic = 'OR',
  primaryMatches = [],
  primaryTotal = 0,
  secondaryMatches = [],
  secondaryTotal = 0,
  regexMatched = false,
  regexPattern = ''
}: {
  triggerLogic?: LoreTriggerLogic;
  primaryMatches?: string[];
  primaryTotal?: number;
  secondaryMatches?: string[];
  secondaryTotal?: number;
  regexMatched?: boolean;
  regexPattern?: string;
}): { isMatch: boolean; triggerLabel: string } {
  const hasPrimary = primaryMatches.length > 0 || regexMatched;
  const primaryLabel = regexMatched 
    ? `Regex: ${regexPattern}` 
    : (primaryMatches.length > 0 ? `Key: "${primaryMatches[0]}"` : '');

  switch (triggerLogic) {
    case 'AND_ANY': {
      // Must match at least one primary/regex AND at least one secondary trigger
      if (hasPrimary && secondaryMatches.length > 0) {
        return {
          isMatch: true,
          triggerLabel: `${primaryLabel} + Secondary: "${secondaryMatches[0]}" (AND ANY)`
        };
      }
      return { isMatch: false, triggerLabel: '' };
    }

    case 'AND_ALL': {
      // Must match all primary triggers (or regex)
      if (regexMatched || (primaryTotal > 0 && primaryMatches.length === primaryTotal)) {
        return {
          isMatch: true,
          triggerLabel: `${primaryLabel} (AND ALL ${primaryTotal} keys)`
        };
      }
      return { isMatch: false, triggerLabel: '' };
    }

    case 'NOT_ANY': {
      // Must match primary/regex AND none of the secondary exclusion triggers
      if (hasPrimary && secondaryMatches.length === 0) {
        return {
          isMatch: true,
          triggerLabel: `${primaryLabel} (NOT ANY secondary exclusion)`
        };
      }
      return { isMatch: false, triggerLabel: '' };
    }

    case 'NOT_ALL': {
      // Must match primary/regex AND NOT ALL secondary triggers are present
      if (hasPrimary && (secondaryTotal === 0 || secondaryMatches.length < secondaryTotal)) {
        return {
          isMatch: true,
          triggerLabel: `${primaryLabel} (NOT ALL secondary)`
        };
      }
      return { isMatch: false, triggerLabel: '' };
    }

    case 'OR':
    default: {
      if (hasPrimary) {
        return { isMatch: true, triggerLabel: primaryLabel };
      }
      if (secondaryMatches.length > 0) {
        return { isMatch: true, triggerLabel: `Secondary: "${secondaryMatches[0]}"` };
      }
      return { isMatch: false, triggerLabel: '' };
    }
  }
}

/**
 * Checks whether an element's comma-separated trigger list matches the given text (backward-compatibility).
 */
export function testKeywordTriggers(triggerListStr: string = '', textToScan: string = ''): string | null {
  const list = normalizeTriggers(triggerListStr);
  const matches = testKeywordList(list, textToScan);
  return matches.length > 0 ? matches[0] : null;
}


/**
 * Extracts a concise, high-density lore snippet from an element based on its type and fields.
 */
export function extractLoreSnippet(elem: any, maxTokens: number = 250): { snippet: string; tokens: number } {
  const fields = elem.fields || {};
  const parts: string[] = [];

  // Canonical high-concept traits
  if (fields.oneLinePitch) parts.push(`Concept: "${fields.oneLinePitch}"`);
  if (fields.corePremise) parts.push(`Premise: ${fields.corePremise}`);
  if (fields.archetype) parts.push(`Archetype: ${fields.archetype}`);
  if (fields.techLevel) parts.push(`Tech Level: ${fields.techLevel}`);
  if (fields.functionPurpose) parts.push(`Function: ${fields.functionPurpose}`);
  if (fields.coreTenets) parts.push(`Tenets: ${fields.coreTenets}`);
  if (fields.sensoryDetails) parts.push(`Sensory: ${fields.sensoryDetails}`);
  if (fields.strengthsFlaws) parts.push(`Dynamics: ${fields.strengthsFlaws}`);
  if (fields.historyTimeline) parts.push(`Lore: ${fields.historyTimeline.slice(0, 180)}`);
  if (fields.category) parts.push(`Category: ${fields.category}`);
  if (fields.summary) parts.push(`Summary: ${fields.summary}`);
  if (fields.description) parts.push(`Details: ${sanitizeText(fields.description).slice(0, 200)}`);
  if (fields.tags) parts.push(`Tags: ${fields.tags}`);

  // Dynamic user-defined custom fields from EditElementModal
  if (Array.isArray(elem.customFields) && elem.customFields.length > 0) {
    const customSummary = elem.customFields
      .filter((cf: any) => cf && cf.label && cf.value)
      .map((cf: any) => `${cf.label}: ${cf.value}`)
      .slice(0, 3)
      .join(', ');
    if (customSummary) parts.push(`User Fields: [${customSummary}]`);
  }

  let text = parts.join(' | ');

  if (!text) {
    const rawContent = sanitizeText(elem.content || elem.description || '');
    text = rawContent.slice(0, maxTokens * 4);
  }

  // Token cap
  const estimated = estimateTokenCount(text);
  if (estimated > maxTokens) {
    text = text.slice(0, maxTokens * 4) + '...';
  }

  return {
    snippet: text,
    tokens: estimateTokenCount(text)
  };
}

/**
 * Helper to match an eligible candidate against arbitrary text using selective boolean logic.
 */
function matchCandidateAgainstText(
  candidate: {
    elem: any;
    primaryTriggers: string[];
    secondaryTriggers: string[];
    triggerLogic: LoreTriggerLogic;
    regexPattern: string;
    compiledRegex: RegExp | null;
  },
  textToScan: string
): string | null {
  const { elem, primaryTriggers, secondaryTriggers, triggerLogic, regexPattern, compiledRegex } = candidate;

  // 1. Test regex
  let regexMatched = false;
  if (compiledRegex && compiledRegex.test(textToScan)) {
    regexMatched = true;
  }

  // 2. Test keyword lists
  const primaryMatches = testKeywordList(primaryTriggers, textToScan);
  const secondaryMatches = testKeywordList(secondaryTriggers, textToScan);

  // 3. Evaluate selective boolean logic
  const evalResult = evaluateSelectiveBooleanLogic({
    triggerLogic,
    primaryMatches,
    primaryTotal: primaryTriggers.length,
    secondaryMatches,
    secondaryTotal: secondaryTriggers.length,
    regexMatched,
    regexPattern: compiledRegex ? compiledRegex.source : regexPattern
  });

  if (evalResult.isMatch) {
    return evalResult.triggerLabel;
  }

  // 4. Exact Title / Designation Match (default primary match under OR logic)
  if (triggerLogic === 'OR' && elem.title && elem.title.length >= 3) {
    const titleRegex = new RegExp(`\\b${elem.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (titleRegex.test(textToScan)) {
      return `Title: "${elem.title}"`;
    }
  }

  return null;
}

/**
 * Master Recursive Lorebook Scanner.
 * Performs Pass 1 (Surface scan), Pass 2 (Associative scan), and Pass 3 (Deep-link scan),
 * filtered by Story Flag conditions and bounded by a strict configurable token ceiling.
 */
export function scanDynamicLorebook({
  input = '',
  activeScenario = null,
  catalog = [],
  storyFlags = {},
  userHandle = 'Operative',
  targetCharName = '',
  config = {}
}: LorebookScanOptions): LorebookScanResult {
  const maxTokens = typeof config.maxTokens === 'number' && config.maxTokens > 0 
    ? config.maxTokens 
    : 1200; // Canonical 1200 default as specified by user
  
  const rawPasses = typeof config.maxRecursionPasses === 'number' ? config.maxRecursionPasses : 3;
  const maxRecursionPasses = Math.max(1, Math.min(3, rawPasses)); // Strictly capped at 1 to 3 passes
  const enableRecursiveScanning = config.enableRecursiveScanning !== false;

  const validCatalog = Array.isArray(catalog) ? catalog : [];
  let candidateCount = 0;
  let suppressedCount = 0;

  const resolvedCharName = targetCharName || activeScenario?.title || 'NPC';

  // Step 1: Pre-filter candidate catalog through Story Flag Ledger conditions
  const eligibleElements: Array<{
    elem: any;
    primaryTriggers: string[];
    secondaryTriggers: string[];
    triggerLogic: LoreTriggerLogic;
    regexPattern: string;
    compiledRegex: RegExp | null;
    priority: number;
    budgetTokens: number;
  }> = [];

  for (const elem of validCatalog) {
    if (!elem || !elem.id) continue;
    candidateCount++;

    const fields = elem.fields || {};
    const lorebook = elem.lorebook || {};

    // Check requirement condition (must be true)
    const reqCond = lorebook.requireCondition || fields.loreRequireCondition;
    if (reqCond && !evaluateConditionExpression(reqCond, storyFlags)) {
      suppressedCount++;
      continue;
    }

    // Check suppression condition (must NOT be true)
    const supCond = lorebook.suppressCondition || fields.loreSuppressCondition;
    if (supCond && evaluateConditionExpression(supCond, storyFlags)) {
      suppressedCount++;
      continue;
    }

    // Parse triggers and metadata from lorebook config or fields fallback
    const primaryTriggers = normalizeTriggers(lorebook.primaryTriggers || fields.primaryTriggers);
    const secondaryTriggers = normalizeTriggers(lorebook.secondaryTriggers || fields.secondaryTriggers);
    const triggerLogic: LoreTriggerLogic = lorebook.triggerLogic || fields.triggerLogic || 'OR';
    const regexPattern = lorebook.triggerRegex || fields.triggerRegex || '';
    const compiledRegex = compileTriggerRegex(regexPattern, userHandle, resolvedCharName);
    const priority = Number(lorebook.priority ?? fields.loreScanPriority) || 50;
    const budgetTokens = Number(lorebook.budgetTokens ?? fields.loreBudgetTokens) || 250;

    eligibleElements.push({
      elem,
      primaryTriggers,
      secondaryTriggers,
      triggerLogic,
      regexPattern,
      compiledRegex,
      priority,
      budgetTokens
    });
  }

  const matchedSet = new Map<string, InjectedLoreEntry>();
  let passesExecuted = 0;

  // ── PASS 1: SURFACE SCAN (User Input + Active Scenario) ──
  passesExecuted = 1;
  const scenarioSurface = [
    activeScenario?.title,
    activeScenario?.fields?.readAloud,
    activeScenario?.content ? sanitizeText(activeScenario.content).slice(0, 500) : ''
  ].filter(Boolean).join(' ');

  const surfaceScanText = `${input} ${scenarioSurface}`.trim();

  const remainingCandidates: typeof eligibleElements = [];

  for (const candidate of eligibleElements) {
    const matchedTrigger = matchCandidateAgainstText(candidate, surfaceScanText);

    if (matchedTrigger) {
      const { snippet, tokens } = extractLoreSnippet(candidate.elem, candidate.budgetTokens);
      matchedSet.set(candidate.elem.id, {
        id: candidate.elem.id,
        title: candidate.elem.title || 'Untitled Element',
        type: candidate.elem.type || 'Lore',
        passMatched: 1,
        triggerMatched: matchedTrigger,
        priority: candidate.priority,
        allocatedTokens: tokens,
        snippet,
        rawElement: candidate.elem
      });
    } else {
      remainingCandidates.push(candidate);
    }
  }

  // ── PASS 2: RECURSIVE ASSOCIATIVE SCAN ──
  if (enableRecursiveScanning && maxRecursionPasses >= 2 && remainingCandidates.length > 0 && matchedSet.size > 0) {
    passesExecuted = 2;
    // Aggregate text generated from Pass 1 matches
    const pass1Text = Array.from(matchedSet.values())
      .map(entry => `${entry.title} ${entry.snippet}`)
      .join(' ');

    const candidatesForPass3: typeof eligibleElements = [];

    for (const candidate of remainingCandidates) {
      const matchedTrigger = matchCandidateAgainstText(candidate, pass1Text);

      if (matchedTrigger) {
        const { snippet, tokens } = extractLoreSnippet(candidate.elem, candidate.budgetTokens);
        matchedSet.set(candidate.elem.id, {
          id: candidate.elem.id,
          title: candidate.elem.title || 'Untitled Element',
          type: candidate.elem.type || 'Lore',
          passMatched: 2,
          triggerMatched: `Associative: ${matchedTrigger}`,
          priority: candidate.priority,
          allocatedTokens: tokens,
          snippet,
          rawElement: candidate.elem
        });
      } else {
        candidatesForPass3.push(candidate);
      }
    }

    // ── PASS 3: DEEP-LINK ASSOCIATIVE SCAN (Strictly Capped at 3 Passes) ──
    if (maxRecursionPasses >= 3 && candidatesForPass3.length > 0) {
      passesExecuted = 3;
      const pass2Text = Array.from(matchedSet.values())
        .filter(entry => entry.passMatched === 2)
        .map(entry => `${entry.title} ${entry.snippet}`)
        .join(' ');

      if (pass2Text.trim()) {
        for (const candidate of candidatesForPass3) {
          const matchedTrigger = matchCandidateAgainstText(candidate, pass2Text);

          if (matchedTrigger) {
            const { snippet, tokens } = extractLoreSnippet(candidate.elem, candidate.budgetTokens);
            matchedSet.set(candidate.elem.id, {
              id: candidate.elem.id,
              title: candidate.elem.title || 'Untitled Element',
              type: candidate.elem.type || 'Lore',
              passMatched: 3,
              triggerMatched: `Deep-Link: ${matchedTrigger}`,
              priority: candidate.priority,
              allocatedTokens: tokens,
              snippet,
              rawElement: candidate.elem
            });
          }
        }
      }
    }
  }

  // ── TOKEN BUDGETING & PRIORITY SELECTION ──
  // Sort candidates by priority descending; if equal, earlier scan pass wins
  const sortedMatches = Array.from(matchedSet.values()).sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.passMatched - b.passMatched;
  });

  const injectedEntries: InjectedLoreEntry[] = [];
  let accumulatedTokens = 0;

  for (const entry of sortedMatches) {
    if (accumulatedTokens + entry.allocatedTokens <= maxTokens) {
      injectedEntries.push(entry);
      accumulatedTokens += entry.allocatedTokens;
    } else {
      // Partial fitting if at least 40 tokens headroom remain
      const remainingTokens = maxTokens - accumulatedTokens;
      if (remainingTokens >= 40) {
        const truncatedSnippet = entry.snippet.slice(0, remainingTokens * 4) + '...';
        injectedEntries.push({
          ...entry,
          snippet: truncatedSnippet,
          allocatedTokens: remainingTokens
        });
        accumulatedTokens += remainingTokens;
      }
      break; // Token ceiling reached
    }
  }

  // ── FORMAT PROMPT CONTEXT BLOCK ──
  let formattedPromptContext = '';
  if (injectedEntries.length > 0) {
    const lines = [
      `[DYNAMIC RECURSIVE LOREBOOK CONTEXT — ${injectedEntries.length} Injections, ${accumulatedTokens}/${maxTokens} Tokens, ${passesExecuted} Passes]:`
    ];

    for (const item of injectedEntries) {
      lines.push(`• [${item.type}] "${item.title}" (Matched via ${item.triggerMatched}, Pass ${item.passMatched}, Pri ${item.priority}):`);
      lines.push(`  ${item.snippet}`);
    }

    formattedPromptContext = lines.join('\n');
  }

  return {
    injectedEntries,
    formattedPromptContext,
    tokensUsed: accumulatedTokens,
    tokenBudget: maxTokens,
    passesExecuted,
    candidateCount,
    suppressedCount,
    unmatchedCount: candidateCount - injectedEntries.length - suppressedCount
  };
}
