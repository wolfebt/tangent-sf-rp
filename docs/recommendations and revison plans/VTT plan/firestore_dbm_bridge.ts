/**
 * @file DBMBridge.ts
 * @description Stage 1.3: Bridges the Tangent DBM (Firestore) with the local OPFS database.
 * Establishes snapshot listeners and pipes static rulebook/actor data into local storage.
 * Implements an asynchronous queue to handle network jitter if OPFS is locked.
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  query, 
  where,
  DocumentData,
  Firestore
} from 'firebase/firestore';
import { useEngineStore, StaticEntity } from './VolatileSharder';

// Define the shape of our worker messaging to interact with Stage 1.1
interface OPFSWorkerAPI {
  postMessage: (msg: any) => void;
}

export class DBMBridge {
  private db: Firestore;
  private opfsWorker: OPFSWorkerAPI;
  private unsubscribeQueue: (() => void)[] = [];
  
  // A jitter buffer/queue to hold incoming Firestore data if OPFS is busy
  private insertionQueue: DocumentData[] = [];
  private isProcessingQueue: boolean = false;

  constructor(firebaseConfig: any, workerRef: OPFSWorkerAPI) {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.opfsWorker = workerRef;
    
    console.log('[DBM Bridge] Initialized. Ready to sync with Tangent OMNICORTEX.');
  }

  /**
   * Subscribes to a specific campaign's actor/entity data.
   * Pulls the absolute source of truth for mechanical stats.
   */
  public subscribeToCampaignActors(campaignId: string) {
    console.log(`[DBM Bridge] Subscribing to Campaign: ${campaignId}`);
    
    const actorsRef = collection(this.db, `Campaigns/${campaignId}/Actors`);
    // Example: Only pull active actors to save bandwidth and memory
    const q = query(actorsRef, where('isActive', '==', true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const incomingData: DocumentData[] = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = { id: change.doc.id, ...change.doc.data() };
          incomingData.push(data);
          
          // Immediately update the fast, in-memory Zustand store (Stage 1.2)
          this.syncToVolatileSharder(data as StaticEntity);
        }
        
        if (change.type === 'removed') {
          // Handle deletion logic (tombstoning in OPFS, etc.)
          console.log(`[DBM Bridge] Entity removed: ${change.doc.id}`);
        }
      });

      if (incomingData.length > 0) {
        this.queueForOPFS(incomingData);
      }
    }, (error) => {
      console.error('[DBM Bridge] Firestore Snapshot Error:', error);
      // Fallback: The OPFS database retains the last known good state.
    });

    this.unsubscribeQueue.push(unsubscribe);
  }

  /**
   * Pushes static data directly to the Zustand sharder for instant UI availability,
   * bypassing the need to wait for the OPFS disk write to complete.
   */
  private syncToVolatileSharder(entity: StaticEntity) {
    const { loadStaticEntity } = useEngineStore.getState();
    
    // Normalize data if necessary before pushing to Zustand
    const normalizedEntity: StaticEntity = {
      id: entity.id,
      name: entity.name || 'Unknown Entity',
      base_hp: entity.base_hp || 10,
      tech_level: entity.tech_level || 0,
      armor_dr: entity.armor_dr || 0,
      size_modifier: entity.size_modifier || 0
    };

    loadStaticEntity(normalizedEntity);
  }

  /**
   * Queues data for bulk insertion into the WebAssembly SQLite database.
   * Prevents locking the main thread or overwhelming the worker with rapid single inserts.
   */
  private queueForOPFS(data: DocumentData[]) {
    this.insertionQueue.push(...data);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.insertionQueue.length === 0) return;
    this.isProcessingQueue = true;

    try {
      // Take a batch of up to 500 records to process
      const batch = this.insertionQueue.splice(0, 500);
      
      const queryId = `bulk_insert_${Date.now()}`;
      
      // Dispatch to Stage 1.1 OPFS Worker
      this.opfsWorker.postMessage({
        type: 'BULK_INSERT',
        table: 'entities', // Target SQLite table
        data: batch,
        queryId: queryId
      });
      
      console.log(`[DBM Bridge] Dispatched batch of ${batch.length} to OPFS.`);

    } catch (error) {
      console.error('[DBM Bridge] Failed to process OPFS queue', error);
    } finally {
      this.isProcessingQueue = false;
      
      // If items remain, keep processing
      if (this.insertionQueue.length > 0) {
        setTimeout(() => this.processQueue(), 50);
      }
    }
  }

  public disconnect() {
    console.log('[DBM Bridge] Severing DBM connection and clearing listeners.');
    this.unsubscribeQueue.forEach(unsub => unsub());
    this.unsubscribeQueue = [];
    this.insertionQueue = [];
  }
}