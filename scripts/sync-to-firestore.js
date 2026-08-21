import fs from 'fs';
import { globSync } from 'glob';
import matter from 'gray-matter';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin (Requires GOOGLE_APPLICATION_CREDENTIALS env var or service account key)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

async function syncDatabaseEntries() {
  console.log('Starting sync to Firestore...');
  
  // Find all MD files in the data directory
  const files = globSync('../src/data/omnicortex/**/*.md', { cwd: __dirname });
  console.log(`Found ${files.length} Markdown files to process.`);

  for (const file of files) {
    const fullPath = path.resolve(__dirname, file);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    
    // Parse frontmatter and body
    const parsed = matter(fileContent);
    const data = parsed.data;
    const content = parsed.content.trim();

    // Validate required fields
    if (!data.category || !data.id) {
      console.warn(`Skipping ${file}: Missing 'category' or 'id' in frontmatter.`);
      continue;
    }

    const collectionName = data.category;
    const docId = data.id;

    // Construct the payload for Firestore
    const payload = {
      ...data,
      name: data.name || data.title || '',
      description: content || data.description || '', // Save the markdown body as the description
      updatedAt: new Date().toISOString()
    };

    try {
      await db.collection(collectionName).doc(docId).set(payload, { merge: true });
      console.log(`[Success] Synced ${collectionName}/${docId}`);
    } catch (error) {
      console.error(`[Error] Failed to sync ${collectionName}/${docId}:`, error);
    }
  }
  
  console.log('Sync complete.');
}

syncDatabaseEntries().catch(console.error);
