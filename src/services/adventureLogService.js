/**
 * TANGENT SFF RP: Adventure Log Service
 * Persistent telemetry, event logging, and narrative chronicler for the Virtual Tabletop.
 * Records combat strikes, initiative rolls, environmental hazard ticks, vitals/conditions,
 * and custom GM narrative notes.
 */

import { StorageService } from './storageService';

export const LOG_CATEGORIES = {
  ALL: 'all',
  COMBAT: 'combat',
  INITIATIVE: 'initiative',
  ENVIRONMENT: 'environment',
  NARRATIVE: 'narrative',
  VITALS: 'vitals',
  CONDITION: 'condition',
  AWARDS: 'awards'
};

export const ACTOR_TYPES = {
  PC: 'pc',
  NPC: 'npc',
  ENVIRONMENT: 'environment',
  GM: 'gm',
  SYSTEM: 'system'
};

class AdventureLogManager {
  constructor() {
    this.logs = [];
    this.listeners = new Set();
    this.currentMapId = null;
    this.isInitialized = false;

    // Load initial logs from local storage if available
    this.init();
  }

  async init(mapId = null) {
    if (mapId) this.currentMapId = mapId;
    const storageKey = this.getStorageKey();

    try {
      const stored = await StorageService.getItem(storageKey);
      if (Array.isArray(stored)) {
        this.logs = stored;
      } else {
        const local = localStorage.getItem(storageKey);
        if (local) {
          this.logs = JSON.parse(local);
        }
      }
    } catch (e) {
      console.warn('[AdventureLogService] Failed to load cached logs:', e);
    }

    this.isInitialized = true;
    this.notify();
  }

  getStorageKey() {
    return this.currentMapId
      ? `tangent_vtt_adventure_log_${this.currentMapId}`
      : 'tangent_vtt_adventure_log_global';
  }

  async persist() {
    const storageKey = this.getStorageKey();
    try {
      // Keep most recent 500 logs to preserve performance and storage limits
      const trimmed = this.logs.slice(-500);
      await StorageService.setItem(storageKey, trimmed);
      localStorage.setItem(storageKey, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('[AdventureLogService] Persistence error:', e);
    }
  }

  setMapId(mapId) {
    if (this.currentMapId === mapId) return;
    this.currentMapId = mapId;
    this.init(mapId);
  }

  /**
   * Subscribe to real-time log updates
   * @param {Function} callback 
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
      // Immediately pass current logs
      callback(this.getLogs());
    }
    return () => {
      this.listeners.delete(callback);
    };
  }

  notify() {
    const logsCopy = this.getLogs();
    this.listeners.forEach(cb => {
      try {
        cb(logsCopy);
      } catch (err) {
        console.error('[AdventureLogService] Error in subscriber:', err);
      }
    });
  }

  getLogs(category = LOG_CATEGORIES.ALL) {
    if (category === LOG_CATEGORIES.ALL) {
      return [...this.logs];
    }
    return this.logs.filter(l => l.category === category);
  }

  /**
   * Primary logging method
   */
  log({
    category = LOG_CATEGORIES.COMBAT,
    type = 'action',
    actor = 'Unknown',
    actorType = ACTOR_TYPES.SYSTEM,
    target = null,
    summary = '',
    details = '',
    badge = null,
    isCrit = false,
    isCritFail = false,
    round = 1,
    metadata = {}
  }) {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp,
      isoDate: now.toISOString(),
      round: round || 1,
      category,
      type,
      actor,
      actorType,
      target,
      summary: summary || details || 'Action resolved',
      details: details || summary || '',
      badge: badge || this.getDefaultBadge(category, type, actorType),
      isCrit: Boolean(isCrit),
      isCritFail: Boolean(isCritFail),
      metadata: metadata || {}
    };

    this.logs.push(logEntry);
    this.notify();
    this.persist();

    return logEntry;
  }

  getDefaultBadge(category, type, actorType) {
    if (category === LOG_CATEGORIES.INITIATIVE) return '⚡';
    if (category === LOG_CATEGORIES.ENVIRONMENT || actorType === ACTOR_TYPES.ENVIRONMENT) return '🌋';
    if (category === LOG_CATEGORIES.NARRATIVE || actorType === ACTOR_TYPES.GM) return '📝';
    if (category === LOG_CATEGORIES.AWARDS) return '✨';
    if (category === LOG_CATEGORIES.CONDITION) return '✨';
    if (category === LOG_CATEGORIES.VITALS) return '🩸';
    if (type === 'hit' || type === 'strike') return '⚔️';
    if (type === 'miss') return '💨';
    return '🔹';
  }

