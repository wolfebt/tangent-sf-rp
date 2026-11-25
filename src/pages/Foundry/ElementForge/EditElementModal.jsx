import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  ELEMENT_TYPES,
  PROPERTY_SUBCATEGORIES,
  PERSONA_SUBCATEGORIES,
  METAPHYSICS_SUBCATEGORIES,
  getElementFileExtension,
  getTypePillStyle,
  normalizeElementType
} from './elementSchemas';
import DOMPurify from 'dompurify';
import { formatAimeProseToHtml } from '../AIME/aimeTextUtils';
import { downloadAimeAssetFile } from '../../../services/aimeAssetFileService';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { attachCreatorTag } from '../../../utils/creatorUtils';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { showToast } from '../../../context/ToastContext';
import { useStory } from '../../../context/CampaignContext';
import { useDBM } from '../../../context/DBMContext';
import { useFolio } from '../../../context/FolioContext';
import { useAuth } from '../../../context/AuthContext';
import { buildUnifiedAdeCatalog, resolveTargetCortexCollection } from '../../../utils/cortexAdeAssetBridge';
import { uploadAdeImageAsset } from '../../../services/adeMediaStorageService';
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
import { lintCanonContent, applyAutoFix } from '../../../services/canonRulesLinterService';
import {
  listCustomTemplates,
  saveCustomTemplate,
  applyCustomTemplate,
  deleteCustomTemplate
} from '../../../services/customElementTemplateService';
import { useDirtyModalClose } from '../../../hooks/useDirtyModalClose';
import {
  sendMcmToFolioRoster,
  convertPersonaElementToFolio,
  FOLIO_NARRATIVE_SECTIONS
} from '../../../utils/personaBridge';
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

