/**
 * @file artistHubFramework.test.mjs
 * @description Unit tests for ADE Artist Hub Modular Image Prompt Framework
 * (HIFI CHROMA & HI-FI SKETCH styles + 6 canonical templates).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARTIST_STYLE_OPTIONS,
  ARTIST_TEMPLATE_OPTIONS,
  getArtistStyleById,
  getArtistTemplateById,
  inferTemplateFromContext,
  buildDeterministicModularSections,
  parseAimeModularResponse,
  compileModularArtistPrompt
} from '../../src/services/artistHubFramework.js';
import { useADEStore } from '../../src/pages/Foundry/store/adeStore.ts';

test('artistHubFramework: Exposes exact 2 styles (HIFI CHROMA & HI-FI SKETCH) and 6 canonical templates', () => {
  assert.equal(ARTIST_STYLE_OPTIONS.length, 2);
  assert.deepEqual(
    ARTIST_STYLE_OPTIONS.map((s) => s.id),
    ['hifi_chroma', 'hifi_sketch']
  );

  assert.equal(ARTIST_TEMPLATE_OPTIONS.length, 6);
  assert.deepEqual(
    ARTIST_TEMPLATE_OPTIONS.map((t) => t.id),
    ['master', 'closeup', 'character_concept', 'architectural', 'vehicle', 'interior']
  );
});

test('artistHubFramework: Resolves style and template aliases including spelling variants', () => {
  assert.equal(getArtistStyleById('HIFI CHROMA').id, 'hifi_chroma');
  assert.equal(getArtistStyleById('HI-FI SKETCH').id, 'hifi_sketch');
  assert.equal(getArtistStyleById('unknown_style').id, 'hifi_chroma');

  assert.equal(getArtistTemplateById('archtectural').id, 'architectural');
  assert.equal(getArtistTemplateById('Close-Up').id, 'closeup');
  assert.equal(getArtistTemplateById('Character Concept Sheet').id, 'character_concept');
  assert.equal(getArtistTemplateById('Vehicle / Mech Design').id, 'vehicle');
  assert.equal(getArtistTemplateById('Interior Space').id, 'interior');
});

test('artistHubFramework: Master template omits empty FORM block while Close-Up & Character Concept include style-specific FORM tokens', () => {
  const sections = {
    subject: 'Auluran scout perched on a girder',
    narrative: 'Scanning the lower dockyard for syndicate patrols',
    settingStyle: 'Tangent Science Fantasy, Tech Level 3',
    context: 'Rain-swept orbital gantry',
    atmosphere: 'Low-key sodium and cyan contrast'
  };

  const masterChroma = compileModularArtistPrompt({
    styleId: 'hifi_chroma',
    templateId: 'master',
    aspectRatio: 'native',
    sections
  });

  assert.ok(masterChroma.fullPrompt.includes('[CONTENT PROMPT]'));
  assert.ok(masterChroma.fullPrompt.includes('[GUIDANCE PROMPT]'));
  assert.ok(masterChroma.fullPrompt.includes('[RENDERING PROMPT]'));
  assert.ok(masterChroma.fullPrompt.includes('pure lineless rendering'));
  assert.ok(!masterChroma.fullPrompt.includes('FORM:\n'), 'Master native should omit empty FORM block');

  const conceptChroma = compileModularArtistPrompt({
    styleId: 'hifi_chroma',
    templateId: 'character_concept',
    aspectRatio: 'native',
    sections
  });
  assert.ok(conceptChroma.fullPrompt.includes('FORM:\nPainterly character turnaround sheet'));
  assert.ok(conceptChroma.fullPrompt.includes('(face close-up profile:1.8)'));

  const conceptSketch = compileModularArtistPrompt({
    styleId: 'hifi_sketch',
    templateId: 'character_concept',
    aspectRatio: 'native',
    sections
  });
  assert.ok(conceptSketch.fullPrompt.includes('micron pen illustration'));
  assert.ok(conceptSketch.fullPrompt.includes('FORM:\nCharacter design sketchbook page'));
  assert.ok(conceptSketch.fullPrompt.includes('NEGATIVE PROMPT TOKENS:\nphotorealism, photography'));
});

test('artistHubFramework: Infers appropriate default templates from ADE Element context', () => {
  assert.equal(inferTemplateFromContext({ type: 'Persona', title: 'Commander Vane' }), 'character_concept');
  assert.equal(inferTemplateFromContext({ type: 'World', title: 'Aulura Prime' }), 'architectural');
  assert.equal(
    inferTemplateFromContext({ type: 'Setting', title: 'Reactor Sub-Deck Corridor' }),
    'interior'
  );
  assert.equal(
    inferTemplateFromContext({ type: 'Technology', title: 'Kestrel Stealth Corvette' }),
    'vehicle'
  );
  assert.equal(inferTemplateFromContext({ type: 'Item', title: 'Aether Chronometer' }), 'closeup');
});

test('artistHubFramework: Parses AIME tagged output and safely falls back on offline cognition stub', () => {
  const taggedOutput = `
<SUBJECT>Vanguard operative in scarred ceramic plate</SUBJECT>
<NARRATIVE>Bracing behind a buckled bulkhead during hull depressurization</NARRATIVE>
<SETTING_STYLE>Used-Future Cassette Sci-Fi, TL-3</SETTING_STYLE>
<CONTEXT>Depressurized starship cargo corridor with venting frost</CONTEXT>
<ATMOSPHERE>Harsh amber emergency strobes and deep shadow recesses</ATMOSPHERE>
`;

  const parsed = parseAimeModularResponse(taggedOutput, {
    seedPrompt: 'Vanguard operative',
    styleId: 'hifi_chroma',
    templateId: 'interior'
  });
  assert.equal(parsed.usedFallback, false);
  assert.equal(parsed.sections.subject, 'Vanguard operative in scarred ceramic plate');
  assert.equal(parsed.sections.atmosphere, 'Harsh amber emergency strobes and deep shadow recesses');

  const offlineStub = '[AIME LOCAL COGNITION]: Acknowledged, ARCHITECT. Consulting local heuristics...';
  const fallbackResult = parseAimeModularResponse(offlineStub, {
    seedPrompt: 'Ancient Progenitor Spire',
    styleId: 'hifi_sketch',
    templateId: 'architectural',
    element: {
      type: 'Setting',
      title: 'The Ivory Spire',
      fields: { negative_keywords: 'rust, exposed wires' }
    }
  });
  assert.equal(fallbackResult.usedFallback, true);
  assert.ok(fallbackResult.sections.subject.includes('Ancient Progenitor Spire'));
  assert.equal(fallbackResult.sections.extraNegative, 'rust, exposed wires');

  const compiledWithExtraNeg = compileModularArtistPrompt({
    styleId: 'hifi_sketch',
    templateId: 'architectural',
    sections: fallbackResult.sections
  });
  assert.ok(compiledWithExtraNeg.negativeTokens.endsWith('rust, exposed wires'));
});

test('adeStore: Supports global artistHub modal toggle and closeAllModals', () => {
  const store = useADEStore.getState();
  assert.equal(store.modals.artistHub, false);

  store.setModal('artistHub', true);
  assert.equal(useADEStore.getState().modals.artistHub, true);

  store.closeAllModals();
  assert.equal(useADEStore.getState().modals.artistHub, false);
});
