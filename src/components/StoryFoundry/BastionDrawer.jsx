import React, { useEffect } from 'react';
import UnifiedBastionDrawer from '../Folio/BastionDrawer';
import { useBastion } from '../../context/BastionContext';
import { FOUNDRY_PRESETS } from '../Bastion/BastionWorkspaceFieldGenerator';

export { FOUNDRY_PRESETS as PRESETS };

/**
 * Merged BASTION StoryFoundry Bridge Wrapper.
 * Preserves legacy `<BastionDrawer />` import signature in StoryFoundry while
 * delegating to the single unified platform BASTION shell & surface registry.
 */
const BastionDrawer = ({ isOpen, onClose, initialTab = 'chat', activeNode: propActiveNode }) => {
  const { registerSurfaceContext, unregisterSurfaceContext, setActiveDrawerTab } = useBastion();

  useEffect(() => {
    if (isOpen && initialTab && typeof setActiveDrawerTab === 'function') {
      setActiveDrawerTab(initialTab);
    }
  }, [isOpen, initialTab, setActiveDrawerTab]);

  useEffect(() => {
    if (typeof registerSurfaceContext !== 'function') return undefined;
    registerSurfaceContext('foundry-drawer-bridge', {
      surfaceType: 'foundry',
      activeNode: propActiveNode || null,
      defaultRouteRole: 'architect',
    });
    return () => unregisterSurfaceContext?.('foundry-drawer-bridge');
  }, [registerSurfaceContext, unregisterSurfaceContext, propActiveNode]);

  if (!isOpen) return null;
  return <UnifiedBastionDrawer isOpen={isOpen} onClose={onClose} />;
};

export default React.memo(BastionDrawer);