const LazyElementSelectorModal = React.lazy(() => import('./ElementSelectorModal'));

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

  const isFolioOrigin = Boolean(
    !typeChangedFromOrigin &&
      (element?.isFolioPersona ||
        element?.personaSubcategory === 'folio' ||
        element?.fields?.personaSubcategory === 'folio' ||
        fields?.personaSubcategory === 'folio')
  );
  const isCortexOrigin = Boolean(
    !typeChangedFromOrigin &&
      !isFolioOrigin &&
      (element?.isCortexAsset || element?.fields?.dbmRef || element?.dbmRef || element?.dbmId)
  );
  const isModulePinnedOrigin = Boolean(element?.isPinnedToModule || element?.moduleElementId);

  const resolvedSaveDestination = useMemo(() => {
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
    const baseElement = typeChangedFromOrigin
      ? (() => {
          const copy = { ...element };
          delete copy.dbmRef;
          delete copy.dbmId;
          delete copy.dbmCategory;
          delete copy.cortexRaw;
          delete copy.isCortexAsset;
          delete copy.codexMatrixId;
          delete copy.isFolioPersona;
          delete copy.folioDocId;
          delete copy.personaData;
          delete copy.sourceOrigin;
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
                {type === 'Persona' && (
                  <div className="flex items-center gap-1.5">
                    {!element.isFolioPersona && (
                      <button
                        type="button"
                        onClick={() => {
                          const currentElementSnapshot = {
                            ...element,
                            title: title || element.title || 'Unnamed Persona',
                            type: 'Persona',
                            imageUrl,
                            content,
                            fields,
                            customFields,
                            guidance,
                            assetHub
                          };
                          const folioData = convertPersonaElementToFolio(currentElementSnapshot);
                          const sent = sendMcmToFolioRoster(folioData, {
                            lockForVtt: true,
                            openInFolio: false,
                            activateInFolio: false
                          });
                          showToast({
                            type: 'success',
                            text: `Sent "${sent['char-name'] || sent.character_name || title || 'Persona'}" to Persona Folio Roster!`
                          });
                        }}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-900 flex items-center gap-1 cursor-pointer"
                        title="Send this MCM / Story Persona to the Persona Folio Roster (VTT & Folio Ready)"
                      >
                        <span>🧬 Send to Folio</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        const currentElementSnapshot = {
                          ...element,
                          title: title || element.title || 'Unnamed Persona',
                          type: 'Persona',
                          imageUrl,
                          content,
                          fields,
                          customFields,
                          guidance,
                          assetHub
                        };
                        const folioData = convertPersonaElementToFolio(currentElementSnapshot);
                        if (element.isFolioPersona && typeof saveCurrentToRoster === 'function') {
                          const savedChar = await saveCurrentToRoster(folioData);
                          const targetDocId = savedChar?.['character-doc-id'] || folioData?.['character-doc-id'];
                          if (targetDocId && typeof switchRosterCharacter === 'function') {
                            switchRosterCharacter(targetDocId);
                          }
                        } else {
                          sendMcmToFolioRoster(folioData, {
                            lockForVtt: false,
                            openInFolio: true
                          });
                        }
                        onClose();
                        navigate('/folio');
                      }}
                      className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-200 hover:bg-purple-900 flex items-center gap-1 cursor-pointer"
                      title="Send & Open in Persona Folio to continue full character development"
                    >
                      <span>🪪 {element.isFolioPersona ? 'Open in Folio' : 'Expand in Folio'}</span>
                      <ExternalLink size={10} />
                    </button>
                  </div>
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
                      <span>Export {getElementFileExtension(type, fields?.propertySubcategory)} Asset</span>
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
                  {element &&
                    (element.id || element.title) &&
                    !((isFolioOrigin && !isModulePinnedOrigin) || (isCortexOrigin && !isModulePinnedOrigin && (!isAdmin || typeof onDeleteCortex !== 'function'))) && (
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={handleDeleteElement}
                        className="w-full text-left px-3 py-1.5 hover:bg-red-950/60 text-red-400 hover:text-red-200 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>
                          {(isCortexOrigin || isFolioOrigin) && isModulePinnedOrigin
                            ? 'Unpin from Story Module'
                            : isCortexOrigin
                            ? 'Delete from OmniCortex (Admin)'
                            : 'Delete Element'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCanonOpen((v) => !v)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                canonDiagnostics.length > 0
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 hover:bg-amber-900/70'
                  : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              }`}
              title="Inspect Tangent v6 Canon Rules Linter diagnostics"
            >
              Canon: {canonDiagnostics.length}
            </button>

            <AimeGuidanceButton
              onClick={() => setIsAimeGuidanceOpen(true)}
              label="AIME Guidance"
              size="sm"
            />
            <button
              type="button"
              onClick={() => !isStoryReadOnly && setIsPublicElement((v) => !v)}
              disabled={isStoryReadOnly}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-colors ${
                isStoryReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                isPublicElement
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 hover:bg-emerald-900/70'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200'
              }`}
              title={
                isPublicElement
                  ? 'Public / Shared: visible across stories & community browser (click to restrict to this project)'
                  : 'Project Only: scoped to the current Story Module (click to share publicly)'
              }
            >
              {isPublicElement ? '🌐 Public' : '🔒 Project'}
            </button>
            <button
              type="button"
              onClick={handleRequestClose}
              aria-label="Close modal"
              className="text-slate-400 hover:text-white text-2xl font-bold px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* ── INTERACTIVE CANON LINTER DRAWER ── */}
        {isCanonOpen && (
          <div className="px-5 py-2.5 bg-slate-950/95 border-b border-amber-500/40 text-xs font-mono space-y-1.5 max-h-44 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-300">
              <span>Tangent v6 Canon Linter ({canonDiagnostics.length} finding{canonDiagnostics.length === 1 ? '' : 's'})</span>
              <button type="button" onClick={() => setIsCanonOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>
            {canonDiagnostics.length === 0 ? (
              <div className="text-emerald-300 text-[11px]">✓ Element conforms to Tangent v6 Canon rules.</div>
            ) : (
              canonDiagnostics.map((diag) => (
                <div key={diag.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-amber-200">{diag.message}</div>
                    <div className="text-[10px] text-slate-400">{diag.suggestion}</div>
                  </div>
                  {diag.autoFixReplacement && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextContent = applyAutoFix(content || '', diag);
                        const contentChanged = nextContent !== (content || '');
                        if (contentChanged) {
                          setContent(nextContent);
                        }
                        const lintedFieldKeys = ['summary', 'oneLinePitch', 'description', 'mechanic', 'readAloud', 'cast_time', 'sceneBeats'];
                        let fieldsChanged = false;
                        setFields((prev) => {
                          const base = prev || {};
                          const patch = {};
                          for (const fk of lintedFieldKeys) {
                            const rawVal = base[fk];
                            if (typeof rawVal === 'string' && rawVal) {
                              const fixedVal = applyAutoFix(rawVal, diag);
                              if (fixedVal !== rawVal) {
                                patch[fk] = fixedVal;
                                fieldsChanged = true;
                              }
                            }
                          }
                          return fieldsChanged ? { ...base, ...patch } : base;
                        });
                        if (fields?.dbmRef && dbmSyncStatus === 'synced' && (contentChanged || fieldsChanged)) {
                          setDbmSyncStatus('local_override');
                        }
                        if (contentChanged || fieldsChanged) {
                          showToast({ type: 'success', text: `Auto-fixed "${diag.matchText || diag.ruleCode}"` });
                        } else {
                          showToast({ type: 'info', text: `No auto-fixable match found for "${diag.matchText || diag.ruleCode}".` });
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] shrink-0 cursor-pointer"
                    >
                      Auto-Fix
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

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
                  onClick={handleSaveAsTemplate}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-indigo-500/50 text-indigo-200 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
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
                    return;
                  }
                  if (!isSafeImageUrl(trimmed)) {
                    showToast({ type: 'warning', text: 'Please enter a valid http(s):// URL or raster data:image/ URI.' });
                    return;
                  }
                  setImageUrl(trimmed);
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
                {type === 'Persona' && (
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      Persona Track
                    </label>
                    <select
                      value={fields.personaSubcategory || element.personaSubcategory || 'story'}
                      onChange={(e) =>
                        handleMergeFields({
                          personaSubcategory: e.target.value
                        })
                      }
                      className="w-full bg-slate-950 border border-cyan-500/50 focus:border-cyan-400 text-cyan-200 p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
                    >
                      {PERSONA_SUBCATEGORIES.map((sub) => (
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
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider flex-1 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingImage ? '⏳ Uploading...' : '🖼️ Upload'}
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
                  elementTitle={title}
                  fields={fields}
                  onChangeField={handleFieldChange}
                  onMergeFields={handleMergeFields}
                  content={content}
                  customFields={customFields}
                  guidance={guidance}
                  onChangeGuidance={setGuidance}
                  assetHub={assetHub}
                  onChangeAssetHub={setAssetHub}
                  availableElements={unifiedAssetCatalog}
                  currentElementId={element?.id}
                  onOpenRelationalSelector={(fieldDef) =>
                    setRelationalSelectorState({
                      key: fieldDef.key,
                      label: fieldDef.label,
                      dbSource: fieldDef.dbSource || 'species'
                    })
                  }
                  onOpenAimeGuidance={() => setIsAimeGuidanceOpen(true)}
                />
              )}

              {/* Tab: Narrative Prose & Lore */}
              {currentTab === 'Narrative Prose & Lore' && (
                <div className="space-y-4 h-full flex flex-col">
                  {/* Persona Folio Narrative Sections (Incorporated for Persona Elements) */}
                  {type === 'Persona' && (
                    <div className="p-4 bg-slate-950/80 border border-cyan-500/30 rounded-xl space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                            Persona Folio Narrative Fields (Synced with MCM &amp; Folio)
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            Structured narrative identity, physicality, backstory, and psychology fields carried directly into the Persona Folio &amp; MCM.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {FOLIO_NARRATIVE_SECTIONS.map((sec) => (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => setNarrativeSectionId(sec.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                                narrativeSectionId === sec.id
                                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60'
                                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {sec.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(() => {
                        const activeSec =
                          FOLIO_NARRATIVE_SECTIONS.find((s) => s.id === narrativeSectionId) ||
                          FOLIO_NARRATIVE_SECTIONS[0];
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activeSec.fields.map((nf) => {
                              const val =
                                fields[nf.id] ||
                                (nf.aliasKeys || []).map((k) => fields[k]).find(Boolean) ||
                                '';
                              return (
                                <div
                                  key={nf.id}
                                  className={`space-y-1 ${nf.span2 ? 'md:col-span-2' : ''}`}
                                >
                                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block font-mono">
                                    {nf.label}
                                  </label>
                                  <AutoExpandingElementTextarea
                                    value={val}
                                    onChange={(e) => {
                                      const nextVal = e.target.value;
                                      handleFieldChange(nf.id, nextVal);
                                      (nf.aliasKeys || []).forEach((aliasKey) => {
                                        handleFieldChange(aliasKey, nextVal);
                                      });
                                    }}
                                    placeholder={nf.placeholder}
                                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs outline-none"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      Detailed Description, Narrative Prose &amp; Lore
                    </label>
                    <div className="bg-slate-950 text-white rounded-lg border border-slate-700 overflow-hidden flex-1 min-h-[280px]">
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={(val) => {
                          setContent(val);
                          if (type === 'Persona') {
                            handleFieldChange('narrativeProse', val);
                          }
                        }}
                        placeholder="Write detailed lore, background, secrets, or description..."
                        className="h-full flex flex-col text-slate-100"
                      />
                    </div>
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
              <div className="text-xs text-slate-500 font-mono flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                <span>
                  Type: <strong className="text-slate-300">{type}</strong>
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
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveAsTemplate}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-indigo-500/50 text-indigo-200 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Save Template
                </button>
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
