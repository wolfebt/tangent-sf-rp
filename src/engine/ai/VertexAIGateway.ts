/**
 * @file VertexAIGateway.ts
 * @description Stage 7 Dual-Agent AI Ecosystem Gateway.
 * Proxies Gemini Vertex AI requests through a 4-tier hybrid cascade:
 * 1. Local LLM Hardware LOD Tier Router (llama.cpp GBNF / Ollama)
 * 2. Cloud Function Proxy (/geminiProxy with X-Firebase-AppCheck & JWT auth)
 * 3. Direct Client Gemini Flash Cascade (when a client API key is configured)
 * 4. Context-Aware Deterministic Local Simulation Fallback
 */

import {
  resolveIntelligenceTier,
  callAutomatedInferencePipeline,
  type LodTierKey
} from '../../services/aimeTierRouter.ts';
import {
  getGeminiApiKey,
  fetchGeminiContent
} from '../../services/bastionService.js';
import { auth } from '../../firebase.js';
import { getFreshFirebaseIdToken } from '../../utils/firebaseTokenStore.js';

export interface AIRequestOptions {
  model?: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro' | 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
  responseSchema?: Record<string, any>;
  systemInstruction?: string;
  contents?: Array<Record<string, any>>;
  grammar?: string;
  tierKey?: LodTierKey;
  localEndpoint?: string;
  skipLocalInference?: boolean;
  tools?: Array<Record<string, any>>;
  stream?: boolean;
  onStreamChunk?: (chunkText: string, accumulatedText: string) => void;
}

export interface AIGatewayResponse<T = any> {
  success: boolean;
  data?: T;
  text?: string;
  error?: string;
  isSimulated?: boolean;
  provider?: 'local_llama' | 'local_ollama' | 'cloud_proxy' | 'client_gemini' | 'simulation';
  toolCalls?: Array<{ name: string; args: Record<string, any>; result?: any }>;
  latencyMs?: number;
}

class VertexAIGatewayService {
  private endpointUrl: string = '/geminiProxy';
  private appCheckToken: string | null = null;
  private authToken: string | null = null;
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();
  private readonly MAX_REQUESTS_PER_MINUTE = 60;

  public setTokens(appCheckToken: string | null, authToken: string | null) {
    this.appCheckToken = appCheckToken;
    this.authToken = authToken;
  }

  public setEndpointUrl(url: string) {
    if (url && url.trim()) {
      this.endpointUrl = url.trim();
    }
  }

