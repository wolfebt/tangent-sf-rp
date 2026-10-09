/**
 * @file superPromptSynthesizer.js
 * @description Super-Prompt Synthesis Engine for AIME ("The Art of AI Crafting" - Phase 3).
 * Synthesizes Layer 1 (Guidance), Layer 2 (Traits), and Layer 3 (Asset Hub) into an execution
 * super-prompt weighted by importance rankings and enriched with directorial annotations.
 */

import { formatAimeGuidanceDirective, formatGemsPrompt } from '../pages/Foundry/StoryModule/guidanceGemsConfig.js';
import { normalizeLinkedAssets } from '../pages/Foundry/ElementForge/components/assetHubUtils.js';
import { scanDynamicLorebook } from './lorebookScanner.ts';

/**
 * Builds the static, immutable KV prefix containing foundational BASTION rules,
 * universe constants, and active Folio base stats for prefix caching.
 */
export function buildStaticRulesPrefix({ campaignName = '', folioCharacter = null } = {}) {
  const prefixParts = [
    '=== [BASTION CANONICAL STATIC RULES PREFIX — OMNICORTEX ATTUNED] ===',
    'Foundational Mechanics & Universal Constants:',
    '• Dual Resolution: Checks resolve via 2d10 + Attribute Mod + Skill Rank vs. TN (Target Number = 11 + Defense). Critical success on double 10s (natural 20), fumble on double 1s (natural 2). Margin of success (+5 Superior, +10 Masterful) dictates tactical advantage.',
    '• Called Shots & 33.3% Trauma: Anatomy targeting (-2 Head, -2 Arms, -1 Legs, -3 Optics). Major Wound Trauma triggers at >= 33.3% Target Max HP in a single strike, inflicting anatomical impairment.',
    '• Tech Levels (TL 0–5): TL-0 Primitive/Archaic, TL-1 Industrial, TL-2 Advanced Electronic, TL-3 Interstellar/Cybernetic (Galactic baseline), TL-4 Nanotech/Hard-Light, TL-5 Progenitor/Precursor.',
    '• Economatrix Unified Cost: Cost = Base * (2^TL) * (1.5^ML).',
    '• Tactical Stances: Guard (+2 Armor DR), Aim (+2 To-Hit), Overcharge (+6 DMG / +2 Heat/Fatigue).'
  ];

  if (campaignName) {
    prefixParts.push(`Campaign Universe Constants: "${campaignName}"`);
  }

  if (folioCharacter) {
    prefixParts.push(`Active Persona Folio Baseline: ${folioCharacter.name || 'Persona'} (${folioCharacter.species || 'Species'} ${folioCharacter.archetype || 'Archetype'}) | Attributes: Might=${folioCharacter.attributes?.might ?? 0}, Reflex=${folioCharacter.attributes?.reflex ?? 0}, Logic=${folioCharacter.attributes?.logic ?? 0}, Fortitude=${folioCharacter.attributes?.fortitude ?? 0}, Will=${folioCharacter.attributes?.will ?? 0}, Etiquette=${folioCharacter.attributes?.etiquette ?? 0}`);
  }

  return prefixParts.join('\n');
}

/**
 * Strips HTML tags and normalizes whitespace for clean LLM prompt tokens.
 */
