import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to sanitize array of string tags into canonical comma-separated string
function toKeywordString(tags) {
  if (!tags) return '';
  if (Array.isArray(tags)) {
    return [...new Set(tags.map(t => String(t).trim().toLowerCase()).filter(Boolean))].join(', ');
  }
  return String(tags).split(/[,;\n]+/).map(t => t.trim().toLowerCase()).filter(Boolean).join(', ');
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. ENRICH ARCHETYPES (100 assets)
// ═══════════════════════════════════════════════════════════════════════════
function enrichArchetypes() {
  console.log('\n--- Enriching Archetypes ---');
  const archetypesPath = path.join(rootDir, 'src/data/archetypesData.js');
  const mdDir = path.join(rootDir, 'src/data/omnicortex/archetypes');

  let content = fs.readFileSync(archetypesPath, 'utf8');
  
  // Extract DEFAULT_ARCHETYPES array
  const match = content.match(/export const DEFAULT_ARCHETYPES = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not locate DEFAULT_ARCHETYPES in archetypesData.js');
    return;
  }

  let archetypes;
  try {
    archetypes = JSON.parse(match[1]);
  } catch (err) {
    console.error('Error parsing DEFAULT_ARCHETYPES JSON:', err.message);
    return;
  }

  console.log(`Processing ${archetypes.length} archetypes...`);

  const updatedArchetypes = archetypes.map(arch => {
    const name = arch.name || '';
    const sphere = arch.sphere || '';
    const concept = arch.core_concept || '';
    const role = arch.tactical_role || '';
    const skills = (arch.essential_skills || []).map(s => s.replace(/^(Knowledge|Vocation)\s*\(/i, '').replace(/\)$/, '')).join(' ');
    const features = (arch.signature_features || []).join(' ');
    const primary = arch.primary_attribute || '';
    const secondary = arch.secondary_attribute || '';
    const summary = arch.summary || '';

    // Grounded positive keywords
    const pos = new Set();
    pos.add(name.toLowerCase().replace(/^the\s+/, ''));
    if (sphere.includes('Sentinels')) {
      pos.add('sentinel'); pos.add('defender'); pos.add('stability'); pos.add('order');
    } else if (sphere.includes('Operatives')) {
      pos.add('operative'); pos.add('artisan'); pos.add('adaptable'); pos.add('specialist');
    } else if (sphere.includes('Visionaries')) {
      pos.add('visionary'); pos.add('idealist'); pos.add('leadership'); pos.add('charisma');
    } else if (sphere.includes('Savants')) {
      pos.add('savant'); pos.add('rational'); pos.add('intellect'); pos.add('strategist');
    }

    // Role keywords
    concept.split(/[\/,]+/).forEach(c => {
      const trimmed = c.trim().toLowerCase();
      if (trimmed) pos.add(trimmed);
    });

    if (primary) pos.add(primary.toLowerCase());
    if (secondary) pos.add(secondary.toLowerCase());

    // Tactical role specifics
    if (role.toLowerCase().includes('tank') || role.toLowerCase().includes('armor') || role.toLowerCase().includes('dr')) {
      pos.add('frontline'); pos.add('durability');
    }
    if (role.toLowerCase().includes('stealth') || role.toLowerCase().includes('infiltrat')) {
      pos.add('covert'); pos.add('infiltrator');
    }
    if (role.toLowerCase().includes('heal') || role.toLowerCase().includes('support')) {
      pos.add('team-support'); pos.add('field-recovery');
    }
    if (role.toLowerCase().includes('damage') || role.toLowerCase().includes('burst') || role.toLowerCase().includes('sniper')) {
      pos.add('firepower'); pos.add('lethal');
    }
    if (role.toLowerCase().includes('craft') || role.toLowerCase().includes('repair') || role.toLowerCase().includes('engineer')) {
      pos.add('crafting'); pos.add('hardware');
    }
    if (role.toLowerCase().includes('meta') || role.toLowerCase().includes('psionic') || role.toLowerCase().includes('magic')) {
      pos.add('metaphysical'); pos.add('warp-attuned');
    }

    // Grounded negative railguards
    const neg = new Set();
    if (pos.has('frontline') || pos.has('tank') || pos.has('durability')) {
      neg.add('fragile'); neg.add('unarmored'); neg.add('timid'); neg.add('evasive-sniper');
    }
    if (pos.has('covert') || pos.has('infiltrator') || pos.has('stealth')) {
      neg.add('heavy-plating'); neg.add('blunt-assault'); neg.add('loud'); neg.add('clumsy');
    }
    if (pos.has('savant') || pos.has('intellect')) {
      neg.add('mindless-brute'); neg.add('reckless'); neg.add('illiterate');
    }
    if (pos.has('sentinel') || pos.has('order')) {
      neg.add('chaotic-anarchist'); neg.add('unreliable'); neg.add('reckless-gambler');
    }
    if (pos.has('visionary') || pos.has('leadership')) {
      neg.add('anti-social'); neg.add('mute'); neg.add('solitary-hermit');
    }
    if (pos.has('metaphysical') || pos.has('warp-attuned')) {
      neg.add('null-zone'); neg.add('anti-magic-fanatic');
    }
    if (neg.size === 0) {
      neg.add('incompetent'); neg.add('untrained'); neg.add('undisciplined');
    }

    const keywords = [...pos].slice(0, 7).join(', ');
    const negative_keywords = [...neg].slice(0, 5).join(', ');

    return {
      ...arch,
      keywords: arch.keywords && arch.keywords.trim() ? arch.keywords : keywords,
      negative_keywords: arch.negative_keywords && arch.negative_keywords.trim() ? arch.negative_keywords : negative_keywords
    };
  });

  const updatedJson = JSON.stringify(updatedArchetypes, null, 2);
  content = content.replace(/export const DEFAULT_ARCHETYPES = \[[\s\S]*?\];/, `export const DEFAULT_ARCHETYPES = ${updatedJson};`);
  fs.writeFileSync(archetypesPath, content, 'utf8');
  console.log(`Updated archetypesData.js with canonical keywords.`);

  // Update markdown files in src/data/omnicortex/archetypes
  if (fs.existsSync(mdDir)) {
    const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
    let mdUpdated = 0;
    for (const f of mdFiles) {
      const p = path.join(mdDir, f);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data.id || f.replace(/\.md$/, '');
      const matchArch = updatedArchetypes.find(a => a.id === id || a.id === `archetype-${id}` || `archetype-${f.replace(/\.md$/, '')}` === a.id);
      if (matchArch) {
        parsed.data.keywords = matchArch.keywords;
        parsed.data.negative_keywords = matchArch.negative_keywords;
        fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data), 'utf8');
        mdUpdated++;
      }
    }
    console.log(`Updated ${mdUpdated} archetype markdown files.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. ENRICH SKILLS (95 assets)
// ═══════════════════════════════════════════════════════════════════════════
function enrichSkills() {
  console.log('\n--- Enriching Skills ---');
  const skillsPath = path.join(rootDir, 'src/data/skillsData.js');
  const mdDir = path.join(rootDir, 'src/data/omnicortex/skills');

  let content = fs.readFileSync(skillsPath, 'utf8');
  const match = content.match(/export const DEFAULT_SKILLS = (\{[\s\S]*?\n\};)/);
  if (!match) {
    console.error('Could not locate DEFAULT_SKILLS in skillsData.js');
    return;
  }

  // Parse DEFAULT_SKILLS
  let defaultSkills;
  try {
    const cleaned = match[1].replace(/;\s*$/, '');
    defaultSkills = eval(`(${cleaned})`);
  } catch (err) {
    console.error('Error evaluating DEFAULT_SKILLS:', err.message);
    return;
  }

  let totalSkills = 0;
  for (const groupKey of Object.keys(defaultSkills)) {
    const sections = defaultSkills[groupKey];
    for (const sec of sections) {
      for (const skill of sec.skills) {
        totalSkills++;
        const name = skill.name || '';
        const grp = skill.group || groupKey;
        const attr = (skill.baseAttr || '').replace(/^attr-/, '');
        const desc = skill.description || '';

        const pos = new Set();
        pos.add(name.toLowerCase());
        pos.add(grp.toLowerCase());
        if (attr) pos.add(attr.toLowerCase());

        if (grp === 'physical') {
          pos.add('mobility'); pos.add('athletics'); pos.add('bodily-coordination');
        } else if (grp === 'mental') {
          pos.add('intellect'); pos.add('cognitive'); pos.add('expertise');
        } else if (grp === 'social') {
          pos.add('interaction'); pos.add('diplomacy'); pos.add('influence');
        } else if (grp === 'combat') {
          pos.add('tactical'); pos.add('offensive'); pos.add('defense');
        } else if (grp === 'meta') {
          pos.add('metafocus'); pos.add('psionic'); pos.add('resonance');
        }

        // Add tokens from description
        desc.toLowerCase().split(/[ ,.;()]+/).forEach(w => {
          if (w.length > 4 && !['general', 'using', 'resisting', 'prolonged', 'character'].includes(w)) {
            pos.add(w);
          }
        });

        // Negative railguards
        const neg = new Set();
        if (grp === 'physical') {
          neg.add('sedentary'); neg.add('paralyzed'); neg.add('clumsy');
        } else if (grp === 'mental') {
          neg.add('mindless'); neg.add('instinct-only'); neg.add('illiterate');
        } else if (grp === 'social') {
          neg.add('isolated'); neg.add('anti-social'); neg.add('inarticulate');
        } else if (grp === 'combat') {
          neg.add('pacifist'); neg.add('unarmed-civilian'); neg.add('helpless');
        } else if (grp === 'meta') {
          neg.add('mundane'); neg.add('anti-magic-field'); neg.add('unattuned');
        }

        skill.keywords = skill.keywords && skill.keywords.trim() ? skill.keywords : [...pos].slice(0, 6).join(', ');
        skill.negative_keywords = skill.negative_keywords && skill.negative_keywords.trim() ? skill.negative_keywords : [...neg].slice(0, 4).join(', ');
      }
    }
  }

  console.log(`Enriched ${totalSkills} skills.`);
  const updatedSkillsCode = `export const DEFAULT_SKILLS = ${JSON.stringify(defaultSkills, null, 2)};`;
  content = content.replace(/export const DEFAULT_SKILLS = \{[\s\S]*?\n\};/, updatedSkillsCode);
  fs.writeFileSync(skillsPath, content, 'utf8');
  console.log(`Updated skillsData.js successfully.`);

  // Update markdown files in src/data/omnicortex/skills
  if (fs.existsSync(mdDir)) {
    const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
    let mdUpdated = 0;
    for (const f of mdFiles) {
      const p = path.join(mdDir, f);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data.id || f.replace(/\.md$/, '');
      
      // Find matching skill
      let matchedSkill = null;
      for (const grp of Object.keys(defaultSkills)) {
        for (const sec of defaultSkills[grp]) {
          for (const s of sec.skills) {
            if (s.id === id || s.id === `skill-${id}` || id.endsWith(s.name.toLowerCase().replace(/\s+/g, '-'))) {
              matchedSkill = s;
              break;
            }
          }
          if (matchedSkill) break;
        }
        if (matchedSkill) break;
      }

      if (matchedSkill) {
        parsed.data.keywords = matchedSkill.keywords;
        parsed.data.negative_keywords = matchedSkill.negative_keywords;
        fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data), 'utf8');
        mdUpdated++;
      }
    }
    console.log(`Updated ${mdUpdated} skill markdown files.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. ENRICH FEATURES (234 assets)
// ═══════════════════════════════════════════════════════════════════════════
function enrichFeatures() {
  console.log('\n--- Enriching Features ---');
  const featuresPath = path.join(rootDir, 'src/data/featuresData.js');
  const mdDir = path.join(rootDir, 'src/data/omnicortex/features');

  let content = fs.readFileSync(featuresPath, 'utf8');
  const match = content.match(/export const DEFAULT_FEATURES = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not locate DEFAULT_FEATURES in featuresData.js');
    return;
  }

  let features;
  try {
    features = JSON.parse(match[1]);
  } catch (err) {
    console.error('Error parsing DEFAULT_FEATURES JSON:', err.message);
    return;
  }

  console.log(`Processing ${features.length} features...`);

  const updatedFeatures = features.map(feat => {
    const name = feat.name || '';
    const cat = feat.category || '';
    const desc = feat.description || feat.desc || '';
    const mechanic = feat.mechanic || feat.mechanics || '';

    const pos = new Set();
    pos.add(name.toLowerCase());
    pos.add(cat.toLowerCase());
    pos.add('special-feature');

    if (cat.toLowerCase().includes('combat')) {
      pos.add('combat-maneuver'); pos.add('tactical-edge');
    } else if (cat.toLowerCase().includes('ability')) {
      pos.add('innate-talent'); pos.add('passive-prowess');
    } else if (cat.toLowerCase().includes('discipline')) {
      pos.add('focused-training'); pos.add('mastery');
    } else if (cat.toLowerCase().includes('meta')) {
      pos.add('metafocus'); pos.add('supernatural-resonance');
    } else if (cat.toLowerCase().includes('social')) {
      pos.add('charisma-influence'); pos.add('courtly-presence');
    } else if (cat.toLowerCase().includes('physical')) {
      pos.add('biophysical-conditioning'); pos.add('endurance');
    }

    desc.toLowerCase().split(/[ ,.;()]+/).forEach(w => {
      if (w.length > 5 && !['character', 'saving', 'checks', 'against', 'effect'].includes(w)) {
        pos.add(w);
      }
    });

    const neg = new Set();
    if (cat.toLowerCase().includes('combat')) {
      neg.add('pacifist'); neg.add('feeble'); neg.add('untrained-civilian');
    } else if (cat.toLowerCase().includes('meta')) {
      neg.add('null-zone'); neg.add('magic-dead'); neg.add('anti-psionic');
    } else if (cat.toLowerCase().includes('social')) {
      neg.add('mute'); neg.add('feral-solitary'); neg.add('unsociable');
    } else {
      neg.add('incompetent'); neg.add('untrained'); neg.add('vulnerable');
    }

    const keywords = [...pos].slice(0, 6).join(', ');
    const negative_keywords = [...neg].slice(0, 4).join(', ');

    return {
      ...feat,
      keywords: feat.keywords && feat.keywords.trim() ? feat.keywords : keywords,
      negative_keywords: feat.negative_keywords && feat.negative_keywords.trim() ? feat.negative_keywords : negative_keywords
    };
  });

  const updatedJson = JSON.stringify(updatedFeatures, null, 2);
  content = content.replace(/export const DEFAULT_FEATURES = \[[\s\S]*?\];/, `export const DEFAULT_FEATURES = ${updatedJson};`);
  fs.writeFileSync(featuresPath, content, 'utf8');
  console.log(`Updated featuresData.js successfully.`);

  // Update markdown files in src/data/omnicortex/features
  if (fs.existsSync(mdDir)) {
    const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
    let mdUpdated = 0;
    for (const f of mdFiles) {
      const p = path.join(mdDir, f);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data.id || f.replace(/\.md$/, '');
      const matchFeat = updatedFeatures.find(feat => feat.id === id || feat.id === f.replace(/\.md$/, ''));
      if (matchFeat) {
        parsed.data.keywords = matchFeat.keywords;
        parsed.data.negative_keywords = matchFeat.negative_keywords;
        fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data), 'utf8');
        mdUpdated++;
      }
    }
    console.log(`Updated ${mdUpdated} feature markdown files.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. ENRICH DISADVANTAGES (34 assets)
// ═══════════════════════════════════════════════════════════════════════════
function enrichDisadvantages() {
  console.log('\n--- Enriching Disadvantages ---');
  const disadvPath = path.join(rootDir, 'src/data/speciesDisadvantagesData.js');
  const mdDir = path.join(rootDir, 'src/data/omnicortex/disadvantages');

  let content = fs.readFileSync(disadvPath, 'utf8');
  const match = content.match(/export const DEFAULT_SPECIES_DISADVANTAGES = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not locate DEFAULT_SPECIES_DISADVANTAGES in speciesDisadvantagesData.js');
    return;
  }

  let disadvantages;
  try {
    disadvantages = JSON.parse(match[1]);
  } catch (err) {
    console.error('Error parsing DEFAULT_SPECIES_DISADVANTAGES JSON:', err.message);
    return;
  }

  console.log(`Processing ${disadvantages.length} disadvantages...`);

  const updatedDisadvantages = disadvantages.map(dis => {
    const name = dis.name || '';
    const desc = dis.description || dis.desc || '';
    const type = dis.classification || dis.type || 'General';

    const pos = new Set();
    pos.add(name.toLowerCase());
    pos.add('hindrance');
    pos.add('penalty');
    pos.add(type.toLowerCase());

    desc.toLowerCase().split(/[ ,.;()]+/).forEach(w => {
      if (w.length > 5 && !['character', 'suffers', 'checks', 'inflicts'].includes(w)) {
        pos.add(w);
      }
    });

    const neg = new Set();
    neg.add('perfection');
    neg.add('flawless');
    neg.add('unyielding');
    neg.add('invulnerable');

    const keywords = [...pos].slice(0, 6).join(', ');
    const negative_keywords = [...neg].slice(0, 4).join(', ');

    return {
      ...dis,
      keywords: dis.keywords && dis.keywords.trim() ? dis.keywords : keywords,
      negative_keywords: dis.negative_keywords && dis.negative_keywords.trim() ? dis.negative_keywords : negative_keywords
    };
  });

  const updatedJson = JSON.stringify(updatedDisadvantages, null, 2);
  content = content.replace(/export const DEFAULT_SPECIES_DISADVANTAGES = \[[\s\S]*?\];/, `export const DEFAULT_SPECIES_DISADVANTAGES = ${updatedJson};`);
  fs.writeFileSync(disadvPath, content, 'utf8');
  console.log(`Updated speciesDisadvantagesData.js successfully.`);

  // Update markdown files in src/data/omnicortex/disadvantages
  if (fs.existsSync(mdDir)) {
    const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
    let mdUpdated = 0;
    for (const f of mdFiles) {
      const p = path.join(mdDir, f);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data.id || f.replace(/\.md$/, '');
      const matchDis = updatedDisadvantages.find(dis => dis.id === id || dis.id === `disadvantage-${id}` || f.replace(/\.md$/, '') === dis.id);
      if (matchDis) {
        parsed.data.keywords = matchDis.keywords;
        parsed.data.negative_keywords = matchDis.negative_keywords;
        fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data), 'utf8');
        mdUpdated++;
      }
    }
    console.log(`Updated ${mdUpdated} disadvantage markdown files.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. ENRICH PROPERTY: GEAR (42 items)
// ═══════════════════════════════════════════════════════════════════════════
function enrichGear() {
  console.log('\n--- Enriching Gear ---');
  const gearPath = path.join(rootDir, 'src/data/gearData.js');
  const mdDir = path.join(rootDir, 'src/data/omnicortex/gear');

  let content = fs.readFileSync(gearPath, 'utf8');
  const match = content.match(/export const DEFAULT_GEAR = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not locate DEFAULT_GEAR in gearData.js');
    return;
  }

  let gearList = JSON.parse(match[1]);
  console.log(`Processing ${gearList.length} gear items...`);

  const updatedGear = gearList.map(item => {
    const name = item.name || '';
    const desc = item.description || '';
    const mech = item.mechanic || '';
    const tl = item.tech_level ?? 3;

    const pos = new Set();
    pos.add(name.toLowerCase());
    pos.add('gear');
    pos.add('personal-property');
    pos.add(`tl-${tl}`);

    desc.toLowerCase().split(/[ ,.;()]+/).forEach(w => {
      if (w.length > 5 && !['designed', 'provides', 'capable', 'running'].includes(w)) {
        pos.add(w);
      }
    });

    const neg = new Set();
    neg.add('primitive-stone');
    neg.add('immaterial');
    neg.add('intangible');

    return {
      ...item,
      keywords: item.keywords && item.keywords.trim() ? item.keywords : [...pos].slice(0, 6).join(', '),
      negative_keywords: item.negative_keywords && item.negative_keywords.trim() ? item.negative_keywords : [...neg].slice(0, 4).join(', ')
    };
  });

  const updatedJson = JSON.stringify(updatedGear, null, 2);
  content = content.replace(/export const DEFAULT_GEAR = \[[\s\S]*?\];/, `export const DEFAULT_GEAR = ${updatedJson};`);
  fs.writeFileSync(gearPath, content, 'utf8');
  console.log(`Updated gearData.js successfully.`);

  if (fs.existsSync(mdDir)) {
    const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
    let mdUpdated = 0;
    for (const f of mdFiles) {
      const p = path.join(mdDir, f);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data.id || f.replace(/\.md$/, '');
      const matchItem = updatedGear.find(g => g.id === id);
      if (matchItem) {
        parsed.data.keywords = matchItem.keywords;
        parsed.data.negative_keywords = matchItem.negative_keywords;
        fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data), 'utf8');
        mdUpdated++;
      }
    }
    console.log(`Updated ${mdUpdated} gear markdown files.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. ENRICH PROPERTY: WEAPONRY (75 items)
// ═══════════════════════════════════════════════════════════════════════════
function enrichWeaponry() {
  console.log('\n--- Enriching Weaponry ---');
  const weaponPath = path.join(rootDir, 'src/data/weaponryData.js');
  const mdDir = path.join(rootDir, 'src/data/omnicortex/weaponry');

  let content = fs.readFileSync(weaponPath, 'utf8');
  const match = content.match(/export const DEFAULT_WEAPONRY = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not locate DEFAULT_WEAPONRY in weaponryData.js');
    return;
  }

  let weapons = JSON.parse(match[1]);
  console.log(`Processing ${weapons.length} weapons...`);

  const updatedWeapons = weapons.map(w => {
    const name = w.name || '';
    const dmgType = w.damage_type || 'Kinetic';
    const dmg = w.damage || '1d6';
    const range = w.range || '-';
    const tl = w.tech_level ?? 2;
    const body = w.body || '';

    const isMelee = range === '-' || body.includes('MELEE');
    const isRanged = !isMelee;

    const pos = new Set();
    pos.add(name.toLowerCase());
    pos.add('weapon');
    pos.add(isMelee ? 'melee' : 'ranged');
    pos.add(dmgType.toLowerCase());
    pos.add(`tl-${tl}`);

    if (isMelee) {
      pos.add('close-quarters'); pos.add('striking');
    } else {
      pos.add('firearms'); pos.add('ballistics');
    }

    const neg = new Set();
    if (isMelee) {
      neg.add('extreme-range'); neg.add('optical-laser-sniper'); neg.add('pacifist');
    } else {
      neg.add('grappling'); neg.add('clinch'); neg.add('unarmed');
    }

    return {
      ...w,
      keywords: w.keywords && w.keywords.trim() ? w.keywords : [...pos].slice(0, 6).join(', '),
      negative_keywords: w.negative_keywords && w.negative_keywords.trim() ? w.negative_keywords : [...neg].slice(0, 4).join(', ')
    };
  });

  const updatedJson = JSON.stringify(updatedWeapons, null, 2);
  content = content.replace(/export const DEFAULT_WEAPONRY = \[[\s\S]*?\];/, `export const DEFAULT_WEAPONRY = ${updatedJson};`);
  fs.writeFileSync(weaponPath, content, 'utf8');
  console.log(`Updated weaponryData.js successfully.`);

  if (fs.existsSync(mdDir)) {
    const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
    let mdUpdated = 0;
    for (const f of mdFiles) {
      const p = path.join(mdDir, f);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data.id || f.replace(/\.md$/, '');
      const matchW = updatedWeapons.find(w => w.id === id);
      if (matchW) {
        parsed.data.keywords = matchW.keywords;
        parsed.data.negative_keywords = matchW.negative_keywords;
        fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data), 'utf8');
        mdUpdated++;
      }
    }
    console.log(`Updated ${mdUpdated} weaponry markdown files.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. ENRICH PROPERTY: ARMORING (37 items)
// ═══════════════════════════════════════════════════════════════════════════
function enrichArmoring() {
  console.log('\n--- Enriching Armoring ---');
  const armorPath = path.join(rootDir, 'src/data/armoringData.js');
  const mdDir = path.join(rootDir, 'src/data/omnicortex/armoring');

  let content = fs.readFileSync(armorPath, 'utf8');
  const match = content.match(/export const DEFAULT_ARMORING = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not locate DEFAULT_ARMORING in armoringData.js');
    return;
  }

  let armors = JSON.parse(match[1]);
  console.log(`Processing ${armors.length} armor items...`);

  const updatedArmors = armors.map(a => {
    const name = a.name || '';
    const dr = a.dr ?? 10;
    const tl = a.tech_level ?? 3;
    const body = a.body || '';

    const isLight = body.includes('LIGHT') || dr < 10;
    const isMedium = body.includes('MEDIUM') || (dr >= 10 && dr < 20);
    const isHeavy = body.includes('HEAVY') || dr >= 20;

    const pos = new Set();
    pos.add(name.toLowerCase());
    pos.add('armor');
    pos.add('defense');
    pos.add(`dr-${dr}`);
    pos.add(isLight ? 'light-armor' : isMedium ? 'medium-armor' : 'heavy-armor');
    pos.add(`tl-${tl}`);

    const neg = new Set();
    neg.add('unarmored');
    neg.add('fragile');
    neg.add('naked');
    if (isHeavy) neg.add('high-acrobatics');

    return {
      ...a,
      keywords: a.keywords && a.keywords.trim() ? a.keywords : [...pos].slice(0, 6).join(', '),
      negative_keywords: a.negative_keywords && a.negative_keywords.trim() ? a.negative_keywords : [...neg].slice(0, 4).join(', ')
    };
  });

  const updatedJson = JSON.stringify(updatedArmors, null, 2);
  content = content.replace(/export const DEFAULT_ARMORING = \[[\s\S]*?\];/, `export const DEFAULT_ARMORING = ${updatedJson};`);
  fs.writeFileSync(armorPath, content, 'utf8');
  console.log(`Updated armoringData.js successfully.`);

  if (fs.existsSync(mdDir)) {
    const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
    let mdUpdated = 0;
    for (const f of mdFiles) {
      const p = path.join(mdDir, f);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data.id || f.replace(/\.md$/, '');
      const matchA = updatedArmors.find(a => a.id === id);
      if (matchA) {
        parsed.data.keywords = matchA.keywords;
        parsed.data.negative_keywords = matchA.negative_keywords;
        fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data), 'utf8');
        mdUpdated++;
      }
    }
    console.log(`Updated ${mdUpdated} armoring markdown files.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. ENRICH PROPERTY: AUGMENTATIONS (172 items)
// ═══════════════════════════════════════════════════════════════════════════
function enrichAugmentations() {
  console.log('\n--- Enriching Augmentations ---');
  const augPath = path.join(rootDir, 'src/data/augmentationsData.js');
  const mdDir = path.join(rootDir, 'src/data/omnicortex/augmentations');

  let content = fs.readFileSync(augPath, 'utf8');
  const match = content.match(/export const DEFAULT_AUGMENTATIONS = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not locate DEFAULT_AUGMENTATIONS in augmentationsData.js');
    return;
  }

  let augs = JSON.parse(match[1]);
  console.log(`Processing ${augs.length} augmentations...`);

  const updatedAugs = augs.map(aug => {
    const name = aug.name || '';
    const type = aug.augmentation_type || 'Cybernetic';
    const stage = aug.stage || 'Standard';
    const loc = aug.body_location || 'General';
    const tl = aug.tech_level ?? 3;
    const desc = aug.description || '';

    const pos = new Set();
    pos.add(name.toLowerCase());
    pos.add('augmentation');
    pos.add(type.toLowerCase());
    pos.add(stage.toLowerCase());
    pos.add(`tl-${tl}`);
    pos.add(loc.toLowerCase());

    desc.toLowerCase().split(/[ ,.;()]+/).forEach(w => {
      if (w.length > 5 && !['action', 'stacks', 'round', 'vitality'].includes(w)) {
        pos.add(w);
      }
    });

    const neg = new Set();
    neg.add('pure-organic-baseline');
    neg.add('unaugmented');
    neg.add('technophobe');
    neg.add('primitive');

    return {
      ...aug,
      keywords: aug.keywords && aug.keywords.trim() ? aug.keywords : [...pos].slice(0, 6).join(', '),
      negative_keywords: aug.negative_keywords && aug.negative_keywords.trim() ? aug.negative_keywords : [...neg].slice(0, 4).join(', ')
    };
  });

  const updatedJson = JSON.stringify(updatedAugs, null, 2);
  content = content.replace(/export const DEFAULT_AUGMENTATIONS = \[[\s\S]*?\];/, `export const DEFAULT_AUGMENTATIONS = ${updatedJson};`);
  fs.writeFileSync(augPath, content, 'utf8');
  console.log(`Updated augmentationsData.js successfully.`);

  if (fs.existsSync(mdDir)) {
    const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
    let mdUpdated = 0;
    for (const f of mdFiles) {
      const p = path.join(mdDir, f);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data.id || f.replace(/\.md$/, '');
      const matchAug = updatedAugs.find(a => a.id === id);
      if (matchAug) {
        parsed.data.keywords = matchAug.keywords;
        parsed.data.negative_keywords = matchAug.negative_keywords;
        fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data), 'utf8');
        mdUpdated++;
      }
    }
    console.log(`Updated ${mdUpdated} augmentation markdown files.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. ENRICH PROPERTY: MECHA (21 items)
// ═══════════════════════════════════════════════════════════════════════════
function enrichMecha() {
  console.log('\n--- Enriching Mecha ---');
  const mechaPath = path.join(rootDir, 'src/data/mechaData.js');
  const mdDir = path.join(rootDir, 'src/data/omnicortex/mecha');

  let content = fs.readFileSync(mechaPath, 'utf8');
  const match = content.match(/export const DEFAULT_MECHA = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not locate DEFAULT_MECHA in mechaData.js');
    return;
  }

  let mechaList = JSON.parse(match[1]);
  console.log(`Processing ${mechaList.length} mecha items...`);

  const updatedMecha = mechaList.map(m => {
    const name = m.name || '';
    const size = m.size || 'Large';
    const frame = m.frame || 'Walker';
    const tl = m.tech_level ?? 3;
    const desc = m.description || '';

    const pos = new Set();
    pos.add(name.toLowerCase());
    pos.add('mecha');
    pos.add('vehicle');
    pos.add(size.toLowerCase());
    pos.add(frame.toLowerCase());
    pos.add(`tl-${tl}`);

    desc.toLowerCase().split(/[ ,.;()]+/).forEach(w => {
      if (w.length > 5 && !['provides', 'moving', 'across'].includes(w)) {
        pos.add(w);
      }
    });

    const neg = new Set();
    neg.add('infantry-on-foot');
    neg.add('unarmored-civilian');
    neg.add('sub-microscopic');

    return {
      ...m,
      keywords: m.keywords && m.keywords.trim() ? m.keywords : [...pos].slice(0, 6).join(', '),
      negative_keywords: m.negative_keywords && m.negative_keywords.trim() ? m.negative_keywords : [...neg].slice(0, 4).join(', ')
    };
  });

  const updatedJson = JSON.stringify(updatedMecha, null, 2);
  content = content.replace(/export const DEFAULT_MECHA = \[[\s\S]*?\];/, `export const DEFAULT_MECHA = ${updatedJson};`);
  fs.writeFileSync(mechaPath, content, 'utf8');
  console.log(`Updated mechaData.js successfully.`);

  if (fs.existsSync(mdDir)) {
    const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
    let mdUpdated = 0;
    for (const f of mdFiles) {
      const p = path.join(mdDir, f);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data.id || f.replace(/\.md$/, '');
      const matchM = updatedMecha.find(m => m.id === id);
      if (matchM) {
        parsed.data.keywords = matchM.keywords;
        parsed.data.negative_keywords = matchM.negative_keywords;
        fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data), 'utf8');
        mdUpdated++;
      }
    }
    console.log(`Updated ${mdUpdated} mecha markdown files.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. ENRICH PROPERTY: ARCHITECTURE (20 items)
// ═══════════════════════════════════════════════════════════════════════════
function enrichArchitecture() {
  console.log('\n--- Enriching Architecture ---');
  const archPath = path.join(rootDir, 'src/data/architectureData.js');
  const mdDir = path.join(rootDir, 'src/data/omnicortex/architecture');

  let content = fs.readFileSync(archPath, 'utf8');
  const match = content.match(/export const DEFAULT_ARCHITECTURE = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not locate DEFAULT_ARCHITECTURE in architectureData.js');
    return;
  }

  let archList = JSON.parse(match[1]);
  console.log(`Processing ${archList.length} architecture items...`);

  const updatedArch = archList.map(a => {
    const name = a.name || '';
    const style = a.style || 'Standard';
    const tl = a.tech_level ?? 3;
    const desc = a.description || '';

    const pos = new Set();
    pos.add(name.toLowerCase());
    pos.add('architecture');
    pos.add('structure');
    pos.add(style.toLowerCase());
    pos.add(`tl-${tl}`);

    desc.toLowerCase().split(/[ ,.;()]+/).forEach(w => {
      if (w.length > 5 && !['designed', 'holding', 'module'].includes(w)) {
        pos.add(w);
      }
    });

    const neg = new Set();
    neg.add('mobile-infantry');
    neg.add('personal-weapon');
    neg.add('portable-trinket');

    return {
      ...a,
      keywords: a.keywords && a.keywords.trim() ? a.keywords : [...pos].slice(0, 6).join(', '),
      negative_keywords: a.negative_keywords && a.negative_keywords.trim() ? a.negative_keywords : [...neg].slice(0, 4).join(', ')
    };
  });

  const updatedJson = JSON.stringify(updatedArch, null, 2);
  content = content.replace(/export const DEFAULT_ARCHITECTURE = \[[\s\S]*?\];/, `export const DEFAULT_ARCHITECTURE = ${updatedJson};`);
  fs.writeFileSync(archPath, content, 'utf8');
  console.log(`Updated architectureData.js successfully.`);

  if (fs.existsSync(mdDir)) {
    const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md'));
    let mdUpdated = 0;
    for (const f of mdFiles) {
      const p = path.join(mdDir, f);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data.id || f.replace(/\.md$/, '');
      const matchA = updatedArch.find(a => a.id === id);
      if (matchA) {
        parsed.data.keywords = matchA.keywords;
        parsed.data.negative_keywords = matchA.negative_keywords;
        fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data), 'utf8');
        mdUpdated++;
      }
    }
    console.log(`Updated ${mdUpdated} architecture markdown files.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION PIPELINE
// ═══════════════════════════════════════════════════════════════════════════
export function runUniversalKeywordEnrichment() {
  console.log('Starting Universal Grounded Keyword Enrichment Pipeline...');
  enrichArchetypes();
  enrichSkills();
  enrichFeatures();
  enrichDisadvantages();
  enrichGear();
  enrichWeaponry();
  enrichArmoring();
  enrichAugmentations();
  enrichMecha();
  enrichArchitecture();
  console.log('\n Universal Grounded Keyword Enrichment Complete!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runUniversalKeywordEnrichment();
}
