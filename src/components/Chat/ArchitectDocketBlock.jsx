import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  X, 
  Maximize2, 
  BookOpen, 
  Radio, 
  Upload,
  Link,
  Check,
  Pin,
  Edit3,
  Lock,
  Eye,
  CheckSquare,
  Square,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AudioService } from '../../services/audioService.js';
import ChatParser from '../UI/ChatParser';

const BLOCK_TAGS = [
  { label: 'Objective', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { label: 'Intel', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { label: 'Hazard', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { label: 'Lore', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { label: 'Briefing', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
];

const FILTER_TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'objective', label: 'OBJECTIVES' },
  { id: 'intel', label: 'INTEL' },
  { id: 'hazard', label: 'HAZARDS' },
  { id: 'recon', label: 'RECON' },
  { id: 'lore', label: 'LORE' }
];

const STATUS_CONFIG = {
  active: {
    label: 'ACTIVE',
    color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    icon: Clock
  },
  completed: {
    label: 'COMPLETE',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: CheckCircle2
  },
  failed: {
    label: 'COMPROMISED',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: XCircle
  }
};

export const ArchitectDocketBlock = ({ 
  channel, 
  group, 
  onClose, 
  blocks: externalBlocks,
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const { toast } = useToast();
  const { currentUser, isAdmin, userHandle } = useAuth();
  const { 
    activeGroup,
    saveArchitectBlock, 
    deleteArchitectBlock, 
    toggleArchitectBlockAck,
    toggleArchitectChecklistItem,
    subscribeToArchitectBlocks,
    canManageTeam 
  } = useGroup() || {};

  const {
    activeChannelGroup,
    squadEnrolledPersona,
    selectedPersona,
    allUserPersonas = [],
    pulseDocketBlockToChat
  } = useChat() || {};

  const effectiveGroup = group || activeChannelGroup || activeGroup || null;
  const channelId = channel?.id || effectiveGroup?.channelId;
  const groupId = effectiveGroup?.id || channel?.groupId;

  const [internalBlocks, setInternalBlocks] = useState([]);
  const blocks = externalBlocks !== undefined ? externalBlocks : internalBlocks;
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeModal, setActiveModal] = useState(null); // 'text' | 'image' | null
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Form states for text/directive block
  const [textTag, setTextTag] = useState('Objective');
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [blockStatus, setBlockStatus] = useState('active');
  const [blockPinned, setBlockPinned] = useState(false);
  const [blockVisibility, setBlockVisibility] = useState('all'); // 'all' | 'classified'
  const [visibleToPersonaIds, setVisibleToPersonaIds] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states for image handout
  const [imageTitle, setImageTitle] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const fileInputRef = useRef(null);

  // Check if current user is an Architect or Co-Architect for this Squad / Channel
  const canEdit = useMemo(() => {
    if (isAdmin) return true;
    const uid = currentUser?.uid;
    if (!uid) return false;
    if (effectiveGroup) {
      if (typeof canManageTeam === 'function') {
        try {
          if (canManageTeam(effectiveGroup)) return true;
        } catch (_) {}
      } else if (Boolean(canManageTeam) && activeGroup?.id === effectiveGroup.id) {
        return true;
      }
      if (effectiveGroup.leaderId === uid || effectiveGroup.creatorId === uid) return true;
      if (effectiveGroup.coArchitectId === uid) return true;
      if (Array.isArray(effectiveGroup.coArchitects) && effectiveGroup.coArchitects.includes(uid)) return true;
    }
    if (channel && channel.createdById === uid) return true;
    return false;
  }, [effectiveGroup, activeGroup?.id, channel, currentUser?.uid, isAdmin, canManageTeam]);

  // Enrolled Squad Characters for Classified targeting
  const squadPersonas = useMemo(() => {
    const list = [];
    const seen = new Set();
    if (effectiveGroup?.memberDetails && typeof effectiveGroup.memberDetails === 'object') {
      Object.entries(effectiveGroup.memberDetails).forEach(([uid, detail]) => {
        const p = detail?.persona;
        if (!p) return;
        const pid = p.id || p['character-doc-id'] || p.docId || `${uid}_${p.name}`;
        if (!seen.has(pid)) {
          seen.add(pid);
          list.push({
            id: pid,
            name: p.name || p['char-name'] || 'Operative',
            role: p.role || p['char-concept'] || 'Specialist',
            ownerUid: uid,
            ownerHandle: detail.handle || effectiveGroup.memberNames?.[uid] || 'Operator'
          });
        }
      });
    }
    if (Array.isArray(channel?.characterMembers)) {
      channel.characterMembers.forEach(cm => {
        if (!cm) return;
        const pid = cm.id || cm['character-doc-id'] || cm.name;
        if (pid && !seen.has(pid)) {
          seen.add(pid);
          list.push({
            id: pid,
            name: cm.name || cm['char-name'] || 'Operative',
            role: cm.role || cm['char-concept'] || 'Specialist',
            ownerUid: cm.ownerUid || null,
            ownerHandle: cm.ownerHandle || 'Operator'
          });
        }
      });
    }
    return list;
  }, [effectiveGroup, channel?.characterMembers]);

  // Set of current user's persona IDs for Classified visibility matching
  const myPersonaIdSet = useMemo(() => {
    const set = new Set();
    if (squadEnrolledPersona) {
      const id = squadEnrolledPersona.id || squadEnrolledPersona['character-doc-id'];
      if (id) set.add(id);
    }
    if (selectedPersona) {
      const id = selectedPersona.id || selectedPersona['character-doc-id'];
      if (id) set.add(id);
    }
    (allUserPersonas || []).forEach(p => {
      const id = p.id || p['character-doc-id'];
      if (id) set.add(id);
    });
    return set;
  }, [squadEnrolledPersona, selectedPersona, allUserPersonas]);

  // Subscribe to real-time blocks for this channel / group
  useEffect(() => {
    if (externalBlocks !== undefined) return;
    if (!channelId && !groupId) {
      setInternalBlocks([]);
      return;
    }

    const unsub = subscribeToArchitectBlocks?.({ channelId, groupId }, (blockList) => {
      setInternalBlocks(blockList || []);
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [channelId, groupId, externalBlocks, subscribeToArchitectBlocks]);

  // Filter blocks by visibility & active category tab
  const visibleBlocks = useMemo(() => {
    return (blocks || []).filter(block => {
      // 1. Classified visibility check
      if (block.visibility === 'classified' && !canEdit) {
        const allowedPersonas = Array.isArray(block.visibleToPersonaIds) ? block.visibleToPersonaIds : [];
        const allowedUids = Array.isArray(block.visibleToUids) ? block.visibleToUids : [];
        const uidMatch = currentUser?.uid && allowedUids.includes(currentUser.uid);
        const personaMatch = allowedPersonas.some(pid => myPersonaIdSet.has(pid));
        if (!uidMatch && !personaMatch) return false;
      }

      // 2. Category tab filter
      if (activeFilter === 'all') return true;
      const cat = (block.tag || block.category || '').toLowerCase();
      if (activeFilter === 'recon') {
        return block.type === 'image' || cat === 'recon';
      }
      if (activeFilter === 'objective') {
        return cat === 'objective' || cat === 'briefing';
      }
      return cat === activeFilter;
    });
  }, [blocks, canEdit, currentUser?.uid, myPersonaIdSet, activeFilter]);

  const resetTextModal = () => {
    setEditingBlockId(null);
    setTextTag('Objective');
    setTextTitle('');
    setTextContent('');
    setBlockStatus('active');
    setBlockPinned(false);
    setBlockVisibility('all');
    setVisibleToPersonaIds([]);
    setChecklistItems([]);
    setNewChecklistText('');
  };

  const openEditBlockModal = (block) => {
    AudioService.playTerminalBeep(1200, 0.02);
    setEditingBlockId(block.id);
    if (block.type === 'image') {
      setImageTitle(block.title || '');
      setImageCaption(block.caption || '');
      setImageUrl(block.imageUrl || '');
      setBlockPinned(Boolean(block.isPinned));
      setBlockVisibility(block.visibility || 'all');
      setVisibleToPersonaIds(Array.isArray(block.visibleToPersonaIds) ? block.visibleToPersonaIds : []);
      setActiveModal('image');
    } else {
      setTextTag(block.tag || block.category || 'Objective');
      setTextTitle(block.title || '');
      setTextContent(block.content || '');
      setBlockStatus(block.status || 'active');
      setBlockPinned(Boolean(block.isPinned));
      setBlockVisibility(block.visibility || 'all');
      setVisibleToPersonaIds(Array.isArray(block.visibleToPersonaIds) ? block.visibleToPersonaIds : []);
      setChecklistItems(Array.isArray(block.checklist) ? block.checklist : []);
      setNewChecklistText('');
      setActiveModal('text');
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems(prev => [
      ...prev,
      { id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, text: newChecklistText.trim(), done: false }
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (itemId) => {
    setChecklistItems(prev => prev.filter(i => i.id !== itemId));
  };

  const togglePersonaTarget = (personaId) => {
    setVisibleToPersonaIds(prev =>
      prev.includes(personaId) ? prev.filter(id => id !== personaId) : [...prev, personaId]
    );
  };

  const handleSaveTextBlock = async (e) => {
    e.preventDefault();
    if (!textTitle.trim()) {
      toast({ type: 'error', text: 'Provide a title for the briefing block.' });
      return;
    }

    // If user typed a checklist item but didn't click '+', include it automatically
    const finalChecklist = newChecklistText.trim()
      ? [...checklistItems, { id: `chk_${Date.now()}`, text: newChecklistText.trim(), done: false }]
      : checklistItems;

    const allowedUids = squadPersonas
      .filter(sp => visibleToPersonaIds.includes(sp.id) && sp.ownerUid)
      .map(sp => sp.ownerUid);

    setSubmitting(true);
    try {
      await saveArchitectBlock({
        channelId,
        groupId,
        block: {
          id: editingBlockId || undefined,
          type: 'text',
          tag: textTag,
          category: textTag,
          title: textTitle.trim(),
          content: textContent.trim(),
          status: blockStatus,
          isPinned: blockPinned,
          visibility: blockVisibility,
          visibleToPersonaIds: blockVisibility === 'classified' ? visibleToPersonaIds : [],
          visibleToUids: blockVisibility === 'classified' ? allowedUids : [],
          checklist: finalChecklist
        }
      });
      AudioService.playTerminalBeep(1400, 0.04);
      toast({ type: 'success', text: editingBlockId ? 'Docket directive updated.' : 'Directive pinned to Tactical Docket.' });
      resetTextModal();
      setActiveModal(null);
    } catch (err) {
      toast({ type: 'error', text: 'Failed to save briefing block.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateImageHandout = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast({ type: 'error', text: 'Provide an image URL or upload a file.' });
      return;
    }

    const allowedUids = squadPersonas
      .filter(sp => visibleToPersonaIds.includes(sp.id) && sp.ownerUid)
      .map(sp => sp.ownerUid);

    setSubmitting(true);
    try {
      await saveArchitectBlock({
        channelId,
        groupId,
        block: {
          id: editingBlockId || undefined,
          type: 'image',
          tag: 'Recon',
          category: 'Recon',
          title: imageTitle.trim() || 'Visual Recon Handout',
          imageUrl: imageUrl.trim(),
          caption: imageCaption.trim(),
          isPinned: blockPinned,
          visibility: blockVisibility,
          visibleToPersonaIds: blockVisibility === 'classified' ? visibleToPersonaIds : [],
          visibleToUids: blockVisibility === 'classified' ? allowedUids : []
        }
      });
      AudioService.playTerminalBeep(1400, 0.04);
      toast({ type: 'success', text: editingBlockId ? 'Visual handout updated.' : 'Visual handout pinned to Tactical Docket.' });
      setEditingBlockId(null);
      setImageTitle('');
      setImageCaption('');
      setImageUrl('');
      setActiveModal(null);
    } catch (err) {
      toast({ type: 'error', text: 'Failed to pin image handout.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickTogglePin = async (block) => {
    if (!canEdit) return;
    AudioService.playTerminalBeep(1300, 0.02);
    await saveArchitectBlock({
      channelId,
      groupId,
      block: {
        ...block,
        isPinned: !block.isPinned
      }
    });
  };

  const handleQuickCycleStatus = async (block) => {
    if (!canEdit) return;
    const order = ['active', 'completed', 'failed'];
    const nextStatus = order[(order.indexOf(block.status || 'active') + 1) % order.length];
    AudioService.playTerminalBeep(1350, 0.02);
    await saveArchitectBlock({
      channelId,
      groupId,
      block: {
        ...block,
        status: nextStatus
      }
    });
  };

  const handleToggleAck = async (block) => {
    if (!currentUser) return;
    AudioService.playTerminalBeep(1500, 0.025);
    const activeP = squadEnrolledPersona || selectedPersona;
    await toggleArchitectBlockAck?.({
      channelId,
      groupId,
      blockId: block.id,
      ackEntry: {
        uid: currentUser.uid,
        operatorHandle: userHandle || currentUser.displayName || 'Operative',
        personaId: activeP?.id || activeP?.['character-doc-id'] || null,
        personaName: activeP?.name || activeP?.['char-name'] || userHandle || 'Operative'
      }
    });
  };

  const handleToggleChecklist = async (block, itemId) => {
    AudioService.playTerminalBeep(1420, 0.02);
    await toggleArchitectChecklistItem?.({
      channelId,
      groupId,
      blockId: block.id,
      itemId
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ type: 'error', text: 'Selected file must be an image.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
      if (!imageTitle) {
        setImageTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteBlock = async (blockId) => {
    AudioService.playTerminalBeep(900, 0.03);
    try {
      await deleteArchitectBlock({ channelId, groupId, blockId });
      toast({ type: 'info', text: 'Docket entry removed.' });
    } catch (err) {
      toast({ type: 'error', text: 'Failed to delete block.' });
    }
  };

  return (
    <aside className="w-80 lg:w-96 flex flex-col h-full bg-[#090d16] border-l border-slate-800 shrink-0 font-mono text-xs select-none">
      {/* ── Docket Header ── */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
            <BookOpen size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-rose-300 uppercase tracking-wider text-[11px] truncate block">
                TACTICAL DOCKET
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/40 text-[8.5px] font-bold">
                {visibleBlocks.length}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate">
              {canEdit ? 'Architect Command Handouts & Objectives' : 'Squad Directives & Visual Recon'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Docket"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Category Filter Bar ── */}
      <div className="px-2.5 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1050, 0.015);
              setActiveFilter(tab.id);
            }}
            className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider transition-all shrink-0 cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Architect Quick Creation Bar (Visible if Architect / Co-Architect) ── */}
      {canEdit && (
        <div className="p-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              resetTextModal();
              setActiveModal('text');
            }}
            className="flex-1 py-1.5 px-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <FileText size={12} />
            <span>+ DIRECTIVE</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setEditingBlockId(null);
              setImageTitle('');
              setImageCaption('');
              setImageUrl('');
              setBlockPinned(false);
              setBlockVisibility('all');
              setVisibleToPersonaIds([]);
              setActiveModal('image');
            }}
            className="flex-1 py-1.5 px-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <ImageIcon size={12} />
            <span>+ VISUAL RECON</span>
          </button>
        </div>
      )}

      {/* ── Docket Scrollable Feed ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        {visibleBlocks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 text-center space-y-2 my-auto">
            <BookOpen size={24} className="mx-auto text-slate-600" />
            <p className="text-slate-300 font-bold text-[11px]">No Tactical Directives Found</p>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              {canEdit 
                ? 'Insert mission objectives, checklists, classified intel, or visual handouts for your fireteam.' 
                : 'The Architect has not pinned any briefing blocks or maps to this category yet.'}
            </p>
          </div>
        ) : (
          visibleBlocks.map((block) => {
            const isImage = block.type === 'image';
            const tagLabel = block.tag || block.category || (isImage ? 'Recon' : 'Objective');
            const tagMatch = BLOCK_TAGS.find(t => t.label.toLowerCase() === tagLabel.toLowerCase()) || BLOCK_TAGS[0];
            const statusCfg = STATUS_CONFIG[block.status || 'active'] || STATUS_CONFIG.active;
            const StatusIcon = statusCfg.icon;
            const checklist = Array.isArray(block.checklist) ? block.checklist : [];
            const acks = Array.isArray(block.acknowledgedBy) ? block.acknowledgedBy : [];
            const hasMyAck = Boolean(currentUser?.uid && acks.some(a => a.uid === currentUser.uid));
            const isClassified = block.visibility === 'classified';

            return (
              <div
                key={block.id}
                className={`p-3 rounded-xl bg-slate-950/90 border transition-all space-y-2.5 group shadow-sm ${
                  block.isPinned
                    ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                    : isClassified
                    ? 'border-purple-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Block Header */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {block.isPinned && (
                      <span className="p-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0" title="Pinned Directive">
                        <Pin size={10} />
                      </span>
                    )}

                    {isClassified && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[8.5px] font-bold flex items-center gap-0.5 shrink-0" title="Classified Eyes-Only Intel">
                        <Lock size={9} />
                        <span>CLASSIFIED</span>
                      </span>
                    )}

                    {isImage ? (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[8.5px] font-bold shrink-0">
                        RECON
                      </span>
                    ) : (
                      <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold border shrink-0 ${tagMatch.color}`}>
                        {tagLabel.toUpperCase()}
                      </span>
                    )}

                    {!isImage && (
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => handleQuickCycleStatus(block)}
                        className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold border flex items-center gap-1 shrink-0 ${statusCfg.color} ${
                          canEdit ? 'cursor-pointer hover:brightness-125' : 'cursor-default'
                        }`}
                        title={canEdit ? 'Click to cycle Objective status (Active / Complete / Compromised)' : statusCfg.label}
                      >
                        <StatusIcon size={9} />
                        <span>{statusCfg.label}</span>
                      </button>
                    )}
                  </div>

                  {/* Architect Action Controls */}
                  {canEdit && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuickTogglePin(block)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          block.isPinned ? 'text-amber-400 bg-amber-500/15' : 'text-slate-500 hover:text-amber-300 hover:bg-slate-900'
                        }`}
                        title={block.isPinned ? 'Unpin Directive' : 'Pin Directive to Top'}
                      >
                        <Pin size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditBlockModal(block)}
                        className="p-1 text-slate-500 hover:text-cyan-300 hover:bg-slate-900 rounded transition-colors cursor-pointer"
                        title="Edit Directive"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className={`font-bold text-[11.5px] leading-snug ${
                  block.status === 'completed' ? 'line-through text-slate-400' : 'text-white'
                }`}>
                  {block.title}
                </div>

                {/* Block Body: Text vs Image */}
                {isImage ? (
                  <div className="space-y-1.5">
                    <div 
                      onClick={() => {
                        AudioService.playTerminalBeep(1200, 0.02);
                        setLightboxImage(block);
                      }}
                      className="relative rounded-lg overflow-hidden border border-slate-800 bg-black/60 group/img cursor-pointer max-h-48 flex items-center justify-center"
                    >
                      <img
                        src={block.imageUrl}
                        alt={block.title || 'Handout'}
                        className="w-full h-auto object-cover max-h-48 group-hover/img:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-[10px]">
                        <Maximize2 size={13} />
                        <span>EXPAND VIEW</span>
                      </div>
                    </div>

                    {block.caption && (
                      <div className="text-[10px] text-slate-400 font-sans leading-relaxed">
                        <ChatParser text={block.caption} />
                      </div>
                    )}
                  </div>
                ) : (
                  block.content && (
                    <div className="text-[11px] text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <ChatParser text={block.content} />
                    </div>
                  )
                )}

                {/* Interactive Sub-Objective Checklist */}
                {checklist.length > 0 && (
                  <div className="space-y-1 bg-slate-900/40 p-2 rounded-lg border border-slate-800/70">
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase mb-1">
                      <span>SUB-OBJECTIVES</span>
                      <span className="text-cyan-400">
                        {checklist.filter(i => i.done).length}/{checklist.length}
                      </span>
                    </div>
                    {checklist.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleChecklist(block, item.id)}
                        className="w-full flex items-start gap-2 text-left py-0.5 px-1 rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
                      >
                        {item.done ? (
                          <CheckSquare size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square size={12} className="text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-[10.5px] font-sans leading-tight ${
                          item.done ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}>
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Acknowledged By Pills */}
                {acks.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    <span className="text-[8.5px] text-slate-500 uppercase font-bold">ACK:</span>
                    {acks.map(ack => (
                      <span
                        key={ack.uid}
                        className="px-1.5 py-0.2 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[8.5px] font-bold flex items-center gap-0.5"
                        title={`Acknowledged by ${ack.personaName} (@${ack.operatorHandle})`}
                      >
                        <Check size={8} />
                        <span>{ack.personaName || ack.operatorHandle}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Actions & Metadata */}
                <div className="flex items-center justify-between gap-2 text-[9px] text-slate-500 pt-1.5 border-t border-slate-900">
                  <div className="truncate">
                    <span>@{block.createdByHandle || 'Architect'}</span>
                    <span className="mx-1">•</span>
                    <span>{(() => {
                      const raw = block.createdAt || Date.now();
                      const d = raw?.toDate ? raw.toDate() : (typeof raw?.seconds === 'number' ? new Date(raw.seconds * 1000) : new Date(raw));
                      if (!d || isNaN(d.getTime())) return '';
                      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                      const hours = String(d.getHours()).padStart(2, '0');
                      const minutes = String(d.getMinutes()).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = months[d.getMonth()];
                      const year = String(d.getFullYear()).slice(-2);
                      return `${hours}:${minutes} - ${day}${month}${year}`;
                    })()}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Operative ACK Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleAck(block)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                        hasMyAck
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                      title="Acknowledge receipt of this directive as your Squad Character"
                    >
                      <Check size={9} />
                      <span>{hasMyAck ? 'ACKED' : 'ACK'}</span>
                    </button>

                    {/* Architect Pulse to Comms */}
                    {canEdit && pulseDocketBlockToChat && (
                      <button
                        type="button"
                        onClick={() => pulseDocketBlockToChat(block, effectiveGroup)}
                        className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Broadcast this Directive Card to Squad Comms Feed"
                      >
                        <Radio size={9} />
                        <span>PULSE</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL: Insert / Edit Text Directive Block ── */}
      {activeModal === 'text' && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono animate-fade-in">
          <div className="bg-[#0b121d] border border-amber-500/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col text-slate-100">
            <div className="p-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-amber-950/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-amber-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  {editingBlockId ? 'EDIT TACTICAL DIRECTIVE' : 'NEW TACTICAL DIRECTIVE / OBJECTIVE'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetTextModal();
                  setActiveModal(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveTextBlock} className="p-4 space-y-3.5 overflow-y-auto">
              {/* Tag & Pin & Status Row */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                  {BLOCK_TAGS.map(t => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setTextTag(t.label)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        textTag === t.label ? t.color + ' shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setBlockPinned(prev => !prev)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 cursor-pointer ${
                    blockPinned
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Pin size={10} />
                  <span>{blockPinned ? 'PINNED' : 'PIN'}</span>
                </button>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">STATUS:</span>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBlockStatus(key)}
                    className={`px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all cursor-pointer ${
                      blockStatus === key ? cfg.color : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase block">
                  DIRECTIVE TITLE:
                </label>
                <input
                  type="text"
                  required
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g. Primary Objective: Secure the Quantum Relay"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase block">
                  BRIEFING INTEL / DETAILS:
                </label>
                <textarea
                  rows={3}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type briefing details, security warnings, or lore notes..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              {/* Sub-Objective Checklist Builder */}
              <div className="space-y-1.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <label className="text-[10px] font-bold text-cyan-300 uppercase block">
                  TACTICAL CHECKLIST (OPTIONAL):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                    placeholder="Add sub-objective step..."
                    className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold cursor-pointer"
                  >
                    + ADD
                  </button>
                </div>

                {checklistItems.length > 0 && (
                  <div className="space-y-1 pt-1 max-h-28 overflow-y-auto">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-900/80 text-[11px]">
                        <span className="truncate font-sans text-slate-200">{item.text}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility: Public to Squad vs Classified Eyes-Only */}
              <div className="space-y-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase">CLEARANCE VISIBILITY:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setBlockVisibility('all')}
                      className={`px-2 py-0.5 rounded text-[9.5px] font-bold border flex items-center gap-1 cursor-pointer ${
                        blockVisibility === 'all'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <Eye size={10} />
                      <span>ALL SQUAD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlockVisibility('classified')}
                      className={`px-2 py-0.5 rounded text-[9.5px] font-bold border flex items-center gap-1 cursor-pointer ${
                        blockVisibility === 'classified'
                          ? 'bg-purple-500/25 text-purple-200 border-purple-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <Lock size={10} />
                      <span>CLASSIFIED</span>
                    </button>
                  </div>
                </div>

                {blockVisibility === 'classified' && (
                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <span className="text-[9.5px] text-purple-300 block">
                      Select Squad Characters cleared to decrypt this directive:
                    </span>
                    {squadPersonas.length === 0 ? (
                      <p className="text-[9.5px] text-slate-500 italic">No squad characters enrolled yet.</p>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {squadPersonas.map(sp => {
                          const selected = visibleToPersonaIds.includes(sp.id);
                          return (
                            <button
                              key={sp.id}
                              type="button"
                              onClick={() => togglePersonaTarget(sp.id)}
                              className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold border transition-all cursor-pointer ${
                                selected
                                  ? 'bg-purple-600/30 text-purple-200 border-purple-400'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              🎭 {sp.name} (@{sp.ownerHandle})
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    resetTextModal();
                    setActiveModal(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 text-xs font-bold hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {submitting ? 'SAVING...' : (editingBlockId ? 'SAVE CHANGES' : 'PIN DIRECTIVE')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Insert / Edit Image Handout ── */}
      {activeModal === 'image' && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono animate-fade-in">
          <div className="bg-[#0b121d] border border-rose-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.25)] flex flex-col text-slate-100">
            <div className="p-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-rose-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-rose-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  {editingBlockId ? 'EDIT VISUAL RECON HANDOUT' : 'PIN VISUAL RECON / IMAGE HANDOUT'}
                </h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateImageHandout} className="p-4 space-y-3.5">
              {/* Input Mode Switch: URL vs Upload */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex-1 py-1 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    imageMode === 'url' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Link size={11} />
                  <span>IMAGE URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex-1 py-1 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    imageMode === 'upload' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload size={11} />
                  <span>FILE UPLOAD</span>
                </button>
              </div>

              {/* Image Source Input */}
              {imageMode === 'url' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase block">
                    PUBLIC IMAGE URL:
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/map_sector_7.png"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase block">
                    UPLOAD IMAGE FROM SYSTEM:
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 file:mr-2 file:py-0.5 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:bg-cyan-950 file:text-cyan-300 cursor-pointer"
                  />
                </div>
              )}

              {/* Image Preview */}
              {imageUrl && (
                <div className="p-2 rounded-xl bg-black/60 border border-slate-800 flex items-center justify-center max-h-36 overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="max-h-32 object-contain rounded" />
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase block">
                  HANDOUT TITLE:
                </label>
                <input
                  type="text"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  placeholder="e.g. Sector 4 Orbital Station Schematic"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase block">
                  CAPTION / TACTICAL NOTES:
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="e.g. Red zone marks depressurized airlock."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 text-xs font-bold hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !imageUrl}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'SAVING...' : (editingBlockId ? 'SAVE HANDOUT' : 'PIN IMAGE')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX: Full Screen Visual Handout Modal ── */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md p-4 sm:p-8 flex flex-col items-center justify-center select-none animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center bg-slate-950 border border-cyan-500/50 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.4)]"
          >
            {/* Header bar */}
            <div className="w-full p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <ImageIcon size={14} className="text-cyan-400" />
                <span className="font-bold text-white uppercase">{lightboxImage.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Main Image */}
            <div className="p-2 overflow-auto max-h-[70vh] flex items-center justify-center">
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title}
                className="max-w-full max-h-[68vh] object-contain rounded-lg"
              />
            </div>

            {/* Footer with caption */}
            {lightboxImage.caption && (
              <div className="w-full p-2.5 bg-slate-900/90 border-t border-slate-800 text-[11px] font-sans text-slate-300 text-center">
                {lightboxImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default ArchitectDocketBlock;
