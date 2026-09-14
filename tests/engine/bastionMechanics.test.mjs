import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASTION_MECHANICS_DATASET } from '../../src/data/mechanicsData.js';

test('BASTION Mechanics: Dataset completeness and schema integrity', () => {
  assert(Array.isArray(BASTION_MECHANICS_DATASET), 'Mechanics dataset should be an array');
  assert(BASTION_MECHANICS_DATASET.length >= 10, `Expected at least 10 mechanics rules, got ${BASTION_MECHANICS_DATASET.length}`);

  BASTION_MECHANICS_DATASET.forEach(rule => {
    assert(rule.id && typeof rule.id === 'string', `Rule missing valid id: ${JSON.stringify(rule)}`);
    assert(rule.title && typeof rule.title === 'string', `Rule ${rule.id} missing valid title`);
    assert(rule.category && typeof rule.category === 'string', `Rule ${rule.id} missing valid category`);
    assert(rule.citation && rule.citation.includes('.md'), `Rule ${rule.id} must cite a valid markdown document`);
    assert(rule.summary && rule.summary.length > 10, `Rule ${rule.id} missing summary`);
    assert(rule.rules_text && rule.rules_text.length > 20, `Rule ${rule.id} missing canonical rules_text`);
    assert(Array.isArray(rule.tags) && rule.tags.length > 0, `Rule ${rule.id} missing tags`);
    assert(rule.status === 'pending_approval' || rule.status === 'approved', `Rule ${rule.id} must have valid approval status`);
  });
});

test('BASTION Mechanics: Combat Dual Resolution & Skill Tier Actions (NO AP)', () => {
  const dualRes = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-combat-core-resolution');
  assert(dualRes, 'Dual Resolution rule must exist');
  assert(dualRes.mechanic_formula.includes('2d10'), 'Dual resolution must reference 2d10');
  assert(dualRes.rules_text.includes('DEFENDER WINS ALL TIES'), 'Defender must win all ties');
  assert(dualRes.rules_text.includes('CR 15'), 'Unopposed baseline must be CR 15');

  const actionEco = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-combat-actions-by-skill-tier');
  assert(actionEco, 'Action economy rule must exist');
  assert(actionEco.mechanic_formula.includes('Rank 1-5: 1 action'), 'Rank 1-5 grants 1 action');
  assert(actionEco.mechanic_formula.includes('Rank 6-10: 2nd action (-5)'), 'Rank 6-10 grants 2nd action at -5');
  assert(actionEco.mechanic_formula.includes('Rank 11-15: 3rd action (-10)'), 'Rank 11-15 grants 3rd action at -10');
  assert(actionEco.rules_text.includes('Active Defense'), 'Must govern Active Defense reaction penalty');

  const edgeRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-combat-edge-system');
  assert(edgeRule, 'EDGE Tactical Advantage System must exist');
  assert(edgeRule.rules_text.includes('Aiming'), 'Must specify Aiming Edge');
  assert(edgeRule.rules_text.includes('Flanking'), 'Must specify Flanking Edge');
  assert(edgeRule.rules_text.includes('High Ground'), 'Must specify High Ground Edge');
});

test('BASTION Mechanics: Called Shots & Limb Thresholds (1/3 & 2/3 Health)', () => {
  const calledShots = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-combat-called-shots-locations');
  assert(calledShots, 'Called shots rule must exist');
  assert(calledShots.rules_text.includes('Reason Save vs Damage'), 'Head must require Reason Save vs damage');
  assert(calledShots.rules_text.includes('Fortitude Save vs Damage'), 'Torso must require Fortitude Save vs damage');
  assert(calledShots.rules_text.includes('Reflex Save vs Damage'), 'Arms must require Reflex Save vs damage');
  assert(calledShots.rules_text.includes('Might Save vs Damage'), 'Legs must require Might Save vs damage');

  const limbThresholds = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-combat-disabled-destroyed-thresholds');
  assert(limbThresholds, 'Limb thresholds rule must exist');
  assert(limbThresholds.mechanic_formula.includes('1/3 Health'), 'Disabled at 1/3 Health');
  assert(limbThresholds.mechanic_formula.includes('2/3 Health'), 'Destroyed at 2/3 Health');
  assert(limbThresholds.rules_text.includes('Synthetic limbs take 50% more damage'), 'Synthetics must take 50% more damage before Disabled/Destroyed');
});

test('BASTION Mechanics: Mortality State & Bleeding Out', () => {
  const mortality = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-combat-mortality-state');
  assert(mortality, 'Mortality state rule must exist');
  assert(mortality.mechanic_formula.includes('Stability Points = CON Score + 5'), 'Stability points must equal CON + 5');
  assert(mortality.mechanic_formula.includes('1 Stability Damage/turn'), 'Bleedout must deal 1 point/turn');
  assert(mortality.rules_text.includes('Medicine Check (DC 15)'), 'Stabilization must require Medicine DC 15');
});

test('BASTION Mechanics: 1.10 Scaling and Cross-Scale Multipliers', () => {
  const scaling = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-scaling-14-tiers');
  assert(scaling, '14-tier scaling rule must exist');
  assert(scaling.rules_text.includes('Miniscule'), 'Must include Miniscule tier');
  assert(scaling.rules_text.includes('Mega Colossal'), 'Must include Mega Colossal tier');
  assert(scaling.rules_text.includes('x320'), 'Must include Mega Colossal x320 multiplier');
  assert(scaling.rules_text.includes('Proximity Damage'), 'Must define starship proximity damage');
});

