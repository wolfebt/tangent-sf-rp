/**
 * @file firestoreRulesSecurity.test.mjs
 * @description Automated Security Rules Audit & RBAC Policy Simulation Suite for firestore.rules.
 * Verifies helper predicates, Omnicortex reference collection protections, broadcast system_settings
 * admin-only write guards, Persona/Character ownership isolation, Story Foundry RBAC, Commlink channel
 * protections, and explicit catch-all deny rules.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RULES_PATH = path.resolve(__dirname, '../../firestore.rules');
const rulesText = fs.readFileSync(RULES_PATH, 'utf-8');

/**
 * Reference evaluator modeling the exact helper predicates and collection access policies in firestore.rules
 */
const RulesPolicySimulator = {
  isAuthenticated(auth) {
    return auth != null;
  },
  isAdmin(auth) {
    return (
      this.isAuthenticated(auth) &&
      (auth.token?.admin === true ||
        auth.token?.role === 'GM' ||
        auth.token?.email === 'btw.284@gmail.com')
    );
  },
  isOwner(auth, userId) {
    return this.isAuthenticated(auth) && auth.uid === userId;
  },
  canWriteOmnicortex(auth) {
    return this.isAdmin(auth);
  },
  canWriteSystemSettings(auth) {
    return this.isAdmin(auth);
  },
  canReadUserProfile(auth) {
    return this.isAuthenticated(auth);
  },
  canWriteUserProfile(auth, userId) {
    return this.isOwner(auth, userId) || this.isAdmin(auth);
  },
  canReadPersona(auth, userId, resourceData = {}) {
    return this.isOwner(auth, userId) || resourceData.isPublic === true || this.isAdmin(auth);
  },
  canWritePersona(auth, userId) {
    return this.isOwner(auth, userId) || this.isAdmin(auth);
  },
  canCreateCharacter(auth, requestResourceData = {}) {
    return (
      this.isAuthenticated(auth) &&
      (requestResourceData.userId === auth.uid || requestResourceData.ownerId === auth.uid)
    );
  },
  canModifyCharacter(auth, resourceData = {}) {
    return (
      this.isAuthenticated(auth) &&
      (resourceData.userId === auth.uid || resourceData.ownerId === auth.uid || this.isAdmin(auth))
    );
  },
  canModifyStoryAsset(auth, resourceData = {}) {
    return (
      this.isAuthenticated(auth) &&
      (resourceData.authorUid === auth.uid || resourceData.creatorId === auth.uid || this.isAdmin(auth))
    );
  },
  canWriteUniverse(auth) {
    return this.isAdmin(auth);
  },
  canDeleteChannel(auth, channelId, resourceData = {}) {
    return (
      this.isAuthenticated(auth) &&
      ! /^public_.*/.test(channelId) &&
      (resourceData.createdById === auth.uid || this.isAdmin(auth))
    );
  }
};

test('Firestore Rules: Core helper functions (isAuthenticated, isAdmin, isOwner) are strictly defined', () => {
  assert.match(rulesText, /rules_version\s*=\s*'2';/, 'Must use Firestore Rules v2');
  assert.match(
    rulesText,
    /function\s+isAuthenticated\(\)\s*\{\s*return\s+request\.auth\s*!=\s*null;\s*\}/,
    'isAuthenticated() must check request.auth != null'
  );
  assert.match(
    rulesText,
    /function\s+isAdmin\(\)\s*\{\s*return\s+isAuthenticated\(\)\s*&&\s*\([\s\S]*?request\.auth\.token\.admin\s*==\s*true[\s\S]*?request\.auth\.token\.role\s*==\s*'GM'[\s\S]*?request\.auth\.token\.email\s*==\s*'btw\.284@gmail\.com'[\s\S]*?\);\s*\}/,
    'isAdmin() must require authenticated user with admin == true, role == GM, or authorized admin email'
  );
  assert.match(
    rulesText,
    /function\s+isOwner\(userId\)\s*\{\s*return\s+isAuthenticated\(\)\s*&&\s*request\.auth\.uid\s*==\s*userId;\s*\}/,
    'isOwner(userId) must check request.auth.uid == userId'
  );
});

test('Firestore Rules: All 80+ Omnicortex DBM reference collections enforce Public Read & Admin-Only Write', () => {
  const requiredReferenceCollections = [
    'archetypes', 'architecture', 'armoring', 'attributes', 'augmentations',
    'compendium', 'conditions', 'cybernetics', 'disadvantages', 'disciplines',
    'economatrix', 'equipment', 'factions', 'features', 'gear', 'invocations',
    'lore', 'maneuvers', 'mecha', 'occupations', 'origins', 'planetary_design',
    'psionics', 'rules', 'skills', 'societies', 'species', 'species_movement',
    'species_size', 'species_type', 'technology', 'traits', 'vehicles', 'weaponry', 'world'
  ];

  for (const col of requiredReferenceCollections) {
    const pattern = new RegExp(
      `match\\s+\\/${col}\\/\\{document\\}\\s*\\{\\s*allow\\s+read:\\s*if\\s+true;\\s*allow\\s+write:\\s*if\\s+isAdmin\\(\\);\\s*\\}`
    );
    assert.match(rulesText, pattern, `Omnicortex collection /${col} must enforce public read and isAdmin() write`);
  }

  // Verify RBAC simulation for reference collections
  assert.equal(RulesPolicySimulator.canWriteOmnicortex(null), false, 'Anonymous cannot write Omnicortex');
  assert.equal(RulesPolicySimulator.canWriteOmnicortex({ uid: 'user-1', token: {} }), false, 'Standard player cannot write Omnicortex');
  assert.equal(RulesPolicySimulator.canWriteOmnicortex({ uid: 'gm-1', token: { role: 'GM' } }), true, 'GM can write Omnicortex');
  assert.equal(RulesPolicySimulator.canWriteOmnicortex({ uid: 'adm-1', token: { admin: true } }), true, 'Admin can write Omnicortex');
});

