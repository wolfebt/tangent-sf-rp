/**
 * TANGENT SFF RP: AIME Real-Time Virtual Co-GM & Atmosphere Director
 * Listens to VTT combat telemetry and synthesizes atmospheric cyber-noir
 * and space-opera narrative commentary and audio tension transitions in real time.
 */

import { AudioService } from './audioService';

/**
 * Generates immediate narrative commentary for key combat events.
 */
export function generateCombatCommentary(eventType, eventData = {}) {
  const { attackerName, targetName, damage, weapon, location, isCritical, isDowned, isTriumph, isFumble } = eventData;

  let narrativeText = '';
  let audioBeepTone = 1100;

  switch (eventType) {
    case 'critical_triumph':
      narrativeText = `⚡ TRIUMPH: ${attackerName || 'An operative'} lands a devastating pinpoint strike with ${weapon || 'their weapon'}, piercing straight through ${targetName || 'the target'}'s defenses for ${damage || 'massive'} damage!`;
      audioBeepTone = 1450;
      break;

    case 'critical_fumble':
      narrativeText = `⚠️ GLITCH: ${attackerName || 'The combatant'}'s weapon capacitor surges and misfires, leaving their flank exposed to counter-fire!`;
      audioBeepTone = 380;
      break;

    case 'operative_downed':
      narrativeText = `🚨 CASUALTY ALERT: ${targetName || 'Operative'} has collapsed under lethal trauma! Trauma monitors spiking — immediate stabilization required!`;
      audioBeepTone = 320;
      break;

    case 'terminal_sliced':
      narrativeText = `💻 DATA INTRUSION: ${attackerName || 'The slicer'} bypassed the security ICE protocols! Facility defenses powered down across the sector.`;
      audioBeepTone = 1250;
      break;

    case 'hazard_triggered':
      narrativeText = `☣️ HAZARD ENGAGED: The bulkhead breached, venting superheated plasma across the tactical sector!`;
      audioBeepTone = 600;
      break;

    default:
      if (isDowned) {
        narrativeText = `💀 ${targetName || 'Target'} is neutralized by ${attackerName || 'attacker'}!`;
      } else if (damage > 12) {
        narrativeText = `💥 Heavy impact: ${targetName || 'Target'} reels from a ${damage} damage blast on their ${location || 'chassis'}.`;
      } else {
        narrativeText = `⚔️ ${attackerName || 'Unit'} trades fire with ${targetName || 'target'}.`;
      }
      break;
  }

  AudioService.playTerminalBeep(audioBeepTone, 0.08);

  return {
    eventType,
    narrativeText,
    timestamp: new Date().toISOString()
  };
}

export default {
  generateCombatCommentary
};
