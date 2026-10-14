import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_SKILLS, ALL_CANONICAL_SKILLS } from '../src/data/skillsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const skillsDocPath = path.join(projectRoot, 'docs', 'game rules', 'operator', '1.07 SKILLS.md');
const skillsDataPath = path.join(projectRoot, 'src', 'data', 'skillsData.js');
const omnicortexSkillsDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'skills');

const fullMarkdown = fs.readFileSync(skillsDocPath, 'utf8');

/**
 * Extracts the markdown section for a given skill from 1.07 SKILLS.md
 */
function findSkillSection(skill) {
  const name = skill.name.trim();
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Heading patterns in 1.07 SKILLS.md:
  // ## **Acrobatics**
  // ### **APPRAISAL**
  // ### **ATTUNE (The Channel)**
  // ### **SUMMONING FOCUS**
  const headingCandidates = [
    new RegExp(`^\\s*#{2,4}\\s+\\*\\*${escapedName}(?:\\s*\\([^)]*\\))?\\*\\*\\s*$`, 'im'),
    new RegExp(`^\\s*#{2,4}\\s+\\*\\*${escapedName}\\s+FOCUS\\*\\*\\s*$`, 'im'),
    new RegExp(`^\\s*#{2,4}\\s+${escapedName}\\s*$`, 'im')
  ];

  // Start searching after "# **PHYSICAL SKILLS**" so we don't match summary tables
  const bodyStartIdx = fullMarkdown.indexOf('# **PHYSICAL SKILLS**');
  const searchRegion = bodyStartIdx !== -1 ? fullMarkdown.slice(bodyStartIdx) : fullMarkdown;

  let match = null;
  for (const re of headingCandidates) {
    const m = re.exec(searchRegion);
    if (m) {
      match = m;
      break;
    }
  }

  if (!match) {
    return null;
  }

  const startOffset = match.index;
  const headingLine = match[0].trim();
  const headingHashes = (headingLine.match(/^#+/) || ['##'])[0].length;

  const afterStart = searchRegion.slice(startOffset + match[0].length);
  // Find next heading of same or higher level (excluding empty "## " spacer lines)
  const nextHeadingRe = new RegExp(`^\\s*#{1,${headingHashes}}\\s+\\*\\*[^*]+\\*\\*`, 'm');
  const nextMatch = nextHeadingRe.exec(afterStart);

  const rawSection = nextMatch
    ? searchRegion.slice(startOffset, startOffset + match[0].length + nextMatch.index)
    : searchRegion.slice(startOffset);

  return rawSection.trim();
}

function parseSkillSection(rawSection, fallbackSkill) {
  if (!rawSection) {
    return {
      governing_attribute: fallbackSkill.governing_attribute || '',
      description: fallbackSkill.description || '',
      mechanic: fallbackSkill.mechanic || '',
      specialty_details: (fallbackSkill.specialties || []).map(s => ({ name: s, description: '' })),
      full_text: fallbackSkill.description || ''
    };
  }

  const lines = rawSection.split(/\r?\n/);
  let ability = '';
  let descriptionParts = [];
  let mechanicsLines = [];
  let specialtyLines = [];
  let mode = null;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line || /^#{1,4}\s*$/.test(line) || line === '---') continue;

    const abilityMatch = line.match(/^\*\s*\*\*(?:Ability|Primary Attribute):\*\*\s*(.+)$/i);
    if (abilityMatch) {
      ability = abilityMatch[1].replace(/\\([+-])/g, '$1').trim();
      mode = 'ability';
      continue;
    }

    const focusMatch = line.match(/^\*\s*\*\*Focus:\*\*\s*(.+)$/i);
    if (focusMatch && !descriptionParts.length) {
      descriptionParts.push(`Focus: ${focusMatch[1].trim()}`);
      mode = 'description';
      continue;
    }

    const descMatch = line.match(/^\*\s*\*\*Description:\*\*\s*(.+)$/i);
    if (descMatch) {
      descriptionParts.push(descMatch[1].replace(/\\([+-])/g, '$1').trim());
      mode = 'description';
      continue;
    }

    const roleMatch = line.match(/^\*\s*\*\*Role:\*\*\s*(.+)$/i);
    if (roleMatch) {
      descriptionParts.push(roleMatch[1].replace(/\\([+-])/g, '$1').trim());
      mode = 'description';
      continue;
    }

    const mechMatch = line.match(/^\*\s*\*\*Mechanics:\*\*\s*(.*)$/i);
    if (mechMatch) {
      if (mechMatch[1].trim()) {
        mechanicsLines.push(mechMatch[1].replace(/\\([+-])/g, '$1').trim());
      }
      mode = 'mechanics';
      continue;
    }

    const funcMatch = line.match(/^\*\s*\*\*Function:\*\*\s*(.+)$/i);
    if (funcMatch) {
      mechanicsLines.push(`Function: ${funcMatch[1].replace(/\\([+-])/g, '$1').trim()}`);
      mode = 'mechanics';
      continue;
    }

    const checkMatch = line.match(/^\*\s*\*\*Check:\*\*\s*(.+)$/i);
    if (checkMatch) {
      mechanicsLines.push(`Check: ${checkMatch[1].replace(/\\([+-])/g, '$1').trim()}`);
      mode = 'mechanics';
      continue;
    }

    const overloadMatch = line.match(/^\*\s*\*\*Overload:\*\*\s*(.+)$/i);
    if (overloadMatch) {
      mechanicsLines.push(`Overload: ${overloadMatch[1].replace(/\\([+-])/g, '$1').trim()}`);
      mode = 'mechanics';
      continue;
    }

    const specMatch = line.match(/^\*\s*\*\*Specialties:\*\*\s*(.*)$/i);
    if (specMatch) {
      if (specMatch[1].trim()) {
        specialtyLines.push(specMatch[1].replace(/\\([+-])/g, '$1').trim());
      }
      mode = 'specialties';
      continue;
    }

    if (mode === 'description') {
      descriptionParts.push(line.replace(/\\([+-])/g, '$1'));
    } else if (mode === 'mechanics') {
      mechanicsLines.push(line.replace(/^\*\s*/, '• ').replace(/\\([+-])/g, '$1'));
    } else if (mode === 'specialties') {
      specialtyLines.push(line.replace(/^\*\s*/, '').replace(/\\([+-])/g, '$1'));
    }
  }

  const parsedSpecialties = specialtyLines
    .map(l => {
      const m = l.match(/^\*\*([^*]+?):?\*\*:?\s*(.*)$/);
      if (m) {
        return {
          name: m[1].replace(/:$/, '').trim(),
          description: m[2].trim()
        };
      }
      return { name: l.replace(/^\•\s*/, '').trim(), description: '' };
    })
    .filter(s => s.name);

  const cleanDescription = descriptionParts.join(' ').trim() || fallbackSkill.description || '';

  const formattedSpecialtiesBlock = parsedSpecialties.length > 0
    ? parsedSpecialties
        .map(s => (s.description ? `• ${s.name}: ${s.description}` : `• ${s.name}`))
        .join('\n')
    : '';

  const combinedMechanic = [
    ability ? `Governing Ability: ${ability}` : '',
    mechanicsLines.length > 0 ? `Mechanics:\n${mechanicsLines.join('\n')}` : '',
    formattedSpecialtiesBlock ? `Specialties:\n${formattedSpecialtiesBlock}` : ''
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    governing_attribute: ability || fallbackSkill.governing_attribute || '',
    description: cleanDescription,
    mechanic: combinedMechanic,
    specialty_details: parsedSpecialties,
    specialties: parsedSpecialties.length > 0 ? parsedSpecialties.map(s => s.name) : (fallbackSkill.specialties || []),
    full_text: rawSection
  };
}

let matchedCount = 0;

for (const groupKey of Object.keys(DEFAULT_SKILLS)) {
  for (const subgroup of DEFAULT_SKILLS[groupKey]) {
    for (const skill of subgroup.skills) {
      const rawSection = findSkillSection(skill);
      if (rawSection) {
        matchedCount++;
        const parsed = parseSkillSection(rawSection, skill);
        skill.governing_attribute = parsed.governing_attribute;
        skill.description = parsed.description;
        skill.mechanic = parsed.mechanic;
        skill.specialties = parsed.specialties;
        skill.specialty_details = parsed.specialty_details;
        skill.full_text = parsed.full_text;
      } else {
        // Fallback for skills like Endurance or Arcane if not a dedicated heading in 1.07 SKILLS.md
        const attrLabel = (skill.baseAttr || 'attr-intellect').replace('attr-', '');
        const capAttr = attrLabel.charAt(0).toUpperCase() + attrLabel.slice(1);
        skill.governing_attribute = skill.governing_attribute || capAttr;
        skill.mechanic = skill.mechanic || `Governing Ability: ${capAttr}\n\nSpecialties:\n${(skill.specialties || []).map(s => `• ${s}`).join('\n')}`;
        skill.full_text = skill.full_text || `## **${skill.name}**\n\n* **Ability:** ${capAttr}\n* **Description:** ${skill.description}`;
      }
    }
  }
}

console.log(`Matched and enriched ${matchedCount} / ${ALL_CANONICAL_SKILLS.length} skills from 1.07 SKILLS.md.`);

// Rewrite src/data/skillsData.js preserving all exports and helper functions
const currentSkillsFile = fs.readFileSync(skillsDataPath, 'utf8');
const exportDefaultIdx = currentSkillsFile.indexOf('export const DEFAULT_SKILLS =');
const afterDefaultSkillsIdx = currentSkillsFile.indexOf('export const METAPHYSICAL_DISCIPLINES');

if (exportDefaultIdx === -1 || afterDefaultSkillsIdx === -1) {
  throw new Error('Could not locate DEFAULT_SKILLS boundaries in src/data/skillsData.js');
}

const newDefaultSkillsBlock = `export const DEFAULT_SKILLS = ${JSON.stringify(DEFAULT_SKILLS, null, 2)};\n\n/**\n * Canonical 6 Metaphysical Disciplines and their associated skills\n */\n`;
let updatedSkillsFile =
  currentSkillsFile.slice(0, exportDefaultIdx) +
  newDefaultSkillsBlock +
  currentSkillsFile.slice(afterDefaultSkillsIdx);

// Also ensure getEnrichedSkillData preserves mechanic, governing_attribute, specialty_details, and full_text
updatedSkillsFile = updatedSkillsFile.replace(
  'description: skill.description || canonical?.description || \'\',',
  `description: canonical?.description || skill.description || '',
    governing_attribute: canonical?.governing_attribute || skill.governing_attribute || '',
    mechanic: canonical?.mechanic || skill.mechanic || '',
    specialty_details: canonical?.specialty_details || skill.specialty_details || [],
    full_text: canonical?.full_text || skill.full_text || '',`
);

fs.writeFileSync(skillsDataPath, updatedSkillsFile, 'utf8');
console.log(`Updated ${skillsDataPath} (${(fs.statSync(skillsDataPath).size / 1024).toFixed(1)} KB)`);

// Also update all 95 markdown files in src/data/omnicortex/skills/*.md
for (const groupKey of Object.keys(DEFAULT_SKILLS)) {
  for (const subgroup of DEFAULT_SKILLS[groupKey]) {
    for (const skill of subgroup.skills) {
      const mdPath = path.join(omnicortexSkillsDir, `${skill.id}.md`);
      const specYaml = (skill.specialty_details && skill.specialty_details.length > 0)
        ? skill.specialty_details.map(s => `  - "${(s.description ? `${s.name}: ${s.description}` : s.name).replace(/"/g, '\\"')}"`).join('\n')
        : (skill.specialties || []).map(s => `  - "${s.replace(/"/g, '\\"')}"`).join('\n');

      const mdContent = `---
id: ${skill.id}
name: "${skill.name.replace(/"/g, '\\"')}"
type: ${skill.group}
subtype: "${(subgroup.title || 'general').toLowerCase()}"
category: skills
governing_attribute: "${(skill.governing_attribute || '').replace(/"/g, '\\"')}"
description: "${(skill.description || '').replace(/"/g, '\\"')}"
specialties:
${specYaml || '  []'}
keywords: "${(skill.keywords || '').replace(/"/g, '\\"')}"
negative_keywords: "${(skill.negative_keywords || '').replace(/"/g, '\\"')}"
---

${skill.full_text || `# ${skill.name}\n\n${skill.description}`}
`;
      fs.writeFileSync(mdPath, mdContent, 'utf8');
    }
  }
}
console.log(`Updated all markdown files in ${omnicortexSkillsDir}`);
