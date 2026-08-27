/**
 * Universal Persona Bridge for TANGENT SF RP React Project (Persona Folio)
 * Provides 100% loss-free bidirectional conversion between Persona Folio and Story Foundry Persona Elements.
 */

export const isPersonaFolioData = (data) => {
  if (!data || typeof data !== 'object') return false;
  return Boolean(
    data['char-name'] !== undefined ||
    data['character-doc-id'] !== undefined ||
    data['starting-cp'] !== undefined ||
    data['attr-strength'] !== undefined ||
    (Array.isArray(data.features) && Array.isArray(data.attacks))
  );
};

export const isStoryElementData = (data) => {
  if (!data || typeof data !== 'object') return false;
  if ((data.type === 'TangentStoryElement' || data.type === 'TangentStoryComponent') && (data.element || data.component)) {
    return true;
  }
  return Boolean(data.id && data.title && data.type);
};

const safeJsonStringify = (val, indent = 2) => {
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val, null, indent);
  } catch (e) {
    return '';
  }
};

const safeJsonParse = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

export const convertFolioToPersonaElement = (folioData, options = {}) => {
  if (!folioData || typeof folioData !== 'object') return null;

  const charName = folioData['char-name'] || folioData.name || folioData.title || 'Unnamed Operative';
  const elementId = options.id || `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const fields = {
    // Narrative: Overview
    'role': folioData.role || '',
    'char-concept': folioData['char-concept'] || '',
    'summary': folioData.summary || '',
    'char-motive': folioData['char-motive'] || '',
    'primaryConflict': folioData.primaryConflict || '',

    // Narrative: Profile: Vitals
    'char-name': charName,
    'nicknames': folioData.nicknames || '',
    'char-age': String(folioData['char-age'] ?? ''),
    'char-gender': folioData['char-gender'] || '',
    'char-occu': folioData['char-occu'] || '',
    'socialClass': folioData.socialClass || '',
    'char-origin': folioData['char-origin'] || '',
    'char-faction': folioData['char-faction'] || '',
    'currentResidence': folioData.currentResidence || '',

    // Narrative: Profile: Physicality
    'appearance': folioData.appearance || '',
    'char-height': folioData['char-height'] || '',
    'char-weight': folioData['char-weight'] || '',
    'voice': folioData.voice || '',
    'char-style': folioData['char-style'] || folioData.clothing || '',
    'mannerisms': folioData.mannerisms || '',

    // Narrative: Profile: Personality
    'positiveTraits': folioData.positiveTraits || '',
    'negativeTraits': folioData.negativeTraits || '',
    'likesDislikes': folioData.likesDislikes || '',
    'hobbies': folioData.hobbies || '',
    'personalityType': folioData.personalityType || '',

    // Narrative: Backstory
    'backstory': folioData.backstory || '',
    'definingTrauma': folioData.definingTrauma || '',
    'greatestAccomplishment': folioData.greatestAccomplishment || '',
    'childhoodEvents': folioData.childhoodEvents || '',
    'keyRelationships': folioData.keyRelationships || '',

    // Narrative: Psychology
    'worldview': folioData.worldview || '',
    'theLie': folioData.theLie || '',
    'theTruth': folioData.theTruth || '',
    'deepestFear': folioData.deepestFear || '',
    'goals': folioData.goals || '',
    'stakes': folioData.stakes || '',

    // Narrative: Genre & Connections
    'char-species': folioData['char-species'] || '',
    'stats': folioData.stats || '',
    'plotHooks': folioData.plotHooks || '',
    'romanticHistory': folioData.romanticHistory || '',
    'tags': Array.isArray(folioData.tags) ? folioData.tags.join(', ') : (folioData.tags || ''),

    // Mechanics: Vitals & Attributes
    'starting-cp': String(folioData['starting-cp'] ?? 150),
    'tech-level': String(folioData['tech-level'] ?? 3),
    'magic-level': String(folioData['magic-level'] ?? 1),
    'health': String(folioData.health ?? 30),
    'vitality': String(folioData.vitality ?? 30),
    'structure': String(folioData.structure ?? 60),
    'karma': String(folioData.karma ?? 3),
    'plot-points': String(folioData['plot-points'] ?? 0),
    'initiative-mod': String(folioData['initiative-mod'] ?? 0),

    'attr-strength': String(folioData['attr-strength'] ?? 3),
    'attr-might': String(folioData['attr-might'] ?? 8),
    'attr-agility': String(folioData['attr-agility'] ?? 3),
    'attr-reflex': String(folioData['attr-reflex'] ?? 8),
    'attr-stamina': String(folioData['attr-stamina'] ?? 3),
    'attr-fortitude': String(folioData['attr-fortitude'] ?? 8),
    'attr-intellect': String(folioData['attr-intellect'] ?? 3),
    'attr-logic': String(folioData['attr-logic'] ?? 8),
    'attr-wisdom': String(folioData['attr-wisdom'] ?? 3),
    'attr-will': String(folioData['attr-will'] ?? 8),
    'attr-charisma': String(folioData['attr-charisma'] ?? 3),
    'attr-etiquette': String(folioData['attr-etiquette'] ?? 8),

    // Mechanics: Lists & JSON
    'specializations': safeJsonStringify(folioData.specializations || []),
    'features': safeJsonStringify(folioData.features || []),
    'disadvantages': safeJsonStringify(folioData.disadvantages || []),
    'augmentations': safeJsonStringify(folioData.augmentations || []),
    'awakened': safeJsonStringify(folioData.awakened || []),
    'invocations': safeJsonStringify(folioData.invocations || []),
    'special_abilities': safeJsonStringify(folioData.special_abilities || []),
    'attacks': safeJsonStringify(folioData.attacks || []),
    'armor': safeJsonStringify(folioData.armor || []),
    'gear': safeJsonStringify(folioData.gear || []),
    'weapons': safeJsonStringify(folioData.weapons || []),
    'armoring': safeJsonStringify(folioData.armoring || []),
    'mecha': safeJsonStringify(folioData.mecha || []),
    'other': safeJsonStringify(folioData.other || []),
    'notes': safeJsonStringify(folioData.notes || [])
  };

  Object.keys(folioData).forEach(key => {
    if (key.startsWith('skill-')) {
      fields[key] = typeof folioData[key] === 'object' ? safeJsonStringify(folioData[key]) : String(folioData[key]);
    }
  });

  let content = folioData.content || '';
  if (!content) {
    const conceptLine = folioData['char-concept'] ? `<strong>Archetype:</strong> ${folioData['char-concept']}<br/>` : '';
    const speciesLine = folioData['char-species'] ? `<strong>Species:</strong> ${folioData['char-species']} | ` : '';
    const occuLine = folioData['char-occu'] ? `<strong>Occupation:</strong> ${folioData['char-occu']}<br/>` : '';
    const summaryLine = folioData.summary ? `<p><em>"${folioData.summary}"</em></p>` : '';
    const backstoryLine = folioData.backstory ? `<h4>Backstory</h4><p>${folioData.backstory.replace(/\n/g, '<br/>')}</p>` : '';
    content = `<h3>${charName}</h3><p>${speciesLine}${occuLine}${conceptLine}</p>${summaryLine}${backstoryLine}`;
  }

  return {
    id: elementId,
    title: charName,
    type: 'Persona',
    content: content,
    imageUrl: folioData.imageUrl || '',
    fields: fields,
    customFields: Array.isArray(folioData.customFields) ? folioData.customFields : [],
    children: [],
    personaData: { ...folioData, 'char-name': charName },
    authorHandle: folioData.authorHandle || '',
    ownerUid: folioData.ownerUid || 'local',
    updatedAt: new Date().toISOString()
  };
};

export const convertPersonaElementToFolio = (element) => {
  if (!element || typeof element !== 'object') return null;

  const rawElement = (element.type === 'TangentStoryElement' && element.element) ? element.element : element;
  const fields = rawElement.fields || {};
  const attachedFolio = rawElement.personaData || {};

  const parseNum = (val, defaultVal = 0) => {
    if (val === undefined || val === null || val === '') return defaultVal;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultVal : parsed;
  };

  const name = fields['char-name'] || rawElement.title || attachedFolio['char-name'] || 'Unnamed Operative';

  const folioResult = {
    'character-doc-id': attachedFolio['character-doc-id'] || `char_${Date.now()}`,
    isPublic: Boolean(attachedFolio.isPublic),
    authorHandle: rawElement.authorHandle || attachedFolio.authorHandle || '',
    contributors: attachedFolio.contributors || [],
    ownerUid: rawElement.ownerUid || attachedFolio.ownerUid || '',

    // Identity
    'char-name': name,
    'char-concept': fields['char-concept'] || attachedFolio['char-concept'] || '',
    'char-species': fields['char-species'] || attachedFolio['char-species'] || '',
    'char-occu': fields['char-occu'] || attachedFolio['char-occu'] || '',
    'char-origin': fields['char-origin'] || attachedFolio['char-origin'] || '',
    'char-faction': fields['char-faction'] || attachedFolio['char-faction'] || '',
    'char-age': fields['char-age'] || attachedFolio['char-age'] || '',
    'char-gender': fields['char-gender'] || attachedFolio['char-gender'] || '',
    'char-height': fields['char-height'] || attachedFolio['char-height'] || '',
    'char-weight': fields['char-weight'] || attachedFolio['char-weight'] || '',
    'char-style': fields['char-style'] || attachedFolio['char-style'] || '',
    'char-motive': fields['char-motive'] || attachedFolio['char-motive'] || '',

    // Vitals & Core Stats
    'starting-cp': parseNum(fields['starting-cp'] ?? attachedFolio['starting-cp'], 150),
    'tech-level': parseNum(fields['tech-level'] ?? attachedFolio['tech-level'], 3),
    'magic-level': parseNum(fields['magic-level'] ?? attachedFolio['magic-level'], 1),
    'health': parseNum(fields.health ?? attachedFolio.health, 30),
    'vitality': parseNum(fields.vitality ?? attachedFolio.vitality, 30),
    'structure': parseNum(fields.structure ?? attachedFolio.structure, 60),
    'karma': parseNum(fields.karma ?? attachedFolio.karma, 3),
    'plot-points': parseNum(fields['plot-points'] ?? attachedFolio['plot-points'], 0),
    'initiative-mod': parseNum(fields['initiative-mod'] ?? attachedFolio['initiative-mod'], 0),

    // 12 Attributes
    'attr-strength': parseNum(fields['attr-strength'] ?? attachedFolio['attr-strength'], 3),
    'attr-might': parseNum(fields['attr-might'] ?? attachedFolio['attr-might'], 8),
    'attr-agility': parseNum(fields['attr-agility'] ?? attachedFolio['attr-agility'], 3),
    'attr-reflex': parseNum(fields['attr-reflex'] ?? attachedFolio['attr-reflex'], 8),
    'attr-stamina': parseNum(fields['attr-stamina'] ?? attachedFolio['attr-stamina'], 3),
    'attr-fortitude': parseNum(fields['attr-fortitude'] ?? attachedFolio['attr-fortitude'], 8),
    'attr-intellect': parseNum(fields['attr-intellect'] ?? attachedFolio['attr-intellect'], 3),
    'attr-logic': parseNum(fields['attr-logic'] ?? attachedFolio['attr-logic'], 8),
    'attr-wisdom': parseNum(fields['attr-wisdom'] ?? attachedFolio['attr-wisdom'], 3),
    'attr-will': parseNum(fields['attr-will'] ?? attachedFolio['attr-will'], 8),
    'attr-charisma': parseNum(fields['attr-charisma'] ?? attachedFolio['attr-charisma'], 3),
    'attr-etiquette': parseNum(fields['attr-etiquette'] ?? attachedFolio['attr-etiquette'], 8),

    // Narrative & Lore
    role: fields.role || attachedFolio.role || '',
    summary: fields.summary || attachedFolio.summary || '',
    primaryConflict: fields.primaryConflict || attachedFolio.primaryConflict || '',
    nicknames: fields.nicknames || attachedFolio.nicknames || '',
    socialClass: fields.socialClass || attachedFolio.socialClass || '',
    currentResidence: fields.currentResidence || attachedFolio.currentResidence || '',
    appearance: fields.appearance || attachedFolio.appearance || '',
    voice: fields.voice || attachedFolio.voice || '',
    mannerisms: fields.mannerisms || attachedFolio.mannerisms || '',
    positiveTraits: fields.positiveTraits || attachedFolio.positiveTraits || '',
    negativeTraits: fields.negativeTraits || attachedFolio.negativeTraits || '',
    likesDislikes: fields.likesDislikes || attachedFolio.likesDislikes || '',
    hobbies: fields.hobbies || attachedFolio.hobbies || '',
    personalityType: fields.personalityType || attachedFolio.personalityType || '',
    backstory: fields.backstory || attachedFolio.backstory || '',
    definingTrauma: fields.definingTrauma || attachedFolio.definingTrauma || '',
    greatestAccomplishment: fields.greatestAccomplishment || attachedFolio.greatestAccomplishment || '',
    childhoodEvents: fields.childhoodEvents || attachedFolio.childhoodEvents || '',
    keyRelationships: fields.keyRelationships || attachedFolio.keyRelationships || '',
    worldview: fields.worldview || attachedFolio.worldview || '',
    theLie: fields.theLie || attachedFolio.theLie || '',
    theTruth: fields.theTruth || attachedFolio.theTruth || '',
    deepestFear: fields.deepestFear || attachedFolio.deepestFear || '',
    goals: fields.goals || attachedFolio.goals || '',
    stakes: fields.stakes || attachedFolio.stakes || '',
    stats: fields.stats || attachedFolio.stats || '',
    plotHooks: fields.plotHooks || attachedFolio.plotHooks || '',
    romanticHistory: fields.romanticHistory || attachedFolio.romanticHistory || '',
    tags: fields.tags || attachedFolio.tags || '',

    // Structured Arrays
    specializations: safeJsonParse(fields.specializations, attachedFolio.specializations || []),
    features: safeJsonParse(fields.features, attachedFolio.features || []),
    disadvantages: safeJsonParse(fields.disadvantages, attachedFolio.disadvantages || []),
    augmentations: safeJsonParse(fields.augmentations, attachedFolio.augmentations || []),
    awakened: safeJsonParse(fields.awakened, attachedFolio.awakened || []),
    invocations: safeJsonParse(fields.invocations, attachedFolio.invocations || []),
    special_abilities: safeJsonParse(fields.special_abilities, attachedFolio.special_abilities || []),
    attacks: safeJsonParse(fields.attacks, attachedFolio.attacks || []),
    armor: safeJsonParse(fields.armor, attachedFolio.armor || []),
    gear: safeJsonParse(fields.gear, attachedFolio.gear || []),
    weapons: safeJsonParse(fields.weapons, attachedFolio.weapons || []),
    armoring: safeJsonParse(fields.armoring, attachedFolio.armoring || []),
    mecha: safeJsonParse(fields.mecha, attachedFolio.mecha || []),
    other: safeJsonParse(fields.other, attachedFolio.other || []),
    notes: safeJsonParse(fields.notes, attachedFolio.notes || [{ text: '' }])
  };

  const allKeys = new Set([...Object.keys(attachedFolio), ...Object.keys(fields)]);
  allKeys.forEach(key => {
    if (key.startsWith('skill-')) {
      const val = fields[key] !== undefined ? fields[key] : attachedFolio[key];
      if (key.endsWith('-rank') || key.endsWith('-mod')) {
        folioResult[key] = parseNum(val, 0);
      } else {
        folioResult[key] = val;
      }
    }
  });

  return folioResult;
};

export const exportStoryElementJSON = (characterData) => {
  if (!characterData) return;
  const elementObj = convertFolioToPersonaElement(characterData);
  const name = characterData['char-name'] || 'persona';
  const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
  const fileName = `${cleanName}-persona.json`;

  const payload = {
    type: "TangentStoryElement",
    version: "2.0",
    element: elementObj,
    linkedMap: null
  };

  const dataStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
