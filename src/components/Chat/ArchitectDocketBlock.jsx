import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  X, 
  Maximize2, 
  ExternalLink, 
  AlertTriangle, 
  Shield, 
  Crown, 
  Sparkles, 
  BookOpen, 
  Crosshair, 
  Radio, 
  ChevronRight, 
  ChevronDown,
  Upload,
  Link,
  Check
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AudioService } from '../../services/audioService';

const BLOCK_TAGS = [
  { label: 'Objective', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { label: 'Intel', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { label: 'Hazard', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { label: 'Lore', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { label: 'Briefing', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
];

export const ArchitectDocketBlock = ({ 
  channel, 
  group, 
  onClose, 
  blocks: externalBlocks,
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const { toast } = useToast();
  const { currentUser, isAdmin } = useAuth();
  const { 
    saveArchitectBlock, 
    deleteArchitectBlock, 
    subscribeToArchitectBlocks,
    isUserArchitect,
    isUserCoArchitect,
    canManageTeam 
  } = useGroup() || {};

  const [internalBlocks, setInternalBlocks] = useState([]);
  const blocks = externalBlocks !== undefined ? externalBlocks : internalBlocks;
  const [activeModal, setActiveModal] = useState(null); // 'text' | 'image' | null
  const [lightboxImage, setLightboxImage] = useState(null);

  // Form states for new block
  const [textTag, setTextTag] = useState('Objective');
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states for image handout
  const [imageTitle, setImageTitle] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const fileInputRef = useRef(null);

  const channelId = channel?.id;
  const groupId = group?.id || channel?.groupId;

  // Check if current user is an Architect or Co-Architect
  const canEdit = useMemo(() => {
    if (isAdmin) return true;
    if (group) {
      if (canManageTeam) return canManageTeam(group);
      return group.creatorId === currentUser?.uid || group.coArchitectId === currentUser?.uid;
    }
    if (channel) {
      return channel.createdById === currentUser?.uid;
    }
    return false;
  }, [group, channel, currentUser, isAdmin, canManageTeam]);

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

  const handleCreateTextBlock = async (e) => {
    e.preventDefault();
    if (!textTitle.trim()) {
      toast({ type: 'error', text: 'Provide a title for the briefing block.' });
      return;
    }

    setSubmitting(true);
    try {
      await saveArchitectBlock({
        channelId,
        groupId,
        block: {
          type: 'text',
          tag: textTag,
          title: textTitle.trim(),
          content: textContent.trim(),
          createdAt: new Date().toISOString()
        }
      });
      AudioService.playTerminalBeep(1400, 0.04);
      toast({ type: 'success', text: 'Briefing block added to Tactical Docket.' });
      setTextTitle('');
      setTextContent('');
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

    setSubmitting(true);
    try {
      await saveArchitectBlock({
        channelId,
        groupId,
        block: {
          type: 'image',
          title: imageTitle.trim() || 'Visual Recon Handout',
          imageUrl: imageUrl.trim(),
          caption: imageCaption.trim(),
          createdAt: new Date().toISOString()
        }
      });
      AudioService.playTerminalBeep(1400, 0.04);
      toast({ type: 'success', text: 'Visual handout pinned to Tactical Docket.' });
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
      <div className="p-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
            <BookOpen size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] truncate block">
                TACTICAL DOCKET
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 text-[8.5px] font-bold">
                {blocks.length}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate">
              {canEdit ? 'Lead Architect Handouts & Directives' : 'Architect Directives & Visual Intel'}
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

      {/* ── Architect Quick Creation Bar (Visible if Architect / Co-Architect) ── */}
      {canEdit && (
        <div className="p-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setActiveModal('text');
            }}
            className="flex-1 py-1.5 px-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <FileText size={12} />
            <span>+ TEXT BLOCK</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setActiveModal('image');
            }}
            className="flex-1 py-1.5 px-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <ImageIcon size={12} />
            <span>+ IMAGE RECON</span>
          </button>
        </div>
      )}

      {/* ── Docket Scrollable Feed ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        {blocks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 text-center space-y-2 my-auto">
            <BookOpen size={24} className="mx-auto text-slate-600" />
            <p className="text-slate-300 font-bold text-[11px]">No Tactical Handouts Pinned</p>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              {canEdit 
                ? 'Insert mission objectives, lore excerpts, or image handouts for your fireteam.' 
                : 'The Architect has not pinned any briefing blocks or maps to this frequency yet.'}
            </p>
          </div>
        ) : (
          blocks.map((block) => {
            const isImage = block.type === 'image';
            const tagMatch = BLOCK_TAGS.find(t => t.label.toLowerCase() === (block.tag || '').toLowerCase()) || BLOCK_TAGS[0];

            return (
              <div
                key={block.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group shadow-sm"
              >
                {/* Block Header */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {isImage ? (
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[8.5px] font-bold shrink-0">
                        IMAGE RECON
                      </span>
                    ) : (
                      <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold border shrink-0 ${tagMatch.color}`}>
                        {block.tag || 'Objective'}
                      </span>
                    )}

                    <span className="font-bold text-white text-[11px] truncate block">
                      {block.title}
                    </span>
                  </div>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer shrink-0"
                      title="Delete Entry"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
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
                      <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                        {block.caption}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    {block.content}
                  </p>
                )}

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-900">
                  <span>By @{block.createdByHandle || 'Architect'}</span>
                  <span>{new Date(block.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL: Insert Text Block ── */}
      {activeModal === 'text' && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono animate-fade-in">
          <div className="bg-[#0b121d] border border-amber-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col text-slate-100">
            <div className="p-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-amber-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-amber-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  INSERT DIRECTIVE / TEXT BLOCK
                </h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateTextBlock} className="p-4 space-y-3.5">
              {/* Tag selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-300 uppercase block">
                  CATEGORY TAG:
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
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
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase block">
                  ENTRY TITLE:
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
                  DIRECTIVE TEXT / BRIEFING INTEL:
                </label>
                <textarea
                  rows={4}
                  required
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type briefing details, security warnings, or lore notes..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-sans"
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
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {submitting ? 'PINNING...' : 'PIN TO DOCKET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Insert Image Handout ── */}
      {activeModal === 'image' && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono animate-fade-in">
          <div className="bg-[#0b121d] border border-cyan-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col text-slate-100">
            <div className="p-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-cyan-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-cyan-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  PIN VISUAL RECON / IMAGE HANDOUT
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
                  {submitting ? 'PINNING...' : 'PIN IMAGE'}
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
