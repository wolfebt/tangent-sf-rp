import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

// Fallback offline database entries
const FALLBACK_DATA = {
  species: [
    { name: 'Human', description: 'Versatile and adaptable inhabitants of the cosmos. +2 Free Skill Choices.' },
    { name: 'Android', description: 'Synthetic sentient beings. +2 Logic, Integrated Cybernetics.' },
    { name: 'Vraxian', description: 'Reptilian warrior species. +2 Might, Natural Scaled Armor.' },
    { name: 'Aetherial', description: 'Energy-attuned nomadic beings. +2 Focus, Meta-Resonance.' },
    { name: 'Cyber-Orc', description: 'Augmented shock troopers. +2 Fortitude, Subdermal Plating.' }
  ],
  occupations: [
    { name: 'Mercenary', description: 'Combat veteran for hire. +1 Heavy Weapons, +1 Tactics.' },
    { name: 'Tech Specialist', description: 'Master of machinery and software. +2 Technology, +1 Engineering.' },
    { name: 'Bounty Hunter', description: 'Relentless tracker. +1 Precision Rifle, +1 Tracking.' },
    { name: 'Meta Scholar', description: 'Practitioner of meta-energetics. +2 Focus, +1 Attune.' },
    { name: 'Smuggler', description: 'Cunning pilot and trader. +1 Pilot, +1 Deception.' }
  ],
  origins: [
    { name: 'Core Worlds', description: 'High-tech urban metropolis background.' },
    { name: 'Outer Rim', description: 'Rugged frontier colony background.' },
    { name: 'Deep Space Station', description: 'Zero-g void station life.' },
    { name: 'Ancient Shrine World', description: 'Mystical sanctuary background.' }
  ],
  factions: [
    { name: 'The Syndicate', description: 'Shadowy underworld criminal alliance.' },
    { name: 'Alliance Guild', description: 'Official galactic trade and exploration union.' },
    { name: 'Free Traders', description: 'Independent merchant fleet.' },
    { name: 'Meta Enclave', description: 'Order of Awakened scholars and guardians.' }
  ],
  features: [],
  disadvantages: [],
  augmentations: [],
  discipline: [],
  invocations: [],
  equipment: []
};

const CustomSelectorModal = ({ isOpen, onClose, modalConfig, onSelectItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dbItems, setDbItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const { title, browsePath, filterCategory, filterCategoryExclude } = modalConfig || {};

  useEffect(() => {
    if (!isOpen || !browsePath) return;

    let isMounted = true;
    setLoading(true);

    const fetchCollection = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, browsePath));
        if (!querySnapshot.empty) {
          const items = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          if (isMounted) setDbItems(items);
        } else {
          // Fallback if empty in Firestore
          const fallback = FALLBACK_DATA[browsePath] || [];
          if (isMounted) setDbItems(fallback);
        }
      } catch (err) {
        console.warn(`Firestore browse collection '${browsePath}' unavailable, using local fallback dataset:`, err);
        const fallback = FALLBACK_DATA[browsePath] || [];
        if (isMounted) setDbItems(fallback);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCollection();

    return () => {
      isMounted = false;
    };
  }, [isOpen, browsePath]);

  if (!isOpen || !modalConfig) return null;

  // Filter items
  const filteredItems = dbItems.filter((item) => {
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

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    onSelectItem(modalConfig.key, manualInput.trim());
    setManualInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#121824] border border-cyan-500/60 rounded-xl max-w-xl w-full p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] text-slate-100 space-y-4 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-3">
          <h3 className="text-base font-bold uppercase tracking-wider text-cyan-400">
            Database Browser: {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${title.toLowerCase()} database...`}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-xs text-slate-100 outline-none"
          />
        </div>

        {/* Database Items List */}
        <div className="bg-slate-950/80 border border-slate-800 rounded max-h-64 overflow-y-auto divide-y divide-slate-800/60 p-1">
          {loading ? (
            <div className="p-4 text-center text-xs text-cyan-400 animate-pulse">Loading database entries...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 italic">No matching database entries found.</div>
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

        {/* Manual Input Fallback */}
        <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={`Or enter custom ${title.toLowerCase()} name...`}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-1.5 text-xs text-slate-100 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded text-xs font-bold uppercase tracking-wider"
          >
            Add Custom
          </button>
        </form>

      </div>
    </div>
  );
};

export default React.memo(CustomSelectorModal);
