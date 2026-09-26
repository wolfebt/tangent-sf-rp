import React, { useState } from 'react';
import { Shield, Globe, Key, X, Lock, CheckCircle2, ArrowRight, Radio, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';

export const TerranNetAuthModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle, currentUser } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      AudioService.playTerminalBeep(1200, 0.04);
      setIsAuthenticating(true);
      setErrorMessage('');
      await loginWithGoogle();
      AudioService.playTerminalBeep(1500, 0.05);
      if (onClose) onClose();
    } catch (err) {
      console.error('Terran Data Net Authentication Failed:', err);
      setErrorMessage(err?.message || 'Authentication uplink interrupted. Please verify connection.');
      AudioService.playTerminalBeep(450, 0.1);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGuestDismiss = () => {
    AudioService.playTerminalBeep(900, 0.03);
    localStorage.setItem('terran_net_guest_dismissed', 'true');
    if (onClose) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto select-none font-sans"
      onClick={handleGuestDismiss}
    >
      <div
        className="bg-[#0d1117]/95 border-2 border-cyan-500/50 rounded-2xl w-full max-w-lg max-h-[92vh] shadow-[0_0_60px_rgba(34,211,238,0.25)] overflow-hidden flex flex-col font-sans select-none animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 bg-slate-950/90 border-b border-cyan-900/60 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              <Globe size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                  TERRAN DATA NET
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_6px_#22d3ee]" />
              </div>
              <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-slate-100 mt-0.5">
                SECURE OPERATIVE GATEWAY
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGuestDismiss}
            className="text-slate-400 hover:text-white text-xl font-bold leading-none p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss to Local Mode"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 bg-[#090d16]/70 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {/* Terran Data Net Access Description Banner */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-cyan-950/25 border border-cyan-500/35 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-3 relative z-10">
              <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shrink-0 mt-0.5">
                <Radio size={16} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>ACCESS TO THE TERRAN DATA NET</span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Accessing the <strong className="text-cyan-200 font-semibold">Terran Data Net</strong> links your operative station to the centralized interplanetary database. Authenticate with Google to synchronize character dossiers, retain encrypted cloud Foundry campaign states, and receive real-time tactical team transmissions across devices.
                </p>
              </div>
            </div>
          </div>

          {/* Error notification if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/60 text-red-300 text-[11px] font-mono flex items-center gap-2">
              <span className="font-bold">[ERR]</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Themed Google Authentication Button */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={handleGoogleLogin}
              className="w-full p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 hover:from-cyan-950 hover:via-cyan-900 hover:to-cyan-950 border-2 border-cyan-400/70 hover:border-cyan-300 text-white font-mono transition-all duration-200 shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] flex items-center justify-between group active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                {/* Official Google 'G' Mark inside high-tech frame */}
                <div className="w-8 h-8 rounded-lg bg-white/95 border border-cyan-300 flex items-center justify-center p-1.5 shrink-0 shadow-md">
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-bold tracking-wider text-cyan-200 group-hover:text-white uppercase flex items-center gap-1.5">
                    <span>{isAuthenticating ? 'AUTHENTICATING LINK...' : 'SIGN IN WITH GOOGLE'}</span>
                  </div>
                  <div className="text-[10px] text-cyan-400/80 tracking-tight">
                    Terran Data Net Federated OAuth 2.0
                  </div>
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-black transition-colors shrink-0">
                {isAuthenticating ? (
                  <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
              </div>
            </button>

            {/* Local / Offline Alternative */}
            <button
              type="button"
              onClick={handleGuestDismiss}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-mono text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key size={13} className="text-slate-500" />
              <span>CONTINUE AS LOCAL OPERATOR (OFFLINE CACHE)</span>
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="text-cyan-300 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} className="text-cyan-400" />
                <span>CLOUD ROSTER SYNC</span>
              </div>
              <p className="text-slate-400 text-[9px] leading-tight">
                Access your character sheets on any device or terminal.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="text-cyan-300 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} className="text-cyan-400" />
                <span>TACTICAL NETWORKS</span>
              </div>
              <p className="text-slate-400 text-[9px] leading-tight">
                Encrypted comms &amp; stage tactical multiplayer sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer & Telemetry */}
        <div className="p-3 sm:px-6 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-cyan-400/80">
            <Lock size={10} />
            <span>4096-BIT QUANTUM LATTICE</span>
          </div>
          <div>GATEWAY: SOL-TERRAN-01</div>
        </div>
      </div>
    </div>
  );
};

export default TerranNetAuthModal;
