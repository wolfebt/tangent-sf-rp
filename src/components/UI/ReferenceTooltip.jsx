import React, { useState } from 'react';
import './ReferenceTooltip.css';
import { useCampaign } from '../../context/CampaignContext';

const ReferenceTooltip = ({ term }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { elementsCatalog } = useCampaign();

  // Find the element by matching the term with the title (case-insensitive)
  const element = elementsCatalog.find(
    (el) => el.title?.toLowerCase() === term.toLowerCase()
  );

  const data = element ? {
    type: element.type,
    description: element.fields?.summary || element.fields?.description || 'No description available.',
    tags: [element.type]
  } : {
    type: 'Unknown Entity',
    description: "The " + term + " was not found in the current project's element catalog.",
    tags: ['Unknown']
  };

  return (
    <span 
      className="reference-highlight-container"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span className="reference-highlight-text text-cyan-400 font-bold border-b border-dashed border-cyan-400/50 cursor-pointer hover:bg-cyan-900/30 transition-colors px-1 rounded-sm">{term}</span>
      
      {isOpen && (
        <div className="reference-popover glass-pane animate-fade-in absolute z-[100] mt-2 w-64 bg-slate-900 border border-slate-700 shadow-2xl rounded-lg overflow-hidden text-left" style={{ left: '50%', transform: 'translateX(-50%)' }}>
          <div className="popover-header bg-slate-800 p-3 border-b border-slate-700">
            <span className="popover-type text-[10px] font-bold text-cyan-500 uppercase tracking-widest block mb-1">{data.type}</span>
            <h4 className="popover-title text-sm font-bold text-slate-100 m-0 leading-tight">{element ? element.title : term}</h4>
          </div>
          <div className="popover-body p-3 bg-slate-900">
            <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-4">{data.description}</p>
            <div className="popover-tags flex flex-wrap gap-1.5">
              {data.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-[9px] font-bold uppercase rounded">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </span>
  );
};

export default ReferenceTooltip;
