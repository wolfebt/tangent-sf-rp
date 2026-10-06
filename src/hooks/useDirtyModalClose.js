import { useEffect, useCallback } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { AudioService } from '../services/audioService';

/**
 * Hook to guard modal close with a dirty check and allow backdrop/Escape close.
 *
 * @param {Object} options
 * @param {boolean} options.isOpen - Whether the modal is currently open
 * @param {boolean} options.isDirty - Whether there are unsaved changes
 * @param {Function} options.onClose - Function to close the modal
 * @param {string} [options.title] - Confirmation title
 * @param {string} [options.message] - Confirmation message
 * @returns {{ handleRequestClose: () => Promise<void>, handleGuardedClose: () => Promise<void>, handleBackdropClick: (e: any) => void }}
 */
export function useDirtyModalClose({
  isOpen,
  isDirty = false,
  onClose,
  title = 'Unsaved Changes',
  message,
  confirmMessage
}) {
  const confirm = useConfirm();
  const effectiveMessage = confirmMessage || message || 'You have unsaved changes. Are you sure you want to discard your changes and exit?';

  const handleRequestClose = useCallback(async () => {
    if (!isDirty) {
      AudioService.playTerminalBeep(900, 0.02);
      onClose();
      return;
    }

    AudioService.playTerminalBeep(650, 0.04);
    const shouldDiscard = await confirm({
      title,
      message: effectiveMessage,
      danger: true,
      confirmLabel: 'Discard & Exit',
      cancelLabel: 'Keep Editing'
    });

    if (shouldDiscard) {
      AudioService.playTerminalBeep(900, 0.02);
      onClose();
    }
  }, [isDirty, onClose, confirm, title, effectiveMessage]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      handleRequestClose();
    }
  }, [handleRequestClose]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleRequestClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleRequestClose]);

  return {
    handleRequestClose,
    handleGuardedClose: handleRequestClose,
    handleBackdropClick
  };
}

export default useDirtyModalClose;
