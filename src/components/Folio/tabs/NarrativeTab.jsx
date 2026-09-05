import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { useFolio } from '../../../context/FolioContext';

const AutoExpandingTextarea = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(38, el.scrollHeight)}px`;
    }
  }, []);

  useLayoutEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [adjustHeight]);

  const isEmpty = !value || !String(value).trim();
  const emptyShadowStyle = isEmpty
    ? 'shadow-[inset_0_2px_6px_rgba(0,0,0,0.6),0_0_10px_rgba(6,182,212,0.18)] border-cyan-700/60 focus:shadow-[0_0_14px_rgba(6,182,212,0.35)]'
    : 'border-slate-700/60 shadow-inner';

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value || ''}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      className={`${className} ${emptyShadowStyle}`}
      style={{ fieldSizing: 'content' }}
    />
  );
};

const NarrativeTab = () => {
  const { characterData, updateField, isLocked, isPlayerOverride } = useFolio();
  const isSheetLocked = Boolean(isLocked && !isPlayerOverride);
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  const handleTextChange = (field, value) => {
    updateField(field, value);
  };

  const sections = [
    {
      title: 'Profile & Identity',
      fields: [
        { id: 'role', label: 'Role in Story', placeholder: 'Quest Giver, Rival, Fixer...' },
        { id: 'char-concept', label: 'Character Archetype / Concept', placeholder: 'Archetype...' },
        { id: 'summary', label: 'One-Sentence Summary', placeholder: 'Summary...' },
        { id: 'char-motive', label: 'Core Motivation', placeholder: 'What drives this character...' },
        { id: 'primaryConflict', label: 'Primary Conflict/Goal', placeholder: 'Conflict...' },
        { id: 'nicknames', label: 'Nicknames / Aliases', placeholder: 'Aliases...' },
        { id: 'socialClass', label: 'Social Class & Status', placeholder: 'Social class...' },
        { id: 'currentResidence', label: 'Current Residence', placeholder: 'Residence...' },
      ]
    },
    {
      title: 'Physicality & Persona',
      fields: [
        { id: 'appearance', label: 'Physical Description', placeholder: 'Physical appearance, cybernetics...' },
        { id: 'voice', label: 'Voice & Speech', placeholder: 'Speech pattern...' },
        { id: 'clothing', label: 'Typical Clothing Style', placeholder: 'Clothing...' },
        { id: 'mannerisms', label: 'Mannerisms & Body Language', placeholder: 'Mannerisms...' },
        { id: 'positiveTraits', label: 'Positive Traits', placeholder: 'Positive...' },
        { id: 'negativeTraits', label: 'Negative Traits / Flaws', placeholder: 'Negative...' },
        { id: 'likesDislikes', label: 'Likes & Dislikes', placeholder: 'Likes and dislikes...' },
        { id: 'hobbies', label: 'Hobbies & Skills', placeholder: 'Hobbies...' },
        { id: 'personalityType', label: 'Personality Type', placeholder: 'Type...' },
      ]
    },
    {
      title: 'History & Backstory',
      fields: [
        { id: 'backstory', label: 'Detailed Backstory', placeholder: 'History...' },
        { id: 'definingTrauma', label: 'Defining Trauma / Wound', placeholder: 'Trauma...' },
        { id: 'greatestAccomplishment', label: 'Greatest Accomplishment(s)', placeholder: 'Accomplishment...' },
        { id: 'childhoodEvents', label: 'Childhood & Adolescence Events', placeholder: 'Childhood...' },
        { id: 'keyRelationships', label: 'Key Relationships & Dynamics', placeholder: 'Relationships...' },
        { id: 'romanticHistory', label: 'Romantic History & Philosophy', placeholder: 'Romance...' },
      ]
    },
    {
      title: 'Psychology & Metanarrative',
      fields: [
        { id: 'worldview', label: 'Worldview & Ethics', placeholder: 'Worldview...' },
        { id: 'theLie', label: 'The Lie They Believe', placeholder: 'Lie...' },
        { id: 'theTruth', label: 'The Truth They Must Learn', placeholder: 'Truth...' },
        { id: 'deepestFear', label: 'Deepest Fear & Secret', placeholder: 'Fear/Secret...' },
        { id: 'goals', label: 'External Goal vs Internal Need', placeholder: 'Want vs Need...' },
        { id: 'stakes', label: 'Stakes & Character Arc', placeholder: 'Stakes...' },
        { id: 'plotHooks', label: 'Plot Connection & Motives', placeholder: 'How they launch or start new adventures...' },
        { id: 'tags', label: 'Tags', placeholder: 'Tags...' },
      ]
    }
  ];

  const currentSection = sections[activeTabIdx] || sections[0];

  return (
    <div className="flex flex-col max-w-4xl mx-auto h-full overflow-hidden">
      <div className="flex flex-wrap border-b border-cyan-900/50 mb-4 pb-1 gap-1">
        {sections.map((section, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveTabIdx(idx)}
            className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors flex-1 sm:flex-none text-center ${
              activeTabIdx === idx 
                ? 'border-b-2 border-cyan-500 text-cyan-400 bg-cyan-950/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto pr-2 pb-20 flex-1">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-cyan-900/40">
          <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider mb-4 border-b border-cyan-900/50 pb-2">
            {currentSection.title}
          </h3>
          
          <div className="flex flex-col gap-3">
            {currentSection.fields.map((field) => (
              <div key={field.id} className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">
                  {field.label}
                </label>
                {isSheetLocked ? (
                  <div className="w-full min-h-[32px] px-2 py-1 text-sm text-slate-200 whitespace-pre-wrap font-sans">
                    {characterData[field.id] ? (
                      characterData[field.id]
                    ) : (
                      <span className="text-slate-600 italic text-xs font-mono">None</span>
                    )}
                  </div>
                ) : (
                  <AutoExpandingTextarea
                    value={characterData[field.id] || ''}
                    onChange={(val) => handleTextChange(field.id, val)}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-950/80 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 outline-none resize-none overflow-hidden transition-colors min-h-[38px]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NarrativeTab;
