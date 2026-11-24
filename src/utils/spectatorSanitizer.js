/**
 * @file spectatorSanitizer.js
 * @description Sanitizes Architect map documents before writing to the public
 * `spectator_maps/{mapId}` projection so GM secrets, hidden ambush tokens,
 * concealed traps, and secret door metadata are never leaked to spectators.
 */

const SECRET_FIELD_KEYS = [
  'gmNotes',
  'secrets',
  'gmSecrets',
  'gmSecretNotes',
  'theSecret',
  'architectNotes',
  'vttScript',
  'macroScript',
  'quickJsMacro',
  'script',
  'hackDc',
  'athleticsDc',
  'authorEmail',
  'lockDc',
  'trapState'
];

const SECRET_FIELD_KEY_SET = new Set(SECRET_FIELD_KEYS);

function stripSecretFields(value, seen = new WeakSet()) {
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return value;
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => stripSecretFields(item, seen));
  }

  const clean = {};
  for (const [k, v] of Object.entries(value)) {
    if (SECRET_FIELD_KEY_SET.has(k)) continue;
    clean[k] = v && typeof v === 'object' ? stripSecretFields(v, seen) : v;
  }
  return clean;
}

function isPlayerVisibleRecord(item) {
  if (!item || typeof item !== 'object') return false;
  return (
    !item.isHidden &&
    !item.hidden &&
    !item.is_hidden &&
    !item.isGmOnly &&
    !item.gmOnly &&
    item.visible !== false &&
    item.layer !== 'gm'
  );
}

export function sanitizeMapForSpectator(map, user = null) {
  if (!map || typeof map !== 'object') return null;

  const tokens = Array.isArray(map.tokens)
    ? map.tokens.filter(isPlayerVisibleRecord).map((item) => stripSecretFields(item))
    : [];

  const objects = Array.isArray(map.objects)
    ? map.objects
        .filter((o) => isPlayerVisibleRecord(o) && !o.isTrap && !o.secret && !o.isSecret && o.type !== 'hazard')
        .map((item) => stripSecretFields(item))
    : [];

  const texts = Array.isArray(map.texts)
    ? map.texts.filter(isPlayerVisibleRecord).map((item) => stripSecretFields(item))
    : [];

  const terrains = Array.isArray(map.terrains)
    ? map.terrains.filter(isPlayerVisibleRecord).map((item) => stripSecretFields(item))
    : [];

  const fog = Array.isArray(map.fog)
    ? map.fog.filter(isPlayerVisibleRecord).map((item) => stripSecretFields(item))
    : [];

  const lines = Array.isArray(map.lines)
    ? map.lines.filter(isPlayerVisibleRecord).map((item) => stripSecretFields(item))
    : [];

  const layers = Array.isArray(map.layers)
    ? map.layers.filter(isPlayerVisibleRecord).map((item) => stripSecretFields(item))
    : [];

  const walls = Array.isArray(map.walls)
    ? map.walls
        .filter(isPlayerVisibleRecord)
        .map((w) => {
          const cleaned = stripSecretFields(w);
          const isClosedSecretDoor = Boolean(
            cleaned.isSecret && !cleaned.isOpen && cleaned.doorState !== 'open'
          );
          if (isClosedSecretDoor) {
            const {
              isDynamic: _d,
              isDoor: _dr,
              wallType: _wt,
              doorState: _ds,
              hackDc: _hd,
              breachHp: _bh,
              label: _lb,
              ...plainWall
            } = cleaned;
            return {
              ...plainWall,
              type: 'solid',
              isSecret: false,
              isOpen: false
            };
          }
          return cleaned;
        })
    : [];

  const lights = Array.isArray(map.lights)
    ? map.lights.filter(isPlayerVisibleRecord).map((item) => stripSecretFields(item))
    : [];

  const regions = Array.isArray(map.regions)
    ? map.regions
        .filter((r) => r && r.triggerType !== 'story_flag' && isPlayerVisibleRecord(r))
        .map((item) => stripSecretFields(item))
    : [];

  const isPlaceholderOwner = (val) => !val || val === 'local' || val === 'system';
  const resolvedAuthorUid = !isPlaceholderOwner(map.authorUid) ? map.authorUid : (user?.uid || 'local');
  const resolvedCreatorId = !isPlaceholderOwner(map.creatorId) ? map.creatorId : (user?.uid || resolvedAuthorUid || 'local');

  return {
    id: map.id,
    title: map.title || 'Tactical Encounter',
    name: map.name || map.title || 'Tactical Encounter',
    type: map.type || 'Sector',
    width: map.width || 3000,
    height: map.height || 2000,
    gridMode: map.gridMode || map.gridType || 'hex',
    ...(map.gridSize !== undefined ? { gridSize: Number(map.gridSize) } : {}),
    fogEnabled: Boolean(map.fogEnabled),
    ...(map.exploredFog ? { exploredFog: stripSecretFields(map.exploredFog) } : {}),
    ...(map.enableWallShadows !== undefined ? { enableWallShadows: Boolean(map.enableWallShadows) } : {}),
    ...(map.background_url ? { background_url: map.background_url } : {}),
    ...(map.videoBackgroundUrl ? { videoBackgroundUrl: map.videoBackgroundUrl } : {}),
    ...(map.underlay && typeof map.underlay === 'object' ? { underlay: stripSecretFields(map.underlay) } : {}),
    ...(map.atmosphericWeather ? { atmosphericWeather: String(map.atmosphericWeather) } : {}),
    ...(map.lightingMode ? { lightingMode: String(map.lightingMode) } : {}),
    lights,
    regions,
    lines,
    layers,
    tokens,
    objects,
    texts,
    terrains,
    fog,
    walls,
    ...(map.campaignId ? { campaignId: map.campaignId } : {}),
    ...(map.groupId ? { groupId: map.groupId } : {}),
    isSpectatorLive: true,
    updatedAt: new Date().toISOString(),
    authorUid: resolvedAuthorUid,
    creatorId: resolvedCreatorId
  };
}

export default sanitizeMapForSpectator;
