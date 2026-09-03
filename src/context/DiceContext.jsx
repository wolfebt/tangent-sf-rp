import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DiceContext = createContext();

export const useDice = () => {
  const context = useContext(DiceContext);
  if (!context) {
    throw new Error('useDice must be used within a DiceProvider');
  }
  return context;
};

export const DiceProvider = ({ children }) => {
  const [isDiceOpen, setIsDiceOpen] = useState(false);
  const [diceConfig, setDiceConfig] = useState({
    label: '',
    expression: '2d10',
    baseModifier: 0,
    adHocModifier: 0,
    targetNumber: '',
    rollMode: 'normal', // 'normal', 'advantage', 'disadvantage'
    characterName: '',
    targetChannelId: null
  });

  const openDiceRoller = useCallback((config = {}) => {
    const rollId = config.rollId || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setDiceConfig(prev => {
      const baseMod = config.baseModifier !== undefined ? Number(config.baseModifier) || 0 : (config.modifier !== undefined ? Number(config.modifier) || 0 : 0);
      const adHocMod = config.adHocModifier !== undefined ? Number(config.adHocModifier) || 0 : 0;
      
      // If expression is provided, use it; otherwise compute 2d10 + totalMod
      let expr = config.expression;
      if (!expr) {
        const totalMod = baseMod + adHocMod;
        expr = totalMod !== 0 ? `2d10${totalMod > 0 ? '+' : ''}${totalMod}` : '2d10';
      }

      return {
        ...prev,
        label: config.label || 'Action Check',
        expression: expr,
        baseModifier: baseMod,
        adHocModifier: adHocMod,
        targetNumber: config.targetNumber !== undefined ? config.targetNumber : '',
        rollMode: config.rollMode || 'normal',
        characterName: config.characterName || prev.characterName || 'Operative',
        targetChannelId: config.targetChannelId || null,
        autoRoll: config.autoRoll !== undefined ? !!config.autoRoll : false,
        rollId,
        timestamp: Date.now()
      };
    });
    setIsDiceOpen(true);
  }, []);

  const closeDiceRoller = useCallback(() => {
    setIsDiceOpen(false);
  }, []);

  const toggleDiceRoller = useCallback(() => {
    setIsDiceOpen(prev => !prev);
  }, []);

  // Global window event listener to support window.dispatchEvent(new CustomEvent('open-dice-roller', { detail: { ... } }))
  useEffect(() => {
    const handleOpenEvent = (e) => {
      if (e.detail) {
        openDiceRoller(e.detail);
      } else {
        setIsDiceOpen(true);
      }
    };

    const handleToggleEvent = () => {
      setIsDiceOpen(prev => !prev);
    };

    window.addEventListener('open-dice-roller', handleOpenEvent);
    window.addEventListener('toggle-dice-dock', handleToggleEvent);

    return () => {
      window.removeEventListener('open-dice-roller', handleOpenEvent);
      window.removeEventListener('toggle-dice-dock', handleToggleEvent);
    };
  }, [openDiceRoller]);

  const value = {
    isDiceOpen,
    setIsDiceOpen,
    diceConfig,
    setDiceConfig,
    openDiceRoller,
    closeDiceRoller,
    toggleDiceRoller
  };

  return (
    <DiceContext.Provider value={value}>
      {children}
    </DiceContext.Provider>
  );
};

export default DiceContext;
