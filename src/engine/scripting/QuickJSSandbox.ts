/**
 * @file QuickJSSandbox.ts
 * @description Stage 5.1 / 6.3: Secure macro execution and ReDoS / infinite-loop prevention.
 * Executes untrusted macro code in an isolated runtime:
 *   - Browser: Ephemeral dedicated Web Worker with shadowed globals and hard `worker.terminate()` watchdog.
 *   - Node / SSR / Vitest: `node:vm` isolated context with `codeGeneration: { strings: false, wasm: false }` and V8 execution timeout.
 * Never executes arbitrary code via main-thread `new Function` or `eval`.
 */

export type StageMacroAction =
  | { type: 'move_token'; tokenId: string; x: number; y: number }
  | { type: 'apply_damage'; tokenId: string; amount: number; isLethal?: boolean }
  | { type: 'add_effect'; tokenId: string; name: string; rounds: number; tickDamage?: number; isLethal?: boolean }
  | { type: 'toggle_door'; wallId: string }
  | { type: 'emit_chat'; title: string; message: string; visibility?: 'public' | 'whisper_gm' | 'blind_gm' }
  | { type: 'play_audio'; cueId: string; bus?: 'music' | 'ambient' | 'sfx' }
  | { type: 'set_flag'; key: string; value: boolean | number | string };

export interface SandboxRequest {
  id: string;
  code: string;
  context: Record<string, any>;
}

export interface SandboxResponse {
  id: string;
  result?: any;
  actions?: StageMacroAction[];
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
  StageAPI: {
    moveToken: (tokenId: string, x: number, y: number) => void;
    applyDamage: (tokenId: string, amount: number, isLethal?: boolean) => void;
    addEffect: (tokenId: string, name: string, rounds: number, tickDamage?: number, isLethal?: boolean) => void;
    toggleDoor: (wallId: string) => void;
    emitChat: (title: string, message: string, visibility?: 'public' | 'whisper_gm' | 'blind_gm') => void;
    playAudio: (cueId: string, bus?: 'music' | 'ambient' | 'sfx') => void;
    setFlag: (key: string, value: boolean | number | string) => void;
    getActions: () => StageMacroAction[];
  };
}

const VALID_IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const RESTRICTED_GLOBAL_NAMES = new Set([
  'window',
  'document',
  'globalThis',
  'self',
  'top',
  'parent',
  'frames',
  'location',
  'navigator',
  'fetch',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'caches',
  'XMLHttpRequest',
  'WebSocket',
  'Worker',
  'SharedWorker',
  'BroadcastChannel',
  'importScripts',
  'Function',
  'eval',
  'Reflect',
  'Proxy',
  'process',
  'require',
  'module',
  'Dice',
  'MathOps',
  'Trauma',
  'StoryFlags',
  'StageAPI',
  'performance'
]);

const SANDBOX_SHADOW_PRELUDE = `
  const window = undefined;
  const document = undefined;
  const globalThis = undefined;
  const self = undefined;
  const top = undefined;
  const parent = undefined;
  const frames = undefined;
  const location = undefined;
  const navigator = undefined;
  const fetch = undefined;
  const localStorage = undefined;
  const sessionStorage = undefined;
  const indexedDB = undefined;
  const caches = undefined;
  const XMLHttpRequest = undefined;
  const WebSocket = undefined;
  const Worker = undefined;
  const SharedWorker = undefined;
  const BroadcastChannel = undefined;
  const importScripts = undefined;
  const Function = undefined;
  const Reflect = undefined;
  const Proxy = undefined;
  const process = undefined;
  const require = undefined;
  const module = undefined;
`;

const MAX_MACRO_CODE_LENGTH = 16384;
const UNSAFE_PROTO_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Self-contained factory for canonical game helpers (Dice, MathOps, Trauma, StoryFlags).
 * Intentionally closure-free so it can run identically in Node `vm`, sandboxed iframes, and Workers.
 */
