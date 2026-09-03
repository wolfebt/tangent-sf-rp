import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Shield, 
  Users, 
  Check, 
  AlertTriangle, 
  Radio, 
  Crown, 
  Sparkles, 
  Heart, 
  BookOpen, 
  Eye,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useFolio } from '../../context/FolioContext';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';

export const TeamInviteConfirmationModal = ({ isOpen, onClose, invite }) => {
  const { acceptInvite, declineInvite } = useGroup();
  const { personaRoster, roster, activePersona } = useFolio();
  const { currentUser } = useAuth();

  const allPersonas = personaRoster || roster || [];
  
  const [selectedPersonaId, setSelectedPersonaId] = useState(
    activePersona?.['character-doc-id'] || activePersona?.id || (allPersonas[0]?.['character-doc-id'] || allPersonas[0]?.id || 'spectator')
  );
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowDeclineConfirm(false);
      setSubmitting(false);
      const defaultId = activePersona?.['character-doc-id'] || activePersona?.id || (allPersonas[0]?.['character-doc-id'] || allPersonas[0]?.id || 'spectator');
      setSelectedPersonaId(defaultId);
    }
  }, [isOpen, activePersona, allPersonas]);

  if (!isOpen || !invite) return null;

  const metadata = invite.groupMetadata || {};
  const groupName = invite.groupName || metadata.name || 'Tactical Fireteam';
  const gmHandle = invite.fromUserHandle || metadata.creatorHandle || 'Architect';
  const campaignTitle = metadata.campaignTitle || '';
  const description = metadata.description || 'Tactical operations and mission chatter.';
  const status = metadata.status || 'Recruiting';
  const maxMembers = metadata.maxMembers || 6;
  const currentCount = metadata.currentMembersCount || 1;
  const isFull = currentCount >= maxMembers;

  const handleConfirmJoin = async () => {
    setSubmitting(true);
    try {
      let chosenPersona = null;
      if (selectedPersonaId !== 'spectator') {
        chosenPersona = allPersonas.find(p => (p['character-doc-id'] || p.id) === selectedPersonaId) || null;
      }
      await acceptInvite(invite.id, invite.groupId, chosenPersona);
      onClose();
    } catch (err) {
      console.error('Failed to accept squad invite:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDecline = async () => {
    setSubmitting(true);
    try {
      await declineInvite(invite.id);
      onClose();
    } catch (err) {
      console.error('Failed to decline squad invite:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-fade-in">
      <div className="bg-[#0b121d] border border-cyan-500/50 rounded-2xl w-full max-w-xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.3)] flex flex-col max-h-[85vh] sm:max-h-[88vh] text-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300">
              <Shield size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
                  COMMISSION INVITATION
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border uppercase ${
                  status === 'In Session'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Review fireteam dossier &amp; select your deploying operative
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-mono">
          
          {/* Squad Dossier Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-white tracking-wide font-mono flex items-center gap-1.5">
                <span>{groupName}</span>
              </span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded font-bold">
                {currentCount} / {maxMembers} OPERATIVES
              </span>
            </div>

            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <Crown size={12} className="text-amber-400" />
              <span>Lead GM: <strong className="text-cyan-300">@{gmHandle}</strong></span>
              {campaignTitle && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-purple-300 truncate">Story: {campaignTitle}</span>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              {description}
            </p>

            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-400">
                <Radio size={11} />
                <span>Tied-in Squad Frequency will unlock upon deployment</span>
              </span>
              <span>Invited {new Date(invite.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Decline Confirmation Prompt if toggled */}
          {showDeclineConfirm ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle size={16} />
                <span>DECLINE FIRETEAM COMMISSION?</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Are you sure you want to decline this commission from <strong className="text-white">@{gmHandle}</strong> for squad <strong className="text-white">"{groupName}"</strong>? The invitation will be dismissed from your inbox.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeclineConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmDecline}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {submitting ? 'Declining...' : 'Yes, Decline Commission'}
                </button>
              </div>
            </div>
          ) : (
            /* Operative Folio Persona Selection */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles size={13} className="text-cyan-400" />
                  <span>Assign Operative Persona to Fireteam</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  {allPersonas.length} Available in Folio
                </span>
              </div>

              {allPersonas.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
                  <p className="text-slate-400 text-xs">No saved character sheets found in Folio.</p>
                  <p className="text-[10px] text-slate-500">You will join this squad as an Observer / Spectator.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {allPersonas.map((p) => {
                    const id = p['character-doc-id'] || p.id;
                    const name = p['char-name'] || p.name || 'Operative';
                    const species = p['char-species'] || p.species || 'Human';
                    const role = p['char-concept'] || p['char-occu'] || p.occupation || 'Specialist';
                    const hp = p.health || 30;
                    const vit = p.vitality || 30;
                    const isSelected = selectedPersonaId === id;

                    return (
                      <div
                        key={id}
                        onClick={() => {
                          AudioService.playTerminalBeep(1100, 0.02);
                          setSelectedPersonaId(id);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                            isSelected 
                              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300' 
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            {name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <span className="font-bold text-xs block truncate">{name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {species} • {role}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-[10px]">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-emerald-400">HP: {hp}</span>
                            <span className="text-cyan-400">VIT: {vit}</span>
                          </div>
                          {isSelected && <CheckCircle2 size={16} className="text-cyan-400" />}
                        </div>
                      </div>
                    );
                  })}

                  {/* Option: Join as Spectator */}
                  <div
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setSelectedPersonaId('spectator');
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      selectedPersonaId === 'spectator'
                        ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-slate-400" />
                      <span className="text-xs">Join as Tactical Observer / Spectator (No Sheet Assigned)</span>
                    </div>
                    {selectedPersonaId === 'spectator' && <CheckCircle2 size={16} className="text-cyan-400" />}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
          {!showDeclineConfirm ? (
            <>
              <button
                type="button"
                onClick={() => setShowDeclineConfirm(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Decline
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Decide Later
                </button>

                <button
                  type="button"
                  disabled={submitting || isFull}
                  onClick={handleConfirmJoin}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <Check size={14} />
                  <span>{submitting ? 'DEPLOYING...' : isFull ? 'SQUAD CAPACITY FULL' : 'CONFIRM & DEPLOY TO SQUAD'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full text-right">
              <span className="text-[10px] text-slate-500 font-mono">
                Declining will notify the Lead Architect.
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default TeamInviteConfirmationModal;
