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

export interface AIRequestOptions {
  model?: 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gemini-2.0-flash' | 'gemini-2.5-flash';
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
  responseSchema?: Record<string, any>;
  grammar?: string;
  tierKey?: LodTierKey;
  localEndpoint?: string;
  tools?: Array<Record<string, any>>;
  stream?: boolean;
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

  /**
   * Dispatches a structured prompt to Gemini via Cloud Function proxy (geminiProxy).
   */
  public async generateContent<T = any>(
    prompt: string,
    options: AIRequestOptions = {}
  ): Promise<AIGatewayResponse<T>> {
    const startTime = performance.now();

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
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
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

      if (isLocalEnabled) {
        const tierConfig = resolveIntelligenceTier({
          actionText: prompt,
          userOverride: options.tierKey || 'auto'
        });
        const localRes = await callAutomatedInferencePipeline({
          llamaEndpoint: configuredLocalEndpoint || 'http://localhost:8080',
          ollamaEndpoint: 'http://localhost:11434',
          prompt,
          grammar: options.grammar,
          tier: tierConfig,
          enforceJson: options.responseMimeType === 'application/json'
        });
        if (localRes && localRes.text) {
          let parsedLocal: any = localRes.text;
          if (options.responseMimeType === 'application/json') {
            try {
              const clean = localRes.text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
              parsedLocal = JSON.parse(clean);
            } catch {
              parsedLocal = localRes.text;
            }
          }
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

      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          model: options.model || 'gemini-2.5-flash',
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 2048,
          responseMimeType: options.responseMimeType || 'text/plain',
          responseSchema: options.responseSchema,
          generationConfig,
          tools: options.tools
        })
      });

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
        if (options.responseMimeType === 'application/json') {
          try {
            const clean = candidateText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
            parsedData = JSON.parse(clean);
          } catch {
            parsedData = candidateText;
          }
        } else {
          parsedData = candidateText;
        }
      }

      return {
        success: true,
        data: parsedData,
        text: json.text || candidateText || (typeof parsedData === 'string' ? parsedData : (parsedData ? JSON.stringify(parsedData) : '')),
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
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig
          };
          if (options.tools) {
            reqBody.tools = options.tools;
          }
          const directJson = await fetchGeminiContent(clientApiKey, reqBody);
          const directParts = directJson?.candidates?.[0]?.content?.parts || [];
          const candidateText = directParts.find((p: any) => typeof p?.text === 'string')?.text || directJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const directToolCalls = directParts
            .filter((p: any) => p && p.functionCall)
            .map((p: any) => ({
              name: p.functionCall.name,
              args: p.functionCall.args || {}
            }));
          let parsedData: any = candidateText;
          if (options.responseMimeType === 'application/json' && candidateText) {
            try {
              const clean = candidateText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
              parsedData = JSON.parse(clean);
            } catch {
              parsedData = candidateText;
            }
          }
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
   * Executes a prompt with Stage 7 Function Calling support, dispatching any
   * model-requested tool calls (or heuristic tool triggers when simulated) via toolExecutor.
   */
  public async executeWithTools<T = any>(
    prompt: string,
    toolDeclarations: Array<{ name: string; description: string; parameters: Record<string, any> }>,
    toolExecutor: (call: { name: string; args: Record<string, any> }) => Promise<any>,
    options: AIRequestOptions = {}
  ): Promise<AIGatewayResponse<T>> {
    const response = await this.generateContent<T>(prompt, {
      ...options,
      tools: [{ functionDeclarations: toolDeclarations }]
    });

    const executedCalls: Array<{ name: string; args: Record<string, any>; result?: any }> = [];
    const lowerPrompt = (prompt || '').toLowerCase();

    // Execute any functionCall parts returned by the model
    if (Array.isArray(response.toolCalls) && response.toolCalls.length > 0 && typeof toolExecutor === 'function') {
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
      }
    }

    // If simulated or if the prompt explicitly requests a registered Stage 7 tool capability,
    // deterministically invoke the matching tool so Stage 7 agents always ground their response.
    if (executedCalls.length === 0 && response.isSimulated && typeof toolExecutor === 'function') {
      if (lowerPrompt.includes('economatrix') || lowerPrompt.includes('purchase dc') || lowerPrompt.includes('cost dc')) {
        const res = await toolExecutor({
          name: 'evaluate_economatrix_acquisition',
          args: { itemCostDc: 15, wealthScore: 12 }
        });
        executedCalls.push({ name: 'evaluate_economatrix_acquisition', args: { itemCostDc: 15, wealthScore: 12 }, result: res });
      } else if (lowerPrompt.includes('called shot') || lowerPrompt.includes('headshot')) {
        const res = await toolExecutor({
          name: 'resolve_called_shot',
          args: { targetLocation: 'head', incomingDamage: 18, armorDr: 4 }
        });
        executedCalls.push({ name: 'resolve_called_shot', args: { targetLocation: 'head', incomingDamage: 18, armorDr: 4 }, result: res });
      } else if (lowerPrompt.includes('statblock') || lowerPrompt.includes('150 bp')) {
        const res = await toolExecutor({
          name: 'query_bastion_for_statblock',
          args: { concept: prompt, species: 'Human', techLevel: 3 }
        });
        executedCalls.push({ name: 'query_bastion_for_statblock', args: { concept: prompt, species: 'Human', techLevel: 3 }, result: res });
      } else if (lowerPrompt.includes('tactic') || lowerPrompt.includes('adversary')) {
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
        name: 'Synthesized Operative',
        species: 'Human',
        attributes: { strength: 3, agility: 4, stamina: 3, intellect: 2, wisdom: 3, charisma: 3 },
        stats: { strength: 3, agility: 4, stamina: 3, intellect: 2, wisdom: 3, charisma: 3 },
        skills: {
          Firearms: 5,
          Athletics: 5,
          Perception: 4,
          Electronics: 4,
          Stealth: 4,
          FirstAid: 4,
          Demolitions: 4,
          Piloting: 4,
          Survival: 4,
          Melee: 5,
          Engineering: 4,
          Tactics: 4,
          Medicine: 4,
          Security: 5
        },
        vitals: { health: 30, vitality: 30, structure: 60 },
        totalBp: 150,
        isValid: true
      };
    } else if (prompt.includes('SEALED MECHANICAL MANDATE') || prompt.includes('SYSTEM INTENT')) {
      const cuesMatch = prompt.match(/Required Sensory Cues:\s*([^\n]+)/i);
      const outcomeMatch = prompt.match(/Prescribed Outcome:\s*([^\n]+)/i);
      const cues = cuesMatch ? cuesMatch[1].trim() : 'ozone discharge and cycling bulkhead locks';
      const outcome = outcomeMatch ? outcomeMatch[1].trim() : 'The operative executes the maneuver within canonical parameters.';
      fallbackData = `[AIME MANDATED BEAT]: ${outcome} Sensory telemetry registers ${cues}.`;
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