  /**
   * Client-side sliding-window rate limiter.
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    this.requestCount++;
    return true;
  }

  private normalizeModelName(model?: string): string {
    const raw = (model || 'gemini-2.5-flash').trim();
    if (raw === 'gemini-1.5-flash') return 'gemini-2.5-flash';
    if (raw === 'gemini-1.5-pro') return 'gemini-2.5-pro';
    return raw;
  }

  private tryParseJsonPayload(text: string, responseMimeType?: string): any {
    if (!text) return text;
    if (responseMimeType !== 'application/json') return text;
    const stripped = text
      .replace(/```(?:json)?\s*/gi, '')
      .replace(/```/g, '')
      .trim();
    try {
      return JSON.parse(stripped);
    } catch {
      const objMatch = stripped.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (objMatch) {
        try {
          return JSON.parse(objMatch[0]);
        } catch {
          return text;
        }
      }
      return text;
    }
  }

  private buildLocalPromptAndCheckMedia(prompt: string, options: AIRequestOptions): { hasMedia: boolean; localPrompt: string } {
    let hasMedia = false;
    const serializedContents: string[] = [];
    if (Array.isArray(options.contents)) {
      for (const msg of options.contents) {
        const parts = Array.isArray(msg?.parts) ? msg.parts : [];
        const textSegments: string[] = [];
        for (const p of parts) {
          if (p?.inlineData || p?.fileData) {
            hasMedia = true;
          }
          if (typeof p?.text === 'string' && p.text.trim()) {
            textSegments.push(p.text.trim());
          }
        }
        if (textSegments.length > 0) {
          const roleLabel = msg?.role ? String(msg.role).toUpperCase() : 'USER';
          serializedContents.push(`${roleLabel}: ${textSegments.join('\n')}`);
        }
      }
    }

    const baseContent = serializedContents.length > 0 ? serializedContents.join('\n\n') : prompt;
    const localPrompt = options.systemInstruction
      ? `${options.systemInstruction}\n\n${baseContent}`
      : baseContent;

    return { hasMedia, localPrompt };
  }

  /**
   * Dispatches a structured prompt to Gemini via Cloud Function proxy (geminiProxy).
   */
  public async generateContent<T = any>(
    prompt: string,
    options: AIRequestOptions = {}
  ): Promise<AIGatewayResponse<T>> {
    const startTime = performance.now();
    const resolvedModel = this.normalizeModelName(options.model);

    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'Client-side rate limit exceeded (60 req/min). Please throttle requests.',
        latencyMs: Math.round(performance.now() - startTime)
      };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.appCheckToken) {
      headers['X-Firebase-AppCheck'] = this.appCheckToken;
    }
    let resolvedAuthToken = this.authToken;
    if (!resolvedAuthToken) {
      resolvedAuthToken = await getFreshFirebaseIdToken(auth, false);
    }
    if (resolvedAuthToken) {
      headers['Authorization'] = `Bearer ${resolvedAuthToken}`;
    }

    try {
      // ── TIER 1: Local Hardware LOD Tier Router (llama.cpp / Ollama) ──
      let isLocalEnabled = Boolean(options.localEndpoint);
      let configuredLocalEndpoint = options.localEndpoint || null;
      try {
        if (typeof localStorage !== 'undefined') {
          if (
            localStorage.getItem('aiPlatform') === 'custom' ||
            localStorage.getItem('tangent_local_llm_enabled') === 'true'
          ) {
            isLocalEnabled = true;
          }
          if (!configuredLocalEndpoint) {
            configuredLocalEndpoint =
              localStorage.getItem('customEndpoint') ||
              localStorage.getItem('tangent_local_llm_endpoint');
          }
        }
      } catch {}

      const { hasMedia, localPrompt } = this.buildLocalPromptAndCheckMedia(prompt, options);

      // Local text LLMs cannot inspect multimodal inlineData blobs or run Gemini function declarations natively
      if (
        !options.skipLocalInference &&
        isLocalEnabled &&
        !hasMedia &&
        (!Array.isArray(options.tools) || options.tools.length === 0)
      ) {
        const tierConfig = resolveIntelligenceTier({
          actionText: prompt,
          userOverride: options.tierKey || 'auto'
        });
        const localRes = await callAutomatedInferencePipeline({
          llamaEndpoint: configuredLocalEndpoint || 'http://localhost:8080',
          ollamaEndpoint: 'http://localhost:11434',
          prompt: localPrompt,
          grammar: options.grammar,
          tier: tierConfig,
          enforceJson: options.responseMimeType === 'application/json',
          onChunk: options.onStreamChunk ? (piece) => options.onStreamChunk?.(piece, piece) : undefined
        });
        if (localRes && localRes.text) {
          const parsedLocal = this.tryParseJsonPayload(localRes.text, options.responseMimeType);
          return {
            success: true,
            data: parsedLocal,
            text: localRes.text,
            isSimulated: false,
            provider: (localRes as any).provider === 'llama.cpp' || localRes.engine === 'llama_cpp' ? 'local_llama' : 'local_ollama',
            latencyMs: Math.round(performance.now() - startTime)
          };
        }
      }

      // ── TIER 2: Cloud Function Proxy (/geminiProxy) ──
      const generationConfig: Record<string, any> = {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 2048
      };
      if (options.responseMimeType) {
        generationConfig.responseMimeType = options.responseMimeType;
      }
      if (options.responseSchema) {
        generationConfig.responseSchema = options.responseSchema;
      }

      const proxyPayload = JSON.stringify({
        prompt,
        contents: options.contents,
        systemInstruction: options.systemInstruction
          ? { parts: [{ text: options.systemInstruction }] }
          : undefined,
        model: resolvedModel,
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
        responseMimeType: options.responseMimeType || 'text/plain',
        responseSchema: options.responseSchema,
        generationConfig,
        tools: options.tools
      });

      let response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers,
        body: proxyPayload
      });

      if (response.status === 401 && !this.authToken) {
        const refreshed = await getFreshFirebaseIdToken(auth, true);
        if (refreshed && refreshed !== resolvedAuthToken) {
          resolvedAuthToken = refreshed;
          headers['Authorization'] = `Bearer ${refreshed}`;
          response = await fetch(this.endpointUrl, {
            method: 'POST',
            headers,
            body: proxyPayload
          });
        }
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('[VertexAIGateway] Auth/AppCheck missing or rejected. Falling back to next tier.');
        }
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const candidateText = parts.find((p: any) => typeof p?.text === 'string')?.text || json?.candidates?.[0]?.content?.parts?.[0]?.text;
      const rawToolCalls = parts
        .filter((p: any) => p && p.functionCall)
        .map((p: any) => ({
          name: p.functionCall.name,
          args: p.functionCall.args || {}
        }));
      let parsedData = json.data;
      if (!parsedData && candidateText) {
        parsedData = this.tryParseJsonPayload(candidateText, options.responseMimeType);
      }

      const finalProxyText = json.text || candidateText || (typeof parsedData === 'string' ? parsedData : (parsedData ? JSON.stringify(parsedData) : ''));
      if (options.onStreamChunk && finalProxyText) {
        options.onStreamChunk(finalProxyText, finalProxyText);
      }

      return {
        success: true,
        data: parsedData,
        text: finalProxyText,
        toolCalls: rawToolCalls.length > 0 ? rawToolCalls : undefined,
        isSimulated: false,
        provider: 'cloud_proxy',
        latencyMs: Math.round(performance.now() - startTime)
      };
    } catch (_proxyErr: any) {
      // ── TIER 3: Direct Client Gemini Flash Cascade (if API key configured) ──
      const clientApiKey = getGeminiApiKey();
      if (clientApiKey) {
        try {
          const generationConfig: Record<string, any> = {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxOutputTokens ?? 2048
          };
          if (options.responseMimeType) {
            generationConfig.responseMimeType = options.responseMimeType;
          }
          if (options.responseSchema) {
            generationConfig.responseSchema = options.responseSchema;
          }
          const reqBody: Record<string, any> = {
            contents: options.contents || [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig
          };
          if (options.systemInstruction) {
            reqBody.systemInstruction = { parts: [{ text: options.systemInstruction }] };
          }
          if (options.tools) {
            reqBody.tools = options.tools;
          }
          const directJson = await fetchGeminiContent(clientApiKey, reqBody, {
            preferredModel: resolvedModel,
            onStreamChunk: options.onStreamChunk
          });
          const directParts = directJson?.candidates?.[0]?.content?.parts || [];
          const candidateText = directParts.find((p: any) => typeof p?.text === 'string')?.text || directJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const directToolCalls = directParts
            .filter((p: any) => p && p.functionCall)
            .map((p: any) => ({
              name: p.functionCall.name,
              args: p.functionCall.args || {}
            }));
          const parsedData = this.tryParseJsonPayload(candidateText, options.responseMimeType);
          return {
            success: true,
            data: parsedData,
            text: candidateText,
            toolCalls: directToolCalls.length > 0 ? directToolCalls : undefined,
            isSimulated: false,
            provider: 'client_gemini',
            latencyMs: Math.round(performance.now() - startTime)
          };
        } catch {
          // Fall through to deterministic simulation
        }
      }

      // ── TIER 4: Context-Aware Deterministic Local Simulation ──
      return this.fallbackSimulation<T>(prompt, options, startTime);
    }
  }

  /**
   * Executes a prompt with Stage 7 Multi-Turn Function Calling support (bounded max 3 hops),
   * dispatching any model-requested tool calls (or heuristic tool triggers when simulated) via toolExecutor.
   */
  public async executeWithTools<T = any>(
    prompt: string,
    toolDeclarations: Array<{ name: string; description: string; parameters: Record<string, any> }>,
    toolExecutor: (call: { name: string; args: Record<string, any> }) => Promise<any>,
    options: AIRequestOptions = {}
  ): Promise<AIGatewayResponse<T>> {
    const toolsPayload = toolDeclarations.length > 0 ? [{ functionDeclarations: toolDeclarations }] : undefined;
    const conversationContents: Array<Record<string, any>> = options.contents
      ? [...options.contents]
      : [{ role: 'user', parts: [{ text: prompt }] }];

    let response = await this.generateContent<T>(prompt, {
      ...options,
      contents: conversationContents,
      tools: toolsPayload
    });

    const executedCalls: Array<{ name: string; args: Record<string, any>; result?: any }> = [];
    const lowerPrompt = (prompt || '').toLowerCase();
    const MAX_TOOL_HOPS = 3;
    let hop = 0;

    // Multi-turn neuro-symbolic tool loop when backed by a live Gemini model
    while (
      !response.isSimulated &&
      Array.isArray(response.toolCalls) &&
      response.toolCalls.length > 0 &&
      typeof toolExecutor === 'function' &&
      hop < MAX_TOOL_HOPS
    ) {
      hop++;
      const modelCallParts: Array<Record<string, any>> = [];
      const functionResponseParts: Array<Record<string, any>> = [];

      for (const call of response.toolCalls) {
        const res = await toolExecutor({
          name: call.name,
          args: call.args || {}
        });
        executedCalls.push({
          name: call.name,
          args: call.args || {},
          result: res
        });
        modelCallParts.push({
          functionCall: {
            name: call.name,
            args: call.args || {}
          }
        });
        functionResponseParts.push({
          functionResponse: {
            name: call.name,
            response: { result: res }
          }
        });
      }

      conversationContents.push({ role: 'model', parts: modelCallParts });
      conversationContents.push({ role: 'user', parts: functionResponseParts });

      const followUp = await this.generateContent<T>(prompt, {
        ...options,
        contents: conversationContents,
        tools: toolsPayload
      });

      if (followUp.success && !followUp.isSimulated) {
        response = followUp;
      } else {
        break;
      }
    }

    // If simulated or if the prompt explicitly requests a registered Stage 7 tool capability,
    // deterministically invoke the matching tool so Stage 7 agents always ground their response.
    if (executedCalls.length === 0 && response.isSimulated && typeof toolExecutor === 'function') {
      const allowedNames = new Set(toolDeclarations.map((d) => d.name));
      const parseNum = (rx: RegExp, fallback: number): number => {
        const m = lowerPrompt.match(rx);
        return m && Number.isFinite(Number(m[1])) ? Number(m[1]) : fallback;
      };

      if (
        allowedNames.has('evaluate_economatrix_acquisition') &&
        (lowerPrompt.includes('economatrix') || lowerPrompt.includes('purchase cr') || lowerPrompt.includes('purchase dc') || lowerPrompt.includes('cost cr') || lowerPrompt.includes('cost dc'))
      ) {
        const itemCr = parseNum(/\bcr\s*(\d+)\b/, parseNum(/\b(\d+)\s*cr\b/, 15));
        const wealthScore = parseNum(/\b(?:ws|wealth(?:\s*score)?)\s*(\d+)\b/, 12);
        const res = await toolExecutor({
          name: 'evaluate_economatrix_acquisition',
          args: { itemCr, itemCostDc: itemCr, wealthScore }
        });
        executedCalls.push({ name: 'evaluate_economatrix_acquisition', args: { itemCr, wealthScore }, result: res });
      } else if (
        allowedNames.has('resolve_called_shot') &&
        (lowerPrompt.includes('called shot') || lowerPrompt.includes('headshot'))
      ) {
        const targetLocation = lowerPrompt.includes('optic') || lowerPrompt.includes('sensor')
          ? 'optics'
          : lowerPrompt.includes('leg')
            ? 'legs'
            : lowerPrompt.includes('arm')
              ? 'arms'
              : lowerPrompt.includes('torso')
                ? 'torso'
                : 'head';
        const incomingDamage = parseNum(/\b(\d+)\s*(?:dmg|damage)\b/, 18);
        const armorDr = parseNum(/\b(?:dr|armor)\s*(\d+)\b/, 4);
        const penetration = parseNum(/\b(?:ap|pen|penetration)\s*(\d+)\b/, 0);
        const staminaToughness = parseNum(/\b(?:stamina|toughness)\s*(\d+)\b/, 0);
        const targetMaxHp = parseNum(/\b(?:max\s*hp|max\s*health|hp)\s*(\d+)\b/, lowerPrompt.includes('synthetic') ? 60 : 30);
        const damageType = lowerPrompt.includes('force')
          ? 'force'
          : lowerPrompt.includes('bleed')
            ? 'bleed'
            : lowerPrompt.includes('spectral') || lowerPrompt.includes('phase')
              ? 'spectral'
              : lowerPrompt.includes('sonic')
                ? 'sonic'
                : lowerPrompt.includes('concussive')
                  ? 'concussive'
                  : 'kinetic';
        const args = {
          targetLocation,
          incomingDamage,
          armorDr,
          penetration,
          staminaToughness,
          targetMaxHp,
          damageType,
          isSynthetic: lowerPrompt.includes('synthetic')
        };
        const res = await toolExecutor({
          name: 'resolve_called_shot',
          args
        });
        executedCalls.push({ name: 'resolve_called_shot', args, result: res });
      } else if (
        allowedNames.has('calculate_combat_odds') &&
        (lowerPrompt.includes('odds') || lowerPrompt.includes('hit probability') || lowerPrompt.includes('2d10 vs'))
      ) {
        const attackBonus = parseNum(/(?:bonus|attack)\s*\+?(-?\d+)\b/, 5);
        const targetCR = parseNum(/\b(?:cr|defense)\s*(\d+)\b/, 15);
        const res = await toolExecutor({
          name: 'calculate_combat_odds',
          args: { attackBonus, targetCR }
        });
        executedCalls.push({ name: 'calculate_combat_odds', args: { attackBonus, targetCR }, result: res });
      } else if (
        allowedNames.has('calculate_armor_mitigation') &&
        (lowerPrompt.includes('armor mitigation') || lowerPrompt.includes('mitigation') || lowerPrompt.includes('penetration'))
      ) {
        const rawDamage = parseNum(/\b(\d+)\s*(?:dmg|damage)\b/, 20);
        const penetration = parseNum(/\b(?:ap|pen|penetration)\s*(\d+)\b/, 0);
        const armorDr = parseNum(/\b(?:dr|armor)\s*(\d+)\b/, 4);
        const staminaToughness = parseNum(/\b(?:stamina|toughness)\s*(\d+)\b/, 0);
        const damageType = lowerPrompt.includes('force')
          ? 'force'
          : lowerPrompt.includes('bleed')
            ? 'bleed'
            : lowerPrompt.includes('spectral')
              ? 'spectral'
              : lowerPrompt.includes('sonic')
                ? 'sonic'
                : 'kinetic';
        const args = { rawDamage, armorLayers: [armorDr], penetration, staminaToughness, damageType };
        const res = await toolExecutor({
          name: 'calculate_armor_mitigation',
          args
        });
        executedCalls.push({ name: 'calculate_armor_mitigation', args, result: res });
      } else if (
        allowedNames.has('query_bastion_for_statblock') &&
        (lowerPrompt.includes('statblock') || lowerPrompt.includes('150 cp') || lowerPrompt.includes('150 bp'))
      ) {
        const res = await toolExecutor({
          name: 'query_bastion_for_statblock',
          args: { concept: prompt, species: 'Human', techLevel: 3 }
        });
        executedCalls.push({ name: 'query_bastion_for_statblock', args: { concept: prompt, species: 'Human', techLevel: 3 }, result: res });
      } else if (
        allowedNames.has('synthesize_adversary_tactic') &&
        (lowerPrompt.includes('tactic') || lowerPrompt.includes('adversary'))
      ) {
        const res = await toolExecutor({
          name: 'synthesize_adversary_tactic',
          args: { adversary: { id: 'adv_1', label: 'Syndicate Skirmisher', health: { current: 30, max: 30 } }, heroes: [] }
        });
        executedCalls.push({ name: 'synthesize_adversary_tactic', args: { adversary: { id: 'adv_1', label: 'Syndicate Skirmisher' } }, result: res });
      }
    }

    return {
      ...response,
      toolCalls: executedCalls
    };
  }

  /**
   * Deterministic local fallback simulator for offline testing or unauthenticated development.
   */
  private fallbackSimulation<T>(
    prompt: string,
    options: AIRequestOptions,
    startTime: number
  ): AIGatewayResponse<T> {
    const isJson = options.responseMimeType === 'application/json';

    let fallbackData: any;
    if (isJson) {
      fallbackData = {
        name: 'Synthesized Operator',
        species: 'Human',
        attributes: { strength: 3, agility: 4, stamina: 3, intellect: 2, wisdom: 3, charisma: 3 },
        stats: { strength: 3, agility: 4, stamina: 3, intellect: 2, wisdom: 3, charisma: 3 },
        skills: {
          Ballistic: 5,
          Athletics: 5,
          Alertness: 4,
          Electronics: 4,
          Stealth: 4,
          Computers: 5,
          Demolitions: 4,
          Piloting: 4,
          Survival: 4,
          Melee: 5,
          Engineering: 4,
          Tactics: 4,
          Medicine: 4
        },
        vitals: { health: 30, vitality: 30, structure: 60 },
        totalCp: 150,
        totalBp: 150,
        isValid: true
      };
    } else if (
      prompt.includes('SYSTEM STRUCTURAL MANDATE') ||
      prompt.includes('SEALED MECHANICAL MANDATE') ||
      /•\s*System Intent:/i.test(prompt) ||
      prompt.includes('SYSTEM INTENT')
    ) {
      const cuesMatch = prompt.match(/(?:Required|Mandatory)\s+Sensory\s+Cues(?:\s+to\s+Depict)?:\s*([^\n]+)/i);
      const outcomeMatch = prompt.match(/Prescribed(?:\s+Narrative)?\s+Outcome:\s*([^\n]+)/i);
      const intentMatch = prompt.match(/System Intent:\s*([A-Z_]+)/i);
      const cues = cuesMatch ? cuesMatch[1].trim() : 'ozone discharge and cycling bulkhead locks';
      const outcome = outcomeMatch ? outcomeMatch[1].trim() : 'The operator executes the maneuver within canonical parameters.';
      fallbackData = `[AIME MANDATED BEAT${intentMatch ? ` (${intentMatch[1]})` : ''}]: ${outcome} Sensory telemetry registers ${cues}.`;
    } else {
      fallbackData = `[AIME SIMULATED TELEMETRY]: Analyzing situation. Atmospheric sensors detect low-pressure venting and magnetic resonance. Proceed with standard caution.`;
    }

    return {
      success: true,
      data: fallbackData as T,
      text: typeof fallbackData === 'string' ? fallbackData : JSON.stringify(fallbackData, null, 2),
      isSimulated: true,
      provider: 'simulation',
      latencyMs: Math.round(performance.now() - startTime)
    };
  }
}

export const VertexAIGateway = new VertexAIGatewayService();
export default VertexAIGateway;
