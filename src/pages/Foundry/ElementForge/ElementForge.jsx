import React, { useState } from 'react';
import { useCampaign } from '../../../context/CampaignContext';
import { ELEMENT_TYPES, getTypePillStyle } from './elementSchemas';
import EditElementModal from './EditElementModal';

export const ElementForge = () => {
  const { elementsCatalog, updateSavedElement, deleteSavedElement, saveElementToCloud } = useCampaign();
  
  const [activeType, setActiveType] = useState(ELEMENT_TYPES[0]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter elements by active type and search term
  const filteredElements = (elementsCatalog || []).filter(el => {
    if (el.type !== activeType) return false;
    if (searchTerm && !el.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleCreateNew = () => {
    setSelectedElement({
      id: `elem_${Date.now()}`,
      title: '',
      type: activeType,
      content: '',
      fields: {}
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = (el) => {
    setSelectedElement(el);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedElement) => {
    // Determine if it's a new element or existing based on whether it's in the catalog
    const isExisting = elementsCatalog.some(e => e.id === updatedElement.id);
    
    if (isExisting) {
      await updateSavedElement(updatedElement.id, updatedElement);
    } else {
      // It's a new element, updateSavedElement handles upserts nicely as per CampaignContext logic
      await updateSavedElement(updatedElement.id, updatedElement);
    }
    
    // Attempt cloud save if applicable
    await saveElementToCloud(updatedElement);
    setIsEditModalOpen(false);
    setSelectedElement(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0a0a0e] text-slate-100 font-sans relative">
      {/* Forge Glow Background */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Left Sidebar for Element Types */}
      <aside className="w-64 h-full bg-[#0d1117]/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col shrink-0 p-4 gap-2 overflow-y-auto relative z-10">
        <div className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest px-2 mb-2 border-b border-slate-800 pb-2">
          Element Types
        </div>
        
        {ELEMENT_TYPES.map(type => {
          const isActive = activeType === type;
          const count = elementsCatalog?.filter(e => e.type === type).length || 0;
          return (
            <button
              key={type}
              onClick={() => { setActiveType(type); setSearchTerm(''); }}
              className={`w-full text-left px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-between group border ${
                isActive
                  ? `${getTypePillStyle(type)} shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30`
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/80 hover:border-slate-700/60'
              }`}
            >
              <span className="truncate">{type}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                isActive
                  ? 'bg-black/40 text-amber-200 border border-amber-500/30'
                  : 'bg-slate-800/80 text-slate-500 group-hover:text-cyan-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden p-8 relative z-10">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-8 shrink-0 bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-lg">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 tracking-wider uppercase flex items-center gap-3">
              {activeType} Elements
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your local and cloud-synced story elements.
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder={`Search ${activeType}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-amber-500/60 text-slate-200 placeholder-slate-500 w-72 transition-colors shadow-inner"
            />
            <button
              onClick={handleCreateNew}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] transform hover:-translate-y-0.5 whitespace-nowrap border border-amber-500/50"
            >
              + Create {activeType}
            </button>
          </div>
        </div>

        {/* List View */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          {filteredElements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <div className="text-4xl mb-4 opacity-50">📂</div>
              <p>No {activeType} elements found.</p>
              <button 
                onClick={handleCreateNew}
                className="mt-4 text-cyan-400 hover:text-cyan-300 underline text-sm"
              >
                Create your first one
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max pb-8">
              {filteredElements.map(el => (
                <div 
                  key={el.id} 
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/50 hover:bg-slate-800/60 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] transition-all duration-300 flex flex-col group cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleEdit(el)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-extrabold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1 tracking-wide">
                      {el.title || 'Untitled'}
                    </h3>
                  </div>
                  
                  {el.fields?.summary && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3 flex-1">
                      {el.fields.summary}
                    </p>
                  )}
                  
                  {el.content && !el.fields?.summary && (
                    <div 
                      className="text-xs text-slate-400 line-clamp-2 mb-3 flex-1 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: el.content.substring(0, 100) }} 
                    />
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 mt-auto shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                      {el.authorUid === 'local' ? 'Local Draft' : 'Cloud Synced'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditElementModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          element={selectedElement}
          onSave={handleSave}
          onDelete={deleteSavedElement}
        />
      )}
    </div>
  );
};

export default ElementForge;
