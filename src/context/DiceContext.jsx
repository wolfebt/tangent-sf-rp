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
    flatModifier: 0,      // Clamped [-20, 20]
    advantageDice: 0,     // Clamped [-5, 5]
    critRangeSize: 1,     // Clamped [1, 5]
    fumbleRangeSize: 1,   // Clamped [1, 5]
    targetNumber: '',
    targetDC: '',
    rollMode: 'normal',   // 'normal', 'advantage', 'disadvantage'
    characterName: '',
    targetChannelId: null
  });

  const openDiceRoller = useCallback((config = {}) => {
    const rollId = config.rollId || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setDiceConfig(prev => {
      const baseMod = config.baseModifier !== undefined ? Number(config.baseModifier) || 0 : (config.modifier !== undefined ? Number(config.modifier) || 0 : 0);
      const adHocMod = config.adHocModifier !== undefined ? Number(config.adHocModifier) || 0 : 0;
      const rawFlatMod = config.flatModifier !== undefined ? Number(config.flatModifier) || 0 : (baseMod + adHocMod);
      const clampedFlatModifier = Math.max(-20, Math.min(20, rawFlatMod));

      // Separate advantageDice (-5 to 5)
      let advDice = 0;
      if (config.advantageDice !== undefined) {
        advDice = Number(config.advantageDice) || 0;
      } else if (config.rollMode === 'advantage' || config.advantage) {
        advDice = 1;
      } else if (config.rollMode === 'disadvantage' || config.disadvantage) {
        advDice = -1;
      }
      const clampedAdvantage = Math.max(-5, Math.min(5, advDice));

      const clampedCritSize = Math.max(1, Math.min(5, Number(config.critRangeSize) || 1));
      const clampedFumbleSize = Math.max(1, Math.min(5, Number(config.fumbleRangeSize) || 1));
      
      // If expression is provided, use it; otherwise compute 2d10 + totalMod
      let expr = config.expression;
      if (!expr) {
        expr = clampedFlatModifier !== 0 ? `2d10${clampedFlatModifier > 0 ? '+' : ''}${clampedFlatModifier}` : '2d10';
      }

      const rMode = config.rollMode || (clampedAdvantage > 0 ? 'advantage' : clampedAdvantage < 0 ? 'disadvantage' : 'normal');

      return {
        ...prev,
        label: config.label || 'Action Check',
        expression: expr,
        baseModifier: baseMod,
        adHocModifier: adHocMod,
        flatModifier: clampedFlatModifier,
        advantageDice: clampedAdvantage,
        critRangeSize: clampedCritSize,
        fumbleRangeSize: clampedFumbleSize,
        targetNumber: config.targetNumber !== undefined ? config.targetNumber : (config.targetDC !== undefined ? config.targetDC : ''),
        targetDC: config.targetDC !== undefined ? config.targetDC : (config.targetNumber !== undefined ? config.targetNumber : ''),
        rollMode: rMode,
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
