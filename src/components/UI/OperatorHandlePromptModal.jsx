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
  ArrowRight
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
