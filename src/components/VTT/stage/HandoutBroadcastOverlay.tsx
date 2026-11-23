/**
 * @file HandoutBroadcastOverlay.tsx
 * @description Synchronized Player Handout Broadcast Overlay + Architect Handout Push Modal.
 * Displays handouts pushed by the Architect across LiveKit/Yjs (`stage-remote-handout`).
 */

import React, { useEffect, useState } from 'react';
import { X, Send, FileText, Sparkles } from 'lucide-react';
import { VttEventBus } from '../../../utils/vttEventBus';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';
import { useCampaign } from '../../../context/CampaignContext';

export interface BroadcastHandout {
  id: string;
  title: string;
  imageUrl?: string;
  text?: string;
  sender?: string;
  timestamp: number;
}

export interface HandoutBroadcastOverlayProps {
  isPushModalOpen?: boolean;
  onClosePushModal?: () => void;
}

export const HandoutBroadcastOverlay: React.FC<HandoutBroadcastOverlayProps> = ({
  isPushModalOpen = false,
  onClosePushModal
}) => {
  const { elementsCatalog = [] } = (useCampaign() as any) || {};
  const [activeHandout, setActiveHandout] = useState<BroadcastHandout | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

  useEffect(() => {
    const unsub = VttEventBus.on('stage-remote-handout', (payload) => {
      if (!payload?.title) return;
      setActiveHandout(payload);
    });
    return unsub;
  }, []);

  const handoutElements = (elementsCatalog || []).filter(
    (e: any) => e?.type === 'Handout' || e?.type === 'Clue'
  );

  const pushHandout = (handout: { id: string; title: string; imageUrl?: string; text?: string }) => {
    const payload: BroadcastHandout = {
      ...handout,
      sender: 'Architect',
      timestamp: Date.now()
    };
    getVttMultiplayerSync().broadcastHandout(handout);
    VttEventBus.emit('stage-remote-handout', payload);
    onClosePushModal?.();
  };

  return (
    <>
      {/* Operative Received Handout Modal */}
      {activeHandout && (
        <div
          role="dialog"
          aria-label={`Operative Handout: ${activeHandout.title}`}
          className="fixed inset-0 z-[260] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="max-w-xl w-full bg-[#0b101d] border border-cyan-500/60 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden text-slate-100 font-sans">
            <div className="px-4 py-3 bg-gradient-to-r from-cyan-950/90 to-slate-900 border-b border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-200 uppercase">
                <Sparkles size={14} className="text-amber-400" />
                <span>Transmitted Dossier: {activeHandout.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveHandout(null)}
                className="p-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                aria-label="Dismiss Handout"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              {activeHandout.imageUrl && (
                <img
                  src={activeHandout.imageUrl}
                  alt={activeHandout.title}
                  className="w-full max-h-80 object-contain rounded-xl border border-slate-800 bg-slate-950"
                />
              )}
              {activeHandout.text && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {activeHandout.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Architect Handout Push Picker */}
      {isPushModalOpen && (
        <div
          role="dialog"
          aria-label="Push Handout to Operatives"
          className="fixed inset-0 z-[250] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="max-w-lg w-full bg-[#0b101d] border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-mono">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5">
                <Send size={13} /> Push Handout / Clue to Operatives
              </span>
              <button
                type="button"
                onClick={onClosePushModal}
                className="p-1 rounded bg-slate-950 border border-slate-700 text-slate-300 cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {handoutElements.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">
                    From Story Elements Catalog
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {handoutElements.map((elem: any) => (
                      <div
                        key={elem.id}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-cyan-300 truncate flex items-center gap-1.5">
                            <FileText size={11} />
                            <span>{elem.title || elem.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {elem.fields?.summary || elem.content?.replace(/<[^>]+>/g, '').slice(0, 80) || elem.type}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            pushHandout({
                              id: elem.id,
                              title: elem.title || elem.name || 'Clue',
                              imageUrl: elem.fields?.imageUrl || elem.imageUrl || undefined,
                              text: (elem.content || elem.fields?.summary || '').replace(/<[^>]+>/g, '')
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] shrink-0 cursor-pointer"
                        >
                          Push
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">
                  Quick Custom Handout
                </span>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Handout Title (e.g. Intercepted Telemetry)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Optional Image URL"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={3}
                  placeholder="Briefing prose or forensic text..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
                <button
                  type="button"
                  disabled={!customTitle.trim() && !customText.trim()}
                  onClick={() => {
                    pushHandout({
                      id: `handout_${Date.now()}`,
                      title: customTitle.trim() || 'Tactical Transmission',
                      ...(customImageUrl.trim() ? { imageUrl: customImageUrl.trim() } : {}),
                      ...(customText.trim() ? { text: customText.trim() } : {})
                    });
                    setCustomTitle('');
                    setCustomText('');
                    setCustomImageUrl('');
                  }}
                  className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-black font-bold uppercase text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={12} /> Broadcast to All Clients
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HandoutBroadcastOverlay;
