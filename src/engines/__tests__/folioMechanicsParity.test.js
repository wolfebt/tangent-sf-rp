import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  isConventionalWeaponItem,
  isOffensiveMetaphysics,
  resolveWeaponCombatSkillAndAttr,
  calculateDefaultAttackScore,
  createAttackFromWeapon,
  createAttackFromInvocation,
  resolveAllTacticalAttacks,
  getEffectiveSkillBonus
} from '../../utils/combatUtils.js';
import { resolvePowerFoundation } from '../../utils/metaphysicsUtils.js';
import { getSkillCheckBreakdown } from '../tangentModifierEngine.js';

describe('Persona Folio Mechanics & Weapon/Metaphysics Parity', () => {
  it('never classifies a Laser Pistol or conventional weapon as offensive metaphysics', () => {
    const laserPistol = {
      id: 'w_laser_pistol',
      name: 'Laser Pistol',
      damage: '2d6',
      type: 'Energy',
      range: '30m'
    };

    assert.equal(isConventionalWeaponItem(laserPistol), true);
    assert.equal(isOffensiveMetaphysics(laserPistol), false);

    const plasmaRifle = {
      id: 'w_plasma_rifle',
      name: 'Plasma Rifle',
      damage: '3d8 Plasma',
      category: 'weapons'
    };
    assert.equal(isConventionalWeaponItem(plasmaRifle), true);
    assert.equal(isOffensiveMetaphysics(plasmaRifle), false);
  });

  it('calculates Laser Pistol attack score from Primary Agility + Energy skill (never Sub-Attribute Reflex +4)', () => {
    // Character has Agility 1 (which gives Sub-Attribute Reflex = 2 + 1*2 = 4) and NO Energy skill ranks or metaskills
    const characterData = {
      'attr-agility': 1,
      'attr-reflex': 4,
      'attr-strength': 0,
      'attr-might': 2,
      weapons: [
        {
          id: 'w_laser_pistol',
          name: 'Laser Pistol',
          damage: '2d6',
          type: 'Energy',
          range: '30m'
        }
      ],
      // Simulate legacy saved attack row that had stale "+4" from Reflex and missing category
      attacks: [
        {
          id: 'atk_w_laser_pistol',
          name: 'Laser Pistol',
          score: '+4',
          damage: '2d6',
          type: 'Energy',
          notes: 'Rng: 30m'
        }
      ]
    };

    const getAttrTotal = (attrId) => characterData[attrId] ?? 0;

    const { governingSkill, governingAttr } = resolveWeaponCombatSkillAndAttr(characterData.weapons[0], characterData);
    assert.equal(governingSkill, 'combat-energy');
    assert.equal(governingAttr, 'attr-agility');

    const defaultScore = calculateDefaultAttackScore(characterData.weapons[0], characterData, getAttrTotal);
    assert.equal(defaultScore, '+1');

    const resolvedAttacks = resolveAllTacticalAttacks(characterData, getAttrTotal, false);
    assert.equal(resolvedAttacks.length, 1);
    assert.equal(resolvedAttacks[0].name, 'Laser Pistol');
    assert.equal(resolvedAttacks[0].category, 'weapon');
    assert.equal(resolvedAttacks[0].attackMod, 1);
    assert.equal(resolvedAttacks[0].score, '+1');

    const metaAttacks = resolvedAttacks.filter(a => a.category === 'metaphysics');
    assert.equal(metaAttacks.length, 0);
  });

  it('accounts for combat skill ranks, skillMods, and global attack-mod on weapon attacks', () => {
    const characterData = {
      'attr-agility': 2,
      'attr-reflex': 6,
      'skill-combat-energy-rank': 3,
      'skill-combat-energy-mod': 1
    };
    const computedModifiers = {
      skillMods: {
        energy: 2
      },
      combatMods: {
        'attack-mod': 1
      }
    };
    const getAttrTotal = (attrId) => characterData[attrId] ?? 0;

    const laserPistol = {
      id: 'w_laser_pistol',
      name: 'Laser Pistol',
      damage: '2d6',
      type: 'Energy'
    };

    // Total = Agility (2) + Energy Rank (3) + Manual Mod (1) + Feature Skill Mod (2) + Global Attack Mod (1) = +9
    const atk = createAttackFromWeapon(laserPistol, characterData, getAttrTotal, computedModifiers);
    assert.equal(atk.category, 'weapon');
    assert.equal(atk.score, '+9');
  });

  it('calculates offensive invocation attack bonus using canonical Discipline Focus skill (e.g. meta-elemental) and Primary Attribute', () => {
    const characterData = {
      'attr-wisdom': 3,
      'attr-will': 8,
      'skill-meta-elemental-rank': 4,
      'skill-meta-elemental-mod': 1
    };
    const computedModifiers = {
      skillMods: {
        elemental: 2
      }
    };
    const getAttrTotal = (attrId) => characterData[attrId] ?? 0;

    const invocation = {
      id: 'inv_solar_lance',
      name: 'Solar Lance',
      discipline: 'Energy',
      subSkill: 'Elemental',
      damage: '3d8 Plasma',
      rank: 2,
      baseDC: 15
    };

    assert.equal(isOffensiveMetaphysics(invocation), true);

    const foundation = resolvePowerFoundation(invocation, characterData, getAttrTotal, computedModifiers);
    assert.equal(foundation.baseSkillId, 'meta-elemental');
    // Wisdom (3) + Elemental Rank (4) + Elemental Manual Mod (1) + Elemental Computed Mod (2) + Invocation Rank (2) = 12
    assert.equal(foundation.totalScore, 12);

    const metaAtk = createAttackFromInvocation(invocation, characterData, getAttrTotal, computedModifiers);
    assert.equal(metaAtk.category, 'metaphysics');
    assert.equal(metaAtk.attackMod, 12);
    assert.equal(metaAtk.score, '+12');
  });

  it('uses getAttrTotal in getSkillCheckBreakdown so allocated identity pool attributes are never double-counted', () => {
    const characterData = {
      'attr-agility': 2, // 1 purchased + 1 from speciesAllocations
      speciesAllocations: {
        attributes: { 'attr-agility': 1 },
        skills: { 'combat-energy': 2 }
      }
    };
    const attributeMods = {
      'attr-agility': 1 // +1 from speciesAllocations
    };
    // True Agility total is 2 (1 purchased + 1 species bonus)
    const getAttrTotal = (attrId) => (attrId === 'attr-agility' ? 2 : 0);

    const breakdown = getSkillCheckBreakdown('combat-energy', characterData, {}, {
      attributeMods,
      getAttrTotal
    });

    assert.equal(breakdown.rank, 2);
    assert.equal(breakdown.attrTotal, 2);
    assert.equal(breakdown.score, 4);
    assert.equal(breakdown.total, 4);
    assert.equal(getEffectiveSkillBonus('combat-energy', characterData, null), 2);
  });
});