function buildSandboxStandardLibrary(context: Record<string, any> = {}): SandboxStandardContext {
  const flagStore: Record<string, any> = Object.create(null);
  const rawFlags = context.storyFlags || context.StoryFlags || {};
  if (rawFlags && typeof rawFlags === 'object') {
    for (const key of Object.keys(rawFlags)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      flagStore[key] = rawFlags[key];
    }
  }
  const queuedActions: StageMacroAction[] = [];
  const pushAction = (action: StageMacroAction) => {
    if (queuedActions.length >= 64) return;
    queuedActions.push(action);
  };

  return {
    Dice: {
      d: (sides: number) => {
        const safeSides = Math.min(10000, Math.max(1, Math.floor(Number(sides) || 1)));
        return Math.floor(Math.random() * safeSides) + 1;
      },
      roll: (count: number, sides: number) => {
        const safeCount = Math.min(1000, Math.max(1, Math.floor(Number(count) || 1)));
        const safeSides = Math.min(10000, Math.max(1, Math.floor(Number(sides) || 1)));
        return Array.from({ length: safeCount }, () => Math.floor(Math.random() * safeSides) + 1);
      },
      check2d10: (bonus: number = 0, dc: number = 15) => {
        const d1 = Math.floor(Math.random() * 10) + 1;
        const d2 = Math.floor(Math.random() * 10) + 1;
        const rawRoll = d1 + d2;
        const crit = d1 === 10 && d2 === 10;
        const fumble = d1 === 1 && d2 === 1;
        const roll = crit ? rawRoll + 10 : fumble ? -10 : rawRoll;
        const total = roll + bonus;
        const success = crit || (!fumble && total >= dc);
        const margin = total - dc;
        const outcome = crit ? 'CRITICAL SUCCESS' : fumble ? 'TACTICAL GLITCH' : success ? 'SUCCESS' : 'FAILURE';
        return {
          dice: [d1, d2],
          rawRoll,
          roll,
          effectiveRoll: roll,
          bonus,
          total,
          dc,
          success,
          crit,
          fumble,
          margin,
          outcome
        };
      },
      d100: () => Math.floor(Math.random() * 100) + 1
    },
    MathOps: {
      clamp: (val: number, min: number, max: number) => Math.max(min, Math.min(max, val)),
      margin: (val: number, target: number) => val - target,
      roundTo: (val: number, decimals: number = 2) => {
        const clampedDecimals = Math.min(12, Math.max(0, Math.floor(Number(decimals) || 0)));
        const num = Number(val);
        return Number.isFinite(num) ? Number(num.toFixed(clampedDecimals)) : 0;
      }
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
      get: (key: string, defaultVal: any = null) => {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') return defaultVal;
        return flagStore[key] !== undefined ? flagStore[key] : defaultVal;
      },
      set: (key: string, value: any) => {
        if (typeof key !== 'string' || key === '__proto__' || key === 'constructor' || key === 'prototype') return;
        try {
          flagStore[key] = value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
        } catch {
          flagStore[key] = String(value);
        }
      },
      has: (key: string) =>
        key !== '__proto__' &&
        key !== 'constructor' &&
        key !== 'prototype' &&
        Object.prototype.hasOwnProperty.call(flagStore, key),
      all: () => {
        const out: Record<string, any> = Object.create(null);
        for (const k of Object.keys(flagStore)) {
          if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
          const v = flagStore[k];
          if (typeof v === 'function' || typeof v === 'symbol') continue;
          try {
            out[k] = v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v;
          } catch {
            out[k] = String(v);
          }
        }
        return JSON.parse(JSON.stringify(out));
      }
    },
    StageAPI: {
      moveToken: (tokenId: string, x: number, y: number) => {
        if (!tokenId) return;
        pushAction({ type: 'move_token', tokenId: String(tokenId), x: Number(x) || 0, y: Number(y) || 0 });
      },
      applyDamage: (tokenId: string, amount: number, isLethal: boolean = false) => {
        if (!tokenId) return;
        pushAction({
          type: 'apply_damage',
          tokenId: String(tokenId),
          amount: Math.max(0, Number(amount) || 0),
          isLethal: Boolean(isLethal)
        });
      },
      addEffect: (tokenId: string, name: string, rounds: number = 1, tickDamage: number = 0, isLethal: boolean = false) => {
        if (!tokenId || !name) return;
        pushAction({
          type: 'add_effect',
          tokenId: String(tokenId),
          name: String(name),
          rounds: Math.max(1, Math.floor(Number(rounds) || 1)),
          tickDamage: Math.max(0, Number(tickDamage) || 0),
          isLethal: Boolean(isLethal)
        });
      },
      toggleDoor: (wallId: string) => {
        if (!wallId) return;
        pushAction({ type: 'toggle_door', wallId: String(wallId) });
      },
      emitChat: (title: string, message: string, visibility: 'public' | 'whisper_gm' | 'blind_gm' = 'public') => {
        pushAction({
          type: 'emit_chat',
          title: String(title || 'Macro Notice'),
          message: String(message || ''),
          visibility: visibility === 'whisper_gm' || visibility === 'blind_gm' ? visibility : 'public'
        });
      },
      playAudio: (cueId: string, bus: 'music' | 'ambient' | 'sfx' = 'sfx') => {
        if (!cueId) return;
        pushAction({
          type: 'play_audio',
          cueId: String(cueId),
          bus: bus === 'music' || bus === 'ambient' ? bus : 'sfx'
        });
      },
      setFlag: (key: string, value: boolean | number | string) => {
        if (!key || key === '__proto__' || key === 'constructor' || key === 'prototype') return;
        flagStore[key] = value;
        pushAction({ type: 'set_flag', key: String(key), value });
      },
      getActions: () => queuedActions.slice()
    }
  };
}

