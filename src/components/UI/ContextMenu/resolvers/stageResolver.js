import { 
  Dices, 
  Shield, 
  Swords, 
  Heart, 
  Zap, 
  AlertTriangle, 
  Eye, 
  MapPin, 
  RefreshCw,
  Flame,
  Activity
} from 'lucide-react';

/**
 * Resolves context menu options for the TACTICAL STAGE / VTT Module.
 */
export function resolveStageMenu(context, appState, handlers) {
  const { entityId, entityType, entityData } = context;
  const items = [];

  const tokenName = entityData?.name || entityData?.label || 'Combatant';

  // 1. TOKEN TARGETED ACTIONS
  if (entityType === 'token' || entityId || entityData) {
    items.push(
      {
        type: 'section-header',
        label: `Combatant: ${tokenName}`
      },
      {
        id: 'stage-roll-dual-resolution',
        label: 'Roll Dual Resolution (2d10 + Mod vs Def)',
        icon: Dices,
        shortcut: '2d10',
        onClick: () => handlers.rollDice?.({ 
          label: `Dual Resolution: ${tokenName}`, 
          formula: '2d10 + Combat Skill',
          defenderRule: 'Defender wins ties'
        })
      },
      {
        id: 'stage-apply-condition',
        label: 'Apply Status Condition',
        icon: AlertTriangle,
        children: [
          {
            id: 'cond-stunned',
            label: 'Stunned (Lose 1 action, -2 Defense)',
            onClick: () => handlers.applyCondition?.('Stunned', entityId)
          },
          {
            id: 'cond-blinded',
            label: 'Blinded (-4 to all combat checks)',
            onClick: () => handlers.applyCondition?.('Blinded', entityId)
          },
          {
            id: 'cond-prone',
            label: 'Prone (Disadvantage vs Melee, Cover vs Ranged)',
            onClick: () => handlers.applyCondition?.('Prone', entityId)
          },
          {
            id: 'cond-overheated',
            label: 'Overheated / Strained (Augmentations Disabled)',
            onClick: () => handlers.applyCondition?.('Overheated', entityId)
          },
          {
            id: 'cond-clear',
            label: 'Clear All Conditions',
            onClick: () => handlers.applyCondition?.('Clear', entityId)
          }
        ]
      },
      {
        id: 'stage-called-shot',
        label: 'Called Shot Targeting',
        icon: Swords,
        children: [
          {
            id: 'shot-head',
            label: 'Head / Central CPU (-2 penalty)',
            onClick: () => handlers.rollDice?.({ label: `Called Shot [Head] on ${tokenName}`, penalty: -2 })
          },
          {
            id: 'shot-arms',
            label: 'Arms / Manipulator (-2 penalty)',
            onClick: () => handlers.rollDice?.({ label: `Called Shot [Arms] on ${tokenName}`, penalty: -2 })
          },
          {
            id: 'shot-legs',
            label: 'Legs / Locomotion (-1 penalty)',
            onClick: () => handlers.rollDice?.({ label: `Called Shot [Legs] on ${tokenName}`, penalty: -1 })
          },
          {
            id: 'shot-optics',
            label: 'Optics / Sensors (-3 penalty)',
            onClick: () => handlers.rollDice?.({ label: `Called Shot [Optics] on ${tokenName}`, penalty: -3 })
          }
        ]
      },
      { type: 'divider' },
      {
        id: 'stage-focus-camera',
        label: 'Center Camera on Token',
        icon: Eye,
        onClick: () => handlers.focusToken?.(entityId)
      }
    );
  }

  // 2. STAGE BACKGROUND / GRID ACTIONS
  else {
    items.push(
      {
        type: 'section-header',
        label: 'Stage Operations'
      },
      {
        id: 'quick-roll-2d10',
        label: 'Quick Roll 2d10 Check',
        icon: Dices,
        shortcut: '2d10',
        onClick: () => handlers.rollDice?.({ label: 'Quick Check', formula: '2d10' })
      },
      {
        id: 'stage-ping',
        label: 'Ping Map Location',
        icon: MapPin,
        onClick: () => handlers.pingLocation?.(context.clickCoords)
      },
      {
        id: 'stage-reset-camera',
        label: 'Reset Tactical Camera View',
        icon: RefreshCw,
        onClick: () => handlers.resetCamera?.()
      }
    );
  }

  return items;
}

export default resolveStageMenu;
