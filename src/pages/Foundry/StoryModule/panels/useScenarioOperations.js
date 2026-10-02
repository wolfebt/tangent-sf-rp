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
  setLocalContent
}) {
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (activeNode && activeNode.content !== localContent) {
      setLocalContent(activeNode.content || '');
    } else if (!activeNode) {
      setLocalContent('');
    }
  }, [activeScenarioId, activeNode?.content]);

  const handleContentChange = (val) => {
    setLocalContent(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (activeScenarioId) {
        updateStory(activeScenarioId, { content: val });
      }
    }, 300);
  };

  const handleTitleChange = (e) => {
    if (activeScenarioId) {
      updateStory(activeScenarioId, { title: e.target.value });
    }
  };

  const handleAddElement = ({ type, title, parentId, customFields, fields, imageUrl }) => {
    const newNode = {
      id: uuidv4(),
      type,
      title,
      content: '',
      fields: fields || {},
      imageUrl: imageUrl || '',
      customFields: customFields || [],
      children: []
    };
    addStory(newNode, parentId);
    setActiveScenarioId(newNode.id);
  };

  const handleDeleteElement = async (id, title) => {
    const ok = await confirmTypedDeletion(title || 'story element', 'story element');
    if (ok) {
      deleteStory(id);
    }
  };

  const handleInsertMention = (elem) => {
    if (!elem) return;
    const cleanTitle = (elem.title || 'Untitled').replace(/["'<>]/g, '');
    const chipHtml = `<span class="tangent-entity-chip bg-cyan-900/60 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40 font-semibold" data-entity-id="${elem.id}" data-entity-type="${elem.type || 'Custom'}">@${cleanTitle}</span>&nbsp;`;
    const updatedContent = localContent ? `${localContent} ${chipHtml}` : chipHtml;
    setLocalContent(updatedContent);
    if (activeScenarioId) {
      const currentLinked = Array.isArray(activeNode?.linkedElements) ? activeNode.linkedElements : [];
      updateStory(activeScenarioId, { 
        content: updatedContent,
        linkedElements: Array.from(new Set([...currentLinked, elem.id]))
      });
    }
  };

  const handleToggleLinkElement = (elemId) => {
    if (!activeScenarioId) return;
    const currentLinked = Array.isArray(activeNode?.linkedElements) ? activeNode.linkedElements : [];
    const updated = currentLinked.includes(elemId)
      ? currentLinked.filter(id => id !== elemId)
      : [...currentLinked, elemId];
    updateStory(activeScenarioId, { linkedElements: updated });
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
