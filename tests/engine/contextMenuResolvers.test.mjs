import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveFolioMenu } from '../../src/components/UI/ContextMenu/resolvers/folioResolver.js';
import { resolveCortexMenu } from '../../src/components/UI/ContextMenu/resolvers/cortexResolver.js';
import { resolveAdeMenu } from '../../src/components/UI/ContextMenu/resolvers/adeResolver.js';
import { resolveStageMenu } from '../../src/components/UI/ContextMenu/resolvers/stageResolver.js';
import { resolveGlobalMenu } from '../../src/components/UI/ContextMenu/resolvers/globalResolver.js';
import { resolveContextMenu } from '../../src/components/UI/ContextMenu/resolvers/index.js';

test('resolveFolioMenu: Generates category actions and BASTION AI prompts for Identity', () => {
  let executedPrompt = null;
  const handlers = {
    activeOperative: { name: 'Vance Radek', species: 'Human', archetype: 'Sentinel', faction: 'Syndicate' },
    executeBastionPrompt: (config) => { executedPrompt = config; },
    openBastionDrawer: () => {}
  };

  const items = resolveFolioMenu({ subcategory: 'identity' }, {}, handlers);
  assert.ok(items.length > 0, 'Folio identity items should not be empty');

  // Verify BASTION Backstory item exists
  const backstoryItem = items.find(i => i.id === 'bastion-backstory');
  assert.ok(backstoryItem, 'BASTION Backstory action must exist');
  assert.equal(backstoryItem.aiType, 'BASTION');

  // Trigger BASTION action
  backstoryItem.onClick();
  assert.ok(executedPrompt, 'Should trigger BASTION prompt');
  assert.match(executedPrompt.prompt, /5 Pillars/i);
  assert.match(executedPrompt.prompt, /Vance Radek/);
});

test('resolveFolioMenu: Provides action economy and compendium lookup for Skills', () => {
  let executedPrompt = null;
  let rolled = null;
  const handlers = {
    activeOperative: { name: 'Vance' },
    advanceSkill: () => {},
    rollDice: (r) => { rolled = r; },
    executeBastionPrompt: (config) => { executedPrompt = config; }
  };

  const items = resolveFolioMenu(
    { subcategory: 'skills', entityData: { name: 'Marksmanship' } },
    {},
    handlers
  );

  const rollItem = items.find(i => i.id === 'roll-skill-check');
  assert.ok(rollItem, 'Roll check item should exist');
  rollItem.onClick();
  assert.equal(rolled.skill, 'Marksmanship');

  const actionEconomyItem = items.find(i => i.id === 'bastion-action-economy');
  assert.ok(actionEconomyItem, 'BASTION action economy should exist');
  assert.equal(actionEconomyItem.aiType, 'BASTION');
  actionEconomyItem.onClick();
  assert.match(executedPrompt.prompt, /Action Economy/i);
});

test('resolveFolioMenu: Handles text selection with BASTION consultation', () => {
  let executedPrompt = null;
  const handlers = {
    activeOperative: { name: 'Vance' },
    executeBastionPrompt: (config) => { executedPrompt = config; },
    openBastionDrawer: () => {}
  };

  const items = resolveFolioMenu(
    { subcategory: 'combat', selectedText: 'called shot to optics' },
    {},
    handlers
  );

  const askItem = items.find(i => i.id === 'bastion-ask-selection');
  assert.ok(askItem, 'BASTION ask selection should exist');
  askItem.onClick();
  assert.match(executedPrompt.prompt, /called shot to optics/);
});

test('resolveCortexMenu: Generates BASTION auto-fill and balance audit for database entries', () => {
  let executedPrompt = null;
  const handlers = {
    currentCategoryConfig: { label: 'WEAPONRY' },
    onEditEntry: () => {},
    onDuplicateEntry: () => {},
    onDeleteEntry: () => {},
    executeBastionPrompt: (config) => { executedPrompt = config; }
  };

  const items = resolveCortexMenu(
    { 
      subcategory: 'weaponry', 
      entityId: 'wp-plasma-1', 
      entityData: { id: 'wp-plasma-1', name: 'Overcharge Plasma Carbine', tech_level: 4 } 
    },
    {},
    handlers
  );

  const autofillItem = items.find(i => i.id === 'bastion-autofill-fields');
  assert.ok(autofillItem, 'Autofill item should exist');
  assert.equal(autofillItem.aiType, 'BASTION');
  autofillItem.onClick();
  assert.equal(executedPrompt.isAutofill, true);

  const balanceItem = items.find(i => i.id === 'bastion-balance-audit');
  assert.ok(balanceItem, 'Balance audit item should exist');
  balanceItem.onClick();
  assert.match(executedPrompt.prompt, /game balance/i);
});

