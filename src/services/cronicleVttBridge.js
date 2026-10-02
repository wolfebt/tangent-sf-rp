/**
 * @file cronicleVttBridge.js
 * @description Bridges real-time Stage & Tabletop combat events directly into CRONICLE living memory.
 * Subscribes to VTT events (token defeat, bulkhead breaches, hazards, loot drops, milestones)
 * and generates structured state deltas for referee review & approval.
 */


/**
 * Pure converter: transforms a Stage combat or tabletop event into a structured CRONICLE delta.
 *
 * @param {string} eventType The event name
 * @param {object} payload The event detail
 * @returns {object|null} Proposed CRONICLE state delta
 */
export function createDeltaFromCombatEvent(eventType, payload = {}) {
  const deltaId = `delta_combat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();

  switch (eventType) {
    case 'token-defeated': {
      const entityId = payload.entityId || payload.token?.id || 'unknown_entity';
      const entityName = payload.name || payload.token?.label || payload.token?.name || 'Operative';
      const status = payload.status || 'defeated';
      return {
        id: deltaId,
        timestamp,
        source: 'stage-combat',
        entityId,
        action: 'update_status',
        target: status,
        value: status,
        explanation: `Stage combat: ${entityName} fell in combat (${status}).`,
        rawEvent: payload
      };
    }

    case 'stage-bulkhead-toggled': {
      const bulkheadId = payload.objectId || payload.bulkheadId || 'bulkhead';
      const isOpen = Boolean(payload.isOpen);
      const actionText = isOpen ? 'breached/opened' : 'sealed shut';
      const actorText = payload.operativeId ? ` by operative ${payload.operativeId}` : '';
      return {
        id: deltaId,
        timestamp,
        source: 'stage-combat',
        entityId: bulkheadId,
        action: 'add_timeline_event',
        sceneTitle: 'Bulkhead State Transition',
        value: `Bulkhead ${bulkheadId} was ${actionText}${actorText}.`,
        explanation: `Bulkhead status transition registered on tactical stage.`,
        rawEvent: payload
      };
    }

    case 'omnicortex-loot-dispensed': {
      const gearId = payload.omnicortexGearId || payload.itemName || 'Tactical Salvage';
      const recipient = payload.operativeId || 'party';
      return {
        id: deltaId,
        timestamp,
        source: 'stage-combat',
        entityId: recipient,
        action: 'add_item',
        target: gearId,
        value: gearId,
        explanation: `Tactical gear retrieved on Stage: ${gearId}.`,
        rawEvent: payload
      };
    }

    case 'stage-hazard-toggled': {
      const hazardId = payload.objectId || payload.hazardId || 'hazard_emitter';
      const isActive = Boolean(payload.isActive);
      const hazardType = payload.hazardType || 'Environmental Hazard';
      return {
        id: deltaId,
        timestamp,
        source: 'stage-combat',
        entityId: hazardId,
        action: isActive ? 'add_hazard' : 'remove_hazard',
        target: hazardType,
        value: hazardType,
        explanation: `Environmental hazard (${hazardType}) ${isActive ? 'activated' : 'vented/cleared'} on Stage.`,
        rawEvent: payload
      };
    }

    case 'story-foundry-milestone-reached': {
      const milestoneId = payload.milestoneId || payload.scenarioId || 'milestone';
      const scenarioTitle = payload.scenarioTitle || 'Scenario Milestone';
      const beatName = payload.beatText || payload.waypointName || `Beat #${(payload.beatIndex ?? 0) + 1}`;
      const statusText = payload.isCompleted ? 'Accomplished' : 'Milestone Logged';
      return {
        id: deltaId,
        timestamp,
        source: 'stage-combat',
        entityId: milestoneId,
        action: 'add_timeline_event',
        sceneTitle: scenarioTitle,
        value: `Tactical milestone: ${beatName} (${statusText}).`,
        explanation: `Milestone reached in live scenario.`,
        rawEvent: payload
      };
    }

    case 'story-foundry-node-triggered': {
      const nodeId = payload.storyElementId || payload.objectId || payload.nodeId || 'terminal';
      const actionName = payload.action || 'Terminal Accessed';
      const actorText = payload.operativeId ? ` by operative ${payload.operativeId}` : '';
      return {
        id: deltaId,
        timestamp,
        source: 'stage-combat',
        entityId: nodeId,
        action: 'add_timeline_event',
        sceneTitle: 'Interactive Node Triggered',
        value: `Node ${nodeId}: ${actionName}${actorText}.`,
        explanation: `Tactical node access registered from Stage.`,
        rawEvent: payload
      };
    }

    default:
      return null;
  }
}

/**
 * Initializes listeners for Stage combat and tabletop events, automatically
 * converting and staging deltas in CRONICLE for referee approval.
 *
 * @param {object} options
 * @param {Function} options.stageCronicleDeltas Function to stage pending deltas in CRONICLE
 * @param {Function} [options.onDeltaStaged] Optional callback fired when a delta is created
 * @returns {Function} Unsubscribe cleanup function
 */
export function initCronicleVttBridge({ stageCronicleDeltas, onDeltaStaged, eventBus } = {}) {
  if (typeof stageCronicleDeltas !== 'function') {
    console.warn('[CronicleVttBridge] stageCronicleDeltas function is required');
    return () => {};
  }

  const monitoredEvents = [
    'token-defeated',
    'stage-bulkhead-toggled',
    'omnicortex-loot-dispensed',
    'stage-hazard-toggled',
    'story-foundry-milestone-reached',
    'story-foundry-node-triggered'
  ];

  const unsubs = [];

  monitoredEvents.forEach(eventType => {
    const handleEvent = (payload) => {
      try {
        const delta = createDeltaFromCombatEvent(eventType, payload);
        if (delta) {
          stageCronicleDeltas([delta]);
          if (typeof onDeltaStaged === 'function') {
            onDeltaStaged(delta);
          }
        }
      } catch (err) {
        console.warn(`[CronicleVttBridge] Error processing event ${eventType}:`, err);
      }
    };

    if (eventBus && typeof eventBus.on === 'function') {
      unsubs.push(eventBus.on(eventType, handleEvent));
    } else if (typeof window !== 'undefined') {
      const wrapped = (e) => handleEvent(e.detail);
      window.addEventListener(eventType, wrapped);
      unsubs.push(() => window.removeEventListener(eventType, wrapped));
    }
  });

  return () => {
    unsubs.forEach(unsub => {
      try {
        unsub();
      } catch {
        // ignore errors during unmount cleanup
      }
    });
  };
}
