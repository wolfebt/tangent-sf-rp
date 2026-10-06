/**
 * @file ScriptsTab.jsx
 * @description Presets & Automation Scripts Tab for the STAGE compiler.
 * Consolidates the Presets and Scripts Studio (routines, traps, QuickJS macros, and automations)
 * into the Stage compiler workspace.
 */

import React from 'react';
import PresetsAndScriptsDashboard from '../../PresetsAndScripts/PresetsAndScriptsDashboard';

export default function ScriptsTab({ onBackToStory }) {
  return (
    <div className="flex-1 h-full w-full bg-[#080d16] overflow-hidden flex flex-col font-mono text-slate-100">
      <PresetsAndScriptsDashboard onBackToStory={onBackToStory} />
    </div>
  );
}
