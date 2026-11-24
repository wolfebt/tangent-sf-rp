/**
 * @file FoundryModalHost.jsx
 * @description Consolidated global modal host for StoryModule / ADE workspace.
 * Centralizes EditElementModal, SelectivePrintModal, ArtistHubModal, ModulePackageModal,
 * CronicleDeckModal, VttCompilerModal, FoundryLauncherModal, StoryFoundryGuideModal,
 * UserSettingsModal, and floating AIMEChatBox.
 */

import React, { Suspense } from 'react';
import { lazyWithRetry } from '../../../utils/lazyWithRetry';
import FoundryLauncherModal from '../../../components/StoryFoundry/FoundryLauncherModal';

const SelectivePrintModal = lazyWithRetry(() => import('../../../components/StoryFoundry/SelectivePrintModal'));
import { StoryFoundryGuideModal } from '../../../components/StoryFoundry/StoryFoundryGuideModal';
import { UserSettingsModal } from '../../../components/UserSettingsModal';
import AIMEChatBox from '../AIME/AIMEChatBox';
import { formatAimeProseToHtml } from '../AIME/aimeTextUtils';
import EditElementModal from '../ElementForge/EditElementModal';
import CronicleDeckModal from '../../../components/StoryFoundry/Cronicle/CronicleDeckModal';
import VttCompilerModal from '../../../components/StoryFoundry/VttCompilerModal';
import ModulePackageModal from '../../../components/StoryFoundry/ModulePackageModal';
import { ArtistHubModal } from '../../../components/StoryFoundry/ArtistHubModal';
import CommandPaletteModal from './CommandPaletteModal';
import { generateScratchbookMarkdown } from './scratchbookService';
import { persistAdeElement } from '../../../utils/adeElementPersistence';
import { buildArtistConceptPatch } from '../../../services/artistHubFramework';
import { hydrateModuleIntoCampaign } from '../../../services/modulePackageService';
import { useAdeStore } from '../store/adeStore';

