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
 * Safely compiles a string representation of a regular expression or regex literal.
 * Supports /pattern/flags format as well as raw patterns.
 */
export function compileTriggerRegex(patternStr: string = ''): RegExp | null {
  if (!patternStr || typeof patternStr !== 'string') return null;
  const trimmed = patternStr.trim();
  if (!trimmed) return null;

  try {
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
 * Checks whether an element's comma-separated trigger list matches the given text.
 */
function testKeywordTriggers(triggerListStr: string = '', textToScan: string): string | null {
  if (!triggerListStr || !textToScan) return null;
  const triggers = triggerListStr
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  for (const trig of triggers) {
    // Word boundary check (case-insensitive)
    const escaped = trig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(textToScan)) {
      return trig;
    }
  }
  return null;
}

/**
 * Extracts a concise, high-density lore snippet from an element based on its type and fields.
 */
function extractLoreSnippet(elem: any, maxTokens: number = 250): { snippet: string; tokens: number } {
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
 * Master Recursive Lorebook Scanner.
 * Performs Pass 1 (Surface scan), Pass 2 (Associative scan), and Pass 3 (Deep-link scan),
 * filtered by Story Flag conditions and bounded by a strict configurable token ceiling.
 */
export function scanDynamicLorebook({
  input = '',
  activeScenario = null,
  catalog = [],
  storyFlags = {},
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

  // Step 1: Pre-filter candidate catalog through Story Flag Ledger conditions
  const eligibleElements: Array<{
    elem: any;
    primaryTriggers: string;
    secondaryTriggers: string;
    compiledRegex: RegExp | null;
    priority: number;
    budgetTokens: number;
  }> = [];

  for (const elem of validCatalog) {
    if (!elem || !elem.id) continue;
    candidateCount++;

    const fields = elem.fields || {};

    // Check requirement condition (must be true)
    const reqCond = fields.loreRequireCondition;
    if (reqCond && !evaluateConditionExpression(reqCond, storyFlags)) {
      suppressedCount++;
      continue;
    }

    // Check suppression condition (must NOT be true)
    const supCond = fields.loreSuppressCondition;
    if (supCond && evaluateConditionExpression(supCond, storyFlags)) {
      suppressedCount++;
      continue;
    }

    // Parse triggers and metadata
    const primaryTriggers = fields.primaryTriggers || '';
    const secondaryTriggers = fields.secondaryTriggers || '';
    const compiledRegex = compileTriggerRegex(fields.triggerRegex);
    const priority = Number(fields.loreScanPriority) || 50;
    const budgetTokens = Number(fields.loreBudgetTokens) || 250;

    eligibleElements.push({
      elem,
      primaryTriggers,
      secondaryTriggers,
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
    const { elem, primaryTriggers, compiledRegex, priority, budgetTokens } = candidate;

    let matchedTrigger: string | null = null;

    // 1. Regex Match (Character codes, formal designations)
    if (compiledRegex && compiledRegex.test(surfaceScanText)) {
      matchedTrigger = `Regex: ${compiledRegex.source}`;
    }

    // 2. Primary Trigger Keywords
    if (!matchedTrigger && primaryTriggers) {
      const trig = testKeywordTriggers(primaryTriggers, surfaceScanText);
      if (trig) matchedTrigger = `Key: "${trig}"`;
    }

    // 3. Exact Title / Designation Match
    if (!matchedTrigger && elem.title && elem.title.length >= 3) {
      const titleRegex = new RegExp(`\\b${elem.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (titleRegex.test(surfaceScanText)) {
        matchedTrigger = `Title: "${elem.title}"`;
      }
    }

    if (matchedTrigger) {
      const { snippet, tokens } = extractLoreSnippet(elem, budgetTokens);
      matchedSet.set(elem.id, {
        id: elem.id,
        title: elem.title || 'Untitled Element',
        type: elem.type || 'Lore',
        passMatched: 1,
        triggerMatched: matchedTrigger,
        priority,
        allocatedTokens: tokens,
        snippet,
        rawElement: elem
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
      const { elem, primaryTriggers, secondaryTriggers, compiledRegex, priority, budgetTokens } = candidate;
      let matchedTrigger: string | null = null;

      // Check secondary triggers in Pass 1 text
      if (secondaryTriggers) {
        const trig = testKeywordTriggers(secondaryTriggers, pass1Text);
        if (trig) matchedTrigger = `Secondary: "${trig}"`;
      }

      // Also check primary triggers in Pass 1 text (associative chain)
      if (!matchedTrigger && primaryTriggers) {
        const trig = testKeywordTriggers(primaryTriggers, pass1Text);
        if (trig) matchedTrigger = `Associative Key: "${trig}"`;
      }

      // Check regex in Pass 1 text
      if (!matchedTrigger && compiledRegex && compiledRegex.test(pass1Text)) {
        matchedTrigger = `Regex (P2): ${compiledRegex.source}`;
      }

      if (matchedTrigger) {
        const { snippet, tokens } = extractLoreSnippet(elem, budgetTokens);
        matchedSet.set(elem.id, {
          id: elem.id,
          title: elem.title || 'Untitled Element',
          type: elem.type || 'Lore',
          passMatched: 2,
          triggerMatched: matchedTrigger,
          priority,
          allocatedTokens: tokens,
          snippet,
          rawElement: elem
        });
      } else {
        candidatesForPass3.push(candidate);
      }
    }

    // ── PASS 3: DEEP-LINK ASSOCIATIVE SCAN (Strictly Capped) ──
    if (maxRecursionPasses >= 3 && candidatesForPass3.length > 0) {
      passesExecuted = 3;
      const pass2Text = Array.from(matchedSet.values())
        .filter(entry => entry.passMatched === 2)
        .map(entry => `${entry.title} ${entry.snippet}`)
        .join(' ');

      if (pass2Text.trim()) {
        for (const candidate of candidatesForPass3) {
          const { elem, primaryTriggers, secondaryTriggers, compiledRegex, priority, budgetTokens } = candidate;
          let matchedTrigger: string | null = null;

          if (secondaryTriggers) {
            const trig = testKeywordTriggers(secondaryTriggers, pass2Text);
            if (trig) matchedTrigger = `Deep Secondary: "${trig}"`;
          }

          if (!matchedTrigger && primaryTriggers) {
            const trig = testKeywordTriggers(primaryTriggers, pass2Text);
            if (trig) matchedTrigger = `Deep Key: "${trig}"`;
          }

          if (!matchedTrigger && compiledRegex && compiledRegex.test(pass2Text)) {
            matchedTrigger = `Regex (P3): ${compiledRegex.source}`;
          }

          if (matchedTrigger) {
            const { snippet, tokens } = extractLoreSnippet(elem, budgetTokens);
            matchedSet.set(elem.id, {
              id: elem.id,
              title: elem.title || 'Untitled Element',
              type: elem.type || 'Lore',
              passMatched: 3,
              triggerMatched: matchedTrigger,
              priority,
              allocatedTokens: tokens,
              snippet,
              rawElement: elem
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
