import React from 'react';

const FolioInput = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  labelColor = 'text-cyan-400',
  labelSize = 'text-xs',
  inputClassName = 'bg-slate-900/80 border border-cyan-900/80 px-3 py-2 text-sm',
  containerClassName = 'flex flex-col',
  rows = 3
}) => {
  const handleChange = (e) => {
    let val = e.target.value;
    if (type === 'number') {
      val = parseInt(val, 10) || 0;
    }
    onChange(id, val);
  };

  const baseStyles = 'focus:border-cyan-400 rounded text-slate-100 outline-none transition-colors w-full';

  return (
    <div className={containerClassName}>
      <label htmlFor={id} className={`${labelSize} font-bold uppercase tracking-wider ${labelColor} mb-1 block`}>
        {label}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={handleChange}
          className={`${baseStyles} resize-none ${inputClassName}`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={handleChange}
          className={`${baseStyles} ${inputClassName}`}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export default React.memo(FolioInput);
