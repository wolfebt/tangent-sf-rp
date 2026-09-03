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
});
