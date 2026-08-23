import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: 'tangent-rpg-dbm'
  });
}

const db = getFirestore();

async function syncAllToFirestore() {
  console.log('=== STARTING COMPLETE OMNICORTEX SYNC TO FIRESTORE ===');
  
  const rootDataDir = path.resolve(__dirname, '../src/data/omnicortex');
  const files = globSync('**/*.md', { cwd: rootDataDir });
  console.log(`Found ${files.length} Markdown files in ${rootDataDir}`);

  let successCount = 0;
  let errorCount = 0;
  const batchSize = 400;
  let currentBatch = db.batch();
  let opsInCurrentBatch = 0;

  for (let i = 0; i < files.length; i++) {
    const relFile = files[i];
    const fullPath = path.join(rootDataDir, relFile);
    const rawContent = fs.readFileSync(fullPath, 'utf8');

    let parsed;
    try {
      parsed = matter(rawContent);
    } catch (e) {
      console.warn(`[Warn] YAML parse error in ${relFile}:`, e.message);
      continue;
    }

    const data = parsed.data || {};
    const content = parsed.content.trim();

    const fileId = relFile.split(/[/\\]/).pop().replace(/\.md$/i, '');
    const docId = data.id || fileId;

    // Determine target collection
    let collectionName = data.category;
    if (!collectionName) {
      const parts = relFile.split(/[/\\]/);
      collectionName = parts[0];
    }


    const payload = {
      ...data,
      name: data.name || data.title || docId,
      description: data.description || content || '',
      body: content,
      updatedAt: new Date().toISOString()
    };

    // Add to batch for primary collection
    const docRef = db.collection(collectionName).doc(docId);
    currentBatch.set(docRef, payload, { merge: true });
    opsInCurrentBatch++;
    successCount++;

    // If traits, also sync to singular 'trait' collection for DBM & Folio compatibility
    if (collectionName === 'traits') {
      const traitRef = db.collection('trait').doc(docId);
      currentBatch.set(traitRef, payload, { merge: true });
      opsInCurrentBatch++;
    }

    // If batch limit reached, commit
    if (opsInCurrentBatch >= batchSize) {
      console.log(`Committing batch of ${opsInCurrentBatch} operations...`);
      await currentBatch.commit();
      currentBatch = db.batch();
      opsInCurrentBatch = 0;
    }
  }

  // Commit remaining
  if (opsInCurrentBatch > 0) {
    console.log(`Committing final batch of ${opsInCurrentBatch} operations...`);
    await currentBatch.commit();
  }

  console.log('====================================================');
  console.log(`SYNC COMPLETE: Successfully processed ${successCount} entries!`);
  console.log('====================================================');
}

syncAllToFirestore().catch(err => {
  console.error('FATAL SYNC ERROR:', err);
});
