import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Dna, Globe, Briefcase, Activity, FileText, Pin } from 'lucide-react';
import DraggablePanel from '../../pages/Foundry/MapMaker/map/DraggablePanel';
import { useFolio } from '../../context/FolioContext';
import { useDBM } from '../../context/DBMContext';
import { sendBastionChatMessage, parseRollCommand, generateSelectiveFields } from '../../services/bastionService';
import {
  synthesizeCharacterWithBastion,
  getArchetypeRecommendations,
  getSpeciesRecommendations,
  getFactionRecommendations,
  getOriginRecommendations,
  getOccupationRecommendations,
  calculateRulesLedger
} from '../../services/bastionCharacterEngine';
import { DEFAULT_ARCHETYPES } from '../../data/archetypesData.js';
import { DEFAULT_SPECIES } from '../../data/speciesData.js';
import { DEFAULT_FACTIONS } from '../../data/factionsData.js';
import { DEFAULT_ORIGINS } from '../../data/originsData.js';
import { DEFAULT_OCCUPATIONS } from '../../data/occupationsData.js';
import { UniversalCatalogModal } from '../UI/UniversalCatalogModal';

const normalizeChipList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.flatMap(item => {
      if (typeof item === 'string') return item.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
      if (typeof item === 'object' && item !== null) return item.name || item.title || item.id || '';
      return String(item);
    }).filter(Boolean);
  }
  if (typeof val === 'number') return [`${val}`];
  if (typeof val === 'string') return val.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  return [];
};

const CHARACTER_FIELDS = [
  // Core Identity
  { key: 'char-name', label: 'Persona Name', category: 'Core Identity' },
  { key: 'char-archetype', label: 'Archetype', category: 'Core Identity' },
  { key: 'char-species', label: 'Species', category: 'Core Identity' },
  { key: 'char-occu', label: 'Occupation / Role', category: 'Core Identity' },
  { key: 'char-origin', label: 'Origin / Homeworld', category: 'Core Identity' },
  { key: 'char-faction', label: 'Faction Allegiance', category: 'Core Identity' },
  { key: 'char-style', label: 'Aesthetic / Style', category: 'Core Identity' },
  { key: 'notes', label: 'Tactical Notes', category: 'Core Identity' },

  // Narrative 1: Profile & Identity (8 fields)
  { key: 'role', label: 'Role in Story', category: 'Profile & Identity' },
  { key: 'char-concept', label: 'Persona Archetype / Concept', category: 'Profile & Identity' },
  { key: 'summary', label: 'One-Sentence Summary', category: 'Profile & Identity' },
  { key: 'char-motive', label: 'Core Motivation', category: 'Profile & Identity' },
  { key: 'primaryConflict', label: 'Primary Conflict/Goal', category: 'Profile & Identity' },
  { key: 'nicknames', label: 'Nicknames / Aliases', category: 'Profile & Identity' },
  { key: 'socialClass', label: 'Social Class & Status', category: 'Profile & Identity' },
  { key: 'currentResidence', label: 'Current Residence', category: 'Profile & Identity' },

  // Narrative 2: Physicality & Persona (9 fields)
  { key: 'appearance', label: 'Physical Description', category: 'Physicality & Persona' },
  { key: 'voice', label: 'Voice & Speech', category: 'Physicality & Persona' },
  { key: 'clothing', label: 'Typical Clothing Style', category: 'Physicality & Persona' },
  { key: 'mannerisms', label: 'Mannerisms & Body Language', category: 'Physicality & Persona' },
  { key: 'positiveTraits', label: 'Positive Traits', category: 'Physicality & Persona' },
  { key: 'negativeTraits', label: 'Negative Traits / Flaws', category: 'Physicality & Persona' },
  { key: 'likesDislikes', label: 'Likes & Dislikes', category: 'Physicality & Persona' },
  { key: 'hobbies', label: 'Hobbies & Skills', category: 'Physicality & Persona' },
  { key: 'personalityType', label: 'Personality Type', category: 'Physicality & Persona' },

  // Narrative 3: History & Backstory (6 fields)
  { key: 'backstory', label: 'Detailed Backstory', category: 'History & Backstory' },
  { key: 'definingTrauma', label: 'Defining Trauma / Wound', category: 'History & Backstory' },
  { key: 'greatestAccomplishment', label: 'Greatest Accomplishment(s)', category: 'History & Backstory' },
  { key: 'childhoodEvents', label: 'Childhood & Adolescence Events', category: 'History & Backstory' },
  { key: 'keyRelationships', label: 'Key Relationships & Dynamics', category: 'History & Backstory' },
  { key: 'romanticHistory', label: 'Romantic History & Philosophy', category: 'History & Backstory' },

  // Narrative 4: Psychology & Metanarrative (8 fields)
  { key: 'worldview', label: 'Worldview & Ethics', category: 'Psychology & Metanarrative' },
  { key: 'theLie', label: 'The Lie They Believe', category: 'Psychology & Metanarrative' },
  { key: 'theTruth', label: 'The Truth They Must Learn', category: 'Psychology & Metanarrative' },
  { key: 'deepestFear', label: 'Deepest Fear & Secret', category: 'Psychology & Metanarrative' },
  { key: 'goals', label: 'External Goal vs Internal Need', category: 'Psychology & Metanarrative' },
  { key: 'stakes', label: 'Stakes & Persona Arc', category: 'Psychology & Metanarrative' },
  { key: 'plotHooks', label: 'Plot Connection & Motives', category: 'Psychology & Metanarrative' },
  { key: 'tags', label: 'Tags', category: 'Psychology & Metanarrative' }
];

const CATEGORIES = [
  'Core Identity',
  'Profile & Identity',
  'Physicality & Persona',
  'History & Backstory',
  'Psychology & Metanarrative'
];

const BASTION_CHAT_STORAGE_KEY = 'tangent_bastion_chat_history_v1';

const DEFAULT_BASTION_GREETING = [
  {
    sender: 'bastion',
    text: 'Greetings, OPERATOR. BASTION AI Assistant online across the platform. How can I assist with rules, Omnicortex lore, or your Tangent SFF RPG persona today? Type /persona [concept] to synthesize a canonical 5-pillar persona, /roll [dice] to roll dice (e.g. /roll 2d10+4), or /clear to reset our conversation.'
  }
];

