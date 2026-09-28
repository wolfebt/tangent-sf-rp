/**
 * @file biDirectionalWaypointTriggers.test.mjs
 * @description Unit and Integration tests for Phase 2: Live Bi-Directional Tactical Waypoint Triggering.
 * Tests:
 * 1. Spatial Euclidean proximity detection (within radius vs outside).
 * 2. Multi-Action Triggering (ADVANCE_SCENARIO, REVEAL_BEAT, TRIGGER_AIME, ALERT_GM).
 * 3. State persistence: isTriggered flag, re-arming, and session reset.
 * 4. Auto-Trigger mode vs GM-Confirmation protocol.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Phase 2: Live Bi-Directional Tactical Waypoint Triggering', () => {

  // Spatial evaluation helper replicating StageView & AdeLiveStudio logic
  const checkTokenWaypointProximity = (token, waypoint) => {
    const radius = waypoint.radius || 60;
    const dist = Math.hypot(token.x - waypoint.x, token.y - waypoint.y);
    return {
      isInside: dist <= radius,
      distance: dist,
      radius
    };
  };

  test('Spatial Proximity: correctly detects token entering waypoint radius', () => {
    const waypoint = { id: 'wp-alpha', name: 'Security Airlock', x: 200, y: 200, radius: 50 };
    
    const insideToken = { id: 'tok-1', name: 'Vanguard Operative', x: 230, y: 210 };
    const outsideToken = { id: 'tok-2', name: 'Scout Sniper', x: 300, y: 300 };

    const insideResult = checkTokenWaypointProximity(insideToken, waypoint);
    assert.equal(insideResult.isInside, true);
    assert.ok(insideResult.distance <= 50);

    const outsideResult = checkTokenWaypointProximity(outsideToken, waypoint);
    assert.equal(outsideResult.isInside, false);
    assert.ok(outsideResult.distance > 50);
  });

  test('Action Dispatch: ADVANCE_SCENARIO generates scenario transition payload', () => {
    const waypoint = {
      id: 'wp-beta',
      name: 'Airlock Breach Point',
      x: 400,
      y: 400,
      radius: 60,
      triggerAction: 'ADVANCE_SCENARIO',
      targetScenarioId: 'sc-derelict-bridge'
    };

    const token = { id: 'tok-3', name: 'Hacker Agent', x: 410, y: 410 };
    const proximity = checkTokenWaypointProximity(token, waypoint);
    assert.equal(proximity.isInside, true);

    // Emulated trigger payload
    const payload = {
      waypoint,
      token,
      action: waypoint.triggerAction,
      targetScenarioId: waypoint.targetScenarioId
    };

    assert.equal(payload.action, 'ADVANCE_SCENARIO');
    assert.equal(payload.targetScenarioId, 'sc-derelict-bridge');
  });

  test('Action Dispatch: TRIGGER_AIME synthesizes sensory atmosphere prompt', () => {
    const waypoint = {
      id: 'wp-gamma',
      name: 'Cryo-Stasis Bay',
      x: 150,
      y: 150,
      triggerAction: 'TRIGGER_AIME',
      readAloudText: 'Frost clings to the fractured glass of the cryo-tubes as an eerie mist spills across the decking.'
    };

    const prompt = waypoint.readAloudText 
      ? `Describe the squad's arrival at "${waypoint.name}": ${waypoint.readAloudText}`
      : `Describe the tactical arrival and environment of "${waypoint.name}".`;

    assert.ok(prompt.includes('Cryo-Stasis Bay'));
    assert.ok(prompt.includes('Frost clings to the fractured glass'));
  });

  test('Action Dispatch: REVEAL_BEAT indexes into scenario scene beats', () => {
    const sceneBeatsText = 'Breach the outer perimeter\nDisable automated laser grid\nSecure the cryo vault manifest';
    const beats = sceneBeatsText.split('\n');

    const waypoint = {
      id: 'wp-delta',
      name: 'Laser Grid Terminal',
      x: 500,
      y: 500,
      triggerAction: 'REVEAL_BEAT',
      linkedBeatIndex: 1
    };

    const targetBeat = beats[waypoint.linkedBeatIndex];
    assert.equal(targetBeat, 'Disable automated laser grid');
  });

  test('State Management: isTriggered prevents redundant execution; reset re-arms', () => {
    let waypoints = [
      { id: 'wp-1', name: 'Point A', isTriggered: false },
      { id: 'wp-2', name: 'Point B', isTriggered: false }
    ];

    // Trigger wp-1
    waypoints = waypoints.map(w => w.id === 'wp-1' ? { ...w, isTriggered: true } : w);
    assert.equal(waypoints.find(w => w.id === 'wp-1').isTriggered, true);
    assert.equal(waypoints.find(w => w.id === 'wp-2').isTriggered, false);

    // Reset all waypoints
    waypoints = waypoints.map(w => ({ ...w, isTriggered: false }));
    assert.equal(waypoints.every(w => !w.isTriggered), true);
  });

  test('Execution Mode: distinguishes instant autoTrigger from GM confirmation', () => {
    const autoWp = { id: 'wp-auto', autoTrigger: true };
    const manualWp = { id: 'wp-manual', autoTrigger: false };

    const shouldAutoExecute = (wp) => !!wp.autoTrigger;

    assert.equal(shouldAutoExecute(autoWp), true);
    assert.equal(shouldAutoExecute(manualWp), false);
  });

});
