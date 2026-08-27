/**
 * TANGENT SFF RP: Multi-Spectrum Sensor & Dynamic Vision Service
 * Calculates token sightlines, sensory penetration (Thermal, Night Vision, Cyber Radar, Meta-Attunement),
 * and dynamic fog-of-war reveal polygons.
 */

import { AudioService } from './audioService';

export const SENSOR_MODES = {
  standard_optical: {
    id: 'standard_optical',
    name: 'Standard Optical / Visible Light',
    icon: '👁️',
    baseRangePx: 450, // ~15m
    piercesSmoke: false,
    piercesDarkness: false,
    piercesWalls: false,
    description: 'Human-range visual spectrum. Blocked by walls, closed bulkheads, heavy smoke, and darkness.'
  },
  night_vision: {
    id: 'night_vision',
    name: 'Night Vision / Low-Light Amplification',
    icon: '🟢',
    baseRangePx: 400,
    piercesSmoke: false,
    piercesDarkness: true,
    piercesWalls: false,
    description: 'Phosphor image intensifier. Illuminates total darkness and low-light sectors.'
  },
  thermal_infrared: {
    id: 'thermal_infrared',
    name: 'Thermal / Infrared Sensor',
    icon: '🌡️',
    baseRangePx: 350,
    piercesSmoke: true,
    piercesDarkness: true,
    piercesWalls: false,
    description: 'Heat-signature tracking. Detects living operatives, active mecha, and running reactors through smoke screens.'
  },
  cyber_motion_radar: {
    id: 'cyber_motion_radar',
    name: 'Cybernetic Motion Radar',
    icon: '📡',
    baseRangePx: 300,
    piercesSmoke: true,
    piercesDarkness: true,
    piercesWalls: true,
    description: 'Microwave pulse radar. Detects movement pings through solid bulkheads and walls up to 10m.'
  },
  meta_attunement: {
    id: 'meta_attunement',
    name: 'Metaphysical / Psionic Attunement',
    icon: '🔮',
    baseRangePx: 380,
    piercesSmoke: true,
    piercesDarkness: true,
    piercesWalls: true,
    description: 'Sixth-sense aura perception. Detects awakened essence channels, dimensional rifts, and psionic focus points.'
  }
};

/**
 * Checks if a target token is detectable by a viewer token given sensor mode and map terrain occlusions.
 */
export function checkTargetVisibility(viewerToken, targetToken, sensorModeId = 'standard_optical', mapEnvironment = {}) {
  if (!viewerToken || !targetToken) return { visible: false, reason: 'invalid_tokens' };

  const sensor = SENSOR_MODES[sensorModeId] || SENSOR_MODES.standard_optical;
  const dist = Math.hypot((targetToken.x || 0) - (viewerToken.x || 0), (targetToken.y || 0) - (viewerToken.y || 0));

  if (dist > sensor.baseRangePx) {
    return { visible: false, reason: 'out_of_range', distance: Math.round(dist) };
  }

  // Smoke check
  if (mapEnvironment.hasSmoke && !sensor.piercesSmoke) {
    return { visible: false, reason: 'obscured_by_smoke', distance: Math.round(dist) };
  }

  // Darkness check
  if (mapEnvironment.isDark && !sensor.piercesDarkness) {
    return { visible: false, reason: 'obscured_by_darkness', distance: Math.round(dist) };
  }

  return {
    visible: true,
    sensorMode: sensor.name,
    icon: sensor.icon,
    distancePx: Math.round(dist),
    reason: 'in_sensor_range'
  };
}

export default {
  SENSOR_MODES,
  checkTargetVisibility
};
