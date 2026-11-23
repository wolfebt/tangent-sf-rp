/**
 * @file phase12AuthoringAndPublishing.test.mjs
 * @description Phase 12 automated tests for Pro Authoring, Snapshots, Canon Linter,
 *   Sci-Fi Calendar, Operator-Safe sanitization, and Publishing Compilers (PDF TOC, EPUB 3, Word, RTF).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createRevisionSnapshot,
  appendRevisionSnapshot,
  stripHtmlForDiff,
  computeLineDiff
} from '../../src/services/revisionSnapshotService.ts';
import {
  lintCanonContent,
  applyAutoFix
} from '../../src/services/canonRulesLinterService.ts';
import {
  createDefaultCalendarState,
  advanceCalendarDate,
  compareCalendarDates,
  formatCalendarDate,
  getMoonPhases
} from '../../src/services/campaignCalendarService.ts';
import { PagedPdfCompiler } from '../../src/engine/compilers/PagedPdfCompiler.ts';
import {
  crc32,
  buildZipBytes,
  compileToEpubBytes,
  compileToWordHtmlString,
  compileToRtfString
} from '../../src/engine/compilers/DocumentExporters.ts';
import {
  stripGmSecretHtmlBlocks,
  buildSanitizedOperatorPackagePayload
} from '../../src/services/modulePackageService.js';

test('Phase 12.2 revisionSnapshotService: creates checkpoints, enforces max cap, strips HTML, and diffs lines', () => {
  const s1 = createRevisionSnapshot('<p>Operatives approach Airlock 4.</p>', 'Draft v1');
  assert.strictEqual(s1.wordCount, 4);
  assert.strictEqual(s1.label, 'Draft v1');

  let list = [];
  for (let i = 0; i < 35; i++) {
    list = appendRevisionSnapshot(list, createRevisionSnapshot(`<p>Version ${i}</p>`, `v${i}`), 30);
  }
  assert.strictEqual(list.length, 30);
  assert.strictEqual(list[0].label, 'v34');

  const diff = computeLineDiff(stripHtmlForDiff('<p>Line A</p><p>Line B</p>'), stripHtmlForDiff('<p>Line A</p><p>Line C</p>'));
  assert.ok(diff.some((d) => d.type === 'equal' && d.text === 'Line A'));
  assert.ok(diff.some((d) => d.type === 'remove' && d.text === 'Line B'));
  assert.ok(diff.some((d) => d.type === 'add' && d.text === 'Line C'));
});

test('Phase 12.2 canonRulesLinterService: flags d20, AP, TL bounds, synthetic structure, unresolved links & autofixes', () => {
  const prose = '<p>Roll 1d20 Perception costing 2 AP to spot [[Unknown Artifact]].</p>';
  const diags = lintCanonContent({
    text: prose,
    knownTitles: ['Plasma Carbine'],
    element: {
      type: 'Persona',
      fields: {
        species: 'Android Synthetic',
        vitality: 20,
        'tech-level': 7,
        'meta-level': -1,
        skills: { Gunnery: 14 }
      }
    },
    isCreationPhase: true
  });

  const codes = new Set(diags.map((d) => d.ruleCode));
  assert.ok(codes.has('NO_D20_RESOLUTION'));
  assert.ok(codes.has('NO_ACTION_POINTS'));
  assert.ok(codes.has('UNRESOLVED_WIKI_LINK'));
  assert.ok(codes.has('SYNTHETIC_STRUCTURE_CANON'));
  assert.ok(codes.has('TECH_LEVEL_BOUNDS'));
  assert.ok(codes.has('META_LEVEL_BOUNDS'));
  assert.ok(codes.has('SKILL_RANK_CAP'));

  const d20Diag = diags.find((d) => d.ruleCode === 'NO_D20_RESOLUTION');
  const fixed = applyAutoFix(prose, d20Diag);
  assert.ok(fixed.includes('2d10'));
  assert.ok(!/1d20/i.test(fixed));
});

test('Phase 12.3 campaignCalendarService: advances across month/year boundaries and calculates moon phases', () => {
  const cal = createDefaultCalendarState('galactic_standard');
  const start = cal.currentDate; // Year 3140, month 0, day 1
  const nextMonth = advanceCalendarDate(start, 36, cal.config);
  assert.strictEqual(nextMonth.monthIndex, 1);
  assert.strictEqual(nextMonth.day, 1);
  assert.ok(compareCalendarDates(nextMonth, start) > 0);

  const nextYear = advanceCalendarDate(start, 360, cal.config);
  assert.strictEqual(nextYear.year, 3141);
  assert.strictEqual(nextYear.monthIndex, 0);
  assert.strictEqual(nextYear.day, 1);

  const label = formatCalendarDate(nextYear, cal.config);
  assert.ok(label.includes('3141 GSY'));

  const moons = getMoonPhases(nextMonth, cal.config);
  assert.strictEqual(moons.length, 2);
  assert.ok(moons[0].illuminationPct >= 0 && moons[0].illuminationPct <= 100);
});

test('Phase 12.4 PagedPdfCompiler, DocumentExporters & Operator Sanitizer strip GM secrets and produce valid EPUB/ZIP/Word/RTF', () => {
  const sampleNodes = [
    {
      id: 'act_1',
      title: 'Act I: Breach the Relay',
      summary: 'Infiltrate the orbital station.',
      content:
        '<blockquote class="ade-read-aloud">Warning klaxons pulse through the mist.</blockquote>' +
        '<div class="ade-gm-secret" data-gm-secret="true"><strong>GM SECRET:</strong> Commander Voss is a synth sleeper.</div>' +
        '<p>Operatives seal the bulkheads.</p>',
      fields: {
        threats: [{ name: 'Turret Mk2', tier: 'Standard', hp: 60, dr: '6', attack: '+6' }]
      }
    }
  ];

  // 1. Paged HTML Architect vs Operator-Safe + TOC
  const { html: fullHtml } = PagedPdfCompiler.compileToPagedHtml(sampleNodes, {
    adventureTitle: 'Relay Breach',
    includeToc: true,
    includeGmSecrets: true
  });
  assert.ok(fullHtml.includes('Table of Contents'));
  assert.ok(fullHtml.includes('Commander Voss is a synth sleeper'));
  assert.ok(fullHtml.includes('Turret Mk2'));

  const { html: safeHtml } = PagedPdfCompiler.compileToPagedHtml(sampleNodes, {
    adventureTitle: 'Relay Breach',
    includeToc: true,
    includeGmSecrets: false
  });
  assert.ok(safeHtml.includes('Warning klaxons pulse'));
  assert.ok(!safeHtml.includes('Commander Voss is a synth sleeper'));
  assert.ok(!safeHtml.includes('Turret Mk2'));

  // 2. Module package operator sanitization strips inline GM secret blocks too
  const strippedDirect = stripGmSecretHtmlBlocks(sampleNodes[0].content);
  assert.ok(!strippedDirect.includes('Commander Voss'));
  const playerPkg = buildSanitizedOperatorPackagePayload(
    { projectName: 'Relay', scenarios: [{ id: 'act_1', title: 'Act I', content: sampleNodes[0].content }] },
    []
  );
  assert.ok(!playerPkg.scenarios[0].content.includes('Commander Voss'));

  // 3. Pure-JS ZIP & EPUB 3 Bytes
  const crcCheck = crc32(new TextEncoder().encode('123456789'));
  assert.strictEqual(crcCheck, 0xcbf43926);

  const zipBytes = buildZipBytes([{ path: 'hello.txt', data: 'world' }]);
  assert.strictEqual(zipBytes[0], 0x50); // 'P'
  assert.strictEqual(zipBytes[1], 0x4b); // 'K'
  assert.strictEqual(zipBytes[2], 0x03);
  assert.strictEqual(zipBytes[3], 0x04);

  const epubBytes = compileToEpubBytes(sampleNodes, {
    adventureTitle: 'Relay Breach',
    includeGmSecrets: false
  });
  const epubAscii = new TextDecoder('latin1').decode(epubBytes);
  assert.ok(epubAscii.startsWith('PK\x03\x04'));
  assert.ok(epubAscii.includes('mimetypeapplication/epub+zip'));
  assert.ok(epubAscii.includes('META-INF/container.xml'));
  assert.ok(epubAscii.includes('OEBPS/content.opf'));
  assert.ok(epubAscii.includes('OEBPS/nav.xhtml'));
  assert.ok(!epubAscii.includes('Commander Voss is a synth sleeper'));

  // 4. Word HTML & RTF
  const wordDoc = compileToWordHtmlString(sampleNodes, { adventureTitle: 'Relay Breach', includeGmSecrets: false });
  assert.ok(wordDoc.includes('urn:schemas-microsoft-com:office:word'));
  assert.ok(!wordDoc.includes('Commander Voss is a synth sleeper'));

  const rtf = compileToRtfString(sampleNodes, { adventureTitle: 'Relay Breach', includeGmSecrets: false });
  assert.ok(rtf.startsWith('{\\rtf1'));
  assert.ok(!rtf.includes('Commander Voss is a synth sleeper'));
});
