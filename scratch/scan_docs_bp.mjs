import fs from 'fs';
import path from 'path';

const docsDir = 'docs/game rules';

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
    } else if (entry.name.endsWith('.md')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/\bBP\b/.test(line)) {
          // Check if not preceded by Build Point or Character Point
          console.log(`${full}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

scan(docsDir);
