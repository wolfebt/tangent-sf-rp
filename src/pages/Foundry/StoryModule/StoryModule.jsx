import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ScenarioPane from './ScenarioPane';
import FoundryLauncherModal from '../../../components/StoryFoundry/FoundryLauncherModal';
import { useStory } from '../../../context/CampaignContext';

export default function StoryModule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storyIdParam = searchParams.get('storyId');
  const { openStory } = useStory();

  // Open story project catalog dashboard by default when landing on Story Module, unless a specific storyId query param is provided
  const [isCatalogOpen, setIsCatalogOpen] = useState(() => !storyIdParam);

  useEffect(() => {
    if (storyIdParam) {
      openStory(storyIdParam);
      setIsCatalogOpen(false);
    }
  }, [storyIdParam, openStory]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 overflow-hidden font-sans relative">
      {/* Main Workspace Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScenarioPane 
          onOpenCatalog={() => setIsCatalogOpen(true)}
          onSwitchTab={(tab) => {
            if (tab === 'map') navigate('/map-maker');
          }} 
        />
      </div>

      {/* Story Project Catalog / Dashboard Modal */}
      <FoundryLauncherModal 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        initialTab="stories"
      />
    </div>
  );
}

