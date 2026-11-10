/**
 * @file ingestStagedMarkdown.mjs
 * @description Staging Dropzone Ingester for Tangent SF RP Markdown SSOT.
 * Scans workspace & app `staging/` folders recursively, matches staged `.md` files
 * against `docs/game_rules/**` and `src/data/omnicortex/<category>/*.md` (never writing
 * directly to generated `omnicortex/compendium/`), enforces shrink-protection, preserves
 * canonical YAML frontmatter on entity files, and optionally runs Option A cross-vault
 * propagation + `buildAllBundles.mjs`.
 *
 * Usage:
 *   node scripts/ingestStagedMarkdown.mjs --dry-run
 *   node scripts/ingestStagedMarkdown.mjs --apply --rebuild
 *   node scripts/ingestStagedMarkdown.mjs --apply --allow-shrink --rebuild
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { replaceMarkdownBodyPreservingFrontmatter, runCrossVaultSync } from './syncRulebooksToOmnicortexEntities.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_WORKSPACE_ROOT = path.resolve(DEFAULT_PROJECT_ROOT, '..');

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

function normKey(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Builds a complete index of canonical target `.md` files across `docs/game_rules/**`
 * and `src/data/omnicortex/**` (excluding generated `omnicortex/compendium/` and `_archived_legacy/`).
 */
export function buildCanonicalTargetIndex(projectRoot = DEFAULT_PROJECT_ROOT) {
  const gameRulesDir = path.join(projectRoot, 'docs', 'game_rules');
  const omnicortexDir = path.join(projectRoot, 'src', 'data', 'omnicortex');

  const ruleFiles = walkMarkdownFiles(gameRulesDir).filter(
    f => !f.replace(/\\/g, '/').includes('/_archived_legacy/')
  );
  const entityFiles = walkMarkdownFiles(omnicortexDir).filter(
    f => !f.replace(/\\/g, '/').includes('/omnicortex/compendium/')
  );

  const byRelPath = new Map();
  const byBaseNameLower = new Map();
  const byNormStem = new Map();
  const byYamlId = new Map();

  const registerTarget = (absPath, vault) => {
    const relFromRoot = path.relative(projectRoot, absPath).replace(/\\/g, '/');
    const baseLower = path.basename(absPath).toLowerCase();
    const normStem = normKey(path.basename(absPath, '.md'));

    const record = { absPath, relFromRoot, vault };
    byRelPath.set(relFromRoot.toLowerCase(), record);

    if (!byBaseNameLower.has(baseLower)) {
      byBaseNameLower.set(baseLower, []);
    }
    byBaseNameLower.get(baseLower).push(record);

    if (!byNormStem.has(normStem)) {
      byNormStem.set(normStem, []);
    }
    byNormStem.get(normStem).push(record);

    if (vault === 'omnicortex') {
      try {
        const parsed = matter(fs.readFileSync(absPath, 'utf8'));
        const id = parsed.data?.id ? String(parsed.data.id).trim().toLowerCase() : '';
        if (id) byYamlId.set(id, record);
      } catch {
        // Ignore malformed frontmatter during index scan
      }
    }
  };

  // Register docs/game_rules first (Option A primary priority for chapter/rulebook files)
  for (const rf of ruleFiles) registerTarget(rf, 'game_rules');
  for (const ef of entityFiles) registerTarget(ef, 'omnicortex');

  return { ruleFiles, entityFiles, byRelPath, byBaseNameLower, byNormStem, byYamlId };
}

/**
 * Resolves a single staged `.md` file to its canonical target record (or creates a new
 * `game_rules` target record when placed inside `architect/...` or `operator/...` subpaths).
 */
