import React, { useState } from 'react';
import { Printer, BookOpen, LayoutGrid, X, Download, FileText, Check } from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

export const AdventurePrintModal = ({
  isOpen,
  onClose,
  storyTitle = 'Untitled Adventure',
  volumeTitle = 'Volume 1',
  beats = [],
  manuscriptContent = ''
}) => {
  if (!isOpen) return null;

  const [printLayout, setPrintLayout] = useState('novel'); // 'novel' | 'osr_module'

  const handleExecutePrint = () => {
    AudioService.playTerminalBeep(1100, 0.15);
    window.print();
  };

  const fullProse = beats.length > 0 
    ? beats.map(b => b.content).join('\n\n')
    : (manuscriptContent || 'No story content drafted yet.');

  return (
    <div className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-8 pb-10 overflow-y-auto font-sans">
      <div className="bg-[#0b0f19] border border-cyan-500/60 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col text-slate-200">
        {/* Modal Controls Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-slate-900 border-b border-cyan-500/40 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <Printer size={18} className="text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm text-cyan-300 font-mono uppercase tracking-wider">
                ADE Print & Publishing Studio
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Clean formatting for fiction manuscripts and tactical adventure modules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Format Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setPrintLayout('novel')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  printLayout === 'novel'
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen size={12} />
                <span>Novel / Fiction Book</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintLayout('osr_module')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  printLayout === 'osr_module'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid size={12} />
                <span>OSR 2-Col Adventure</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleExecutePrint}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Print Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-slate-950/80 scrollbar-thin">
          {/* Printable Page Sheet */}
          <div 
            id="ade-printable-document" 
            className={`mx-auto bg-white text-black p-8 md:p-14 shadow-2xl rounded-sm max-w-3xl min-h-[700px] ${
              printLayout === 'novel' ? 'font-serif' : 'font-sans'
            }`}
          >
            {/* NOVEL LAYOUT */}
            {printLayout === 'novel' && (
              <div className="space-y-6 text-slate-900 leading-relaxed text-sm md:text-base">
                <div className="text-center border-b pb-8 mb-8 space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-slate-500 font-sans">
                    {volumeTitle}
                  </h4>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-serif text-slate-950">
                    {storyTitle}
                  </h1>
                  <p className="text-xs italic text-slate-600 font-serif">
                    A Tangent Science Fantasy Tale • Published via ADE Engine
                  </p>
                </div>

                <div className="space-y-4 text-justify indent-8 leading-relaxed">
                  {fullProse.split('\n\n').map((para, i) => (
                    <p key={i} className="first-letter:text-3xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:text-slate-900">
                      {para}
                    </p>
                  ))}
                </div>

                <div className="text-center text-xs text-slate-400 pt-12 border-t font-sans">
                  — Page 1 —
                </div>
              </div>
            )}

            {/* OSR ADVENTURE MODULE LAYOUT */}
            {printLayout === 'osr_module' && (
              <div className="space-y-6 text-slate-900">
                {/* Adventure Header Banner */}
                <div className="border-b-2 border-black pb-4 mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest font-bold text-slate-600">
                      TANGENT SFF ROLEPLAY • ADVENTURE MODULE
                    </h4>
                    <h1 className="text-2xl font-black uppercase tracking-tight font-sans text-black">
                      {storyTitle}
                    </h1>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <span className="font-bold">TECH LEVEL 3</span>
                    <br />
                    <span className="text-slate-600">PARTY LEVEL 1–4</span>
                  </div>
                </div>

                {/* 2-Column Grid Spread */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-normal">
                  <div className="space-y-4">
                    {/* Read Aloud Box */}
                    <div className="border-2 border-slate-700 bg-slate-100 p-3 rounded text-[11px] italic font-serif">
                      <strong className="block font-sans not-italic font-bold uppercase tracking-wider text-[10px] text-slate-800 mb-1">
                        📢 Read-Aloud Description
                      </strong>
                      "{beats[0]?.content || fullProse.substring(0, 200)}..."
                    </div>

                    <div>
                      <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-0.5 mb-1.5">
                        Tactical Overview & Traps
                      </h3>
                      <p className="text-slate-800 text-[11px] leading-relaxed mb-2">
                        The sector operates on auxiliary power. Bulkhead doors remain locked until security terminals are breached or forced.
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                        <li><strong>Bulkhead Door:</strong> Hardened durasteel. Armor DR 8, 60 Structure. Tech Slicing DC 14.</li>
                        <li><strong>Proximity Plasma Mine:</strong> Concealed floor mine. Reflex DC 14 vs 15 lethal blast damage (Burning).</li>
                        <li><strong>Environmental Hazard:</strong> Low oxygen vacuum breach. Fortitude DC 14 each turn.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-0.5 mb-1.5">
                        Adversary Stat Blocks
                      </h3>
                      <div className="bg-slate-50 border border-slate-300 p-2.5 rounded space-y-1 font-mono text-[10px]">
                        <div className="font-bold text-black flex justify-between">
                          <span>STATION AUTOMATED SENTRY</span>
                          <span>LEVEL 2 UNIT</span>
                        </div>
                        <div className="text-slate-600">
                          HP: 25 • Defense: 12 • Initiative: 12 • AP: 3
                        </div>
                        <div className="text-slate-700">
                          <strong>Weapons:</strong> Dual Pulse Carbines (2d10+2 lethal, range 15m)
                        </div>
                        <div className="text-slate-700">
                          <strong>Script:</strong> Stationary 90° Sentry Cone. Sounds alarm on visual contact.
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-0.5 mb-1.5">
                        Narrative Continuation & Rewards
                      </h3>
                      <p className="text-[11px] text-slate-800 leading-relaxed">
                        Recovering the auxiliary data-core reveals encrypted coordinates leading into the orbital superstructure.
                      </p>
                      <div className="font-mono text-[10px] text-slate-600 bg-slate-100 p-2 rounded">
                        <strong>Rewards:</strong> +2 Action Points, +1 Karma, Prototype Energy Shield Relic.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Print CSS Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #ade-printable-document, #ade-printable-document * {
              visibility: visible;
            }
            #ade-printable-document {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              color: black !important;
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />
      </div>
    </div>
  );
};

export default AdventurePrintModal;
