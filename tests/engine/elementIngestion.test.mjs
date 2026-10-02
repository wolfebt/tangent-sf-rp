import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  parseElementMarkdown, 
  exportElementToMarkdown, 
  validateElementAgainstSchema 
} from '../../src/services/elementIngestionService.js';

describe('Element Ingestion & Serialization Service (ELEMENTS.md Parity)', () => {

  const sampleFactionMd = `
# **Faction Development Fields**

This document provides a comprehensive framework for creating a unique and compelling faction.

### **1. Overview (The Identity)**

* **Faction Name:** The Iron Syndicate
* **Faction Symbol / Banner:** A crimson anvil crowned with a severed cog
* **Core Identity:** An underground coalition of cyber-smugglers and tech-refiners
* **Primary Goal / Mandate:** Monopolize sub-orbital supply routes across Sector 4
* **Public Slogan / Motto:** "Steel holds when stars collapse."

### **2. Ideology & Governance (The Structure)**

#### **Beliefs & Philosophy**

* **Core Ideology:** Utilitarian technocracy
* **Public Agenda:** Providing low-cost cybernetics to disenfranchised dock workers
* **Hidden Agenda:** Siphoning antimatter fuel from orbital transit vessels

#### **Power & Law**

* **Government Type:** Oligarchic Council of Foremen
* **Leadership Structure:** 5 elected syndicate leaders
* **Laws & Justice System:** Strict code of silence, exile or cybernetic stripping
`;

  test('parses canonical Faction markdown with correct type, name, and fields', () => {
    const element = parseElementMarkdown(sampleFactionMd, 'faction-iron-syndicate.md');
    
    assert.equal(element.type, 'Faction');
    assert.equal(element.name, 'The Iron Syndicate');
    assert.equal(element.description, 'An underground coalition of cyber-smugglers and tech-refiners');
    assert.equal(element.fields.coreIdentity, 'An underground coalition of cyber-smugglers and tech-refiners');
    assert.equal(element.fields.motto, '"Steel holds when stars collapse."');
    assert.equal(element.fields.ideology, 'Utilitarian technocracy');
    assert.equal(element.fields.government, 'Oligarchic Council of Foremen');
  });

  const samplePersonaMd = `
---
type: Persona
name: Tariq Shan
tags: ["Smuggler", "Operative", "Syndicate"]
---

# **Persona Development Fields**

### **1. Overview (The Snapshot)**

* **Character Portrait:** /assets/portraits/tariq.png
* **Full Name:** Tariq Shan
* **Role in Story:** Fixer & Shadow Pilot
* **Character Archetype:** Cynical Outlaw with a Heart of Gold
* **One-Sentence Summary:** Ex-military orbital hauler turned grey-market transport specialist.
* **Core Motivation:** Clear his sister's neural debt with the Kovian Tribunal.

### **2. Profile: Vitals**

* **Age & Date of Birth:** 34 (Cycle 412)
* **Gender & Pronouns:** Male (He/Him)
* **Threat Tier (0-20):** 4
* **Tactical Role:** Slicer / Commando
* **Chassis Array:** Specialist
`;

  test('parses canonical Persona markdown with frontmatter and MCM attributes', () => {
    const element = parseElementMarkdown(samplePersonaMd, 'persona-tariq.md');

    assert.equal(element.type, 'Persona');
    assert.equal(element.name, 'Tariq Shan');
    assert.equal(element.description, 'Ex-military orbital hauler turned grey-market transport specialist.');
    assert.equal(element.fields.role, 'Fixer & Shadow Pilot');
    assert.equal(element.fields['char-motive'], "Clear his sister's neural debt with the Kovian Tribunal.");
    assert.equal(element.fields.mcmTier, '4');
    assert.equal(element.fields.mcmRole, 'Slicer / Commando');
    assert.equal(element.fields.mcmChassis, 'Specialist');
    assert.deepEqual(element.tags, ['Smuggler', 'Operative', 'Syndicate']);
  });

  test('exports element to canonical markdown and round-trips without data loss', () => {
    const originalElement = {
      id: 'elem_test_123',
      name: 'Vesper Station',
      type: 'Setting',
      description: 'An abandoned hollowed-asteroid listening post in the outer belt.',
      fields: {
        settingName: 'Vesper Station',
        scale: 'Space Station',
        genreTech: 'TL-4 Hard Sci-Fi',
        coreConcept: 'An abandoned hollowed-asteroid listening post in the outer belt.',
        primaryConflict: 'Depleting life support and lurking robotic sentries',
        climate: 'Artificial atmosphere (leaking)',
        terrain: 'Pressurized corridors, zero-g maintenance shafts',
        dominantSights: 'Flickering emergency amber lighting, frost-covered viewports'
      },
      tags: ['Station', 'Zero-G', 'Hazardous'],
      dbmSyncStatus: 'synced'
    };

    const exportedMd = exportElementToMarkdown(originalElement);
    assert.ok(exportedMd.includes('# **Setting Development Fields**'));
    assert.ok(exportedMd.includes('## Vesper Station'));
    assert.ok(exportedMd.includes('* **Setting Name:** Vesper Station'));
    assert.ok(exportedMd.includes('* **Scale:** Space Station'));

    // Round-trip parse
    const reParsed = parseElementMarkdown(exportedMd, 'setting-vesper.md');
    assert.equal(reParsed.type, 'Setting');
    assert.equal(reParsed.name, 'Vesper Station');
    assert.equal(reParsed.fields.scale, 'Space Station');
    assert.equal(reParsed.fields.genreTech, 'TL-4 Hard Sci-Fi');
    assert.equal(reParsed.fields.primaryConflict, 'Depleting life support and lurking robotic sentries');
    assert.deepEqual(reParsed.tags, ['Station', 'Zero-G', 'Hazardous']);
  });

  test('validates element against schema and computes completeness score', () => {
    const element = {
      type: 'Persona',
      fields: {
        role: 'Protagonist',
        'char-concept': 'Ace Pilot',
        summary: 'Hotshot starfighter',
        'char-motive': 'Freedom',
        'char-name': 'Jaxen Vance'
      }
    };

    const validation = validateElementAgainstSchema(element);
    assert.equal(validation.valid, true);
    assert.ok(validation.completenessScore > 0);
    assert.ok(validation.fieldCount >= 5);
  });

  test('parses Philosophy markdown and round-trips correctly', () => {
    const md = `
# **Philosophy Development Fields**

## The Echo Path

### **1. Overview & Tenets**

* **Philosophy Name:** The Echo Path
* **Category:** Mystical Existentialism
* **Core Tenet & Guiding Question:** "Memory is the only true substance of spacetime."
* **Guiding Question:** What endures when the matter disperses?
`;
    const elem = parseElementMarkdown(md, 'philosophy-echo-path.md');
    assert.equal(elem.type, 'Philosophy');
    assert.equal(elem.name, 'The Echo Path');
    assert.equal(elem.fields.category, 'Mystical Existentialism');
    assert.equal(elem.fields.tenet, '"Memory is the only true substance of spacetime."');

    const exported = exportElementToMarkdown(elem);
    assert.ok(exported.includes('# **Philosophy Development Fields**'));
    assert.ok(exported.includes('The Echo Path'));
  });

  test('parses Species and Technology elements with exact field parity', () => {
    const speciesMd = `
# **Species Development Fields**

### **1. Overview**

* **Species Name:** Alterian Xenofungus
* **Homeworld / Plane of Origin:** Alteria Minor (Chthonic Caverns)
* **Sentience Level:** Distributed Hivemind
* **Core Concept / Archetype:** Bioluminescent subterranean telepathic collective
* **Inherent Abilities & Strengths:** Spore communication, extreme heat resistance
* **Species Weaknesses & Unique Traits:** Vulnerable to ionizing ultraviolet radiation
`;
    const speciesElem = parseElementMarkdown(speciesMd, 'species-alterian.md');
    assert.equal(speciesElem.type, 'Species');
    assert.equal(speciesElem.name, 'Alterian Xenofungus');
    assert.equal(speciesElem.fields.homeworld, 'Alteria Minor (Chthonic Caverns)');
    assert.equal(speciesElem.fields.sentience, 'Distributed Hivemind');
    assert.equal(speciesElem.fields.abilities, 'Spore communication, extreme heat resistance');

    const techMd = `
# **Technology Development Fields**

### **1. Overview & Concept**

* **Technology Name:** Tachyon Jump Array
* **Core Function & Readiness Level:** Instantaneous sub-light quantum tunneling
* **Power Source & Operating Principles:** Antimatter decay containment cell
* **Inventor, Date & Historical Context:** Dr. Corina Vane, Cycle 398
`;
    const techElem = parseElementMarkdown(techMd, 'tech-tachyon.md');
    assert.equal(techElem.type, 'Technology');
    assert.equal(techElem.name, 'Tachyon Jump Array');
    assert.equal(techElem.fields.function, 'Instantaneous sub-light quantum tunneling');
    assert.equal(techElem.fields.power, 'Antimatter decay containment cell');
  });

  test('parses World and Universe elements', () => {
    const universeMd = `
# **Universe Development Fields**

### **1. Core Concept & Metaphysics**

* **Universe Name / Designation:** Sector Omnis Prime
* **Ontological Premise & The Source:** Reality generated by a fading Dyson superbrain
* **Laws of Physics & Metaphysics:** Non-Euclidean foldpoints allowed at gravity wells
`;
    const universeElem = parseElementMarkdown(universeMd, 'universe-omnis.md');
    assert.equal(universeElem.type, 'Universe');
    assert.equal(universeElem.name, 'Sector Omnis Prime');
    assert.equal(universeElem.fields.ontological, 'Reality generated by a fading Dyson superbrain');

    const worldMd = `
# **World Development Fields**

### **1. Cosmology & Magic Laws**

* **World Name:** Elysium Nine
* **World Name & High Concept:** Tidally locked ocean planet with floating geothermal arcologies
* **Cosmology & Laws of Physics:** High salinity, electromagnetic storms in upper stratosphere
`;
    const worldElem = parseElementMarkdown(worldMd, 'world-elysium.md');
    assert.equal(worldElem.type, 'World');
    assert.equal(worldElem.name, 'Elysium Nine');
    assert.equal(worldElem.fields.highConcept, 'Tidally locked ocean planet with floating geothermal arcologies');
  });
});
