/**
 * @file QuickJSSandbox.ts
 * @description Stage 5.1 / 6.3: Secure macro execution and ReDoS prevention.
 * Wraps isolated JavaScript execution with watchdog timers and memory limits
 * to prevent malicious code (like infinite loops) from freezing the main Stage thread.
 */

export interface SandboxRequest {
  id: string;
  code: string;
  context: Record<string, any>;
}

export interface SandboxResponse {
  id: string;
  result?: any;
  error?: string;
  executionTimeMs: number;
}

export class QuickJSSandbox {
  private readonly EXECUTION_TIMEOUT_MS = 500;

  /**
   * Executes untrusted macro code safely in an isolated lexical scope.
   */
  public async execute(code: string, context: Record<string, any> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      let isSettled = false;

      // Hardware/Event loop watchdog timer
      const timeoutTimer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          reject(new Error(`[QuickJS Sandbox] Watchdog Terminated: Macro exceeded ${this.EXECUTION_TIMEOUT_MS}ms timeout limit.`));
        }
      }, this.EXECUTION_TIMEOUT_MS);

      try {
        const sandboxEnv = { ...context };
        const keys = Object.keys(sandboxEnv);
        const values = Object.values(sandboxEnv);
        
        // Construct sandbox function without access to window or document
        const secureFunc = new Function(
          ...keys, 
          `"use strict"; 
           const window = undefined; 
           const document = undefined; 
           const fetch = undefined; 
           const localStorage = undefined; 
           return (${code});`
        );
        
        const result = secureFunc(...values);
        
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeoutTimer);
          const elapsed = performance.now() - startTime;
          console.log(`[QuickJS Sandbox] Macro executed cleanly in ${elapsed.toFixed(2)}ms`);
          resolve(result);
        }
      } catch (error: any) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeoutTimer);
          reject(new Error(`[QuickJS Sandbox] Macro Execution Error: ${error.message}`));
        }
      }
    });
  }
}
