/**
 * @file graphUtils.test.mjs
 * @description Unit tests for graphUtils (tree flattening, link extraction, layout math, continuity audit, Mermaid export).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  flattenScenarios,
  extractAllLinks,
  calculateAutoLayout,
  snapPosition,
  calculateBoundingBox,
  auditGraphContinuity,
  exportGraphToMermaid,
  exportGraphToJson,
  getNodeTypeConfig
} from '../../src/pages/Foundry/StoryModule/workspaces/graph/graphUtils.js';

test('graphUtils: getNodeTypeConfig coverage', () => {
  const act = getNodeTypeConfig('Act');
  assert.equal(act.accentColor, '#a855f7');
  const scene = getNodeTypeConfig('scene');
  assert.equal(scene.accentColor, '#06b6d4');
  const fallback = getNodeTypeConfig('unknown');
  assert.equal(fallback.accentColor, '#64748b');
});

test('graphUtils: flattenScenarios hierarchy & depth', () => {
  const mockScenarios = [
    {
      id: 'root-1',
      title: 'Act 1: Station Insertion',
      type: 'Act',
      children: [
        {
          id: 'scene-1',
          title: 'Scene 1: Airlock Breach',
          type: 'Scene',
          children: [
            {
              id: 'encounter-1',
              title: 'Encounter: Turret Sentry',
              type: 'Encounter'
            }
          ]
        },
        {
          id: 'scene-2',
          title: 'Scene 2: Data Vault',
          type: 'Scene'
        }
      ]
    },
    {
      id: 'root-2',
      title: 'Act 2: Escape Hyperlane',
      type: 'Act'
    }
  ];

  const { flatNodes, hierarchyLinks } = flattenScenarios(mockScenarios);
  assert.equal(flatNodes.length, 5, 'Flattens all 5 scenarios');

  const root1 = flatNodes.find(n => n.id === 'root-1');
  assert.equal(root1.depth, 0);

  const scene1 = flatNodes.find(n => n.id === 'scene-1');
  assert.equal(scene1.depth, 1);
  assert.equal(scene1.parentId, 'root-1');

  const sentry = flatNodes.find(n => n.id === 'encounter-1');
  assert.equal(sentry.depth, 2);
  assert.equal(sentry.parentId, 'scene-1');

  // Hierarchy links count: root-1->scene-1, root-1->scene-2, scene-1->encounter-1 = 3 links
  assert.equal(hierarchyLinks.length, 3);
});

test('graphUtils: extractAllLinks explicit choices & connections', () => {
  const flatNodes = [
    {
      id: 'node-a',
      title: 'Branch Fork',
      fields: {
        choices: [
          { id: 'c1', text: 'Hack door', targetScenarioId: 'node-b', checkDc: 14, attribute: 'intellect' }
        ],
        connections: [
          { id: 'conn-1', targetId: 'node-c', label: 'Sneak through vents' }
        ]
      }
    },
    { id: 'node-b', title: 'Security Room' },
    { id: 'node-c', title: 'Air Ducts' }
  ];

  const links = extractAllLinks(flatNodes, [], [], { showHierarchy: true, showWaypoints: true });
  assert.equal(links.length, 2, 'Extracts choice and custom connection');

  const choiceLink = links.find(l => l.targetId === 'node-b');
  assert.ok(choiceLink);
  assert.equal(choiceLink.checkDc, 14);
  assert.equal(choiceLink.attribute, 'intellect');
  assert.equal(choiceLink.label, 'Hack door');

  const connLink = links.find(l => l.targetId === 'node-c');
  assert.ok(connLink);
  assert.equal(connLink.label, 'Sneak through vents');
});

test('graphUtils: calculateAutoLayout Horizontal and Vertical', () => {
  const flatNodes = [
    { id: 'n1', depth: 0, siblingIndex: 0 },
    { id: 'n2', depth: 1, siblingIndex: 0 },
    { id: 'n3', depth: 1, siblingIndex: 1 }
  ];

  // Horizontal layout
  const hPos = calculateAutoLayout(flatNodes, [], 'horizontal');
  assert.equal(hPos['n1'].x, 80);
  assert.equal(hPos['n1'].y, 80);
  assert.equal(hPos['n2'].x, 80 + 380);
  assert.equal(hPos['n3'].x, 80 + 380);
  assert.ok(hPos['n3'].y > hPos['n2'].y, 'Siblings placed on separate rows');

  // Vertical layout
  const vPos = calculateAutoLayout(flatNodes, [], 'vertical');
  assert.equal(vPos['n1'].y, 80);
  assert.equal(vPos['n2'].y, 80 + 280);
  assert.equal(vPos['n3'].y, 80 + 280);
  assert.ok(vPos['n3'].x > vPos['n2'].x, 'Siblings placed on separate columns');
});

test('graphUtils: snapPosition to 20px grid', () => {
  const raw = { x: 84, y: 118 };
  const snapped = snapPosition(raw, 20);
  assert.equal(snapped.x, 80);
  assert.equal(snapped.y, 120);
});

test('graphUtils: calculateBoundingBox', () => {
  const flatNodes = [
    { id: 'n1' },
    { id: 'n2' }
  ];
  const getNodePos = (n) => n.id === 'n1' ? { x: 100, y: 100 } : { x: 500, y: 400 };

  const bbox = calculateBoundingBox(flatNodes, getNodePos, 300, 180, 100);
  assert.ok(bbox.minX <= 0);
  assert.ok(bbox.maxX >= 800);
  assert.ok(bbox.width >= 800);
  assert.ok(bbox.height >= 480);
});

test('graphUtils: auditGraphContinuity flags orphans and dead ends', () => {
  const flatNodes = [
    { id: 'root', title: 'Start', depth: 0 },
    { id: 'orphan', title: 'Lost Scene', depth: 1 },
    { id: 'deadend', title: 'Corridor', depth: 1, type: 'Scene' },
    { id: 'final', title: 'Boss Fight', depth: 1, type: 'Climax' }
  ];

  const links = [
    { sourceId: 'root', targetId: 'deadend' },
    { sourceId: 'deadend', targetId: 'final' },
    { sourceId: 'orphan', targetId: 'final' }
    // 'orphan' has no incoming links (orphan)!
    // All non-Climax nodes have outgoing links, so deadEndCount is 0!
  ];

  const audit = auditGraphContinuity(flatNodes, links);
  assert.equal(audit.orphanCount, 1, 'Flags 1 orphan');
  assert.equal(audit.deadEndCount, 0, 'No dead ends');
  assert.ok(audit.issues.some(i => i.id === 'orphan_orphan'));
});

test('graphUtils: exportGraphToMermaid syntax generation', () => {
  const flatNodes = [
    { id: '1', title: 'Bridge Approach', type: 'Scene' },
    { id: '2', title: 'Main Terminal', type: 'Choice' }
  ];
  const links = [
    { sourceId: '1', targetId: '2', label: 'Hack', checkDc: 12, attribute: 'intellect' }
  ];

  const mermaid = exportGraphToMermaid(flatNodes, links, 'LR', 'Test Mission');
  assert.ok(mermaid.includes('flowchart LR'));
  assert.ok(mermaid.includes('Bridge Approach'));
  assert.ok(mermaid.includes('Main Terminal'));
  assert.ok(mermaid.includes('INTELLECT CR 12'));
});

test('graphUtils: exportGraphToJson valid JSON', () => {
  const flatNodes = [{ id: '1', title: 'Hub', type: 'Act' }];
  const links = [];
  const jsonStr = exportGraphToJson(flatNodes, links, { projectName: 'Omega Station' });
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.campaign, 'Omega Station');
  assert.equal(parsed.nodes.length, 1);
});
