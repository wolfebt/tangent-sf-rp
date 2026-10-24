/**
 * @file folioMediaTabRouting.test.mjs
 * @description Unit tests verifying the dedicated Visuals / Media Tab placement in the Folio,
 * ensuring it is positioned strictly between Narrative and Notes in navigation, hierarchy, and views.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIDEBAR_PATH = path.resolve(__dirname, '../../src/components/Folio/FolioSidebar.jsx');
const CONTAINER_PATH = path.resolve(__dirname, '../../src/components/Folio/FolioContainer.jsx');
const MEDIA_TAB_PATH = path.resolve(__dirname, '../../src/components/Folio/tabs/MediaTab.jsx');

test('FolioSidebar: Media Tab is strictly positioned between Narrative and Notes', () => {
  const content = fs.readFileSync(SIDEBAR_PATH, 'utf-8');

  // Verify presence of media item
  assert.ok(content.includes("id: 'media'"), "FolioSidebar must contain 'media' tab");

  // Verify exact ordering: narrative -> media -> other (notes)
  const narrativeIdx = content.indexOf("id: 'narrative'");
  const mediaIdx = content.indexOf("id: 'media'");
  const otherIdx = content.indexOf("id: 'other'");

  assert.ok(narrativeIdx !== -1, 'Narrative tab must exist');
  assert.ok(mediaIdx !== -1, 'Media tab must exist');
  assert.ok(otherIdx !== -1, 'Other/Notes tab must exist');

  assert.ok(
    narrativeIdx < mediaIdx && mediaIdx < otherIdx,
    `Media tab (${mediaIdx}) must be between Narrative (${narrativeIdx}) and Notes (${otherIdx})`
  );
});

test('FolioContainer: Media Tab registration and view rendering', () => {
  const content = fs.readFileSync(CONTAINER_PATH, 'utf-8');

  assert.ok(content.includes("import MediaTab from './tabs/MediaTab'"), 'MediaTab must be imported');
  assert.ok(content.includes("'media', 'visuals'"), "validTabs must include 'media' and 'visuals'");
  assert.ok(content.includes("'media': { parent: null"), "tabHierarchyMap must register 'media'");
  assert.ok(content.includes("<MediaTab />"), 'MediaTab component must be rendered conditionally');
});

test('MediaTab Component: Provides all 4 Folio Visual Slots', () => {
  const content = fs.readFileSync(MEDIA_TAB_PATH, 'utf-8');

  assert.ok(content.includes('Primary Portrait'), 'Must render Primary Portrait slot');
  assert.ok(content.includes('Tactical VTT Token'), 'Must render Tactical VTT Token slot');
  assert.ok(content.includes('Full-Body Standee'), 'Must render Full-Body Standee slot');
  assert.ok(content.includes('Reference & Lore Imagery'), 'Must render Reference Gallery slot');
  assert.ok(content.includes('FolioImageCropModal'), 'Must integrate FolioImageCropModal');
});