export function resolveStagedFileTarget(stagedAbsPath, stagingRootDir, index, projectRoot = DEFAULT_PROJECT_ROOT) {
  const relInStaging = path.relative(stagingRootDir, stagedAbsPath).replace(/\\/g, '/');
  const relLower = relInStaging.toLowerCase();
  const baseLower = path.basename(stagedAbsPath).toLowerCase();
  const normStem = normKey(path.basename(stagedAbsPath, '.md'));

  // 1. Direct relative path match (e.g., staging/docs/game_rules/operator/3.00 COMBAT.md or staging/operator/3.00 COMBAT.md)
  if (index.byRelPath.has(relLower)) {
    return { target: index.byRelPath.get(relLower), matchMethod: 'exact-rel-path' };
  }
  if (index.byRelPath.has(`docs/game_rules/${relLower}`)) {
    return { target: index.byRelPath.get(`docs/game_rules/${relLower}`), matchMethod: 'game_rules-rel-path' };
  }
  if (index.byRelPath.has(`src/data/omnicortex/${relLower}`)) {
    return { target: index.byRelPath.get(`src/data/omnicortex/${relLower}`), matchMethod: 'omnicortex-rel-path' };
  }

  // 1b. Brand-new rulebook or schema file placed inside canonical `architect/...` or `operator/...` subpath
  if (/^(?:docs\/game_rules\/)?(?:architect|operator)\//i.test(relInStaging)) {
    const cleanRel = relInStaging.replace(/^docs\/game_rules\//i, '');
    const relFromRoot = `docs/game_rules/${cleanRel}`;
    const absPath = path.join(projectRoot, 'docs', 'game_rules', ...cleanRel.split('/'));
    return {
      target: { absPath, relFromRoot, vault: 'game_rules', isNewFile: true },
      matchMethod: 'new-game_rules-subpath'
    };
  }

  // 2. Check YAML frontmatter `id` if present
  try {
    const raw = fs.readFileSync(stagedAbsPath, 'utf8');
    if (raw.startsWith('---')) {
      const parsed = matter(raw);
      const yamlId = parsed.data?.id ? String(parsed.data.id).trim().toLowerCase() : '';
      // Guardrail: never route generated `doc-*` compendium IDs to omnicortex/compendium; match their source rulebook instead
      if (yamlId && !yamlId.startsWith('doc-') && index.byYamlId.has(yamlId)) {
        return { target: index.byYamlId.get(yamlId), matchMethod: 'yaml-id' };
      }
      if (parsed.data?.relPath) {
        const rp = `docs/game_rules/${String(parsed.data.relPath).replace(/\\/g, '/').toLowerCase()}`;
        if (index.byRelPath.has(rp)) {
          return { target: index.byRelPath.get(rp), matchMethod: 'compendium-relPath-redirect' };
        }
      }
    }
  } catch {
    // Fall through to filename matching
  }

  // 3. Exact basename match (prefer game_rules when unambiguous)
  const exactBaseMatches = index.byBaseNameLower.get(baseLower) || [];
  if (exactBaseMatches.length === 1) {
    return { target: exactBaseMatches[0], matchMethod: 'exact-filename' };
  }
  if (exactBaseMatches.length > 1) {
    return { target: null, ambiguous: exactBaseMatches.map(m => m.relFromRoot), matchMethod: 'ambiguous-filename' };
  }

  // 4. Normalized alphanumeric stem match
  const stemMatches = index.byNormStem.get(normStem) || [];
  if (stemMatches.length === 1) {
    return { target: stemMatches[0], matchMethod: 'normalized-stem' };
  }
  if (stemMatches.length > 1) {
    const rulePreference = stemMatches.filter(m => m.vault === 'game_rules');
    if (rulePreference.length === 1) {
      return { target: rulePreference[0], matchMethod: 'normalized-stem-rulebook' };
    }
    return { target: null, ambiguous: stemMatches.map(m => m.relFromRoot), matchMethod: 'ambiguous-stem' };
  }

  // 5. Chapter numeric prefix match (e.g., `3.00 COMBAT - UNREDACTED.md` -> `3.00 COMBAT.md`)
  const prefixMatch = path.basename(stagedAbsPath, '.md').match(/^(\d+\.\d+(?:\.[A-Za-z0-9]+)+)/);
  if (prefixMatch) {
    const normPrefix = normKey(prefixMatch[1]);
    const candidates = index.ruleFiles.filter(rf => normKey(path.basename(rf, '.md')).startsWith(normPrefix));
    if (candidates.length === 1) {
      const rel = path.relative(path.resolve(index.ruleFiles[0], '../../../..'), candidates[0]);
      const found = Array.from(index.byRelPath.values()).find(r => r.absPath === candidates[0]);
      if (found) return { target: found, matchMethod: 'chapter-prefix' };
    }
  }

  return { target: null, matchMethod: 'unmatched' };
}

export function ingestStagedMarkdown(options = {}) {
  const {
    projectRoot = DEFAULT_PROJECT_ROOT,
    workspaceRoot = DEFAULT_WORKSPACE_ROOT,
    stagingDirs = null,
    apply = false,
    allowShrink = false,
    replaceFrontmatter = false,
    rebuild = false,
    silent = false
  } = options;

  const candidateStagingDirs = stagingDirs || Array.from(new Set([
    path.join(workspaceRoot, 'staging'),
    path.join(projectRoot, 'staging')
  ]));

  const index = buildCanonicalTargetIndex(projectRoot);
  const discoveredStaged = [];
  const companionSchemaAssets = [];

  for (const sDir of candidateStagingDirs) {
    if (!fs.existsSync(sDir)) continue;
    for (const file of walkMarkdownFiles(sDir)) {
      if (path.basename(file).toLowerCase() === 'readme.md') {
        const headSnippet = fs.readFileSync(file, 'utf8').slice(0, 200);
        if (/Staging Dropzone/i.test(headSnippet)) continue;
      }
      discoveredStaged.push({ stagedPath: file, stagingRoot: sDir });
    }
    const stagedSchemasDir = path.join(sDir, 'architect', 'schemas');
    if (fs.existsSync(stagedSchemasDir)) {
      for (const entry of fs.readdirSync(stagedSchemasDir, { withFileTypes: true })) {
        if (entry.isFile() && /\.(?:json|py)$/i.test(entry.name)) {
          companionSchemaAssets.push({
            stagedPath: path.join(stagedSchemasDir, entry.name),
            targetPath: path.join(projectRoot, 'docs', 'game_rules', 'architect', 'schemas', entry.name),
            relTarget: `docs/game_rules/architect/schemas/${entry.name}`
          });
        }
      }
    }
  }

  const report = {
    mode: apply ? 'APPLY' : 'DRY_RUN',
    scannedStagingDirs: candidateStagingDirs.filter(d => fs.existsSync(d)),
    stagedFileCount: discoveredStaged.length,
    matchedCount: 0,
    appliedCount: 0,
    createdCount: 0,
    companionAssetsSynced: 0,
    blockedShrinkCount: 0,
    unchangedCount: 0,
    unmatched: [],
    items: []
  };

  for (const { stagedPath, stagingRoot } of discoveredStaged) {
    const resolution = resolveStagedFileTarget(stagedPath, stagingRoot, index, projectRoot);
    if (!resolution.target) {
      report.unmatched.push({
        stagedFile: stagedPath,
        reason: resolution.matchMethod,
        candidates: resolution.ambiguous || []
      });
      continue;
    }

    report.matchedCount++;
    const target = resolution.target;
    const rawFromStaging = fs.readFileSync(stagedPath, 'utf8');
    // Repair merged export heading pattern `## **Feature NameDescription:**` -> `## **Feature Name**\n\n* **Description:** `
    const stagedRaw = rawFromStaging.replace(
      /^([ \t]*#{2,4}\s+\*\*[^*\n]+?)Description:\*\*[ \t]*/gm,
      '$1**\n\n* **Description:** '
    );
    const existsAlready = fs.existsSync(target.absPath);
    const existingRaw = existsAlready ? fs.readFileSync(target.absPath, 'utf8') : '';

    let nextRaw = stagedRaw;
    let oldBodyLen = existsAlready ? existingRaw.trim().length : 0;
    let newBodyLen = stagedRaw.trim().length;

    if (target.vault === 'omnicortex') {
      const existingParsed = existsAlready ? matter(existingRaw) : { content: '' };
      oldBodyLen = (existingParsed.content || '').trim().length;
      const stagedHasFrontmatter = /^---\r?\n[\s\S]*?\r?\n---/.test(stagedRaw);

      if (!stagedHasFrontmatter || !replaceFrontmatter) {
        const stagedBody = stagedHasFrontmatter ? (matter(stagedRaw).content || '') : stagedRaw;
        newBodyLen = stagedBody.trim().length;
        nextRaw = existsAlready
          ? replaceMarkdownBodyPreservingFrontmatter(existingRaw, stagedBody)
          : stagedRaw.replace(/\r\n/g, '\n');
      } else {
        const stagedParsed = matter(stagedRaw);
        newBodyLen = (stagedParsed.content || '').trim().length;
        nextRaw = stagedRaw.replace(/\r\n/g, '\n');
      }
    } else {
      oldBodyLen = existsAlready ? matter(existingRaw).content.trim().length : 0;
      newBodyLen = matter(stagedRaw).content.trim().length;
      nextRaw = stagedRaw.replace(/\r\n/g, '\n');
    }

    if (existsAlready && nextRaw.replace(/\r\n/g, '\n').trim() === existingRaw.replace(/\r\n/g, '\n').trim()) {
      report.unchangedCount++;
      report.items.push({
        status: 'UNCHANGED',
        stagedFile: stagedPath,
        targetRelPath: target.relFromRoot,
        vault: target.vault,
        matchMethod: resolution.matchMethod,
        oldBodyLen,
        newBodyLen
      });
      continue;
    }

    if (existsAlready && newBodyLen < oldBodyLen && !allowShrink) {
      report.blockedShrinkCount++;
      report.items.push({
        status: 'BLOCKED_SHRINK',
        stagedFile: stagedPath,
        targetRelPath: target.relFromRoot,
        vault: target.vault,
        matchMethod: resolution.matchMethod,
        oldBodyLen,
        newBodyLen
      });
      continue;
    }

    if (apply) {
      fs.mkdirSync(path.dirname(target.absPath), { recursive: true });
      fs.writeFileSync(target.absPath, nextRaw, 'utf8');
      report.appliedCount++;
      if (!existsAlready) report.createdCount++;
    }

    report.items.push({
      status: !existsAlready ? (apply ? 'CREATED' : 'READY_TO_CREATE') : (apply ? 'APPLIED' : 'READY_TO_APPLY'),
      stagedFile: stagedPath,
      targetRelPath: target.relFromRoot,
      vault: target.vault,
      matchMethod: resolution.matchMethod,
      oldBodyLen,
      newBodyLen,
      deltaChars: newBodyLen - oldBodyLen
    });
  }

  for (const asset of companionSchemaAssets) {
    const srcContent = fs.readFileSync(asset.stagedPath, 'utf8').replace(/\r\n/g, '\n');
    const dstContent = fs.existsSync(asset.targetPath)
      ? fs.readFileSync(asset.targetPath, 'utf8').replace(/\r\n/g, '\n')
      : null;
    if (srcContent !== dstContent) {
      if (apply) {
        fs.mkdirSync(path.dirname(asset.targetPath), { recursive: true });
        fs.writeFileSync(asset.targetPath, srcContent, 'utf8');
      }
      report.companionAssetsSynced++;
    }
  }

  if (!silent) {
    console.log(`\n=== STAGING MARKDOWN INGESTION (${report.mode}) ===`);
    console.log(`Scanned Staging Folders: ${report.scannedStagingDirs.join(', ') || '(none)'}`);
    console.log(`Staged Files Found: ${report.stagedFileCount} | Matched: ${report.matchedCount} | ${apply ? 'Applied' : 'Ready'}: ${apply ? report.appliedCount : report.items.filter(i => i.status === 'READY_TO_APPLY').length} | Unchanged: ${report.unchangedCount} | Blocked Shrink: ${report.blockedShrinkCount} | Unmatched: ${report.unmatched.length}`);
    for (const item of report.items) {
      console.log(`  [${item.status}] ${path.basename(item.stagedFile)} -> ${item.targetRelPath} (${item.oldBodyLen} -> ${item.newBodyLen} chars via ${item.matchMethod})`);
    }
    for (const u of report.unmatched) {
      console.log(`  [UNMATCHED:${u.reason}] ${u.stagedFile}${u.candidates?.length ? ` (candidates: ${u.candidates.join(', ')})` : ''}`);
    }
  }

  if (apply && rebuild) {
    if (!silent) console.log(`\n>>> Running Option A Cross-Vault Propagation & Full Bundle Rebuild...`);
    runCrossVaultSync({ projectRoot, apply: true, allowShrink, silent });
    const buildAllScript = path.join(projectRoot, 'scripts', 'buildAllBundles.mjs');
    execFileSync(process.execPath, [buildAllScript], { cwd: projectRoot, stdio: silent ? 'pipe' : 'inherit' });
  }

  return report;
}

if (path.resolve(process.argv[1] || '') === __filename) {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply') || args.includes('--write');
  const allowShrink = args.includes('--allow-shrink');
  const replaceFrontmatter = args.includes('--replace-frontmatter');
  const rebuild = args.includes('--rebuild');

  ingestStagedMarkdown({
    apply,
    allowShrink,
    replaceFrontmatter,
    rebuild
  });
}
