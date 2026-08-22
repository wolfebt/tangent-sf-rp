import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDataDir = path.resolve(__dirname, '../src/data/omnicortex');
const files = globSync('**/*.md', { cwd: rootDataDir });
console.log(`Sanitizing frontmatter across ${files.length} files...`);

let fixCount = 0;

for (const relFile of files) {
  const fullPath = path.join(rootDataDir, relFile);
  const rawContent = fs.readFileSync(fullPath, 'utf8');

  // If file contains frontmatter
  if (rawContent.startsWith('---')) {
    const parts = rawContent.split('---');
    if (parts.length >= 3) {
      let frontmatter = parts[1];
      const body = parts.slice(2).join('---');

      // Sanitize invalid YAML escape sequences in string values like \+, \-, \&, \_
      let sanitizedFrontmatter = frontmatter
        .replace(/\\([+\-&_#*])/g, '$1');

      if (sanitizedFrontmatter !== frontmatter) {
        const newContent = `---${sanitizedFrontmatter}---${body}`;
        fs.writeFileSync(fullPath, newContent, 'utf8');
        fixCount++;
      }
    }
  }
}

console.log(`Sanitization complete. Fixed frontmatter in ${fixCount} files.`);
