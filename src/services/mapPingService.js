/**
 * TANGENT SFF RP: Tactical Ping & Beacon Overlay Service
 * Manages animated radar pulses on the VTT canvas with team colors, sonar audio cues, and auto-decay.
 */

export const CANONICAL_PING_TYPES = [
  {
    type: 'danger',
    label: 'Hostile Danger',
    icon: '⚠️',
    defaultColor: '#ef4444',
    soundFreq: 440,
    durationSec: 5
  },
  {
    type: 'move',
    label: 'Rally / Move Here',
    icon: '📍',
    defaultColor: '#06b6d4',
    soundFreq: 880,
    durationSec: 5
  },
  {
    type: 'target',
    label: 'Priority Target',
    icon: '🎯',
    defaultColor: '#f59e0b',
    soundFreq: 1200,
    durationSec: 5
  },
  {
    type: 'defend',
    label: 'Defend / Hold',
    icon: '🛡️',
    defaultColor: '#a855f7',
    soundFreq: 660,
    durationSec: 5
  }
];

export const createTacticalPing = (
  x = 0,
  y = 0,
  type = 'move',
  customLabel = null,
  senderName = 'Operative',
  teamColor = null
) => {
  const pingDef = CANONICAL_PING_TYPES.find(p => p.type === type) || CANONICAL_PING_TYPES[1];

  return {
    id: `ping_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    x: Math.round(x),
    y: Math.round(y),
    type: pingDef.type,
    icon: pingDef.icon,
    label: customLabel || pingDef.label,
    color: teamColor || pingDef.defaultColor,
    soundFreq: pingDef.soundFreq,
    senderName,
    createdAt: Date.now(),
    expiresAt: Date.now() + pingDef.durationSec * 1000
  };
};

export const filterExpiredPings = (pings = [], now = Date.now()) => {
  return pings.filter(p => p.expiresAt > now);
};
