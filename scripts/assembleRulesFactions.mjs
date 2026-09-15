import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const majorPath = path.join(projectRoot, 'docs', 'MAJOR Factions.md');
const minorPath = path.join(projectRoot, 'docs', 'MINOR Factions.md');
const targetPath = path.join(projectRoot, 'docs', 'game rules', 'operator', '1.04 FACTIONS.md');

let majorContent = fs.readFileSync(majorPath, 'utf8');
let minorContent = fs.readFileSync(minorPath, 'utf8');

// Strip out existing top title from majorContent if present
majorContent = majorContent.replace(/^#\s*\*\*UNIFIED FACTION MASTER ARCHIVE\*\*[\r\n]*/im, '');
majorContent = majorContent.replace(/^##\s*\*\*INTRODUCTION: FACTIONS IN TANGENT\*\*[\r\n]*/im, '');
// Strip introductory paragraph if duplicate
majorContent = majorContent.replace(/^Factions in Tangent represent[\s\S]*?enhancing their capabilities\.[\r\n]*/im, '');

const header = `# 1.04 FACTIONS & GALACTIC POLITIES

Factions in Tangent represent the various organizations, groups, or affiliations that a character might be associated with. These factions provide a sense of belonging, shared goals, and access to resources and opportunities. They shape a character's worldview, influence their actions, and define geopolitical allegiances across the galaxy.

## Mechanical Benefits of Faction Allegiance

* **Faction Skill Package (20 Skill Points):** Players receive **20 POINTS FOR SKILLS** associated with their chosen faction, allowing for focused development of expertise relevant to their background and training.
* **Recommended Features (1 BP Discount):** Players can select **Recommended Features** from a curated list tailored to their faction at a **1 BP discount** (2 BP instead of 3 BP), further enhancing their capabilities.
* **Sociological Standing:** Pre-established diplomatic recognition, citizenship, legal status, and faction equipment access.

---

`;

const combined = header + majorContent.trim() + '\n\n---\n\n' + minorContent.trim() + '\n';
fs.writeFileSync(targetPath, combined, 'utf8');
console.log(`Successfully wrote combined 1.04 FACTIONS.md (${combined.length} chars, ${combined.split('\n').length} lines) to: ${targetPath}`);
