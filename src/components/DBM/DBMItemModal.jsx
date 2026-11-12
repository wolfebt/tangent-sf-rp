import React, { useMemo } from 'react';
import { AssetStudio, StudioTransferBar } from '../Codex/AssetStudio';
import { getMatrixIdForAssetKey } from '../../pages/Codex/codexAssetBridge';
import { getMatrixById } from '../../pages/Codex/codexConfig';
import { isPropertyCategory } from '../../utils/tangentSchemaAdapters';

export const getDatasetKeyForCollection = (colKey) => {
  if (!colKey) return 'other';
  const k = colKey.toLowerCase();
  if (k === 'species') return 'species';
  if (k === 'species_lineage') return 'species_lineage';
  if (k === 'species_type') return 'species_type';
  if (k === 'species_size') return 'species_size';
  if (k === 'species_movement') return 'species_movement';
  if (k === 'features' || k === 'feature') return 'features';
  if (k === 'trait' || k === 'species_traits') return 'trait';
  if (k === 'traits') return 'traits';
  if (k === 'skills' || k === 'skill') return 'skills';
  if (k === 'disadvantages' || k === 'disadvantage') return 'disadvantages';
  if (k === 'factions' || k === 'faction') return 'factions';
  if (k === 'societies' || k.startsWith('society_')) return 'societies';
  if (k === 'origins' || k === 'origin') return 'origins';
  if (k === 'occupations' || k === 'occupation') return 'occupations';
  if (k === 'archetypes' || k === 'archetype') return 'archetypes';
  if (k === 'companions' || k === 'companion') return 'companions';
  if (k === 'modular_characters' || k === 'modular-characters' || k === 'threats' || k === 'bestiary') return 'modular_characters';
  if (k === 'disciplines' || k === 'discipline') return 'disciplines';
  if (k === 'special_abilities' || k === 'special_ability') return 'special_abilities';
  if (k === 'invocations' || k === 'invocation') return 'invocations';
  if (k === 'planetary_design' || k === 'planetary-design' || k === 'planets') return 'planetary_design';
  if (k === 'world' || k === 'world_design') return 'world';
  if (k === 'universe') return 'universe';
  if (k === 'setting') return 'setting';
  if (k === 'philosophy') return 'philosophy';
  if (k === 'scene') return 'scene';
  if (k === 'meta-tech' || k === 'metatech') return 'meta-tech';
  if (k === 'augmentations' || k === 'augmentation' || k === 'augmentation_type' || k === 'body_location') return 'augmentations';
  if (k === 'gear' || k === 'equipment' || k === 'personal_property') return 'gear';
  if (k === 'weaponry' || k === 'weapons' || k === 'weapon') return 'weaponry';
  if (k === 'armoring' || k === 'armor') return 'armoring';
  if (k === 'mecha' || k === 'vehicles' || k === 'starships') return 'mecha';
  if (k === 'architecture' || k === 'facilities' || k === 'stations') return 'architecture';
  return k;
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
        subAttributes: [{ name: 'Intellect', type: 'Sub-Attribute' }]
      },
      {
        primary: { name: 'Wisdom', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Wisdom', type: 'Sub-Attribute' }]
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
  isModal = false,
  isEditMode = true,
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
  const matrix = useMemo(() => {
    if (matrixId) return getMatrixById(matrixId);
    if (!isPropertyCategory(currentKey)) return getMatrixById('features');
    return getMatrixById('equipment');
  }, [matrixId, currentKey]);

  const handleSaveComplete = (savedPayload) => {
    if (setEditFormData) setEditFormData(savedPayload);
    if (onSave) onSave(false, savedPayload);
  };

  const handleDeleteComplete = (item) => {
    if (onDelete) onDelete(item || targetItem);
  };

  return (
    <AssetStudio
      isOpen={isOpen}
      onClose={onClose}
      isModal={isModal}
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
