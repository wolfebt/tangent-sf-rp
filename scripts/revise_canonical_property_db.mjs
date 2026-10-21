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
    dr: 30,
    sp: 80,
    durability: 80,
    mobility_penalty: 0,
    body_locations: ['Head', 'Torso', 'Arms', 'Legs'],
    coverage: 'Bulwark',
    craft_dc: 30,
    sockets_max: 12,
    description: 'Full military powered armor chassis with fusion micro-pack, sealed life support, and +4 Strength.',
    mechanic: 'DR 30, SP 80. Powered (+4 Strength), Sealed. Locations: Head, Torso, Arms, Legs. Base Sockets: 12.'
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

function updateGear() {
  const gearDir = path.join(omniRoot, 'gear');
  const files = fs.readdirSync(gearDir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const filePath = path.join(gearDir, f);
    const parsed = matter(fs.readFileSync(filePath, 'utf8'));
    const data = parsed.data || {};
    let body = (parsed.content || '').trim();
    const id = data.id || f.replace(/\.md$/, '');

    if (id === 'utility-harness') {
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
// ═══════════════════════════════════════════════════════════════════════════
function updateMecha() {
  const mechaDir = path.join(omniRoot, 'mecha');
  const files = fs.readdirSync(mechaDir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  const MECHA_FIXES = {
    'reinforced-frame': {
      craft_dc: 15,
      cost: 640,
      tech_level: 3,
      dr: 15,
      sp: 40,
      description: 'Structural chassis reinforcement increasing baseline Structure Points by +25% (1 CP, 2 Nodes).',
      mechanic: 'Increases base chassis SP by +25%. Costs 1 CP, 2 Nodes. Craft DC 15 (640 Cr).'
    },
    'load-lifter-rig': {
      craft_dc: 30,
      cost: 40960,
      tech_level: 3,
      dr: 20,
      sp: 100,
      description: 'Industrial heavy-duty exoskeleton frame granting Large size leverage and +6 Strength.',
      mechanic: 'Grants Large size lifting capacity and +6 Strength. 60 Nodes. Craft DC 30 (40,960 Cr).'
    },
    'exo-harness': {
      craft_dc: 20,
      cost: 2560,
      tech_level: 3,
      dr: 10,
      sp: 40
    },
    'weapon-servo-rig': {
      craft_dc: 20,
      cost: 2560,
      tech_level: 3,
      dr: 10,
      sp: 40
    },
    'cyber-mecha-shell': {
      craft_dc: 40,
      cost: 655360,
      tech_level: 4,
      dr: 80,
      sp: 200
    },
    'reinforced-chassis': {
      craft_dc: 20,
      cost: 2560,
      tech_level: 3,
      dr: 15,
      sp: 60
    }
  };

  for (const f of files) {
    const filePath = path.join(mechaDir, f);
    const parsed = matter(fs.readFileSync(filePath, 'utf8'));
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();
    const id = data.id || f.replace(/\.md$/, '');
    const fix = MECHA_FIXES[id];

    const dc = fix?.craft_dc ?? data.craft_dc ?? dcFromCredits(data.cost || data.costs?.credits || 2560);
    const credits = fix?.cost ?? (data.cost > 25 ? data.cost : tscCredits(dc));
    const tl = fix?.tech_level ?? (data.tech_level > 0 ? data.tech_level : 3);

    const frontmatter = {
      ...data,
      id,
      name: data.name || id,
      category: 'mecha',
      size: data.size || 'Large',
      frame: data.frame || 'Walker',
      tech_level: tl,
      meta_level: data.meta_level || 0,
      craft_dc: dc,
      design_dc: dc,
      cost: credits,
      sp: fix?.sp ?? data.sp ?? 100,
      dr: fix?.dr ?? data.dr ?? 15,
      costs: {
        ...(data.costs || {}),
        credits
      },
      description: fix?.description || data.description || '',
      mechanic: fix?.mechanic || data.mechanic || ''
    };

    fs.writeFileSync(filePath, matter.stringify(body, frontmatter), 'utf8');
    items.push({
      ...frontmatter,
      body
    });
  }

  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Mecha & Vehicles Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/mecha/
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
  const files = fs.readdirSync(archDir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const filePath = path.join(archDir, f);
    const parsed = matter(fs.readFileSync(filePath, 'utf8'));
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();
    const id = data.id || f.replace(/\.md$/, '');

    if (id === 'polymatter-struct') {
      data.craft_dc = 25;
      data.design_dc = 25;
      data.cost = 10240;
      data.tech_level = 5;
      data.sp = 500;
      data.dr = 30;
      data.description = 'Programmable polymatter structural matrix capable of dynamic self-reconfiguration (+25% Base Cost).';
      data.mechanic = 'TL5 Polymatter architecture. Allows structural reconfiguration as a 1-minute action. Craft DC 25 (10,240 Cr base).';
    }

    const dc = data.craft_dc ?? data.design_dc ?? dcFromCredits(data.cost || data.costs?.credits || 2560);
    const credits = data.cost > 25 ? data.cost : tscCredits(dc);
    const tl = data.tech_level > 0 ? data.tech_level : 3;

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
// ═══════════════════════════════════════════════════════════════════════════
const TL4_AUG_IDS = new Set([
  'dermal-sheen', 'mood-hair', 'synth-voice-pro', 'Subdermal-pouch', 'subdermal-pouch',
  'internal-air-supply', 'sleep-regulator', 'metabolic-filter', 'smart-link-ii',
  'cybereye-ii', 'cyberaudio-ii', 'wired-reflexes-ii', 'muscle-graft-ii', 'bone-lacing-ii',
  'subdermal-armor-ii', 'nanite-repair', 'neural-co-processor', 'adrenal-booster-ii',
  'pain-editor', 'skill-jack-ii', 'stealth-skin'
]);

const TL5_AUG_IDS = new Set([
  'holo-skin', 'chrono-sense', 'perfect-pitch', 'dimensional-pocket', 'void-adaptation',
  'immortal-cell-therapy', 'regen-matrix', 'quantum-link', 'omni-optics', 'harmonic-auditory',
  'temporal-reflexes', 'gravitic-musculature', 'neutronium-bone-weave', 'phase-armor',
  'cortical-stack', 'synaptic-overdrive', 'psionic-resonator', 'polymatter-limb'
]);

function updateAugmentations() {
  const augDir = path.join(omniRoot, 'augmentations');
  const files = fs.readdirSync(augDir).filter(f => f.endsWith('.md')).sort();
  const items = [];

  for (const f of files) {
    const filePath = path.join(augDir, f);
    const parsed = matter(fs.readFileSync(filePath, 'utf8'));
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();
    const id = data.id || f.replace(/\.md$/, '');

    // Fix specific corrupted entries from 2.00.Augmentations.md
    if (id === 'armor-plating') {
      data.craft_dc = 15;
      data.design_dc = 15;
      data.cost = 640;
      data.costs = { ...(data.costs || {}), bp: 1, cp: 1, credits: 640, nodes: 5 };
      data.tech_level = 3;
      data.description = 'Integrated external armor plating (+15% Base Chassis Cost, +5 DR, 5 Nodes, 1 CP).';
    } else if (id === 'shielding') {
      data.craft_dc = 15;
      data.design_dc = 15;
      data.cost = 640;
      data.costs = { ...(data.costs || {}), bp: 1, cp: 1, credits: 640, nodes: 1 };
      data.tech_level = 3;
      data.description = 'EMP and radiation hardening for cybernetic systems (+25% Base Cost, +4 vs Ion/EMP, 1 Node, 1 CP).';
    } else if (['bite', 'claws', 'feet', 'fists'].includes(id)) {
      data.craft_dc = 0;
      data.design_dc = 0;
      data.cost = 0;
      data.costs = { ...(data.costs || {}), bp: 0, cp: 0, credits: 0, nodes: 0 };
      data.tech_level = 0;
      data.stage = 'Negligible';
    }

    let tl = data.tech_level;
    if (!tl || tl === 0) {
      if (['bite', 'claws', 'feet', 'fists'].includes(id)) {
        tl = 0;
      } else if (TL5_AUG_IDS.has(id) || (data.keywords && data.keywords.includes('tl-5'))) {
        tl = 5;
      } else if (TL4_AUG_IDS.has(id) || (data.keywords && data.keywords.includes('tl-4'))) {
        tl = 4;
      } else {
        tl = 3;
      }
    }

    const dc = data.craft_dc ?? data.design_dc ?? (data.cost > 0 ? dcFromCredits(data.cost) : 0);
    const credits = data.cost ?? data.costs?.credits ?? (dc > 0 ? tscCredits(dc) : 0);

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
