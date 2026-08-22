import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

console.log('Testing firebase-admin modular initialization...');
try {
  if (getApps().length === 0) {
    initializeApp({
      projectId: 'tangent-rpg-dbm'
    });
  }
  const db = getFirestore();
  console.log('Initialized firestore. Testing get()...');
  const snap = await db.collection('skills').limit(2).get();
  console.log('Success! Documents in skills:', snap.size);
  snap.forEach(d => console.log('Doc:', d.id, d.data().name));
} catch (err) {
  console.error('Firebase admin error:', err);
}
