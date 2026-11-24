/**
 * @file stageMacroDispatcher.ts
 * @description Validates and executes queued StageAPI intents returned by QuickJSSandbox.executeWithActions
 *   with Architect vs Operative role gating.
 */

import type { StageMacroAction } from '../engine/scripting/QuickJSSandbox.ts';
import { useEngineStore } from '../engine/state/VolatileSharder.ts';
import { VttEventBus } from '../utils/vttEventBus.ts';
import { getVttMultiplayerSync } from './vttMultiplayerSyncService.ts';
import { proAudioMixerService } from './proAudioMixerService.ts';

export interface MacroDispatchOptions {
  role: 'architect' | 'operative';
  allowedTokenIds?: string[];
  onToggleDoor?: (wallId: string) => void;
  onSetStoryFlag?: (key: string, value: boolean | number | string) => void;
}

export interface MacroDispatchReport {
  applied: number;
  denied: number;
  errors: string[];
}

export function dispatchStageMacroActions(
  actions: StageMacroAction[],
  options: MacroDispatchOptions
): MacroDispatchReport {
  if (!Array.isArray(actions) || actions.length === 0) {
    return { applied: 0, denied: 0, errors: [] };
  }

  const isArchitect = options.role === 'architect';
  const allowedTokens = new Set(options.allowedTokenIds || []);
  const store = useEngineStore.getState();
  const sync = getVttMultiplayerSync();
  let applied = 0;
  let denied = 0;
  const errors: string[] = [];

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'move_token': {
          if (!isArchitect && !allowedTokens.has(action.tokenId)) {
            denied++;
            errors.push(`Denied move_token on "${action.tokenId}" for Operative role.`);
            break;
          }
          store.updatePosition(action.tokenId, action.x, action.y);
          sync.broadcastTokenMove(action.tokenId, action.x, action.y);
          applied++;
          break;
        }
        case 'apply_damage': {
          if (!isArchitect && !allowedTokens.has(action.tokenId)) {
            denied++;
            errors.push(`Denied apply_damage on "${action.tokenId}" for Operative role.`);
            break;
          }
          store.applyDamage(action.tokenId, {
            amount: action.amount,
            ...(action.isLethal !== undefined ? { isLethal: action.isLethal } : {})
          });
          const eph = useEngineStore.getState().ephemeralData[action.tokenId];
          if (eph) sync.broadcastTokenVitals(action.tokenId, eph);
          applied++;
          break;
        }
        case 'add_effect': {
          if (!isArchitect) {
            denied++;
            errors.push(`Denied add_effect on "${action.tokenId}": Architect required.`);
            break;
          }
          store.addActiveEffect(action.tokenId, {
            id: `macro_eff_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: action.name,
            remainingRounds: action.rounds,
            ...(action.tickDamage !== undefined ? { tickDamage: action.tickDamage } : {}),
            ...(action.isLethal !== undefined ? { isLethal: action.isLethal } : {})
          });
          const eph = useEngineStore.getState().ephemeralData[action.tokenId];
          if (eph) sync.broadcastTokenVitals(action.tokenId, eph);
          applied++;
          break;
        }
        case 'toggle_door': {
          if (!isArchitect) {
            denied++;
            errors.push(`Denied toggle_door "${action.wallId}": Architect required.`);
            break;
          }
          if (typeof options.onToggleDoor === 'function') {
            options.onToggleDoor(action.wallId);
          } else {
            VttEventBus.emit('stage-bulkhead-toggled', { bulkheadId: action.wallId, isOpen: true });
            sync.broadcastDoorToggle(action.wallId, true, 'open');
          }
          applied++;
          break;
        }
        case 'play_audio': {
          if (!isArchitect) {
            denied++;
            errors.push(`Denied play_audio "${action.cueId}": Architect required.`);
            break;
          }
          void proAudioMixerService.playCue(action.bus || 'sfx', action.cueId, true);
          applied++;
          break;
        }
        case 'set_flag': {
          if (!isArchitect) {
            denied++;
            errors.push(`Denied set_flag "${action.key}": Architect required.`);
            break;
          }
          options.onSetStoryFlag?.(action.key, action.value);
          applied++;
          break;
        }
        case 'emit_chat': {
          const card = {
            id: `macro_chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toISOString(),
            sender: isArchitect ? 'Architect Macro' : 'Operative Macro',
            visibility: action.visibility || 'public',
            kind: 'system' as const,
            title: action.title,
            body: action.message
          };
          VttEventBus.emit('stage-chat-card', card);
          if (card.visibility === 'public') {
            sync.broadcastChatCard(card);
          }
          applied++;
          break;
        }
      }
    } catch (err: any) {
      errors.push(err?.message || 'Action dispatch error');
    }
  }

  return { applied, denied, errors };
}
