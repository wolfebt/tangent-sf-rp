/**
 * @file adeStoreCentralization.test.mjs
 * @description Unit tests for ADE Store: Centralized Zustand adeStore & State Parity.
 * Tests:
 * 1. Default store state initialization (activeView, storyWorkspaceTab, activeCockpitDeck, modals)
 * 2. State mutations for navigation (setActiveView, setStoryWorkspaceTab, setActivePillar)
 * 3. Studio Mode & Live Session area maximization (collapsing outliner tree on live_session)
 * 4. Perspective mode (architect vs operator toggle)
 * 5. Viewport Split and preflight telemetry updates
 * 6. Dock and Tree layout toggles (toggleTreeExpanded, toggleRightDock, toggleSplitView)
 * 7. Modal manager suite (setModal, toggleModal, closeAllModals)
 * 8. Typed editingElement lifecycle
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { useADEStore } from '../../src/pages/Foundry/store/adeStore.ts';

test('adeStore: Default state initializes with canonical values', () => {
  const state = useADEStore.getState();
  assert.equal(state.studioMode, 'development');
  assert.equal(state.perspectiveMode, 'architect');
  assert.equal(state.activePillar, 'mission_control');
  assert.equal(state.activeView, 'mission_control');
  assert.equal(state.storyWorkspaceTab, 'weaver');
  assert.equal(state.activeCockpitDeck, 'inspector');
  assert.equal(state.isTreeExpanded, true);
  assert.equal(state.isRightDockOpen, true);
  assert.equal(state.isSplitView, false);
  assert.equal(state.editingElement, null);
  assert.equal(state.modals.compiler, false);
  assert.equal(state.modals.cronicle, false);
  assert.equal(state.modals.print, false);
});

test('adeStore: View and Workspace Tab mutations work deterministically', () => {
  const store = useADEStore.getState();
  
  store.setActiveView('scenarios');
  assert.equal(useADEStore.getState().activeView, 'scenarios');

  store.setStoryWorkspaceTab('stage');
  assert.equal(useADEStore.getState().storyWorkspaceTab, 'stage');

  store.setStoryWorkspaceTab('tactical');
  assert.equal(useADEStore.getState().storyWorkspaceTab, 'tactical');

  store.setActiveCockpitDeck('tactical');
  assert.equal(useADEStore.getState().activeCockpitDeck, 'tactical');

  store.setActivePillar('narrative');
  assert.equal(useADEStore.getState().activePillar, 'narrative');
});

test('adeStore: Studio Mode transitions and collapses tree to maximize area in live_session', () => {
  const store = useADEStore.getState();

  // Ensure tree is expanded first
  store.setIsTreeExpanded(true);
  assert.equal(useADEStore.getState().isTreeExpanded, true);

  // Transition to live_session -> should automatically collapse outliner tree
  store.setStudioMode('live_session');
  assert.equal(useADEStore.getState().studioMode, 'live_session');
  assert.equal(useADEStore.getState().isTreeExpanded, false, 'Tree should collapse in live_session to maximize stage area');

  // Transition back to development
  store.setStudioMode('development');
  assert.equal(useADEStore.getState().studioMode, 'development');
});

test('adeStore: Perspective mode toggles between architect and operator', () => {
  const store = useADEStore.getState();

  store.setPerspectiveMode('architect');
  assert.equal(useADEStore.getState().perspectiveMode, 'architect');

  store.togglePerspectiveMode();
  assert.equal(useADEStore.getState().perspectiveMode, 'operator');

  store.togglePerspectiveMode();
  assert.equal(useADEStore.getState().perspectiveMode, 'architect');
});

test('adeStore: Viewport split and preflight telemetry mutations', () => {
  const store = useADEStore.getState();

  store.setViewportSplit('canvas_only');
  assert.equal(useADEStore.getState().viewportSplit, 'canvas_only');

  store.setViewportSplit('side_by_side');
  assert.equal(useADEStore.getState().viewportSplit, 'side_by_side');

  store.setPreflightTelemetry({
    score: 85,
    issues: ['Missing scene beats in Sector 4'],
    warnings: ['3 unassigned tokens']
  });

  const telem = useADEStore.getState().preflightTelemetry;
  assert.equal(telem.score, 85);
  assert.equal(telem.issues.length, 1);
  assert.equal(telem.warnings.length, 1);
});

test('adeStore: Layout dock toggles invert state cleanly', () => {
  const store = useADEStore.getState();

  const prevTree = store.isTreeExpanded;
  store.toggleTreeExpanded();
  assert.equal(useADEStore.getState().isTreeExpanded, !prevTree);
  store.toggleTreeExpanded();
  assert.equal(useADEStore.getState().isTreeExpanded, prevTree);

  const prevDock = store.isRightDockOpen;
  store.toggleRightDock();
  assert.equal(useADEStore.getState().isRightDockOpen, !prevDock);
  store.toggleRightDock();
  assert.equal(useADEStore.getState().isRightDockOpen, prevDock);

  const prevSplit = store.isSplitView;
  store.toggleSplitView();
  assert.equal(useADEStore.getState().isSplitView, !prevSplit);
  store.toggleSplitView();
  assert.equal(useADEStore.getState().isSplitView, prevSplit);
});

test('adeStore: Modal manager controls modal visibility and bulk close', () => {
  const store = useADEStore.getState();

  store.setModal('cronicle', true);
  assert.equal(useADEStore.getState().modals.cronicle, true);

  store.toggleModal('print');
  assert.equal(useADEStore.getState().modals.print, true);

  store.closeAllModals();
  const closedState = useADEStore.getState().modals;
  for (const key of Object.keys(closedState)) {
    assert.equal(closedState[key], false, `Modal ${key} should be closed`);
  }
});

test('adeStore: Typed editingElement lifecycle management', () => {
  const store = useADEStore.getState();

  const mockElement = {
    id: 'elem-tactical-01',
    title: 'Plasma Breaching Charge',
    type: 'Item',
    category: 'Explosives',
    fields: { damage: '4d10', blastRadius: 15 }
  };

  store.setEditingElement(mockElement);
  assert.deepEqual(useADEStore.getState().editingElement, mockElement);

  store.setEditingElement(null);
  assert.equal(useADEStore.getState().editingElement, null);
});
