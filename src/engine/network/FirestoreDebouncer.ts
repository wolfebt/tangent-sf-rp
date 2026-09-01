/**
 * @file FirestoreDebouncer.ts
 * @description Stage 1.6: GCP rate-limit protection and catastrophic data-loss prevention.
 * Observes Yjs mutations and executes throttled, batched updates to the Tangent DBM.
 */

import { doc, setDoc, type Firestore, type DocumentReference } from 'firebase/firestore';
import * as Y from 'yjs';
import { db as defaultDb } from '../../firebase.js';

// Polyfill function for Uint8Array to Base64
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export class FirestoreDebouncer {
  private db: Firestore;
  private targetDocRef: DocumentReference;
  private yDoc: Y.Doc;
  
  private debounceTimer: number | null = null;
  private debounceIntervalMs: number;
  private isFlushPending: boolean = false;
  private isDestroyed: boolean = false;

  constructor(
    campaignId: string, 
    sessionId: string, 
    yDoc: Y.Doc, 
    intervalMs: number = 500,
    firestoreInstance?: Firestore
  ) {
    this.db = firestoreInstance || defaultDb;
    // Map to a specific active session document in the Tangent DBM
    this.targetDocRef = doc(this.db, `Campaigns/${campaignId}/Sessions/${sessionId}`);
    this.yDoc = yDoc;
    this.debounceIntervalMs = intervalMs;

    this.setupObserver();
    this.setupPageUnloadProtection();
    
    console.log(`[Firestore Debouncer] Initialized with a ${intervalMs}ms throttle.`);
  }

  private setupObserver() {
    // Listen to ALL updates on the Yjs document (both local and network)
    this.yDoc.on('update', () => {
      if (!this.isDestroyed) {
        this.scheduleFlush();
      }
    });
  }

  private scheduleFlush() {
    this.isFlushPending = true;

    // Clear existing timer if a new mutation comes in before the timer fires
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }

    // Set a new timer
    this.debounceTimer = window.setTimeout(async () => {
      await this.flushToFirestore();
    }, this.debounceIntervalMs);
  }

  public async flushToFirestore(): Promise<boolean> {
    if (!this.isFlushPending) return true;

    try {
      // 1. Encode finalized CRDT state into a binary Uint8Array
      const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
      
      // 2. Convert binary to Base64 string for safe storage in Firestore
      const base64State = bytesToBase64(stateUpdate);

      // 3. Execute a single write to GCP (merge: true prevents wiping metadata)
      await setDoc(this.targetDocRef, {
        crdt_blob: base64State,
        last_updated: new Date().toISOString()
      }, { merge: true });

      this.isFlushPending = false;
      this.debounceTimer = null;
      console.log('[Firestore Debouncer] Successfully flushed CRDT state to GCP.');
      return true;

    } catch (error) {
      console.error('[Firestore Debouncer] Catastrophic write failure to Tangent DBM:', error);
      // If the network fails, leave isFlushPending = true to retry on next mutation
      return false;
    }
  }

  private setupPageUnloadProtection() {
    const unloadHandler = (event: Event) => {
      if (this.isFlushPending) {
        this.flushToFirestore();
        event.preventDefault();
        (event as BeforeUnloadEvent).returnValue = ''; 
      }
    };

    window.addEventListener('beforeunload', unloadHandler);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.isFlushPending) {
        this.flushToFirestore();
      }
    });
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }
    if (this.isFlushPending) {
      this.flushToFirestore();
    }
  }
}
