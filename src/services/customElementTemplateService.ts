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
  attributes: Record<string, any>;
  tactical?: Record<string, any>;
  tags: string[];
  createdAt: string;
}

const STORAGE_KEY = 'tangent_ade_custom_templates_v1';

const inMemoryFallbackTemplates: CustomElementTemplate[] = [];

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

  if (raw.tactical && typeof raw.tactical === 'object') {
    base.tactical = { ...raw.tactical };
  }
  return base;
}

function readLocalStorageTemplates(): CustomElementTemplate[] {
  if (typeof localStorage === 'undefined') {
    return [...inMemoryFallbackTemplates];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeTemplate) : [];
  } catch {
    return [];
  }
}

function writeLocalStorageTemplates(list: CustomElementTemplate[]): void {
  inMemoryFallbackTemplates.length = 0;
  inMemoryFallbackTemplates.push(...list);
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Quota or private browsing ignore
  }
}

export function listCustomTemplates(universeState?: Record<string, any> | null): CustomElementTemplate[] {
  const stateList = Array.isArray(universeState?.customTemplates)
    ? universeState!.customTemplates.map(normalizeTemplate)
    : [];
  const localList = readLocalStorageTemplates();

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

  writeLocalStorageTemplates(nextTemplates);
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
  writeLocalStorageTemplates(nextTemplates);
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
      ? existingDraft.attributes
      : {};
  const existingTags = Array.isArray(existingDraft.tags) ? existingDraft.tags : [];

  return {
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
}
