/**
 * @file syncRulebooksToOmnicortexEntities.mjs
 * @description Option A Cross-Vault Propagator: Deterministically propagates expanded/restored
 * rulebook & lore prose from `docs/game_rules/operator/**` into `src/data/omnicortex/<category>/*.md`
 * while preserving 100% of YAML frontmatter byte-for-byte (`id`, `costs`, `modifiers`, `recommended_*`,
 * `keywords`, `negative_keywords`, `traits`, etc.).
 *
 * Usage:
 *   node scripts/syncRulebooksToOmnicortexEntities.mjs --dry-run   (default preview)
 *   node scripts/syncRulebooksToOmnicortexEntities.mjs --apply     (writes expanded bodies)
 *   node scripts/syncRulebooksToOmnicortexEntities.mjs --apply --force-body  (syncs even equal/shorter rulebook edits)
 *   node scripts/syncRulebooksToOmnicortexEntities.mjs --apply --include-skills-features
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PROJECT_ROOT = path.resolve(__dirname, '..');

function walkMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

function normAlphaNum(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts raw YAML frontmatter block (`---\n...\n---`) byte-for-byte so updating the body
 * causes zero YAML formatting churn or frontmatter mutation.
 */
export function replaceMarkdownBodyPreservingFrontmatter(existingRawContent, newBodyText) {
  const fmMatch = String(existingRawContent || '').match(/^(---\r?\n[\s\S]*?\r?\n---)(?:\r?\n|$)/);
  const cleanBody = String(newBodyText || '').replace(/\r\n/g, '\n').trim();
  if (!fmMatch) {
    return `${cleanBody}\n`;
  }
  return `${fmMatch[1]}\n\n${cleanBody}\n`;
}

/**
 * Resolves exact 1-to-1 rulebook source file for an Omnicortex Species `.md` file.
 */
function matchSpeciesRulebookFile(omnicortexFileName, parsedData, rulebookSpeciesFiles) {
  const stem = omnicortexFileName.replace(/^species-/, '').replace(/\.md$/i, '');
  const parts = stem.split('-');
  const tailSlug = normAlphaNum(parts[parts.length - 1]);
  const fullSlug = normAlphaNum(stem);
  const entityNameNorm = normAlphaNum(parsedData?.name || '');

  const SPECIAL_SPECIES_MAP = {
    'species-asi-fey-base.md': '1.03.Asi.Fey.md',
    'species-gene-base.md': '1.03.Humans.GenE.md',
    'species-synthetic-intellect.md': '1.03.Synthetics.IntellectConstruct.md',
    'species-synthetic-scrap.md': '1.03.Synthetics.Scraps.md',
    'species-synthetic-skin.md': '1.03.Synthetics.Skins.md',
    'species-synthetic-sentient-machine.md': '1.03.Synthetics.SentientMachine.md',
    'species-gene-impyrium-psion.md': '1.03.Humans.ImpyriumPsion.md',
    'species-gene-impyrium-regi.md': '1.03.Humans.ImpyriumRegi.md',
    'species-auluran-dar.md': '1.03.Aulurans.Dar.md',
    'species-human-lin.md': '1.03.Humans.Lin.md',
    'species-progenitor-ila.md': '1.03.Progenitors.Ila.md'
  };

  if (SPECIAL_SPECIES_MAP[omnicortexFileName]) {
    const targetBase = SPECIAL_SPECIES_MAP[omnicortexFileName].toLowerCase();
    return rulebookSpeciesFiles.find(rf => path.basename(rf).toLowerCase() === targetBase) || null;
  }

  // Skip lineage overview chapters like 1.03.Aeld.md, 1.03.AeldAndAsi.md, 1.03.HumansAuluransKitin.md, 1.03.SyntheticsAndXeno.md
  const OVERVIEW_BASENAMES = new Set([
    '1.03.aeldandasi.md',
    '1.03.humansauluranskitin.md',
    '1.03.syntheticsandxeno.md',
    '1.03.aeld.md',
    '1.03.asi.md',
    '1.03.aulurans.md',
    '1.03.humans.md',
    '1.03.kitin.md',
    '1.03.orll.md',
    '1.03.progenitors.md',
    '1.03.shanor.md',
    '1.03.synthetics.md'
  ]);

  const candidates = rulebookSpeciesFiles.filter(
    rf => !OVERVIEW_BASENAMES.has(path.basename(rf).toLowerCase())
  );

  // 1. Exact lineage + sub-species match (e.g., 1.03.Aeld.Alterian -> aeldalterian)
  for (const rf of candidates) {
    const baseClean = normAlphaNum(path.basename(rf, '.md').replace(/^1\.03\./, ''));
    if (baseClean === fullSlug) return rf;
  }

  // 2. Exact final dot-segment match (e.g., 1.03.Humans.GenE.Digon -> digon, 1.03.AwakenedAnimal -> awakenedanimal)
  for (const rf of candidates) {
    const segs = path.basename(rf, '.md').split('.');
    const lastSeg = normAlphaNum(segs[segs.length - 1]);
    const twoSegs = segs.length >= 3 ? normAlphaNum(segs.slice(-2).join('')) : '';
    if (twoSegs && twoSegs === fullSlug) return rf;
    if (lastSeg === fullSlug || (entityNameNorm && lastSeg === entityNameNorm)) return rf;
  }

  // 3. Fallback suffix match on multi-part stem
  for (const rf of candidates) {
    const segs = path.basename(rf, '.md').split('.');
    const lastSeg = normAlphaNum(segs[segs.length - 1]);
    if (tailSlug.length >= 4 && lastSeg === tailSlug) return rf;
  }

  return null;
}

