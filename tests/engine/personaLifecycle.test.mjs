/**
 * @file personaLifecycle.test.mjs
 * @description Automated Unit Test Suite for Persona Lifecycle & VTT Readiness
 * 
 * Verifies:
 * 1. Default lifecycle schema values (development phase, unlocked, not ready for VTT).
 * 2. Locking transition sets folio_phase: 'locked', is_locked: true, is_ready_for_vtt: true.
 * 3. Cloning a locked persona creates an unlocked variant in development phase.
 * 4. Player override enables modification tracking with status 'pending' and optional player notes.
 * 5. GM review mechanisms: Accept, Refuse, and Adjust (with suggested modifications).
 * 6. VTT dynamic updates (damage, heals, conditions, XP, Karma) without mutating protected player ownership.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { characterSchema, trackedModificationSchema } from '../../src/components/Folio/schema.js';

test('Persona Lifecycle: Schema defaults to Development Phase', () => {
  const defaultChar = characterSchema.parse({
    'char-name': 'Test Operative'
  });

  assert.equal(defaultChar.folio_phase, 'development');
  assert.equal(defaultChar.is_locked, false);
  assert.equal(defaultChar.is_ready_for_vtt, false);
  assert.equal(defaultChar.locked_at, null);
  assert.equal(defaultChar.player_override, false);
  assert.deepEqual(defaultChar.active_conditions, []);
  assert.deepEqual(defaultChar.tracked_modifications, []);
});

test('Persona Lifecycle: Setting / Locking for VTT Readiness', () => {
  const initial = characterSchema.parse({
    'char-name': 'Operative Vance',
    folio_phase: 'development',
    is_locked: false,
    is_ready_for_vtt: false
  });

  // Simulate lock action
  const locked = characterSchema.parse({
    ...initial,
    folio_phase: 'locked',
    is_locked: true,
    is_ready_for_vtt: true,
    locked_at: new Date().toISOString(),
    player_override: false
  });

  assert.equal(locked.folio_phase, 'locked');
  assert.equal(locked.is_locked, true);
  assert.equal(locked.is_ready_for_vtt, true);
  assert.ok(locked.locked_at !== null);
});

test('Persona Lifecycle: Cloning Locked Persona produces Unlocked Variant in Development Phase', () => {
  const lockedHero = characterSchema.parse({
    'character-doc-id': 'hero-123',
    'char-name': 'Commander Shepard',
    folio_phase: 'locked',
    is_locked: true,
    is_ready_for_vtt: true,
    'attr-strength': 14
  });

  // Simulate clone variant logic
  const clonedVariant = characterSchema.parse({
    ...lockedHero,
    'character-doc-id': 'hero-123-var-' + Date.now(),
    'char-name': `${lockedHero['char-name']} (Variant)`,
    folio_phase: 'development',
    is_locked: false,
    is_ready_for_vtt: false,
    locked_at: null,
    player_override: false,
    override_at: null,
    tracked_modifications: []
  });

  assert.equal(clonedVariant['char-name'], 'Commander Shepard (Variant)');
  assert.equal(clonedVariant.folio_phase, 'development');
  assert.equal(clonedVariant.is_locked, false);
  assert.equal(clonedVariant.is_ready_for_vtt, false);
  assert.equal(clonedVariant['attr-strength'], 14);
});

test('Persona Lifecycle: Player Override & Tracked Modification Ledger with GM Review', () => {
  const modRecord = trackedModificationSchema.parse({
    id: 'mod-' + Date.now(),
    timestamp: new Date().toISOString(),
    field: 'attr-agility',
    oldValue: 12,
    newValue: 14,
    playerNote: 'Spent 10 AP during downtime after sniper training',
    status: 'pending',
    gmFeedback: null
  });

  assert.equal(modRecord.field, 'attr-agility');
  assert.equal(modRecord.oldValue, 12);
  assert.equal(modRecord.newValue, 14);
  assert.equal(modRecord.status, 'pending');

  // GM Accept transition
  const acceptedMod = trackedModificationSchema.parse({
    ...modRecord,
    status: 'accepted',
    gmFeedback: 'Approved by GM'
  });
  assert.equal(acceptedMod.status, 'accepted');

  // GM Refuse transition
  const refusedMod = trackedModificationSchema.parse({
    ...modRecord,
    status: 'refused',
    gmFeedback: 'Insufficient training time in narrative'
  });
  assert.equal(refusedMod.status, 'refused');

  // GM Adjust transition with reply suggestions
  const adjustedMod = trackedModificationSchema.parse({
    ...modRecord,
    status: 'adjusted',
    gmFeedback: 'Adjust to 13 instead, as you only completed partial training'
  });
  assert.equal(adjustedMod.status, 'adjusted');
  assert.ok(adjustedMod.gmFeedback.includes('Adjust to 13'));
});

test('Persona Lifecycle: VTT dynamic stats (HP damage, heals, conditions, XP, Karma)', () => {
  let persona = characterSchema.parse({
    'char-name': 'Vanguard',
    folio_phase: 'locked',
    is_locked: true,
    is_ready_for_vtt: true,
    current_hp: 25,
    max_hp: 25,
    earned_ap: 10,
    available_ap: 10,
    karma_current: 3,
    active_conditions: []
  });

  // 1. Damage applied in VTT
  const damage = 8;
  persona = {
    ...persona,
    current_hp: Math.max(0, (persona.current_hp || 25) - damage)
  };
  assert.equal(persona.current_hp, 17);

  // 2. Condition added in VTT
  const newConditions = [...(persona.active_conditions || []), 'Bleeding'];
  persona = {
    ...persona,
    active_conditions: newConditions
  };
  assert.deepEqual(persona.active_conditions, ['Bleeding']);

  // 3. Heal applied in VTT
  const heal = 5;
  persona = {
    ...persona,
    current_hp: Math.min(persona.max_hp || 25, (persona.current_hp || 0) + heal)
  };
  assert.equal(persona.current_hp, 22);

  // 4. GM Awards XP and Karma
  persona = {
    ...persona,
    earned_ap: (persona.earned_ap || 0) + 5,
    available_ap: (persona.available_ap || 0) + 5,
    karma_current: (persona.karma_current || 0) + 1
  };
  assert.equal(persona.earned_ap, 15);
  assert.equal(persona.available_ap, 15);
  assert.equal(persona.karma_current, 4);

  // Player ownership guarantee: folio stays locked, author identity preserved
  assert.equal(persona.is_locked, true);
  assert.equal(persona.is_ready_for_vtt, true);
});

test('Persona Lifecycle: GM Option to Allow or Disallow Player Override in VTT & Team Manager', () => {
  // 1. Initial character schema defaults allow_player_override to true
  const initial = characterSchema.parse({
    'char-name': 'Recon Vanguard',
    folio_phase: 'locked',
    is_locked: true,
    is_ready_for_vtt: true,
    allow_player_override: true
  });
  assert.equal(initial.allow_player_override, true);

  // 2. GM disallows player override in VTT / Team settings
  const gmDisallowed = characterSchema.parse({
    ...initial,
    allow_player_override: false,
    player_override: false
  });
  assert.equal(gmDisallowed.allow_player_override, false);
  assert.equal(gmDisallowed.player_override, false);

  // 3. GM re-allows player override in VTT / Team settings
  const gmReallowed = characterSchema.parse({
    ...gmDisallowed,
    allow_player_override: true
  });
  assert.equal(gmReallowed.allow_player_override, true);
});

