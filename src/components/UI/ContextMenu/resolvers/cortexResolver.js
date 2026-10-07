import { 
  Bot, 
  Sparkles, 
  Database, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  BookOpen, 
  Download, 
  Upload, 
  CheckCircle, 
  Layers, 
  Scale, 
  FileText, 
  RefreshCw,
  Cpu
} from 'lucide-react';

/**
 * Resolves context menu options for the OMNI-CORTEX / DBM Module
 * with rich BASTION canonical rules and database assistance.
 */
export function resolveCortexMenu(context, appState, handlers) {
  const { subcategory = 'compendium', entityId, entityType, entityData, selectedText } = context;
  const { 
    currentCategoryConfig, 
    onEditEntry, 
    onDuplicateEntry, 
    onDeleteEntry, 
    onCreateNew, 
    executeBastionPrompt, 
    openBastionModal 
  } = handlers;

  const items = [];
  const categoryLabel = currentCategoryConfig?.label || subcategory?.toUpperCase() || 'DATABASE';
  const entryName = entityData?.name || entityData?.title || 'Selected Entry';

  // 1. If text is selected within Cortex
  if (selectedText && selectedText.length > 0) {
    return [
      {
        type: 'section-header',
        label: 'Selected Field Text'
      },
      {
        id: 'copy-field-text',
        label: 'Copy Selected Text',
        icon: Copy,
        shortcut: 'Ctrl+C',
        onClick: () => navigator.clipboard.writeText(selectedText)
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Database Copilot'
      },
      {
        id: 'bastion-expand-text',
        label: 'BASTION: Expand Lore Description',
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Expand Lore: "${selectedText.slice(0, 30)}..."`,
          prompt: `Expand the following lore or mechanical description for a ${categoryLabel} entry in the Tangent SFF RPG setting. Maintain deep sci-fi fantasy worldbuilding, professional rules diction, and canonical terminology: "${selectedText}"`,
          context: `Omni-Cortex: [${categoryLabel}]`
        })
      },
      {
        id: 'bastion-format-mechanics',
        label: 'BASTION: Format as Tangent Rules Notation',
        icon: Sparkles,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: 'Format Tangent Rules Mechanics',
          prompt: `Format the following text into standard canonical Tangent SFF RPG mechanics notation. Bold key attributes, use standard dice notation (e.g. 2d10), specify Tech Levels (TL 0-5), Meta Levels (ML 0-5), and action economy requirements: "${selectedText}"`,
          context: `Omni-Cortex: [${categoryLabel}]`
        })
      },
      {
        id: 'bastion-open-dbm-chat',
        label: 'Open Full BASTION Studio',
        icon: Bot,
        aiType: 'BASTION',
        onClick: () => openBastionModal?.(`Regarding ${categoryLabel} "${selectedText}": `)
      }
    ];
  }

  // 2. If right-clicking a specific row / entry card
  if (entityId || entityData) {
    items.push(
      {
        type: 'section-header',
        label: `${categoryLabel}: ${entryName}`
      },
      {
        id: 'edit-cortex-entry',
        label: 'Edit Entry',
        icon: Edit,
        shortcut: 'Click',
        onClick: () => onEditEntry?.(entityData || { id: entityId })
      },
      {
        id: 'duplicate-cortex-entry',
        label: 'Duplicate / Clone Entry',
        icon: Copy,
        onClick: () => onDuplicateEntry?.(entityData || { id: entityId })
      },
      {
        id: 'copy-entry-json',
        label: 'Copy Record JSON',
        icon: FileText,
        onClick: () => navigator.clipboard.writeText(JSON.stringify(entityData || { id: entityId }, null, 2))
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Content Synthesizer'
      },
      {
        id: 'bastion-autofill-fields',
        label: 'BASTION: Auto-Fill Missing Fields',
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Auto-Fill Fields for ${entryName}`,
          prompt: `Analyze the ${categoryLabel} record for "${entryName}" and generate complete, canonical content for any missing or sparse fields (such as description, mechanics, and gameplay guide). Respect the Tangent SFF RPG setting rules and formulas. Current data: ${JSON.stringify(entityData || {})}`,
          context: `Category: ${categoryLabel}`,
          isAutofill: true,
          targetEntry: entityData
        })
      },
      {
        id: 'bastion-balance-audit',
        label: 'BASTION: Audit Rules & Math Balance',
        icon: Scale,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: `Balance Audit: ${entryName}`,
          prompt: `Perform an analytical game balance check on "${entryName}" in category ${categoryLabel}. Audit its CP/BP costs, Tech Level (TL 0-5), Meta Level (ML 0-5), and damage/defense equations against canonical Tangent SFF benchmarks. Highlight any balance exploits or inconsistencies.`,
          context: `Record: ${entryName}`
        })
      },
      {
        id: 'bastion-generate-variant',
        label: `BASTION: Generate Tactical Variant`,
        icon: Sparkles,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: `Generate Variant of ${entryName}`,
          prompt: `Create a specialized sub-variant or advanced model of "${entryName}" for the ${categoryLabel} database. Adjust attributes, modify Tech/Meta levels, and provide a compelling sci-fi lore justification.`,
          context: `Base Record: ${entryName}`
        })
      },
      { type: 'divider' },
      {
        id: 'delete-cortex-entry',
        label: 'Delete Record',
        icon: Trash2,
        danger: true,
        onClick: () => onDeleteEntry?.(entityId || entityData?.id)
      }
    );
  }

  // 3. Right-clicking blank space / table header / container
  else {
    items.push(
      {
        type: 'section-header',
        label: `${categoryLabel} Master Operations`
      },
      {
        id: 'create-new-cortex-entry',
        label: `Create New ${categoryLabel} Entry`,
        icon: Plus,
        shortcut: 'Ctrl+N',
        onClick: () => onCreateNew?.()
      },
      {
        id: 'export-category-json',
        label: `Export ${categoryLabel} Dataset`,
        icon: Download,
        onClick: () => handlers.onExportCategory?.()
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Database Copilot'
      },
      {
        id: 'bastion-synthesize-batch',
        label: `BASTION: Synthesize New ${categoryLabel} Idea`,
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Synthesize New ${categoryLabel} Entry`,
          prompt: `Design a completely novel, highly evocative canonical ${categoryLabel} entry for Tangent SFF RPG. Include name, classification, lore description, mechanics statblock, and game master guidance. Ground in canonical lore (Syndicate, Celestine Aeld, Progenitors, etc.).`,
          context: `Category: ${categoryLabel}`
        })
      },
      {
        id: 'bastion-open-dbm-drawer',
        label: 'Open BASTION Database Assistant',
        icon: Bot,
        aiType: 'BASTION',
        onClick: () => openBastionModal?.()
      }
    );
  }

  return items;
}

export default resolveCortexMenu;
