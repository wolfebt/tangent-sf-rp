/**
 * TANGENT SFF RP: Contextual Tactical Barks & Radio Chatter Service
 * Generates automated in-character battle cries, radio callouts, and distress chatter
 * for NPCs and adversaries during live VTT tactical combat.
 */

import { AudioService } from './audioService';

export const BARK_CATEGORIES = {
  engaging: [
    "Hostile operative acquired in sightline! Opening fire!",
    "Target locked! Discharging plasma burst!",
    "All units, concentrate fire on designated mark!",
    "Contact! Sector is hot!"
  ],
  pinned_down: [
    "Heavy suppression! I can't peek the bulkhead!",
    "Taking heavy kinetic fire! Requesting flanking support!",
    "Shields buckling under concentrated fire!",
    "Pinned down in the corridor! Need cover fire!"
  ],
  leader_down: [
    "Sector Commander is down! Fall back to secondary positions!",
    "Squad lead eliminated! Who has tactical command?!",
    "Command frequency is silent! Secure the perimeter or retreat!"
  ],
  taking_damage: [
    "Armor breach on my chassis! Vitality dropping fast!",
    "Critical hit taken! Structure integrity compromised!",
    "I'm hit! Med-drone needed at my coordinates!"
  ],
  surrender_plea: [
    "Cease fire! Cease fire! We yield our weapons!",
    "Don't shoot! I'm dropping my armament and unlocking the door!",
    "We surrender! Just call off the heavy fire!"
  ],
  flanking: [
    "Moving around their blind spot! Establish crossfire!",
    "Flanking vector engaged! Catching them outside cover!",
    "Pincer movement initialized. Closing the pocket!"
  ]
};

/**
 * Returns a random contextual radio bark for an NPC.
 */
export function getTacticalBark(category = 'engaging', npcName = 'Adversary') {
  const list = BARK_CATEGORIES[category] || BARK_CATEGORIES.engaging;
  const quote = list[Math.floor(Math.random() * list.length)];

  AudioService.playTerminalBeep(980, 0.04);

  return {
    category,
    speaker: npcName,
    quote: `[RADIO RELAY] @${npcName}: "${quote}"`,
    timestamp: new Date().toISOString()
  };
}

export default {
  BARK_CATEGORIES,
  getTacticalBark
};
