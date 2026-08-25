import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { normalizeOmnicortexItem, exportOmnicortexItem } from '../src/utils/tangentSchemaAdapters.js';

const omniRoot = path.resolve('src/data/omnicortex');

function getCategoryDirectories(rootDir) {
  if (!fs.existsSync(rootDir)) return [];
  return fs.readdirSync(rootDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

async function runMigration() {
  console.log('====================================================');
  console.log('  OMNICORTEX SCHEMA CONSOLIDATION MIGRATION');
  console.log('====================================================\n');

  if (!fs.existsSync(omniRoot)) {
    console.log(`Directory ${omniRoot} does not exist. Skipping file-system migration.`);
    return;
  }

  const categories = getCategoryDirectories(omniRoot);
  console.log(`Found ${categories.length} category directories in ${omniRoot}: ${categories.join(', ')}\n`);

  let totalFilesScanned = 0;
  let totalFilesMigrated = 0;

  for (const cat of categories) {
    const catDir = path.join(omniRoot, cat);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
    let catMigratedCount = 0;

    for (const file of files) {
      totalFilesScanned++;
      const filePath = path.join(catDir, file);
      const rawContent = fs.readFileSync(filePath, 'utf8');

      try {
        const parsed = matter(rawContent);
        const originalData = parsed.data;

        // Apply normalization and export sanitization
        const normalized = normalizeOmnicortexItem(originalData);
        const cleanedData = exportOmnicortexItem(normalized);

        // Check if anything changed in key structure
        const origKeys = Object.keys(originalData).sort().join(',');
        const newKeys = Object.keys(cleanedData).sort().join(',');
        const hasChanges = origKeys !== newKeys || JSON.stringify(originalData) !== JSON.stringify(cleanedData);

        if (hasChanges) {
          // Re-serialize frontmatter with gray-matter
          const updatedMarkdown = matter.stringify(parsed.content, cleanedData);
          fs.writeFileSync(filePath, updatedMarkdown, 'utf8');
          catMigratedCount++;
          totalFilesMigrated++;
        }
      } catch (err) {
        console.error(`[Error] Failed to process ${cat}/${file}:`, err.message);
      }
    }

    console.log(`- ${cat.toUpperCase().padEnd(20)}: ${files.length} scanned, ${catMigratedCount} migrated`);
  }

  console.log('\n====================================================');
  console.log(`Migration Complete! Scanned: ${totalFilesScanned}, Migrated: ${totalFilesMigrated}`);
  console.log('====================================================\n');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
