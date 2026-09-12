import fs from 'fs';

const content = fs.readFileSync('scripts/compileCompendium.mjs', 'utf8');
const regex = /addArticle\(\{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"]/g;
let m;
const articles = [];
while ((m = regex.exec(content)) !== null) {
  articles.push({ id: m[1], name: m[2] });
}

console.log('Total addArticle calls in compileCompendium.mjs: ' + articles.length);
articles.forEach((a, idx) => {
  console.log(`${idx + 1}. [${a.id}] ${a.name}`);
});
