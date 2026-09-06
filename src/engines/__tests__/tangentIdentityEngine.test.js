import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  applySpeciesTransition,
  applyArchetypeTransition,
  applyOccupationTransition,
  applyOriginTransition,
  applyFactionTransition,
  applyIdentityFieldTransition,
  resolveCatalogItem
} from '../tangentIdentityEngine.js';

describe('Tangent SF RP — Identity Transition & Trait Synchronization Engine', () => {

  const sampleBaseCharacter = {
    'char-name': 'Test Operative',
    'char-archetype': '',
    'char-species': '',
    'char-occu': '',
    'char-origin': '',
    'char-faction': '',
    'attr-strength': 0,
    'attr-agility': 0,
    'attr-stamina': 0,
    'attr-intellect': 0,
    'attr-wisdom': 0,
    'attr-charisma': 0,
    'move-walk': 30,
    'move-climb': 0,
    'move-swim': 0,
    'move-fly': 0,
    'move-burrow': 0,
    'move-flicker': 0,
    features: [
      { id: 'custom-feat-1', name: 'Custom Luck', category: 'General', cp: 3 }
    ],
    disadvantages: [
      { id: 'custom-dis-1', name: 'Phobia (Spiders)', category: 'General', bp: 3 }
    ]
  };

  it('resolves species, archetype, occupation, origin, and faction from canonical catalogs', () => {
    const sp = resolveCatalogItem('species', 'Human (Base)');
    assert.ok(sp, 'Human (Base) species should resolve');
    assert.strictEqual(sp.name, 'Human (Base)');

    const arch = resolveCatalogItem('archetypes', 'The Armorer');
    assert.ok(arch, 'The Armorer archetype should resolve');
    assert.strictEqual(arch.name, 'The Armorer');

    const occu = resolveCatalogItem('occupations', 'Agent');
    assert.ok(occu, 'Agent occupation should resolve');

    const origin = resolveCatalogItem('origins', 'Aquatic');
    assert.ok(origin, 'Aquatic origin should resolve');

    const fac = resolveCatalogItem('factions', 'Alien Enclave');
    assert.ok(fac, 'Alien Enclave faction should resolve');
  });

  it('correctly transitions Species: removes old species traits and attaches new species traits/movement', () => {
    // 1. Apply Celestine (Alterian)
    const afterFirst = applySpeciesTransition(sampleBaseCharacter, 'Celestine (Alterian)');
    assert.strictEqual(afterFirst['char-species'], 'Celestine (Alterian)');
    assert.ok(afterFirst.features.some(f => f.category === 'Species Inherent' && f.source === 'species'));
    // Custom feature preserved
    assert.ok(afterFirst.features.some(f => f.name === 'Custom Luck'));

    // 2. Switch species to Human (Base)
    const afterSecond = applySpeciesTransition(afterFirst, 'Human (Base)');
    assert.strictEqual(afterSecond['char-species'], 'Human (Base)');
    // Previous Celestine traits should be gone
    const celestineTraits = afterSecond.features.filter(f => f.name.includes('Arcane') && f.category === 'Species Inherent');
    assert.strictEqual(celestineTraits.length, 0, 'Celestine inherent traits must be cleanly removed');
    // Human adaptability should be present
    assert.ok(afterSecond.features.some(f => f.name.includes('Adaptability') || f.source === 'species'));
    // Custom feature still preserved
    assert.ok(afterSecond.features.some(f => f.name === 'Custom Luck'));

    // 3. Clear species
    const afterClear = applySpeciesTransition(afterSecond, '');
    assert.strictEqual(afterClear['char-species'], '');
    const speciesFeats = afterClear.features.filter(f => f.category === 'Species Inherent' || f.source === 'species');
    assert.strictEqual(speciesFeats.length, 0, 'No species traits remaining after clearing');
    assert.strictEqual(afterClear['move-swim'], 0);
  });

  it('correctly transitions Archetype: removes old signature features and applies new chassis & signature features', () => {
    // 1. Apply Armorer with 80 CP Pre-build
    const withArmorer = applyArchetypeTransition(sampleBaseCharacter, 'The Armorer', {}, { applyPreBuild: true });
    assert.strictEqual(withArmorer['char-archetype'], 'The Armorer');
    assert.strictEqual(withArmorer['attr-intellect'], 3, 'Armorer Primary Attribute (Intellect) should be 3');
    assert.strictEqual(withArmorer['attr-strength'], 2, 'Armorer Secondary Attribute (Strength) should be 2');
    assert.ok(withArmorer.features.some(f => f.category === 'Archetype Signature'));

    // 2. Switch Archetype to The Ace with 80 CP Pre-build
    const withAce = applyArchetypeTransition(withArmorer, 'The Ace', {}, { applyPreBuild: true });
    assert.strictEqual(withAce['char-archetype'], 'The Ace');
    assert.strictEqual(withAce['attr-agility'], 3, 'Ace Primary Attribute (Agility) should be 3');
    // Armorer signature features should be removed
    const armorerFeats = withAce.features.filter(f => f.sourceName === 'The Armorer' || (f.source === 'archetype' && f.name.includes('Armorer')));
    assert.strictEqual(armorerFeats.length, 0, 'Old archetype signature features must be removed');
    assert.ok(withAce.features.some(f => f.category === 'Archetype Signature' && f.sourceName === 'The Ace'));
    assert.ok(withAce.features.some(f => f.name === 'Custom Luck'), 'Custom features preserved');

    // 3. Clear Archetype
    const cleared = applyArchetypeTransition(withAce, '');
    assert.strictEqual(cleared['char-archetype'], '');
    const archFeats = cleared.features.filter(f => f.category === 'Archetype Signature' || f.source === 'archetype');
    assert.strictEqual(archFeats.length, 0, 'All archetype features removed upon clearing');
  });

  it('correctly transitions Occupation: cleans old traits and updates allocations', () => {
    const withAgent = applyOccupationTransition(sampleBaseCharacter, 'Agent');
    assert.strictEqual(withAgent['char-occu'], 'Agent');
    assert.deepStrictEqual(withAgent.occuAllocations, { skills: {}, traits: [], features: [] });

    // Switch to Adept
    const withAdept = applyOccupationTransition(withAgent, 'Adept');
    assert.strictEqual(withAdept['char-occu'], 'Adept');

    // Clear occupation
    const cleared = applyOccupationTransition(withAdept, '');
    assert.strictEqual(cleared['char-occu'], '');
  });

  it('correctly transitions Origin: cleans old homeworld traits and updates allocations', () => {
    const withAquatic = applyOriginTransition(sampleBaseCharacter, 'Aquatic');
    assert.strictEqual(withAquatic['char-origin'], 'Aquatic');
    assert.deepStrictEqual(withAquatic.originAllocations, { skills: {}, traits: [], features: [] });

    // Switch to Agricultural
    const withAgri = applyOriginTransition(withAquatic, 'Agricultural');
    assert.strictEqual(withAgri['char-origin'], 'Agricultural');

    // Clear origin
    const cleared = applyOriginTransition(withAgri, '');
    assert.strictEqual(cleared['char-origin'], '');
  });

  it('correctly transitions Faction: cleans old benefits & hindrances and applies new ones', () => {
    const withAlien = applyFactionTransition(sampleBaseCharacter, 'Alien Enclave');
    assert.strictEqual(withAlien['char-faction'], 'Alien Enclave');

    // Switch to Corporate Subsidiary
    const withCorp = applyFactionTransition(withAlien, 'Corporate Subsidiary');
    assert.strictEqual(withCorp['char-faction'], 'Corporate Subsidiary');
    // Ensure no orphan alien faction traits
    const alienFeats = withCorp.features.filter(f => f.sourceName === 'Alien Enclave');
    assert.strictEqual(alienFeats.length, 0);

    // Clear faction
    const cleared = applyFactionTransition(withCorp, '');
    assert.strictEqual(cleared['char-faction'], '');
    const facFeats = cleared.features.filter(f => f.source === 'faction' || f.category === 'Faction Feature');
    const facDis = cleared.disadvantages.filter(d => d.source === 'faction' || d.category === 'Faction Hindrance');
    assert.strictEqual(facFeats.length, 0);
    assert.strictEqual(facDis.length, 0);
  });

  it('universal applyIdentityFieldTransition handles all 5 fields identically', () => {
    let char = sampleBaseCharacter;
    char = applyIdentityFieldTransition(char, 'char-species', 'Human (Base)');
    assert.strictEqual(char['char-species'], 'Human (Base)');

    char = applyIdentityFieldTransition(char, 'char-archetype', 'The Armorer', {}, { applyPreBuild: true });
    assert.strictEqual(char['char-archetype'], 'The Armorer');

    char = applyIdentityFieldTransition(char, 'char-occu', 'Agent');
    assert.strictEqual(char['char-occu'], 'Agent');

    char = applyIdentityFieldTransition(char, 'char-origin', 'Agricultural');
    assert.strictEqual(char['char-origin'], 'Agricultural');

    char = applyIdentityFieldTransition(char, 'char-faction', 'Alien Enclave');
    assert.strictEqual(char['char-faction'], 'Alien Enclave');

    assert.ok(char.features.some(f => f.source === 'species'));
    assert.ok(char.features.some(f => f.source === 'archetype'));
  });

  it('reverts essential skills, primary/secondary attributes, and sub-attributes when Archetype is switched or removed without lingering residual keys', () => {
    // 1. Start with blank base character (all attributes 0, sub-attributes 2)
    const baseChar = {
      ...sampleBaseCharacter,
      'attr-might': 2,
      'attr-reflex': 2,
      'attr-fortitude': 2,
      'attr-logic': 2,
      'attr-reason': 2,
      'attr-will': 2,
      'attr-willpower': 2,
      'attr-etiquette': 2,
      archetypeAllocations: { attributes: {}, skills: {}, features: [] }
    };

    // 2. Apply The Armorer (+3 Intellect, +2 Strength, 4 essential skills at rank 6)
    const withArmorer = applyArchetypeTransition(baseChar, 'The Armorer', {}, { applyPreBuild: true });
    assert.strictEqual(withArmorer['char-archetype'], 'The Armorer');
    assert.strictEqual(withArmorer['attr-intellect'], 3);
    assert.strictEqual(withArmorer['attr-strength'], 2);
    assert.strictEqual(withArmorer['attr-logic'], 8, 'Intellect 3 should produce Logic base 8');
    assert.strictEqual(withArmorer['attr-reason'], 8, 'Reason alias should synchronize to 8');
    assert.strictEqual(withArmorer['attr-might'], 6, 'Strength 2 should produce Might base 6');

    // Verify Armorer essential skills were assigned
    const armorerSkills = Object.keys(withArmorer).filter(k => k.startsWith('skill-') && k.endsWith('-rank'));
    assert.ok(armorerSkills.length > 0, 'Essential skills should be assigned for Armorer');
    assert.ok(withArmorer.features.some(f => f.category === 'Archetype Signature'));

    // 3. Switch to The Bailiff (+3 Strength, +2 Wisdom, Bailiff essential skills)
    const withBailiff = applyArchetypeTransition(withArmorer, 'The Bailiff', {}, { applyPreBuild: true });
    assert.strictEqual(withBailiff['char-archetype'], 'The Bailiff');
    // Armorer's Intellect (+3) reverted to 0, Bailiff's Strength is 3, Wisdom is 2
    assert.strictEqual(withBailiff['attr-intellect'], 0, 'Armorer Intellect must be reverted to 0');
    assert.strictEqual(withBailiff['attr-strength'], 3, 'Bailiff Strength must be 3');
    assert.strictEqual(withBailiff['attr-wisdom'], 2, 'Bailiff Wisdom must be 2');
    assert.strictEqual(withBailiff['attr-logic'], 2, 'Logic must be restored to 2');
    assert.strictEqual(withBailiff['attr-reason'], 2, 'Reason must be restored to 2');
    assert.strictEqual(withBailiff['attr-might'], 8, 'Might must be 8 for Strength 3');
    assert.strictEqual(withBailiff['attr-will'], 6, 'Will must be 6 for Wisdom 2');
    assert.strictEqual(withBailiff['attr-willpower'], 6, 'Willpower must be 6 for Wisdom 2');

    // Armorer essential skills (e.g. Vocation Armorer, Technology) must be cleanly removed without residual 0 ranks
    assert.strictEqual(withBailiff['skill-mental-armorer-rank'], undefined);
    assert.strictEqual(withBailiff['skill-armorer-rank'], undefined);
    assert.strictEqual(withBailiff['skill-vocation-armorer-rank'], undefined);

    // Bailiff signature features should replace Armorer signature features
    assert.ok(withBailiff.features.some(f => f.sourceName === 'The Bailiff' || f.name === 'Law Enforcement Training' || f.name === 'Authority Figure'));
    assert.ok(!withBailiff.features.some(f => f.sourceName === 'The Armorer'));

    // 4. Remove Archetype completely ('')
    const cleared = applyArchetypeTransition(withBailiff, '', {}, {});
    assert.strictEqual(cleared['char-archetype'], '');
    assert.strictEqual(cleared['attr-strength'], 0, 'Strength should revert to 0');
    assert.strictEqual(cleared['attr-wisdom'], 0, 'Wisdom should revert to 0');
    assert.strictEqual(cleared['attr-intellect'], 0, 'Intellect should remain 0');
    assert.strictEqual(cleared['attr-might'], 2, 'Might should revert to base 2');
    assert.strictEqual(cleared['attr-will'], 2, 'Will should revert to base 2');
    assert.strictEqual(cleared['attr-willpower'], 2, 'Willpower should revert to base 2');
    assert.strictEqual(cleared['attr-logic'], 2, 'Logic should remain 2');
    assert.strictEqual(cleared['attr-reason'], 2, 'Reason should remain 2');

    // No lingering residual skills
    const lingeringSkills = Object.keys(cleared).filter(k => k.startsWith('skill-') && k.endsWith('-rank'));
    assert.strictEqual(lingeringSkills.length, 0, `No lingering residual skills allowed, found: ${lingeringSkills.join(', ')}`);

    // No lingering archetype features
    const lingeringArchFeats = cleared.features.filter(f => f.source === 'archetype' || f.category === 'Archetype Signature');
    assert.strictEqual(lingeringArchFeats.length, 0, 'No lingering archetype features');
    assert.deepStrictEqual(cleared.archetypeAllocations, { attributes: {}, skills: {}, features: [] });
  });

  it('reverts species pool allocations, inherent attributes, movement modes, and inherent traits when Species is cleared or changed', () => {
    const charWithSpecies = {
      ...sampleBaseCharacter,
      'char-species': 'Human (Base)',
      'attr-agility': 1,
      'attr-reflex': 4,
      'skill-combat-unarmed-rank': 2,
      'skill-unarmed-rank': 2,
      'move-swim': 15,
      speciesAllocations: {
        attributes: { 'attr-agility': 1 },
        skills: { 'combat-unarmed': 2 },
        traits: ['Bonus Feat'],
        features: []
      },
      features: [
        { id: 'custom-feat-1', name: 'Custom Luck', category: 'General', cp: 3 },
        { id: 'sp-feat-1', name: 'Human Adaptability', category: 'Species Inherent', source: 'species' }
      ],
      traits: [
        { id: 'sp-trait-1', name: 'Bonus Feat', source: 'species' }
      ]
    };

    // Clear species
    const cleared = applySpeciesTransition(charWithSpecies, '');
    assert.strictEqual(cleared['char-species'], '');
    assert.strictEqual(cleared['attr-agility'], 0, 'Species allocated Agility must be reverted');
    assert.strictEqual(cleared['attr-reflex'], 2, 'Reflex must be restored to canonical base 2');
    assert.strictEqual(cleared['skill-combat-unarmed-rank'], undefined, 'Combat Unarmed rank must be deleted');
    assert.strictEqual(cleared['skill-unarmed-rank'], undefined, 'Unarmed rank alias must be deleted');
    assert.strictEqual(cleared['move-swim'], 0, 'Swim speed must revert to 0');
    assert.strictEqual(cleared['move-walk'], 30, 'Walk speed remains 30 default');

    // Species features & traits removed, custom preserved
    assert.strictEqual(cleared.features.length, 1);
    assert.strictEqual(cleared.features[0].name, 'Custom Luck');
    assert.strictEqual(cleared.traits.length, 0);
    assert.deepStrictEqual(cleared.speciesAllocations, { attributes: {}, skills: {}, traits: [], features: [] });
  });

  it('reverts occupation professional skill allocations and traits when Occupation is cleared or switched', () => {
    const charWithOccu = {
      ...sampleBaseCharacter,
      'char-occu': 'Agent',
      'skill-mental-investigation-rank': 3,
      'skill-investigation-rank': 3,
      occuAllocations: {
        skills: { 'mental-investigation': 3 },
        traits: ['Undercover Contact'],
        features: []
      },
      traits: [
        { id: 'occ-trait-1', name: 'Undercover Contact', source: 'occupation', category: 'Career Trait' }
      ],
      features: [
        { id: 'custom-feat-1', name: 'Custom Luck', category: 'General', cp: 3 }
      ]
    };

    const cleared = applyOccupationTransition(charWithOccu, '');
    assert.strictEqual(cleared['char-occu'], '');
    assert.strictEqual(cleared['skill-mental-investigation-rank'], undefined, 'Occupation skill must be deleted');
    assert.strictEqual(cleared['skill-investigation-rank'], undefined, 'Occupation skill alias must be deleted');
    assert.strictEqual(cleared.traits.length, 0, 'Occupation traits must be removed');
    assert.strictEqual(cleared.features.length, 1, 'Custom features preserved');
    assert.deepStrictEqual(cleared.occuAllocations, { skills: {}, traits: [], features: [] });

    // Also verify secondary occupation transition
    const withSecOccu = applyIdentityFieldTransition(charWithOccu, 'char-secondary-occu', '');
    assert.strictEqual(withSecOccu['char-secondary-occu'], '');
  });

  it('reverts origin society skill allocations and homeworld traits when Origin is cleared or switched', () => {
    const charWithOrigin = {
      ...sampleBaseCharacter,
      'char-origin': 'Aquatic',
      'skill-physical-swimming-rank': 2,
      'skill-swimming-rank': 2,
      originAllocations: {
        skills: { 'physical-swimming': 2 },
        traits: ['Aquatic Born'],
        features: []
      },
      traits: [
        { id: 'orig-trait-1', name: 'Aquatic Born', source: 'origin', category: 'Homeworld Trait' }
      ]
    };

    const cleared = applyOriginTransition(charWithOrigin, '');
    assert.strictEqual(cleared['char-origin'], '');
    assert.strictEqual(cleared['skill-physical-swimming-rank'], undefined, 'Origin skill rank must be deleted');
    assert.strictEqual(cleared['skill-swimming-rank'], undefined, 'Origin skill alias must be deleted');
    assert.strictEqual(cleared.traits.length, 0, 'Origin homeworld traits must be removed');
    assert.deepStrictEqual(cleared.originAllocations, { skills: {}, traits: [], features: [] });

    // Also verify secondary origin transition
    const withSecOrigin = applyIdentityFieldTransition(charWithOrigin, 'char-secondary-origin', '');
    assert.strictEqual(withSecOrigin['char-secondary-origin'], '');
  });

  it('reverts faction skill allocations, benefits, and hindrances when Faction is cleared or switched', () => {
    const charWithFaction = {
      ...sampleBaseCharacter,
      'char-faction': 'Alien Enclave',
      'skill-social-diplomacy-rank': 2,
      'skill-diplomacy-rank': 2,
      factionAllocations: {
        skills: { 'social-diplomacy': 2 },
        traits: [],
        features: []
      },
      features: [
        { id: 'fac-feat-1', name: 'Enclave Ally', source: 'faction', category: 'Faction Feature' }
      ],
      disadvantages: [
        { id: 'custom-dis-1', name: 'Phobia (Spiders)', category: 'General', bp: 3 },
        { id: 'fac-dis-1', name: 'Alien Stigma', source: 'faction', category: 'Faction Hindrance' }
      ]
    };

    const cleared = applyFactionTransition(charWithFaction, '');
    assert.strictEqual(cleared['char-faction'], '');
    assert.strictEqual(cleared['skill-social-diplomacy-rank'], undefined, 'Faction skill rank must be deleted');
    assert.strictEqual(cleared['skill-diplomacy-rank'], undefined, 'Faction skill alias must be deleted');
    assert.strictEqual(cleared.features.filter(f => f.source === 'faction').length, 0, 'Faction features must be removed');
    assert.strictEqual(cleared.disadvantages.length, 1, 'Only custom disadvantages remain');
    assert.strictEqual(cleared.disadvantages[0].name, 'Phobia (Spiders)');
    assert.deepStrictEqual(cleared.factionAllocations, { skills: {}, traits: [], features: [] });
  });
});
