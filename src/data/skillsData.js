/**
 * Canonical Tangent SF RP Skills Database
 * Comprehensive definition of all skills across Physical, Mental, Social, Combat, and Metafocus groups.
 */

export const DEFAULT_SKILLS = {
  physical: [
    {
      title: null,
      skills: [
        { name: 'Acrobatics', id: 'physical-acrobatics', group: 'physical', baseAttr: 'attr-agility', description: 'Balance, tumbling, climbing, dodging, and gymnastic maneuvers.' },
        { name: 'Athletics', id: 'physical-athletics', group: 'physical', baseAttr: 'attr-strength', description: 'Running, jumping, swimming, lifting, and general physical prowess.' },
        { name: 'Endurance', id: 'physical-endurance', group: 'physical', baseAttr: 'attr-stamina', description: 'Physical stamina, pain tolerance, resisting exhaustion, and prolonged exertion.' },
        { name: 'Piloting', id: 'physical-piloting', group: 'physical', baseAttr: 'attr-agility', description: 'Operating atmospheric, space, and planetary surface vehicles.' },
        { name: 'Stealth', id: 'physical-stealth', group: 'physical', baseAttr: 'attr-agility', description: 'Moving silently, remaining undetected, and evading detection systems.' }
      ]
    }
  ],
  mental: [
    {
      title: 'General',
      skills: [
        { name: 'Alertness', id: 'mental-alertness', group: 'mental', baseAttr: 'attr-wisdom', description: 'Perception, sensory awareness, detecting hidden hazards or ambushes.' },
        { name: 'Academics', id: 'mental-academics', group: 'mental', baseAttr: 'attr-intellect', description: 'General higher education, scholarly research, and formal knowledge.' }
      ]
    },
    {
      title: 'Knowledges',
      skills: [
        { name: 'Appraisal', id: 'mental-appraisal', group: 'mental', baseAttr: 'attr-intellect', description: 'Assessing the monetary, historical, or technological value of goods.' },
        { name: 'Business', id: 'mental-business', group: 'mental', baseAttr: 'attr-intellect', description: 'Commerce, corporate finance, market economics, and enterprise management.' },
        { name: 'Computers', id: 'mental-computers', group: 'mental', baseAttr: 'attr-intellect', description: 'Hacking, programming, software engineering, and computer system security.' },
        { name: 'Culture', id: 'mental-culture', group: 'mental', baseAttr: 'attr-intellect', description: 'Customs, languages, etiquette, and social structures of diverse species and worlds.' },
        { name: 'History', id: 'mental-history', group: 'mental', baseAttr: 'attr-intellect', description: 'Historical records, past civilizations, conflicts, and galactic chronology.' },
        { name: 'Investigation', id: 'mental-investigation', group: 'mental', baseAttr: 'attr-intellect', description: 'Forensics, searching for clues, deducting motives, and solving mysteries.' },
        { name: 'Language', id: 'mental-language', group: 'mental', baseAttr: 'attr-intellect', description: 'Linguistics, deciphering scripts, and fluency in alien dialects.' },
        { name: 'Logistics', id: 'mental-logistics', group: 'mental', baseAttr: 'attr-intellect', description: 'Supply chains, resource distribution, transit scheduling, and fleet support.' },
        { name: 'Medicine', id: 'mental-medicine', group: 'mental', baseAttr: 'attr-intellect', description: 'First aid, surgery, pharmacology, pathology, and trauma treatment.' },
        { name: 'Metaphysics', id: 'mental-metaphysics', group: 'mental', baseAttr: 'attr-wisdom', description: 'Understanding the nature of psionic energy, the Void, and supernatural phenomena.' },
        { name: 'Nature', id: 'mental-nature', group: 'mental', baseAttr: 'attr-wisdom', description: 'Fauna, flora, ecosystems, ecology, and natural sciences.' },
        { name: 'Navigation', id: 'mental-navigation', group: 'mental', baseAttr: 'attr-intellect', description: 'Astrogation, hyperspace charting, compass reading, and planetary orienteering.' },
        { name: 'Nobility', id: 'mental-nobility', group: 'mental', baseAttr: 'attr-intellect', description: 'Heraldry, aristocratic hierarchies, courtly intrigue, and high-society protocols.' },
        { name: 'Physics', id: 'mental-physics', group: 'mental', baseAttr: 'attr-intellect', description: 'Astrophysics, quantum mechanics, gravimetrics, and energy thermodynamics.' },
        { name: 'Religion', id: 'mental-religion', group: 'mental', baseAttr: 'attr-wisdom', description: 'Theology, cult rituals, religious dogmas, sacred texts, and mythical traditions.' },
        { name: 'Science', id: 'mental-science', group: 'mental', baseAttr: 'attr-intellect', description: 'General scientific method, chemistry, biology, geology, and laboratory experimentation.' },
        { name: 'Survival', id: 'mental-survival', group: 'mental', baseAttr: 'attr-wisdom', description: 'Foraging, tracking, building shelters, firecraft, and wilderness survival.' },
        { name: 'Tactics', id: 'mental-tactics', group: 'mental', baseAttr: 'attr-intellect', description: 'Squad tactics, battle maneuvers, defensive positioning, and combat strategy.' },
        { name: 'Technology', id: 'mental-technology', group: 'mental', baseAttr: 'attr-intellect', description: 'Hardware maintenance, mechanical systems, cybernetics, and electronics.' },
        { name: 'Trade', id: 'mental-trade', group: 'mental', baseAttr: 'attr-intellect', description: 'Merchant lanes, interstellar tariffs, bargaining, and contraband smuggling.' }
      ]
    },
    {
      title: 'Vocations',
      skills: [
        { name: 'Administrator', id: 'mental-administrator', group: 'mental', baseAttr: 'attr-intellect', description: 'Bureaucratic processing, government record-keeping, and organization.' },
        { name: 'Alchemist', id: 'mental-alchemist', group: 'mental', baseAttr: 'attr-intellect', description: 'Creating potions, elixirs, chemical compounds, and reactive reagents.' },
        { name: 'Ambassador', id: 'mental-ambassador', group: 'mental', baseAttr: 'attr-charisma', description: 'Diplomatic negotiations, envoy missions, and high-level treaties.' },
        { name: 'Architect', id: 'mental-architect', group: 'mental', baseAttr: 'attr-intellect', description: 'Designing buildings, habitat domes, fortresses, and civil engineering.' },
        { name: 'Archivist', id: 'mental-archivist', group: 'mental', baseAttr: 'attr-intellect', description: 'Cataloging data archives, library indexes, and preserving ancient artifacts.' },
        { name: 'Armorer', id: 'mental-armorer', group: 'mental', baseAttr: 'attr-intellect', description: 'Fabricating, fitting, reinforcing, and repairing body armor and shields.' },
        { name: 'Artist', id: 'mental-artist', group: 'mental', baseAttr: 'attr-charisma', description: 'Visual arts, sculpting, painting, holography, and aesthetic design.' },
        { name: 'Artificer', id: 'mental-artificer', group: 'mental', baseAttr: 'attr-intellect', description: 'Crafting technological wonders, specialized gadgets, and prototypes.' },
        { name: 'Broker', id: 'mental-broker', group: 'mental', baseAttr: 'attr-intellect', description: 'Information dealing, resource arbitrage, and middleman transactions.' },
        { name: 'Celebrity', id: 'mental-celebrity', group: 'mental', baseAttr: 'attr-charisma', description: 'Media presence, public relations, fan interaction, and reputation handling.' },
        { name: 'Constable', id: 'mental-constable', group: 'mental', baseAttr: 'attr-wisdom', description: 'Law enforcement protocols, suspect detention, and security policing.' },
        { name: 'Courtesan', id: 'mental-courtesan', group: 'mental', baseAttr: 'attr-charisma', description: 'Social entertainment, high-class companionship, and subtle gathering of secrets.' },
        { name: 'Culinarian', id: 'mental-culinarian', group: 'mental', baseAttr: 'attr-wisdom', description: 'Gastronomy, alien cuisine preparation, brewing, and nutrition.' },
        { name: 'Demolitionist', id: 'mental-demolitionist', group: 'mental', baseAttr: 'attr-intellect', description: 'Explosives handling, bomb defusal, breaching, and controlled blasting.' },
        { name: 'Electrician', id: 'mental-electrician', group: 'mental', baseAttr: 'attr-intellect', description: 'Power grid wiring, circuitry, conduits, and electronic repair.' },
        { name: 'Engineer', id: 'mental-engineer', group: 'mental', baseAttr: 'attr-intellect', description: 'Heavy machinery, engine mechanics, reactor maintenance, and starship drives.' },
        { name: 'Farmer', id: 'mental-farmer', group: 'mental', baseAttr: 'attr-stamina', description: 'Agriculture, hydroponics, crop cultivation, and harvesting.' },
        { name: 'Groundskeeper', id: 'mental-groundskeeper', group: 'mental', baseAttr: 'attr-stamina', description: 'Estate maintenance, terrain upkeep, and environmental management.' },
        { name: 'Handler', id: 'mental-handler', group: 'mental', baseAttr: 'attr-wisdom', description: 'Animal husbandry, beast training, mounts, and xenofauna handling.' },
        { name: 'Laborer', id: 'mental-laborer', group: 'mental', baseAttr: 'attr-strength', description: 'Manual labor, construction, cargo hauling, and industrial tasks.' },
        { name: 'Mechanic', id: 'mental-mechanic', group: 'mental', baseAttr: 'attr-intellect', description: 'Vehicle diagnostics, engine overhaul, and mechanical repair.' },
        { name: 'Researcher', id: 'mental-researcher', group: 'mental', baseAttr: 'attr-intellect', description: 'Academic studies, data synthesis, hypothesis testing, and laboratory work.' },
        { name: 'Salvager', id: 'mental-salvager', group: 'mental', baseAttr: 'attr-wisdom', description: 'Scrapping wrecks, identifying valuable components, and recycling materials.' },
        { name: 'Soldier', id: 'mental-soldier', group: 'mental', baseAttr: 'attr-stamina', description: 'Military protocol, battlefield discipline, marching, and unit drill.' },
        { name: 'Tailor', id: 'mental-tailor', group: 'mental', baseAttr: 'attr-agility', description: 'Fabric crafting, custom tailoring, protective weave stitching, and fashion.' },
        { name: 'Transporter', id: 'mental-transporter', group: 'mental', baseAttr: 'attr-agility', description: 'Freight delivery, cargo transit, navigation under pressure, and escort driving.' },
        { name: 'Weaponsmith', id: 'mental-weaponsmith', group: 'mental', baseAttr: 'attr-intellect', description: 'Forging, calibrating, modding, and maintaining ranged and melee weaponry.' }
      ]
    }
  ],
  social: [
    {
      title: 'Expression',
      skills: [
        { name: 'Acting', id: 'social-acting', group: 'social', baseAttr: 'attr-charisma', description: 'Theatrical performance, emotional projection, and playing a role.' },
        { name: 'Comedy', id: 'social-comedy', group: 'social', baseAttr: 'attr-charisma', description: 'Humor, wit, comedic timing, and tension relief.' },
        { name: 'Dancing', id: 'social-dancing', group: 'social', baseAttr: 'attr-agility', description: 'Choreography, social dancing, and rhythmic physical grace.' },
        { name: 'Disguise', id: 'social-disguise', group: 'social', baseAttr: 'attr-intellect', description: 'Costuming, prosthetic makeup, and impersonation.' },
        { name: 'Keyboard', id: 'social-keyboard', group: 'social', baseAttr: 'attr-agility', description: 'Playing pianos, synthesizers, organ consoles, and electronic keyboards.' },
        { name: 'Legerdemain', id: 'social-legerdemain', group: 'social', baseAttr: 'attr-agility', description: 'Sleight of hand, pickpocketing, card tricks, and concealing small items.' },
        { name: 'Oratory', id: 'social-oratory', group: 'social', baseAttr: 'attr-charisma', description: 'Public speaking, rhetoric, debate, and inspiring crowds.' },
        { name: 'Percussion', id: 'social-percussion', group: 'social', baseAttr: 'attr-agility', description: 'Playing drums, percussion instruments, and rhythm keeping.' },
        { name: 'Singing', id: 'social-singing', group: 'social', baseAttr: 'attr-charisma', description: 'Vocal performance, pitch control, and melodic singing.' },
        { name: 'String', id: 'social-string', group: 'social', baseAttr: 'attr-agility', description: 'Playing acoustic or laser string instruments (guitars, violins, harps).' },
        { name: 'Style', id: 'social-style', group: 'social', baseAttr: 'attr-charisma', description: 'Poise, fashion, personal presentation, and social elegance.' },
        { name: 'Wind', id: 'social-wind', group: 'social', baseAttr: 'attr-stamina', description: 'Playing woodwind and brass musical instruments.' }
      ]
    },
    {
      title: 'Manipulation',
      skills: [
        { name: 'Barter', id: 'social-barter', group: 'social', baseAttr: 'attr-charisma', description: 'Haggling, negotiating prices, and trading goods.' },
        { name: 'Bluff', id: 'social-bluff', group: 'social', baseAttr: 'attr-charisma', description: 'Deception, lying convincingly, misdirection, and poker face.' },
        { name: 'Diplomacy', id: 'social-diplomacy', group: 'social', baseAttr: 'attr-charisma', description: 'Persuasion, mediating disputes, conflict resolution, and finding common ground.' },
        { name: 'Insight', id: 'social-insight', group: 'social', baseAttr: 'attr-wisdom', description: 'Reading body language, detecting lies, discerning motives, and empathy.' },
        { name: 'Intimidate', id: 'social-intimidate', group: 'social', baseAttr: 'attr-strength', description: 'Coercion, physical threats, forceful presence, and psychological pressure.' },
        { name: 'Leadership', id: 'social-leadership', group: 'social', baseAttr: 'attr-charisma', description: 'Commanding allies, inspiring morale, coordination, and maintaining unit order.' },
        { name: 'Streetwise', id: 'social-streetwise', group: 'social', baseAttr: 'attr-wisdom', description: 'Underworld contacts, black market knowledge, criminal slang, and alley savvy.' }
      ]
    }
  ],
  combat: [
    {
      title: 'Archaic',
      skills: [
        { name: 'Defense', id: 'combat-defense', group: 'combat', baseAttr: 'attr-agility', description: 'Parrying, blocking with shields, dodging strikes, and active combat evasion.' },
        { name: 'Melee', id: 'combat-melee', group: 'combat', baseAttr: 'attr-strength', description: 'Swords, axes, knives, blunt weapons, and polearms in hand-to-hand combat.' },
        { name: 'Ranged', id: 'combat-ranged', group: 'combat', baseAttr: 'attr-agility', description: 'Bows, crossbows, slings, and thrown weapons.' },
        { name: 'Unarmed', id: 'combat-unarmed', group: 'combat', baseAttr: 'attr-strength', description: 'Martial arts, brawling, grappling, kicks, and punches.' }
      ]
    },
    {
      title: 'Modern',
      skills: [
        { name: 'Ballistic', id: 'combat-ballistic', group: 'combat', baseAttr: 'attr-agility', description: 'Pistols, rifles, shotguns, and kinetic firearms.' },
        { name: 'Heavy Weapons', id: 'combat-heavy-weapons', group: 'combat', baseAttr: 'attr-strength', description: 'Machine guns, rocket launchers, mortars, and vehicle-mounted cannons.' }
      ]
    },
    {
      title: 'Advanced',
      skills: [
        { name: 'Energy', id: 'combat-energy', group: 'combat', baseAttr: 'attr-agility', description: 'Laser pistols, plasma rifles, blasters, and directed energy weapons.' },
        { name: 'Heavy Energy', id: 'combat-heavy-energy', group: 'combat', baseAttr: 'attr-strength', description: 'Particle cannons, heavy lasers, plasma bombards, and titan weaponry.' }
      ]
    }
  ],
  meta: [
    {
      title: null,
      skills: [
        { name: 'Attune', id: 'meta-attune', group: 'meta', baseAttr: 'attr-wisdom', description: 'Channeling energy, sensing psionic/magical fields, and metaphysical resonance.' }
      ]
    },
    {
      title: 'Disciplines',
      skills: [
        { name: 'Dimension', id: 'meta-dimension', group: 'meta', baseAttr: 'attr-wisdom', description: 'Spatial manipulation, teleportation, phasing, and portal dynamics.' },
        { name: 'Energy', id: 'meta-energy', group: 'meta', baseAttr: 'attr-wisdom', description: 'Manipulating thermal, electromagnetic, kinetic, and radiant energy.' },
        { name: 'Entropy', id: 'meta-entropy', group: 'meta', baseAttr: 'attr-wisdom', description: 'Decay, dissolution, probability manipulation, and necrotic entropy.' },
        { name: 'Illusion', id: 'meta-illusion', group: 'meta', baseAttr: 'attr-wisdom', description: 'Sensory deception, mental phantasms, holographic weaves, and mirages.' },
        { name: 'Matter', id: 'meta-matter', group: 'meta', baseAttr: 'attr-wisdom', description: 'Transmutation, telekinesis, reshaping physical materials, and molecular density.' },
        { name: 'Mental', id: 'meta-mental', group: 'meta', baseAttr: 'attr-wisdom', description: 'Telepathy, mind probes, empathy control, and psychic assault.' }
      ]
    }
  ]
};

