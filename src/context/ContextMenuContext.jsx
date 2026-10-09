import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ContextMenu } from '../components/UI/ContextMenu/ContextMenu';
import { AiActionModal } from '../components/UI/ContextMenu/AiActionModal';
import { resolveContextMenu } from '../components/UI/ContextMenu/resolvers';
import { 
  sendBastionChatMessage, 
  generateSelectiveFields, 
  fetchGeminiContent, 
  getGeminiApiKey 
} from '../services/bastionService';
import { AIME_SYSTEM_PROMPT } from '../services/aimeService';
import { useFolio } from './FolioContext';
import { useDBM } from './DBMContext';
import { useCampaign } from './CampaignContext';

const ContextMenuContext = createContext(null);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};

export const ContextMenuProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Try retrieving domain contexts gracefully
  const folioContext = useFolio();
  const dbmContext = useDBM();
  const campaignContext = useCampaign();

  // Active Context Menu State
  const [menuState, setMenuState] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    title: '',
    categoryBadge: '',
    domain: 'global',
    items: []
  });

  // AI Action Modal State
  const [aiModalState, setAiModalState] = useState({
    isOpen: false,
    title: '',
    aiType: 'BASTION',
    promptSummary: '',
    targetContext: '',
    result: null,
    isLoading: false,
    error: null,
    onApply: null,
    onRetry: null,
    onOpenDrawer: null,
    applyLabel: 'Apply'
  });

  const activeContextRef = useRef(null);
  const touchTimerRef = useRef(null);
  const touchStartPosRef = useRef({ x: 0, y: 0 });

  // 1. Close Menu
  const closeContextMenu = useCallback(() => {
    setMenuState(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
  }, []);

  // 2. Close AI Modal
  const closeAiModal = useCallback(() => {
    setAiModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // 3. Open Bastion Drawer (in Folio or DBM)
  const openBastionDrawer = useCallback((prefillPrompt = '') => {
    closeContextMenu();
    if (location.pathname.startsWith('/dbm')) {
      if (dbmContext?.setIsBastionOpen) {
        dbmContext.setIsBastionOpen(true);
      }
    } else {
      window.dispatchEvent(new CustomEvent('toggle-folio-bastion', { detail: { prompt: prefillPrompt } }));
    }
  }, [location.pathname, dbmContext, closeContextMenu]);

  // 4. Open AIME Workspace
  const openAimeWorkspace = useCallback((prefillPrompt = '') => {
    closeContextMenu();
    navigate(`/foundry/aime${prefillPrompt ? `?prompt=${encodeURIComponent(prefillPrompt)}` : ''}`);
  }, [navigate, closeContextMenu]);

  // 5. Execute BASTION Tactical AI Action
  const executeBastionPrompt = useCallback(async ({
    title = 'BASTION Tactical Directive',
    prompt,
    context = '',
    applyTarget = null,
    applyLabel = 'Apply to Dossier',
    isAutofill = false,
    targetEntry = null
  }) => {
    closeContextMenu();
    setAiModalState({
      isOpen: true,
      title,
      aiType: 'BASTION',
      promptSummary: prompt.slice(0, 100) + (prompt.length > 100 ? '...' : ''),
      targetContext: context,
      result: null,
      isLoading: true,
      error: null,
      applyLabel,
      onOpenDrawer: () => {
        closeAiModal();
        openBastionDrawer(prompt);
      },
      onRetry: () => executeBastionPrompt({ title, prompt, context, applyTarget, applyLabel, isAutofill, targetEntry })
    });

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        throw new Error('No Gemini API Key found. Configure your API key in Settings (⚙️) to activate BASTION Tactical AI.');
      }

      let generatedResult = '';

      if (isAutofill && targetEntry && dbmContext?.currentCategoryConfig) {
        // Use selective field generation
        const fields = await generateSelectiveFields({
          currentConfig: dbmContext.currentCategoryConfig,
          editFormData: targetEntry,
          targetFields: ['description', 'mechanic', 'guide', 'note']
        });
        generatedResult = fields;
      } else {
        const response = await sendBastionChatMessage({
          prompt,
          contextData: { context, pathname: location.pathname }
        });
        generatedResult = response.text || response;
      }

      setAiModalState(prev => ({
        ...prev,
        isLoading: false,
        result: generatedResult,
        onApply: applyTarget ? (res) => {
          if (applyTarget === 'bio' && folioContext?.updateIdentity) {
            folioContext.updateIdentity('concept', res);
          } else if (isAutofill && dbmContext?.saveEntry && targetEntry) {
            dbmContext.saveEntry({ ...targetEntry, ...generatedResult });
          }
        } : null
      }));
    } catch (err) {
      console.warn('[ContextMenu] BASTION directive error:', err);
      setAiModalState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'BASTION connection error'
      }));
    }
  }, [closeContextMenu, closeAiModal, openBastionDrawer, location.pathname, dbmContext, folioContext]);

  // 6. Execute AIME Narrative AI Action
  const executeAimePrompt = useCallback(async ({
    title = 'AIME Creative Directive',
    prompt,
    context = '',
    applyTarget = null,
    applyLabel = 'Apply to Scene'
  }) => {
    closeContextMenu();
    setAiModalState({
      isOpen: true,
      title,
      aiType: 'AIME',
      promptSummary: prompt.slice(0, 100) + (prompt.length > 100 ? '...' : ''),
      targetContext: context,
      result: null,
      isLoading: true,
      error: null,
      applyLabel,
      onOpenDrawer: () => {
        closeAiModal();
        openAimeWorkspace(prompt);
      },
      onRetry: () => executeAimePrompt({ title, prompt, context, applyTarget, applyLabel })
    });

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        throw new Error('No Gemini API Key found. Configure your API key in Settings (⚙️) to activate AIME Creative AI.');
      }

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${AIME_SYSTEM_PROMPT}\n\n[CONTEXT: ${context}]\n\nDIRECTIVE:\n${prompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 1024
        }
      };

      const response = await fetchGeminiContent(apiKey, requestBody);
      const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

      setAiModalState(prev => ({
        ...prev,
        isLoading: false,
        result: generatedText,
        onApply: applyTarget ? (res) => {
          if (applyTarget === 'selection') {
            window.dispatchEvent(new CustomEvent('aime-replace-selection', { detail: { text: res } }));
          }
        } : null
      }));
    } catch (err) {
      console.warn('[ContextMenu] AIME directive error:', err);
      setAiModalState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'AIME connection error'
      }));
    }
  }, [closeContextMenu, closeAiModal, openAimeWorkspace]);

  // 7. Core Dispatcher / Menu Opener
  const openContextMenu = useCallback((contextConfig) => {
    const appState = {
      pathname: location.pathname,
      folio: folioContext,
      dbm: dbmContext,
      campaign: campaignContext
    };

    const handlers = {
      // General
      activeOperative: folioContext?.activeOperative,
      currentCategoryConfig: dbmContext?.categoryConfig?.[dbmContext?.activeCategory] || dbmContext?.currentConfig,
      // BASTION Handlers
      executeBastionPrompt,
      openBastionDrawer,
      openBastionModal: (prompt) => {
        closeContextMenu();
        if (dbmContext?.setIsBastionOpen) dbmContext.setIsBastionOpen(true);
      },
      // AIME Handlers
      executeAimePrompt,
      openAimeWorkspace,
      // Folio Specific Handlers
      advanceSkill: (skillId) => {
        folioContext?.advanceSkillRank?.(skillId);
      },
      rollDice: (rollData) => {
        window.dispatchEvent(new CustomEvent('trigger-dice-roll', { detail: rollData }));
      },
      applyRest: (restType) => {
        window.dispatchEvent(new CustomEvent('apply-folio-rest', { detail: { type: restType } }));
      },
      // DBM Specific Handlers
      onEditEntry: (entry) => {
        window.dispatchEvent(new CustomEvent('dbm-edit-entry', { detail: entry }));
      },
      onDuplicateEntry: (entry) => {
        window.dispatchEvent(new CustomEvent('dbm-duplicate-entry', { detail: entry }));
      },
      onDeleteEntry: (id) => {
        dbmContext?.deleteEntry?.(id);
      },
      onCreateNew: () => {
        window.dispatchEvent(new CustomEvent('dbm-create-new'));
      },
      onExportCategory: () => {
        dbmContext?.handleExportMasterJSON?.();
      },
      // ADE Specific Handlers
      onEditNode: (nodeId) => {
        window.dispatchEvent(new CustomEvent('ade-edit-node', { detail: { id: nodeId } }));
      },
      onDeleteNode: (nodeId) => {
        window.dispatchEvent(new CustomEvent('ade-delete-node', { detail: { id: nodeId } }));
      },
      onCreateNode: () => {
        window.dispatchEvent(new CustomEvent('ade-create-node'));
      },
      onBranchNode: (nodeId) => {
        window.dispatchEvent(new CustomEvent('ade-branch-node', { detail: { id: nodeId } }));
      },
      // Stage Handlers
      applyCondition: (conditionName, tokenId) => {
        window.dispatchEvent(new CustomEvent('stage-apply-condition', { detail: { condition: conditionName, tokenId } }));
      },
      focusToken: (tokenId) => {
        window.dispatchEvent(new CustomEvent('stage-focus-token', { detail: { tokenId } }));
      },
      resetCamera: () => {
        window.dispatchEvent(new CustomEvent('stage-reset-camera'));
      }
    };

    activeContextRef.current = contextConfig;
    const resolved = resolveContextMenu(contextConfig, appState, handlers);

    setMenuState({
      isOpen: true,
      x: contextConfig.x,
      y: contextConfig.y,
      title: resolved.title,
      categoryBadge: resolved.categoryBadge,
      domain: resolved.domain,
      items: resolved.items
    });
  }, [
    location.pathname, 
    folioContext, 
    dbmContext, 
    campaignContext, 
    executeBastionPrompt, 
    openBastionDrawer, 
    executeAimePrompt, 
    openAimeWorkspace, 
    closeContextMenu
  ]);

  // 8. Global Context Menu Event Interception
  useEffect(() => {
    const handleGlobalContextMenu = (e) => {
      // Developer / Power-User Escape Hatch: Shift + Right Click bypasses custom menu!
      if (e.shiftKey) {
        return;
      }

      // Suppress native white browser context menu
      e.preventDefault();

      const target = e.target;
      const zoneEl = target.closest('[data-context-zone]');
      const categoryEl = target.closest('[data-context-category]');
      const entityEl = target.closest('[data-context-entity-id]');
      
      const selection = window.getSelection()?.toString().trim() || '';

      let parsedEntityData = null;
      if (entityEl?.dataset?.contextEntityData) {
        try {
          parsedEntityData = JSON.parse(entityEl.dataset.contextEntityData);
        } catch (err) {}
      }

      // Determine Subcategory if not in DOM attribute
      let subcategory = categoryEl?.dataset?.contextCategory;
      if (!subcategory) {
        if (location.pathname.startsWith('/folio')) {
          subcategory = folioContext?.activeTab || 'identity';
        } else if (location.pathname.startsWith('/dbm')) {
          subcategory = dbmContext?.activeCategory || 'compendium';
        } else if (location.pathname.startsWith('/foundry') || location.pathname.startsWith('/ade')) {
          subcategory = 'story';
        }
      }

      openContextMenu({
        x: e.clientX,
        y: e.clientY,
        zone: zoneEl?.dataset?.contextZone,
        subcategory,
        entityId: entityEl?.dataset?.contextEntityId,
        entityType: entityEl?.dataset?.contextEntityType,
        entityTitle: entityEl?.dataset?.contextEntityTitle || parsedEntityData?.name || parsedEntityData?.title,
        entityData: parsedEntityData,
        selectedText: selection,
        pathname: location.pathname,
        clickCoords: { x: e.clientX, y: e.clientY }
      });
    };

    // Close menu when clicking outside
    const handleGlobalOutsideClick = (e) => {
      // Do not close if clicking inside the context menu itself or an active modal/dialog
      if (
        e.target?.closest?.('[role="menu"]') || 
        e.target?.closest?.('[role="dialog"]') || 
        e.target?.closest?.('[data-ai-action-modal]')
      ) {
        return;
      }
      closeContextMenu();
    };

    // Mobile / Tablet Long-Press Support (500ms hold)
    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

      touchTimerRef.current = setTimeout(() => {
        handleGlobalContextMenu({
          preventDefault: () => {},
          clientX: touch.clientX,
          clientY: touch.clientY,
          target: touch.target,
          shiftKey: false
        });
      }, 550);
    };

    const handleTouchMove = (e) => {
      if (!touchTimerRef.current) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    const handleTouchEnd = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    window.addEventListener('contextmenu', handleGlobalContextMenu);
    window.addEventListener('pointerdown', handleGlobalOutsideClick, true);
    window.addEventListener('click', handleGlobalOutsideClick, true);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
      window.removeEventListener('pointerdown', handleGlobalOutsideClick, true);
      window.removeEventListener('click', handleGlobalOutsideClick, true);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, [location.pathname, folioContext, dbmContext, openContextMenu, closeContextMenu]);

  return (
    <ContextMenuContext.Provider value={{
      openContextMenu,
      closeContextMenu,
      executeBastionPrompt,
      executeAimePrompt,
      openBastionDrawer,
      openAimeWorkspace
    }}>
      {children}

      {/* Floating Cyberpunk HUD Context Menu */}
      <ContextMenu
        isOpen={menuState.isOpen}
        onClose={closeContextMenu}
        x={menuState.x}
        y={menuState.y}
        title={menuState.title}
        categoryBadge={menuState.categoryBadge}
        domain={menuState.domain}
        items={menuState.items}
        onItemClick={(item) => {
          item.onClick?.();
        }}
      />

      {/* Embedded BASTION / AIME Copilot Modal */}
      <AiActionModal
        isOpen={aiModalState.isOpen}
        onClose={closeAiModal}
        title={aiModalState.title}
        aiType={aiModalState.aiType}
        promptSummary={aiModalState.promptSummary}
        targetContext={aiModalState.targetContext}
        result={aiModalState.result}
        isLoading={aiModalState.isLoading}
        error={aiModalState.error}
        onApply={aiModalState.onApply}
        onRetry={aiModalState.onRetry}
        onOpenDrawer={aiModalState.onOpenDrawer}
        applyLabel={aiModalState.applyLabel}
      />
    </ContextMenuContext.Provider>
  );
};

export default ContextMenuProvider;
