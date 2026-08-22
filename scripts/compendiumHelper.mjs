import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const compendiumDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');
const seedJsonPath = path.join(projectRoot, 'src', 'data', 'compendiumSeed.json');

// Helper to write article
export function writeArticle(article) {
  const frontmatter = [
    '---',
    id: "",
    
ame: "",
    category: "compendium",
    entry_type: "",
    parent: "",
    order: ,
    '---',
    ''
  ].join('\n');

  const fileContent = frontmatter + article.description.trim() + '\n';
  const filePath = path.join(compendiumDir, ${article.id}.md);
  fs.writeFileSync(filePath, fileContent, 'utf8');
}
