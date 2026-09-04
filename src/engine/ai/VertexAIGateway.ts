/**
 * @file VertexAIGateway.ts
 * @description Stage 7 Dual-Agent AI Ecosystem Gateway.
 * Proxies Gemini Vertex AI requests through secure Cloud Function endpoints
 * with Firebase App Check (X-Firebase-AppCheck), JWT token auth, client-side rate limiting,
 * and graceful local simulation fallback.
 */

export interface AIRequestOptions {
  model?: 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gemini-2.0-flash';
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
  responseSchema?: Record<string, any>;
  tools?: Array<Record<string, any>>;
  stream?: boolean;
}

export interface AIGatewayResponse<T = any> {
  success: boolean;
  data?: T;
  text?: string;
  error?: string;
  isSimulated?: boolean;
  latencyMs?: number;
}

class VertexAIGatewayService {
  private endpointUrl: string = '/api/ai/vertex-proxy';
  private appCheckToken: string | null = null;
  private authToken: string | null = null;
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();
  private readonly MAX_REQUESTS_PER_MINUTE = 60;

  public setTokens(appCheckToken: string | null, authToken: string | null) {
    this.appCheckToken = appCheckToken;
    this.authToken = authToken;
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
   * Dispatches a structured prompt to Gemini Vertex AI via Cloud Function proxy.
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
      // In web browser environment, attempt fetch to Cloud Function proxy
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          model: options.model || 'gemini-1.5-flash',
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 2048,
          responseMimeType: options.responseMimeType || 'text/plain',
          responseSchema: options.responseSchema,
          tools: options.tools
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          console.warn('[VertexAIGateway] 403 Forbidden - AppCheck or Auth missing. Falling back to simulation.');
          return this.fallbackSimulation<T>(prompt, options, startTime);
        }
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return {
        success: true,
        data: json.data,
        text: json.text || (typeof json.data === 'string' ? json.data : JSON.stringify(json.data)),
        isSimulated: false,
        latencyMs: Math.round(performance.now() - startTime)
      };
    } catch (err: any) {
      // Offline / disconnected failover to local simulation
      return this.fallbackSimulation<T>(prompt, options, startTime);
    }
  }

  /**
   * Deterministic local fallback simulator for offline testing or unauthenticated development.
   */
  private fallbackSimulation<T>(
    _prompt: string,
    options: AIRequestOptions,
    startTime: number
  ): AIGatewayResponse<T> {
    const isJson = options.responseMimeType === 'application/json';

    let fallbackData: any;
    if (isJson) {
      fallbackData = {
        name: 'Synthesized Operative',
        species: 'Human',
        stats: { strength: 12, agility: 14, intellect: 13, perception: 15, willpower: 11, tech: 14 },
        skills: { Firearms: 4, Electronics: 3, Athletics: 2, Perception: 3 },
        totalBp: 150,
        isValid: true
      };
    } else {
      fallbackData = `[AIME SIMULATED TELEMETRY]: Analyzing situation. Atmospheric sensors detect low-pressure venting and magnetic resonance. Proceed with standard caution.`;
    }

    return {
      success: true,
      data: fallbackData as T,
      text: typeof fallbackData === 'string' ? fallbackData : JSON.stringify(fallbackData, null, 2),
      isSimulated: true,
      latencyMs: Math.round(performance.now() - startTime)
    };
  }
}

export const VertexAIGateway = new VertexAIGatewayService();
export default VertexAIGateway;
