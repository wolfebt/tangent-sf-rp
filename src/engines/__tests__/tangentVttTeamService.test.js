import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VTT_ROLES,
  CANONICAL_SQUADS,
  CANONICAL_TEAMS,
  createDefaultSquadRoster,
  createDefaultTeamRoster,
  isUserArchitect,
  canUserControlToken,
  bindCharactersToUser,
  setUserRole
} from '../../services/vttSquadService.js';

test('Tangent SFF RP — VTT Squad & Fireteam Permissions Service', async (t) => {
  await t.test('Canonical squads and default roster integrity', () => {
    assert.equal(CANONICAL_SQUADS.length, 4);
    assert.equal(CANONICAL_TEAMS.length, 4);
    const alpha = CANONICAL_SQUADS.find(t => t.id === 'squad_alpha');
    assert.ok(alpha);
    assert.equal(alpha.color, '#06b6d4');

    const defaultRoster = createDefaultSquadRoster();
    assert.ok(defaultRoster.squads.length >= 4);
    assert.equal(defaultRoster.userAssignments.gm_host.role, VTT_ROLES.ARCHITECT_LEAD);
  });

  await t.test('isUserArchitect recognizes Lead Architect and Co-Architect roles', () => {
    assert.equal(isUserArchitect({ role: VTT_ROLES.ARCHITECT_LEAD }), true);
    assert.equal(isUserArchitect({ role: VTT_ROLES.CO_ARCHITECT }), true);
    assert.equal(isUserArchitect({ role: VTT_ROLES.OPERATOR }), false);
    assert.equal(isUserArchitect({ role: VTT_ROLES.OPERATIVE }), false);
    assert.equal(isUserArchitect({ role: VTT_ROLES.SPECTATOR }), false);
    assert.equal(isUserArchitect(null), false);
  });

  await t.test('canUserControlToken grants control to Architects and bound Operators', () => {
    const heroToken = { id: 'tok_hero_1', label: 'Vanguard' };
    const droneToken = { id: 'tok_drone_1', label: 'Cyber Drone' };
    const enemyToken = { id: 'tok_enemy_9', label: 'Syndicate Gunner' };

    // 1. Lead Architect can move anything
    const gmUser = { role: VTT_ROLES.ARCHITECT_LEAD, assignedTokenIds: [] };
    assert.equal(canUserControlToken(gmUser, enemyToken, 'user_gm'), true);

    // 2. Co-Architect can move anything
    const coGmUser = { role: VTT_ROLES.CO_ARCHITECT, assignedTokenIds: [] };
    assert.equal(canUserControlToken(coGmUser, droneToken, 'user_co_gm'), true);

    // 3. Operator can only move bound tokens
    const operatorUser = { role: VTT_ROLES.OPERATOR, assignedTokenIds: ['tok_hero_1', 'tok_drone_1'] };
    assert.equal(canUserControlToken(operatorUser, heroToken, 'user_player'), true);
    assert.equal(canUserControlToken(operatorUser, droneToken, 'user_player'), true);
    assert.equal(canUserControlToken(operatorUser, enemyToken, 'user_player'), false); // Cannot move enemy
  });

  await t.test('bindCharactersToUser binds multiple characters to a single player', () => {
    const roster = createDefaultSquadRoster();
    const updated = bindCharactersToUser(roster, 'player_1', ['tok_hero_1', 'tok_drone_1']);
    
    assert.deepEqual(updated.userAssignments.player_1.assignedTokenIds, ['tok_hero_1', 'tok_drone_1']);
    assert.equal(updated.userAssignments.player_1.role, VTT_ROLES.OPERATOR);

    // Bind another unit (e.g. vehicle)
    const expanded = bindCharactersToUser(updated, 'player_1', ['tok_vehicle_speed']);
    assert.equal(expanded.userAssignments.player_1.assignedTokenIds.length, 3);
  });

  await t.test('setUserRole updates role to Co-Architect', () => {
    const roster = createDefaultSquadRoster();
    const updated = setUserRole(roster, 'player_2', VTT_ROLES.CO_ARCHITECT);
    assert.equal(updated.userAssignments.player_2.role, VTT_ROLES.CO_ARCHITECT);
  });
});
