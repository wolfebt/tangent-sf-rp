import React from 'react';
import { useFolio } from '../../../context/FolioContext';

const FolioInput = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder = '',
  labelColor = 'text-cyan-400',
  labelSize = 'text-xs',
  inputClassName = 'bg-slate-900/80 border border-cyan-900/80 px-3 py-2 text-sm',
  containerClassName = 'flex flex-col',
  rows = 3,
  rightLabel = null,
  disabled = false,
  readOnly = false,
  title = ''
}) => {
  const folio = useFolio();
  const isSheetLocked = Boolean(folio?.isLocked && !folio?.isPlayerOverride);
  const isInputDisabled = disabled || readOnly || isSheetLocked;

  const handleChange = (e) => {
    if (isInputDisabled) return;
    let val = e.target.value;
    if (type === 'number') {
      val = parseInt(val, 10) || 0;
    }
    onChange(id, val);
  };

  const handleBlur = (e) => {
    if (onBlur && !isInputDisabled) {
      onBlur(id, e.target.value);
    }
  };

  const isEmpty = value === '' || value === null || value === undefined;

  // When locked and not overridden, show clean read-only text with no box borders or background
  if (isInputDisabled) {
    return (
      <div className={containerClassName} title={title}>
        {label && (
          <div className="flex justify-between items-center mb-0.5">
            <label htmlFor={id} className={`${labelSize} font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1`}>
              {label}
            </label>
            {rightLabel && (
              <span className="text-[10px] font-mono text-cyan-400/80">
                {rightLabel}
              </span>
            )}
          </div>
        )}
        <div 
          id={id}
          className={`py-1 text-sm font-sans text-slate-100 select-text whitespace-pre-wrap min-h-[1.5rem] flex items-center ${type === 'textarea' ? 'items-start pt-1' : ''}`}
        >
          {!isEmpty ? (
            <span>{value}</span>
          ) : (
            <span className="text-slate-600 italic text-xs font-mono">None</span>
          )}
        </div>
      </div>
    );
  }

  // Dev mode: proper field boxes for user entry with soft shadow on empty fields
  const emptyShadowStyle = isEmpty
    ? 'shadow-[inset_0_2px_6px_rgba(0,0,0,0.6),0_0_10px_rgba(6,182,212,0.18)] border-cyan-700/60 focus:shadow-[0_0_14px_rgba(6,182,212,0.35)]'
    : 'border-cyan-900/80 shadow-sm';

  const baseStyles = `focus:border-cyan-400 rounded text-slate-100 outline-none transition-all duration-200 w-full ${emptyShadowStyle}`;

  return (
    <div className={containerClassName} title={title}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={id} className={`${labelSize} font-bold uppercase tracking-wider ${labelColor} block flex items-center gap-1`}>
            {label}
          </label>
          {rightLabel && (
            <span className="text-[10px] font-mono text-cyan-300/80">
              {rightLabel}
            </span>
          )}
        </div>
      )}
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          rows={rows}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${baseStyles} resize-none ${inputClassName}`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${baseStyles} ${inputClassName}`}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export default React.memo(FolioInput);

