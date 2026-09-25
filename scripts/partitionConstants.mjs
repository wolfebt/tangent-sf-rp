import fs from 'fs';
import path from 'path';

const SRC_FILE = 'src/engines/tangentConstants.js';
const CONST_DIR = 'src/constants';

if (!fs.existsSync(CONST_DIR)) {
  fs.mkdirSync(CONST_DIR, { recursive: true });
}

const lines = fs.readFileSync(SRC_FILE, 'utf8').split('\n');

// Line slices (0-indexed)
// 1. attributes: 0 to 315
// 2. equipment: 315 to 923
// 3. vehicles: 1265 to 1538
// 4. species: 1538 to 2067
// 5. worldbuilding: 2067 to 2515, plus 2772 to end
// 6. combat: 923 to 1265, plus 2515 to 2772

const attributesCode = lines.slice(0, 315).join('\n');
const equipmentCode = lines.slice(315, 923).join('\n');
const vehiclesCode = lines.slice(1265, 1538).join('\n');
const speciesCode = lines.slice(1538, 2067).join('\n');

const combatPart1 = lines.slice(923, 1265).join('\n');
const combatPart2 = lines.slice(2515, 2772).join('\n');
const combatCode = `${combatPart1}\n\n${combatPart2}`;

const worldPart1 = lines.slice(2067, 2515).join('\n');
const worldPart2 = lines.slice(2772).join('\n');
const worldbuildingCode = `${worldPart1}\n\n${worldPart2}`;

fs.writeFileSync(path.join(CONST_DIR, 'attributes.js'), attributesCode.trim() + '\n', 'utf8');
fs.writeFileSync(path.join(CONST_DIR, 'equipment.js'), equipmentCode.trim() + '\n', 'utf8');
fs.writeFileSync(path.join(CONST_DIR, 'vehicles.js'), vehiclesCode.trim() + '\n', 'utf8');
fs.writeFileSync(path.join(CONST_DIR, 'species.js'), speciesCode.trim() + '\n', 'utf8');
fs.writeFileSync(path.join(CONST_DIR, 'combat.js'), combatCode.trim() + '\n', 'utf8');
fs.writeFileSync(path.join(CONST_DIR, 'worldbuilding.js'), worldbuildingCode.trim() + '\n', 'utf8');

const barrel = `// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — CONSTANTS BARREL EXPORT
// ═══════════════════════════════════════════════════════════

export * from './attributes.js';
export * from './equipment.js';
export * from './vehicles.js';
export * from './species.js';
export * from './combat.js';
export * from './worldbuilding.js';
`;

fs.writeFileSync(path.join(CONST_DIR, 'index.js'), barrel, 'utf8');

console.log('Partitioned constants written successfully to', CONST_DIR);
