/**
 * @file auditMarkdownCompleteness.mjs
 * @description SSOT Markdown Completeness & Truncation Auditor.
 * Audits all active `docs/game_rules/**` files and all 62 `src/data/omnicortex/**` categories
 * for stubbed/short bodies, truncation/placeholder markers (`[TBD]`, `[TRUNCATED]`, `[REDACTED]`),
 * and Option A cross-vault prose deltas (`docs/game_rules/operator/**` vs `src/data/omnicortex/**`).
 *
 * Usage:
 *   node scripts/auditMarkdownCompleteness.mjs
 *   node scripts/auditMarkdownCompleteness.mjs --json
 *   node scripts/auditMarkdownCompleteness.mjs --out audit_report.json
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { runCrossVaultSync } from './syncRulebooksToOmnicortexEntities.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PROJECT_ROOT = path.resolve(__dirname, '..');

const PLACEHOLDER_REGEX = /\[(?:TBD|TRUNCATED|REDACTED|TODO|PLACEHOLDER)\]|\bTBD\b/i;

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

export function auditMarkdownVaults(projectRoot = DEFAULT_PROJECT_ROOT) {
  const gameRulesDir = path.join(projectRoot, 'docs', 'game_rules');
  const omnicortexDir = path.join(projectRoot, 'src', 'data', 'omnicortex');

  const ruleFiles = walkMarkdownFiles(gameRulesDir).filter(
    f => !f.replace(/\\/g, '/').includes('/_archived_legacy/')
  );

  const ruleAudit = {
    totalFiles: ruleFiles.length,
    totalBodyChars: 0,
    shortFilesUnder150: [],
    placeholderFiles: []
  };

  for (const rf of ruleFiles) {
    const raw = fs.readFileSync(rf, 'utf8');
    const body = (matter(raw).content || '').trim();
    const proseBeforeLedger = body.split(/^#{2,3}\s+(?:Part III\s*[—:-]\s*)?DISCREPANCY\s*&\s*RESTORATION\s*LEDGER/im)[0];
    const proseClean = proseBeforeLedger
      .replace(/PROHIBITED_PATTERNS\s*=\s*\[[\s\S]*?\]/g, '')
      .replace(/`[^`\n]+`/g, '');
    const rel = path.relative(projectRoot, rf).replace(/\\/g, '/');
    ruleAudit.totalBodyChars += body.length;
    if (body.length < 150) {
      ruleAudit.shortFilesUnder150.push({ file: rel, chars: body.length });
    }
    const markerMatch = proseClean.match(PLACEHOLDER_REGEX);
    if (markerMatch) {
      ruleAudit.placeholderFiles.push({ file: rel, marker: markerMatch[0], chars: body.length });
    }
  }

  const omnicortexCategories = fs.existsSync(omnicortexDir)
    ? fs.readdirSync(omnicortexDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort()
    : [];

  const categorySummaries = [];
  let totalOmnicortexFiles = 0;
  let totalOmnicortexBodyChars = 0;
  const emptyBodyEntities = [];
  const placeholderEntities = [];

  for (const cat of omnicortexCategories) {
    const catDir = path.join(omnicortexDir, cat);
    const mdFiles = walkMarkdownFiles(catDir);
    if (mdFiles.length === 0) continue;

    let catChars = 0;
    let shortCount = 0;
    let emptyCount = 0;
    let placeholderCount = 0;

    for (const mf of mdFiles) {
      const raw = fs.readFileSync(mf, 'utf8');
      const parsed = matter(raw);
      const body = (parsed.content || '').trim();
      const rel = path.relative(projectRoot, mf).replace(/\\/g, '/');

      totalOmnicortexFiles++;
      totalOmnicortexBodyChars += body.length;
      catChars += body.length;

      if (body.length === 0) {
        emptyCount++;
        emptyBodyEntities.push(rel);
      } else if (body.length < 120) {
        shortCount++;
      }

      if (PLACEHOLDER_REGEX.test(body)) {
        placeholderCount++;
        if (cat !== 'compendium') {
          placeholderEntities.push(rel);
        }
      }
    }

    categorySummaries.push({
      category: cat,
      files: mdFiles.length,
      avgBodyChars: Math.round(catChars / mdFiles.length),
      emptyBodies: emptyCount,
      shortUnder120: shortCount,
      placeholders: placeholderCount
    });
  }

  const crossVaultPreview = runCrossVaultSync({ projectRoot, apply: false, silent: true });

  return {
    timestamp: new Date().toISOString(),
    gameRules: ruleAudit,
    omnicortex: {
      totalCategoriesWithMd: categorySummaries.length,
      totalFiles: totalOmnicortexFiles,
      totalBodyChars: totalOmnicortexBodyChars,
      emptyBodyEntities,
      placeholderEntities,
      categories: categorySummaries
    },
    crossVaultDelta: {
      checked: crossVaultPreview.checked,
      matched: crossVaultPreview.matched,
      rulebookRicherCount: crossVaultPreview.updated,
      unmatchedCount: crossVaultPreview.unmatched.length,
      sampleRicherInRulebook: crossVaultPreview.changes.slice(0, 15)
    }
  };
}

if (path.resolve(process.argv[1] || '') === __filename) {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const outIdx = args.indexOf('--out');
  const outPath = outIdx !== -1 && args[outIdx + 1] ? path.resolve(args[outIdx + 1]) : null;

  const report = auditMarkdownVaults();

  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  }

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n══════════════════════════════════════════════════════════════════════`);
    console.log(`  TANGENT SF RP — MARKDOWN SSOT COMPLETENESS AUDIT`);
    console.log(`══════════════════════════════════════════════════════════════════════`);
    console.log(`  1. Rulebook Vault (docs/game_rules):`);
    console.log(`     • Active Markdown Files : ${report.gameRules.totalFiles}`);
    console.log(`     • Total Prose Characters: ${report.gameRules.totalBodyChars.toLocaleString()}`);
    console.log(`     • Short Stubs (<150 ch) : ${report.gameRules.shortFilesUnder150.length}`);
    console.log(`     • Placeholder Markers   : ${report.gameRules.placeholderFiles.length} ([TBD]/REDACTED/TODO)`);
    console.log(`\n  2. Omnicortex Entity Vault (src/data/omnicortex):`);
    console.log(`     • Active Categories     : ${report.omnicortex.totalCategoriesWithMd}`);
    console.log(`     • Total Entity .md Files: ${report.omnicortex.totalFiles}`);
    console.log(`     • Total Body Characters : ${report.omnicortex.totalBodyChars.toLocaleString()}`);
    console.log(`     • Empty Markdown Bodies : ${report.omnicortex.emptyBodyEntities.length}`);
    console.log(`     • Placeholder Entities  : ${report.omnicortex.placeholderEntities.length}`);
    console.log(`\n  3. Cross-Vault Parity (docs/game_rules/operator -> omnicortex):`);
    console.log(`     • Entities Checked      : ${report.crossVaultDelta.checked}`);
    console.log(`     • Matched 1:1           : ${report.crossVaultDelta.matched}`);
    console.log(`     • Unmatched             : ${report.crossVaultDelta.unmatchedCount}`);
    console.log(`     • Rulebook Has Richer Prose Ready to Sync: ${report.crossVaultDelta.rulebookRicherCount}`);
    console.log(`══════════════════════════════════════════════════════════════════════\n`);
  }
}
