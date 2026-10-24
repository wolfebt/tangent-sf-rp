/**
 * @file storageRulesSecurity.test.mjs
 * @description Automated Security Rules Audit & Policy Simulator for storage.rules.
 * Verifies character persona image slot ownership, 350 KB payload size guardrails,
 * MIME type enforcement, canonical slot file patterns, and default catch-all denial.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_RULES_PATH = path.resolve(__dirname, '../../storage.rules');
const rulesText = fs.readFileSync(STORAGE_RULES_PATH, 'utf-8');

test('Storage Rules: Syntax and Service Declaration', () => {
  assert.ok(rulesText.includes("rules_version = '2';"), 'Must declare rules_version 2');
  assert.ok(rulesText.includes('service firebase.storage'), 'Must target firebase.storage service');
  assert.ok(rulesText.includes('match /b/{bucket}/o'), 'Must match bucket root');
});

test('Storage Rules: Persona Media Path Structure', () => {
  assert.ok(
    rulesText.includes('match /users/{userId}/personas/{personaId}/{slotFile}'),
    'Must define canonical character folio slot path'
  );
});

test('Storage Rules: Authentication & Read Access Policy', () => {
  const personaBlockMatch = rulesText.match(
    /match \/users\/\{userId\}\/personas\/\{personaId\}\/\{slotFile\} \{([\s\S]*?)\n    \}/
  );
  assert.ok(personaBlockMatch, 'Must find persona slot match block');
  const personaBlock = personaBlockMatch[1];

  assert.ok(
    personaBlock.includes('allow read: if request.auth != null;'),
    'Read access must require authentication for campaign/VTT sharing'
  );
});

test('Storage Rules: 350 KB Maximum File Size Guardrail', () => {
  assert.ok(
    rulesText.includes('request.resource.size <= 350 * 1024'),
    'Must enforce 350 KB maximum payload size to guarantee client-side WebP compression'
  );
});

test('Storage Rules: Ownership Authorization Constraint', () => {
  assert.ok(
    rulesText.includes('request.auth.uid == userId'),
    'Write operations must be strictly bound to requesting user ID'
  );
});

test('Storage Rules: MIME Type Image Whitelist', () => {
  assert.ok(
    rulesText.includes("request.resource.contentType.matches('image/(webp|png|jpeg)')"),
    'Must restrict uploads exclusively to allowed image MIME types'
  );
});

test('Storage Rules: Slot File Pattern Whitelist', () => {
  const slotPatternMatch = rulesText.match(/slotFile\.matches\('(.*?)'\)/);
  assert.ok(slotPatternMatch, 'Must validate slotFile name against regex pattern');
  const regex = new RegExp(slotPatternMatch[1]);

  // Valid slot files
  assert.ok(regex.test('portrait.webp'), 'portrait.webp must be valid');
  assert.ok(regex.test('token.webp'), 'token.webp must be valid');
  assert.ok(regex.test('standee.webp'), 'standee.webp must be valid');
  assert.ok(regex.test('gallery_0.webp'), 'gallery_0.webp must be valid');
  assert.ok(regex.test('gallery_3.webp'), 'gallery_3.webp must be valid');
  assert.ok(regex.test('token.png'), 'token.png must be valid');

  // Invalid / disallowed file names
  assert.strictEqual(regex.test('malicious.exe'), false, 'executable must be rejected');
  assert.strictEqual(regex.test('script.js'), false, 'javascript file must be rejected');
  assert.strictEqual(regex.test('unauthorized_slot.webp'), false, 'arbitrary slot name must be rejected');
  assert.strictEqual(regex.test('../escape.webp'), false, 'path traversal must be rejected');
});

test('Storage Rules: Catch-All Default Deny', () => {
  assert.ok(
    rulesText.includes('match /{allPaths=**} {\n      allow read, write: if false;\n    }'),
    'Must include explicit catch-all deny rule for any unspecified path'
  );
});
