import React, { useEffect } from 'react';
import UnifiedBastionDrawer from '../Folio/BastionDrawer';
import { useBastion } from '../../context/BastionContext';
import {
  DEFAULT_COMPENDIUM_PRESETS,
  CATEGORY_PRESETS_MAP,
  getPresetsForCollection,
} from '../Bastion/BastionWorkspaceFieldGenerator';

export {
  DEFAULT_COMPENDIUM_PRESETS,
  CATEGORY_PRESETS_MAP,
  getPresetsForCollection,
};

/**
 * Merged BASTION DBM/Compendium Bridge Wrapper.
 * Preserves legacy `<BastionChatModal />` prop signature while routing all chat,
 * selective field generation, and diff previews through the unified BASTION shell.
 */
export const BastionChatModal = ({
  isOpen,
  onClose,
  currentKey = 'compendium',
  currentConfig = {},
  selectedItem = null,
  isEntryModalOpen = false,
  editFormData = {},
  setEditFormData,
  handleCreateNew,
}) => {
  const { registerSurfaceContext, unregisterSurfaceContext } = useBastion();

  useEffect(() => {
    if (typeof registerSurfaceContext !== 'function') return undefined;
    registerSurfaceContext('dbm-modal-bridge', {
      surfaceType: currentKey === 'compendium' ? 'compendium' : 'dbm',
      currentKey,
      activeCategory: currentKey,
      currentConfig,
      selectedItem,
      isEntryModalOpen,
      editFormData,
      setEditFormData,
      handleCreateNew,
    });
    return () => unregisterSurfaceContext?.('dbm-modal-bridge');
  }, [
    registerSurfaceContext,
    unregisterSurfaceContext,
    currentKey,
    currentConfig,
    selectedItem,
    isEntryModalOpen,
    editFormData,
    setEditFormData,
    handleCreateNew,
  ]);

  if (!isOpen) return null;
  return <UnifiedBastionDrawer isOpen={isOpen} onClose={onClose} />;
};

export default BastionChatModal;
