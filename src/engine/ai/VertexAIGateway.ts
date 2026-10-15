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
          model: options.model || 'gemini-2.0-flash',
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
          console.warn('[VertexAIGateway] Auth/AppCheck missing or rejected. Falling back to simulation.');
          return this.fallbackSimulation<T>(prompt, options, startTime);
        }
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const candidateText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
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
        text: json.text || candidateText || (typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData)),
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