test('resolveAdeMenu: Generates AIME mythopoeic actions for Story Beats', () => {
  let executedPrompt = null;
  const handlers = {
    activeStoryNode: { id: 'beat-1', title: 'Airlock Breach at Omega Outpost' },
    executeAimePrompt: (config) => { executedPrompt = config; }
  };

  const items = resolveAdeMenu(
    { subcategory: 'scenarios', entityId: 'beat-1', entityType: 'story-beat', entityData: { title: 'Airlock Breach at Omega Outpost' } },
    {},
    handlers
  );

  const expandItem = items.find(i => i.id === 'aime-expand-scene');
  assert.ok(expandItem, 'AIME expand scene item should exist');
  assert.equal(expandItem.aiType, 'AIME');
  expandItem.onClick();
  assert.match(executedPrompt.prompt, /Airlock Breach at Omega Outpost/);

  const branchItem = items.find(i => i.id === 'aime-branching-choices');
  assert.ok(branchItem, 'AIME branching choices item should exist');
  branchItem.onClick();
  assert.match(executedPrompt.prompt, /Path A/);
});

test('resolveAdeMenu: Transmutes mechanics into sensory prose on Quill text selection', () => {
  let executedPrompt = null;
  const handlers = {
    executeAimePrompt: (config) => { executedPrompt = config; }
  };

  const items = resolveAdeMenu(
    { subcategory: 'story', selectedText: 'Operative attacks with TL-4 kinetic rifle hitting for 18 VP.' },
    {},
    handlers
  );

  const transmuteItem = items.find(i => i.id === 'aime-transmute-mechanics');
  assert.ok(transmuteItem, 'AIME transmute mechanics item should exist');
  assert.equal(transmuteItem.aiType, 'AIME');
  transmuteItem.onClick();
  assert.match(executedPrompt.prompt, /Tech Level aesthetics/i);
});

test('resolveStageMenu: Provides Dual Resolution combat checks and Called Shots', () => {
  let rolled = null;
  const handlers = {
    rollDice: (r) => { rolled = r; },
    applyCondition: () => {}
  };

  const items = resolveStageMenu(
    { entityId: 'tok-1', entityType: 'token', entityData: { name: 'Syndicate Enforcer' } },
    {},
    handlers
  );

  const dualResItem = items.find(i => i.id === 'stage-roll-dual-resolution');
  assert.ok(dualResItem, 'Dual resolution check should exist');
  dualResItem.onClick();
  assert.equal(rolled.defenderRule, 'Defender wins ties');

  const calledShotSubmenu = items.find(i => i.id === 'stage-called-shot');
  assert.ok(calledShotSubmenu, 'Called shot submenu should exist');
  assert.ok(calledShotSubmenu.children.length >= 4, 'Should have Head, Arms, Legs, Optics');
});

test('resolveContextMenu: Correctly classifies routes into Folio, Cortex, ADE, and Stage domains', () => {
  const folioRes = resolveContextMenu({ pathname: '/folio', subcategory: 'identity' }, {}, {});
  assert.equal(folioRes.domain, 'folio');
  assert.equal(folioRes.categoryBadge, 'FOLIO // IDENTITY');

  const cortexRes = resolveContextMenu({ pathname: '/dbm', subcategory: 'species' }, {}, {});
  assert.equal(cortexRes.domain, 'cortex');
  assert.equal(cortexRes.categoryBadge, 'CORTEX // SPECIES');

  const adeRes = resolveContextMenu({ pathname: '/foundry', subcategory: 'scenarios' }, {}, {});
  assert.equal(adeRes.domain, 'ade');
  assert.equal(adeRes.categoryBadge, 'ADE // SCENARIOS');

  const stageRes = resolveContextMenu({ pathname: '/stage', subcategory: 'tactical' }, {}, {});
  assert.equal(stageRes.domain, 'stage');
  assert.equal(stageRes.categoryBadge, 'STAGE // TACTICAL');
});
