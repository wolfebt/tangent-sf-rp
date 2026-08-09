import React, { useRef } from 'react';
import { VirtualizedList } from './VirtualizedList';

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
  currentItems = [],
  isAdmin = true
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
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Database Table</span>
            {!isAdmin && (
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded tracking-wider uppercase">
                👁️ Player View
              </span>
            )}
          </div>
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
          {isAdmin && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Import JSON
            </button>
          )}
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Export JSON
          </button>

          {isAdmin ? (
            <button
              onClick={handleCreateNew}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
            >
              + ADD NEW ENTRY
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-1.5 bg-slate-800 text-slate-500 border border-slate-700/50 rounded text-xs font-bold uppercase tracking-wider cursor-not-allowed opacity-60"
              title="Administrator or GM privileges required to add entries"
            >
              🔒 READ-ONLY
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Type/Category Filter Tabs */}
      {availableTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 pb-2 border-b border-slate-800/80 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Filter Type:</span>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 text-xs font-bold uppercase rounded tracking-wider transition-all ${
              filterType === 'ALL'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({currentItems.length})
          </button>
          {availableTypes.map(t => {
            const count = currentItems.filter(i => i.type === t || i.category === t).length;
            const isActiveType = filterType === t;
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 text-xs font-bold uppercase rounded tracking-wider transition-all ${
                  isActiveType
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Data Table */}
      <div className="flex-1 overflow-hidden rounded border border-slate-800 bg-slate-950 flex flex-col">
        <table className="w-full text-left text-xs text-slate-300 table-fixed">
          <thead className="bg-slate-900 border-b border-slate-800 text-cyan-400 uppercase font-bold sticky top-0 z-10">
            <tr>
              <th
                onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }}
                className="p-3 cursor-pointer hover:text-white w-1/4"
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
              {!currentConfig.hideActions && <th className="p-3 text-right w-24">Actions</th>}
            </tr>
          </thead>
        </table>

        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic">
              No matching records found in {currentConfig.label || currentKey}.
            </div>
          ) : filteredItems.length > 50 ? (
            <VirtualizedList
              items={filteredItems}
              itemHeight={44}
              resetScrollDeps={[searchTerm, sortField, sortAsc, currentKey]}
              getKey={(item, index) => item.id || item.name || index}
              containerClassName="h-full overflow-y-auto bg-slate-950"
              renderItem={(item) => {
                const creatorTag = Array.isArray(item.tags) 
                  ? item.tags.find(t => typeof t === 'string' && t.startsWith('@'))
                  : (typeof item.tags === 'string' && item.tags.split(',').map(t=>t.trim()).find(t => t.startsWith('@')));
                return (
                  <div
                    key={item.id || item.name}
                    onClick={() => handleOpenItem(item, true)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-800/60 flex items-center px-3 text-xs text-slate-300 h-[44px] box-border"
                  >
                    <div className="w-1/4 font-bold text-white truncate pr-2 flex items-center gap-1.5">
                      <span className="truncate">{item.name}</span>
                      {creatorTag && (
                        <span className="px-1.5 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-mono shrink-0">
                          {creatorTag}
                        </span>
                      )}
                    </div>
                    {(currentConfig.directory_columns || ['description']).map(col => (
                      col !== 'name' && (
                        <div key={col} className="flex-1 text-slate-400 truncate pr-2">
                          {Array.isArray(item[col]) ? item[col].join(', ') : (item[col] || '-')}
                        </div>
                      )
                    ))}
                    {!currentConfig.hideActions && (
                      <div className="w-24 text-right shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenItem(item, true); }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-bold uppercase cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    )}
                  </div>
                );
              }}
            />
          ) : (
            <table className="w-full text-left text-xs text-slate-300 table-fixed">
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map(item => {
                  const creatorTag = Array.isArray(item.tags) 
                    ? item.tags.find(t => typeof t === 'string' && t.startsWith('@'))
                    : (typeof item.tags === 'string' && item.tags.split(',').map(t=>t.trim()).find(t => t.startsWith('@')));
                  return (
                    <tr
                      key={item.id || item.name}
                      onClick={() => handleOpenItem(item, true)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors h-[44px]"
                    >
                      <td className="p-3 font-bold text-white w-1/4 truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{item.name}</span>
                          {creatorTag && (
                            <span className="px-1.5 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-mono shrink-0">
                              {creatorTag}
                            </span>
                          )}
                        </div>
                      </td>
                    {(currentConfig.directory_columns || ['description']).map(col => (
                      col !== 'name' && (
                        <td key={col} className="p-3 text-slate-400 truncate">
                          {Array.isArray(item[col]) ? item[col].join(', ') : (item[col] || '-')}
                        </td>
                      )
                    ))}
                    {!currentConfig.hideActions && (
                      <td className="p-3 text-right w-24">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenItem(item, true); }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-bold uppercase cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
