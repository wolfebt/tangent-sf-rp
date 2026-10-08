import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAssetTree } from './treeUtils.ts';
import { createDefaultAssetUnit } from '../../../schemas/assetUnitSchema.ts';

test('buildAssetTree - Builds recursive hierarchy from tree_path arrays', () => {
  const assets = [
    createDefaultAssetUnit({
      unit_id: 'ter_1',
      name: 'Red Sand',
      category: 'terrain_brush',
      tree_path: ['Environments', 'Desert', 'Martian']
    }),
    createDefaultAssetUnit({
      unit_id: 'ter_2',
      name: 'White Salt',
      category: 'terrain_brush',
      tree_path: ['Environments', 'Desert', 'Salt Flats']
    }),
    createDefaultAssetUnit({
      unit_id: 'prop_1',
      name: 'Cargo Box',
      category: 'doodad',
      tree_path: ['Props', 'Industrial']
    })
  ];

  const tree = buildAssetTree(assets);
  assert.equal(tree.children.size, 2, 'Should have 2 top-level folders: Environments and Props');
  
  const envNode = tree.children.get('Environments');
  assert.ok(envNode, 'Environments node must exist');
  assert.equal(envNode.children.size, 1, 'Environments should have Desert child');

  const desertNode = envNode.children.get('Desert');
  assert.ok(desertNode, 'Desert node must exist');
  assert.equal(desertNode.children.size, 2, 'Desert should have Martian and Salt Flats');

  const martianNode = desertNode.children.get('Martian');
  assert.ok(martianNode, 'Martian node must exist');
  assert.equal(martianNode.items.length, 1);
  assert.equal(martianNode.items[0].unit_id, 'ter_1');
});
