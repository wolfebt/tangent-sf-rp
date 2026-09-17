import React, { useMemo } from 'react';
import { AssetStudio } from './AssetStudio';
import { getMatrixIdForAssetKey } from '../../pages/Codex/codexAssetBridge';
import { getMatrixById } from '../../pages/Codex/codexConfig';
import { isPropertyCategory } from '../../utils/tangentSchemaAdapters';

/**
 * CodexManageModal
 * Universal Studio Modal rendering the consolidated Asset Studio for any game asset.
 */
export const CodexManageModal = ({
  isOpen,
  onClose,
  modalConfig = {},
  onSaveAsset,
  onDeleteAsset,
  devMode = true,
  isAdmin = true
}) => {
  const { 
    mode = 'create', 
    key = 'equipment', 
    itemIndex = null, 
    initialData = null, 
    title = 'Asset'
  } = modalConfig;

  const matrixId = useMemo(() => getMatrixIdForAssetKey(key), [key]);
  const matrix = useMemo(() => {
    if (matrixId) return getMatrixById(matrixId);
    if (!isPropertyCategory(key)) return getMatrixById('features');
    return getMatrixById('equipment');
  }, [matrixId, key]);

  const handleSaveComplete = (payload) => {
    if (onSaveAsset) {
      onSaveAsset(key, payload, itemIndex);
    }
  };

  const handleDeleteComplete = (item) => {
    if (onDeleteAsset) {
      onDeleteAsset(key, itemIndex, item);
    }
  };

  return (
    <AssetStudio
      isOpen={isOpen}
      onClose={onClose}
      isModal={true}
      matrix={matrix}
      initialData={initialData}
      currentKey={key}
      isEditMode={mode !== 'view'}
      onSaveComplete={handleSaveComplete}
      onDelete={handleDeleteComplete}
      devMode={devMode}
      isAdmin={isAdmin}
    />
  );
};

export default React.memo(CodexManageModal);
