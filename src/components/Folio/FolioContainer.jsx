import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFolio } from '../../context/FolioContext';
import FolioSidebar from './FolioSidebar';
import IdentityTab from './tabs/IdentityTab';
import CoreStatsTab from './tabs/CoreStatsTab';
import SkillsTab from './tabs/SkillsTab';
import AbilitiesTab from './tabs/AbilitiesTab';
import CombatGearTab from './tabs/CombatGearTab';
import OtherTab from './tabs/OtherTab';
import EconomyModal from './modals/EconomyModal';
import AddSkillModal from './modals/AddSkillModal';
import CustomSelectorModal from './modals/CustomSelectorModal';
import ConfirmationModal from './modals/ConfirmationModal';
import PreviewModal from './modals/PreviewModal';
import RosterModal from './modals/RosterModal';
import BastionDrawer from './BastionDrawer';
import PrintFolio from './print/PrintFolio';

const FolioContainer = () => {
  const navigate = useNavigate();
  const { currentUser, userHandle, confirmLogout, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState('identity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal States
  const [isEconomyOpen, setIsEconomyOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [addSkillModalMode, setAddSkillModalMode] = useState('skill');
  const [availableSkillsForModal, setAvailableSkillsForModal] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBastionOpen, setIsBastionOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [selectorConfig, setSelectorConfig] = useState(null);

  const fileInputRef = useRef(null);

  const {
    characterData,
    updateField,
    handleAddItem,
    handleAddSkill,
    handleAddSpecialization,
    handleNewCharacter,
    handleSaveLocal,
    handleLoadLocal,
    handleSaveCloud,
    handleLoadCloud,
    computeSpentCP,
    economyBreakdown,
    derivedStats,
    personaRoster,
    saveCurrentToRoster,
    switchRosterCharacter,
    deleteRosterCharacter,
    duplicateRosterCharacter,
    cloudSaveStatus,
    lastSavedTime,
    updateRosterCharacterNote
  } = useFolio();

  const handleOpenAddSkillModal = useCallback((mode = 'skill', skillsList = []) => {
    setAddSkillModalMode(mode);
    setAvailableSkillsForModal(skillsList);
    setIsAddSkillOpen(true);
  }, []);

  // Open Selector Modal helper
  const handleOpenSelectorModal = useCallback((key, title, browsePath, filterCategory = null, filterCategoryExclude = null) => {
    setSelectorConfig({ key, title, browsePath, filterCategory, filterCategoryExclude });
    setIsSelectorOpen(true);
  }, []);

  const handleSelectItem = useCallback((key, value) => {
    if (key.startsWith('char-')) {
      const name = typeof value === 'object' ? (value.name || value.title || '') : value;
      updateField(key, name);

      // Auto-apply Omnicortex species bonus traits if present
      if (key === 'char-species' && typeof value === 'object') {
        const bonusFeatures = value.bonus_features || [];
        if (Array.isArray(bonusFeatures) && bonusFeatures.length > 0) {
          const featListStr = bonusFeatures.map(f => typeof f === 'object' ? f.name : f).join(', ');
          const autoApply = window.confirm(`Selected Species "${name}" includes bonus features (${featListStr}). Would you like to add these bonus traits to your character sheet?`);
          if (autoApply) {
            bonusFeatures.forEach(feat => {
              const featObj = typeof feat === 'object' 
                ? feat 
                : { id: `feat_${Date.now()}_${Math.random().toString(36).substring(2,6)}`, name: feat, cp: 0, category: 'Species Bonus' };
              handleAddItem('features', featObj);
            });
          }
        }
      }
    } else {
      const itemObj = typeof value === 'object' 
        ? { id: value.id || `item_${Date.now()}`, name: value.name || value.title, description: value.description || '', cp: value.cp || 0, category: value.category || '' } 
        : { id: `item_${Date.now()}`, name: value, description: '', cp: 0 };
      handleAddItem(key, itemObj);
    }
  }, [updateField, handleAddItem]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleLoadLocal(file);
  };

  const handleCloudLoadPrompt = () => {
    const docId = prompt("Enter Persona Document ID to load from Cloud:", characterData['character-doc-id'] || '');
    if (docId && docId.trim()) {
      handleLoadCloud(docId.trim());
    }
  };

  const charNameUpper = characterData['char-name'] ? characterData['char-name'].toUpperCase() : 'UNNAMED';

  return (
    <div className="flex h-screen w-screen bg-[#0d1117] text-slate-100 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay Toggle */}
      <div className={`fixed inset-0 z-40 bg-black/60 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)} />

      {/* Sidebar Navigation */}
      <div className={`fixed md:relative z-40 h-full transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <FolioSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          charName={characterData['char-name']}
          onOpenBastion={() => setIsBastionOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d1117]">
        {/* Top Header & Actions Bar */}
        <header className="bg-[#0d1117] border-b border-[#0D5C63]/50 p-3 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md gap-3 relative z-40">
          
          {/* Mobile Menu Toggle & Header Name Display */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="mobile-menu-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden px-2.5 py-1.5 bg-slate-900 border border-cyan-900/60 rounded text-cyan-400 text-sm font-bold"
            >
              &#9776;
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 id="actor-display-header" className="text-sm sm:text-base font-bold font-mono text-amber-400 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] truncate max-w-[150px] sm:max-w-xs">
                  {charNameUpper}
                </h2>

                {/* Dynamic Cloud Save Indicator Badge */}
                {cloudSaveStatus === 'saving' && (
                  <span className="px-2 py-0.5 text-[9px] bg-amber-950/60 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1 font-mono uppercase tracking-wider animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    Saving...
                  </span>
                )}
                {cloudSaveStatus === 'saved' && (
                  <span 
                    className="px-2 py-0.5 text-[9px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-1 font-mono uppercase tracking-wider" 
                    title={lastSavedTime ? `Cloud Saved at ${lastSavedTime.toLocaleTimeString()}` : 'Cloud Saved'}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Cloud Saved
                  </span>
                )}
                {cloudSaveStatus === 'offline' && (
                  <span 
                    className="px-2 py-0.5 text-[9px] bg-slate-900 text-slate-400 border border-slate-700 rounded flex items-center gap-1 font-mono uppercase tracking-wider" 
                    title="Not logged in — changes saved locally in browser"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    Local Mode
                  </span>
                )}
                {cloudSaveStatus === 'error' && (
                  <span 
                    className="px-2 py-0.5 text-[9px] bg-red-950/60 text-red-300 border border-red-500/40 rounded flex items-center gap-1 font-mono uppercase tracking-wider" 
                    title="Cloud Save Failed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Save Error
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>HP: <strong className="text-emerald-400">{derivedStats.health}</strong></span>
                <span>VIT: <strong className="text-cyan-400">{derivedStats.vitality}</strong></span>
                <span>KARMA: <strong className="text-amber-400">{derivedStats.karma}</strong></span>
              </div>
            </div>
          </div>

          {/* Center / Actions Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time CP Budget Bar */}
            {(() => {
              const startingCP = parseInt(characterData['starting-cp'] || 150, 10);
              const spentCP = computeSpentCP();
              const remainingCP = startingCP - spentCP;
              const percent = Math.min(100, Math.max(0, (spentCP / startingCP) * 100));
              const isOver = spentCP > startingCP;

              return (
                <div
                  onClick={() => setIsEconomyOpen(true)}
                  className="cursor-pointer bg-slate-950 border border-cyan-500/60 rounded px-3 py-1 flex flex-col min-w-[170px] hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                  title="Click to view detailed CP Economy & Point Pools breakdown"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase font-mono">
                    <span className="text-slate-400">CP BUDGET:</span>
                    <span className={isOver ? 'text-red-400 font-bold' : 'text-amber-400'}>
                      {spentCP} / {startingCP} CP
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-300 ${isOver ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-amber-400'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className={`text-[9px] text-right font-mono font-bold mt-0.5 ${isOver ? 'text-red-400' : 'text-slate-400'}`}>
                    {isOver ? `OVER BUDGET (-${Math.abs(remainingCP)} CP)` : `${remainingCP} CP REMAINING`}
                  </span>
                </div>
              );
            })()}

            {/* Character Roster Button */}
            <button
              type="button"
              onClick={() => setIsRosterOpen(true)}
              className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/60 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              <span>📇</span>
              <span className="hidden sm:inline">Roster</span>
            </button>

            {/* Hidden File Input */}
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={onFileChange}
            />

            {/* File Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
              >
                <span>File Menu</span>
                <span className="text-[10px]">▼</span>
              </button>

              {isFileMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-48 bg-slate-900 border border-cyan-500/60 rounded-lg shadow-xl py-1 z-50 text-xs"
                  onClick={() => setIsFileMenuOpen(false)}
                >
                  <button
                    onClick={() => setIsRosterOpen(true)}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-amber-300 uppercase font-bold flex items-center gap-2"
                  >
                    <span>📇</span> Character Portfolio Roster
                  </button>
                  <div className="border-t border-slate-800 my-1" />
                  <button
                    onClick={() => setIsConfirmOpen(true)}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-slate-200 uppercase font-bold"
                  >
                    New Character
                  </button>
                  <button
                    onClick={() => setIsConfirmOpen(true)}
                    className="w-full text-left px-4 py-2 hover:bg-red-950/80 text-red-300 uppercase font-bold"
                  >
                    🗑️ CLEAR Sheet Data
                  </button>
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-slate-200 uppercase font-bold"
                  >
                    Preview Sheet
                  </button>
                  <div className="border-t border-slate-800 my-1" />
                  <button
                    onClick={handleSaveCloud}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-cyan-300 uppercase font-bold"
                  >
                    Save to Cloud
                  </button>
                  <button
                    onClick={handleCloudLoadPrompt}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-cyan-300 uppercase font-bold"
                  >
                    Load from Cloud
                  </button>
                  <div className="border-t border-slate-800 my-1" />
                  <button
                    onClick={handleSaveLocal}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-amber-300 uppercase font-bold"
                  >
                    Save to File
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-amber-300 uppercase font-bold"
                  >
                    Load from File
                  </button>
                </div>
              )}
            </div>

            {/* User Auth Indicator / ID Tag */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center bg-slate-800/80 px-3 py-1 rounded border border-slate-700">
                  <span className="text-xs text-cyan-300 font-mono font-bold" title={currentUser.email || ''}>
                    {userHandle ? `@${userHandle}` : (currentUser.displayName || currentUser.email)}
                  </span>
                </div>
              ) : (
                <button onClick={loginWithGoogle} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                  Login with Google
                </button>
              )}
            </div>
          </div>

        </header>

        {/* Tab Content Display */}
        <div className="flex-1 overflow-y-auto relative p-2">
          {activeTab === 'identity' && (
            <IdentityTab
              onOpenSelectorModal={handleOpenSelectorModal}
            />
          )}
          {activeTab === 'core-stats' && (
            <CoreStatsTab />
          )}
          {activeTab === 'skills' && (
            <SkillsTab
              onOpenAddSkillModal={handleOpenAddSkillModal}
            />
          )}
          {activeTab === 'abilities' && (
            <AbilitiesTab
              onOpenSelectorModal={handleOpenSelectorModal}
            />
          )}
          {activeTab === 'combat-gear' && (
            <CombatGearTab
              onOpenSelectorModal={handleOpenSelectorModal}
            />
          )}
          {activeTab === 'other' && (
            <OtherTab />
          )}
        </div>
      </div>

      {/* Modals & Drawers */}
      <RosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        personaRoster={personaRoster}
        activeDocId={characterData['character-doc-id']}
        onSelectCharacter={switchRosterCharacter}
        onSaveCurrent={saveCurrentToRoster}
        onNewCharacter={handleNewCharacter}
        onDuplicateCharacter={duplicateRosterCharacter}
        onDeleteCharacter={deleteRosterCharacter}
        onUpdateNote={updateRosterCharacterNote}
      />
      <EconomyModal
        isOpen={isEconomyOpen}
        onClose={() => setIsEconomyOpen(false)}
        characterData={characterData}
        updateField={updateField}
        economyBreakdown={economyBreakdown}
      />
      <AddSkillModal
        isOpen={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        onAddSkill={handleAddSkill}
        onAddSpecialization={handleAddSpecialization}
        availableSkills={availableSkillsForModal}
        initialMode={addSkillModalMode}
      />
      <CustomSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        modalConfig={selectorConfig}
        onSelectItem={handleSelectItem}
      />
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleNewCharacter}
        title="Reset Persona Sheet"
        message="Are you sure you want to start a new character? Unsaved changes will be cleared."
      />
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        characterData={characterData}
      />
      <BastionDrawer
        isOpen={isBastionOpen}
        onClose={() => setIsBastionOpen(false)}
      />

      {/* Print-only Folio Output */}
      <div className="hidden print:block">
        <PrintFolio characterData={characterData} />
      </div>
    </div>
  );
};

export default FolioContainer;