/**
 * Flattened array of all canonical skills for relational selectors and dropdowns
 */
export const ALL_CANONICAL_SKILLS = Object.entries(DEFAULT_SKILLS).flatMap(([groupKey, groupSections]) =>
  groupSections.flatMap(section =>
    section.skills.map(skill => {
      const groupTitle = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
      const subTitle = section.title ? ` · ${section.title}` : '';
      return {
        ...skill,
        group: groupKey,
        subcategory: section.title || 'General',
        categoryLabel: `${groupTitle}${section.title ? ' - ' + section.title : ''}`,
        type: `${groupTitle}${subTitle}`
      };
    })
  )
);

/**
 * Grouped category sections with display headers and icons for optgroups and categorized lists
 */
export const SKILL_CATEGORY_SECTIONS = [
  {
    key: 'physical',
    label: '🏃 Physical Skills',
    group: 'physical',
    skills: DEFAULT_SKILLS.physical[0].skills
  },
  {
    key: 'mental_general',
    label: '🧠 Mental Skills - General',
    group: 'mental',
    skills: DEFAULT_SKILLS.mental[0].skills
  },
  {
    key: 'mental_knowledges',
    label: '🧠 Mental Skills - Knowledges',
    group: 'mental',
    skills: DEFAULT_SKILLS.mental[1].skills
  },
  {
    key: 'mental_vocations',
    label: '🧠 Mental Skills - Vocations',
    group: 'mental',
    skills: DEFAULT_SKILLS.mental[2].skills
  },
  {
    key: 'social_expression',
    label: '💬 Social Skills - Expression',
    group: 'social',
    skills: DEFAULT_SKILLS.social[0].skills
  },
  {
    key: 'social_manipulation',
    label: '💬 Social Skills - Manipulation',
    group: 'social',
    skills: DEFAULT_SKILLS.social[1].skills
  },
  {
    key: 'combat_archaic',
    label: '⚔️ Combat Skills - Archaic',
    group: 'combat',
    skills: DEFAULT_SKILLS.combat[0].skills
  },
  {
    key: 'combat_modern',
    label: '⚔️ Combat Skills - Modern',
    group: 'combat',
    skills: DEFAULT_SKILLS.combat[1].skills
  },
  {
    key: 'combat_advanced',
    label: '⚔️ Combat Skills - Advanced',
    group: 'combat',
    skills: DEFAULT_SKILLS.combat[2].skills
  },
  {
    key: 'meta_general',
    label: '🔮 Metafocus Skills - General',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[0].skills
  },
  {
    key: 'meta_disciplines',
    label: '🔮 Metafocus Skills - Disciplines',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[1].skills
  }
];
