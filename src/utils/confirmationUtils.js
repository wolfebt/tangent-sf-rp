/**
 * Prompts the user to type the exact name/title of an item to confirm deletion.
 * Returns true if confirmed and typed correctly, false otherwise.
 * 
 * @param {string} itemName - The name or title of the item being deleted.
 * @param {string} itemType - Optional descriptor like 'entry', 'article', 'skill', 'story project', etc.
 * @returns {boolean} True if typed name matches and user confirms; false otherwise.
 */
export const confirmTypedDeletion = (itemName, itemType = 'entry') => {
  const targetName = (itemName || '').trim();
  if (!targetName) {
    return window.confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`);
  }

  const userInput = window.prompt(
    `DELETION CONFIRMATION REQUIRED:\n\nTo delete ${itemType} "${targetName}", please type "${targetName}" below to confirm:`
  );

  if (userInput === null) {
    // User cancelled prompt
    return false;
  }

  if (userInput.trim().toLowerCase() === targetName.toLowerCase()) {
    return true;
  } else {
    alert(`Deletion cancelled. Typed name "${userInput.trim()}" did not match "${targetName}".`);
    return false;
  }
};
