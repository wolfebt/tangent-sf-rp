import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  BASTION_ROLES,
  BASTION_VOICE_CONTRACTS,
  resolveBastionSessionState,
} from '../../src/services/bastionSessionService.js';
import {
  CRISP_FORM_PRESETS,
  CANONICAL_FACTION_SKINS,
  buildCrispVisualPrompt,
  classifyBastionIntent,
  isSafetyInterruptPrompt,
  evaluateArchiveCoverageAndExtrapolation,
  stripStreamingFollowupTag,
  parseAndEnrichBastionTurnPayload,
  composeBastionSystemPrompt,
  sendBastionChatMessage,
} from '../../src/services/bastionService.js';
import { CANONICAL_WHISPER_CARDS } from '../../src/services/bastionWhisperService.js';
import { AimeAgent } from '../../src/engine/ai/AimeAgent.ts';

describe('Phase 3 Locked BASTION Persona, Halt Invariant, Follow-Up/Gems & CRISP Suite', () => {
  it('1. Enforces Modern Minimalist voice register and strict Operator ("you") vs Architect ("we") role contracts', () => {
    assert.equal(BASTION_VOICE_CONTRACTS.operator.voiceRegister, 'modern_minimalist');
    assert.equal(BASTION_VOICE_CONTRACTS.architect.voiceRegister, 'modern_minimalist');
    assert.equal(BASTION_VOICE_CONTRACTS.operator.pronounMode, 'you');
    assert.equal(BASTION_VOICE_CONTRACTS.architect.pronounMode, 'we');
    assert.match(BASTION_VOICE_CONTRACTS.operator.directiveSummary, /"you"/i);
    assert.match(BASTION_VOICE_CONTRACTS.architect.directiveSummary, /"we"/i);

    const operatorPrompt = composeBastionSystemPrompt({
      prompt: 'How do Called Shots work?',
      role: BASTION_ROLES.OPERATOR,
      contextData: {
        activeCharacter: { name: 'Lyra' },
        gmSecrets: 'Hidden Syndicate Mole',
      },
    });
    const architectPrompt = composeBastionSystemPrompt({
      prompt: 'How should we balance encounter CR for two squads?',
      role: BASTION_ROLES.ARCHITECT,
    });

    assert.match(operatorPrompt, /Modern Minimalist/i);
    assert.match(operatorPrompt, /ALWAYS address the player directly as "you" \/ "your"/i);
    assert.ok(!operatorPrompt.includes('Hidden Syndicate Mole'), 'Operator prompt must strip gmSecrets');
    assert.match(architectPrompt, /plural, partnered "we" \/ "us" \/ "our" category/i);
    // Must prohibit artificial terminal chatter and sycophantic filler
    assert.match(operatorPrompt, /NEVER open with conversational fluff/i);
    assert.match(operatorPrompt, /NEVER add artificial sci-fi terminal roleplay/i);
  });

  it('2. Pre-generates collapsible Follow-Up appends and Continuation Gems on every turn while stripping raw trailer tags', async () => {
    const rawStreaming =
      'Vitality and Health each start at Base 30 (+5 per 1 CP).<bastion_follow';
    assert.equal(
      stripStreamingFollowupTag(rawStreaming),
      'Vitality and Health each start at Base 30 (+5 per 1 CP).'
    );

    const rawComplete =
      '• **Base Pools**: Biological characters start at 30 Vitality and 30 Health.\n' +
      '• **Armor Diminishing Returns**: Cross-domain layers grant +1 DR per 5 DR.\n' +
      '<bastion_followup>{"followUps":["Would you invest CP in Vitality or Armor DR first?","How will your Stamina Base Toughness pair with Light Rests?"],"gems":[{"label":"Base Pools","point":"Base Pools","prompt":"Explain Base 30 Vitality and Health scaling for your character."}]}</bastion_followup>';

    const parsed = parseAndEnrichBastionTurnPayload(rawComplete, {
      prompt: 'Explain Vitality and Armor',
      role: BASTION_ROLES.OPERATOR,
    });

    assert.ok(!parsed.cleanText.includes('<bastion_followup>'));
    assert.equal(parsed.followUps.length, 2);
    assert.equal(parsed.gems.length, 1);
    assert.equal(parsed.gems[0].label, 'Base Pools');

    // End-to-end turn check (deterministic local cognition when live gateway has no key in unit tests)
    const turnReply = await sendBastionChatMessage({
      prompt: 'How does 2d10 critical hit damage and +10 roll bonus work?',
      role: BASTION_ROLES.OPERATOR,
    });
    assert.ok(!turnReply.text.includes('<bastion_followup>'));
    assert.ok(Array.isArray(turnReply.followUps) && turnReply.followUps.length >= 1);
    assert.ok(Array.isArray(turnReply.gems) && turnReply.gems.length >= 2);
  });

  it('3. ALWAYS HALTS AND INFORMS USER when information is unavailable, extrapolating ONLY on explicit request', async () => {
    const unindexedPrompt = 'What are the canonical stats of the Xylosian Void-Kraken?';

    const coverageCheck = evaluateArchiveCoverageAndExtrapolation({
      prompt: unindexedPrompt,
      ragResults: [],
      contextData: null,
      intent: 'QUICK_RULING',
    });
    assert.equal(coverageCheck.shouldHalt, true);
    assert.equal(coverageCheck.extrapolationRequested, false);
    assert.ok(coverageCheck.missingTerms.some((t) => /Xylosian|Void-Kraken/i.test(t)));

    // Operator Halt check ("you")
    const opHalt = await sendBastionChatMessage({
      prompt: unindexedPrompt,
      role: BASTION_ROLES.OPERATOR,
    });
    assert.equal(opHalt.isHalted, true);
    assert.match(opHalt.text, /Archive Halt — Information Unavailable/i);
    assert.match(opHalt.text, /\byour\b|\byou\b/i);
    assert.ok(
      opHalt.gems.some((g) => /Extrapolate via Modular Matrix/i.test(g.label)),
      'Halted response must surface an explicit Extrapolate via Modular Matrix gem'
    );

    // Architect Halt check ("we" / "our")
    const archHalt = await sendBastionChatMessage({
      prompt: unindexedPrompt,
      role: BASTION_ROLES.ARCHITECT,
    });
    assert.equal(archHalt.isHalted, true);
    assert.match(archHalt.text, /\bour\b|\bwe\b/i);

    // Explicit Extrapolation Request MUST NOT halt
    const explicitExtrapPrompt =
      'Extrapolate a rules-legal profile for our campaign using the Volume II Modular Matrix for: Xylosian Void-Kraken';
    const extrapCoverage = evaluateArchiveCoverageAndExtrapolation({
      prompt: explicitExtrapPrompt,
      ragResults: [],
      contextData: null,
      intent: classifyBastionIntent(explicitExtrapPrompt),
    });
    assert.equal(extrapCoverage.extrapolationRequested, true);
    assert.equal(extrapCoverage.shouldHalt, false);

    const extrapReply = await sendBastionChatMessage({
      prompt: explicitExtrapPrompt,
      role: BASTION_ROLES.ARCHITECT,
    });
    assert.equal(extrapReply.isHalted, false);
    assert.ok(!/Archive Halt — Information Unavailable/i.test(extrapReply.text));
  });

  it('4. Supports Universal CRISP / Hi-Fi Ink Visual Synthesis across Presets A-F and all 10 Faction Skins', async () => {
    assert.deepEqual(Object.keys(CRISP_FORM_PRESETS), ['A', 'B', 'C', 'D', 'E', 'F']);
    assert.equal(Object.keys(CANONICAL_FACTION_SKINS).length, 10);

    const visualQuery =
      'Generate a CRISP Preset C 5-view character concept sheet for an Alterian Enclave Visionary';
    assert.equal(classifyBastionIntent(visualQuery), 'VISUAL_CRISP_SYNTHESIS');

    const built = buildCrispVisualPrompt({ prompt: visualQuery });
    assert.equal(built.preset.key, 'C');
    assert.equal(built.skin.id, 'alterian');
    assert.match(built.formattedPrompt, /\[CONTENT PROMPT\]/);
    assert.match(built.formattedPrompt, /\[GUIDANCE PROMPT\]/);
    assert.match(built.formattedPrompt, /\[RENDERING PROMPT\]/);
    assert.match(built.formattedPrompt, /full body front view:1\.5/);
    assert.match(built.formattedPrompt, /Alterian Enclave/);

    const chatVisual = await sendBastionChatMessage({
      prompt: 'Create a CRISP Preset E mecha visual prompt for an Entari Combine heavy exo-rig',
      role: BASTION_ROLES.ARCHITECT,
    });
    assert.equal(chatVisual.isHalted, false);
    assert.match(chatVisual.text, /\[CONTENT PROMPT\]/);
    assert.match(chatVisual.text, /Preset E \(Vehicle \/ Mecha\)/);
    assert.match(chatVisual.text, /Entari Combine/);
  });

  it('5. Enforces [X] X-Card immediate pause, Custom Directives & Lines/Veils sync, clean CR whispers, and canonical rulebook sync', async () => {
    assert.equal(isSafetyInterruptPrompt('[X]'), true);
    assert.equal(isSafetyInterruptPrompt('X-Card'), true);
    assert.equal(isSafetyInterruptPrompt('How does Xeno stigma work?'), false);

    const safetyReply = await sendBastionChatMessage({
      prompt: '[X]',
      role: BASTION_ROLES.OPERATOR,
    });
    assert.equal(safetyReply.isSafetyPause, true);
    assert.match(safetyReply.text, /X-Card Acknowledged — Scene Paused/i);
    assert.match(safetyReply.text, /no explanation required/i);

    const sessionState = resolveBastionSessionState({
      user: { uid: 'gm-1' },
      campaignContext: { universeState: { id: 'c1', authorUid: 'gm-1' } },
    });
    const composed = composeBastionSystemPrompt({
      prompt: 'Audit 150 CP Sentinel',
      role: BASTION_ROLES.ARCHITECT,
      sessionState,
      customDirectives: 'Keep tone noir investigative.',
      safetyBoundaries: {
        lines: 'spiders, eye trauma',
        veils: 'surgical cyberware installation',
        xCardEnabled: true,
      },
    });
    assert.match(composed, /Keep tone noir investigative\./);
    assert.match(composed, /Hard Lines \(NEVER include or reference\): spiders, eye trauma/);
    assert.match(composed, /Soft Veils \(keep off-screen \/ fade to black\): surgical cyberware installation/);

    // Verify AimeAgent Tier 1 prompt includes Tabletop Safety ([X] & Lines/Veils)
    const aimePrompt = AimeAgent.assemblePrompt('Orbital dock arrival', {
      projectName: 'Horizon Rift',
    });
    assert.match(aimePrompt, /Tabletop Safety & X-Card:/i);
    assert.match(aimePrompt, /\[X\]/);

    // Verify Whisper Cards use CR/Defense and zero legacy "DC"
    for (const card of Object.values(CANONICAL_WHISPER_CARDS)) {
      assert.ok(
        !/\bDC\b/.test(`${card.title} ${card.summary} ${card.mechanicEffect}`),
        `Whisper card ${card.id} must not use legacy DC terminology`
      );
    }

    // Verify canonical rulebook files reflect Modern Minimalist + Strict Missing-Data Halt + AP
    const rootDir = process.cwd();
    const manifestMd = fs.readFileSync(
      path.join(rootDir, 'docs', 'game_rules', '00.01 BASTION SYSTEM PROMPT & ROUTING MANIFEST.md'),
      'utf8'
    );
    const gmGuidelinesMd = fs.readFileSync(
      path.join(rootDir, 'docs', 'game_rules', 'architect', '00.00 GM GUIDELINES.md'),
      'utf8'
    );
    assert.match(manifestMd, /Modern Minimalist Voice/);
    assert.match(manifestMd, /ALWAYS HALT AND INFORM THE USER IMMEDIATELY/);
    assert.match(manifestMd, /-5 AP Debt/);
    assert.ok(!manifestMd.includes('-5 XP Debt'));
    assert.match(gmGuidelinesMd, /Modern Minimalist Voice/);
    assert.match(gmGuidelinesMd, /ALWAYS HALT AND INFORM THE USER IMMEDIATELY/);
  });
});
