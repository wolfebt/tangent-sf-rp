import React, { useState, useEffect, useRef } from 'react';
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
  features: [
    { id: 'feat_awakened_dim', name: 'Awakened: Dimension', cp: 3, type: 'Awakened', description: 'Metafocus discipline: Spatial manipulation, warping, and teleportation.' },
    { id: 'feat_awakened_ene', name: 'Awakened: Energy', cp: 3, type: 'Awakened', description: 'Metafocus discipline: Thermal, electrical, kinetic, and radiant energy control.' },
    { id: 'feat_awakened_ent', name: 'Awakened: Entropy', cp: 3, type: 'Awakened', description: 'Metafocus discipline: Probability manipulation, decay, and chaos resonance.' },
    { id: 'feat_awakened_ill', name: 'Awakened: Illusion', cp: 3, type: 'Awakened', description: 'Metafocus discipline: Sensory phantasms, holographic weaves, and mental trickery.' },
    { id: 'feat_awakened_mat', name: 'Awakened: Matter', cp: 3, type: 'Awakened', description: 'Metafocus discipline: Molecular alteration, density shifting, and material synthesis.' },
    { id: 'feat_awakened_men', name: 'Awakened: Mental', cp: 3, type: 'Awakened', description: 'Metafocus discipline: Telepathy, psionic force, and neural influence.' },
    { id: 'aug_ocular', name: 'Ocular Cyber-Implants', cp: 1, type: 'Augmentation', description: 'Enhanced spectrum vision and target tracking overlay (1 CP).' },
    { id: 'aug_audio', name: 'Audio Synthesizer Array', cp: 1, type: 'Augmentation', description: 'Sub-audible frequency receiver and acoustic dampener (1 CP).' },
    { id: 'aug_subdermal_jack', name: 'Subdermal Interface Jack', cp: 1, type: 'Augmentation', description: 'Direct neural link port for machinery and networks (1 CP).' },
    { id: 'aug_subdermal_weave', name: 'Subdermal Armor Weave', cp: 2, type: 'Augmentation', description: 'Under-skin ballistic weave providing permanent kinetic resistance (2 CP).' },
    { id: 'aug_prosthetic_limb', name: 'Cybernetic Limb', cp: 2, type: 'Augmentation', description: 'Reinforced artificial limb with integrated servo-motors (2 CP).' },
    { id: 'aug_bioware', name: 'Bioware Gland Synthesizer', cp: 2, type: 'Augmentation', description: 'Biological stim-injector for metabolic recovery (2 CP).' },
    { id: 'aug_accelerator', name: 'Neural Accelerator Unit', cp: 3, type: 'Augmentation', description: 'Synaptic speed booster granting heightened reaction speed (3 CP).' },
    { id: 'aug_reflex_booster', name: 'Reflex Booster Array', cp: 3, type: 'Augmentation', description: 'Full-body neuromuscular booster for twitch dodge capabilities (3 CP).' },
    { id: 'aug_dermal_plating', name: 'Dermal Plating Matrix', cp: 3, type: 'Augmentation', description: 'Heavy subdermal composite plating for maximum physical protection (3 CP).' }
  ],
  disadvantages: [
    { id: 'dis_cyber_rejection', name: 'Cybernetic Rejection', cp: 3, description: 'Body reacts poorly to cybernetic neural sync (-3 CP refund).' },
    { id: 'dis_phobia', name: 'Severe Phobia', cp: 3, description: 'Debilitating fear of specific triggers (-3 CP refund).' },
    { id: 'dis_debt', name: 'Syndicate Debt', cp: 3, description: 'Owes substantial capital to dangerous underworld lenders (-3 CP refund).' },
    { id: 'dis_infamy', name: 'Wanted / Infamous', cp: 3, description: 'Targeted by galactic law enforcement or bounty hunters (-3 CP refund).' }
  ],
  equipment: [],
  prerequisites: [],
  modifiers: []
};

const CustomSelectorModal = ({ isOpen, onClose, modalConfig, onSelectItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dbItems, setDbItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const selectorFetchedRef = useRef({});

  const { title = 'Entry', browsePath, filterCategory, filterCategoryExclude } = modalConfig || {};

  // Initialize with fallback items immediately (0ms delay)
  useEffect(() => {
    if (!isOpen || !browsePath) {
      selectorFetchedRef.current = {};
      return;
    }

    const fallback = FALLBACK_DATA[browsePath] || [];
    setDbItems(fallback);
  }, [isOpen, browsePath]);

  // Non-blocking background Firestore fetch with 1.2s timeout
  useEffect(() => {
    if (!isOpen || !browsePath) return;
    if (selectorFetchedRef.current[browsePath]) return;
    selectorFetchedRef.current[browsePath] = true;

    let isMounted = true;
    setLoading(true);

    const fetchCollection = async () => {
      try {
        const colRef = collection(db, browsePath);
        const fetchPromise = getDocs(colRef);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore timeout')), 1200)
        );

        const querySnapshot = await Promise.race([fetchPromise, timeoutPromise]);
        if (!querySnapshot.empty) {
          const items = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          if (isMounted) setDbItems(items);
        }
      } catch (err) {
        // Silently preserve local fallback data
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCollection();

    return () => {
      isMounted = false;
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

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
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
            className="text-slate-400 hover:text-white text-xl font-bold leading-none cursor-pointer"
          >
            &times;
          </button>
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
            <div className="p-6 text-center space-y-2">
              <div className="text-xs text-slate-400 italic">No matching database entries found.</div>
              <div className="text-[11px] text-cyan-400">Use the custom entry box below to add any custom {title.toLowerCase()} directly!</div>
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

        {/* Manual Custom Input Option */}
        <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={`✍️ Enter custom ${title.toLowerCase()} name...`}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-1.5 text-xs text-slate-100 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            + Add Custom
          </button>
        </form>

      </div>
    </div>
  );
};

export default React.memo(CustomSelectorModal);