  /**
   * Logs an initiative roll breakdown
   */
  logInitiativeRoll({ actor, actorType = ACTOR_TYPES.PC, rollSubtotal, modifier = 0, total, details, round = 1 }) {
    return this.log({
      category: LOG_CATEGORIES.INITIATIVE,
      type: 'initiative_roll',
      actor,
      actorType,
      round,
      badge: '⚡',
      summary: `${actor} rolled Initiative: #${total}`,
      details: details || `Rolled 2d10 (${rollSubtotal}) + ${modifier >= 0 ? `+${modifier}` : modifier} Reflex = ${total}`,
      metadata: { rollSubtotal, modifier, total }
    });
  }

  /**
   * Logs round / turn start
   */
  logTurnChange({ actor, actorType, round, initiative = null }) {
    const typeLabel = actorType === ACTOR_TYPES.ENVIRONMENT ? '[ENV]' : actorType === ACTOR_TYPES.PC ? '[PC]' : '[NPC]';
    return this.log({
      category: LOG_CATEGORIES.INITIATIVE,
      type: 'turn_start',
      actor,
      actorType,
      round,
      badge: actorType === ACTOR_TYPES.ENVIRONMENT ? '🌋' : '⏱️',
      summary: `${typeLabel} ${actor}'s Turn (Init #${initiative ?? '--'})`,
      details: `Active initiative count #${initiative ?? '--'} for Round ${round}.`
    });
  }

  logRoundStart(roundNumber) {
    return this.log({
      category: LOG_CATEGORIES.INITIATIVE,
      type: 'round_start',
      actor: 'System',
      actorType: ACTOR_TYPES.SYSTEM,
      round: roundNumber,
      badge: '🔔',
      summary: `═══ ROUND ${roundNumber} COMMENCED ═══`,
      details: `All combatant reactions refreshed. Round ${roundNumber} initiative phase active.`
    });
  }

  /**
   * Custom GM Narrative Note
   */
  addNarrativeNote(text, author = 'Architect') {
    if (!text || !text.trim()) return null;
    return this.log({
      category: LOG_CATEGORIES.NARRATIVE,
      type: 'gm_note',
      actor: author,
      actorType: ACTOR_TYPES.GM,
      badge: '📜',
      summary: text.length > 80 ? text.substring(0, 80) + '...' : text,
      details: text.trim()
    });
  }

  /**
   * Clear all adventure logs
   */
  async clearLogs() {
    this.logs = [];
    this.notify();
    await this.persist();
  }

  /**
   * Export adventure log as formatted Markdown report
   */
  exportAsMarkdown(title = 'VTT Adventure Debrief') {
    const nowStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    let md = `# 🌌 ${title}\n`;
    md += `**Date:** ${nowStr} · **Total Events Logged:** ${this.logs.length}\n\n`;
    md += `---\n\n`;

    if (this.logs.length === 0) {
      md += `*No events recorded in the adventure log during this operational cycle.*\n\n`;
      return md;
    }

    // Group events by round
    const rounds = {};
    this.logs.forEach(entry => {
      const r = entry.round || 1;
      if (!rounds[r]) rounds[r] = [];
      rounds[r].push(entry);
    });

    Object.keys(rounds).sort((a, b) => Number(a) - Number(b)).forEach(rNum => {
      md += `### ⏱️ Round ${rNum}\n\n`;
      rounds[rNum].forEach(e => {
        const critBadge = e.isCrit ? ' 🌟 **CRITICAL!**' : e.isCritFail ? ' 💀 **FUMBLE!**' : '';
        const targetStr = e.target ? ` ➔ *Target: ${e.target}*` : '';
        md += `- **[${e.timestamp}]** ${e.badge || '🔹'} **${e.actor}** (${(e.actorType || 'system').toUpperCase()}): ${e.summary}${critBadge}${targetStr}\n`;
        if (e.details && e.details !== e.summary) {
          md += `  > *${e.details}*\n`;
        }
      });
      md += `\n`;
    });

    md += `---\n`;
    md += `*Synthesized by Tangent SF RP VTT Tactical Blackbox*\n`;
    return md;
  }

  exportAsJson() {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const AdventureLogService = new AdventureLogManager();
export default AdventureLogService;
