import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({ projectId: 'tangent-rpg-dbm' });
}

const db = getFirestore();

async function checkCollections() {
  const collections = [
    'skills', 'features', 'origins', 'occupations', 'factions',
    'compendium', 'trait', 'traits', 'disadvantages', 'invocations',
    'disciplines', 'societies', 'rules', 'maneuvers', 'conditions', 'damage_types', 'synthesis'
  ];

  console.log('=== FIRESTORE LIVE CLOUD VERIFICATION ===');
  for (const col of collections) {
    const snap = await db.collection(col).get();
    console.log(`Collection [${col}]: ${snap.size} documents in cloud`);
  }
  console.log('==========================================');
}

checkCollections().catch(console.error);
