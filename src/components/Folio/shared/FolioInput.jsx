import React from 'react';

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
  rightLabel = null
}) => {
  const handleChange = (e) => {
    let val = e.target.value;
    if (type === 'number') {
      val = parseInt(val, 10) || 0;
    }
    onChange(id, val);
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(id, e.target.value);
    }
  };

  const baseStyles = 'focus:border-cyan-400 rounded text-slate-100 outline-none transition-colors w-full';

  return (
    <div className={containerClassName}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={id} className={`${labelSize} font-bold uppercase tracking-wider ${labelColor} block`}>
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
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${baseStyles} resize-none ${inputClassName}`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
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
