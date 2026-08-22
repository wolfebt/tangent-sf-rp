import { z } from 'zod';

export const traitItemSchema = z.union([
  z.object({
    id: z.string().optional(),
    name: z.string().optional().default('Unnamed Trait'),
    cp: z.union([z.number(), z.string()]).optional().default(0),
    category: z.string().optional(),
    description: z.string().optional(),
    mechanic: z.string().optional(),
    notes: z.string().optional()
  }).passthrough(),
  z.string()
]);

export const inventoryItemSchema = z.union([
  z.object({
    id: z.string().optional(),
    name: z.string().optional().default('Unnamed Item'),
    qty: z.union([z.number(), z.string()]).optional().default(1),
    weight: z.union([z.number(), z.string()]).optional().default(0),
    cost: z.union([z.number(), z.string()]).optional().default(0),
    tl: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional()
  }).passthrough(),
  z.string()
]);

export const attackSchema = z.union([
  z.object({
    id: z.string().optional(),
    name: z.string().optional().default('Attack'),
    range: z.string().optional(),
    damage: z.string().optional(),
    type: z.string().optional(),
    notes: z.string().optional()
  }).passthrough(),
  z.string()
]);

export const noteItemSchema = z.union([
  z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    text: z.string().optional().default('')
  }).passthrough(),
  z.string()
]);

export const specializationItemSchema = z.union([
  z.object({
    id: z.string().optional(),
    name: z.string().optional().default('Unnamed Specialization'),
    baseSkillId: z.string().optional().default(''),
    rank: z.union([z.number(), z.string()]).transform(val => Math.min(10, Math.max(0, typeof val === 'string' ? parseInt(val, 10) || 0 : val))).optional().default(0),
    mod: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseInt(val, 10) || 0 : val).optional().default(0),
    category: z.string().optional()
  }).passthrough(),
  z.string()
]);

export const characterSchema = z.object({
  'character-doc-id': z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  authorHandle: z.string().optional().default(''),
  contributors: z.array(z.string()).optional().default([]),
  ownerUid: z.string().optional().default(''),
  'char-name': z.string().optional().default(''),
  'char-concept': z.string().optional().default(''),
  'char-archetype': z.string().optional().default(''),
  'char-species': z.string().optional().default(''),
  'char-occu': z.string().optional().default(''),
  'char-origin': z.string().optional().default(''),
  'char-faction': z.string().optional().default(''),
  'char-age': z.string().optional().default(''),
  'char-gender': z.string().optional().default(''),
  'char-height': z.string().optional().default(''),
  'char-weight': z.string().optional().default(''),
  'char-style': z.string().optional().default(''),
  'char-motive': z.string().optional().default(''),
  'starting-cp': z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseInt(val, 10) || 150 : val).optional().default(150),
  'tech-level': z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseInt(val, 10) || 3 : val).optional().default(3),
  'magic-level': z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseInt(val, 10) || 1 : val).optional().default(1),
  'health': z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseInt(val, 10) || 30 : val).optional().default(30),
  'vitality': z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseInt(val, 10) || 30 : val).optional().default(30),
  'karma': z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseInt(val, 10) || 3 : val).optional().default(3),

  // Narrative fields (aligned with StoryFoundry Persona)
  role: z.string().optional().default(''),
  summary: z.string().optional().default(''),
  primaryConflict: z.string().optional().default(''),
  nicknames: z.string().optional().default(''),
  socialClass: z.string().optional().default(''),
  currentResidence: z.string().optional().default(''),
  appearance: z.string().optional().default(''),
  voice: z.string().optional().default(''),
  mannerisms: z.string().optional().default(''),
  positiveTraits: z.string().optional().default(''),
  negativeTraits: z.string().optional().default(''),
  likesDislikes: z.string().optional().default(''),
  hobbies: z.string().optional().default(''),
  personalityType: z.string().optional().default(''),
  backstory: z.string().optional().default(''),
  definingTrauma: z.string().optional().default(''),
  greatestAccomplishment: z.string().optional().default(''),
  childhoodEvents: z.string().optional().default(''),
  keyRelationships: z.string().optional().default(''),
  worldview: z.string().optional().default(''),
  theLie: z.string().optional().default(''),
  theTruth: z.string().optional().default(''),
  deepestFear: z.string().optional().default(''),
  goals: z.string().optional().default(''),
  stakes: z.string().optional().default(''),
  stats: z.string().optional().default(''),
  plotHooks: z.string().optional().default(''),
  romanticHistory: z.string().optional().default(''),
  tags: z.union([z.string(), z.array(z.string())]).optional().default(''),

  // Array fields with defaults and sub-schema validation
  features: z.array(traitItemSchema).optional().default([]),
  disadvantages: z.array(traitItemSchema).optional().default([]),
  augmentations: z.array(traitItemSchema).optional().default([]),
  awakened: z.array(traitItemSchema).optional().default([]),
  invocations: z.array(traitItemSchema).optional().default([]),
  special_abilities: z.array(traitItemSchema).optional().default([]),
  attacks: z.array(attackSchema).optional().default([]),
  armor: z.array(inventoryItemSchema).optional().default([]),
  gear: z.array(inventoryItemSchema).optional().default([]),
  weapons: z.array(inventoryItemSchema).optional().default([]),
  armoring: z.array(inventoryItemSchema).optional().default([]),
  mecha: z.array(inventoryItemSchema).optional().default([]),
  other: z.array(inventoryItemSchema).optional().default([]),
  specializations: z.array(specializationItemSchema).optional().default([]),
  notes: z.array(noteItemSchema).optional().default([{ text: '' }])
}).catchall(z.any()); // Pass through any dynamically added keys (like skill-*-rank)

