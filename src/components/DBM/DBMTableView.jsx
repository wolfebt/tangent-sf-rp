import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { VirtualizedList } from './VirtualizedList';
import { useItemInteractions } from '../../utils/interactionUtils';
import { useDBM } from '../../context/DBMContext';
import { useConfirm } from '../../context/ConfirmContext';
import { SPECIES_LINEAGES } from '../../data/speciesData';
import { getGuidanceForDataset } from '../../pages/Codex/codexDatasetGuidance';
import { evaluateAssetBuildCost } from '../../pages/Codex/codexBuildCostValidator';
import { getMatrixIdForAssetKey } from '../../pages/Codex/codexAssetBridge';
import { getMatrixById } from '../../pages/Codex/codexConfig';
import { CodexAiSynthesizerModal } from '../../pages/Codex/CodexAiSynthesizerModal';
import { CodexIngestionModal } from '../../pages/Codex/CodexIngestionModal';
import { calculateCreditValue, calculateMaterialCost } from '../../engines/tangentEconEngine';
import { isPropertyCategory } from '../../utils/tangentSchemaAdapters';
import { OmnicortexTooltip, SpeciesBuildCostTooltipCard } from '../Codex/SpeciesStudioTooltips';

export const CATEGORY_TO_CODEX_MATRIX = {
  weaponry: 'weaponry',
  weapons: 'weaponry',
  weapon: 'weaponry',
  armoring: 'armor',
  armor: 'armor',
  architecture: 'architecture',
  augmentations: 'augmentations',
  augmentation: 'augmentations',
  gear: 'equipment',
  equipment: 'equipment',
  personal_property: 'equipment',
  other: 'other',
  other_property: 'other',
  mecha: 'mecha',
  vehicles: 'mecha',
  starships: 'mecha',
  invocations: 'invocation',
  invocation: 'invocation',
  special_abilities: 'invocation',
  disciplines: 'invocation',
  species: 'species',
  species_lineage: 'species_lineage',
  species_type: 'species_type',
  species_size: 'species_size',
  species_movement: 'species_movement',
  trait: 'trait',
  traits: 'traits',
  disadvantages: 'disadvantages',
  archetypes: 'archetypes',
  origins: 'origins',
  occupations: 'occupations',
  skills: 'skills',
  features: 'features',
  factions: 'factions',
  modular_characters: 'modular-characters',
  bestiary: 'modular-characters',
  planets: 'planetary-design',
  world_design: 'planetary-design',
  planetary_design: 'planetary-design'
};

