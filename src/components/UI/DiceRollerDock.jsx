import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Dices, 
  X, 
  Target, 
  RotateCcw, 
  Radio, 
  Shield, 
  Users, 
  Globe, 
  Hash, 
  Sparkles, 
  Scale, 
  Flame, 
  Skull,
  ChevronDown,
  ChevronUp,
  Tag,
  Bookmark,
  BookmarkPlus,
  Trash2,
  Maximize2,
  Minimize2,
  GripHorizontal,
  VolumeX,
  Check
} from 'lucide-react';
import { TwoD10Icon } from './TwoD10Icon';
import { rollDice, targetDCs, parseDiceExpression } from '../../services/diceService';
import { AudioService } from '../../services/audioService';
import { useChat } from '../../context/ChatContext';
import { useDice } from '../../context/DiceContext';
import { useSquad } from '../../context/SquadContext';
import { PersonaLogService, ACTION_TYPES } from '../../services/personaLogService';

const PRESET_DICE = [
  { label: 'd4', expr: '1d4' },
  { label: 'd6', expr: '1d6' },
  { label: 'd8', expr: '1d8' },
  { label: 'd10', expr: '1d10' },
  { label: 'd12', expr: '1d12' },
  { label: 'd20', expr: '1d20' },
  { label: '2d10', expr: '2d10' }
];

