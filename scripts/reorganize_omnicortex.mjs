import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const omniRoot = path.resolve('src/data/omnicortex');
const gearDir = path.join(omniRoot, 'gear');
const augmentationsDir = path.join(omniRoot, 'augmentations');
const weaponryDir = path.join(omniRoot, 'weaponry');
const armoringDir = path.join(omniRoot, 'armoring');
const mechaDir = path.join(omniRoot, 'mecha');
const architectureDir = path.join(omniRoot, 'architecture');

// Ensure all target directories exist
[gearDir, augmentationsDir, weaponryDir, armoringDir, mechaDir, architectureDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function parseNumeric(val, fallback = 0) {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') return val;
  const str = String(val).replace(/,/g, '').replace(/Cr/gi, '').replace(/\+/g, '').replace(/~/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}

// 1. Load the 271 existing items from gear
const existingFiles = fs.readdirSync(gearDir).filter(f => f.endsWith('.md'));
console.log(`Found ${existingFiles.length} files in ${gearDir}`);

const mapping = JSON.parse(fs.readFileSync('scripts/final_mapping.json', 'utf8'));

// Build reverse lookup for file -> target category
const fileToCat = {};
for (const [cat, items] of Object.entries(mapping)) {
  for (const it of items) {
    fileToCat[it.file] = cat;
  }
}

// Function to clean frontmatter based on target category
function normalizeItem(file, rawData, content, targetCat) {
  const id = rawData.id || file.replace('.md', '');
  const name = rawData.name || rawData.title || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const c = content.trim();

  // Extract description if present or from content
  let description = rawData.description || '';
  if (!description) {
    const descMatch = c.match(/\*\*(?:Description|Effect\/Description|Effect):\*\*\s*(.+)/i);
    if (descMatch) {
      description = descMatch[1].trim();
    } else {
      description = c.replace(/Category:[^\n]+/gi, '').replace(/\*\*[^*]+\*\*:[^\n]+/g, '').trim();
    }
  }

  // Cost calculation
  let cost = rawData.cost ? parseNumeric(rawData.cost) : undefined;
  if (!cost) {
    const costMatch = c.match(/\b(?:Cost|Value):\s*([\d,]+)\s*Cr/i);
    if (costMatch) cost = parseNumeric(costMatch[1]);
  }

  // Tech level
  let tl = rawData.tl !== undefined ? parseNumeric(rawData.tl) : (rawData.tech_level !== undefined ? parseNumeric(rawData.tech_level) : undefined);
  if (tl === undefined) {
    const tlMatch = c.match(/TL\s*(\d+)/i) || c.match(/Tech Level:\s*(\d+)/i);
    if (tlMatch) tl = parseInt(tlMatch[1], 10);
    else tl = 3;
  }

  // Meta level
  let ml = rawData.ml !== undefined ? parseNumeric(rawData.ml) : (rawData.meta_level !== undefined ? parseNumeric(rawData.meta_level) : 0);

  // Craft DC / Design DC / WS
  let craft_dc = rawData.craft_dc !== undefined ? parseNumeric(rawData.craft_dc) : (rawData.design_dc !== undefined ? parseNumeric(rawData.design_dc) : undefined);
  if (craft_dc === undefined) {
    const dcMatch = c.match(/DC\s*(\d+)/i) || c.match(/Wealth\s*(?:Score)?\s*(\d+)/i);
    if (dcMatch) craft_dc = parseInt(dcMatch[1], 10);
  }

  // If cost exists but craft_dc doesn't, or vice versa, derive using Tangent Standard Curve (Value = 10 * 4^(DC/5))
  if (craft_dc !== undefined && !cost) {
    cost = Math.round(10 * Math.pow(4, craft_dc / 5));
  } else if (cost && craft_dc === undefined) {
    craft_dc = Math.round(5 * (Math.log(cost / 10) / Math.log(4)));
    if (craft_dc < 0) craft_dc = 0;
  }

  let finalData = {
    id,
    name,
    category: targetCat,
    ...rawData,
    category: targetCat,
    tl,
    ml
  };

  if (cost !== undefined) finalData.cost = cost;
  if (craft_dc !== undefined) {
    if (targetCat === 'augmentations' || targetCat === 'armoring' || targetCat === 'weaponry' || targetCat === 'architecture') {
      finalData.design_dc = craft_dc;
    }
    finalData.craft_dc = craft_dc;
  }

  if (description) finalData.description = description;

  if (targetCat === 'augmentations') {
    // Extract nodes / BP / location / type
    const nodesMatch = c.match(/\bNodes:\s*(\d+)/i);
    if (nodesMatch) finalData.nodes = parseInt(nodesMatch[1], 10);
    else if (rawData.nodes !== undefined) finalData.nodes = parseNumeric(rawData.nodes);

    const bpMatch = c.match(/\bBP:\s*(\d+)/i) || c.match(/\b(\d+)\s*BP\b/i);
    if (bpMatch) finalData.bp_cost = parseInt(bpMatch[1], 10);
    else if (rawData.bp_cost !== undefined) finalData.bp_cost = parseNumeric(rawData.bp_cost);

    const drMatch = c.match(/\bDR:\s*(\d+)/i) || c.match(/\bDR\s*(\d+)/i);
    if (drMatch) finalData.dr = parseInt(drMatch[1], 10);
    else if (rawData.dr !== undefined) finalData.dr = parseNumeric(rawData.dr);

    const spMatch = c.match(/\bSP:\s*(\d+)/i) || c.match(/\bSP\s*(\d+)/i);
    if (spMatch) finalData.sp = parseInt(spMatch[1], 10);
    else if (rawData.sp !== undefined) finalData.sp = parseNumeric(rawData.sp);

    // Stigma
    if (!finalData.stigma) {
      if (c.toLowerCase().includes('severe stigma')) finalData.stigma = 'Severe';
      else if (c.toLowerCase().includes('moderate stigma')) finalData.stigma = 'Moderate';
      else if (c.toLowerCase().includes('minor stigma')) finalData.stigma = 'Minor';
      else finalData.stigma = 'None';
    }

    // Determine Augmentation category / type
    if (!finalData.type) {
      if (c.toLowerCase().includes('sensory modifications')) finalData.type = 'Sensory';
      else if (c.toLowerCase().includes('brain modifications')) finalData.type = 'Neural';
      else if (c.toLowerCase().includes('integrated cybernetic armor')) finalData.type = 'Cybernetic Armor';
      else if (c.toLowerCase().includes('synth limbs') || c.toLowerCase().includes('limb upgrades') || c.toLowerCase().includes('hand & foot')) finalData.type = 'Prosthetic';
      else if (c.toLowerCase().includes('fashionware') || c.toLowerCase().includes('civilian standard')) finalData.type = 'Fashionware';
      else if (c.toLowerCase().includes('full body conversion')) finalData.type = 'Full Body Conversion';
      else if (c.toLowerCase().includes('tl5 advanced')) finalData.type = 'Esoteric';
      else if (c.toLowerCase().includes('biotech') || c.toLowerCase().includes('bioware')) finalData.type = 'Bioware';
      else finalData.type = 'Cybernetic';
    }
  } else if (targetCat === 'weaponry') {
    // Damage, range, damage_type, classification, rof, ap, wielding
    if (rawData.damage) finalData.damage = String(rawData.damage);
    else {
      const dmgMatch = c.match(/\bDamage:\s*([^\n\r]+)/i) || c.match(/\b(\d+d\d+(?:\+\d+)?)\b/i);
      if (dmgMatch) finalData.damage = dmgMatch[1].trim();
    }

    if (rawData.range) finalData.range = String(rawData.range);
    else {
      const rngMatch = c.match(/\bRange:\s*([^\n\r]+)/i);
      if (rngMatch) finalData.range = rngMatch[1].trim();
      else finalData.range = 'Melee';
    }

    if (!finalData.damage_type) {
      if (c.toLowerCase().includes('thermal') || c.toLowerCase().includes('pyro') || c.toLowerCase().includes('cryo') || c.toLowerCase().includes('laser') || c.toLowerCase().includes('plasma') || c.toLowerCase().includes('flamer')) {
        finalData.damage_type = 'Thermal (Pyro/Cryo)';
      } else if (c.toLowerCase().includes('voltic') || c.toLowerCase().includes('shock') || c.toLowerCase().includes('lightning')) {
        finalData.damage_type = 'Voltic (Electrical)';
      } else if (c.toLowerCase().includes('sonic')) {
        finalData.damage_type = 'Sonic';
      } else if (c.toLowerCase().includes('corrosive') || c.toLowerCase().includes('acid')) {
        finalData.damage_type = 'Corrosive (Acid)';
      } else if (c.toLowerCase().includes('force') || c.toLowerCase().includes('disintegrator') || c.toLowerCase().includes('grav')) {
        finalData.damage_type = 'Force';
      } else {
        finalData.damage_type = 'Kinetic';
      }
    }

    if (!finalData.classification) {
      if (c.toLowerCase().includes('heavy') && (c.toLowerCase().includes('cannon') || c.toLowerCase().includes('machinegun') || c.toLowerCase().includes('missile'))) {
        finalData.classification = 'Heavy (Ballistic)';
      } else if (c.toLowerCase().includes('heavy') && (c.toLowerCase().includes('laser') || c.toLowerCase().includes('particle') || c.toLowerCase().includes('e-gun'))) {
        finalData.classification = 'Heavy (Energy)';
      } else if (c.toLowerCase().includes('laser') || c.toLowerCase().includes('plasma') || c.toLowerCase().includes('e-gun') || c.toLowerCase().includes('particle') || c.toLowerCase().includes('disruptor')) {
        finalData.classification = 'Ranged (Energy)';
      } else if (c.toLowerCase().includes('rifle') || c.toLowerCase().includes('pistol') || c.toLowerCase().includes('scattergun') || c.toLowerCase().includes('bow') || c.toLowerCase().includes('crossbow')) {
        finalData.classification = 'Ranged (Ballistic)';
      } else if (c.toLowerCase().includes('piercing') || c.toLowerCase().includes('spear') || c.toLowerCase().includes('dagger') || c.toLowerCase().includes('rapier')) {
        finalData.classification = 'Melee (Piercing)';
      } else if (c.toLowerCase().includes('blunt') || c.toLowerCase().includes('mace') || c.toLowerCase().includes('club') || c.toLowerCase().includes('hammer') || c.toLowerCase().includes('staff')) {
        finalData.classification = 'Melee (Blunt)';
      } else {
        finalData.classification = 'Melee (Slashing)';
      }
    }

    if (!finalData.wielding) {
      if (c.toLowerCase().includes('two-handed') || c.toLowerCase().includes('great') || c.toLowerCase().includes('rifle') || c.toLowerCase().includes('polearm') || c.toLowerCase().includes('staff') || c.toLowerCase().includes('heavy')) {
        finalData.wielding = 'Two-Handed';
      } else {
        finalData.wielding = 'One-Handed';
      }
    }
  } else if (targetCat === 'armoring') {
    const drMatch = c.match(/\bDR:\s*(\d+)/i) || c.match(/\bDR\s*(\d+)/i);
    if (drMatch) finalData.dr = parseInt(drMatch[1], 10);
    else if (rawData.dr !== undefined) finalData.dr = parseNumeric(rawData.dr);

    const spMatch = c.match(/\b(?:SP|Durability):\s*(\d+)/i) || c.match(/\b(?:SP|Durability)\s*(\d+)/i);
    if (spMatch) finalData.sp = parseInt(spMatch[1], 10);
    else if (rawData.sp !== undefined) finalData.sp = parseNumeric(rawData.sp);
    else if (rawData.durability !== undefined) finalData.sp = parseNumeric(rawData.durability);

    if (!finalData.coverage) {
      if (c.toLowerCase().includes('locations: all') || c.toLowerCase().includes('locations covered: all')) finalData.coverage = 'Sealed';
      else if (c.toLowerCase().includes('reinforced') || c.toLowerCase().includes('bulwark')) finalData.coverage = 'Reinforced';
      else if (c.toLowerCase().includes('partial') || c.toLowerCase().includes('locations: t') || c.toLowerCase().includes('locations: l')) finalData.coverage = 'Partial';
      else finalData.coverage = 'Standard';
    }

    if (!finalData.category) {
      if (c.toLowerCase().includes('heavy armor') || c.toLowerCase().includes('heavyweight')) finalData.category = 'Heavyweight';
      else if (c.toLowerCase().includes('medium armor') || c.toLowerCase().includes('mediumweight')) finalData.category = 'Mediumweight';
      else if (c.toLowerCase().includes('light armor') || c.toLowerCase().includes('lightweight') || c.toLowerCase().includes('clothing')) finalData.category = 'Lightweight';
      else if (c.toLowerCase().includes('exoskeleton') || c.toLowerCase().includes('battle suit')) finalData.category = 'Heavyweight';
      else finalData.category = 'Mediumweight';
    }
  } else if (targetCat === 'mecha') {
    if (!finalData.frame) {
      if (c.toLowerCase().includes('walker') || c.toLowerCase().includes('bipedal')) finalData.frame = 'Walker';
      else if (c.toLowerCase().includes('industrial') || id.includes('load-lifter')) finalData.frame = 'Industrial';
      else if (c.toLowerCase().includes('winged') || c.toLowerCase().includes('aircraft')) finalData.frame = 'Winged';
      else finalData.frame = 'Humanoid';
    }
    if (!finalData.size) finalData.size = 'Large';
    if (!finalData.domain) finalData.domain = 'Ground';
  } else if (targetCat === 'architecture') {
    if (!finalData.footprint) finalData.footprint = 'Medium';
    if (!finalData.height_class) finalData.height_class = 'Single';
    if (!finalData.frame) finalData.frame = 'Standard';
    if (!finalData.environment) finalData.environment = 'Standard';
    if (!finalData.security_level) finalData.security_level = 'Open';
  } else if (targetCat === 'gear') {
    if (!finalData.size) finalData.size = 'Small';
    if (!finalData.workspace_scale) finalData.workspace_scale = 'Bench';
  }

  return { finalData, content: c };
}

// Migrate existing 271 items
console.log('Migrating existing 271 items into proper folders...');
let migratedCount = 0;
const deletedFromGear = [];

for (const file of existingFiles) {
  const full = path.join(gearDir, file);
  const raw = fs.readFileSync(full, 'utf8');
  const parsed = matter(raw);
  const targetCat = fileToCat[file] || 'gear';

  const { finalData, content } = normalizeItem(file, parsed.data, parsed.content, targetCat);
  const targetDir = path.join(omniRoot, targetCat);
  const targetFile = path.join(targetDir, file);

  const formattedOutput = matter.stringify(content, finalData);
  fs.writeFileSync(targetFile, formattedOutput, 'utf8');
  migratedCount++;

  // If targetCat is not gear, mark for deletion from gear
  if (targetCat !== 'gear') {
    fs.unlinkSync(full);
    deletedFromGear.push(file);
  }
}

console.log(`Migrated ${migratedCount} files. Removed ${deletedFromGear.length} non-gear files from gear/.`);
