import React, { useState, useMemo } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { useAuth } from '../../../context/AuthContext';
import { auth } from '../../../firebase';
import { AudioService } from '../../../services/audioService';
import FolioImageCropModal from '../modals/FolioImageCropModal';
import {
  uploadFolioSlotImage,
  deleteFolioSlotImage,
  getFolioSlotImageUrl
} from '../../../services/folioMediaService';
import { FOLIO_IMAGE_SLOTS } from '../../../services/imageOptimizationService';
import {
  Camera,
  Upload,
  Trash2,
  Edit3,
  Shield,
  Sparkles,
  Image as ImageIcon,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  Layers,
  ZoomIn,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react';

export default function MediaTab() {
  const { characterData, updateField, isLocked, isPlayerOverride, triggerSave } = useFolio();
  const { currentUser } = useAuth();
  const activeUser = currentUser || auth?.currentUser;
  const isSheetLocked = Boolean(isLocked && !isPlayerOverride);

  // Modal crop studio state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [activeCropSlot, setActiveCropSlot] = useState('portrait');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState(null);

  const charName = characterData?.['char-name'] || 'Operative';
  const media = characterData?.media || {};

  // Resolved URLs
  const portraitUrl = getFolioSlotImageUrl(characterData, 'portrait');
  const tokenUrl = getFolioSlotImageUrl(characterData, 'token');
  const standeeUrl = getFolioSlotImageUrl(characterData, 'standee');

  // Resolved Gallery Array
  const galleryItems = useMemo(() => {
    const raw = media.gallery;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [media.gallery]);

  // Compute total byte footprint
  const totalBytes = useMemo(() => {
    let sum = 0;
    if (media.portrait?.byteSize) sum += media.portrait.byteSize;
    if (media.token?.byteSize) sum += media.token.byteSize;
    if (media.standee?.byteSize) sum += media.standee.byteSize;
    if (Array.isArray(media.gallery)) {
      media.gallery.forEach(item => {
        if (item?.byteSize) sum += item.byteSize;
      });
    }
    return sum;
  }, [media]);

  const totalKB = Math.round(totalBytes / 1024);

  // Open Crop Studio for specific slot
  const handleOpenStudio = (slotType, galleryIdx = 0) => {
    if (isSheetLocked) return;
    try {
      AudioService.play?.('click');
    } catch {}
    setActiveCropSlot(slotType);
    setActiveGalleryIndex(galleryIdx);
    setIsCropModalOpen(true);
  };

  // Save handler called by FolioImageCropModal
  const handleSaveFolioImage = async (optimizedResult) => {
    setIsUploading(true);
    try {
      const docId = characterData?.['character-doc-id'] || characterData?.id;
      const slotType = optimizedResult.slotType || activeCropSlot;

      let slotMetadata;
      if (docId && activeUser?.uid) {
        slotMetadata = await uploadFolioSlotImage({
          user: activeUser,
          personaId: docId,
          slotType,
          optimizedResult,
          galleryIndex: activeGalleryIndex
        });
      } else {
        // Local / guest fallback
        slotMetadata = {
          url: optimizedResult.dataUrl,
          width: optimizedResult.width,
          height: optimizedResult.height,
          byteSize: optimizedResult.byteSize,
          updatedAt: new Date().toISOString()
        };
      }

      if (slotType === 'gallery') {
        const nextGallery = [...galleryItems];
        nextGallery[activeGalleryIndex] = {
          id: `ref_${activeGalleryIndex}`,
          label: nextGallery[activeGalleryIndex]?.label || `Reference Asset #${activeGalleryIndex + 1}`,
          ...slotMetadata
        };
        updateField('media', { ...media, gallery: nextGallery });
      } else {
        const updatedMedia = {
          ...media,
          [slotType]: slotMetadata
        };
        updateField('media', updatedMedia);

        if (slotType === 'portrait') {
          updateField('avatar', slotMetadata.url);
        } else if (slotType === 'token') {
          updateField('tokenUrl', slotMetadata.url);
        }
      }

      if (triggerSave) triggerSave();
    } catch (err) {
      console.error('[MediaTab] Failed to save folio image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete handler
  const handleDeleteSlot = async (slotType, galleryIdx = null) => {
    if (isSheetLocked) return;
    try {
      AudioService.play?.('trash');
    } catch {}

    const docId = characterData?.['character-doc-id'] || characterData?.id;

    if (slotType === 'gallery' && galleryIdx !== null) {
      const target = galleryItems[galleryIdx];
      if (docId && target?.storagePath && activeUser?.uid) {
        await deleteFolioSlotImage({
          user: activeUser,
          personaId: docId,
          slotType: 'gallery',
          storagePath: target.storagePath
        });
      }
      const nextGallery = galleryItems.filter((_, idx) => idx !== galleryIdx);
      updateField('media', { ...media, gallery: nextGallery });
    } else {
      const currentSlot = media[slotType];
      if (docId && currentSlot?.storagePath && activeUser?.uid) {
        await deleteFolioSlotImage({
          user: activeUser,
          personaId: docId,
          slotType,
          storagePath: currentSlot.storagePath
        });
      }

      const updatedMedia = { ...media };
      delete updatedMedia[slotType];
      updateField('media', updatedMedia);

      if (slotType === 'portrait') {
        updateField('avatar', null);
      } else if (slotType === 'token') {
        updateField('tokenUrl', null);
      }
    }

    if (triggerSave) triggerSave();
  };

  return (
    <div className="tab-panel active p-4 space-y-6 pb-20 w-full">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-400">
                <Camera className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-slate-100 flex items-center gap-2">
                Visual Dossier & Media Studio
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Manage character artwork, tactical VTT tokens, full-body standees, and secondary reference imagery.
              All assets are client-optimized into lightweight WebP with immutable caching headers.
            </p>
          </div>

          {/* Telemetry / Budget Pill */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2.5 font-mono text-xs">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Stored Media</div>
                <div className="text-cyan-300 font-bold">{totalKB} KB <span className="text-slate-500 font-normal">/ 1,400 KB</span></div>
              </div>
              <div className="w-2 h-8 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(10, (totalKB / 1400) * 100))}%` }}
                />
              </div>
            </div>

            <div className="hidden sm:flex flex-col text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-2 rounded-xl">
              <span className="flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> WebP Pipeline Active
              </span>
              <span className="text-[9.5px] text-emerald-300/80">Zero Server Compute</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Portrait & Tactical Token & Standee */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLOT 1: Primary Portrait (3:4) */}
        <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative group">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Primary Portrait
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 rounded">
                3:4 &bull; Max 768×1024
              </span>
            </div>

            {/* Portrait Frame */}
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-inner group/portrait">
              {portraitUrl ? (
                <>
                  <img
                    src={portraitUrl}
                    alt={charName}
                    className="w-full h-full object-cover transition-transform group-hover/portrait:scale-105 duration-200"
                  />
                  {/* Quick Lightbox Zoom Trigger */}
                  <button
                    type="button"
                    onClick={() => setPreviewModalImage(portraitUrl)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-slate-200 rounded-lg backdrop-blur-xs opacity-0 group-hover/portrait:opacity-100 transition-opacity"
                    title="Inspect Full Resolution"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-500 bg-gradient-to-b from-slate-900 to-slate-950">
                  <div className="p-3 bg-slate-900 rounded-full border border-slate-800 mb-2">
                    <User className="w-8 h-8 opacity-40 text-cyan-400" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">No Portrait Assigned</span>
                  <span className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                    Appears in Folio header, party HUD, and operative roster.
                  </span>
                </div>
              )}

              {/* Sci-Fi Corner Accents */}
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/70 pointer-events-none" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/70 pointer-events-none" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/70 pointer-events-none" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/70 pointer-events-none" />
            </div>

            {/* Metadata breakdown */}
            {media.portrait && (
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>Resolution: {media.portrait.width}×{media.portrait.height}</span>
                <span className="text-emerald-400 font-bold">{Math.round((media.portrait.byteSize || 0) / 1024)} KB</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              disabled={isSheetLocked}
              onClick={() => handleOpenStudio('portrait')}
              className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{portraitUrl ? 'Edit / Replace Portrait' : 'Upload Portrait'}</span>
            </button>
            {portraitUrl && !isSheetLocked && (
              <button
                type="button"
                onClick={() => handleDeleteSlot('portrait')}
                className="p-2 bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-xl transition-colors cursor-pointer"
                title="Remove Portrait"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* SLOT 2: Tactical VTT Token Pog (1:1) */}
        <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative group">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Tactical VTT Token
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 rounded">
                1:1 Pog &bull; Max 512×512
              </span>
            </div>

            {/* Circular Token Pog Frame */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-inner flex items-center justify-center p-4 group/token">
              {/* Tactical grid background */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              {tokenUrl ? (
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.35)] bg-slate-900">
                  <img
                    src={tokenUrl}
                    alt={`${charName} Token`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewModalImage(tokenUrl)}
                    className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-slate-100"
                    title="Inspect Token"
                  >
                    <ZoomIn className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-cyan-500/40 flex flex-col items-center justify-center p-4 text-center bg-cyan-950/20">
                  <Shield className="w-10 h-10 mb-2 text-cyan-400/40 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-300">No VTT Token Pog</span>
                  <span className="text-[10px] text-slate-500 mt-1 max-w-[160px]">
                    Transparent cutout for 2D/3D VTT maps and stage tokens.
                  </span>
                </div>
              )}
            </div>

            {/* Metadata breakdown */}
            {media.token && (
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>Alpha: Supported (WebP)</span>
                <span className="text-emerald-400 font-bold">{Math.round((media.token.byteSize || 0) / 1024)} KB</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              disabled={isSheetLocked}
              onClick={() => handleOpenStudio('token')}
              className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{tokenUrl ? 'Edit Pog / Re-crop' : 'Create Token Pog'}</span>
            </button>
            {tokenUrl && !isSheetLocked && (
              <button
                type="button"
                onClick={() => handleDeleteSlot('token')}
                className="p-2 bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-xl transition-colors cursor-pointer"
                title="Remove Token"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* SLOT 3: Full-Body Standee (1:2) */}
        <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative group">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Full-Body Standee
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 rounded">
                1:2 &bull; Max 600×1200
              </span>
            </div>

            {/* Standee Frame */}
            <div className="relative aspect-[1/2] max-h-[380px] w-full mx-auto rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-inner group/standee flex items-center justify-center">
              {standeeUrl ? (
                <>
                  <img
                    src={standeeUrl}
                    alt={`${charName} Standee`}
                    className="w-full h-full object-contain transition-transform group-hover/standee:scale-105 duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewModalImage(standeeUrl)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-slate-200 rounded-lg backdrop-blur-xs opacity-0 group-hover/standee:opacity-100 transition-opacity"
                    title="Inspect Standee"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-500 bg-gradient-to-b from-slate-900 to-slate-950">
                  <div className="p-3 bg-slate-900 rounded-full border border-slate-800 mb-2">
                    <Layers className="w-7 h-7 opacity-40 text-cyan-400" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">No Standee Uploaded</span>
                  <span className="text-[10px] text-slate-500 mt-1 max-w-[180px]">
                    Vertical figure view for armor, combat loadout, and equipment scale.
                  </span>
                </div>
              )}
            </div>

            {/* Metadata breakdown */}
            {media.standee && (
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>Bounds: {media.standee.width}×{media.standee.height}</span>
                <span className="text-emerald-400 font-bold">{Math.round((media.standee.byteSize || 0) / 1024)} KB</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              disabled={isSheetLocked}
              onClick={() => handleOpenStudio('standee')}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{standeeUrl ? 'Edit Standee' : 'Upload Standee'}</span>
            </button>
            {standeeUrl && !isSheetLocked && (
              <button
                type="button"
                onClick={() => handleDeleteSlot('standee')}
                className="p-2 bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-xl transition-colors cursor-pointer"
                title="Remove Standee"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SLOT 4: Reference & Mood Gallery */}
      <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              Reference & Lore Imagery
            </h3>
            <p className="text-xs text-slate-400">
              Vehicles, cyberware schematics, beast companions, faction badges, or location concept art.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 bg-slate-950 text-slate-400 border border-slate-800 rounded-lg self-start sm:self-auto">
            16:9 / 4:3 &bull; Max 3 Assets
          </span>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((idx) => {
            const item = galleryItems[idx];
            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between group/card"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                    <span className="font-bold text-slate-300">
                      {item?.label || `Reference Asset #${idx + 1}`}
                    </span>
                    {item?.byteSize && (
                      <span className="text-[10px] text-emerald-400">{Math.round(item.byteSize / 1024)} KB</span>
                    )}
                  </div>

                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-900/60 flex items-center justify-center">
                    {item?.url ? (
                      <>
                        <img
                          src={item.url}
                          alt={item.label || `Ref ${idx + 1}`}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewModalImage(item.url)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-slate-200 rounded backdrop-blur-xs opacity-0 group-hover/card:opacity-100 transition-opacity"
                          title="Zoom"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500">
                        <ImageIcon className="w-6 h-6 opacity-30 text-cyan-400 mb-1" />
                        <span className="text-[11px] font-mono">Empty Slot</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={isSheetLocked}
                    onClick={() => handleOpenStudio('gallery', idx)}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{item?.url ? 'Replace' : 'Upload Art'}</span>
                  </button>
                  {item?.url && !isSheetLocked && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot('gallery', idx)}
                      className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-700/40 text-red-300 rounded-lg transition-colors cursor-pointer"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cloud & Architecture Advisory Note */}
      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold font-mono uppercase text-slate-300">
            Zero Cloud Compute & Egress Optimization
          </span>
          <p className="leading-relaxed">
            All character visuals are pre-processed in your browser into modern WebP format before uploading to Firebase Storage. 
            Image dimensions are strictly bounded to prevent bloated payloads, and all assets are delivered via immutable browser and CDN cache headers.
          </p>
        </div>
      </div>

      {/* Folio Image Crop Studio Modal */}
      <FolioImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        initialSlot={activeCropSlot}
        onSave={handleSaveFolioImage}
        characterName={charName}
      />

      {/* Fullscreen Lightbox Preview Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={previewModalImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-cyan-500/40 shadow-2xl"
            />
            <button
              onClick={() => setPreviewModalImage(null)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold uppercase transition-colors"
            >
              Close Lightbox
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
