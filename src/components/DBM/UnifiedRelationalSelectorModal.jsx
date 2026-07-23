import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

export const UnifiedRelationalSelectorModal = ({
  isOpen,
  onClose,
  sourceCollection,
  isMulti = true,
  selectedValues = [],
  onSelect,
  fieldLabel = 'Items'
}) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSelected, setCurrentSelected] = useState(selectedValues || []);
  
  // Quick Create New Item state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [savingNew, setSavingNew] = useState(false);

  useEffect(() => {
    if (!isOpen || !sourceCollection) return;
    setCurrentSelected(Array.isArray(selectedValues) ? selectedValues : (selectedValues ? [selectedValues] : []));
    setSearchTerm('');
    setIsCreatingNew(false);

    const fetchCollection = async () => {
      setLoading(true);
      try {
        const colRef = collection(db, sourceCollection);
        const snapshot = await getDocs(colRef);
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(fetched);
      } catch (err) {
        console.warn(`Failed to load ${sourceCollection}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [isOpen, sourceCollection, selectedValues]);

  if (!isOpen) return null;

  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term))
    );
  });

  const toggleItem = (val) => {
    if (isMulti) {
      if (currentSelected.includes(val)) {
        setCurrentSelected(currentSelected.filter(v => v !== val));
      } else {
        setCurrentSelected([...currentSelected, val]);
      }
    } else {
      setCurrentSelected([val]);
    }
  };

  const handleConfirm = () => {
    if (isMulti) {
      onSelect(currentSelected);
    } else {
      onSelect(currentSelected[0] || '');
    }
    onClose();
  };

  const handleSaveNewItem = async () => {
    if (!newItemName.trim()) return;
    setSavingNew(true);
    const newId = `${sourceCollection}_${Date.now()}`;
    const payload = { id: newId, name: newItemName.trim(), description: newItemDesc.trim(), createdAt: new Date().toISOString() };
    
    try {
      await setDoc(doc(db, sourceCollection, newId), payload);
      setItems(prev => [...prev, payload]);
      toggleItem(payload.id);
      setNewItemName('');
      setNewItemDesc('');
      setIsCreatingNew(false);
    } catch (err) {
      console.warn("Failed to create inline item:", err);
      setItems(prev => [...prev, payload]);
      toggleItem(payload.id);
      setIsCreatingNew(false);
    } finally {
      setSavingNew(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>📋</span> Select {fieldLabel}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Collection: {sourceCollection}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase transition-colors shadow"
            >
              {isCreatingNew ? 'Cancel New' : '+ Create New'}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold ml-2 text-lg">✕</button>
          </div>
        </div>

        {/* Search Bar / Create Form */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-3">
          {isCreatingNew ? (
            <div className="bg-slate-900 border border-amber-500/40 p-3 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase">Create New Record in {sourceCollection}</h4>
              <input
                type="text"
                placeholder="Item Name *"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
              />
              <textarea
                placeholder="Item Description"
                value={newItemDesc}
                onChange={e => setNewItemDesc(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleSaveNewItem}
                  disabled={savingNew || !newItemName.trim()}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded uppercase"
                >
                  {savingNew ? 'Saving...' : 'Save & Select'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder={`Search ${sourceCollection}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-xs outline-none focus:border-cyan-500"
              />
              <span className="text-xs text-slate-400 font-mono">
                {currentSelected.length} Selected
              </span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-950/40">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs italic">Loading items from cloud...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs italic">
              No matching records found in <span className="font-mono text-cyan-400">{sourceCollection}</span>.
            </div>
          ) : (
            filteredItems.map(item => {
              const val = item.id || item.name;
              const isChecked = currentSelected.includes(val) || (item.name && currentSelected.includes(item.name));

              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(val)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-cyan-950/70 border-cyan-500/80 text-white shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <input
                    type={isMulti ? 'checkbox' : 'radio'}
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 accent-cyan-500 w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                      <span>{item.name || item.id}</span>
                      {item.type && <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono">{item.type}</span>}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => setCurrentSelected([])}
            className="text-xs text-slate-400 hover:text-slate-200 underline uppercase"
          >
            Clear Selection
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs uppercase shadow-md transition-colors"
            >
              Confirm Selection ({currentSelected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