function cleanText(str = '') {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extracts and formats the primary traits of an asset based on its type.
 */
function formatAssetSummary(asset, catalogItem) {
  if (!catalogItem) return cleanText(asset.content || asset.description || '');

  const fields = catalogItem.fields || {};
  const parts = [];

  if (fields.oneLinePitch) parts.push(`Pitch: "${fields.oneLinePitch}"`);
  if (fields.archetype) parts.push(`Archetype: ${fields.archetype}`);
  if (fields.functionPurpose) parts.push(`Function: ${fields.functionPurpose}`);
  if (fields.corePremise) parts.push(`Premise: ${fields.corePremise}`);
  if (fields.coreTenets) parts.push(`Core Tenet: ${fields.coreTenets}`);
  if (fields.physicalDescription) parts.push(`Physical: ${fields.physicalDescription}`);
  if (fields.goalsMotivations) parts.push(`Motivations: ${fields.goalsMotivations}`);
  if (fields.strengthsFlaws) parts.push(`Flaws & Virtues: ${fields.strengthsFlaws}`);

  if (parts.length > 0) {
    return parts.join(' | ');
  }

  const raw = cleanText(catalogItem.content || catalogItem.description || '');
  return raw ? raw.slice(0, 300) : 'Contextual reference entity.';
}

/**
 * Master Super-Prompt Synthesis function.
 * 
 * @param {Object} params
 * @param {Object} params.activeNode - The active element or scenario being generated
 * @param {Object|Array} [params.guidance] - Layer 1 Guidance Gems selection
 * @param {Array} [params.assetHub] - Layer 3 linked assets with importance & annotations
 * @param {Array} [params.catalog] - Entire project/universe elements catalog
 * @param {string} [params.taskPrompt] - Specific generation request or instruction
 * @param {string} [params.campaignName] - Current campaign or project title
 * @param {Object} [params.cronicle] - Living memory state if available
 * @returns {string} The fully synthesized AIME Super-Prompt
 */
export function synthesizeSuperPrompt({
  activeNode = null,
  guidance = null,
  assetHub = null,
  catalog = [],
  taskPrompt = '',
  campaignName = '',
  cronicle = null,
  storyFlags = null,
  lorebookConfig = null,
  folioCharacter = null,
  returnPrefixStructure = false
}) {
  const sections = [];

  sections.push('=== [AIME DIRECTORIAL SUPER-PROMPT — THE ART OF AI CRAFTING] ===');

  if (campaignName) {
    sections.push(`Universe / Campaign: "${campaignName}"`);
  }

  // ── LAYER 1: GUIDANCE (THE 'HOW') ──
  const activeGuidance = guidance || activeNode?.guidance || {};
  const guidanceDirective = formatAimeGuidanceDirective(activeGuidance);
  const fallbackGems = formatGemsPrompt(activeGuidance);

  sections.push('\n[LAYER 1: DIRECTORIAL GUIDANCE — THE STYLISTIC LENS]');
  if (guidanceDirective) {
    sections.push('Directorial Parameters:');
    sections.push(guidanceDirective);
    sections.push('Directorial Mandate: Write through this exact stylistic lens. Filter all character interiority, sensory descriptions, pacing, and tone according to these parameters.');
  } else if (fallbackGems && fallbackGems !== 'Standard Tangent Science Fantasy') {
    sections.push(`Active Tone & Guidance Gems: ${fallbackGems}`);
  } else {
    sections.push('Standard Directorial Tone: Evocative, immersive science fantasy with tactical grit and character interiority.');
  }

  // ── LAYER 2: TRAITS (THE 'WHAT' — OBJECTIVE REALITY) ──
  if (activeNode) {
    sections.push(`\n[LAYER 2: SUBJECT TRAITS — OBJECTIVE REALITY]`);
    sections.push(`Subject: [${activeNode.type || 'Element'}] "${activeNode.title || 'Untitled'}"`);

    if (activeNode.fields && Object.keys(activeNode.fields).length > 0) {
      sections.push('Factual Subject Attributes (Single Source of Truth):');
      for (const [key, val] of Object.entries(activeNode.fields)) {
        if (!val || typeof val === 'object') continue;
        const strVal = String(val).trim();
        if (strVal && strVal.length > 0) {
          // Format camelCase key into readable label
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
          sections.push(`  • ${label}: ${strVal}`);
        }
      }
    }

    if (activeNode.content) {
      const cleanContent = cleanText(activeNode.content);
      if (cleanContent) {
        sections.push(`Existing Narrative Grounding: ${cleanContent.slice(0, 600)}`);
      }
    }
  }

  // ── LAYER 3: ASSET HUB (THE 'WHO / WHAT ELSE' — CONTEXTUAL WEB) ──
  const rawHub = assetHub || activeNode?.assetHub || activeNode?.linkedElements || [];
  const normalizedHub = normalizeLinkedAssets(rawHub, catalog);

  const highAssets = normalizedHub.filter(a => a.importance === 'high');
  const typicalAssets = normalizedHub.filter(a => a.importance === 'typical');
  const lowAssets = normalizedHub.filter(a => a.importance === 'low');
  // Note: non_informative assets are intentionally excluded from the generative prompt

  if (normalizedHub.length > 0) {
    sections.push('\n[LAYER 3: ASSET HUB — COMPOUNDING CONTEXTUAL WEB]');

    // 1. High Priority (Dominant Directives)
    if (highAssets.length > 0) {
      sections.push('--- PRIMARY FOREGROUND ANCHORS (HIGH PRIORITY) ---');
      sections.push('These assets MUST drive the core narrative conflict, actions, or dialogue:');
      for (const asset of highAssets) {
        const item = catalog.find(e => e.id === asset.assetId);
        sections.push(`  ★ [${asset.assetType}] "${asset.assetTitle}"`);
        if (asset.annotation) {
          sections.push(`    Directorial Note (The "Why"): "${asset.annotation}"`);
        }
        sections.push(`    Traits: ${formatAssetSummary(asset, item)}`);
      }
    }

    // 2. Typical Priority (Contextual Grounding)
    if (typicalAssets.length > 0) {
      sections.push('--- CONTEXTUAL BACKGROUND (TYPICAL PRIORITY) ---');
      sections.push('Provide essential situational and setting consistency with these assets:');
      for (const asset of typicalAssets) {
        const item = catalog.find(e => e.id === asset.assetId);
        sections.push(`  • [${asset.assetType}] "${asset.assetTitle}"`);
        if (asset.annotation) {
          sections.push(`    Directorial Note: "${asset.annotation}"`);
        }
        sections.push(`    Summary: ${formatAssetSummary(asset, item)}`);
      }
    }

    // 3. Low Priority (Subtle Texture)
    if (lowAssets.length > 0) {
      sections.push('--- SUBTLE TEXTURE & MOTIFS (LOW PRIORITY) ---');
      sections.push('Weave subtle hints, ambient references, or iconography from these assets:');
      for (const asset of lowAssets) {
        sections.push(`  ~ [${asset.assetType}] "${asset.assetTitle}"${asset.annotation ? ` (${asset.annotation})` : ''}`);
      }
    }
  }

  // ── LIVING MEMORY & DELTAS (CRONICLE) ──
  if (cronicle && cronicle.entities && Object.keys(cronicle.entities).length > 0) {
    sections.push('\n[LIVING MEMORY — CRONICLE ENTITY STATES]');
    const activeEntities = Object.entries(cronicle.entities).slice(0, 5);
    for (const [id, entity] of activeEntities) {
      sections.push(`  • ${entity.name || id}: Location=${entity.location || 'Unknown'}, Status=${entity.status || 'Active'}, HP=${entity.hp || '100%'}`);
    }
  }

  // ── DYNAMIC RECURSIVE LOREBOOK SCAN (PHASE 1 ARCHITECTURE) ──
  if (Array.isArray(catalog) && catalog.length > 0) {
    try {
      const scanResult = scanDynamicLorebook({
        input: taskPrompt,
        activeScenario: activeNode,
        catalog,
        storyFlags: storyFlags || {},
        config: lorebookConfig || {}
      });

      if (scanResult.formattedPromptContext) {
        sections.push('\n' + scanResult.formattedPromptContext);
      }
    } catch (e) {
      console.warn('[superPromptSynthesizer] Dynamic lorebook scan skipped:', e);
    }
  }

  // ── TASK INSTRUCTIONS ──
  if (taskPrompt) {
    sections.push('\n[ARCHITECTURAL TASK]');
    sections.push(taskPrompt);
  }

  const staticPrefix = buildStaticRulesPrefix({ campaignName, folioCharacter });
  const dynamicSuffix = sections.join('\n');

  if (returnPrefixStructure) {
    return {
      staticPrefix,
      dynamicSuffix,
      fullPrompt: `${staticPrefix}\n\n${dynamicSuffix}`
    };
  }

  return `${staticPrefix}\n\n${dynamicSuffix}`;
}
