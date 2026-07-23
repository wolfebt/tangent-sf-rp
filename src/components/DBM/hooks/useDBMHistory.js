import { useState, useCallback } from 'react';

export const useDBMHistory = (initialCategory = 'rules_codex', onNavigate) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [history, setHistory] = useState([initialCategory]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const navigateToCategory = useCallback((catKey, subKey = null) => {
    setActiveCategory(catKey);
    setActiveSubcategory(subKey);
    
    if (onNavigate) {
      onNavigate();
    }

    setHistory(prevHistory => {
      const nextHistory = prevHistory.slice(0, historyIndex + 1);
      nextHistory.push(subKey ? `${catKey}:${subKey}` : catKey);
      setHistoryIndex(nextHistory.length - 1);
      return nextHistory;
    });
  }, [historyIndex, onNavigate]);

  const handleBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const target = history[prevIdx];
      setHistoryIndex(prevIdx);
      if (target.includes(':')) {
        const [cat, sub] = target.split(':');
        setActiveCategory(cat);
        setActiveSubcategory(sub);
      } else {
        setActiveCategory(target);
        setActiveSubcategory(null);
      }
    }
  }, [history, historyIndex]);

  const handleForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const target = history[nextIdx];
      setHistoryIndex(nextIdx);
      if (target.includes(':')) {
        const [cat, sub] = target.split(':');
        setActiveCategory(cat);
        setActiveSubcategory(sub);
      } else {
        setActiveCategory(target);
        setActiveSubcategory(null);
      }
    }
  }, [history, historyIndex]);

  return {
    activeCategory,
    setActiveCategory,
    activeSubcategory,
    setActiveSubcategory,
    history,
    historyIndex,
    navigateToCategory,
    handleBack,
    handleForward
  };
};
