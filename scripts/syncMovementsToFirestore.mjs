import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_SPECIES_MOVEMENT } from '../src/data/speciesMovementData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

if (getApps().length === 0) {
  initializeApp({ projectId: 'tangent-rpg-dbm' });
}

const db = getFirestore();

async function syncMovements() {
  console.log('================================================================');
  console.log('SYNCING SPECIES MOVEMENT CATALOG TO FIRESTORE [species_movement]');
  console.log('================================================================');
  console.log(`Total movements to sync: ${DEFAULT_SPECIES_MOVEMENT.length}`);

  const colRef = db.collection('species_movement');

  // Fetch current documents
  const snapshot = await colRef.get();
  console.log(`Current documents in Firestore [species_movement]: ${snapshot.size}`);

  const existingDocs = new Map();
  snapshot.forEach(doc => {
    existingDocs.set(doc.id, doc.data());
  });

  const canonicalIds = new Set(DEFAULT_SPECIES_MOVEMENT.map(m => m.id));

  // Purge obsolete / orphan documents
  const toDelete = [];
  existingDocs.forEach((_, docId) => {
    if (!canonicalIds.has(docId)) {
      toDelete.push(docId);
    }
  });

  if (toDelete.length > 0) {
    console.log(`Purging ${toDelete.length} orphan documents from [species_movement]...`);
    const batchSize = 400;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = db.batch();
      const chunk = toDelete.slice(i, i + batchSize);
      chunk.forEach(docId => batch.delete(colRef.doc(docId)));
      await batch.commit();
    }
    console.log('Orphan documents purged.');
  }

  // Batch upsert canonical movements
  console.log('Committing canonical movement records...');
  const batchSize = 400;
  for (let i = 0; i < DEFAULT_SPECIES_MOVEMENT.length; i += batchSize) {
    const batch = db.batch();
    const chunk = DEFAULT_SPECIES_MOVEMENT.slice(i, i + batchSize);
    chunk.forEach(item => {
      const docRef = colRef.doc(item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
  }

  // Verification count
  const finalSnapshot = await colRef.get();
  console.log(`Final document count in [species_movement]: ${finalSnapshot.size}`);

  console.log('================================================================');
  console.log('FIRESTORE MOVEMENT SYNC COMPLETE!');
  console.log('================================================================');
}

syncMovements().catch(err => {
  console.error('Error during Firestore sync:', err);
  process.exit(1);
});