import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { DBMItemModal } from '../../DBM/DBMItemModal';
import { categoryConfig } from '../../DBM/categoryConfig';
import { attachCreatorTag } from '../../../utils/creatorUtils';

const AssetModal = ({
  isOpen,
  onClose,
  modalConfig,
  onSaveAsset
}) => {
  const { mode = 'create', key = 'equipment', itemIndex = null, initialData = null, title = 'Asset' } = modalConfig || {};

  // Map Folio key to OmniCortex category key
  let targetKey = key || 'equipment';
  if (['weapons', 'attacks', 'weaponry'].includes(key)) targetKey = 'weaponry';
  else if (['armor', 'armoring'].includes(key)) targetKey = 'armoring';
  else if (key === 'mecha') targetKey = 'mecha';
  else if (['gear', 'other', 'equipment'].includes(key)) targetKey = 'equipment';
  else if (key === 'features') targetKey = 'features';
  else if (key === 'disadvantages') targetKey = 'disadvantages';
  else if (key === 'augmentations') targetKey = 'augmentations';
  else if (key === 'awakened') targetKey = 'awakened';
  else if (key === 'invocations') targetKey = 'invocations';
  else if (key === 'special_abilities') targetKey = 'special_abilities';
  else if (['char-species', 'species'].includes(key)) targetKey = 'species';
  else if (['char-occu', 'occupations'].includes(key)) targetKey = 'occupations';
  else if (['char-origin', 'origins'].includes(key)) targetKey = 'origins';
  else if (['char-faction', 'factions'].includes(key)) targetKey = 'factions';

  const currentConfig = categoryConfig[targetKey] || {
    label: (title || targetKey).toUpperCase(),
    fields: {
      name: { type: 'text', required: true },
      description: { type: 'textarea', aiEnabled: true }
    }
  };

  const selectedItem = mode === 'edit' && initialData ? initialData : null;
  const [editFormData, setEditFormData] = useState({});
  const [isEditMode, setIsEditMode] = useState(true);

  // Initialize editFormData when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setEditFormData(typeof initialData === 'object' ? { ...initialData } : { name: String(initialData), description: '' });
      } else {
        const initial = { name: '', description: '' };
        if (currentConfig.fields) {
          Object.keys(currentConfig.fields).forEach(fKey => {
            const fDef = currentConfig.fields[fKey];
            if (fDef.default !== undefined) initial[fKey] = fDef.default;
            else if (fDef.type === 'number') initial[fKey] = 0;
            else if (fDef.type === 'boolean') initial[fKey] = false;
            else if (fDef.type === 'multiselect' || fDef.type === 'json_list') initial[fKey] = [];
          });
        }
        setEditFormData(initial);
      }
      setIsEditMode(true);
    }
  }, [isOpen, initialData, key, targetKey]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!editFormData.name || !editFormData.name.trim()) {
      alert('Entry name is required.');
      return;
    }

    const docId = selectedItem?.id || editFormData.id || `entry_${Date.now()}`;
    const taggedData = attachCreatorTag(editFormData, localStorage.getItem('userHandle'), auth.currentUser);
    const payload = {
      ...taggedData,
      name: taggedData.name.trim(),
      id: docId,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, targetKey, docId), payload, { merge: true });
    } catch (err) {
      console.warn(`Failed to save to Firestore collection "${targetKey}":`, err);
    }

    if (onSaveAsset) {
      onSaveAsset(key, payload, itemIndex);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!selectedItem?.id) return;
    if (!window.confirm(`Are you sure you want to delete "${selectedItem.name || 'this item'}" from the database?`)) return;

    try {
      await deleteDoc(doc(db, targetKey, selectedItem.id));
    } catch (err) {
      console.warn(`Failed to delete from Firestore collection "${targetKey}":`, err);
    }
    onClose();
  };

  const handleSaveEntryDirect = async (payloadData, colKey) => {
    const docId = payloadData.id || `entry_${Date.now()}`;
    const taggedData = attachCreatorTag(payloadData, localStorage.getItem('userHandle'), auth.currentUser);
    const payload = { ...taggedData, id: docId, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, colKey || targetKey, docId), payload, { merge: true });
    return true;
  };

  return (
    <DBMItemModal
      isOpen={isOpen}
      onClose={onClose}
      isEditMode={isEditMode}
      setIsEditMode={setIsEditMode}
      selectedItem={selectedItem}
      editFormData={editFormData}
      setEditFormData={setEditFormData}
      currentConfig={currentConfig}
      currentKey={targetKey}
      onSave={handleSave}
      onDelete={handleDelete}
      saveEntry={handleSaveEntryDirect}
      devMode={true}
      isAdmin={true}
    />
  );
};

export default React.memo(AssetModal);
