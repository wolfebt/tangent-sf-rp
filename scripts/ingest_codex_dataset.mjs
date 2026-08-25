/**
 * ════════════════════════════════════════════════════════════════════════════════
 * CLI DATASET INGESTION TOOL — TANGENT SF RP / CODEX
 * Usage:
 *   node scripts/ingest_codex_dataset.mjs --category=species --file=./data/raw_species.json
 *   node scripts/ingest_codex_dataset.mjs --category=weaponry --file=./data/raw_weapons.json --dry-run
 * ════════════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { OMNICORTEX_DATASETS, getDatasetByKey, validateDatasetPayload } from '../src/pages/Codex/codexPromptRegistry.js';
import { adaptSparkItemToFirestore, sanitizeDocumentId } from '../src/utils/codexIngestionAdapters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI Arguments
const args = process.argv.slice(2);
let categoryArg = null;
let fileArg = null;
let dryRun = false;
let strategy = 'merge'; // 'merge' | 'overwrite' | 'skip'

args.forEach(arg => {
  if (arg.startsWith('--category=')) {
    categoryArg = arg.split('=')[1].trim().toLowerCase();
  } else if (arg.startsWith('--file=')) {
    fileArg = arg.split('=')[1].trim();
  } else if (arg.startsWith('--strategy=')) {
    strategy = arg.split('=')[1].trim().toLowerCase();
  } else if (arg === '--dry-run') {
    dryRun = true;
  }
});

function printUsageAndExit() {
  console.log('\n===============================================================');
  console.log('  OMNICORTEX DATASET INGESTION CLI');
  console.log('===============================================================');
  console.log('Usage: node scripts/ingest_codex_dataset.mjs --category=<dataset> --file=<path_to_json> [--dry-run] [--strategy=merge|overwrite|skip]\n');
  console.log('Available Datasets:');
  OMNICORTEX_DATASETS.forEach(d => {
    console.log(`  - ${d.key.padEnd(16)} (${d.code}): ${d.label} -> [Collection: ${d.targetCollection}]`);
  });
  console.log('\nExample:');
  console.log('  node scripts/ingest_codex_dataset.mjs --category=species --file=./data/raw_species.json --dry-run\n');
  process.exit(1);
}

if (!categoryArg || !fileArg) {
  printUsageAndExit();
}

const dataset = getDatasetByKey(categoryArg);
if (!dataset) {
  console.error(`\n[Error] Invalid category "${categoryArg}".`);
  printUsageAndExit();
}

const filePath = path.resolve(process.cwd(), fileArg);
if (!fs.existsSync(filePath)) {
  console.error(`\n[Error] Input file not found: ${filePath}`);
  process.exit(1);
}

console.log('===============================================================');
console.log(`  STARTING INGESTION FOR: ${dataset.code} - ${dataset.label.toUpperCase()}`);
console.log(`  Target Collection: ${dataset.targetCollection}`);
console.log(`  Input File:        ${filePath}`);
console.log(`  Dry Run Mode:      ${dryRun ? 'YES (Validation Only)' : 'NO (Writing Files)'}`);
console.log(`  Conflict Strategy: ${strategy.toUpperCase()}`);
console.log('===============================================================\n');

let rawData;
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  rawData = JSON.parse(fileContent);
} catch (err) {
  console.error(`[Error] Failed to read or parse JSON file: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(rawData)) {
  console.error('[Error] Input JSON must be an array of objects.');
  process.exit(1);
}

// 1. Schema Validation Pass
console.log(`Validating ${rawData.length} items against schema...`);
const validationReport = validateDatasetPayload(categoryArg, rawData);

if (!validationReport.isValid) {
  console.error('\n❌ Schema Validation Failed:');
  validationReport.errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}

if (validationReport.warnings.length > 0) {
  console.warn(`\n⚠️  ${validationReport.warnings.length} Warnings:`);
  validationReport.warnings.slice(0, 5).forEach(w => console.warn(`  - ${w}`));
  if (validationReport.warnings.length > 5) {
    console.warn(`  ... and ${validationReport.warnings.length - 5} more warnings.`);
  }
}

console.log(`\n✅ Schema validation passed! Valid items: ${validationReport.validCount}/${rawData.length}\n`);

// 2. Adaptation & File System Ingestion Pass
const targetDir = path.resolve(__dirname, `../src/data/omnicortex/${dataset.targetCollection}`);
if (!fs.existsSync(targetDir) && !dryRun) {
  fs.mkdirSync(targetDir, { recursive: true });
}

let createdCount = 0;
let updatedCount = 0;
let skippedCount = 0;

rawData.forEach((rawItem, index) => {
  const adapted = adaptSparkItemToFirestore(categoryArg, rawItem);
  if (!adapted) return;

  const docId = adapted.id || sanitizeDocumentId(adapted.name);
  const targetFile = path.join(targetDir, `${docId}.md`);
  const exists = fs.existsSync(targetFile);

  if (exists && strategy === 'skip') {
    skippedCount++;
    console.log(`  [SKIP] #${index + 1}: ${adapted.name} (${docId}.md already exists)`);
    return;
  }

  let finalItem = { ...adapted };
  if (exists && strategy === 'merge') {
    try {
      const existingContent = fs.readFileSync(targetFile, 'utf8');
      const existingParsed = matter(existingContent);
      finalItem = { ...existingParsed.data, ...adapted, id: docId };
      updatedCount++;
      console.log(`  [MERGE] #${index + 1}: ${adapted.name} -> ${docId}.md`);
    } catch (e) {
      finalItem = adapted;
      updatedCount++;
      console.log(`  [UPDATE] #${index + 1}: ${adapted.name} -> ${docId}.md`);
    }
  } else {
    if (exists) updatedCount++;
    else createdCount++;
    console.log(`  [${exists ? 'OVERWRITE' : 'CREATE'}] #${index + 1}: ${adapted.name} -> ${docId}.md`);
  }

  if (!dryRun) {
    const bodyContent = finalItem.body || finalItem.description || '';
    const fileMarkdown = matter.stringify(bodyContent, finalItem);
    fs.writeFileSync(targetFile, fileMarkdown, 'utf8');
  }
});

console.log('\n===============================================================');
console.log('  INGESTION SUMMARY:');
console.log(`  - Total Processed: ${rawData.length}`);
console.log(`  - Created New:     ${createdCount}`);
console.log(`  - Updated/Merged:  ${updatedCount}`);
console.log(`  - Skipped:         ${skippedCount}`);
if (dryRun) {
  console.log('\n  [NOTICE] This was a dry-run. No files were written to disk.');
} else {
  console.log(`\n  ✅ All records written to src/data/omnicortex/${dataset.targetCollection}/`);
}
console.log('===============================================================\n');