const BastionDrawer = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { characterData, updateField, applyGuidedCharacter } = useFolio() || {};
  const dbmContext = useDBM() || {};
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'generator'
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Dock / Undock state (Persisted in localStorage)
  const [isDocked, setIsDocked] = useState(() => {
    try {
      const saved = localStorage.getItem('bastion_folio_dock_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const toggleDock = () => {
    setIsDocked(prev => {
      const next = !prev;
      try {
        localStorage.setItem('bastion_folio_dock_mode', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Persistent Platform-Wide Chat State (stays in conversation across all routes until cleared)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(BASTION_CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_BASTION_GREETING;
  });
  const [inputVal, setInputVal] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedConversation, setCopiedConversation] = useState(false);
  const [copiedBlockIdx, setCopiedBlockIdx] = useState(null);
  const [expandedBlocks, setExpandedBlocks] = useState({});

  // Persist conversation history across routes & reloads until cleared
  useEffect(() => {
    try {
      localStorage.setItem(BASTION_CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Auto-scroll to newest message when open on chat tab
  useEffect(() => {
    if (isOpen && activeTab === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isChatLoading, isOpen, activeTab]);

  // Listen for prefilled prompts from context menus or global triggers
  useEffect(() => {
    const handlePrefillPrompt = (e) => {
      const prefill = e?.detail?.prompt;
      if (prefill && typeof prefill === 'string' && prefill.trim()) {
        setActiveTab('chat');
        setInputVal(prefill.trim());
      }
    };
    window.addEventListener('toggle-folio-bastion', handlePrefillPrompt);
    window.addEventListener('toggle-bastion-drawer', handlePrefillPrompt);
    window.addEventListener('open-bastion-drawer', handlePrefillPrompt);
    return () => {
      window.removeEventListener('toggle-folio-bastion', handlePrefillPrompt);
      window.removeEventListener('toggle-bastion-drawer', handlePrefillPrompt);
      window.removeEventListener('open-bastion-drawer', handlePrefillPrompt);
    };
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages(DEFAULT_BASTION_GREETING);
    setExpandedBlocks({});
    try {
      localStorage.removeItem(BASTION_CHAT_STORAGE_KEY);
    } catch (e) {}
  }, []);

  const handleCopyConversation = useCallback(() => {
    const transcript = messages
      .map(m => `[${m.sender === 'user' ? 'OPERATOR' : 'BASTION'}]:\n${m.text}`)
      .join('\n\n---\n\n');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(transcript).catch(() => {});
    }
    setCopiedConversation(true);
    setTimeout(() => setCopiedConversation(false), 2000);
  }, [messages]);

  const handleCopyBlock = useCallback((text, idx) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text || '').catch(() => {});
    }
    setCopiedBlockIdx(idx);
    setTimeout(() => {
      setCopiedBlockIdx(prev => (prev === idx ? null : prev));
    }, 2000);
  }, []);

  const toggleExpandBlock = useCallback((idx) => {
    setExpandedBlocks(prev => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  // Generator State
  const [generatorMode, setGeneratorMode] = useState('staged'); // 'staged' (user-in-the-loop) | 'synthesis' (1-click 5 pillars) | 'fields' (selective)
  const [synthesizedResult, setSynthesizedResult] = useState(null);
  const [selectedFields, setSelectedFields] = useState({
    'char-name': true,
    'char-concept': true,
    'char-motive': true,
    'backstory': true
  });
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState(null);
  // Overwrite protection mode: false = Fill Blank Only (default safe mode), true = Allow Overwriting
  const [overwriteMode, setOverwriteMode] = useState(false);

  // Staged Generator State (User in the Loop)
  const [stagedStep, setStagedStep] = useState(0); // 0: Archetype, 1: Species, 2: Faction & Origin, 3: Occupation, 4: Rules & Stats, 5: Dossier
  const [stagedPrompt, setStagedPrompt] = useState('');
  const [stagedArchetype, setStagedArchetype] = useState(null);
  const [stagedSpecies, setStagedSpecies] = useState(null);
  const [stagedFaction, setStagedFaction] = useState(null);
  const [stagedOrigin, setStagedOrigin] = useState(null);
  const [stagedOccupation, setStagedOccupation] = useState(null);
  const [stagedRawAttrs, setStagedRawAttrs] = useState({
    'attr-strength': 0,
    'attr-agility': 3,
    'attr-stamina': 1,
    'attr-intellect': 2,
    'attr-wisdom': 0,
    'attr-charisma': 0
  });
  const [stagedTechLevel, setStagedTechLevel] = useState(characterData?.['tech-level'] || 3);
  const [stagedCustomName, setStagedCustomName] = useState('');
  const [stagedCustomMotive, setStagedCustomMotive] = useState('');
  const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false);
  const [isStagedRailHovered, setIsStagedRailHovered] = useState(false);
  const [isStagedRailPinned, setIsStagedRailPinned] = useState(() => {
    try {
      return localStorage.getItem('tangent_bastion_staged_rail_pinned') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleStagedRailPin = useCallback((e) => {
    e?.stopPropagation?.();
    setIsStagedRailPinned(prev => {
      const next = !prev;
      try {
        localStorage.setItem('tangent_bastion_staged_rail_pinned', String(next));
      } catch {}
      return next;
    });
  }, []);

  const isStagedRailExpanded = isStagedRailPinned || isStagedRailHovered;

  // Staged Recommendations Computations
  const archetypeRecs = useMemo(() => {
    if (!stagedPrompt.trim()) return [];
    const recs = getArchetypeRecommendations(stagedPrompt, DEFAULT_ARCHETYPES, 3);
    if (stagedArchetype && !recs.some(r => r.archetype.name === stagedArchetype.name)) {
      return [
        {
          archetype: stagedArchetype,
          score: 100,
          isTopPick: false,
          rationale: 'Selected via Archetypes Selector Modal.'
        },
        ...recs.slice(0, 2)
      ];
    }
    return recs;
  }, [stagedPrompt, stagedArchetype]);

  const activeArchetype = stagedArchetype || archetypeRecs[0]?.archetype || DEFAULT_ARCHETYPES[0];

  // Sync stagedRawAttrs to the activeArchetype's Primary (+3) and Secondary (+2) attributes whenever activeArchetype changes
  useEffect(() => {
    if (!activeArchetype) return;
    const mapAttrKey = (name) => {
      const lower = String(name || '').toLowerCase().trim();
      if (lower.includes('strength') || lower.includes('might') || lower === 'str') return 'attr-strength';
      if (lower.includes('agility') || lower.includes('reflex') || lower === 'agi') return 'attr-agility';
      if (lower.includes('stamina') || lower.includes('con') || lower.includes('fortitude') || lower === 'sta') return 'attr-stamina';
      if (lower.includes('intellect') || lower.includes('logic') || lower.includes('reason') || lower === 'int') return 'attr-intellect';
      if (lower.includes('wisdom') || lower.includes('will') || lower.includes('perception') || lower === 'wis') return 'attr-wisdom';
      if (lower.includes('charisma') || lower.includes('etiquette') || lower === 'cha') return 'attr-charisma';
      return null;
    };
    const primKey = mapAttrKey(activeArchetype.primary_attribute) || 'attr-agility';
    const secKey = mapAttrKey(activeArchetype.secondary_attribute) || 'attr-intellect';
    const nextAttrs = {
      'attr-strength': 0,
      'attr-agility': 0,
      'attr-stamina': 0,
      'attr-intellect': 0,
      'attr-wisdom': 0,
      'attr-charisma': 0
    };
    nextAttrs[primKey] = (nextAttrs[primKey] || 0) + 3;
    nextAttrs[secKey] = (nextAttrs[secKey] || 0) + 2;
    setStagedRawAttrs(nextAttrs);
  }, [activeArchetype?.name]);

  const speciesRecs = useMemo(() => {
    return getSpeciesRecommendations(activeArchetype, stagedPrompt, DEFAULT_SPECIES, 3);
  }, [activeArchetype, stagedPrompt]);

  const activeSpecies = stagedSpecies || speciesRecs[0]?.species || DEFAULT_SPECIES[0];

  const factionRecs = useMemo(() => {
    return getFactionRecommendations(activeArchetype, stagedPrompt, DEFAULT_FACTIONS, 3);
  }, [activeArchetype, stagedPrompt]);

  const activeFaction = stagedFaction || factionRecs[0]?.faction || DEFAULT_FACTIONS[0];

  const originRecs = useMemo(() => {
    return getOriginRecommendations(activeArchetype, stagedPrompt, DEFAULT_ORIGINS, 3);
  }, [activeArchetype, stagedPrompt]);

  const activeOrigin = stagedOrigin || originRecs[0]?.origin || DEFAULT_ORIGINS[0];

  const occupationRecs = useMemo(() => {
    return getOccupationRecommendations(activeArchetype, stagedPrompt, DEFAULT_OCCUPATIONS, 3);
  }, [activeArchetype, stagedPrompt]);

  const activeOccupation = stagedOccupation || occupationRecs[0]?.occupation || DEFAULT_OCCUPATIONS[0];

  // Rules Ledger for Stage 4
  const stagedRulesLedger = useMemo(() => {
    return calculateRulesLedger({
      archetype: activeArchetype,
      species: activeSpecies,
      faction: activeFaction,
      origin: activeOrigin,
      occupation: activeOccupation,
      techLevel: stagedTechLevel,
      rawAttributes: stagedRawAttrs
    });
  }, [activeArchetype, activeSpecies, activeFaction, activeOrigin, activeOccupation, stagedTechLevel, stagedRawAttrs]);

  // Complete Dossier Synthesis for Stage 5
  const stagedPersonaResult = useMemo(() => {
    return synthesizeCharacterWithBastion({
      prompt: stagedPrompt,
      preferredArchetype: activeArchetype?.name,
      preferredSpecies: activeSpecies?.name,
      preferredFaction: activeFaction?.name,
      preferredOrigin: activeOrigin?.name,
      preferredOccupation: activeOccupation?.name,
      techLevel: stagedTechLevel,
      rawAttributes: stagedRawAttrs
    });
  }, [stagedPrompt, activeArchetype, activeSpecies, activeFaction, activeOrigin, activeOccupation, stagedTechLevel, stagedRawAttrs]);

  const handleApplyStagedPersona = async () => {
    if (!stagedPersonaResult?.character || !applyGuidedCharacter) return;
    setIsGenerating(true);
    try {
      const finalPayload = {
        ...stagedPersonaResult.character,
        'char-name': stagedCustomName.trim() || stagedPersonaResult.character['char-name'],
        'char-motive': stagedCustomMotive.trim() || stagedPersonaResult.character['char-motive']
      };
      const ok = await applyGuidedCharacter(finalPayload);
      if (ok) {
        setGenStatus({ success: `Applied Staged Persona "${finalPayload['char-name']}" to active Persona Folio!` });
      }
    } catch (err) {
      setGenStatus({ error: `Apply error: ${err.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInGuidedCreator = () => {
    if (!stagedPersonaResult?.character) return;
    const finalPayload = {
      ...stagedPersonaResult.character,
      'char-name': stagedCustomName.trim() || stagedPersonaResult.character['char-name'],
      'char-motive': stagedCustomMotive.trim() || stagedPersonaResult.character['char-motive']
    };
    try {
      localStorage.setItem('bastion_staged_draft', JSON.stringify(finalPayload));
      window.dispatchEvent(new CustomEvent('open-folio-guided-creator', { detail: finalPayload }));
      setGenStatus({ success: 'Loaded Staged Persona into Guided Persona Creator!' });
    } catch (e) {
      console.warn('Error saving staged draft to localStorage:', e);
    }
  };

  const updateRawAttr = (attrKey, delta) => {
    setStagedRawAttrs(prev => {
      const current = prev[attrKey] || 0;
      const next = Math.max(0, Math.min(4, current + delta)); // Canonical ceiling: max 4 at creation
      return { ...prev, [attrKey]: next };
    });
  };

  if (!isOpen) return null;

  const toggleField = (fieldKey) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const handleSynthesizePersona = async () => {
    if (!genPrompt.trim()) {
      setGenStatus({ error: 'Please enter a persona concept or theme before synthesizing.' });
      return;
    }
    setIsGenerating(true);
    setGenStatus(null);
    try {
      const result = synthesizeCharacterWithBastion({
        prompt: genPrompt,
        techLevel: characterData?.['tech-level'] || 3
      });
      if (result.success) {
        setSynthesizedResult(result);
        setGenStatus({
          success: `BASTION synthesized persona based on 5 Pillars: ${result.pillars.archetype.name} · ${result.pillars.species.name} · ${result.pillars.faction.name} · ${result.pillars.origin.name} · ${result.pillars.occupation.name}!`
        });
      } else {
        setGenStatus({ error: result.error || 'Failed to synthesize persona.' });
      }
    } catch (err) {
      setGenStatus({ error: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySynthesizedPersona = async () => {
    if (!synthesizedResult?.character || !applyGuidedCharacter) return;
    setIsGenerating(true);
    try {
      const ok = await applyGuidedCharacter(synthesizedResult.character);
      if (ok) {
        setGenStatus({ success: `Applied "${synthesizedResult.character['char-name']}" to active Persona Folio!` });
      }
    } catch (err) {
      setGenStatus({ error: `Apply error: ${err.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const extractExpandablePoints = (text) => {
    if (!text || typeof text !== 'string') return [];
    const matches = [];
    const seen = new Set();
    const regex = /(?:^|\n)\s*(?:[•*-]|\d+\.)\s*\*\*([^*:\n]{2,45})\*\*/g;
    let m;
    while ((m = regex.exec(text)) !== null) {
      const clean = m[1].replace(/^\d+\.\s*/, '').replace(/:$/, '').trim();
      if (clean && !seen.has(clean.toLowerCase()) && clean.length >= 3) {
        seen.add(clean.toLowerCase());
        matches.push(clean);
      }
      if (matches.length >= 5) break;
    }
    return matches;
  };

  const getSummarizedDisplayText = (text, isExpanded) => {
    if (!text || isExpanded || text.length <= 420) {
      return { displayText: text, isTruncated: false };
    }
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 6) {
      return {
        displayText: lines.slice(0, 6).join('\n') + '\n…',
        isTruncated: true
      };
    }
    return {
      displayText: text.slice(0, 400).trimEnd() + '…',
      isTruncated: true
    };
  };

  const runBastionQuery = async (userText, baseHistory, replaceAtIdx = null) => {
    // Check for /roll command
    if (userText.startsWith('/roll')) {
      const rollResult = parseRollCommand(userText);
      const replyMsg = rollResult.success
        ? {
            sender: 'bastion',
            isRoll: true,
            promptText: userText,
            text: `🎲 DICE ROLL RESULT [${rollResult.expr}]: Total = ${rollResult.total} (Rolls: [${rollResult.rolls.join(', ')}] ${rollResult.mod !== 0 ? `Mod: ${rollResult.mod}` : ''})`
          }
        : { sender: 'bastion', promptText: userText, text: rollResult.error };

      setMessages(prev => {
        if (replaceAtIdx !== null && prev[replaceAtIdx]) {
          const next = [...prev];
          next[replaceAtIdx] = replyMsg;
          return next;
        }
        return [...prev, replyMsg];
      });
      return;
    }

    // Check for /character command or character creation queries
    const lowerText = userText.toLowerCase();
    if (
      lowerText.startsWith('/persona') ||
      lowerText.startsWith('/character') ||
      lowerText.startsWith('/char') ||
      lowerText.includes('create a character') ||
      lowerText.includes('create character') ||
      lowerText.includes('build a character') ||
      lowerText.includes('build an operative') ||
      lowerText.includes('build a persona') ||
      lowerText.includes('create a persona') ||
      lowerText.includes('create persona')
    ) {
      const promptQuery = userText.replace(/^\/(persona|character|char)\s*/i, '').trim() || 'Tactical persona';
      const synth = synthesizeCharacterWithBastion({
        prompt: promptQuery,
        techLevel: characterData?.['tech-level'] || 3
      });

      if (synth.success) {
        const { pillars, character, allocationsReport } = synth;
        const replyText =
          `🤖 **BASTION 5-PILLAR PERSONA SUMMARY**\n` +
          `• **1. Archetype**: ${pillars.archetype.name} (${pillars.archetype.sphere})\n` +
          `• **2. Species**: ${pillars.species.name}\n` +
          `• **3. Faction**: ${pillars.faction.name}\n` +
          `• **4. Origin**: ${pillars.origin.name}\n` +
          `• **5. Occupation**: ${pillars.occupation.name}\n` +
          `• **Stats & Loadout**: STR ${character['attr-strength']}, AGI ${character['attr-agility']}, STA ${character['attr-stamina']}, INT ${character['attr-intellect']}, WIS ${character['attr-wisdom']}, CHA ${character['attr-charisma']} | ${allocationsReport.skillsCount} Skill Ranks | ${character.weapons.map(w => w.name).join(', ')}\n\n` +
          `*(Open **⚡ Generator** tab to inspect or apply, or click any pillar below to expand).*`;

        setSynthesizedResult(synth);
        const replyMsg = { sender: 'bastion', promptText: userText, text: replyText };
        setMessages(prev => {
          if (replaceAtIdx !== null && prev[replaceAtIdx]) {
            const next = [...prev];
            next[replaceAtIdx] = replyMsg;
            return next;
          }
          return [...prev, replyMsg];
        });
        return;
      }
    }

    setIsChatLoading(true);
    const activeDbCategory =
      location?.pathname?.startsWith('/compendium') || location?.pathname?.startsWith('/rules')
        ? 'compendium'
        : dbmContext?.activeCategory || undefined;

    const isExpandRequest = /^expand\b/i.test(userText);
    const formattedPrompt = isExpandRequest
      ? userText
      : `${userText}\n\n[Formatting Directive: Provide a concise summary first (1-2 sentence overview + 3-5 short bullet points "• **Topic**: 1-sentence summary"). Keep initial reply brief so the user can expand on individual points as needed.]`;

    const response = await sendBastionChatMessage({
      prompt: formattedPrompt,
      history: baseHistory,
      contextData: {
        activeCharacter: characterData,
        activeDatabaseCategory: activeDbCategory,
        pathname: location?.pathname || '/'
      }
    });
    setIsChatLoading(false);

    const replyMsg = {
      sender: 'bastion',
      promptText: userText,
      text: response.text,
      isExpandedResponse: isExpandRequest
    };

    if (isExpandRequest) {
      setExpandedBlocks(prev => ({
        ...prev,
        [replaceAtIdx !== null ? replaceAtIdx : baseHistory.length + 1]: true
      }));
    }

    setMessages(prev => {
      if (replaceAtIdx !== null && prev[replaceAtIdx]) {
        const next = [...prev];
        next[replaceAtIdx] = replyMsg;
        return next;
      }
      return [...prev, replyMsg];
    });
  };

  const handleSendChat = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!inputVal.trim() || isChatLoading) return;

    const userText = inputVal.trim();
    if (userText.toLowerCase() === '/clear' || userText.toLowerCase() === '/reset') {
      setInputVal('');
      handleClearChat();
      return;
    }

    const historySnapshot = [...messages];
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInputVal('');

    await runBastionQuery(userText, historySnapshot, null);
  };

  const handleRetryBlock = async (blockIdx) => {
    if (isChatLoading) return;
    const targetMsg = messages[blockIdx];
    if (!targetMsg) return;

    // Find the user prompt that generated this block
    let userPromptToRetry = targetMsg.promptText || '';
    if (!userPromptToRetry) {
      for (let i = blockIdx - 1; i >= 0; i--) {
        if (messages[i]?.sender === 'user' && messages[i]?.text) {
          userPromptToRetry = messages[i].text;
          break;
        }
      }
    }
    if (!userPromptToRetry) {
      // Fallback: find the latest user message in history
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i]?.sender === 'user' && messages[i]?.text) {
          userPromptToRetry = messages[i].text;
          break;
        }
      }
    }
    if (!userPromptToRetry) {
      userPromptToRetry = 'Provide a concise summary of what BASTION can assist with today.';
    }

    const priorHistory = messages.slice(0, Math.max(0, blockIdx));
    await runBastionQuery(userPromptToRetry, priorHistory, blockIdx);
  };

  const handleExpandPoint = async (pointTitle) => {
    if (isChatLoading || !pointTitle) return;
    const expandText = `Expand in detail on: ${pointTitle}`;
    const historySnapshot = [...messages];
    setMessages(prev => [...prev, { sender: 'user', text: expandText }]);
    await runBastionQuery(expandText, historySnapshot, null);
  };

  const safeCharData = characterData || {};

  // Helper to check if a character field currently has non-empty text
  const hasFieldContent = (key) => {
    if (key === 'notes') {
      return Boolean(Array.isArray(safeCharData.notes) && safeCharData.notes[0] && safeCharData.notes[0].text && safeCharData.notes[0].text.trim());
    }
    return Boolean(safeCharData[key] && String(safeCharData[key]).trim());
  };

  // Select all fields helper
  const selectAllFields = () => {
    const newSelected = {};
    CHARACTER_FIELDS.forEach(f => {
      newSelected[f.key] = true;
    });
    setSelectedFields(newSelected);
  };

  // Select narrative fields only helper
  const selectNarrativeOnly = () => {
    const newSelected = {};
    CHARACTER_FIELDS.forEach(f => {
      if (f.category !== 'Core Identity') {
        newSelected[f.key] = true;
      }
    });
    setSelectedFields(newSelected);
  };

  // Select all blank fields helper
  const selectBlankOnly = () => {
    const newSelected = {};
    CHARACTER_FIELDS.forEach(f => {
      newSelected[f.key] = !hasFieldContent(f.key);
    });
    setSelectedFields(newSelected);
  };

  // Clear all selections
  const clearAllFields = () => {
    setSelectedFields({});
  };

  const handleGenerate = async () => {
    let fieldsToGen = Object.keys(selectedFields).filter(k => selectedFields[k]);
    if (fieldsToGen.length === 0) {
      setGenStatus({ error: 'Please select at least one persona field to generate.' });
      return;
    }

    if (!genPrompt.trim()) {
      setGenStatus({ error: 'Please enter instructions/prompt before generating.' });
      return;
    }

    // Overwrite Protection Filter: If overwriteMode is false, filter out fields that already have content
    if (!overwriteMode) {
      const emptyFieldsOnly = fieldsToGen.filter(k => !hasFieldContent(k));
      if (emptyFieldsOnly.length === 0) {
        setGenStatus({ error: 'All selected persona fields already contain content! Enable "⚡ Allow Overwrite" mode to replace existing content, or select blank fields.' });
        return;
      }
      fieldsToGen = emptyFieldsOnly;
    }

    setIsGenerating(true);
    setGenStatus(null);

    const currentValues = {};
    fieldsToGen.forEach(k => {
      if (k === 'notes') {
        currentValues[k] = Array.isArray(characterData.notes) && characterData.notes[0] ? characterData.notes[0].text : '';
      } else {
        currentValues[k] = characterData[k] || '';
      }
    });

    const result = await generateSelectiveFields({
      selectedFields: fieldsToGen,
      currentValues,
      userPrompt: genPrompt,
      elementType: 'Character Persona'
    });

    setIsGenerating(false);

    if (result.success) {
      const updatedKeys = [];
      Object.keys(result.generated).forEach(key => {
        const val = result.generated[key];
        if (key === 'notes') {
          updateField('notes', [{ text: val }]);
        } else {
          updateField(key, val);
        }
        updatedKeys.push(key);
      });

      setGenStatus({
        success: `BASTION updated persona folio fields: [${updatedKeys.map(k => CHARACTER_FIELDS.find(f => f.key === k)?.label || k).join(', ')}].`
      });
    } else {
      setGenStatus({ error: result.error || 'Persona generation failed.' });
    }
  };

  const renderInnerContent = () => (
    <>
      {/* Header Bar */}
      <div className={`drag-handle flex justify-between items-center px-3.5 py-2.5 bg-slate-950 border-b border-cyan-900/60 select-none shrink-0 ${!isDocked ? 'cursor-move' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <h3 className="text-cyan-300 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <span>🤖</span> BASTION AI ASSISTANT
          </h3>
          <span className="text-[9px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
            {isDocked ? 'Docked Right' : 'Floating'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Dock / Undock Toggle Button */}
          <button
            type="button"
            data-no-drag="true"
            onClick={toggleDock}
            className="text-slate-400 hover:text-cyan-300 px-2 py-0.5 text-[11px] font-mono transition-colors rounded hover:bg-slate-800 border border-slate-700/60 flex items-center gap-1"
            title={isDocked ? "Undock into a movable floating window" : "Dock to right sidebar drawer"}
          >
            <span>{isDocked ? '↗ Undock' : '📌 Dock Right'}</span>
          </button>

          {/* Minimize toggle (only available when floating) */}
          {!isDocked && (
            <button 
              type="button"
              data-no-drag="true"
              onClick={() => setIsMinimized(prev => !prev)} 
              className="text-slate-400 hover:text-cyan-300 p-1 text-xs font-mono transition-colors rounded hover:bg-slate-800"
              title={isMinimized ? "Expand Panel" : "Minimize Panel"}
            >
              {isMinimized ? '◻' : '—'}
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            data-no-drag="true"
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 p-1 text-sm font-bold transition-colors leading-none rounded hover:bg-slate-800 ml-0.5"
            title="Close BASTION Panel"
          >
            ✕
          </button>
        </div>
      </div>

      {(!isMinimized || isDocked) && (
        <>
          {/* Mode Selection Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/80 p-1 gap-1 shrink-0">
            <button
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'chat'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chatbot
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'generator'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('generator')}
            >
              ⚡ Generator
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'directives'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('directives')}
            >
              📜 Directives
            </button>
          </div>

          {/* Tab 1: Chatbot */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0d1117]/80">
              {/* Session Status, Copy Conversation & Clear Chat Bar */}
              <div className="px-3.5 py-1.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono shrink-0">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Persistent Session ({messages.length} {messages.length === 1 ? 'msg' : 'msgs'})</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyConversation}
                    className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer ${
                      copiedConversation
                        ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                        : 'bg-cyan-950/50 hover:bg-cyan-900/70 border-cyan-500/40 text-cyan-300'
                    }`}
                    title="Copy entire conversation history to clipboard"
                  >
                    <span>{copiedConversation ? '✓ Copied' : '📋 Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearChat}
                    disabled={messages.length <= 1}
                    className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${
                      messages.length <= 1
                        ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-rose-950/50 hover:bg-rose-900/70 border-rose-500/40 text-rose-300 cursor-pointer'
                    }`}
                    title="Clear BASTION conversation history (/clear)"
                  >
                    <span>🗑️ Clear</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#0d1117]/90 text-xs font-mono">
                {messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  const isBlockExpanded = Boolean(expandedBlocks[idx] || msg.isExpandedResponse);
                  const { displayText, isTruncated } = isUser
                    ? { displayText: msg.text, isTruncated: false }
                    : getSummarizedDisplayText(msg.text, isBlockExpanded);
                  const expandablePoints = !isUser && idx > 0 ? extractExpandablePoints(msg.text) : [];

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">
                        {isUser ? 'OPERATOR' : 'BASTION System'}
                      </span>
                      <div
                        className={`p-3 rounded-lg max-w-[88%] leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 rounded-br-none font-sans'
                            : msg.isRoll
                            ? 'bg-amber-950/60 text-amber-200 border border-amber-500/60 font-mono shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none font-sans'
                        }`}
                      >
                        <div>{displayText}</div>

                        {/* Expandable Bullet Topics (Drill-down on specific points as needed) */}
                        {expandablePoints.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1">
                            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider mr-1">
                              Expand Point:
                            </span>
                            {expandablePoints.map((pt, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                disabled={isChatLoading}
                                onClick={() => handleExpandPoint(pt)}
                                className="px-1.5 py-0.5 rounded bg-slate-950/90 hover:bg-cyan-950/80 border border-slate-700/80 hover:border-cyan-500/50 text-[10px] font-mono text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
                                title={`Ask BASTION to expand in detail on "${pt}"`}
                              >
                                + {pt}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Output Block Actions: Copy, Retry, and Expand/Summarize Toggle */}
                        {!isUser && (
                          <div className="mt-2 pt-1.5 border-t border-slate-800/70 flex items-center justify-end gap-1.5 text-[10px] font-mono">
                            {(isTruncated || (msg.text && msg.text.length > 420)) && (
                              <button
                                type="button"
                                onClick={() => toggleExpandBlock(idx)}
                                className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-800 border border-slate-700/70 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer mr-auto"
                                title={isBlockExpanded ? 'Collapse back to concise summary' : 'Expand full output text'}
                              >
                                {isBlockExpanded ? '▴ Summarize' : '▾ Expand Full Text'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyBlock(msg.text, idx)}
                              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                                copiedBlockIdx === idx
                                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                                  : 'bg-slate-950/80 hover:bg-slate-800 border-slate-700/70 text-slate-300 hover:text-cyan-300'
                              }`}
                              title="Copy this output block"
                            >
                              <span>{copiedBlockIdx === idx ? '✓ Copied' : '📋 Copy'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={isChatLoading}
                              onClick={() => handleRetryBlock(idx)}
                              className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-cyan-950/80 border border-slate-700/70 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Retry / regenerate this response"
                            >
                              <span>🔄 Retry</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 italic">
                    <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>BASTION analyzing request...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Box */}
              <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask BASTION, /roll 2d10+4, or /clear..."
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-xs text-slate-100 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Character Field Generator & 5 Pillars Persona Synthesizer */}
          {activeTab === 'generator' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs bg-[#0d1117]/80">
              <div className="p-3 pb-2.5 border-b border-slate-800/80 space-y-2.5 shrink-0 bg-[#0d1117]/95">
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-wider block">
                      Active Persona
                    </span>
                    <span className="font-bold text-amber-400 text-xs truncate block max-w-[260px]">
                      {characterData['char-name'] ? characterData['char-name'].toUpperCase() : 'UNNAMED PERSONA'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded font-mono">
                    TL-{characterData['tech-level'] || 3}
                  </span>
                </div>

                {/* Generator Sub-Mode Selector */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-cyan-900/40 gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setGeneratorMode('staged')}
                    className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      generatorMode === 'staged'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🧭 Staged Persona</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeneratorMode('synthesis')}
                    className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      generatorMode === 'synthesis'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>⚡ 1-Click Fast</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeneratorMode('fields')}
                    className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      generatorMode === 'fields'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>📝 Selective</span>
                  </button>
                </div>
              </div>

              {/* Sub-Mode 0: Staged Persona Generator with Platform Guide Rail */}
              {generatorMode === 'staged' && (
                <div className="flex-1 flex min-h-0 relative overflow-hidden">
                  {/* In-Flow Sizing Anchor for Guide Rail */}
                  <div
                    className={`shrink-0 h-full pointer-events-none transition-all duration-200 ease-out ${
                      isStagedRailPinned ? 'w-48 sm:w-52' : 'w-14'
                    }`}
                    aria-hidden="true"
                  />

                  {/* Staged Persona Guide Rail */}
                  <nav
                    aria-label="Staged Persona Guide Rail"
                    onMouseEnter={() => setIsStagedRailHovered(true)}
                    onMouseLeave={() => setIsStagedRailHovered(false)}
                    className={`absolute top-0 bottom-0 left-0 h-full bg-[#070a12]/98 backdrop-blur-xl border-r border-slate-800/90 flex flex-col justify-start py-2 px-1.5 select-none font-sans transition-all duration-200 ease-out z-30 ${
                      isStagedRailExpanded
                        ? 'w-48 sm:w-52 shadow-[12px_0_35px_rgba(0,0,0,0.85)] border-slate-700/80'
                        : 'w-14 shadow-lg'
                    }`}
                  >
                    {/* Guide Rail Header with Pin Toggle */}
                    <div
                      className={`w-full flex items-center justify-between px-2 py-1 mb-1 border-b border-cyan-500/20 shrink-0 transition-all duration-200 overflow-hidden ${
                        isStagedRailExpanded ? 'opacity-100 h-7' : 'opacity-0 h-0 p-0 mb-0 border-b-0 pointer-events-none'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest truncate">
                          PERSONA
                        </span>
                        <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
                          {stagedStep + 1}/6
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">
                          RAIL
                        </span>
                        <button
                          type="button"
                          onClick={toggleStagedRailPin}
                          className={`p-1 rounded-md transition-all cursor-pointer ${
                            isStagedRailPinned
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                          }`}
                          title={isStagedRailPinned ? 'Unpin Guide Rail (Auto-collapse on exit)' : 'Pin Guide Rail (Lock open)'}
                          aria-label={isStagedRailPinned ? 'Unpin Guide Rail' : 'Pin Guide Rail'}
                        >
                          <Pin size={11} className={`transition-transform duration-200 ${isStagedRailPinned ? 'rotate-45 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`} />
                        </button>
                      </div>
                    </div>

                    {/* 6 Staged Persona Guide Rail Items */}
                    <div className="flex flex-col items-stretch gap-1 w-full flex-1 min-h-0 overflow-y-auto no-scrollbar py-0.5">
                      {[
                        {
                          step: 0,
                          label: '1. ARCHETYPE',
                          sublabel: (stagedArchetype || (stagedPrompt.trim() && activeArchetype))
                            ? activeArchetype.name
                            : 'Chassis & Concept',
                          icon: Shield
                        },
                        {
                          step: 1,
                          label: '2. SPECIES',
                          sublabel: activeSpecies?.name || 'Lineage & Biology',
                          icon: Dna
                        },
                        {
                          step: 2,
                          label: '3. FACTION / ORIGIN',
                          sublabel: `${activeFaction?.name || 'Faction'} • ${activeOrigin?.name || 'Origin'}`,
                          icon: Globe
                        },
                        {
                          step: 3,
                          label: '4. OCCUPATION',
                          sublabel: activeOccupation?.name || 'Career & Training',
                          icon: Briefcase
                        },
                        {
                          step: 4,
                          label: '5. RULES & STATS',
                          sublabel: `${stagedRulesLedger.bpRemaining} / 150 CP Free`,
                          icon: Activity
                        },
                        {
                          step: 5,
                          label: '6. FOLIO',
                          sublabel: '5-Pillar Synthesis',
                          icon: FileText
                        }
                      ].map(item => {
                        const Icon = item.icon;
                        const isActive = stagedStep === item.step;
                        const isCompleted = stagedStep > item.step;

                        return (
                          <button
                            key={item.step}
                            type="button"
                            onClick={() => {
                              setStagedStep(item.step);
                              if (!isStagedRailPinned) setIsStagedRailHovered(false);
                            }}
                            className={`group relative w-full h-10 rounded-xl flex items-center transition-all cursor-pointer select-none border shrink-0 ${
                              isStagedRailExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
                            } ${
                              isActive
                                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-950/40 text-cyan-200 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                                : isCompleted
                                ? 'bg-slate-900/60 text-emerald-300 border-emerald-800/40 hover:border-emerald-600/50'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                            }`}
                            title={isStagedRailExpanded ? undefined : `${item.label} • ${item.sublabel}`}
                          >
                            {/* Active / Completed Left Indicator Bar */}
                            {isActive && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            )}
                            {!isActive && isCompleted && (
                              <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-400/80 rounded-r-full" />
                            )}

                            {/* Icon Container */}
                            <div
                              className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                                isActive
                                  ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300'
                                  : isCompleted
                                  ? 'border-emerald-600/50 bg-emerald-950/50 text-emerald-300'
                                  : 'border-slate-800/80 bg-slate-900/60 text-slate-400 group-hover:text-cyan-400'
                              }`}
                            >
                              <Icon size={15} />
                              <span
                                className={`absolute -bottom-1 -right-1 text-[8px] font-mono font-bold px-1 rounded-full border leading-tight ${
                                  isActive
                                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                                    : isCompleted
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                                    : 'bg-slate-950 text-slate-400 border-slate-700'
                                }`}
                              >
                                {isCompleted ? '✓' : item.step + 1}
                              </span>
                            </div>

                            {/* Label & Live Sublabel */}
                            <div
                              className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                                isStagedRailExpanded ? 'opacity-100 ml-2.5 max-w-[160px]' : 'opacity-0 max-w-0 pointer-events-none'
                              }`}
                            >
                              <span
                                className={`font-mono text-[10px] font-bold uppercase tracking-wider truncate leading-tight ${
                                  isActive
                                    ? 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.5)]'
                                    : isCompleted
                                    ? 'text-emerald-300'
                                    : 'text-slate-200 group-hover:text-white'
                                }`}
                              >
                                {item.label}
                              </span>
                              <span className="text-[9px] text-slate-400 truncate font-mono leading-tight mt-0.5">
                                {item.sublabel}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Stage Content Viewport */}
                  <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 min-w-0">
                    {/* Stage 0: Concept & Archetype */}
                  {stagedStep === 0 && (
                    <div className="space-y-3">
                      <div className="bg-slate-900/90 border border-cyan-900/40 p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                            Stage 1 of 6: Concept & Archetype Chassis
                          </span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                            100 Canonical Archetypes
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Define your persona concept or tactical archetype. BASTION evaluates your prompt and ranks canonical archetypes from the 4 Spheres (Sentinels, Operatives, Visionaries, Savants).
                        </p>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setIsArchetypeModalOpen(true)}
                            className="w-full py-2 px-3 rounded-lg bg-amber-950/60 hover:bg-amber-900/70 text-amber-200 hover:text-white border border-amber-500/60 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-between gap-2 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          >
                            <span className="flex items-center gap-1.5">
                              <span>🛡️</span>
                              <span>Open Archetypes Selector Modal</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950/90 text-amber-300 border border-amber-600/50 truncate max-w-[160px]">
                              {(stagedArchetype || (stagedPrompt.trim() && activeArchetype))
                                ? `${activeArchetype.name} (${activeArchetype.sphere})`
                                : 'Browse 100 Archetypes'}
                            </span>
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={stagedPrompt}
                          onChange={(e) => {
                            setStagedPrompt(e.target.value);
                            setStagedArchetype(null);
                          }}
                          placeholder="Enter persona concept, tactical role, cybernetics, or background..."
                          className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2 rounded text-xs outline-none font-sans"
                        />
                      </div>

                      {/* BASTION Archetype Recommendations (only shown when prompt field is non-empty) */}
                      {stagedPrompt.trim().length > 0 && archetypeRecs.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                              🤖 BASTION Recommendations ({archetypeRecs.length} Matches)
                            </span>
                            <span className="text-slate-400 text-[10px]">Click to Select Chassis</span>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {archetypeRecs.map((rec) => {
                              const isSelected = (activeArchetype?.name === rec.archetype.name);
                              return (
                                <div
                                  key={rec.archetype.name}
                                  onClick={() => setStagedArchetype(rec.archetype)}
                                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                                      : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-amber-300 text-xs">{rec.archetype.name}</span>
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700">
                                          {rec.archetype.sphere}
                                        </span>
                                        {rec.isTopPick && (
                                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-600 font-bold">
                                            ⭐ Top Pick
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-300 mt-0.5">{rec.archetype.core_concept || rec.archetype.summary}</p>
                                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                                        <span>Role: {rec.archetype.tactical_role}</span>
                                        <span>•</span>
                                        <span>Attrs: {rec.archetype.primary_attribute} / {rec.archetype.secondary_attribute}</span>
                                      </div>
                                      <p className="text-[10px] text-cyan-300/80 italic mt-1 font-sans">
                                        💡 {rec.rationale}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 transition-all ${
                                        isSelected
                                          ? 'bg-amber-500 text-slate-950 font-black'
                                          : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                                      }`}
                                    >
                                      {isSelected ? '✓ Selected' : 'Select'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setStagedStep(1)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Continue to Species Selection</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 1: Lineage & Species */}
                  {stagedStep === 1 && (
                    <div className="space-y-3">
                      <div className="bg-slate-900/90 border border-cyan-900/40 p-3 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                            Stage 2 of 6: Canonical Species & Lineage
                          </span>
                          <span className="text-[10px] font-bold text-amber-300">
                            Archetype: {activeArchetype?.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          BASTION recommends canonical species matching {activeArchetype?.name}'s core attributes ({activeArchetype?.primary_attribute} & {activeArchetype?.secondary_attribute}).
                        </p>
                      </div>

                      {/* Species Recommendations */}
                      <div className="space-y-2">
                        <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">
                          🤖 Recommended Species ({speciesRecs.length} Options)
                        </span>

                        <div className="grid grid-cols-1 gap-2">
                          {speciesRecs.map((rec) => {
                            const isSelected = (activeSpecies?.name === rec.species.name);
                            const sp = rec.species;
                            const recTL = sp.recommended_tl || sp.tech_level || 3;
                            const recML = sp.recommended_ml || sp.meta_level || 0;
                            const posChips = normalizeChipList(sp.keywords);
                            const negChips = normalizeChipList(sp.negative_keywords);

                            return (
                              <div
                                key={rec.species.name}
                                onClick={() => setStagedSpecies(rec.species)}
                                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-cyan-300 text-xs">{rec.species.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                                        {rec.attributeModifiersSummary}
                                      </span>
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700 font-mono">
                                        TL{recTL} / ML{recML}
                                      </span>
                                      {rec.isTopPick && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-600 font-bold">
                                          ⭐ Synergized Pick
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-300 mt-1">{rec.species.summary || rec.species.description}</p>
                                    {rec.inherentTraits?.length > 0 && (
                                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                                        Inherent: {rec.inherentTraits.slice(0, 3).join(', ')}
                                      </div>
                                    )}
                                    {posChips.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {posChips.slice(0, 4).map((c, ci) => (
                                          <span key={ci} className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[9px] font-mono">
                                            🏷️ {c}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {negChips.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-0.5">
                                        {negChips.slice(0, 3).map((c, ci) => (
                                          <span key={ci} className="px-1.5 py-0.2 rounded bg-red-950/60 text-red-300 border border-red-800/60 text-[9px] font-mono">
                                            ⚠️ {c}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <p className="text-[10px] text-cyan-300/80 italic mt-1 font-sans">
                                      💡 {rec.rationale}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 transition-all ${
                                      isSelected
                                        ? 'bg-cyan-500 text-slate-950 font-black'
                                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                                    }`}
                                  >
                                    {isSelected ? '✓ Selected' : 'Select'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* All Species Dropdown */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">Or pick from all species:</span>
                          <select
                            value={activeSpecies?.name || ''}
                            onChange={(e) => {
                              const found = DEFAULT_SPECIES.find(s => s.name === e.target.value);
                              if (found) setStagedSpecies(found);
                            }}
                            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 outline-none"
                          >
                            {DEFAULT_SPECIES.map(s => (
                              <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStagedStep(0)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStagedStep(2)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Continue to Faction & Origin</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 2: Faction & Origin */}
                  {stagedStep === 2 && (
                    <div className="space-y-3">
                      <div className="bg-slate-900/90 border border-cyan-900/40 p-3 rounded-lg space-y-1.5">
                        <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                          Stage 3 of 6: Interstellar Allegiance & Homeworld
                        </span>
                        <p className="text-[11px] text-slate-300">
                          Each grants a dedicated 20 SP background skill package. Recommendations are canonically derived from {activeArchetype?.name}'s doctrine.
                        </p>
                      </div>

                      {/* Faction Section */}
                      <div className="space-y-2">
                        <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px] block">
                          🏛️ Canonical Faction (20 SP Package)
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {factionRecs.map(rec => {
                            const isSelected = (activeFaction?.name === rec.faction.name);
                            const fac = rec.faction;
                            const recTL = fac.recommended_tl || fac.tech_level || 3;
                            const recML = fac.recommended_ml || fac.meta_level || 0;
                            const posChips = normalizeChipList(fac.keywords);
                            const negChips = normalizeChipList(fac.negative_keywords);

                            return (
                              <div
                                key={rec.faction.name}
                                onClick={() => setStagedFaction(rec.faction)}
                                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-purple-950/40 border-purple-500/80'
                                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-purple-300 text-xs">{rec.faction.name}</span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-purple-300 border border-purple-800 font-mono">
                                      TL{recTL} / ML{recML}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block truncate">{rec.rationale}</span>
                                  <span className="text-[9px] text-slate-500 font-mono block">Skills: {rec.skillPackage?.slice(0, 3).join(', ')}</span>
                                  {posChips.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {posChips.slice(0, 3).map((c, ci) => (
                                        <span key={ci} className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[8px] font-mono">
                                          🏷️ {c}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {negChips.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {negChips.slice(0, 2).map((c, ci) => (
                                        <span key={ci} className="px-1.5 py-0.2 rounded bg-red-950/60 text-red-300 border border-red-800/60 text-[8px] font-mono">
                                          ⚠️ {c}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                                  isSelected ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'
                                }`}>
                                  {isSelected ? '✓ Picked' : 'Select'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Origin Section */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block">
                          🌍 Homeworld Origin (20 SP Package + 2 Traits)
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {originRecs.map(rec => {
                            const isSelected = (activeOrigin?.name === rec.origin.name);
                            const org = rec.origin;
                            const recTL = org.recommended_tl || org.tech_level || 3;
                            const recML = org.recommended_ml || org.meta_level || 0;
                            const posChips = normalizeChipList(org.keywords);
                            const negChips = normalizeChipList(org.negative_keywords);

                            return (
                              <div
                                key={rec.origin.name}
                                onClick={() => setStagedOrigin(rec.origin)}
                                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-emerald-950/40 border-emerald-500/80'
                                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-emerald-300 text-xs">{rec.origin.name}</span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-emerald-300 border border-emerald-800 font-mono">
                                      TL{recTL} / ML{recML}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block truncate">{rec.rationale}</span>
                                  <span className="text-[9px] text-slate-500 font-mono block">Skills: {rec.skills?.slice(0, 3).join(', ')}</span>
                                  {posChips.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {posChips.slice(0, 3).map((c, ci) => (
                                        <span key={ci} className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[8px] font-mono">
                                          🏷️ {c}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {negChips.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {negChips.slice(0, 2).map((c, ci) => (
                                        <span key={ci} className="px-1.5 py-0.2 rounded bg-red-950/60 text-red-300 border border-red-800/60 text-[8px] font-mono">
                                          ⚠️ {c}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                                  isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                                }`}>
                                  {isSelected ? '✓ Picked' : 'Select'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStagedStep(1)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStagedStep(3)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Continue to Occupation</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 3: Occupation */}
                  {stagedStep === 3 && (
                    <div className="space-y-3">
                      <div className="bg-slate-900/90 border border-cyan-900/40 p-3 rounded-lg space-y-1.5">
                        <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                          Stage 4 of 6: Professional Career & Training
                        </span>
                        <p className="text-[11px] text-slate-300">
                          Occupations provide the third 20 SP skill package, 2 occupational traits, and career features. BASTION suggests options aligned with {activeArchetype?.name}.
                        </p>
                      </div>

                      {/* Occupation Recommendations */}
                      <div className="space-y-2">
                        <span className="text-sky-400 font-bold uppercase tracking-wider text-[10px] block">
                          💼 Canonical Occupations ({occupationRecs.length} Matches)
                        </span>

                        <div className="grid grid-cols-1 gap-2">
                          {occupationRecs.map((rec) => {
                            const isSelected = (activeOccupation?.name === rec.occupation.name);
                            const occ = rec.occupation;
                            const recTL = occ.recommended_tl || occ.tech_level || 3;
                            const recML = occ.recommended_ml || occ.meta_level || 0;
                            const posChips = normalizeChipList(occ.keywords);
                            const negChips = normalizeChipList(occ.negative_keywords);

                            return (
                              <div
                                key={rec.occupation.name}
                                onClick={() => setStagedOccupation(rec.occupation)}
                                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-sky-950/40 border-sky-500/80 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-sky-300 text-xs">{rec.occupation.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-sky-300 border border-sky-800 font-mono">
                                        TL{recTL} / ML{recML}
                                      </span>
                                      {rec.isTopPick && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-600 font-bold">
                                          ⭐ Career Match
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-300 mt-1">{rec.occupation.summary || rec.occupation.description}</p>
                                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                                      Professional Skills: {rec.skills?.slice(0, 4).join(', ')}
                                    </div>
                                    {posChips.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {posChips.slice(0, 4).map((c, ci) => (
                                          <span key={ci} className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[8px] font-mono">
                                            🏷️ {c}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {negChips.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-0.5">
                                        {negChips.slice(0, 2).map((c, ci) => (
                                          <span key={ci} className="px-1.5 py-0.2 rounded bg-red-950/60 text-red-300 border border-red-800/60 text-[8px] font-mono">
                                            ⚠️ {c}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <p className="text-[10px] text-cyan-300/80 italic mt-1 font-sans">
                                      💡 {rec.rationale}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 transition-all ${
                                      isSelected
                                        ? 'bg-sky-500 text-slate-950 font-black'
                                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                                    }`}
                                  >
                                    {isSelected ? '✓ Selected' : 'Select'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* All Occupations Dropdown */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">Or choose from all occupations:</span>
                          <select
                            value={activeOccupation?.name || ''}
                            onChange={(e) => {
                              const found = DEFAULT_OCCUPATIONS.find(oc => oc.name === e.target.value);
                              if (found) setStagedOccupation(found);
                            }}
                            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 outline-none"
                          >
                            {DEFAULT_OCCUPATIONS.map(oc => (
                              <option key={oc.name} value={oc.name}>{oc.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStagedStep(2)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStagedStep(4)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Review Rules & Allocate Stats</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 4: Rules Ledger & Stat Allocation */}
                  {stagedStep === 4 && (
                    <div className="space-y-3">
                      {/* Rules Budget Ledger */}
                      <div className="bg-slate-950/95 border border-cyan-500/40 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                            Stage 5 of 6: 150 CP Rules Economics & Core Stats
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            stagedRulesLedger.bpRemaining >= 0
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                              : 'bg-red-950 text-red-300 border border-red-600/50'
                          }`}>
                            Budget: {stagedRulesLedger.bpRemaining} / 150 CP Available
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300">
                          Tangent creation rules: Base attributes cost 5 CP per point (max +4 raw before species bonuses). Sub-attributes derive from Base 2 + (Primary * 2).
                        </p>

                        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono pt-1">
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                            <span className="text-slate-400 block text-[9px]">Attributes Cost</span>
                            <span className="text-amber-300 font-bold">{stagedRulesLedger.breakdown.attributesCost} CP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                            <span className="text-slate-400 block text-[9px]">Species Cost</span>
                            <span className="text-cyan-300 font-bold">{stagedRulesLedger.breakdown.speciesCost} CP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                            <span className="text-slate-400 block text-[9px]">Tech Level Cost</span>
                            <span className="text-sky-300 font-bold">{stagedRulesLedger.breakdown.techLevelCost} CP</span>
                          </div>
                        </div>
                      </div>

                      {/* 6 Core Attributes Allocator */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                            Core Attributes (Max +4 Raw at Creation)
                          </span>
                          <span className="text-slate-400 text-[10px]">5 CP per raw point</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'attr-strength', name: 'Strength', sub: 'Might' },
                            { key: 'attr-agility', name: 'Agility', sub: 'Reflex' },
                            { key: 'attr-stamina', name: 'Stamina', sub: 'Fortitude' },
                            { key: 'attr-intellect', name: 'Intellect', sub: 'Logic' },
                            { key: 'attr-wisdom', name: 'Wisdom', sub: 'Will' },
                            { key: 'attr-charisma', name: 'Charisma', sub: 'Etiquette' }
                          ].map(attr => {
                            const raw = stagedRawAttrs[attr.key] || 0;
                            const spMod = stagedRulesLedger.speciesModifiers[attr.key] || 0;
                            const finalVal = raw + spMod;
                            const subKey = `attr-${attr.sub.toLowerCase()}`;
                            const subVal = stagedRulesLedger.finalAttributes[subKey] ?? ((finalVal * 2) + 2);

                            return (
                              <div key={attr.key} className="p-2 bg-slate-900/90 border border-slate-800 rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-200 text-xs">{attr.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{attr.sub}: {subVal}</span>
                                </div>
                                <div className="flex items-center justify-between pt-0.5">
                                  <div className="text-[11px] font-mono">
                                    <span className="text-amber-300 font-bold">+{raw}</span>
                                    {spMod !== 0 && (
                                      <span className="text-cyan-300 text-[10px] ml-1">({spMod > 0 ? `+${spMod}` : spMod})</span>
                                    )}
                                    <span className="text-slate-500 mx-1">=</span>
                                    <span className="text-white font-black text-xs">+{finalVal}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateRawAttr(attr.key, -1)}
                                      disabled={raw <= 0}
                                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 font-mono text-xs flex items-center justify-center font-bold cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateRawAttr(attr.key, 1)}
                                      disabled={raw >= 4}
                                      className="w-5 h-5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 disabled:opacity-30 font-mono text-xs flex items-center justify-center font-bold cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Foundation Skills Summary */}
                      <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1 text-[11px]">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                          Foundation Skill Packages (60 Free Skill Ranks)
                        </span>
                        <div className="text-slate-300 space-y-0.5 text-[10px] font-mono">
                          <div>• Faction ({activeFaction?.name}): 20 SP dedicated pool</div>
                          <div>• Origin ({activeOrigin?.name}): 20 SP dedicated pool</div>
                          <div>• Occupation ({activeOccupation?.name}): 20 SP dedicated pool</div>
                        </div>
                      </div>

                      {/* Tech Level Selector */}
                      <div className="flex items-center justify-between p-2 bg-slate-900/90 border border-slate-800 rounded-lg">
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                          Technology Level:
                        </span>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4, 5].map(tl => (
                            <button
                              key={tl}
                              type="button"
                              onClick={() => setStagedTechLevel(tl)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                                stagedTechLevel === tl
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                                  : 'bg-slate-950 text-slate-400 hover:text-white'
                              }`}
                            >
                              TL-{tl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStagedStep(3)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStagedStep(5)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Synthesize Persona Folio</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 5: Final Review & Apply */}
                  {stagedStep === 5 && stagedPersonaResult && (
                    <div className="space-y-3">
                      <div className="bg-slate-950 border border-emerald-500/50 rounded-lg p-3 space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex-1 mr-2">
                            <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-wider block">
                              Validated 5-Pillar Persona
                            </span>
                            <input
                              type="text"
                              value={stagedCustomName || stagedPersonaResult.character['char-name']}
                              onChange={(e) => setStagedCustomName(e.target.value)}
                              placeholder="Persona Designation..."
                              className="bg-transparent text-amber-300 font-bold text-sm outline-none border-b border-amber-500/40 focus:border-amber-400 w-full"
                            />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50 font-bold shrink-0">
                            150 CP Compliant
                          </span>
                        </div>

                        {/* 5 Pillars Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                          <div className="p-1.5 rounded bg-amber-950/40 border border-amber-600/40">
                            <span className="text-slate-400 block text-[9px]">1. Archetype</span>
                            <span className="font-bold text-amber-300 truncate block">{stagedPersonaResult.pillars.archetype.name}</span>
                          </div>
                          <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-600/40">
                            <span className="text-slate-400 block text-[9px]">2. Species</span>
                            <span className="font-bold text-cyan-300 truncate block">{stagedPersonaResult.pillars.species.name}</span>
                          </div>
                          <div className="p-1.5 rounded bg-purple-950/40 border border-purple-600/40">
                            <span className="text-slate-400 block text-[9px]">3. Faction</span>
                            <span className="font-bold text-purple-300 truncate block">{stagedPersonaResult.pillars.faction.name}</span>
                          </div>
                          <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-600/40">
                            <span className="text-slate-400 block text-[9px]">4. Origin</span>
                            <span className="font-bold text-emerald-300 truncate block">{stagedPersonaResult.pillars.origin.name}</span>
                          </div>
                          <div className="p-1.5 rounded bg-sky-950/40 border border-sky-600/40 col-span-2 sm:col-span-2">
                            <span className="text-slate-400 block text-[9px]">5. Occupation</span>
                            <span className="font-bold text-sky-300 truncate block">{stagedPersonaResult.pillars.occupation.name}</span>
                          </div>
                        </div>

                        {/* Stats & Property Summary */}
                        <div className="p-2 bg-slate-900/90 rounded border border-slate-800 text-[10px] space-y-1 font-mono">
                          <div>
                            <span className="text-slate-400 uppercase">Core Stats:</span> STR {stagedPersonaResult.character['attr-strength']}, AGI {stagedPersonaResult.character['attr-agility']}, STA {stagedPersonaResult.character['attr-stamina']}, INT {stagedPersonaResult.character['attr-intellect']}, WIS {stagedPersonaResult.character['attr-wisdom']}, CHA {stagedPersonaResult.character['attr-charisma']}
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase">Sub-Attributes:</span> Might {stagedPersonaResult.character['attr-might']}, Reflex {stagedPersonaResult.character['attr-reflex']}, Fort {stagedPersonaResult.character['attr-fortitude']}, Logic {stagedPersonaResult.character['attr-logic']}, Will {stagedPersonaResult.character['attr-will']}, Etiq {stagedPersonaResult.character['attr-etiquette']}
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase">Skills ({stagedPersonaResult.allocationsReport.skillsCount}):</span> {stagedPersonaResult.character.skills.slice(0, 5).map(s => `${s.name} ${s.rank}`).join(', ')}...
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase">Property (TL-{stagedTechLevel}):</span> {stagedPersonaResult.character.weapons.map(w => w.name).join(', ')} · {stagedPersonaResult.character.armor.map(a => a.name).join(', ')}
                          </div>
                        </div>

                        {/* Narrative Summary */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Backstory Folio</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed max-h-28 overflow-y-auto bg-slate-900/60 p-2 rounded border border-slate-800 font-sans">
                            {stagedPersonaResult.character.backstory}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={handleApplyStagedPersona}
                            disabled={isGenerating}
                            className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <span>✅ Apply to Folio</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenInGuidedCreator}
                            className="py-2.5 px-3 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>🧭 Open in Wizard</span>
                          </button>
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStagedStep(4)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs transition-colors"
                        >
                          ← Back to Stats
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStagedStep(0);
                            setStagedArchetype(null);
                            setStagedSpecies(null);
                            setStagedFaction(null);
                            setStagedOrigin(null);
                            setStagedOccupation(null);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-xs transition-colors"
                        >
                          🔄 Reset Builder
                        </button>
                      </div>
                    </div>
                  )}

                  {genStatus && (
                    <div className={`p-2.5 rounded border text-xs leading-relaxed ${
                      genStatus.error 
                        ? 'bg-red-950/60 border-red-800 text-red-300' 
                        : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    }`}>
                      {genStatus.error || genStatus.success}
                    </div>
                  )}
                  </div>
                </div>
              )}

              {/* Sub-Mode 1: 5 Pillars Fast Auto-Synthesizer */}
              {generatorMode === 'synthesis' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="bg-slate-900/90 border border-cyan-900/40 p-3 rounded-lg space-y-2">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                      Canonical Pillars Workflow
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      BASTION will evaluate your concept and ground the persona strictly within the game database without fabricating content:
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/60">1. Archetype</span>
                      <span className="text-slate-500">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-600/60">2. Species</span>
                      <span className="text-slate-500">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-600/60">3. Faction</span>
                      <span className="text-slate-500">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/60">4. Origin</span>
                      <span className="text-slate-500">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-600/60">5. Occupation</span>
                    </div>
                  </div>

                  {/* Concept Presets */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Concept Presets:</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'Covert Operative Sniper',
                        'Master Armorer & Blacksmith',
                        'Syndicate Cyber-Decker',
                        'Alterian Diplomat & Envoy',
                        'Heavy Shock Trooper Vanguard'
                      ].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setGenPrompt(preset)}
                          className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[10px] transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                      BASTION Persona Concept:
                    </label>
                    <textarea
                      rows={3}
                      value={genPrompt}
                      onChange={(e) => setGenPrompt(e.target.value)}
                      placeholder="Describe persona concept, tactical role, cybernetics, or background..."
                      className="bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2.5 rounded text-xs outline-none font-sans"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={handleSynthesizePersona}
                    disabled={isGenerating}
                    className="w-full py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold uppercase text-xs rounded tracking-widest transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span>BASTION Synthesizing 5 Pillars...</span>
                      </>
                    ) : (
                      <span>🤖 Synthesize Persona with BASTION</span>
                    )}
                  </button>

                  {/* Synthesized Pillars Result Card */}
                  {synthesizedResult && synthesizedResult.pillars && (
                    <div className="bg-slate-950/90 border border-cyan-500/40 rounded-lg p-3 space-y-3">
                      <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                        <div>
                          <span className="text-[10px] text-cyan-400 uppercase font-bold block">Synthesized Persona</span>
                          <span className="font-bold text-amber-300 text-sm">{synthesizedResult.character['char-name']}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleApplySynthesizedPersona}
                          disabled={isGenerating}
                          className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 rounded text-[11px] font-bold uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                        >
                          ✅ Apply to Folio
                        </button>
                      </div>

                      {/* 5 Pillars Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        <div className="p-1.5 rounded bg-amber-950/40 border border-amber-600/40 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">Archetype:</span>
                          <span className="font-bold text-amber-300">{synthesizedResult.pillars.archetype.name}</span>
                        </div>
                        <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-600/40 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">Species:</span>
                          <span className="font-bold text-cyan-300">{synthesizedResult.pillars.species.name}</span>
                        </div>
                        <div className="p-1.5 rounded bg-purple-950/40 border border-purple-600/40 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">Faction:</span>
                          <span className="font-bold text-purple-300 truncate max-w-[150px]">{synthesizedResult.pillars.faction.name}</span>
                        </div>
                        <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-600/40 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">Origin:</span>
                          <span className="font-bold text-emerald-300">{synthesizedResult.pillars.origin.name}</span>
                        </div>
                        <div className="p-1.5 rounded bg-sky-950/40 border border-sky-600/40 flex items-center justify-between col-span-1 sm:col-span-2">
                          <span className="text-slate-400 text-[10px]">Occupation:</span>
                          <span className="font-bold text-sky-300">{synthesizedResult.pillars.occupation.name}</span>
                        </div>
                      </div>

                      {/* Brief Stats Overview */}
                      <div className="text-[10px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/80 font-mono">
                        <div>
                          <span className="text-slate-500 uppercase">Core Stats:</span> STR {synthesizedResult.character['attr-strength']}, AGI {synthesizedResult.character['attr-agility']}, STA {synthesizedResult.character['attr-stamina']}, INT {synthesizedResult.character['attr-intellect']}, WIS {synthesizedResult.character['attr-wisdom']}, CHA {synthesizedResult.character['attr-charisma']}
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase">Skills ({synthesizedResult.allocationsReport.skillsCount}):</span> {synthesizedResult.character.skills.slice(0, 4).map(s => `${s.name} ${s.rank}`).join(', ')}...
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase">Property:</span> {synthesizedResult.character.weapons.map(w => w.name).join(', ')} · {synthesizedResult.character.armor.map(a => a.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Mode 2: Selective Fields */}
              {generatorMode === 'fields' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Overwrite Protection Setting */}
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">
                        Overwrite Protection
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {overwriteMode ? 'Will replace existing persona field text' : 'Safely fills blank fields only'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOverwriteMode(!overwriteMode)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
                        overwriteMode 
                          ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                          : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      <span>{overwriteMode ? '⚡ Overwrite Allowed' : '🛡️ Fill Blank Only'}</span>
                    </button>
                  </div>

                  {/* Field Selection Controls */}
                  <div className="bg-slate-900/90 border border-cyan-900/50 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-2 pb-2 border-b border-slate-800">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                        Select Persona Fields to Generate:
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-bold uppercase">
                        <button type="button" onClick={selectAllFields} className="text-cyan-400 hover:text-cyan-300 underline">
                          + All
                        </button>
                        <span className="text-slate-600">|</span>
                        <button type="button" onClick={selectNarrativeOnly} className="text-cyan-400 hover:text-cyan-300 underline">
                          + Narrative
                        </button>
                        <span className="text-slate-600">|</span>
                        <button type="button" onClick={selectBlankOnly} className="text-cyan-400 hover:text-cyan-300 underline">
                          + Blank
                        </button>
                        <span className="text-slate-600">|</span>
                        <button type="button" onClick={clearAllFields} className="text-slate-400 hover:text-slate-200 underline">
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {CATEGORIES.map(category => {
                        const catFields = CHARACTER_FIELDS.filter(f => f.category === category);
                        if (catFields.length === 0) return null;
                        return (
                          <div key={category} className="space-y-1">
                            <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider bg-slate-950/80 px-2 py-1 rounded border border-cyan-900/40">
                              {category}
                            </div>
                            <div className="grid grid-cols-1 gap-1.5 pl-1">
                              {catFields.map(f => (
                                <label key={f.key} className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white">
                                  <div className="flex items-center gap-2 min-w-0 pr-2">
                                    <input
                                      type="checkbox"
                                      checked={!!selectedFields[f.key]}
                                      onChange={() => toggleField(f.key)}
                                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 shrink-0"
                                    />
                                    <span className="font-semibold text-xs truncate">{f.label}</span>
                                  </div>
                                  {hasFieldContent(f.key) ? (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono shrink-0">Has Content</span>
                                  ) : (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono shrink-0">Blank</span>
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                      BASTION Persona Prompt:
                    </label>
                    <textarea
                      rows={3}
                      value={genPrompt}
                      onChange={(e) => setGenPrompt(e.target.value)}
                      placeholder="Describe persona archetype, cybernetics, origin, faction allegiance, or motivation..."
                      className="bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2.5 rounded text-xs outline-none font-sans"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold uppercase text-xs rounded tracking-widest transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span>BASTION Generating Selected Fields...</span>
                      </>
                    ) : (
                      <span>⚡ Generate Selected Fields</span>
                    )}
                  </button>
                </div>
              )}

              {/* Status Message (for non-staged modes) */}
              {generatorMode !== 'staged' && genStatus && (
                <div className={`mx-4 mb-3 p-2.5 rounded border text-xs leading-relaxed shrink-0 ${
                  genStatus.error 
                    ? 'bg-red-950/60 border-red-800 text-red-300' 
                    : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                }`}>
                  {genStatus.error || genStatus.success}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: BASTION Key Instructions & Rules Directives */}
          {activeTab === 'directives' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-3.5 text-xs bg-[#0d1117]/80 text-slate-300">
              <div className="bg-slate-900/90 border border-purple-900/50 rounded-lg p-3 space-y-1">
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block">
                  BASTION Key Operational Directives
                </span>
                <p className="text-[11px] text-slate-300">
                  Canonical guidelines, setting tier economatrix, and resolution mechanics for all Tangent SFF RPG sessions.
                </p>
              </div>

              {/* 1. The 5 Canonical Pillars Pipeline */}
              <div className="p-3 bg-slate-950/90 border border-cyan-900/60 rounded-lg space-y-1.5">
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                  1. Canonical 5-Pillar Architecture
                </span>
                <p className="text-[11px] text-slate-300">
                  Personas must synthesize sequentially through the 5 canonical pillars:
                </p>
                <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/60">1. Archetype</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-600/60">2. Species</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-600/60">3. Faction</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/60">4. Origin</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-600/60">5. Occupation</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Every selection grounds the persona in the Cortex database without fabricating extraneous canon.
                </p>
              </div>

              {/* 2. Budget & Point Buy Economics */}
              <div className="p-3 bg-slate-950/90 border border-amber-900/60 rounded-lg space-y-1.5">
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">
                  2. 150 CP Budget &amp; 60 SP Foundation
                </span>
                <div className="space-y-1 text-[10px] font-mono">
                  <div>• <strong>150 CP Budget:</strong> Raw Stats (5 CP/pt, max +4 at creation), Traits (1 CP), Features (3 CP), TL/ML Upgrades (10 CP/tier).</div>
                  <div>• <strong>60 SP Foundation:</strong> 20 Origin SP + 20 Faction SP + 20 Occupation SP (Rank 11 max cap).</div>
                  <div>• <strong>Free Skills:</strong> Ranks beyond foundation pools cost 1 CP each.</div>
                </div>
              </div>

              {/* 3. Setting Tiers & Economatrix Law */}
              <div className="p-3 bg-slate-950/90 border border-purple-900/60 rounded-lg space-y-1.5">
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block">
                  3. Setting Tiers (TL/ML) &amp; Economatrix
                </span>
                <p className="text-[11px] text-slate-300">
                  Tech Level (TL 0–5) and Meta Level (ML 0–5) define equipment access and metaphysics. Baseline is <strong>TL3 / ML3 (0 CP)</strong>.
                </p>
                <div className="p-2 bg-slate-900 rounded border border-purple-800/50 font-mono text-[10px] text-purple-200">
                  <div className="text-amber-300 font-bold">Value (Cr) = 10 &times; 4<sup>(Crafting DC / 5)</sup></div>
                  <div className="text-slate-400 text-[9px] mt-0.5">Cost is determined solely by final Crafting DC (modified by design aspects, sockets, and TL/ML). Exceeding persona TL/ML generates railguard alerts.</div>
                </div>
              </div>

              {/* 4. Searchable Keywords & Railguards */}
              <div className="p-3 bg-slate-950/90 border border-emerald-900/60 rounded-lg space-y-1.5">
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
                  4. Keywords (+Weight) &amp; Negative Railguards
                </span>
                <div className="space-y-1 text-[11px]">
                  <p className="text-emerald-300">
                    <strong>Positive Keywords (+Weight):</strong> Match persona concept and directives to earn BASTION synergy boosts and situational bonuses.
                  </p>
                  <p className="text-red-300">
                    <strong>Negative Railguards (Exclusions):</strong> Prevent contraindicated weapon/armor combos, incompatible biology, or setting tier breaches.
                  </p>
                </div>
              </div>

              {/* 5. Dual 2d10 Combat Engine */}
              <div className="p-3 bg-slate-950/90 border border-blue-900/60 rounded-lg space-y-1.5">
                <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider block">
                  5. Dual 2d10 Resolution Engine
                </span>
                <div className="space-y-0.5 text-[10px] font-mono text-slate-300">
                  <div>• <strong>Core Roll:</strong> 2d10 + Stat + Skill Rank vs. CR 15.</div>
                  <div>• <strong>Ties:</strong> Defender wins contested roll ties.</div>
                  <div>• <strong>Degrees:</strong> &plusmn;5 above/below CR = &plusmn;1 Degree of Success/Failure.</div>
                  <div>• <strong>Economy:</strong> 2 Actions + 1 Free/Reaction per combat round.</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );

  const archetypeSelectorModal = isArchetypeModalOpen ? (
    <UniversalCatalogModal
      isOpen={isArchetypeModalOpen}
      onClose={() => setIsArchetypeModalOpen(false)}
      title="Archetypes"
      collectionKey="archetypes"
      selectedName={stagedArchetype?.name || (stagedPrompt.trim() ? activeArchetype?.name : null)}
      characterData={characterData}
      onSelectItem={(item) => {
        if (item) {
          const canonicalMatch = DEFAULT_ARCHETYPES.find(
            a => (a.name || '').toLowerCase() === (item.name || item.title || '').toLowerCase()
          );
          setStagedArchetype(canonicalMatch ? { ...canonicalMatch, ...item } : item);
        }
        setIsArchetypeModalOpen(false);
      }}
      allowBuild={false}
      allowEdit={false}
    />
  ) : null;

  if (isDocked) {
    return (
      <>
        {/* Backdrop Overlay to close on outside click */}
        <div 
          className="fixed top-[var(--header-height,52px)] inset-x-0 bottom-0 z-40 bg-black/40 backdrop-blur-[2px]" 
          onClick={onClose} 
        />
        <div className="fixed top-[var(--header-height,52px)] bottom-0 right-0 z-50 w-full md:w-[50vw] md:min-w-[560px] bg-[#0d1117]/95 border-l border-cyan-500/50 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] flex flex-col font-sans backdrop-blur-md">
          {renderInnerContent()}
        </div>
        {archetypeSelectorModal}
      </>
    );
  }

  return (
    <>
      <DraggablePanel
        id="bastion-folio-floating-frame"
        defaultPosition={{ x: Math.max(10, Math.round(window.innerWidth * 0.45)), y: 64 }}
        className={`fixed z-[110] flex flex-col bg-[#0d1117]/95 border border-cyan-500/50 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.25)] backdrop-blur-md overflow-hidden font-sans transition-all duration-150 ${
          isMinimized ? 'w-[320px] h-[48px]' : 'w-[95vw] md:w-[50vw] md:min-w-[560px] h-[78vh] max-h-[760px]'
        }`}
      >
        {renderInnerContent()}
      </DraggablePanel>
      {archetypeSelectorModal}
    </>
  );
};

export default React.memo(BastionDrawer);