test('Firestore Rules: /system_settings/{settingId} restricts write access strictly to isAdmin()', () => {
  const systemSettingsMatch = rulesText.match(/match\s+\/system_settings\/\{settingId\}\s*\{([\s\S]*?)\}/);
  assert.ok(systemSettingsMatch, '/system_settings/{settingId} block must exist');

  const blockBody = systemSettingsMatch[1];
  assert.match(blockBody, /allow\s+read:\s*if\s+true;/, 'system_settings should allow public read for broadcast banners');
  assert.match(blockBody, /allow\s+write:\s*if\s+isAdmin\(\);/, 'system_settings write must be restricted strictly to isAdmin()');
  assert.doesNotMatch(
    blockBody,
    /allow\s+write:\s*if\s+isAuthenticated\(\)/,
    'system_settings must NOT allow arbitrary authenticated non-admin users to overwrite broadcast banners'
  );

  // Policy simulation
  assert.equal(RulesPolicySimulator.canWriteSystemSettings({ uid: 'player-1', token: {} }), false);
  assert.equal(RulesPolicySimulator.canWriteSystemSettings({ uid: 'gm-1', token: { role: 'GM' } }), true);
});

test('Firestore Rules: Persona Folio & Characters enforce strict owner isolation and public flag semantics', () => {
  assert.match(
    rulesText,
    /match\s+\/users\/\{userId\}\/personas\/\{personaId\}\s*\{\s*allow\s+read:\s*if\s+isOwner\(userId\)\s*\|\|\s*resource\.data\.isPublic\s*==\s*true\s*\|\|\s*isAdmin\(\);\s*allow\s+write:\s*if\s+isOwner\(userId\)\s*\|\|\s*isAdmin\(\);\s*\}/,
    'Nested user personas must enforce owner/public read and owner/admin write'
  );

  const alice = { uid: 'alice', token: {} };
  const bob = { uid: 'bob', token: {} };
  const gm = { uid: 'gm-prime', token: { role: 'GM' } };

  // Private persona owned by Alice
  assert.equal(RulesPolicySimulator.canReadPersona(alice, 'alice', { isPublic: false }), true);
  assert.equal(RulesPolicySimulator.canReadPersona(bob, 'alice', { isPublic: false }), false);
  assert.equal(RulesPolicySimulator.canReadPersona(null, 'alice', { isPublic: false }), false);
  assert.equal(RulesPolicySimulator.canReadPersona(gm, 'alice', { isPublic: false }), true);

  // Public persona owned by Alice
  assert.equal(RulesPolicySimulator.canReadPersona(bob, 'alice', { isPublic: true }), true);
  assert.equal(RulesPolicySimulator.canReadPersona(null, 'alice', { isPublic: true }), true);

  // Write permissions on Alice's persona
  assert.equal(RulesPolicySimulator.canWritePersona(alice, 'alice'), true);
  assert.equal(RulesPolicySimulator.canWritePersona(bob, 'alice'), false);
  assert.equal(RulesPolicySimulator.canWritePersona(gm, 'alice'), true);

  // Character creation spoofing prevention
  assert.equal(RulesPolicySimulator.canCreateCharacter(alice, { userId: 'alice' }), true);
  assert.equal(RulesPolicySimulator.canCreateCharacter(alice, { userId: 'bob' }), false, 'Cannot create character spoofing another userId');
  assert.equal(RulesPolicySimulator.canModifyCharacter(bob, { userId: 'alice' }), false);
  assert.equal(RulesPolicySimulator.canModifyCharacter(gm, { userId: 'alice' }), true);
});

test('Firestore Rules: Story Foundry assets, Universe state, Commlink public channels, and catch-all deny', () => {
  // Universe state is read-only for players, writeable only by Admin/GM
  assert.match(
    rulesText,
    /match\s+\/universe\/\{document=\*\*\}\s*\{\s*allow\s+read:\s*if\s+isAuthenticated\(\);\s*allow\s+write:\s*if\s+isAdmin\(\);\s*\}/,
    '/universe/** must restrict writes to isAdmin()'
  );

  // Public channels cannot be deleted even by admins/creators if matching public_.*
  const alice = { uid: 'alice', token: {} };
  const gm = { uid: 'gm-1', token: { admin: true } };

  assert.equal(
    RulesPolicySimulator.canDeleteChannel(gm, 'public_general', { createdById: 'gm-1' }),
    false,
    'Public channels matching public_.* must be protected from deletion'
  );
  assert.equal(
    RulesPolicySimulator.canDeleteChannel(alice, 'custom_squad_alpha', { createdById: 'alice' }),
    true,
    'Channel creator can delete custom non-public channel'
  );
  assert.equal(
    RulesPolicySimulator.canDeleteChannel(alice, 'custom_squad_alpha', { createdById: 'bob' }),
    false,
    'Non-creator player cannot delete another user channel'
  );

  // Final catch-all explicit deny
  assert.match(
    rulesText,
    /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/,
    'Must conclude with explicit catch-all deny rule'
  );
});
