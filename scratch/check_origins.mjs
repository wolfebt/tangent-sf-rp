import fs from 'fs';
import path from 'path';
import { DEFAULT_ORIGINS } from '../src/data/originsData.js';
import { ALL_CANONICAL_TRAITS } from '../src/data/speciesTraitsData.js';

const docPath = 'docs/game rules/operator/1.05 ORIGINS.md';
const content = fs.readFileSync(docPath, 'utf8');

const traitMap = new Map();
ALL_CANONICAL_TRAITS.forEach(t => {
  traitMap.set(t.id, t);
  traitMap.set(t.name.toLowerCase().trim(), t);
  const clean = t.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  traitMap.set(clean, t);
});

// Parse all 1.05 origin sections
const lines = content.split('\n');
const originSections = {};
let currentOrigin = null;
let currentTrait = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const h1Match = line.match(/^#\s+\*\*([A-Z\s]+)\*\*/);
  if (h1Match && !h1Match[1].includes('ORIGIN') && !h1Match[1].includes('COMPLETE VISUAL')) {
    currentOrigin = h1Match[1].trim();
    originSections[currentOrigin] = [];
    currentTrait = null;
    continue;
  }
  if (!currentOrigin) continue;

  const traitMatch = line.match(/^###\s+\*([^*]+)\*/);
  if (traitMatch) {
    currentTrait = {
      name: traitMatch[1].trim(),
      description: '',
      mechanic: ''
    };
    originSections[currentOrigin].push(currentTrait);
    continue;
  }

  if (currentTrait) {
    const mechMatch = line.match(/^\*([^*]+)\*$/);
    if (mechMatch && !line.includes('###')) {
      currentTrait.mechanic = mechMatch[1].trim();
    } else if (line.length > 0 && !line.startsWith('#') && !line.startsWith('&')) {
      if (!currentTrait.description) currentTrait.description = line;
      else currentTrait.description += ' ' + line;
    }
  }
}

console.log('=== 1.05 CANON ORIGINS TRAITS COMPARISON ===');
let totalCanonTraits = 0;
let exactMatches = 0;
let fuzzyMatches = 0;
const missing = [];

const results = [];

Object.entries(originSections).forEach(([origName, traits]) => {
  const origResult = { origin: origName, traits: [] };
  traits.forEach(t => {
    totalCanonTraits++;
    const clean = t.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const match = traitMap.get(clean) || traitMap.get(t.name.toLowerCase().trim());
    if (match) {
      exactMatches++;
      origResult.traits.push({
        status: 'EXACT',
        canonName: t.name,
        canonMechanic: t.mechanic,
        systemId: match.id,
        systemName: match.name,
        systemTier: match.trait_tier,
        systemType: match.trait_type,
        systemMechanics: match.mechanics
      });
    } else {
      let found = null;
      for (let ct of ALL_CANONICAL_TRAITS) {
        if (ct.name.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(ct.name.toLowerCase())) {
          found = ct;
          break;
        }
      }
      if (found) {
        fuzzyMatches++;
        origResult.traits.push({
          status: 'FUZZY',
          canonName: t.name,
          canonMechanic: t.mechanic,
          systemId: found.id,
          systemName: found.name,
          systemTier: found.trait_tier,
          systemType: found.trait_type,
          systemMechanics: found.mechanics
        });
      } else {
        missing.push({ origin: origName, trait: t.name, mechanic: t.mechanic, desc: t.description });
        origResult.traits.push({
          status: 'MISSING',
          canonName: t.name,
          canonMechanic: t.mechanic,
          systemId: null,
          systemName: null
        });
      }
    }
  });
  results.push(origResult);
});

console.log('Total Canon Traits Checked:', totalCanonTraits);
console.log('Exact Matches:', exactMatches);
console.log('Fuzzy Matches:', fuzzyMatches);
console.log('Missing/Unmatched:', missing.length);

fs.writeFileSync('scratch/origins_comparison_report.json', JSON.stringify(results, null, 2));
console.log('Detailed comparison written to scratch/origins_comparison_report.json');
