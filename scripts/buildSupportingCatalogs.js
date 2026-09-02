import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const omnicortexRoot = path.join(projectRoot, 'src', 'data', 'omnicortex');
const supportingJsPath = path.join(projectRoot, 'src', 'data', 'supportingCatalogsData.js');
const jsonBackupDir = path.join(projectRoot, 'docs', 'recommendations and revison plans', 'omnicortex json', 'current collection');

console.log('================================================================');
console.log('STARTING MASTER SUPPORTING CATALOGS INGESTION & GENERATION');
console.log('================================================================');

if (!fs.existsSync(omnicortexRoot)) fs.mkdirSync(omnicortexRoot, { recursive: true });
if (!fs.existsSync(jsonBackupDir)) fs.mkdirSync(jsonBackupDir, { recursive: true });

const standardCostsAndSockets = {
  costs: { bp: 0, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
  modifiers: [],
  modifications: [],
  critical_details: { score: '', effect: [], success_effect: [], failure_effect: [] },
  sockets: { max: 0, used: 0, tier: 'Socket', allocated: [] }
};

// 1. Augmentation Types (11 entries)
const AUGMENTATION_TYPES = [
  { id: 'aug_type-sensory', name: 'Sensory Modifications', tl: 3, bp: 2, nodes: 2, description: 'Nightvision, radar/sonar, teleoptics, acoustic enhancers, bug detectors, and multispectral vision suites.' },
  { id: 'aug_type-neural', name: 'Brain & Neural Mods', tl: 3, bp: 2, nodes: 2, description: 'Neural processors, ghost jacks, skill circuitry, reflex co-processors, memory buffers, and cyber-occult links.' },
  { id: 'aug_type-bioware', name: 'TL4 Enhanced (Bioware)', tl: 4, bp: 2, nodes: 5, description: 'Seamless biological and cellular enhancement. Immune to Massive Damage disablement; naturally regenerates 1 SP/hour.' },
  { id: 'aug_type-nanotech', name: 'TL5 Advanced (Nanotech)', tl: 5, bp: 1, nodes: 3, description: 'Half BP cost (min 1). Morphic, weightless reality-warping nanotechnology and sub-atomic cell manipulation.' },
  { id: 'aug_type-fbc', name: 'Full Body Conversion (FBC)', tl: 3, bp: 10, nodes: 200, description: 'Total synthetic chassis conversion replacing 100% of organic biology (200 Nodes, 260 Structure Points).' },
  { id: 'aug_type-wearable', name: 'Pseudo-Cybernetics (Wearable)', tl: 3, bp: 0, nodes: 10, description: 'External modular harnesses, gauntlets, and exo-rigs hosting internal node modifications without biological strain.' },
  { id: 'aug_type-metaphysical', name: 'Metaphysical Augmentation', tl: 4, bp: 2, nodes: 10, description: 'Imbued occult tattoos, psi-crystal nodes, resonance conduits, and cyber-metaphysical channeling sockets.' },
  { id: 'aug_type-dermal', name: 'Dermal Plating & Subdermal Armor', tl: 3, bp: 2, nodes: 4, description: 'Subdermal ballistic weaves, kinetic mesh, composite skull plates, and subcutaneous energy absorption grids.' },
  { id: 'aug_type-musculoskeletal', name: 'Musculoskeletal & Cyber-Limbs', tl: 3, bp: 3, nodes: 6, description: 'Myomer muscle replacements, reinforced titanium skeleton, hydraulic jump servos, and strength-enhancing servos.' },
  { id: 'aug_type-internal-organs', name: 'Internal Organ Replacements', tl: 3, bp: 2, nodes: 3, description: 'Synthetic secondary heart, toxic filtration liver, metabolic regulators, and cybernetic lungs.' },
  { id: 'aug_type-weapon-mounts', name: 'Concealed Weapon Mounts', tl: 3, bp: 1, nodes: 2, description: 'Internal chassis compartments, pop-up forearm blades, palm pulse emitters, and sub-dermal dart launchers.' }
];

// 2. Body Locations (10 entries)
const BODY_LOCATIONS = [
  { id: 'loc-head', name: 'Head / Cranium', maxNodes: 10, maxSockets: 1, baseSP: 20, isHardened: true, description: 'Neural processors, sensory optics, hearing suites, cranial armor, and comm-mesh nodes.' },
  { id: 'loc-torso', name: 'Torso / Core', maxNodes: 50, maxSockets: 5, baseSP: 100, isHardened: true, description: 'Core chassis, cardiopulmonary systems, dermal plating, internal power generators, and metabolic regulators.' },
  { id: 'loc-left-arm', name: 'Left Arm', maxNodes: 30, maxSockets: 3, baseSP: 30, isHardened: false, description: 'Hand, forearm, shoulder servo, concealed tools, weapon hardpoints, and smart-link interfaces.' },
  { id: 'loc-right-arm', name: 'Right Arm', maxNodes: 30, maxSockets: 3, baseSP: 30, isHardened: false, description: 'Hand, forearm, shoulder servo, weapon mounts, recoil compensators, and manipulator tools.' },
  { id: 'loc-left-leg', name: 'Left Leg', maxNodes: 40, maxSockets: 4, baseSP: 40, isHardened: false, description: 'Foot, ankle, shin, thigh, hydraulic jump boosters, kinetic dampeners, and speed servomotors.' },
  { id: 'loc-right-leg', name: 'Right Leg', maxNodes: 40, maxSockets: 4, baseSP: 40, isHardened: false, description: 'Foot, ankle, shin, thigh, hydraulic jump boosters, kinetic dampeners, and speed servomotors.' },
  { id: 'loc-systemic', name: 'Full Body / Systemic', maxNodes: 200, maxSockets: 20, baseSP: 260, isHardened: false, description: 'System-wide vascular networks, full-body nano-colonies, and total synthetic chassis replacements.' },
  { id: 'loc-tail', name: 'Tail / Auxiliary Appendage', maxNodes: 20, maxSockets: 2, baseSP: 20, isHardened: false, description: 'Prehensile tail, stinger mechanism, balancing gyro, or third manipulator arm.' },
  { id: 'loc-wings', name: 'Wings / Flight Assembly', maxNodes: 30, maxSockets: 3, baseSP: 30, isHardened: false, description: 'Retractable glider wings, micro-thrusters, anti-grav levitation vanes, and atmospheric repulsors.' },
  { id: 'loc-subdermal', name: 'Subdermal Sheath / Vascular', maxNodes: 50, maxSockets: 5, baseSP: 50, isHardened: false, description: 'Subcutaneous protective sheath, subdermal armor weave, vascular nanites, and pigment shift layers.' }
];

// 3. Area Patterns (11 entries)
const AREA_PATTERNS = [
  { id: 'area-single-target', name: 'Single Target (+0 DC)', dcMod: 0, description: 'Affects exactly one targeted creature or individual object with pinpoint precision.' },
  { id: 'area-line-ray', name: 'Line / Ray (5ft wide) (+0 DC)', dcMod: 0, description: 'Projects a narrow 5-foot-wide linear beam or projectile path along the line of fire.' },
  { id: 'area-small-burst', name: 'Small Burst (10ft Radius) (+2 DC)', dcMod: 2, description: 'Expands into a 10-foot radius sphere covering a standard room, doorway, or vehicle interior.' },
  { id: 'area-medium-burst', name: 'Medium Burst (20ft Radius) (+5 DC)', dcMod: 5, description: 'Detonates in a 20-foot radius sphere covering an entire hall, street intersection, or squad formation.' },
  { id: 'area-cone', name: 'Cone / Emanation (+5 DC)', dcMod: 5, description: 'Spreads outward from the caster hands or muzzle in a widening cone equal to range length.' },
  { id: 'area-large-burst', name: 'Large Burst (50ft+ Radius) (+10 DC)', dcMod: 10, description: 'Massive battlefield detonation blanketing an entire district or facility wing.' },
  { id: 'area-wall', name: 'Wall / Barrier (+5 DC)', dcMod: 5, description: 'Manifests a continuous physical or energy barrier up to 10ft high by 30ft long.' },
  { id: 'area-cylinder', name: 'Cylinder / Pillar (+5 DC)', dcMod: 5, description: 'Calls down a 10ft radius, 40ft high vertical pillar of energy or gravitational force.' },
  { id: 'area-selective', name: 'Selective Shaping (+5 DC)', dcMod: 5, description: 'Allows the user to sculpt the area of effect, carving out safe zones for allies.' },
  { id: 'area-aura', name: 'Aura / Pulse (+3 DC)', dcMod: 3, description: 'Radiates in a continuous 10-foot emanation surrounding the user as they move.' },
  { id: 'area-chain', name: 'Chain / Arcing (+4 DC)', dcMod: 4, description: 'Arcs from the primary target to up to 3 secondary targets within 15 feet.' }
];

// 4. Effect Types (16 entries)
const EFFECT_TYPES = [
  { id: 'effect-kinetic-bludgeon', name: 'Kinetic (Bludgeoning)', type: 'Physical', description: 'Crushing impact trauma. Subject to standard physical Armor Damage Resistance (DR).' },
  { id: 'effect-kinetic-pierce', name: 'Kinetic (Piercing)', type: 'Physical', description: 'High-velocity puncturing force optimized for armor penetration.' },
  { id: 'effect-kinetic-slash', name: 'Kinetic (Slashing)', type: 'Physical', description: 'Severing and lacerating physical edge damage capable of inflicting deep bleeding wounds.' },
  { id: 'effect-force', name: 'Force / Aether', type: 'Metaphysical', description: 'Pure condensed kinetic pressure that bypasses 50% of target physical Armor DR.' },
  { id: 'effect-pyro', name: 'Thermal (Pyro / Fire)', type: 'Energy', description: 'Superheated plasma and combustion. Triggers secondary burning status effects.' },
  { id: 'effect-cryo', name: 'Thermal (Cryo / Cold)', type: 'Energy', description: 'Sub-zero thermal drain. Triggers frostbite, slow, and brittle structure effects.' },
  { id: 'effect-voltic', name: 'Voltic (Electrical / EMP)', type: 'Energy', description: 'High-voltage ionization. Deals extra damage to synthetic chassis and disrupts electronics.' },
  { id: 'effect-sonic', name: 'Sonic / Resonant', type: 'Energy', description: 'Harmonic vibrational trauma that bypasses rigid armor plates to shatter internal organs.' },
  { id: 'effect-corrosive', name: 'Corrosive (Acid / Chemical)', type: 'Chemical', description: 'Degrades armor Structure Points and inflicts lingering damage over time.' },
  { id: 'effect-radiant', name: 'Radiant (Light / Solar)', type: 'Energy', description: 'Coherent photons and holy solar energy capable of blinding targets and purging corruptions.' },
  { id: 'effect-void', name: 'Void (Graviton / Entropy)', type: 'Metaphysical', description: 'Dark energy and spatial compression that pulls targets and crushes matter.' },
  { id: 'effect-psychic', name: 'Psychic / Psionic', type: 'Metaphysical', description: 'Direct mental shockwave attacking neural pathways, bypassing all physical armor.' },
  { id: 'effect-disintegration', name: 'Disintegration', type: 'Exotic', description: 'Breaks atomic bonds directly, dissolving matter into ash upon reaching 0 SP.' },
  { id: 'effect-temporal', name: 'Temporal / Chrono', type: 'Metaphysical', description: 'Alters local time-flow, inflicting stasis, slowing reactions, or rapid cellular aging.' },
  { id: 'effect-spatial', name: 'Spatial / Warp', type: 'Metaphysical', description: 'Rips local dimensional geometry to teleport, displace, or shear physical objects.' },
  { id: 'effect-biological', name: 'Biological (Toxin / Disease)', type: 'Biological', description: 'Neurotoxins, hemotoxins, and cellular mutagens requiring Fortitude saves.' }
];

// 5. Ranges (9 entries)
const RANGES = [
  { id: 'range-self-touch', name: 'Self / Touch (-2 DC)', dcMod: -2, distance: 'Touch / 0 ft', description: 'Requires physical direct contact with the target or applies internally to the user.' },
  { id: 'range-close', name: 'Close (25ft) (+0 DC)', dcMod: 0, distance: '25 ft + 5ft/2 Ranks', description: 'Short tactical distance; ideal for standard room clearing and close combat.' },
  { id: 'range-medium', name: 'Medium (100ft) (+2 DC)', dcMod: 2, distance: '100 ft + 10ft/Rank', description: 'Standard mid-range engagement distance across streets and open fields.' },
  { id: 'range-long', name: 'Long (400ft) (+5 DC)', dcMod: 5, distance: '400 ft + 40ft/Rank', description: 'Long-range engagement distance across large battlefields and perimeter zones.' },
  { id: 'range-extreme', name: 'Extreme / Sniper (1,000ft+) (+8 DC)', dcMod: 8, distance: '1,000+ ft', description: 'Extreme long-range fire requiring dedicated optics or stabilized targeting mounts.' },
  { id: 'range-line-of-sight', name: 'Line of Sight (+10 DC)', dcMod: 10, distance: 'Visual Horizon', description: 'Any visible target within uninterrupted visual line of sight.' },
  { id: 'range-planetary', name: 'Planetary / Global (+15 DC)', dcMod: 15, distance: 'Planetary Surface', description: 'Reaches anywhere across the curvature of the planetary body via orbital relays.' },
  { id: 'range-interplanetary', name: 'Interplanetary / System (+20 DC)', dcMod: 20, distance: 'Star System', description: 'Transmits across astronomical units within a local star system.' },
  { id: 'range-planar', name: 'Planar / Dimensional (+25 DC)', dcMod: 25, distance: 'Multiverse / Aether', description: 'Crosses dimensional rifts and connects between parallel reality planes.' }
];

// 6. Target Specifications (10 entries)
const TARGET_SPECIFICATIONS = [
  { id: 'target-self', name: 'Self Only', description: 'The power or module functions exclusively on the user chassis.' },
  { id: 'target-single-creature', name: 'Single Creature', description: 'Targets any single biological or synthetic entity within range.' },
  { id: 'target-willing', name: 'Willing Creature', description: 'Requires the target voluntary consent; fails automatically against resistant minds.' },
  { id: 'target-hostile', name: 'Unwilling / Hostile Creature', description: 'Direct offensive targeting requiring defense check vs Attune/Skill DC.' },
  { id: 'target-point-in-space', name: 'Point in Space', description: 'A designated coordinate in three-dimensional space for area origins or portals.' },
  { id: 'target-object', name: 'Object / Construct', description: 'Targets inanimate hardware, structural modules, weapons, or vehicles.' },
  { id: 'target-area-surface', name: 'Area / Surface', description: 'Covers a physical wall, floor, bulkhead, or planetary terrain zone.' },
  { id: 'target-mind', name: 'Mind / Consciousness', description: 'Targets neural architecture, ego matrices, or organic brains directly.' },
  { id: 'target-spirit', name: 'Spirit / Soul', description: 'Targets the metaphysical lodestar, aura, or essence signature of a creature.' },
  { id: 'target-electronic', name: 'Electronic Device / AI Core', description: 'Targets computer systems, comms relays, cyberdecks, or synthetic logic circuits.' }
];

// 7. Critical Effects (12 entries)
const CRITICAL_EFFECTS = [
  { id: 'crit-stunned', name: 'Stunned (1 Round)', description: 'Target loses their next turn of actions and suffers -4 to all defenses.' },
  { id: 'crit-bleed', name: 'Bleed (1d6 / round)', description: 'Inflicts persistent bleeding damage at the start of each turn until treated with Medical DC 15.' },
  { id: 'crit-disarmed', name: 'Disarmed', description: 'Target held weapon or item is knocked 15 feet away into an adjacent hex.' },
  { id: 'crit-knockdown', name: 'Knocked Prone', description: 'Target is slammed into the ground, must spend movement to stand up.' },
  { id: 'crit-armor-sunder', name: 'Armor Sundered (-2 DR)', description: 'Permanently reduces the target equipped armor DR by 2 points until repaired.' },
  { id: 'crit-severe-fracture', name: 'Severe Fracture (-2 Checks)', description: 'Broken bone or shattered joint; target suffers -2 to all physical attribute checks.' },
  { id: 'crit-blinding', name: 'Blinding Flash', description: 'Target is completely blinded for 1d4 rounds, suffering 50% miss chance on all attacks.' },
  { id: 'crit-amputation', name: 'Amputation / Dismemberment', description: 'A targeted limb is severed or mangled beyond function (requires cybernetic replacement).' },
  { id: 'crit-weapon-destroyed', name: 'Weapon Destroyed', description: 'The opponent parrying weapon or tool suffers immediate structural catastrophic failure.' },
  { id: 'crit-internal-hemorrhage', name: 'Internal Hemorrhage', description: 'Internal organ damage; target suffers -2 Stamina and 1d8 ongoing damage.' },
  { id: 'crit-system-shutdown', name: 'System Shutdown / EMP Lock', description: 'Synthetic chassis or cybernetics freeze for 1 round, immobilizing the target.' },
  { id: 'crit-vulnerable', name: 'Vulnerable (+4 Incoming Attacks)', description: 'Target defenses are completely compromised; next attack against them gains +4 to hit.' }
];

// 8. Critical Success Effects (8 entries)
const CRITICAL_SUCCESS_EFFECTS = [
  { id: 'crit_succ-double-damage', name: 'Double Base Damage', description: 'All base weapon damage dice are doubled before applying bonuses.' },
  { id: 'crit_succ-max-damage', name: 'Maximum Variable Damage', description: 'All damage dice roll their maximum possible numeric values automatically.' },
  { id: 'crit_succ-free-action', name: 'Free Action Refund', description: 'The action cost of this invocation or attack is fully refunded, granting an immediate bonus action.' },
  { id: 'crit_succ-elemental-surge', name: 'Lingering Elemental Surge', description: 'Ignites a lingering elemental hazard dealing 1d6 damage in the target hex for 3 rounds.' },
  { id: 'crit_succ-instant-pin', name: 'Instant Pin / Grapple', description: 'Target is immediately restrained and pinned without requiring a secondary grapple roll.' },
  { id: 'crit_succ-overwhelming-ap', name: 'Overwhelming Penetration (Ignore All DR)', description: 'The attack completely punches through all armor, ignoring 100% of the target DR.' },
  { id: 'crit_succ-extended-duration', name: 'Extended Duration (x2)', description: 'The duration of the buff or hazard is doubled without additional resource cost.' },
  { id: 'crit_succ-resource-refund', name: 'Resource / Focus Refund', description: 'Refunds all spent Essence, Focus, or ammunition expended during the action.' }
];

// 9. Critical Failure Effects (8 entries)
const CRITICAL_FAILURE_EFFECTS = [
  { id: 'crit_fail-jammed', name: 'Weapon Jammed', description: 'The firearm mechanism or actuator jams; requires 1 full Action to clear.' },
  { id: 'crit_fail-misfire', name: 'Weapon Misfire / Self Damage', description: 'The weapon backfires, dealing half base damage directly to the user.' },
  { id: 'crit_fail-overheat', name: 'Energy Overheat / Venting', description: 'Energy cell or barrel vents superheated gas; weapon cannot fire for 1 round.' },
  { id: 'crit_fail-prone', name: 'Loss of Balance / Prone', description: 'User trips or overextends, falling prone in their current hex.' },
  { id: 'crit_fail-fumble', name: 'Fumble / Drop Weapon', description: 'User loses their grip, dropping the weapon 5 feet away.' },
  { id: 'crit_fail-meta-backlash', name: 'Meta Backlash (The Burn)', description: 'Metaphysical feedback inflicts 1d6 unpreventable damage directly to user Health.' },
  { id: 'crit_fail-power-depleted', name: 'Power Cell Depleted', description: 'Battery or capacitor burns out instantly, requiring a fresh reload.' },
  { id: 'crit_fail-disoriented', name: 'Disoriented (-2 to Next Roll)', description: 'Sudden sensory disorientation imposes -2 on the user next turn action.' }
];

// 10. Materials & Composites (10 entries)
const MATERIALS = [
  { id: 'mat-hide-bone', name: 'Hide & Bone (TL 0)', tl: 0, drPercent: 25, spMult: 0.25, description: 'Primitive natural hides, cured sinew, and carved bone plating. Degrades under sustained impact.' },
  { id: 'mat-steel', name: 'Iron & Steel Plate (TL 1)', tl: 1, drPercent: 50, spMult: 0.5, description: 'Forged high-carbon steel plates. Heavy mass imposes minor agility check penalties.' },
  { id: 'mat-kevlar-ceramic', name: 'Kevlar & Ceramic Alloy (TL 2)', tl: 2, drPercent: 75, spMult: 1.0, description: 'Modern ballistic synthetic weave with strike-face ceramic tiles. Standard kinetic resistance.' },
  { id: 'mat-plasteel', name: 'Plasteel & Impact Gel (TL 3)', tl: 3, drPercent: 100, spMult: 1.5, description: 'Standard space-age composite. Lightweight, hermetically sealed, with non-Newtonian impact gel buffers.' },
  { id: 'mat-nanocarbon', name: 'Nanocarbon & Phase-Shift (TL 4)', tl: 4, drPercent: 125, spMult: 2.0, description: 'Molecularly aligned carbon nanotubes with self-repairing lattice (regenerates 1 SP/hour).' },
  { id: 'mat-polymatter', name: 'Polymatter & Hard-Light (TL 5)', tl: 5, drPercent: 150, spMult: 2.5, description: 'Precursor programmable matter and solid photonic lattices. Weightless and morphic.' },
  { id: 'mat-aether-glass', name: 'Aether-Infused Glass', tl: 4, drPercent: 110, spMult: 1.8, description: 'Resonant crystalline silica that conducts metaphysical energies and deflects psychic trauma.' },
  { id: 'mat-chitin-composite', name: 'Chitin Composite', tl: 3, drPercent: 105, spMult: 1.6, description: 'Kitin-inspired bio-ceramic exoskeleton plating with self-knitting biological fibers.' },
  { id: 'mat-void-titanium', name: 'Void-Toughened Titanium', tl: 4, drPercent: 135, spMult: 2.2, description: 'Tempered in the high-gravity vacuum of deep space void rifts, highly resistant to radiation.' },
  { id: 'mat-adamantine', name: 'Adamantine Alloy', tl: 5, drPercent: 160, spMult: 3.0, description: 'Ultra-dense celestial metal that renders armor impervious to critical sundering.' }
];

// 11. Resistances & Defenses (10 entries)
const RESISTANCES = [
  { id: 'res-kinetic', name: 'Kinetic Resistance', description: 'Reduces damage from ballistic bullets, slashing blades, and crushing bludgeons.' },
  { id: 'res-energy', name: 'Energy / Laser Resistance', description: 'Deflects and dissipates coherent light, blasters, and directed-energy beams.' },
  { id: 'res-thermal', name: 'Thermal / Fire Resistance', description: 'Insulates against superheated plasma, incendiary munitions, and open flame.' },
  { id: 'res-cryo', name: 'Cryo / Cold Resistance', description: 'Thermal barriers preventing freeze damage, hypothermia, and brittle fracture.' },
  { id: 'res-voltic', name: 'Voltic / EMP Resistance', description: 'Faraday lining that insulates synthetic chassis and cybernetics from electrical shock.' },
  { id: 'res-corrosive', name: 'Corrosive / Acid Resistance', description: 'Chemically inert coating preventing chemical dissolution and lingering burn.' },
  { id: 'res-sonic', name: 'Sonic Resistance', description: 'Dampening foam and acoustic baffles that neutralize vibrational frequencies.' },
  { id: 'res-psychic', name: 'Metaphysical / Psychic Resistance', description: 'Psi-shielding and lead-crystal lattice that protects the mind from mental attacks.' },
  { id: 'res-environmental', name: 'Environmental Seal (Vacuum/Toxin)', description: 'Full hermetic life-support seal protecting against vacuum, zero pressure, and bio-hazards.' },
  { id: 'res-radiation', name: 'Radiation Shielding', description: 'Dense lead and magnetic shielding protecting against cosmic rays and fallout.' }
];

// 12. Weapon & Armor Modes (8 entries)
const MODES = [
  { id: 'mode-semi-auto', name: 'Semi-Automatic (1 Shot)', description: 'Fires one precise projectile per attack action, maximizing accuracy.' },
  { id: 'mode-burst', name: '3-Round Burst', description: 'Fires a rapid 3-round burst, granting +2 to strike against a single target.' },
  { id: 'mode-full-auto', name: 'Full Automatic', description: 'Continuous automatic fire capable of laying down area suppression or multi-target sweeps.' },
  { id: 'mode-overcharge', name: 'Overcharge Mode', description: 'Draws double power to add +1d8 extra damage, generating heat.' },
  { id: 'mode-stun', name: 'Stun / Non-Lethal Setting', description: 'Toggles weapon output to electrical non-lethal subdual damage.' },
  { id: 'mode-precision', name: 'Precision Aim Mode', description: 'Requires a steady stance; grants +4 accuracy and +1 Penetration on next shot.' },
  { id: 'mode-scatter', name: 'Scatter / Wide Spread', description: 'Toggles muzzle choke to hit all targets in a 10ft frontal cone.' },
  { id: 'mode-brace', name: 'Defensive Brace', description: 'Armor locks joints in place, granting +4 DR and immunity to knockdown at the cost of movement.' }
];

// 13. Weapon Specials (10 entries)
const SPECIALS = [
  { id: 'spec-armor-piercing', name: 'Armor Piercing (AP)', description: 'Weapon projectiles or edges bypass a designated amount of target Armor DR.' },
  { id: 'spec-concealable', name: 'Concealable', description: 'Compact frame grants +4 to Stealth checks when concealing on a person.' },
  { id: 'spec-silent', name: 'Silent', description: 'Fires with zero acoustic or flash signature; requires DC 20 Perception to pinpoint.' },
  { id: 'spec-high-recoil', name: 'High Recoil', description: 'Requires Strength 2+ to wield without suffering -2 penalties on follow-up shots.' },
  { id: 'spec-reach', name: 'Reach (10ft)', description: 'Melee weapon allows attacks against opponents 10 feet away without provoking.' },
  { id: 'spec-entangling', name: 'Entangling', description: 'On a successful hit, target is entangled and must pass Agility DC 15 to break free.' },
  { id: 'spec-tripping', name: 'Tripping', description: 'Can be used to execute trip maneuvers to knock opponents prone.' },
  { id: 'spec-guided', name: 'Guided / Tracking', description: 'Smart telemetry micro-thrusters track designated targets around light cover.' },
  { id: 'spec-unreliable', name: 'Unreliable', description: 'Jury-rigged or unstable mechanism; misfires on a natural roll of 1 or 2.' },
  { id: 'spec-quick-swap', name: 'Modular Quick-Swap', description: 'Can swap barrels, scopes, or ammo types as a Free Action.' }
];

// 14. Availability Ratings (8 entries)
const AVAILABILITY = [
  { id: 'avail-common', name: 'Common', description: 'Widely available in any standard civilian shop or colony outpost without restriction.' },
  { id: 'avail-standard', name: 'Standard', description: 'Standard commercial equipment available across all major ports and trade hubs.' },
  { id: 'avail-restricted', name: 'Restricted', description: 'Requires an operator license, corporate charter, or security clearance to purchase.' },
  { id: 'avail-military', name: 'Military Requisition', description: 'Issued exclusively to government military branches and state security forces.' },
  { id: 'avail-rare', name: 'Rare', description: 'Limited production runs or artisan crafted; found only in specialized boutique markets.' },
  { id: 'avail-black-market', name: 'Black Market', description: 'Illegal contraband and shadow syndicate tech procured via underworld connections.' },
  { id: 'avail-prototype', name: 'Prototype / Experimental', description: 'One-of-a-kind classified laboratory test items not in mass production.' },
  { id: 'avail-artifact', name: 'Artifact / Relic', description: 'Ancient precursor deific relic or unique historical treasure of immense power.' }
];

// 15. Gear Categories (10 entries)
const GEAR_CATEGORIES = [
  { id: 'gear_cat-electronics', name: 'Electronics & Computing', description: 'Cyberdecks, data pads, scanners, holocams, neural interfaces, and hacking tools.' },
  { id: 'gear_cat-survival', name: 'Survival & Environmental', description: 'Rations, water scrubbers, respirators, tents, flares, climbing gear, and hazard suits.' },
  { id: 'gear_cat-medical', name: 'Medical & Pharmaceuticals', description: 'Medkits, trauma stims, antitoxins, cellular regenerators, biogel, and surgical kits.' },
  { id: 'gear_cat-tools', name: 'Tools & Engineering', description: 'Plasma torches, multi-wrenches, diagnostic pads, repair nano-paste, and work benches.' },
  { id: 'gear_cat-comms', name: 'Communications & Sensor', description: 'Sub-space transceivers, comm-chips, radar dishes, acoustic probes, and beacon buoys.' },
  { id: 'gear_cat-power', name: 'Power & Energy Cells', description: 'Micro-cells, standard power packs, fusion batteries, solar blankets, and generators.' },
  { id: 'gear_cat-tactical', name: 'Tactical & Field Gear', description: 'Holsters, ammo pouches, grappling hooks, tactical webbing, and night-vision goggles.' },
  { id: 'gear_cat-explosives', name: 'Explosives & Demolitions', description: 'Frag grenades, breach charges, thermal detonators, EMP mines, and detonator cords.' },
  { id: 'gear_cat-meta-tech', name: 'Meta-Tech Devices', description: 'Aetheric resonators, psi-focus crystals, warding seals, and metaphysical conduits.' },
  { id: 'gear_cat-containers', name: 'Containers & Storage', description: 'Lockboxes, tactical backpacks, magnetized crates, and vacuum-sealed cargo pods.' }
];

// 16. Classifications (12 entries)
const CLASSIFICATIONS = [
  { id: 'class-melee-slash', name: 'Melee (Slashing)', description: 'Edged hand-to-hand weapons including swords, combat knives, axes, and energy blades.' },
  { id: 'class-melee-blunt', name: 'Melee (Blunt)', description: 'Impact hand-to-hand weapons including warhammers, batons, maces, and shock clubs.' },
  { id: 'class-melee-pierce', name: 'Melee (Piercing)', description: 'Thrusting hand-to-hand weapons including spears, rapiers, daggers, and lances.' },
  { id: 'class-ranged-ballistic', name: 'Ranged (Ballistic)', description: 'Firearms utilizing chemical propellant or magnetic acceleration to launch physical slugs.' },
  { id: 'class-heavy-ballistic', name: 'Heavy (Ballistic)', description: 'Crew-served or mounted projectile weapons including heavy machine guns and auto-cannons.' },
  { id: 'class-ranged-energy', name: 'Ranged (Energy)', description: 'Direct-fire laser carbines, plasma pistols, particle blasters, and arc throwers.' },
  { id: 'class-heavy-energy', name: 'Heavy (Energy)', description: 'Vehicle or platform mounted plasma cannons, siege lasers, and singularity projectors.' },
  { id: 'class-armor-light', name: 'Light Armor', description: 'Flexible ballistic vests and light armoring offering mobility without agility penalties.' },
  { id: 'class-armor-medium', name: 'Medium Armor', description: 'Reinforced carapace plates and composite suits offering balanced battlefield defense.' },
  { id: 'class-armor-heavy', name: 'Heavy Armor', description: 'Full-body powered plate and exosuits offering maximum physical and energy DR.' },
  { id: 'class-armor-void', name: 'Sealed Void Suit', description: 'Hermetically pressurized atmospheric suit designed for space walks and toxic planets.' },
  { id: 'class-armor-hazard', name: 'Hazard Suit', description: 'Specialized chemical, radiation, and biological isolation suit for industrial disaster zones.' }
];

// 17. Creators & Manufacturers (10 entries)
const CREATORS = [
  { id: 'creator-terran-dynamics', name: 'Terran Dynamics', faction: 'Coalition of Earth', description: 'Industrial megacorp specializing in reliable, rugged ballistic firearms and combat gear.' },
  { id: 'creator-nova-forge', name: 'Nova Forge Armaments', faction: 'The Syndicate', description: 'Cutting-edge corporate manufacturer of laser systems, smart-link tech, and sleek armor.' },
  { id: 'creator-apex-synthetic', name: 'Apex Synthetic Labs', faction: 'Synthetics', description: 'Pioneers in high-density cybernetics, android chassis, and neural processor cores.' },
  { id: 'creator-aeld-ascendancy', name: 'Aeld Ascendancy Fabricators', faction: 'Aeld Ascendancy', description: 'Artisans of living wood-ceramic composites, elegant sun-glaives, and solar-charged tech.' },
  { id: 'creator-asi-bio-weavers', name: 'Asi Bio-Weavers', faction: 'Asi Enclaves', description: 'Masters of organic bioware, living chitin weaves, and metaphysical growth conduits.' },
  { id: 'creator-kitin-forges', name: 'Kitin Chitin Forges', faction: 'Kitin Collective', description: 'Producers of layered bio-metallic chitin plates and biological acid projectile weaponry.' },
  { id: 'creator-shanor-voidsmiths', name: 'Sha’nor Voidsmiths', faction: 'Sha’nor Dominion', description: 'Esoteric blacksmiths forging weapons infused with void-entropy and dark energy.' },
  { id: 'creator-varen-gatekeeper', name: 'Varen Gatekeeper Works', faction: 'Varen Enclaves', description: 'Ancient guardians crafting dimensional displacement fields and heavy barrier systems.' },
  { id: 'creator-risakin-heavy', name: 'Risakin Heavy Industrial', faction: 'Risakin', description: 'Producers of massive titan-scale hydraulic weapons and heavy structural frames.' },
  { id: 'creator-free-droid', name: 'Free Droid Union', faction: 'Sentient Machines', description: 'Open-source modular electronics, custom jury-rigged scrap chassis, and repair kits.' }
];

// 18. Designs & Schematics (8 entries)
const DESIGNS = [
  { id: 'design-bullpup', name: 'Bullpup Configuration', description: 'Action behind trigger; maintains full barrel length in a compact, CQB-ready profile.' },
  { id: 'design-heavy-frame', name: 'Heavy Frame', description: 'Reinforced receiver with integrated thermal heat sinks and recoil buffers.' },
  { id: 'design-compact', name: 'Compact / Concealed', description: 'Miniaturized frame with folding stock designed for covert personal defense.' },
  { id: 'design-modular-chassis', name: 'Modular Chassis', description: 'Standardized rail system allowing rapid swapping of barrels, calibers, and optics.' },
  { id: 'design-reinforced-exo', name: 'Reinforced Exoskeleton', description: 'External hydraulic articulation frame that augments physical carrying capacity.' },
  { id: 'design-micro-platform', name: 'Micro-Platform', description: 'Sub-compact form factor optimized for tiny drones or wrist-mounted modules.' },
  { id: 'design-precursor-matrix', name: 'Precursor Matrix', description: 'Ancient architectural geometry that channels ambient metaphysical energy.' },
  { id: 'design-biomechanical', name: 'Bio-Mechanical Hybrid', description: 'Chassis integrating synthetic titanium servos with living organic muscle fibers.' }
];

// 19. Components & Modules (10 entries)
const COMPONENTS = [
  { id: 'comp-optical-sight', name: 'Optical Sight / Reflex Scope', sockets: 1, description: 'Red-dot holographic sight providing +1 to strike at close engagement ranges.' },
  { id: 'comp-high-capacity-mag', name: 'High-Capacity Magazine', sockets: 1, description: 'Expanded magazine well increasing total ammunition capacity by 50%.' },
  { id: 'comp-suppressor', name: 'Suppressor / Muzzle Brake', sockets: 1, description: 'Dampens muzzle blast, adding +10 Stealth DC to detect firearm discharges.' },
  { id: 'comp-reinforced-barrel', name: 'Reinforced Heavy Barrel', sockets: 1, description: 'Heavy-profile barrel with +20% effective range and increased heat tolerance.' },
  { id: 'comp-gyro-stabilizer', name: 'Gyro-Stabilizer', sockets: 2, description: 'Internal counter-weight gyros that eliminate movement penalties when firing heavy weapons.' },
  { id: 'comp-kinetic-buffer', name: 'Kinetic Recoil Buffer', sockets: 1, description: 'Hydraulic stock buffer reducing automatic fire penalties by 2 points.' },
  { id: 'comp-heat-sink', name: 'Extended Heat Sinks', sockets: 1, description: 'Thermal dissipation fins allowing energy weapons to sustain continuous fire.' },
  { id: 'comp-neural-jack', name: 'Neural Interface Ghost-Jack', sockets: 1, description: 'Direct neural interface providing +2 to strike and weapon telemetry in HUD.' },
  { id: 'comp-smart-link', name: 'Smart-Link Sensor', sockets: 0, description: 'Wireless data-feed to smart eyewear enabling accurate blind-fire around corners.' },
  { id: 'comp-overcharge-cap', name: 'Overcharge Capacitor', sockets: 2, description: 'Allows weapon to supercharge single shots for +1 bonus damage die.' }
];

// 20. Prerequisites (10 entries)
const PREREQUISITES = [
  { id: 'prereq-might-2', name: 'Might 2+ (STR)', type: 'Attribute', value: 'STR >= 2', description: 'Requires physical Strength attribute score of 2 or higher.' },
  { id: 'prereq-reflex-2', name: 'Reflex 2+ (AGI)', type: 'Attribute', value: 'AGI >= 2', description: 'Requires Agility attribute score of 2 or higher.' },
  { id: 'prereq-fortitude-2', name: 'Fortitude 2+ (STA)', type: 'Attribute', value: 'STA >= 2', description: 'Requires Stamina attribute score of 2 or higher.' },
  { id: 'prereq-reason-2', name: 'Reason 2+ (INT)', type: 'Attribute', value: 'INT >= 2', description: 'Requires Intellect attribute score of 2 or higher.' },
  { id: 'prereq-willpower-2', name: 'Willpower 2+ (WIS)', type: 'Attribute', value: 'WIS >= 2', description: 'Requires Wisdom attribute score of 2 or higher.' },
  { id: 'prereq-presence-2', name: 'Presence 2+ (CHA)', type: 'Attribute', value: 'CHA >= 2', description: 'Requires Charisma attribute score of 2 or higher.' },
  { id: 'prereq-attune-2', name: 'Attune 2+ (Meta)', type: 'Skill', value: 'Attune >= 2', description: 'Requires Attune skill rank of 2 or higher to channel metaphysics.' },
  { id: 'prereq-firearms-3', name: 'Firearms 3+ (Combat)', type: 'Skill', value: 'Firearms >= 3', description: 'Requires Firearms skill rank of 3 or higher.' },
  { id: 'prereq-cybernetic-chassis', name: 'Cybernetic Chassis', type: 'Feature', value: 'Chassis == Synthetic/Augmented', description: 'Requires the character to possess synthetic chassis or augmented body parts.' },
  { id: 'prereq-awakened', name: 'Awakened Feature', type: 'Feature', value: 'HasFeature(Awakened)', description: 'Requires the Awakened feature to manifest supernatural abilities.' }
];

// 21. Modifiers (10 entries)
const MODIFIERS = [
  { id: 'mod-attack-plus-1', name: '+1 Attack Roll', target: 'Attack', value: 1, type: 'combat', description: 'Grants +1 bonus on combat attack rolls.' },
  { id: 'mod-attack-plus-2', name: '+2 Attack Roll', target: 'Attack', value: 2, type: 'combat', description: 'Grants +2 bonus on combat attack rolls.' },
  { id: 'mod-defense-plus-1', name: '+1 Defense Roll', target: 'Defense', value: 1, type: 'combat', description: 'Grants +1 bonus on combat defense checks.' },
  { id: 'mod-defense-plus-2', name: '+2 Defense Roll', target: 'Defense', value: 2, type: 'combat', description: 'Grants +2 bonus on combat defense checks.' },
  { id: 'mod-speed-plus-10', name: '+10 ft Speed', target: 'Movement Speed', value: 10, type: 'speed', description: 'Increases ground movement speed by 10 feet per round.' },
  { id: 'mod-reach-plus-5', name: '+5 ft Reach', target: 'Reach', value: 5, type: 'combat', description: 'Extends melee combat reach by 5 feet.' },
  { id: 'mod-dr-plus-2', name: '+2 Damage Resistance (DR)', target: 'Damage Resistance', value: 2, type: 'armor', description: 'Absorbs 2 points of incoming physical/energy damage.' },
  { id: 'mod-sp-plus-5', name: '+5 Structure Points (SP)', target: 'Structure Points', value: 5, type: 'health', description: 'Adds 5 bonus Structure Points to the chassis or module.' },
  { id: 'mod-init-plus-2', name: '+2 Initiative', target: 'Initiative', value: 2, type: 'combat', description: 'Grants +2 bonus on combat initiative reaction checks.' },
  { id: 'mod-ap-minus-1', name: '-1 Action Point (AP) Cost', target: 'Action Cost', value: -1, type: 'action', description: 'Reduces action point cost of specialized actions by 1.' }
];

// 22. 14 Societal Spheres (70 entries across levels 0 to 5)
const SPHERE_DEFS = [
  { key: 'society_agriculture', label: 'Agriculture & Biosphere', desc: 'Food production, farming technologies, hydroponics, and ecosystem synthesis.' },
  { key: 'society_architecture', label: 'Architecture & Habitats', desc: 'Urban engineering, habitat construction, dome architecture, and megastructures.' },
  { key: 'society_biotechnology', label: 'Biotechnology & Genetics', desc: 'Genetics, cloning, bio-engineering, neural crafting, and organism design.' },
  { key: 'society_commerce', label: 'Commerce & Economy', desc: 'Economic models, banking networks, trade routes, currency, and resource exchange.' },
  { key: 'society_communication', label: 'Communication & Data', desc: 'Sub-space relays, ansible networks, holonet infrastructure, and telemetry.' },
  { key: 'society_devices', label: 'Devices & Apparatus', desc: 'Consumer electronics, personal computing, sensors, tools, and apparatus.' },
  { key: 'society_education', label: 'Education & Archives', desc: 'Knowledge institutions, neural archives, apprenticeships, and academies.' },
  { key: 'society_energy', label: 'Energy & Power Generation', desc: 'Power generation, fusion reactors, antimatter taps, and solar arrays.' },
  { key: 'society_manufacturing', label: 'Manufacturing & Industry', desc: 'Industrial automated fabrication, nano-forges, mass production, and orbital yards.' },
  { key: 'society_materials', label: 'Materials & Metallurgy', desc: 'Material science, meta-materials, molecular metallurgy, and high-density plating.' },
  { key: 'society_medicine', label: 'Medicine & Healthcare', desc: 'Healthcare infrastructure, cellular regeneration, trauma care, and panaceas.' },
  { key: 'society_society', label: 'Structure & Governance', desc: 'Government models, legal systems, social stratification, and caste frameworks.' },
  { key: 'society_synthetics', label: 'Synthetics & AI Rights', desc: 'Artificial intelligence, android rights, synthetic biology, and cybernetics.' },
  { key: 'society_weaponry', label: 'Weaponry & Defense Grids', desc: 'Military doctrines, planetary defense grids, ordinance, and arms advancement.' }
];

const SOCIETAL_ENTRIES = [];
SPHERE_DEFS.forEach(sphere => {
  for (let level = 0; level <= 5; level++) {
    const id = `${sphere.key}_lvl_${level}`;
    const titles = ['Primitive / Subsistence', 'Emerging / Industrial', 'Modern / Planetary', 'Advanced / Stellar', 'Mastered / Interstellar', 'Transcendent / Deific'];
    SOCIETAL_ENTRIES.push({
      id,
      category: sphere.key,
      name: `${sphere.label} (Level ${level}: ${titles[level]})`,
      level,
      sphere_key: sphere.key,
      description: `Level ${level} development in ${sphere.label}: ${sphere.desc} (${titles[level]}).`
    });
  }
});

// Master Map of all Collections to Ingest
const ALL_COLLECTIONS = {
  augmentation_type: AUGMENTATION_TYPES,
  body_location: BODY_LOCATIONS,
  area: AREA_PATTERNS,
  effect: EFFECT_TYPES,
  range: RANGES,
  target: TARGET_SPECIFICATIONS,
  critical_effect: CRITICAL_EFFECTS,
  critical_success_effect: CRITICAL_SUCCESS_EFFECTS,
  critical_failure_effect: CRITICAL_FAILURE_EFFECTS,
  material: MATERIALS,
  resistance: RESISTANCES,
  mode: MODES,
  special: SPECIALS,
  availability: AVAILABILITY,
  gear_category: GEAR_CATEGORIES,
  classification: CLASSIFICATIONS,
  creator: CREATORS,
  design: DESIGNS,
  component: COMPONENTS,
  prerequisite: PREREQUISITES,
  modifier: MODIFIERS
};

// Add each individual society sphere to ALL_COLLECTIONS
SPHERE_DEFS.forEach(sphere => {
  ALL_COLLECTIONS[sphere.key] = SOCIETAL_ENTRIES.filter(e => e.category === sphere.key);
});

// ============================================================================
// 2. GENERATE OMNICORTEX MARKDOWN FILES
// ============================================================================
let totalGeneratedFiles = 0;

Object.entries(ALL_COLLECTIONS).forEach(([catKey, items]) => {
  const dirPath = path.join(omnicortexRoot, catKey);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  items.forEach(item => {
    const filePath = path.join(dirPath, `${item.id}.md`);
    const frontmatter = {
      ...item,
      category: catKey,
      ...standardCostsAndSockets
    };

    const markdownBody = `# ${item.name}\n\n**Category**: ${catKey.replace(/_/g, ' ').toUpperCase()}\n\n## Description\n${item.description || item.name}\n`;
    const fullContent = matter.stringify(markdownBody, frontmatter);
    fs.writeFileSync(filePath, fullContent, 'utf8');
    totalGeneratedFiles++;
  });
  console.log(`Generated ${items.length} markdown files in omnicortex/${catKey}`);
});

console.log(`\nTotal supporting markdown files created: ${totalGeneratedFiles}`);

// ============================================================================
// 3. GENERATE supportingCatalogsData.js
// ============================================================================
const jsExportContent = `/**
 * Canonical Supporting & Developer Reference Catalogs for Tangent SF RP
 * Auto-generated by scripts/buildSupportingCatalogs.js
 */

export const DEFAULT_AUGMENTATION_TYPES = ${JSON.stringify(AUGMENTATION_TYPES, null, 2)};
export const DEFAULT_BODY_LOCATIONS = ${JSON.stringify(BODY_LOCATIONS, null, 2)};
export const DEFAULT_AREA_PATTERNS = ${JSON.stringify(AREA_PATTERNS, null, 2)};
export const DEFAULT_EFFECT_TYPES = ${JSON.stringify(EFFECT_TYPES, null, 2)};
export const DEFAULT_RANGES = ${JSON.stringify(RANGES, null, 2)};
export const DEFAULT_TARGET_SPECIFICATIONS = ${JSON.stringify(TARGET_SPECIFICATIONS, null, 2)};
export const DEFAULT_CRITICAL_EFFECTS = ${JSON.stringify(CRITICAL_EFFECTS, null, 2)};
export const DEFAULT_CRITICAL_SUCCESS_EFFECTS = ${JSON.stringify(CRITICAL_SUCCESS_EFFECTS, null, 2)};
export const DEFAULT_CRITICAL_FAILURE_EFFECTS = ${JSON.stringify(CRITICAL_FAILURE_EFFECTS, null, 2)};
export const DEFAULT_MATERIALS = ${JSON.stringify(MATERIALS, null, 2)};
export const DEFAULT_RESISTANCES = ${JSON.stringify(RESISTANCES, null, 2)};
export const DEFAULT_MODES = ${JSON.stringify(MODES, null, 2)};
export const DEFAULT_SPECIALS = ${JSON.stringify(SPECIALS, null, 2)};
export const DEFAULT_AVAILABILITY = ${JSON.stringify(AVAILABILITY, null, 2)};
export const DEFAULT_GEAR_CATEGORIES = ${JSON.stringify(GEAR_CATEGORIES, null, 2)};
export const DEFAULT_CLASSIFICATIONS = ${JSON.stringify(CLASSIFICATIONS, null, 2)};
export const DEFAULT_CREATORS = ${JSON.stringify(CREATORS, null, 2)};
export const DEFAULT_DESIGNS = ${JSON.stringify(DESIGNS, null, 2)};
export const DEFAULT_COMPONENTS = ${JSON.stringify(COMPONENTS, null, 2)};
export const DEFAULT_PREREQUISITES = ${JSON.stringify(PREREQUISITES, null, 2)};
export const DEFAULT_MODIFIERS = ${JSON.stringify(MODIFIERS, null, 2)};
export const DEFAULT_SOCIETAL_ENTRIES = ${JSON.stringify(SOCIETAL_ENTRIES, null, 2)};
`;

fs.writeFileSync(supportingJsPath, jsExportContent, 'utf8');
console.log(`Updated JavaScript seed catalogs in: ${supportingJsPath}`);

// ============================================================================
// 4. UPDATE JSON BACKUPS
// ============================================================================
Object.entries(ALL_COLLECTIONS).forEach(([catKey, items]) => {
  const backupFile = path.join(jsonBackupDir, `${catKey}_database.json`);
  fs.writeFileSync(backupFile, JSON.stringify(items, null, 2), 'utf8');
});
console.log('Updated JSON backups in current collection.');

console.log('\n================================================================');
console.log('SUPPORTING CATALOGS INGESTION COMPLETE!');
console.log('================================================================');