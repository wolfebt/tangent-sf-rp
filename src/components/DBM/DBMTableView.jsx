import React, { useRef } from 'react';

export const DBMTableView = ({
  currentConfig,
  currentKey,
  searchTerm,
  setSearchTerm,
  handleImportJSON,
  handleExportJSON,
  handleCreateNew,
  sortField,
  setSortField,
  sortAsc,
  setSortAsc,
  filteredItems,
  handleOpenItem,
  filterTL = 'ALL',
  setFilterTL = () => {},
  filterML = 'ALL',
  setFilterML = () => {},
  filterType = 'ALL',
  setFilterType = () => {},
  currentItems = []
}) => {
  const fileInputRef = useRef(null);

  const onImport = (e) => {
    handleImportJSON(e);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  // Dynamically extract unique types/categories present in currentItems
  const availableTypes = Array.from(new Set(
    currentItems.flatMap(i => [i.type, i.category]).filter(Boolean)
  ));

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-lg p-5 overflow-hidden">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-3 pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Database Table</span>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
            {currentConfig.label || currentKey}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded text-xs outline-none focus:border-cyan-500 w-64"
          />

          {/* Local JSON Controls */}
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            className="hidden"
            onChange={onImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Import JSON
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Export JSON
          </button>

          <button
            onClick={handleCreateNew}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
          >
            + ADD NEW ENTRY
          </button>
        </div>
      </div>


      {/* Data Table */}
      <div className="flex-1 overflow-auto rounded border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 border-b border-slate-800 text-cyan-400 uppercase font-bold sticky top-0">
            <tr>
              <th
                onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }}
                className="p-3 cursor-pointer hover:text-white"
              >
                Name {sortField === 'name' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              {(currentConfig.directory_columns || ['description']).map(col => (
                col !== 'name' && (
                  <th
                    key={col}
                    onClick={() => { setSortField(col); setSortAsc(!sortAsc); }}
                    className="p-3 cursor-pointer hover:text-white uppercase"
                  >
                    {col.replace(/_/g, ' ')} {sortField === col ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                )
              ))}
              {!currentConfig.hideActions && <th className="p-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-slate-500 italic">
                  No matching records found in {currentConfig.label || currentKey}.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr
                  key={item.id}
                  onClick={() => handleOpenItem(item, true)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-bold text-white">{item.name}</td>
                  {(currentConfig.directory_columns || ['description']).map(col => (
                    col !== 'name' && (
                      <td key={col} className="p-3 text-slate-400 max-w-xs truncate">
                        {Array.isArray(item[col]) ? item[col].join(', ') : (item[col] || '-')}
                      </td>
                    )
                  ))}
                  {!currentConfig.hideActions && (
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenItem(item, true); }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-bold uppercase"
                      >
                        View
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
