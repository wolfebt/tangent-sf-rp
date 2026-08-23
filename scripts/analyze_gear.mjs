import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const gearDir = path.resolve('src/data/omnicortex/gear');
const files = fs.readdirSync(gearDir);

const list = [];
for (const file of files) {
  const fullPath = path.join(gearDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  let parsed;
  try {
    parsed = matter(raw);
  } catch (e) {
    console.error('Error in', file, e.message);
    continue;
  }
  list.push({
    file,
    id: parsed.data.id || file.replace('.md', ''),
    name: parsed.data.name || parsed.data.title || file.replace('.md', ''),
    data: parsed.data,
    content: parsed.content.trim()
  });
}

console.log(`Total gear files parsed: ${list.length}`);

// Print all entries in a format we can inspect
fs.writeFileSync('scripts/gear_analysis.json', JSON.stringify(list, null, 2));
console.log('Saved analysis to scripts/gear_analysis.json');
