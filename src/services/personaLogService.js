import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { StorageService } from './storageService';

export const ACTION_TYPES = {
  SKILL_CHECK: 'SKILL_CHECK',
  ATTR_CHECK: 'ATTR_CHECK',
  ATTACK_ROLL: 'ATTACK_ROLL',
  VITALS_CHANGE: 'VITALS_CHANGE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  GEAR_CHANGE: 'GEAR_CHANGE',
  REST_CYCLE: 'REST_CYCLE',
  VTT_ACTION: 'VTT_ACTION'
};

export const getPersonaLogChannelId = (personaId) => {
  if (!personaId) return null;
  return `persona_log_${personaId}`;
};

export const PersonaLogService = {
  /**
   * Ensures a dedicated read-only telemetry channel document exists for the persona
   */
  async ensurePersonaLogChannel({ personaId, personaName, ownerId, gmId = null }) {
    if (!personaId) return null;
    const channelId = getPersonaLogChannelId(personaId);
    const cleanName = personaName || 'Operative';

    const channelData = {
      id: channelId,
      name: `log_${personaId}`,
      displayName: `📋 ${cleanName} Action Log`,
      topic: `Read-only action telemetry and session blackbox for ${cleanName}.`,
      type: 'persona_log',
      personaId: String(personaId),
      personaName: cleanName,
      isPublic: false,
      isReadOnly: true,
      createdById: ownerId || 'system',
      members: Array.from(new Set([ownerId, gmId].filter(Boolean))),
      updatedAt: new Date().toISOString()
    };

    if (db) {
      try {
        const chanRef = doc(db, 'channels', channelId);
        const snap = await getDoc(chanRef);
        if (!snap.exists()) {
          await setDoc(chanRef, {
            ...channelData,
            createdAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.warn('[PersonaLogService] Firestore ensure channel fallback:', err);
      }
    }

    // Save/update local channel cache
    try {
      const cached = (await StorageService.getItem('tangent_channels')) || [];
      if (!cached.some(c => c.id === channelId)) {
        await StorageService.setItem('tangent_channels', [channelData, ...cached]);
      }
    } catch (e) {
      // Ignored
    }

    return channelData;
  },

  /**
   * Appends an immutable telemetry log entry to the persona's read-only log channel
   */
  async logAction({
    personaId,
    personaName = 'Operative',
    actionType = ACTION_TYPES.SKILL_CHECK,
    summary = '',
    details = null,
    metadata = {},
    actorId = 'system',
    actorHandle = 'ENGINE TELEMETRY',
    gmId = null
  }) {
    if (!personaId) return null;
    const channelId = getPersonaLogChannelId(personaId);

    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      channelId,
      text: `[${actionType}] ${summary}`,
      type: 'persona_log_entry',
      actionType,
      summary,
      details,
      metadata: metadata || {},
      personaId: String(personaId),
      personaName,
      senderId: actorId,
      senderHandle: actorHandle,
      isReadOnlyLog: true,
      createdAt: new Date().toISOString(),
      createdLocalAt: new Date().toISOString()
    };

    // Update local storage cache immediately for zero-latency audit replay
    try {
      const cacheKey = `tangent_persona_log_${personaId}`;
      const cached = (await StorageService.getItem(cacheKey)) || [];
      const updated = [logEntry, ...cached].slice(0, 200);
      await StorageService.setItem(cacheKey, updated);
    } catch (e) {
      console.warn('[PersonaLogService] Local cache save error:', e);
    }

    if (db) {
      try {
        // Ensure channel doc exists first
        await this.ensurePersonaLogChannel({
          personaId,
          personaName,
          ownerId: actorId,
          gmId
        });

        const messagesRef = collection(db, 'channels', channelId, 'messages');
        await addDoc(messagesRef, {
          ...logEntry,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('[PersonaLogService] Firestore log write error (using local cache):', err);
      }
    }

    return logEntry;
  },

  /**
   * Real-time subscription to a persona's action log entries
   */
  subscribeToPersonaLog(personaId, callback, maxLimit = 100) {
    if (!personaId) {
      callback([]);
      return () => {};
    }

    const channelId = getPersonaLogChannelId(personaId);
    const cacheKey = `tangent_persona_log_${personaId}`;

    const deliverCache = async () => {
      try {
        const cached = (await StorageService.getItem(cacheKey)) || [];
        callback(cached.slice().reverse());
      } catch (e) {
        callback([]);
      }
    };

    if (!db) {
      deliverCache();
      return () => {};
    }

    try {
      const messagesRef = collection(db, 'channels', channelId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(maxLimit));

      const unsub = onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sync local storage cache
        StorageService.setItem(cacheKey, logs.slice().reverse()).catch(() => {});
        callback(logs);
      }, (err) => {
        console.warn('[PersonaLogService] Error listening to persona log, using cache:', err);
        deliverCache();
      });

      return unsub;
    } catch (err) {
      deliverCache();
      return () => {};
    }
  },

  /**
   * Get past log history from cache
   */
  async getPersonaLogHistory(personaId) {
    if (!personaId) return [];
    try {
      const cacheKey = `tangent_persona_log_${personaId}`;
      const cached = (await StorageService.getItem(cacheKey)) || [];
      return cached;
    } catch (e) {
      return [];
    }
  }
};

export default PersonaLogService;
