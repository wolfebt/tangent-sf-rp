/**
 * @file FirestoreDebouncer.ts
 * @description Stage 1.6: GCP rate-limit protection and catastrophic data-loss prevention.
 * Observes Yjs mutations and executes throttled, batched updates to the Tangent DBM.
 */

import { doc, getDoc, setDoc, type Firestore, type DocumentReference } from 'firebase/firestore';
import * as Y from 'yjs';
import { auth as defaultAuth, db as defaultDb } from '../../firebase.js';

export interface FirestoreDebouncerOptions {
  ownerId?: string;
  memberIds?: string[];
  collectionRoot?: 'Campaigns' | 'user_stories';
}

// Polyfill function for Uint8Array to Base64
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class FirestoreDebouncer {
  private db: Firestore;
  private targetDocRef: DocumentReference;
  private yDoc: Y.Doc;
  
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceIntervalMs: number;
  private isFlushPending: boolean = false;
  private isFlushing: boolean = false;
  private dirtyDuringFlush: boolean = false;
  private isDestroyed: boolean = false;
  private hasPersistedCreate: boolean = false;
  private ownerId?: string | undefined;
  private memberIds?: string[] | undefined;
  private updateHandler?: ((_update: Uint8Array, origin: any) => void) | undefined;
  private unloadHandler?: ((event: Event) => void) | undefined;
  private visibilityHandler?: (() => void) | undefined;

  constructor(
    campaignId: string,
    sessionId: string,
    yDoc: Y.Doc,
    intervalMs: number = 500,
    firestoreInstance?: Firestore,
    options?: FirestoreDebouncerOptions
  ) {
    this.db = firestoreInstance || defaultDb;
    const rootCollection = options?.collectionRoot === 'user_stories' ? 'user_stories' : 'Campaigns';
    const subCollection = rootCollection === 'user_stories' ? 'sessions' : 'Sessions';
    // Map to a specific active session document in the Tangent DBM
    this.targetDocRef = doc(this.db, `${rootCollection}/${campaignId}/${subCollection}/${sessionId}`);
    this.yDoc = yDoc;
    this.debounceIntervalMs = intervalMs;
    this.ownerId = options?.ownerId;
    this.memberIds = Array.isArray(options?.memberIds) ? [...options.memberIds] : undefined;

    this.setupObserver();
    this.setupPageUnloadProtection();

    console.log(`[Firestore Debouncer] Initialized with a ${intervalMs}ms throttle.`);
  }

  private setupObserver() {
    // Listen to local updates on the Yjs document; skip remote 'network' echo updates
    this.updateHandler = (_update: Uint8Array, origin: any) => {
      if (!this.isDestroyed && origin !== 'network') {
        this.scheduleFlush();
      }
    };
    this.yDoc.on('update', this.updateHandler);
  }

  private scheduleFlush() {
    this.isFlushPending = true;
    if (this.isFlushing) {
      this.dirtyDuringFlush = true;
    }

    // Clear existing timer if a new mutation comes in before the timer fires
    if (this.debounceTimer !== null) {
      globalThis.clearTimeout(this.debounceTimer);
    }

    // Set a new timer
    this.debounceTimer = globalThis.setTimeout(async () => {
      await this.flushToFirestore();
    }, this.debounceIntervalMs);
  }

  /**
   * Restores previously persisted CRDT snapshot from Firestore into this Y.Doc
   * and records existence so subsequent updates never re-write immutable ownerId.
   */
  public async hydrateFromFirestore(): Promise<boolean> {
    if (this.isDestroyed || !this.db) return false;
    try {
      const snap = await getDoc(this.targetDocRef);
      if (!snap.exists()) return false;
      this.hasPersistedCreate = true;
      const data = snap.data() as Record<string, any> | undefined;
      if (typeof data?.crdt_blob === 'string' && data.crdt_blob.length > 0) {
        const bytes = base64ToBytes(data.crdt_blob);
        Y.applyUpdate(this.yDoc, bytes, 'network');
        return true;
      }
      return false;
    } catch (error) {
      console.warn('[Firestore Debouncer] Failed to hydrate CRDT state from Firestore:', error);
      return false;
    }
  }

  public async flushToFirestore(): Promise<boolean> {
    if (!this.isFlushPending) return true;
    if (this.isFlushing) {
      this.dirtyDuringFlush = true;
      return true;
    }

    this.isFlushing = true;
    this.dirtyDuringFlush = false;

    try {
      // 1. Encode finalized CRDT state into a binary Uint8Array
      const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);

      // 2. Convert binary to Base64 string for safe storage in Firestore
      const base64State = bytesToBase64(stateUpdate);
      if (base64State.length > 1_000_000) {
        console.warn('[Firestore Debouncer] CRDT state exceeds 1 MB Firestore limit; flush aborted.');
        this.isFlushPending = false;
        this.debounceTimer = null;
        return false;
      }

      const resolvedOwnerId = this.ownerId || defaultAuth?.currentUser?.uid;
      const payload: Record<string, any> = {
        crdt_blob: base64State,
        last_updated: new Date().toISOString()
      };
      // Include ownerId only on initial creation; omit on subsequent updates to preserve Firestore immutability rules
      if (!this.hasPersistedCreate && resolvedOwnerId) {
        payload.ownerId = resolvedOwnerId;
      }
      if (!this.hasPersistedCreate && this.memberIds && this.memberIds.length > 0) {
        payload.memberIds = this.memberIds;
      }

      // 3. Execute a single write to GCP (merge: true prevents wiping metadata)
      await setDoc(this.targetDocRef, payload, { merge: true });
      this.hasPersistedCreate = true;

      if (!this.dirtyDuringFlush) {
        this.isFlushPending = false;
      }
      this.debounceTimer = null;
      console.log('[Firestore Debouncer] Successfully flushed CRDT state to GCP.');
      return true;
    } catch (error) {
      console.error('[Firestore Debouncer] Catastrophic write failure to Tangent DBM:', error);
      // If the network fails, leave isFlushPending = true to retry on next mutation
      this.isFlushPending = true;
      return false;
    } finally {
      this.isFlushing = false;
      if (this.dirtyDuringFlush && !this.isDestroyed) {
        this.dirtyDuringFlush = false;
        this.scheduleFlush();
      }
    }
  }

  private setupPageUnloadProtection() {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      this.unloadHandler = (event: Event) => {
        if (this.isFlushPending) {
          this.flushToFirestore();
          event.preventDefault();
          (event as BeforeUnloadEvent).returnValue = '';
        }
      };
      window.addEventListener('beforeunload', this.unloadHandler);
    }

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      this.visibilityHandler = () => {
        if (document.visibilityState === 'hidden' && this.isFlushPending) {
          this.flushToFirestore();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.updateHandler) {
      this.yDoc.off('update', this.updateHandler);
      this.updateHandler = undefined;
    }
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      if (this.unloadHandler) {
        window.removeEventListener('beforeunload', this.unloadHandler);
        this.unloadHandler = undefined;
      }
    }
    if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
      if (this.visibilityHandler) {
        document.removeEventListener('visibilitychange', this.visibilityHandler);
        this.visibilityHandler = undefined;
      }
    }
    if (this.debounceTimer !== null) {
      globalThis.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.isFlushPending) {
      this.flushToFirestore();
    }
  }
}
