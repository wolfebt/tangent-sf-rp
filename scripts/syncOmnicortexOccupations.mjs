import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { DEFAULT_OCCUPATIONS } from '../src/data/occupationsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const occupationsDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'occupations');
const targetFile = path.join(projectRoot, 'src', 'data', 'occupationsData.js');

function syncOccupations() {
  if (!fs.existsSync(occupationsDir)) {
    console.error(`Occupations directory not found at: ${occupationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(occupationsDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} occupation markdown files in ${occupationsDir}`);

  // Create lookup for existing occupations in occupationsData.js to preserve extra properties
  const existingMap = new Map();
  for (const occ of (DEFAULT_OCCUPATIONS || [])) {
    if (occ && occ.id) {
      existingMap.set(occ.id, occ);
    }
  }

  const updatedOccupations = [];

  for (const file of files) {
    const fullPath = path.join(occupationsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};

    const id = data.id || file.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};

    const recSpecies = Array.isArray(data.recommended_species) ? data.recommended_species : [];
    const recFactions = Array.isArray(data.recommended_factions) ? data.recommended_factions : [];
    const recOrigins = Array.isArray(data.recommended_origins) ? data.recommended_origins : [];
    const keywords = typeof data.keywords === 'string' ? data.keywords.trim() : (Array.isArray(data.keywords) ? data.keywords.join(', ') : '');
    const negativeKeywords = typeof data.negative_keywords === 'string' ? data.negative_keywords.trim() : (Array.isArray(data.negative_keywords) ? data.negative_keywords.join(', ') : '');

    const occObj = {
      id,
      name: data.name || existing.name || id,
      category: 'occupations',
      skill_points: data.skill_points !== undefined ? data.skill_points : (existing.skill_points !== undefined ? existing.skill_points : 20),
      professional_skills: Array.isArray(data.professional_skills) ? data.professional_skills : (existing.professional_skills || []),
      archetypes: Array.isArray(data.archetypes) ? data.archetypes : (existing.archetypes || []),
      traits: Array.isArray(data.traits) ? data.traits : (existing.traits || []),
      description: data.description || existing.description || '',
      recommended_features: existing.recommended_features || data.recommended_features || [],
      features: existing.features || data.features || existing.recommended_features || [],
      recommended_species: recSpecies,
      recommended_factions: recFactions,
      recommended_origins: recOrigins,
      keywords,
      negative_keywords: negativeKeywords,
      costs: existing.costs || {
        bp: 0,
        credits: 0,
        nodes: 0,
        sockets: 0,
        strain: 0,
        focus: 0,
        ap: 0
      },
      modifiers: existing.modifiers || [],
      modifications: existing.modifications || [],
      critical_details: existing.critical_details || {
        score: '',
        effect: [],
        success_effect: [],
        failure_effect: []
      },
      sockets: existing.sockets || {
        max: 0,
        used: 0,
        tier: 'Socket',
        allocated: []
      },
      field: existing.field || ''
    };

    updatedOccupations.push(occObj);
  }

  const jsContent = `export const DEFAULT_OCCUPATIONS = ${JSON.stringify(updatedOccupations, null, 2)};

/**
 * Common Occupational Traits available to all professions in Tangent
 */
export const COMMON_OCCUPATIONAL_TRAITS = [
  {
    id: "trait-background",
    name: "Background",
    category: "traits",
    trait_type: "Occupational Trait",
    trait_tier: "Basic",
    classification: "Mental",
    bp: 1,
    description: "The character may select additional training from another Occupation fitting the character's backstory. This does not grant any additional Professional Skill points or Recommended Features from the other Profession. May be taken multiple times granting a different Trait in the chosen Background Occupation, traits may now be chosen from the primary and background Occupation. Gain one Trait from a SECONDARY Chosen Occupation.",
    costs: { bp: 1, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 }
  },
  {
    id: "trait-trade-tools",
    name: "Trade Tools",
    category: "traits",
    trait_type: "Occupational Trait",
    trait_tier: "Basic",
    classification: "Physical",
    bp: 1,
    description: "Helps cover general gear the character would have for their Occupation. The character's additional equipment will depend on their specific job within their profession. +2 Equipment",
    modifiers: [{ target: "equipment", value: 2, type: "other", mode: "inherent" }],
    costs: { bp: 1, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 }
  },
  {
    id: "trait-high-pay",
    name: "High Pay",
    category: "traits",
    trait_type: "Occupational Trait",
    trait_tier: "Basic",
    classification: "Social",
    bp: 1,
    description: "Benefit for doing their job well. +2 Wealth",
    modifiers: [{ target: "wealth", value: 2, type: "other", mode: "inherent" }],
    costs: { bp: 1, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 }
  },
  {
    id: "trait-professionalism",
    name: "Professionalism",
    category: "traits",
    trait_type: "Occupational Trait",
    trait_tier: "Basic",
    classification: "Social",
    bp: 1,
    description: "Benefit of being known to do their job well. +2 Reputation",
    modifiers: [{ target: "reputation", value: 2, type: "other", mode: "inherent" }],
    costs: { bp: 1, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 }
  }
];
`;
  fs.writeFileSync(targetFile, jsContent, 'utf8');
  console.log(`\nSuccessfully synchronized ${updatedOccupations.length} occupations to ${targetFile}!`);
}

syncOccupations();
