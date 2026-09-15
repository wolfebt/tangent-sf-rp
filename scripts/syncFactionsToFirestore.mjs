import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DEFAULT_FACTIONS } from '../src/data/factionsData.js';

if (getApps().length === 0) {
  initializeApp({ projectId: 'tangent-rpg-dbm' });
}

const db = getFirestore();

async function syncFactions() {
  console.log('================================================================');
  console.log('SYNCING CANONICAL FACTIONS CATALOG TO FIRESTORE [factions]');
  console.log('================================================================');
  console.log(`Total factions to sync: ${DEFAULT_FACTIONS.length}`);

  const colRef = db.collection('factions');

  // Fetch current documents
  const snapshot = await colRef.get();
  console.log(`Current documents in Firestore [factions]: ${snapshot.size}`);

  const existingDocs = new Map();
  snapshot.forEach(doc => {
    existingDocs.set(doc.id, doc.data());
  });

  const canonicalIds = new Set(DEFAULT_FACTIONS.map(f => f.id));

  // Purge obsolete / orphan documents
  const toDelete = [];
  existingDocs.forEach((_, docId) => {
    if (!canonicalIds.has(docId)) {
      toDelete.push(docId);
    }
  });

  if (toDelete.length > 0) {
    console.log(`Purging ${toDelete.length} orphan documents from [factions]...`);
    const batchSize = 400;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = db.batch();
      const chunk = toDelete.slice(i, i + batchSize);
      chunk.forEach(docId => batch.delete(colRef.doc(docId)));
      await batch.commit();
    }
    console.log('Orphan documents purged.');
  }

  // Batch upsert canonical factions
  console.log('Committing canonical faction records...');
  const batchSize = 400;
  for (let i = 0; i < DEFAULT_FACTIONS.length; i += batchSize) {
    const batch = db.batch();
    const chunk = DEFAULT_FACTIONS.slice(i, i + batchSize);
    chunk.forEach(item => {
      const docRef = colRef.doc(item.id);
      batch.set(docRef, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
  }

  // Verification count
  const finalSnapshot = await colRef.get();
  console.log(`Final document count in [factions]: ${finalSnapshot.size}`);

  console.log('================================================================');
  console.log('FIRESTORE FACTIONS SYNC COMPLETE!');
  console.log('================================================================');
}

syncFactions().catch(err => {
  console.error('Error during Firestore sync:', err);
  process.exit(1);
});