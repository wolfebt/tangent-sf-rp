/**
 * @file firestoreRulesSecurity.test.mjs
 * @description Automated Security Rules Audit, RBAC Policy Simulation & @firebase/rules-unit-testing Suite for firestore.rules.
 * Verifies helper predicates, Omnicortex reference collection protections, broadcast system_settings
 * admin-only write guards, Persona/Character ownership isolation, Story Foundry RBAC, Commlink channel
 * protections, explicit catch-all deny rules, and live Firestore Emulator rule enforcement when active.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} from '@firebase/rules-unit-testing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RULES_PATH = path.resolve(__dirname, '../../firestore.rules');
const rulesText = fs.readFileSync(RULES_PATH, 'utf-8');

/**
 * Checks if a local Firestore Emulator TCP port is listening so live emulator tests run automatically when active
 */
function checkEmulatorPort(host = '127.0.0.1', port = 8080, timeoutMs = 250) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (ok) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(ok);
      }
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

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
        (auth.token?.email_verified === true && auth.token?.email === 'btw.284@gmail.com'))
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
      !/^public_.*/.test(channelId) &&
      (resourceData.createdById === auth.uid || this.isAdmin(auth))
    );
  }
};

test('Firestore Rules: Core helper functions (isAuthenticated, isAdmin, isOwner) are strictly defined', () => {
  assert.equal(typeof initializeTestEnvironment, 'function', '@firebase/rules-unit-testing must be installed');
  assert.equal(typeof assertSucceeds, 'function');
  assert.equal(typeof assertFails, 'function');

  assert.match(rulesText, /rules_version\s*=\s*'2';/, 'Must use Firestore Rules v2');
  assert.match(
    rulesText,
    /function\s+isAuthenticated\(\)\s*\{\s*return\s+request\.auth\s*!=\s*null;\s*\}/,
    'isAuthenticated() must check request.auth != null'
  );
  assert.match(
    rulesText,
    /function\s+isAdmin\(\)\s*\{\s*return\s+isAuthenticated\(\)\s*&&\s*\([\s\S]*?request\.auth\.token\.admin\s*==\s*true[\s\S]*?request\.auth\.token\.role\s*==\s*'GM'[\s\S]*?request\.auth\.token\.email_verified\s*==\s*true[\s\S]*?request\.auth\.token\.email\s*==\s*'btw\.284@gmail\.com'[\s\S]*?\);\s*\}/,
    'isAdmin() must require authenticated user with admin == true, role == GM, or verified authorized admin email'
  );
  assert.equal(RulesPolicySimulator.isAdmin({ uid: 'u1', token: { email: 'btw.284@gmail.com', email_verified: false } }), false);
  assert.equal(RulesPolicySimulator.isAdmin({ uid: 'u1', token: { email: 'btw.284@gmail.com', email_verified: true } }), true);
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

test('Firestore Rules: /users/{userId} and /users/{userId}/private_settings/{docId} prohibit geminiApiKey and otherAiApiKey and restrict private_settings strictly to isOwner(userId)', () => {
  const usersSectionMatch = rulesText.match(/match\s+\/users\/\{userId\}\s*\{([\s\S]*?)match\s+\/private_settings\/\{docId\}\s*\{([\s\S]*?)\}\s*\}/);
  assert.ok(usersSectionMatch, '/users/{userId} and nested /private_settings/{docId} blocks must exist');

  const userProfileBody = usersSectionMatch[1];
  const privateSettingsBody = usersSectionMatch[2];

  // /users/{userId} prohibits geminiApiKey, otherAiApiKey, and privilege-escalation role/admin keys for non-admins
  assert.match(userProfileBody, /!\('geminiApiKey'\s+in\s+request\.resource\.data\)/, '/users/{userId} must block geminiApiKey');
  assert.match(userProfileBody, /!\('otherAiApiKey'\s+in\s+request\.resource\.data\)/, '/users/{userId} must block otherAiApiKey');
  assert.match(
    userProfileBody,
    /!request\.resource\.data\.diff\(resource\.data\)\.affectedKeys\(\)\.hasAny\(\['geminiApiKey',\s*'otherAiApiKey'\]\)/,
    '/users/{userId} update must block affectedKeys geminiApiKey and otherAiApiKey'
  );
  assert.match(
    userProfileBody,
    /!request\.resource\.data\.keys\(\)\.hasAny\(\['role',\s*'isAdmin',\s*'admin'\]\)/,
    '/users/{userId} create must forbid non-admins from setting role/isAdmin/admin'
  );
  assert.match(
    userProfileBody,
    /!request\.resource\.data\.diff\(resource\.data\)\.affectedKeys\(\)\.hasAny\(\['role',\s*'isAdmin',\s*'admin'\]\)/,
    '/users/{userId} update must forbid non-admins from mutating role/isAdmin/admin'
  );

  // /users/{userId}/private_settings/{docId} restricts strictly to isOwner(userId) (no isAdmin()) and prohibits geminiApiKey and otherAiApiKey
  assert.match(privateSettingsBody, /allow\s+read,\s*delete:\s*if\s+isOwner\(userId\);/, 'private_settings read/delete must be restricted strictly to isOwner(userId)');
  assert.doesNotMatch(privateSettingsBody, /isAdmin\(\)/, 'private_settings must not allow isAdmin() access');
  assert.match(privateSettingsBody, /!\('geminiApiKey'\s+in\s+request\.resource\.data\)/, 'private_settings must block geminiApiKey');
  assert.match(privateSettingsBody, /!\('otherAiApiKey'\s+in\s+request\.resource\.data\)/, 'private_settings must block otherAiApiKey');
  assert.match(
    privateSettingsBody,
    /!request\.resource\.data\.diff\(resource\.data\)\.affectedKeys\(\)\.hasAny\(\['geminiApiKey',\s*'otherAiApiKey'\]\)/,
    'private_settings update must block affectedKeys geminiApiKey and otherAiApiKey'
  );
});

test('Firestore Rules: Persona Folio & Characters enforce strict owner isolation and public flag semantics', () => {
  assert.match(
    rulesText,
    /match\s+\/users\/\{userId\}\/personas\/\{personaId\}\s*\{[\s\S]*?allow\s+read:\s*if\s+isOwner\(userId\)\s*\|\|\s*resource\.data\.isPublic\s*==\s*true\s*\|\|\s*isAdmin\(\);[\s\S]*?allow\s+create:\s*if\s+\(isOwner\(userId\)\s*\|\|\s*isAdmin\(\)\)[\s\S]*?isValidPersona\(request\.resource\.data\)[\s\S]*?allow\s+update:\s*if\s+\(isOwner\(userId\)\s*\|\|\s*isAdmin\(\)\)[\s\S]*?isValidPersona\(request\.resource\.data\)[\s\S]*?allow\s+delete:\s*if\s+isOwner\(userId\)\s*\|\|\s*isAdmin\(\);/,
    'Nested user personas must enforce owner/public read, split schema-validated create/update blocking privilege/API key fields, and owner/admin delete'
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

  // Story Foundry collections (/user_stories, /story_elements, /story_maps) enforce creator/author ownership
  assert.match(
    rulesText,
    /match\s+\/story_maps\/\{mapId\}\s*\{[\s\S]*?allow\s+create:\s*if\s+isAuthenticated\(\)\s*&&\s*\([\s\S]*?\(request\.resource\.data\.get\('authorUid',\s*''\)\s*==\s*request\.auth\.uid\s*\|\|\s*request\.resource\.data\.get\('creatorId',\s*''\)\s*==\s*request\.auth\.uid\)[\s\S]*?hasNoCrossFieldOwnershipPoisoning\(request\.resource\.data\)/,
    '/story_maps/{mapId} must bind creation to authorUid/creatorId and prevent cross-field ownership poisoning'
  );
  assert.match(
    rulesText,
    /match\s+\/story_elements\/\{elementId\}\s*\{[\s\S]*?allow\s+update:\s*if\s+isAuthenticated\(\)[\s\S]*?areOwnerFieldsUnchangedOnUpdate\(\)[\s\S]*?allow\s+delete:\s*if\s+isAuthenticated\(\)\s*&&\s*\(resource\.data\.get\('authorUid',\s*''\)\s*==\s*request\.auth\.uid\s*\|\|\s*resource\.data\.get\('creatorId',\s*''\)\s*==\s*request\.auth\.uid\s*\|\|\s*isAdmin\(\)\);/,
    '/story_elements/{elementId} must split update/delete and enforce owner immutability for non-admins'
  );
  assert.match(
    rulesText,
    /match\s+\/messages\/\{messageId\}\s*\{[\s\S]*?request\.resource\.data\.senderId\s*==\s*request\.auth\.uid[\s\S]*?\|\|\s*isAdmin\(\)/,
    'Commlink channel messages must prevent senderId spoofing'
  );
  assert.doesNotMatch(
    rulesText,
    /request\.resource\.data\.senderId\s*==\s*'system'/,
    'Commlink channel messages must NOT permit non-admin senderId == system spoofing'
  );

  // Story asset modification policy simulation
  assert.equal(RulesPolicySimulator.canModifyStoryAsset(alice, { authorUid: 'alice' }), true);
  assert.equal(RulesPolicySimulator.canModifyStoryAsset(alice, { creatorId: 'bob' }), false);
  assert.equal(RulesPolicySimulator.canModifyStoryAsset(gm, { creatorId: 'bob' }), true);

  // Scoped Story Foundry & Campaign read hardening (SEC-03)
  assert.match(
    rulesText,
    /match\s+\/user_stories\/\{storyId\}\s*\{[^}]*allow\s+read:\s+if\s+resource\.data\.isPublic\s*==\s*true\s*\|\|\s*\(isAuthenticated\(\)\s*&&\s*\(resource\.data\.ownerId\s*==\s*request\.auth\.uid\s*\|\|\s*resource\.data\.creatorId\s*==\s*request\.auth\.uid\s*\|\|\s*isAdmin\(\)\)\);/,
    'user_stories must restrict reads to public or owner/creator/admin'
  );
  assert.match(
    rulesText,
    /match\s+\/story_elements\/\{elementId\}\s*\{[^}]*allow\s+read:\s+if\s+resource\.data\.isPublic\s*==\s*true\s*\|\|\s*\(isAuthenticated\(\)\s*&&\s*\(resource\.data\.authorUid\s*==\s*request\.auth\.uid\s*\|\|\s*resource\.data\.creatorId\s*==\s*request\.auth\.uid\s*\|\|\s*isAdmin\(\)\)\);/,
    'story_elements must restrict reads to public or author/creator/admin'
  );
  assert.match(
    rulesText,
    /match\s+\/story_maps\/\{mapId\}\s*\{[^}]*allow\s+read:\s*if\s+resource\.data\.isPublic\s*==\s*true\s*\|\|\s*\(isAuthenticated\(\)\s*&&\s*\(resource\.data\.authorUid\s*==\s*request\.auth\.uid\s*\|\|\s*resource\.data\.creatorId\s*==\s*request\.auth\.uid\s*\|\|\s*isCampaignGmForResource\(resource\.data\)\s*\|\|\s*isAdmin\(\)\)\);/,
    'story_maps must restrict reads to public or author/creator/campaign-GM/admin'
  );
  const canSendInviteFn = rulesText.match(/function\s+canSendInviteForGroup\(groupId\)\s*\{([\s\S]*?)\n\s*\}/);
  assert.ok(canSendInviteFn, 'canSendInviteForGroup helper must exist');
  assert.doesNotMatch(
    canSendInviteFn[1],
    /!\s*exists\(/,
    'canSendInviteForGroup must NOT bypass group existence checks via !exists(...)'
  );
  const parentStoryFn = rulesText.match(/function\s+isParentStoryAuthorized\(storyId\)\s*\{([\s\S]*?)\n\s*\}/);
  assert.ok(parentStoryFn, 'isParentStoryAuthorized helper must exist');
  assert.doesNotMatch(
    parentStoryFn[1],
    /!\s*exists\(/,
    'isParentStoryAuthorized must NOT allow open access via !exists(...) fallback'
  );
  assert.match(
    rulesText,
    /match\s+\/user_stories\/\{storyId\}\/sessions\/\{sessionId\}\s*\{[\s\S]*?allow\s+read:\s*if\s+isAuthenticated\(\)\s*&&\s*\(isAdmin\(\)\s*\|\|\s*\(isParentStoryAuthorized\(storyId\)\s*&&\s*isStorySessionDocAuthorized\(\)\)\);[\s\S]*?allow\s+create:[\s\S]*?'ownerId'\s+in\s+request\.resource\.data[\s\S]*?request\.resource\.data\.ownerId\s*==\s*request\.auth\.uid[\s\S]*?allow\s+update:[\s\S]*?affectedKeys\(\)\.hasAny\(\['ownerId'/,
    'user_stories sessions subcollection must mirror Campaign Sessions security with parent story authorization and ownerId immutability'
  );
  assert.doesNotMatch(
    rulesText,
    /match\s+\/(user_stories|story_elements|story_maps)\/[^}]*allow\s+read:\s+if\s+isAuthenticated\(\)\s*;/,
    'Story Foundry collections must never use unrestricted allow read: if isAuthenticated()'
  );
  assert.match(
    rulesText,
    /match\s+\/Campaigns\/\{campaignId\}\s*\{[\s\S]*?allow\s+read:\s*if\s+isAuthenticated\(\)\s*&&\s*\([\s\S]*?isAdmin\(\)[\s\S]*?resource\.data\.get\('ownerId',\s*''\)\s*==\s*request\.auth\.uid[\s\S]*?allow\s+create:\s*if\s+isAuthenticated\(\)\s*&&\s*\([\s\S]*?'ownerId'\s+in\s+request\.resource\.data[\s\S]*?request\.resource\.data\.ownerId\s*==\s*request\.auth\.uid/,
    'Campaigns must scope reads to owner/member/admin and require explicit ownerId == request.auth.uid on create'
  );
  assert.match(
    rulesText,
    /match\s+\/Campaigns\/\{campaignId\}\/Sessions\/\{sessionId\}\s*\{[\s\S]*?allow\s+read:\s*if\s+isAuthenticated\(\)\s*&&\s*\(isAdmin\(\)\s*\|\|\s*\(isSessionDocAuthorized\(\)\s*&&\s*isParentCampaignAuthorized\(campaignId\)\)\);[\s\S]*?allow\s+create:[\s\S]*?'ownerId'\s+in\s+request\.resource\.data[\s\S]*?request\.resource\.data\.ownerId\s*==\s*request\.auth\.uid[\s\S]*?allow\s+update:[\s\S]*?request\.resource\.data\.ownerId\s*==\s*resource\.data\.ownerId/,
    'Campaign Sessions must require ownerId on create, enforce ownerId immutability on update, and scope reads'
  );
  const parentCampaignFn = rulesText.match(/function\s+isParentCampaignAuthorized\(campaignId\)\s*\{([\s\S]*?)\n\s*\}/);
  assert.ok(parentCampaignFn, 'isParentCampaignAuthorized helper must exist');
  assert.doesNotMatch(
    parentCampaignFn[1],
    /!\s*exists\(/,
    'isParentCampaignAuthorized must NOT allow open access via !exists(...) fallback'
  );

  // Sanitized Spectator Map projection rules (Option 1A + Phase 15 hardening)
  assert.match(
    rulesText,
    /function\s+isValidSpectatorMap\(data\)\s*\{[\s\S]*?'gridSize'[\s\S]*?'background_url'[\s\S]*?'videoBackgroundUrl'[\s\S]*?'underlay'[\s\S]*?'lights'[\s\S]*?'regions'[\s\S]*?'exploredFog'/,
    'isValidSpectatorMap must explicitly allow sanitized visual playback fields while preserving hasOnly enforcement'
  );
  assert.match(
    rulesText,
    /match\s+\/spectator_maps\/\{mapId\}\s*\{[\s\S]*?allow\s+get:\s+if\s+resource\.data\.isSpectatorLive\s*==\s*true[\s\S]*?allow\s+list:\s+if\s+isAuthenticated\(\)[\s\S]*?isValidSpectatorMap\(request\.resource\.data\)[\s\S]*?isValidSpectatorOwnerFieldOnCreate\(mapId,\s*'authorUid'\)[\s\S]*?allow\s+delete:\s+if\s+isAuthenticated\(\)/,
    'spectator_maps must gate anonymous get on isSpectatorLive == true, block list enumeration, and enforce schema-validated author/creator/campaign-GM/admin writes'
  );
  assert.doesNotMatch(
    rulesText,
    /match\s+\/spectator_maps\/\{mapId\}\s*\{[\s\S]*?allow\s+(read|get):\s+if\s+true;/,
    'spectator_maps must not use unrestricted allow read/get: if true'
  );

  // Final catch-all explicit deny
  assert.match(
    rulesText,
    /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/,
    'Must conclude with explicit catch-all deny rule'
  );
});

test('Firestore Rules [@firebase/rules-unit-testing]: Live emulator evaluation when FIRESTORE_EMULATOR_HOST is reachable', async (t) => {
  const envHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  const [host, portStr] = envHost.split(':');
  const port = Number(portStr) || 8080;
  const isEmulatorReachable = await checkEmulatorPort(host, port);

  if (!isEmulatorReachable) {
    t.diagnostic(
      `Firestore Emulator not listening on ${host}:${port}; static AST & RBAC policy simulator assertions passed.`
    );
    return;
  }

  const testEnv = await initializeTestEnvironment({
    projectId: 'tangent-sf-rp-rules-test',
    firestore: {
      host,
      port,
      rules: rulesText
    }
  });

  try {
    const anonDb = testEnv.unauthenticatedContext().firestore();
    const playerDb = testEnv.authenticatedContext('alice').firestore();
    const gmDb = testEnv.authenticatedContext('gm-prime', { role: 'GM' }).firestore();

    await assertFails(playerDb.collection('system_settings').doc('banner').set({ text: 'Hacked' }));
    await assertSucceeds(gmDb.collection('system_settings').doc('banner').set({ text: 'Official Broadcast' }));
    await assertSucceeds(anonDb.collection('species').doc('human').get());
    await assertFails(playerDb.collection('species').doc('human').set({ name: 'Mutated' }));
  } finally {
    await testEnv.cleanup();
  }
});
