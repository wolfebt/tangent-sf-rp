/**
 * Element Input Schemas & Field Definitions for Story Foundry
 * Maps each of the 10 Scenario Element Types to its focused input fields.
 */

export const ELEMENT_TYPES = [
  'Story Arc', 'Adventure', 'Character', 'Location', 'Faction', 
  'Encounter', 'Item', 'Clue', 'Map', 'Handout'
];

export const ELEMENT_SCHEMAS = {
  'Story Arc': [
    { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Brief overview of the arc...' },
    { key: 'goal', label: 'Goal', type: 'text', placeholder: 'Ultimate objective of this story arc...' },
    { key: 'antagonist', label: 'Key Antagonist', type: 'text', placeholder: 'Main opposing force or entity...' },
    { key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'How the arc concludes...' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed events and narrative breakdown...' },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'General ideas or GM reminders...' },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Classification tags (e.g. Cyberpunk, Sector-7, Psi)...' }
  ],
  'Adventure': [
    { key: 'hook', label: 'Hook', type: 'textarea', placeholder: 'How players are drawn into the adventure...' },
    { key: 'goal', label: 'Goal', type: 'text', placeholder: 'Primary objective...' },
    { key: 'stakes', label: 'Stakes', type: 'textarea', placeholder: 'Consequences of failure...' },
    { key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'How the adventure might end...' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed overview of the adventure...' },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'General reminders...' },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Gameplay tags (e.g. Investigation, Combat, Heist)...' }
  ],
  'Character': [
    { key: 'role', label: 'Role', type: 'text', placeholder: 'Role (e.g. Quest Giver, Rival, Fixer, Contact)...' },
    { key: 'appearance', label: 'Appearance', type: 'textarea', placeholder: 'Physical appearance, cybernetics, clothing...' },
    { key: 'motivation', label: 'Motivation', type: 'textarea', placeholder: 'What drives this character...' },
    { key: 'secrets', label: 'Secrets', type: 'textarea', placeholder: 'What they know that others don\'t...' },
    { key: 'plotHooks', label: 'Plot Hooks', type: 'textarea', placeholder: 'How they launch or start new adventures...' },
    { key: 'stats', label: 'Stats', type: 'textarea', placeholder: 'Game-specific stats, abilities, gear...' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed bio and history...' },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'General ideas or GM notes...' },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Character tags (e.g. Merchant, Ally, Faction-Lead)...' }
  ],
  'Location': [
    { key: 'locationType', label: 'Type', type: 'text', placeholder: 'Kind of place (e.g. Dungeon, Spaceport, Megacity)...' },
    { key: 'atmosphere', label: 'Atmosphere', type: 'text', placeholder: 'Mood, lighting, tension level...' },
    { key: 'keySights', label: 'Key Sights', type: 'textarea', placeholder: 'Notable visual features and landmarks...' },
    { key: 'soundsSmells', label: 'Sounds and Smells', type: 'textarea', placeholder: 'Auditory and olfactory details...' },
    { key: 'potentialEncounters', label: 'Potential Encounters', type: 'textarea', placeholder: 'Creatures, hazards, or events here...' },
    { key: 'secrets', label: 'Secrets', type: 'textarea', placeholder: 'Hidden truths or concealed areas...' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed location description...' },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'General ideas or notes...' },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Location tags (e.g. TL-4, High-Danger, Subterranean)...' }
  ],
  'Faction': [
    { key: 'goals', label: 'Goals', type: 'textarea', placeholder: 'What the faction wants to achieve...' },
    { key: 'ideology', label: 'Ideology', type: 'textarea', placeholder: 'Core beliefs and code of operation...' },
    { key: 'keyMembers', label: 'Key Members', type: 'textarea', placeholder: 'Important figures and leaders...' },
    { key: 'resources', label: 'Resources', type: 'textarea', placeholder: 'Assets, weapons, wealth, contacts...' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed faction overview...' },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'General reminders...' },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Faction tags (e.g. Megacorp, Syndicate, Cult)...' }
  ],
  'Encounter': [
    { key: 'encounterType', label: 'Type', type: 'text', placeholder: 'Kind of encounter (e.g. Combat, Social, Puzzle, Chase)...' },
    { key: 'setup', label: 'Setup', type: 'textarea', placeholder: 'How the encounter begins...' },
    { key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'Possible outcomes and rewards...' },
    { key: 'mechanic', label: 'Mechanics', type: 'textarea', placeholder: 'Special rules, timers, or hazards...' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed tactical setup...' },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'General ideas...' },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Encounter tags (e.g. Lethal, Tactical, Boss)...' }
  ],
  'Item': [
    { key: 'rarity', label: 'Rarity', type: 'text', placeholder: 'Rarity (e.g. Common, Prototype, Artifact)...' },
    { key: 'attunement', label: 'Attunement', type: 'text', placeholder: 'Attunement requirement (e.g. Cyberware ML-2)...' },
    { key: 'properties', label: 'Properties', type: 'textarea', placeholder: 'Passive abilities and bonuses...' },
    { key: 'mechanic', label: 'Mechanics', type: 'textarea', placeholder: 'Active functioning and usage rules...' },
    { key: 'history', label: 'History', type: 'textarea', placeholder: 'Origin story and previous owners...' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed item description...' },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'General reminders...' },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Item tags (e.g. Tech, Weapon, Psionic)...' }
  ],
  'Clue': [
    { key: 'information', label: 'Information Revealed', type: 'textarea', placeholder: 'What this clue reveals...' },
    { key: 'locationFound', label: 'Location Found', type: 'text', placeholder: 'Where or how it is discovered...' },
    { key: 'conclusion', label: 'Player Conclusion', type: 'textarea', placeholder: 'What players should realize...' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed clue description...' },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'General ideas...' },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Clue tags (e.g. Datapad, Forensic, Keycode)...' }
  ],
  'Map': [
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Purpose and overview of the map...' },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Tactical notes or GM map secrets...' },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Map tags (e.g. Grid-Square, Sector-A)...' }
  ],
  'Handout': [
    { key: 'content', label: 'Content', type: 'textarea', placeholder: 'Actual text on the handout...' },
    { key: 'notes', label: 'GM Notes', type: 'textarea', placeholder: 'GM-only notes (hidden from player handout)...' },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Handout tags (e.g. Document, Cipher, Letter)...' }
  ]
};
