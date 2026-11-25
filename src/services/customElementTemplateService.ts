/**
 * @file customElementTemplateService.ts
 * @description CRUD & Application service for Custom Element Blueprint Templates in ADE Element Forge.
 * Persists templates in universeState.customTemplates when present and mirrors safely to localStorage.
 */

export interface CustomElementTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  content?: string;
  imageUrl?: string;
  guidance?: Record<string, any>;
  assetHub?: any[];
  customFields?: any[];
  attributes: Record<string, any>;
  tactical?: Record<string, any>;
  tags: string[];
  createdAt: string;
}

const STORAGE_KEY = 'tangent_ade_custom_templates_v1';

const inMemoryFallbackTemplates: CustomElementTemplate[] = [];

function getScopedStorageKey(universeState?: Record<string, any> | null): string {
  const storyId = typeof universeState?.id === 'string' ? universeState.id.trim() : '';
  return storyId ? `${STORAGE_KEY}_${storyId}` : STORAGE_KEY;
}

function normalizeTemplate(raw: Partial<CustomElementTemplate> & Record<string, any>): CustomElementTemplate {
  const safeId =
    typeof raw.id === 'string' && raw.id.trim().length > 0
      ? raw.id.trim()
      : `tpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  const base: CustomElementTemplate = {
    id: safeId,
    name: String(raw.name || raw.title || 'Untitled Blueprint').trim() || 'Untitled Blueprint',
    type: String(raw.type || 'Entity').trim() || 'Entity',
    description: String(raw.description || ''),
    attributes: raw.attributes && typeof raw.attributes === 'object' ? { ...raw.attributes } : {},
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : [],
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()
  };

  if (typeof raw.content === 'string') base.content = raw.content;
  if (typeof raw.imageUrl === 'string') base.imageUrl = raw.imageUrl;
  if (raw.guidance && typeof raw.guidance === 'object') {
    base.guidance = { ...raw.guidance };
  }
  if (Array.isArray(raw.assetHub)) {
    base.assetHub = [...raw.assetHub];
  }
  if (Array.isArray(raw.customFields)) {
    base.customFields = [...raw.customFields];
  }
  if (raw.tactical && typeof raw.tactical === 'object') {
    base.tactical = { ...raw.tactical };
  }
  return base;
}

function readLocalStorageTemplates(universeState?: Record<string, any> | null): CustomElementTemplate[] {
  if (typeof localStorage === 'undefined') {
    return [...inMemoryFallbackTemplates];
  }
  const scopedKey = getScopedStorageKey(universeState);
  try {
    const raw = localStorage.getItem(scopedKey) ?? (scopedKey !== STORAGE_KEY ? localStorage.getItem(STORAGE_KEY) : null);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeTemplate) : [];
  } catch {
    return [];
  }
}

function writeLocalStorageTemplates(list: CustomElementTemplate[], universeState?: Record<string, any> | null): void {
  inMemoryFallbackTemplates.length = 0;
  inMemoryFallbackTemplates.push(...list);
  if (typeof localStorage === 'undefined') return;
  const scopedKey = getScopedStorageKey(universeState);
  try {
    localStorage.setItem(scopedKey, JSON.stringify(list));
  } catch {
    // Quota or private browsing ignore
  }
}

export function listCustomTemplates(universeState?: Record<string, any> | null): CustomElementTemplate[] {
  const stateList = Array.isArray(universeState?.customTemplates)
    ? universeState!.customTemplates.map(normalizeTemplate)
    : [];
  const localList = readLocalStorageTemplates(universeState);

  const merged = new Map<string, CustomElementTemplate>();
  for (const item of localList) {
    merged.set(item.id, item);
  }
  for (const item of stateList) {
    merged.set(item.id, item);
  }
  return Array.from(merged.values());
}

export function saveCustomTemplate(
  templateInput: Partial<CustomElementTemplate> & Record<string, any>,
  universeState?: Record<string, any> | null,
  onPersistState?: (nextTemplates: CustomElementTemplate[]) => void
): { template: CustomElementTemplate; templates: CustomElementTemplate[] } {
  const template = normalizeTemplate(templateInput);
  const existing = listCustomTemplates(universeState);
  const nextTemplates = [
    template,
    ...existing.filter((item) => item.id !== template.id)
  ].slice(0, 60);

  writeLocalStorageTemplates(nextTemplates, universeState);
  if (typeof onPersistState === 'function') {
    onPersistState(nextTemplates);
  }
  return { template, templates: nextTemplates };
}

export function deleteCustomTemplate(
  templateId: string,
  universeState?: Record<string, any> | null,
  onPersistState?: (nextTemplates: CustomElementTemplate[]) => void
): CustomElementTemplate[] {
  const nextTemplates = listCustomTemplates(universeState).filter((item) => item.id !== templateId);
  writeLocalStorageTemplates(nextTemplates, universeState);
  if (typeof onPersistState === 'function') {
    onPersistState(nextTemplates);
  }
  return nextTemplates;
}

export function applyCustomTemplate(
  template: CustomElementTemplate,
  existingDraft: Record<string, any> = {}
): Record<string, any> {
  const existingAttrs =
    existingDraft.attributes && typeof existingDraft.attributes === 'object'
      ? { ...existingDraft.attributes }
      : {};
  const SUBCATEGORY_DEFAULTS: Record<string, Set<string>> = {
    propertySubcategory: new Set(['', 'gear']),
    itemCategory: new Set(['', 'gear']),
    metaphysicsSubcategory: new Set(['', 'invocations']),
    personaSubcategory: new Set(['', 'story'])
  };
  for (const [subKey, defaults] of Object.entries(SUBCATEGORY_DEFAULTS)) {
    const tplVal = template.attributes?.[subKey];
    const curVal = String(existingAttrs[subKey] || '');
    if (tplVal && defaults.has(curVal)) {
      existingAttrs[subKey] = tplVal;
    }
  }
  const existingTags = Array.isArray(existingDraft.tags) ? existingDraft.tags : [];
  const mergedGuidance =
    template.guidance && typeof template.guidance === 'object'
      ? {
          ...template.guidance,
          ...(existingDraft.guidance && typeof existingDraft.guidance === 'object' ? existingDraft.guidance : {})
        }
      : existingDraft.guidance;

  const result: Record<string, any> = {
    ...existingDraft,
    type: template.type || existingDraft.type || 'Entity',
    description: existingDraft.description || template.description || '',
    attributes: {
      ...template.attributes,
      ...existingAttrs
    },
    ...(template.tactical
      ? {
          tactical: {
            ...template.tactical,
            ...(existingDraft.tactical && typeof existingDraft.tactical === 'object'
              ? existingDraft.tactical
              : {})
          }
        }
      : {}),
    tags: Array.from(new Set([...(template.tags || []), ...existingTags])),
    appliedTemplateId: template.id
  };

  if (existingDraft.content || template.content) {
    result.content = existingDraft.content || template.content || '';
  }
  if (existingDraft.imageUrl || template.imageUrl) {
    result.imageUrl = existingDraft.imageUrl || template.imageUrl || '';
  }
  if (mergedGuidance && typeof mergedGuidance === 'object') {
    result.guidance = mergedGuidance;
  }
  if (Array.isArray(existingDraft.assetHub) && existingDraft.assetHub.length > 0) {
    result.assetHub = existingDraft.assetHub;
  } else if (Array.isArray(template.assetHub) && template.assetHub.length > 0) {
    result.assetHub = [...template.assetHub];
  }
  if (Array.isArray(existingDraft.customFields) && existingDraft.customFields.length > 0) {
    result.customFields = existingDraft.customFields;
  } else if (Array.isArray(template.customFields) && template.customFields.length > 0) {
    result.customFields = [...template.customFields];
  }

  return result;
}
