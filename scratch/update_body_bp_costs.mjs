import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

async function updateBodyBPCosts() {
  const sMod = await import('../src/data/speciesData.js');
  const speciesList = sMod.DEFAULT_SPECIES;

  const speciesDir = 'src/data/omnicortex/species';
  const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.md'));

  let updatedFiles = 0;

  for (const f of files) {
    const fullPath = path.join(speciesDir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const fm = parsed.data;
    const bp = fm.costs?.bp ?? fm.cp_cost;

    let body = parsed.content;
    let modified = false;

    // Pattern 1: **BP Cost:** [TBD] or **BP Cost:** <number> or **BP Cost:** <empty>
    if (body.match(/\*\*BP Cost:\*\*([^\n]*)/i)) {
      body = body.replace(/\*\*BP Cost:\*\*([^\n]*)/i, `**BP Cost:** ${bp} BP  `);
      modified = true;
    } else if (body.match(/\*\*BP:\*\*([^\n]*)/i)) {
      body = body.replace(/\*\*BP:\*\*([^\n]*)/i, `**BP:** ${bp} BP  `);
      modified = true;
    }

    if (modified) {
      updatedFiles++;
      const newFileContent = matter.stringify(body, fm);
      fs.writeFileSync(fullPath, newFileContent, 'utf8');
    }
  }

  console.log(`Updated body BP cost in ${updatedFiles} species markdown files.`);

  // Now update species detail blocks in docs/game rules/operator/1.03 SPECIES (work).md
  const workPath = 'docs/game rules/operator/1.03 SPECIES (work).md';
  let workContent = fs.readFileSync(workPath, 'utf8');

  // For each species, find its section in 1.03 SPECIES (work).md
  // Usually there is a header e.g. # **CELESTINE (Alterians)** or ## **ALTERIAN** or similar followed later by **BP Cost:**
  let workUpdates = 0;

  speciesList.forEach(sp => {
    const bp = sp.costs?.bp ?? sp.cp_cost;
    const name = sp.name;
    const cleanName = name.replace(/\(.*?\)/g, '').trim();

    // Look for species header followed within 30 lines by **BP Cost:**
    // Replace `**BP Cost:** \[TBD\]` or `**BP Cost:**&nbsp;` or `**BP Cost:**`
    const regex = new RegExp(`(#+ \\*\\*[^\\n]*${cleanName}[^\\n]*\\*\\*[\\s\\S]*?\\*\\*BP Cost:\\*\\*)([^\n]*)`, 'i');
    if (regex.test(workContent)) {
      workContent = workContent.replace(regex, (match, prefix, suffix) => {
        workUpdates++;
        return `${prefix} ${bp} BP  `;
      });
    }
  });

  console.log(`Updated ${workUpdates} species detail blocks in 1.03 SPECIES (work).md.`);
  fs.writeFileSync(workPath, workContent, 'utf8');
}

updateBodyBPCosts();
