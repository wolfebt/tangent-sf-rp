/**
 * @file UserGuideView.jsx
 * Interactive Reader Component for the Tangent Comprehensive User Guide.
 * Includes Ringed Planet emblem branding, 6W operational context answers in italics,
 * interactive Table of Contents, and sequential cross-article navigation.
 */

import React, { useRef, useEffect } from 'react';
import { 
  RingedPlanetLogo 
} from '../UI/RingedPlanetLogo';
import { 
  USER_GUIDE_SECTIONS 
} from './userGuideData';
import { 
  Compass, 
  Users, 
  Database, 
  Sparkles, 
  Layers, 
  Map, 
  Cpu, 
  Radio, 
  Dices, 
  Terminal, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Copy, 
  BookOpen, 
  Shield, 
  Key, 
  ExternalLink,
  ChevronRight,
  Zap,
  Activity,
  Layers2
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { AudioService } from '../../services/audioService';

// Icon mapping helper
const getGuideIcon = (iconName, size = 18, className = '') => {
  switch (iconName) {
    case 'RingedPlanetLogo':
      return <RingedPlanetLogo size={size} className={className} />;
    case 'Compass':
      return <Compass size={size} className={className} />;
    case 'Users':
      return <Users size={size} className={className} />;
    case 'Database':
      return <Database size={size} className={className} />;
    case 'Sparkles':
      return <Sparkles size={size} className={className} />;
    case 'Layers':
      return <Layers size={size} className={className} />;
    case 'Map':
      return <Map size={size} className={className} />;
    case 'Cpu':
      return <Cpu size={size} className={className} />;
    case 'Radio':
      return <Radio size={size} className={className} />;
    case 'Dices':
      return <Dices size={size} className={className} />;
    case 'Terminal':
      return <Terminal size={size} className={className} />;
    default:
      return <BookOpen size={size} className={className} />;
  }
};

export const UserGuideView = ({
  activeSectionId = 'intro',
  onSelectSection,
  onNavigate,
  prevItem = null,
  nextItem = null,
  onOpenCompendiumArticle = null
}) => {
  const containerRef = useRef(null);
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Scroll to top whenever section changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSectionId]);

  const activeSection = USER_GUIDE_SECTIONS.find(s => s.id === activeSectionId) || USER_GUIDE_SECTIONS[0];
  const isIntro = activeSection.id === 'intro';

  const handleCopyLink = () => {
    try {
      const url = `${window.location.origin}/compendium?guide=${activeSection.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      AudioService?.playTerminalBeep?.(1400, 0.02);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.warn('Copy link error:', err);
    }
  };

  const handleJump = (targetId) => {
    AudioService?.playTerminalBeep?.(1150, 0.02);
    if (onSelectSection) {
      onSelectSection(targetId);
    }
  };

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/95 text-slate-200 font-sans custom-scrollbar select-text">
      <div className="max-w-5xl mx-auto w-full space-y-8 pb-20">

        {/* =========================================================================
            SECTION 0: INTRO / TABLE OF CONTENTS WITH RINGED PLANET LOGO HERO
            ========================================================================= */}
        {isIntro ? (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Emblem Banner with Ringed Planet Logo */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-[#0a1120] to-slate-950 border border-cyan-500/40 p-6 sm:p-10 text-center shadow-[0_0_40px_rgba(6,182,212,0.15)]">
              {/* Background ambient glow circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center space-y-4">
                {/* PROMINENT RINGED PLANET LOGO AS REQUESTED */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-transform hover:scale-105 duration-300">
                  <RingedPlanetLogo size={84} glow={true} className="drop-shadow-lg" />
                </div>

                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase shadow-inner">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>v2.5+ CANONICAL COMPREHENSIVE EDITION</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold font-mono uppercase tracking-wider text-white [text-shadow:0_0_20px_rgba(34,211,238,0.4)]">
                    Tangent SFF RP User Guide
                  </h1>
                  <p className="text-xs sm:text-sm font-mono text-cyan-400/90 max-w-2xl mx-auto">
                    Unified Operations Manual for the Science Fantasy Roleplaying Ecosystem
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mx-auto pt-2">
                  {activeSection.lead}
                </p>
              </div>

              {/* 6W Questions Answered in Italics as Short Statements (Without Showing Questions) */}
              <div className="mt-8 pt-6 border-t border-cyan-900/60 text-left bg-slate-950/80 rounded-xl p-4 sm:p-5 border border-cyan-500/30 shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} className="text-cyan-400" />
                    <span>Operational Doctrine & Context</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-[13px] text-slate-200">
                  {activeSection.sixW.map((statement, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-cyan-400 font-mono text-xs font-bold leading-tight">↳</span>
                      <p className="italic text-slate-200/95 leading-snug">
                        *{statement}*
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Layers2 size={14} />
                <span>Recent Platform Upgrades & Architectural State</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeSection.architectureHighlights.map((hl, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 space-y-2 transition-all group">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 font-mono">
                        {hl.title}
                      </h3>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 shrink-0">
                        {hl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {hl.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Table of Contents (TOC) with Jump Cards */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-cyan-400" />
                  <span>Interactive Table of Contents</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-500">
                  {USER_GUIDE_SECTIONS.length - 1} SPECIALIZED APP GUIDES
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
                {USER_GUIDE_SECTIONS.filter(s => s.id !== 'intro').map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleJump(sec.id)}
                    className="group bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-xl p-4 text-left transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ background: `${sec.color}20`, border: `1px solid ${sec.color}60`, color: sec.color }}
                          >
                            {getGuideIcon(sec.iconName, 16)}
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">
                              SECTION {sec.num}
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 font-mono tracking-wide">
                              {sec.title}
                            </h3>
                          </div>
                        </div>

                        <span 
                          className="text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border"
                          style={{ background: `${sec.color}15`, color: sec.color, borderColor: `${sec.color}40` }}
                        >
                          {sec.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {sec.lead}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 group-hover:text-cyan-400">
                      <span>Explore Chapter</span>
                      <ChevronRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              SECTIONS 1 TO 10: SPECIALIZED COMPONENT SYSTEM MANUALS
              ========================================================================= */
          <div className="space-y-6 animate-fade-in">
            {/* Section Header Banner */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                    style={{ background: `${activeSection.color}20`, border: `1px solid ${activeSection.color}60`, color: activeSection.color }}
                  >
                    {getGuideIcon(activeSection.iconName, 22)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                        style={{ background: `${activeSection.color}15`, color: activeSection.color, borderColor: `${activeSection.color}40` }}
                      >
                        SECTION {activeSection.num} • {activeSection.badge}
                      </span>
                    </div>
                    <h1 className="text-lg sm:text-2xl font-extrabold font-mono uppercase tracking-wider text-white mt-1">
                      {activeSection.fullTitle || activeSection.title}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Copy Link to this Section"
                  >
                    {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedLink ? 'Copied' : 'Share'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleJump('intro')}
                    className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Return to Table of Contents"
                  >
                    <RingedPlanetLogo size={14} />
                    <span>TOC</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {activeSection.lead}
              </p>

              {/* 6W QUESTIONS ANSWERED IN ITALICS AS SHORT STATEMENTS (WITHOUT SHOWING QUESTIONS) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2 shadow-inner">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  <Sparkles size={11} className="text-cyan-400" />
                  <span>Operational Context & Parameters</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {activeSection.sixW.map((statement, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-mono text-xs font-bold leading-tight">↳</span>
                      <p className="italic text-xs sm:text-[13px] text-slate-200/95 leading-relaxed">
                        *{statement}*
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subsections Content */}
            <div className="space-y-6">
              {activeSection.sections?.map((sub, idx) => (
                <section key={idx} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 sm:p-6 space-y-3">
                  <h2 className="text-sm sm:text-base font-bold text-white uppercase font-mono tracking-wide flex items-center gap-2">
                    <span className="text-cyan-400 font-mono text-xs font-bold">#{idx + 1}</span>
                    <span>{sub.heading}</span>
                  </h2>

                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans space-y-2.5">
                    {sub.content.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('- ')) {
                        const items = paragraph.split('\n- ').map(item => item.replace(/^- /, ''));
                        return (
                          <ul key={pIdx} className="space-y-1.5 my-2 pl-4 list-disc marker:text-cyan-400 text-slate-300">
                            {items.map((bullet, bIdx) => (
                              <li key={bIdx} className="leading-snug">
                                <span dangerouslySetInnerHTML={{ 
                                  __html: DOMPurify.sanitize(bullet
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                                    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-[11px]">$1</code>'))
                                }} />
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (paragraph.startsWith('```')) {
                        const code = paragraph.replace(/```[a-z]*\n?/g, '').trim();
                        return (
                          <pre key={pIdx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-amber-300 overflow-x-auto my-2">
                            <code>{code}</code>
                          </pre>
                        );
                      }
                      if (paragraph.startsWith('|')) {
                        // Markdown Table
                        const rows = paragraph.trim().split('\n');
                        const headers = rows[0].split('|').map(s => s.trim()).filter(Boolean);
                        const bodyRows = rows.slice(2).map(r => r.split('|').map(s => s.trim()).filter(Boolean));
                        return (
                          <div key={pIdx} className="overflow-x-auto my-3 border border-slate-800 rounded-lg">
                            <table className="w-full text-left text-xs font-mono">
                              <thead className="bg-slate-900 text-cyan-300 border-b border-slate-800">
                                <tr>
                                  {headers.map((h, hIdx) => (
                                    <th key={hIdx} className="p-2.5 font-bold uppercase">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850">
                                {bodyRows.map((r, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-900/50">
                                    {r.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-2.5 text-slate-300" dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(cell.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>'))
                                      }} />
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      return (
                        <p key={pIdx} dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(paragraph
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                            .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-[11px]">$1</code>'))
                        }} />
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Pro-Tips & Hotkeys Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSection.proTips && activeSection.proTips.length > 0 && (
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 sm:p-5 space-y-2.5">
                  <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap size={14} />
                    <span>Architect Guidance &amp; Pro Tips</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activeSection.proTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeSection.hotkeys && activeSection.hotkeys.length > 0 && (
                <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 sm:p-5 space-y-2.5">
                  <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal size={14} />
                    <span>Contextual Keystroke Shortcuts</span>
                  </h3>
                  <div className="space-y-1.5">
                    {activeSection.hotkeys.map((hk, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                        <span className="text-slate-300">{hk.action}</span>
                        <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[11px]">
                          {hk.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sequential In-Flow Article Pagination Card */}
        <div className="pt-6 border-t border-slate-800/90 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {prevItem ? (
            <button
              type="button"
              onClick={() => {
                AudioService?.playTerminalBeep?.(1100, 0.02);
                if (onNavigate) onNavigate(prevItem);
              }}
              className="group flex items-center gap-3 p-3.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer text-left max-w-sm w-full sm:w-auto shadow-md"
              title={`Previous: ${prevItem.title || prevItem.name}`}
            >
              <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-cyan-500/20 text-cyan-400 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                <ArrowLeft size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Previous</div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate max-w-[220px]">
                  {prevItem.title || prevItem.name}
                </div>
              </div>
            </button>
          ) : (
            <div className="opacity-0 pointer-events-none hidden sm:block w-32" />
          )}

          {/* Table of contents quick link */}
          {!isIntro && (
            <button
              type="button"
              onClick={() => handleJump('intro')}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RingedPlanetLogo size={15} />
              <span>Back to Table of Contents</span>
            </button>
          )}

          {nextItem ? (
            <button
              type="button"
              onClick={() => {
                AudioService?.playTerminalBeep?.(1100, 0.02);
                if (onNavigate) onNavigate(nextItem);
              }}
              className="group flex items-center justify-end gap-3 p-3.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer text-right max-w-sm w-full sm:w-auto shadow-md"
              title={`Next: ${nextItem.title || nextItem.name}`}
            >
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Next</div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate max-w-[220px]">
                  {nextItem.title || nextItem.name}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-cyan-500/20 text-cyan-400 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                <ArrowRight size={16} />
              </div>
            </button>
          ) : (
            <div className="opacity-0 pointer-events-none hidden sm:block w-32" />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserGuideView;