const renderBuildCostCell = (buildCheck) => {
  if (!buildCheck) return <span className="text-slate-600">-</span>;
  const hasUnaccounted = Boolean(buildCheck.hasUnaccountedItems || (buildCheck.unaccountedItems && buildCheck.unaccountedItems.length > 0));
  const isValid = (buildCheck.status === 'valid' || buildCheck.status === 'info') && !hasUnaccounted;
  const badgeText = buildCheck.primaryCostLabel || buildCheck.primaryValue || buildCheck.statusLabel || buildCheck.summary || '-';
  const costLines = Array.isArray(buildCheck.costItems)
    ? buildCheck.costItems.map(i => `${i.unaccounted ? '⚠ [UNACCOUNTED] ' : '• '}${i.label}: ${i.formattedCost}`)
    : [];
  const tooltip = [
    `${buildCheck.title || 'Build Cost Check'}: ${buildCheck.statusLabel || buildCheck.summary || badgeText}`,
    ...costLines,
    buildCheck.formulaSummary || '',
    ...(buildCheck.warnings || []),
    ...(buildCheck.errors || []),
  ].filter(Boolean).join('\n');

  return (
    <OmnicortexTooltip
      delay={180}
      color={isValid ? '#10b981' : '#f59e0b'}
      content={<SpeciesBuildCostTooltipCard buildCheck={buildCheck} />}
    >
      <span
        title={tooltip}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border cursor-help ${
          isValid
            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
            : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
        }`}
      >
        <span>{isValid ? '✓' : '⚠'}</span>
        <span className="truncate max-w-[140px]">{badgeText}</span>
        {hasUnaccounted && (
          <span className="px-1 py-0 rounded bg-amber-500/25 text-amber-200 border border-amber-400/50 text-[8.5px]">
            {buildCheck.unaccountedItems.length}
          </span>
        )}
      </span>
    </OmnicortexTooltip>
  );
};

/**
 * Clean up relational IDs and snake_cased strings to human-readable names
 */
const formatRelationalString = (str) => {
  if (typeof str !== 'string') return String(str);
  if (str.startsWith('species_lineage-')) {
    return str.replace('species_lineage-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  if (str.startsWith('species_type-')) {
    return str.replace('species_type-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  if (str.startsWith('species_size-')) {
    return str.replace('species_size-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  if (str.startsWith('species_movement-')) {
    return str.replace('species_movement-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  if (str.startsWith('trait-species-')) {
    return str.replace('trait-species-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  if (str.startsWith('trait-sig-')) {
    return str.replace('trait-sig-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  if (str.startsWith('trait-')) {
    return str.replace('trait-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  if (str.includes('_') && !str.includes(' ')) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  return str;
};

/**
 * Format any field value for display in table rows
 */
const formatCellValue = (val) => {
  if (val === undefined || val === null || val === '') return '-';
  if (typeof val === 'boolean') {
    return val ? (
      <span className="text-emerald-400 font-bold">✓</span>
    ) : (
      <span className="text-slate-600 font-bold">✕</span>
    );
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return '-';
    return val.map(item => {
      if (typeof item === 'object' && item !== null) {
        // Universal Modifiers
        if (item.target && item.value !== undefined) {
          const sign = item.value >= 0 ? '+' : '';
          return `${item.target} ${sign}${item.value}`;
        }
        if (item.attribute && item.bonus !== undefined) {
          return `${item.attribute} ${item.bonus >= 0 ? '+' : ''}${item.bonus}`;
        }
        if (item.skill && item.bonus !== undefined) {
          return `${item.skill} ${item.bonus >= 0 ? '+' : ''}${item.bonus}`;
        }
        // Modifications
        if (item.name) {
          return item.dcMod ? `${item.name} (${item.dcMod >= 0 ? '+' : ''}${item.dcMod} DC)` : item.name;
        }
        return item.name || item.skill || item.attribute || item.title || item.id || JSON.stringify(item);
      }
      return formatRelationalString(item);
    }).join(', ');
  }
  if (typeof val === 'object') {
    // Costs Map
    if (val.bp !== undefined || val.cp !== undefined || val.credits !== undefined || val.nodes !== undefined) {
      const parts = [];
      const cpVal = val.cp ?? val.bp;
      if (cpVal !== undefined && cpVal !== 0) parts.push(`${cpVal} CP`);
      if (val.credits !== undefined && val.credits !== 0) parts.push(`${Number(val.credits).toLocaleString()} Cr`);
      if (val.nodes !== undefined && val.nodes !== 0) parts.push(`${val.nodes} Nodes`);
      if (val.strain !== undefined && val.strain !== 0) parts.push(`${val.strain} Strain`);
      if (val.focus !== undefined && val.focus !== 0) parts.push(`${val.focus} Focus`);
      return parts.length > 0 ? parts.join(' • ') : '0 Cr';
    }
    // Sockets Group
    if (val.max !== undefined || val.used !== undefined) {
      return `${val.used || 0}/${val.max || 0} Sockets${val.tier ? ` (${val.tier})` : ''}`;
    }
    // Critical Details
    if (val.score !== undefined) {
      return `Crit: ${val.score}${val.effect ? ` (${Array.isArray(val.effect) ? val.effect.join(', ') : val.effect})` : ''}`;
    }
    return val.name || val.title || val.id || JSON.stringify(val);
  }
  return formatRelationalString(val);
};

const NUMERIC_OR_COMPACT_COLS = new Set([
  'cp', 'bp', 'tech_level', 'meta_level', 'tl', 'ml', 'speed', 'scaling',
  'strength_mod', 'combat_mod', 'stealth_mod', 'skill_points', 'cpCost',
  'order', 'injectionPriority', 'vttInteractionDC', 'alwaysActive', 'isPurchasable'
]);

const WIDE_TEXT_COLS = new Set([
  'description', 'mechanic', 'body', 'full_text', 'note', 'inherent_traits',
  'subspecies', 'inherent_attribute_modifiers', 'specific_skill_bonuses',
  'modifiers', 'recommended_factions', 'recommended_origins',
  'recommended_occupations', 'recommended_skills', 'recommended_features',
  'recommended_species', 'society_skills', 'professional_skills', 'skill_package',
  'loreSnippet', 'functionPurpose', 'mechanismPowerSource', 'originHistory',
  'aestheticForm', 'narrativeSignificance', 'limitationsCosts', 'societalImpact'
]);

const getCatalogColumnMinWidth = (colKey, fieldDef) => {
  if (colKey === 'name') return 260;
  if (colKey === 'build_cost') return 170;
  const label = fieldDef?.label || colKey.replace(/_/g, ' ');
  const labelNeed = Math.min(240, Math.ceil(label.length * 7.6) + 34);
  if (NUMERIC_OR_COMPACT_COLS.has(colKey) || fieldDef?.type === 'number' || fieldDef?.type === 'boolean') {
    return Math.max(130, Math.min(185, labelNeed));
  }
  if (WIDE_TEXT_COLS.has(colKey) || fieldDef?.type === 'textarea' || fieldDef?.type === 'multiselect' || fieldDef?.type === 'modifiers_list') {
    return Math.max(210, labelNeed);
  }
  return Math.max(165, labelNeed);
};

const CatalogVirtualRow = ({
  item,
  visibleColumns,
  gridTemplateColumns,
  totalMinWidth,
  isHorizontallyScrolled,
  handleOpenItem,
  isAdmin,
  handleDuplicateEntry,
  handleDeleteEntry,
  buildCheck
}) => {
  const interactions = useItemInteractions({
    onSelect: () => handleOpenItem(item, isAdmin),
    onOpenEdit: () => isAdmin && handleOpenItem(item, true),
    delay: 1500
  });

  const creatorTag = Array.isArray(item.tags)
    ? item.tags.find(t => typeof t === 'string' && t.startsWith('@'))
    : (typeof item.tags === 'string' && item.tags.split(',').map(t => t.trim()).find(t => t.startsWith('@')));

  const otherCols = visibleColumns.filter(col => col !== 'name');
  const hasBuildCol = visibleColumns.includes('build_cost');

  return (
    <div
      key={item.id || item.name}
      {...interactions}
      style={{
        display: 'grid',
        gridTemplateColumns,
        minWidth: `${totalMinWidth}px`
      }}
      className="hover:bg-slate-800/60 cursor-pointer transition-colors border-b border-slate-800/60 items-center text-xs text-slate-300 h-[44px] box-border select-none group"
      title={isAdmin ? "Click to open in Rules Codex Studio (Dev Mode)" : "Click to inspect entry"}
    >
      <div
        className={`p-3 h-full font-bold text-white truncate flex items-center gap-1.5 sticky left-0 z-10 bg-slate-950 group-hover:bg-slate-800 transition-colors ${
          isHorizontallyScrolled ? 'border-r border-cyan-500/30 shadow-[4px_0_12px_rgba(0,0,0,0.65)]' : ''
        }`}
      >
        <span className="truncate">{item.name || 'Unnamed'}</span>
        {creatorTag && (
          <span className="px-1.5 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-mono shrink-0">
            {creatorTag}
          </span>
        )}
        {!hasBuildCol && buildCheck && (
          <span className="shrink-0 ml-auto">{renderBuildCostCell(buildCheck)}</span>
        )}
      </div>
      {otherCols.map(col => {
        if (col === 'build_cost') {
          return (
            <div key={col} className="p-3 h-full truncate text-xs flex items-center">
              {renderBuildCostCell(buildCheck)}
            </div>
          );
        }
        const cellVal = item[col] ?? (col === 'type' ? (item.species_type || item.trait_type) : (col === 'cp' ? (item.cp ?? item.bp ?? item.costs?.cp ?? item.costs?.bp) : undefined));
        return (
          <div
            key={col}
            className="p-3 h-full text-slate-400 truncate text-xs flex items-center"
            title={typeof cellVal === 'string' ? cellVal : undefined}
          >
            <span className="truncate">{formatCellValue(cellVal)}</span>
          </div>
        );
      })}
    </div>
  );
};

const CatalogTableRow = ({
  item,
  visibleColumns,
  isHorizontallyScrolled,
  handleOpenItem,
  isAdmin,
  handleDuplicateEntry,
  handleDeleteEntry,
  buildCheck
}) => {
  const interactions = useItemInteractions({
    onSelect: () => handleOpenItem(item, isAdmin),
    onOpenEdit: () => isAdmin && handleOpenItem(item, true),
    delay: 1500
  });

  const creatorTag = Array.isArray(item.tags)
    ? item.tags.find(t => typeof t === 'string' && t.startsWith('@'))
    : (typeof item.tags === 'string' && item.tags.split(',').map(t => t.trim()).find(t => t.startsWith('@')));

  const otherCols = visibleColumns.filter(col => col !== 'name');
  const hasBuildCol = visibleColumns.includes('build_cost');

  return (
    <tr
      key={item.id || item.name}
      {...interactions}
      className="hover:bg-slate-800/60 cursor-pointer transition-colors h-[44px] select-none group"
      title={isAdmin ? "Click to open in Rules Codex Studio (Dev Mode)" : "Click to inspect entry"}
    >
      <td
        className={`p-3 font-bold text-white truncate border-b border-slate-800/60 sticky left-0 z-10 bg-slate-950 group-hover:bg-slate-800 transition-colors ${
          isHorizontallyScrolled ? 'border-r border-cyan-500/30 shadow-[4px_0_12px_rgba(0,0,0,0.65)]' : ''
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate">{item.name || 'Unnamed'}</span>
          {creatorTag && (
            <span className="px-1.5 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-mono shrink-0">
              {creatorTag}
            </span>
          )}
          {!hasBuildCol && buildCheck && (
            <span className="shrink-0 ml-auto">{renderBuildCostCell(buildCheck)}</span>
          )}
        </div>
      </td>
      {otherCols.map(col => {
        if (col === 'build_cost') {
          return (
            <td key={col} className="p-3 truncate border-b border-slate-800/60">
              {renderBuildCostCell(buildCheck)}
            </td>
          );
        }
        const cellVal = item[col] ?? (col === 'type' ? (item.species_type || item.trait_type) : (col === 'cp' ? (item.cp ?? item.bp ?? item.costs?.cp ?? item.costs?.bp) : undefined));
        return (
          <td
            key={col}
            className="p-3 text-slate-400 truncate border-b border-slate-800/60"
            title={typeof cellVal === 'string' ? cellVal : undefined}
          >
            {formatCellValue(cellVal)}
          </td>
        );
      })}
    </tr>
  );
};

export const DBMTableView = ({
  currentConfig = {},
  currentKey = '',
  searchTerm = '',
  setSearchTerm = () => {},
  handleImportJSON = () => {},
  handleExportJSON = () => {},
  handleCreateNew = () => {},
  sortField = 'name',
  setSortField = () => {},
  sortAsc = true,
  setSortAsc = () => {},
  filteredItems = [],
  handleOpenItem = () => {},
  filterTypes = [],
  setFilterTypes = () => {},
  filterSubtypes = [],
  setFilterSubtypes = () => {},
  filterTLs = [],
  setFilterTLs = () => {},
  filterMLs = [],
  setFilterMLs = () => {},
  filterTags = [],
  setFilterTags = () => {},
  filterDirectives = [],
  setFilterDirectives = () => {},
  filterRailguards = [],
  setFilterRailguards = () => {},
  availableDirectives = [],
  availableRailguards = [],
  currentItems = [],
  isAdmin = true,
  handleDeleteEntry,
  handleDuplicateEntry,
  saveEntry,
  dbData
}) => {
  const fileInputRef = useRef(null);
  const columnsDropdownRef = useRef(null);
  const filtersDropdownRef = useRef(null);
  const fileMenuRef = useRef(null);
  const { 
    syncCanonicalSpecies, 
    syncCanonicalFactions, 
    syncCanonicalOrigins, 
    syncCanonicalOccupations, 
    syncCanonicalInvocations, 
    syncCanonicalAllRecommendations, 
    clearTombstonesForCategory 
  } = useDBM() || {};
  const confirm = useConfirm();
  const [isSyncingSpecies, setIsSyncingSpecies] = useState(false);
  const [isSyncingFactions, setIsSyncingFactions] = useState(false);
  const [isSyncingOrigins, setIsSyncingOrigins] = useState(false);
  const [isSyncingOccupations, setIsSyncingOccupations] = useState(false);
  const [isSyncingInvocations, setIsSyncingInvocations] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isSyncingBuildCosts, setIsSyncingBuildCosts] = useState(false);

  // Integrated Rules Codex (Design Framework & Build Cost Checker) state
  const [isCodexFrameworkOpen, setIsCodexFrameworkOpen] = useState(false);
  const [filterOnlyBuildWarnings, setFilterOnlyBuildWarnings] = useState(false);
  const [isAiSynthesizerOpen, setIsAiSynthesizerOpen] = useState(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [sandboxDC, setSandboxDC] = useState(10);

  // Resolve active Rules Codex Matrix & Design Framework for the current Cortex catalog
  const activeMatrixId = useMemo(() => {
    return getMatrixIdForAssetKey(currentKey) || CATEGORY_TO_CODEX_MATRIX[currentKey] || 'equipment';
  }, [currentKey]);

  const activeMatrix = useMemo(() => {
    return getMatrixById(activeMatrixId) || getMatrixById(currentKey) || getMatrixById('equipment');
  }, [activeMatrixId, currentKey]);

  const isPropertyCatalog = useMemo(() => {
    return Boolean(activeMatrix?.isProperty) && isPropertyCategory(currentKey);
  }, [activeMatrix, currentKey]);

  const codexGuidance = useMemo(() => {
    return getGuidanceForDataset(currentKey) || getGuidanceForDataset(activeMatrixId);
  }, [currentKey, activeMatrixId]);

  const normalizedGuidanceSections = useMemo(() => {
    const raw = codexGuidance?.sections;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') {
      return Object.entries(raw).map(([secKey, secVal]) => ({
        id: secKey,
        ...(typeof secVal === 'object' ? secVal : { title: String(secVal) })
      }));
    }
    return [];
  }, [codexGuidance]);

  // Live Build Cost & Value Checking across all entries in the active Cortex catalog
  const buildCheckByItemKey = useMemo(() => {
    const map = new Map();
    (currentItems || []).forEach((item, idx) => {
      const key = item.id || item.name || idx;
      map.set(key, evaluateAssetBuildCost(item, currentKey));
    });
    return map;
  }, [currentItems, currentKey]);

  const catalogBuildSummary = useMemo(() => {
    let validCount = 0;
    let warningCount = 0;
    let syncableCount = 0;
    buildCheckByItemKey.forEach((check) => {
      if (check?.status === 'valid' || check?.status === 'info') validCount += 1;
      else warningCount += 1;
      if (check?.syncPatch) syncableCount += 1;
    });
    return {
      total: (currentItems || []).length,
      validCount,
      warningCount,
      syncableCount
    };
  }, [buildCheckByItemKey, currentItems]);

  // Reset warning filter when switching catalogs
  useEffect(() => {
    setFilterOnlyBuildWarnings(false);
  }, [currentKey]);

  const displayedItems = useMemo(() => {
    if (!filterOnlyBuildWarnings) return filteredItems;
    return filteredItems.filter((item, idx) => {
      const check = buildCheckByItemKey.get(item.id || item.name || idx) || evaluateAssetBuildCost(item, currentKey);
      return check?.status !== 'valid' && check?.status !== 'info';
    });
  }, [filteredItems, filterOnlyBuildWarnings, buildCheckByItemKey, currentKey]);

  // Dropdown & Drawer states
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [isFiltersMenuOpen, setIsFiltersMenuOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [columnSearchTerm, setColumnSearchTerm] = useState('');
  const [filterSearchTerm, setFilterSearchTerm] = useState('');

  // Close dropdowns & modals on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(e.target)) {
        setIsColumnsMenuOpen(false);
      }
      if (filtersDropdownRef.current && !filtersDropdownRef.current.contains(e.target)) {
        setIsFiltersMenuOpen(false);
      }
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) {
        setIsFileMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsColumnsMenuOpen(false);
        setIsFiltersMenuOpen(false);
        setIsFileMenuOpen(false);
        setIsCodexFrameworkOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Compute all available schema and entry fields for the current category
  const allAvailableFields = useMemo(() => {
    const fieldMap = new Map();
    // Primary field
    fieldMap.set('name', { key: 'name', label: 'Name', type: 'text' });
    // Rules Codex Build Cost & Value Check column
    fieldMap.set('build_cost', { key: 'build_cost', label: 'Build Cost / Value Check', type: 'codex_cost' });

    // Fields defined in currentConfig.fields
    if (currentConfig.fields) {
      Object.entries(currentConfig.fields).forEach(([fKey, fDef]) => {
        if (!fieldMap.has(fKey)) {
          fieldMap.set(fKey, {
            key: fKey,
            label: fDef?.label || fKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            type: fDef?.type || 'text'
          });
        }
      });
    }

    // Default directory columns from config
    if (Array.isArray(currentConfig.directory_columns)) {
      currentConfig.directory_columns.forEach(col => {
        if (!fieldMap.has(col)) {
          fieldMap.set(col, {
            key: col,
            label: col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            type: 'text'
          });
        }
      });
    }

    // Common standard fields
    ['tags', 'updatedAt', 'creator'].forEach(f => {
      if (!fieldMap.has(f)) {
        fieldMap.set(f, {
          key: f,
          label: f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          type: 'text'
        });
      }
    });

    return Array.from(fieldMap.values());
  }, [currentConfig]);

  // Manage Visible Columns (persisted to localStorage per category key)
  const defaultColumns = useMemo(() => {
    const baseCols = currentConfig.directory_columns && currentConfig.directory_columns.length > 0
      ? [...currentConfig.directory_columns]
      : ['name', 'description'];
    if (!baseCols.includes('build_cost')) {
      baseCols.splice(1, 0, 'build_cost');
    }
    return baseCols;
  }, [currentConfig]);

  const [customColumnsByKey, setCustomColumnsByKey] = useState({});

  const visibleColumns = useMemo(() => {
    if (Array.isArray(customColumnsByKey[currentKey]) && customColumnsByKey[currentKey].length > 0) {
      return customColumnsByKey[currentKey];
    }
    try {
      const saved = localStorage.getItem(`dbm_cols_${currentKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultColumns;
  }, [currentKey, defaultColumns, customColumnsByKey]);

  const updateVisibleColumns = (newCols) => {
    const safeCols = newCols.includes('name') ? newCols : ['name', ...newCols];
    setCustomColumnsByKey(prev => ({ ...prev, [currentKey]: safeCols }));
    try {
      localStorage.setItem(`dbm_cols_${currentKey}`, JSON.stringify(safeCols));
    } catch (e) {}
  };

  const toggleColumn = (colKey) => {
    if (colKey === 'name') return; // 'name' is primary and cannot be removed
    if (visibleColumns.includes(colKey)) {
      updateVisibleColumns(visibleColumns.filter(c => c !== colKey));
    } else {
      updateVisibleColumns([...visibleColumns, colKey]);
    }
  };

  const resetDefaultColumns = () => {
    setCustomColumnsByKey(prev => {
      const next = { ...prev };
      delete next[currentKey];
      return next;
    });
    try {
      localStorage.removeItem(`dbm_cols_${currentKey}`);
    } catch (e) {}
  };

  const selectAllColumns = () => {
    const allKeys = allAvailableFields.map(f => f.key);
    updateVisibleColumns(allKeys);
  };

  const deselectExtraColumns = () => {
    updateVisibleColumns(['name']);
  };

  // --- Dynamic Column Sizing & Horizontal Slide Bar Metrics ---
  const columnWidths = useMemo(() => {
    return visibleColumns.map(col => {
      const fieldDef = allAvailableFields.find(f => f.key === col);
      return getCatalogColumnMinWidth(col, fieldDef);
    });
  }, [visibleColumns, allAvailableFields]);

  const totalTableMinWidth = useMemo(() => {
    return columnWidths.reduce((sum, w) => sum + w, 0);
  }, [columnWidths]);

  const gridTemplateColumns = useMemo(() => {
    return columnWidths.map(w => `minmax(${w}px, ${w}fr)`).join(' ');
  }, [columnWidths]);

  const tableScrollRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScrollLeft, setMaxScrollLeft] = useState(0);

  const updateHorizontalScrollMetrics = useCallback(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setMaxScrollLeft(max);
    setScrollLeft(Math.min(el.scrollLeft, max));
  }, []);

  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = 0;
      setScrollLeft(0);
    }
  }, [currentKey]);

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    updateHorizontalScrollMetrics();
    const rafId = requestAnimationFrame(updateHorizontalScrollMetrics);
    const resizeObserver = new ResizeObserver(() => {
      updateHorizontalScrollMetrics();
    });
    resizeObserver.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [updateHorizontalScrollMetrics, visibleColumns, displayedItems.length, currentKey, isSearchDrawerOpen]);

  const handleTableScroll = useCallback((e) => {
    const el = e.currentTarget;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setMaxScrollLeft(max);
    setScrollLeft(el.scrollLeft);
  }, []);

  const handleSlideBarChange = useCallback((e) => {
    const nextScroll = Number(e.target.value);
    setScrollLeft(nextScroll);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = nextScroll;
    }
  }, []);

  const nudgeHorizontalScroll = useCallback((delta) => {
    const el = tableScrollRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const target = Math.max(0, Math.min(max, el.scrollLeft + delta));
    el.scrollTo({ left: target, behavior: 'smooth' });
    setScrollLeft(target);
    setMaxScrollLeft(max);
  }, []);

  const isHorizontallyScrolled = scrollLeft > 2;
  const showColumnSlideBar = maxScrollLeft > 4 || visibleColumns.length > 6;

  // --- Dynamic Facet Extraction for Multi-Select Filters ---
  const availableTypes = useMemo(() => {
    const types = new Set();
    currentItems.forEach(item => {
      if (Array.isArray(item.type)) {
        item.type.forEach(t => t && types.add(String(t).trim()));
      } else if (item.type) {
        types.add(String(item.type).trim());
      }
      if (item.category) {
        types.add(String(item.category).trim());
      }
      if (item.trait_type) {
        types.add(String(item.trait_type).trim());
      }
    });
    return Array.from(types).sort();
  }, [currentItems]);

  const availableSubtypes = useMemo(() => {
    const subs = new Set();
    currentItems.forEach(item => {
      ['subtype', 'discipline', 'society', 'aspect', 'aspect_subtype', 'trait_tier', 'classification'].forEach(k => {
        const val = item[k];
        if (Array.isArray(val)) {
          val.forEach(v => v && subs.add(String(v).trim()));
        } else if (val) {
          subs.add(String(val).trim());
        }
      });
    });
    return Array.from(subs).sort();
  }, [currentItems]);

  const availableTLs = useMemo(() => {
    const tls = new Set();
    currentItems.forEach(item => {
      const val = item.tech_level !== undefined ? item.tech_level : (item.tl !== undefined ? item.tl : item.techLevel);
      if (val !== undefined && val !== null && val !== '') {
        tls.add(val);
      }
    });
    return Array.from(tls).sort((a, b) => Number(a) - Number(b));
  }, [currentItems]);

  const availableMLs = useMemo(() => {
    const mls = new Set();
    currentItems.forEach(item => {
      const val = item.meta_level !== undefined ? item.meta_level : (item.ml !== undefined ? item.ml : item.metaLevel);
      if (val !== undefined && val !== null && val !== '') {
        mls.add(val);
      }
    });
    return Array.from(mls).sort((a, b) => Number(a) - Number(b));
  }, [currentItems]);

  const availableTags = useMemo(() => {
    const tags = new Set();
    currentItems.forEach(item => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach(t => t && tags.add(String(t).trim()));
      } else if (typeof item.tags === 'string' && item.tags.trim()) {
        item.tags.split(',').forEach(t => t.trim() && tags.add(t.trim()));
      }
    });
    return Array.from(tags).sort();
  }, [currentItems]);

  // Filter toggles
  const toggleFilterType = (typeVal) => {
    if (filterTypes.includes(typeVal)) {
      setFilterTypes(filterTypes.filter(t => t !== typeVal));
    } else {
      setFilterTypes([...filterTypes, typeVal]);
    }
  };

  const toggleFilterSubtype = (subVal) => {
    if (filterSubtypes.includes(subVal)) {
      setFilterSubtypes(filterSubtypes.filter(s => s !== subVal));
    } else {
      setFilterSubtypes([...filterSubtypes, subVal]);
    }
  };

  const toggleFilterTL = (tlVal) => {
    if (filterTLs.includes(tlVal)) {
      setFilterTLs(filterTLs.filter(t => t !== tlVal));
    } else {
      setFilterTLs([...filterTLs, tlVal]);
    }
  };

  const toggleFilterML = (mlVal) => {
    if (filterMLs.includes(mlVal)) {
      setFilterMLs(filterMLs.filter(m => m !== mlVal));
    } else {
      setFilterMLs([...filterMLs, mlVal]);
    }
  };

  const toggleFilterTag = (tagVal) => {
    if (filterTags.includes(tagVal)) {
      setFilterTags(filterTags.filter(t => t !== tagVal));
    } else {
      setFilterTags([...filterTags, tagVal]);
    }
  };

  const toggleFilterDirective = (dVal) => {
    if (filterDirectives.includes(dVal)) {
      setFilterDirectives(filterDirectives.filter(d => d !== dVal));
    } else {
      setFilterDirectives([...filterDirectives, dVal]);
    }
  };

  const toggleFilterRailguard = (rVal) => {
    if (filterRailguards.includes(rVal)) {
      setFilterRailguards(filterRailguards.filter(r => r !== rVal));
    } else {
      setFilterRailguards([...filterRailguards, rVal]);
    }
  };

  const clearAllFilters = () => {
    setFilterTypes([]);
    setFilterSubtypes([]);
    setFilterTLs([]);
    setFilterMLs([]);
    setFilterTags([]);
    setFilterDirectives([]);
    setFilterRailguards([]);
    setFilterOnlyBuildWarnings(false);
    setSearchTerm('');
  };

  const handleBatchSyncBuildCosts = async () => {
    if (!isAdmin || typeof saveEntry !== 'function') return;
    const syncTargets = (currentItems || []).filter((item, idx) => {
      const check = buildCheckByItemKey.get(item.id || item.name || idx) || evaluateAssetBuildCost(item, currentKey);
      return Boolean(check?.syncPatch);
    });
    if (syncTargets.length === 0) return;

    const ok = await confirm({
      title: 'Sync Catalog Build Costs to Rules Codex Standard',
      message: `Synchronize ${syncTargets.length} entry(s) in ${currentConfig.label || currentKey} to their canonical Rules Codex build cost & valuation?`,
      danger: false,
      confirmLabel: `Sync ${syncTargets.length} Entries`
    });
    if (!ok) return;

    setIsSyncingBuildCosts(true);
    try {
      for (const item of syncTargets) {
        const check = evaluateAssetBuildCost(item, currentKey);
        if (check?.syncPatch && check.syncPatch.field) {
          const patchObj = {
            [check.syncPatch.field]: check.syncPatch.value,
            ...(check.syncPatch.secondaryField
              ? { [check.syncPatch.secondaryField]: check.syncPatch.secondaryValue }
              : {})
          };
          await saveEntry(currentKey, {
            ...item,
            ...patchObj,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } finally {
      setIsSyncingBuildCosts(false);
    }
  };

  const totalActiveFilterCount = filterTypes.length + filterSubtypes.length + filterTLs.length + filterMLs.length + filterTags.length + filterDirectives.length + filterRailguards.length + (filterOnlyBuildWarnings ? 1 : 0);
  const isAnyFilterActive = totalActiveFilterCount > 0 || (searchTerm && searchTerm.trim().length > 0);

  const onImport = (e) => {
    handleImportJSON(e);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Filtered fields for column search
  const filteredAvailableFields = allAvailableFields.filter(f => {
    if (!columnSearchTerm) return true;
    const q = columnSearchTerm.toLowerCase();
    return f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5 overflow-hidden">
      {/* Header Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
              Cortex Catalog • {activeMatrix?.code || 'CDX'} Rules Codex Integrated
            </span>
            {!isAdmin && (
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded tracking-wider uppercase">
                👁️ Operator View
              </span>
            )}
            {catalogBuildSummary.total > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (catalogBuildSummary.warningCount > 0) {
                    setFilterOnlyBuildWarnings(prev => !prev);
                  } else {
                    setIsCodexFrameworkOpen(prev => !prev);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                  filterOnlyBuildWarnings
                    ? 'bg-amber-900/90 text-amber-200 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                    : catalogBuildSummary.warningCount === 0
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                }`}
                title={
                  catalogBuildSummary.warningCount > 0
                    ? 'Click to filter entries needing Rules Codex build-cost review'
                    : 'All catalog entries pass Rules Codex build-cost & value checks'
                }
              >
                <span>{catalogBuildSummary.warningCount === 0 ? '✓' : '⚠'}</span>
                <span>
                  Build Check: {catalogBuildSummary.validCount}/{catalogBuildSummary.total} Verified
                </span>
                {catalogBuildSummary.warningCount > 0 && (
                  <span className="underline ml-0.5">
                    ({catalogBuildSummary.warningCount} review{filterOnlyBuildWarnings ? ' • active' : ''})
                  </span>
                )}
              </button>
            )}
            {isAdmin && catalogBuildSummary.syncableCount > 0 && typeof saveEntry === 'function' && (
              <button
                type="button"
                onClick={handleBatchSyncBuildCosts}
                disabled={isSyncingBuildCosts}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 transition-colors cursor-pointer"
                title="Synchronize catalog entries to their canonical Rules Codex build cost"
              >
                <span>⚡</span>
                <span>{isSyncingBuildCosts ? 'Syncing Costs...' : `Sync ${catalogBuildSummary.syncableCount} Build Cost${catalogBuildSummary.syncableCount > 1 ? 's' : ''}`}</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mt-1">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
              {currentConfig.label || currentKey}
            </h2>

            {/* Consolidated Search, Filters & Columns Collapsible Drawer Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsSearchDrawerOpen(prev => !prev);
                setIsFileMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSearchDrawerOpen || isAnyFilterActive
                  ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Toggle Search, Filters & Columns drawer"
            >
              <span>🔍</span>
              <span>Search & Filters</span>
              {isAnyFilterActive && (
                <span className="px-1.5 py-0.2 bg-amber-900/80 text-amber-200 border border-amber-500/50 rounded-full text-[10px] font-mono font-bold">
                  {totalActiveFilterCount + (searchTerm && searchTerm.trim().length > 0 ? 1 : 0)}
                </span>
              )}
              <span className="text-[10px] opacity-70">{isSearchDrawerOpen ? '▲' : '▼'}</span>
            </button>

            {/* File Controls Dropdown Menu */}
            <div className="relative" ref={fileMenuRef}>
              <button
                onClick={() => {
                  setIsFileMenuOpen(!isFileMenuOpen);
                  setIsColumnsMenuOpen(false);
                  setIsFiltersMenuOpen(false);
                }}
                className={`px-2.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isFileMenuOpen
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="File control actions, Design Studio, AI Synthesis, Design Framework, Ingestion & data export/import"
              >
                <span>📁 File Controls</span>
                <span className="text-[10px] opacity-70">{isFileMenuOpen ? '▲' : '▼'}</span>
              </button>

              {isFileMenuOpen && (
                <div className="max-sm:fixed max-sm:inset-x-3 max-sm:top-36 max-sm:w-auto sm:absolute sm:left-0 mt-2 w-64 bg-slate-900 border-2 border-cyan-500/60 rounded-xl shadow-2xl z-50 p-2 flex flex-col gap-1 backdrop-blur-xl animate-fadeIn text-xs">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-0.5">
                    Codex & File Controls
                  </div>

                  {/* Create Entry via Integrated Rules Codex Studio */}
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsFileMenuOpen(false);
                        handleCreateNew();
                      }}
                      className="w-full text-left px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded flex items-center gap-2 transition-colors font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                      title={`Launch integrated Rules Codex Design Studio for ${currentConfig.label || currentKey}`}
                    >
                      <span>+ Design in Rules Codex</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full text-left px-2.5 py-1.5 bg-slate-800 text-slate-500 border border-slate-700/50 rounded flex items-center gap-2 font-bold uppercase tracking-wider cursor-not-allowed opacity-60"
                      title="Administrator or Architect privileges required to add entries"
                    >
                      <span>🔒 Read-Only</span>
                    </button>
                  )}

                  {/* AI Synthesize via Rules Codex */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiSynthesizerOpen(true);
                        setIsFileMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 rounded flex items-center gap-2 transition-colors font-bold border border-purple-500/50 cursor-pointer"
                      title="Synthesize a new asset blueprint with BASTION AI using this catalog's Rules Codex Matrix"
                    >
                      <span>✨</span>
                      <span>Synthesize</span>
                    </button>
                  )}

                  {/* Integrated Rules Codex Design Framework Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCodexFrameworkOpen(true);
                      setIsFileMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 bg-cyan-950/50 hover:bg-cyan-900/70 text-cyan-300 rounded flex items-center justify-between gap-2 transition-colors font-bold border border-cyan-500/40 cursor-pointer"
                    title="Open integrated Rules Codex Design Framework & Build Cost Checker modal"
                  >
                    <span className="flex items-center gap-2">
                      <span>📐</span>
                      <span>Design Framework</span>
                    </span>
                    {codexGuidance?.canonicalRules?.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-cyan-900/80 text-cyan-200 border border-cyan-500/40 rounded-full text-[10px] font-mono">
                        {codexGuidance.canonicalRules.length}
                      </span>
                    )}
                  </button>

                  <div className="border-t border-slate-800 my-0.5" />

                  <button
                    onClick={() => {
                      handleExportJSON();
                      setIsFileMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center gap-2 transition-colors font-medium"
                  >
                    <span>📤</span>
                    <span>Export JSON ({currentConfig.label || currentKey})</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setIsFileMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-cyan-300 rounded flex items-center gap-2 transition-colors font-medium"
                    >
                      <span>📥</span>
                      <span>Import JSON ({currentConfig.label || currentKey})</span>
                    </button>
                  )}

                  {isAdmin && currentKey === 'species' && syncCanonicalSpecies && (
                    <button
                      onClick={async () => {
                        setIsFileMenuOpen(false);
                        const ok = await confirm({
                          title: 'Sync Cloud Species',
                          message: 'Sync all 81 canonical species from local definitions to Firestore cloud collection? This will overwrite or update cloud species documents.',
                          danger: true,
                          confirmLabel: 'Sync Species'
                        });
                        if (ok) {
                          setIsSyncingSpecies(true);
                          try {
                            await syncCanonicalSpecies();
                          } finally {
                            setIsSyncingSpecies(false);
                          }
                        }
                      }}
                      disabled={isSyncingSpecies}
                      className="w-full text-left px-2.5 py-1.5 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 rounded flex items-center gap-2 transition-colors font-medium border border-purple-500/30"
                    >
                      <span>🧬</span>
                      <span>{isSyncingSpecies ? 'Syncing...' : 'Sync Cloud Species (81)'}</span>
                    </button>
                  )}

                  {isAdmin && currentKey === 'factions' && syncCanonicalFactions && (
                    <button
                      onClick={async () => {
                        setIsFileMenuOpen(false);
                        const ok = await confirm({
                          title: 'Sync Cloud Factions',
                          message: 'Sync all 40 canonical factions from local definitions to Firestore cloud collection? This will overwrite or update cloud factions documents.',
                          danger: true,
                          confirmLabel: 'Sync Factions'
                        });
                        if (ok) {
                          setIsSyncingFactions(true);
                          try {
                            await syncCanonicalFactions();
                          } finally {
                            setIsSyncingFactions(false);
                          }
                        }
                      }}
                      disabled={isSyncingFactions}
                      className="w-full text-left px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded flex items-center gap-2 transition-colors font-medium border border-amber-500/30"
                    >
                      <span>🚩</span>
                      <span>{isSyncingFactions ? 'Syncing...' : 'Sync Cloud Factions (40)'}</span>
                    </button>
                  )}

                  {isAdmin && currentKey === 'factions' && clearTombstonesForCategory && (
                    <button
                      onClick={async () => {
                        setIsFileMenuOpen(false);
                        clearTombstonesForCategory('factions');
                        if (syncCanonicalFactions) {
                          await syncCanonicalFactions();
                        }
                      }}
                      className="w-full text-left px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 rounded flex items-center gap-2 transition-colors font-medium border border-emerald-500/30"
                    >
                      <span>🔄</span>
                      <span>Restore All 40 Factions</span>
                    </button>
                  )}

                  {isAdmin && currentKey === 'origins' && syncCanonicalOrigins && (
                    <button
                      onClick={async () => {
                        setIsFileMenuOpen(false);
                        const ok = await confirm({
                          title: 'Sync Cloud Origins',
                          message: 'Sync all 11 canonical origins from local definitions to Firestore cloud collection? This will overwrite or update cloud origins documents.',
                          danger: true,
                          confirmLabel: 'Sync Origins'
                        });
                        if (ok) {
                          setIsSyncingOrigins(true);
                          try {
                            await syncCanonicalOrigins();
                          } finally {
                            setIsSyncingOrigins(false);
                          }
                        }
                      }}
                      disabled={isSyncingOrigins}
                      className="w-full text-left px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 rounded flex items-center gap-2 transition-colors font-medium border border-emerald-500/30"
                    >
                      <span>🌐</span>
                      <span>{isSyncingOrigins ? 'Syncing...' : 'Sync Cloud Origins (11)'}</span>
                    </button>
                  )}

                  {isAdmin && currentKey === 'occupations' && syncCanonicalOccupations && (
                    <button
                      onClick={async () => {
                        setIsFileMenuOpen(false);
                        const ok = await confirm({
                          title: 'Sync Cloud Occupations',
                          message: 'Sync all 13 canonical occupations from local definitions to Firestore cloud collection? This will overwrite or update cloud occupations documents.',
                          danger: true,
                          confirmLabel: 'Sync Occupations'
                        });
                        if (ok) {
                          setIsSyncingOccupations(true);
                          try {
                            await syncCanonicalOccupations();
                          } finally {
                            setIsSyncingOccupations(false);
                          }
                        }
                      }}
                      disabled={isSyncingOccupations}
                      className="w-full text-left px-2.5 py-1.5 bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 rounded flex items-center gap-2 transition-colors font-medium border border-sky-500/30"
                    >
                      <span>💼</span>
                      <span>{isSyncingOccupations ? 'Syncing...' : 'Sync Cloud Occupations (13)'}</span>
                    </button>
                  )}

                  {isAdmin && (currentKey === 'invocations' || currentKey === 'magic') && syncCanonicalInvocations && (
                    <button
                      onClick={async () => {
                        setIsFileMenuOpen(false);
                        const ok = await confirm({
                          title: 'Sync Cloud Invocations',
                          message: 'Sync all 137 canonical invocations from local definitions to Firestore cloud collection? This will overwrite or update cloud invocations documents.',
                          danger: true,
                          confirmLabel: 'Sync Invocations'
                        });
                        if (ok) {
                          setIsSyncingInvocations(true);
                          try {
                            await syncCanonicalInvocations();
                          } finally {
                            setIsSyncingInvocations(false);
                          }
                        }
                      }}
                      disabled={isSyncingInvocations}
                      className="w-full text-left px-2.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 rounded flex items-center gap-2 transition-colors font-medium border border-indigo-500/30"
                    >
                      <span>✨</span>
                      <span>{isSyncingInvocations ? 'Syncing...' : 'Sync Cloud Invocations (137)'}</span>
                    </button>
                  )}

                  {isAdmin && syncCanonicalAllRecommendations && (
                    <button
                      onClick={async () => {
                        setIsFileMenuOpen(false);
                        const ok = await confirm({
                          title: 'Sync All Recommendations to Cloud',
                          message: 'Sync all canonical recommendation directives and keywords across Species, Factions, Origins, Occupations, and Invocations to Firestore?',
                          danger: true,
                          confirmLabel: 'Sync All Recommendations'
                        });
                        if (ok) {
                          setIsSyncingAll(true);
                          try {
                            await syncCanonicalAllRecommendations();
                          } finally {
                            setIsSyncingAll(false);
                          }
                        }
                      }}
                      disabled={isSyncingAll}
                      className="w-full text-left px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 rounded flex items-center gap-2 transition-colors font-medium border border-emerald-400/40"
                    >
                      <span>⚡</span>
                      <span>{isSyncingAll ? 'Syncing All...' : 'Sync All Recommendations to Cloud'}</span>
                    </button>
                  )}

                  <div className="border-t border-slate-800 my-0.5" />

                  <button
                    onClick={() => {
                      clearAllFilters();
                      setIsFileMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-rose-950/50 text-rose-300 rounded flex items-center gap-2 transition-colors font-medium"
                  >
                    <span>🧹</span>
                    <span>Reset All Active Filters</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden File Input for JSON import */}
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              className="hidden"
              onChange={onImport}
            />

            {codexGuidance?.formula && (
              <span className="text-[11px] font-mono text-amber-300/90 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                📐 {codexGuidance.formula}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- Collapsible Search, Filters & Columns Drawer --- */}
      {isSearchDrawerOpen && (
        <div className="mb-3 bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-2.5 animate-fadeIn relative z-30">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white pl-8 pr-7 py-1.5 rounded text-xs outline-none focus:border-cyan-500 w-full shadow-inner font-mono"
              />
              <span className="absolute left-2.5 top-2 text-slate-500 text-xs pointer-events-none">🔍</span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1.5 text-slate-500 hover:text-white text-xs px-1"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dynamic Multi-Select Filters Pulldown Button */}
            <div className="relative" ref={filtersDropdownRef}>
              <button
                onClick={() => {
                  setIsFiltersMenuOpen(!isFiltersMenuOpen);
                  setIsColumnsMenuOpen(false);
                  setIsFileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                  totalActiveFilterCount > 0
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Open dynamic multi-select filter options"
              >
                <span>💎 Filters</span>
                {totalActiveFilterCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-900/80 text-amber-200 border border-amber-500/50 rounded-full text-[10px] font-mono font-bold">
                    {totalActiveFilterCount}
                  </span>
                )}
                <span className="text-[10px] opacity-70">{isFiltersMenuOpen ? '▲' : '▼'}</span>
              </button>

              {/* Filter Options Multi-Select Popover Menu */}
              {isFiltersMenuOpen && (
                <div className="max-sm:fixed max-sm:inset-x-3 max-sm:top-36 max-sm:w-auto sm:absolute sm:left-0 mt-2 w-72 sm:w-84 bg-slate-900 border-2 border-amber-500/60 rounded-xl shadow-2xl z-50 p-3 flex flex-col gap-3 backdrop-blur-xl animate-fadeIn">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>💎</span>
                      <span>Dynamic Filter Options</span>
                    </span>
                    <button
                      onClick={() => setIsFiltersMenuOpen(false)}
                      className="text-slate-400 hover:text-white text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Search within filter values */}
                  <input
                    type="text"
                    placeholder="Search filter options..."
                    value={filterSearchTerm}
                    onChange={e => setFilterSearchTerm(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white px-2.5 py-1.5 rounded text-xs outline-none focus:border-amber-500 font-mono"
                  />

                  <div className="max-h-72 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                    {/* Species Lineage Section (if viewing species) */}
                    {currentKey === 'species' && (
                      <div>
                        <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                          <span className="flex items-center gap-1"><span>🧬</span> Lineage / Taxon</span>
                          {filterSubtypes.length > 0 && (
                            <button
                              onClick={() => setFilterSubtypes([])}
                              className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                            >
                              clear
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {(Array.isArray(dbData?.species_lineage) && dbData.species_lineage.length > 0 ? dbData.species_lineage : SPECIES_LINEAGES)
                            .filter(lin => !filterSearchTerm || lin.name.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                            .map(lin => {
                              const checked = filterSubtypes.includes(lin.name);
                              const count = currentItems.filter(i => {
                                const p = String(i.parent_species || i.lineage || '').toLowerCase().trim();
                                const linNameLower = lin.name.toLowerCase().trim();
                                const linIdLower = lin.id.toLowerCase().trim();
                                if (p === linNameLower || p === linIdLower) return true;
                                if (linIdLower === 'gene' || linNameLower.includes('engineered')) {
                                  return p.includes('engineered') || p.includes('gen-e') || p === 'gene';
                                }
                                if (linIdLower === 'humans' || linNameLower.startsWith('human')) {
                                  return p.includes('human') && !p.includes('engineered') && !p.includes('gen-e');
                                }
                                const shortName = lin.name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                const cleanP = p.replace(/[^a-zA-Z0-9]/g, '');
                                return Boolean(shortName && cleanP.includes(shortName));
                              }).length;

                              return (
                                <label
                                  key={lin.id}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                                    checked ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50' : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        if (checked) {
                                          setFilterSubtypes(filterSubtypes.filter(s => s !== lin.name));
                                        } else {
                                          setFilterSubtypes([...filterSubtypes, lin.name]);
                                        }
                                      }}
                                      className="rounded border-slate-700 text-purple-500 focus:ring-0 cursor-pointer accent-purple-500"
                                    />
                                    <span className="truncate">{lin.name}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono ml-2">({count})</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* 1. Types & Categories */}
                    {availableTypes.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                          <span className="flex items-center gap-1"><span>🗂️</span> Type & Category</span>
                          {filterTypes.length > 0 && (
                            <button
                              onClick={() => setFilterTypes([])}
                              className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                            >
                              clear
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {availableTypes
                            .filter(t => !filterSearchTerm || t.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                            .map(t => {
                              const count = currentItems.filter(i => {
                                const types = Array.isArray(i.type) ? i.type : (i.type ? [i.type] : []);
                                if (i.category && !types.includes(i.category)) types.push(i.category);
                                return types.includes(t);
                              }).length;
                              const checked = filterTypes.includes(t);

                              return (
                                <label
                                  key={t}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                                    checked ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40' : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleFilterType(t)}
                                      className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                                    />
                                    <span className="truncate">{t}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono ml-2">({count})</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* 2. Subtypes / Disciplines / Society */}
                    {availableSubtypes.length > 0 && currentKey !== 'species' && (
                      <div>
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                          <span className="flex items-center gap-1"><span>🔮</span> Subtype / Discipline / Aspect</span>
                          {filterSubtypes.length > 0 && (
                            <button
                              onClick={() => setFilterSubtypes([])}
                              className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                            >
                              clear
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {availableSubtypes
                            .filter(s => !filterSearchTerm || s.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                            .map(s => {
                              const count = currentItems.filter(i => {
                                const val = i.subtype || i.discipline || i.society || i.aspect || i.aspect_subtype;
                                const subs = Array.isArray(val) ? val : (val ? [val] : []);
                                return subs.includes(s);
                              }).length;
                              const checked = filterSubtypes.includes(s);

                              return (
                                <label
                                  key={s}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                                    checked ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40' : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleFilterSubtype(s)}
                                      className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                                    />
                                    <span className="truncate">{s}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono ml-2">({count})</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* 3. Tech Level (TL) & Meta Level (ML) */}
                    {(availableTLs.length > 0 || availableMLs.length > 0) && (
                      <div className="space-y-2">
                        {availableTLs.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                              <span>Tech Level (TL)</span>
                              {filterTLs.length > 0 && (
                                <button
                                  onClick={() => setFilterTLs([])}
                                  className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                                >
                                  clear
                                </button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {availableTLs.map(tl => {
                                const checked = filterTLs.includes(tl);
                                const count = currentItems.filter(i => (i.tech_level !== undefined ? i.tech_level : (i.tl !== undefined ? i.tl : i.techLevel)) === tl).length;
                                return (
                                  <button
                                    key={tl}
                                    onClick={() => toggleFilterTL(tl)}
                                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold border transition-colors ${
                                      checked
                                        ? 'bg-amber-950 text-amber-300 border-amber-500/70 shadow-sm'
                                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                                    }`}
                                  >
                                    TL {tl} ({count})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {availableMLs.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                              <span>Meta Level (ML)</span>
                              {filterMLs.length > 0 && (
                                <button
                                  onClick={() => setFilterMLs([])}
                                  className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                                >
                                  clear
                                </button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {availableMLs.map(ml => {
                                const checked = filterMLs.includes(ml);
                                const count = currentItems.filter(i => (i.meta_level !== undefined ? i.meta_level : (i.ml !== undefined ? i.ml : i.metaLevel)) === ml).length;
                                return (
                                  <button
                                    key={ml}
                                    onClick={() => toggleFilterML(ml)}
                                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold border transition-colors ${
                                      checked
                                        ? 'bg-purple-950 text-purple-300 border-purple-500/70 shadow-sm'
                                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                                    }`}
                                  >
                                    ML {ml} ({count})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. Tags & Creators */}
                    {availableTags.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                          <span className="flex items-center gap-1"><span>🏷️</span> Tags & Creators</span>
                          {filterTags.length > 0 && (
                            <button
                              onClick={() => setFilterTags([])}
                              className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                            >
                              clear
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {availableTags
                            .filter(tag => !filterSearchTerm || tag.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                            .map(tag => {
                              const checked = filterTags.includes(tag);
                              const count = currentItems.filter(i => {
                                const tags = Array.isArray(i.tags) ? i.tags : (typeof i.tags === 'string' ? i.tags.split(',').map(t => t.trim()) : []);
                                return tags.includes(tag);
                              }).length;

                              return (
                                <label
                                  key={tag}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                                    checked ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleFilterTag(tag)}
                                      className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
                                    />
                                    <span className={`truncate ${tag.startsWith('@') ? 'font-mono text-cyan-400' : ''}`}>{tag}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono ml-2">({count})</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* 5. Directives (Positive Keywords) Category */}
                    {availableDirectives.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                          <span className="flex items-center gap-1"><span>🏷️</span> Directives (+Keywords)</span>
                          {filterDirectives.length > 0 && (
                            <button
                              onClick={() => setFilterDirectives([])}
                              className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                            >
                              clear
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {availableDirectives
                            .filter(d => !filterSearchTerm || d.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                            .map(d => {
                              const count = currentItems.filter(i => {
                                const kws = i.keywords ? String(i.keywords).toLowerCase().split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : [];
                                return kws.includes(d.toLowerCase());
                              }).length;
                              const checked = filterDirectives.includes(d);

                              return (
                                <label
                                  key={d}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                                    checked ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleFilterDirective(d)}
                                      className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
                                    />
                                    <span className="truncate">{d}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono ml-2">({count})</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* 6. Railguards (Negative Keywords) Category */}
                    {availableRailguards.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                          <span className="flex items-center gap-1"><span>🛡️</span> Railguards (-Keywords)</span>
                          {filterRailguards.length > 0 && (
                            <button
                              onClick={() => setFilterRailguards([])}
                              className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                            >
                              clear
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {availableRailguards
                            .filter(r => !filterSearchTerm || r.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                            .map(r => {
                              const count = currentItems.filter(i => {
                                const negs = i.negative_keywords ? String(i.negative_keywords).toLowerCase().split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : [];
                                return negs.includes(r.toLowerCase());
                              }).length;
                              const checked = filterRailguards.includes(r);

                              return (
                                <label
                                  key={r}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                                    checked ? 'bg-red-950/60 text-red-300 border border-red-500/40' : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleFilterRailguard(r)}
                                      className="rounded border-slate-700 text-red-500 focus:ring-0 cursor-pointer accent-red-500"
                                    />
                                    <span className="truncate">{r}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono ml-2">({count})</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Popover Footer */}
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      ✕ Clear All
                    </button>
                    <button
                      onClick={() => setIsFiltersMenuOpen(false)}
                      className="px-3.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Columns & Field Visibility Menu */}
            <div className="relative" ref={columnsDropdownRef}>
              <button
                onClick={() => {
                  setIsColumnsMenuOpen(!isColumnsMenuOpen);
                  setIsFiltersMenuOpen(false);
                  setIsFileMenuOpen(false);
                }}
                className={`px-2.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                  isColumnsMenuOpen
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Configure visible table columns"
              >
                <span>⚙️ Columns</span>
                <span className="px-1.5 py-0.2 bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 rounded-full text-[10px] font-mono">
                  {visibleColumns.length}
                </span>
                <span className="text-[10px] opacity-70">{isColumnsMenuOpen ? '▲' : '▼'}</span>
              </button>

              {/* Columns Popover Menu */}
              {isColumnsMenuOpen && (
                <div className="max-sm:fixed max-sm:inset-x-3 max-sm:top-36 max-sm:w-auto sm:absolute sm:left-0 mt-2 w-72 sm:w-80 bg-slate-900 border-2 border-cyan-500/60 rounded-xl shadow-2xl z-50 p-3 flex flex-col gap-2.5 backdrop-blur-xl animate-fadeIn">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      Visible Table Columns
                    </span>
                    <button
                      onClick={() => setIsColumnsMenuOpen(false)}
                      className="text-slate-400 hover:text-white text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Filter fields..."
                    value={columnSearchTerm}
                    onChange={e => setColumnSearchTerm(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white px-2.5 py-1 rounded text-xs outline-none focus:border-cyan-500 font-mono"
                  />

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-800/80">
                    <button
                      onClick={resetDefaultColumns}
                      className="hover:text-cyan-400 transition-colors"
                    >
                      ↺ Defaults
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllColumns}
                        className="hover:text-amber-400 transition-colors"
                      >
                        Select All
                      </button>
                      <span>|</span>
                      <button
                        onClick={deselectExtraColumns}
                        className="hover:text-amber-400 transition-colors"
                      >
                        Clear Extra
                      </button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredAvailableFields.map(f => {
                      const isVisible = visibleColumns.includes(f.key);

                      return (
                        <div
                          key={f.key}
                          className={`flex items-center justify-between px-2 py-1.5 rounded transition-colors text-xs ${
                            isVisible ? 'bg-slate-800/70 text-slate-200' : 'bg-slate-950/40 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 truncate select-none">
                            <input
                              type="checkbox"
                              checked={isVisible}
                              disabled={f.key === 'name'}
                              onChange={() => toggleColumn(f.key)}
                              className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                            />
                            <span className="truncate font-medium">{f.label}</span>
                            {f.key === 'name' && (
                              <span className="text-[9px] text-slate-500 font-mono">(required)</span>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                title="Clear search and all active filters"
              >
                ✕ Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSearchDrawerOpen(false);
                setIsFiltersMenuOpen(false);
                setIsColumnsMenuOpen(false);
              }}
              className="px-2 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
              title="Collapse Search & Filters Drawer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* --- Integrated Rules Codex: Design Framework & Build Cost Checker Modal --- */}
      {isCodexFrameworkOpen && codexGuidance && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsCodexFrameworkOpen(false)}
        >
          <div
            className="bg-slate-950 border-2 border-cyan-500/60 rounded-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col gap-3.5 w-full max-w-6xl max-h-[85vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase">
                    {activeMatrix?.code || 'CDX'} DESIGN FRAMEWORK
                  </span>
                  <span className="text-xs font-bold text-white font-mono">
                    {codexGuidance.title}
                  </span>
                  {codexGuidance.subtitle && (
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      — {codexGuidance.subtitle}
                    </span>
                  )}
                </div>
                {codexGuidance.overview && (
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-4xl">
                    {codexGuidance.overview}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCodexFrameworkOpen(false);
                      handleCreateNew();
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    + Launch Studio Builder
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCodexFrameworkOpen(false)}
                  className="px-2 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                  title="Close Design Framework Modal"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
              {/* Column 1: Canonical Rules (RULE-*) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>⚖️ Canonical Design Rules</span>
                  <span>{codexGuidance.canonicalRules?.length || 0} Rules</span>
                </div>
                <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-1.5 custom-scrollbar">
                  {(codexGuidance.canonicalRules || []).map((rule, rIdx) => {
                    const ruleId = rule.id || rule.code || `RULE-${rIdx + 1}`;
                    const ruleTitle = rule.title || rule.label || '';
                    const ruleBody = rule.summary || rule.text || '';
                    return (
                      <div key={ruleId} className="p-2.5 rounded bg-slate-950/80 border border-slate-800/90 text-[11px]">
                        <div className="flex flex-wrap items-center gap-1.5 font-mono font-bold text-cyan-300">
                          <span className="px-1.5 py-0.2 bg-cyan-950 border border-cyan-500/30 rounded text-[9px] shrink-0">
                            {ruleId}
                          </span>
                          <span className="break-words leading-snug">{ruleTitle}</span>
                        </div>
                        {ruleBody && (
                          <p className="text-slate-300 mt-1.5 leading-relaxed text-[11px] break-words">{ruleBody}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Design Sections & Step-by-Step Blueprint */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                  <span>🧭 Creation Process & Sections</span>
                  <span>{normalizedGuidanceSections.length} Stages</span>
                </div>
                <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-1.5 custom-scrollbar">
                  {normalizedGuidanceSections.map((sec, idx) => {
                    const secTitle = sec.name || sec.title || `Stage ${idx + 1}`;
                    const secDesc = sec.description || sec.summary || sec.purpose || '';
                    const secList = Array.isArray(sec.tips)
                      ? sec.tips
                      : Array.isArray(sec.rules)
                        ? sec.rules
                        : Array.isArray(sec.steps)
                          ? sec.steps
                          : [];
                    return (
                      <div key={sec.id || idx} className="p-2.5 rounded bg-slate-950/80 border border-slate-800/90 text-[11px]">
                        <div className="font-mono font-bold text-white flex items-start gap-1.5">
                          <span className="shrink-0 mt-0.5">{sec.icon || '▸'}</span>
                          <span className="break-words leading-snug">{secTitle}</span>
                        </div>
                        {secDesc && (
                          <p className="text-slate-300 mt-1 leading-relaxed text-[11px] break-words">{secDesc}</p>
                        )}
                        {secList.length > 0 && (
                          <ul className="mt-1.5 space-y-1 text-[10.5px] text-slate-300 list-disc pl-4">
                            {secList.map((r, rIdx) => (
                              <li key={rIdx} className="leading-relaxed break-words">{r}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 3: Build Cost & Value Checker (Property vs Non-Property Strictly Separated) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{isPropertyCatalog ? '🧮 Property Build Cost & TSC Checker' : '🧬 Character / Entity Point Cost Checker'}</span>
                    <span>{catalogBuildSummary.validCount}/{catalogBuildSummary.total} Verified</span>
                  </div>
                  {codexGuidance.formula && (
                    <div className="mt-1.5 p-2 rounded bg-slate-950 border border-amber-500/30 text-[11px] font-mono text-amber-300">
                      {codexGuidance.formula}
                    </div>
                  )}

                  {isPropertyCatalog ? (
                    /* PROPERTY ONLY: Interactive TSC / Craft DC Reference Calculator */
                    <div className="mt-2 p-2.5 rounded bg-slate-950/90 border border-slate-800">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                        <span>TSC Craft DC Reference Calculator</span>
                        <span className="text-cyan-300 font-bold">DC {sandboxDC}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={sandboxDC}
                        onChange={(e) => setSandboxDC(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="grid grid-cols-3 gap-1.5 mt-1.5 text-center font-mono">
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                          <div className="text-[9px] text-slate-500 uppercase">Credit Value</div>
                          <div className="text-xs font-bold text-emerald-400">
                            {calculateCreditValue(sandboxDC).toLocaleString()} Cr
                          </div>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                          <div className="text-[9px] text-slate-500 uppercase">Materials (50%)</div>
                          <div className="text-xs font-bold text-cyan-300">
                            {calculateMaterialCost(calculateCreditValue(sandboxDC)).toLocaleString()} Cr
                          </div>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                          <div className="text-[9px] text-slate-500 uppercase">Req. WS</div>
                          <div className="text-xs font-bold text-amber-300">
                            WS {sandboxDC}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* NON-PROPERTY ONLY: Character Point (CP) / Skill Point (SP) Cost Reference (Zero Credit or Wealth References) */
                    <div className="mt-2 p-2.5 rounded bg-slate-950/90 border border-slate-800 space-y-1.5 font-mono text-[10.5px]">
                      <div className="text-[9.5px] font-bold uppercase text-cyan-400 tracking-wider">
                        Non-Property Point Cost Architecture
                      </div>
                      {currentKey === 'species' ? (
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Chassis / Scale:</span>
                            <span className="text-emerald-300 font-bold">Dynamic CP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Attribute Mod:</span>
                            <span className="text-cyan-300 font-bold">+5 CP / +1</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Skill Bundle:</span>
                            <span className="text-cyan-300 font-bold">+5 CP / 5 SP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Species Traits:</span>
                            <span className="text-amber-300 font-bold">1 / 2 / 4 CP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Inherent Feat:</span>
                            <span className="text-purple-300 font-bold">3 CP / Feat</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Flaw / Stigma:</span>
                            <span className="text-rose-300 font-bold">-CP Rebate</span>
                          </div>
                        </div>
                      ) : currentKey === 'archetypes' ? (
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Primary (+3):</span>
                            <span className="text-emerald-300 font-bold">15 CP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Secondary (+2):</span>
                            <span className="text-cyan-300 font-bold">10 CP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Skills (24 CP Essential + 18 CP Supporting):</span>
                            <span className="text-amber-300 font-bold">42 CP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Signature Traits &amp; Core Features (2+9+2 CP):</span>
                            <span className="text-purple-300 font-bold">13 CP (80 Total)</span>
                          </div>
                        </div>
                      ) : (currentKey === 'origins' || currentKey === 'occupations' || currentKey === 'factions') ? (
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Pillar Skill Pool:</span>
                            <span className="text-emerald-300 font-bold">20 SP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Pillar Traits:</span>
                            <span className="text-cyan-300 font-bold">2 Free (+1 CP)</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between col-span-2">
                            <span className="text-slate-400">Recommended Features:</span>
                            <span className="text-amber-300 font-bold">-1 CP Discount (3 → 2 CP)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10.5px] text-slate-300 leading-relaxed">
                          Non-property dataset governed strictly by Character Points (CP), Skill Points (SP), or Meta/Threat Tiers. No fabrication DC or credit costs apply.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
                  <span className="text-slate-400">
                    {catalogBuildSummary.warningCount > 0
                      ? `${catalogBuildSummary.warningCount} entry(s) have build cost warnings`
                      : 'All catalog entries match Rules Codex valuation'}
                  </span>
                  {catalogBuildSummary.warningCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterOnlyBuildWarnings(prev => !prev)}
                      className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 hover:bg-amber-900 font-bold cursor-pointer"
                    >
                      {filterOnlyBuildWarnings ? 'Show All' : 'Filter Warnings'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Dynamic Selected Filters as Glowing Gems Bar --- */}
      {isAnyFilterActive && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-slate-950/80 border border-slate-800/90 rounded-lg shrink-0 shadow-inner">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mr-1 flex items-center gap-1 font-mono">
            <span>💎</span> ACTIVE GEMS:
          </span>

          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 text-cyan-300 border border-cyan-500/50 rounded-full text-xs font-mono shadow-[0_0_8px_rgba(34,211,238,0.2)]">
              <span>🔍 "{searchTerm}"</span>
              <button onClick={() => setSearchTerm('')} className="hover:text-white ml-0.5 text-[11px] font-bold">✕</button>
            </span>
          )}

          {filterOnlyBuildWarnings && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-950/90 text-amber-300 border border-amber-500/60 rounded-full text-xs font-mono font-medium shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              <span>⚠ Needs Build Cost Review</span>
              <button onClick={() => setFilterOnlyBuildWarnings(false)} className="hover:text-white ml-0.5 text-[11px] font-bold">✕</button>
            </span>
          )}

          {filterTypes.map(t => (
            <span key={t} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 rounded-full text-xs font-mono font-medium shadow-[0_0_8px_rgba(34,211,238,0.3)]">
              <span>💎 {t}</span>
              <button onClick={() => toggleFilterType(t)} className="hover:text-white ml-0.5 text-[11px] font-bold">✕</button>
            </span>
          ))}

          {filterSubtypes.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-950/90 text-purple-200 border border-purple-500/60 rounded-full text-xs font-mono font-medium shadow-[0_0_8px_rgba(168,85,247,0.3)]">
              <span>🧬 {s}</span>
              <button onClick={() => toggleFilterSubtype(s)} className="hover:text-white ml-0.5 text-[11px] font-bold">✕</button>
            </span>
          ))}

          {filterTLs.map(tl => (
            <span key={tl} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-950/90 text-amber-300 border border-amber-500/60 rounded-full text-xs font-mono font-medium shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              <span>⚡ TL {tl}</span>
              <button onClick={() => toggleFilterTL(tl)} className="hover:text-white ml-0.5 text-[11px] font-bold">✕</button>
            </span>
          ))}

          {filterMLs.map(ml => (
            <span key={ml} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-950/90 text-purple-300 border border-purple-500/60 rounded-full text-xs font-mono font-medium shadow-[0_0_8px_rgba(168,85,247,0.3)]">
              <span>🔮 ML {ml}</span>
              <button onClick={() => toggleFilterML(ml)} className="hover:text-white ml-0.5 text-[11px] font-bold">✕</button>
            </span>
          ))}

          {filterTags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 rounded-full text-xs font-mono font-medium shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              <span>🏷️ {tag}</span>
              <button onClick={() => toggleFilterTag(tag)} className="hover:text-white ml-0.5 text-[11px] font-bold">✕</button>
            </span>
          ))}

          {filterDirectives.map(d => (
            <span key={d} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 rounded-full text-xs font-mono font-medium shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              <span>🏷️ Directives: {d}</span>
              <button onClick={() => toggleFilterDirective(d)} className="hover:text-white ml-0.5 text-[11px] font-bold">✕</button>
            </span>
          ))}

          {filterRailguards.map(r => (
            <span key={r} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-950/90 text-red-300 border border-red-500/60 rounded-full text-xs font-mono font-medium shadow-[0_0_8px_rgba(239,68,68,0.3)]">
              <span>🛡️ Railguard: {r}</span>
              <button onClick={() => toggleFilterRailguard(r)} className="hover:text-white ml-0.5 text-[11px] font-bold">✕</button>
            </span>
          ))}

          <button
            onClick={clearAllFilters}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/50 hover:bg-rose-900 transition-colors ml-1 cursor-pointer"
          >
            ✕ Clear All Gems
          </button>

          <span className="text-[10px] text-slate-500 ml-auto font-mono">
            Showing {displayedItems.length} of {currentItems.length} entries
          </span>
        </div>
      )}

      {/* --- Data Table --- */}
      <div className="flex-1 overflow-hidden rounded border border-slate-800 bg-slate-950 flex flex-col">
        {/* Horizontal Column Slide Bar (appears when excessive columns are active or table overflows) */}
        {showColumnSlideBar && (
          <div
            data-testid="catalog-column-slidebar"
            onWheel={(e) => {
              if (maxScrollLeft > 0) {
                const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
                if (delta !== 0) {
                  e.preventDefault();
                  nudgeHorizontalScroll(delta * 1.4);
                }
              }
            }}
            className="shrink-0 bg-slate-900/95 border-b border-cyan-500/30 px-3 py-1.5 flex items-center gap-2 select-none"
          >
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <span>⇄</span>
              <span className="hidden sm:inline">Slide Columns</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 text-[9.5px]">
                {visibleColumns.length}
              </span>
            </span>

            <button
              type="button"
              onClick={() => nudgeHorizontalScroll(-totalTableMinWidth)}
              disabled={scrollLeft <= 0}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-35 disabled:pointer-events-none text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-mono font-bold cursor-pointer transition-colors"
              title="Jump to first column"
            >
              ⇤
            </button>

            <button
              type="button"
              onClick={() => nudgeHorizontalScroll(-320)}
              disabled={scrollLeft <= 0}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-35 disabled:pointer-events-none text-cyan-300 border border-slate-700 text-[10px] font-mono font-bold cursor-pointer transition-colors"
              title="Slide columns left"
            >
              ◀
            </button>

            <input
              type="range"
              aria-label="Horizontal column slide bar"
              min={0}
              max={Math.max(1, maxScrollLeft)}
              value={Math.min(scrollLeft, Math.max(1, maxScrollLeft))}
              onChange={handleSlideBarChange}
              disabled={maxScrollLeft <= 0}
              className="flex-1 h-2 bg-slate-950 rounded-lg cursor-pointer accent-cyan-400"
            />

            <button
              type="button"
              onClick={() => nudgeHorizontalScroll(320)}
              disabled={scrollLeft >= maxScrollLeft - 1}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-35 disabled:pointer-events-none text-cyan-300 border border-slate-700 text-[10px] font-mono font-bold cursor-pointer transition-colors"
              title="Slide columns right"
            >
              ▶
            </button>

            <button
              type="button"
              onClick={() => nudgeHorizontalScroll(totalTableMinWidth)}
              disabled={scrollLeft >= maxScrollLeft - 1}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-35 disabled:pointer-events-none text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-mono font-bold cursor-pointer transition-colors"
              title="Jump to last column"
            >
              ⇥
            </button>

            <span className="text-[10px] font-mono text-slate-400 shrink-0 min-w-[36px] text-right">
              {maxScrollLeft > 0 ? `${Math.round((scrollLeft / maxScrollLeft) * 100)}%` : 'FIT'}
            </span>
          </div>
        )}

        {displayedItems.length === 0 ? (
          <div
            ref={tableScrollRef}
            onScroll={handleTableScroll}
            className="flex-1 overflow-auto catalog-scroll-container flex flex-col"
          >
            <table
              className="w-full text-left text-xs text-slate-300 table-fixed border-separate border-spacing-0"
              style={{ minWidth: `${totalTableMinWidth}px` }}
            >
              <colgroup>
                {visibleColumns.map((col, idx) => {
                  const colW = columnWidths[idx] || 165;
                  return (
                    <col
                      key={col}
                      style={{
                        width: `${(colW / totalTableMinWidth) * 100}%`,
                        minWidth: `${colW}px`
                      }}
                    />
                  );
                })}
              </colgroup>
              <thead className="bg-slate-900 text-cyan-400 uppercase font-bold sticky top-0 z-20 select-none">
                <tr>
                  {visibleColumns.map(col => {
                    const isSorted = sortField === col;
                    const fieldDef = allAvailableFields.find(f => f.key === col);
                    const label = fieldDef ? fieldDef.label : col.replace(/_/g, ' ');
                    const isPrimary = col === 'name';

                    return (
                      <th
                        key={col}
                        onClick={() => {
                          if (sortField === col) {
                            setSortAsc(!sortAsc);
                          } else {
                            setSortField(col);
                            setSortAsc(true);
                          }
                        }}
                        className={`p-3 cursor-pointer hover:text-white transition-colors group border-b border-slate-800 bg-slate-900 ${
                          isPrimary
                            ? `sticky left-0 z-30 ${isHorizontallyScrolled ? 'border-r border-cyan-500/30 shadow-[4px_0_12px_rgba(0,0,0,0.65)]' : ''}`
                            : ''
                        }`}
                        title={`Click to sort by ${label}`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <span className="truncate">{label}</span>
                          <span className={`text-[10px] shrink-0 transition-opacity ${
                            isSorted ? 'text-amber-400 opacity-100 font-bold' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                          }`}>
                            {isSorted ? (sortAsc ? '▲' : '▼') : '↕'}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
            </table>
            <div className="p-8 text-center text-slate-500 italic flex flex-col items-center justify-center gap-2">
              <span>No matching records found in {currentConfig.label || currentKey}.</span>
              {isAnyFilterActive && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold underline"
                >
                  Reset Active Filters
                </button>
              )}
            </div>
          </div>
        ) : displayedItems.length > 50 ? (
          <VirtualizedList
            items={displayedItems}
            itemHeight={44}
            scrollContainerRef={tableScrollRef}
            onContainerScroll={handleTableScroll}
            contentMinWidth={`${totalTableMinWidth}px`}
            resetScrollDeps={[searchTerm, sortField, sortAsc, currentKey, visibleColumns.join(','), filterOnlyBuildWarnings]}
            getKey={(item, index) => item.id || item.name || index}
            containerClassName="flex-1 h-full overflow-auto bg-slate-950 pb-2 catalog-scroll-container"
            header={
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns,
                  minWidth: `${totalTableMinWidth}px`
                }}
                className="bg-slate-900 border-b border-slate-800 text-cyan-400 text-xs uppercase font-bold sticky top-0 z-20 select-none"
              >
                {visibleColumns.map(col => {
                  const isSorted = sortField === col;
                  const fieldDef = allAvailableFields.find(f => f.key === col);
                  const label = fieldDef ? fieldDef.label : col.replace(/_/g, ' ');
                  const isPrimary = col === 'name';

                  return (
                    <div
                      key={col}
                      onClick={() => {
                        if (sortField === col) {
                          setSortAsc(!sortAsc);
                        } else {
                          setSortField(col);
                          setSortAsc(true);
                        }
                      }}
                      className={`p-3 cursor-pointer hover:text-white transition-colors group bg-slate-900 ${
                        isPrimary
                          ? `sticky left-0 z-30 ${isHorizontallyScrolled ? 'border-r border-cyan-500/30 shadow-[4px_0_12px_rgba(0,0,0,0.65)]' : ''}`
                          : ''
                      }`}
                      title={`Click to sort by ${label}`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        <span className="truncate">{label}</span>
                        <span className={`text-[10px] shrink-0 transition-opacity ${
                          isSorted ? 'text-amber-400 opacity-100 font-bold' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}>
                          {isSorted ? (sortAsc ? '▲' : '▼') : '↕'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            }
            renderItem={(item, idx) => (
              <CatalogVirtualRow
                key={item.id || item.name}
                item={item}
                visibleColumns={visibleColumns}
                gridTemplateColumns={gridTemplateColumns}
                totalMinWidth={totalTableMinWidth}
                isHorizontallyScrolled={isHorizontallyScrolled}
                handleOpenItem={handleOpenItem}
                isAdmin={isAdmin}
                handleDuplicateEntry={handleDuplicateEntry}
                handleDeleteEntry={handleDeleteEntry}
                buildCheck={buildCheckByItemKey.get(item.id || item.name || idx) || evaluateAssetBuildCost(item, currentKey)}
              />
            )}
          />
        ) : (
          <div
            ref={tableScrollRef}
            onScroll={handleTableScroll}
            className="flex-1 overflow-auto pb-2 catalog-scroll-container"
          >
            <table
              className="w-full text-left text-xs text-slate-300 table-fixed border-separate border-spacing-0"
              style={{ minWidth: `${totalTableMinWidth}px` }}
            >
              <colgroup>
                {visibleColumns.map((col, idx) => {
                  const colW = columnWidths[idx] || 165;
                  return (
                    <col
                      key={col}
                      style={{
                        width: `${(colW / totalTableMinWidth) * 100}%`,
                        minWidth: `${colW}px`
                      }}
                    />
                  );
                })}
              </colgroup>
              <thead className="bg-slate-900 text-cyan-400 uppercase font-bold sticky top-0 z-20 select-none">
                <tr>
                  {visibleColumns.map(col => {
                    const isSorted = sortField === col;
                    const fieldDef = allAvailableFields.find(f => f.key === col);
                    const label = fieldDef ? fieldDef.label : col.replace(/_/g, ' ');
                    const isPrimary = col === 'name';

                    return (
                      <th
                        key={col}
                        onClick={() => {
                          if (sortField === col) {
                            setSortAsc(!sortAsc);
                          } else {
                            setSortField(col);
                            setSortAsc(true);
                          }
                        }}
                        className={`p-3 cursor-pointer hover:text-white transition-colors group border-b border-slate-800 bg-slate-900 ${
                          isPrimary
                            ? `sticky left-0 z-30 ${isHorizontallyScrolled ? 'border-r border-cyan-500/30 shadow-[4px_0_12px_rgba(0,0,0,0.65)]' : ''}`
                            : ''
                        }`}
                        title={`Click to sort by ${label}`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <span className="truncate">{label}</span>
                          <span className={`text-[10px] shrink-0 transition-opacity ${
                            isSorted ? 'text-amber-400 opacity-100 font-bold' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                          }`}>
                            {isSorted ? (sortAsc ? '▲' : '▼') : '↕'}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((item, idx) => (
                  <CatalogTableRow
                    key={item.id || item.name}
                    item={item}
                    visibleColumns={visibleColumns}
                    isHorizontallyScrolled={isHorizontallyScrolled}
                    handleOpenItem={handleOpenItem}
                    isAdmin={isAdmin}
                    handleDuplicateEntry={handleDuplicateEntry}
                    handleDeleteEntry={handleDeleteEntry}
                    buildCheck={buildCheckByItemKey.get(item.id || item.name || idx) || evaluateAssetBuildCost(item, currentKey)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Integrated Rules Codex AI Synthesizer & Ingestion Modals */}
      <CodexAiSynthesizerModal
        isOpen={isAiSynthesizerOpen}
        onClose={() => setIsAiSynthesizerOpen(false)}
        matrix={activeMatrix}
        initialDatasetKey={currentKey}
        onApplyGeneratedData={(generatedData) => {
          setIsAiSynthesizerOpen(false);
          handleCreateNew(generatedData);
        }}
        onApplyIngestedEntry={(ingestedData) => {
          setIsAiSynthesizerOpen(false);
          handleCreateNew(ingestedData);
        }}
      />

      <CodexIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        initialDatasetKey={currentKey}
        focusedMode={true}
        onApplyEntry={(ingestedData) => {
          setIsIngestionOpen(false);
          handleCreateNew(ingestedData);
        }}
      />
    </div>
  );
};