/**
 * Resolves exact 1-to-1 rulebook source file for an Omnicortex Faction `.md` file.
 */
function matchFactionRulebookFile(omnicortexFileName, rulebookFactionFiles) {
  const SPECIAL_FACTION_MAP = {
    'faction-impyrium.md': '1.04.Impyrium.Dominion.md',
    'faction-radiant-impyrium.md': '1.04.Impyrium.Radiant.md',
    'faction-aeld-providence.md': '1.04.AeldProvidence.md',
    'faction-mekan.md': '1.04.Major.MekanCollective.md',
    'faction-vajar.md': '1.04.AeldProvidence.VajarTribes.md'
  };

  if (SPECIAL_FACTION_MAP[omnicortexFileName]) {
    const targetBase = SPECIAL_FACTION_MAP[omnicortexFileName].toLowerCase();
    return rulebookFactionFiles.find(rf => path.basename(rf).toLowerCase() === targetBase) || null;
  }

  if (omnicortexFileName.startsWith('template-')) {
    const tplSlug = normAlphaNum(omnicortexFileName.replace(/^template-/, '').replace(/\.md$/i, ''));
    return rulebookFactionFiles.find(rf => {
      const base = path.basename(rf, '.md');
      if (!base.toLowerCase().startsWith('1.04.archetypal.')) return false;
      const tail = normAlphaNum(base.replace(/^1\.04\.Archetypal\./i, ''));
      return tail === tplSlug;
    }) || null;
  }

  const facSlug = normAlphaNum(omnicortexFileName.replace(/^faction-/, '').replace(/\.md$/i, ''));
  return rulebookFactionFiles.find(rf => {
    const segs = path.basename(rf, '.md').split('.');
    const lastSeg = normAlphaNum(segs[segs.length - 1]);
    return lastSeg === facSlug;
  }) || null;
}

/**
 * Extracts individual Archetype Markdown profiles (`## **1. THE THESPIAN**`) from the 4 sphere files.
 */
