import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  getTypePillStyle,
  getElementFileExtension,
  normalizeElementType
} from './elementSchemas';
import DOMPurify from 'dompurify';
import { formatAimeProseToHtml } from '../AIME/aimeTextUtils';
import { downloadAimeAssetFile } from '../../../services/aimeAssetFileService';
import { attachCreatorTag } from '../../../utils/creatorUtils';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { showToast } from '../../../context/ToastContext';
import { useStory } from '../../../context/CampaignContext';
import { useDBM } from '../../../context/DBMContext';
import { useFolio } from '../../../context/FolioContext';
import { useAuth } from '../../../context/AuthContext';
import { buildUnifiedAdeCatalog, resolveTargetCortexCollection } from '../../../utils/cortexAdeAssetBridge';
import { uploadAdeImageAsset } from '../../../services/adeMediaStorageService';
import GuidedForgeShell from '../../../components/StoryFoundry/GuidedForge/GuidedForgeShell';
import EditElementModalHeader from './components/EditElementModalHeader';
import EditElementSheetModeBody from './components/EditElementSheetModeBody';
import {
  getPlaybookForType,
  computeGuidedElementReadiness,
  parseChipKeywords,
  GUIDED_ELEMENT_STAGE_IDS
} from './guided/elementPlaybooks';
import { buildArtistHubVisualBrief } from './guided/guidedElementAiService';
import { buildArtistConceptPatch } from '../../../services/artistHubFramework';

const ArtistHubModal = React.lazy(() =>
  import('../../../components/StoryFoundry/ArtistHubModal').then((m) => ({
    default: m.ArtistHubModal || m.default
  }))
);
const AimeGuidanceFlyout = React.lazy(() =>
  import('../../../components/StoryFoundry/AimeGuidanceFlyout').then((m) => ({
    default: m.AimeGuidanceFlyout || m.default
  }))
);
const Stage1SparkAndCanon = React.lazy(() => import('./guided/stages/Stage1SparkAndCanon'));
const Stage2DirectorialLens = React.lazy(() => import('./guided/stages/Stage2DirectorialLens'));
const Stage3CoreReality = React.lazy(() => import('./guided/stages/Stage3CoreReality'));
const Stage4TacticalSystems = React.lazy(() => import('./guided/stages/Stage4TacticalSystems'));
const Stage5WebAndFinalize = React.lazy(() => import('./guided/stages/Stage5WebAndFinalize'));
import { ModifierService } from '../../../services/modifierService';
import { AudioService } from '../../../services/audioService';
import { lintCanonContent } from '../../../services/canonRulesLinterService';
import {
  listCustomTemplates,
  saveCustomTemplate,
  applyCustomTemplate,
  deleteCustomTemplate
} from '../../../services/customElementTemplateService';
import { useDirtyModalClose } from '../../../hooks/useDirtyModalClose';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const LazyElementSelectorModal = React.lazy(() => import('./ElementSelectorModal'));

