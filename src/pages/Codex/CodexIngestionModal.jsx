import React from 'react';
import { X, Bot, Database } from 'lucide-react';
import { CodexIngestionEngine } from './CodexIngestionEngine';
import { getDatasetByKey } from './codexPromptRegistry';
import { AudioService } from '../../services/audioService';

export const CodexIngestionModal = ({
  isOpen,
  onClose,
  initialDatasetKey = 'species',
  focusedMode = true,
  onApplyEntry = null,
  title = null
}) => {
  if (!isOpen) return null;

  const dataset = getDatasetByKey(initialDatasetKey);
  const DatasetIcon = dataset?.icon || Database;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden select-none font-sans animate-fade-in">
      <div className="w-full max-w-7xl h-[92vh] max-h-[950px] bg-[#070a12] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Top Chrome */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: `${dataset?.color || '#06b6d4'}25`, border: `1px solid ${dataset?.color || '#06b6d4'}80`, color: dataset?.color || '#06b6d4' }}
            >
              <DatasetIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                  <Bot size={12} /> BASTION INGESTION STUDIO
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase" style={{ background: `${dataset?.color || '#06b6d4'}20`, color: dataset?.color || '#06b6d4' }}>
                  {dataset?.code || 'OMNICORTEX'}
                </span>
                {onApplyEntry && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-500/40">
                    ✨ SINGLE ENTRY TARGET
                  </span>
                )}
              </div>
              <h2 className="font-bold text-sm sm:text-base font-mono text-white truncate mt-0.5">
                {title || `Ingest & Synthesize ${dataset?.label || 'Omnicortex Dataset'}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                if (onClose) onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Ingestion Studio"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Ingestion Engine Body */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <CodexIngestionEngine
            initialDatasetKey={initialDatasetKey}
            isModal={true}
            focusedMode={focusedMode}
            onApplyEntry={onApplyEntry}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default CodexIngestionModal;
