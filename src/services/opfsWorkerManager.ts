/**
 * @file opfsWorkerManager.ts
 * @description Manages the singleton lifecycle of the OPFS SQLite WASM Web Worker.
 * Offloads heavy 700+ article compendium indexing and FTS5 BM25 ranked searches
 * away from the main React rendering thread.
 */

export interface CompendiumChunkPayload {
  id: string;
  title: string;
  category: string;
  content: string;
}

export class OpfsWorkerManager {
  private static instance: OpfsWorkerManager | null = null;
  private worker: Worker | null = null;
  private isInitialized = false;
  private initPromise: Promise<boolean> | null = null;
  private pendingQueries = new Map<string, { resolve: (res: any) => void; reject: (err: any) => void; timer: any }>();

  public static getInstance(): OpfsWorkerManager {
    if (!OpfsWorkerManager.instance) {
      OpfsWorkerManager.instance = new OpfsWorkerManager();
    }
    return OpfsWorkerManager.instance;
  }

  /**
   * Set a custom or mock worker (useful in Node.js test suites or sandboxes).
   */
  public setMockWorker(worker: any): void {
    if (this.worker) {
      this.terminate();
    }
    this.worker = worker;
    this.isInitialized = true;
    this.setupMessageListener();
  }

  /**
   * Initializes the Web Worker running SQLite WASM with OPFS backing.
   */
  public async init(dbName = 'tangent_omnicortex'): Promise<boolean> {
    if (this.isInitialized) return true;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<boolean>((resolve) => {
      // In non-browser environments or if Worker is not defined, fall back gracefully
      if (typeof window === 'undefined' || typeof Worker === 'undefined') {
        this.isInitialized = false;
        resolve(false);
        return;
      }

      try {
        if (!this.worker) {
          this.worker = new Worker(
            new URL('../engine/database/OPFSDatabaseWorker.ts', import.meta.url),
            { type: 'module' }
          );
          this.setupMessageListener();
        }

        const timeout = setTimeout(() => {
          console.warn('[OpfsWorkerManager] Worker initialization timed out, using in-memory fallback.');
          resolve(false);
        }, 3000);

        const readyHandler = (e: MessageEvent) => {
          if (e.data?.type === 'READY') {
            clearTimeout(timeout);
            this.worker?.removeEventListener('message', readyHandler);
            if (e.data.status === 'success') {
              this.isInitialized = true;
              console.log('[OpfsWorkerManager] OPFS SQLite WASM Worker ready.');
              resolve(true);
            } else {
              console.warn('[OpfsWorkerManager] Worker init failed with message:', e.data.message);
              resolve(false);
            }
          }
        };

        this.worker.addEventListener('message', readyHandler);
        this.worker.postMessage({ type: 'INIT', dbName });
      } catch (err) {
        console.warn('[OpfsWorkerManager] Unable to spawn Web Worker:', err);
        resolve(false);
      }
    });

    return this.initPromise;
  }

  private setupMessageListener(): void {
    if (!this.worker) return;

    this.worker.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === 'RESULT' && data.queryId) {
        const pending = this.pendingQueries.get(data.queryId);
        if (pending) {
          clearTimeout(pending.timer);
          this.pendingQueries.delete(data.queryId);
          if (data.error) {
            pending.reject(new Error(data.error));
          } else {
            pending.resolve(data.rows || []);
          }
        }
      }
    };
  }

  /**
   * Offloads batch indexing of compendium chunks into the SQLite WASM FTS5 index.
   */
  public async indexCompendiumChunks(chunks: CompendiumChunkPayload[]): Promise<{ count: number; status: string }> {
    if (!chunks || chunks.length === 0) {
      return { count: 0, status: 'empty' };
    }

    await this.init();

    if (!this.worker) {
      return { count: chunks.length, status: 'mock_memory' };
    }

    const queryId = `idx_comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return new Promise<{ count: number; status: string }>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingQueries.delete(queryId);
        reject(new Error('[OpfsWorkerManager] Batch compendium indexing timed out'));
      }, 10000); // 10s generous limit for large 700+ article ingestion

      this.pendingQueries.set(queryId, {
        resolve: (rows) => {
          const res = (Array.isArray(rows) && rows[0]) || { count: chunks.length, status: 'indexed' };
          resolve(res);
        },
        reject,
        timer
      });

      this.worker?.postMessage({
        type: 'INDEX_COMPENDIUM',
        queryId,
        chunks
      });
    });
  }

  /**
   * Asynchronously queries the SQLite WASM FTS5 virtual table.
   */
  public async searchFts(query: string, limit = 10): Promise<any[]> {
    if (!query || !query.trim()) return [];

    await this.init();

    if (!this.worker) {
      return [];
    }

    const queryId = `fts_q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return new Promise<any[]>((resolve) => {
      const timer = setTimeout(() => {
        this.pendingQueries.delete(queryId);
        resolve([]); // Graceful timeout to fallback
      }, 1500);

      this.pendingQueries.set(queryId, {
        resolve: (rows) => resolve(Array.isArray(rows) ? rows : []),
        reject: () => resolve([]),
        timer
      });

      this.worker?.postMessage({
        type: 'FTS_SEARCH',
        queryId,
        query,
        limit
      });
    });
  }

  public isReady(): boolean {
    return this.isInitialized && Boolean(this.worker);
  }

  public getWorker(): Worker | null {
    return this.worker;
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
    this.initPromise = null;
    this.pendingQueries.clear();
  }
}

export const getOpfsWorkerManager = (): OpfsWorkerManager => OpfsWorkerManager.getInstance();
export default OpfsWorkerManager;
