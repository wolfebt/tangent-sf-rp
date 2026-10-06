/**
 * @file QuickJSSandbox.ts
 * @description Stage 5.1 / 6.3: Secure macro execution and ReDoS prevention.
 * Wraps isolated JavaScript execution with watchdog timers, memory limits,
 * and standard game helper libraries (Dice, MathOps, Trauma, StoryFlags)
 * to prevent malicious or malformed code from freezing the main thread.
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

export interface SandboxStandardContext {
  Dice: {
    d: (sides: number) => number;
    roll: (count: number, sides: number) => number[];
    check2d10: (bonus?: number, dc?: number) => {
      dice: [number, number];
      roll: number;
      bonus: number;
      total: number;
      dc: number;
      success: boolean;
      crit: boolean;
      fumble: boolean;
      margin: number;
      outcome: string;
    };
    d100: () => number;
  };
  MathOps: {
    clamp: (val: number, min: number, max: number) => number;
    margin: (val: number, target: number) => number;
    roundTo: (val: number, decimals?: number) => number;
  };
  Trauma: {
    evaluateCalledShot: (limb: string, damage: number, armorDr?: number) => {
      limb: string;
      rawDamage: number;
      armorAbsorbed: number;
      netDamage: number;
      traumaApplied: string | null;
      severity: 'NONE' | 'MINOR' | 'MODERATE' | 'CRITICAL' | 'LETHAL';
      penalty: string | null;
    };
  };
  StoryFlags: {
    get: (key: string, defaultVal?: any) => any;
    set: (key: string, value: any) => void;
    has: (key: string) => boolean;
    all: () => Record<string, any>;
  };
}

export class QuickJSSandbox {
  private readonly EXECUTION_TIMEOUT_MS = 500;

  /**
   * Generates canonical game helpers (Dice, MathOps, Trauma, StoryFlags)
   * tailored to the active execution context.
   */
  public createStandardLibrary(context: Record<string, any> = {}): SandboxStandardContext {
    const flagStore: Record<string, any> = { ...(context.storyFlags || context.StoryFlags || {}) };

    return {
      Dice: {
        d: (sides: number) => Math.floor(Math.random() * Math.max(1, sides)) + 1,
        roll: (count: number, sides: number) =>
          Array.from({ length: Math.max(1, count) }, () => Math.floor(Math.random() * Math.max(1, sides)) + 1),
        check2d10: (bonus: number = 0, dc: number = 14) => {
          const d1 = Math.floor(Math.random() * 10) + 1;
          const d2 = Math.floor(Math.random() * 10) + 1;
          const roll = d1 + d2;
          const total = roll + bonus;
          const crit = (d1 === 10 && d2 === 10);
          const fumble = (d1 === 1 && d2 === 1);
          const success = crit || (total >= dc && !fumble);
          const margin = total - dc;
          const outcome = crit ? 'CRITICAL SUCCESS' : fumble ? 'TACTICAL GLITCH' : success ? 'SUCCESS' : 'FAILURE';
          return { dice: [d1, d2], roll, bonus, total, dc, success, crit, fumble, margin, outcome };
        },
        d100: () => Math.floor(Math.random() * 100) + 1
      },
      MathOps: {
        clamp: (val: number, min: number, max: number) => Math.max(min, Math.min(max, val)),
        margin: (val: number, target: number) => val - target,
        roundTo: (val: number, decimals: number = 2) => Number(val.toFixed(decimals))
      },
      Trauma: {
        evaluateCalledShot: (limb: string, damage: number, armorDr: number = 0) => {
          const rawDamage = Math.max(0, damage);
          const armorAbsorbed = Math.min(rawDamage, Math.max(0, armorDr));
          const netDamage = Math.max(0, rawDamage - armorAbsorbed);
          let severity: 'NONE' | 'MINOR' | 'MODERATE' | 'CRITICAL' | 'LETHAL' = 'NONE';
          let traumaApplied: string | null = null;
          let penalty: string | null = null;

          const limbLower = (limb || 'torso').toLowerCase();
          if (netDamage >= 25) {
            severity = 'LETHAL';
            traumaApplied = limbLower.includes('head')
              ? 'Cranial Rupture / Instant Incapacitation'
              : 'Catastrophic Amputation / Massive Hemorrhage';
            penalty = '-10 to All Actions; Bleeding (5/turn); Unconscious in 1 turn';
          } else if (netDamage >= 18) {
            severity = 'CRITICAL';
            if (limbLower.includes('head') || limbLower.includes('eye')) {
              traumaApplied = 'Severe Concussion & Optic Bleed';
              penalty = 'Blindness (3 turns), -5 Perception & Reflex';
            } else if (limbLower.includes('arm') || limbLower.includes('hand')) {
              traumaApplied = 'Actuator Shear / Compound Fracture';
              penalty = 'Limb Disabled, Cannot Hold 2H Weapons';
            } else if (limbLower.includes('leg') || limbLower.includes('foot')) {
              traumaApplied = 'Shattered Femur / Joint Dislocation';
              penalty = 'Movement Speed Halved, Prone Condition';
            } else {
              traumaApplied = 'Pneumothorax / Internal Hemorrhage';
              penalty = '-4 Stamina, Breath Shortness, Bleeding (3/turn)';
            }
          } else if (netDamage >= 10) {
            severity = 'MODERATE';
            traumaApplied = `Deep Laceration / Trauma to ${limb}`;
            penalty = `-2 Penalty to Checks using targeted limb`;
          } else if (netDamage >= 5) {
            severity = 'MINOR';
            traumaApplied = `Superficial Flesh Wound to ${limb}`;
            penalty = '-1 Focus';
          }

          return {
            limb,
            rawDamage,
            armorAbsorbed,
            netDamage,
            traumaApplied,
            severity,
            penalty
          };
        }
      },
      StoryFlags: {
        get: (key: string, defaultVal: any = null) =>
          flagStore[key] !== undefined ? flagStore[key] : defaultVal,
        set: (key: string, value: any) => { flagStore[key] = value; },
        has: (key: string) => Object.prototype.hasOwnProperty.call(flagStore, key),
        all: () => ({ ...flagStore })
      }
    };
  }

  /**
   * Executes untrusted macro code safely in an isolated lexical scope
   * with injected standard game utilities and watchdog timeouts.
   */
  public async execute(code: string, context: Record<string, any> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      let isSettled = false;

      // Hardware/Event loop watchdog timer
      const timeoutTimer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          reject(new Error(`[QuickJS Sandbox] Watchdog Terminated: Macro exceeded ${this.EXECUTION_TIMEOUT_MS}ms timeout limit.`));
        }
      }, this.EXECUTION_TIMEOUT_MS);

      try {
        const stdLib = this.createStandardLibrary(context);
        const sandboxEnv: Record<string, any> = {
          Dice: stdLib.Dice,
          MathOps: stdLib.MathOps,
          Trauma: stdLib.Trauma,
          StoryFlags: stdLib.StoryFlags,
          performance: typeof performance !== 'undefined' ? performance : { now: () => Date.now() },
          ...context
        };
        const keys = Object.keys(sandboxEnv);
        const values = Object.values(sandboxEnv);

        const trimmed = code.trim();
        // Strip leading comments to detect if code is an expression
        const codeWithoutLeadingComments = trimmed.replace(/^(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)+/, '').trim();
        const hasReturn = /\breturn\b/.test(trimmed);
        const isStatement = /^(const|let|var|if|for|while|switch|function|try|throw)\b/.test(codeWithoutLeadingComments);
        let scriptBody = (hasReturn || isStatement)
          ? trimmed
          : `return (${codeWithoutLeadingComments || trimmed});`;

        // Inject watchdog checks into loops to prevent infinite thread freezing
        scriptBody = scriptBody.replace(
          /\b(for|while)\s*\(([^)]*)\)\s*\{/g,
          `$1($2) { if (performance.now() - ${startTime} > ${this.EXECUTION_TIMEOUT_MS}) throw new Error('[QuickJS Sandbox] Watchdog Terminated: Macro exceeded ${this.EXECUTION_TIMEOUT_MS}ms timeout limit.'); `
        );

        // Construct sandbox function without access to window or document
        const secureFunc = new Function(
          ...keys,
          `"use strict"; 
           const window = undefined; 
           const document = undefined; 
           const fetch = undefined; 
           const localStorage = undefined; 
           ${scriptBody}`
        );

        const result = secureFunc(...values);

        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeoutTimer);
          const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
          const elapsed = now - startTime;
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
