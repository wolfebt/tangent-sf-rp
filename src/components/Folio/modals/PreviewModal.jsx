import React from 'react';
import PrintFolio from '../print/PrintFolio';

const PreviewModal = ({ isOpen, onClose, characterData }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-cyan-500/60 rounded-xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[95vh] print:max-h-none print:border-none print:shadow-none print:bg-transparent print:p-0">
        
        {/* Header Controls (Hidden on Print) */}
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-3 mb-4 print:hidden">
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-cyan-400">
              Persona Folio Print Preview (4 Pages)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact alignment with Tangent Persona Folio 1, 2, 3, & 4 character sheets
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs uppercase font-bold tracking-wider shadow-lg transition-colors flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Print Folio PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl font-bold leading-none px-2 py-1"
              title="Close Preview"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Scrollable Screen Preview Area */}
        <div className="flex-1 overflow-y-auto pr-1 print:overflow-visible">
          <PrintFolio characterData={characterData} isScreenPreview={true} />
        </div>

      </div>
    </div>
  );
};

export default React.memo(PreviewModal);
