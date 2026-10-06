/**
 * @file GemsTab.jsx
 * @description Dedicated Guidance Gems tab embedded directly within the Story Weaver workspace.
 * Relocates guidance gems from floating rails/modals into a first-class narrative directive suite.
 */

import React from 'react';
import GuidanceGemsPanel from '../../StoryModule/panels/GuidanceGemsPanel';

export default function GemsTab({ onClose }) {
  return (
    <div className="flex-1 h-full w-full bg-[#080c14] overflow-hidden flex flex-col font-sans">
      <div className="flex-1 h-full w-full overflow-hidden">
        <GuidanceGemsPanel isInline={true} onClose={onClose} />
      </div>
    </div>
  );
}
