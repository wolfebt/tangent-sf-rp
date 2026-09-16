import React, { useMemo } from 'react';
import { AssetStudio, StudioTransferBar } from '../Codex/AssetStudio';
import { getMatrixIdForAssetKey } from '../../pages/Codex/codexAssetBridge';
import { getMatrixById } from '../../pages/Codex/codexConfig';

export const getDatasetKeyForCollection = (colKey) => {
  if (!colKey) return 'species';
  const k = colKey.toLowerCase();
  if (k === 'species' || k === 'species_type' || k === 'species_size' || k === 'species_movement') return 'species';
  if (k === 'features' || k === 'trait' || k === 'traits') return 'features';
  if (k === 'skills' || k === 'skill') return 'skills';
  if (k === 'disadvantages' || k === 'disadvantage') return 'disadvantages';
  if (k === 'factions' || k === 'faction' || k === 'societies') return 'factions';
  if (k === 'occupations' || k === 'occupation' || k === 'origins' || k === 'archetypes') return 'occupations';
  if (k === 'invocations' || k === 'invocation' || k === 'special_abilities' || k === 'disciplines') return 'invocations';
  if (k === 'augmentations' || k === 'augmentation' || k === 'augmentation_type' || k === 'body_location') return 'augmentations';
  if (k === 'gear' || k === 'equipment' || k === 'personal_property' || k === 'meta-tech') return 'gear';
  if (k === 'weaponry' || k === 'weapons' || k === 'weapon') return 'weaponry';
  if (k === 'armoring' || k === 'armor') return 'armoring';
  if (k === 'mecha' || k === 'vehicles' || k === 'starships') return 'mecha';
  if (k === 'architecture' || k === 'facilities' || k === 'stations') return 'architecture';
  return 'other';
};

export const CANONICAL_ATTRIBUTES_LIST = [
  {
    group: 'Physical Attributes',
    icon: '🏃',
    pairs: [
      {
        primary: { name: 'Strength', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Might', type: 'Sub-Attribute' }]
      },
      {
        primary: { name: 'Agility', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Reflex', type: 'Sub-Attribute' }]
      },
      {
        primary: { name: 'Stamina', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Fortitude', type: 'Sub-Attribute' }]
      }
    ]
  },
  {
    group: 'Mental Attributes',
    icon: '🧠',
    pairs: [
      {
        primary: { name: 'Intellect', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Logic', type: 'Sub-Attribute' }]
      },
      {
        primary: { name: 'Wisdom', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Will', type: 'Sub-Attribute' }]
      },
      {
        primary: { name: 'Charisma', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Etiquette', type: 'Sub-Attribute' }]
      }
    ]
  }
];

export const DBMItemTransferBar = StudioTransferBar;

/**
 * DBMItemModal
 * Fully consolidated Asset Studio Modal powering item management across Omnicortex DBM,
 * Compendium, MapMaker, and persona inventory.
 */
export const DBMItemModal = ({
  isOpen,
  onClose,
  isEditMode = false,
  setIsEditMode = () => {},
  selectedItem = null,
  editFormData = {},
  setEditFormData = () => {},
  currentConfig = {},
  currentKey,
  onSave = () => {},
  onDelete = () => {},
  onDuplicate = () => {},
  dbData = {},
  saveEntry = null,
  devMode = true,
  isAdmin = true
}) => {
  if (!isOpen) return null;

  const targetItem = (editFormData && Object.keys(editFormData).length > 0) ? editFormData : selectedItem;

  const matrixId = useMemo(() => getMatrixIdForAssetKey(currentKey), [currentKey]);
  const matrix = useMemo(() => matrixId ? getMatrixById(matrixId) : getMatrixById('equipment'), [matrixId]);

  const handleSaveComplete = (savedPayload) => {
    if (setEditFormData) setEditFormData(savedPayload);
    if (onSave) onSave(true, savedPayload);
  };

  const handleDeleteComplete = (item) => {
    if (onDelete) onDelete(item || targetItem);
  };

  return (
    <AssetStudio
      isOpen={isOpen}
      onClose={onClose}
      isModal={true}
      matrix={matrix}
      initialData={targetItem}
      selectedItem={selectedItem}
      currentKey={currentKey}
      currentConfig={currentConfig}
      isEditMode={isEditMode}
      setIsEditMode={setIsEditMode}
      onSaveComplete={handleSaveComplete}
      onSave={onSave}
      onDelete={handleDeleteComplete}
      onDuplicate={onDuplicate}
      dbData={dbData}
      saveEntry={saveEntry}
      devMode={devMode}
      isAdmin={isAdmin}
    />
  );
};

export default React.memo(DBMItemModal);
