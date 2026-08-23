import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('src/data/omnicortex');
const dirs = fs.readdirSync(rootDir, { withFileTypes: true }).filter(d => d.isDirectory());

for (const d of dirs) {
  const dirPath = path.join(rootDir, d.name);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') || f.endsWith('.json'));
  console.log(`${d.name.padEnd(20)}: ${files.length} files`);
}
