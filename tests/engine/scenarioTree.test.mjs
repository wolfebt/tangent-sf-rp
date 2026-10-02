/**
 * @file scenarioTree.test.mjs
 * @description Unit Test Suite for ADE Scenario Hierarchy & Tree Engine (scenarioTreeEngine.js).
 * Validates:
 * 1. Deep tree lookup & discovery (findNodeInTree)
 * 2. Hierarchy depth calculation (calculateNodeDepth)
 * 3. Breadcrumb navigation path resolution (getBreadcrumbPath)
 * 4. Circular dependency & descendant cycle prevention (isDescendant, canReparent)
 * 5. Safe node excision & insertion (removeNodeFromTree, insertNodeIntoParent)
 * 6. Parent reparenting & root promotions (moveNodeInTree)
 * 7. Sibling relative reordering (reorderNodeSiblings)
 * 8. Drag-and-drop relative reordering above/below (reorderRelativeNode)
 * 9. Tree hierarchy flattening & parentPath projection (flattenTree)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findNodeInTree,
  isDescendant,
  canReparent,
  calculateNodeDepth,
  getBreadcrumbPath,
  removeNodeFromTree,
  insertNodeIntoParent,
  moveNodeInTree,
  reorderNodeSiblings,
  reorderRelativeNode,
  flattenTree,
  TreeHistoryManager
} from '../../src/utils/scenarioTreeEngine.js';

function createSampleTree() {
  return [
    {
      id: 'act_1',
      title: 'Act 1: The Breach',
      type: 'Act',
      children: [
        {
          id: 'scene_1_1',
          title: 'Scene 1.1: Airlock Infiltration',
          type: 'Scene',
          children: [
            {
              id: 'beat_1_1_a',
              title: 'Beat 1.1.A: Laser Grid Bypass',
              type: 'Encounter',
              children: []
            }
          ]
        },
        {
          id: 'scene_1_2',
          title: 'Scene 1.2: Reactor Core Access',
          type: 'Scene',
          children: []
        }
      ]
    },
    {
      id: 'act_2',
      title: 'Act 2: The Escape',
      type: 'Act',
      children: [
        {
          id: 'scene_2_1',
          title: 'Scene 2.1: Hangar Bay Ambush',
          type: 'Scene',
          children: []
        }
      ]
    }
  ];
}

test('findNodeInTree: locates root, child, and deeply nested nodes', () => {
  const tree = createSampleTree();

  const act1 = findNodeInTree(tree, 'act_1');
  assert.ok(act1);
  assert.equal(act1.title, 'Act 1: The Breach');

  const scene11 = findNodeInTree(tree, 'scene_1_1');
  assert.ok(scene11);
  assert.equal(scene11.title, 'Scene 1.1: Airlock Infiltration');

  const beat = findNodeInTree(tree, 'beat_1_1_a');
  assert.ok(beat);
  assert.equal(beat.title, 'Beat 1.1.A: Laser Grid Bypass');

  assert.equal(findNodeInTree(tree, 'non_existent_id'), null);
  assert.equal(findNodeInTree([], 'act_1'), null);
  assert.equal(findNodeInTree(null, 'act_1'), null);
});

test('calculateNodeDepth: computes accurate 0-indexed hierarchical depths', () => {
  const tree = createSampleTree();

  assert.equal(calculateNodeDepth(tree, 'act_1'), 0);
  assert.equal(calculateNodeDepth(tree, 'act_2'), 0);
  assert.equal(calculateNodeDepth(tree, 'scene_1_1'), 1);
  assert.equal(calculateNodeDepth(tree, 'scene_1_2'), 1);
  assert.equal(calculateNodeDepth(tree, 'beat_1_1_a'), 2);
  assert.equal(calculateNodeDepth(tree, 'scene_2_1'), 1);
  assert.equal(calculateNodeDepth(tree, 'unknown_node'), -1);
});

test('getBreadcrumbPath: returns full title hierarchy path', () => {
  const tree = createSampleTree();

  const pathRoot = getBreadcrumbPath(tree, 'act_1');
  assert.deepEqual(pathRoot, ['Act 1: The Breach']);

  const pathDeep = getBreadcrumbPath(tree, 'beat_1_1_a');
  assert.deepEqual(pathDeep, [
    'Act 1: The Breach',
    'Scene 1.1: Airlock Infiltration',
    'Beat 1.1.A: Laser Grid Bypass'
  ]);

  assert.equal(getBreadcrumbPath(tree, 'missing_id'), null);
});

test('isDescendant and canReparent: prevents cycles and invalid reparenting', () => {
  const tree = createSampleTree();
  const act1 = findNodeInTree(tree, 'act_1');

  // Descendant checks
  assert.equal(isDescendant(act1.children, 'scene_1_1'), true);
  assert.equal(isDescendant(act1.children, 'beat_1_1_a'), true);
  assert.equal(isDescendant(act1.children, 'scene_2_1'), false);

  // Can reparent checks
  // Valid: move scene_2_1 into act_1
  assert.equal(canReparent(tree, 'scene_2_1', 'act_1'), true);

  // Valid: promote scene_1_1 to root (null parent)
  assert.equal(canReparent(tree, 'scene_1_1', null), true);

  // Invalid: cannot reparent a node into itself
  assert.equal(canReparent(tree, 'act_1', 'act_1'), false);

  // Invalid: cannot reparent act_1 into its own child (scene_1_1) or grandchild (beat_1_1_a)
  assert.equal(canReparent(tree, 'act_1', 'scene_1_1'), false);
  assert.equal(canReparent(tree, 'act_1', 'beat_1_1_a'), false);
});

test('removeNodeFromTree & insertNodeIntoParent: immutably modifies tree', () => {
  const tree = createSampleTree();

  const { cleanedNodes, removedNode } = removeNodeFromTree(tree, 'scene_1_2');
  assert.ok(removedNode);
  assert.equal(removedNode.id, 'scene_1_2');
  assert.equal(findNodeInTree(cleanedNodes, 'scene_1_2'), null);

  // Original tree is not mutated
  assert.ok(findNodeInTree(tree, 'scene_1_2'));

  // Insert into act_2
  const updatedTree = insertNodeIntoParent(cleanedNodes, 'act_2', removedNode);
  const act2Updated = findNodeInTree(updatedTree, 'act_2');
  assert.equal(act2Updated.children.length, 2);
  assert.equal(act2Updated.children[1].id, 'scene_1_2');
});

test('moveNodeInTree: reparents nodes across acts and supports promotion to root', () => {
  const tree = createSampleTree();

  // Move scene_1_2 from act_1 into act_2
  const movedTree = moveNodeInTree(tree, 'scene_1_2', 'act_2');
  const act1After = findNodeInTree(movedTree, 'act_1');
  const act2After = findNodeInTree(movedTree, 'act_2');

  assert.equal(act1After.children.length, 1);
  assert.equal(act1After.children[0].id, 'scene_1_1');
  assert.equal(act2After.children.some(c => c.id === 'scene_1_2'), true);

  // Promote beat_1_1_a to root level
  const rootPromoted = moveNodeInTree(movedTree, 'beat_1_1_a', null);
  assert.equal(rootPromoted.length, 3);
  assert.equal(rootPromoted[2].id, 'beat_1_1_a');
  assert.equal(calculateNodeDepth(rootPromoted, 'beat_1_1_a'), 0);

  // Attempting circular move (act_1 into scene_1_1) is safely rejected
  const rejectedMove = moveNodeInTree(tree, 'act_1', 'scene_1_1');
  assert.deepEqual(rejectedMove, tree);
});

test('reorderNodeSiblings: swaps sibling order with boundary protection', () => {
  const tree = createSampleTree();

  // Act 1 has scene_1_1 (idx 0) and scene_1_2 (idx 1)
  // Move scene_1_2 UP
  const movedUp = reorderNodeSiblings(tree, 'scene_1_2', 'up');
  const act1MovedUp = findNodeInTree(movedUp, 'act_1');
  assert.equal(act1MovedUp.children[0].id, 'scene_1_2');
  assert.equal(act1MovedUp.children[1].id, 'scene_1_1');

  // Move scene_1_2 UP again (should remain at 0 due to bounds check)
  const movedUpAgain = reorderNodeSiblings(movedUp, 'scene_1_2', 'up');
  const act1MovedAgain = findNodeInTree(movedUpAgain, 'act_1');
  assert.equal(act1MovedAgain.children[0].id, 'scene_1_2');

  // Move scene_1_2 DOWN
  const movedDown = reorderNodeSiblings(movedUp, 'scene_1_2', 'down');
  const act1MovedDown = findNodeInTree(movedDown, 'act_1');
  assert.equal(act1MovedDown.children[0].id, 'scene_1_1');
  assert.equal(act1MovedDown.children[1].id, 'scene_1_2');
});

test('reorderRelativeNode: reorders nodes above or below target nodes', () => {
  const tree = createSampleTree();

  // Move scene_1_2 ABOVE scene_1_1
  const aboveTree = reorderRelativeNode(tree, 'scene_1_2', 'scene_1_1', 'above');
  const act1Above = findNodeInTree(aboveTree, 'act_1');
  assert.equal(act1Above.children[0].id, 'scene_1_2');
  assert.equal(act1Above.children[1].id, 'scene_1_1');

  // Move scene_2_1 from Act 2 to BELOW beat_1_1_a inside scene_1_1
  const crossTree = reorderRelativeNode(tree, 'scene_2_1', 'beat_1_1_a', 'below');
  const scene11Cross = findNodeInTree(crossTree, 'scene_1_1');
  assert.equal(scene11Cross.children[0].id, 'beat_1_1_a');
  assert.equal(scene11Cross.children[1].id, 'scene_2_1');

  // Prevent moving into own descendant
  const invalidRelative = reorderRelativeNode(tree, 'act_1', 'beat_1_1_a', 'below');
  assert.deepEqual(invalidRelative, tree);
});

test('flattenTree: projects recursive hierarchy with parentPath metadata', () => {
  const tree = createSampleTree();
  const flat = flattenTree(tree);

  assert.equal(flat.length, 6);
  const beatItem = flat.find(item => item.id === 'beat_1_1_a');
  assert.ok(beatItem);
  assert.equal(
    beatItem.parentPath,
    'Act 1: The Breach ❯ Scene 1.1: Airlock Infiltration'
  );

  const act1Item = flat.find(item => item.id === 'act_1');
  assert.ok(act1Item);
  assert.equal(act1Item.parentPath, '');
});

test('TreeHistoryManager: transactional push, undo, redo, and limit bounds', () => {
  const initial = [{ id: '1', title: 'Scene 1' }];
  const history = new TreeHistoryManager(initial, 3);

  assert.equal(history.canUndo, false);
  assert.equal(history.canRedo, false);

  // Push state 2
  const state2 = [{ id: '1', title: 'Scene 1' }, { id: '2', title: 'Scene 2' }];
  history.push(state2);
  assert.equal(history.canUndo, true);
  assert.equal(history.canRedo, false);

  // Push state 3
  const state3 = [{ id: '1', title: 'Scene 1' }, { id: '2', title: 'Scene 2 Renamed' }];
  history.push(state3);

  // Undo back to state 2
  const undone1 = history.undo();
  assert.equal(undone1.length, 2);
  assert.equal(undone1[1].title, 'Scene 2');
  assert.equal(history.canRedo, true);

  // Undo back to initial
  const undone2 = history.undo();
  assert.equal(undone2.length, 1);
  assert.equal(undone2[0].title, 'Scene 1');
  assert.equal(history.canUndo, false);

  // Redo forward to state 2
  const redone1 = history.redo();
  assert.equal(redone1.length, 2);
  assert.equal(redone1[1].title, 'Scene 2');

  // Redo forward to state 3
  const redone2 = history.redo();
  assert.equal(redone2.length, 2);
  assert.equal(redone2[1].title, 'Scene 2 Renamed');
  assert.equal(history.canRedo, false);

  // Test reset
  history.reset([{ id: 'root', title: 'New Story' }]);
  assert.equal(history.canUndo, false);
  assert.equal(history.canRedo, false);
  assert.equal(history.present[0].title, 'New Story');
});
