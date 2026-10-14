import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const operatorDir = path.join(projectRoot, 'docs', 'game rules', 'operator');
const subFeaturesDir = path.join(operatorDir, 'features');
const mainFeaturesFile = path.join(operatorDir, '1.08 FEATURES.md');
const omniFeaturesDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'features');

const SUB_FILES = [
  { file: '1.08.AbilityFeatures.md', category: 'Ability', heading: 'ABILITY FEATURES' },
  { file: '1.08.CombatFeatures.md', category: 'Combat', heading: 'COMBAT FEATURES' },
  { file: '1.08.DisciplineFeatures.md', category: 'Discipline', heading: 'DISCIPLINE FEATURES' },
  { file: '1.08.GeneralFeatures.md', category: 'General', heading: 'GENERAL FEATURES' },
  { file: '1.08.KarmaFeatures.md', category: 'Karma', heading: 'KARMA FEATURES' },
  { file: '1.08.SkillFeatures.md', category: 'Skill', heading: 'SKILL FEATURES' },
  { file: '1.08.SpecialFeatures.md', category: 'Special', heading: 'SPECIAL FEATURES' }
];

function cleanTableLine(line) {
  if (!line.trim().startsWith('|') || line.includes('FEATURE NAME') || line.includes(':----')) {
    return line;
  }
  const parts = line.split('|');
  if (parts.length >= 5) {
    // parts[4] is SPECIAL / NOTES column
    let notesCell = parts[4]
      .replace(/&nbsp;/g, ' ')
      .replace(/\b\d{1,3}\b/g, '') // strip legacy row/page index numbers (e.g. 43, 128, 213)
      .replace(/\s+/g, ' ')
      .trim();
    parts[1] = ' ' + parts[1].replace(/&nbsp;/g, '').trim() + ' ';
    parts[2] = ' ' + parts[2].replace(/&nbsp;/g, '').trim() + ' ';
    parts[3] = ' ' + parts[3].replace(/&nbsp;/g, '').trim() + ' ';
    parts[4] = ' ' + notesCell + ' ';
    return parts.join('|');
  }
  return line;
}