const EditElementModal = ({
  isOpen,
  onClose,
  element,
  onSave,
  onDelete,
  onDeleteCortex,
  initialMode,
  initialSeedTab = 'spark',
  activeScenario = null,
  zIndexClass = 'z-[200]'
}) => {
  const navigate = useNavigate();
  const {
    deleteSavedElement,
    elementsCatalog,
    universeState,
    setUniverseState,
    setIsDirty: setCampaignDirty,
    mapsCatalog,
    cronicle,
    updateStory,
    addGalleryModifier,
    isStoryReadOnly = false
  } = useStory();
  const { dbData = {} } = useDBM() || {};
  const {
    roster: folioRoster = [],
    personaRoster = [],
    publicPersonas = [],
    publicCatalog = [],
    saveCurrentToRoster,
    switchRosterCharacter
  } = useFolio() || {};
  const { currentUser, isAdmin = false } = useAuth() || {};

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
  const [isPublicElement, setIsPublicElement] = useState(false);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [narrativeSectionId, setNarrativeSectionId] = useState('profile');

  const [linkToActiveScenario, setLinkToActiveScenario] = useState(false);
  const [registerModifierOnSave, setRegisterModifierOnSave] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState(() => listCustomTemplates(universeState));

  useEffect(() => {
    if (!isOpen) return;
    const next = listCustomTemplates(universeState);
    setSavedTemplates((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [isOpen, universeState?.customTemplates]);

  const handleSaveAsTemplate = () => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before modifying blueprint templates.' });
      return;
    }
    const rawTags = typeof fields.tags === 'string'
      ? fields.tags.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const { template, templates } = saveCustomTemplate(
      {
        name: `${(title || type || 'Element').trim()} Template`,
        type,
        description: fields.summary || '',
        content,
        imageUrl,
        guidance,
        assetHub,
        customFields,
        attributes: { ...fields },
        tags: rawTags
      },
      universeState,
      (nextTemplates) => {
        setUniverseState?.((prev) => ({
          ...prev,
          customTemplates: nextTemplates
        }));
        setCampaignDirty?.(true);
      }
    );
    setSavedTemplates(templates);
    showToast({ type: 'success', text: `Saved blueprint template: "${template.name}"` });
  };

  const handleApplyCustomTemplate = (template) => {
    if (!template) return;
    const merged = applyCustomTemplate(template, {
      type,
      description: fields.summary || '',
      content,
      imageUrl,
      guidance,
      assetHub,
      customFields,
      attributes: { ...fields }
    });
    if (merged.type) setType(merged.type);
    if (merged.content && !content) setContent(merged.content);
    if (merged.imageUrl && !imageUrl) setImageUrl(merged.imageUrl);
    if (merged.guidance) setGuidance(merged.guidance);
    if (Array.isArray(merged.assetHub) && merged.assetHub.length > 0 && assetHub.length === 0) {
      setAssetHub(merged.assetHub);
    }
    if (Array.isArray(merged.customFields) && merged.customFields.length > 0 && customFields.length === 0) {
      setCustomFields(merged.customFields);
    }
    if (merged.attributes) {
      setFields((prev) => ({ ...prev, ...merged.attributes }));
    }
    showToast({ type: 'info', text: `Applied template "${template.name}"` });
  };

  const handleDeleteCustomTemplate = (templateId) => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before modifying blueprint templates.' });
      return;
    }
    if (!templateId) return;
    const next = deleteCustomTemplate(templateId, universeState, (nextTemplates) => {
      setUniverseState?.((prev) => ({
        ...prev,
        customTemplates: nextTemplates
      }));
      setCampaignDirty?.(true);
    });
    setSavedTemplates(next);
    showToast({ type: 'info', text: 'Deleted saved blueprint template.' });
  };

  const [pendingType, setPendingType] = useState(null);
  const [showTypeConfirm, setShowTypeConfirm] = useState(false);
  const [typeChangedFromOrigin, setTypeChangedFromOrigin] = useState(false);

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isArtistHubOpen, setIsArtistHubOpen] = useState(false);
  const [isAimeGuidanceOpen, setIsAimeGuidanceOpen] = useState(false);
  const [isCanonOpen, setIsCanonOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [relationalSelectorState, setRelationalSelectorState] = useState(null);
  const [pendingStage3Diffs, setPendingStage3Diffs] = useState([]);
  const [pendingStage3ProseDiff, setPendingStage3ProseDiff] = useState('');
  const fileMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const handleSubmitRef = useRef(null);
  const lastHydratedKeyRef = useRef(null);

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
    if (!isOpen) {
      lastHydratedKeyRef.current = null;
      setPendingStage3Diffs([]);
      setPendingStage3ProseDiff('');
      return;
    }
    if (!element) return;
    const hydrationKey = `${element.id || 'new'}::${element.createdAt || ''}::${initialMode || ''}::${initialSeedTab || ''}`;
    if (lastHydratedKeyRef.current === hydrationKey) {
      return;
    }
    lastHydratedKeyRef.current = hydrationKey;

    const normalizedType = normalizeElementType(element.type || 'Persona');
    const incomingFields = element.fields || {};
    const DEFAULT_SEED_KEYS = new Set([
      'propertySubcategory',
      'itemCategory',
      'personaSubcategory',
      'metaphysicsSubcategory'
    ]);
    const hasMeaningfulIncomingFields = Object.entries(incomingFields).some(
      ([k, v]) => !DEFAULT_SEED_KEYS.has(k) && v !== undefined && v !== null && String(v).trim() !== ''
    );
    const isBlankElement =
      !element.title &&
      !element.content &&
      !hasMeaningfulIncomingFields;

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
    setIsPublicElement(Boolean(element.isPublic));
    setActiveTabIdx(0);
    setActiveStageId('spark');
    setEditorMode(initialMode || (isBlankElement ? 'guided' : 'sheet'));
    setLinkToActiveScenario(false);
    setRegisterModifierOnSave(false);
    setPendingType(null);
    setShowTypeConfirm(false);
    setTypeChangedFromOrigin(false);
    setPendingStage3Diffs([]);
    setPendingStage3ProseDiff('');
  }, [element, isOpen, initialMode, initialSeedTab]);

  const isDirty = useMemo(() => {
    if (!element) return false;
    return (
      (title || '') !== (element.title || '') ||
      normalizeElementType(type || 'Persona') !== normalizeElementType(element.type || 'Persona') ||
      (content || '') !== (element.content || '') ||
      (imageUrl || '') !== (element.imageUrl || '') ||
      Boolean(isPublicElement) !== Boolean(element.isPublic) ||
      JSON.stringify(fields || {}) !== JSON.stringify(element.fields || {}) ||
      JSON.stringify(customFields || []) !== JSON.stringify(element.customFields || []) ||
      JSON.stringify(guidance || {}) !== JSON.stringify(element.guidance || {}) ||
      JSON.stringify(assetHub || []) !== JSON.stringify(element.assetHub || element.linkedElements || [])
    );
  }, [element, title, type, content, imageUrl, isPublicElement, fields, customFields, guidance, assetHub]);

  const { handleRequestClose, handleBackdropClick } = useDirtyModalClose({
    isOpen: isOpen && !isArtistHubOpen && !isAimeGuidanceOpen && !relationalSelectorState && !showTypeConfirm,
    isDirty,
    onClose,
    title: 'Discard Element Edits?',
    message: `You have unsaved changes in "${title || element?.title || 'this element'}". Discard changes and close?`
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmitRef.current?.();
        return;
      }
      if (e.key === 'Escape') {
        if (showTypeConfirm) {
          e.stopPropagation();
          setPendingType(null);
          setShowTypeConfirm(false);
        } else if (isFileMenuOpen) {
          e.stopPropagation();
          setIsFileMenuOpen(false);
        } else if (isCanonOpen) {
          e.stopPropagation();
          setIsCanonOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, showTypeConfirm, isFileMenuOpen, isCanonOpen]);

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
  const canonDiagnostics = useMemo(
    () =>
      lintCanonContent({
        text: [
          content,
          fields?.summary,
          fields?.oneLinePitch,
          fields?.description,
          fields?.mechanic,
          fields?.readAloud,
          fields?.cast_time,
          fields?.sceneBeats
        ]
          .filter(Boolean)
          .join(' '),
        element: currentDraft,
        knownTitles: (elementsCatalog || []).map((e) => e?.title || e?.name).filter(Boolean),
        isCreationPhase: Number(fields?.mcmTier ?? 1) <= 1 && !element?.updatedAt
      }),
    [
      content,
      fields?.summary,
      fields?.oneLinePitch,
      fields?.description,
      fields?.mechanic,
      fields?.readAloud,
      fields?.cast_time,
      fields?.sceneBeats,
      fields?.mcmTier,
      element?.updatedAt,
      currentDraft,
      elementsCatalog
    ]
  );

  const allMapsList = useMemo(() => {
    const merged = [...(universeState?.maps || []), ...(mapsCatalog || [])];
    const seen = new Set();
    return merged.filter((m) => {
      if (!m || !m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [universeState?.maps, mapsCatalog]);

  const unifiedAssetCatalog = useMemo(() => {
    const effectiveRoster = Array.isArray(folioRoster) && folioRoster.length > 0 ? folioRoster : personaRoster;
    const effectivePublic = Array.isArray(publicPersonas) && publicPersonas.length > 0 ? publicPersonas : publicCatalog;
    return buildUnifiedAdeCatalog({
      elementsCatalog: elementsCatalog || [],
      dbData: dbData || {},
      folioRoster: effectiveRoster || [],
      publicPersonas: effectivePublic || []
    });
  }, [elementsCatalog, dbData, folioRoster, personaRoster, publicPersonas, publicCatalog]);

  const explicitPersonaTrack = fields?.personaSubcategory;
  const isFolioOrigin = Boolean(
    !typeChangedFromOrigin &&
      (explicitPersonaTrack === 'mcm' || explicitPersonaTrack === 'story'
        ? false
        : element?.isFolioPersona ||
          element?.personaSubcategory === 'folio' ||
          element?.fields?.personaSubcategory === 'folio' ||
          explicitPersonaTrack === 'folio')
  );
  const isCortexOrigin = Boolean(
    !typeChangedFromOrigin &&
      !isFolioOrigin &&
      (element?.isCortexAsset || element?.fields?.dbmRef || element?.dbmRef || element?.dbmId)
  );
  const isModulePinnedOrigin = Boolean(element?.isPinnedToModule || element?.moduleElementId);

  const resolvedSaveDestination = useMemo(() => {
    if (!element) {
      return { label: 'Campaign Story Module', tone: 'emerald' };
    }
    if (type === 'Persona' && isFolioOrigin) {
      return { label: 'Persona Folio', tone: 'purple' };
    }
    const effectiveDraft = typeChangedFromOrigin
      ? { ...currentDraft, isFolioPersona: false, isCortexAsset: false, dbmCategory: undefined, dbmId: undefined }
      : { ...element, ...currentDraft };
    const targetCol = resolveTargetCortexCollection(effectiveDraft);
    if (targetCol) {
      return isAdmin
        ? { label: `OmniCortex Canon (${targetCol}) • Admin`, tone: 'cyan' }
        : { label: 'Campaign Module (Local Override)', tone: 'amber' };
    }
    return { label: 'Campaign Story Module', tone: 'emerald' };
  }, [type, isFolioOrigin, typeChangedFromOrigin, currentDraft, element, isAdmin]);

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
      text: `Exported ${title || 'element'} as portable ${getElementFileExtension(type, fields?.propertySubcategory)} asset!`
    });
    setIsFileMenuOpen(false);
  };

  const handleDuplicateElement = async () => {
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before duplicating elements.' });
      return;
    }
    const deepClone = (val, fallback) => {
      try {
        return JSON.parse(JSON.stringify(val ?? fallback));
      } catch {
        return fallback;
      }
    };
    const clonedFields = deepClone(fields, {});
    delete clonedFields.dbmRef;
    delete clonedFields.dbmId;
    delete clonedFields.dbmCategory;
    delete clonedFields['character-doc-id'];
    if (clonedFields.personaSubcategory === 'folio') {
      clonedFields.personaSubcategory = 'story';
    }

    const cloned = {
      ...element,
      id: `elem_${Date.now()}_${uuidv4().slice(0, 6)}`,
      title: `${title || element.title || 'Untitled'} (Copy)`,
      type,
      fields: clonedFields,
      content,
      customFields: deepClone(customFields, []),
      guidance: deepClone(guidance, {}),
      assetHub: deepClone(assetHub, []),
      dbmSyncStatus: 'standalone',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    delete cloned.dbmRef;
    delete cloned.dbmId;
    delete cloned.dbmCategory;
    delete cloned.cortexRaw;
    delete cloned.isCortexAsset;
    delete cloned.codexMatrixId;
    delete cloned.isFolioPersona;
    delete cloned.folioDocId;
    delete cloned.personaData;
    delete cloned.sourceOrigin;
    delete cloned.isPinnedToModule;
    delete cloned.moduleElementId;
    if (cloned.personaSubcategory === 'folio') {
      cloned.personaSubcategory = 'story';
    }

    const withCreator = attachCreatorTag(cloned, localStorage.getItem('userHandle'), currentUser);
    const saved = onSave ? await onSave(withCreator, { closeAfter: false }) : withCreator;
    if (saved === false || saved === null) return;
    showToast({ type: 'success', text: `Duplicated "${cloned.title}" as a standalone Story Module element!` });
    setIsFileMenuOpen(false);
    onClose();
  };

  const handleDeleteElement = async () => {
    setIsFileMenuOpen(false);
    if ((isCortexOrigin || isFolioOrigin) && isModulePinnedOrigin) {
      if (isStoryReadOnly) {
        showToast({ type: 'warning', text: 'Read-only story: unlock or clone project before unpinning elements.' });
        return;
      }
      const targetModuleId = element.moduleElementId || element.id;
      const ok = onDelete
        ? await onDelete(targetModuleId)
        : deleteSavedElement
        ? await deleteSavedElement(targetModuleId)
        : false;
      if (ok !== false) {
        showToast({ type: 'info', text: `Unpinned "${title || element.title}" from Story Module (canonical record preserved).` });
        onClose();
      }
      return;
    }

    if (isCortexOrigin && !isModulePinnedOrigin) {
      if (!isAdmin || typeof onDeleteCortex !== 'function') {
        showToast({ type: 'warning', text: 'Admin clearance required to delete canonical OmniCortex entries.' });
        return;
      }
      const targetName = title || element.title || 'Untitled Asset';
      if (await confirmTypedDeletion(targetName, `canonical OmniCortex ${(element.dbmCategory || type || 'entry').toLowerCase()} (GLOBAL)`)) {
        const ok = await onDeleteCortex(element);
        if (ok !== false) {
          showToast({ type: 'info', text: `Deleted canonical OmniCortex entry "${targetName}".` });
          onClose();
        }
      }
      return;
    }

    if (isFolioOrigin && !isModulePinnedOrigin) {
      showToast({ type: 'info', text: 'Unpinned Persona Folio characters can only be removed from Persona Folio.' });
      return;
    }

    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone project before deleting elements.' });
      return;
    }
    const targetName = title || element.title || 'Untitled Element';
    const itemDescriptor = type ? type.toLowerCase() : 'element';
    if (await confirmTypedDeletion(targetName, itemDescriptor)) {
      const ok = onDelete
        ? await onDelete(element.id)
        : deleteSavedElement
        ? await deleteSavedElement(element.id)
        : false;
      if (ok !== false) {
        showToast({ type: 'info', text: `Deleted ${targetName}.` });
        onClose();
      }
    }
  };

  const UNIVERSAL_CROSS_TYPE_KEYS = [
    'summary',
    'tags',
    'keywords',
    'negative_keywords',
    'primaryTriggers',
    'secondaryTriggers',
    'triggerRegex',
    'triggerLogic',
    'speakerFilter',
    'loreScanPriority',
    'loreBudgetTokens',
    'loreRequireCondition',
    'loreSuppressCondition'
  ];

  const buildPreservedFieldsOnTypeChange = (prevFields = {}, nextType) => {
    const preserved = {};
    for (const k of UNIVERSAL_CROSS_TYPE_KEYS) {
      if (prevFields[k] !== undefined && prevFields[k] !== '') {
        preserved[k] = prevFields[k];
      }
    }
    if (nextType === 'Property') {
      preserved.propertySubcategory = 'gear';
      preserved.itemCategory = 'gear';
    } else if (nextType === 'Metaphysics') {
      preserved.metaphysicsSubcategory = 'invocations';
    } else if (nextType === 'Persona') {
      preserved.personaSubcategory = 'story';
    }
    return preserved;
  };

  const handleTypeSelectChange = (newType, options = {}) => {
    const normalizedNext = normalizeElementType(newType);
    if (normalizedNext === type) return;

    const DEFAULT_SEED_KEYS = new Set([
      'propertySubcategory',
      'itemCategory',
      'personaSubcategory',
      'metaphysicsSubcategory'
    ]);
    const hasPopulatedFields = Object.entries(fields || {}).some(
      ([k, v]) => !DEFAULT_SEED_KEYS.has(k) && v !== undefined && v !== null && String(v).trim() !== ''
    );

    if (options.silent || !hasPopulatedFields) {
      setType(normalizedNext);
      if (!options.silent || isCortexOrigin || isFolioOrigin) {
        setFields((prev) => buildPreservedFieldsOnTypeChange(prev, normalizedNext));
        setDbmSyncStatus('standalone');
        setTypeChangedFromOrigin(true);
      }
      setActiveTabIdx(0);
      return;
    }

    setPendingType(normalizedNext);
    setShowTypeConfirm(true);
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      setType(pendingType);
      setFields((prev) => buildPreservedFieldsOnTypeChange(prev, pendingType));
      setDbmSyncStatus('standalone');
      setTypeChangedFromOrigin(true);
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
    if (key === 'content' || key === 'narrativeProse') {
      setContent(String(val ?? ''));
    } else if (key === 'guidance' && val && typeof val === 'object') {
      setGuidance(val);
      if (fields?.dbmRef && dbmSyncStatus === 'synced') {
        setDbmSyncStatus('local_override');
      }
      return;
    } else if (key === 'customFields' && Array.isArray(val)) {
      setCustomFields(val);
      if (fields?.dbmRef && dbmSyncStatus === 'synced') {
        setDbmSyncStatus('local_override');
      }
      return;
    }
    if (fields?.dbmRef && key !== 'dbmRef' && key !== 'dbmCategory' && dbmSyncStatus === 'synced') {
      setDbmSyncStatus('local_override');
    }
    setFields((prev) => ({ ...prev, [key]: val }));
  };

  const handleMergeFields = (patch = {}) => {
    if (!patch || typeof patch !== 'object') return;
    const { guidance: nextGuidance, customFields: nextCustomFields, ...fieldPatch } = patch;
    if (fieldPatch.content !== undefined || fieldPatch.narrativeProse !== undefined) {
      setContent(String(fieldPatch.content ?? fieldPatch.narrativeProse ?? ''));
    }
    if (nextGuidance && typeof nextGuidance === 'object') {
      setGuidance(nextGuidance);
    }
    if (Array.isArray(nextCustomFields)) {
      setCustomFields(nextCustomFields);
    }
    if (fields?.dbmRef && dbmSyncStatus === 'synced') {
      setDbmSyncStatus('local_override');
    }
    if (Object.keys(fieldPatch).length > 0) {
      setFields((prev) => ({ ...prev, ...fieldPatch }));
    }
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

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast({ type: 'warning', text: 'Please select a valid image file.' });
      return;
    }
    setIsUploadingImage(true);
    try {
      const uploaded = await uploadAdeImageAsset(file, {
        userId: currentUser?.uid || null,
        assetCategory: 'elements',
        fileName: file.name
      });
      if (uploaded?.url) {
        setImageUrl(uploaded.url);
        if (uploaded.warning) {
          showToast({ type: 'warning', text: uploaded.warning });
        } else {
          showToast({
            type: 'success',
            text: uploaded.offloaded ? 'Uploaded & optimized element image to Cloud Storage.' : 'Image sanitized & attached.'
          });
        }
      }
    } catch (err) {
      showToast({
        type: 'error',
        text: err?.message || 'Blocked or invalid image file.'
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isSafeImageUrl = (raw) => {
    const trimmed = String(raw || '').trim();
    if (!trimmed) return false;
    if (/^data:image\/(?:png|jpe?g|webp|gif|avif);base64,/i.test(trimmed)) return true;
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    const trimmed = urlInputValue.trim();
    if (!trimmed) return;
    if (!isSafeImageUrl(trimmed)) {
      showToast({ type: 'warning', text: 'Please enter a valid http(s):// URL or raster data:image/ URI.' });
      return;
    }
    setImageUrl(trimmed);
    setUrlInputValue('');
    setShowUrlInput(false);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (isStoryReadOnly) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before saving elements.' });
      return;
    }
    if (!title.trim()) {
      showToast({ type: 'warning', text: 'Element title is required (Stage 1).' });
      if (editorMode === 'guided') setActiveStageId('spark');
      return;
    }

    const validCustomFields = customFields
      .map((f) => ({ ...f, label: f.label ? f.label.trim() : '' }))
      .filter((f) => f.label && f.label !== '')
      .map((f) => ({ id: f.id || uuidv4(), label: f.label, value: f.value || '' }));

    const resolvedId = element?.id || `elem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cleanedFields = { ...(fields || {}) };
    if (typeChangedFromOrigin) {
      delete cleanedFields.dbmRef;
      delete cleanedFields.dbmId;
      delete cleanedFields.dbmCategory;
      delete cleanedFields['character-doc-id'];
    }
    const switchedAwayFromFolio =
      type === 'Persona' &&
      (cleanedFields.personaSubcategory === 'mcm' || cleanedFields.personaSubcategory === 'story');
    const baseElement =
      typeChangedFromOrigin || switchedAwayFromFolio
        ? (() => {
            const copy = { ...element };
            delete copy.isFolioPersona;
            delete copy.folioDocId;
            if (typeChangedFromOrigin) {
              delete copy.dbmRef;
              delete copy.dbmId;
              delete copy.dbmCategory;
              delete copy.cortexRaw;
              delete copy.isCortexAsset;
              delete copy.codexMatrixId;
              delete copy.personaData;
              delete copy.sourceOrigin;
            }
            return copy;
          })()
        : { ...element };

    const rawUpdatedElement = {
      ...baseElement,
      id: resolvedId,
      type,
      ...(type === 'Property'
        ? { propertySubcategory: cleanedFields.propertySubcategory || baseElement.propertySubcategory || 'gear' }
        : {}),
      ...(type === 'Metaphysics'
        ? { metaphysicsSubcategory: cleanedFields.metaphysicsSubcategory || baseElement.metaphysicsSubcategory || 'invocations' }
        : {}),
      ...(type === 'Persona'
        ? { personaSubcategory: cleanedFields.personaSubcategory || baseElement.personaSubcategory || 'story' }
        : {}),
      title: title.trim(),
      content,
      imageUrl,
      dbmSyncStatus: typeChangedFromOrigin ? 'standalone' : dbmSyncStatus,
      fields: cleanedFields,
      customFields: validCustomFields,
      guidance,
      assetHub,
      linkedElements: (assetHub || []).map((a) => a.assetId || a),
      isPublic: Boolean(isPublicElement),
      storyId: element?.storyId ?? universeState?.id ?? null,
      updatedAt: new Date().toISOString()
    };
    const updatedElement = attachCreatorTag(rawUpdatedElement, localStorage.getItem('userHandle'), currentUser);

    const savedResult = typeof onSave === 'function' ? await onSave(updatedElement, { closeAfter: false }) : updatedElement;
    if (savedResult === false || savedResult === null) {
      return;
    }
    const finalElement = savedResult?.id ? savedResult : updatedElement;

    // Optional Post-Save Bridge 1: Derive Situational Modifier into Story Gallery
    if (registerModifierOnSave && typeof addGalleryModifier === 'function') {
      let derivedMod = null;
      if (type === 'Persona') {
        derivedMod = ModifierService.createModifierFromPerson(finalElement);
      } else if (type === 'Item' || type === 'Property' || type === 'Metaphysics') {
        derivedMod = ModifierService.createModifierFromItem(finalElement);
      } else if (type === 'Setting') {
        derivedMod = ModifierService.createModifierFromLocation(finalElement);
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
      !isStoryReadOnly &&
      linkToActiveScenario &&
      activeScenario?.id &&
      typeof updateStory === 'function'
    ) {
      const existingHub = Array.isArray(activeScenario.assetHub) ? activeScenario.assetHub : [];
      const alreadyInHub = existingHub.some(
        (a) => (typeof a === 'string' ? a : a.assetId) === finalElement.id
      );
      const nextHub = alreadyInHub
        ? existingHub
        : [
            ...existingHub,
            {
              assetId: finalElement.id,
              assetTitle: finalElement.title,
              assetType: finalElement.type,
              importance: 'high',
              annotation: 'Linked from Guided Element Forge'
            }
          ];
      const existingIds = Array.isArray(activeScenario.linkedElements) ? activeScenario.linkedElements : [];
      const nextIds = existingIds.includes(finalElement.id)
        ? existingIds
        : [...existingIds, finalElement.id];

      updateStory(activeScenario.id, {
        assetHub: nextHub,
        linkedElements: nextIds
      });
      showToast({
        type: 'info',
        text: `Linked "${finalElement.title}" to scenario "${activeScenario.title || activeScenario.name}"!`
      });
    }

    onClose();
  };
  handleSubmitRef.current = handleSubmit;

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
  } else if (
    playbook.family === 'relic' &&
    (fields.costCr !== undefined ||
      fields.techLevel !== undefined ||
      fields['tech-level'] !== undefined ||
      fields.tech_level !== undefined)
  ) {
    const resolvedTl = fields.techLevel ?? fields['tech-level'] ?? fields.tech_level ?? 3;
    const resolvedCr = fields.costCr ?? fields.craft_dc ?? 12;
    tacticalPreviewBadge = `TL-${resolvedTl} ${fields.rarity || ''} • CR ${resolvedCr}`;
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

  const modalNode = (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 ${zIndexClass} flex items-start justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 pt-4 sm:pt-8 pb-6 overflow-y-auto font-sans text-slate-200`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ? `Edit ${title}` : `Edit ${type}`}
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

        <EditElementModalHeader
          editorMode={editorMode}
          setEditorMode={setEditorMode}
          type={type}
          title={title}
          element={element}
          fields={fields}
          imageUrl={imageUrl}
          content={content}
          customFields={customFields}
          guidance={guidance}
          assetHub={assetHub}
          saveCurrentToRoster={saveCurrentToRoster}
          switchRosterCharacter={switchRosterCharacter}
          onClose={onClose}
          navigate={navigate}
          showToast={showToast}
          fileMenuRef={fileMenuRef}
          isFileMenuOpen={isFileMenuOpen}
          setIsFileMenuOpen={setIsFileMenuOpen}
          handleSubmit={handleSubmit}
          handleExportElement={handleExportElement}
          handleDuplicateElement={handleDuplicateElement}
          handleDeleteElement={handleDeleteElement}
          isFolioOrigin={isFolioOrigin}
          isCortexOrigin={isCortexOrigin}
          isModulePinnedOrigin={isModulePinnedOrigin}
          isAdmin={isAdmin}
          onDeleteCortex={onDeleteCortex}
          isCanonOpen={isCanonOpen}
          setIsCanonOpen={setIsCanonOpen}
          canonDiagnostics={canonDiagnostics}
          setContent={setContent}
          setFields={setFields}
          dbmSyncStatus={dbmSyncStatus}
          setDbmSyncStatus={setDbmSyncStatus}
          setIsAimeGuidanceOpen={setIsAimeGuidanceOpen}
          isStoryReadOnly={isStoryReadOnly}
          isPublicElement={isPublicElement}
          setIsPublicElement={setIsPublicElement}
          handleRequestClose={handleRequestClose}
          showTypeConfirm={showTypeConfirm}
          pendingType={pendingType}
          cancelTypeChange={cancelTypeChange}
          confirmTypeChange={confirmTypeChange}
        />

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
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${
                    resolvedSaveDestination.tone === 'cyan'
                      ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-200'
                      : resolvedSaveDestination.tone === 'amber'
                      ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                      : resolvedSaveDestination.tone === 'purple'
                      ? 'bg-purple-950/80 border-purple-500/40 text-purple-200'
                      : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  Saves to {resolvedSaveDestination.label}
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
                  disabled={isStoryReadOnly}
                  onClick={handleSaveAsTemplate}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-indigo-500/50 text-indigo-200 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Save current element configuration as a reusable Custom Blueprint Template"
                >
                  Save Template
                </button>

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
            <Suspense fallback={<div className="p-6 text-xs font-mono text-cyan-400">Loading editor stage...</div>}>
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
                elementsCatalog={unifiedAssetCatalog}
                customTemplates={savedTemplates}
                onApplyCustomTemplate={handleApplyCustomTemplate}
                onDeleteCustomTemplate={handleDeleteCustomTemplate}
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
                pendingDiffs={pendingStage3Diffs}
                onChangePendingDiffs={setPendingStage3Diffs}
                pendingProseDiff={pendingStage3ProseDiff}
                onChangePendingProseDiff={setPendingStage3ProseDiff}
                elementsCatalog={unifiedAssetCatalog}
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
                elementsCatalog={unifiedAssetCatalog}
                imageUrl={imageUrl}
                onUploadImageClick={() => !isUploadingImage && fileInputRef.current?.click()}
                onSetImageUrl={(nextUrl) => {
                  const trimmed = String(nextUrl || '').trim();
                  if (!trimmed) {
                    setImageUrl('');
                    return true;
                  }
                  if (!isSafeImageUrl(trimmed)) {
                    showToast({ type: 'warning', text: 'Please enter a valid http(s):// URL or raster data:image/ URI.' });
                    return false;
                  }
                  setImageUrl(trimmed);
                  return true;
                }}
                onOpenArtistHub={() => setIsArtistHubOpen(true)}
                activeScenario={activeScenario}
                linkToActiveScenario={linkToActiveScenario}
                onToggleLinkToScenario={setLinkToActiveScenario}
              />
            )}
            </Suspense>
          </GuidedForgeShell>
        ) : (
          <EditElementSheetModeBody
            handleSubmit={handleSubmit}
            title={title}
            setTitle={setTitle}
            type={type}
            handleTypeSelectChange={handleTypeSelectChange}
            fields={fields}
            element={element}
            handleMergeFields={handleMergeFields}
            handleFieldChange={handleFieldChange}
            isUploadingImage={isUploadingImage}
            fileInputRef={fileInputRef}
            showUrlInput={showUrlInput}
            setShowUrlInput={setShowUrlInput}
            urlInputValue={urlInputValue}
            setUrlInputValue={setUrlInputValue}
            handleUrlSubmit={handleUrlSubmit}
            setIsArtistHubOpen={setIsArtistHubOpen}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            allTabs={allTabs}
            activeTabIdx={activeTabIdx}
            setActiveTabIdx={setActiveTabIdx}
            currentTab={currentTab}
            content={content}
            setContent={setContent}
            customFields={customFields}
            guidance={guidance}
            setGuidance={setGuidance}
            assetHub={assetHub}
            setAssetHub={setAssetHub}
            unifiedAssetCatalog={unifiedAssetCatalog}
            setRelationalSelectorState={setRelationalSelectorState}
            setIsAimeGuidanceOpen={setIsAimeGuidanceOpen}
            narrativeSectionId={narrativeSectionId}
            setNarrativeSectionId={setNarrativeSectionId}
            handleAddCustomField={handleAddCustomField}
            handleCustomFieldChange={handleCustomFieldChange}
            handleRemoveCustomField={handleRemoveCustomField}
            resolvedSaveDestination={resolvedSaveDestination}
            isDirty={isDirty}
            isStoryReadOnly={isStoryReadOnly}
            handleSaveAsTemplate={handleSaveAsTemplate}
            handleRequestClose={handleRequestClose}
          />
        )}
      </div>

      {isArtistHubOpen && (
        <Suspense fallback={null}>
          <ArtistHubModal
            isOpen={isArtistHubOpen}
            onClose={() => setIsArtistHubOpen(false)}
            initialPrompt={buildArtistHubVisualBrief(currentDraft)}
            elementContext={currentDraft}
            onApplyAsset={(asset) => {
              const patch = buildArtistConceptPatch(currentDraft, asset);
              if (patch.imageUrl) {
                setImageUrl(patch.imageUrl);
              }
              if (patch.fields && Object.keys(patch.fields).length > 0) {
                handleMergeFields(patch.fields);
              }
              if (!content && (patch.content || asset?.prompt)) {
                setContent(patch.content || asset.prompt);
              }
            }}
          />
        </Suspense>
      )}

      {isAimeGuidanceOpen && (
        <Suspense fallback={null}>
          <AimeGuidanceFlyout
            isOpen={isAimeGuidanceOpen}
            onClose={() => setIsAimeGuidanceOpen(false)}
            targetType={
              editorMode === 'guided'
                ? activeStageId === 'tactical' && type === 'Persona'
                  ? 'VttScript'
                  : activeStageId === 'web'
                  ? 'Relations'
                  : type === 'Persona'
                  ? 'Persona'
                  : 'Story'
                : String(currentTab || '').includes('Script')
                ? 'VttScript'
                : String(currentTab || '').includes('Relations')
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
              const rawText = String(suggestion || '').trim();
              if (!rawText) return;
              const sanitizedHtml = DOMPurify.sanitize(formatAimeProseToHtml(rawText));
              if (!content || !String(content).replace(/<[^>]+>/g, '').trim()) {
                setContent(sanitizedHtml);
                if (type === 'Persona') {
                  handleFieldChange('narrativeProse', sanitizedHtml);
                }
                showToast?.({ type: 'success', text: 'Applied AIME guidance to narrative body.' });
              } else if (!fields.summary) {
                const plainSummary = rawText.replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').trim();
                handleFieldChange('summary', plainSummary.slice(0, 200));
                showToast?.({ type: 'success', text: 'Applied AIME guidance to summary.' });
              } else {
                const base = String(content).trimEnd();
                const appendedHtml = `${base}<hr /><h3>AIME Guidance</h3>${sanitizedHtml}`;
                setContent(appendedHtml);
                if (type === 'Persona') {
                  handleFieldChange('narrativeProse', appendedHtml);
                }
                showToast?.({ type: 'success', text: 'Appended AIME guidance to narrative body.' });
              }
            }}
          />
        </Suspense>
      )}
      {relationalSelectorState && (
        <React.Suspense fallback={null}>
          <LazyElementSelectorModal
            isOpen={Boolean(relationalSelectorState)}
            onClose={() => setRelationalSelectorState(null)}
            sourceType={relationalSelectorState.dbSource}
            fieldLabel={relationalSelectorState.label}
            isMulti={false}
            onSelect={(selected) => {
              const chosen = Array.isArray(selected) ? selected[0] : selected;
              const label = typeof chosen === 'string' ? chosen : (chosen?.title || chosen?.name || '');
              handleFieldChange(relationalSelectorState.key, label);
              setRelationalSelectorState(null);
            }}
          />
        </React.Suspense>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default EditElementModal;
