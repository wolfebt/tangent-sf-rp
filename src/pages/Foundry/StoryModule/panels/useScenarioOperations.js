/**
 * @file useScenarioOperations.js
 * @description Hook managing scenario editing operations: content debouncing, title changes,
 * element creation/deletion, element linking, and @mention insertions.
 */

import { useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { confirmTypedDeletion } from '../../../../utils/confirmationUtils';

export function useScenarioOperations({
  activeScenarioId,
  activeNode,
  updateStory,
  deleteStory,
  addStory,
  setActiveScenarioId,
  localContent,
  setLocalContent,
  isStoryReadOnly = false,
  elementsCatalog = []
}) {
  const debounceTimerRef = useRef(null);
  const pendingFlushRef = useRef(null);

  useEffect(() => {
    // Cancel pending debounced write from prior scenario before switching activeNode
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      if (pendingFlushRef.current) {
        const { targetId, val } = pendingFlushRef.current;
        pendingFlushRef.current = null;
        if (!isStoryReadOnly && targetId) {
          updateStory(targetId, { content: val });
        }
      }
    }
    if (activeNode && activeNode.content !== localContent) {
      setLocalContent(activeNode.content || '');
    } else if (!activeNode) {
      setLocalContent('');
    }
  }, [activeScenarioId, activeNode?.content]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleContentChange = (val) => {
    if (isStoryReadOnly) return;
    setLocalContent(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const targetId = activeScenarioId;
    pendingFlushRef.current = targetId ? { targetId, val } : null;
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      pendingFlushRef.current = null;
      if (!isStoryReadOnly && targetId) {
        updateStory(targetId, { content: val });
      }
    }, 300);
  };

  const handleTitleChange = (e) => {
    if (isStoryReadOnly) return;
    if (activeScenarioId) {
      updateStory(activeScenarioId, { title: e.target.value });
    }
  };

  const handleAddElement = ({ type, title, parentId, customFields, fields, imageUrl }) => {
    if (isStoryReadOnly) return;
    const newNode = {
      id: uuidv4(),
      type,
      title,
      content: '',
      fields: fields || {},
      imageUrl: imageUrl || '',
      customFields: customFields || [],
      linkedElements: [],
      assetHub: [],
      children: []
    };
    addStory(newNode, parentId);
    setActiveScenarioId(newNode.id);
  };

  const handleDeleteElement = async (id, title) => {
    if (isStoryReadOnly) return;
    const ok = await confirmTypedDeletion(title || 'story element', 'story element');
    if (ok) {
      deleteStory(id);
    }
  };

  const buildSynchronizedLinks = (node, elemId, forceAdd = false) => {
    const existingLinked = Array.isArray(node?.linkedElements) ? node.linkedElements : [];
    const existingHub = Array.isArray(node?.assetHub) ? node.assetHub : [];
    const isPresent =
      existingLinked.includes(elemId) ||
      existingHub.some((entry) => (typeof entry === 'string' ? entry === elemId : entry?.assetId === elemId));

    if (isPresent && !forceAdd) {
      return {
        linkedElements: existingLinked.filter((id) => id !== elemId),
        assetHub: existingHub.filter((entry) => (typeof entry === 'string' ? entry !== elemId : entry?.assetId !== elemId))
      };
    }

    const catalogMatch = (elementsCatalog || []).find((el) => el && el.id === elemId);
    const nextLinked = existingLinked.includes(elemId) ? existingLinked : [...existingLinked, elemId];
    const alreadyInHub = existingHub.some((entry) => (typeof entry === 'string' ? entry === elemId : entry?.assetId === elemId));
    const nextHub = alreadyInHub
      ? existingHub
      : [
          ...existingHub,
          catalogMatch
            ? {
                assetId: elemId,
                assetTitle: catalogMatch.title || catalogMatch.name || 'Untitled',
                assetType: catalogMatch.type || 'Element',
                importance: 'typical',
                annotation: ''
              }
            : elemId
        ];
    return {
      linkedElements: nextLinked,
      assetHub: nextHub
    };
  };

  const handleInsertMention = (elem) => {
    if (isStoryReadOnly || !elem) return;
    const cleanTitle = (elem.title || 'Untitled').replace(/["'<>]/g, '');
    const chipHtml = `<span class="tangent-entity-chip bg-cyan-900/60 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40 font-semibold" data-entity-id="${elem.id}" data-entity-type="${elem.type || 'Custom'}">@${cleanTitle}</span>&nbsp;`;
    const updatedContent = localContent ? `${localContent} ${chipHtml}` : chipHtml;
    setLocalContent(updatedContent);
    if (activeScenarioId) {
      const synced = buildSynchronizedLinks(activeNode, elem.id, true);
      updateStory(activeScenarioId, {
        content: updatedContent,
        ...synced
      });
    }
  };

  const handleToggleLinkElement = (elemId) => {
    if (isStoryReadOnly || !activeScenarioId || !elemId) return;
    const synced = buildSynchronizedLinks(activeNode, elemId, false);
    updateStory(activeScenarioId, synced);
  };

  return {
    handleContentChange,
    handleTitleChange,
    handleAddElement,
    handleDeleteElement,
    handleInsertMention,
    handleToggleLinkElement
  };
}