function extractArchetypeSectionsFromRulebooks(archetypesRulebookDir) {
  const sectionMap = new Map();
  if (!fs.existsSync(archetypesRulebookDir)) return sectionMap;

  const sphereFiles = ['1.02.Operatives.md', '1.02.Savants.md', '1.02.Sentinels.md', '1.02.Visionaries.md'];
  for (const sf of sphereFiles) {
    const fullPath = path.join(archetypesRulebookDir, sf);
    if (!fs.existsSync(fullPath)) continue;
    const raw = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
    const lines = raw.split('\n');
    let currentSlug = null;
    let currentLines = [];

    const flush = () => {
      if (currentSlug && currentLines.length > 0) {
        const text = currentLines.join('\n').replace(/\n---\s*$/, '').trim();
        if (text) sectionMap.set(currentSlug, { text, sourceFile: sf });
      }
    };

    for (const line of lines) {
      const m = line.match(/^##\s+\*?\*?\d+\.\s+THE\s+([^*#\n]+?)\*?\*?\s*$/i);
      if (m) {
        flush();
        const rawTitle = m[1].trim();
        const titleCased = rawTitle.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        currentSlug = normAlphaNum(rawTitle);
        currentLines = [`# The ${titleCased}`, ''];
      } else if (currentSlug) {
        if (/^##\s+/i.test(line)) {
          flush();
          currentSlug = null;
          currentLines = [];
        } else {
          currentLines.push(line);
        }
      }
    }
    flush();
  }
  return sectionMap;
}

/**
 * Extracts individual Invocation profiles (`### **ACUTE SENSES**`) from `operator/metaphysics/4.00.*.md`.
 */
function extractInvocationSectionsFromRulebooks(metaphysicsRulebookDir) {
  const byDiscAndName = new Map();
  const byNameOnly = new Map();
  if (!fs.existsSync(metaphysicsRulebookDir)) return { byDiscAndName, byNameOnly };

  const files = fs.readdirSync(metaphysicsRulebookDir)
    .filter(f => f.endsWith('.md') && f !== '4.00.SensoryManifestations.md')
    .sort();

  for (const sf of files) {
    const discToken = normAlphaNum(sf.replace(/^4\.00\./i, '').replace(/\.md$/i, ''));
    const fullPath = path.join(metaphysicsRulebookDir, sf);
    const lines = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n').split('\n');
    let currentName = null;
    let currentLines = [];

    const flush = () => {
      if (currentName && currentLines.length > 0) {
        const cleanBody = currentLines.join('\n').replace(/\n---\s*$/, '').trim();
        if (cleanBody) {
          const nameKey = normAlphaNum(currentName);
          const entry = {
            title: currentName,
            sourceFile: sf,
            text: `# ${currentName} Invocation\n\n## Description & Ritual Details\n\n${cleanBody}`
          };
          byDiscAndName.set(`${discToken}:${nameKey}`, entry);
          if (!byNameOnly.has(nameKey)) {
            byNameOnly.set(nameKey, entry);
          }
        }
      }
    };

    for (const line of lines) {
      const m = line.match(/^###\s+\*\*(.+?)\*\*\s*$/);
      if (m && !/DISCREPANCY/i.test(m[1])) {
        flush();
        currentName = m[1].trim();
        currentLines = [];
      } else if (currentName) {
        if (/^#{1,2}\s+/.test(line) || /^###\s+DISCREPANCY/i.test(line)) {
          flush();
          currentName = null;
          currentLines = [];
        } else {
          currentLines.push(line);
        }
      }
    }
    flush();
  }

  return { byDiscAndName, byNameOnly };
}

export function runCrossVaultSync(options = {}) {
  const {
    projectRoot = DEFAULT_PROJECT_ROOT,
    apply = false,
    forceBody = false,
    allowShrink = false,
    categories = ['species', 'factions', 'origins', 'occupations', 'archetypes', 'invocations'],
    includeSkillsFeatures = false,
    silent = false
  } = options;

  const operatorDir = path.join(projectRoot, 'docs', 'game_rules', 'operator');
  const omnicortexDir = path.join(projectRoot, 'src', 'data', 'omnicortex');

  const summary = {
    mode: apply ? 'APPLY' : 'DRY_RUN',
    checked: 0,
    matched: 0,
    updated: 0,
    skippedShorterOrEqual: 0,
    unmatched: [],
    changes: []
  };

  const evaluatePair = (category, entityPath, sourcePath, sourceBodyRaw) => {
    summary.checked++;
    if (!sourcePath || !sourceBodyRaw) {
      summary.unmatched.push({ category, entityFile: path.basename(entityPath) });
      return;
    }
    summary.matched++;

    const rawEntityContent = fs.readFileSync(entityPath, 'utf8');
    const parsedEntity = matter(rawEntityContent);
    const currentBody = (parsedEntity.content || '').replace(/\r\n/g, '\n').trim();
    const incomingBody = String(sourceBodyRaw || '').replace(/\r\n/g, '\n').trim();

    if (!incomingBody || incomingBody === currentBody) {
      summary.skippedShorterOrEqual++;
      return;
    }

    const isExpansion = incomingBody.length > currentBody.length;
    if (!isExpansion && !forceBody && !allowShrink) {
      summary.skippedShorterOrEqual++;
      return;
    }

    const nextFileContent = replaceMarkdownBodyPreservingFrontmatter(rawEntityContent, incomingBody);
    if (apply) {
      fs.writeFileSync(entityPath, nextFileContent, 'utf8');
    }

    summary.updated++;
    summary.changes.push({
      category,
      entityFile: path.relative(projectRoot, entityPath).replace(/\\/g, '/'),
      sourceFile: typeof sourcePath === 'string' && path.isAbsolute(sourcePath)
        ? path.relative(projectRoot, sourcePath).replace(/\\/g, '/')
        : String(sourcePath),
      oldBodyChars: currentBody.length,
      newBodyChars: incomingBody.length,
      deltaChars: incomingBody.length - currentBody.length
    });
  };

  // 1. Species (84 playable species)
  if (categories.includes('species')) {
    const rSpeciesFiles = walkMarkdownFiles(path.join(operatorDir, 'species'));
    const oSpeciesDir = path.join(omnicortexDir, 'species');
    if (fs.existsSync(oSpeciesDir)) {
      for (const file of fs.readdirSync(oSpeciesDir).filter(f => f.endsWith('.md')).sort()) {
        const entityPath = path.join(oSpeciesDir, file);
        const parsed = matter(fs.readFileSync(entityPath, 'utf8'));
        const matchedSource = matchSpeciesRulebookFile(file, parsed.data, rSpeciesFiles);
        const sourceBody = matchedSource ? matter(fs.readFileSync(matchedSource, 'utf8')).content : null;
        evaluatePair('species', entityPath, matchedSource, sourceBody);
      }
    }
  }

  // 2. Factions (42 factions & archetypal templates)
  if (categories.includes('factions')) {
    const rFactionFiles = walkMarkdownFiles(path.join(operatorDir, 'factions'));
    const oFactionDir = path.join(omnicortexDir, 'factions');
    if (fs.existsSync(oFactionDir)) {
      for (const file of fs.readdirSync(oFactionDir).filter(f => f.endsWith('.md')).sort()) {
        const entityPath = path.join(oFactionDir, file);
        const matchedSource = matchFactionRulebookFile(file, rFactionFiles);
        const sourceBody = matchedSource ? matter(fs.readFileSync(matchedSource, 'utf8')).content : null;
        evaluatePair('factions', entityPath, matchedSource, sourceBody);
      }
    }
  }

  // 3. Origins (11 origins)
  if (categories.includes('origins')) {
    const rOriginFiles = walkMarkdownFiles(path.join(operatorDir, 'origins'));
    const oOriginDir = path.join(omnicortexDir, 'origins');
    if (fs.existsSync(oOriginDir)) {
      for (const file of fs.readdirSync(oOriginDir).filter(f => f.endsWith('.md')).sort()) {
        const entityPath = path.join(oOriginDir, file);
        const slug = normAlphaNum(file.replace(/^origin-/, '').replace(/\.md$/i, ''));
        const matchedSource = rOriginFiles.find(rf => normAlphaNum(path.basename(rf, '.md').replace(/^1\.05\./, '')) === slug) || null;
        const sourceBody = matchedSource ? matter(fs.readFileSync(matchedSource, 'utf8')).content : null;
        evaluatePair('origins', entityPath, matchedSource, sourceBody);
      }
    }
  }

  // 4. Occupations (13 occupations)
  if (categories.includes('occupations')) {
    const rOccFiles = walkMarkdownFiles(path.join(operatorDir, 'occupations'));
    const oOccDir = path.join(omnicortexDir, 'occupations');
    if (fs.existsSync(oOccDir)) {
      for (const file of fs.readdirSync(oOccDir).filter(f => f.endsWith('.md')).sort()) {
        const entityPath = path.join(oOccDir, file);
        const slug = normAlphaNum(file.replace(/^occupation-/, '').replace(/\.md$/i, ''));
        const matchedSource = rOccFiles.find(rf => normAlphaNum(path.basename(rf, '.md').replace(/^1\.06\./, '')) === slug) || null;
        const sourceBody = matchedSource ? matter(fs.readFileSync(matchedSource, 'utf8')).content : null;
        evaluatePair('occupations', entityPath, matchedSource, sourceBody);
      }
    }
  }

  // 5. Archetypes (100 archetypes across 4 sphere files)
  if (categories.includes('archetypes')) {
    const archSectionMap = extractArchetypeSectionsFromRulebooks(path.join(operatorDir, 'archetypes'));
    const oArchDir = path.join(omnicortexDir, 'archetypes');
    if (fs.existsSync(oArchDir)) {
      for (const file of fs.readdirSync(oArchDir).filter(f => f.endsWith('.md')).sort()) {
        const entityPath = path.join(oArchDir, file);
        const parsed = matter(fs.readFileSync(entityPath, 'utf8'));
        const fileSlug = normAlphaNum(file.replace(/^archetype-/, '').replace(/\.md$/i, ''));
        const nameSlug = normAlphaNum(String(parsed.data?.name || '').replace(/^the\s+/i, ''));
        const entry = archSectionMap.get(fileSlug) || archSectionMap.get(nameSlug) ||
          Array.from(archSectionMap.entries()).find(([k]) => k.startsWith(fileSlug) || fileSlug.startsWith(k))?.[1] || null;
        evaluatePair(
          'archetypes',
          entityPath,
          entry ? `docs/game_rules/operator/archetypes/${entry.sourceFile}` : null,
          entry ? entry.text : null
        );
      }
    }
  }

  // 6. Invocations (discipline invocations from operator/metaphysics/4.00.*.md; composite invocations preserved intact)
  if (categories.includes('invocations')) {
    const { byDiscAndName, byNameOnly } = extractInvocationSectionsFromRulebooks(path.join(operatorDir, 'metaphysics'));
    const oInvDir = path.join(omnicortexDir, 'invocations');
    if (fs.existsSync(oInvDir)) {
      for (const file of fs.readdirSync(oInvDir).filter(f => f.endsWith('.md')).sort()) {
        if (file.startsWith('invocation-composite-')) continue;
        const entityPath = path.join(oInvDir, file);
        const parsed = matter(fs.readFileSync(entityPath, 'utf8'));
        const rawName = String(parsed.data?.name || file.replace(/^invocation-|\.md$/g, '')).trim();
        const baseNameNorm = normAlphaNum(rawName.replace(/\([^)]*\)/g, ''));
        const fullNameNorm = normAlphaNum(rawName);
        const discNorm = normAlphaNum(parsed.data?.discipline || '');
        const entry =
          byDiscAndName.get(`${discNorm}:${baseNameNorm}`) ||
          byDiscAndName.get(`${discNorm}:${fullNameNorm}`) ||
          byNameOnly.get(fullNameNorm) ||
          byNameOnly.get(baseNameNorm) ||
          null;
        evaluatePair(
          'invocations',
          entityPath,
          entry ? `docs/game_rules/operator/metaphysics/${entry.sourceFile}` : null,
          entry ? entry.text : null
        );
      }
    }
  }

  if (apply && includeSkillsFeatures) {
    const skillsScript = path.join(projectRoot, 'scripts', 'syncCanonicalSkillsCatalog.mjs');
    const featuresScript = path.join(projectRoot, 'scripts', 'syncCanonicalFeaturesCatalog.mjs');
    if (fs.existsSync(skillsScript)) {
      execFileSync(process.execPath, [skillsScript], { cwd: projectRoot, stdio: silent ? 'pipe' : 'inherit' });
    }
    if (fs.existsSync(featuresScript)) {
      execFileSync(process.execPath, [featuresScript], { cwd: projectRoot, stdio: silent ? 'pipe' : 'inherit' });
    }
  }

  if (!silent) {
    console.log(`\n=== OPTION A CROSS-VAULT PROPAGATOR (${summary.mode}) ===`);
    console.log(`Checked: ${summary.checked} | Matched 1:1: ${summary.matched} | ${apply ? 'Updated' : 'Would Update (Richer Rulebook Prose)'}: ${summary.updated} | Already Current/Longer: ${summary.skippedShorterOrEqual} | Unmatched: ${summary.unmatched.length}`);
    if (summary.changes.length > 0) {
      for (const c of summary.changes.slice(0, 25)) {
        const sign = c.deltaChars >= 0 ? `+${c.deltaChars}` : `${c.deltaChars}`;
        console.log(`  [${c.category}] ${c.entityFile} <= ${c.sourceFile} (${c.oldBodyChars} -> ${c.newBodyChars} chars, ${sign})`);
      }
      if (summary.changes.length > 25) {
        console.log(`  ... and ${summary.changes.length - 25} more files.`);
      }
    }
    if (summary.unmatched.length > 0) {
      console.log(`  Unmatched entities:`, summary.unmatched.map(u => `${u.category}/${u.entityFile}`).join(', '));
    }
  }

  return summary;
}

if (path.resolve(process.argv[1] || '') === __filename) {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply') || args.includes('--write');
  const forceBody = args.includes('--force-body');
  const allowShrink = args.includes('--allow-shrink');
  const includeSkillsFeatures = args.includes('--include-skills-features') || args.includes('--all');
  const catArg = args.find(a => a.startsWith('--category='));
  const categories = catArg
    ? catArg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean)
    : ['species', 'factions', 'origins', 'occupations', 'archetypes', 'invocations'];

  runCrossVaultSync({
    apply,
    forceBody,
    allowShrink,
    categories,
    includeSkillsFeatures
  });
}
