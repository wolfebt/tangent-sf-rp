/**
 * @file StoryWeaver.jsx
 * @description Consolidated Story Weaver Workspace for ADE Studio.
 * Intelligently unites:
 *   1. Prose & Manuscript Authoring: Rich text (ReactQuill), live word telemetry, reading time,
 *      POV character lock, and AI pair-authoring (Continue, Expand, Polish, Extract State Deltas).
 *   2. Outline & Scene Beats: High-level scenario plot outline and beat-by-beat progression.
 *   3. Creative Genesis: Guidance Gems (Genre, Tone, Mood, Conflict) & premise brainstorming.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useStory } from '../../../../context/CampaignContext';
import { useAuth } from '../../../../context/AuthContext';
import { useFolio } from '../../../../context/FolioContext';
import { AudioService } from '../../../../services/audioService';
import { generateContent, streamContent } from '../../../../services/aimeService';
import { extractNarrativeDeltas } from '../../../../services/cronicleService';
import crdtCollabService from '../../../../services/crdtCollabService';
import { GUIDANCE_GEMS } from '../guidanceGemsConfig';
import StoryElementExtractorModal from '../StoryElementExtractorModal';
import EditElementModal from '../../ElementForge/EditElementModal';
import { getTypePillStyle } from '../../ElementForge/elementSchemas';
import AimeGuidanceButton from '../../../../components/StoryFoundry/AimeGuidanceButton';
import AimeGuidanceFlyout from '../../../../components/StoryFoundry/AimeGuidanceFlyout';
import { parseAimeAssetFile } from '../../../../services/aimeAssetFileService';
import AimeCanvasSculptor from './AimeCanvasSculptor';
import ArchitectIdeationModal from './ArchitectIdeationModal';
import EpistemicPlayPanel from './EpistemicPlayPanel';
import { 
  Feather, 
  UserCheck, 
  Clock, 
  Hash, 
  Copy, 
  Check, 
  Sparkles, 
  Loader2, 
  Download, 
  BookOpen, 
  Layers, 
  Target, 
  RefreshCw, 
  Send, 
  ArrowRight, 
  CornerDownRight, 
  FileText, 
  ChevronDown,
  Wand2,
  Sliders,
  MapPin,
  Activity,
  Radio,
  Map as MapIcon,
  Plus,
  Zap,
  Terminal,
  ShieldAlert,
  Box,
  Edit3,
  Search,
  Link2,
  Tag,
  X,
  Bookmark,
  Columns,
  MoreHorizontal,
  Trash2
} from 'lucide-react';

export default function StoryWeaver({ 
  activeNode, 
  updateStory, 
  guidanceGems = '', 
  onSelectScenarioWorkspaceTab,
  isSplitView,
  setIsSplitView,
  viewportSplit,
  setViewportSplit,
  handleOpenAddModal,
  handleDeleteElement
}) {
  const { 
    universeState, 
    updateCreativeState,
    updateOutline,
    updateSceneBeats,
    updateDraft,
    elementsCatalog,
    updateSavedElement,
    deleteSavedElement,
    mapsCatalog,
    setActiveMapId,
    addMap,
    addStory,
    setActiveScenarioId,
    cronicle,
    stageCronicleDeltas
  } = useStory();

  const { currentUser, userHandle } = useAuth();
  const navigate = useNavigate();

  // Story Element Extractor Modal State
  const [isExtractorModalOpen, setIsExtractorModalOpen] = useState(false);
  const [extractInitialText, setExtractInitialText] = useState('');
  const [isAimeGuidanceOpen, setIsAimeGuidanceOpen] = useState(false);

  // Weaver Sub-Modes: 'manuscript' | 'outline' | 'tactical' | 'genesis'
  const [weaverTab, setWeaverTab] = useState('manuscript');

  // Unified Map Catalog access (global mapsCatalog + project maps)
  const allAvailableMaps = useMemo(() => {
    const catalog = mapsCatalog || [];
    const projectMaps = (universeState?.maps || []).filter(m => !catalog.some(cm => cm.id === m.id));
    return [...catalog, ...projectMaps];
  }, [mapsCatalog, universeState?.maps]);

  const linkedMap = useMemo(() => {
    if (!activeNode?.mapId) return null;
    return allAvailableMaps.find(m => m.id === activeNode.mapId) || null;
  }, [activeNode?.mapId, allAvailableMaps]);

  // Live Stage Event Stream
  const [tacticalEvents, setTacticalEvents] = useState([]);
  const [isGeneratingTacticalProse, setIsGeneratingTacticalProse] = useState(false);

  // Manuscript / Prose State
  const quillRef = useRef(null);
  const [content, setContent] = useState(activeNode?.content || '');
  const [activePov, setActivePov] = useState(activeNode?.fields?.pov || '');
  const [copied, setCopied] = useState(false);
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [aiActionLabel, setAiActionLabel] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Outline & Beats State
  const [outline, setOutline] = useState(activeNode?.fields?.storyOutline || universeState?.creativeState?.storyOutline || '');
  const [sceneBeats, setSceneBeats] = useState(activeNode?.fields?.sceneBeats || universeState?.creativeState?.sceneBeats || '');
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingBeats, setIsGeneratingBeats] = useState(false);

  // Creative Genesis & Premise State
  const [premisePrompt, setPremisePrompt] = useState('');
  const [isBrainstorming, setIsBrainstorming] = useState(false);

  // Architect Ideation & Epistemic Interaction State
  const [isIdeationModalOpen, setIsIdeationModalOpen] = useState(false);
  const [selectedIdeationType, setSelectedIdeationType] = useState('Climax');
  const [isEpistemicPanelOpen, setIsEpistemicPanelOpen] = useState(false);

  // Real-time collaborative CRDT state
  const [collabStatus, setCollabStatus] = useState(() => crdtCollabService.getCollabStatus());

  // Story Wiki & In-Book Element Editor State
  const [isWikiDrawerOpen, setIsWikiDrawerOpen] = useState(false);
  const [wikiSearch, setWikiSearch] = useState('');
  const [wikiTypeFilter, setWikiTypeFilter] = useState('All');
  const [editingWikiElement, setEditingWikiElement] = useState(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [recentlyDroppedElement, setRecentlyDroppedElement] = useState(null);

  // Compute referenced elements from manuscript, outline, beats
  const referencedElements = useMemo(() => {
    const catalog = elementsCatalog || [];
    if (catalog.length === 0) return [];
    const allText = `${content || ''} ${outline || ''} ${sceneBeats || ''}`.toLowerCase();
    
    // Explicit [[wiki links]]
    const wikiTags = new Set();
    const regex = /\[\[(.*?)\]\]/g;
    let match;
    while ((match = regex.exec(allText)) !== null) {
      if (match[1]?.trim()) {
        wikiTags.add(match[1].trim().toLowerCase());
      }
    }

    return catalog.filter(el => {
      const titleLower = el.title?.toLowerCase() || '';
      return wikiTags.has(titleLower) || (titleLower.length >= 4 && allText.includes(titleLower));
    });
  }, [content, outline, sceneBeats, elementsCatalog]);

  const filteredWikiElements = useMemo(() => {
    const catalog = elementsCatalog || [];
    return catalog.filter(el => {
      const matchesSearch = !wikiSearch.trim() || 
        el.title?.toLowerCase().includes(wikiSearch.toLowerCase()) ||
        el.fields?.description?.toLowerCase().includes(wikiSearch.toLowerCase()) ||
        el.fields?.oneLinePitch?.toLowerCase().includes(wikiSearch.toLowerCase());
      
      if (!matchesSearch) return false;
      if (wikiTypeFilter === 'All') return true;
      if (wikiTypeFilter === 'Referenced') return referencedElements.some(r => r.id === el.id);
      return el.type?.toLowerCase() === wikiTypeFilter.toLowerCase();
    });
  }, [elementsCatalog, wikiSearch, wikiTypeFilter, referencedElements]);

  // Insert [[Wiki Link]] into active manuscript cursor
  const handleInsertWikiLink = (elementTitle) => {
    const linkText = `[[${elementTitle}]] `;
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      const index = range ? range.index : quill.getLength() - 1;
      quill.insertText(index, linkText);
      quill.setSelection(index + linkText.length);
    } else {
      handleContentChange((content || '') + ` ${linkText}`);
    }
    showToast(`✓ Inserted [[${elementTitle}]] into Canvas`);
    AudioService.playTerminalBeep(1200, 0.02);
  };

  // Create new element right from within the book
  const handleCreateNewElement = (type = 'Persona') => {
    const newElem = {
      id: uuidv4(),
      title: 'New Element',
      type: type,
      fields: {
        description: '',
        oneLinePitch: ''
      }
    };
    setEditingWikiElement(newElem);
  };

  const handleSaveWikiElement = (saved) => {
    if (typeof updateSavedElement === 'function' && saved?.id) {
      updateSavedElement(saved.id, saved);
      showToast(`✓ Saved "${saved.title}"`);
    }
    setEditingWikiElement(null);
  };

  const handleDeleteWikiElement = (id) => {
    if (typeof deleteSavedElement === 'function' && id) {
      deleteSavedElement(id);
      showToast('✓ Deleted element');
    }
    setEditingWikiElement(null);
  };

  // Canvas Drag & Drop Ingestion Handler
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCanvas(false);

    // 1. Check for dragged element from Left Outliner Rail or Story Wiki
    const wikiElementData = e.dataTransfer.getData('application/x-tangent-wiki-element');
    const scenarioData = e.dataTransfer.getData('application/x-tangent-scenario');
    const plainText = e.dataTransfer.getData('text/plain');

    if (wikiElementData) {
      try {
        const elem = JSON.parse(wikiElementData);
        if (elem?.title) {
          const wikiTag = `[[${elem.title}]] `;
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection() || { index: quill.getLength() - 1 };
            quill.insertText(range.index, wikiTag);
            quill.setSelection(range.index + wikiTag.length);
          } else {
            handleContentChange((content || '') + ` ${wikiTag}`);
          }
          setRecentlyDroppedElement(elem);
          showToast(`✓ Inserted [[${elem.title}]] into Story Canvas`);
          AudioService.playTerminalBeep(1200, 0.03);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse dropped element data:', err);
      }
    }

    // 2. Check for dragged scenario node (chapter link)
    if (scenarioData) {
      try {
        const sc = JSON.parse(scenarioData);
        if (sc?.title) {
          const link = `[[Chapter: ${sc.title}]] `;
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection() || { index: quill.getLength() - 1 };
            quill.insertText(range.index, link);
            quill.setSelection(range.index + link.length);
          } else {
            handleContentChange((content || '') + ` ${link}`);
          }
          showToast(`✓ Linked [[Chapter: ${sc.title}]] into Canvas`);
          AudioService.playTerminalBeep(1200, 0.03);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse dropped scenario data:', err);
      }
    }

    // 3. Check for dropped external file(s)
    if (e.dataTransfer.files?.length > 0) {
      const file = e.dataTransfer.files[0];
      file.text().then(text => {
        try {
          const parsed = parseAimeAssetFile(text, file.name);
          if (parsed?.title) {
            if (typeof updateSavedElement === 'function') {
              updateSavedElement(parsed.id, parsed);
            }
            const wikiTag = `[[${parsed.title}]] `;
            const quill = quillRef.current?.getEditor();
            if (quill) {
              const range = quill.getSelection() || { index: quill.getLength() - 1 };
              quill.insertText(range.index, wikiTag);
              quill.setSelection(range.index + wikiTag.length);
            } else {
              handleContentChange((content || '') + ` ${wikiTag}`);
            }
            setRecentlyDroppedElement(parsed);
            showToast(`✓ Imported & inserted [[${parsed.title}]] into Canvas`);
            AudioService.playCriticalChime(true);
          }
        } catch (err) {
          console.warn('Canvas file drop parse failed:', err);
        }
      });
      return;
    }

    // 4. Fallback plain text [[Wiki]]
    if (plainText && plainText.startsWith('[[') && plainText.endsWith(']]')) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection() || { index: quill.getLength() - 1 };
        quill.insertText(range.index, `${plainText} `);
        quill.setSelection(range.index + plainText.length + 1);
      } else {
        handleContentChange((content || '') + ` ${plainText} `);
      }
      showToast(`✓ Inserted ${plainText}`);
    }
  };

  // Embed full element description, pitch & attributes directly into story prose
  const handleEmbedElementContent = (elem) => {
    if (!elem) return;
    const desc = elem.fields?.description || elem.fields?.oneLinePitch || elem.content?.replace(/<[^>]+>/g, ' ') || 'No description recorded.';
    const pitch = elem.fields?.oneLinePitch ? `<p><em>${elem.fields.oneLinePitch}</em></p>` : '';
    const formattedHtml = `<blockquote style="border-left: 3px solid #06b6d4; padding-left: 12px; margin: 12px 0; color: #a5f3fc; background: rgba(8, 51, 68, 0.3); border-radius: 4px; padding-top: 6px; padding-bottom: 6px;"><strong style="color: #38bdf8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">📖 ${elem.type || 'Element'}: ${elem.title}</strong>${pitch}<p>${desc}</p></blockquote><p></p>`;

    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection() || { index: quill.getLength() - 1 };
      quill.clipboard.dangerouslyPasteHTML(range.index, formattedHtml);
    } else {
      handleContentChange((content || '') + formattedHtml);
    }
    showToast(`✓ Embedded content for "${elem.title}" into Manuscript`);
    AudioService.playTerminalBeep(1100, 0.02);
  };

  // Detect clicks on [[Wiki Links]] and @Mention chips to open in-situ element editor
  useEffect(() => {
    const editorEl = quillRef.current?.getEditor()?.root;
    if (!editorEl) return;

    const handleEditorClick = (e) => {
      // 1. Entity chip element click
      const chip = e.target.closest('.tangent-entity-chip') || e.target.closest('[data-entity-id]') || e.target.closest('[data-element-id]');
      if (chip) {
        const id = chip.getAttribute('data-entity-id') || chip.getAttribute('data-element-id');
        const found = (elementsCatalog || []).find(el => el.id === id);
        if (found) {
          e.preventDefault();
          e.stopPropagation();
          setEditingWikiElement(found);
          AudioService.playTerminalBeep(1100, 0.02);
          return;
        }
      }

      // 2. Click within or on [[Wiki Link]]
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        const text = sel.anchorNode.textContent || '';
        const offset = sel.anchorOffset;
        const before = text.slice(0, offset);
        const after = text.slice(offset);
        const openIdx = before.lastIndexOf('[[');
        const closeIdx = after.indexOf(']]');
        if (openIdx !== -1 && closeIdx !== -1 && !before.slice(openIdx).includes(']]')) {
          const fullInner = text.slice(openIdx + 2, offset + closeIdx).trim();
          const [targetName] = fullInner.split('|').map(s => s.trim());
          const found = (elementsCatalog || []).find(el => 
            (el.title && el.title.toLowerCase() === targetName.toLowerCase()) ||
            (el.name && el.name.toLowerCase() === targetName.toLowerCase())
          );
          if (found) {
            e.preventDefault();
            e.stopPropagation();
            setEditingWikiElement(found);
            AudioService.playTerminalBeep(1100, 0.02);
          }
        }
      }
    };

    editorEl.addEventListener('click', handleEditorClick);
    return () => editorEl.removeEventListener('click', handleEditorClick);
  }, [elementsCatalog]);

  useEffect(() => {
    const unsub = crdtCollabService.onCollabStatusChange(setCollabStatus);
    return unsub;
  }, []);

  // Sync content when activeNode changes and subscribe to CRDT shared text
  useEffect(() => {
    if (activeNode?.id) {
      const initialText = activeNode.content || '';
      const { currentContent } = crdtCollabService.syncScenarioProse(activeNode.id, initialText);
      setContent(currentContent || initialText);
      setActivePov(activeNode.fields?.pov || '');
      setOutline(activeNode.fields?.storyOutline || universeState?.creativeState?.storyOutline || '');
      setSceneBeats(activeNode.fields?.sceneBeats || universeState?.creativeState?.sceneBeats || '');

      const unsubProse = crdtCollabService.subscribeToScenarioProse(activeNode.id, (newText, event, transaction) => {
        if (transaction?.origin !== 'local') {
          setContent(newText);
        }
      });

      return unsubProse;
    }
  }, [activeNode?.id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Folio Operatives & Story Personas for POV Context Injection
  const { roster = [], characterData } = useFolio();

  const povOptions = useMemo(() => {
    const list = [
      { id: '', name: '', label: 'POV: 3rd Person Omniscient', type: 'narrator', subtitle: 'Default Narrator' }
    ];

    if (characterData && characterData['char-name']) {
      list.push({
        id: characterData['character-doc-id'] || 'active_folio',
        name: characterData['char-name'],
        label: `${characterData['char-name']} (${characterData['char-archetype'] || 'Hero'})`,
        type: 'folio',
        subtitle: `${characterData['char-archetype'] || 'Hero'} (Active Folio Operative)`,
        char: characterData
      });
    }

    (roster || []).forEach(op => {
      if (op && op['char-name'] && op['character-doc-id'] !== characterData?.['character-doc-id']) {
        list.push({
          id: op['character-doc-id'] || op.id,
          name: op['char-name'],
          label: `${op['char-name']} (${op['char-archetype'] || 'Operative'})`,
          type: 'folio',
          subtitle: `${op['char-archetype'] || 'Operative'} (Roster)`,
          char: op
        });
      }
    });

    (elementsCatalog || []).filter(e => e.type === 'Persona').forEach(p => {
      const pName = p.title || p.name || 'Persona';
      list.push({
        id: p.id,
        name: pName,
        label: `${pName} (${p.fields?.species || 'Story Persona'})`,
        type: 'story_persona',
        subtitle: `${p.fields?.species || 'Story Persona'}`,
        element: p
      });
    });

    return list;
  }, [roster, characterData, elementsCatalog]);

  // Telemetry
  const words = useMemo(() => {
    return content.trim() ? content.trim().replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length : 0;
  }, [content]);

  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const handleContentChange = (val) => {
    setContent(val);
    if (activeNode?.id) {
      crdtCollabService.updateScenarioProse(activeNode.id, val, 'local');
      updateStory(activeNode.id, { content: val });
    }
  };

  const handlePovChange = (newPov) => {
    setActivePov(newPov);
    if (activeNode?.id) {
      updateStory(activeNode.id, {
        fields: {
          ...(activeNode.fields || {}),
          pov: newPov
        }
      });
    }
  };

  const handleCopy = () => {
    const plain = content.replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(plain);
    AudioService.playTerminalBeep(1200, 0.05);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    AudioService.playTerminalBeep(1400, 0.08);
    const plain = content.replace(/<[^>]+>/g, '');
    const filename = `${(activeNode?.title || 'Story').replace(/[^a-zA-Z0-9_-]/g, '_')}_manuscript.md`;
    const blob = new Blob([plain], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── AI PAIR-AUTHORING ACTIONS ──
  const handleAiPairAuthor = async (actionType) => {
    if (isAiWorking || !activeNode) return;
    setIsAiWorking(true);
    AudioService.playTerminalBeep(1000, 0.05);

    const plainText = content.replace(/<[^>]+>/g, '');
    let prompt = '';

    const povEntry = povOptions.find(o => o.name === activePov);
    let povDirective = activePov ? `Point of View: ${activePov}` : 'Point of View: Third Person Omniscient';
    if (povEntry?.char) {
      povDirective += ` [Hero Operative - Archetype: ${povEntry.char['char-archetype'] || 'Operative'}, Species: ${povEntry.char['char-species'] || 'Terran'}, Motive: "${povEntry.char['char-motive'] || 'Survive and accomplish mission'}"]`;
    } else if (povEntry?.element) {
      povDirective += ` [Story Persona - Species: ${povEntry.element.fields?.species || 'Unknown'}, Archetype: ${povEntry.element.fields?.archetype || 'NPC'}]`;
    }

    if (actionType === 'continue') {
      setAiActionLabel('Continuing Scene Narrative...');
      prompt = `Continue writing the narrative from this exact point for 2 evocative paragraphs. Maintain the ${povDirective}, active tone (${guidanceGems || 'Sci-Fi'}), and established atmosphere:\n\n${plainText.slice(-800)}`;
    } else if (actionType === 'expand') {
      setAiActionLabel('Expanding Sensory Details...');
      prompt = `Rewrite and expand the following scene segment with rich sensory textures (tactile details, lighting, sci-fi acoustics, interiority) under ${povDirective} while preserving the plot beats:\n\n${plainText.slice(-600)}`;
    } else if (actionType === 'polish') {
      setAiActionLabel('Polishing Prose & Style...');
      prompt = `Line-edit and polish the following prose for maximum dramatic tension, crisp pacing, and evocative science-fantasy style (${povDirective}):\n\n${plainText.slice(-800)}`;
    } else if (actionType === 'reactive_flavor') {
      setAiActionLabel('Synthesizing Dynamic Reactive Flavor...');
      const conditions = characterData?.['char-conditions'] || [];
      const conditionStr = Array.isArray(conditions) && conditions.length > 0 
        ? conditions.map(c => typeof c === 'string' ? c : (c.name || c.id)).join(', ')
        : 'Active Tactical Focus';
      prompt = `DUAL-TRACK NARRATIVE ARCHITECTURE DIRECTIVE:
AUTHORITY: The author's prose is CANONICAL GM INTENT and must remain UNTOUCHED.
Your sole duty is to generate DYNAMIC REACTIVE FLAVOR TEXT reflecting the active operative's conditions: "${conditionStr}".
Task: Write 1-2 evocative sensory sentences describing how this scene is experienced through the lens of "${conditionStr}" (e.g. sensory distortion, altered dialogue cadence, or kinetic recoil). Do not alter plot beats.

Canonical Scene Extract:
${plainText.slice(-600)}`;
    }

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        let updated = content;
        if (actionType === 'continue') {
          updated = `${content}<p>${result.replace(/\n\n/g, '</p><p>')}</p>`;
        } else if (actionType === 'reactive_flavor') {
          const conditions = characterData?.['char-conditions'] || [];
          const conditionStr = Array.isArray(conditions) && conditions.length > 0 
            ? conditions.map(c => typeof c === 'string' ? c : (c.name || c.id)).join(', ')
            : 'Active Tactical Focus';
          updated = `${content}<blockquote style="border-left: 3px solid #06b6d4; padding-left: 12px; margin: 12px 0; color: #a5f3fc; font-style: italic; background: rgba(8, 51, 68, 0.35); border-radius: 4px; padding-top: 6px; padding-bottom: 6px;"><strong style="color: #38bdf8; font-style: normal; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">⚡ Dynamic Reactive Flavor • Condition: ${conditionStr}</strong>${result.replace(/\n\n/g, '<br/>')}</blockquote>`;
        } else {
          updated = `${content}<br/><hr/><p><strong>[AI Polish Proposal]:</strong></p><p>${result.replace(/\n\n/g, '</p><p>')}</p>`;
        }
        handleContentChange(updated);
        showToast('✓ AI authoring assist complete');
      }
    } catch (err) {
      console.warn('AI authoring failed:', err);
      showToast('AI authoring request failed');
    } finally {
      setIsAiWorking(false);
      setAiActionLabel('');
    }
  };

  // State delta extraction into Cronicle
  const handleExtractDeltas = async () => {
    const plainText = content.replace(/<[^>]+>/g, '');
    if (!plainText || plainText.length < 30) {
      showToast('Need at least a paragraph of prose to deduce deltas');
      return;
    }
    setIsAiWorking(true);
    setAiActionLabel('Deducing Narrative State Transitions...');
    AudioService.playTerminalBeep(1050, 0.06);

    try {
      const deltas = await extractNarrativeDeltas({
        prose: plainText,
        cronicle
      });
      if (deltas && deltas.length > 0) {
        stageCronicleDeltas(deltas);
        showToast(`⚡ Deduced ${deltas.length} Cronicle state delta(s)!`);
      } else {
        showToast('No state changes detected in this section');
      }
    } catch (err) {
      console.warn('Delta extraction failed:', err);
      showToast('State extraction failed');
    } finally {
      setIsAiWorking(false);
      setAiActionLabel('');
    }
  };

  // ── OUTLINE & BEATS GENERATION ──
  const handleGenerateOutline = async () => {
    setIsGeneratingOutline(true);
    AudioService.playTerminalBeep(1100, 0.04);
    const prompt = `Synthesize a structured 3-act story outline with key narrative turning points for this RPG scenario:
Title: "${activeNode?.title || 'Scenario'}"
Guidance: ${guidanceGems || 'Sci-Fi'}
Format with clear bulleted acts:
Act 1: Inciting Incident & Mission Setup
Act 2: Rising Tension, Complications & Reversals
Act 3: Climax, Tactical Resolution & Aftermath`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        setOutline(result);
        if (activeNode?.id) {
          updateStory(activeNode.id, {
            fields: { ...(activeNode.fields || {}), storyOutline: result }
          });
        }
        showToast('✓ Story outline generated');
      }
    } catch (err) {
      console.warn('Outline generation failed:', err);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleGenerateBeats = async () => {
    setIsGeneratingBeats(true);
    AudioService.playTerminalBeep(1100, 0.04);
    const prompt = `Generate a sequence of 4-6 sequential tactical scene beats for this scenario:
Title: "${activeNode?.title || 'Scenario'}"
Outline: ${outline ? outline.slice(0, 400) : 'General progression'}
Guidance: ${guidanceGems || 'Sci-Fi'}
Format each beat on its own line:
- Beat 1: [Infiltration / Recon] description
- Beat 2: [Encounter / Puzzle] description
- Beat 3: [Crisis / Turning Point] description
- Beat 4: [Extraction / Climax] description`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        setSceneBeats(result);
        if (activeNode?.id) {
          updateStory(activeNode.id, {
            fields: { ...(activeNode.fields || {}), sceneBeats: result }
          });
        }
        showToast('✓ Scene beats generated');
      }
    } catch (err) {
      console.warn('Beats generation failed:', err);
    } finally {
      setIsGeneratingBeats(false);
    }
  };

  // ── ARCHITECT GUIDED IDEATION & EPISTEMIC HANDLERS ──
  const handleOpenIdeationModal = (type = 'Climax') => {
    setSelectedIdeationType(type);
    setIsIdeationModalOpen(true);
    AudioService.playTerminalBeep(1300, 0.03);
  };

  const handleCommitArchitectNode = (nodeData) => {
    const formattedBeat = `\n\n### [${nodeData.nodeType.toUpperCase()}] ${nodeData.title}\n` +
      `• Intent: ${nodeData.intent}\n` +
      (nodeData.objective ? `• Objective: ${nodeData.objective}\n` : '') +
      (nodeData.opposingForce ? `• Opposing Force: ${nodeData.opposingForce}\n` : '') +
      `• Mechanical DC: ${nodeData.targetDC}\n` +
      `• Atmosphere: ${nodeData.weatherPreset}\n` +
      `• Narrative Sensory Layer:\n${nodeData.sensoryFlavor}\n`;

    const updatedBeats = (sceneBeats ? sceneBeats.trim() : '') + formattedBeat;
    setSceneBeats(updatedBeats);
    if (activeNode?.id) {
      updateStory(activeNode.id, {
        fields: { ...(activeNode.fields || {}), sceneBeats: updatedBeats }
      });
    }
    showToast(`✓ Committed Architect ${nodeData.nodeType} node to Scene Beats`);
    setIsIdeationModalOpen(false);
  };

  const handleInsertEpistemicToProse = (proseText) => {
    const formatted = `<div class="epistemic-log-entry bg-slate-950/60 p-3 my-2 border-l-2 border-emerald-500 rounded font-mono text-xs text-emerald-300">${proseText.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</div>`;
    handleContentChange((content ? content + '<br/>' : '') + formatted);
    showToast('✓ Epistemic transcript inserted into Manuscript Canvas');
    AudioService.playTerminalBeep(1200, 0.02);
  };

  // ── CREATIVE GENESIS BRAINSTORMING ──
  const handleBrainstormPremise = async () => {
    if (!premisePrompt.trim()) return;
    setIsBrainstorming(true);
    AudioService.playTerminalBeep(1100, 0.04);
    const prompt = `Brainstorm 3 compelling story premises and dramatic narrative conflicts based on this prompt:
Prompt: "${premisePrompt}"
Guidance: ${guidanceGems || 'Sci-Fi'}
Provide rich atmospheric hooks, faction entanglements, and high-stakes choices for the operatives.`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        setOutline(prev => `${prev ? prev + '\n\n' : ''}### Brainstormed Premises\n${result}`);
        showToast('✓ Premises synthesized into outline');
      }
    } finally {
      setIsBrainstorming(false);
    }
  };

  // Listen to real-time events from The Stage interactive objects
  useEffect(() => {
    const handleStoryTrigger = (e) => {
      const eventDetail = e.detail || {};
      const newEntry = {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        type: e.type,
        detail: eventDetail
      };
      setTacticalEvents(prev => [newEntry, ...prev].slice(0, 30));
      showToast(`⚡ Stage Event: ${e.type.replace(/-/g, ' ')}`);
    };

    window.addEventListener('story-foundry-node-triggered', handleStoryTrigger);
    window.addEventListener('stage-bulkhead-toggled', handleStoryTrigger);
    window.addEventListener('stage-hazard-toggled', handleStoryTrigger);
    window.addEventListener('story-foundry-milestone-reached', handleStoryTrigger);
    window.addEventListener('omnicortex-loot-dispensed', handleStoryTrigger);

    return () => {
      window.removeEventListener('story-foundry-node-triggered', handleStoryTrigger);
      window.removeEventListener('stage-bulkhead-toggled', handleStoryTrigger);
      window.removeEventListener('stage-hazard-toggled', handleStoryTrigger);
      window.removeEventListener('story-foundry-milestone-reached', handleStoryTrigger);
      window.removeEventListener('omnicortex-loot-dispensed', handleStoryTrigger);
    };
  }, []);

  // Synthesize rich GM read-aloud room/tactical narrative from map layout
  const handleGenerateTacticalProse = async () => {
    if (!linkedMap) return;
    setIsGeneratingTacticalProse(true);
    AudioService.playTerminalBeep(1100, 0.04);
    const tokenSummary = (linkedMap.tokens || []).map(t => `${t.name || t.label || 'Entity'} (${t.type || 'token'})`).join(', ') || 'No hostile units mapped';
    const objectSummary = (linkedMap.objects || []).map(o => `${o.label || o.type || 'Structure'} (${o.shape || 'object'})`).join(', ') || 'Standard tactical bulkheads';

    const prompt = `Write an atmospheric, sensory boxed-text GM read-aloud encounter description for this tactical battlemap in Tangent SFF RPG:
Scenario: "${activeNode?.title || 'Tactical Encounter'}"
Map Title: "${linkedMap.title}"
Grid Mode: ${linkedMap.gridMode || 'Square'}
Tactical Objects & Props: ${objectSummary}
Tokens & Entities Present: ${tokenSummary}
Guidance/Tone: ${guidanceGems || 'Sci-Fi Dark Industrial Tactical'}
Focus on sensory atmosphere (shadows, hum of generators, smell of ozone, tactical cover, impending tension). Keep it 2-3 evocative paragraphs.`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        const formatted = `<p><strong>[Tactical Read-Aloud: ${linkedMap.title}]</strong></p><p>${result.replace(/\n\n/g, '</p><p>')}</p>`;
        handleContentChange((content ? content + '<br/>' : '') + formatted);
        showToast('✓ Read-aloud description appended to Manuscript');
      }
    } catch (err) {
      console.warn('Tactical prose generation failed:', err);
    } finally {
      setIsGeneratingTacticalProse(false);
    }
  };

  // Insert a map event into the narrative manuscript
  const handleLogEventToProse = (evt) => {
    let summary = `Event: ${evt.type}`;
    if (evt.type === 'stage-bulkhead-toggled') {
      summary = `Bulkhead door ${evt.detail?.isOpen ? 'breached/opened' : 'sealed shut'}${evt.detail?.operativeId ? ` by operative ${evt.detail.operativeId}` : ''}`;
    } else if (evt.type === 'story-foundry-node-triggered') {
      summary = `Data terminal accessed: ${evt.detail?.action || 'Encrypted node decrypted'}`;
    } else if (evt.type === 'stage-hazard-toggled') {
      summary = `Environmental hazard emitter ${evt.detail?.isActive ? 'activated' : 'vented/deactivated'}`;
    } else if (evt.type === 'omnicortex-loot-dispensed') {
      summary = `Supply container unlocked, gear acquired (${evt.detail?.omnicortexGearId || 'salvage'})`;
    } else if (evt.type === 'story-foundry-milestone-reached') {
      const beatNum = (evt.detail?.beatIndex ?? 0) + 1;
      const beatName = evt.detail?.beatText ? `"${evt.detail.beatText}"` : `Beat #${beatNum}`;
      summary = `Tactical Milestone Beat #${beatNum} (${beatName}) ${evt.detail?.isCompleted ? 'Accomplished' : 'Reset'}`;
    }
    const formattedNote = `<p><em>[Tactical Event @ ${evt.time}]: ${summary}.</em></p>`;
    handleContentChange((content ? content + '<br/>' : '') + formattedNote);
    showToast('✓ Logged event into Manuscript');
  };

  // Synthesize rich immediate aftermath prose using AIME and inject directly into manuscript
  const handleDraftAftermathToProse = async (evt) => {
    if (isAiWorking) return;
    setIsAiWorking(true);
    setAiActionLabel('Drafting Tactical Aftermath...');
    AudioService.playTerminalBeep(1100, 0.05);

    let summary = `Event: ${evt.type}`;
    if (evt.type === 'stage-bulkhead-toggled') {
      summary = `Bulkhead door ${evt.detail?.isOpen ? 'breached/opened' : 'sealed shut'}${evt.detail?.operativeId ? ` by operative ${evt.detail.operativeId}` : ''}`;
    } else if (evt.type === 'story-foundry-node-triggered') {
      summary = `Data terminal accessed: ${evt.detail?.action || 'Encrypted node decrypted'}`;
    } else if (evt.type === 'stage-hazard-toggled') {
      summary = `Environmental hazard emitter ${evt.detail?.isActive ? 'activated' : 'vented/deactivated'}`;
    } else if (evt.type === 'omnicortex-loot-dispensed') {
      summary = `Supply container unlocked, gear acquired (${evt.detail?.omnicortexGearId || 'salvage'})`;
    } else if (evt.type === 'story-foundry-milestone-reached') {
      const beatNum = (evt.detail?.beatIndex ?? 0) + 1;
      const beatName = evt.detail?.beatText ? `"${evt.detail.beatText}"` : `Beat #${beatNum}`;
      summary = `Tactical Milestone Beat #${beatNum} (${beatName}) ${evt.detail?.isCompleted ? 'Accomplished' : 'Reset'}`;
    }

    const povEntry = povOptions.find(o => o.name === activePov);
    let povDirective = activePov ? `Point of View: ${activePov}` : 'Point of View: Third Person Omniscient';
    if (povEntry?.char) {
      povDirective += ` [Hero Operative - Archetype: ${povEntry.char['char-archetype'] || 'Operative'}, Species: ${povEntry.char['char-species'] || 'Terran'}, Motive: "${povEntry.char['char-motive'] || 'Survive and accomplish mission'}"]`;
    } else if (povEntry?.element) {
      povDirective += ` [Story Persona - Species: ${povEntry.element.fields?.species || 'Unknown'}, Archetype: ${povEntry.element.fields?.archetype || 'NPC'}]`;
    }

    const prompt = `Write a vivid, sensory narrative aftermath paragraph describing what happens in the scene following this tactical event in the Tangent SFF RPG:
Scenario: "${activeNode?.title || 'Tactical Scene'}"
Tactical Event: ${summary}
${povDirective}
Guidance/Atmosphere: ${guidanceGems || 'Sci-Fi Dark Tactical'}
Keep it to 1-2 evocative prose paragraphs detailing the immediate physical impact, operative reactions, and changing situational stakes.`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        const formatted = `<p><strong>[Aftermath: ${summary}]</strong></p><p>${result.replace(/\n\n/g, '</p><p>')}</p>`;
        handleContentChange((content ? content + '<br/>' : '') + formatted);
        showToast('✓ AI Aftermath appended to Manuscript');
      }
    } catch (err) {
      console.warn('Aftermath generation failed:', err);
      showToast('Aftermath generation failed');
    } finally {
      setIsAiWorking(false);
      setAiActionLabel('');
    }
  };

  // Link or create map helper
  const handleCreateMapForScenario = () => {
    if (!activeNode) return;
    const newMapId = uuidv4();
    const newMap = {
      id: newMapId,
      title: `${activeNode.title || 'Untitled'} Encounter Map`,
      gridMode: 'hex',
      gridType: 'hex',
      lines: [],
      tokens: [],
      terrains: [],
      objects: [],
      texts: [],
      fog: []
    };
    if (typeof addMap === 'function') addMap(newMap);
    if (typeof updateStory === 'function') updateStory(activeNode.id, { mapId: newMapId });
    if (typeof setActiveMapId === 'function') setActiveMapId(newMapId);
    showToast('✓ New encounter map created and linked');
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16] font-mono select-none">
      {/* ── UNIFIED SCENARIO CONTEXT BAR (Single Clean Line) ── */}
      <div className="px-3 py-1.5 border-b border-slate-800 bg-slate-950/95 flex items-center justify-between gap-2.5 shrink-0 flex-wrap text-xs font-mono">
        {/* Left: Type Pill + Editable Title + CRDT Status */}
        <div className="flex items-center gap-2 min-w-0">
          {activeNode?.type && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-bold uppercase shrink-0">
              {activeNode.type}
            </span>
          )}
          <input
            type="text"
            value={activeNode?.title || ''}
            onChange={(e) => {
              if (activeNode?.id) {
                updateStory(activeNode.id, { title: e.target.value });
              }
            }}
            placeholder="Scenario Title..."
            className="text-xs font-bold text-slate-100 bg-transparent border-none outline-none focus:bg-slate-900/80 rounded px-1 max-w-[160px] sm:max-w-[220px] truncate"
            title="Click to rename scenario"
          />
          {/* Real-time CRDT Co-Authoring Indicator */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-mono tracking-tight bg-slate-900 border border-slate-800 text-slate-300 shrink-0"
            title="CRDT Yjs P2P Prose Synchronization Active"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${collabStatus.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
            <span>CRDT {collabStatus.isConnected ? 'LIVE' : 'READY'}</span>
          </div>
        </div>

        {/* Center: Mode Switcher Pills (Canvas / Outline / Split Map) + Telemetry */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
            {/* Canvas */}
            <button
              type="button"
              onClick={() => setWeaverTab('manuscript')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                weaverTab === 'manuscript'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Manuscript Canvas (Prose Drafting)"
            >
              <span>✍️</span>
              <span>Canvas</span>
            </button>

            {/* Outline */}
            <button
              type="button"
              onClick={() => setWeaverTab('outline')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                weaverTab === 'outline'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Story Outline & Tactical Beats"
            >
              <span>📋</span>
              <span>Outline</span>
            </button>

            {/* Split Map Toggle */}
            {setIsSplitView && (
              <button
                type="button"
                onClick={() => setIsSplitView(prev => !prev)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isSplitView
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Split Stage: Side-by-side Manuscript + Tactical Stage"
              >
                <Columns size={12} />
                <span className="hidden sm:inline">Split Map</span>
              </button>
            )}

            {/* Split Ratio (When Split View is active) */}
            {isSplitView && setViewportSplit && (
              <div className="flex items-center gap-0.5 bg-slate-950 px-1 py-0.5 rounded-lg border border-emerald-500/40 text-[9px] font-bold ml-1">
                <button
                  type="button"
                  onClick={() => setViewportSplit('story_only')}
                  className={`px-1.5 py-0.5 rounded ${viewportSplit === 'story_only' ? 'bg-emerald-500/30 text-emerald-300 font-extrabold' : 'text-slate-400'}`}
                >
                  Story
                </button>
                <button
                  type="button"
                  onClick={() => setViewportSplit('side_by_side')}
                  className={`px-1.5 py-0.5 rounded ${viewportSplit === 'side_by_side' ? 'bg-emerald-500/30 text-emerald-300 font-extrabold' : 'text-slate-400'}`}
                >
                  50/50
                </button>
                <button
                  type="button"
                  onClick={() => setViewportSplit('canvas_only')}
                  className={`px-1.5 py-0.5 rounded ${viewportSplit === 'canvas_only' ? 'bg-emerald-500/30 text-emerald-300 font-extrabold' : 'text-slate-400'}`}
                >
                  Stage
                </button>
              </div>
            )}
          </div>

          {/* Words & Reading Time */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400">
            <span><strong className="text-slate-200">{words}</strong> words</span>
            <span>•</span>
            <span>~<strong className="text-slate-200">{readingTimeMinutes}</strong> min</span>
          </div>
        </div>

        {/* Right: POV + + Component + Wiki + AI Assist + Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* POV Lock */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-[10px]">
            <UserCheck size={11} className="text-purple-400 shrink-0" />
            <select
              value={activePov}
              onChange={e => handlePovChange(e.target.value)}
              className="bg-transparent text-purple-300 font-bold outline-none cursor-pointer max-w-[120px] truncate"
              title="Active Character Point of View"
            >
              <option value="" className="bg-slate-950 text-slate-400">POV: 3rd Person</option>
              {povOptions.filter(o => o.type === 'folio').map(op => (
                <option key={op.id} value={op.name} className="bg-slate-950 text-purple-200">
                  👤 {op.label}
                </option>
              ))}
              {povOptions.filter(o => o.type === 'story_persona').map(p => (
                <option key={p.id} value={p.name} className="bg-slate-950 text-emerald-200">
                  🎭 {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Create Story Component / Element Extractor */}
          <button
            type="button"
            onClick={() => {
              const sel = window.getSelection()?.toString() || '';
              setExtractInitialText(sel || (content ? content.replace(/<[^>]+>/g, ' ').slice(0, 300) : ''));
              setIsExtractorModalOpen(true);
              AudioService.playTerminalBeep(1200, 0.03);
            }}
            className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/50 text-purple-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Extract or create game component (Persona, Item, Smart Prop, Hazard) from story"
          >
            <Box size={11} className="text-purple-400" />
            <span className="hidden sm:inline">+ Component</span>
          </button>

          {/* In-Book Story Wiki Button */}
          <button
            type="button"
            onClick={() => {
              setIsWikiDrawerOpen(prev => !prev);
              AudioService.playTerminalBeep(1100, 0.02);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              isWikiDrawerOpen
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/50'
            }`}
            title="Open In-Book Story Wiki & World Elements"
          >
            <span>📖</span>
            <span className="hidden sm:inline">Wiki</span>
            {referencedElements.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[9px] font-bold">
                {referencedElements.length}
              </span>
            )}
          </button>

          {/* Epistemic Play: Terminal Hacking & NPC Interrogation */}
          <button
            type="button"
            onClick={() => {
              setIsEpistemicPanelOpen(true);
              AudioService.playTerminalBeep(1400, 0.03);
            }}
            className="px-2.5 py-1 bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/50 text-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Open Epistemic Play: Open-Ended Terminal Hacking & Free-Form NPC Interrogation"
          >
            <Terminal size={11} className="text-emerald-400" />
            <span className="hidden sm:inline">Epistemic Play</span>
          </button>

          {/* AI Authoring Dropdown */}
          <div className="relative group">
            <button
              type="button"
              disabled={isAiWorking}
              className="px-2.5 py-1 bg-gradient-to-r from-cyan-950 to-purple-950 hover:from-cyan-900 hover:to-purple-900 border border-cyan-500/50 text-cyan-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Wand2 size={11} className="text-cyan-400" />
              <span>AI Assist</span>
              <ChevronDown size={10} className="text-slate-400" />
            </button>

            <div className="absolute right-0 mt-1 w-48 bg-slate-900/98 border border-cyan-500/40 rounded-xl shadow-2xl py-1 z-50 backdrop-blur-xl text-xs divide-y divide-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
              <button
                onClick={() => handleAiPairAuthor('continue')}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
              >
                <span>⚡</span> Continue Narrative
              </button>
              <button
                onClick={() => handleAiPairAuthor('expand')}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
              >
                <span>✨</span> Expand Details
              </button>
              <button
                onClick={() => handleAiPairAuthor('polish')}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
              >
                <span>🪄</span> Polish Prose
              </button>
              <button
                onClick={() => handleAiPairAuthor('reactive_flavor')}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-cyan-300 hover:text-cyan-200 flex items-center gap-2 cursor-pointer"
              >
                <span>⚡</span> Reactive Flavor
              </button>
              <button
                onClick={handleExtractDeltas}
                className="w-full text-left px-3 py-1.5 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 flex items-center gap-2 cursor-pointer"
              >
                <span>📜</span> Deduce Deltas
              </button>
            </div>
          </div>

          {/* Consolidated Actions Pulldown (Copy, Export, Sub-Scenario, Delete) */}
          <div className="relative group">
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
              title="Scenario Actions (Copy, Export, Sub-Elements, Delete)"
            >
              <MoreHorizontal size={14} />
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-slate-900/98 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 backdrop-blur-xl text-xs divide-y divide-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
              <div className="py-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Copy size={12} className="text-cyan-400" />
                  <span>{copied ? 'Copied!' : 'Copy Prose'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Download size={12} className="text-amber-400" />
                  <span>Export Markdown (.md)</span>
                </button>
              </div>
              {(handleOpenAddModal || handleDeleteElement) && (
                <div className="py-1">
                  {handleOpenAddModal && (
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(activeNode?.id)}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-cyan-300 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>+ Sub-Scenario</span>
                    </button>
                  )}
                  {handleDeleteElement && (
                    <button
                      type="button"
                      onClick={() => handleDeleteElement(activeNode?.id, activeNode?.title)}
                      className="w-full text-left px-3 py-1.5 hover:bg-red-950/60 text-red-400 hover:text-red-300 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Delete Scenario...</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── REFERENCED STORY ELEMENTS HORIZONTAL QUICK STRIP ── */}
      {referencedElements.length > 0 && weaverTab === 'manuscript' && (
        <div className="px-3 py-1 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs font-mono scrollbar-none z-10 shrink-0">
          <span className="text-[10px] uppercase font-bold text-amber-400/90 flex items-center gap-1 shrink-0 pr-1.5 border-r border-slate-800">
            <span>🔗</span> Referenced ({referencedElements.length}):
          </span>
          {referencedElements.map(el => (
            <button
              key={el.id}
              type="button"
              onClick={() => {
                setEditingWikiElement(el);
                AudioService.playTerminalBeep(1100, 0.02);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-400/60 text-slate-200 hover:text-amber-300 flex items-center gap-1.5 text-[11px] shrink-0 transition-colors cursor-pointer"
              title={`Click to edit ${el.title} in-situ without leaving the book`}
            >
              <span className={`text-[8px] font-extrabold uppercase px-1 py-0.2 rounded border ${getTypePillStyle(el.type)}`}>
                {el.type}
              </span>
              <span className="font-bold">{el.title}</span>
              <Edit3 size={10} className="text-slate-400 hover:text-amber-300" />
            </button>
          ))}
        </div>
      )}

      {/* AI Working Banner */}
      {isAiWorking && (
        <div className="px-4 py-1.5 bg-cyan-950/90 border-b border-cyan-400/50 text-cyan-300 text-xs flex items-center gap-2 font-mono shrink-0 animate-pulse">
          <Loader2 size={13} className="animate-spin text-cyan-400 shrink-0" />
          <span>{aiActionLabel || 'AI authoring assistant active...'}</span>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-14 right-6 z-40 bg-slate-900 border border-cyan-500 text-cyan-200 text-xs px-3 py-1.5 rounded-xl shadow-2xl font-mono animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* ── MANUSCRIPT VIEWPORT & QUICK-START LAUNCHPAD ── */}
      {!activeNode ? (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-[#070b13] text-center font-mono">
          <div className="max-w-xl w-full p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg">
              <Sparkles size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Adventure Development Environment
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose a foundation below or select a module from the Guide Rail on the left to begin architecting:
              </p>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {/* Action 1: Create First Scenario */}
              <button
                type="button"
                onClick={() => {
                  const newId = uuidv4();
                  if (typeof addStory === 'function') {
                    addStory({
                      id: newId,
                      title: 'Act I: The Inciting Incident',
                      content: '<p><em>The operative stepped onto the pressurized platform, the neon glow of the colony filtering through the atmospheric haze...</em></p>',
                      type: 'Scenario'
                    });
                  }
                  if (typeof setActiveScenarioId === 'function') {
                    setActiveScenarioId(newId);
                  }
                  AudioService.playCriticalChime(true);
                }}
                className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/60 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-cyan-400 mb-1 font-bold text-xs">
                  <Feather size={14} />
                  <span>Start New Scenario</span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                  Begin prose manuscript drafting with character POV &amp; AIME Co-Pilot.
                </p>
              </button>

              {/* Action 2: Spawn Battlemap Sector */}
              <button
                type="button"
                onClick={() => {
                  handleCreateMapForScenario();
                }}
                className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/60 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-purple-400 mb-1 font-bold text-xs">
                  <Target size={14} />
                  <span>Spawn Tactical Sector</span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                  Create a WebGPU tactical grid with tokens, dynamic lighting, and fog.
                </p>
              </button>

              {/* Action 3: Story Elements & Foundations */}
              <button
                type="button"
                onClick={() => {
                  setIsExtractorModalOpen(true);
                }}
                className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/60 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-emerald-400 mb-1 font-bold text-xs">
                  <Box size={14} />
                  <span>Forge Story Elements</span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                  Create foundational Personas, Items, Factions, Tech, Encounters, and Lore.
                </p>
              </button>

              {/* Action 4: Guidance Gems */}
              <button
                type="button"
                onClick={() => {
                  setIsAimeGuidanceOpen(true);
                }}
                className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/60 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-amber-400 mb-1 font-bold text-xs">
                  <Sparkles size={14} />
                  <span>Guidance Gems &amp; AIME</span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                  Pick sci-fi subgenres, narrative mood modifiers, and world tags.
                </p>
              </button>
            </div>
          </div>
        </div>
      ) : weaverTab === 'manuscript' ? (
        <div className="flex-1 flex flex-row min-h-0 bg-[#090d16] relative z-10 overflow-hidden">
          {/* Main Canvas Editor with Drop Zone */}
          <div 
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'copy';
              if (!isDragOverCanvas) setIsDragOverCanvas(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragOverCanvas(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsDragOverCanvas(false);
              }
            }}
            onDrop={handleCanvasDrop}
            className="flex-1 flex flex-col min-h-0 relative quill-dark-wrapper overflow-hidden"
          >
            {/* Visual Drag Over Indicator */}
            {isDragOverCanvas && (
              <div className="absolute inset-0 z-40 bg-cyan-950/85 border-2 border-dashed border-cyan-400 rounded-xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs pointer-events-none animate-in fade-in duration-100 select-none font-mono">
                <div className="w-12 h-12 rounded-2xl bg-cyan-900/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-xl mb-2 animate-bounce">
                  <Link2 size={24} />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Drop Element to Link into Story Canvas
                </span>
                <span className="text-xs text-cyan-300 mt-1">
                  Inserts [[Wiki Link]] &amp; provides instant in-situ element editing
                </span>
              </div>
            )}

            {/* Recently Dropped Element Floating Action Bar */}
            {recentlyDroppedElement && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-slate-900/98 border border-cyan-500/60 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2 text-xs font-mono select-none">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <Sparkles size={12} className="text-cyan-400" />
                  <span>Linked: <strong className="text-white">{recentlyDroppedElement.title}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleEmbedElementContent(recentlyDroppedElement);
                    setRecentlyDroppedElement(null);
                  }}
                  className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-[10px] uppercase cursor-pointer transition-colors"
                  title="Embed element description directly into prose"
                >
                  Embed Prose
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingWikiElement(recentlyDroppedElement);
                    setRecentlyDroppedElement(null);
                  }}
                  className="px-2 py-0.5 rounded bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-bold text-[10px] uppercase cursor-pointer transition-colors"
                  title="Edit element details in-situ"
                >
                  Edit Element
                </button>
                <button
                  type="button"
                  onClick={() => setRecentlyDroppedElement(null)}
                  className="text-slate-500 hover:text-white text-xs cursor-pointer ml-1"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            )}

            <ReactQuill 
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={handleContentChange}
              modules={quillModules}
              className="h-full flex flex-col"
              placeholder="Draft story prose, chapter narrative, sensory atmosphere, or dialogue... Tip: Drag elements from the left rail or type [[Element Name]] for instant wiki links!"
            />
            <AimeCanvasSculptor
              quillRef={quillRef}
              activeNode={activeNode}
              elementsCatalog={elementsCatalog}
              guidanceGems={guidanceGems}
              activePov={activePov}
              onApplySculpt={handleContentChange}
              onShowToast={showToast}
            />
          </div>

          {/* IN-BOOK STORY WIKI & WORLD ELEMENTS DRAWER */}
          {isWikiDrawerOpen && (
            <div className="w-80 md:w-96 border-l border-slate-800 bg-[#0a0e18] flex flex-col shrink-0 h-full overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200 z-20 font-mono">
              {/* Drawer Header */}
              <div className="p-3 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm">📖</span>
                  <span className="text-xs font-bold text-slate-100 tracking-wide">Story Wiki & Elements</span>
                  <span className="text-[10px] text-slate-500">({elementsCatalog?.length || 0})</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCreateNewElement('Persona')}
                    className="p-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Create a new world element directly inside this book"
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWikiDrawerOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                    title="Close Wiki Drawer"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="p-2.5 border-b border-slate-800 space-y-2 bg-slate-950/40 shrink-0">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={wikiSearch}
                    onChange={(e) => setWikiSearch(e.target.value)}
                    placeholder="Search world elements..."
                    className="w-full pl-7 pr-2.5 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-400/60 font-sans"
                  />
                  {wikiSearch && (
                    <button
                      type="button"
                      onClick={() => setWikiSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 text-[10px]">
                  {['All', 'Referenced', 'Persona', 'Faction', 'Location', 'Item', 'Lore'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setWikiTypeFilter(t)}
                      className={`px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors shrink-0 ${
                        wikiTypeFilter === t
                          ? 'bg-amber-400 text-black font-extrabold shadow-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Elements List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin">
                {filteredWikiElements.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs font-mono space-y-2">
                    <p>No world elements match criteria.</p>
                    <button
                      type="button"
                      onClick={() => handleCreateNewElement('Persona')}
                      className="text-amber-400 hover:underline cursor-pointer text-[11px] font-bold"
                    >
                      + Create new element
                    </button>
                  </div>
                ) : (
                  filteredWikiElements.map((elem) => {
                    const isRef = referencedElements.some(r => r.id === elem.id);
                    return (
                      <div
                        key={elem.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isRef
                            ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getTypePillStyle(elem.type)}`}>
                                {elem.type}
                              </span>
                              <span className="font-bold text-slate-200 text-xs truncate max-w-[150px]">
                                {elem.title}
                              </span>
                              {isRef && (
                                <span className="text-[8px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-500/30">
                                  IN STORY
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-sans">
                              {elem.fields?.oneLinePitch || elem.fields?.description || elem.content?.replace(/<[^>]+>/g, ' ').slice(0, 100) || 'No description recorded.'}
                            </p>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleInsertWikiLink(elem.title)}
                            className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 cursor-pointer font-bold transition-colors"
                            title={`Insert [[${elem.title}]] link into your prose`}
                          >
                            <Link2 size={10} />
                            <span>+ [[Link]]</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingWikiElement(elem);
                              AudioService.playTerminalBeep(1100, 0.02);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer font-bold transition-colors"
                            title={`Edit ${elem.title} in-situ`}
                          >
                            <Edit3 size={10} className="text-amber-400" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* ── TAB VIEW 2: OUTLINE & SCENE BEATS ── */}
      {weaverTab === 'outline' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0e17] space-y-6 scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Architect Ideation Studio (Preserving Human Intentionality) */}
            <div className="bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-indigo-950/40 border border-purple-500/40 rounded-2xl p-4 md:p-5 space-y-3 shadow-xl backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      Architect Ideation Studio
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/70 border border-purple-400/40 text-purple-300 uppercase font-bold">
                        Human Authority
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl">
                      Preserve creative control: Author pivotal narrative nodes with stepped human ideation. Restricts AI from unsolicited generation; calls AIME solely as a responsive flavor layer reacting to Folio vitals and atmospheric weather.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenIdeationModal('Climax')}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Human-guided Climax node ideation"
                  >
                    <span>⚡</span>
                    <span>Ideate Climax</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenIdeationModal('Resolution')}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Human-guided Resolution node ideation"
                  >
                    <span>🎯</span>
                    <span>Ideate Resolution</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenIdeationModal('Crisis')}
                    className="px-3 py-1.5 bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Human-guided Crisis / Beat ideation"
                  >
                    <span>🛡️</span>
                    <span>Ideate Crisis Beat</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Story Outline Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Scenario Plot Outline
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateOutline}
                  disabled={isGeneratingOutline}
                  className="px-3 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingOutline ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  <span>{outline ? 'Regenerate Outline' : 'Generate Outline'}</span>
                </button>
              </div>

              <textarea
                value={outline}
                onChange={e => {
                  setOutline(e.target.value);
                  if (activeNode?.id) {
                    updateStory(activeNode.id, {
                      fields: { ...(activeNode.fields || {}), storyOutline: e.target.value }
                    });
                  }
                }}
                rows={8}
                placeholder="Author or generate structured 3-act plot outline..."
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500/60 text-slate-100 p-3 rounded-xl text-xs leading-relaxed outline-none select-text"
              />
            </div>

            {/* Scene Beats Progression Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Tactical Scene Beats Progression
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateBeats}
                  disabled={isGeneratingBeats}
                  className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-xs font-bold rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingBeats ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  <span>{sceneBeats ? 'Suggest Next Beats' : 'Generate Scene Beats'}</span>
                </button>
              </div>

              <textarea
                value={sceneBeats}
                onChange={e => {
                  setSceneBeats(e.target.value);
                  if (activeNode?.id) {
                    updateStory(activeNode.id, {
                      fields: { ...(activeNode.fields || {}), sceneBeats: e.target.value }
                    });
                  }
                }}
                rows={8}
                placeholder="Define chronological scene-by-scene beats and tactical milestones..."
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-500/60 text-slate-100 p-3 rounded-xl text-xs leading-relaxed outline-none select-text"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB VIEW 3: TACTICAL BATTLEMAP & LIVE STAGE EVENTS ── */}
      {weaverTab === 'tactical' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0e17] space-y-6 scrollbar-thin">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header / Map Card */}
            {linkedMap ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-lg shadow-sm">
                      🗺️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-wide">{linkedMap.title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 uppercase font-bold">
                          {linkedMap.gridMode || 'Square Grid'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        Stage Map ID: {linkedMap.id} • Dimension: {linkedMap.width || 40}×{linkedMap.height || 30} cells
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1300, 0.04);
                        if (typeof setActiveMapId === 'function') setActiveMapId(linkedMap.id);
                        if (typeof onSelectScenarioWorkspaceTab === 'function') {
                          onSelectScenarioWorkspaceTab('stage');
                        } else {
                          navigate(`/stage?mapId=${linkedMap.id}&scenarioId=${activeNode?.id}`);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
                      title="Launch this battlemap live in the Integrated Tactical Stage"
                    >
                      <span>⚔️</span>
                      <span>Deploy to STAGE</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateTacticalProse}
                      disabled={isGeneratingTacticalProse}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-blue-900/80 to-cyan-900/80 hover:from-blue-850 hover:to-cyan-850 border border-cyan-400/50 text-cyan-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      title="Synthesize atmospheric read-aloud description from map features using AIME"
                    >
                      {isGeneratingTacticalProse ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-amber-400" />}
                      <span>Synthesize Read-Aloud Prose</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStory(activeNode.id, { mapId: null })}
                      className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Unlink
                    </button>
                  </div>
                </div>

                {/* 2-Column Split: Tactical Map Elements Driving Story vs Live Stage Events */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
                  {/* Left Column: Map Elements & Objects */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={13} className="text-cyan-400" />
                        <span>Interactive Objects &amp; Bulkheads ({(linkedMap.objects || []).length})</span>
                      </span>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                      {(linkedMap.objects || []).length === 0 ? (
                        <div className="p-3 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 italic">
                          No architectural interactive objects placed on this map yet.
                        </div>
                      ) : (
                        linkedMap.objects.map((obj, idx) => (
                          <div
                            key={obj.id || idx}
                            className="p-2.5 bg-slate-950/80 border border-slate-850 hover:border-slate-700 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                                <span className="text-[10px] text-cyan-400 uppercase font-mono">[{obj.type || obj.shape || 'PROP'}]</span>
                                <span className="truncate">{obj.label || `Object #${idx + 1}`}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Pos: ({Math.round(obj.x || 0)}, {Math.round(obj.y || 0)}) {obj.storyElementId ? `• Linked Node: ${obj.storyElementId}` : ''}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const mention = ` @${obj.label || obj.type || 'Object'} `;
                                handleContentChange((content ? content + ' ' : '') + mention);
                                showToast(`Inserted @${obj.label || obj.type} mention`);
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-cyan-950/70 hover:bg-cyan-800 border border-cyan-500/40 text-cyan-300 rounded-lg uppercase tracking-wider transition-colors shrink-0"
                              title="Mention in scenario prose"
                            >
                              @Mention
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Tokens & Entities glancing */}
                    <div className="pt-2">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <UserCheck size={13} className="text-purple-400" />
                        <span>Deployed Tokens &amp; Operatives ({(linkedMap.tokens || []).length})</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(linkedMap.tokens || []).length === 0 ? (
                          <span className="text-xs text-slate-500 italic">No combat tokens deployed.</span>
                        ) : (
                          linkedMap.tokens.map((t, idx) => (
                            <span
                              key={t.id || idx}
                              className="px-2 py-1 bg-slate-950 border border-purple-500/30 text-purple-200 rounded-lg text-xs font-mono flex items-center gap-1"
                            >
                              <span>👤</span>
                              <span>{t.name || t.label || `Token #${idx + 1}`}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Event Chronicle & Narrative Link */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={13} className="text-amber-400" />
                        <span>Live Stage Narrative Feed ({tacticalEvents.length})</span>
                      </span>
                      {tacticalEvents.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setTacticalEvents([])}
                          className="text-[10px] text-slate-500 hover:text-slate-300 uppercase font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                      {tacticalEvents.length === 0 ? (
                        <div className="p-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl text-center space-y-1.5">
                          <Radio size={16} className="text-slate-600 mx-auto animate-pulse" />
                          <p className="text-xs text-slate-400 font-bold">Awaiting Stage Interactions</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            When operatives breach bulkheads, access terminals, toggle hazards, or trigger story milestones on The Stage, real-time events appear here.
                          </p>
                        </div>
                      ) : (
                        tacticalEvents.map(evt => (
                          <div
                            key={evt.id}
                            className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 font-mono text-[11px] flex items-center gap-1">
                                <Zap size={11} className="text-amber-400" />
                                {evt.type.replace(/-/g, ' ')}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{evt.time}</span>
                            </div>
                            <div className="text-[11px] text-slate-300">
                              {evt.type === 'stage-bulkhead-toggled' && (
                                <span>Bulkhead door {evt.detail?.isOpen ? 'opened' : 'sealed'}{evt.detail?.operativeId ? ` by operative ${evt.detail.operativeId}` : ''}.</span>
                              )}
                              {evt.type === 'story-foundry-node-triggered' && (
                                <span>Terminal accessed: {evt.detail?.action || 'Encrypted Node Decrypted'}.</span>
                              )}
                              {evt.type === 'stage-hazard-toggled' && (
                                <span>Hazard emitter {evt.detail?.isActive ? 'activated' : 'vented/deactivated'}.</span>
                              )}
                              {evt.type === 'omnicortex-loot-dispensed' && (
                                <span>Loot crate dispensed gear item {evt.detail?.omnicortexGearId || ''}.</span>
                              )}
                              {evt.type === 'story-foundry-milestone-reached' && (
                                <span>
                                  {evt.detail?.beatText ? (
                                    <>Milestone Beat #{((evt.detail?.beatIndex ?? 0) + 1)}: <strong className="text-amber-200">{evt.detail.beatText}</strong> ({evt.detail?.isCompleted ? 'Accomplished' : 'Reset'})</>
                                  ) : (
                                    <>Story milestone beacon reached by operative.</>
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="pt-1 flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleDraftAftermathToProse(evt)}
                                disabled={isAiWorking}
                                className="px-2 py-0.5 text-[9px] font-bold bg-purple-950/70 hover:bg-purple-800 border border-purple-500/40 text-purple-200 rounded uppercase transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                title="Draft an AI aftermath paragraph describing consequences of this event"
                              >
                                <Sparkles size={10} className="text-purple-300" />
                                <span>✦ Draft Aftermath</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLogEventToProse(evt)}
                                className="px-2 py-0.5 text-[9px] font-bold bg-amber-950/60 hover:bg-amber-800 border border-amber-500/40 text-amber-200 rounded uppercase transition-colors cursor-pointer"
                              >
                                + Log Note
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* No Map Linked - Connect with Map Catalog */
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg text-center max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-2xl mx-auto shadow-inner">
                  🗺️
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white tracking-wide">Connect Tactical Battlemap to Scenario</h3>
                  <p className="text-xs text-slate-400">
                    Intertwine this scenario node with the Map Catalog. Map actions and triggers will directly narrate and drive your campaign progression.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-left">
                  {allAvailableMaps.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 block">
                        Select Existing Map from Catalog ({allAvailableMaps.length} Available):
                      </label>
                      <select
                        value={activeNode?.mapId || ''}
                        onChange={e => {
                          const val = e.target.value || null;
                          updateStory(activeNode.id, { mapId: val });
                          if (val) setActiveMapId(val);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs p-2.5 rounded-xl outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="">-- Choose Map from Catalog --</option>
                        {allAvailableMaps.map(m => (
                          <option key={m.id} value={m.id}>
                            🗺️ {m.title || 'Untitled Map'} {m.gridMode ? `(${m.gridMode})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleCreateMapForScenario}
                      className="px-4 py-2 bg-gradient-to-r from-blue-900 to-cyan-900 hover:from-blue-800 hover:to-cyan-800 border border-cyan-400/60 text-cyan-200 hover:text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus size={14} />
                      <span>Create New Scenario Encounter Map</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB VIEW 4: CREATIVE GENESIS & PREMISE ── */}
      {weaverTab === 'genesis' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0e17] space-y-6 scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Brainstorming Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Premise &amp; Conflict Synthesis
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide an imaginative seed, seed phrase, or prompt. The AI narrative engine will synthesize 3 dramatic hooks tailored to the Tangent SFF RPG setting.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={premisePrompt}
                  onChange={e => setPremisePrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleBrainstormPremise(); }}
                  placeholder="e.g. Derelict research orbital transmitting ghost telemetry from the Veil..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500/60 text-slate-100 p-2.5 rounded-xl text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleBrainstormPremise}
                  disabled={isBrainstorming || !premisePrompt.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isBrainstorming ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  <span>Brainstorm</span>
                </button>
              </div>
            </div>

            {/* Guidance Gems Overview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>💎</span> Active Guidance Gems Context
              </span>
              <p className="text-xs text-slate-400">
                These creative tags shape all narrative generation across the Story Weaver and AI Overseer:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(universeState?.creativeState?.gems || []).length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No Guidance Gems active. Click 💎 Gems in the top bar to configure mood, tone, pacing, and conflict.</span>
                ) : (
                  universeState.creativeState.gems.map((gem, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1"
                    >
                      <span>💎</span> {gem}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Element Extractor / Component Creator Modal */}
      <StoryElementExtractorModal
        isOpen={isExtractorModalOpen}
        onClose={() => setIsExtractorModalOpen(false)}
        initialText={extractInitialText}
        activeNode={activeNode}
        onCreated={(newElem) => {
          showToast(`✓ Component "${newElem.title}" registered to Omnicortex & Story!`);
        }}
      />

      {/* AIME Guidance Flyout for Story & Scenario Components */}
      {isAimeGuidanceOpen && (
        <AimeGuidanceFlyout
          isOpen={isAimeGuidanceOpen}
          onClose={() => setIsAimeGuidanceOpen(false)}
          targetType="Story"
          contextData={activeNode}
          onApplyGuidance={(suggestion) => {
            handleContentChange((content ? content + '<br/><br/>' : '') + `<p>${suggestion.replace(/\n\n/g, '</p><p>')}</p>`);
            showToast('✓ AIME guidance appended to Manuscript');
          }}
        />
      )}

      {/* In-Situ Element Forge Modal within Story Weaver Book */}
      {editingWikiElement && (
        <EditElementModal
          isOpen={!!editingWikiElement}
          onClose={() => setEditingWikiElement(null)}
          element={editingWikiElement}
          onSave={handleSaveWikiElement}
          onDelete={handleDeleteWikiElement}
        />
      )}

      {/* Architect Ideation Modal (Human-Guided Climax/Resolution & Sensory Flavor Layer) */}
      {isIdeationModalOpen && (
        <ArchitectIdeationModal
          isOpen={isIdeationModalOpen}
          onClose={() => setIsIdeationModalOpen(false)}
          activeNode={activeNode}
          initialNodeType={selectedIdeationType}
          folioCharacter={characterData}
          onCommitNode={handleCommitArchitectNode}
        />
      )}

      {/* Epistemic Play Panel (Terminal Hacking & Free-Form Interrogation) */}
      {isEpistemicPanelOpen && (
        <EpistemicPlayPanel
          isOpen={isEpistemicPanelOpen}
          onClose={() => setIsEpistemicPanelOpen(false)}
          activeOperative={characterData}
          onInsertToProse={handleInsertEpistemicToProse}
        />
      )}
    </div>
  );
}
