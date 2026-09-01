/**
 * @file OPFSDatabaseWorker.ts
 * @description Stage 1.1: Web Worker running SQLite WASM over Origin Private File System (OPFS).
 * Handles synchronous disk I/O off the main thread with Write-Ahead Logging (WAL).
 */

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

// --- TYPE DEFINITIONS ---
export type DbRequest = 
  | { type: 'INIT'; dbName: string }
  | { type: 'QUERY'; sql: string; params?: any[]; queryId: string }
  | { type: 'BULK_INSERT'; table: string; data: any[]; queryId: string };

export type DbResponse = 
  | { type: 'READY'; status: 'success' | 'error'; message?: string }
  | { type: 'RESULT'; queryId: string; rows: any[]; error?: string };

// --- WORKER STATE ---
class DatabaseEngine {
  private db: any = null;
  private sqlite3: any = null;

  async initialize(dbName: string) {
    try {
      console.log('[OPFS Worker] Initializing SQLite WASM...');
      this.sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });

      // Check for OPFS availability
      if (this.sqlite3.opfs) {
        console.log('[OPFS Worker] OPFS is available. Mounting VFS.');
        this.db = new this.sqlite3.oo1.OpfsDb(`/${dbName}.sqlite3`);
        
        // Critical: Enable Write-Ahead Logging for high-frequency VTT operations
        // This prevents log bloat and DB locking during heavy I/O
        this.db.exec('PRAGMA journal_mode = WAL;');
        this.db.exec('PRAGMA synchronous = NORMAL;');
        this.db.exec('PRAGMA temp_store = MEMORY;');
        this.db.exec('PRAGMA cache_size = -64000;'); // 64MB cache
        
        console.log(`[OPFS Worker] Database ${dbName} mounted successfully.`);
        return true;
      } else {
        throw new Error('OPFS is not supported in this browser environment. Fallback required.');
      }
    } catch (err) {
      console.error('[OPFS Worker] Initialization failed:', err);
      throw err;
    }
  }

  executeQuery(sql: string, params: any[] = []): any[] {
    if (!this.db) throw new Error('Database not initialized');
    
    const results: any[] = [];
    this.db.exec({
      sql: sql,
      bind: params,
      rowMode: 'object',
      callback: (row: any) => {
        results.push(row);
      }
    });
    return results;
  }

  // Optimized for massive JSON ingestion (e.g., SPARK rulebook dumps)
  executeBulkInsert(table: string, data: any[]) {
    if (!this.db || data.length === 0) return;
    
    this.db.exec('BEGIN TRANSACTION;');
    try {
      const keys = Object.keys(data[0]).join(', ');
      const placeholders = Object.keys(data[0]).map(() => '?').join(', ');
      const stmt = this.db.prepare(`INSERT INTO ${table} (${keys}) VALUES (${placeholders})`);
      
      for (const row of data) {
        stmt.bind(Object.values(row));
        stmt.step();
        stmt.reset();
      }
      stmt.finalize();
      this.db.exec('COMMIT;');
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }
  }
}

const engine = new DatabaseEngine();

// --- MESSAGE BUS ---
// Note: In production, for zero-copy transfers, we will pass SharedArrayBuffers 
// through this port for massive coordinate arrays.
self.onmessage = async (event: MessageEvent<DbRequest>) => {
  const req = event.data;

  switch (req.type) {
    case 'INIT':
      try {
        await engine.initialize(req.dbName);
        self.postMessage({ type: 'READY', status: 'success' });
      } catch (e: any) {
        self.postMessage({ type: 'READY', status: 'error', message: e.message });
      }
      break;

    case 'QUERY':
      try {
        const rows = engine.executeQuery(req.sql, req.params);
        self.postMessage({ type: 'RESULT', queryId: req.queryId, rows });
      } catch (e: any) {
        self.postMessage({ type: 'RESULT', queryId: req.queryId, error: e.message });
      }
      break;

    case 'BULK_INSERT':
      try {
        engine.executeBulkInsert(req.table, req.data);
        self.postMessage({ type: 'RESULT', queryId: req.queryId, rows: [{ status: 'inserted' }] });
      } catch (e: any) {
        self.postMessage({ type: 'RESULT', queryId: req.queryId, error: e.message });
      }
      break;
  }
};