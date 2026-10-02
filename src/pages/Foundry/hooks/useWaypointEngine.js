/**
 * @file useWaypointEngine.js
 * @description Hook managing spatial waypoint collision detection, bi-directional triggers,
 * automated scene-beat routing, and trigger actions (REVEAL_BEAT, ADVANCE_SCENARIO, TRIGGER_AIME)
 * for the Adventure Development Environment (ADE).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AudioService } from '../../../services/audioService';
import { VttEventBus } from '../../../utils/vttEventBus';

export const useWaypointEngine = ({
  activeMap,
  updateMap,
  activeScenario,
  flatScenarios,
  setActiveScenarioId,
  storyContext,
  studioMode,
  liveTokens = [],
  setSaveStatusText,
  setIsFloatingAimeOpen,
  setAimePromptInput
}) => {
  const [waypointPromptData, setWaypointPromptData] = useState(null);
  const promptedWaypointsRef = useRef(new Set());
  const [editingWaypointId, setEditingWaypointId] = useState(null);

  // Execute Waypoint Trigger Effect (Immediate Auto or GM-Confirmed)
  const executeWaypointTrigger = useCallback((wp, tok, linkedBeat) => {
    if (!wp || !activeMap) return;

    // 1. Mark Waypoint as isTriggered in activeMap
    const updatedWaypoints = (activeMap.waypoints || []).map(w => 
      w.id === wp.id ? { ...w, isTriggered: true } : w
    );
    if (updateMap) {
      updateMap(activeMap.id, { waypoints: updatedWaypoints });
    }

    // 2. Audible feedback
    AudioService.playCriticalChime(true);

    const action = wp.triggerAction || 'REVEAL_BEAT';

    // 3. Action: ADVANCE_SCENARIO (Shift Active Story Branch)
    if (action === 'ADVANCE_SCENARIO' && wp.targetScenarioId) {
      const targetScenario = (flatScenarios || []).find(s => s.id === wp.targetScenarioId);
      if (setActiveScenarioId) setActiveScenarioId(wp.targetScenarioId);
      
      VttEventBus.emit('story-waypoint-tripped', {
        waypoint: wp,
        token: tok,
        scenarioId: wp.targetScenarioId,
        scenarioTitle: targetScenario?.title || 'Next Scenario',
        action: 'ADVANCE_SCENARIO',
        targetScenarioId: wp.targetScenarioId
      });

      if (storyContext?.cronicle?.recordDelta) {
        storyContext.cronicle.recordDelta({
          type: 'SCENARIO_TRANSITION',
          title: `Scenario Shift: ${targetScenario?.title || wp.targetScenarioId}`,
          description: `Operative ${tok?.label || tok?.name || 'Party'} reached "${wp.name}". Transitioned to new scenario branch.`
        });
      }
    } 
    // 4. Action: TRIGGER_AIME (Generate Sensory Atmosphere)
    else if (action === 'TRIGGER_AIME') {
      if (setIsFloatingAimeOpen) setIsFloatingAimeOpen(true);
      const prompt = wp.readAloudText 
        ? `Describe the squad's arrival at "${wp.name}": ${wp.readAloudText}`
        : `Describe the tactical arrival and environment of "${wp.name}".`;
      if (setAimePromptInput) setAimePromptInput(prompt);

      VttEventBus.emit('story-waypoint-tripped', {
        waypoint: wp,
        token: tok,
        action: 'TRIGGER_AIME',
        beat: prompt
      });

      if (storyContext?.cronicle?.recordDelta) {
        storyContext.cronicle.recordDelta({
          type: 'AIME_NARRATION',
          title: `Sensory Atmosphere: ${wp.name}`,
          description: prompt
        });
      }
    }
    // 5. Action: REVEAL_BEAT (Default: Advance Scene Beat)
    else {
      VttEventBus.emit('story-foundry-milestone-reached', {
        scenarioId: activeScenario?.id,
        scenarioTitle: activeScenario?.title,
        waypointName: wp.name,
        beat: linkedBeat || wp.readAloudText || wp.name
      });

      VttEventBus.emit('story-waypoint-tripped', {
        waypoint: wp,
        token: tok,
        action: 'REVEAL_BEAT',
        beat: linkedBeat || wp.readAloudText
      });

      if (storyContext?.cronicle?.recordDelta) {
        storyContext.cronicle.recordDelta({
          type: 'WAYPOINT_REACHED',
          title: `Objective Reached: ${wp.name}`,
          description: linkedBeat || wp.readAloudText || `Squad reached tactical waypoint ${wp.name}.`
        });
      }
    }

    setWaypointPromptData(null);
  }, [activeMap, updateMap, flatScenarios, setActiveScenarioId, storyContext?.cronicle, activeScenario, setIsFloatingAimeOpen, setAimePromptInput]);

  // Reset all waypoints for testing or fresh sessions
  const handleResetAllWaypoints = useCallback(() => {
    if (!activeMap || !updateMap) return;
    promptedWaypointsRef.current.clear();
    const updated = (activeMap.waypoints || []).map(w => ({ ...w, isTriggered: false }));
    updateMap(activeMap.id, { waypoints: updated });
    AudioService.playTerminalBeep(900, 0.04);
  }, [activeMap, updateMap]);

  // Spatial Proximity Collision Watcher
  useEffect(() => {
    if (!activeMap?.waypoints || activeMap.waypoints.length === 0 || !liveTokens || liveTokens.length === 0) return;

    const waypoints = activeMap.waypoints;
    liveTokens.forEach(tok => {
      const tx = tok.x || 0;
      const ty = tok.y || 0;

      waypoints.forEach((wp, wIdx) => {
        if (wp.isTriggered) return;
        const radius = wp.radius || 60;
        const dist = Math.hypot(tx - wp.x, ty - wp.y);
        const promptKey = `${tok.id}_${wp.id || wIdx}`;

        if (dist <= radius && !promptedWaypointsRef.current.has(promptKey)) {
          promptedWaypointsRef.current.add(promptKey);

          // Find linked beat if specified
          const rawBeats = activeScenario?.fields?.sceneBeats || '';
          const beatsArr = rawBeats.split('\n').map(b => b.trim()).filter(Boolean);
          const linkedBeat = wp.linkedBeatIndex !== undefined ? beatsArr[wp.linkedBeatIndex] : (beatsArr[wIdx] || null);

          // Check if autoTrigger is enabled
          if (wp.autoTrigger) {
            executeWaypointTrigger(wp, tok, linkedBeat);
          } else {
            const targetScenario = wp.targetScenarioId ? (flatScenarios || []).find(s => s.id === wp.targetScenarioId) : null;
            AudioService.playCriticalChime(false);
            setWaypointPromptData({
              waypoint: wp,
              token: tok,
              linkedBeat,
              readAloudText: wp.readAloudText || activeScenario?.content?.slice(0, 160) || null,
              action: wp.triggerAction || 'REVEAL_BEAT',
              targetScenarioId: wp.targetScenarioId,
              targetScenarioTitle: targetScenario?.title || null
            });
          }
        }
      });
    });
  }, [liveTokens, studioMode, activeMap?.waypoints, activeScenario, executeWaypointTrigger, flatScenarios]);

  // Listen to remote or canvas-dispatched waypoint events
  useEffect(() => {
    const unsub = VttEventBus.on('story-waypoint-tripped', (payload) => {
      if (payload?.waypoint && !payload.waypoint.isTriggered) {
        const key = `${payload.token?.id || 'tok'}_${payload.waypoint.id}`;
        if (!promptedWaypointsRef.current.has(key)) {
          promptedWaypointsRef.current.add(key);
          if (payload.waypoint.autoTrigger) {
            executeWaypointTrigger(payload.waypoint, payload.token, payload.beat);
          } else {
            const targetScenario = payload.waypoint.targetScenarioId 
              ? (flatScenarios || []).find(s => s.id === payload.waypoint.targetScenarioId) 
              : null;
            setWaypointPromptData({
              waypoint: payload.waypoint,
              token: payload.token,
              linkedBeat: payload.beat,
              readAloudText: payload.waypoint.readAloudText || null,
              action: payload.action || payload.waypoint.triggerAction || 'REVEAL_BEAT',
              targetScenarioId: payload.waypoint.targetScenarioId,
              targetScenarioTitle: targetScenario?.title || null
            });
          }
        }
      }
    });
    return unsub;
  }, [executeWaypointTrigger, flatScenarios]);

  // Handle Waypoint Prompt Confirmation
  const handleConfirmWaypointBeat = useCallback((promptData) => {
    if (!promptData) return;
    executeWaypointTrigger(promptData.waypoint, promptData.token, promptData.linkedBeat);
  }, [executeWaypointTrigger]);

  const handleAddWaypoint = useCallback(() => {
    if (!activeMap || !updateMap) return;
    const existing = activeMap.waypoints || [];
    const newWp = {
      id: `wp_${uuidv4()}`,
      name: `Waypoint ${String.fromCharCode(65 + (existing.length % 26))}: Sector Objective`,
      x: 350 + (existing.length * 90) % 600,
      y: 350 + (existing.length * 70) % 500,
      radius: 60,
      type: 'objective',
      linkedBeatIndex: Math.min(existing.length, 10),
      readAloudText: 'The squad enters the designated waypoint perimeter. Shadows pulse with alert signals.'
    };

    updateMap(activeMap.id, {
      waypoints: [...existing, newWp]
    });
    AudioService.playTerminalBeep(1300, 0.04);
  }, [activeMap, updateMap]);

  const handleArmWaypointTool = useCallback(() => {
    VttEventBus.emit('arm-stage-tool', { tool: 'waypoint' });
    AudioService.playTerminalBeep(1350, 0.03);
  }, []);

  const handlePanToWaypoint = useCallback((wp) => {
    if (wp && typeof wp.x === 'number' && typeof wp.y === 'number') {
      VttEventBus.emit('pan-stage-to', { x: wp.x, y: wp.y });
    }
  }, []);

  const handleDeleteWaypoint = useCallback((wpId) => {
    if (!activeMap || !updateMap) return;
    const remaining = (activeMap.waypoints || []).filter(w => w.id !== wpId);
    updateMap(activeMap.id, { waypoints: remaining });
    AudioService.playTerminalBeep(900, 0.03);
  }, [activeMap, updateMap]);

  const handleAutoRouteFromBeats = useCallback(() => {
    if (!activeMap || !updateMap || !activeScenario) return;
    const rawBeats = activeScenario.fields?.sceneBeats || '';
    const beatsArr = rawBeats.split('\n').map(b => b.trim()).filter(Boolean);
    if (beatsArr.length === 0) {
      AudioService.playTerminalBeep(600, 0.05);
      if (setSaveStatusText) {
        setSaveStatusText('No Scene Beats defined. Add beats in Story Weaver first.');
        setTimeout(() => setSaveStatusText('All changes saved'), 5000);
      }
      return;
    }

    const startX = 280;
    const startY = 280;
    const newWaypoints = beatsArr.map((beat, idx) => ({
      id: `wp_beat_${idx}_${uuidv4().slice(0, 8)}`,
      name: `Objective ${String.fromCharCode(65 + (idx % 26))}: ${beat.slice(0, 24)}`,
      x: startX + (idx % 4) * 220,
      y: startY + Math.floor(idx / 4) * 190,
      radius: 65,
      type: 'objective',
      linkedBeatIndex: idx,
      readAloudText: `Beat #${idx + 1}: ${beat}`
    }));

    updateMap(activeMap.id, { waypoints: newWaypoints });
    AudioService.playCriticalChime(true);
  }, [activeMap, updateMap, activeScenario, setSaveStatusText]);

  const handleToggleAutoTrigger = useCallback((waypointId, autoVal) => {
    if (!activeMap || !updateMap) return;
    const updated = (activeMap.waypoints || []).map(w => 
      w.id === waypointId ? { ...w, autoTrigger: autoVal } : w
    );
    updateMap(activeMap.id, { waypoints: updated });
  }, [activeMap, updateMap]);

  return {
    waypointPromptData,
    setWaypointPromptData,
    editingWaypointId,
    setEditingWaypointId,
    executeWaypointTrigger,
    handleResetAllWaypoints,
    handleConfirmWaypointBeat,
    handleToggleAutoTrigger,
    handleAddWaypoint,
    handleArmWaypointTool,
    handlePanToWaypoint,
    handleDeleteWaypoint,
    handleAutoRouteFromBeats
  };
};
