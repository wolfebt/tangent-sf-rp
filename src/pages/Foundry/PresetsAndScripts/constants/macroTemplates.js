/**
 * @file macroTemplates.js
 * @description Canonical QuickJS Macro Templates for ADE Presets & Scripts Studio.
 * Includes BASTION rules checks, trauma evaluation, hazard simulation,
 * faction morale, and environmental threat automation.
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
  },
  {
    id: 'ambush_surprise_check',
    name: 'Tactical Surprise & Ambush Resolver',
    category: 'Combat Rules',
    description: 'Evaluates attacker Stealth roll against target Passive Perception to determine surprise round initiative.',
    code: `// Tactical Surprise & Ambush Resolver
const stealthSkillBonus = 4;
const targetPerceptionStat = 3;
const targetPassivePerception = 10 + targetPerceptionStat; // DC 13

// Attacker rolls canonical 2d10 + Stealth
const stealthCheck = Dice.check2d10(stealthSkillBonus, targetPassivePerception);
const margin = stealthCheck.margin;

let status = 'AMBUSH_FAILED';
let initiativeBonus = 0;
let surpriseCondition = false;
let narrative = '';

if (stealthCheck.crit || margin >= 6) {
  status = 'CRITICAL_AMBUSH';
  initiativeBonus = 10;
  surpriseCondition = true;
  narrative = 'Attacker achieved total sensory drop. Target is Surprised (cannot act in round 1), and attacker gains +10 Initiative.';
} else if (stealthCheck.success) {
  status = 'AMBUSH_SUCCESSFUL';
  initiativeBonus = 5;
  surpriseCondition = true;
  narrative = 'Attacker struck from concealed blindspot. Target is Surprised for round 1, attacker gains +5 Initiative.';
} else if (stealthCheck.fumble) {
  status = 'CRITICAL_EXPOSURE';
  initiativeBonus = -3;
  surpriseCondition = false;
  narrative = 'Attacker stumbled or triggered proximity sensor. Target gains immediate reaction attack of opportunity!';
} else {
  status = 'AMBUSH_DETECTED';
  initiativeBonus = 0;
  surpriseCondition = false;
  narrative = 'Target spotted incoming attacker. Standard initiative order proceeds normally.';
}

return {
  stealthRoll: stealthCheck.dice,
  stealthTotal: stealthCheck.total,
  targetPassivePerception,
  margin,
  status,
  initiativeBonus,
  targetSurprised: surpriseCondition,
  narrative
};`
  },
  {
    id: 'trauma_blowout_eval',
    name: '33.3% Trauma & Called Shot Resolver',
    category: 'Combat Rules',
    description: 'Checks for severe organ blowout, limb severing, or system failure when damage exceeds one-third maximum HP.',
    code: `// 33.3% Trauma Threshold & Called Shot Evaluation
const targetMaxVitality = 45;
const incomingDamage = 22;
const armorDr = 4;
const targetedLimb = 'left arm'; // 'head', 'torso', 'left arm', 'right arm', 'leg'

const traumaThreshold = Math.floor(targetMaxVitality * 0.333); // 14 HP
const calledShotResult = Trauma.evaluateCalledShot(targetedLimb, incomingDamage, armorDr);

const exceedsThreshold = calledShotResult.netDamage >= traumaThreshold;
let traumaReport = calledShotResult.traumaApplied;
let combatCondition = calledShotResult.penalty;

if (exceedsThreshold && !traumaReport) {
  traumaReport = \`Massive System Trauma: Structural collapse to \${targetedLimb}\`;
  combatCondition = '-3 Stamina, Staggered (Save DC 14 to recover)';
}

return {
  targetMaxVitality,
  traumaThreshold,
  incomingDamage,
  armorAbsorbed: calledShotResult.armorAbsorbed,
  netDamage: calledShotResult.netDamage,
  exceeds33PercentThreshold: exceedsThreshold,
  limbTargeted: targetedLimb,
  traumaSeverity: calledShotResult.severity,
  traumaApplied: traumaReport || 'No Permanent Trauma',
  penalty: combatCondition || 'None'
};`
  },
  {
    id: 'artillery_scatter_matrix',
    name: 'Deviating Indirect Fire Matrix',
    category: 'Traps & Sensors',
    description: 'Calculates mortar/orbital artillery impact deviation, 1d8 compass drift, and radial blast falloff.',
    code: `// Artillery & Orbital Strike Scatter Resolver
const targetX = 1400;
const targetY = 850;
const targetingSkillBonus = 3;
const targetDistanceDc = 15; // DC based on range and atmospheric interference

// Check accuracy
const accuracyCheck = Dice.check2d10(targetingSkillBonus, targetDistanceDc);

// Direction vector: 1=N, 2=NE, 3=E, 4=SE, 5=S, 6=SW, 7=W, 8=NW
const directions = [
  { name: 'North', dx: 0, dy: -1 },
  { name: 'North-East', dx: 0.71, dy: -0.71 },
  { name: 'East', dx: 1, dy: 0 },
  { name: 'South-East', dx: 0.71, dy: 0.71 },
  { name: 'South', dx: 0, dy: 1 },
  { name: 'South-West', dx: -0.71, dy: 0.71 },
  { name: 'West', dx: -1, dy: 0 },
  { name: 'North-West', dx: -0.71, dy: -0.71 }
];

let deviationDistanceMeters = 0;
let driftDirection = 'Direct Hit';
const finalImpact = { x: targetX, y: targetY };

if (accuracyCheck.crit) {
  deviationDistanceMeters = 0;
  driftDirection = 'Dead Center (Direct Kinetic Impact)';
} else if (accuracyCheck.success) {
  // Minor scatter (1d4 meters)
  deviationDistanceMeters = Dice.d(4);
  const dirIndex = Dice.d(8) - 1;
  const dir = directions[dirIndex];
  driftDirection = dir.name;
  finalImpact.x = Math.round(targetX + dir.dx * deviationDistanceMeters * 10);
  finalImpact.y = Math.round(targetY + dir.dy * deviationDistanceMeters * 10);
} else {
  // Heavy scatter (2d10 meters)
  deviationDistanceMeters = Dice.d(10) + Dice.d(10);
  const dirIndex = Dice.d(8) - 1;
  const dir = directions[dirIndex];
  driftDirection = dir.name;
  finalImpact.x = Math.round(targetX + dir.dx * deviationDistanceMeters * 10);
  finalImpact.y = Math.round(targetY + dir.dy * deviationDistanceMeters * 10);
}

const baseWarheadDamage = 60;
return {
  aimTarget: { x: targetX, y: targetY },
  accuracyRoll: accuracyCheck.total,
  directHit: accuracyCheck.crit || deviationDistanceMeters === 0,
  driftDirection,
  deviationMeters: deviationDistanceMeters,
  actualImpact: finalImpact,
  blastRadiusTiers: [
    { radiusMeters: 3, damage: baseWarheadDamage, lethalZone: true },
    { radiusMeters: 6, damage: Math.round(baseWarheadDamage * 0.5), shockwaveZone: true },
    { radiusMeters: 10, damage: Math.round(baseWarheadDamage * 0.25), shrapnelZone: true }
  ]
};`
  },
  {
    id: 'faction_morale_rout',
    name: 'Squad Morale & Tactical Rout Check',
    category: 'Game Logic',
    description: 'Determines if an enemy squad holds position, retreats, breaks in panic, or surrenders under heavy casualties.',
    code: `// Squad Morale & Tactical Rout Resolver
const initialSquadSize = 8;
const casualtiesTaken = 5;
const officerFallen = true;
const squadWillpowerBonus = 2;

const remaining = initialSquadSize - casualtiesTaken;
const casualtyRate = casualtiesTaken / initialSquadSize;

// Base DC 10 + difficulty per casualty bracket
let moraleDc = 10;
if (casualtyRate >= 0.75) moraleDc = 18;
else if (casualtyRate >= 0.50) moraleDc = 14;
else if (casualtyRate >= 0.25) moraleDc = 11;

if (officerFallen) moraleDc += 4; // Chain of command broken

const moraleCheck = Dice.check2d10(squadWillpowerBonus, moraleDc);
let tacticalDecision = 'HOLD_GROUND';
let formationEffect = '';

if (moraleCheck.crit) {
  tacticalDecision = 'FANATICAL_STAND';
  formationEffect = 'Squad enters desperate last stand. +2 to attack rolls, immune to suppression for 2 rounds.';
} else if (moraleCheck.success) {
  tacticalDecision = 'DISCIPLINED_FALLBACK';
  formationEffect = 'Squad conducts organized bounding retreat to secondary hard cover.';
} else if (moraleCheck.margin <= -8 || moraleCheck.fumble) {
  tacticalDecision = 'SURRENDER_OR_PANIC';
  formationEffect = 'Survivors throw down weapons, raise hands or scatter in blind terror. Combat ends for squad.';
} else {
  tacticalDecision = 'DISORGANIZED_ROUT';
  formationEffect = 'Squad breaks formation and flees toward the nearest extraction point.';
}

return {
  initialSquadSize,
  remainingSquadSize: remaining,
  casualtyPercentage: \`\${Math.round(casualtyRate * 100)}%\`,
  officerFallen,
  moraleDc,
  moraleCheck: {
    dice: moraleCheck.dice,
    total: moraleCheck.total,
    margin: moraleCheck.margin,
    outcome: moraleCheck.outcome
  },
  decision: tacticalDecision,
  tacticalOrders: formationEffect
};`
  },
  {
    id: 'psionic_void_resonance',
    name: 'Psionic / Metaphysical Warp Surge Table',
    category: 'Game Logic',
    description: 'Rolls percentile backlash on the BASTION metaphysical anomaly table during high-potency psionic activation.',
    code: `// Psionic / Metaphysical Anomaly Surge Matrix
const powerLevel = 3; // 1 to 5
const roll = Dice.d100();
// Power level increases instability
const effectiveRoll = MathOps.clamp(roll + (powerLevel - 1) * 5, 1, 100);

let tier = '';
let anomaly = '';
let mechanicalEffect = '';

if (effectiveRoll <= 15) {
  tier = 'Harmonic Resonance';
  anomaly = 'Psionic currents align with the planetary magnetic field.';
  mechanicalEffect = 'Focus refunded immediately. +2 to next Psionic action within 1 round.';
} else if (effectiveRoll <= 35) {
  tier = 'Minor Sensory Distortion';
  anomaly = 'Air turns cold, lights flicker, radio headsets emit echoing whispers.';
  mechanicalEffect = 'All creatures within 10m suffer -1 to Perception checks for 1 turn.';
} else if (effectiveRoll <= 60) {
  tier = 'Chronal Micro-Stutter';
  anomaly = 'Localized time dilation stutters for the operative.';
  mechanicalEffect = 'Caster teleports 3m in a random direction; loses their minor action this round.';
} else if (effectiveRoll <= 80) {
  tier = 'Kinetic Shockwave';
  anomaly = 'Violent sub-space pressure releases in a sudden outward burst.';
  mechanicalEffect = 'All creatures within 5m take 2d6 kinetic damage and must pass Agility DC 13 or fall Prone.';
} else if (effectiveRoll <= 95) {
  tier = 'Neural Feedback Burn';
  anomaly = 'Severe cerebral blowback arcs through the neural cortex.';
  mechanicalEffect = 'Caster suffers 3d8 psychic damage ignoring armor and is Stunned for 1 turn.';
} else {
  tier = 'Sub-Space Rift Breach';
  anomaly = 'A micro-singularity tears through reality, pulling matter inward.';
  mechanicalEffect = 'Gravitational vortex opens for 3 turns. 4d10 void damage to anything within 4m of the singularity.';
}

return {
  castPowerLevel: powerLevel,
  naturalRoll: roll,
  effectiveRoll,
  tier,
  phenomenon: anomaly,
  mechanics: mechanicalEffect
};`
  },
  {
    id: 'vacuum_decompression',
    name: 'Environmental Exposure & Hull Breach',
    category: 'Traps & Sensors',
    description: 'Simulates atmospheric blowout, room volume decompression countdown, hypoxia, and frostbite damage.',
    code: `// Vacuum Decompression & Atmospheric Venting Simulator
const roomVolumeCubicMeters = 120;
const breachDiameterMeters = 0.5;
const operativeSuitType = 'Tactical EVA Suit'; // 'Unarmored', 'Standard Fatigue', 'Tactical EVA Suit'
const suitIntegrityPercent = 85;

// Air evacuation formula: ~ seconds to vacuum
const evacuationRate = breachDiameterMeters * 40; // m3 / sec
const secondsToDepletion = MathOps.clamp(Math.round(roomVolumeCubicMeters / evacuationRate), 4, 60);
const combatRoundsToZeroAtmo = Math.ceil(secondsToDepletion / 6); // 6s per round

let oxygenReserveRounds = 0;
let hypothermiaRisk = 'Extreme';
let survivalAdvice = '';

if (operativeSuitType === 'Tactical EVA Suit') {
  oxygenReserveRounds = Math.floor(100 * (suitIntegrityPercent / 100));
  hypothermiaRisk = 'Protected (Internal Thermal Reactor Active)';
  survivalAdvice = 'Suit seal intact. Secure magnetic mag-boots to deck plates.';
} else if (operativeSuitType === 'Standard Fatigue') {
  oxygenReserveRounds = 3;
  hypothermiaRisk = 'High (-2 Vitality per round after breath expires)';
  survivalAdvice = 'Emergency airlock seal required immediately. Seal helmet or face mask!';
} else {
  oxygenReserveRounds = 1;
  hypothermiaRisk = 'Lethal (Unconscious in 1 round, Death in 3 rounds)';
  survivalAdvice = 'Catastrophic decompression. Seek immediate pressurized refuge!';
}

return {
  roomVolume: \`\${roomVolumeCubicMeters} m³\`,
  breachDiameter: \`\${breachDiameterMeters} m\`,
  timeToCompleteVacuum: \`\${secondsToDepletion} seconds (\${combatRoundsToZeroAtmo} combat rounds)\`,
  suitEquipped: operativeSuitType,
  suitIntegrity: \`\${suitIntegrityPercent}%\`,
  operativeOxygenSupply: \`\${oxygenReserveRounds} rounds remaining\`,
  thermalRisk: hypothermiaRisk,
  tacticalDirective: survivalAdvice
};`
  },
  {
    id: 'black_market_haggle',
    name: 'Dynamic Black Market Barter Calculator',
    category: 'Economy & Loot',
    description: 'Calculates transaction price discounts or surcharges based on Streetwise skill, vendor Greed, and Syndicate reputation.',
    code: `// Black Market Barter & Syndicate Influence Calculator
const baseMarketPrice = 1200; // Credits
const buyerStreetwiseBonus = 4;
const vendorGreedRating = 3; // 1 (Honest) to 5 (Cutthroat)

// Retrieve global story flag for Syndicate standing (default 0)
const syndicateRep = StoryFlags.get('syndicate_reputation', 0); // e.g. -10 to +10

// Contest: Buyer Streetwise vs Vendor Greed Base (10 + Greed * 2)
const vendorDc = 10 + (vendorGreedRating * 2) - Math.floor(syndicateRep / 2);
const haggleCheck = Dice.check2d10(buyerStreetwiseBonus, vendorDc);

let priceMultiplier = 1.0;
let transactionMood = 'NEUTRAL';

if (haggleCheck.crit || haggleCheck.margin >= 6) {
  priceMultiplier = 0.70; // 30% discount
  transactionMood = 'COOPERATIVE_DEAL';
} else if (haggleCheck.success) {
  priceMultiplier = 0.85; // 15% discount
  transactionMood = 'FAIR_EXCHANGE';
} else if (haggleCheck.margin >= -4) {
  priceMultiplier = 1.15; // 15% markup
  transactionMood = 'SUSPICIOUS_PRICE_HIKE';
} else {
  priceMultiplier = 1.40; // 40% predatory gouging
  transactionMood = 'PREDATORY_EXTORTION';
}

const finalPrice = Math.round(baseMarketPrice * priceMultiplier);
const savings = baseMarketPrice - finalPrice;

return {
  itemBasePrice: baseMarketPrice,
  syndicateReputation: syndicateRep,
  vendorGreed: vendorGreedRating,
  bargainRoll: haggleCheck.total,
  vendorThresholdDc: vendorDc,
  outcome: haggleCheck.outcome,
  sentiment: transactionMood,
  finalPriceCredits: finalPrice,
  difference: savings > 0 ? \`Saved \${savings} credits\` : \`Surcharged \${Math.abs(savings)} credits\`
};`
  },
  {
    id: 'security_turret_ai',
    name: 'Automated Sentry Tracking Loop',
    category: 'Combat Rules',
    description: 'Simulates automated ceiling sentry gun scanning, IFF interrogator ping, tracking lead, and burst fire damage.',
    code: `// Automated Sentry Turret Engagement AI
const targetOperative = 'Infiltrator Rex';
const targetDistanceMeters = 18;
const targetCover = 'HALF'; // 'NONE', 'HALF', 'FULL'
const targetHasIFFTransponder = false;

// 1. Interrogate IFF
if (targetHasIFFTransponder) {
  return {
    target: targetOperative,
    iffStatus: 'VERIFIED_FRIENDLY',
    sentryAction: 'STANDBY_TRACKING',
    narrative: 'Sentry ping received valid transponder key. Weapons held in standby mode.'
  };
}

if (targetCover === 'FULL') {
  return {
    target: targetOperative,
    iffStatus: 'UNAUTHORIZED_INTRUDER',
    sentryAction: 'ACQUIRING_LOCK_OBSTRUCTED',
    narrative: 'Target is behind full cover. Sentry pre-charging capacitors and scanning egress vectors.'
  };
}

// 2. Compute Tracking Lead & Accuracy
const baseTurretTrackingBonus = 5;
const coverPenalty = targetCover === 'HALF' ? 3 : 0;
const targetReflexDc = 13 + coverPenalty;

const targetingCheck = Dice.check2d10(baseTurretTrackingBonus, targetReflexDc);

let roundsLanded = 0;
let damagePerRound = 8;
let suppressiveEffect = false;

if (targetingCheck.crit) {
  roundsLanded = 3; // Full 3-round burst
  damagePerRound = 12;
  suppressiveEffect = true;
} else if (targetingCheck.success) {
  roundsLanded = 2;
  suppressiveEffect = true;
} else if (targetingCheck.margin >= -2) {
  roundsLanded = 1;
}

const totalDamage = roundsLanded * damagePerRound;

return {
  target: targetOperative,
  iffStatus: 'UNAUTHORIZED_TARGET',
  targetCover,
  trackingRoll: targetingCheck.total,
  targetEvasionDc: targetReflexDc,
  burstOutcome: targetingCheck.outcome,
  roundsHit: \`\${roundsLanded} of 3 Plasma Slugs\`,
  totalDamageInflicted: totalDamage,
  conditionApplied: suppressiveEffect ? 'Suppressed (-2 to next move & attack)' : 'None',
  narrative: roundsLanded > 0
    ? \`Sentry tracking servos whirred, scoring \${roundsLanded} direct kinetic hits for \${totalDamage} damage!\`
    : 'Sentry plasma burst sheared harmlessly into bulkhead plating.'
};`
  }
];
