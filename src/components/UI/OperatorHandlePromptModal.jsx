import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Radio, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Lock, 
  AtSign, 
  Dices, 
  Mail, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AudioService } from '../../services/audioService';
import { generateTempHandle } from '../../utils/personaValidationUtils';

/**
 * @file OperatorHandlePromptModal.jsx
 * @description Modal prompt triggered when an operator logs in for the first time
 * or does not have an explicitly set handle.
 * Prompts for:
 * 1. An Operator Handle (callsign) - defaults to a random 8-digit alphanumeric string.
 * 2. Yes/No selection for email list for game-related info, updates, and offers.
 * Ensures no email is ever exposed to other users on the platform.
 */
export const OperatorHandlePromptModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  currentHandle = '', 
  currentEmailOptIn = null,
  onSaveSuccess 
}) => {
  const [handle, setHandle] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize handle with current or newly generated 8-digit temporary handle
  useEffect(() => {
    if (isOpen) {
      const existing = currentHandle || localStorage.getItem('userHandle') || '';
      // If no valid handle exists, assign a fresh 8-digit alphanumeric string
      const initial = existing && !existing.includes('@') 
        ? existing 
        : generateTempHandle(currentUser?.uid);
      setHandle(initial);

      if (currentEmailOptIn !== null && currentEmailOptIn !== undefined) {
        setEmailOptIn(Boolean(currentEmailOptIn));
      } else {
        const storedOpt = localStorage.getItem('emailOptIn');
        setEmailOptIn(storedOpt !== null ? storedOpt === 'true' : true);
      }
      setErrorMessage('');
    }
  }, [isOpen, currentHandle, currentEmailOptIn, currentUser?.uid]);

  if (!isOpen) return null;

  const handleRollRandom = () => {
    AudioService.playTerminalBeep(1250, 0.03);
    const newTemp = generateTempHandle();
    setHandle(newTemp);
    setErrorMessage('');
  };

  const handleValidateHandle = (val) => {
    const trimmed = (val || '').trim().replace(/^@/, '');
    if (!trimmed) {
      return 'An operator handle is required to enter the network.';
    }
    if (trimmed.includes('@')) {
      return 'Handles cannot contain @ or email domain formatting.';
    }
    if (trimmed.length < 3) {
      return 'Handle must be at least 3 characters long.';
    }
    if (trimmed.length > 24) {
      return 'Handle cannot exceed 24 characters.';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return 'Handle may only contain letters, numbers, hyphens, and underscores.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const validationErr = handleValidateHandle(handle);
    if (validationErr) {
      setErrorMessage(validationErr);
      AudioService.playTerminalBeep(450, 0.08);
      return;
    }

    const cleanHandle = handle.trim().replace(/^@/, '');

    try {
      setIsSubmitting(true);
      AudioService.playTerminalBeep(1350, 0.03);

      localStorage.setItem('userHandle', cleanHandle);
      localStorage.setItem('emailOptIn', String(emailOptIn));
      localStorage.setItem('handleSet', 'true');

      if (currentUser?.uid && db) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const nowIso = new Date().toISOString();
        await setDoc(userDocRef, {
          userHandle: cleanHandle,
          handleSet: true,
          isTempHandle: false,
          displayName: cleanHandle,
          emailOptIn: Boolean(emailOptIn),
          emailOptInUpdatedAt: nowIso,
          updatedAt: nowIso
        }, { merge: true });
      }

      AudioService.playTerminalBeep(1600, 0.05);

      if (onSaveSuccess) {
        onSaveSuccess({ handle: cleanHandle, emailOptIn });
      }

      // Dispatch storage event so other open tabs/windows sync immediately
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }

      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Failed to update operator handle & email preferences:', err);
      setErrorMessage(err?.message || 'Failed to save network callsign. Please try again.');
      AudioService.playTerminalBeep(450, 0.08);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto select-none font-sans">
      <div 
        className="bg-[#0b0f17] border-2 border-cyan-400/80 rounded-2xl w-full max-w-xl shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col font-sans select-none animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-950 border-b border-cyan-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              <Radio size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                  TERRAN DATA NET
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_6px_#10b981]" />
              </div>
              <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-slate-100 mt-0.5">
                OPERATOR CALLSIGN &amp; INTEL SETUP
              </h3>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 bg-[#090d16]/80 overflow-y-auto max-h-[80vh]">
          {/* Welcome & Privacy Explanation */}
          <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/35 relative overflow-hidden space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-xs">
              <Shield size={14} className="text-cyan-400 shrink-0" />
              <span>ROSTER PRIVACY PROTOCOL</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Everyone who logs into the platform is listed on the network roster using their <strong className="text-cyan-200">Operator Handle</strong>. Your email is confidential and used exclusively on the backend for account identification and direct platform transmissions—other operators will only ever see your handle.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/70 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Operator Handle Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <AtSign size={13} className="text-cyan-400" />
                <span>CHOOSE OPERATOR HANDLE</span>
              </label>
              <button
                type="button"
                onClick={handleRollRandom}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Roll a new random 8-digit temporary handle"
              >
                <Dices size={13} className="text-cyan-400" />
                <span>ROLL 8-DIGIT HANDLE</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 font-mono font-bold text-sm">
                @
              </div>
              <input
                type="text"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value.replace(/^@/, ''));
                  if (errorMessage) setErrorMessage('');
                }}
                maxLength={24}
                placeholder="Callsign (e.g. GhostRider, Nova-7)"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white rounded-xl text-sm font-mono outline-none transition-colors shadow-inner"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>3-24 characters • Alphanumeric, underscores, hyphens</span>
              <span className="text-cyan-400/80">Handles can be changed anytime in Settings</span>
            </div>
          </div>

          {/* Section 2: Email Transmission List Yes/No */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div>
              <label className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={13} className="text-amber-400" />
                <span>GAME INTEL &amp; UPDATES TRANSMISSION LIST</span>
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Would you like to receive platform updates, game-related info, universe lore dispatches, and special offers via email?
              </p>
            </div>

            {/* Interactive Yes / No Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option: YES */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  setEmailOptIn(true);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  emailOptIn === true
                    ? 'bg-emerald-950/40 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      emailOptIn === true ? 'border-emerald-400 bg-emerald-400 text-black' : 'border-slate-600'
                    }`}>
                      {emailOptIn === true && <Check size={11} className="stroke-[3]" />}
                    </div>
                    <span className="font-mono text-xs font-bold uppercase tracking-wide">
                      YES — OPT IN
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal pl-6">
                  Send me game updates, rule expansions, scenario drops, and special offers.
                </p>
              </button>

              {/* Option: NO */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setEmailOptIn(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  emailOptIn === false
                    ? 'bg-slate-900/90 border-cyan-500/70 text-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    emailOptIn === false ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-slate-600'
                  }`}>
                    {emailOptIn === false && <Check size={11} className="stroke-[3]" />}
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wide">
                    NO — ESSENTIALS ONLY
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal pl-6">
                  Only send vital authentication and security notices. No promotional dispatches.
                </p>
              </button>
            </div>

            {/* Official Discord Server Invite Link */}
            <a
              href="https://discord.gg/X5xbhYJtRQ"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => AudioService.playTerminalBeep(1250, 0.02)}
              className="mt-2 p-3 rounded-xl bg-indigo-950/35 hover:bg-indigo-950/55 border border-indigo-500/45 hover:border-indigo-400 transition-all flex items-center justify-between gap-3 group shadow-[0_0_15px_rgba(99,102,241,0.12)]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/50 flex items-center justify-center text-indigo-300 group-hover:text-white group-hover:bg-[#5865F2] transition-colors shrink-0">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-mono font-bold text-indigo-200 group-hover:text-white truncate">
                    Tangent Science Fantasy Role Playing — Discord Server Invite
                  </div>
                  <div className="text-[10px] font-mono text-indigo-400/90 truncate">
                    https://discord.gg/X5xbhYJtRQ
                  </div>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500 border border-indigo-400/40 text-indigo-200 group-hover:text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors">
                <span>JOIN DISCORD</span>
                <ExternalLink size={11} />
              </div>
            </a>
          </div>

          {/* Privacy Footnote */}
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-2">
            <Lock size={12} className="text-cyan-400 shrink-0" />
            <span>
              Backend ID: <span className="text-slate-300">{currentUser?.email ? 'Protected Email Linked' : 'Authenticated Session'}</span> • Never visible on HoloNet comms or squad rosters.
            </span>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:via-teal-500 hover:to-emerald-500 text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-widest shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'SYNCHRONIZING CALLSIGN...' : 'CONFIRM CALLSIGN & ENTER NETWORK'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperatorHandlePromptModal;
