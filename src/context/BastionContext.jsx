import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCampaign } from './CampaignContext';
import { useFolio } from './FolioContext';
import { useSquad } from './SquadContext';
import {
  DEFAULT_PREVIEW_CONFIG,
  resolveBastionSessionState,
  resolveBastionThreadKey,
} from '../services/bastionSessionService';

const PREVIEW_STORAGE_KEY = 'bastion_preview_config_v1';
const THREADS_STORAGE_KEY = 'tangent_bastion_threads_v2';

function loadPreviewConfig() {
  try {
    const raw = sessionStorage.getItem(PREVIEW_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREVIEW_CONFIG };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREVIEW_CONFIG, ...(parsed || {}) };
  } catch {
    return { ...DEFAULT_PREVIEW_CONFIG };
  }
}

function loadThreadsByKey() {
  try {
    const raw = localStorage.getItem(THREADS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export const BastionContext =
  globalThis.__TANGENT_BASTION_CONTEXT__ ||
  (globalThis.__TANGENT_BASTION_CONTEXT__ = createContext(null));

export const useBastion = () => {
  const ctx = useContext(BastionContext);
  return ctx || {};
};

export const BastionProvider = ({
  children,
  isDrawerOpen: controlledIsOpen,
  onDrawerOpenChange,
}) => {
  const auth = useAuth() || {};
  const campaign = useCampaign() || {};
  const folio = useFolio() || {};
  const squad = useSquad() || {};
  const location = useLocation();

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const setOpen = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(isOpen) : Boolean(next);
      if (typeof onDrawerOpenChange === 'function') {
        onDrawerOpenChange(resolved);
      } else {
        setInternalOpen(resolved);
      }
    },
    [isOpen, onDrawerOpenChange]
  );

  const [activeDrawerTab, setActiveDrawerTab] = useState('chat');
  const [queuedPrompt, setQueuedPrompt] = useState(null);
  const [previewConfig, setPreviewConfigState] = useState(loadPreviewConfig);

  // Merged Surface Context Registry (DBM, Folio, Foundry, Compendium, VTT)
  const [registeredSurfaces, setRegisteredSurfaces] = useState({});

  // Scoped conversation threads keyed by resolveBastionThreadKey(sessionState)
  const [threadsByKey, setThreadsByKey] = useState(loadThreadsByKey);

  useEffect(() => {
    try {
      localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threadsByKey));
    } catch {}
  }, [threadsByKey]);

  const setPreviewConfig = useCallback((updater) => {
    setPreviewConfigState((prev) => {
      const next = {
        ...DEFAULT_PREVIEW_CONFIG,
        ...(typeof updater === 'function' ? updater(prev) : updater),
      };
      try {
        sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleOperatorPreview = useCallback(
    (forceValue) => {
      setPreviewConfig((prev) => {
        const nextEnabled =
          typeof forceValue === 'boolean' ? forceValue : !prev.enabled;
        return {
          ...prev,
          enabled: nextEnabled,
          mode: nextEnabled ? 'operator_preview' : 'auto',
        };
      });
    },
    [setPreviewConfig]
  );

  const setFocusGroupId = useCallback(
    (groupId) => {
      setPreviewConfig((prev) => ({
        ...prev,
        focusGroupId: groupId || 'all',
        ...(prev.enabled && groupId && groupId !== 'all'
          ? { previewGroupId: groupId }
          : {}),
      }));
    },
    [setPreviewConfig]
  );

  const setPreviewGroupId = useCallback(
    (groupId) => {
      setPreviewConfig((prev) => ({
        ...prev,
        previewGroupId: groupId || null,
        previewPersonaId: null,
      }));
    },
    [setPreviewConfig]
  );

  const setPreviewPersonaId = useCallback(
    (personaId) => {
      setPreviewConfig((prev) => ({
        ...prev,
        previewPersonaId: personaId || null,
      }));
    },
    [setPreviewConfig]
  );

  const registerSurfaceContext = useCallback((surfaceId, payload) => {
    if (!surfaceId) return;
    setRegisteredSurfaces((prev) => ({
      ...prev,
      [surfaceId]: {
        surfaceId,
        updatedAt: Date.now(),
        ...(payload || {}),
      },
    }));
  }, []);

  const unregisterSurfaceContext = useCallback((surfaceId) => {
    if (!surfaceId) return;
    setRegisteredSurfaces((prev) => {
      if (!prev[surfaceId]) return prev;
      const copy = { ...prev };
      delete copy[surfaceId];
      return copy;
    });
  }, []);

  // Determine the highest-priority active workspace surface matching the current route
  const activeSurface = useMemo(() => {
    const entries = Object.values(registeredSurfaces);
    if (entries.length === 0) return null;
    const path = String(location?.pathname || '').toLowerCase();
    const routeMatch = entries.find((s) => {
      if (path.startsWith('/dbm') && s.surfaceType === 'dbm') return true;
      if (path.startsWith('/folio') && s.surfaceType === 'folio') return true;
      if (path.startsWith('/foundry') && s.surfaceType === 'foundry') return true;
      if (path.startsWith('/compendium') && s.surfaceType === 'compendium') return true;
      if ((path.startsWith('/stage') || path.startsWith('/vtt')) && s.surfaceType === 'vtt') return true;
      return false;
    });
    if (routeMatch) return routeMatch;
    return entries.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || null;
  }, [registeredSurfaces, location?.pathname]);

  const sessionState = useMemo(
    () =>
      resolveBastionSessionState({
        currentUser: auth.currentUser || campaign.currentUser || null,
        authState: auth,
        universeState: campaign.universeState || null,
        isStoryReadOnly: Boolean(campaign.isStoryReadOnly),
        groups: squad.groups || [],
        activeGroupId: squad.activeGroup?.id || null,
        activePersona: folio.activePersona || folio.characterData || null,
        personaRoster: folio.personaRoster || folio.roster || [],
        routePath: location?.pathname || '',
        defaultRouteRole: activeSurface?.defaultRouteRole || null,
        previewConfig,
      }),
    [
      auth,
      campaign.currentUser,
      campaign.universeState,
      campaign.isStoryReadOnly,
      squad.groups,
      squad.activeGroup?.id,
      folio.activePersona,
      folio.characterData,
      folio.personaRoster,
      folio.roster,
      location?.pathname,
      activeSurface?.defaultRouteRole,
      previewConfig,
    ]
  );

  const activeThreadKey = useMemo(
    () => resolveBastionThreadKey(sessionState),
    [sessionState]
  );

  // Publish lightweight snapshot for non-React callers (e.g. ContextMenu resolvers)
  useEffect(() => {
    globalThis.__TANGENT_BASTION_SESSION__ = {
      ...sessionState,
      activeThreadKey,
      activeSurface: activeSurface
        ? {
            surfaceType: activeSurface.surfaceType,
            activeCategory: activeSurface.activeCategory,
            title:
              activeSurface.selectedItem?.name ||
              activeSurface.selectedItem?.title ||
              activeSurface.elementContext?.title ||
              null,
          }
        : null,
    };
  }, [sessionState, activeThreadKey, activeSurface]);

  const openBastion = useCallback(
    (options = {}) => {
      if (options.tab) setActiveDrawerTab(options.tab);
      if (options.prompt) {
        setQueuedPrompt({
          text: options.prompt,
          autoSend: options.autoSend !== false,
          timestamp: Date.now(),
        });
        setActiveDrawerTab('chat');
      }
      setOpen(true);
    },
    [setOpen]
  );

  const closeBastion = useCallback(() => setOpen(false), [setOpen]);
  const toggleBastion = useCallback(() => setOpen((prev) => !prev), [setOpen]);

  const consumeQueuedPrompt = useCallback(() => {
    setQueuedPrompt(null);
  }, []);

  // Listen to global custom events so legacy callers (`open-bastion-drawer`, `toggle-folio-bastion`)
  // seamlessly route prompts and tabs into the unified BASTION instance.
  useEffect(() => {
    const handleEvent = (e) => {
      const detail = e?.detail || {};
      if (detail.tab) setActiveDrawerTab(detail.tab);
      if (detail.prompt) {
        setQueuedPrompt({
          text: detail.prompt,
          autoSend: detail.autoSend !== false,
          timestamp: Date.now(),
        });
        setActiveDrawerTab('chat');
      }
    };
    window.addEventListener('toggle-folio-bastion', handleEvent);
    window.addEventListener('toggle-bastion-drawer', handleEvent);
    window.addEventListener('open-bastion-drawer', handleEvent);
    return () => {
      window.removeEventListener('toggle-folio-bastion', handleEvent);
      window.removeEventListener('toggle-bastion-drawer', handleEvent);
      window.removeEventListener('open-bastion-drawer', handleEvent);
    };
  }, []);

  const getThreadMessages = useCallback(
    (threadKey = activeThreadKey) => threadsByKey[threadKey] || [],
    [threadsByKey, activeThreadKey]
  );

  const setThreadMessages = useCallback(
    (updater, threadKey = activeThreadKey) => {
      setThreadsByKey((prev) => {
        const current = prev[threadKey] || [];
        const next = typeof updater === 'function' ? updater(current) : updater;
        return {
          ...prev,
          [threadKey]: Array.isArray(next) ? next : [],
        };
      });
    },
    [activeThreadKey]
  );

  const clearThreadMessages = useCallback(
    (threadKey = activeThreadKey) => {
      setThreadsByKey((prev) => {
        const copy = { ...prev };
        delete copy[threadKey];
        return copy;
      });
    },
    [activeThreadKey]
  );

  const value = useMemo(
    () => ({
      isOpen,
      openBastion,
      closeBastion,
      toggleBastion,
      activeDrawerTab,
      setActiveDrawerTab,
      queuedPrompt,
      consumeQueuedPrompt,
      previewConfig,
      setPreviewConfig,
      toggleOperatorPreview,
      setFocusGroupId,
      setPreviewGroupId,
      setPreviewPersonaId,
      sessionState,
      activeThreadKey,
      threadsByKey,
      getThreadMessages,
      setThreadMessages,
      clearThreadMessages,
      activeSurface,
      registeredSurfaces,
      registerSurfaceContext,
      unregisterSurfaceContext,
    }),
    [
      isOpen,
      openBastion,
      closeBastion,
      toggleBastion,
      activeDrawerTab,
      queuedPrompt,
      consumeQueuedPrompt,
      previewConfig,
      setPreviewConfig,
      toggleOperatorPreview,
      setFocusGroupId,
      setPreviewGroupId,
      setPreviewPersonaId,
      sessionState,
      activeThreadKey,
      threadsByKey,
      getThreadMessages,
      setThreadMessages,
      clearThreadMessages,
      activeSurface,
      registeredSurfaces,
      registerSurfaceContext,
      unregisterSurfaceContext,
    ]
  );

  return (
    <BastionContext.Provider value={value}>{children}</BastionContext.Provider>
  );
};

export default BastionProvider;