export const DiceRollerDock = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { isDiceOpen, closeDiceRoller, diceConfig } = useDice();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isDiceOpen;
  const onClose = propOnClose || closeDiceRoller;

  const { 
    sendDiceRoll, 
    activeChannel, 
    activeChannelId, 
    groupChannels, 
    publicChannels, 
    customChannels, 
    directChannels, 
    channels 
  } = useChat();

  const { activeGroup, groups } = useSquad() || {};

  const [checkLabel, setCheckLabel] = useState('');
  const [baseModifier, setBaseModifier] = useState(0);
  const [adHocModifier, setAdHocModifier] = useState(0);
  
  // Clamped Dice Pool Engine States
  const [advantageDice, setAdvantageDice] = useState(0); // Clamped -5 to +5
  const [critRangeSize, setCritRangeSize] = useState(1); // Clamped 1 to 5 (threshold: 21 - critRangeSize)
  const [fumbleRangeSize, setFumbleRangeSize] = useState(1); // Clamped 1 to 5 (threshold: 1 + fumbleRangeSize)
  const [targetDC, setTargetDC] = useState('');
  const [showCustomRollAccordion, setShowCustomRollAccordion] = useState(false);

  const STORAGE_KEY_HISTORY = 'tangent_dice_roller_history';
  const STORAGE_KEY_LATEST = 'tangent_dice_roller_latest';

  const [customExpr, setCustomExpr] = useState('2d10');
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [latestRoll, setLatestRoll] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LATEST);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const outputBlockRef = useRef(null);
  const STORAGE_KEY_POS = 'tangent_dice_roller_pos';
  const STORAGE_KEY_SIZE = 'tangent_dice_roller_size';

  const HEADER_BAR_OFFSET = 58; // GlobalHUD navbar height is 52px; ensures modal never creeps into or behind header bar

  const getDefaultModalGeometry = () => {
    if (typeof window === 'undefined') {
      return {
        pos: { x: 40, y: HEADER_BAR_OFFSET + 8 },
        size: { width: 900, height: 720 }
      };
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    if (winW < 768) {
      return {
        pos: { x: 8, y: HEADER_BAR_OFFSET },
        size: { width: Math.max(320, winW - 16), height: Math.max(360, winH - HEADER_BAR_OFFSET - 20) }
      };
    }

    const maxModalH = Math.max(360, winH - HEADER_BAR_OFFSET - 24);
    const width = Math.min(920, Math.max(540, winW - 48));
    const height = Math.min(740, maxModalH);
    const x = Math.max(16, (winW - width) / 2);
    const y = Math.max(HEADER_BAR_OFFSET + 6, Math.min(winH - height - 16, Math.max(HEADER_BAR_OFFSET + 6, (winH - height) / 2)));

    return {
      pos: { x, y },
      size: { width, height }
    };
  };

  const [position, setPosition] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_POS);
      if (stored) {
        const p = JSON.parse(stored);
        if (typeof p?.x === 'number' && typeof p?.y === 'number') {
          const winW = typeof window !== 'undefined' ? window.innerWidth : 1280;
          const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
          return {
            x: Math.max(8, Math.min(winW - 100, p.x)),
            y: Math.max(HEADER_BAR_OFFSET, Math.min(winH - 80, p.y))
          };
        }
      }
    } catch {}
    return null;
  });

  const [size, setSize] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SIZE);
      if (stored) {
        const s = JSON.parse(stored);
        if (typeof s?.width === 'number' && typeof s?.height === 'number') return s;
      }
    } catch {}
    return null;
  });

  const [isMaximized, setIsMaximized] = useState(false);
  const modalRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initX: 0, initY: 0, width: 0, height: 0 });
  const resizeRef = useRef({ isResizing: false, direction: '', startX: 0, startY: 0, initW: 0, initH: 0, initX: 0, initY: 0 });

  // Clamp and ensure geometry is valid when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const def = getDefaultModalGeometry();

    setPosition(prev => {
      if (!prev) return def.pos;
      const curW = size?.width || def.size.width;
      const curH = size?.height || def.size.height;
      return {
        x: Math.max(8, Math.min(window.innerWidth - curW - 8, prev.x)),
        y: Math.max(HEADER_BAR_OFFSET, Math.min(window.innerHeight - 50, prev.y))
      };
    });

    setSize(prev => {
      if (!prev) return def.size;
      return {
        width: Math.max(340, Math.min(window.innerWidth - 16, prev.width)),
        height: Math.max(360, Math.min(window.innerHeight - 24, prev.height))
      };
    });
  }, [isOpen]);

  // Adjust on browser window resize
  useEffect(() => {
    const handleWindowResize = () => {
      setPosition(prev => {
        if (!prev) return null;
        const curW = size?.width || 900;
        return {
          x: Math.max(8, Math.min(window.innerWidth - curW - 8, prev.x)),
          y: Math.max(HEADER_BAR_OFFSET, Math.min(window.innerHeight - 50, prev.y))
        };
      });
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [size]);

  // Persist position and size
  useEffect(() => {
    if (position && !isMaximized) {
      try {
        localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(position));
      } catch {}
    }
  }, [position, isMaximized]);

  useEffect(() => {
    if (size && !isMaximized) {
      try {
        localStorage.setItem(STORAGE_KEY_SIZE, JSON.stringify(size));
      } catch {}
    }
  }, [size, isMaximized]);

  const handleResetPositionAndSize = (e) => {
    e?.stopPropagation();
    setIsMaximized(false);
    const def = getDefaultModalGeometry();
    setPosition(def.pos);
    setSize(def.size);
    try {
      localStorage.removeItem(STORAGE_KEY_POS);
      localStorage.removeItem(STORAGE_KEY_SIZE);
    } catch {}
  };

  const handleDragStart = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('button, input, select, a, textarea')) return;
    if (isMaximized) return;

    const modalEl = modalRef.current;
    if (!modalEl) return;
    const rect = modalEl.getBoundingClientRect();

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initX: rect.left,
      initY: rect.top,
      width: rect.width,
      height: rect.height
    };

    const handlePointerMove = (ev) => {
      if (!dragRef.current.isDragging) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;

      const newX = Math.max(8, Math.min(window.innerWidth - dragRef.current.width - 8, dragRef.current.initX + dx));
      const newY = Math.max(HEADER_BAR_OFFSET, Math.min(window.innerHeight - 50, dragRef.current.initY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      if (dragRef.current.isDragging) {
        dragRef.current.isDragging = false;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMaximized) return;

    const modalEl = modalRef.current;
    if (!modalEl) return;
    const rect = modalEl.getBoundingClientRect();

    resizeRef.current = {
      isResizing: true,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initW: rect.width,
      initH: rect.height,
      initX: rect.left,
      initY: rect.top
    };

    const minW = 340;
    const minH = 360;

    const handlePointerMove = (ev) => {
      if (!resizeRef.current.isResizing) return;
      const dx = ev.clientX - resizeRef.current.startX;
      const dy = ev.clientY - resizeRef.current.startY;
      const dir = resizeRef.current.direction;

      let newW = resizeRef.current.initW;
      let newH = resizeRef.current.initH;
      let newX = resizeRef.current.initX;
      let newY = resizeRef.current.initY;

      if (dir.includes('right')) {
        newW = Math.max(minW, Math.min(window.innerWidth - resizeRef.current.initX - 8, resizeRef.current.initW + dx));
      }
      if (dir.includes('bottom')) {
        newH = Math.max(minH, Math.min(window.innerHeight - resizeRef.current.initY - 8, resizeRef.current.initH + dy));
      }
      if (dir.includes('left')) {
        const candidateW = resizeRef.current.initW - dx;
        if (candidateW >= minW && resizeRef.current.initX + dx >= 0) {
          newW = candidateW;
          newX = resizeRef.current.initX + dx;
        }
      }

      setSize({ width: newW, height: newH });
      if (newX !== resizeRef.current.initX) {
        setPosition(prev => ({ ...(prev || { y: newY }), x: newX }));
      }
    };

    const handlePointerUp = () => {
      if (resizeRef.current.isResizing) {
        resizeRef.current.isResizing = false;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const [broadcastToChat, setBroadcastToChat] = useState(false);
  const [hasUsedBroadcast, setHasUsedBroadcast] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [characterName, setCharacterName] = useState('Operative');
  const [isBroadcastMenuOpen, setIsBroadcastMenuOpen] = useState(false);
  const broadcastMenuRef = useRef(null);

  const currentSquadChannel = useMemo(() => {
    if (!activeGroup) return groupChannels?.[0] || null;
    return groupChannels?.find(c => 
      c.groupId === activeGroup.id || 
      c.id === activeGroup.id || 
      c.id === `group_${activeGroup.id}` || 
      (c.name && c.name.toLowerCase() === activeGroup.name?.toLowerCase())
    ) || {
      id: `group_${activeGroup.id}`,
      name: activeGroup.name || 'Current Squad',
      displayName: activeGroup.name || 'Current Squad',
      type: 'group',
      groupId: activeGroup.id
    };
  }, [activeGroup, groupChannels]);

  const otherSquadChannels = useMemo(() => {
    if (!groupChannels) return [];
    return groupChannels.filter(c => c.id !== currentSquadChannel?.id && c.groupId !== activeGroup?.id);
  }, [groupChannels, currentSquadChannel, activeGroup]);

  const selectedChannelName = useMemo(() => {
    if (!selectedChannelId) return 'general-holonet';
    if (currentSquadChannel && selectedChannelId === currentSquadChannel.id) {
      return activeGroup?.name || currentSquadChannel.displayName || currentSquadChannel.name;
    }
    const found = channels?.find(c => c.id === selectedChannelId);
    if (found) return found.displayName || found.name;
    return selectedChannelId;
  }, [selectedChannelId, channels, currentSquadChannel, activeGroup]);

  // Click-outside listener for broadcast pulldown
  useEffect(() => {
    if (!isBroadcastMenuOpen) return;
    const handleClickOutside = (e) => {
      if (broadcastMenuRef.current && !broadcastMenuRef.current.contains(e.target)) {
        setIsBroadcastMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsBroadcastMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBroadcastMenuOpen]);

  const [saveNotification, setSaveNotification] = useState('');
  const saveNotificationTimerRef = useRef(null);

  // User-saved custom dice strings with all adjustments noted (persisted in localStorage)
  const [savedDiceStrings, setSavedDiceStrings] = useState(() => {
    try {
      const stored = localStorage.getItem('tangent_saved_dice_strings');
      return stored ? JSON.parse(stored) : [
        { 
          id: 'preset-1', 
          expr: '2d10+4', 
          label: 'Tactical Check',
          advantageDice: 0,
          baseModifier: 4,
          adHocModifier: 0,
          critRangeSize: 1,
          fumbleRangeSize: 1,
          targetDC: '15'
        },
        { 
          id: 'preset-2', 
          expr: '1d20+5', 
          label: 'Polyhedral D20',
          advantageDice: 1,
          baseModifier: 5,
          adHocModifier: 0,
          critRangeSize: 2,
          fumbleRangeSize: 1,
          targetDC: '12'
        }
      ];
    } catch {
      return [];
    }
  });

  // Cleanup save notification timer on unmount
  useEffect(() => {
    return () => {
      if (saveNotificationTimerRef.current) {
        clearTimeout(saveNotificationTimerRef.current);
      }
    };
  }, []);

  const lastAutoRollIdRef = useRef(null);
  const initialBaseModRef = useRef(0);
  const initialLabelRef = useRef('');
  const initialTargetDCRef = useRef('');

  // Synchronize when diceConfig changes from an external trigger (stat/skill/ability click)
  useEffect(() => {
    if (!diceConfig) return;

    const lbl = diceConfig.label || '';
    setCheckLabel(lbl);
    initialLabelRef.current = lbl;

    const bModRaw = diceConfig.baseModifier !== undefined
      ? Number(diceConfig.baseModifier) || 0
      : (diceConfig.modifier !== undefined ? Number(diceConfig.modifier) || 0 : 0);
    const bMod = Math.max(-20, Math.min(20, bModRaw));
    initialBaseModRef.current = bMod;
    setBaseModifier(bMod);

    const aMod = diceConfig.adHocModifier !== undefined ? Number(diceConfig.adHocModifier) || 0 : 0;

    // Enforce +/- 20 flat modifier boundary
    const clampedTotal = Math.max(-20, Math.min(20, bMod + aMod));
    setAdHocModifier(clampedTotal - bMod);

    // Enforce +/- 5 advantage dice boundary
    let advDice = 0;
    if (diceConfig.advantageDice !== undefined) {
      advDice = Number(diceConfig.advantageDice) || 0;
    } else if (diceConfig.rollMode === 'advantage') {
      advDice = 1;
    } else if (diceConfig.rollMode === 'disadvantage') {
      advDice = -1;
    }
    setAdvantageDice(Math.max(-5, Math.min(5, advDice)));

    // Enforce 1-5 threat range size boundaries
    if (diceConfig.critRangeSize !== undefined) {
      setCritRangeSize(Math.max(1, Math.min(5, Number(diceConfig.critRangeSize) || 1)));
    }
    if (diceConfig.fumbleRangeSize !== undefined) {
      setFumbleRangeSize(Math.max(1, Math.min(5, Number(diceConfig.fumbleRangeSize) || 1)));
    }

    const dcVal = diceConfig.targetDC !== undefined 
      ? diceConfig.targetDC 
      : (diceConfig.targetNumber !== undefined ? diceConfig.targetNumber : '');
    setTargetDC(dcVal);
    initialTargetDCRef.current = dcVal;

    if (diceConfig.characterName) setCharacterName(diceConfig.characterName);

    // Compute expression from formula or base + ad-hoc modifier
    let expr = diceConfig.expression;
    if (!expr) {
      expr = clampedTotal !== 0 ? `2d10${clampedTotal > 0 ? '+' : ''}${clampedTotal}` : '2d10';
    }
    setCustomExpr(expr);

    // Auto-roll if requested and this roll event is fresh
    if (diceConfig.autoRoll && diceConfig.rollId && diceConfig.rollId !== lastAutoRollIdRef.current) {
      lastAutoRollIdRef.current = diceConfig.rollId;
      handleRoll(expr, advDice, {
        ...diceConfig,
        expression: expr,
        baseModifier: bMod,
        adHocModifier: clampedTotal - bMod,
        advantageDice: advDice,
        critRangeSize: diceConfig.critRangeSize || 1,
        fumbleRangeSize: diceConfig.fumbleRangeSize || 1,
        targetDC: dcVal
      });
    }
  }, [diceConfig]);

  // Set default selected channel: prioritize current squad channel if available, then group channel, then active channel
  useEffect(() => {
    if (selectedChannelId) return;
    if (diceConfig?.targetChannelId) {
      setSelectedChannelId(diceConfig.targetChannelId);
    } else if (currentSquadChannel?.id) {
      setSelectedChannelId(currentSquadChannel.id);
    } else if (groupChannels && groupChannels.length > 0) {
      setSelectedChannelId(groupChannels[0].id);
    } else if (activeChannelId) {
      setSelectedChannelId(activeChannelId);
    } else if (publicChannels && publicChannels.length > 0) {
      setSelectedChannelId(publicChannels[0].id);
    }
  }, [currentSquadChannel, groupChannels, activeChannelId, publicChannels, diceConfig?.targetChannelId, selectedChannelId]);

  // Helper for Base Score changes (clamped to [-20, 20])
  const handleBaseScoreChange = (newVal) => {
    let raw;
    if (typeof newVal === 'string') {
      if (newVal === '' || newVal === '-') {
        raw = 0;
      } else {
        raw = parseInt(newVal, 10);
        if (isNaN(raw)) raw = 0;
      }
    } else {
      raw = Number(newVal) || 0;
    }

    const clampedBase = Math.max(-20, Math.min(20, raw));
    setBaseModifier(clampedBase);

    // Keep net total clamped [-20, 20]
    const clampedTotal = Math.max(-20, Math.min(20, clampedBase + adHocModifier));
    if (customExpr.startsWith('2d10') || !customExpr.includes('d')) {
      const expr = clampedTotal !== 0 ? `2d10${clampedTotal > 0 ? '+' : ''}${clampedTotal}` : '2d10';
      setCustomExpr(expr);
    }
  };

  // Helper for Ad-Hoc / Situational Modifier changes (clamped to [-20, 20])
  const handleAdHocChange = (newVal) => {
    let raw;
    if (typeof newVal === 'string') {
      if (newVal === '' || newVal === '-') {
        raw = 0;
      } else {
        raw = parseInt(newVal, 10);
        if (isNaN(raw)) raw = 0;
      }
    } else {
      raw = Number(newVal) || 0;
    }

    const clampedAdHoc = Math.max(-20, Math.min(20, raw));
    setAdHocModifier(clampedAdHoc);

    // Keep net total clamped [-20, 20]
    const clampedTotal = Math.max(-20, Math.min(20, baseModifier + clampedAdHoc));
    if (customExpr.startsWith('2d10') || !customExpr.includes('d')) {
      const expr = clampedTotal !== 0 ? `2d10${clampedTotal > 0 ? '+' : ''}${clampedTotal}` : '2d10';
      setCustomExpr(expr);
    }
  };

  // Comprehensive Reset: Clears all fields back to their base level score
  const handleResetAll = () => {
    const baseScore = initialBaseModRef.current ?? 0;
    const baseLabel = initialLabelRef.current ?? '';
    const baseDC = initialTargetDCRef.current ?? '';

    setBaseModifier(baseScore);
    setAdHocModifier(0);
    setAdvantageDice(0);
    setCritRangeSize(1);
    setFumbleRangeSize(1);
    setTargetDC(baseDC);
    setCheckLabel(baseLabel);

    const expr = baseScore !== 0 ? `2d10${baseScore > 0 ? '+' : ''}${baseScore}` : '2d10';
    setCustomExpr(expr);
  };

  const handleResetBaseScore = () => {
    const baseScore = initialBaseModRef.current ?? 0;
    setBaseModifier(baseScore);
    const clampedTotal = Math.max(-20, Math.min(20, baseScore + adHocModifier));
    if (customExpr.startsWith('2d10') || !customExpr.includes('d')) {
      setCustomExpr(clampedTotal !== 0 ? `2d10${clampedTotal > 0 ? '+' : ''}${clampedTotal}` : '2d10');
    }
  };

  const handleResetAdHoc = () => {
    setAdHocModifier(0);
    const clampedTotal = Math.max(-20, Math.min(20, baseModifier));
    if (customExpr.startsWith('2d10') || !customExpr.includes('d')) {
      setCustomExpr(clampedTotal !== 0 ? `2d10${clampedTotal > 0 ? '+' : ''}${clampedTotal}` : '2d10');
    }
  };

  // Save current custom formula & all active adjustments to localStorage
  const handleSaveCustomString = () => {
    const rawExpr = (customExpr || '').trim();
    const effectiveExpr = rawExpr || (totalCalculatedMod !== 0 
      ? `2d10${totalCalculatedMod > 0 ? '+' : ''}${totalCalculatedMod}` 
      : '2d10');
    const label = (checkLabel || '').trim();

    const newEntry = {
      id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      expr: effectiveExpr,
      label: label || effectiveExpr,
      advantageDice: Number(advantageDice) || 0,
      baseModifier: Number(baseModifier) || 0,
      adHocModifier: Number(adHocModifier) || 0,
      critRangeSize: Number(critRangeSize) || 1,
      fumbleRangeSize: Number(fumbleRangeSize) || 1,
      targetDC: targetDC !== undefined && targetDC !== null ? String(targetDC) : '',
      savedAt: Date.now()
    };

    const updated = [
      newEntry,
      ...savedDiceStrings.filter(s => 
        s.expr !== newEntry.expr || 
        s.label !== newEntry.label ||
        (s.advantageDice ?? 0) !== newEntry.advantageDice ||
        (s.baseModifier ?? 0) !== newEntry.baseModifier ||
        (s.adHocModifier ?? 0) !== newEntry.adHocModifier ||
        (s.critRangeSize ?? 1) !== newEntry.critRangeSize ||
        (s.fumbleRangeSize ?? 1) !== newEntry.fumbleRangeSize ||
        String(s.targetDC ?? '') !== newEntry.targetDC
      )
    ].slice(0, 20);

    setSavedDiceStrings(updated);
    try {
      localStorage.setItem('tangent_saved_dice_strings', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save dice string to localStorage:', e);
    }

    AudioService.playTerminalBeep(1400, 0.04);
    setSaveNotification(`Saved preset "${newEntry.label}" with all adjustments!`);
    setShowCustomRollAccordion(true);

    if (saveNotificationTimerRef.current) {
      clearTimeout(saveNotificationTimerRef.current);
    }
    saveNotificationTimerRef.current = setTimeout(() => {
      setSaveNotification('');
    }, 3500);
  };

  // Restore/load all adjustments from a saved preset into the roller
  const handleLoadSavedPreset = (s, autoRoll = false) => {
    const expr = s.expr || '2d10';
    const label = s.label || '';
    const adv = s.advantageDice !== undefined ? Number(s.advantageDice) || 0 : 0;
    const bMod = s.baseModifier !== undefined ? Number(s.baseModifier) || 0 : 0;
    const aMod = s.adHocModifier !== undefined ? Number(s.adHocModifier) || 0 : 0;
    const cSize = s.critRangeSize !== undefined ? Number(s.critRangeSize) || 1 : 1;
    const fSize = s.fumbleRangeSize !== undefined ? Number(s.fumbleRangeSize) || 1 : 1;
    const dc = s.targetDC !== undefined && s.targetDC !== null ? String(s.targetDC) : '';

    setCustomExpr(expr);
    setCheckLabel(label);
    setAdvantageDice(adv);
    setBaseModifier(bMod);
    setAdHocModifier(aMod);
    setCritRangeSize(cSize);
    setFumbleRangeSize(fSize);
    setTargetDC(dc);

    AudioService.playTerminalBeep(1050, 0.03);

    if (autoRoll) {
      handleRoll(expr, adv, {
        advantageDice: adv,
        baseModifier: bMod,
        adHocModifier: aMod,
        critRangeSize: cSize,
        fumbleRangeSize: fSize,
        targetDC: dc,
        label: label || expr
      });
    }
  };

  // Delete saved custom formula
  const handleDeleteSavedString = (id) => {
    const updated = savedDiceStrings.filter(s => s.id !== id);
    setSavedDiceStrings(updated);
    try {
      localStorage.setItem('tangent_saved_dice_strings', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update saved dice strings in localStorage:', e);
    }
  };

  // Clear all roll history
  const handleClearHistory = () => {
    setHistory([]);
    setLatestRoll(null);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      localStorage.removeItem(STORAGE_KEY_LATEST);
    } catch (e) {
      console.warn('Failed to clear dice history from localStorage:', e);
    }
  };

  // Close tray on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleRoll = async (expr = customExpr, overrideAdvantage = null, overrideConfig = null) => {
    // Resolve clamped advantageDice (-5 to +5)
    let adv = advantageDice;
    if (overrideAdvantage !== null && overrideAdvantage !== undefined) {
      adv = typeof overrideAdvantage === 'number' 
        ? overrideAdvantage 
        : (overrideAdvantage === 'advantage' ? 1 : overrideAdvantage === 'disadvantage' ? -1 : 0);
    } else if (overrideConfig?.advantageDice !== undefined) {
      adv = Number(overrideConfig.advantageDice) || 0;
    } else if (overrideConfig?.rollMode) {
      adv = overrideConfig.rollMode === 'advantage' ? 1 : overrideConfig.rollMode === 'disadvantage' ? -1 : 0;
    }
    const clampedAdv = Math.max(-5, Math.min(5, adv));

    // Resolve clamped flatModifier (-20 to +20)
    const bMod = overrideConfig?.baseModifier !== undefined ? Number(overrideConfig.baseModifier) || 0 : baseModifier;
    const aMod = overrideConfig?.adHocModifier !== undefined ? Number(overrideConfig.adHocModifier) || 0 : adHocModifier;
    const clampedFlatMod = Math.max(-20, Math.min(20, bMod + aMod));

    // Resolve clamped threat range sizes (1 to 5)
    const cSize = overrideConfig?.critRangeSize !== undefined 
      ? Math.max(1, Math.min(5, Number(overrideConfig.critRangeSize) || 1)) 
      : critRangeSize;
    const fSize = overrideConfig?.fumbleRangeSize !== undefined 
      ? Math.max(1, Math.min(5, Number(overrideConfig.fumbleRangeSize) || 1)) 
      : fumbleRangeSize;

    // Resolve target DC
    const dc = overrideConfig?.targetDC !== undefined 
      ? overrideConfig.targetDC 
      : (overrideConfig?.targetNumber !== undefined ? overrideConfig.targetNumber : targetDC);

    const cName = overrideConfig?.characterName || characterName || 'Operative';
    const parsedExpr = parseDiceExpression(expr);
    const dieDescriptor = parsedExpr.sides === 10 && parsedExpr.count === 2 
      ? '2d10' 
      : (parsedExpr.count === 1 ? `d${parsedExpr.sides}` : `${parsedExpr.count}d${parsedExpr.sides}`);
    const cLabel = overrideConfig?.label || checkLabel || (
      clampedAdv > 0 
        ? `${dieDescriptor} (+${clampedAdv} Adv)` 
        : clampedAdv < 0 
        ? `${dieDescriptor} (${clampedAdv} Disadv)` 
        : (expr === '2d10' ? 'Tactical Check' : `${dieDescriptor} Check`)
    );

    const result = rollDice(expr, {
      advantageDice: clampedAdv,
      flatModifier: clampedFlatMod,
      critRangeSize: cSize,
      fumbleRangeSize: fSize,
      targetDC: dc,
      targetNumber: dc,
      characterName: cName,
      label: cLabel
    });

    AudioService.playDiceRollSound();
    if (result.isCrit) AudioService.playCriticalChime(true);
    if (result.isFumble) AudioService.playCriticalChime(false);

    const rollEntry = {
      ...result,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      characterName: cName,
      label: cLabel,
      expression: result.expression || expr,
      advantageDice: clampedAdv,
      appliedModifier: result.appliedModifier ?? clampedFlatMod,
      critThreshold: result.critThreshold,
      fumbleThreshold: result.fumbleThreshold,
      targetDC: result.targetDC !== undefined ? result.targetDC : (dc !== '' && dc !== null && dc !== undefined ? dc : null)
    };

    setLatestRoll(rollEntry);
    setHistory(prev => {
      const updated = [rollEntry, ...prev].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(rollEntry));
      } catch (e) {
        console.warn('Failed to save dice history to localStorage:', e);
      }
      return updated;
    });

    // Auto-scroll output block into view on mobile so user never misses the roll
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        outputBlockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);

    if (broadcastToChat && sendDiceRoll) {
      setHasUsedBroadcast(true);
      try {
        const targetChan = overrideConfig?.targetChannelId || selectedChannelId || activeChannelId;
        await sendDiceRoll({
          label: cLabel,
          expression: result.expression,
          total: result.finalTotal ?? result.total,
          finalTotal: result.finalTotal ?? result.total,
          naturalTotal: result.naturalTotal,
          rolls: result.rolls.map(r => r.value),
          dicePool: result.dicePool || result.rolls.map(r => r.value),
          keptDice: result.keptDice || [],
          modifier: result.appliedModifier ?? clampedFlatMod,
          appliedModifier: result.appliedModifier ?? clampedFlatMod,
          flatModifier: clampedFlatMod,
          adHocModifier: aMod,
          baseModifier: bMod,
          advantageDice: result.advantageDice ?? clampedAdv,
          critRangeSize: result.critRangeSize ?? cSize,
          fumbleRangeSize: result.fumbleRangeSize ?? fSize,
          critThreshold: result.critThreshold ?? (21 - cSize),
          fumbleThreshold: result.fumbleThreshold ?? (1 + fSize),
          isCritical: result.isCrit,
          isFumble: result.isFumble,
          isCrit: result.isCrit,
          isAdvantage: (result.advantageDice ?? clampedAdv) > 0,
          isDisadvantage: (result.advantageDice ?? clampedAdv) < 0,
          targetNumber: result.targetDC,
          targetDC: result.targetDC,
          isSuccess: result.isSuccess,
          outcome: result.outcome,
          margin: result.margin
        }, targetChan);
      } catch (err) {
        console.warn('Failed to broadcast roll to chat:', err);
      }
    }

    // Auto-log to Persona Telemetry Log if personaId is attached
    const targetPersonaId = overrideConfig?.personaId || diceConfig?.personaId;
    if (targetPersonaId) {
      PersonaLogService.logAction({
        personaId: targetPersonaId,
        personaName: cName,
        actionType: ACTION_TYPES.SKILL_CHECK,
        summary: `${cLabel}: ${result.finalTotal} (${result.expression})${result.isCrit ? ' [CRITICAL SUCCESS]' : result.isFumble ? ' [CRITICAL FUMBLE]' : ''}`,
        details: {
          expression: result.expression,
          dicePool: result.dicePool,
          keptDice: result.keptDice,
          rolls: result.rolls,
          naturalTotal: result.naturalTotal,
          total: result.finalTotal,
          modifier: result.appliedModifier,
          critThreshold: result.critThreshold,
          fumbleThreshold: result.fumbleThreshold,
          isCritical: result.isCrit,
          isFumble: result.isFumble,
          advantageDice: result.advantageDice,
          outcome: result.outcome,
          margin: result.margin
        },
        actorId: 'player',
        actorHandle: cName
      }).catch(() => {});
    }
  };

  if (!isOpen) return null;

  const totalCalculatedMod = Math.max(-20, Math.min(20, baseModifier + adHocModifier));
  const currentCritThreshold = 21 - critRangeSize;
  const currentFumbleThreshold = 1 + fumbleRangeSize;

  const currentModalWidth = size?.width || (typeof window !== 'undefined' ? window.innerWidth : 900);
  const isCompactLayout = isMaximized ? false : currentModalWidth < 680;

  return (
    <div 
      ref={modalRef}
      style={isMaximized ? {
        position: 'fixed',
        left: 8,
        top: HEADER_BAR_OFFSET,
        width: 'calc(100vw - 16px)',
        height: `calc(100dvh - ${HEADER_BAR_OFFSET + 16}px)`,
        zIndex: 95
      } : (position && size) ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 95
      } : {
        position: 'fixed',
        zIndex: 95
      }}
      className={`overflow-hidden bg-[#0d1117]/95 backdrop-blur-md border border-rose-500/60 rounded-xl shadow-[0_0_35px_rgba(0,0,0,0.85),0_0_20px_rgba(244,63,94,0.3)] p-3 sm:p-4 flex flex-col gap-2.5 font-sans select-none animate-slide-up ${
        !position || !size ? 'inset-x-2 top-[58px] bottom-16 sm:bottom-4 md:inset-auto md:bottom-4 md:right-4 w-[calc(100vw-1rem)] md:w-[860px] lg:w-[920px] max-h-[calc(100dvh-5rem)] md:max-h-[calc(100vh-70px)]' : ''
      }`}
    >
      
      {/* Header (Movable Drag Handle) */}
      <div 
        onPointerDown={handleDragStart}
        onDoubleClick={(e) => {
          if (e.target.closest('button, input, select, a, textarea')) return;
          setIsMaximized(prev => !prev);
        }}
        className={`relative flex items-center justify-between pb-2 border-b border-rose-500/30 shrink-0 min-h-[38px] select-none ${
          isMaximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
        title={isMaximized ? undefined : "Click and drag to move modal • Double-click to maximize/restore"}
      >
        {/* Left: Drag Handle, Title & Info */}
        <div className="flex items-center gap-2 min-w-0 pr-2 max-w-[30%] sm:max-w-[35%]">
          {!isMaximized && (
            <GripHorizontal size={16} className="text-rose-400/60 hover:text-rose-300 shrink-0 hidden sm:block" />
          )}
          <TwoD10Icon className="text-rose-400 shrink-0" size={18} />
          <div className="min-w-0">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-rose-300 truncate">
              {checkLabel ? checkLabel : 'TANGENT 2D10 ROLLER'}
            </h3>
            {checkLabel && (
              <span className="text-[9px] text-slate-400 font-mono block truncate">
                Base: {baseModifier >= 0 ? `+${baseModifier}` : baseModifier}
                {adHocModifier !== 0 && ` • Ad Hoc: ${adHocModifier > 0 ? `+${adHocModifier}` : adHocModifier}`}
                {` • Net: ${totalCalculatedMod >= 0 ? `+${totalCalculatedMod}` : totalCalculatedMod}`}
              </span>
            )}
          </div>
        </div>

        {/* Center: Check Button + Broadcast Pulldown Toggle */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              console.log('BUTTON CLICK EVENT RECEIVED!');
              handleRoll(customExpr || '2d10');
            }}
            className="w-32 sm:w-40 py-1.5 bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500 hover:from-rose-400 hover:to-rose-300 active:scale-95 text-slate-950 font-black text-xs font-mono rounded-lg uppercase tracking-wider transition-all shadow-[0_0_18px_rgba(244,63,94,0.6)] border border-rose-300/80 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Execute Check with current modifiers & DC"
          >
            <TwoD10Icon size={14} className="text-slate-950" />
            <span>CHECK</span>
          </button>

          {/* Broadcast Pulldown Toggle (To the right of CHECK) */}
          <div className="relative" ref={broadcastMenuRef}>
            <button
              type="button"
              onClick={() => setIsBroadcastMenuOpen(prev => !prev)}
              className={`h-[32px] sm:h-[34px] px-2 sm:px-2.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none shrink-0 ${
                broadcastToChat
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:bg-cyan-500/30'
                  : 'bg-slate-900/90 text-slate-400 border-slate-700/80 hover:text-slate-200 hover:border-slate-500 hover:bg-slate-800'
              }`}
              title={broadcastToChat ? `Broadcasting: ${selectedChannelName} (Click to open channel selector or mute)` : 'Broadcast is Silent (Click to select channel or enable)'}
            >
              <Radio size={13} className={broadcastToChat ? 'text-cyan-400 animate-pulse' : 'text-slate-500'} />
              <span className="uppercase tracking-wider text-[10px] sm:text-[10.5px]">
                {broadcastToChat ? 'Broadcast' : 'Silent'}
              </span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform duration-150 ${isBroadcastMenuOpen ? 'rotate-180 text-cyan-300' : ''}`} />
            </button>

            {/* Pulldown Popover */}
            {isBroadcastMenuOpen && (
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-32px)] bg-[#0b0f17]/98 border border-cyan-500/40 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.95),0_0_20px_rgba(6,182,212,0.25)] p-2.5 z-[150] backdrop-blur-xl flex flex-col gap-2 font-sans select-none text-left animate-fade-in"
              >
                {/* 1. Transmission Mode: Broadcast / Silent Switch */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 uppercase tracking-wider px-1">
                    <span className="flex items-center gap-1 font-bold text-cyan-300">
                      <Radio size={11} className={broadcastToChat ? 'text-cyan-400 animate-pulse' : 'text-slate-500'} />
                      <span>Transmission Mode:</span>
                    </span>
                    <span className={broadcastToChat ? 'text-cyan-400 font-bold' : 'text-rose-400/90 font-bold'}>
                      {broadcastToChat ? 'TRANSMITTING' : 'MUTED'}
                    </span>
                  </div>

                  <div className="bg-slate-950/90 p-1 rounded-lg border border-slate-800 grid grid-cols-2 gap-1 font-mono text-[10.5px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastToChat(true);
                        setHasUsedBroadcast(true);
                        AudioService.playTerminalBeep(1300, 0.03);
                      }}
                      className={`py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        broadcastToChat
                          ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                      }`}
                    >
                      <Radio size={12} className={broadcastToChat ? 'text-cyan-400 animate-pulse' : 'text-slate-500'} />
                      <span>BROADCAST</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastToChat(false);
                        AudioService.playTerminalBeep(900, 0.03);
                      }}
                      className={`py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        !broadcastToChat
                          ? 'bg-slate-800 text-rose-300 border border-rose-500/40 shadow-sm'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 border border-transparent'
                      }`}
                    >
                      <VolumeX size={12} className={!broadcastToChat ? 'text-rose-400' : 'text-slate-500'} />
                      <span>SILENT</span>
                    </button>
                  </div>
                </div>

                {/* 2. Channel List: Topped with Current Squad */}
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 uppercase tracking-wider px-1">
                    <span>Target Frequency:</span>
                    <span className="text-[8.5px] text-cyan-400/80 truncate max-w-[140px]">
                      {selectedChannelName}
                    </span>
                  </div>

                  {/* Scrollable Channels List */}
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5 no-scrollbar">
                    {/* TOP: Current Squad Section */}
                    {(currentSquadChannel || activeGroup) && (
                      <div className="space-y-1">
                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400/90 px-1 flex items-center gap-1">
                          <Shield size={10} className="text-amber-400" />
                          <span>Current Squad Frequency</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const chanId = currentSquadChannel?.id || `group_${activeGroup?.id}`;
                            setSelectedChannelId(chanId);
                            setBroadcastToChat(true);
                            setHasUsedBroadcast(true);
                            AudioService.playTerminalBeep(1200, 0.02);
                            setIsBroadcastMenuOpen(false);
                          }}
                          className={`w-full p-1.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            selectedChannelId === (currentSquadChannel?.id || `group_${activeGroup?.id}`)
                              ? 'bg-amber-950/40 border-amber-500/70 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-amber-500/40 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Shield size={13} className="text-amber-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold block truncate">
                                {activeGroup?.name || currentSquadChannel?.displayName || currentSquadChannel?.name || 'Squad Channel'}
                              </span>
                              <span className="text-[8.5px] text-slate-400 block truncate">
                                Tactical Squad Frequency
                              </span>
                            </div>
                          </div>
                          {selectedChannelId === (currentSquadChannel?.id || `group_${activeGroup?.id}`) ? (
                            <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 flex items-center gap-0.5">
                              <Check size={9} />
                              <span>ACTIVE</span>
                            </span>
                          ) : (
                            <span className="text-[8.5px] text-slate-500 shrink-0 font-bold">
                              SELECT
                            </span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Other Squads (if any) */}
                    {otherSquadChannels && otherSquadChannels.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/60">
                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
                          <Users size={10} className="text-purple-400" />
                          <span>Other Team Channels</span>
                        </div>
                        {otherSquadChannels.map(c => {
                          const isSelected = selectedChannelId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedChannelId(c.id);
                                setBroadcastToChat(true);
                                setHasUsedBroadcast(true);
                                AudioService.playTerminalBeep(1200, 0.02);
                                setIsBroadcastMenuOpen(false);
                              }}
                              className={`w-full p-1.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-purple-950/40 border-purple-400 text-purple-200 ring-1 ring-purple-400/50'
                                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <Users size={12} className="text-purple-400 shrink-0" />
                                <span className="truncate">{c.displayName || c.name}</span>
                              </div>
                              {isSelected && <span className="text-purple-400 text-[9px] font-bold shrink-0">ACTIVE</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Public Channels */}
                    <div className="space-y-1 pt-1 border-t border-slate-800/60">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
                        <Globe size={10} className="text-cyan-400" />
                        <span>Public CommLink Channels</span>
                      </div>
                      {(publicChannels && publicChannels.length > 0 ? publicChannels : [{ id: 'public_general', displayName: 'general-holonet' }]).map(c => {
                        const isSelected = selectedChannelId === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedChannelId(c.id);
                              setBroadcastToChat(true);
                              setHasUsedBroadcast(true);
                              AudioService.playTerminalBeep(1200, 0.02);
                              setIsBroadcastMenuOpen(false);
                            }}
                            className={`w-full p-1.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/50'
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Hash size={12} className="text-cyan-400 shrink-0" />
                              <span className="truncate">{c.displayName || c.name}</span>
                            </div>
                            {isSelected && <span className="text-cyan-400 text-[9px] font-bold shrink-0">ACTIVE</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Channels */}
                    {customChannels && customChannels.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/60">
                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
                          <Tag size={10} className="text-amber-400" />
                          <span>Custom Frequencies</span>
                        </div>
                        {customChannels.map(c => {
                          const isSelected = selectedChannelId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedChannelId(c.id);
                                setBroadcastToChat(true);
                                setHasUsedBroadcast(true);
                                AudioService.playTerminalBeep(1200, 0.02);
                                setIsBroadcastMenuOpen(false);
                              }}
                              className={`w-full p-1.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-amber-950/40 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <Hash size={12} className="text-amber-400 shrink-0" />
                                <span className="truncate">{c.displayName || c.name}</span>
                              </div>
                              {isSelected && <span className="text-cyan-400 text-[9px] font-bold shrink-0">ACTIVE</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Direct Channels */}
                    {directChannels && directChannels.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/60">
                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
                          <Users size={10} className="text-emerald-400" />
                          <span>Direct Comms</span>
                        </div>
                        {directChannels.map(c => {
                          const isSelected = selectedChannelId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedChannelId(c.id);
                                setBroadcastToChat(true);
                                setHasUsedBroadcast(true);
                                AudioService.playTerminalBeep(1200, 0.02);
                                setIsBroadcastMenuOpen(false);
                              }}
                              className={`w-full p-1.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-emerald-950/40 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/50'
                                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <Users size={12} className="text-emerald-400 shrink-0" />
                                <span className="truncate">{c.displayName || c.name}</span>
                              </div>
                              {isSelected && <span className="text-emerald-400 text-[9px] font-bold shrink-0">ACTIVE</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Window Controls (Maximize/Restore, Close) */}
        <div className="flex items-center justify-end gap-1 pl-2 shrink-0">
          <button 
            type="button"
            onClick={() => setIsMaximized(prev => !prev)} 
            className="p-1 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer rounded hover:bg-slate-800/60"
            title={isMaximized ? "Restore window" : "Maximize window"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer rounded hover:bg-slate-800/60"
            title="Close Modal"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Responsive Body:
          When width is compact (<680px) or on mobile: single-column flex-col with dice roller controls on top (order-1) and output on the bottom (order-2).
          When width is standard (>=680px): side-by-side flex-row with Output Block on the LEFT (order-1) and Dice Roller on the RIGHT (order-2).
      */}
      <div className={`flex flex-1 min-h-0 gap-3 ${
        isCompactLayout 
          ? 'flex-col overflow-y-auto' 
          : 'flex-row overflow-hidden'
      }`}>
        
        {/* Attached Output Block: Left side on standard view (order-1), bottom on compact/mobile (order-2) */}
        <div 
          ref={outputBlockRef}
          className={`shrink-0 flex flex-col gap-2.5 overflow-y-auto no-scrollbar ${
            isCompactLayout
              ? 'order-2 w-full pt-2 border-t border-rose-500/20'
              : 'order-1 w-[340px] lg:w-[380px] border-r border-rose-500/20 pr-3'
          }`}
        >
          {/* Subheader */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-rose-400" />
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-rose-300">
                Roll Telemetry & Output
              </span>
              {history.length > 0 ? (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {history.length} {history.length === 1 ? 'Roll' : 'Rolls'}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  STANDBY
                </span>
              )}
            </div>

            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="flex items-center gap-1 text-[9px] font-mono text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-rose-500/40"
                title="Clear Roll History & Output"
              >
                <Trash2 size={11} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Active / Latest Roll Display - ALWAYS ATTACHED FROM START */}
          {latestRoll ? (
            <div className={`p-2.5 rounded-lg border transition-all shrink-0 ${
              (latestRoll.isCrit || latestRoll.outcome === 'Critical Success')
                ? 'bg-gradient-to-r from-emerald-950/80 via-slate-950/90 to-slate-950 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : (latestRoll.isFumble || latestRoll.outcome === 'Critical Failure')
                ? 'bg-gradient-to-r from-yellow-950/80 via-slate-950/90 to-slate-950 border-yellow-500/70 shadow-[0_0_15px_rgba(234,179,8,0.25)]'
                : latestRoll.outcome === 'Overwhelming Success'
                ? 'bg-gradient-to-r from-cyan-950/80 via-slate-950/90 to-slate-950 border-cyan-500/70 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : latestRoll.outcome === 'Catastrophic Failure'
                ? 'bg-gradient-to-r from-rose-950/80 via-slate-950/90 to-slate-950 border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}>
              {/* Header Row: Label + Expression + Outcome Badges Inline */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 gap-1.5 mb-1.5 flex-wrap">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-bold text-slate-200 truncate uppercase">{latestRoll.label || 'Action Check'}</span>
                  <span className="text-slate-500 text-[9px] font-mono">({latestRoll.expression})</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {latestRoll.advantageDice !== undefined && latestRoll.advantageDice !== 0 && (
                    <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${
                      latestRoll.advantageDice > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                    }`}>
                      {latestRoll.advantageDice > 0 
                        ? `+${latestRoll.advantageDice} ADV` 
                        : `${latestRoll.advantageDice} DISADV`}
                    </span>
                  )}

                  {/* Flag Extreme Checks 'critical' (green) or 'fumble' (yellow) */}
                  {(latestRoll.isCrit || latestRoll.outcome === 'Critical Success') ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black border bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse">
                      CRITICAL
                    </span>
                  ) : (latestRoll.isFumble || latestRoll.outcome === 'Critical Failure') ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black border bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] animate-pulse">
                      FUMBLE
                    </span>
                  ) : latestRoll.outcome ? (
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                      latestRoll.outcome === 'Overwhelming Success'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                        : latestRoll.outcome === 'Catastrophic Failure'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-400'
                        : latestRoll.outcome === 'Success'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {latestRoll.outcome.toUpperCase()}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Core Result Row: Score & DC on Left, Dice Pool on Right */}
              <div className="flex items-center justify-between gap-2.5 py-1 px-2 bg-slate-950/60 rounded border border-slate-800/60 mb-1.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={`text-2xl font-black font-mono tracking-tight leading-none ${
                    (latestRoll.isCrit || latestRoll.outcome === 'Critical Success')
                      ? 'text-emerald-300'
                      : (latestRoll.isFumble || latestRoll.outcome === 'Critical Failure')
                      ? 'text-yellow-400'
                      : 'text-white'
                  }`}>
                    {latestRoll.finalTotal ?? latestRoll.total}
                  </span>
                  {latestRoll.targetDC !== null && latestRoll.targetDC !== undefined && latestRoll.targetDC !== '' ? (
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-[10px] text-slate-400">vs DC {latestRoll.targetDC}</span>
                      <span className={`px-1.5 py-0.5 rounded font-black uppercase tracking-wider text-[9px] border leading-none ${
                        (latestRoll.isCrit || latestRoll.outcome === 'Critical Success')
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse'
                          : (latestRoll.isFumble || latestRoll.outcome === 'Critical Failure')
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] animate-pulse'
                          : (latestRoll.outcome ? latestRoll.outcome.includes('Success') : latestRoll.isSuccess)
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {(latestRoll.isCrit || latestRoll.outcome === 'Critical Success')
                          ? 'CRITICAL' 
                          : (latestRoll.isFumble || latestRoll.outcome === 'Critical Failure')
                          ? 'FUMBLE' 
                          : (latestRoll.outcome ? latestRoll.outcome.includes('Success') : latestRoll.isSuccess) 
                          ? 'SUCCESS' 
                          : 'FAILURE'}
                        {latestRoll.margin !== null && latestRoll.margin !== undefined && (
                          <span className="opacity-80 ml-1">({latestRoll.margin >= 0 ? `+${latestRoll.margin}` : latestRoll.margin})</span>
                        )}
                      </span>
                    </div>
                  ) : (
                    /* When no DC is set, flag extreme checks right beside the score */
                    ((latestRoll.isCrit || latestRoll.outcome === 'Critical Success') || (latestRoll.isFumble || latestRoll.outcome === 'Critical Failure')) && (
                      <span className={`px-1.5 py-0.5 rounded font-black uppercase tracking-wider text-[9px] border leading-none ${
                        (latestRoll.isCrit || latestRoll.outcome === 'Critical Success')
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] animate-pulse'
                      }`}>
                        {(latestRoll.isCrit || latestRoll.outcome === 'Critical Success') ? 'CRITICAL' : 'FUMBLE'}
                      </span>
                    )
                  )}
                </div>

                {/* Compact Dice Pool Badges */}
                {latestRoll.dicePool && latestRoll.dicePool.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight mr-0.5">Pool:</span>
                    {(() => {
                      const keptCounts = {};
                      (latestRoll.keptDice || []).forEach(k => {
                        keptCounts[k] = (keptCounts[k] || 0) + 1;
                      });

                      const isCritRoll = latestRoll.isCrit || latestRoll.outcome === 'Critical Success';
                      const isFumbleRoll = latestRoll.isFumble || latestRoll.outcome === 'Critical Failure';

                      return latestRoll.dicePool.map((val, idx) => {
                        let isKept = false;
                        if (keptCounts[val] && keptCounts[val] > 0) {
                          isKept = true;
                          keptCounts[val]--;
                        }

                        return (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono transition-all border flex items-center gap-0.5 ${
                              isKept
                                ? (isCritRoll
                                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                                    : isFumbleRoll
                                    ? 'bg-yellow-500/25 border-yellow-500 text-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.35)]'
                                    : 'bg-rose-500/25 border-rose-400 text-rose-200 shadow-[0_0_6px_rgba(244,63,94,0.25)]')
                                : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-40 line-through'
                            }`}
                            title={isKept ? 'Kept Die' : 'Dropped Die'}
                          >
                            <span>{val}</span>
                            {isKept && latestRoll.dicePool.length > 1 && (
                              <span className="text-[7.5px] uppercase tracking-tighter opacity-75">K</span>
                            )}
                          </span>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Telemetry Breakdown Strip */}
              <div className="flex items-center justify-center gap-2 text-[9.5px] font-mono text-slate-300 py-0.5 px-2 bg-slate-950/40 rounded border border-slate-800/40 flex-wrap">
                <span>Natural: <strong className={latestRoll.isCrit ? 'text-emerald-400' : latestRoll.isFumble ? 'text-yellow-400' : 'text-cyan-300'}>{latestRoll.naturalTotal ?? (latestRoll.keptDice ? latestRoll.keptDice[0] + (latestRoll.keptDice[1] || 0) : '-')}</strong></span>
                <span className="text-slate-600">•</span>
                <span>Mod: <strong className="text-rose-300">{latestRoll.appliedModifier >= 0 ? `+${latestRoll.appliedModifier}` : latestRoll.appliedModifier}</strong></span>
                <span className="text-slate-600">•</span>
                <span>Crit: <strong className="text-emerald-400">&ge;{latestRoll.critThreshold}</strong></span>
                <span className="text-slate-600">•</span>
                <span>Fumble: <strong className="text-yellow-400">&le;{latestRoll.fumbleThreshold}</strong></span>
              </div>

              {/* Slim Reroll Button */}
              <button
                type="button"
                onClick={() => handleRoll(latestRoll.expression, latestRoll.advantageDice ?? 0)}
                className="mt-1.5 w-full py-1 bg-rose-950/40 hover:bg-rose-900/70 border border-rose-500/30 text-rose-300 hover:text-rose-200 rounded text-[9.5px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Reroll this check"
              >
                <RotateCcw size={11} />
                <span>Reroll Check</span>
              </button>
            </div>
          ) : (
            /* Standby Attached Output Block */
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-bold text-slate-200 truncate uppercase">
                    {checkLabel || 'Action Check'}
                  </span>
                  <span className="text-slate-500 text-[9px] font-mono">
                    ({customExpr || '2d10'})
                  </span>
                </div>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold border bg-cyan-950/40 text-cyan-300 border-cyan-500/40">
                  READY TO ROLL
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 py-1 px-2.5 bg-slate-900/60 rounded border border-slate-800/80">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono tracking-tight text-slate-600 leading-none">
                    --
                  </span>
                  {targetDC !== '' && (
                    <span className="text-[10px] font-mono text-rose-300/80">
                      Target: DC {targetDC}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Pool: {advantageDice > 0 ? `+${advantageDice} Advantage` : advantageDice < 0 ? `${advantageDice} Disadvantage` : '2d10 Standard'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 text-[9.5px] font-mono text-slate-400 py-0.5 px-2 bg-slate-900/30 rounded border border-slate-800/40 flex-wrap">
                <span>Net Mod: <strong className="text-rose-300">{totalCalculatedMod >= 0 ? `+${totalCalculatedMod}` : totalCalculatedMod}</strong></span>
                <span className="text-slate-600">•</span>
                <span>Crit: <strong className="text-emerald-400">&ge;{currentCritThreshold}</strong></span>
                <span className="text-slate-600">•</span>
                <span>Fumble: <strong className="text-yellow-400">&le;{currentFumbleThreshold}</strong></span>
              </div>

              <div className="text-[9.5px] font-mono text-slate-500 text-center py-1 bg-slate-900/40 rounded border border-slate-800/60">
                Awaiting roll execution. Tap <strong className="text-rose-400">CHECK</strong> or use polyhedral dice to roll.
              </div>
            </div>
          )}

          {/* Session Rolls Audit / All Rolls List */}
          <div className="flex flex-col gap-1.5 flex-1 min-h-0">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60 shrink-0">
              <span className="font-bold text-rose-400/90 uppercase tracking-wider">
                All Rolls ({history.length})
              </span>
              <span className="text-[9px] text-slate-500">
                {history.length > 0 ? 'Click to inspect telemetry' : 'None yet'}
              </span>
            </div>

            {history.length === 0 ? (
              <div className="p-3 rounded-lg border border-dashed border-slate-800/80 bg-slate-950/40 text-center text-[10px] font-mono text-slate-500">
                No rolls recorded yet. All executed checks will be displayed and stored here.
              </div>
            ) : (
              <div className="space-y-1.5 overflow-y-auto max-h-[220px] md:max-h-[300px] pr-0.5 no-scrollbar">
                {history.map((h, idx) => {
                  const isSelected = latestRoll && (latestRoll.id === h.id || latestRoll.timestamp === h.timestamp);
                  const isCrit = h.isCrit || h.outcome === 'Critical Success';
                  const isFumble = h.isFumble || h.outcome === 'Critical Failure';
                  return (
                    <div
                      key={h.id || h.timestamp || idx}
                      onClick={() => setLatestRoll(h)}
                      className={`p-1.5 rounded border transition-all cursor-pointer text-[10px] font-mono ${
                        isSelected
                          ? (isCrit
                              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-sm ring-1 ring-emerald-500/40'
                              : isFumble
                              ? 'bg-yellow-950/30 border-yellow-500/60 shadow-sm ring-1 ring-yellow-500/40'
                              : 'bg-rose-950/30 border-rose-500/60 shadow-sm ring-1 ring-rose-500/30')
                          : (isCrit
                              ? 'bg-emerald-950/15 border-emerald-900/40 hover:border-emerald-700/60'
                              : isFumble
                              ? 'bg-yellow-950/15 border-yellow-900/40 hover:border-yellow-700/60'
                              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700')
                      }`}
                      title="Click to view full telemetry for this roll"
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[9px] text-slate-500 font-bold shrink-0">
                            #{history.length - idx}
                          </span>
                          <span className="font-bold text-slate-200 truncate">
                            {h.label || 'Action Check'}
                          </span>
                          <span className="text-slate-500 text-[8.5px]">
                            ({h.expression})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isCrit ? (
                            <span className="px-1 py-0.2 rounded text-[8.5px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                              CRITICAL
                            </span>
                          ) : isFumble ? (
                            <span className="px-1 py-0.2 rounded text-[8.5px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_6px_rgba(234,179,8,0.3)]">
                              FUMBLE
                            </span>
                          ) : h.outcome ? (
                            <span className={`px-1 py-0.2 rounded text-[8.5px] font-bold border ${
                              h.outcome.includes('Success')
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                              {h.outcome.includes('Success') ? 'PASS' : 'FAIL'}
                            </span>
                          ) : null}
                          <span className={`text-xs font-black font-mono ml-1 ${
                            isCrit ? 'text-emerald-300' : isFumble ? 'text-yellow-400' : 'text-white'
                          }`}>
                            {h.finalTotal ?? h.total}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 gap-1">
                        <div className="truncate flex items-center gap-1">
                          <span className="text-slate-500">Dice:</span>
                          <span className={isCrit ? 'text-emerald-300 font-bold' : isFumble ? 'text-yellow-300 font-bold' : ''}>
                            [{h.keptDice ? h.keptDice.join(', ') : h.rolls?.map(r => r.value).join(', ')}]
                          </span>
                          {h.appliedModifier !== undefined && (
                            <span className="text-slate-500">
                              Mod: {h.appliedModifier >= 0 ? `+${h.appliedModifier}` : h.appliedModifier}
                            </span>
                          )}
                        </div>
                        {h.targetDC !== undefined && h.targetDC !== '' && h.targetDC !== null && (
                          <span className="text-slate-400 shrink-0">vs DC {h.targetDC}</span>
                        )}
                        {h.timestamp && (
                          <span className="text-slate-600 text-[8px] shrink-0">
                            {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Dice Roller Controls: Top on compact view (order-1), right side on standard view (order-2) */}
        <div className={`flex-1 min-w-0 flex flex-col gap-2.5 overflow-y-auto no-scrollbar ${isCompactLayout ? 'order-1' : 'order-2'}`}>

          {/* Check Purpose / Chat Identifier Field (Editable) + Save Formula Button */}
          <div className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Tag size={11} className="text-rose-400" />
              <span>Purpose / Chat ID:</span>
            </span>
            <input
              type="text"
              value={checkLabel}
              onChange={(e) => setCheckLabel(e.target.value)}
              placeholder="Check Label / Chat ID (e.g. Might +5, Pilot +10)"
              className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-rose-200 placeholder-slate-600 focus:outline-none focus:border-rose-400"
              title="Editable check purpose sent to chat comms and telemetry"
            />
            {checkLabel && (
              <button
                type="button"
                onClick={() => setCheckLabel('')}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Clear check label"
              >
                <X size={12} />
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveCustomString}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700 hover:border-rose-400/80 text-slate-300 hover:text-rose-300 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm"
              title="Save current formula & all adjustments to presets"
            >
              <BookmarkPlus size={12} className="text-rose-400" />
              <span>SAVE</span>
            </button>
          </div>

          {/* Save Confirmation Notification Banner */}
          {saveNotification && (
            <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-[10.5px] font-mono shadow-[0_0_12px_rgba(16,185,129,0.25)] animate-fade-in">
              <div className="flex items-center gap-1.5 truncate">
                <Check size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate font-bold">{saveNotification}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveNotification('')}
                className="text-emerald-400/70 hover:text-emerald-200 p-0.5 cursor-pointer"
                title="Dismiss notification"
              >
                <X size={11} />
              </button>
            </div>
          )}

          {/* Quick Access Presets Pill Bar (when saved formulas exist) */}
          {savedDiceStrings.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5">
              <span className="text-[9px] font-mono font-bold text-rose-400/80 uppercase tracking-tight shrink-0 flex items-center gap-1 mr-0.5">
                <Bookmark size={10} className="text-rose-400" />
                <span>Presets:</span>
              </span>
              {savedDiceStrings.map((s) => {
                const adv = s.advantageDice !== undefined ? Number(s.advantageDice) || 0 : 0;
                const net = (Number(s.baseModifier) || 0) + (Number(s.adHocModifier) || 0);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleLoadSavedPreset(s)}
                    className="px-2 py-0.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-rose-400/60 rounded text-[9.5px] font-mono text-slate-300 hover:text-rose-200 transition-all shrink-0 cursor-pointer flex items-center gap-1 shadow-sm group"
                    title={`Click to load "${s.label || s.expr}" with all noted adjustments`}
                  >
                    <span className="font-bold truncate max-w-[120px]">{s.label || s.expr}</span>
                    {adv !== 0 && (
                      <span className={`text-[8px] font-black ${adv > 0 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {adv > 0 ? `+${adv}A` : `${adv}D`}
                      </span>
                    )}
                    {net !== 0 && (
                      <span className="text-[8px] text-rose-400 font-bold">
                        {net > 0 ? `+${net}` : net}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 1. Dice Pool Modifier Block (-5 to +5 range with Standard to reset) */}
          <div className="space-y-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <Scale size={11} className="text-rose-400" />
                <span>Dice Pool Modifier:</span>
              </span>
              <span className={`text-[9.5px] font-bold ${
                advantageDice > 0 ? 'text-emerald-400' : advantageDice < 0 ? 'text-yellow-400' : 'text-slate-400'
              }`}>
                {advantageDice > 0 
                  ? `ADVANTAGE (+${advantageDice}d10: roll ${2 + advantageDice}, keep 2 highest)`
                  : advantageDice < 0
                  ? `DISADVANTAGE (${advantageDice}d10: roll ${2 + Math.abs(advantageDice)}, keep 2 lowest)`
                  : 'STANDARD (2d10 single check)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Standard Reset Button */}
              <button
                type="button"
                onClick={() => setAdvantageDice(0)}
                className={`w-28 py-1.5 rounded font-mono text-[10.5px] font-bold transition-all border text-center cursor-pointer shrink-0 ${
                  advantageDice === 0
                    ? 'bg-slate-800 text-slate-200 border-slate-600 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title="Reset to Standard (2d10)"
              >
                Standard (0)
              </button>

              {/* Incremental Value Field (-5 to +5) */}
              <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 px-2 flex-1 justify-between">
                <button
                  type="button"
                  disabled={advantageDice <= -5}
                  onClick={() => setAdvantageDice(prev => Math.max(-5, prev - 1))}
                  className="px-2.5 h-6 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700/90 text-yellow-400 hover:text-yellow-300 border border-slate-700/60 hover:border-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all shrink-0"
                  title="Apply Disadvantage (-1 die pool, min -5)"
                >
                  DISADVANTAGE
                </button>

                <input
                  type="number"
                  min={-5}
                  max={5}
                  value={advantageDice}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setAdvantageDice(Math.max(-5, Math.min(5, val)));
                    } else if (e.target.value === '' || e.target.value === '-') {
                      setAdvantageDice(0);
                    }
                  }}
                  className={`w-12 text-center bg-transparent py-0.5 text-xs font-mono font-bold focus:outline-none ${
                    advantageDice > 0 ? 'text-emerald-300' : advantageDice < 0 ? 'text-yellow-300' : 'text-slate-300'
                  }`}
                  title="Advantage / Disadvantage extra dice pool (-5 to +5)"
                />

                <button
                  type="button"
                  disabled={advantageDice >= 5}
                  onClick={() => setAdvantageDice(prev => Math.min(5, prev + 1))}
                  className="px-2.5 h-6 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700/90 text-emerald-400 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all shrink-0"
                  title="Apply Advantage (+1 die pool, max +5)"
                >
                  ADVANTAGE
                </button>
              </div>
            </div>
          </div>

          {/* 2. Modifier Engine Block: Base Score + Ad-Hoc / Situational Mod */}
          <div className="space-y-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="font-bold text-rose-400/90 uppercase tracking-wider">Modifier Engine:</span>
              <span className="text-[9px] text-cyan-300">
                Base ({baseModifier >= 0 ? `+${baseModifier}` : baseModifier}) + Mod ({adHocModifier >= 0 ? `+${adHocModifier}` : adHocModifier}) = <strong className="text-rose-300">Net {totalCalculatedMod >= 0 ? `+${totalCalculatedMod}` : totalCalculatedMod}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Base Score (From Folio Check or Custom Input) */}
              <div className="space-y-1 bg-slate-900/70 p-1.5 rounded border border-slate-800/80">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="font-bold text-rose-300 uppercase">Base Score:</span>
                  <button
                    type="button"
                    onClick={handleResetBaseScore}
                    className="text-[8px] text-slate-500 hover:text-rose-300 transition-colors cursor-pointer"
                    title={`Reset Base Score to base level (${initialBaseModRef.current >= 0 ? `+${initialBaseModRef.current}` : initialBaseModRef.current})`}
                  >
                    Reset ({initialBaseModRef.current !== 0 ? (initialBaseModRef.current > 0 ? `+${initialBaseModRef.current}` : initialBaseModRef.current) : '0'})
                  </button>
                </div>
                <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 rounded p-0.5 px-1 justify-between">
                  <button
                    type="button"
                    disabled={baseModifier <= -20}
                    onClick={() => handleBaseScoreChange(baseModifier - 1)}
                    className="w-12 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700/90 text-yellow-400 hover:text-yellow-300 border border-slate-700/60 hover:border-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold cursor-pointer transition-all"
                    title="Decrease base score (-1, min -20)"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={-20}
                    max={20}
                    value={baseModifier}
                    onChange={(e) => handleBaseScoreChange(e.target.value)}
                    className="w-12 text-center bg-transparent py-0.5 text-xs font-mono font-bold text-rose-300 focus:outline-none"
                    title="Base Score (-20 to +20)"
                  />
                  <button
                    type="button"
                    disabled={baseModifier >= 20}
                    onClick={() => handleBaseScoreChange(baseModifier + 1)}
                    className="w-12 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold cursor-pointer transition-all"
                    title="Increase base score (+1, max +20)"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Ad-Hoc / Situational Modifier */}
              <div className="space-y-1 bg-slate-900/70 p-1.5 rounded border border-slate-800/80">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="font-bold text-cyan-300 uppercase">Ad-Hoc Mod:</span>
                  <button
                    type="button"
                    onClick={handleResetAdHoc}
                    className="text-[8px] text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Clear Ad-Hoc Modifier to 0"
                  >
                    Clear (0)
                  </button>
                </div>
                <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 rounded p-0.5 px-1 justify-between">
                  <button
                    type="button"
                    disabled={adHocModifier <= -20}
                    onClick={() => handleAdHocChange(adHocModifier - 1)}
                    className="px-2 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700/90 text-yellow-400 hover:text-yellow-300 border border-slate-700/60 hover:border-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed text-[9.5px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all shrink-0"
                    title="Decrease ad-hoc modifier (-1 penalty, min -20)"
                  >
                    PENALTY
                  </button>
                  <input
                    type="number"
                    min={-20}
                    max={20}
                    value={adHocModifier}
                    onChange={(e) => handleAdHocChange(e.target.value)}
                    className="w-10 text-center bg-transparent py-0.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none"
                    title="Ad-Hoc / Situational Modifier (-20 to +20)"
                  />
                  <button
                    type="button"
                    disabled={adHocModifier >= 20}
                    onClick={() => handleAdHocChange(adHocModifier + 1)}
                    className="px-2 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700/90 text-emerald-400 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-[9.5px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all shrink-0"
                    title="Increase ad-hoc modifier (+1 bonus, max +20)"
                  >
                    BONUS
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Threat Ranges (Permanently Visible) */}
          <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 space-y-1.5 text-[10px] font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-rose-400" />
                <span>Threat Ranges:</span>
              </span>
              <span className="text-[9px] text-slate-400 flex items-center gap-1">
                <span className="text-emerald-400 font-bold">Crit: &ge;{currentCritThreshold}</span>
                <span className="text-slate-500">({critRangeSize}pt)</span>
                <span className="text-slate-600">•</span>
                <span className="text-yellow-400 font-bold">Fumble: &le;{currentFumbleThreshold}</span>
                <span className="text-slate-500">({fumbleRangeSize}pt)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
              {/* Crit Threat Range Stepper */}
              <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/50 p-1.5 rounded transition-all">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Flame size={11} className="text-emerald-400" />
                  <span>Crit (&ge;{currentCritThreshold})</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={critRangeSize <= 1}
                    onClick={() => setCritRangeSize(prev => Math.max(1, prev - 1))}
                    className="w-10 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/60 hover:border-emerald-500/80 disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer transition-all"
                    title="Shrink Crit Range (min 1 pt: 20 only)"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-emerald-400">{critRangeSize}</span>
                  <button
                    type="button"
                    disabled={critRangeSize >= 5}
                    onClick={() => setCritRangeSize(prev => Math.min(5, prev + 1))}
                    className="w-10 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/80 disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer transition-all"
                    title="Expand Crit Range (max 5 pts: 16-20)"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Fumble Threat Range Stepper */}
              <div className="flex items-center justify-between bg-yellow-950/20 border border-yellow-500/30 hover:border-yellow-500/50 p-1.5 rounded transition-all">
                <span className="text-yellow-400 font-bold flex items-center gap-1">
                  <Skull size={11} className="text-yellow-400" />
                  <span>Fumble (&le;{currentFumbleThreshold})</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={fumbleRangeSize <= 1}
                    onClick={() => setFumbleRangeSize(prev => Math.max(1, prev - 1))}
                    className="w-10 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/60 hover:border-yellow-500/80 disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer transition-all"
                    title="Shrink Fumble Range (min 1 pt: 2 only)"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-yellow-400">{fumbleRangeSize}</span>
                  <button
                    type="button"
                    disabled={fumbleRangeSize >= 5}
                    onClick={() => setFumbleRangeSize(prev => Math.min(5, prev + 1))}
                    className="w-10 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-yellow-300 border border-slate-700/60 hover:border-yellow-500/80 disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer transition-all"
                    title="Expand Fumble Range (max 5 pts: 2-6)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Target Difficulty Class (DC) Presets (Fully Visible Block Grid) */}
          <div className="space-y-1 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
              <span className="font-bold text-rose-400/90 uppercase tracking-wider flex items-center gap-1">
                <Target size={11} className="text-rose-400" />
                <span>Target DC:</span>
              </span>
              <span className="text-[9px] text-slate-400">
                {targetDC !== '' ? `Active DC: ${targetDC}` : 'No target DC set'}
              </span>
            </div>

            {/* 4x2 Grid of all 8 Difficulty Classes (Fully Visible Block) */}
            <div className="grid grid-cols-4 gap-1">
              {Object.entries(targetDCs).map(([name, dcVal]) => {
                const isSelected = String(targetDC) === String(dcVal) || String(targetDC).toLowerCase() === name.toLowerCase();
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setTargetDC(isSelected ? '' : dcVal)}
                    className={`py-1 px-1 rounded text-[9.5px] font-mono font-bold text-center transition-all border cursor-pointer truncate ${
                      isSelected
                        ? 'bg-rose-500/30 text-rose-200 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
                        : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                    title={`${name.toUpperCase()} DC: ${dcVal}`}
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)} ({dcVal})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5 & 6. Quick & Custom Polyhedral Rolls Accordion (Collapsed by Default) */}
          <div className="bg-slate-950/70 rounded-lg border border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCustomRollAccordion(prev => !prev)}
              className="w-full p-2 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 hover:text-rose-300 transition-colors cursor-pointer select-none"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-rose-400/90">
                <Dices size={12} className="text-rose-400" />
                <span>Quick & Custom Polyhedral Rolls</span>
              </span>
              <span className="flex items-center gap-1 text-[9px] text-slate-500 font-normal">
                <span>{showCustomRollAccordion ? 'Collapse' : 'Expand'}</span>
                {showCustomRollAccordion ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </span>
            </button>

            {showCustomRollAccordion && (
              <div className="p-2 pt-0 space-y-2 border-t border-slate-800/80">
                {/* Quick Polyhedral Dice Row */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 mb-1">
                    <span className="uppercase font-bold text-slate-400">Quick Polyhedral Die:</span>
                    <span className="text-[9px] text-slate-500">Instant Roll</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {PRESET_DICE.map((p) => (
                      <button
                        key={p.expr}
                        type="button"
                        onClick={() => {
                          setCustomExpr(p.expr);
                          handleRoll(p.expr);
                        }}
                        className="py-1 px-1 rounded bg-slate-900/90 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-200 text-[11px] font-mono font-bold text-center transition-all cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Formula & Custom Check Button */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="flex-1 flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1">
                    <span className="text-slate-500 text-xs font-mono mr-1">Roll:</span>
                    <input
                      type="text"
                      value={customExpr}
                      onChange={(e) => setCustomExpr(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRoll(customExpr); }}
                      placeholder="2d10+4"
                      className="w-full bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
                    />
                  </div>

                  <div className="w-20 flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                    <Target size={12} className="text-slate-500 mr-1 shrink-0" />
                    <input
                      type="number"
                      value={targetDC}
                      onChange={(e) => setTargetDC(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRoll(customExpr); }}
                      placeholder="DC"
                      className="w-full bg-transparent text-xs font-mono text-rose-300 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRoll(customExpr)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1"
                    title="Roll custom dice formula"
                  >
                    <Dices size={13} />
                    <span>Custom Check</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCustomString}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-400/70 text-slate-300 hover:text-rose-300 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Save current formula to your saved presets"
                  >
                    <BookmarkPlus size={14} />
                  </button>
                </div>

                {/* Saved Custom Strings List with All Adjustments Noted */}
                {savedDiceStrings.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span className="uppercase font-bold text-rose-400/90 flex items-center gap-1">
                        <Bookmark size={10} className="text-rose-400" />
                        <span>Saved Formulas & Noted Adjustments:</span>
                      </span>
                      <span className="text-slate-500">{savedDiceStrings.length} saved</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {savedDiceStrings.map((s) => {
                        const adv = s.advantageDice !== undefined ? Number(s.advantageDice) || 0 : 0;
                        const bMod = s.baseModifier !== undefined ? Number(s.baseModifier) || 0 : 0;
                        const aMod = s.adHocModifier !== undefined ? Number(s.adHocModifier) || 0 : 0;
                        const netMod = bMod + aMod;
                        const critSize = s.critRangeSize !== undefined ? Number(s.critRangeSize) || 1 : 1;
                        const fumbleSize = s.fumbleRangeSize !== undefined ? Number(s.fumbleRangeSize) || 1 : 1;
                        const critThresh = 21 - critSize;
                        const fumbleThresh = 1 + fumbleSize;
                        const dc = s.targetDC !== undefined && s.targetDC !== null ? String(s.targetDC) : '';

                        const tooltipParts = [
                          `Formula: ${s.expr}`,
                          s.label ? `Purpose: ${s.label}` : null,
                          adv > 0 ? `Advantage: +${adv} die` : adv < 0 ? `Disadvantage: ${adv} die` : 'Pool: Standard',
                          `Net Mod: ${netMod >= 0 ? `+${netMod}` : netMod} (Base: ${bMod >= 0 ? `+${bMod}` : bMod}${aMod !== 0 ? `, Ad-Hoc: ${aMod >= 0 ? `+${aMod}` : aMod}` : ''})`,
                          critSize > 1 ? `Crit: >=${critThresh}` : 'Crit: 20',
                          fumbleSize > 1 ? `Fumble: <=${fumbleThresh}` : 'Fumble: 2',
                          dc ? `Target DC: ${dc}` : null
                        ].filter(Boolean).join(' • ');

                        return (
                          <div
                            key={s.id}
                            className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/50 rounded-lg p-2 text-xs font-mono transition-all group flex flex-col justify-between gap-1.5 shadow-sm"
                          >
                            {/* Top row: Label, formula, quick roll, and delete */}
                            <div className="flex items-center justify-between gap-1">
                              <button
                                type="button"
                                onClick={() => handleLoadSavedPreset(s)}
                                className="flex items-center gap-1.5 text-left min-w-0 flex-1 cursor-pointer group/btn"
                                title={`Click to load into roller: ${tooltipParts}`}
                              >
                                <Bookmark size={11} className="text-rose-400 shrink-0 group-hover/btn:scale-110 transition-transform" />
                                <span className="font-bold text-slate-200 group-hover/btn:text-rose-300 truncate">
                                  {s.label || s.expr}
                                </span>
                                {s.label && s.label !== s.expr && (
                                  <span className="text-[9.5px] text-cyan-400/80 font-bold shrink-0">
                                    [{s.expr}]
                                  </span>
                                )}
                              </button>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoadSavedPreset(s, true);
                                  }}
                                  className="px-1.5 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 border border-rose-500/40 text-[9px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                                  title="Quick Roll this preset immediately with all noted adjustments"
                                >
                                  <Dices size={10} />
                                  <span>ROLL</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSavedString(s.id);
                                  }}
                                  className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors cursor-pointer"
                                  title="Delete saved formula"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            </div>

                            {/* Noted Adjustments Badges */}
                            <div
                              onClick={() => handleLoadSavedPreset(s)}
                              className="flex items-center gap-1 flex-wrap cursor-pointer text-[8.5px]"
                              title={`Click to load into roller: ${tooltipParts}`}
                            >
                              {/* Advantage / Disadvantage Badge */}
                              {adv !== 0 ? (
                                <span className={`px-1.5 py-0.2 rounded font-bold border ${
                                  adv > 0
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                                }`}>
                                  {adv > 0 ? `+${adv} ADV` : `${adv} DISADV`}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-slate-500 bg-slate-950/60 border border-slate-800">
                                  Std Pool
                                </span>
                              )}

                              {/* Modifier Badge */}
                              {netMod !== 0 || bMod !== 0 || aMod !== 0 ? (
                                <span className="px-1.5 py-0.2 rounded font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                  Mod {netMod >= 0 ? `+${netMod}` : netMod}
                                  {aMod !== 0 && (
                                    <span className="text-[7.5px] opacity-80 ml-0.5">
                                      ({bMod >= 0 ? `+${bMod}` : bMod}{aMod > 0 ? `+${aMod}` : aMod})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-slate-500 bg-slate-950/60 border border-slate-800">
                                  Mod +0
                                </span>
                              )}

                              {/* Crit Range Badge */}
                              {critSize > 1 && (
                                <span className="px-1.5 py-0.2 rounded font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/40">
                                  Crit &ge;{critThresh}
                                </span>
                              )}

                              {/* Fumble Range Badge */}
                              {fumbleSize > 1 && (
                                <span className="px-1.5 py-0.2 rounded font-bold bg-yellow-950/40 text-yellow-400 border border-yellow-500/40">
                                  Fumble &le;{fumbleThresh}
                                </span>
                              )}

                              {/* Target DC Badge */}
                              {dc !== '' && (
                                <span className="px-1.5 py-0.2 rounded font-bold bg-cyan-950/50 text-cyan-300 border border-cyan-500/40">
                                  DC {dc}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>



          {/* Reset All Fields Button (Moved to Bottom) */}
          <button
            type="button"
            onClick={handleResetAll}
            className="w-full py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-rose-300 text-xs font-mono font-bold rounded-lg border border-slate-700/80 hover:border-rose-500/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] shadow-sm shrink-0"
            title="Reset all fields back to base level score"
          >
            <RotateCcw size={13} className="text-rose-400" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Resizable Window Handles (Active when not maximized) */}
      {!isMaximized && (
        <>
          {/* Bottom-Right Corner Handle */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'bottom-right')}
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 z-50 text-rose-500/50 hover:text-rose-400 transition-colors group select-none touch-none"
            title="Drag to resize modal"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" className="fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round">
              <line x1="11" y1="3" x2="3" y2="11" />
              <line x1="11" y1="7" x2="7" y2="11" />
              <line x1="11" y1="11" x2="10" y2="11" />
            </svg>
          </div>

          {/* Bottom-Left Corner Handle */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'bottom-left')}
            className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize flex items-end justify-start p-1 z-50 text-rose-500/50 hover:text-rose-400 transition-colors group select-none touch-none"
            title="Drag to resize modal"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" className="fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="3" x2="9" y2="11" />
              <line x1="1" y1="7" x2="5" y2="11" />
              <line x1="1" y1="11" x2="2" y2="11" />
            </svg>
          </div>

          {/* Right Edge Handle */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'right')}
            className="absolute top-10 right-0 bottom-6 w-2 cursor-ew-resize hover:bg-rose-400/20 transition-colors z-40 select-none touch-none"
            title="Drag to resize width"
          />

          {/* Bottom Edge Handle */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'bottom')}
            className="absolute bottom-0 left-6 right-6 h-2 cursor-ns-resize hover:bg-rose-400/20 transition-colors z-40 select-none touch-none"
            title="Drag to resize height"
          />

          {/* Left Edge Handle */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'left')}
            className="absolute top-10 left-0 bottom-6 w-2 cursor-ew-resize hover:bg-rose-400/20 transition-colors z-40 select-none touch-none"
            title="Drag to resize width"
          />
        </>
      )}
    </div>
  );
};

export default DiceRollerDock;
