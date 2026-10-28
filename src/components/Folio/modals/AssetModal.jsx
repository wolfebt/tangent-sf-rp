import React from 'react';
import { CodexManageModal } from '../../Codex/CodexManageModal';
import { useAuth } from '../../../context/AuthContext';

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
  const { isAdmin } = useAuth() || {};
  if (!isOpen) return null;

  return (
    <CodexManageModal
      isOpen={isOpen}
      onClose={onClose}
      modalConfig={modalConfig}
      onSaveAsset={onSaveAsset}
      onDeleteAsset={onDeleteAsset}
      devMode={Boolean(isAdmin)}
      isAdmin={Boolean(isAdmin)}
    />
  );
};

export default React.memo(AssetModal);
