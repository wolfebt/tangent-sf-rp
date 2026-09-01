/**
 * @file FirestoreDebouncer.ts
 * @description Stage 1.6: GCP rate-limit protection and catastrophic data-loss prevention.
 * Observes Yjs mutations and executes throttled, batched updates to the Tangent DBM.
 */

import { doc, updateDoc, Firestore, DocumentReference } from 'firebase/firestore';
import * as Y from 'yjs';

// Polyfill function for Uint8Array to Base64 (Firestore does not natively store Uint8Arrays perfectly without Blob wrappers)
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

  constructor(db: Firestore, campaignId: string, sessionId: string, yDoc: Y.Doc, intervalMs: number = 500) {
    this.db = db;
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
      this.scheduleFlush();
    });
  }

  private scheduleFlush() {
    this.isFlushPending = true;

    // Clear the existing timer if a new mutation comes in before the timer fires
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }

    // Set a new timer. If the user stops interacting for 500ms, it will finally fire.
    this.debounceTimer = window.setTimeout(async () => {
      await this.flushToFirestore();
    }, this.debounceIntervalMs);
  }

  private async flushToFirestore() {
    if (!this.isFlushPending) return;

    try {
      // 1. Encode the entire finalized CRDT state into a binary Uint8Array
      const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
      
      // 2. Convert binary to a Base64 string for safe storage in a Firestore string/blob field
      const base64State = bytesToBase64(stateUpdate);

      // 3. Execute a single, definitive write to GCP
      await updateDoc(this.targetDocRef, {
        crdt_blob: base64State,
        last_updated: new Date().toISOString()
      });

      this.isFlushPending = false;
      this.debounceTimer = null;
      console.log(`[Firestore Debouncer] Successfully flushed CRDT state to GCP.`);

    } catch (error) {
      console.error('[Firestore Debouncer] Catastrophic write failure to Tangent DBM:', error);
      // If the network fails, leave isFlushPending = true and it will retry on the next mutation
    }
  }

  private setupPageUnloadProtection() {
    // If the user accidentally closes the tab or the browser crashes, attempt a synchronous flush
    const unloadHandler = (event: Event) => {
      if (this.isFlushPending) {
        // Note: Navigator.sendBeacon could also be used here for non-blocking payload delivery,
        // but for a strict state machine, forcing the flush via standard promises often catches the trailing edge.
        this.flushToFirestore();
        
        // Some browsers require returnValue to be set to prompt the user
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
}