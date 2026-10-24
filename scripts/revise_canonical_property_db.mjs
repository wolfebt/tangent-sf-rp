import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const omniRoot = path.join(projectRoot, 'src', 'data', 'omnicortex');
const staticDataRoot = path.join(projectRoot, 'src', 'data');

// Canonical Tangent Standard Curve (TSC) Formula: Value = round(10 * 4^(DC / 5))
function tscCredits(dc) {
  const numDc = Number(dc) || 0;
  if (numDc < 0) return 10;
  return Math.round(10 * Math.pow(4, numDc / 5));
}

function dcFromCredits(cr) {
  const numCr = Math.max(10, Number(cr) || 10);
  return Math.max(0, Math.round(2.5 * Math.log2(numCr / 10)));
}

const SIZE_SOCKETS = {
  Fine: 0,
  Diminutive: 1,
  Tiny: 1,
  Small: 2,
  Medium: 4,
  Large: 6
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. CANONICAL WEAPONRY SPECIFICATION TABLE
// Exact match to 99.Tech.Weaponry.Catalog.md, 99.Tech.Weaponry.ForgeProtocol.md, 2.00 ECONOMATRIX.md
// Covers all 75 existing weapon IDs + 17 overwritten Energy Pistol/Rifle variants + 10 Grenades
// ═══════════════════════════════════════════════════════════════════════════
const CANONICAL_WEAPONS = {
  // --- ARCHAIC MELEE: UNARMED / NATURAL (99.Tech.Weaponry.Catalog.md Section 1.1) ---
  'bite': {
    name: 'Bite',
    classification: 'Melee (Piercing)',
    weapon_type: 'Melee',
    wielding: 'Unarmed',
    size: 'Fine',
    damage: '1d6',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 0,
    craft_dc: 0,
    special: 'Piercing, Unarmed',
    description: 'Natural or augmented jaws and teeth delivering a puncturing close-combat bite attack.'
  },
  'claws': {
    name: 'Claws',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'Unarmed',
    size: 'Fine',
    damage: '1d6',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 0,
    craft_dc: 0,
    special: 'Slashing, Unarmed',
    description: 'Sharp natural or retractable talons capable of raking targets in unarmed close combat.'
  },
  'feet': {
    name: 'Feet (Kick)',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'Unarmed',
    size: 'Fine',
    damage: '1d8',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 0,
    craft_dc: 0,
    special: 'Blunt, Non-Lethal, Unarmed',
    description: 'Heavy unarmed kick attack delivering concussive non-lethal blunt trauma.'
  },
  'fists': {
    name: 'Fists (Punch)',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'Unarmed',
    size: 'Fine',
    damage: '1d6',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 0,
    craft_dc: 0,
    special: 'Blunt, Non-Lethal, Unarmed',
    description: 'Standard unarmed punch strike dealing non-lethal blunt impact damage.'
  },

  // --- ARCHAIC MELEE: SLASHING ---
  'axe': {
    name: 'Axe',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Medium',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 10,
    special: 'Slashing',
    description: 'Broad-bladed martial axe delivering concentrated cleaving momentum.'
  },
  'bladed-gauntlet': {
    name: 'Bladed Gauntlet',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d4',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 8,
    special: 'Armored Fist with Blades',
    description: 'Reinforced gauntlet fitted with forearm-mounted slashing blades.'
  },
  'hatchet': {
    name: 'Hatchet',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d4',
    damage_type: 'Kinetic',
    range: '- / 10ft',
    ammo: '-',
    tech_level: 1,
    craft_dc: 5,
    special: 'Thrown (10ft)',
    description: 'Short-hafted chopping axe balanced for close combat, utility, and throwing.'
  },
  'knife': {
    name: 'Knife',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '1d6',
    damage_type: 'Kinetic',
    range: '- / 10ft',
    ammo: '-',
    tech_level: 1,
    craft_dc: 5,
    special: 'Conceal, Thrown (10ft)',
    description: 'Standard utility and close-combat survival blade.'
  },
  'machete': {
    name: 'Machete',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '1d8',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 8,
    special: 'Slashing',
    description: 'Heavy cleaving blade used for frontier bushcraft and brutal close combat.'
  },
  'short-sword': {
    name: 'Short Sword',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d4',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 5,
    special: 'Slashing or Piercing',
    description: 'Compact one-handed blade favored by boarding parties and close-quarters skirmishers.'
  },
  'sword': {
    name: 'Sword',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Medium',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 10,
    special: 'Slashing',
    description: 'Classic cruciform or curved martial blade forged from high-carbon or alloy steel.'
  },
  'great-axe': {
    name: 'Great Axe',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '2d8',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 12,
    special: 'Str 2',
    description: 'Heavy two-handed executioner or berserker axe requiring Strength 2.'
  },
  'great-sword': {
    name: 'Great Sword',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '2d8',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 12,
    special: 'Str 2',
    description: 'Massive two-handed war blade requiring Strength 2.'
  },
  'whip': {
    name: 'Whip',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '1d6',
    damage_type: 'Kinetic',
    range: '10ft Reach',
    ammo: '-',
    tech_level: 1,
    craft_dc: 8,
    special: 'Reach, Entangle, Non-Lethal',
    description: 'Flexible braided lash capable of disarming or entangling targets at 10ft reach.'
  },
  'polearm': {
    name: 'Polearm',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '10ft Reach',
    ammo: '-',
    tech_level: 1,
    craft_dc: 10,
    special: 'Reach, Trip',
    description: 'Heavy axe-and-spike head mounted on a long haft for sweeping reach and trip attacks.'
  },
  'sharp-rock': {
    name: 'Sharp Rock',
    classification: 'Melee (Slashing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '1d4',
    damage_type: 'Kinetic',
    range: '- / 20ft',
    ammo: '-',
    tech_level: 0,
    craft_dc: 0,
    special: 'Improvised / Primitive, Thrown (20ft)',
    description: 'Fractured flint or stone shard used as a primitive cutting or thrown weapon.'
  },

  // --- ARCHAIC MELEE: BLUNT ---
  'club': {
    name: 'Club',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '1d6',
    damage_type: 'Kinetic',
    range: '- / 10ft',
    ammo: '-',
    tech_level: 0,
    craft_dc: 0,
    special: 'Thrown (10ft)',
    description: 'Simple weighted bludgeon crafted from hardwood, bone, or scrap metal.'
  },
  'gauntlet': {
    name: 'Gauntlet',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '1d8',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 5,
    special: 'Armored Gloves',
    description: 'Weighted metal or composite armored gloves that turn punches into lethal bludgeoning strikes.'
  },
  'hammer': {
    name: 'Hammer',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d4',
    damage_type: 'Kinetic',
    range: '- / 10ft',
    ammo: '-',
    tech_level: 1,
    craft_dc: 5,
    special: 'Thrown (10ft)',
    description: 'Heavy-headed one-handed hammer designed to dent armor and crush bone.'
  },
  'mace': {
    name: 'Mace',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Medium',
    damage: '2d4',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 10,
    special: 'Blunt',
    description: 'Flanged or spiked bludgeon engineered to transfer shockwaves through rigid armor.'
  },
  'staff': {
    name: 'Staff',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '1d8',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 0,
    craft_dc: 5,
    special: 'Blunt',
    description: 'Balanced two-handed fighting stave crafted from seasoned hardwood or metal tube.'
  },
  'maul-great-hammer': {
    name: 'Maul / Great Hammer',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '2d8',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 12,
    special: 'Str 2',
    description: 'Massive two-handed war hammer requiring Strength 2.'
  },
  'chain': {
    name: 'Chain',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '1d8',
    damage_type: 'Kinetic',
    range: '10ft Reach',
    ammo: '-',
    tech_level: 1,
    craft_dc: 8,
    special: 'Reach, Entangle',
    description: 'Weighted steel fighting chain with 10ft reach capable of entangling limbs and weapons.'
  },
  'long-staff': {
    name: 'Long Staff',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '10ft Reach',
    ammo: '-',
    tech_level: 1,
    craft_dc: 10,
    special: 'Str 1, Reach, Trip',
    description: 'Long martial pole-staff granting 10ft reach and trip leverage.'
  },
  'rock': {
    name: 'Rock',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '1d4',
    damage_type: 'Kinetic',
    range: '- / 20ft',
    ammo: '-',
    tech_level: 0,
    craft_dc: 0,
    special: 'Improvised / Primitive, Thrown (20ft)',
    description: 'Heavy stone usable as a primitive bludgeon or thrown projectile.'
  },
  'sabaton': {
    name: 'Sabaton',
    classification: 'Melee (Blunt)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d4',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 5,
    special: 'Armored Boots',
    description: 'Heavy plated combat boots reinforcing kick attacks.'
  },

  // --- ARCHAIC MELEE: PIERCING ---
  'dagger': {
    name: 'Dagger',
    classification: 'Melee (Piercing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '1d6',
    damage_type: 'Kinetic',
    range: '- / 10ft',
    ammo: '-',
    tech_level: 1,
    craft_dc: 5,
    special: 'Conceal, Thrown (10ft)',
    description: 'Double-edged fighting blade balanced for close-quarters thrusting and throwing.'
  },
  'long-spear': {
    name: 'Long Spear',
    classification: 'Melee (Piercing)',
    weapon_type: 'Melee',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '10ft Reach',
    ammo: '-',
    tech_level: 1,
    craft_dc: 10,
    special: 'Reach, Trip',
    description: 'Long-shafted infantry pike with 10ft reach and tripping capability.'
  },
  'rapier': {
    name: 'Rapier',
    classification: 'Melee (Piercing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Medium',
    damage: '1d8',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 10,
    special: 'Finesse, Piercing',
    description: 'Slender, sharply pointed dueling sword designed for agile precision thrusts.'
  },
  'pick': {
    name: 'Pick / War Pick',
    classification: 'Melee (Piercing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Medium',
    damage: '3d4',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 10,
    special: 'Armor-Piercing Spike',
    description: 'Tapered steel war pick engineered to punch through heavy armor plate.'
  },
  'spear': {
    name: 'Spear',
    classification: 'Melee (Piercing)',
    weapon_type: 'Melee',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '- / 20ft',
    ammo: '-',
    tech_level: 0,
    craft_dc: 5,
    special: 'Thrown (20ft)',
    description: 'Shafted thrusting weapon balanced for both melee combat and ranged throwing.'
  },
  'spiked-gauntlet': {
    name: 'Spiked Gauntlet',
    classification: 'Melee (Piercing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 8,
    special: 'Armored Gloves with Spikes',
    description: 'Reinforced combat gauntlets studded with armor-piercing knuckle spikes.'
  },
  'spiked-sabaton': {
    name: 'Spiked Sabaton',
    classification: 'Melee (Piercing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 1,
    craft_dc: 8,
    special: 'Armored Boots with Spikes',
    description: 'Armored greaves and boots fitted with toe and heel spikes.'
  },
  'sharp-stick': {
    name: 'Sharp Stick',
    classification: 'Melee (Piercing)',
    weapon_type: 'Melee',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '1d4',
    damage_type: 'Kinetic',
    range: '-',
    ammo: '-',
    tech_level: 0,
    craft_dc: 0,
    special: 'Improvised / Primitive',
    description: 'Fire-hardened wooden stake or sharpened branch.'
  },

  // --- ARCHAIC RANGED ---
  'bow': {
    name: 'Bow',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Archaic Ranged',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '1d8',
    damage_type: 'Kinetic',
    range: '50ft',
    ammo: '1',
    tech_level: 0,
    craft_dc: 10,
    special: 'Silent',
    description: 'Traditional stave bow firing fletched arrows silently.'
  },
  'crossbow': {
    name: 'Crossbow',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Archaic Ranged',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '75ft',
    ammo: '1',
    tech_level: 1,
    craft_dc: 12,
    special: 'Silent',
    description: 'Mechanical stock-mounted bow firing heavy bolts.'
  },
  'net': {
    name: 'Net',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Archaic Ranged',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '1d6',
    damage_type: 'Kinetic',
    range: '20ft',
    ammo: '1',
    tech_level: 0,
    craft_dc: 8,
    special: 'Non-Lethal, Entangle',
    description: 'Weighted mesh net thrown to entangle and immobilize targets.'
  },
  'net-barbed': {
    name: 'Net, Barbed',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Archaic Ranged',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '20ft',
    ammo: '1',
    tech_level: 1,
    craft_dc: 10,
    special: 'Entangle, Hooked',
    description: 'Weighted combat net woven with flesh-tearing steel barbs.'
  },
  'throwing-knife': {
    name: 'Throwing Knife',
    classification: 'Melee (Piercing)',
    weapon_type: 'Archaic Ranged',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '2d4',
    damage_type: 'Kinetic',
    range: '20ft',
    ammo: '1',
    tech_level: 1,
    craft_dc: 5,
    special: '(Piercing), Conceal, Thrown',
    description: 'Aerodynamically balanced blade weighted for silent ranged throws.'
  },
  'throwing-stick': {
    name: 'Throwing Stick',
    classification: 'Melee (Blunt)',
    weapon_type: 'Archaic Ranged',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d4',
    damage_type: 'Kinetic',
    range: '30ft',
    ammo: '1',
    tech_level: 0,
    craft_dc: 5,
    special: '(Blunt), Returning option',
    description: 'Curved hardwood hunting stick shaped for stable spinning flight.'
  },

  // --- MODERN: BALLISTIC PISTOLS ---
  'pistol-hold-out': {
    name: 'Pistol, Hold-Out',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Pistol',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '1d8',
    damage_type: 'Kinetic',
    range: '20ft',
    ammo: '2',
    tech_level: 2,
    craft_dc: 10,
    special: 'Pocket Sized',
    description: 'Palm-sized derringer or backup pistol built for deep concealment.'
  },
  'pistol-light': {
    name: 'Pistol, Light',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '1d8',
    damage_type: 'Kinetic',
    range: '40ft',
    ammo: '30',
    tech_level: 2,
    craft_dc: 10,
    special: 'High Capacity',
    description: 'High-capacity semi-automatic sidearm firing low-recoil small-caliber rounds.'
  },
  'pistol-medium': {
    name: 'Pistol, Medium',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d6',
    damage_type: 'Kinetic',
    range: '50ft',
    ammo: '20',
    tech_level: 2,
    craft_dc: 10,
    special: 'Standard Sidearm',
    description: 'Standard military and law-enforcement service sidearm.'
  },
  'pistol-heavy': {
    name: 'Pistol, Heavy',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d8',
    damage_type: 'Kinetic',
    range: '60ft',
    ammo: '10',
    tech_level: 2,
    craft_dc: 12,
    special: 'Heavy Caliber',
    description: 'Large-caliber magnum handgun delivering massive stopping power.'
  },

  // --- MODERN: BALLISTIC RIFLES ---
  'rifle-light': {
    name: 'Rifle, Light',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '1d8',
    damage_type: 'Kinetic',
    range: '200ft',
    ammo: '60',
    tech_level: 2,
    craft_dc: 15,
    special: 'High Capacity',
    description: 'Lightweight high-capacity carbine or assault rifle.'
  },
  'rifle-medium': {
    name: 'Rifle, Medium',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '2d8',
    damage_type: 'Kinetic',
    range: '150ft',
    ammo: '40',
    tech_level: 2,
    craft_dc: 15,
    special: 'Standard Infantry Rifle',
    description: 'Standard infantry battle rifle combining range, accuracy, and stopping power.'
  },
  'rifle-heavy': {
    name: 'Rifle, Heavy',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '3d8',
    damage_type: 'Kinetic',
    range: '100ft',
    ammo: '20',
    tech_level: 2,
    craft_dc: 18,
    special: 'Heavy Bore',
    description: 'Full-bore heavy battle rifle chambered in high-powered cartridges.'
  },
  'sniper-rifle': {
    name: 'Sniper Rifle',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '3d8',
    damage_type: 'Kinetic',
    range: '300ft',
    ammo: '10',
    tech_level: 2,
    craft_dc: 18,
    special: 'Long Range Marksman',
    description: 'Precision marksman rifle fitted with long-range optics and match-grade barrel.'
  },
  'sniper-rifle-heavy': {
    name: 'Sniper Rifle, Heavy',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Rifle',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '5d8',
    damage_type: 'Kinetic',
    range: '200ft',
    ammo: '10',
    tech_level: 2,
    craft_dc: 20,
    special: 'Anti-Materiel',
    description: 'Heavy anti-materiel sniper rifle capable of punching through light vehicle armor.'
  },
  'scattergun-shot': {
    name: 'Scattergun, Shot',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '6d8',
    damage_type: 'Kinetic',
    range: '50ft cone',
    ammo: '10',
    tech_level: 2,
    craft_dc: 15,
    special: '+5ft spread, -1d damage (Point Blank 10ft: +5 Strike, Advantage Dmg)',
    description: 'Combat shotgun firing dense buckshot or flechette cones.'
  },
  'scattergun-blunderbus': {
    name: 'Scattergun, Blunderbus',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '6d8',
    damage_type: 'Kinetic',
    range: '25ft cone',
    ammo: '10',
    tech_level: 2,
    craft_dc: 15,
    special: '+10ft spread, -1d damage (Point Blank 10ft: +5 Strike, Advantage Dmg)',
    description: 'Wide-mouth room-clearing scattergun unleashing a broad 25ft shrapnel cone.'
  },
  'scattergun-slug': {
    name: 'Scattergun, Slug',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Ballistic Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '5d8',
    damage_type: 'Kinetic',
    range: '50ft',
    ammo: '10',
    tech_level: 2,
    craft_dc: 15,
    special: 'Solid Slug (Point Blank 10ft: +5 Strike, Advantage Dmg)',
    description: 'Combat shotgun chambered for heavy solid sabot slugs.'
  },

  // --- MODERN: HEAVY WEAPONS ---
  'light-cannon': {
    name: 'Light Cannon',
    classification: 'Heavy (Ballistic)',
    weapon_type: 'Heavy Weapon',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '3d8',
    damage_type: 'Kinetic',
    range: '500ft',
    ammo: '10',
    tech_level: 2,
    craft_dc: 20,
    special: 'Direct Fire Cannon',
    description: 'Man-portable 20mm autocannon firing armor-piercing shells up to 500ft.'
  },
  'medium-cannon': {
    name: 'Medium Cannon',
    classification: 'Heavy (Ballistic)',
    weapon_type: 'Heavy Weapon',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '5d8',
    damage_type: 'Kinetic',
    range: '500ft',
    ammo: '10',
    tech_level: 2,
    craft_dc: 22,
    special: 'Direct Fire Cannon',
    description: 'High-velocity 30mm cannon firing high-explosive armor-piercing rounds.'
  },
  'heavy-cannon': {
    name: 'Heavy Cannon',
    classification: 'Heavy (Ballistic)',
    weapon_type: 'Heavy Weapon',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '7d8',
    damage_type: 'Kinetic',
    range: '500ft',
    ammo: '10',
    tech_level: 2,
    craft_dc: 25,
    special: 'Heavy Anti-Armor Cannon',
    description: 'Direct-fire anti-armor siege cannon delivering devastating 7d8 shells.'
  },
  'light-machinegun': {
    name: 'Light Machinegun',
    classification: 'Heavy (Ballistic)',
    weapon_type: 'Heavy Weapon',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '2d8',
    damage_type: 'Kinetic',
    range: '200ft',
    ammo: '100',
    tech_level: 2,
    craft_dc: 18,
    special: 'Autofire',
    description: 'Squad automatic weapon providing sustained suppressive autofire.'
  },
  'medium-machinegun': {
    name: 'Medium Machinegun',
    classification: 'Heavy (Ballistic)',
    weapon_type: 'Heavy Weapon',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '3d8',
    damage_type: 'Kinetic',
    range: '200ft',
    ammo: '100',
    tech_level: 2,
    craft_dc: 20,
    special: 'Autofire',
    description: 'Belt-fed general-purpose machinegun for infantry fire support.'
  },
  'heavy-machinegun': {
    name: 'Heavy Machinegun',
    classification: 'Heavy (Ballistic)',
    weapon_type: 'Heavy Weapon',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '4d8',
    damage_type: 'Kinetic',
    range: '200ft',
    ammo: '100',
    tech_level: 2,
    craft_dc: 22,
    special: 'Autofire',
    description: 'Heavy-caliber support weapon capable of shredding cover and light vehicles.'
  },
  'grenade-launcher': {
    name: 'Grenade Launcher',
    classification: 'Heavy (Ballistic)',
    weapon_type: 'Heavy Weapon',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: 'By Grenade (*)',
    damage_type: 'Kinetic',
    range: '100ft',
    ammo: '1/10',
    tech_level: 2,
    craft_dc: 18,
    special: 'Launches Grenade Payloads',
    description: '40mm launcher firing fragmentation, smoke, high-explosive, or specialty grenades.'
  },
  'flamer': {
    name: 'Flamer',
    classification: 'Heavy (Ballistic)',
    weapon_type: 'Heavy Weapon',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '2d6 Pyro',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '30ft',
    ammo: '4/8',
    tech_level: 2,
    craft_dc: 18,
    special: 'Burn, Ignites Flammables',
    description: 'Pressurized chemical projector saturating targets in sticky napalm.'
  },
  'heavy-flamethrower': {
    name: 'Heavy Flamethrower',
    classification: 'Heavy (Ballistic)',
    weapon_type: 'Heavy Weapon',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '4d6 Pyro',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '60ft',
    ammo: '6/12',
    tech_level: 2,
    craft_dc: 20,
    special: 'Burn, Ignites Flammables',
    description: 'Backpack-fed military incinerator projecting a 60ft torrent of liquid fire.'
  },
  'mini-missile-launcher': {
    name: 'Mini-Missile Launcher',
    classification: 'Heavy (Ballistic)',
    weapon_type: 'Heavy Weapon',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: 'By Warhead (*)',
    damage_type: 'Force',
    range: '500ft',
    ammo: '1/2/6',
    tech_level: 3,
    craft_dc: 20,
    special: 'Rocket or Smart',
    description: 'Multi-tube launcher firing unguided rockets or target-locking smart micro-missiles.'
  },

  // --- ADVANCED: ENERGY PISTOLS ---
  'light-laser-pistol': {
    name: 'Light Laser (Pistol)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '1d6',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '75ft',
    ammo: '50',
    tech_level: 3,
    craft_dc: 15,
    special: 'Penetrating 5, TL3',
    description: 'Standard civilian and officer sidearm emitting coherent thermal laser beams.'
  },
  'medium-laser-pistol': {
    name: 'Medium Laser (Pistol)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '1d10',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '75ft',
    ammo: '30',
    tech_level: 3,
    craft_dc: 15,
    special: 'Penetrating 5, TL3',
    description: 'Military-spec pulse laser pistol with Penetrating 5 and high energy efficiency.'
  },
  'heavy-laser-pistol': {
    name: 'Heavy Laser (Pistol)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d6',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '75ft',
    ammo: '25',
    tech_level: 3,
    craft_dc: 18,
    special: 'Penetrating 5, TL3',
    description: 'Overcharged heavy laser sidearm capable of burning through tactical vests.'
  },
  'e-gun': {
    name: 'E-Gun',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '1d10 Voltic',
    damage_type: 'Voltic (Electrical)',
    range: '25ft',
    ammo: '20',
    tech_level: 3,
    craft_dc: 15,
    special: 'Lethal/Non-Lethal, Stun',
    description: 'Directed electrical sidearm discharging high-voltage arcs with selectable stun mode.'
  },
  'plasma-pistol': {
    name: 'Plasma (Pistol)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d6 Pyro',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '25ft',
    ammo: '20',
    tech_level: 3,
    craft_dc: 18,
    special: 'Burn, TL3',
    description: 'Magnetic-bottle handgun firing superheated bolts of ionized plasma.'
  },
  'icer-pistol': {
    name: 'Icer (Pistol)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '1d8 Cryo',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '25ft',
    ammo: '10',
    tech_level: 3,
    craft_dc: 15,
    special: 'Freeze, TL3',
    description: 'Endothermic beam pistol that flash-freezes targets on impact.'
  },
  'sonic-resonator': {
    name: 'Sonic Resonator',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '1d8 Sonic',
    damage_type: 'Sonic',
    range: '25ft',
    ammo: '30',
    tech_level: 3,
    craft_dc: 15,
    special: 'Lethal/Non-Lethal, Stun',
    description: 'Acoustic wave pistol with selectable lethal/non-lethal harmonic stun output.'
  },
  'disintegrator-pistol': {
    name: 'Disintegrator (Pistol)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d6 Corrosive',
    damage_type: 'Corrosive (Acid)',
    range: '25ft',
    ammo: '10',
    tech_level: 5,
    craft_dc: 25,
    special: 'Dissolve, TL5',
    description: 'TL5 subatomic sidearm that dissolves molecular bonds on impact.'
  },
  'disrupter-pistol': {
    name: 'Disrupter (Pistol)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d6+4 Force',
    damage_type: 'Force',
    range: '50ft',
    ammo: '20',
    tech_level: 4,
    craft_dc: 22,
    special: 'Penetrating 10, TL4',
    description: 'Harmonic molecular disruptor pistol delivering Penetrating 10 force blasts.'
  },
  'grav-pulse-pistol': {
    name: 'Grav Pulse (Pistol)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '2d10',
    damage_type: 'Force',
    range: '25ft',
    ammo: '10',
    tech_level: 5,
    craft_dc: 25,
    special: 'Impact Force, TL5',
    description: 'Compact TL5 gravitic projector unleashing localized kinetic-gravity concussions.'
  },
  'holophotonic-pistol': {
    name: 'Holophotonic (Pistol)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Pistol',
    wielding: 'One-Handed',
    size: 'Small',
    damage: '3d8',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '90ft',
    ammo: '15',
    tech_level: 5,
    craft_dc: 25,
    special: 'Ballistic Emulator, TL5',
    description: 'Hard-light photonic pistol firing solid-light rounds that emulate ballistic impact.'
  },

  // --- ADVANCED: ENERGY RIFLES ---
  'light-laser-rifle': {
    name: 'Light Laser (Rifle)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '1d6',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '150ft',
    ammo: '50',
    tech_level: 3,
    craft_dc: 20,
    special: 'Penetrating 5, TL3',
    description: 'Recoilless infantry laser carbine with 50-shot cell capacity and Penetrating 5.'
  },
  'medium-laser-rifle': {
    name: 'Medium Laser (Rifle)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '2d6',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '150ft',
    ammo: '30',
    tech_level: 3,
    craft_dc: 20,
    special: 'Penetrating 5, TL3',
    description: 'Standard TL3 military service laser rifle with Penetrating 5.'
  },
  'heavy-laser-rifle': {
    name: 'Heavy Laser (Rifle)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '3d6',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '150ft',
    ammo: '25',
    tech_level: 3,
    craft_dc: 22,
    special: 'Penetrating 5, TL3',
    description: 'High-output infantry laser battle rifle with reinforced cooling shrouds.'
  },
  'heavy-e-gun': {
    name: 'Heavy E-Gun',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '2d10 Voltic',
    damage_type: 'Voltic (Electrical)',
    range: '50ft',
    ammo: '20',
    tech_level: 3,
    craft_dc: 20,
    special: 'Non-Lethal, Stun, TL3',
    description: 'High-amperage electrolaser rifle built for non-lethal suppression and stun.'
  },
  'plasma-rifle': {
    name: 'Plasma (Rifle)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '3d6 Pyro',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '50ft',
    ammo: '20',
    tech_level: 3,
    craft_dc: 20,
    special: 'Burn, TL3',
    description: 'Magnetic-accelerator rifle firing superheated bolts of solar-hot plasma.'
  },
  'heavy-icer': {
    name: 'Heavy Icer',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '2d8 Cryo',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '50ft',
    ammo: '10',
    tech_level: 3,
    craft_dc: 20,
    special: 'Freeze, TL3',
    description: 'Cryogenic beam rifle that encases targets in brittle rime ice.'
  },
  'resonator-rifle': {
    name: 'Resonator (Rifle)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '2d8 Sonic',
    damage_type: 'Sonic',
    range: '50ft',
    ammo: '30',
    tech_level: 3,
    craft_dc: 20,
    special: 'Lethal/Non-Lethal, Stun',
    description: 'Focused acoustic rifle delivering lethal or non-lethal harmonic shockwaves.'
  },
  'disintegrator-rifle': {
    name: 'Disintegrator (Rifle)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '3d6 Corrosive',
    damage_type: 'Corrosive (Acid)',
    range: '50ft',
    ammo: '10',
    tech_level: 5,
    craft_dc: 28,
    special: 'Dissolve, TL5',
    description: 'TL5 subatomic rifle that unbinds target matter into elemental dust.'
  },
  'disrupter': {
    name: 'Disrupter (Rifle)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '4d6+8 Force',
    damage_type: 'Force',
    range: '100ft',
    ammo: '20',
    tech_level: 4,
    craft_dc: 25,
    special: 'Penetrating 10, TL4',
    description: 'Long-range molecular disruptor rifle firing phase-shearing force beams.'
  },
  'grav-pulse-rifle': {
    name: 'Grav Pulse (Rifle)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '4d10',
    damage_type: 'Force',
    range: '50ft',
    ammo: '10',
    tech_level: 5,
    craft_dc: 28,
    special: 'Impact Force, TL5',
    description: 'TL5 gravitic wave rifle that slams targets with crushing g-force shockwaves.'
  },
  'holophotonic-rifle': {
    name: 'Holophotonic (Rifle)',
    classification: 'Ranged (Energy)',
    weapon_type: 'Energy Rifle',
    wielding: 'Two-Handed',
    size: 'Medium',
    damage: '4d8',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '150ft',
    ammo: '30',
    tech_level: 5,
    craft_dc: 28,
    special: 'Ballistic Emulator, TL5',
    description: 'TL5 hard-light photonic rifle firing solid-light ballistic-emulating lances.'
  },

  // --- ADVANCED: HEAVY ENERGY ---
  'light-laser': {
    name: 'Light Laser (Heavy)',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '2d8',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '750ft',
    ammo: '100',
    tech_level: 3,
    craft_dc: 25,
    special: 'Penetrating 10, TL3',
    description: 'Squad support pulse-laser cannon with 750ft range and Penetrating 10.'
  },
  'medium-laser': {
    name: 'Medium Laser (Heavy)',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '4d8',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '750ft',
    ammo: '60',
    tech_level: 3,
    craft_dc: 25,
    special: 'Penetrating 10, TL3',
    description: 'Heavy infantry laser cannon designed for sustained anti-armor fire at 750ft.'
  },
  'heavy-laser': {
    name: 'Heavy Laser (Heavy)',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '6d8',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '750ft',
    ammo: '50',
    tech_level: 3,
    craft_dc: 28,
    special: 'Penetrating 10, TL3',
    description: 'High-energy support laser cannon that slices through armored bulkheads at 750ft.'
  },
  'particle-beam': {
    name: 'Particle Beam',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '2d10',
    damage_type: 'Force',
    range: '100ft',
    ammo: '10',
    tech_level: 3,
    craft_dc: 25,
    special: '5ft Line, Ra-D, TL3',
    description: 'Linear accelerator cannon firing a relativistic 5ft line of ionizing particles.'
  },
  'plasma': {
    name: 'Plasma (Heavy)',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '4d6 Pyro',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '250ft',
    ammo: '40',
    tech_level: 3,
    craft_dc: 25,
    special: '10ft Blast, Burn, TL3',
    description: 'Heavy magnetic-toroid cannon launching explosive 10ft-blast spheres of solar plasma.'
  },
  'icer': {
    name: 'Icer (Heavy)',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '3d8 Cryo',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '250ft',
    ammo: '20',
    tech_level: 3,
    craft_dc: 25,
    special: '10ft Blast, Freeze, TL3',
    description: 'Heavy endothermic projector that flash-freezes a 10ft blast zone.'
  },
  'lightning-gun': {
    name: 'Lightning Gun',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '3d10 Voltic',
    damage_type: 'Voltic (Electrical)',
    range: '250ft',
    ammo: '40',
    tech_level: 3,
    craft_dc: 25,
    special: '10ft Blast, Stun, TL3',
    description: 'Tesla-coil arc projector discharging 10ft-blast bolts of stunning lightning.'
  },
  'resonator': {
    name: 'Resonator (Heavy)',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '3d8 Sonic',
    damage_type: 'Sonic',
    range: '250ft',
    ammo: '60',
    tech_level: 3,
    craft_dc: 25,
    special: '10ft Blast, Stun, TL3',
    description: 'Wide-aperture acoustic cannon unleashing 10ft-blast sonic shockwaves.'
  },
  'disintegrator': {
    name: 'Disintegrator (Heavy)',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '4d6 Corrosive',
    damage_type: 'Corrosive (Acid)',
    range: '250ft',
    ammo: '20',
    tech_level: 5,
    craft_dc: 30,
    special: '5ft Blast, Dissolve, TL5',
    description: 'Capital-grade infantry disintegrator cannon dissolving matter in a 5ft blast.'
  },
  'disruptor': {
    name: 'Disruptor (Heavy)',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '6d6+12 Force',
    damage_type: 'Force',
    range: '200ft',
    ammo: '40',
    tech_level: 4,
    craft_dc: 28,
    special: 'Penetrating 20, TL4',
    description: 'Heavy harmonic disruptor cannon with Penetrating 20 phase-force output.'
  },
  'grav-pulse': {
    name: 'Grav Pulse (Heavy)',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '6d10',
    damage_type: 'Force',
    range: '100ft',
    ammo: '20',
    tech_level: 5,
    craft_dc: 30,
    special: '5ft Blast, Impact, TL5',
    description: 'Heavy gravitic siege projector creating localized 5ft-blast gravity-shear explosions.'
  },
  'holophotonic': {
    name: 'Holophotonic (Heavy)',
    classification: 'Heavy (Energy)',
    weapon_type: 'Heavy Energy',
    wielding: 'Two-Handed',
    size: 'Large',
    damage: '8d8',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '750ft',
    ammo: '15',
    tech_level: 5,
    craft_dc: 30,
    special: 'Ballistic Emulator, TL5',
    description: 'Heavy hard-light photonic cannon projecting massive 8d8 solid-light impacts at 750ft.'
  },

  // --- GRENADES / MINI-MISSILES (99.Tech.Weaponry.Catalog.md lines 189-201) ---
  'grenade-armor-piercing': {
    name: 'Grenade, Armor Piercing',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Grenade',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '5d6 Force',
    damage_type: 'Force',
    range: '20ft (Thrown) / 100ft (Launched)',
    ammo: '1',
    tech_level: 2,
    craft_dc: 12,
    special: 'Penetration 10',
    description: 'Shaped-charge warhead or thrown grenade engineered to punch through heavy armor (Penetration 10).'
  },
  'grenade-chemical': {
    name: 'Grenade, Chemical',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Grenade',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: 'Drug dosage',
    damage_type: 'Corrosive (Acid)',
    range: '20ft (Thrown) / 100ft (Launched)',
    ammo: '1',
    tech_level: 2,
    craft_dc: 10,
    special: '20ft Blast, fills cube',
    description: 'Aerosol dispersal canister saturating a 20ft blast zone with a chemical or drug payload.'
  },
  'grenade-concussion': {
    name: 'Grenade, Concussion',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Grenade',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: 'Stun (2d10)',
    damage_type: 'Sonic',
    range: '20ft (Thrown) / 100ft (Launched)',
    ammo: '1',
    tech_level: 2,
    craft_dc: 10,
    special: '20ft Blast, Non-Lethal',
    description: 'Non-lethal flash-concussion grenade dealing 2d10 Stun across a 20ft blast.'
  },
  'grenade-fire-suppression': {
    name: 'Grenade, Fire Suppression',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Grenade',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: 'Foam',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '20ft (Thrown) / 100ft (Launched)',
    ammo: '1',
    tech_level: 2,
    craft_dc: 8,
    special: '20ft Blast, 30pt Protection',
    description: 'Rapid-expanding endothermic foam canister that extinguishes fires and grants 30pt thermal protection.'
  },
  'grenade-fragmentation': {
    name: 'Grenade, Fragmentation',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Grenade',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '5d6 Shrapnel',
    damage_type: 'Kinetic',
    range: '20ft (Thrown) / 100ft (Launched)',
    ammo: '1',
    tech_level: 2,
    craft_dc: 10,
    special: '10ft Blast, Penetration 10',
    description: 'Pre-notched antipersonnel fragmentation grenade unleashing shrapnel across a 10ft blast.'
  },
  'grenade-high-explosive': {
    name: 'Grenade, High Explosive',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Grenade',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '5d8 Force',
    damage_type: 'Force',
    range: '20ft (Thrown) / 100ft (Launched)',
    ammo: '1',
    tech_level: 2,
    craft_dc: 12,
    special: '10ft Blast, Impact Damage',
    description: 'High-explosive demolition charge dealing 5d8 Force impact damage in a 10ft blast.'
  },
  'grenade-incendiary': {
    name: 'Grenade, Incendiary',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Grenade',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: '2d6 Pyro',
    damage_type: 'Thermal (Pyro/Cryo)',
    range: '20ft (Thrown) / 100ft (Launched)',
    ammo: '1',
    tech_level: 2,
    craft_dc: 10,
    special: '20ft Blast, Burn',
    description: 'Thermite-gel incendiary grenade that ignites targets within a 20ft blast.'
  },
  'grenade-slick': {
    name: 'Grenade, Slick',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Grenade',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: 'Frictionless oil',
    damage_type: 'Kinetic',
    range: '20ft (Thrown) / 100ft (Launched)',
    ammo: '1',
    tech_level: 3,
    craft_dc: 10,
    special: '20ft Blast, Reflex CR 20',
    description: 'Coats a 20ft area in frictionless polymer lubricant requiring a CR 20 Reflex save to remain standing.'
  },
  'grenade-restraint': {
    name: 'Grenade, Restraint',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Grenade',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: 'Snare',
    damage_type: 'Kinetic',
    range: '20ft (Thrown) / 100ft (Launched)',
    ammo: '1',
    tech_level: 3,
    craft_dc: 10,
    special: '10ft Blast, Reflex/Might save',
    description: 'Tangle-foam or adhesive web grenade that snares targets in a 10ft blast.'
  },
  'grenade-smoke': {
    name: 'Grenade, Smoke',
    classification: 'Ranged (Ballistic)',
    weapon_type: 'Grenade',
    wielding: 'One-Handed',
    size: 'Tiny',
    damage: 'Smoke',
    damage_type: 'Kinetic',
    range: '20ft (Thrown) / 100ft (Launched)',
    ammo: '1',
    tech_level: 2,
    craft_dc: 5,
    special: '20ft initial Blast, fills cubes',
    description: 'Aerosol canister deploying a dense thermal-and-optical smoke screen across a 20ft area.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. CANONICAL ARMOR SPECIFICATION TABLE (FOR ZEROED & MISSING CATALOG ITEMS)
// Source: 99.Tech.Armor.DesignAndCatalog.md, 99.Tech.Armor.EconomyAndExemplars.md, 2.00.Armor.md
// ═══════════════════════════════════════════════════════════════════════════
const CANONICAL_ARMOR_FIXES = {
  'clothing-diminutive': {
    name: 'Clothing (Diminutive)',
    category: 'Lightweight',
    armor_type: 'Light Armor',
    tech_level: 1,
    meta_level: 0,
    dr: 0,
    sp: 5,
    durability: 5,
    mobility_penalty: 0,
    body_locations: ['Torso', 'Legs'],
    coverage: 'Partial',
    craft_dc: 5,
    sockets_max: 1,
    description: 'Minimalist or lightweight civilian attire offering basic pocket utility without ballistic protection.',
    mechanic: 'DR 0, SP 5. Penalty: None. Locations: Torso, Legs. Base Sockets: 1.'
  },
  'clothing-reinforced': {
    name: 'Clothing (Reinforced)',
    category: 'Lightweight',
    armor_type: 'Light Armor',
    tech_level: 2,
    meta_level: 0,
    dr: 2,
    sp: 10,
    durability: 10,
    mobility_penalty: 0,
    body_locations: ['Torso', 'Arms', 'Legs'],
    coverage: 'Partial',
    craft_dc: 10,
    sockets_max: 2,
    description: 'Everyday street or frontier garments lined with tear-resistant ballistic weave.',
    mechanic: 'DR 2, SP 10. Penalty: None. Locations: Torso, Arms, Legs. Base Sockets: 2.'
  },
  'armored-vest-partial': {
    name: 'Armored Vest (Partial)',
    category: 'Lightweight',
    armor_type: 'Light Armor',
    tech_level: 2,
    meta_level: 0,
    dr: 5,
    sp: 10,
    durability: 10,
    mobility_penalty: 0,
    body_locations: ['Torso'],
    coverage: 'Partial',
    craft_dc: 10,
    sockets_max: 2,
    description: 'Concealable ballistic vest protecting vital chest and abdominal organs.',
    mechanic: 'DR 5, SP 10. Penalty: None. Locations: Torso. Base Sockets: 2.'
  },
  'armored-pants-partial': {
    name: 'Armored Pants (Partial)',
    category: 'Lightweight',
    armor_type: 'Light Armor',
    tech_level: 2,
    meta_level: 0,
    dr: 5,
    sp: 10,
    durability: 10,
    mobility_penalty: 0,
    body_locations: ['Legs'],
    coverage: 'Partial',
    craft_dc: 12,
    sockets_max: 3,
    description: 'Tactical cargo trousers reinforced with articulated knee and thigh trauma plates.',
    mechanic: 'DR 5, SP 10. Penalty: None. Locations: Legs. Base Sockets: 3.'
  },
  'armored-long-coat-reinforced': {
    name: 'Armored Long Coat (Reinforced)',
    category: 'Lightweight',
    armor_type: 'Light Armor',
    tech_level: 2,
    meta_level: 0,
    dr: 5,
    sp: 15,
    durability: 15,
    mobility_penalty: 0,
    body_locations: ['Torso', 'Arms', 'Legs'],
    coverage: 'Reinforced',
    craft_dc: 12,
    sockets_max: 3,
    description: 'Full-length duster or trench coat interwoven with flexible impact-absorbing panels.',
    mechanic: 'DR 5, SP 15. Penalty: None. Locations: Torso, Arms, Legs. Base Sockets: 3.'
  },
  'stealth-suit': {
    name: 'Stealth Suit',
    category: 'Lightweight',
    armor_type: 'Light Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 5,
    sp: 15,
    durability: 15,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Sealed',
    craft_dc: 14,
    sockets_max: 3,
    description: 'Form-fitting thermal-baffled infiltration bodysuit with sound-dampening soles and chameleon weave.',
    mechanic: 'DR 5, SP 15. Penalty: None. Locations: Head, Torso, Arms, Legs. Base Sockets: 3.'
  },
  'helmet-standard': {
    name: 'Helmet (Standard)',
    category: 'Lightweight',
    armor_type: 'Light Armor',
    tech_level: 2,
    meta_level: 0,
    dr: 10,
    sp: 10,
    durability: 10,
    mobility_penalty: 0,
    body_locations: ['Head'],
    coverage: 'Partial',
    craft_dc: 10,
    sockets_max: 1,
    description: 'Open-faced or visored composite combat helmet protecting the cranium from shrapnel and impacts.',
    mechanic: 'DR 10, SP 10. Penalty: None. Locations: Head. Base Sockets: 1.'
  },
  'armored-jacket-standard': {
    name: 'Armored Jacket (Standard)',
    category: 'Mediumweight',
    armor_type: 'Medium Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 10,
    sp: 20,
    durability: 20,
    mobility_penalty: 0,
    body_locations: ['Torso', 'Arms'],
    coverage: 'Standard',
    craft_dc: 12,
    sockets_max: 4,
    description: 'Mercenary-grade armored jacket with plasteel shoulder and chest inserts.',
    mechanic: 'DR 10, SP 20. Penalty: None. Locations: Torso, Arms. Base Sockets: 4.'
  },
  'armored-jacket-heavy': {
    name: 'Armored Jacket (Heavy)',
    category: 'Mediumweight',
    armor_type: 'Medium Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 15,
    sp: 25,
    durability: 25,
    mobility_penalty: -1,
    body_locations: ['Torso', 'Arms'],
    coverage: 'Reinforced',
    craft_dc: 15,
    sockets_max: 4,
    description: 'Heavy-duty combat jacket reinforced with overlapping ceramic-titanium trauma plates.',
    mechanic: 'DR 15, SP 25. Penalty: -1 Agility. Locations: Torso, Arms. Base Sockets: 4.'
  },
  'armored-long-coat-heavy': {
    name: 'Armored Long Coat (Heavy)',
    category: 'Mediumweight',
    armor_type: 'Medium Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 10,
    sp: 25,
    durability: 25,
    mobility_penalty: -1,
    body_locations: ['Torso', 'Arms', 'Legs'],
    coverage: 'Reinforced',
    craft_dc: 15,
    sockets_max: 5,
    description: 'Heavy ballistic greatcoat plated with high-density armor inserts across torso, arms, and legs.',
    mechanic: 'DR 10, SP 25. Penalty: -1 Agility. Locations: Torso, Arms, Legs. Base Sockets: 5.'
  },
  'armored-pants-heavy': {
    name: 'Armored Pants (Heavy)',
    category: 'Mediumweight',
    armor_type: 'Medium Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 10,
    sp: 20,
    durability: 20,
    mobility_penalty: -1,
    body_locations: ['Legs'],
    coverage: 'Standard',
    craft_dc: 15,
    sockets_max: 4,
    description: 'Heavy tactical greaves and plated combat trousers built for frontline firefights.',
    mechanic: 'DR 10, SP 20. Penalty: -1 Agility. Locations: Legs. Base Sockets: 4.'
  },
  'helmet-heavy': {
    name: 'Helmet (Heavy)',
    category: 'Mediumweight',
    armor_type: 'Medium Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 15,
    sp: 15,
    durability: 15,
    mobility_penalty: 0,
    body_locations: ['Head'],
    coverage: 'Partial',
    craft_dc: 12,
    sockets_max: 2,
    description: 'Fully enclosed heavy tactical helmet with reinforced faceplate and ballistic visor.',
    mechanic: 'DR 15, SP 15. Penalty: -1 Perception. Locations: Head. Base Sockets: 2.'
  },
  'enviro-suit': {
    name: 'Enviro Suit (Sealed)',
    category: 'Mediumweight',
    armor_type: 'Medium Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 5,
    sp: 20,
    durability: 20,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Sealed',
    craft_dc: 15,
    sockets_max: 5,
    description: 'Hermetically sealed hazard and vacuum suit with integrated life support and radiation shielding.',
    mechanic: 'DR 5, SP 20. Penalty: None. Locations: Head, Torso, Arms, Legs (Sealed). Base Sockets: 5.'
  },
  'smart-suit': {
    name: 'Smart Suit (Active Camo / Telemetry)',
    category: 'Mediumweight',
    armor_type: 'Medium Armor',
    tech_level: 4,
    meta_level: 0,
    dr: 10,
    sp: 25,
    durability: 25,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Sealed',
    craft_dc: 20,
    sockets_max: 6,
    description: 'Advanced TL4 sealed Skinsuit with integrated biometric telemetry, micro-servos, and adaptive weave.',
    mechanic: 'DR 10, SP 25. Penalty: None. Locations: Head, Torso, Arms, Legs (Sealed). Base Sockets: 6.'
  },
  'full-body-armor-sealed': {
    name: 'Full Body Armor (Sealed)',
    category: 'Mediumweight',
    armor_type: 'Medium Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 15,
    sp: 30,
    durability: 30,
    mobility_penalty: -1,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Sealed',
    craft_dc: 18,
    sockets_max: 6,
    description: 'Standard military full-body hard-suit sealed against vacuum and battlefield contaminants.',
    mechanic: 'DR 15, SP 30. Penalty: -1 Agility. Locations: Head, Torso, Arms, Legs (Sealed). Base Sockets: 6.'
  },
  'full-body-armor-heavy-reinforced': {
    name: 'Full Body Armor (Heavy / Reinforced)',
    category: 'Heavyweight',
    armor_type: 'Heavy Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 20,
    sp: 40,
    durability: 40,
    mobility_penalty: -2,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Reinforced',
    craft_dc: 22,
    sockets_max: 8,
    description: 'Reinforced shock-trooper carapace plating covering the entire body in high-density composite.',
    mechanic: 'DR 20, SP 40. Penalty: -2 Agility, -5ft Speed. Locations: Head, Torso, Arms, Legs. Base Sockets: 8.'
  },
  'battle-suit-heavy-assault': {
    name: 'Battle Suit (Heavy Assault)',
    category: 'Heavyweight',
    armor_type: 'Heavy Armor',
    tech_level: 4,
    meta_level: 0,
    dr: 25,
    sp: 50,
    durability: 50,
    mobility_penalty: -2,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Bulwark',
    craft_dc: 25,
    sockets_max: 10,
    description: 'Heavy assault battle armor built for breach teams and high-intensity siege warfare.',
    mechanic: 'DR 25, SP 50. Penalty: -2 Agility, -10ft Speed. Locations: Head, Torso, Arms, Legs. Base Sockets: 10.'
  },
  'battle-suit-bulwark': {
    name: 'Battle Suit (Bulwark)',
    category: 'Heavyweight',
    armor_type: 'Heavy Armor',
    tech_level: 4,
    meta_level: 0,
    dr: 30,
    sp: 60,
    durability: 60,
    mobility_penalty: -3,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Bulwark',
    craft_dc: 30,
    sockets_max: 12,
    description: 'Maximum-density unpowered fortress armor turning the wearer into a walking bunker.',
    mechanic: 'DR 30, SP 60. Penalty: -3 Agility, -10ft Speed. Locations: Head, Torso, Arms, Legs. Base Sockets: 12.'
  },
  'exoskeleton-battlesuit': {
    name: 'Exoskeleton Battlesuit',
    category: 'Heavyweight',
    armor_type: 'Powered Armor',
    tech_level: 4,
    meta_level: 0,
    dr: 25,
    sp: 50,
    durability: 50,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Bulwark',
    craft_dc: 30,
    sockets_max: 10,
    description: 'Servo-assisted powered battlesuit that negates armor weight and augments physical strength.',
    mechanic: 'DR 25, SP 50. Penalty: None (Powered), +2 Strength. Locations: Head, Torso, Arms, Legs. Base Sockets: 10.'
  },
  'battle-suit-standard-pa': {
    name: 'Battle Suit (Standard Power Armor)',
    category: 'Heavyweight',
    armor_type: 'Powered Armor',
    tech_level: 4,
    meta_level: 0,
    dr: 40,
    sp: 120,
    durability: 120,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Bulwark',
    craft_dc: 30,
    sockets_max: 15,
    description: 'A sealed, armored suit with myomer-muscle underlay. The apex of personal protection.',
    mechanic: 'DR 40, SP 120. Powered (+4 Strength), Full Life Support, HUD Link. Locations: All. Base Sockets: 15.'
  },
  'composite-combat-shell': {
    name: 'Composite Combat Shell (Entari/Syndicate)',
    category: 'Heavyweight',
    armor_type: 'Heavy Armor',
    tech_level: 4,
    meta_level: 0,
    dr: 20,
    sp: 50,
    durability: 50,
    mobility_penalty: -1,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Sealed',
    craft_dc: 22,
    sockets_max: 8,
    description: 'Advanced molded ceramics that offer superior deflection. Sleek, sealed, and expensive.',
    mechanic: 'DR 20, SP 50. Penalty: -1 Mobility, -5ft Movement. Refractive Coating (+2 Defense vs Lasers/Beams). Locations: All. Base Sockets: 8.'
  },
  'heavy-assault-plate-juggernaut': {
    name: 'Heavy Assault Plate (Juggernaut)',
    category: 'Heavyweight',
    armor_type: 'Heavy Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 30,
    sp: 80,
    durability: 80,
    mobility_penalty: -2,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Bulwark',
    craft_dc: 25,
    sockets_max: 10,
    description: 'Thick slabs of ablative armor and plasteel. Turns the wearer into a walking tank.',
    mechanic: 'DR 30, SP 80. Penalty: -2 Mobility, -10ft Movement. Anchor (Advantage on checks to resist knockdown). Locations: All. Base Sockets: 10.'
  },
  'eod-hazard-shell': {
    name: 'EOD / Hazard Shell',
    category: 'Heavyweight',
    armor_type: 'Heavy Armor',
    tech_level: 3,
    meta_level: 0,
    dr: 30,
    sp: 80,
    durability: 80,
    mobility_penalty: -2,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Bulwark',
    craft_dc: 25,
    sockets_max: 10,
    description: 'Extremely bulky armor designed for bomb disposal or plasma leaks.',
    mechanic: 'DR 30, SP 80. Penalty: -2 Mobility, -10ft Movement. Blast Shielding (Explosive/Area damage reduced by 50%). Locations: All. Base Sockets: 10.'
  },
  'sabatons': {
    name: 'Sabatons (Armored Boots)',
    category: 'Lightweight',
    armor_type: 'Light Armor',
    tech_level: 2,
    meta_level: 0,
    dr: 10,
    sp: 10,
    durability: 10,
    mobility_penalty: 0,
    body_locations: ['Legs'],
    coverage: 'Partial',
    craft_dc: 10,
    sockets_max: 2,
    description: 'Reinforced combat boots and lower-leg greaves providing kick protection and foot armor.',
    mechanic: 'DR 10, SP 10. Locations: Legs. Unarmed Kick deals 2d4 Blunt damage. Base Sockets: 2.'
  },
  'symbiotic-second-skin': {
    name: 'Symbiotic "Second Skin"',
    category: 'Lightweight',
    armor_type: 'Light Armor (Biotech)',
    tech_level: 4,
    meta_level: 0,
    dr: 8,
    sp: 25,
    durability: 25,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Full Body',
    craft_dc: 20,
    sockets_max: 2,
    description: 'A semi-translucent, living membrane that bonds to the wearer\'s epidermis. It regulates temperature, filters toxins, and seals wounds instantly.',
    mechanic: 'DR 8 (Adaptive Flesh), SP 25 (Living Tissue). Regeneration (Restores 1 SP/min); Diagnosis (+2 to Fortitude saves vs Disease/Poison). Base Sockets: 2.'
  },
  'chitinous-carapace': {
    name: 'Chitinous Carapace (Warrior Strain)',
    category: 'Heavyweight',
    armor_type: 'Full Body Armor (Biotech)',
    tech_level: 4,
    meta_level: 0,
    dr: 20,
    sp: 60,
    durability: 60,
    mobility_penalty: -1,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Sealed',
    craft_dc: 25,
    sockets_max: 6,
    description: 'Heavy, interlocking plates of bio-ceramic bone and insectoid chitin grown over a muscular underlay. Offers superior environmental adaptation.',
    mechanic: 'DR 20 (Hardened Bone), SP 60 (Dense Chitin). Penalty: -1 Mobility. Sealed (4hr Water/Vacuum breathing); Camouflage (+2 Stealth). Base Sockets: 6.'
  },
  'warded-weave-robes': {
    name: 'Warded Weave Robes',
    category: 'Lightweight',
    armor_type: 'Reinforced Clothing (Arcane)',
    tech_level: 3,
    meta_level: 3,
    dr: 10,
    sp: 15,
    durability: 15,
    mobility_penalty: 0,
    body_locations: ['Torso', 'Arms', 'Legs'],
    coverage: 'Standard',
    craft_dc: 22,
    sockets_max: 3,
    description: 'High-quality ballistic cloth embroidered with threads of conductive gold and Aetherium. The runes flare with light when struck, dispersing energy.',
    mechanic: 'DR 5 (Physical) / 10 (Energy/Magic), SP 15. Spell Resistance (+2 Defense vs Metaphysic Attacks); Focus (Masterwork Tool for Spellcasting). Base Sockets: 3.'
  },
  'runeguard-plate': {
    name: 'Runeguard Plate',
    category: 'Heavyweight',
    armor_type: 'Battle Suit (Heavy)',
    tech_level: 3,
    meta_level: 4,
    dr: 25,
    sp: 70,
    durability: 70,
    mobility_penalty: -2,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Reinforced',
    craft_dc: 30,
    sockets_max: 6,
    description: 'Ancient ceramic or stone-composite armor etched with glowing defensive sigils. It is heavy but resonates with the wearer\'s aura.',
    mechanic: 'DR 25 (Runed Stone), SP 70 (Reinforced). Penalty: -2 Mobility, -5ft Movement. Aegis (Spend 1 Karma to double DR against a single attack). Base Sockets: 6.'
  },
  'crystalline-body-glove': {
    name: 'Crystalline Body-Glove',
    category: 'Lightweight',
    armor_type: 'Light Armor (Psionic)',
    tech_level: 4,
    meta_level: 2,
    dr: 10,
    sp: 30,
    durability: 30,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Full Body',
    craft_dc: 25,
    sockets_max: 4,
    description: 'A tight, shimmering suit made of flexible psycho-reactive crystals. Nearly weightless, turning rigid instantly upon impact.',
    mechanic: 'DR 10 (Reactive Crystal), SP 30 (Shatter-Resistant). Mental Hardening (+2 Willpower saves); Psi-Link (Hands-free operation via thought). Base Sockets: 4.'
  },
  'inquisitor-mind-plate': {
    name: 'Inquisitor\'s Mind-Plate',
    category: 'Heavyweight',
    armor_type: 'Full Body Armor (Heavy)',
    tech_level: 4,
    meta_level: 3,
    dr: 22,
    sp: 55,
    durability: 55,
    mobility_penalty: -1,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Sealed',
    craft_dc: 28,
    sockets_max: 6,
    description: 'Heavy composite armor laced with psychic dampeners and sensory boosters. Designed to hunt rogue psychics and entities.',
    mechanic: 'DR 22 (Psycho-Conductive Alloy), SP 55. Penalty: -1 Mobility. Null-Field (DR 10 vs Psionic Damage); Terror (+2 Intimidate). Base Sockets: 6.'
  },
  'polymatter-liquid-suit': {
    name: 'Polymatter "Liquid" Suit',
    category: 'Mediumweight',
    armor_type: 'Variable (Light to Medium)',
    tech_level: 5,
    meta_level: 0,
    dr: 15,
    sp: 40,
    durability: 40,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Variable',
    craft_dc: 35,
    sockets_max: 4,
    description: 'A suit composed of millions of nanites suspended in a silver fluid. It flows over the wearer like water and can reshape itself on command.',
    mechanic: 'DR 15 (Fluid Impact Absorption), SP 40 (Self-Repairing Cloud). Morph (Change appearance/color as Standard Action); Concealment (+4 to Hide items inside). Base Sockets: 4.'
  },
  'holophotonic-emitter-harness': {
    name: 'Holophotonic Emitter Harness',
    category: 'Device',
    armor_type: 'Light Armor (Projected)',
    tech_level: 5,
    meta_level: 0,
    dr: 20,
    sp: 50,
    durability: 50,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Projected',
    craft_dc: 30,
    sockets_max: 2,
    description: 'A lightweight harness that projects a suit of "Hard Light" armor only when combat begins. When inactive, the wearer appears unarmored.',
    mechanic: 'DR 20 (Force Field), SP 50 (Battery Life). Weightless (0 Penalty). Instant Don/Doff; Glow (Stealth impossible while active unless Dark Light upgrade installed). Base Sockets: 2.'
  },
  'jewelry-fine': {
    name: 'Jewelry (Fine / Artifice)',
    category: 'Jewelry',
    armor_type: 'Jewelry',
    tech_level: 1,
    meta_level: 1,
    dr: 0,
    sp: 2,
    durability: 2,
    mobility_penalty: 0,
    body_locations: ['Arms'],
    coverage: 'Partial',
    craft_dc: 10,
    sockets_max: 0,
    description: 'Precious metal rings, amulets, or torcs suitable for high-society display or metaphysical attunement.',
    mechanic: 'DR 0, SP 2. Fine jewelry or metaphysical focus item.'
  },
  // FIELD GENERATORS & CARRIED SHIELDS (99.Tech.Armor.DesignAndCatalog.md Section IV)
  'light-force-field': {
    name: 'Light Force Field (Belt / Gauntlet)',
    category: 'Device',
    armor_type: 'Shield / Field',
    tech_level: 4,
    meta_level: 0,
    dr: 10,
    sp: 20,
    durability: 20,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Standard',
    craft_dc: 15,
    sockets_max: 1,
    description: 'Personal belt or bracer emitter projecting a shimmering kinetic-thermal deflection screen.',
    mechanic: 'Field DR 10, Field SP 20 (Regen 2/round). Overloads for 1 minute if reduced to 0 SP.'
  },
  'medium-force-field': {
    name: 'Medium Force Field (Harness)',
    category: 'Device',
    armor_type: 'Shield / Field',
    tech_level: 4,
    meta_level: 0,
    dr: 15,
    sp: 30,
    durability: 30,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Standard',
    craft_dc: 20,
    sockets_max: 2,
    description: 'Chest-mounted military field generator providing full-body energy and ballistic dampening.',
    mechanic: 'Field DR 15, Field SP 30 (Regen 5/round). Overloads for 1 minute if reduced to 0 SP.'
  },
  'heavy-force-field': {
    name: 'Heavy Force Field (Backpack)',
    category: 'Device',
    armor_type: 'Shield / Field',
    tech_level: 4,
    meta_level: 0,
    dr: 20,
    sp: 50,
    durability: 50,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Standard',
    craft_dc: 25,
    sockets_max: 3,
    description: 'Heavy backpack-mounted capacitor array projecting a high-output personal fortress barrier.',
    mechanic: 'Field DR 20, Field SP 50 (Regen 10/round). Overloads for 1 minute if reduced to 0 SP.'
  },
  'distortion-field': {
    name: 'Distortion Field (Displacement)',
    category: 'Device',
    armor_type: 'Shield / Field',
    tech_level: 5,
    meta_level: 0,
    dr: 10,
    sp: 30,
    durability: 30,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Standard',
    craft_dc: 28,
    sockets_max: 2,
    description: 'Refractive spatial-phase emitter that blurs the wearer’s position and bends incoming trajectories.',
    mechanic: 'Field DR 10, Field SP 30. Grants 20% Concealment miss chance against ranged attacks.'
  },
  'holo-armor-field': {
    name: 'Holo-Armor Field (Hard-Light)',
    category: 'Device',
    armor_type: 'Shield / Field',
    tech_level: 5,
    meta_level: 0,
    dr: 25,
    sp: 60,
    durability: 60,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Sealed',
    craft_dc: 35,
    sockets_max: 2,
    description: 'Instantly manifests a weightless geometric shell of solid hard-light around the user.',
    mechanic: 'Field DR 25, Field SP 60 (Regen 10/round). Weightless hard-light full-body barrier.'
  },
  'buckler-shield': {
    name: 'Buckler / Small Shield',
    category: 'Lightweight',
    armor_type: 'Shield',
    tech_level: 1,
    meta_level: 0,
    dr: 5,
    sp: 15,
    durability: 15,
    mobility_penalty: 0,
    body_locations: ['Arms'],
    coverage: 'Partial',
    craft_dc: 6,
    sockets_max: 1,
    carried_shield: '+1 Defense',
    description: 'Compact forearm-strapped parrying shield leaving the hand free to hold light items.',
    mechanic: '+1 Shield Bonus to Defense. DR 5, SP 15. Base Sockets: 1.'
  },
  'medium-shield': {
    name: 'Medium / Riot Shield',
    category: 'Mediumweight',
    armor_type: 'Shield',
    tech_level: 2,
    meta_level: 0,
    dr: 10,
    sp: 25,
    durability: 25,
    mobility_penalty: 0,
    body_locations: ['Arms', 'Torso'],
    coverage: 'Partial',
    craft_dc: 10,
    sockets_max: 2,
    carried_shield: '+2 Defense',
    description: 'Transparent polycarbonate or alloy tactical shield used by security and breach teams.',
    mechanic: '+2 Shield Bonus to Defense. DR 10, SP 25. Base Sockets: 2.'
  },
  'large-tower-shield': {
    name: 'Large / Tower Shield',
    category: 'Heavyweight',
    armor_type: 'Shield',
    tech_level: 2,
    meta_level: 0,
    dr: 15,
    sp: 40,
    durability: 40,
    mobility_penalty: -2,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Reinforced',
    craft_dc: 12,
    sockets_max: 4,
    carried_shield: '+4 Defense (Half Cover)',
    description: 'Full-height ballistic breach shield capable of providing mobile half-cover.',
    mechanic: '+4 Shield Bonus to Defense (can brace for Half Cover). -2 Attack Penalty. DR 15, SP 40. Base Sockets: 4.'
  },
  'projected-energy-shield': {
    name: 'Projected Energy Shield (Gauntlet)',
    category: 'Device',
    armor_type: 'Shield',
    tech_level: 4,
    meta_level: 0,
    dr: 15,
    sp: 20,
    durability: 20,
    mobility_penalty: 0,
    body_locations: ['Arms'],
    coverage: 'Partial',
    craft_dc: 16,
    sockets_max: 1,
    carried_shield: '+2 Defense',
    description: 'Wrist-mounted emitter projecting a disc of coherent plasma-magnetic force on demand.',
    mechanic: '+2 Shield Bonus to Defense. DR 15, SP 20. Ignites/deactivates as a Free Action.'
  },
  'projected-riot-shield': {
    name: 'Projected Riot Shield (Hard-Light)',
    category: 'Device',
    armor_type: 'Shield',
    tech_level: 4,
    meta_level: 0,
    dr: 20,
    sp: 40,
    durability: 40,
    mobility_penalty: -1,
    body_locations: ['Torso', 'Arms'],
    coverage: 'Standard',
    craft_dc: 22,
    sockets_max: 2,
    carried_shield: '+4 Defense',
    description: 'Heavy gauntlet projector forming an interlocking hard-light barrier wall.',
    mechanic: '+4 Shield Bonus to Defense, -1 Attack Penalty. DR 20, SP 40.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS 1: WEAPONRY (.md files & weaponryData.js)
// ═══════════════════════════════════════════════════════════════════════════
function updateWeaponry() {
  const weaponDir = path.join(omniRoot, 'weaponry');
  const items = [];

  for (const [id, spec] of Object.entries(CANONICAL_WEAPONS)) {
    const filePath = path.join(weaponDir, `${id}.md`);
    let existingData = {};
    if (fs.existsSync(filePath)) {
      const parsed = matter(fs.readFileSync(filePath, 'utf8'));
      existingData = parsed.data || {};
    }

    const dc = spec.craft_dc;
    const credits = tscCredits(dc);
    const socketsMax = SIZE_SOCKETS[spec.size] ?? 2;
    const tl = spec.tech_level;
    const ml = existingData.meta_level || 0;

    const frontmatter = {
      ...existingData,
      id,
      name: spec.name,
      category: 'weaponry',
      weapon_type: spec.weapon_type,
      classification: spec.classification,
      wielding: spec.wielding,
      size: spec.size,
      damage: spec.damage,
      damage_type: spec.damage_type,
      range: spec.range,
      ammo: spec.ammo,
      ammunition: spec.ammo,
      rate_of_fire: spec.special.includes('Autofire') ? 'Single / Burst / Auto' : 'Single',
      tech_level: tl,
      meta_level: ml,
      craft_dc: dc,
      design_dc: dc,
      cost: credits,
      costs: {
        cp: 0,
        bp: 0,
        credits,
        nodes: 0,
        sockets: 0,
        strain: 0,
        focus: 0,
        ap: spec.wielding === 'Two-Handed' ? 2 : 1
      },
      sockets: {
        max: socketsMax,
        used: 0,
        tier: 'Socket',
        allocated: []
      },
      modifiers: Array.isArray(existingData.modifiers) ? existingData.modifiers : [],
      modifications: Array.isArray(existingData.modifications) ? existingData.modifications : [],
      critical_details: existingData.critical_details || {
        score: '20',
        effect: [],
        success_effect: [],
        failure_effect: []
      },
      special: spec.special,
      description: spec.description,
      mechanic: `Damage: ${spec.damage} (${spec.damage_type}) | Range: ${spec.range} | Ammo: ${spec.ammo} | Special: ${spec.special} | Craft DC: ${dc} (${credits.toLocaleString()} Cr)`,
      keywords: `${spec.name.toLowerCase()}, weapon, ${spec.weapon_type.toLowerCase()}, ${spec.damage_type.toLowerCase()}, tl-${tl}`,
      negative_keywords: spec.weapon_type === 'Melee' ? 'extreme-range, sniper, orbital' : 'unarmed, grapple'
    };

    const bodyText = `${spec.description}\n\n**Special:** ${spec.special}\n\nCategory: ${spec.weapon_type.toUpperCase()}`;
    const mdContent = matter.stringify(bodyText, frontmatter);
    fs.writeFileSync(filePath, mdContent, 'utf8');

    items.push({
      ...frontmatter,
      body: bodyText
    });
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Weaponry Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/weaponry/
 * Total Weapons: ${items.length}
 */

export const DEFAULT_WEAPONRY = ${JSON.stringify(items, null, 2)};
export const getWeaponById = (id) => DEFAULT_WEAPONRY.find(w => w.id === id);
`;
  fs.writeFileSync(path.join(staticDataRoot, 'weaponryData.js'), outputCode, 'utf8');
  console.log(`[Weaponry] Revised ${items.length} canonical weapons (.md + weaponryData.js)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS 2: ARMORING (.md files & armoringData.js)
// ═══════════════════════════════════════════════════════════════════════════
function updateArmoring() {
  const armorDir = path.join(omniRoot, 'armoring');
  const existingFiles = fs.readdirSync(armorDir).filter(f => f.endsWith('.md'));
  const allIds = new Set([
    ...existingFiles.map(f => f.replace(/\.md$/, '')),
    ...Object.keys(CANONICAL_ARMOR_FIXES)
  ]);

  const items = [];

  for (const id of allIds) {
    const filePath = path.join(armorDir, `${id}.md`);
    let data = {};
    let body = '';
    if (fs.existsSync(filePath)) {
      const parsed = matter(fs.readFileSync(filePath, 'utf8'));
      data = parsed.data || {};
      body = (parsed.content || '').trim();
    }

    const fix = CANONICAL_ARMOR_FIXES[id];
    const name = fix?.name || data.name || id;
    const weightClass = fix?.category || (['Lightweight', 'Mediumweight', 'Heavyweight', 'Device', 'Jewelry'].includes(data.category) ? data.category : 'Mediumweight');
    const armorType = fix?.armor_type || data.armor_type || weightClass;
    const tl = fix?.tech_level ?? (data.tech_level > 0 ? data.tech_level : 3);
    const ml = fix?.meta_level ?? (data.meta_level || 0);
    const dr = fix?.dr ?? Number(data.dr ?? 5);
    const sp = fix?.sp ?? Number(data.sp ?? data.durability ?? 15);
    const durability = fix?.durability ?? Number(data.durability ?? sp);
    const dc = fix?.craft_dc ?? (data.craft_dc || data.design_dc || dcFromCredits(data.cost || data.costs?.credits || 160));
    const credits = tscCredits(dc);
    const socketsMax = fix?.sockets_max ?? (data.sockets?.max || data.component_slots || 2);
    const bodyLocations = fix?.body_locations || data.body_locations || ['Torso'];
    const coverage = fix?.coverage || data.coverage || 'Standard';
    const mobilityPenalty = fix?.mobility_penalty ?? data.mobility_penalty ?? 0;
    const desc = fix?.description || data.description || `${name} protective armor system.`;
    const mech = fix?.mechanic || data.mechanic || `DR ${dr}, SP ${sp}. Locations: ${bodyLocations.join(', ')}. Base Sockets: ${socketsMax}. Craft DC: ${dc} (${credits.toLocaleString()} Cr).`;

    const frontmatter = {
      ...data,
      id,
      name,
      collection: 'armoring',
      category: weightClass,
      armor_class: weightClass,
      armor_type: armorType,
      tech_level: tl,
      meta_level: ml,
      dr,
      sp,
      durability,
      mobility_penalty: mobilityPenalty,
      body_locations: bodyLocations,
      coverage,
      craft_dc: dc,
      design_dc: dc,
      cost: credits,
      component_slots: socketsMax,
      sockets: {
        max: socketsMax,
        used: 0,
        tier: 'Socket',
        allocated: []
      },
      costs: {
        cp: 0,
        bp: 0,
        credits,
        nodes: 0,
        sockets: 0,
        strain: 0,
        focus: 0,
        ap: 0
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      modifications: Array.isArray(data.modifications) ? data.modifications : [],
      critical_details: data.critical_details || {
        score: '',
        effect: [],
        success_effect: [],
        failure_effect: []
      },
      description: desc,
      mechanic: mech,
      keywords: data.keywords || `${name.toLowerCase()}, armor, defense, dr-${dr}, ${weightClass.toLowerCase()}, tl-${tl}`,
      negative_keywords: data.negative_keywords || 'unarmored, fragile, naked'
    };

    if (fix?.carried_shield) {
      frontmatter.carried_shield = fix.carried_shield;
    }

    const bodyText = body && !fix ? body : `${desc}\n\n**Mechanics:** ${mech}`;
    fs.writeFileSync(filePath, matter.stringify(bodyText, frontmatter), 'utf8');

    items.push({
      ...frontmatter,
      body: bodyText
    });
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Armoring Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/armoring/
 * Total Armor Items: ${items.length}
 */

export const DEFAULT_ARMORING = ${JSON.stringify(items, null, 2)};
export const getArmorById = (id) => DEFAULT_ARMORING.find(a => a.id === id);
`;
  fs.writeFileSync(path.join(staticDataRoot, 'armoringData.js'), outputCode, 'utf8');
  console.log(`[Armoring] Revised ${items.length} canonical armor items (.md + armoringData.js)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS 3: GEAR (.md files & gearData.js)
// ═══════════════════════════════════════════════════════════════════════════
const GEAR_SOCKET_MAP = {
  Fine: 0,
  Diminutive: 1,
  Tiny: 2,
  Small: 4,
  Medium: 8
};

const CANONICAL_GEAR_ADDITIONS = {
  'clothing-standard': {
    name: 'Clothing (Standard)',
    gear_type: 'Mundane & Personal',
    size: 'Small',
    tech_level: 2,
    meta_level: 0,
    craft_dc: 2,
    cost: 13,
    description: 'Durable synthetic street clothes suitable for everyday frontier or urban wear.',
    mechanic: 'Standard everyday attire. Provides no armor DR; legal in all jurisdictions.'
  },
  'expert-software': {
    name: 'Expert Software Suite',
    gear_type: 'Computers & Software',
    size: 'Fine',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    description: 'Specialized heuristic software package requiring a Processor Rating (PR) of 2 or higher.',
    mechanic: 'Requires PR 2+. Grants an Aid Bonus (+1 at CR 10 / 160 Cr, +2 at CR 15 / 640 Cr, +3 at CR 20 / 2,560 Cr) to a specific Skill Check.'
  },
  'operation-software': {
    name: 'Operation Software Suite',
    gear_type: 'Computers & Software',
    size: 'Fine',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    description: 'Automated task-execution software capable of operating hardware or performing routine checks autonomously.',
    mechanic: 'Requires PR 0+. Automates skill execution by Taking 10: Basic (Rank 5, CR 10 / 160 Cr), Intermediate (Rank 10, CR 15 / 640 Cr), Advanced (Rank 15, CR 20 / 2,560 Cr).'
  },
  'field-surgery-clinic': {
    name: 'Field Surgery / Portable Clinic',
    gear_type: 'Medical Systems',
    size: 'Medium',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    description: 'Semi-portable sterile surgical suite and diagnostic trauma bay for field operations.',
    mechanic: 'Grants a +2 Bonus to Medicine checks. Requires Trained proficiency (Rank 6+) in Medicine.'
  },
  'operating-theater-hospital': {
    name: 'Operating Theater / Hospital Bay',
    gear_type: 'Medical Systems',
    size: 'Large',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 20,
    cost: 2560,
    description: 'Full-scale surgical theater equipped with automated life support, laser scalpels, and sterile containment.',
    mechanic: 'Grants a +4 Bonus to Medicine checks. Requires Expert proficiency (Rank 11+) in Medicine.'
  },
  'passive-sensors': {
    name: 'Passive Sensors (Camera/Mic/Rangefinder)',
    gear_type: 'Surveillance & Comms',
    size: 'Diminutive',
    tech_level: 2,
    meta_level: 0,
    craft_dc: 5,
    cost: 40,
    description: 'Compact optical camera, directional microphone, and laser rangefinder array.',
    mechanic: 'Captures high-definition audio/visual data and rangefinding telemetry without emitting active signals.'
  },
  'holo-cam': {
    name: 'Holo-Cam (Volumetric Recorder)',
    gear_type: 'Surveillance & Comms',
    size: 'Tiny',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 10,
    cost: 160,
    description: 'Multi-angleレーザー/photonic volumetric camera for recording 3D holographic scenes.',
    mechanic: 'Captures 3D volumetric spatial data for full Augmented Reality (AR) or Holo-Emitter reconstruction.'
  },
  'comm-unit-holographic': {
    name: 'Comm Unit (Holographic)',
    gear_type: 'Surveillance & Comms',
    size: 'Diminutive',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 10,
    cost: 160,
    description: 'Personal wrist or palm communicator with integrated micro-holoprojector.',
    mechanic: 'Provides planetary-mesh audio/visual communication and projects the caller\'s 3D holographic avatar.'
  },
  'satellite-uplink': {
    name: 'Satellite Uplink Transceiver',
    gear_type: 'Surveillance & Comms',
    size: 'Small',
    tech_level: 2,
    meta_level: 0,
    craft_dc: 10,
    cost: 160,
    description: 'Portable high-gain folding dish and orbital relay transceiver.',
    mechanic: 'Removes terrestrial range limits on linked Comm Units by bouncing signals through orbital satellites.'
  },
  'climbing-gear-standard': {
    name: 'Climbing Gear (Standard)',
    gear_type: 'Survival & Field',
    size: 'Small',
    tech_level: 2,
    meta_level: 0,
    craft_dc: 5,
    cost: 40,
    description: 'High-tensile synthetic rope, harness, carabiners, and powered pitons.',
    mechanic: 'Negates standard equipment penalties on Athletics (Climbing) checks.'
  },
  'climbing-gear-advanced-grav': {
    name: 'Climbing Gear (Advanced / Grav-Attenuator)',
    gear_type: 'Survival & Field',
    size: 'Tiny',
    tech_level: 5,
    meta_level: 0,
    craft_dc: 25,
    cost: 10240,
    description: 'Apex TL5 grav-attenuator climbing harness and gecko-molecular grip gloves.',
    mechanic: 'Grants Advantage on all Athletics checks made to climb or traverse vertical and inverted surfaces.'
  },
  'diagnostic-system-stationary': {
    name: 'Diagnostic System (Stationary Array)',
    gear_type: 'Vocation Tools',
    size: 'Medium',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 20,
    cost: 2560,
    description: 'Stationary workshop diagnostic computer and deep-scan molecular analyzer.',
    mechanic: 'Grants a +4 Bonus to Repair and Engineering checks. Requires Trained proficiency (Rank 6+).'
  },
  'standard-database-tl3': {
    name: 'Standard Database Archive (TL 3)',
    gear_type: 'Computers & Software',
    size: 'Tiny',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    description: 'Comprehensive digital reference library and indexed planetary encyclopedia.',
    mechanic: 'Grants a +2 Bonus to Knowledge and Research checks when consulted.'
  },
  'upgraded-database-tl4': {
    name: 'Upgraded Database Archive (TL 4)',
    gear_type: 'Computers & Software',
    size: 'Tiny',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 20,
    cost: 2560,
    description: 'High-density quantum-indexed reference archive with heuristic cross-referencing.',
    mechanic: 'Grants a +4 Bonus to Knowledge checks. Requires Trained proficiency in the relevant Knowledge skill.'
  }
};

function updateGear() {
  const gearDir = path.join(omniRoot, 'gear');
  const existingFiles = fs.readdirSync(gearDir).filter(f => f.endsWith('.md'));
  const allIds = new Set([
    ...existingFiles.map(f => f.replace(/\.md$/, '')),
    ...Object.keys(CANONICAL_GEAR_ADDITIONS)
  ]);
  const items = [];

  for (const id of Array.from(allIds).sort()) {
    const filePath = path.join(gearDir, `${id}.md`);
    let data = {};
    let body = '';
    if (fs.existsSync(filePath)) {
      const parsed = matter(fs.readFileSync(filePath, 'utf8'));
      data = parsed.data || {};
      body = (parsed.content || '').trim();
    }

    const add = CANONICAL_GEAR_ADDITIONS[id];
    if (add) {
      data = {
        ...data,
        id,
        name: add.name,
        category: 'gear',
        gear_type: add.gear_type,
        size: add.size,
        tech_level: add.tech_level,
        meta_level: add.meta_level,
        craft_dc: add.craft_dc,
        base_dc: add.craft_dc,
        cost: add.cost,
        description: add.description,
        mechanic: add.mechanic,
        keywords: `${add.name.toLowerCase()}, gear, ${add.gear_type.toLowerCase()}, tl-${add.tech_level}`,
        negative_keywords: 'weapon, armor, vehicle'
      };
      body = `${add.description}\n\n**Mechanics:** ${add.mechanic}`;
    } else if (id === 'utility-harness') {
      data.name = 'Utility Harness / Webbing';
      data.category = 'gear';
      data.gear_type = 'Survival & Field';
      data.size = 'Small';
      data.tech_level = 2;
      data.meta_level = 0;
      data.craft_dc = 5;
      data.base_dc = 5;
      data.cost = 40;
      data.dr = 0;
      data.sp = 5;
      data.durability = 5;
      data.weight = 1.5;
      data.description = 'Load-bearing tactical webbing and modular belt harness providing attachment points and quick-draw pouches.';
      data.mechanic = 'DR 0, SP 5. Provides 1 modular Socket and +2 Carrying Capacity for belt-mounted gear.';
      data.keywords = 'utility harness, webbing, tactical belt, gear, survival, tl-2';
      body = `${data.description}\n\n**Mechanics:** ${data.mechanic}`;
    }

    const dc = data.craft_dc ?? data.base_dc ?? dcFromCredits(data.cost || data.costs?.credits || 40);
    const credits = data.cost && data.cost > 0 ? data.cost : tscCredits(dc);
    const tl = data.tech_level && data.tech_level > 0 ? data.tech_level : 2;
    const size = data.size || 'Small';
    const socketsMax = id === 'utility-harness' ? 1 : (data.sockets?.max > 0 ? data.sockets.max : (GEAR_SOCKET_MAP[size] ?? 2));

    const frontmatter = {
      ...data,
      id,
      name: data.name || id,
      category: 'gear',
      gear_type: data.gear_type || 'General',
      size,
      tech_level: tl,
      meta_level: data.meta_level || 0,
      craft_dc: dc,
      base_dc: data.base_dc ?? dc,
      design_dc: dc,
      cost: credits,
      costs: {
        cp: 0,
        bp: 0,
        credits,
        nodes: 0,
        sockets: 0,
        strain: 0,
        focus: 0,
        ap: 0
      },
      sockets: {
        max: socketsMax,
        used: 0,
        tier: 'Socket',
        allocated: []
      },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      modifications: Array.isArray(data.modifications) ? data.modifications : [],
      description: data.description || '',
      mechanic: data.mechanic || ''
    };

    fs.writeFileSync(filePath, matter.stringify(body, frontmatter), 'utf8');
    items.push({
      ...frontmatter,
      body
    });
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Gear Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/gear/
 * Total Gear Items: ${items.length}
 */

export const DEFAULT_GEAR = ${JSON.stringify(items, null, 2)};
export const getGearById = (id) => DEFAULT_GEAR.find(g => g.id === id);
`;
  fs.writeFileSync(path.join(staticDataRoot, 'gearData.js'), outputCode, 'utf8');
  console.log(`[Gear] Revised ${items.length} canonical gear items (.md + gearData.js)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS 4: MECHA (.md files & mechaData.js)
// Exact 90 canonical platforms from 2.00.Mecha.md (Sections 1-8)
// ═══════════════════════════════════════════════════════════════════════════
const CANONICAL_MECHA_LIST = [
  // Section 1: Personal Mobility & Light Vehicles (9)
  { id: 'standard-skateboard-longboard', name: 'Standard Skateboard / Longboard', classification: 'Personal Mobility', frame: 'Manual Ground Transport', propulsion: 'Manual (Push)', size: 'Tiny', crew: '1', tech_level: 1, craft_dc: 5, sp: 10, dr: 2, description: 'An urban deck for quick transit on paved surfaces. Grants increased movement on smooth, flat terrain using Manual (Push) propulsion.', mechanic: 'Manual (Push) propulsion. Grants +10ft Ground Move on smooth paved surfaces.' },
  { id: 'cycle-rugged-frame', name: 'Cycle (Rugged Frame)', classification: 'Personal Mobility', frame: 'Manual Geared Transport', propulsion: 'Manual (Pedal/Gear)', size: 'Medium', crew: '1', tech_level: 1, craft_dc: 6, sp: 15, dr: 5, description: 'A ruggedized frame with suspension for wilderness traversal. Uses Manual (Pedal/Gear) propulsion and includes a Gear System for mechanical advantage and a Cargo Rack.', mechanic: 'Manual (Pedal/Gear) propulsion. Includes mechanical advantage gearing and a light Cargo Rack.' },
  { id: 'surfboard-wave-rider', name: 'Surfboard / Wave-Rider', classification: 'Personal Mobility', frame: 'Environmental Watercraft', propulsion: 'Environmental (Wave/Current)', size: 'Medium', crew: '1', tech_level: 1, craft_dc: 6, sp: 12, dr: 3, description: 'A composite board for riding hydro-energy. Speed is equal to the wave/current speed and requires Athletics (Swim) or Profession (Surfer) to operate.', mechanic: 'Environmental (Wave/Current) propulsion. Requires Athletics (Swim) to maneuver in surf.' },
  { id: 'segway-gyro-pod', name: 'Segway / Gyro-Pod', classification: 'Personal Mobility', frame: 'Light Powered Transport', propulsion: 'Micro-Motor (Electric)', size: 'Small', crew: '1', tech_level: 2, craft_dc: 8, sp: 20, dr: 5, description: 'A self-balancing personal mover for station or city use. Light powered transport with a Micro-Motor (Electric) and Gyro-Stabilizer, offering hours of continuous use.', mechanic: 'Micro-Motor (Electric) with Gyro-Stabilizer. Self-balancing urban/station transit.' },
  { id: 'urban-scooter', name: 'Urban Electric Scooter', classification: 'Personal Mobility', frame: 'Micro-Mobility', propulsion: 'Micro-Motor (Electric)', size: 'Small', crew: '1', tech_level: 2, craft_dc: 8, sp: 15, dr: 4, description: 'A collapsible, single-person transport often rented by the minute in dense arcologies. Links to the city traffic grid to limit speed and prevent collisions.', mechanic: 'Collapsible Micro-Motor (Electric) scooter. Folds to Small luggage size; grid-linked navigation.' },
  { id: 'jet-hoverboard-skimmer', name: 'Jet-Powered Hoverboard (Skimmer)', classification: 'Personal Mobility', frame: 'Powered Hovercraft', propulsion: 'Vectored Thrust (Micro-Turbine)', size: 'Small', crew: '1', tech_level: 3, craft_dc: 12, sp: 25, dr: 5, description: 'A hover-style board using directed air thrust. Skims 1ft off the ground, featuring a Micro-Turbine and Mag-Clamps.', mechanic: 'Vectored Thrust hoverboard skimming 1ft above terrain. Includes boot Mag-Clamps.' },
  { id: 'subcompact-commuter', name: 'Subcompact Electric Commuter', classification: 'Personal Mobility', frame: 'Urban Transit', propulsion: 'Micro-Motor (Electric)', size: 'Medium', crew: '1+1', tech_level: 2, craft_dc: 12, sp: 40, dr: 8, description: 'The ubiquitous pod car of the future city, manufactured from printable composites with automated grid-link driving and swiveling seats.', mechanic: 'Enclosed electric commuter pod with automated grid-link autopilot and basic crash protection.' },
  { id: 'officers-hover-platform', name: 'Officer\'s Hover Platform', classification: 'Personal Mobility', frame: 'Anti-Gravity Platform', propulsion: 'Grav-Plate (Silent)', size: 'Small', crew: '1', tech_level: 4, craft_dc: 15, sp: 45, dr: 10, description: 'A floating disk used by commanders or overseers to remain above the fray. Features Grav-Plate (Silent) propulsion, a Tactical Shield, and a Comms/Sensor Suite.', mechanic: 'Silent Grav-Plate hover disk with integrated Tactical Shield and Command Comms/Sensor Suite.' },
  { id: 'personal-hover-pod-bubble', name: 'Personal Hover Pod (The "Bubble")', classification: 'Personal Mobility', frame: 'Enclosed Grav-Vehicle', propulsion: 'Grav-Drive', size: 'Medium', crew: '1+1', tech_level: 4, craft_dc: 18, sp: 60, dr: 10, description: 'An enclosed glass-sphere transport for comfortable city travel with a Grav-Drive for full flight capability, Life Support/EC, Comm Node, Autopilot, and 50kg stowage.', mechanic: 'Full flight Grav-Drive pod with Life Support, Autopilot, Integrated Comm Node, and 50kg stowage.' },

  // Section 2: Civilian Vehicles: Personal and Mass Transit (9)
  { id: 'retro-styled-sportscar', name: 'Retro-Styled Combustion Sportscar', classification: 'Civilian Vehicle', frame: 'Wheeled Ground Car', propulsion: 'Internal Combustion (ICE)', size: 'Large', crew: '1+1', tech_level: 2, craft_dc: 18, sp: 80, dr: 10, description: 'A mechanically simple vehicle running on synthetic alcohol or refined hydrocarbons with a manual transmission and analog dashboard, prized as a status symbol of raw power.', mechanic: 'High-speed wheeled sportscar (ICE). Immune to remote grid-hacking due to analog controls.' },
  { id: 'open-deck-grav-skiff', name: 'Open-Deck Grav Skiff', classification: 'Civilian Vehicle', frame: 'Repulsor Skiff', propulsion: 'Repulsion Field', size: 'Large', crew: '1+1', tech_level: 3, craft_dc: 16, sp: 70, dr: 8, description: 'A floating chassis consisting of a flat deck, control pylon, and exposed repulsion vanes. Favored by frontier farmers and local militias for its high maneuverability and ease of repair.', mechanic: 'Open-cockpit repulsion skiff. High maneuverability; ignores difficult ground terrain.' },
  { id: 'utility-platform-gravitic', name: 'Gravitic Utility Platform', classification: 'Civilian Vehicle', frame: 'Anti-Gravity Flatbed', propulsion: 'Anti-Gravity', size: 'Large', crew: '1+3', tech_level: 4, craft_dc: 18, sp: 85, dr: 10, description: 'A flying pickup truck with a localized gravity field, infinite loiter time, and vertical takeoff. Staple of planetary survey and exploration teams.', mechanic: 'Open-top anti-gravity utility platform with VTOL, infinite loiter, and open cargo bed.' },
  { id: 'hyper-luxury-coupe', name: 'Armored Hyper-Luxury Coupe', classification: 'Civilian Vehicle', frame: 'Armored VIP Aerocar', propulsion: 'Vector Thrust', size: 'Large', crew: '2', tech_level: 4, craft_dc: 25, sp: 120, dr: 20, description: 'A sleek aerodynamic shell concealing military-grade composite armor, hermetically sealed cabin, independent life support, and active defense systems for corporate VIPs.', mechanic: 'Hermetically sealed VIP vector-thrust coupe with heavy composite plating (DR 20) and active defenses.' },
  { id: 'family-skimmer', name: 'Enclosed Family Skimmer', classification: 'Civilian Vehicle', frame: 'Repulsor Sedan', propulsion: 'Repulsion Field', size: 'Large', crew: '1+3', tech_level: 3, craft_dc: 16, sp: 80, dr: 10, description: 'The standard suburban transport for the middle class, hovering a meter off the ground on a repulsion field with a sealed soundproofed canopy and crash-safety fields.', mechanic: 'Sealed 4-seat civilian repulsor skimmer with crash-safety fields and moderate speed.' },
  { id: 'heavy-logistics-hauler', name: 'Heavy Logistics Hauler', classification: 'Civilian Vehicle', frame: 'Heavy Wheeled/Tracked Truck', propulsion: 'Hydrogen Fuel Cell', size: 'Huge', crew: '1+2', tech_level: 3, craft_dc: 20, sp: 160, dr: 15, description: 'A massive multi-wheeled or tracked truck powered by a hydrogen fuel cell, designed to run for weeks without refueling with a sleeper cab and automated defensive turret mount.', mechanic: 'Long-range cargo hauler with modular flatbed, sleeper cab, and 1 defensive turret hardpoint.' },
  { id: 'monocycle-gyro', name: 'Monocycle (Electric Gyro)', classification: 'Civilian Vehicle', frame: 'Personal Gyro-Wheel', propulsion: 'Electric Gyro', size: 'Medium', crew: '1', tech_level: 3, craft_dc: 14, sp: 45, dr: 8, description: 'A single large gyroscopically stabilized wheel with the rider seated inside the rim. Incredibly agile and capable of weaving through pedestrian crowds.', mechanic: 'High-speed gyro-stabilized monocycle (+2 Pilot checks in tight urban spaces).' },
  { id: 'hydrojet-skimmer', name: 'Hydrojet Surface Skimmer', classification: 'Civilian Vehicle', frame: 'Leisure Watercraft', propulsion: 'Water-Jet', size: 'Large', crew: '1+3', tech_level: 2, craft_dc: 15, sp: 65, dr: 8, description: 'A high-speed surface skimmer that intakes water and jets it out the rear for propulsion, featuring luxury amenities for resort worlds.', mechanic: 'High-speed surface planing water-jet craft for calm or coastal waters.' },
  { id: 'all-terrain-rover', name: 'All-Terrain Wheeled Rover', classification: 'Civilian Vehicle', frame: '6x6/8x8 Expedition Rover', propulsion: 'Hybrid Electric/Fuel', size: 'Large', crew: '1+4', tech_level: 3, craft_dc: 20, sp: 120, dr: 15, description: 'A rugged, pressurized expedition vehicle with six or eight independent wheels, airlocks, solar charging arrays, and a modular rear section for scientific equipment.', mechanic: 'Pressurized frontier exploration rover with independent suspension, life-support seal, and solar recharging.' },

  // Section 3: Utility Vehicles: Industrial and Commercial Assets (12)
  { id: 'agricultural-walker', name: 'Agricultural Walker', classification: 'Utility Vehicle', frame: 'Bipedal / Quad Walker', propulsion: 'Bipedal / Quadrupedal', size: 'Large', crew: '1', tech_level: 3, craft_dc: 18, sp: 100, dr: 12, description: 'A four-legged or bipedal mech designed to step gingerly over crops while spraying nutrients or harvesting produce without crushing vegetation below.', mechanic: 'Industrial agro-walker with herding sensors, soft-step pads, and modular manipulator arms.' },
  { id: 'heavy-cargo-repulsor', name: 'Heavy Cargo Repulsor', classification: 'Utility Vehicle', frame: 'Repulsor Flatbed Barge', propulsion: 'Repulsion Field', size: 'Huge', crew: '1 (or Remote)', tech_level: 3, craft_dc: 18, sp: 140, dr: 12, description: 'A flatbed barge held aloft by powerful anti-gravity coils used to move shipping containers or heavy machinery across starport tarmacs.', mechanic: 'High-capacity repulsor cargo barge with low altitude ceiling and remote/walk-behind control.' },
  { id: 'planetary-survey-crawler', name: 'Planetary Survey Crawler', classification: 'Utility Vehicle', frame: 'Tracked Mobile Lab', propulsion: 'Tracks / Wheels', size: 'Huge', crew: '4', tech_level: 3, craft_dc: 22, sp: 180, dr: 18, description: 'A mobile laboratory on tank treads heavily shielded against radiation and extreme temperatures, mounting a large sensor dish and aerial mapping drone bay.', mechanic: 'Pressurized mobile research lab with sleeping quarters, rad-shielding, sensor dish, and drone bay.' },
  { id: 'armored-step-van', name: 'Armored Step-Van', classification: 'Utility Vehicle', frame: 'Wheeled Security Van', propulsion: 'Wheeled', size: 'Large', crew: '2+4', tech_level: 2, craft_dc: 16, sp: 110, dr: 15, description: 'The standard vehicle for secure urban delivery and SWAT teams, featuring a boxy nondescript exterior, sliding doors, run-flat tires, and modular surveillance/weapon racks.', mechanic: 'Discreet armored logistics/SWAT van with run-flat tires, drone racks, and encrypted comms.' },
  { id: 'construction-exoskeleton', name: 'Construction Exoskeleton', classification: 'Utility Vehicle', frame: 'Bipedal Industrial Mech', propulsion: 'Bipedal Mech', size: 'Large', crew: '1', tech_level: 3, craft_dc: 20, sp: 120, dr: 15, description: 'An open-frame powered suit that amplifies the user\'s strength fifty-fold with locking hydraulic claws and heavy-duty servos for manipulating steel girders.', mechanic: 'Industrial open roll-cage loader mech with hydraulic claws and massive lifting torque.' },
  { id: 'zero-g-maneuver-sled', name: 'Zero-G Maneuver Sled', classification: 'Utility Vehicle', frame: 'EVA Work Frame', propulsion: 'Cold Gas Thrusters', size: 'Medium', crew: '1', tech_level: 3, craft_dc: 15, sp: 50, dr: 8, description: 'A rigid frame equipped with cold-gas thrusters, magnetic clamps, and tool racks used by astronauts to move heavy components during orbital construction.', mechanic: 'Vacuum-exposed EVA thruster sled with magnetic clamps and heavy orbital tool racks.' },
  { id: 'ore-processing-crawler', name: 'Ore Processing Crawler', classification: 'Utility Vehicle', frame: 'Colossal Tracked Smelter', propulsion: 'Massive Tracks', size: 'Colossal', crew: '20+', tech_level: 3, craft_dc: 32, sp: 800, dr: 30, description: 'A colossal industrial machine the size of an office building that consumes rock and soil through a front maw, refines ore internally on onboard smelters, and moves on massive tracks.', mechanic: 'Colossal mobile mining and refining crawler with tread crushers and onboard smelter.' },
  { id: 'recovery-towing-vehicle', name: 'Recovery & Towing Vehicle', classification: 'Utility Vehicle', frame: 'Tracked Recovery Chassis', propulsion: 'Tracks', size: 'Huge', crew: '2', tech_level: 3, craft_dc: 22, sp: 200, dr: 25, description: 'A tracked tank chassis with the turret replaced by a high-torque crane, repair drones, and towing winch designed to drag destroyed tanks or downed mechs off the battlefield under fire.', mechanic: 'Heavy frontal armor (DR 25) battlefield recovery vehicle with high-torque crane, winch, and repair drones.' },
  { id: 'armored-corporate-transporter', name: 'Armored Corporate Transporter', classification: 'Utility Vehicle', frame: 'Wheeled (6x6) Bullion Truck', propulsion: 'Wheeled (6x6)', size: 'Huge', crew: '2', tech_level: 3, craft_dc: 22, sp: 180, dr: 22, description: 'A six-wheeled ultra-secure windowless truck used to move bullion, prototypes, or prisoners, hardened against EMP and chemical attacks with automated turret defense.', mechanic: 'EMP/chemical-hardened 6x6 vault transport with sensor navigation, run-flat tires, and automated turret.' },
  { id: 'amphibious-work-tug', name: 'Amphibious Work Tug', classification: 'Utility Vehicle', frame: 'Amphibious Utility Boat', propulsion: 'Water-Jet / Wheeled', size: 'Large', crew: '3', tech_level: 2, craft_dc: 18, sp: 130, dr: 15, description: 'A stout, powerful storm-weather boat capable of extending wheels to drive up onto land, used on archipelago colony worlds to move supplies and drag heavy barges.', mechanic: 'High-torque amphibious marine tug with retractable land wheels and heavy towing cables.' },
  { id: 'forestry-deforestation-walker', name: 'Forestry Deforestation Walker', classification: 'Utility Vehicle', frame: 'Bipedal Logging Mech', propulsion: 'Bipedal Mech', size: 'Large', crew: '1', tech_level: 3, craft_dc: 20, sp: 130, dr: 16, description: 'A bipedal mech equipped with a massive industrial chainsaw arm, a tree-grappling claw, and stabilizing gyros to prevent tipping when felling massive alien timber.', mechanic: 'Bipedal logging walker with industrial chainsaw arm, grapple claw, and gyro-stabilizers.' },
  { id: 'wilderness-survival-rover', name: 'Wilderness Survival Rover', classification: 'Utility Vehicle', frame: 'Hardened Expedition Rover', propulsion: 'Wheels / Tracks', size: 'Huge', crew: '6', tech_level: 3, craft_dc: 22, sp: 160, dr: 20, description: 'A hardened exploration vehicle designed for doomsday scenarios with independent suspension, air filtration, water recycling, blast shutters, and weapon mounts.', mechanic: 'Long-duration survival rover with blast shutters, air/water recycling, and defensive weapon mounts.' },

  // Section 4: Military Ground Vehicles: Combat Platforms (12)
  { id: 'main-battle-tank-standard', name: 'Main Battle Tank (Standard)', classification: 'Military Ground Vehicle', frame: 'Tracked Combat Tank', propulsion: 'Tracked', size: 'Huge', crew: '3', tech_level: 2, craft_dc: 25, sp: 300, dr: 35, description: 'A low-profile tracked vehicle mounting a massive kinetic cannon. Prioritizes frontal armor and hull-down positioning as a reliable frontline assault platform.', mechanic: 'Heavy tracked MBT mounting a Heavy Kinetic Cannon and coaxial machinegun. Frontal DR 35.' },
  { id: 'advanced-grav-tank', name: 'Advanced Grav-Tank', classification: 'Military Ground Vehicle', frame: 'Anti-Gravity Combat Tank', propulsion: 'Anti-Gravity', size: 'Huge', crew: '3', tech_level: 4, craft_dc: 30, sp: 280, dr: 35, description: 'A floating fortress that moves effortlessly over water, mud, and mines, armed with particle beam or plasma weaponry and capable of pop-up maneuver warfare.', mechanic: 'Anti-gravity tank immune to terrain/mines. Mounts Particle Beam Cannon and heavy heatsinks.' },
  { id: 'behemoth-wheeled-fortress', name: 'Behemoth Wheeled Fortress', classification: 'Military Ground Vehicle', frame: 'Multi-Wheel (10x10) Juggernaut', propulsion: 'Multi-Wheel (10x10)', size: 'Gargantuan', crew: '8+20', tech_level: 3, craft_dc: 32, sp: 500, dr: 40, description: 'A ten-wheeled mobile command center that crushes its own path, bristling with missile pods and defensive turrets while carrying a complement of troops.', mechanic: '10x10 mobile breakthrough fortress with missile batteries, point-defense turrets, and troop bay.' },
  { id: 'combined-arms-heavy-tank', name: 'Combined-Arms Heavy Tank', classification: 'Military Ground Vehicle', frame: 'Tracked Heavy Tank', propulsion: 'Tracked', size: 'Huge', crew: '4', tech_level: 3, craft_dc: 28, sp: 340, dr: 38, description: 'A versatile tracked tank equipped with a mix of long-range missiles and point-defense lasers, designed to handle armor, infantry, and aircraft independently.', mechanic: 'Multi-role heavy tank mounting main energy cannon, missile pods, and point-defense lasers.' },
  { id: 'riot-suppression-transport', name: 'Riot Suppression Transport', classification: 'Military Ground Vehicle', frame: 'Wheeled (6x6) Security APC', propulsion: 'Wheeled (6x6)', size: 'Huge', crew: '2+10', tech_level: 2, craft_dc: 22, sp: 200, dr: 25, description: 'A six-wheeled armored truck equipped with water cannons, sonic screamers, tear gas launchers, and a reinforced plow for urban pacification.', mechanic: 'Urban pacification APC armed with non-lethal Sonic Cannon, chemical launchers, and barricade ram.' },
  { id: 'heavy-urban-apc', name: 'Heavy Urban APC', classification: 'Military Ground Vehicle', frame: 'Wheeled (8x8) Carrier', propulsion: 'Wheeled (8x8)', size: 'Huge', crew: '2+12', tech_level: 2, craft_dc: 24, sp: 220, dr: 28, description: 'An eight-wheeled carrier with thick all-around armor against rooftop RPGs, passenger firing ports, and a roof-mounted remote autocannon station.', mechanic: '8x8 armored troop carrier with roof autocannon turret and infantry firing ports.' },
  { id: 'mechanized-infantry-carrier', name: 'Mechanized Infantry Carrier', classification: 'Military Ground Vehicle', frame: 'Tracked Amphibious IFV', propulsion: 'Tracked (Amphibious)', size: 'Huge', crew: '3+10', tech_level: 3, craft_dc: 25, sp: 240, dr: 30, description: 'A tracked amphibious infantry fighting vehicle designed to deliver a squad into the heart of combat while suppressing enemies with a medium autocannon or heavy laser.', mechanic: 'Amphibious tracked IFV with medium autocannon/laser turret and rear assault ramp.' },
  { id: 'rapid-strike-hover-tank', name: 'Rapid Strike Hover-Tank', classification: 'Military Ground Vehicle', frame: 'Repulsion Fast-Attack Tank', propulsion: 'Repulsion Field', size: 'Large', crew: '2', tech_level: 3, craft_dc: 26, sp: 180, dr: 22, description: 'A fast, agile skimmer armed with a high-caliber beam cannon that relies on speed and flanking evasion to strike rear armor and disengage.', mechanic: 'High-speed flanking hover-tank mounting a Heavy Beam Cannon.' },
  { id: 'short-range-siege-tank', name: 'Short-Range Siege Tank', classification: 'Military Ground Vehicle', frame: 'Tracked Demolition Tank', propulsion: 'Tracked', size: 'Huge', crew: '3', tech_level: 3, craft_dc: 28, sp: 360, dr: 40, description: 'A heavily armored urban siege vehicle mounting a massive bore demolition cannon capable of leveling a bunker or collapsing a building in a single shot.', mechanic: 'Ultra-heavy frontal armor (DR 40) siege tank with short-range bunker-busting demolition cannon.' },
  { id: 'arachnid-support-walker', name: 'Arachnid Support Walker', classification: 'Military Ground Vehicle', frame: 'Multi-Legged Spider Tank', propulsion: 'Multi-Legged (6/8 Legs)', size: 'Large', crew: '2', tech_level: 4, craft_dc: 26, sp: 200, dr: 25, description: 'A multi-legged spider tank that can climb vertical cliff faces or navigate dense rubble fields, armed with rapid-fire railguns for mountain fire support.', mechanic: 'Wall-climbing multi-legged support walker armed with twin rapid-fire railguns.' },
  { id: 'light-wheeled-apc', name: 'Light Wheeled APC', classification: 'Military Ground Vehicle', frame: 'Wheeled (4x4) Scout Car', propulsion: 'Wheeled (4x4)', size: 'Large', crew: '2+4', tech_level: 2, craft_dc: 20, sp: 140, dr: 18, description: 'A fast, air-droppable 4x4 tactical armored car used for reconnaissance, rapid infantry mobility, and patrolling pacified sectors.', mechanic: 'Air-droppable 4x4 recon car mounting a pintle Light Autocannon or Heavy Machinegun.' },
  { id: 'mobile-command-fortress', name: 'Mobile Command Fortress', classification: 'Military Ground Vehicle', frame: 'Tracked Super-Heavy FOB', propulsion: 'Tracked', size: 'Colossal', crew: '15+30', tech_level: 4, craft_dc: 35, sp: 700, dr: 45, description: 'A tracked super-heavy tactical operations center with fleet-coordination comms arrays, heavy shielding, railguns, and point-defense laser batteries.', mechanic: 'Super-heavy mobile command bunker with orbital comms uplink, energy shields, and railgun/laser turrets.' },

  // Section 5: Aircraft: Atmospheric Dominance (12)
  { id: 'civilian-vtol-aerodyne', name: 'Civilian VTOL Aerodyne', classification: 'Aircraft', frame: 'VTOL Luxury Aerocar', propulsion: 'Vectored Thrust', size: 'Large', crew: '1+3', tech_level: 3, craft_dc: 20, sp: 90, dr: 10, description: 'A luxury flying car using ducted fans or vectored jet thrusters capable of vertical takeoff and landing at skyscraper pads.', mechanic: 'VTOL atmospheric aerocar with hover capability and luxury pressurized cabin.' },
  { id: 'armored-grav-gunship', name: 'Armored Grav-Gunship', classification: 'Aircraft', frame: 'Gravitic Close-Air-Support', propulsion: 'Gravitic / Jet', size: 'Huge', crew: '2', tech_level: 4, craft_dc: 28, sp: 240, dr: 30, description: 'A floating atmospheric tank that uses anti-gravity to loiter silently behind buildings before popping up to unleash a barrage of missiles and cannon fire.', mechanic: 'Silent-loiter grav-gunship with heavy armor (DR 30), missile pods, and nose rotary cannon.' },
  { id: 'troop-insertion-vtol', name: 'Troop Insertion VTOL', classification: 'Aircraft', frame: 'Twin-Engine Assault Transport', propulsion: 'Twin-Engine Vectored Jet', size: 'Huge', crew: '2+12', tech_level: 3, craft_dc: 25, sp: 200, dr: 22, description: 'A twin-engine jet transport with swiveling thrusters that carries a squad of infantry and deploys them via fast-rope or grav-chutes while door gunners clear the LZ.', mechanic: 'VTOL assault transport for 12 troops with twin door-mounted machineguns and grav-chute bay.' },
  { id: 'atmospheric-interceptor', name: 'Atmospheric Interceptor', classification: 'Aircraft', frame: 'Air Superiority Fighter', propulsion: 'Repulsor / Afterburning Jet', size: 'Huge', crew: '2', tech_level: 3, craft_dc: 26, sp: 160, dr: 18, description: 'A dedicated high-speed air-superiority fighter jet relying on long-range missiles, electronic warfare, and extreme agility to dominate the sky.', mechanic: 'Supersonic atmospheric fighter with air-to-air missile bays, EW suite, and harpoon tow-cables.' },
  { id: 'gravitic-apc', name: 'Gravitic Orbital-Drop APC', classification: 'Aircraft', frame: 'Trans-Atmospheric Carrier', propulsion: 'Anti-Gravity', size: 'Huge', crew: '2+14', tech_level: 4, craft_dc: 28, sp: 250, dr: 30, description: 'An enclosed troop transport that uses gravity drives to drop from orbit directly onto the battlefield, sealed against vacuum and reentry heat.', mechanic: 'Vacuum-sealed orbital-drop gravitic APC with thermal reentry shielding and boarding clamps.' },
  { id: 'conventional-attack-rotorcraft', name: 'Conventional Attack Rotorcraft', classification: 'Aircraft', frame: 'Stealth Attack Helicopter', propulsion: 'Rotor / Tail Rotor', size: 'Huge', crew: '2', tech_level: 2, craft_dc: 24, sp: 160, dr: 20, description: 'A helicopter gunship with radar-absorbent stealth faceting, chin-mounted turret, and guided anti-armor missiles for surprise counter-insurgency strikes.', mechanic: 'Radar-stealth rotor gunship armed with chin autocannon and anti-tank guided missiles.' },
  { id: 'security-rotor-drone', name: 'Security Rotor-Drone', classification: 'Aircraft', frame: 'Autonomous VTOL Patrol Drone', propulsion: 'Remote / AI Rotor', size: 'Medium', crew: '0 (AI/Remote)', tech_level: 3, craft_dc: 15, sp: 40, dr: 10, description: 'A remote-controlled or AI-piloted patrol rotorcraft roughly the size of a motorcycle, carrying a spotlight, sensor cameras, and a light machine gun or non-lethal gas dispenser.', mechanic: 'Autonomous/remote VTOL perimeter drone with spotlight, optics, and light weapon/gas mount.' },
  { id: 'heavy-lift-transport', name: 'Heavy Lift VTOL Transport', classification: 'Aircraft', frame: 'Quad-Fan Heavy Lifter', propulsion: 'Ducted Fans', size: 'Gargantuan', crew: '3', tech_level: 3, craft_dc: 26, sp: 280, dr: 20, description: 'A massive aircraft with four tilting ducted fans and magnetic cargo clamps designed to pick up tanks or mechs and ferry them to the front lines.', mechanic: 'Heavy VTOL skycrane capable of airlifting 1 Huge tank or mech via underside magnetic clamps.' },
  { id: 'hover-jet-gunship', name: 'Hover-Jet Recon Gunship', classification: 'Aircraft', frame: 'Hybrid VTOL Strike Craft', propulsion: 'Jet / Hover Fans', size: 'Huge', crew: '2', tech_level: 3, craft_dc: 26, sp: 180, dr: 22, description: 'A hybrid marine strike aircraft that can hover on lift fans for close ground support or engage afterburners for supersonic reconnaissance and interception.', mechanic: 'Dual-mode hover/supersonic strike gunship armed with nose railguns and wing hardpoints.' },
  { id: 'infantry-support-gunship', name: 'Infantry Support Gunship', classification: 'Aircraft', frame: 'Repulsorlift Assault Barge', propulsion: 'Repulsorlift', size: 'Huge', crew: '2+30', tech_level: 3, craft_dc: 28, sp: 260, dr: 25, description: 'A flying gun platform that circles the battlefield raining down fire from ball turrets, side cannons, and missile racks while carrying a platoon in its open troop bay.', mechanic: 'Platoon assault gunship (30 troops) with composite ball turrets and missile launchers.' },
  { id: 'urban-pacification-aerodyne', name: 'Urban Pacification Aerodyne', classification: 'Aircraft', frame: 'Armored Police VTOL', propulsion: 'Vectored Thrust', size: 'Huge', crew: '2+8', tech_level: 3, craft_dc: 22, sp: 180, dr: 22, description: 'A heavily armored police/SWAT VTOL equipped with loudhailers, searchlights, miniguns, and non-lethal gas dispensers to withstand street-gang fire.', mechanic: 'SWAT vectored-thrust aerodyne with searchlights, loudhailers, gas dispensers, and pintle miniguns.' },
  { id: 'supersonic-hover-bike', name: 'Supersonic Hover-Bike', classification: 'Aircraft', frame: 'Jet-Thrust Interceptor Bike', propulsion: 'Magnetic Hover / Jet', size: 'Medium', crew: '1', tech_level: 3, craft_dc: 18, sp: 50, dr: 10, description: 'A jet engine with a saddle that hovers on a magnetic repulsion field and uses afterburning thrust for extreme speed, armed with twin micro-missile pods.', mechanic: 'Extreme-speed open-rider interceptor bike with twin micro-missile pods.' },

  // Section 6: Spacecraft: Interstellar Assets (12)
  { id: 'wedge-scout-courier', name: 'Wedge-Scout Courier (100-Ton)', classification: 'Spacecraft', frame: '100-Ton Scout Ship', propulsion: 'FTL / Maneuver Thrusters', size: 'Gargantuan', crew: '1-2', tech_level: 4, craft_dc: 30, sp: 400, dr: 25, description: 'A small, angular 100-ton starship consisting mostly of engines and deep-space sensors, used to map new systems or deliver high-priority FTL data packets.', mechanic: '100-Ton FTL scout/courier with long-range sensor suite and high sublight/FTL speed.' },
  { id: 'fast-tramp-freighter', name: 'Fast Tramp Freighter', classification: 'Spacecraft', frame: 'Modified Light Freighter', propulsion: 'Hyperdrive / Sublight Ion', size: 'Gargantuan', crew: '2-6', tech_level: 4, craft_dc: 32, sp: 500, dr: 30, description: 'A heavily modified light cargo starship that sacrifices raw hold volume for oversized engines, quad laser turrets, and hidden smuggling compartments.', mechanic: 'FTL light freighter with smuggling bays, upgraded thrusters, and dorsal/ventral defensive turrets.' },
  { id: 'standard-free-trader', name: 'Standard Free Trader (200-Ton)', classification: 'Spacecraft', frame: '200-Ton Merchant Hull', propulsion: 'FTL / Fusion Drive', size: 'Gargantuan', crew: '4-8', tech_level: 3, craft_dc: 30, sp: 550, dr: 25, description: 'A blocky, utilitarian 200-ton merchant vessel designed to carry standardized cargo containers along patrolled trade lanes—the 18-wheeler of space commerce.', mechanic: '200-Ton FTL cargo merchant ship with standardized container clamps and cargo bay.' },
  { id: 'multi-role-starfighter', name: 'Multi-Role Starfighter', classification: 'Spacecraft', frame: 'Single-Seat Space Superiority Fighter', propulsion: 'Ion / Compact Hyperdrive', size: 'Huge', crew: '1', tech_level: 4, craft_dc: 28, sp: 220, dr: 25, description: 'A single-seat trans-atmospheric combat craft carrying laser cannons for dogfighting, proton/antimatter torpedoes for anti-capital strikes, and a compact FTL drive.', mechanic: 'Single-seat FTL-capable starfighter armed with twin laser cannons and torpedo launcher.' },
  { id: 'heavy-assault-dropship', name: 'Heavy Assault Dropship', classification: 'Spacecraft', frame: 'Trans-Atmospheric Platoon Lander', propulsion: 'Fusion Torch', size: 'Gargantuan', crew: '2+30', tech_level: 3, craft_dc: 30, sp: 450, dr: 35, description: 'A brick-like orbital insertion lander with thick thermal shielding and point-defense guns, built to deliver a marine platoon or light vehicle under heavy fire.', mechanic: 'Orbital-entry assault lander with point-defense turrets, heavy thermal armor (DR 35), and vehicle/platoon bay.' },
  { id: 'planetary-assault-carrier', name: 'Planetary Assault Carrier (DropShip)', classification: 'Spacecraft', frame: 'Company-Scale Mech DropShip', propulsion: 'Fusion Rocket', size: 'Colossal', crew: '12+100', tech_level: 4, craft_dc: 36, sp: 1200, dr: 45, description: 'A massive spherical or aerodyne DropShip essentially acting as a flying fortress that lands on a planet surface to deploy an entire company of mechs and armor.', mechanic: 'Colossal orbital DropShip carrying up to 12 Mechs/Tanks with 360-degree defensive batteries.' },
  { id: 'hard-science-shuttle', name: 'Hard-Science Orbital Shuttle', classification: 'Spacecraft', frame: 'Orbital Transfer Craft', propulsion: 'Chemical / Nuclear Thermal', size: 'Huge', crew: '2+12', tech_level: 2, craft_dc: 24, sp: 180, dr: 18, description: 'An un-aerodynamic vacuum-only transfer craft ferrying passengers between orbital stations using high-efficiency thrusters and spin-gravity rings.', mechanic: 'Vacuum-only orbital transfer shuttle with docking collar and rotational gravity section.' },
  { id: 'mass-produced-swarm-fighter', name: 'Mass-Produced Swarm Fighter', classification: 'Spacecraft', frame: 'Short-Range Carrier Interceptor', propulsion: 'Twin Ion Engines', size: 'Large', crew: '1', tech_level: 3, craft_dc: 22, sp: 120, dr: 15, description: 'A cheap, ultra-agile carrier-launched space fighter with no FTL drive or shields, deployed in hundreds to overwhelm enemies with sheer numbers.', mechanic: 'High-agility carrier interceptor armed with twin medium lasers (No FTL or shields).' },
  { id: 'frontier-battlecruiser', name: 'Frontier Battlecruiser (1200-Ton)', classification: 'Spacecraft', frame: '1200-Ton Patrol Cruiser', propulsion: 'Jump Drive / Fusion', size: 'Colossal', crew: '60', tech_level: 4, craft_dc: 38, sp: 2000, dr: 55, description: 'A 1,200-ton long-patrol warship with large fuel reserves, repair bays, fighter hangars, and heavy turrets to hunt pirates and enforce customs in lawless space.', mechanic: '1,200-Ton FTL cruiser with spinal mount, broadside turrets, repair bay, and small craft hangar.' },
  { id: 'industrial-utility-shuttle', name: 'Industrial Utility Shuttle', classification: 'Spacecraft', frame: 'Modular Work Tug', propulsion: 'Plasma Thrusters', size: 'Huge', crew: '2', tech_level: 3, craft_dc: 22, sp: 180, dr: 20, description: 'A boxy orbital work craft equipped with heavy manipulator arms, cutting lasers, and magnetic towing clamps for loading cargo or repairing satellites.', mechanic: 'Modular orbital tug with articulated manipulator arms and heavy towing clamps.' },
  { id: 'retro-fitted-habitat-ship', name: 'Retro-Fitted Habitat Ship', classification: 'Spacecraft', frame: 'Nomadic Colony Barge', propulsion: 'Solar Sails / Fusion Torch', size: 'Colossal', crew: '200+', tech_level: 3, craft_dc: 36, sp: 1500, dr: 35, description: 'An old bulk hauler or asteroid mining vessel converted into a self-sustaining mobile home for a nomadic clan with greenhouses, workshops, and hab-modules.', mechanic: 'Self-sustaining nomadic colony ship with hydroponic domes, fabrication bays, and clan quarters.' },
  { id: 'capital-class-warship', name: 'Capital-Class Heavy Cruiser', classification: 'Spacecraft', frame: 'Fleet Command Warship', propulsion: 'FTL / Antimatter Torch', size: 'Colossal', crew: '1000+', tech_level: 5, craft_dc: 45, sp: 5000, dr: 80, description: 'A city-sized fleet command vessel capable of orbital bombardment, carrying full wings of starfighters, thousands of crew, and a tectonic-cracking spinal cannon.', mechanic: 'Apex capital warship with antimatter power core, fighter wings, fortress shields, and orbital bombardment spinal mount.' },

  // Section 7: Watercraft: Nautical Vessels (12)
  { id: 'super-heavy-submersible', name: 'Super-Heavy Submersible Carrier', classification: 'Watercraft', frame: 'Submersible Mobile Base', propulsion: 'Nuclear / Magneto-Hydrodynamic', size: 'Colossal', crew: '120', tech_level: 3, craft_dc: 35, sp: 1400, dr: 45, description: 'A nuclear-powered submarine the size of an aircraft carrier that serves as a mobile underwater base, launching mini-subs and VTOL aircraft from pressurized bays.', mechanic: 'Submerged mobile carrier base with nuclear endurance and launch bays for subs/aircraft.' },
  { id: 'stealth-interceptor-boat', name: 'Stealth Hydrofoil Interceptor', classification: 'Watercraft', frame: 'Radar-Stealth Hydrofoil', propulsion: 'Water-Jet / Hydrofoil', size: 'Huge', crew: '2+6', tech_level: 3, craft_dc: 24, sp: 160, dr: 18, description: 'A sleek radar-absorbent hydrofoil that rides high above the waves at extreme speed for covert special-forces insertion and smuggling.', mechanic: 'High-speed radar-stealth hydrofoil (+4 Stealth vs radar/sonar).'},
  { id: 'deep-sea-industrial-sub', name: 'Deep-Sea Industrial Submersible', classification: 'Watercraft', frame: 'Reinforced Bathysphere', propulsion: 'Vectored Thrusters / Treads', size: 'Large', crew: '2', tech_level: 3, craft_dc: 22, sp: 180, dr: 35, description: 'A spherical reinforced pressure vessel with heavy manipulator arms and floodlights that crawls along the abyssal ocean floor mining nodules or repairing cables.', mechanic: 'Abyssal-pressure hull (DR 35) with heavy mining claws, core drills, and floodlights.' },
  { id: 'bio-engineered-submersible', name: 'Bio-Engineered Living Submersible', classification: 'Watercraft', frame: 'Organic Grown Hull', propulsion: 'Bio-Muscular Water-Jet', size: 'Huge', crew: '1+5', tech_level: 4, craft_dc: 25, sp: 160, dr: 20, description: 'A vessel grown from genetically modified coral and chitin that uses silent muscular water-jets for propulsion and naturally regenerates minor hull damage.', mechanic: 'Silent organic submersible with Regeneration (1 SP/minute) and natural sonar camouflage.' },
  { id: 'bluewater-artillery-cruiser', name: 'Bluewater Artillery Cruiser', classification: 'Watercraft', frame: 'Displacement Surface Warship', propulsion: 'Gas Turbine / Fusion', size: 'Colossal', crew: '80', tech_level: 3, craft_dc: 34, sp: 1100, dr: 40, description: 'A heavy surface warship armed with long-range electromagnetic railguns and cruise missile batteries capable of striking targets hundreds of miles inland.', mechanic: 'Oceanic fire-support cruiser mounting heavy railgun turrets and VLS cruise missile cells.' },
  { id: 'scientific-exploration-sub', name: 'Scientific Exploration Submersible', classification: 'Watercraft', frame: 'Modular Research Sub', propulsion: 'Silent Electric Propulsors', size: 'Huge', crew: '6', tech_level: 3, craft_dc: 24, sp: 180, dr: 22, description: 'A modular deep-ocean research vessel equipped with wet/dry laboratories, specimen containment tanks, panoramic viewports, and high-resolution mapping sonar.', mechanic: 'Deep-sea survey submarine with onboard xenobiology lab (+2 Science checks) and ROV bay.' },
  { id: 'cloaked-torpedo-skiff', name: 'Cloaked Torpedo Skiff', classification: 'Watercraft', frame: 'Planing Ambush Hull', propulsion: 'Twin Water-Jets', size: 'Large', crew: '2', tech_level: 4, craft_dc: 26, sp: 120, dr: 15, description: 'A small, fast planing torpedo boat using holographic projectors and active optical camouflage to blend into the ocean surface for ambush strikes.', mechanic: 'Active-camouflaged fast attack boat armed with twin heavy torpedo tubes.' },
  { id: 'heavy-patrol-cutter', name: 'Heavy Coast Guard Patrol Cutter', classification: 'Watercraft', frame: 'Catamaran Patrol Vessel', propulsion: 'Twin Marine Diesels / Turbines', size: 'Huge', crew: '12', tech_level: 2, craft_dc: 25, sp: 280, dr: 25, description: 'A rugged twin-hull coast guard vessel designed to weather alien storms, armed with deck autocannons, water cannons, and boarding ramps for anti-piracy duty.', mechanic: 'Storm-rated catamaran cutter with deck autocannon, boarding ramps, and rescue winch.' },
  { id: 'silent-running-cargo-sub', name: 'Silent Running Cargo Submarine', classification: 'Watercraft', frame: 'Submersible Freighter', propulsion: 'Magneto-Hydrodynamic (Caterpillar)', size: 'Colossal', crew: '10', tech_level: 4, craft_dc: 30, sp: 600, dr: 30, description: 'A massive underwater cargo freighter utilizing a voiceless magnetohydrodynamic drive to transport high-value contraband or supplies beneath naval blockades.', mechanic: 'Ultra-quiet MHD cargo submarine (+6 Stealth vs sonar) with large pressurized hold.' },
  { id: 'coastal-bombardment-monitor', name: 'Coastal Bombardment Monitor', classification: 'Watercraft', frame: 'Shallow-Draft Armored Barge', propulsion: 'Armored Pump-Jets', size: 'Huge', crew: '8', tech_level: 2, craft_dc: 26, sp: 340, dr: 38, description: 'A shallow-draft riverine and coastal monitor with thick sloped armor and a single massive turret cannon for close amphibious fire support.', mechanic: 'Shallow-draft armored gunboat (DR 38) mounting a capital/mech-scale siege cannon.' },
  { id: 'exo-oceanic-explorer', name: 'Exo-Oceanic Explorer Sub', classification: 'Watercraft', frame: 'Universal Cryo/Chem Submersible', propulsion: 'Closed-Cycle Thermal Thruster', size: 'Huge', crew: '4', tech_level: 4, craft_dc: 28, sp: 220, dr: 30, description: 'A specialized xenological submarine engineered for non-water alien oceans (liquid methane, ammonia, or sulfuric acid), sealed against cryogenic cold and corrosion.', mechanic: 'Immune to Corrosive and Cryo environmental damage; rated for exotic alien hydrocarbon/acid seas.' },
  { id: 'hyper-velocity-submersible', name: 'Hyper-Velocity Supercavitating Sub', classification: 'Watercraft', frame: 'Supercavitating SpecOps Craft', propulsion: 'Rocket / Supercavitation Nose', size: 'Large', crew: '2+4', tech_level: 4, craft_dc: 28, sp: 150, dr: 20, description: 'A special-operations submarine that envelops itself in a frictionless gas bubble (supercavitation) to travel underwater at aircraft speeds.', mechanic: 'Travels submerged at aircraft speeds (300+ knots); passive sonar is deaf while supercavitating.' },

  // Section 8: Power Armor, Mechs, and Walkers (12)
  { id: 'modular-heavy-battle-walker', name: 'Modular Heavy Battle Walker (75-Ton)', classification: 'Mecha / Walker', frame: '75-Ton Bipedal Battle Mech', propulsion: 'Bipedal Fusion Actuator', size: 'Huge', crew: '1', tech_level: 4, craft_dc: 32, sp: 400, dr: 40, description: 'A 10-meter tall 75-ton bipedal war machine featuring omni-modular hardpoints on its arms and torso to swap between LR missiles, heavy lasers, and autocannons.', mechanic: '75-Ton Omni-Mech with 6 modular weapon hardpoints, fusion core, and neural helm integration.' },
  { id: 'heavy-railgun-platform', name: 'Heavy Railgun Power Armor', classification: 'Mecha / Walker', frame: 'Anchored Bipedal Power Armor', propulsion: 'Anchored Biped', size: 'Large', crew: '1', tech_level: 4, craft_dc: 28, sp: 160, dr: 32, description: 'A heavy power armor suit mounting a shoulder-borne hypersonic railgun, equipped with hydraulic leg spades that anchor into the ground to absorb firing recoil.', mechanic: 'Heavy Power Armor with pneumatic recoil anchors and shoulder-mounted anti-armor Railgun.' },
  { id: 'general-purpose-light-mecha', name: 'General Purpose Light Mecha (4m)', classification: 'Mecha / Walker', frame: '4-Meter Tactical Walker', propulsion: 'Biped / High-Speed Wheel-Treads', size: 'Large', crew: '1', tech_level: 3, craft_dc: 26, sp: 200, dr: 25, description: 'A 4-meter tall agile walker that bridges infantry and heavy armor, capable of skating across urban pavement on deployable heel-treads while wielding a giant rifle.', mechanic: '4m agile mecha with deployable skating treads, mecha-scale assault rifle, and shoulder rocket pod.' },
  { id: 'super-heavy-siege-walker', name: 'Super-Heavy Quadrupedal Siege Walker', classification: 'Mecha / Walker', frame: 'Colossal Quadrupedal Walker', propulsion: 'Quadrupedal Heavy Servos', size: 'Colossal', crew: '4+20', tech_level: 4, craft_dc: 38, sp: 1000, dr: 55, description: 'A colossal four-legged armored walker that advances inexorably across battlefields, mounting twin capital-grade turbolasers to shatter fortified defensive lines.', mechanic: 'Colossal 4-legged siege walker (DR 55) armed with twin heavy turbolasers and troop transport bay.' },
  { id: 'cybernetic-life-support-walker', name: 'Cybernetic Life-Support Dreadnought', classification: 'Mecha / Walker', frame: 'Amniotic Dreadnought Walker', propulsion: 'Bipedal Heavy Servos', size: 'Large', crew: '1 (Hardwired)', tech_level: 4, craft_dc: 32, sp: 320, dr: 40, description: 'An armored combat sarcophagus that permanently houses a critically injured veteran pilot, armed with hydraulic power claws and short-range assault cannons.', mechanic: 'Hardwired amniotic life-support walker armed with crushing Power Claws and heavy flamer/autocannon.' },
  { id: 'tactical-stealth-exosuit', name: 'Tactical Stealth Exosuit', classification: 'Mecha / Walker', frame: 'Heavy Infantry Stealth Frame', propulsion: 'Bipedal Myomer', size: 'Medium', crew: '1', tech_level: 4, craft_dc: 28, sp: 120, dr: 22, description: 'A slim, form-fitting powered exosuit equipped with thermo-optic camouflage and acoustic baffling that enhances strength and speed for covert assassins.', mechanic: 'Powered stealth exosuit (+4 Strength, +10ft Speed, Thermo-Optic Camo granting +6 Stealth).' },
  { id: 'flight-capable-assault-armor', name: 'Flight-Capable Assault Power Armor', classification: 'Mecha / Walker', frame: 'Vectored-Jet Power Armor', propulsion: 'Jet / Winged Biped', size: 'Large', crew: '1', tech_level: 4, craft_dc: 30, sp: 180, dr: 28, description: 'A strike power armor suit with integrated vectored jump-jets and variable wings, allowing the operator to fly and drop directly into enemy flanks with railguns and mini-missiles.', mechanic: 'Flight-capable power armor (Fly 60ft) armed with forearm railgun and micro-missile pack.' },
  { id: 'super-heavy-assault-mech', name: 'Super-Heavy Assault Mech (100-Ton)', classification: 'Mecha / Walker', frame: '100-Ton Bipedal Juggernaut', propulsion: 'Bipedal Fusion', size: 'Huge', crew: '1', tech_level: 4, craft_dc: 35, sp: 550, dr: 50, description: 'A 100-ton bipedal monster clad in thick ablative armor and carrying enough autocannons, lasers, and missile pods to level a city block and anchor a battle line.', mechanic: '100-Ton apex battle mech (SP 550, DR 50) mounting a massive autocannon, lasers, and LRM racks.' },
  { id: 'bipedal-recon-walker', name: 'Bipedal Recon Walker', classification: 'Mecha / Walker', frame: 'Reverse-Joint Light Walker', propulsion: 'Bipedal (Reverse-Joint)', size: 'Large', crew: '1-2', tech_level: 3, craft_dc: 22, sp: 140, dr: 18, description: 'A light, fast chicken-legged scout walker carrying long-range sensor arrays and chin-mounted blasters to spot enemy formations and outrun heavy armor.', mechanic: 'High-speed reverse-joint scout walker with advanced sensor suite and chin-mounted blasters.' },
  { id: 'light-terrain-walker', name: 'Light Open-Top Terrain Walker', classification: 'Mecha / Walker', frame: 'Colonial Scout Walker', propulsion: 'Bipedal', size: 'Large', crew: '1', tech_level: 2, craft_dc: 18, sp: 110, dr: 14, description: 'An open-topped bipedal walker used by colonial militias and jungle scouts to navigate dense forests and swamps where wheeled or tracked vehicles bog down.', mechanic: 'Open-cockpit militia scout walker armed with pintle Multi-Laser or Heavy Flamer.' },
  { id: 'standard-infantry-walker', name: 'Standard Infantry Line Walker', classification: 'Mecha / Walker', frame: 'Medium Mass-Produced Walker', propulsion: 'Bipedal', size: 'Large', crew: '1', tech_level: 3, craft_dc: 25, sp: 220, dr: 28, description: 'The mass-produced grunt of the mech world: reliable, rugged, and armed with a standardized mecha rifle and shoulder grenade launcher.', mechanic: 'Standard military medium walker armed with Mecha Battle Rifle and Heavy Grenade Launcher.' },
  { id: 'powered-boarding-exoskeleton', name: 'Powered Boarding Exoskeleton', classification: 'Mecha / Walker', frame: 'Zero-G Breaching Armor', propulsion: 'Bipedal / Mag-Boots', size: 'Large', crew: '1', tech_level: 4, craft_dc: 28, sp: 200, dr: 35, description: 'A heavy boarding suit engineered for starship corridor combat, featuring magnetic gravity boots, bulkhead breaching charges, heavy shields, and a short-range fusion gun.', mechanic: 'Vacuum-sealed starship boarding exoskeleton (DR 35) with Mag-Boots, breach charges, and Fusion Gun.' }
];

function updateMecha() {
  const mechaDir = path.join(omniRoot, 'mecha');
  // Remove misplaced augmentation .md files from mecha/
  const misplacedAugIds = ['reinforced-frame', 'reinforced-chassis', 'exo-harness', 'weapon-servo-rig', 'cyber-mecha-shell', 'load-lifter-rig'];
  for (const badId of misplacedAugIds) {
    const badPath = path.join(mechaDir, `${badId}.md`);
    if (fs.existsSync(badPath)) fs.unlinkSync(badPath);
  }

  const items = [];

  for (const spec of CANONICAL_MECHA_LIST) {
    const filePath = path.join(mechaDir, `${spec.id}.md`);
    let existing = {};
    if (fs.existsSync(filePath)) {
      existing = matter(fs.readFileSync(filePath, 'utf8')).data || {};
    }

    const dc = spec.craft_dc;
    const credits = tscCredits(dc);

    const frontmatter = {
      ...existing,
      id: spec.id,
      name: spec.name,
      category: 'mecha',
      classification: spec.classification,
      frame: spec.frame,
      propulsion: spec.propulsion,
      size: spec.size,
      crew: spec.crew,
      tech_level: spec.tech_level,
      meta_level: existing.meta_level || 0,
      craft_dc: dc,
      design_dc: dc,
      cost: credits,
      sp: spec.sp,
      dr: spec.dr,
      durability: spec.sp,
      costs: {
        cp: 0,
        bp: 0,
        credits,
        nodes: 0,
        sockets: 0,
        strain: 0,
        focus: 0,
        ap: 0
      },
      sockets: existing.sockets || {
        max: 4,
        used: 0,
        tier: 'Socket',
        allocated: []
      },
      modifiers: Array.isArray(existing.modifiers) ? existing.modifiers : [],
      modifications: Array.isArray(existing.modifications) ? existing.modifications : [],
      description: spec.description,
      mechanic: `${spec.mechanic} | SP: ${spec.sp}, DR: ${spec.dr} | Craft DC: ${dc} (${credits.toLocaleString()} Cr)`,
      keywords: `${spec.name.toLowerCase()}, mecha, vehicle, ${spec.classification.toLowerCase()}, ${spec.frame.toLowerCase()}, tl-${spec.tech_level}`,
      negative_keywords: 'infantry-only, unmounted'
    };

    const bodyText = `${spec.description}\n\n**Class:** ${spec.classification} (${spec.frame})\n**Propulsion:** ${spec.propulsion} | **Crew:** ${spec.crew}\n**Mechanics:** ${frontmatter.mechanic}`;
    fs.writeFileSync(filePath, matter.stringify(bodyText, frontmatter), 'utf8');
    items.push({
      ...frontmatter,
      body: bodyText
    });
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Mecha & Vehicles Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/mecha/ (2.00.Mecha.md)
 * Total Mecha Items: ${items.length}
 */

export const DEFAULT_MECHA = ${JSON.stringify(items, null, 2)};
export const getMechaById = (id) => DEFAULT_MECHA.find(m => m.id === id);
`;
  fs.writeFileSync(path.join(staticDataRoot, 'mechaData.js'), outputCode, 'utf8');
  console.log(`[Mecha] Revised ${items.length} canonical mecha items (.md + mechaData.js)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS 5: ARCHITECTURE (.md files & architectureData.js)
// ═══════════════════════════════════════════════════════════════════════════
function updateArchitecture() {
  const archDir = path.join(omniRoot, 'architecture');
  // Remove misplaced augmentation polymatter-struct.md from architecture/
  const badPolyPath = path.join(archDir, 'polymatter-struct.md');
  if (fs.existsSync(badPolyPath)) fs.unlinkSync(badPolyPath);

  const files = fs.readdirSync(archDir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const filePath = path.join(archDir, f);
    const parsed = matter(fs.readFileSync(filePath, 'utf8'));
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();
    const id = data.id || f.replace(/\.md$/, '');

    const dc = data.craft_dc ?? data.design_dc ?? dcFromCredits(data.cost || data.costs?.credits || 2560);
    const credits = data.cost > 25 ? data.cost : tscCredits(dc);
    const tl = id === 'native-longhouse-communal-shelter' ? 0 : (data.tech_level !== undefined ? data.tech_level : 3);

    const frontmatter = {
      ...data,
      id,
      name: data.name || id,
      category: 'architecture',
      style: data.style || 'Standard',
      footprint: data.footprint || 'Medium',
      tech_level: tl,
      meta_level: data.meta_level || 0,
      craft_dc: dc,
      design_dc: dc,
      cost: credits,
      sp: data.sp || 500,
      dr: data.dr || 10,
      costs: {
        ...(data.costs || {}),
        credits
      }
    };

    fs.writeFileSync(filePath, matter.stringify(body, frontmatter), 'utf8');
    items.push({
      ...frontmatter,
      body
    });
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Architecture & Facilities Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/architecture/
 * Total Architecture Items: ${items.length}
 */

export const DEFAULT_ARCHITECTURE = ${JSON.stringify(items, null, 2)};
export const getArchitectureById = (id) => DEFAULT_ARCHITECTURE.find(a => a.id === id);
`;
  fs.writeFileSync(path.join(staticDataRoot, 'architectureData.js'), outputCode, 'utf8');
  console.log(`[Architecture] Revised ${items.length} canonical architecture items (.md + architectureData.js)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS 6: AUGMENTATIONS (.md files & augmentationsData.js)
// Sources: 2.00.Augmentations.md, 99.Tech.Augmentations.Biological.md, 99.Tech.Augmentations.Metaphysical.md
// ═══════════════════════════════════════════════════════════════════════════
const TL4_AUG_IDS = new Set([
  // Section 4.5 Exotic Limbs (TL 4)
  'synth-tentacle', 'digitigrade-leg', 'insectoid-limb', 'synth-wing',
  // Section 8 TL4 Enhanced Augmentations (34 items)
  'body-conversion', 'chameleon-skin', 'dermal-weave', 'kinetic-shield', 'trans-cerebral',
  'adrenaline-shield', 'alterable-bioform', 'bodyform-nodes', 'inertial-nullifier', 'myomer-weave',
  'nerve-splicing', 'pheromone-emitters', 'picosurgeons', 'nugenic-nodes', 'accelerator',
  'data-archive', 'ego-overlay', 'synaptic-accelerator', 'xr-imager', 'anti-stun-implant',
  'biotech-emulator', 'body-computer', 'empathic-attune', 'feature-circuit', 'nootropic-enhancer',
  'psychotropic-act', 'rage-implant', 'smart-link', 'cyber-jack', 'surrogate-uplink',
  'skill-plexus', 'synaptic-mask', 'laser-eye', 'optical-camo'
]);

const TL5_AUG_IDS = new Set([
  // Section 9 TL5 Advanced Augmentations (15 items)
  'matter-recon-forge', 'phase-shift-gen', 'aether-node', 'digitized-consc', 'psi-implant',
  'temporal-stutter', 'gravity-attenuator', 'quantum-storage', 'programmable-bio', 'distortion-field',
  'holophotonic-gear', 'feat-plexus', 'interface-sliver', 'polymatter-struct', 'polymatter-surg'
]);

const CANONICAL_AUG_ADDITIONS = {
  // Enriched existing entries
  'prosthetic-skull': {
    name: 'Prosthetic Cranium (Skull)',
    type: 'Prosthetic',
    subcategory: '4.1 Synth Limbs & Structural Integrity',
    location: 'Head',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 25,
    cost: 10240,
    nodes: 10,
    cp: 0,
    sp: 20,
    description: 'Reinforced synthetic cranium housing (SP 20 [x2 Hardened], 10 Nodes). Required alongside Prosthetic Torso and all limbs for Full Body Conversion (FBC).',
    mechanic: 'SP 20 (x2 Hardened), Capacity: 10 Nodes (1 Socket). Craft DC 25 (10,240 Cr).'
  },
  // 7 Moved Augmentations (from mecha/ and architecture/)
  'reinforced-frame': {
    name: 'Reinforced Frame',
    type: 'Limb Upgrade',
    subcategory: '4.4 Limb Upgrades',
    location: 'Limb',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 2,
    cp: 1,
    description: 'Internal structural bracing for a synthetic limb (+25% Structure Points to limb, +25% Base Cost).',
    mechanic: '+25% Structure Points to synthetic limb. Costs 1 CP, 2 Nodes. Craft DC 15 (640 Cr base / +25% limb cost).'
  },
  'reinforced-chassis': {
    name: 'Reinforced Chassis',
    type: 'Body Modification',
    subcategory: '5.2 Core Systems, Implants and Options',
    location: 'Full Body / Torso',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 30,
    cost: 40960,
    nodes: 40,
    cp: 2,
    description: 'Heavy full-frame structural reinforcement requiring synthetic limbs across the chassis.',
    mechanic: 'Requires Synth Limbs (all). Grants Strength +3, Stamina +3, DR 40. Consumes 40 Nodes, 2 CP. Craft DC 30 (40,960 Cr).'
  },
  'exo-harness': {
    name: 'Exo-Harness (Wearable)',
    type: 'Pseudo-Cybernetic',
    subcategory: '12.1 Pseudo-Cybernetics (Wearable Augmentation)',
    location: 'Torso',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 20,
    cp: 0,
    description: 'External non-surgical torso strength and armor frame syncing via an Interface Port.',
    mechanic: 'Grants +1 Strength, DR 10, and provides 20 internal Nodes for hosting wearable mods (0 CP). Craft DC 15 (640 Cr).'
  },
  'weapon-servo-rig': {
    name: 'Weapon Servo Rig (Wearable)',
    type: 'Pseudo-Cybernetic',
    subcategory: '12.1 Pseudo-Cybernetics (Wearable Augmentation)',
    location: 'Torso (Side)',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 10,
    cp: 0,
    description: 'Articulated side/back servo-arm harness designed to stabilize and support two-handed heavy weapons.',
    mechanic: 'Provides 10 internal Nodes and stabilizes 2H Heavy Weapons (0 CP). Requires Interface Port. Craft DC 15 (640 Cr).'
  },
  'cyber-mecha-shell': {
    name: 'Cyber-Mecha Shell (Wearable)',
    type: 'Pseudo-Cybernetic',
    subcategory: '12.1 Pseudo-Cybernetics (Wearable Augmentation)',
    location: 'Full Body',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 40,
    cost: 655360,
    nodes: 100,
    cp: 0,
    description: 'Full-body wearable cyber-mecha shell providing synthetic strength, DR 80, and 100 internal Nodes.',
    mechanic: 'Provides Synth Strength, DR 80, and 100 Nodes (10 Head, 50 Torso, 15 each Arm, 20 each Leg) plus 1 External Socket per location. Craft DC 40 (655,360 Cr).'
  },
  'load-lifter-rig': {
    name: 'Load-Lifter Rig (Wearable)',
    type: 'Pseudo-Cybernetic',
    subcategory: '12.1 Pseudo-Cybernetics (Wearable Augmentation)',
    location: 'Full Body',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 30,
    cost: 40960,
    nodes: 60,
    cp: 0,
    description: 'Heavy-duty industrial wearable frame providing synthetic lifting strength and 60 internal Nodes.',
    mechanic: 'Provides Synth Strength and 60 Nodes (6 Head, 30 Torso, 10 each Arm, 12 each Leg). Craft DC 30 (40,960 Cr).'
  },
  'polymatter-struct': {
    name: 'Polymatter Structure',
    type: 'Apex Nanoware',
    subcategory: '9. TL5 Advanced Augmentations',
    location: 'Limb / Chassis',
    tech_level: 5,
    meta_level: 0,
    craft_dc: 25,
    cost: 10240,
    nodes: 0,
    cp: 0,
    description: 'Morphic polymatter implant or limb replacement modifier (+25% Base Cost).',
    mechanic: 'Converts an implant or prosthetic into a morphic polymatter structure capable of limited reshaping (+25% Cost, 0 CP).'
  },

  // 3 Missing Canonical Items from 2.00.Augmentations.md
  'advanced-comm-unit': {
    name: 'Advanced Comm Unit',
    type: 'Body Modification',
    subcategory: '5.2 Core Systems, Implants and Options',
    location: 'Head / Torso',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 1,
    cp: 2,
    description: 'Internal coded transceiver providing encrypted planetary-range and network communications.',
    mechanic: 'Planetary-range coded transceiver and mesh network link. Costs 2 CP, 1 Node. Craft DC 15 (640 Cr).'
  },
  'shoulder-mount': {
    name: 'Shoulder Mount (Wearable)',
    type: 'Pseudo-Cybernetic',
    subcategory: '12.1 Pseudo-Cybernetics (Wearable Augmentation)',
    location: 'Torso (Shoulder)',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 10,
    cp: 0,
    description: 'Smart-linked shoulder turret harness providing independent ranged weapon mounting.',
    mechanic: 'Provides 10 Nodes on Torso (Shoulder) and mounts 1 ranged weapon with Smart-Link targeting (0 CP). Craft DC 15 (640 Cr).'
  },
  'sabatons-wearable': {
    name: 'Sabatons (Wearable Pseudo-Cybernetic)',
    type: 'Pseudo-Cybernetic',
    subcategory: '12.1 Pseudo-Cybernetics (Wearable Augmentation)',
    location: 'Lower Legs',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 10,
    cost: 160,
    nodes: 10,
    cp: 0,
    description: 'Wearable pseudo-cybernetic lower-leg greaves and boots hosting 10 Nodes per boot.',
    mechanic: '2d6 Blunt unarmed kick damage, DR 10, 10 Nodes (Each). Movement modifications must match on both legs. Craft DC 10 (160 Cr).'
  },

  // 3 Full Body Conversion (FBC) Package Tiers (2.00.Augmentations.md Section 10.2)
  'civilian-shell-fbc': {
    name: 'Full Body Conversion: Civilian Shell (Light)',
    type: 'Full Body Conversion',
    subcategory: '10.2 FBC Package Tiers',
    location: 'Full Body',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 33,
    cost: 100000,
    nodes: 200,
    cp: 10,
    sp: 260,
    dr: 10,
    description: 'Total migration of consciousness into a standard humanoid synthetic frame (Light Civilian Shell).',
    mechanic: 'Total Nodes: 200 (10 Head, 50 Torso, 60 Arms, 80 Legs). Total Structure: 260 SP, DR 10. Costs 10 CP, 100,000 Cr.'
  },
  'industrial-combat-fbc': {
    name: 'Full Body Conversion: Industrial / Combat (Heavy)',
    type: 'Full Body Conversion',
    subcategory: '10.2 FBC Package Tiers',
    location: 'Full Body',
    tech_level: 3,
    meta_level: 0,
    craft_dc: 36,
    cost: 250000,
    nodes: 200,
    cp: 10,
    sp: 260,
    dr: 40,
    description: 'Heavy-duty military and industrial Full Body Conversion chassis with reinforced DR 40 plating.',
    mechanic: 'Total Nodes: 200 (10 Head, 50 Torso, 60 Arms, 80 Legs). Total Structure: 260 SP, DR 40. Costs 10 CP, 250,000 Cr.'
  },
  'mekan-apex-fbc': {
    name: 'Full Body Conversion: Mekan Apex (Powered)',
    type: 'Full Body Conversion',
    subcategory: '10.2 FBC Package Tiers',
    location: 'Full Body',
    tech_level: 5,
    meta_level: 0,
    craft_dc: 41,
    cost: 1000000,
    nodes: 200,
    cp: 5,
    sp: 260,
    dr: 120,
    description: 'Pinnacle TL5 Mekan Apex powered Full Body Conversion frame with half CP cost and DR 120.',
    mechanic: 'Total Nodes: 200 (10 Head, 50 Torso, 60 Arms, 80 Legs). Total Structure: 260 SP, DR 120 (Powered). Costs 5 CP, 1,000,000 Cr.'
  },

  // 16 Biological Augmentations (99.Tech.Augmentations.Biological.md Section 5)
  'symbiotic-venom-gland': {
    name: 'Symbiotic Venom Gland',
    type: 'Bioware (Symbiote)',
    subcategory: 'Biological: Bio-Weapons & Offense',
    location: 'Head (Jaw) or Arm (Wrist)',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 5,
    cp: 2,
    description: 'A parasitic gland that synthesizes potent biological toxins (3 doses per day).',
    mechanic: 'Grants the Venom Species Feature. Coat a weapon or deliver toxin via bite/spit (3 doses/day). 5 Nodes, TL 4, CR 15 (640 Cr).'
  },
  'bone-spur-extrusions': {
    name: 'Bone-Spur Extrusions (Wolverine Claws)',
    type: 'Bioware (Genetic/Graft)',
    subcategory: 'Biological: Bio-Weapons & Offense',
    location: 'Arm (Forearm)',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 5,
    cp: 2,
    description: 'Genetically enforced osteogenesis allowing the host to extend dense, calcified blades from their knuckles or wrists.',
    mechanic: '1d6 Piercing/Slashing damage. Retractable; undetectable by security scanners when retracted. 5 Nodes, TL 4, CR 15 (640 Cr).'
  },
  'myomeric-tendril-grafts': {
    name: 'Myomeric Tendril Grafts',
    type: 'Bioware (Graft)',
    subcategory: 'Biological: Bio-Weapons & Offense',
    location: 'Torso (Back/Shoulders)',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 20,
    cost: 2560,
    nodes: 15,
    cp: 2,
    description: 'Two heavily muscled, prehensile tentacles spliced into the host\'s spinal column, mimicking Sefalin biology.',
    mechanic: 'Grants Prehensile Tentacles feature (Unarmed 1d4 Blunt, Reach 10ft, Advantage on Grapple checks). 15 Nodes, TL 4, CR 20 (2,560 Cr).'
  },
  'acid-spitter-gland': {
    name: 'Acid-Spitter Gland',
    type: 'Bioware (Graft)',
    subcategory: 'Biological: Bio-Weapons & Offense',
    location: 'Head (Throat)',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 5,
    cp: 2,
    description: 'A bio-engineered sac placed near the esophagus that produces a highly corrosive binary liquid.',
    mechanic: 'Ranged Unarmed Attack (Range 15ft) dealing 1d6 Corrosive damage; melts standard restraints in 1 round. 5 Nodes, TL 4, CR 15 (640 Cr).'
  },
  'sub-dermal-chitin-plating': {
    name: 'Sub-Dermal Chitin Plating',
    type: 'Bioware (Genetic)',
    subcategory: 'Biological: Defense & Survivability',
    location: 'Torso / Full Body',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 20,
    cost: 2560,
    nodes: 20,
    cp: 2,
    description: 'Genetically sequenced flexible, impact-resistant chitinous layer grown beneath the epidermis.',
    mechanic: 'Grants Exoskeleton (Light) feature: DR equal to Strength Doubled (does not stack with worn armor). 20 Nodes, TL 4, CR 20 (2,560 Cr).'
  },
  'redundant-vital-organs': {
    name: 'Redundant Vital Organs (Bioware)',
    type: 'Bioware (Graft)',
    subcategory: 'Biological: Defense & Survivability',
    location: 'Torso',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 20,
    cost: 2560,
    nodes: 15,
    cp: 2,
    description: 'Cloned backup organs (secondary heart, tertiary lung) grafted into the chest cavity.',
    mechanic: 'Advantage on Fortitude saves vs toxins, diseases, and exhaustion; reduces organ-destroying Critical Hits to Disabled. 15 Nodes, TL 4, CR 20 (2,560 Cr).'
  },
  'impact-reactive-adipose-tissue': {
    name: 'Impact-Reactive Adipose Tissue',
    type: 'Bioware (Graft)',
    subcategory: 'Biological: Defense & Survivability',
    location: 'Full Body',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 15,
    cp: 2,
    description: 'A thick, slightly gelatinous layer of connective tissue that hardens instantly upon kinetic impact.',
    mechanic: 'Grants Resistance 5 vs Blunt damage and Advantage on Stamina checks vs environmental cold. 15 Nodes, TL 4, CR 15 (640 Cr).'
  },
  'aether-leech-symbiote': {
    name: 'Aether-Leech Symbiote',
    type: 'Bioware (Symbiote)',
    subcategory: 'Biological: Utility & Sensory',
    location: 'Spine / Nervous System',
    tech_level: 5,
    meta_level: 3,
    craft_dc: 25,
    cost: 10240,
    nodes: 10,
    cp: 1,
    description: 'A glowing, bioluminescent parasite bonded to the spine that feeds on the Universal Resonance.',
    mechanic: 'Acts as an Essence Battery storing up to 5 Essence (regenerates 1 Essence/day from ambient radiation). 10 Nodes, TL 5, CR 25 (10,240 Cr).'
  },
  'chromatophore-skin-graft': {
    name: 'Chromatophore Skin Graft',
    type: 'Bioware (Graft)',
    subcategory: 'Biological: Utility & Sensory',
    location: 'Full Body Skin',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 10,
    cp: 2,
    description: 'Pigment-containing, light-reflecting cephalopod cells grafted into the dermal layer.',
    mechanic: 'Grants the Chameleon Species Feature (+4 Stealth when stationary). 10 Nodes, TL 4, CR 15 (640 Cr).'
  },
  'echolocation-cavity': {
    name: 'Echolocation Cavity',
    type: 'Bioware (Graft)',
    subcategory: 'Biological: Utility & Sensory',
    location: 'Head',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 5,
    cp: 2,
    description: 'Surgically widened sinus cavity and altered vocal cords emitting high-frequency clicks inspired by Mobula biology.',
    mechanic: 'Grants Blindsense (Sound) within 30ft radius in darkness so long as the host can emit sound. 5 Nodes, TL 4, CR 15 (640 Cr).'
  },
  'pheromone-synthesizer': {
    name: 'Pheromone Synthesizer (Exocrine Graft)',
    type: 'Bioware (Graft)',
    subcategory: 'Biological: Utility & Sensory',
    location: 'Torso (Skin Glands)',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 5,
    cp: 2,
    description: 'Exocrine glands spliced into sweat pores that secrete potent mood-altering pheromones.',
    mechanic: '+2 Bonus to Diplomacy, Bluff, or Handle Animal checks against biological targets within 15ft. 5 Nodes, TL 4, CR 15 (640 Cr).'
  },
  'amphibious-lung-graft': {
    name: 'Amphibious Lung Graft',
    type: 'Bioware (Graft)',
    subcategory: 'Biological: Metabolic & Environmental',
    location: 'Torso',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 15,
    cost: 640,
    nodes: 10,
    cp: 2,
    description: 'Spliced amphibian tissue lining the lungs and trachea to extract oxygen directly from water.',
    mechanic: 'Grants the Water Breathing feature (survive underwater indefinitely). 10 Nodes, TL 4, CR 15 (640 Cr).'
  },
  'photosynthetic-skin-splicing': {
    name: 'Photosynthetic Skin Splicing',
    type: 'Bioware (Genetic)',
    subcategory: 'Biological: Metabolic & Environmental',
    location: 'Full Body Skin',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 20,
    cost: 2560,
    nodes: 10,
    cp: 2,
    description: 'Thorn-derived chloroplast cells embedded into the epidermis, tinting the skin faint green or cyan.',
    mechanic: 'Grants the Chloroplast feature: requires only 1/4 normal food intake with 4 hours/day of sunlight or UV light. 10 Nodes, TL 4, CR 20 (2,560 Cr).'
  },
  'toxin-filter-liver': {
    name: 'Toxin-Filter Liver',
    type: 'Bioware (Graft)',
    subcategory: 'Biological: Metabolic & Environmental',
    location: 'Torso',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 20,
    cost: 2560,
    nodes: 10,
    cp: 2,
    description: 'Heavily augmented vat-grown liver engineered for high-risk chemical environments and espionage.',
    mechanic: 'Grants Poison Immunity (automatically succeeds on Fortitude saves vs non-magical poisons and narcotics). 10 Nodes, TL 4, CR 20 (2,560 Cr).'
  },
  'hive-mind-node-symbiote': {
    name: 'Hive-Mind Node Symbiote',
    type: 'Bioware (Symbiote)',
    subcategory: 'Biological: Cognitive & Neural',
    location: 'Head (Cerebral Cortex)',
    tech_level: 5,
    meta_level: 4,
    craft_dc: 25,
    cost: 10240,
    nodes: 5,
    cp: 1,
    description: 'Microscopic psionically resonant parasite derived from Riezen bio-swarms nesting in the brain stem.',
    mechanic: 'Grants planetary-range un-jammable Mind Link with any willing creature hosting the same symbiote. 5 Nodes, TL 5, CR 25 (10,240 Cr).'
  },
  'adrenal-hyper-gland': {
    name: 'Adrenal Hyper-Gland',
    type: 'Bioware (Graft)',
    subcategory: 'Biological: Cognitive & Neural',
    location: 'Torso (Kidneys)',
    tech_level: 4,
    meta_level: 0,
    craft_dc: 20,
    cost: 2560,
    nodes: 5,
    cp: 2,
    description: 'Spliced adrenal gland that can be consciously triggered to flood the bloodstream with combat stimulants.',
    mechanic: '1/day as a Swift Action, gain Mighty Surge (+4 Strength/Agility checks and saves for 1 min), then suffer 1 Exhaustion. 5 Nodes, TL 4, CR 20 (2,560 Cr).'
  },

  // 11 Metaphysical Augmentations (99.Tech.Augmentations.Metaphysical.md Section 5)
  'ocular-resonance-matrix': {
    name: 'Ocular Resonance Matrix (Ethersight Lenses)',
    type: 'Meta-Augmentation (Sensory)',
    subcategory: 'Metaphysical: Sensory & Perception Implants',
    location: 'Head (Eyes)',
    tech_level: 4,
    meta_level: 4,
    craft_dc: 20,
    cost: 2560,
    nodes: 5,
    cp: 2,
    description: 'Synthetic faceted crystal lenses replacing the biological eyes, hardwired to perceive Conscious Light.',
    mechanic: 'Grants Ethersight and Acute Sense (Vision): see invisible/phased beings, magical auras, and invocation residue within 60ft. 5 Nodes, TL 4 / ML 4, CR 20 (2,560 Cr).'
  },
  'echo-chamber-tympanum': {
    name: 'Echo-Chamber Tympanum',
    type: 'Meta-Augmentation (Sensory)',
    subcategory: 'Metaphysical: Sensory & Perception Implants',
    location: 'Head (Ears)',
    tech_level: 3,
    meta_level: 4,
    craft_dc: 15,
    cost: 640,
    nodes: 5,
    cp: 2,
    description: 'Intricate gold-and-bone filigree inner-ear replacement enchanted with Mental and Dimensional properties.',
    mechanic: 'Grants Uncanny Sense (Hearing); spend 1 Essence to listen to psychic/emotional residue of a room from the past 24 hours. 5 Nodes, TL 3 / ML 4, CR 15 (640 Cr).'
  },
  'aegis-runes': {
    name: 'Aegis Runes (Tattoos of Warding)',
    type: 'Meta-Augmentation (Imbued Tattoo)',
    subcategory: 'Metaphysical: Imbued Tattoos & Somatic Modifications',
    location: 'Torso / Full Body',
    tech_level: 2,
    meta_level: 3,
    craft_dc: 15,
    cost: 640,
    nodes: 10,
    cp: 2,
    description: 'Intricate geometric tattoos inked with crushed Resonance Crystals that glow with Entropy (Order) energy when struck.',
    mechanic: 'Passive Enhancement granting permanent DR 5 against physical (Kinetic/Blunt/Slashing) damage. 10 Nodes (1 Socket), TL 2 / ML 3, CR 15 (640 Cr).'
  },
  'conduit-scarification': {
    name: 'Conduit Scarification (Energy Channeling)',
    type: 'Meta-Augmentation (Runification)',
    subcategory: 'Metaphysical: Imbued Tattoos & Somatic Modifications',
    location: 'Arms (Both)',
    tech_level: 2,
    meta_level: 4,
    craft_dc: 20,
    cost: 2560,
    nodes: 10,
    cp: 2,
    description: 'Ritualistic scars filled with conductive gold and Aetherium paste favored by Vajar Battle-Mages and Alterian spell-swords.',
    mechanic: '+2 Bonus to Attune checks for a chosen Energy Discipline; Unarmed strikes deal +1d6 energy damage of that type. 10 Nodes/arm, TL 2 / ML 4, CR 20 (2,560 Cr).'
  },
  'null-void-sigils': {
    name: 'Null-Void Sigils (Anti-Magic Tattoos)',
    type: 'Meta-Augmentation (Imbued Tattoo)',
    subcategory: 'Metaphysical: Imbued Tattoos & Somatic Modifications',
    location: 'Full Body',
    tech_level: 2,
    meta_level: 5,
    craft_dc: 25,
    cost: 10240,
    nodes: 15,
    cp: 2,
    description: 'Sweeping jagged tattoos inked with void-touched pigment from the Shadow Plane that ground out the Universal Resonance.',
    mechanic: 'Grants Advantage on all Saving Throws vs Invocations and Meta-Tech (blocks beneficial Invocations unless suppressed as a Standard Action). 15 Nodes, TL 2 / ML 5, CR 25 (10,240 Cr).'
  },
  'beast-spirit-totem-inks': {
    name: 'Beast-Spirit Totem Inks',
    type: 'Meta-Augmentation (Imbued Tattoo)',
    subcategory: 'Metaphysical: Imbued Tattoos & Somatic Modifications',
    location: 'Torso (Chest or Back)',
    tech_level: 2,
    meta_level: 3,
    craft_dc: 15,
    cost: 640,
    nodes: 10,
    cp: 2,
    description: 'Primal artwork depicting an apex predator, animated by trapped dimensional and spiritual energy.',
    mechanic: 'Spend 1 Essence as a Swift Action to gain Mighty Surge and Natural Weapons (1d6) for 1 minute. 10 Nodes, TL 2 / ML 3, CR 15 (640 Cr).'
  },
  'sun-fire-vambraces': {
    name: 'Sun-Fire Vambraces (Impyrium Relic Design)',
    type: 'Meta-Augmentation (Offensive)',
    subcategory: 'Metaphysical: Offensive & Weaponized Implants',
    location: 'Arms (Forearms)',
    tech_level: 4,
    meta_level: 4,
    craft_dc: 25,
    cost: 10240,
    nodes: 20,
    cp: 2,
    description: 'Golden, seamless forearm plating infused with living crystal, channeling the Energy (Fire) Discipline directly from the user\'s pulse.',
    mechanic: 'Cast a Rank 10 Energy (Fire) Blast dealing 3d6 + Intellect/Wisdom Fire damage (Medium range) for 1 Essence per shot. 10 Nodes/arm (20 total), TL 4 / ML 4, CR 25 (10,240 Cr).'
  },
  'dimensional-tear-gland': {
    name: 'Dimensional Tear Gland',
    type: 'Meta-Augmentation (Offensive)',
    subcategory: 'Metaphysical: Offensive & Weaponized Implants',
    location: 'Head (Throat) or Hand (Palm)',
    tech_level: 5,
    meta_level: 5,
    craft_dc: 30,
    cost: 40960,
    nodes: 10,
    cp: 1,
    description: 'An exotic graft embedding a micro-singularity focus into the body to weaponize Tangent space.',
    mechanic: '1/day (or 5 Essence), project a spatial anomaly at Close range: target makes CR 20 Reflex save or is banished for 1d4 rounds and takes 2d6 Cold damage. 10 Nodes, TL 5 / ML 5, CR 30 (40,960 Cr).'
  },
  'shadow-glass-bone-lacing': {
    name: 'Shadow-Glass Bone Lacing',
    type: 'Meta-Augmentation (Structural)',
    subcategory: 'Metaphysical: Structural & Systemic Overlays',
    location: 'Full Skeleton',
    tech_level: 4,
    meta_level: 4,
    craft_dc: 25,
    cost: 10240,
    nodes: 20,
    cp: 2,
    description: 'A Kovian Tribunal specialty infusing the host\'s marrow with liquid obsidian and Void energy.',
    mechanic: 'Grants Energy Resistance (Necrotic/Shadow), +2 Stealth, and immunity to thermal imaging detection. 20 Nodes, TL 4 / ML 4, CR 25 (10,240 Cr).'
  },
  'telekinetic-anchor-crystals': {
    name: 'Telekinetic Anchor Crystals',
    type: 'Meta-Augmentation (Structural)',
    subcategory: 'Metaphysical: Structural & Systemic Overlays',
    location: 'Legs (Calves)',
    tech_level: 4,
    meta_level: 4,
    craft_dc: 15,
    cost: 640,
    nodes: 10,
    cp: 2,
    description: 'Deep blue lapis-lazuli matrices grafted onto the shin bones that project a localized gravitational tether.',
    mechanic: '+10 Bonus to Stability checks against being knocked prone, tripped, or forcibly moved, and halves falling damage. 10 Nodes, TL 4 / ML 4, CR 15 (640 Cr).'
  },
  'aether-pump-heart': {
    name: 'Aether-Pump Heart',
    type: 'Meta-Augmentation (Systemic)',
    subcategory: 'Metaphysical: Structural & Systemic Overlays',
    location: 'Torso (Heart)',
    tech_level: 4,
    meta_level: 5,
    craft_dc: 35,
    cost: 163840,
    nodes: 15,
    cp: 2,
    description: 'Replaces the biological heart with a spinning frictionless Aetherium crystal turbine pumping liquid resonance through the veins.',
    mechanic: 'Grants Ageless, Regeneration (1 HP/min), and +20 max Vitality (CR 20 Fortitude save in Null-Void fields or drop to 0 HP). 15 Nodes, TL 4 / ML 5, CR 35 (163,840 Cr).'
  }
};

function updateAugmentations() {
  const augDir = path.join(omniRoot, 'augmentations');
  // Remove archaic unarmed natural weapons (now in weaponry/)
  for (const wId of ['bite', 'claws', 'feet', 'fists']) {
    const wPath = path.join(augDir, `${wId}.md`);
    if (fs.existsSync(wPath)) fs.unlinkSync(wPath);
  }

  const existingFiles = fs.readdirSync(augDir).filter(f => f.endsWith('.md'));
  const allIds = new Set([
    ...existingFiles.map(f => f.replace(/\.md$/, '')),
    ...Object.keys(CANONICAL_AUG_ADDITIONS)
  ]);
  const items = [];

  for (const id of Array.from(allIds).sort()) {
    const filePath = path.join(augDir, `${id}.md`);
    let data = {};
    let body = '';
    if (fs.existsSync(filePath)) {
      const parsed = matter(fs.readFileSync(filePath, 'utf8'));
      data = parsed.data || {};
      body = (parsed.content || '').trim();
    }

    const add = CANONICAL_AUG_ADDITIONS[id];
    if (add) {
      data = {
        ...data,
        id,
        name: add.name,
        category: 'augmentations',
        type: add.type,
        subcategory: add.subcategory,
        location: add.location,
        tech_level: add.tech_level,
        meta_level: add.meta_level,
        craft_dc: add.craft_dc,
        design_dc: add.craft_dc,
        cost: add.cost,
        nodes: add.nodes,
        sp: add.sp ?? data.sp ?? add.nodes,
        dr: add.dr ?? data.dr ?? 0,
        costs: {
          cp: add.cp,
          bp: add.cp,
          credits: add.cost,
          nodes: add.nodes,
          sockets: Math.floor((add.nodes || 0) / 10),
          strain: 0,
          focus: 0,
          ap: 0
        },
        description: add.description,
        mechanic: add.mechanic,
        keywords: `${add.name.toLowerCase()}, augmentation, ${add.type.toLowerCase()}, tl-${add.tech_level}`,
        negative_keywords: 'unaugmented, pure-organic'
      };
      body = `Category: **${add.subcategory}**\n\n${add.description}\n\n**Mechanics:** ${add.mechanic}`;
    } else if (id === 'armor-plating') {
      data.craft_dc = 15;
      data.design_dc = 15;
      data.cost = 640;
      data.costs = { ...(data.costs || {}), bp: 1, cp: 1, credits: 640, nodes: 5 };
      data.tech_level = 3;
      data.description = 'Integrated external armor plating (+15% Base Chassis Cost, Tiered DR 10/20/40, 5 Nodes, 1 CP).';
    } else if (id === 'shielding') {
      data.craft_dc = 15;
      data.design_dc = 15;
      data.cost = 640;
      data.costs = { ...(data.costs || {}), bp: 1, cp: 1, credits: 640, nodes: 1 };
      data.tech_level = 3;
      data.description = 'Full EMP and radiation hardening for a synthetic limb (+25% Base Cost, 1 Node, 1 CP).';
    }

    let tl = add?.tech_level ?? data.tech_level;
    if (TL5_AUG_IDS.has(id)) {
      tl = 5;
    } else if (TL4_AUG_IDS.has(id)) {
      tl = 4;
    } else if (!tl || tl === 0) {
      tl = 3;
    }

    const dc = data.craft_dc ?? data.design_dc ?? (data.cost > 0 ? dcFromCredits(data.cost) : 5);
    const credits = data.cost > 0 ? data.cost : (data.costs?.credits > 0 ? data.costs.credits : tscCredits(dc));

    const frontmatter = {
      ...data,
      id,
      name: data.name || id,
      category: 'augmentations',
      tech_level: tl,
      meta_level: data.meta_level || 0,
      craft_dc: dc,
      design_dc: dc,
      cost: credits,
      costs: {
        ...(data.costs || {}),
        credits
      }
    };

    fs.writeFileSync(filePath, matter.stringify(body, frontmatter), 'utf8');
    items.push({
      ...frontmatter,
      body
    });
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Augmentations Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/augmentations/
 * Total Augmentations: ${items.length}
 */

export const DEFAULT_AUGMENTATIONS = ${JSON.stringify(items, null, 2)};
export const getAugmentationById = (id) => DEFAULT_AUGMENTATIONS.find(a => a.id === id);
export const getEnrichedAugmentationData = (item) => {
  if (!item) return null;
  const key = (item.id || item.name || '').toString().toLowerCase().trim();
  const match = DEFAULT_AUGMENTATIONS.find(
    a => a.id.toLowerCase() === key || (a.name && a.name.toLowerCase() === key)
  );
  return match ? { ...match, ...item } : item;
};
`;
  fs.writeFileSync(path.join(staticDataRoot, 'augmentationsData.js'), outputCode, 'utf8');
  console.log(`[Augmentations] Revised ${items.length} canonical augmentations (.md + augmentationsData.js)`);
}

updateWeaponry();
updateArmoring();
updateGear();
updateMecha();
updateArchitecture();
updateAugmentations();