test('BASTION Mechanics: Economatrix Tangent Standard Curve (TSC)', () => {
  const tsc = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-economatrix-standard-curve');
  assert(tsc, 'Economatrix TSC equation must exist');
  assert(tsc.mechanic_formula.includes('Value = 10 * 4^(DC / 5)'), 'Must match canonical TSC formula');
  assert(tsc.rules_text.includes('Purchase DC = Crafting DC'), 'Must state Purchase DC equals Crafting DC');
});

test('BASTION Mechanics: Character 150 CP Creation Budget', () => {
  const charRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-character-150cp-creation');
  assert(charRule, 'Character creation rule must exist');
  assert(charRule.mechanic_formula.includes('150 CP'), 'Must specify 150 CP starting character budget');
  assert(charRule.rules_text.includes('Award Points (AP)') && charRule.rules_text.includes('CP'), 'Must define AP and CP relationship');
});

test('BASTION Mechanics: Modular Companions 40 CP Architecture & Feature Unlock', () => {
  const companionRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-companion-40cp-formula');
  assert(companionRule, 'Companion modular formula must exist');
  assert(companionRule.mechanic_formula.includes('15 CP') && companionRule.mechanic_formula.includes('25 CP'), 'Formula must specify 15 CP Form + 25 CP Function');
  assert(companionRule.rules_text.includes('Companion feature') || companionRule.rules_text.includes('COMPANION feature'), 'Must detail Companion feature requirement');
  assert(companionRule.rules_text.includes('Biological') && companionRule.rules_text.includes('Synthetic'), 'Must detail chassis typologies');
});

test('BASTION Mechanics: Vitals & Structure 30 VP / 30 HP / 60 SP Base (No Stamina Bonus)', () => {
  const vitalsRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-vitals-30-30-60');
  assert(vitalsRule, 'Vitals 30/30/60 rule must exist');
  assert(vitalsRule.rules_text.includes('Base Vitality = 30 points'), 'Base Vitality must be 30');
  assert(vitalsRule.rules_text.includes('Base Health = 30 points'), 'Base Health must be 30');
  assert(vitalsRule.rules_text.includes('Base Structure = 60 Structure Points (SP)'), 'Base Structure must be 60 for Medium');
  assert(vitalsRule.rules_text.includes('Stamina does NOT add to base Vitality or Health'), 'Stamina must not add flat bonus to VP or HP');
  assert(vitalsRule.rules_text.includes('Toughness'), 'Stamina must provide natural DR / Toughness');
});

test('BASTION Mechanics: Karma Points Economy & The 6 Canonical Spending Actions', () => {
  const karmaRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-karma-spending-actions');
  assert(karmaRule, 'Karma rule must exist');
  assert(karmaRule.rules_text.includes('3 Karma Points'), 'Default pool must be 3 KP');
  assert(karmaRule.rules_text.includes('does NOT recover through short or long rest'), 'Karma must not recover through rest');
  assert(karmaRule.rules_text.includes('I Got This'), 'Must include "I Got This" Advantage action');
  assert(karmaRule.rules_text.includes('Not What I Meant'), 'Must include "Not What I Meant" Reroll action');
  assert(karmaRule.rules_text.includes('Shake it Off'), 'Must include "Shake it Off" Condition reduction action');
  assert(karmaRule.rules_text.includes('Second Wind'), 'Must include "Second Wind" Light rest action');
  assert(karmaRule.rules_text.includes('So Mote it Be'), 'Must include "So Mote it Be" Metaphysical potency action');
  assert(karmaRule.rules_text.includes('By Will Alone'), 'Must include "By Will Alone" Push limits action');
  assert(karmaRule.rules_text.includes('Charisma score + 1'), 'Karmic Debt must cap at CHA + 1');
});

test('BASTION Mechanics: Augmentation Tiers & No Max Strain (<20%, <50%, >50%)', () => {
  const augRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-augmentations-body-alteration-tiers');
  assert(augRule, 'Augmentation rule must exist');
  assert(augRule.rules_text.includes('NO maximum strain score'), 'Must confirm no maximum strain');
  assert(augRule.rules_text.includes('< 20% body alterations'), 'Tier 1 must be <20% alteration');
  assert(augRule.rules_text.includes('< 50% body alterations'), 'Tier 2 must be <50% alteration');
  assert(augRule.rules_text.includes('> 50% body alterations'), 'Tier 3 must be >50% alteration up to FBC');
});

test('BASTION Mechanics: Mecha Taxonomy Across Universal Vehicles Spectrum', () => {
  const mechaRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-mecha-vehicles-all-sorts');
  assert(mechaRule, 'Mecha rule must exist');
  assert(mechaRule.rules_text.includes('Hoverboards'), 'Must include hoverboards');
  assert(mechaRule.rules_text.includes('Motorcycles'), 'Must include motorcycles');
  assert(mechaRule.rules_text.includes('Power Armor'), 'Must include power armor');
  assert(mechaRule.rules_text.includes('Walkers'), 'Must include walkers');
  assert(mechaRule.rules_text.includes('Fighter jets'), 'Must include fighter jets');
  assert(mechaRule.rules_text.includes('Starships'), 'Must include starships');
  assert(mechaRule.rules_text.includes('60 SP base for Medium size'), 'Mecha must use 60 SP base for Medium');
});