export default function FoundryModalHost({
  modals = {},
  setModal,
  cronicleInitialMode,
  editingModalElement,
  setEditingModalElement,
  elementEditorMode,
  elementEditorInitialSeed,
  activeNode,
  activeMap,
  universeState,
  elementsCatalog = [],
  cronicle,
  getActiveGemsText,
  updateSavedElement,
  deleteSavedElement,
  saveEntry,
  saveCurrentToRoster,
  showToast,
  addMap,
  updateMap,
  addStory,
  updateStory,
  setActiveMapId,
  setActiveScenarioId,
  setGalleryModifiers,
  updateCreativeState,
  updateCronicle,
  onSwitchView,
  onToggleSplitView,
  isStoryReadOnly = false
}) {
  const perspectiveMode = useAdeStore((s) => s.perspectiveMode);
  const isCatalogOpen = Boolean(modals.catalog);
  const isPrintModalOpen = Boolean(modals.print);
  const isArtistHubOpen = Boolean(modals.artistHub);
  const isGuideOpen = Boolean(modals.guide);
  const isSettingsOpen = Boolean(modals.settings);
  const isCronicleOpen = Boolean(modals.cronicle);
  const isCompilerOpen = Boolean(modals.compiler);
  const isEditElementModalOpen = Boolean(modals.editElement);
  const isFloatingAimeOpen = Boolean(modals.floatingAime);
  const isModuleExportOpen = Boolean(modals.moduleExport);
  const isModuleImportOpen = Boolean(modals.moduleImport);
  const isCommandPaletteOpen = Boolean(modals.commandPalette);

  React.useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setModal?.('commandPalette', !isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isCommandPaletteOpen, setModal]);

  React.useEffect(() => {
    const handleCloseFloatingAime = () => setModal?.('floatingAime', false);
    window.addEventListener('close-floating-aime', handleCloseFloatingAime);
    return () => window.removeEventListener('close-floating-aime', handleCloseFloatingAime);
  }, [setModal]);

  React.useEffect(() => {
    if (isFloatingAimeOpen) {
      window.dispatchEvent(new CustomEvent('close-bastion-drawer'));
    }
  }, [isFloatingAimeOpen]);

  const handleInsertFloatingAimeText = (rawText) => {
    if (isStoryReadOnly) {
      showToast?.({ type: 'warning', text: 'Read-only mode active: unlock editing to insert prose.' });
      return;
    }
    if (!activeNode?.id || typeof updateStory !== 'function') {
      showToast?.({ type: 'warning', text: 'Select a scenario node before inserting prose.' });
      return;
    }
    const htmlChunk = formatAimeProseToHtml(rawText);
    if (!htmlChunk) return;
    const nextContent = `${activeNode.content || ''}${htmlChunk}`;
    updateStory(activeNode.id, { content: nextContent });
    showToast?.({ type: 'success', text: `Inserted AIME prose into "${activeNode.title || 'Scenario'}"` });
  };

  return (
    <>
      {isFloatingAimeOpen && (
        <AIMEChatBox
          onClose={() => setModal('floatingAime', false)}
          activeNode={activeNode}
          onInsertText={handleInsertFloatingAimeText}
          contextData={{
            universeState,
            projectName: universeState?.projectName || 'Tangent Universe',
            activeNode: activeNode
              ? {
                  id: activeNode.id,
                  title: activeNode.title,
                  type: activeNode.type,
                  content: activeNode.content,
                  fields: activeNode.fields
                }
              : null,
            guidanceGems: typeof getActiveGemsText === 'function' ? getActiveGemsText() : '',
            outline: universeState?.creativeState?.storyOutline || '',
            sceneBeats: universeState?.creativeState?.sceneBeats || '',
            draft: universeState?.creativeState?.storyDraft || '',
            customCatalog: elementsCatalog || [],
            scratchbook: generateScratchbookMarkdown(universeState, elementsCatalog),
            cronicle: universeState?.cronicle || cronicle || null
          }}
        />
      )}

      {isEditElementModalOpen && (
        <EditElementModal
          isOpen={isEditElementModalOpen}
          onClose={() => {
            setModal('editElement', false);
            setEditingModalElement(null);
          }}
          element={editingModalElement}
          initialMode={elementEditorMode}
          initialSeedTab={elementEditorInitialSeed || 'spark'}
          activeScenario={activeNode}
          onSave={async (savedElem) => {
            const res = await persistAdeElement({
              element: savedElem,
              elementsCatalog,
              updateSavedElement,
              saveEntry,
              saveCurrentToRoster,
              showToast
            });
            if (!res) return null;
            setModal('editElement', false);
            setEditingModalElement(null);
            return res;
          }}
          onDelete={(elementId) => {
            if (typeof deleteSavedElement === 'function' && elementId) {
              deleteSavedElement(elementId);
            }
            setModal('editElement', false);
            setEditingModalElement(null);
          }}
        />
      )}

      {isCatalogOpen && (
        <FoundryLauncherModal
          isOpen={isCatalogOpen}
          onClose={() => setModal('catalog', false)}
          initialTab="stories"
        />
      )}

      {isPrintModalOpen && (
        <Suspense fallback={null}>
          <SelectivePrintModal
            isOpen={isPrintModalOpen}
            onClose={() => setModal('print', false)}
            universeState={universeState}
            elementsCatalog={elementsCatalog}
            activeScenario={activeNode}
            activeMap={activeMap}
            defaultOperatorSafeMode={perspectiveMode === 'operator'}
          />
        </Suspense>
      )}

      {isGuideOpen && (
        <StoryFoundryGuideModal
          isOpen={isGuideOpen}
          onClose={() => setModal('guide', false)}
        />
      )}

      {isSettingsOpen && (
        <UserSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setModal('settings', false)}
        />
      )}

      {isCronicleOpen && (
        <CronicleDeckModal
          isOpen={isCronicleOpen}
          onClose={() => setModal('cronicle', false)}
          initialMode={cronicleInitialMode}
        />
      )}

      {isCompilerOpen && (
        <VttCompilerModal
          isOpen={isCompilerOpen}
          onClose={() => setModal('compiler', false)}
          activeScenario={activeNode}
        />
      )}

      {isArtistHubOpen && (
        <ArtistHubModal
          isOpen={isArtistHubOpen}
          onClose={() => setModal('artistHub', false)}
          onApplyAsset={(asset) => {
            if (editingModalElement?.id) {
              updateSavedElement?.(editingModalElement.id, {
                ...editingModalElement,
                ...buildArtistConceptPatch(editingModalElement, asset)
              });
              showToast?.({
                type: 'success',
                text: `Applied Artist Hub concept to "${editingModalElement.title || 'element'}".`
              });
              return;
            }
            if (activeNode?.id) {
              updateStory?.(activeNode.id, buildArtistConceptPatch(activeNode, asset, { fillContent: true }));
              showToast?.({
                type: 'success',
                text: `Applied Artist Hub concept to "${activeNode.title || 'story node'}".`
              });
              return;
            }
            if (asset?.prompt) {
              navigator?.clipboard?.writeText?.(asset.prompt)?.catch?.(() => {});
            }
            showToast?.({
              type: 'info',
              text: 'Artist Hub concept copied to clipboard (select a story node or element to attach directly).'
            });
          }}
          initialPrompt={
            editingModalElement?.title
              ? `${editingModalElement.title} (${editingModalElement.type || 'Element'})`
              : activeNode?.title
              ? `${activeNode.title}`
              : ''
          }
          elementContext={editingModalElement || activeNode || null}
        />
      )}

      {(isModuleExportOpen || isModuleImportOpen) && (
        <ModulePackageModal
          isOpen={isModuleExportOpen || isModuleImportOpen}
          onClose={() => {
            setModal('moduleExport', false);
            setModal('moduleImport', false);
          }}
          initialMode={isModuleExportOpen ? 'export' : 'import'}
          universeState={universeState}
          elementsCatalog={elementsCatalog}
          onImportPackage={(pkg) => {
            if (isStoryReadOnly) {
              showToast?.({ type: 'warning', text: 'Read-only story: clone project to import module packages.' });
              return;
            }
            if (pkg) {
              hydrateModuleIntoCampaign(pkg, {
                addMap,
                updateMap,
                addStory,
                updateStory,
                updateCreativeState,
                updateCronicle,
                existingMaps: universeState?.maps || [],
                existingScenarios: universeState?.scenarios || [],
                existingElements: elementsCatalog || [],
                addSavedElement: (el) => {
                  const elemId = el?.id || `elem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                  return updateSavedElement(elemId, { ...el, id: elemId });
                },
                setActiveMapId,
                setActiveScenarioId,
                setGalleryModifiers
              });
            }
          }}
        />
      )}

      {isCommandPaletteOpen && (
        <CommandPaletteModal
          isOpen={isCommandPaletteOpen}
          onClose={() => setModal('commandPalette', false)}
          universeState={universeState}
          elementsCatalog={elementsCatalog}
          onSelectScenario={(scId) => setActiveScenarioId?.(scId)}
          onEditElement={(el) => useAdeStore.getState().openGuidedElementCreator({ element: el, mode: 'sheet' })}
          onOpenNewElement={() => useAdeStore.getState().openGuidedElementCreator({ mode: 'guided' })}
          onSelectMap={(mapId) => setActiveMapId?.(mapId)}
          onSwitchView={onSwitchView}
          onToggleSplitView={onToggleSplitView}
          onOpenModal={(key) => setModal(key, true)}
        />
      )}
    </>
  );
}
