import { getGlobalConfirm, showConfirm } from '../context/ConfirmContext';
import { showToast } from '../context/ToastContext';

/**
 * Async typed-deletion confirmation using ConfirmContext modal.
 * Supports both signatures:
 *   1) await confirmTypedDeletion(itemName, itemType)           // Uses global confirm dispatcher
 *   2) await confirmTypedDeletion(confirmFn, itemName, itemType) // Explicit hook function passed
 *
 * @param {Function|string} arg1 - Either confirmFn from useConfirm() OR itemName
 * @param {string} [arg2]        - Either itemName OR itemType
 * @param {string} [arg3]        - itemType (if arg1 was confirmFn)
 * @returns {Promise<boolean>} True if confirmed, false otherwise.
 */
export const confirmTypedDeletion = async (arg1, arg2 = 'entry', arg3 = 'entry') => {
  let confirmFn = null;
  let itemName = '';
  let itemType = 'entry';

  if (typeof arg1 === 'function') {
    confirmFn = arg1;
    itemName = typeof arg2 === 'string' ? arg2 : '';
    itemType = typeof arg3 === 'string' ? arg3 : 'entry';
  } else {
    confirmFn = getGlobalConfirm() || showConfirm;
    itemName = typeof arg1 === 'string' ? arg1 : '';
    itemType = typeof arg2 === 'string' ? arg2 : 'entry';
  }

  const targetName = (itemName || '').trim();

  // If no specific item name, simple danger confirmation
  if (!targetName) {
    if (confirmFn) {
      return confirmFn({
        title: `Delete ${itemType}`,
        message: `Are you sure you want to delete this ${itemType}? This action cannot be undone.`,
        danger: true,
        confirmLabel: 'Delete',
      });
    }
    return Promise.resolve(window.confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`));
  }

  // Typed confirmation modal
  if (confirmFn) {
    return confirmFn({
      title: `Delete ${itemType}`,
      message: `This action will permanently delete this ${itemType}.`,
      requireTyped: true,
      typedTarget: targetName,
      danger: true,
      confirmLabel: 'Delete',
    });
  }

  // Fallback if neither modal dispatcher is available
  const userInput = window.prompt(
    `DELETION CONFIRMATION REQUIRED:\n\nTo delete ${itemType} "${targetName}", please type "${targetName}" below to confirm:`
  );
  if (userInput === null) return false;
  if (userInput.trim().toLowerCase() === targetName.toLowerCase()) return true;
  showToast({
    type: 'warning',
    title: 'DELETION CANCELLED',
    text: `Typed name did not match "${targetName}".`
  });
  return false;
};
