import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_PING_TYPES,
  createTacticalPing,
  filterExpiredPings
} from '../../services/mapPingService.js';

test('Tangent SFF RP — Tactical Ping & Beacon Overlay Service', async (t) => {
  await t.test('Canonical ping types integrity', () => {
    assert.equal(CANONICAL_PING_TYPES.length, 4);
    const danger = CANONICAL_PING_TYPES.find(p => p.type === 'danger');
    assert.ok(danger);
    assert.equal(danger.defaultColor, '#ef4444');
  });

  await t.test('createTacticalPing generates proper coordinate pulse with team color', () => {
    const ping = createTacticalPing(150.7, 320.2, 'danger', 'Ambush Warning', 'Operative Ghost', '#06b6d4');

    assert.ok(ping.id.startsWith('ping_'));
    assert.equal(ping.x, 151);
    assert.equal(ping.y, 320);
    assert.equal(ping.type, 'danger');
    assert.equal(ping.label, 'Ambush Warning');
    assert.equal(ping.color, '#06b6d4'); // Inherits team color
    assert.equal(ping.senderName, 'Operative Ghost');
    assert.ok(ping.expiresAt > ping.createdAt);
  });

  await t.test('filterExpiredPings purges pings older than expiration duration', () => {
    const now = Date.now();
    const activePing = { id: 'p1', expiresAt: now + 4000 };
    const expiredPing = { id: 'p2', expiresAt: now - 1000 };

    const filtered = filterExpiredPings([activePing, expiredPing], now);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, 'p1');
  });
});