function escapeInlineScriptJson(raw: string): string {
  return String(raw)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function buildWrappedScriptBody(code: string): string {
  const trimmed = String(code || '').trim();
  if (trimmed.length > MAX_MACRO_CODE_LENGTH) {
    throw new Error(`Security Violation: Macro exceeds maximum allowed length (${MAX_MACRO_CODE_LENGTH} chars).`);
  }
  const withoutComments = trimmed
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
  const normalizedConcat = withoutComments.replace(/['"`]\s*\+\s*['"`]/g, '');
  const forbiddenPattern =
    /(\.\s*constructor\b|\[\s*['"`]?\s*constructor\s*['"`]?\s*\]|\b__proto__\b|\bprototype\b|\bglobalThis\b|\bFunction\b|\beval\b|\bimport\s*\(|\bprocess\b|\bReflect\b|\bProxy\b)/;
  const concatEscapePattern =
    /(\.\s*constructor\b|\[\s*['"`]?\s*constructor\s*['"`]?\s*\]|\bFunction\b|\beval\b|\bprocess\b|\bglobalThis\b|\bReflect\b|\bProxy\b)/;
  if (
    forbiddenPattern.test(trimmed) ||
    forbiddenPattern.test(withoutComments) ||
    concatEscapePattern.test(normalizedConcat)
  ) {
    throw new Error('Security Violation: Restricted global or prototype chain access is prohibited in sandboxed macros.');
  }

  const codeWithoutLeadingComments = trimmed.replace(/^(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)+/, '').trim();
  const hasReturn = /\breturn\b/.test(withoutComments);
  const isStatement = /^(const|let|var|if|for|while|do|switch|function|try|throw)\b/.test(codeWithoutLeadingComments);
  const scriptBody = hasReturn || isStatement
    ? trimmed
    : `return (${codeWithoutLeadingComments || trimmed});`;

  return `"use strict";\n${SANDBOX_SHADOW_PRELUDE}\n${scriptBody}`;
}

function validateAndFilterContext(context: Record<string, any> = {}): Record<string, any> {
  const safeContext: Record<string, any> = {};
  for (const [key, val] of Object.entries(context || {})) {
    if (!VALID_IDENTIFIER_REGEX.test(key)) {
      throw new Error(`Security Violation: Invalid context variable identifier "${key}".`);
    }
    if (RESTRICTED_GLOBAL_NAMES.has(key) || UNSAFE_PROTO_KEYS.has(key)) {
      throw new Error(`Security Violation: Context key "${key}" collides with a restricted sandbox global.`);
    }
    safeContext[key] = val;
  }
  return safeContext;
}

function syncStoryFlagsBack(context: Record<string, any>, finalFlags: Record<string, any> | undefined): void {
  if (!finalFlags || !context?.storyFlags || typeof context.storyFlags !== 'object') return;
  for (const k of Object.keys(context.storyFlags)) {
    if (UNSAFE_PROTO_KEYS.has(k)) continue;
    if (!Object.prototype.hasOwnProperty.call(finalFlags, k)) {
      delete context.storyFlags[k];
    }
  }
  for (const k of Object.keys(finalFlags)) {
    if (UNSAFE_PROTO_KEYS.has(k)) continue;
    context.storyFlags[k] = finalFlags[k];
  }
}

export class QuickJSSandbox {
  private readonly EXECUTION_TIMEOUT_MS = 500;

  /**
   * Generates canonical game helpers (Dice, MathOps, Trauma, StoryFlags)
   * tailored to the active execution context.
   */
  public createStandardLibrary(context: Record<string, any> = {}): SandboxStandardContext {
    return buildSandboxStandardLibrary(context);
  }

  private async executeInSandboxedIframe(
    wrappedBody: string,
    safeContext: Record<string, any>
  ): Promise<{ result: any; finalFlags: Record<string, any>; actions: StageMacroAction[] }> {
    const nonce = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
    const serializedContext = escapeInlineScriptJson(JSON.stringify(safeContext || {}));
    const serializedBody = escapeInlineScriptJson(JSON.stringify(wrappedBody));
    const serializedNonce = escapeInlineScriptJson(JSON.stringify(nonce));
    const serializedCtxArg = escapeInlineScriptJson(JSON.stringify(serializedContext));

    const srcdoc = `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none';">
</head>
<body>
<script>
(function() {
  var __nonce = ${serializedNonce};
  var __post = window.parent ? window.parent.postMessage.bind(window.parent) : null;
  var __worker = null;
  var __blobUrl = null;
  function __finish(payload) {
    if (__worker) { try { __worker.terminate(); } catch (e) {} __worker = null; }
    if (__blobUrl) { try { URL.revokeObjectURL(__blobUrl); } catch (e) {} __blobUrl = null; }
    if (__post) __post(payload, '*');
  }
  try {
    var workerCode = [
      '"use strict";',
      'var __buildStdLib = ' + ${escapeInlineScriptJson(JSON.stringify(buildSandboxStandardLibrary.toString()))} + ';',
      'try { Object.freeze(Object.prototype); } catch (e) {}',
      'try { Object.freeze(Array.prototype); } catch (e) {}',
      'self.onmessage = function(evt) {',
      '  var d = evt.data || {};',
      '  try {',
      '    var ctx = JSON.parse(d.ctxJson || "{}");',
      '    var buildFn = (0, eval)("(" + __buildStdLib + ")");',
      '    var stdLib = buildFn(ctx || {});',
      '    var env = Object.assign({',
      '      Dice: stdLib.Dice,',
      '      MathOps: stdLib.MathOps,',
      '      Trauma: stdLib.Trauma,',
      '      StoryFlags: stdLib.StoryFlags,',
      '      StageAPI: stdLib.StageAPI,',
      '      performance: { now: function() { return Date.now(); } }',
      '    }, ctx || {});',
      '    var keys = Object.keys(env);',
      '    var values = keys.map(function(k) { return env[k]; });',
      '    var runner = new Function(...keys, d.body);',
      '    var result = runner(...values);',
      '    self.postMessage({ ok: true, result: result, finalFlags: stdLib.StoryFlags.all(), actions: stdLib.StageAPI.getActions() });',
      '  } catch (err) {',
      '    self.postMessage({ ok: false, error: err && err.message ? err.message : String(err) });',
      '  }',
      '};'
    ].join('\\n');
    var blob = new Blob([workerCode], { type: 'application/javascript' });
    __blobUrl = URL.createObjectURL(blob);
    __worker = new Worker(__blobUrl);
    window.addEventListener('message', function(evt) {
      if (evt.data && evt.data.__terminateSandbox && evt.data.__sandboxNonce === __nonce) {
        __finish({ __sandboxNonce: __nonce, ok: false, error: 'Terminated' });
      }
    });
    __worker.onmessage = function(evt) {
      var res = evt.data || {};
      __finish({ __sandboxNonce: __nonce, ok: Boolean(res.ok), result: res.result, finalFlags: res.finalFlags, actions: res.actions || [], error: res.error });
    };
    __worker.onerror = function(err) {
      __finish({ __sandboxNonce: __nonce, ok: false, error: err && err.message ? err.message : 'Worker execution failed' });
    };
    __worker.postMessage({ ctxJson: ${serializedCtxArg}, body: ${serializedBody} });
  } catch (fallbackErr) {
    try {
      var __buildStdLibFallback = ${buildSandboxStandardLibrary.toString()};
      try { Object.freeze(Object.prototype); } catch (e) {}
      try { Object.freeze(Array.prototype); } catch (e) {}
      var ctxFallback = JSON.parse(${serializedCtxArg});
      var stdLibFallback = __buildStdLibFallback(ctxFallback || {});
      var envFallback = Object.assign({
        Dice: stdLibFallback.Dice,
        MathOps: stdLibFallback.MathOps,
        Trauma: stdLibFallback.Trauma,
        StoryFlags: stdLibFallback.StoryFlags,
        StageAPI: stdLibFallback.StageAPI,
        performance: { now: function() { return Date.now(); } }
      }, ctxFallback || {});
      var fKeys = Object.keys(envFallback);
      var fVals = Object.values(envFallback);
      var fRunner = new Function(...fKeys, ${serializedBody});
      var fResult = fRunner(...fVals);
      __finish({ __sandboxNonce: __nonce, ok: true, result: fResult, finalFlags: stdLibFallback.StoryFlags.all(), actions: stdLibFallback.StageAPI.getActions() });
    } catch (innerErr) {
      __finish({ __sandboxNonce: __nonce, ok: false, error: innerErr && innerErr.message ? innerErr.message : String(innerErr) });
    }
  }
})();
</script>
</body>
</html>`;

    return new Promise((resolve, reject) => {
      let settled = false;
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-scripts');
      iframe.style.display = 'none';
      iframe.srcdoc = srcdoc;

      const cleanup = () => {
        window.removeEventListener('message', handleMessage);
        try {
          iframe.contentWindow?.postMessage({ __terminateSandbox: true, __sandboxNonce: nonce }, '*');
        } catch {}
        try {
          iframe.remove();
        } catch {}
      };

      const watchdog = setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          reject(new Error(`[QuickJS Sandbox] Watchdog Terminated: Macro exceeded ${this.EXECUTION_TIMEOUT_MS}ms timeout limit.`));
        }
      }, this.EXECUTION_TIMEOUT_MS);

      const handleMessage = (event: MessageEvent) => {
        if (settled || event.source !== iframe.contentWindow) return;
        const payload = event.data;
        if (!payload || payload.__sandboxNonce !== nonce) return;
        settled = true;
        clearTimeout(watchdog);
        cleanup();
        if (payload.ok) {
          resolve({ result: payload.result, finalFlags: payload.finalFlags, actions: payload.actions || [] });
        } else {
          reject(new Error(`[QuickJS Sandbox] Macro Execution Error: ${payload.error || 'Unknown sandbox iframe error'}`));
        }
      };

      window.addEventListener('message', handleMessage);
      document.body.appendChild(iframe);
    });
  }

  private async executeInBrowserWorker(
    wrappedBody: string,
    safeContext: Record<string, any>
  ): Promise<{ result: any; finalFlags: Record<string, any>; actions: StageMacroAction[] }> {
    const workerSource = `
      const __buildStdLib = ${buildSandboxStandardLibrary.toString()};
      const __postResult = self.postMessage.bind(self);
      try { Object.freeze(Object.prototype); } catch {}
      try { Object.freeze(Array.prototype); } catch {}
      try { self.postMessage = undefined; } catch {}
      // Lock down worker network/storage surfaces before executing user code
      try { self.fetch = undefined; } catch {}
      try { self.XMLHttpRequest = undefined; } catch {}
      try { self.WebSocket = undefined; } catch {}
      try { self.importScripts = undefined; } catch {}
      try { self.indexedDB = undefined; } catch {}
      try { self.caches = undefined; } catch {}
      try { self.BroadcastChannel = undefined; } catch {}
      try { self.Worker = undefined; } catch {}

      self.onmessage = function(ev) {
        const { wrappedBody, safeContext } = ev.data || {};
        try {
          const stdLib = __buildStdLib(safeContext || {});
          const sandboxEnv = Object.assign(
            {
              Dice: stdLib.Dice,
              MathOps: stdLib.MathOps,
              Trauma: stdLib.Trauma,
              StoryFlags: stdLib.StoryFlags,
              StageAPI: stdLib.StageAPI,
              performance: typeof performance !== 'undefined' ? performance : { now: () => Date.now() }
            },
            safeContext || {}
          );
          const keys = Object.keys(sandboxEnv);
          const values = Object.values(sandboxEnv);
          const runner = new Function(...keys, wrappedBody);
          const result = runner(...values);
          __postResult({ ok: true, result, finalFlags: stdLib.StoryFlags.all(), actions: stdLib.StageAPI.getActions() });
        } catch (err) {
          __postResult({ ok: false, error: err && err.message ? err.message : String(err) });
        }
      };
    `;

    const blob = new Blob([workerSource], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);

    let worker: Worker;
    try {
      worker = new Worker(blobUrl);
    } catch (err) {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch {}
      throw err;
    }

    return new Promise((resolve, reject) => {
      let settled = false;

      const cleanup = () => {
        try {
          worker.terminate();
        } catch {}
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {}
      };

      const watchdog = setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          reject(new Error(`[QuickJS Sandbox] Watchdog Terminated: Macro exceeded ${this.EXECUTION_TIMEOUT_MS}ms timeout limit.`));
        }
      }, this.EXECUTION_TIMEOUT_MS);

      worker.onmessage = (event: MessageEvent) => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        cleanup();
        const payload = event.data || {};
        if (payload.ok) {
          resolve({ result: payload.result, finalFlags: payload.finalFlags, actions: payload.actions || [] });
        } else {
          reject(new Error(`[QuickJS Sandbox] Macro Execution Error: ${payload.error || 'Unknown worker error'}`));
        }
      };

      worker.onerror = (err: ErrorEvent) => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        cleanup();
        reject(new Error(`[QuickJS Sandbox] Macro Execution Error: ${err?.message || 'Worker failure'}`));
      };

      worker.postMessage({ wrappedBody, safeContext });
    });
  }

  private async executeInNodeVm(
    wrappedBody: string,
    safeContext: Record<string, any>
  ): Promise<{ result: any; finalFlags: Record<string, any>; actions: StageMacroAction[] }> {
    const vmModuleSpec = 'node:' + 'vm';
    const vm: any = await import(/* @vite-ignore */ vmModuleSpec);

    // Build VM realm with ZERO host-realm objects/prototypes exposed
    let vmContext: any;
    try {
      vmContext = vm.createContext(Object.create(null), {
        codeGeneration: { strings: false, wasm: false },
        microtaskMode: 'afterEvaluate'
      });
    } catch {
      vmContext = vm.createContext(Object.create(null), {
        codeGeneration: { strings: false, wasm: false }
      });
    }

    const serializedContext = JSON.stringify(safeContext || {});
    const bootstrapSource = `
      const __ctx = JSON.parse(${JSON.stringify(serializedContext)});
      const __buildStdLib = ${buildSandboxStandardLibrary.toString()};
      const __stdLib = __buildStdLib(__ctx);
      const __perf = { now: () => Date.now() };
      const __runUserMacro = (${Object.keys(safeContext).length > 0
        ? `function(${['Dice', 'MathOps', 'Trauma', 'StoryFlags', 'StageAPI', 'performance', ...Object.keys(safeContext)].join(', ')}) {\n${wrappedBody}\n}`
        : `function(Dice, MathOps, Trauma, StoryFlags, StageAPI, performance) {\n${wrappedBody}\n}`});
      const __macroResult = __runUserMacro(
        __stdLib.Dice,
        __stdLib.MathOps,
        __stdLib.Trauma,
        __stdLib.StoryFlags,
        __stdLib.StageAPI,
        __perf${Object.keys(safeContext).length > 0 ? ', ' + Object.keys(safeContext).map((k) => `__ctx[${JSON.stringify(k)}]`).join(', ') : ''}
      );
      JSON.stringify({
        result: __macroResult === undefined ? null : __macroResult,
        hasUndefinedResult: __macroResult === undefined,
        finalFlags: __stdLib.StoryFlags.all(),
        actions: __stdLib.StageAPI.getActions()
      });
    `;

    try {
      const rawJson = vm.runInContext(bootstrapSource, vmContext, {
        timeout: this.EXECUTION_TIMEOUT_MS,
        displayErrors: true
      });
      const parsed = JSON.parse(rawJson);
      return {
        result: parsed.hasUndefinedResult ? undefined : parsed.result,
        finalFlags: parsed.finalFlags || {},
        actions: Array.isArray(parsed.actions) ? parsed.actions : []
      };
    } catch (err: any) {
      if (err?.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' || /timed out/i.test(String(err?.message || ''))) {
        throw new Error(`[QuickJS Sandbox] Watchdog Terminated: Macro exceeded ${this.EXECUTION_TIMEOUT_MS}ms timeout limit.`);
      }
      throw err;
    }
  }

  /**
   * Executes untrusted macro code safely in an isolated runtime and returns both
   * the macro's return value and any queued StageAPI actions.
   */
  public async executeWithActions(
    code: string,
    context: Record<string, any> = {}
  ): Promise<{ result: any; actions: StageMacroAction[]; executionTimeMs: number }> {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    try {
      const safeContext = validateAndFilterContext(context);
      const wrappedBody = buildWrappedScriptBody(code);

      const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '');
      const canUseSandboxedIframe =
        !isJsdom &&
        typeof document !== 'undefined' &&
        Boolean(document.body) &&
        typeof window !== 'undefined' &&
        typeof window.addEventListener === 'function';
      const canUseBrowserWorker =
        typeof Worker !== 'undefined' &&
        typeof Blob !== 'undefined' &&
        typeof URL !== 'undefined' &&
        typeof URL.createObjectURL === 'function';

      const { result, finalFlags, actions } = canUseSandboxedIframe
        ? await this.executeInSandboxedIframe(wrappedBody, safeContext)
        : canUseBrowserWorker
          ? await this.executeInBrowserWorker(wrappedBody, safeContext)
          : await this.executeInNodeVm(wrappedBody, safeContext);

      syncStoryFlagsBack(context, finalFlags);
      const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;
      console.log(`[QuickJS Sandbox] Macro executed cleanly in ${elapsed.toFixed(2)}ms`);
      return { result, actions: actions || [], executionTimeMs: elapsed };
    } catch (error: any) {
      const msg = String(error?.message || error || 'Unknown sandbox error');
      if (msg.startsWith('[QuickJS Sandbox]')) {
        throw error;
      }
      throw new Error(`[QuickJS Sandbox] Macro Execution Error: ${msg}`);
    }
  }

  /**
   * Executes untrusted macro code safely in an isolated runtime
   * with injected standard game utilities and hard watchdog timeouts.
   */
  public async execute(code: string, context: Record<string, any> = {}): Promise<any> {
    const { result } = await this.executeWithActions(code, context);
    return result;
  }
}
