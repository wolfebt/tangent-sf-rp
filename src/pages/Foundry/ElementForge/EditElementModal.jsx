import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  ELEMENT_TYPES,
  PROPERTY_SUBCATEGORIES,
  METAPHYSICS_SUBCATEGORIES,
  getElementFileExtension,
  getTypePillStyle,
  normalizeElementType
} from './elementSchemas';
import { downloadAimeAssetFile } from '../../../services/aimeAssetFileService';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { attachCreatorTag } from '../../../utils/creatorUtils';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { showToast } from '../../../context/ToastContext';
import { useStory } from '../../../context/CampaignContext';
import { ArtistHubModal } from '../../../components/StoryFoundry/ArtistHubModal';
import { AimeGuidanceFlyout } from '../../../components/StoryFoundry/AimeGuidanceFlyout';
import { AimeGuidanceButton } from '../../../components/StoryFoundry/AimeGuidanceButton';
import GuidedForgeShell from '../../../components/StoryFoundry/GuidedForge/GuidedForgeShell';
import AimeThreeTierStack from './components/AimeThreeTierStack';
import {
  getPlaybookForType,
  computeGuidedElementReadiness,
  parseChipKeywords,
  GUIDED_ELEMENT_STAGE_IDS
} from './guided/elementPlaybooks';
import { buildArtistHubVisualBrief } from './guided/guidedElementAiService';
import Stage1SparkAndCanon from './guided/stages/Stage1SparkAndCanon';
import Stage2DirectorialLens from './guided/stages/Stage2DirectorialLens';
import Stage3CoreReality from './guided/stages/Stage3CoreReality';
import Stage4TacticalSystems from './guided/stages/Stage4TacticalSystems';
import Stage5WebAndFinalize from './guided/stages/Stage5WebAndFinalize';
import { ModifierService } from '../../../services/modifierService';
import { AudioService } from '../../../services/audioService';
import { useDirtyModalClose } from '../../../hooks/useDirtyModalClose';
import {
  FolderOpen,
  ChevronDown,
  Save,
  Download,
  Copy,
  Trash2,
  Compass,
  Zap,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const AutoExpandingElementTextarea = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(48, el.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={2}
      value={value || ''}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      placeholder={placeholder}
      className={`${className} resize-none overflow-hidden`}
      style={{ fieldSizing: 'content' }}
    />
  );
};

