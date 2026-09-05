import React from 'react';
import { useFolio } from '../../../context/FolioContext';
import { UniversalCatalogModal } from '../../UI/UniversalCatalogModal';

/**
 * CustomSelectorModal (Modernized with UniversalCatalogModal)
 * Adapts legacy Folio selector modal calls to the intelligent sorted catalog architecture
 * with Clean Table & High-Tech Cards dual view modes and integrated entry building.
 */
const CustomSelectorModal = ({ isOpen, onClose, modalConfig, onSelectItem, onOpenAssetModal }) => {
  const { characterData } = useFolio();
  if (!isOpen || !modalConfig) return null;

  const { title = 'Entry', browsePath = 'equipment', filterCategory, filterCategoryExclude, key } = modalConfig;

  const handleSelect = (item) => {
    if (onSelectItem) {
      onSelectItem(key || browsePath, item);
    }
  };

  const handleOpenManageModal = (colKey, itemData, mode = 'create') => {
    if (onOpenAssetModal) {
      onOpenAssetModal(key || colKey, title, mode, null, itemData || { category: colKey });
    }
  };

  return (
    <UniversalCatalogModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      collectionKey={browsePath}
      characterData={characterData}
      onSelectItem={handleSelect}
      onOpenManageModal={handleOpenManageModal}
      allowBuild={Boolean(onOpenAssetModal)}
      allowEdit={Boolean(onOpenAssetModal)}
      filterCategory={filterCategory}
      filterCategoryExclude={filterCategoryExclude}
    />
  );
};

export default React.memo(CustomSelectorModal);
