import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

// Clean fallback schema defaults
const FALLBACK_DATA = {
  species: [],
  occupations: [],
  origins: [],
  factions: [],
  features: [],
  disadvantages: [],
  augmentations: [],
  equipment: [],
  prerequisites: [],
  modifiers: []
};

const CustomSelectorModal = ({ isOpen, onClose, modalConfig, onSelectItem, onOpenAssetModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dbItems, setDbItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const { title = 'Entry', browsePath, filterCategory, filterCategoryExclude } = modalConfig || {};

  // Real-time Firestore fetch while modal is open
  useEffect(() => {
    if (!isOpen || !browsePath) {
      setDbItems([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    let unsub = () => {};
    try {
      const colRef = collection(db, browsePath);
      unsub = onSnapshot(colRef, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const items = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          if (isMounted) setDbItems(items);
        } else {
          if (isMounted) setDbItems([]);
        }
        if (isMounted) setLoading(false);
      }, (err) => {
        console.warn(`Firestore listener error for ${browsePath}:`, err);
        if (isMounted) setLoading(false);
      });
    } catch (err) {
      console.warn(`Failed to subscribe to ${browsePath}`, err);
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
      unsub();
    };
  }, [isOpen, browsePath]);

  const handleExplicitCloudSearch = async () => {
    if (!browsePath) return;
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, browsePath));
      if (!querySnapshot.empty) {
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setDbItems(items);
      }
    } catch (err) {
      console.warn(`Cloud search warning for ${browsePath}:`, err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !modalConfig) return null;

  const allItems = dbItems.length > 0 ? dbItems : (FALLBACK_DATA[browsePath] || []);

  // Filter items
  const filteredItems = allItems.filter((item) => {
    const name = item.name || item.title || item.id || '';
    const desc = item.description || '';
    const cat = item.category || '';

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          desc.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterCategory && cat !== filterCategory) return false;
    if (filterCategoryExclude && cat === filterCategoryExclude) return false;

    return true;
  });

  const handleSelect = (item) => {
    onSelectItem(modalConfig.key, item);
    onClose();
  };

  const handleBuildDbAsset = () => {
    onClose();
    if (onOpenAssetModal) {
      onOpenAssetModal(modalConfig.key, title, 'create', null, { category: browsePath });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#121824] border border-cyan-500/60 rounded-xl max-w-xl w-full p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] text-slate-100 space-y-4 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-3">
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-cyan-400">
              Database Browser: {title}
            </h3>
            <p className="text-[11px] text-slate-400">
              Search global database entries or build a new entry directly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAssetModal && (
              <button
                type="button"
                onClick={handleBuildDbAsset}
                className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                title={`Build and save a new ${title} entry to the global database`}
              >
                <span>⚙️</span> Build DB Entry
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xl font-bold leading-none cursor-pointer ml-1"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Search Bar with Explicit Search DB Button */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleExplicitCloudSearch();
              }
            }}
            placeholder={`Search ${title.toLowerCase()} database...`}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-xs text-slate-100 outline-none"
          />
          <button
            type="button"
            onClick={handleExplicitCloudSearch}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded text-xs font-bold uppercase transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            title="Search Cloud Database"
          >
            <span>🔍</span> Search DB
          </button>
          {loading && <span className="text-[10px] text-cyan-400 font-mono animate-pulse">Syncing...</span>}
        </div>

        {/* Database Items List */}
        <div className="bg-slate-950/80 border border-slate-800 rounded max-h-64 overflow-y-auto divide-y divide-slate-800/60 p-1">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <div className="text-xs text-slate-400 italic">No matching database entries found for "{searchTerm || title}".</div>
              {onOpenAssetModal && (
                <button
                  type="button"
                  onClick={handleBuildDbAsset}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                >
                  <span>⚙️</span> Build New {title} DB Entry
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                className="p-3 hover:bg-cyan-950/40 cursor-pointer rounded transition-colors group flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-xs text-cyan-300 group-hover:text-cyan-200">
                    {item.name || item.title}
                  </div>
                  {item.description && (
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {item.description}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="px-3 py-1 bg-cyan-950 group-hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-[10px] uppercase font-bold tracking-wider ml-2 flex-shrink-0"
                >
                  Select
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-[11px] text-slate-500">
            Found {filteredItems.length} {filteredItems.length === 1 ? 'entry' : 'entries'} in <span className="font-mono text-cyan-400">{browsePath}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default React.memo(CustomSelectorModal);
