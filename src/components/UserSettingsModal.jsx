import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { ComprehensiveUserGuideModal } from './UI/ComprehensiveUserGuideModal';
import { AudioService } from '../services/audioService';

const AI_PLATFORMS = [
  { id: 'gemini', name: 'Google Gemini (System Default)' },
  { id: 'openai', name: 'OpenAI GPT-4 / ChatGPT' },
  { id: 'anthropic', name: 'Anthropic Claude' },
  { id: 'custom', name: 'Custom AI Endpoint' }
];

export const UserSettingsModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const { currentUser, refreshUserHandle } = useAuth();
  const [handle, setHandle] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [aiPlatform, setAiPlatform] = useState('gemini');
  const [otherAiApiKey, setOtherAiApiKey] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [initialGuideTab, setInitialGuideTab] = useState('hub');

  useEffect(() => {
    if (isOpen) {
      setHandle(localStorage.getItem('userHandle') || '');
      setContactInfo(localStorage.getItem('userContactInfo') || '');
      setGeminiApiKey(localStorage.getItem('geminiApiKey') || '');
      setAiPlatform(localStorage.getItem('aiPlatform') || 'gemini');
      setOtherAiApiKey(localStorage.getItem('otherAiApiKey') || '');
      setSaveMessage('');

      if (currentUser) {
        getDoc(doc(db, 'users', currentUser.uid)).then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.userHandle !== undefined) {
              setHandle(data.userHandle);
              localStorage.setItem('userHandle', data.userHandle);
            }
            if (data.userContactInfo !== undefined) {
              setContactInfo(data.userContactInfo);
              localStorage.setItem('userContactInfo', data.userContactInfo);
            }
            if (data.geminiApiKey !== undefined) {
              setGeminiApiKey(data.geminiApiKey);
              localStorage.setItem('geminiApiKey', data.geminiApiKey);
            }
            if (data.aiPlatform !== undefined) {
              setAiPlatform(data.aiPlatform);
              localStorage.setItem('aiPlatform', data.aiPlatform);
            }
            if (data.otherAiApiKey !== undefined) {
              setOtherAiApiKey(data.otherAiApiKey);
              localStorage.setItem('otherAiApiKey', data.otherAiApiKey);
            }
          }
        }).catch(err => console.warn("Failed to fetch user cloud settings:", err));
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();

    const trimmedHandle = handle.trim();
    const trimmedContactInfo = contactInfo.trim();
    const trimmedGeminiKey = geminiApiKey.trim();
    const trimmedOtherKey = otherAiApiKey.trim();

    localStorage.setItem('userHandle', trimmedHandle);
    localStorage.setItem('userContactInfo', trimmedContactInfo);
    localStorage.setItem('geminiApiKey', trimmedGeminiKey);
    localStorage.setItem('aiPlatform', aiPlatform);
    localStorage.setItem('otherAiApiKey', trimmedOtherKey);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          userHandle: trimmedHandle,
          userContactInfo: trimmedContactInfo,
          geminiApiKey: trimmedGeminiKey,
          aiPlatform: aiPlatform,
          otherAiApiKey: trimmedOtherKey,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn("Failed to sync settings to Firestore:", err);
      }
    }

    setSaveMessage('Settings saved successfully!');

    if (refreshUserHandle) {
      refreshUserHandle();
    }

    if (onSaveSuccess) {
      onSaveSuccess();
    }

    setTimeout(() => {
      setSaveMessage('');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-md p-4 pt-6 sm:pt-10 overflow-y-auto">
      <div className="bg-[#0d1117] border border-cyan-500/50 rounded-xl w-full max-w-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-cyan-900/60 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              USER SETTINGS & IDENTITY
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold leading-none px-2 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto max-h-[75vh] text-xs">

          {/* System Documentation & User Guide Banner */}
          <div className="p-3.5 bg-gradient-to-r from-cyan-950/60 to-slate-900/80 border border-cyan-500/40 rounded-xl flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shrink-0">
                <BookOpen size={16} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white font-mono uppercase tracking-wider text-xs">
                  Comprehensive User Guide
                </div>
                <div className="text-[10px] text-cyan-300/80 truncate">
                  Full 10-app system manuals, components &amp; mechanics breakdown
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                setIsGuideOpen(true);
              }}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 hover:text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open Guide</span>
              <ExternalLink size={12} />
            </button>
          </div>
          
          {/* Public Handle */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              Public Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="E.g. Operator_Zero"
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white p-2.5 rounded text-xs outline-none"
            />
            <p className="text-[10px] text-slate-400 italic">
              Public-facing display name. Used across UI items to protect your email identity (email remains stored securely).
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              Public Contact Info
            </label>
            <textarea
              rows={2}
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="E.g. Discord: @operator0 | Comms: frequency-7"
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white p-2.5 rounded text-xs outline-none"
            />
            <p className="text-[10px] text-slate-400 italic">
              Optional contact details or comms channels you want to be publicly visible on your profile/items.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              🤖 AI Platform & Key Configuration
            </h4>

            {/* AI Platform Choice */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Primary AI Platform
                </label>
                <select
                  value={aiPlatform}
                  onChange={(e) => setAiPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-400"
                >
                  {AI_PLATFORMS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Gemini Key Override */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Gemini API Key (Optional Override)
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Using Secured System Default Key"
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-400 font-mono"
                />
                <p className="text-[10px] text-slate-400 italic mt-0.5">
                  Leave blank to automatically use the secured system default API key.
                </p>
              </div>

              {/* Secondary Key */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Secondary / Custom AI API Key (Optional)
                </label>
                <input
                  type="password"
                  value={otherAiApiKey}
                  onChange={(e) => setOtherAiApiKey(e.target.value)}
                  placeholder="Enter secondary or custom API key..."
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {saveMessage && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded text-xs text-center font-bold">
              {saveMessage}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Comprehensive User Guide Modal */}
      <ComprehensiveUserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialTab={initialGuideTab}
      />
    </div>
  );
};