function cleanMarkdownSubFile(rawText) {
  let text = rawText.replace(/\r\n/g, '\n');
  // Deduplicate repeated top # **...** headings
  text = text.replace(/^(#\s+\*\*[^*]+\*\*)\s*\n+\1/m, '$1');
  // Clean leading spaces before ## **Feature Name** and **Description:**
  text = text.replace(/^[ \t]+(##\s+\*\*.+?\*\*)[ \t]*$/gm, '$1');
  text = text.replace(/^[ \t]+(\*\*Description:\*\*)/gm, '$1');
  // Replace empty ### or ## lines (even if indented) with ---
  text = text.replace(/^[ \t]*#{2,4}[ \t]*(&nbsp;)?[ \t]*$/gm, '---');
  // Collapse consecutive --- dividers
  text = text.replace(/(?:^---\s*\n+){2,}/gm, '---\n\n');
  // Clean table rows
  text = text
    .split('\n')
    .map(cleanTableLine)
    .join('\n');
  // Collapse 3+ blank lines
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim() + '\n';
}

function parseFeaturesFromSubFile(cleanedText, category) {
  const regex = /^##\s+\*\*(.+?)\*\*\s*$/gm;
  const matches = [...cleanedText.matchAll(regex)];
  const features = [];

  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1].trim();
    if (name.toUpperCase().endsWith('FEATURES')) continue;

    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : cleanedText.length;
    let rawBlock = cleanedText.slice(start, end).trim();
    rawBlock = rawBlock.replace(/(?:\n---\s*)+$/g, '').trim();

    // Extract Description
    const descMatch = rawBlock.match(/\*\*Description:\*\*\s*([\s\S]*?)(?=\n\s*\*\s*\*\*|$)/i);
    const description = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim() : '';

    // Extract Prerequisite
    const prereqMatch = rawBlock.match(/\*\s*\*\*Prerequisite:\*\*\s*([^\n]+)/i);
    const prerequisites = prereqMatch ? prereqMatch[1].trim() : 'None';

    // Extract Benefit (including sub-bullets)
    const benefitMatch = rawBlock.match(/\*\s*\*\*Benefit:\*\*\s*([\s\S]*?)(?=\n\s*\*\s*\*\*(?:Normal|Special|Note):|$)/i);
    const benefit = benefitMatch ? benefitMatch[1].trim() : '';

    // Extract Normal
    const normalMatch = rawBlock.match(/\*\s*\*\*Normal:\*\*\s*([\s\S]*?)(?=\n\s*\*\s*\*\*(?:Special|Note):|$)/i);
    const normal = normalMatch ? normalMatch[1].trim() : '';

    // Extract Special & Note
    const specialMatch = rawBlock.match(/\*\s*\*\*Special:\*\*\s*([\s\S]*?)(?=\n\s*\*\s*\*\*Note:|$)/i);
    const noteMatch = rawBlock.match(/\*\s*\*\*Note:\*\*\s*([\s\S]*?)$/i);
    const specialParts = [];
    if (specialMatch && specialMatch[1].trim()) specialParts.push(specialMatch[1].trim());
    if (noteMatch && noteMatch[1].trim()) specialParts.push(`**Note:** ${noteMatch[1].trim()}`);
    const specialRules = specialParts.join('\n\n');

    const mechanicParts = [];
    if (benefit) mechanicParts.push(benefit);
    if (normal) mechanicParts.push(`**Normal:** ${normal}`);
    const mechanic = mechanicParts.join('\n\n');

    const fullText = `## **${name}**\n\n${rawBlock}`;

    features.push({
      name,
      category,
      description,
      prerequisites,
      benefit,
      normal,
      mechanic,
      specialRules,
      fullText
    });
  }

  return features;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeNameForMatch(name) {
  return name
    .toLowerCase()
    .replace(/[-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function run() {
  const allCanonicalFeatures = [];
  const detailSectionsForMainDoc = [];

  for (const sub of SUB_FILES) {
    const subPath = path.join(subFeaturesDir, sub.file);
    const raw = fs.readFileSync(subPath, 'utf8');
    const cleaned = cleanMarkdownSubFile(raw);
    fs.writeFileSync(subPath, cleaned, 'utf8');

    const parsed = parseFeaturesFromSubFile(cleaned, sub.category);
    console.log(`Parsed ${parsed.length} features from ${sub.file}`);
    allCanonicalFeatures.push(...parsed);

    // Extract everything from the first feature heading onwards for the main 1.08 FEATURES.md
    const firstFeatureIdx = cleaned.search(/^##\s+\*\*(?!.*FEATURES\*\*).+?\*\*/m);
    if (firstFeatureIdx !== -1) {
      const detailsBody = cleaned.slice(firstFeatureIdx).trim();
      detailSectionsForMainDoc.push(`# **${sub.heading} — DETAILED DESCRIPTIONS**\n\n${detailsBody}`);
    }
  }

  console.log(`Total canonical features parsed: ${allCanonicalFeatures.length}`);

  // Rebuild 1.08 FEATURES.md (Summary Tables + Directory Index + Full Unabridged Feature Descriptions)
  let mainRaw = fs.readFileSync(mainFeaturesFile, 'utf8').replace(/\r\n/g, '\n');
  // Cut at # **FEATURES DIRECTORY INDEX** so we can cleanly regenerate the index + full details
  const dirIdx = mainRaw.indexOf('# **FEATURES DIRECTORY INDEX**');
  let mainHeaderAndTables = dirIdx !== -1 ? mainRaw.slice(0, dirIdx).trim() : mainRaw.trim();

  // Fix triple # **FEATURES** header at top of 1.08 FEATURES.md
  mainHeaderAndTables = mainHeaderAndTables.replace(
    /^#\s+\*\*FEATURES\*\*\s*\n+#\s+\*\*FEATURES\*\*\s*\n+#\s+---\s*\n+#\s+\*\*FEATURES\*\*/m,
    '# **1.08 FEATURES**'
  );
  // Ensure Two-Weapon Fighting is present in COMBAT FEATURES summary table of 1.08 FEATURES.md
  if (!mainHeaderAndTables.includes('| **Two-Weapon Fighting**')) {
    mainHeaderAndTables = mainHeaderAndTables.replace(
      '| **Double Slice** | Two-Weapon Fighting | Add your Str bonus to off-hand damage rolls. |',
      '| **Two-Weapon Fighting** | Agi 2, Combat Skill 2 | Reduces off-hand penalties. | |\n| **Double Slice** | Two-Weapon Fighting | Add your Str bonus to off-hand damage rolls. |'
    );
  }
  // Clean table rows and empty headings in mainHeaderAndTables
  mainHeaderAndTables = mainHeaderAndTables
    .split('\n')
    .map(cleanTableLine)
    .join('\n')
    .replace(/^#{1,4}[ \t]*(&nbsp;)?[ \t]*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const directoryBlock = `---

# **FEATURES DIRECTORY INDEX**

Detailed feature rules, prerequisites, and mechanical descriptions are organized by category below and in the \`./features/\` sub-directory:

* **[Ability Features](./features/1.08.AbilityFeatures.md)** — *Enhancements to base attributes, saving throws, and physical/mental resistance (16 Features)*
* **[Combat Features](./features/1.08.CombatFeatures.md)** — *Tactical maneuvers, weapon mastery, two-weapon fighting, and defensive techniques (45 Features)*
* **[Discipline Features](./features/1.08.DisciplineFeatures.md)** — *Awakening, centering, metaphysical empowerment, and focus mastery (16 Features)*
* **[General Features](./features/1.08.GeneralFeatures.md)** — *Social benefits, physical conditioning, cognitive traits, and universal enhancements (59 Features)*
* **[Karma Features](./features/1.08.KarmaFeatures.md)** — *Luck manipulation, faith-based blessings, initiative seizing, and heroic surges (10 Features)*
* **[Skill Features](./features/1.08.SkillFeatures.md)** — *Vocational aptitudes, specialized training, and multi-skill bonuses (49 Features)*
* **[Special Features](./features/1.08.SpecialFeatures.md)** — *Sensory enhancements, cybernetic/biotech augmentations, companions, and innate traits (34 Features)*`;

  const fullMainContent = `${mainHeaderAndTables}\n\n${directoryBlock}\n\n---\n\n${detailSectionsForMainDoc.join('\n\n---\n\n')}\n`;
  fs.writeFileSync(mainFeaturesFile, fullMainContent, 'utf8');
  console.log(`Updated ${mainFeaturesFile} (${fullMainContent.length} bytes)`);

  // Now update src/data/omnicortex/features/*.md
  const omniFiles = fs.readdirSync(omniFeaturesDir).filter(f => f.endsWith('.md'));
  const omniByNormName = new Map();
  for (const file of omniFiles) {
    const fullPath = path.join(omniFeaturesDir, file);
    const parsed = matter(fs.readFileSync(fullPath, 'utf8'));
    const name = (parsed.data.name || parsed.data.title || '').trim();
    if (name) {
      omniByNormName.set(normalizeNameForMatch(name), { file, fullPath, parsed });
    }
  }

  let updatedCount = 0;
  let createdCount = 0;

  for (const cf of allCanonicalFeatures) {
    const norm = normalizeNameForMatch(cf.name);
    let existing = omniByNormName.get(norm);

    const isRanked =
      /\bRanked\b/i.test(cf.specialRules) ||
      /\bRank\s+1\b/i.test(cf.benefit) ||
      Boolean(existing?.parsed?.data?.is_ranked);
    const isMultiple =
      /\[Multiple\]|\bMultiple\b|\bdifferent\s+(?:skill|weapon|sense|discipline|option)/i.test(cf.specialRules) ||
      Boolean(existing?.parsed?.data?.is_multiple);

    const frontmatter = existing ? { ...existing.parsed.data } : {
      id: `${cf.category.toLowerCase()}-${slugify(cf.name)}`,
      name: cf.name,
      category: 'features',
      feature_category: cf.category,
      cost_bp: 3,
      cost_cp: 3,
      costs: { cp: 3, bp: 3 },
      is_ranked: isRanked,
      is_multiple: isMultiple,
      prerequisites: cf.prerequisites,
      modifiers: [],
      keywords: `${cf.name.toLowerCase()}, ${cf.category.toLowerCase()}, feature`,
      negative_keywords: 'incompetent, untrained, vulnerable'
    };

    frontmatter.name = cf.name;
    frontmatter.category = 'features';
    frontmatter.feature_category = cf.category;
    frontmatter.is_ranked = isRanked;
    frontmatter.is_multiple = isMultiple;
    frontmatter.prerequisites = cf.prerequisites || 'None';
    frontmatter.description = cf.description;
    frontmatter.mechanic = cf.mechanic;
    if (cf.specialRules) {
      frontmatter.rules = cf.specialRules;
    } else {
      delete frontmatter.rules;
      delete frontmatter.special_rules;
    }

    const bodySections = [
      `# ${cf.name}`,
      '',
      `**Category**: ${cf.category} Features  `,
      `**Cost**: ${frontmatter.cost_cp || 3} CP (2 CP if Suggested Feature, minimum 1 CP)  `,
      `**Prerequisite**: ${cf.prerequisites || 'None'}`,
      '',
      `## Description`,
      cf.description || cf.benefit,
      '',
      `## Mechanics & Benefit`,
      cf.benefit || cf.description
    ];

    if (cf.normal) {
      bodySections.push('', '## Normal', cf.normal);
    }
    if (cf.specialRules) {
      bodySections.push('', '## Special Rules', cf.specialRules);
    }

    const newFileContent = matter.stringify(bodySections.join('\n') + '\n', frontmatter);
    const targetPath = existing
      ? existing.fullPath
      : path.join(omniFeaturesDir, `${cf.category.toLowerCase()}-${slugify(cf.name)}.md`);

    fs.writeFileSync(targetPath, newFileContent, 'utf8');
    if (existing) updatedCount++;
    else createdCount++;

    // Special case: "Natural Leader" in 1.08.GeneralFeatures.md is listed as "Born Leader" in the summary table
    if (cf.name === 'Natural Leader') {
      const bornLeaderPath = path.join(omniFeaturesDir, 'general-born-leader.md');
      const bornFm = {
        ...frontmatter,
        id: 'general-born-leader',
        name: 'Born Leader',
        feature_category: 'General'
      };
      const bornBody = bodySections.join('\n').replace(/^# Natural Leader/, '# Born Leader') + '\n';
      fs.writeFileSync(bornLeaderPath, matter.stringify(bornBody, bornFm), 'utf8');
      const wrongCombatPath = path.join(omniFeaturesDir, 'combat-natural-leader.md');
      const rightGeneralPath = path.join(omniFeaturesDir, 'general-natural-leader.md');
      if (fs.existsSync(wrongCombatPath) && targetPath === wrongCombatPath) {
        fs.unlinkSync(wrongCombatPath);
        frontmatter.id = 'general-natural-leader';
        fs.writeFileSync(rightGeneralPath, matter.stringify(bodySections.join('\n') + '\n', frontmatter), 'utf8');
      }
    }
  }

  // Also clean any remaining non-1.08 omni files (normalize category casing & strip page-number rules if any)
  for (const file of fs.readdirSync(omniFeaturesDir).filter(f => f.endsWith('.md'))) {
    const fullPath = path.join(omniFeaturesDir, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(raw);
    let changed = false;
    if (parsed.data.feature_category && /^[a-z]/.test(parsed.data.feature_category)) {
      parsed.data.feature_category =
        parsed.data.feature_category.charAt(0).toUpperCase() + parsed.data.feature_category.slice(1);
      changed = true;
    }
    let body = parsed.content;
    if (/## Special Rules\s*\n\s*\d+\s*(?:\n|$)/.test(body)) {
      body = body.replace(/## Special Rules\s*\n\s*\d+\s*(?:\n|$)/g, '');
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(fullPath, matter.stringify(body.trim() + '\n', parsed.data), 'utf8');
    }
  }

  console.log(`Updated ${updatedCount} existing omnicortex feature files, created ${createdCount} new feature files.`);
}

run();
