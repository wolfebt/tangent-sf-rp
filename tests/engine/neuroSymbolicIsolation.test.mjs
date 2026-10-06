/**
 * @file neuroSymbolicIsolation.test.mjs
 * @description Unit tests for Pillar 2 Neuro-Symbolic Isolation & Fast Decoding:
 * - Deterministic authority of adeEngineBridge over generative AI actions
 * - Enforcing GBNF Action Grammars & strict JSON schemas
 * - Ensuring AIME never directly updates CronicleDeltaRecord without engine validation
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  validateAndCommitActionRequest 
} from '../../src/services/ade/adeEngineBridge.ts';
import { 
  TANGENT_ACTION_REQUEST_GBNF, 
  TANGENT_ACTION_REQUEST_JSON_SCHEMA 
} from '../../src/grammars/storyBeatGrammar.ts';
import { VttEventBus } from '../../src/utils/vttEventBus.ts';

test('Neuro-Symbolic Isolation: GBNF Grammar & JSON Schema specifications', () => {
  assert.ok(typeof TANGENT_ACTION_REQUEST_GBNF === 'string');
  assert.ok(TANGENT_ACTION_REQUEST_GBNF.includes('requestId'));
  assert.ok(TANGENT_ACTION_REQUEST_GBNF.includes('proposedDelta'));

  assert.equal(TANGENT_ACTION_REQUEST_JSON_SCHEMA.type, 'OBJECT');
  assert.ok(TANGENT_ACTION_REQUEST_JSON_SCHEMA.properties.requestId);
  assert.ok(TANGENT_ACTION_REQUEST_JSON_SCHEMA.properties.action);
  assert.ok(TANGENT_ACTION_REQUEST_JSON_SCHEMA.properties.proposedDelta);
});

test('Neuro-Symbolic Isolation: Tech Level Mismatch causes direct refusal (Delta NOT committed)', () => {
  const operative = {
    id: 'op_valen',
    name: 'Valen Cross',
    techLevel: 2,
    skills: { Slicing: 4 },
    attributes: { logic: 2 }
  };

  const highTechTerminal = {
    id: 'terminal_precursor',
    title: 'Precursor Dimensional Node',
    techLevel: 5
  };

  const actionRequest = {
    requestId: 'req_hack_01',
    action: 'Slice precursor dimensional conduit and bypass firewall',
    actorId: 'op_valen',
    targetId: 'terminal_precursor',
    proposedDelta: {
      action: 'grant_access',
      explanation: 'AI attempted to unlock precursor vault'
    }
  };

  let deltaCommitted = false;
  const result = validateAndCommitActionRequest({
    request: actionRequest,
    operative,
    targetEntity: highTechTerminal,
    onCommitDelta: () => {
      deltaCommitted = true;
    }
  });

  assert.equal(result.allowed, false);
  assert.equal(result.refusalReason, 'Tech_Level_Low');
  assert.equal(deltaCommitted, false); // Engine prevented illegal state mutation!
  assert.equal(result.adjudicatedMandate.systemIntent, 'REFUSE_ACTION');
});

test('Neuro-Symbolic Isolation: Failed mechanical check rejects delta execution', () => {
  const operative = {
    id: 'op_scout',
    name: 'Kira Vance',
    skills: { Kinetics: 1 },
    attributes: { might: 1 }
  };

  const actionRequest = {
    requestId: 'req_strike_02',
    action: 'Melee strike heavy reinforced bulkhead',
    actorId: 'op_scout',
    targetId: 'door_sec',
    proposedDelta: {
      action: 'breach_door'
    }
  };

  let deltaCommitted = false;
  // Force low dice roll: [2, 1] -> sum 3 + 1 + 1 = 5 vs DC 15 -> Margin -10
  const result = validateAndCommitActionRequest({
    request: actionRequest,
    operative,
    targetDC: 15,
    diceOverride: [2, 1],
    onCommitDelta: () => {
      deltaCommitted = true;
    }
  });

  assert.equal(result.allowed, false);
  assert.equal(deltaCommitted, false);
  assert.equal(result.adjudicatedMandate.systemIntent, 'EXECUTE_FAILURE');
});

test('Neuro-Symbolic Isolation: Successful check validates and commits CronicleDeltaRecord', () => {
  const operative = {
    id: 'op_lead',
    name: 'Commander Sarah',
    skills: { Kinetics: 5 },
    attributes: { might: 3 }
  };

  const actionRequest = {
    requestId: 'req_strike_03',
    action: 'Precision kinetic strike to sever coolant line',
    actorId: 'op_lead',
    targetId: 'conduit_coolant',
    proposedDelta: {
      action: 'coolant_severed'
    },
    sensoryNarration: 'Coolant line shears cleanly under focused impact.'
  };

  let committedDelta = null;
  // High dice roll: [8, 7] -> sum 15 + 5 + 3 = 23 vs DC 12 -> Margin +11
  const result = validateAndCommitActionRequest({
    request: actionRequest,
    operative,
    targetDC: 12,
    diceOverride: [8, 7],
    onCommitDelta: (delta) => {
      committedDelta = delta;
    }
  });

  assert.equal(result.allowed, true);
  assert.ok(committedDelta);
  assert.equal(committedDelta.action, 'coolant_severed');
  assert.equal(committedDelta.entityId, 'op_lead');
  assert.equal(result.adjudicatedMandate.systemIntent, 'EXECUTE_SUCCESS');
  assert.ok(result.appliedDelta.value.margin >= 0);
});
