import React from 'react';
import { CodexManageModal } from '../../Codex/CodexManageModal';

/**
 * AssetModal (Enhanced with Codex Matrix & Quick Spec Dual-Mode)
 * Manages Folio and Omnicortex game assets with full Codex Matrix Builder capabilities,
 * live canonical formulas, section guidance, and dedicated dataset isolation.
 */
const AssetModal = ({
  isOpen,
  onClose,
  modalConfig,
  onSaveAsset,
  onDeleteAsset
}) => {
  if (!isOpen) return null;

  return (
    <CodexManageModal
      isOpen={isOpen}
      onClose={onClose}
      modalConfig={modalConfig}
      onSaveAsset={onSaveAsset}
      onDeleteAsset={onDeleteAsset}
      devMode={true}
      isAdmin={true}
    />
  );
};

export default React.memo(AssetModal);
