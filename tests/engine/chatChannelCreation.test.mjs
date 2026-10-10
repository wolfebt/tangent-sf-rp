import assert from 'node:assert';
import { ChatService, DEFAULT_PUBLIC_CHANNELS } from '../../src/services/chatService.js';
import { StorageService } from '../../src/services/storageService.js';

console.log('Testing Chat & Network Frequencies/Channels Engine (Create, Edit, Delete)...');

// Mock localStorage and window
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStorage.get(key) ?? null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

async function runTests() {
  // Test 1: Verify Default Public Channels
  assert.ok(Array.isArray(DEFAULT_PUBLIC_CHANNELS));
  assert.strictEqual(DEFAULT_PUBLIC_CHANNELS.length, 4);
  console.log('✔ Test 1 passed: Default channels exist');

  // Test 2: Create a public custom channel with local/guest user fallback
  localStorage.setItem('userHandle', 'TestOperator');
  const pubChan = await ChatService.createCustomChannel({
    name: 'Vanguard Alpha Station',
    topic: 'Frontline recon operations',
    isPublic: true,
    type: 'custom',
    members: []
  });

  assert.ok(pubChan.id.startsWith('custom_'), 'ID should start with custom_');
  assert.strictEqual(pubChan.name, 'vanguard-alpha-station');
  assert.strictEqual(pubChan.displayName, '#vanguard-alpha-station');
  assert.strictEqual(pubChan.isPublic, true);
  assert.strictEqual(pubChan.type, 'custom');
  assert.strictEqual(pubChan.createdById, 'local_TestOperator');
  console.log('✔ Test 2 passed: Public custom channel created with sanitized name & local operator');

  // Test 3: Create an encrypted / private custom channel
  const privChan = await ChatService.createCustomChannel({
    name: '  --Black-Ops_Room--  ',
    topic: 'Encrypted intelligence',
    isPublic: false,
    type: 'custom',
    members: ['user_agent_47']
  });

  assert.strictEqual(privChan.name, 'black-ops_room');
  assert.strictEqual(privChan.displayName, '#black-ops_room');
  assert.strictEqual(privChan.isPublic, false);
  assert.ok(privChan.members.includes('user_agent_47'));
  console.log('✔ Test 3 passed: Encrypted custom channel created with stripped dashes');

  // Test 4: Verify Local Cache Persistence
  const cachedChannels = await StorageService.getItem('tangent_channels_cache', []);
  assert.ok(cachedChannels.some(c => c.id === pubChan.id), 'Public custom channel must be in cache');
  assert.ok(cachedChannels.some(c => c.id === privChan.id), 'Private custom channel must be in cache');
  console.log('✔ Test 4 passed: Channels are persisted in tangent_channels_cache');

  // Test 5: Channel Filtering Logic Parity
  const allChannels = [...DEFAULT_PUBLIC_CHANNELS, pubChan, privChan];

  // 5a. Public channels filter must include public custom channels
  const publicFiltered = allChannels.filter(c => 
    c.type === 'public' || 
    c.id.startsWith('public_') || 
    (c.isPublic === true && c.type !== 'direct' && c.type !== 'group' && !c.id.startsWith('dm_') && !c.id.startsWith('group_'))
  );
  assert.ok(publicFiltered.some(c => c.id === pubChan.id), 'Public custom channel must be visible in publicFiltered');
  assert.ok(!publicFiltered.some(c => c.id === privChan.id), 'Encrypted channel must NOT be in publicFiltered');
  console.log('✔ Test 5a passed: Public channels filter correctly includes public custom channels');

  // 5b. Custom channels filter must include encrypted and custom channels
  const customFiltered = allChannels.filter(c => 
    c.type !== 'public' && 
    !c.id.startsWith('public_') && 
    c.type !== 'direct' && 
    !c.id.startsWith('dm_') && 
    c.type !== 'group' && 
    !c.groupId &&
    !c.id.startsWith('group_') &&
    !(Array.isArray(c.characterMembers) && c.characterMembers.length > 0) &&
    c.type !== 'persona_log' && 
    !c.id.startsWith('persona_log_')
  );
  assert.ok(customFiltered.some(c => c.id === pubChan.id), 'Custom channel must be in customFiltered');
  assert.ok(customFiltered.some(c => c.id === privChan.id), 'Encrypted custom channel must be in customFiltered');
  console.log('✔ Test 5b passed: Custom channels filter correctly captures operator channels');

  // Test 6: Edit Channel - renameChannel
  const renamed = await ChatService.renameChannel(
    pubChan.id, 
    '--Omega-Sector-Recon--', 
    'Updated reconnaissance transmission frequency'
  );
  assert.strictEqual(renamed.name, 'omega-sector-recon', 'Slug should be sanitized without dashes');
  assert.strictEqual(renamed.displayName, '#omega-sector-recon');
  assert.strictEqual(renamed.topic, 'Updated reconnaissance transmission frequency');

  const cacheAfterRename = await StorageService.getItem('tangent_channels_cache', []);
  const cachedRenamed = cacheAfterRename.find(c => c.id === pubChan.id);
  assert.ok(cachedRenamed, 'Renamed channel must remain in cache');
  assert.strictEqual(cachedRenamed.displayName, '#omega-sector-recon', 'Cache must have updated displayName');
  assert.strictEqual(cachedRenamed.topic, 'Updated reconnaissance transmission frequency', 'Cache must have updated topic');
  console.log('✔ Test 6 passed: renameChannel updates slug, displayName, topic, and persists to cache');

  // Test 7: Edit Channel - updateChannel
  const updatedProps = await ChatService.updateChannel(privChan.id, {
    isPublic: true,
    topic: 'Encrypted frequency upgraded to public broadcast'
  });
  assert.strictEqual(updatedProps.isPublic, true);

  const cacheAfterUpdate = await StorageService.getItem('tangent_channels_cache', []);
  const cachedUpdated = cacheAfterUpdate.find(c => c.id === privChan.id);
  assert.ok(cachedUpdated, 'Updated channel must remain in cache');
  assert.strictEqual(cachedUpdated.isPublic, true, 'Cache must reflect updated isPublic');
  assert.strictEqual(cachedUpdated.topic, 'Encrypted frequency upgraded to public broadcast');
  console.log('✔ Test 7 passed: updateChannel updates properties and persists to cache');

  // Test 8: Delete Channel - Safety guard on default channels
  let protectedThrew = false;
  try {
    await ChatService.deleteChannel('public_general');
  } catch (e) {
    protectedThrew = true;
    assert.strictEqual(e.message, 'Default public channels cannot be deleted');
  }
  assert.ok(protectedThrew, 'Attempting to delete public_general must throw error');
  console.log('✔ Test 8 passed: Deletion guard prevents deleting core default Holonet frequencies');

  // Test 9: Delete Channel - Custom channel removal
  await ChatService.deleteChannel(pubChan.id);
  const afterDeleteCache = await StorageService.getItem('tangent_channels_cache', []);
  assert.ok(!afterDeleteCache.some(c => c.id === pubChan.id), 'Deleted channel must be removed from cache');

  await ChatService.deleteChannel(privChan.id);
  const finalCache = await StorageService.getItem('tangent_channels_cache', []);
  assert.ok(!finalCache.some(c => c.id === privChan.id), 'Deleted channel must be removed from cache');
  // Test 10: Verify Public Channels Security and Matching Rules
  DEFAULT_PUBLIC_CHANNELS.forEach(ch => {
    assert.ok(ch.id.startsWith('public_'), `Public channel ${ch.id} must start with public_ prefix`);
    assert.strictEqual(ch.isPublic, true, `Channel ${ch.id} must have isPublic set to true`);
    assert.strictEqual(ch.type, 'public', `Channel ${ch.id} must have type set to public`);
  });
  console.log('✔ Test 10 passed: All default channels comply with firestore public security rules');

  console.log('\nAll Frequencies & Channels (Create, Edit, Delete) tests PASSED successfully!');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