const EditElementModal = ({
  isOpen,
  onClose,
  element,
  onSave,
  onDelete,
  initialMode,
  initialSeedTab = 'spark',
  activeScenario = null
}) => {
  const navigate = useNavigate();
  const {
    deleteSavedElement,
    elementsCatalog,
    universeState,
    mapsCatalog,
    cronicle,
    updateStory,
    addGalleryModifier
  } = useStory();

  const [editorMode, setEditorMode] = useState('guided'); // 'guided' | 'sheet'
  const [activeStageId, setActiveStageId] = useState('spark');

  const [type, setType] = useState('Persona');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fields, setFields] = useState({});
  const [customFields, setCustomFields] = useState([]);
  const [guidance, setGuidance] = useState({});
  const [assetHub, setAssetHub] = useState([]);
  const [dbmSyncStatus, setDbmSyncStatus] = useState('standalone');
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  const [linkToActiveScenario, setLinkToActiveScenario] = useState(false);
  const [registerModifierOnSave, setRegisterModifierOnSave] = useState(false);

  const [pendingType, setPendingType] = useState(null);
  const [showTypeConfirm, setShowTypeConfirm] = useState(false);

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isArtistHubOpen, setIsArtistHubOpen] = useState(false);
  const [isAimeGuidanceOpen, setIsAimeGuidanceOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const fileMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) {
        setIsFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (element) {
      const normalizedType = normalizeElementType(element.type || 'Persona');
      const incomingFields = element.fields || {};
      const isBlankElement =
        !element.title &&
        !element.content &&
        Object.keys(incomingFields).length === 0;

      setType(normalizedType);
      setTitle(element.title || '');
      setContent(element.content || '');
      setImageUrl(element.imageUrl || '');
      setFields(incomingFields);
      setCustomFields(Array.isArray(element.customFields) ? element.customFields : []);
      setGuidance(element.guidance || {});
      setAssetHub(element.assetHub || element.linkedElements || []);
      setDbmSyncStatus(
        element.dbmSyncStatus || (incomingFields.dbmRef ? 'synced' : 'standalone')
      );
      setActiveTabIdx(0);
      setActiveStageId('spark');
      setEditorMode(initialMode || (isBlankElement ? 'guided' : 'sheet'));
      setLinkToActiveScenario(false);
      setRegisterModifierOnSave(false);
      setPendingType(null);
      setShowTypeConfirm(false);
    }
  }, [element, isOpen, initialMode]);

  const isDirty = useMemo(() => {
    if (!element) return false;
    return (
      (title || '') !== (element.title || '') ||
      normalizeElementType(type || 'Persona') !== normalizeElementType(element.type || 'Persona') ||
      (content || '') !== (element.content || '') ||
      (imageUrl || '') !== (element.imageUrl || '') ||
      JSON.stringify(fields || {}) !== JSON.stringify(element.fields || {}) ||
      JSON.stringify(customFields || []) !== JSON.stringify(element.customFields || [])
    );
  }, [element, title, type, content, imageUrl, fields, customFields]);

  const { handleRequestClose, handleBackdropClick } = useDirtyModalClose({
    isOpen,
    isDirty,
    onClose,
    title: 'Discard Element Edits?',
    message: `You have unsaved changes in "${title || element?.title || 'this element'}". Discard changes and close?`
  });

  const currentDraft = useMemo(
    () => ({
      id: element?.id || 'draft',
      type,
      title,
      content,
      imageUrl,
      dbmSyncStatus,
      fields,
      customFields,
      guidance,
      assetHub
    }),
    [element?.id, type, title, content, imageUrl, dbmSyncStatus, fields, customFields, guidance, assetHub]
  );

  const playbook = useMemo(() => getPlaybookForType(type), [type]);
  const readiness = useMemo(() => computeGuidedElementReadiness(currentDraft), [currentDraft]);

  const allMapsList = useMemo(() => {
    const merged = [...(universeState?.maps || []), ...(mapsCatalog || [])];
    const seen = new Set();
    return merged.filter((m) => {
      if (!m || !m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [universeState?.maps, mapsCatalog]);

  if (!isOpen || !element) return null;

  const allTabs = ['AIME 3-Tier Architecture', 'Narrative Prose & Lore', 'Custom Fields'];
  const currentTab = allTabs[activeTabIdx] || allTabs[0];

  const handleExportElement = () => {
    downloadAimeAssetFile({
      ...element,
      title: title.trim() || 'Untitled',
      type,
      fields,
      content,
      guidance,
      assetHub,
      customFields,
      dbmSyncStatus
    });
    showToast({
      type: 'success',
      text: `Exported ${title || 'element'} as portable ${getElementFileExtension(type)} asset!`
    });
    setIsFileMenuOpen(false);
  };

  const handleDuplicateElement = () => {
    const cloned = {
      ...element,
      id: uuidv4(),
      title: `${title || element.title || 'Untitled'} (Copy)`,
      type,
      fields: { ...fields },
      content,
      customFields: [...customFields],
      guidance: { ...guidance },
      assetHub: [...assetHub],
      dbmSyncStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const withCreator = attachCreatorTag(cloned, localStorage.getItem('userHandle'));
    if (onSave) {
      onSave(withCreator);
    }
    showToast({ type: 'success', text: `Duplicated "${cloned.title}"!` });
    setIsFileMenuOpen(false);
    onClose();
  };

  const handleDeleteElement = async () => {
    setIsFileMenuOpen(false);
    const targetName = title || element.title || 'Untitled Element';
    const itemDescriptor = type ? type.toLowerCase() : 'element';
    if (await confirmTypedDeletion(targetName, itemDescriptor)) {
      if (onDelete) {
        onDelete(element.id);
      } else if (deleteSavedElement) {
        deleteSavedElement(element.id);
      }
      showToast({ type: 'info', text: `Deleted ${targetName}.` });
      onClose();
    }
  };

  const handleTypeSelectChange = (newType, options = {}) => {
    const normalizedNext = normalizeElementType(newType);
    if (normalizedNext === type) return;

    const hasPopulatedFields = Object.values(fields || {}).some(
      (v) => v !== undefined && v !== null && String(v).trim() !== ''
    );

    if (options.silent || !hasPopulatedFields) {
      setType(normalizedNext);
      if (!options.silent) setFields({});
      setActiveTabIdx(0);
      return;
    }

    setPendingType(normalizedNext);
    setShowTypeConfirm(true);
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      setType(pendingType);
      setFields({});
      setActiveTabIdx(0);
    }
    setPendingType(null);
    setShowTypeConfirm(false);
  };

  const cancelTypeChange = () => {
    setPendingType(null);
    setShowTypeConfirm(false);
  };

  const handleFieldChange = (key, val) => {
    setFields((prev) => {
      const next = { ...prev, [key]: val };
      if (prev.dbmRef && key !== 'dbmRef' && key !== 'dbmCategory' && dbmSyncStatus === 'synced') {
        setDbmSyncStatus('local_override');
      }
      return next;
    });
  };

  const handleMergeFields = (patch = {}) => {
    setFields((prev) => ({ ...prev, ...patch }));
  };

  const handleCustomFieldChange = (id, key, val) => {
    setCustomFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  };

  const handleAddCustomField = () => {
    setCustomFields((prev) => [...prev, { id: uuidv4(), label: '', value: '' }]);
  };

  const handleRemoveCustomField = (id) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast({ type: 'warning', text: 'Please select a valid image file.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInputValue.trim()) {
      setImageUrl(urlInputValue.trim());
      setUrlInputValue('');
      setShowUrlInput(false);
    }
  };

  const handleSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!title.trim()) {
      showToast({ type: 'warning', text: 'Element title is required (Stage 1).' });
      if (editorMode === 'guided') setActiveStageId('spark');
      return;
    }

    const validCustomFields = customFields
      .map((f) => ({ ...f, label: f.label ? f.label.trim() : '' }))
      .filter((f) => f.label && f.label !== '')
      .map((f) => ({ id: f.id || uuidv4(), label: f.label, value: f.value || '' }));

    const rawUpdatedElement = {
      ...element,
      type,
      ...(type === 'Property'
        ? { propertySubcategory: fields.propertySubcategory || element.propertySubcategory || 'gear' }
        : {}),
      ...(type === 'Metaphysics'
        ? { metaphysicsSubcategory: fields.metaphysicsSubcategory || element.metaphysicsSubcategory || 'invocations' }
        : {}),
      ...(type === 'Persona'
        ? { personaSubcategory: fields.personaSubcategory || element.personaSubcategory || 'story' }
        : {}),
      title: title.trim(),
      content,
      imageUrl,
      dbmSyncStatus,
      fields,
      customFields: validCustomFields,
      guidance,
      assetHub,
      linkedElements: (assetHub || []).map((a) => a.assetId || a),
      updatedAt: new Date().toISOString()
    };
    const updatedElement = attachCreatorTag(rawUpdatedElement, localStorage.getItem('userHandle'));

    onSave(updatedElement);

    // Optional Post-Save Bridge 1: Derive Situational Modifier into Story Gallery
    if (registerModifierOnSave && typeof addGalleryModifier === 'function') {
      let derivedMod = null;
      if (type === 'Persona') {
        derivedMod = ModifierService.createModifierFromPerson(updatedElement);
      } else if (type === 'Item' || type === 'Property') {
        derivedMod = ModifierService.createModifierFromItem(updatedElement);
      } else if (type === 'Setting') {
        derivedMod = ModifierService.createModifierFromLocation(updatedElement);
      }
      if (derivedMod) {
        addGalleryModifier(derivedMod);
        showToast({
          type: 'info',
          text: `Registered Situational Modifier "${derivedMod.name}" in Story Gallery!`
        });
      }
    }

    // Optional Post-Save Bridge 2: Link directly to Active Weaver Scenario
    if (
      linkToActiveScenario &&
      activeScenario?.id &&
      typeof updateStory === 'function' &&
      Array.isArray(universeState?.scenarios)
    ) {
      const attachToNode = (nodes) =>
        nodes.map((node) => {
          if (node.id === activeScenario.id) {
            const existingHub = Array.isArray(node.assetHub) ? node.assetHub : [];
            const alreadyInHub = existingHub.some(
              (a) => (typeof a === 'string' ? a : a.assetId) === updatedElement.id
            );
            const nextHub = alreadyInHub
              ? existingHub
              : [
                  ...existingHub,
                  {
                    assetId: updatedElement.id,
                    assetTitle: updatedElement.title,
                    assetType: updatedElement.type,
                    importance: 'high',
                    annotation: 'Linked from Guided Element Forge'
                  }
                ];
            const existingIds = Array.isArray(node.linkedElements) ? node.linkedElements : [];
            const nextIds = existingIds.includes(updatedElement.id)
              ? existingIds
              : [...existingIds, updatedElement.id];
            return {
              ...node,
              assetHub: nextHub,
              linkedElements: nextIds
            };
          }
          if (Array.isArray(node.children) && node.children.length > 0) {
            return { ...node, children: attachToNode(node.children) };
          }
          return node;
        });

      updateStory({ scenarios: attachToNode(universeState.scenarios) });
      showToast({
        type: 'success',
        text: `Linked "${updatedElement.title}" to scenario "${activeScenario.title || activeScenario.name}"!`
      });
    }

    onClose();
  };

  // Guided Stages Descriptor Array
  const guidedStages = [
    {
      id: 'spark',
      num: 1,
      shortTitle: 'Spark & Canon',
      title: 'Spark, Blueprint & Canon Seed',
      subtitle: 'Anchor classification, high-concept pitch, blueprint, or Omnicortex DBM record.',
      status: readiness.stages.spark
    },
    {
      id: 'lens',
      num: 2,
      shortTitle: 'Directorial Lens',
      title: 'Layer 1: Directorial Guidance Gems',
      subtitle: 'Inherit active Module Gems, apply stylistic presets, and set thematic railguards.',
      status: readiness.stages.lens
    },
    {
      id: 'traits',
      num: 3,
      shortTitle: 'Core Traits',
      title: playbook.stage3Title,
      subtitle: playbook.stage3Subtitle,
      status: readiness.stages.traits
    },
    {
      id: 'tactical',
      num: 4,
      shortTitle: 'Tactical / VTT',
      title: playbook.stage4Title,
      subtitle: playbook.stage4Subtitle,
      status: readiness.stages.tactical
    },
    {
      id: 'web',
      num: 5,
      shortTitle: 'Web & Finalize',
      title: 'Asset Hub Web, Lorebook & Art',
      subtitle: 'Connect resonant entities, derive trigger keys, and attach concept art.',
      status: readiness.stages.web
    }
  ];

  const activeStageIndex = Math.max(0, GUIDED_ELEMENT_STAGE_IDS.indexOf(activeStageId));

  // Build compact tactical summary badge for Live Dossier Rail
  let tacticalPreviewBadge = '';
  if (type === 'Persona' && fields.mcmTier) {
    tacticalPreviewBadge =
      fields.physiology === 'Synthetic'
        ? `T-${fields.mcmTier} ${fields.mcmChassis || ''} • ${fields.health || 60} SP`
        : `T-${fields.mcmTier} ${fields.mcmChassis || ''} • ${fields.vitality || 30} VP / ${fields.health || 30} HP`;
  } else if (playbook.family === 'relic' && (fields.costCr || fields.techLevel || fields['tech-level'])) {
    tacticalPreviewBadge = `TL-${fields['tech-level'] || 3} ${fields.rarity || ''} • CR ${fields.costCr || 12}`;
  } else if (playbook.family === 'location' && (fields.hazardCr || fields.weatherPreset)) {
    tacticalPreviewBadge = `Hazard CR ${fields.hazardCr || 15}`;
  } else if (playbook.family === 'epistemic' && fields.analysisCr) {
    tacticalPreviewBadge = `${fields.analysisSkill || 'Analysis'} CR ${fields.analysisCr}`;
  }

  const dossierPreview = {
    title,
    type,
    pillStyle: getTypePillStyle(type),
    familyLabel: playbook.familyLabel,
    imageUrl,
    pitch: fields[playbook.pitchKey] || fields.summary || '',
    syncBadge: fields.dbmRef
      ? dbmSyncStatus === 'local_override'
        ? '▲ DBM Override'
        : '⚡ DBM Synced'
      : '',
    tacticalBadge: tacticalPreviewBadge,
    linkedCount: Array.isArray(assetHub) ? assetHub.length : 0,
    triggerCount: parseChipKeywords(fields.primaryTriggers).length
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 pt-4 sm:pt-8 pb-6 overflow-y-auto select-none font-sans text-slate-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#161b22] border-2 border-cyan-400/80 rounded-2xl w-[96vw] max-w-7xl h-[92vh] sm:h-[90dvh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden relative"
      >
        {/* Hidden Shared Image File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageFileChange}
        />

        {/* ── MODAL HEADER WITH DUAL-MODE [ 🧭 GUIDED | ⚡ SHEET ] SWITCHER ── */}
        <div className="relative z-30 px-4 sm:px-6 py-3.5 bg-[#0d1117] border-b border-[#0D5C63]/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-cyan-600 flex items-center justify-center text-lg shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              {editorMode === 'guided' ? '🧭' : '⚡'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                  {editorMode === 'guided' ? 'Guided Element Forge' : 'Element Master Sheet'}
                </h2>
                <span className={`text-[9px] font-mono px-2 py-0.2 rounded-full border font-bold uppercase ${getTypePillStyle(type)}`}>
                  {type}
                  {type === 'Property' && (fields.propertySubcategory || element.propertySubcategory)
                    ? ` • ${fields.propertySubcategory || element.propertySubcategory}`
                    : ''}
                </span>
                {element.isFolioPersona && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/folio');
                    }}
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-200 hover:bg-purple-900 flex items-center gap-1 cursor-pointer"
                    title="Open full character sheet in Persona Folio"
                  >
                    <span>🪪 Open in Folio</span>
                    <ExternalLink size={10} />
                  </button>
                )}
                {element.codexMatrixId && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/codex?matrix=${element.codexMatrixId}`);
                    }}
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-900 flex items-center gap-1 cursor-pointer"
                    title="Open canonical entry in Codex Studio"
                  >
                    <span>⚡ Open in Codex</span>
                    <ExternalLink size={10} />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[260px] sm:max-w-md">
                {title ? `${title} • ` : ''}ID: {element.id}
              </p>
            </div>
          </div>

          {/* Segmented Dual-Mode Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1180, 0.025);
                setEditorMode('guided');
              }}
              className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                editorMode === 'guided'
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-400/70 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="5-Stage Guided Studio with AIME & BASTION Step-Assist"
            >
              <Compass size={13} className={editorMode === 'guided' ? 'text-cyan-400' : 'text-slate-500'} />
              <span>Guided</span>
            </button>

            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1040, 0.025);
                setEditorMode('sheet');
              }}
              className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                editorMode === 'sheet'
                  ? 'bg-amber-950 text-amber-200 border border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Direct 3-Tier Master Sheet & Custom Key-Value Editor"
            >
              <Zap size={13} className={editorMode === 'sheet' ? 'text-amber-400' : 'text-slate-500'} />
              <span>Sheet</span>
            </button>
          </div>

          {/* Right Utility Controls */}
          <div className="flex items-center gap-2 relative">
            {/* Consolidated Single FILE Pulldown */}
            <div className="relative" ref={fileMenuRef}>
              <button
                type="button"
                onClick={() => setIsFileMenuOpen((prev) => !prev)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Element File Actions (Save, Export, Duplicate, Delete)"
              >
                <FolderOpen size={13} className="text-cyan-400" />
                <span>FILE</span>
                <ChevronDown size={11} className={`text-slate-400 transition-transform ${isFileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFileMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-[#0b101b] border border-cyan-500/40 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.95)] py-1.5 z-50 text-xs font-mono divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        setIsFileMenuOpen(false);
                        handleSubmit(e);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-cyan-300 hover:text-cyan-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Save size={13} />
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportElement}
                      className="w-full text-left px-3 py-1.5 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Export {getElementFileExtension(type)} Asset</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDuplicateElement}
                      className="w-full text-left px-3 py-1.5 hover:bg-purple-950/60 text-purple-300 hover:text-purple-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Copy size={13} />
                      <span>Duplicate Element</span>
                    </button>
                  </div>
                  {element && (element.id || element.title) && (
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={handleDeleteElement}
                        className="w-full text-left px-3 py-1.5 hover:bg-red-950/60 text-red-400 hover:text-red-200 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Delete Element</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <AimeGuidanceButton
              onClick={() => setIsAimeGuidanceOpen(true)}
              label="AIME Guidance"
              size="sm"
            />
            <button
              type="button"
              onClick={handleRequestClose}
              className="text-slate-400 hover:text-white text-2xl font-bold px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* ── SHARED TYPE CHANGE CONFIRMATION OVERLAY ── */}
        {showTypeConfirm && (
          <div className="absolute inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-4 pt-16 pb-12 overflow-y-auto">
            <div className="bg-[#161b22] border border-amber-500/70 rounded-2xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col gap-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl mx-auto shadow-md">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-extrabold text-amber-400 uppercase tracking-wider">
                  Change Element Type?
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Changing type from{' '}
                  <span className="font-bold text-amber-300 px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/30">
                    {type}
                  </span>{' '}
                  to{' '}
                  <span className="font-bold text-cyan-300 px-1.5 py-0.5 bg-cyan-500/10 rounded border border-cyan-500/30">
                    {pendingType}
                  </span>{' '}
                  will reset type-specific fields as data will not carry over.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={cancelTypeChange}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmTypeChange}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODE A: 5-STAGE GUIDED FORGE SHELL ── */}
        {editorMode === 'guided' ? (
          <GuidedForgeShell
            stages={guidedStages}
            activeStageId={activeStageId}
            onSelectStage={setActiveStageId}
            readiness={readiness}
            dossierPreview={dossierPreview}
            footerLeft={
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                <span>
                  Playbook: <strong className="text-slate-200">{playbook.familyLabel}</strong>
                </span>
                {isDirty && <span className="text-amber-400 font-bold">• Unsaved Changes</span>}
              </div>
            }
            footerRight={
              <>
                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                {activeStageIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1020, 0.025);
                      setActiveStageId(GUIDED_ELEMENT_STAGE_IDS[activeStageIndex - 1]);
                    }}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold uppercase rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>
                )}

                {activeStageIndex < GUIDED_ELEMENT_STAGE_IDS.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1180, 0.025);
                      setActiveStageId(GUIDED_ELEMENT_STAGE_IDS[activeStageIndex + 1]);
                    }}
                    className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-200 text-xs font-mono font-bold uppercase rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Next Stage</span>
                    <ChevronRight size={14} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 border border-emerald-400/70 text-white text-xs font-mono font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_14px_rgba(16,185,129,0.28)] cursor-pointer"
                >
                  💾 Save {type}
                </button>
              </>
            }
          >
            {activeStageId === 'spark' && (
              <Stage1SparkAndCanon
                type={type}
                onRequestTypeChange={handleTypeSelectChange}
                title={title}
                onChangeTitle={setTitle}
                fields={fields}
                onChangeField={handleFieldChange}
                onMergeFields={handleMergeFields}
                guidance={guidance}
                onChangeGuidance={setGuidance}
                onSetContent={setContent}
                onSetDbmSyncStatus={setDbmSyncStatus}
                initialSeedTab={initialSeedTab}
                onAdvanceStage={setActiveStageId}
                onSwitchToSheet={() => {
                  setEditorMode('sheet');
                  setActiveTabIdx(1); // Open Narrative Prose & Lore directly after Markdown Dump
                }}
                elementsCatalog={elementsCatalog || []}
              />
            )}

            {activeStageId === 'lens' && (
              <Stage2DirectorialLens
                guidance={guidance}
                onChangeGuidance={setGuidance}
                fields={fields}
                onChangeField={handleFieldChange}
                moduleGems={universeState?.creativeState?.gems || []}
                activeScenarioGuidance={activeScenario?.guidance || null}
              />
            )}

            {activeStageId === 'traits' && (
              <Stage3CoreReality
                draft={currentDraft}
                onChangeField={handleFieldChange}
                onMergeFields={handleMergeFields}
                content={content}
                onChangeContent={setContent}
                elementsCatalog={elementsCatalog || []}
                projectName={universeState?.projectName || 'Tangent Universe'}
                cronicle={universeState?.cronicle || cronicle || null}
              />
            )}

            {activeStageId === 'tactical' && (
              <Stage4TacticalSystems
                draft={currentDraft}
                onChangeField={handleFieldChange}
                onMergeFields={handleMergeFields}
                mapsList={allMapsList}
                registerModifierOnSave={registerModifierOnSave}
                onToggleRegisterModifier={setRegisterModifierOnSave}
                onOpenAimeGuidance={() => setIsAimeGuidanceOpen(true)}
              />
            )}

            {activeStageId === 'web' && (
              <Stage5WebAndFinalize
                draft={currentDraft}
                onChangeField={handleFieldChange}
                onMergeFields={handleMergeFields}
                assetHub={assetHub}
                onChangeAssetHub={setAssetHub}
                elementsCatalog={elementsCatalog || []}
                imageUrl={imageUrl}
                onUploadImageClick={() => fileInputRef.current?.click()}
                onSetImageUrl={setImageUrl}
                onOpenArtistHub={() => setIsArtistHubOpen(true)}
                activeScenario={activeScenario}
                linkToActiveScenario={linkToActiveScenario}
                onToggleLinkToScenario={setLinkToActiveScenario}
              />
            )}
          </GuidedForgeShell>
        ) : (
          /* ── MODE B: DIRECT MASTER SHEET EDITOR (FAST POWER-USER VIEW) ── */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden relative">
            {/* Top Form Row: Title & Type & Image */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Element Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="E.g., Outpost Alpha, Lord Vane..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs font-semibold outline-none"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Element Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeSelectChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-amber-300 p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
                  >
                    {ELEMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                {type === 'Property' && (
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                      Subcategory
                    </label>
                    <select
                      value={fields.propertySubcategory || element.propertySubcategory || 'gear'}
                      onChange={(e) =>
                        handleMergeFields({
                          propertySubcategory: e.target.value,
                          itemCategory: e.target.value
                        })
                      }
                      className="w-full bg-slate-950 border border-amber-500/50 focus:border-amber-400 text-amber-200 p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
                    >
                      {PROPERTY_SUBCATEGORIES.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.icon} {sub.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {type === 'Metaphysics' && (
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-violet-400 uppercase tracking-wider mb-1">
                      Subcategory
                    </label>
                    <select
                      value={fields.metaphysicsSubcategory || element.metaphysicsSubcategory || 'invocations'}
                      onChange={(e) =>
                        handleMergeFields({
                          metaphysicsSubcategory: e.target.value
                        })
                      }
                      className="w-full bg-slate-950 border border-violet-500/50 focus:border-violet-400 text-violet-200 p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
                    >
                      {METAPHYSICS_SUBCATEGORIES.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.icon} {sub.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Element Image Action */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  🖼️ Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                  title="Paste Image URL"
                >
                  🌐 URL
                </button>
                <button
                  type="button"
                  onClick={() => setIsArtistHubOpen(true)}
                  className="px-3 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  title="Generate Art Concept with Artist Hub"
                >
                  🎨 Artist Hub
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="px-2 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs font-bold cursor-pointer"
                    title="Remove Image"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            {/* URL Input Bar if opened */}
            {showUrlInput && (
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex gap-2">
                <input
                  type="url"
                  value={urlInputValue}
                  onChange={(e) => setUrlInputValue(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white p-2 rounded outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase rounded cursor-pointer"
                >
                  Set URL
                </button>
              </div>
            )}

            {/* Image Preview Banner if active */}
            {imageUrl && (
              <div className="p-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Element Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                />
                <span className="text-xs text-slate-400 font-mono truncate flex-1">
                  Image Attached ({imageUrl.substring(0, 50)}...)
                </span>
              </div>
            )}

            {/* Dynamic Tabs Header */}
            <div className="flex flex-wrap items-center border-b border-slate-800/80 bg-[#090d16] p-3 gap-2 shrink-0">
              {allTabs.map((tab, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTabIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                    activeTabIdx === idx
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/80 shadow-[0_0_12px_rgba(34,211,238,0.2)] ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/80 hover:border-slate-700/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Main Tab Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/60">
              {/* Tab: AIME 3-Tier Architecture (Default & Master View) */}
              {currentTab === 'AIME 3-Tier Architecture' && (
                <AimeThreeTierStack
                  elementType={type}
                  fields={fields}
                  onChangeField={handleFieldChange}
                  guidance={guidance}
                  onChangeGuidance={setGuidance}
                  assetHub={assetHub}
                  onChangeAssetHub={setAssetHub}
                  availableElements={elementsCatalog || []}
                  currentElementId={element?.id}
                  onOpenAimeGuidance={() => setIsAimeGuidanceOpen(true)}
                />
              )}

              {/* Tab: Narrative Prose & Lore */}
              {currentTab === 'Narrative Prose & Lore' && (
                <div className="space-y-2 h-full flex flex-col">
                  <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Detailed Description &amp; Narrative Notes
                  </label>
                  <div className="bg-slate-950 text-white rounded-lg border border-slate-700 overflow-hidden flex-1 min-h-[300px]">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      placeholder="Write detailed lore, background, secrets, or description..."
                      className="h-full flex flex-col text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Tab: Custom Fields */}
              {currentTab === 'Custom Fields' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      Custom Fields &amp; Key-Value Attributes
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>➕</span> Add Custom Field
                    </button>
                  </div>

                  {customFields.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                      No custom fields defined. Click &quot;+ Add Custom Field&quot; above to add unique properties.
                    </div>
                  ) : (
                    customFields.map((cf, idx) => (
                      <div
                        key={cf.id || idx}
                        className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={cf.label}
                            onChange={(e) => handleCustomFieldChange(cf.id, 'label', e.target.value)}
                            placeholder="Field Label (e.g. Danger Rating)"
                            className="bg-slate-900 border border-slate-700 text-cyan-300 p-1.5 rounded text-xs font-bold outline-none focus:border-cyan-400 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(cf.id)}
                            className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded font-bold cursor-pointer"
                            title="Remove Field"
                          >
                            ✕ Remove
                          </button>
                        </div>
                        <AutoExpandingElementTextarea
                          value={cf.value}
                          onChange={(e) => handleCustomFieldChange(cf.id, 'value', e.target.value)}
                          placeholder="Field value / description..."
                          className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-400"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-[#0d1117] border-t border-[#0D5C63]/60 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                <span>
                  Type: <strong className="text-slate-300">{type}</strong>
                </span>
                {isDirty && <span className="text-amber-400 font-bold">• Unsaved Changes</span>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(34,211,238,0.25)] cursor-pointer"
                >
                  💾 Save Element Changes
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {isArtistHubOpen && (
        <ArtistHubModal
          isOpen={isArtistHubOpen}
          onClose={() => setIsArtistHubOpen(false)}
          initialPrompt={buildArtistHubVisualBrief(currentDraft)}
          elementContext={currentDraft}
          onApplyAsset={(asset) => {
            if (asset?.url || asset?.imageUrl) {
              setImageUrl(asset.url || asset.imageUrl);
            }
            if (asset?.prompt && !fields.summary) {
              handleFieldChange('summary', asset.prompt.substring(0, 160));
            }
          }}
        />
      )}

      {isAimeGuidanceOpen && (
        <AimeGuidanceFlyout
          isOpen={isAimeGuidanceOpen}
          onClose={() => setIsAimeGuidanceOpen(false)}
          targetType={
            currentTab.includes('Script')
              ? 'VttScript'
              : currentTab.includes('Relations')
              ? 'Relations'
              : type === 'Persona'
              ? 'Persona'
              : 'Story'
          }
          contextData={{
            title,
            type,
            fields,
            content
          }}
          onApplyGuidance={(suggestion) => {
            if (!content) {
              setContent(suggestion);
            } else if (!fields.summary) {
              handleFieldChange('summary', suggestion.slice(0, 200));
            }
          }}
        />
      )}
    </div>
  );
};

export default EditElementModal;
