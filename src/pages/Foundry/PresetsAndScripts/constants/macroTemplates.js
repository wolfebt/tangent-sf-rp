/**
 * @file macroTemplates.js
 * @description Canonical QuickJS Macro Templates for ADE Presets & Scripts Studio.
 */

export const MACRO_TEMPLATES = [
  {
    id: 'bastion_roll',
    name: 'BASTION 2d10 Check',
    category: 'Combat Rules',
    description: 'Rolls 2d10 + Stat against target DC with critical and glitch detection.',
    code: `// BASTION Canonical 2d10 Check
const d1 = Math.floor(Math.random() * 10) + 1;
const d2 = Math.floor(Math.random() * 10) + 1;
const statBonus = 3; // e.g. Agility / Reflex
const targetDc = 14;

const total = d1 + d2 + statBonus;
const isCrit = (d1 === 10 && d2 === 10);
const isGlitch = (d1 === 1 && d2 === 1);
const isSuccess = isCrit || (total >= targetDc && !isGlitch);

return {
  dice: [d1, d2],
  statBonus,
  total,
  targetDc,
  outcome: isCrit ? 'CRITICAL SUCCESS' : isGlitch ? 'TACTICAL GLITCH' : isSuccess ? 'SUCCESS' : 'FAILURE',
  margin: total - targetDc
};`
  },
  {
    id: 'hazard_pulse',
    name: 'Proximity Hazard Pulse',
    category: 'Traps & Sensors',
    description: 'Simulates reactive mine detonation, damage soak, and status conditions.',
    code: `// Proximity Mine Damage Evaluation
const baseDamage = 18;
const targetReflexDc = 15;
const targetArmorDr = 6;

const reflexRoll = Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + 2;
const saved = reflexRoll >= targetReflexDc;

// Half damage on successful Reflex save
const rawDamage = saved ? Math.floor(baseDamage / 2) : baseDamage;
const netDamage = Math.max(1, rawDamage - targetArmorDr);

return {
  hazard: 'Volatile Plasma Mine',
  reflexRoll,
  targetReflexDc,
  saved,
  rawDamage,
  armorAbsorbed: targetArmorDr,
  appliedHealthDamage: netDamage,
  conditionApplied: saved ? null : 'Burning'
};`
  },
  {
    id: 'loot_roller',
    name: 'Random Loot Dispenser',
    category: 'Economy & Loot',
    description: 'Rolls on weighted salvage tables and generates credits and scrap.',
    code: `// High-Tech Salvage Loot Table
const roll = Math.floor(Math.random() * 100) + 1;
let tier = 'Common';
let payload = 'Scrap Metal & Wiring';
let credits = Math.floor(Math.random() * 50) + 10;

if (roll > 90) {
  tier = 'Legendary';
  payload = 'Progenitor Quantum Core & Plasma Disruptor';
  credits += 500;
} else if (roll > 70) {
  tier = 'Rare';
  payload = 'Mil-Spec Nanite Injector';
  credits += 150;
} else if (roll > 40) {
  tier = 'Uncommon';
  payload = 'Overcharged Power Cell';
  credits += 50;
}

return {
  rollPercentile: roll,
  rarityTier: tier,
  dispensedItem: payload,
  creditsFound: credits
};`
  },
  {
    id: 'cyber_intrusion',
    name: 'Cyber ICE Breach Gate',
    category: 'Cyberspace',
    description: 'Tests hacker Slicing skill against mainframe encryption to unlock doors.',
    code: `// Cyber Intrusion Gateway
const slicerSkill = 4;
const iceSecurityRating = 13;
const hackingRoll = Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + slicerSkill;

const breached = hackingRoll >= iceSecurityRating;
return {
  node: 'Sub-Deck 4 Bulkhead Access Control',
  hackingRoll,
  iceSecurityRating,
  breached,
  commandDispatched: breached ? 'stage-bulkhead-toggled:OPEN' : 'sentry-alert:HIGH_SECURITY'
};`
  }
];
