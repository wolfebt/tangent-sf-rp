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

export const characterSchema = z.object({
  'character-doc-id': z.string().optional(),
  'char-name': z.string().optional().default(''),
  'char-concept': z.string().optional().default(''),
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
  notes: z.array(noteItemSchema).optional().default([{ text: '' }])
}).catchall(z.any()); // Pass through any dynamically added keys (like skill-*-rank)

