/**
 * @file aimeTierRouter.ts
 * @description Hardware Mitigation & Level-of-Detail (LOD) Intelligence Tier Router.
 * 
 * Implements Phase 3 architecture for consumer hardware (e.g. 8GB VRAM GPUs):
 *   1. LOD-of-Intelligence Tiering:
 *      - Tier 1 (Hero/Boss): 7B-8B Q4_K_M (~5.2GB VRAM), max reasoning & multi-turn fidelity.
 *      - Tier 2 (Tactical/Squad): 3B Q4_K_M (~2.1GB VRAM), rapid combat resolution & secondary NPCs.
 *      - Tier 3 (Ambient/Sensors): 1B Q4_K_M (~1.1GB VRAM), terminal logs, drone readouts, environmental barks.
 *   2. Grouped Query Attention (GQA) & KV-Cache Compression:
 *      - Compresses KV cache memory by up to 75% via shared KV heads (e.g. 8 KV heads vs 32 Q heads).
 *      - Provides llama.cpp parameters (--cache-type-k q8_0, --cache-type-v q8_0).
 *   3. Local llama.cpp Adapter with Cloud API Fallback:
 *      - Native GBNF grammar enforcement directly on local logits.
 *      - Seamless automatic fallback to Gemini cloud API if local inference server is unavailable.
 */

export type LodTierKey = 'tier1_hero' | 'tier2_tactical' | 'tier3_ambient' | 'auto';

export interface LodTierConfig {
  key: LodTierKey;
  label: string;
  badge: string;
  parameterSize: string;
  quantization: string;
  vramEstimateMb: number;
  gqaRatio: string;
  gqaSavingsMb: number;
  defaultLocalModel: string;
  defaultCloudModel: string;
  maxContextTokens: number;
  recommendedTemp: number;
  description: string;
}

export const LOD_TIERS: Record<Exclude<LodTierKey, 'auto'>, LodTierConfig> = {
  tier1_hero: {
    key: 'tier1_hero',
    label: 'Tier 1: Hero & Strategic Cognition',
    badge: '8B Q4_K_M (Hero)',
    parameterSize: '7B-8B',
    quantization: 'Q4_K_M (GGUF)',
    vramEstimateMb: 5200,
    gqaRatio: '4:1 (8 KV / 32 Q heads)',
    gqaSavingsMb: 1200,
    defaultLocalModel: 'meta-llama-3.1-8b-instruct.Q4_K_M.gguf',
    defaultCloudModel: 'gemini-1.5-flash',
    maxContextTokens: 8192,
    recommendedTemp: 0.7,
    description: 'High-fidelity reasoning for primary Operatives, Major Antagonists, and narrative climaxes.'
  },
  tier2_tactical: {
    key: 'tier2_tactical',
    label: 'Tier 2: Squad & Tactical Cognition',
    badge: '3B Q4_K_M (Tactical)',
    parameterSize: '3B',
    quantization: 'Q4_K_M (GGUF)',
    vramEstimateMb: 2100,
    gqaRatio: '6:1 (4 KV / 24 Q heads)',
    gqaSavingsMb: 550,
    defaultLocalModel: 'llama-3.2-3b-instruct.Q4_K_M.gguf',
    defaultCloudModel: 'gemini-1.5-flash-8b',
    maxContextTokens: 4096,
    recommendedTemp: 0.6,
    description: 'Balanced speed and memory for fireteam coordination, skirmish NPCs, and standard encounters.'
  },
  tier3_ambient: {
    key: 'tier3_ambient',
    label: 'Tier 3: Ambient & Sensor Subsystems',
    badge: '1B Q4_K_M (Ambient)',
    parameterSize: '1B',
    quantization: 'Q4_K_M (GGUF)',
    vramEstimateMb: 1100,
    gqaRatio: '8:1 (2 KV / 16 Q heads)',
    gqaSavingsMb: 280,
    defaultLocalModel: 'llama-3.2-1b-instruct.Q4_K_M.gguf',
    defaultCloudModel: 'gemini-1.5-flash-8b',
    maxContextTokens: 2048,
    recommendedTemp: 0.4,
    description: 'Ultra-lean compute for automated computer terminals, security claxons, and environmental sensor barks.'
  }
};

export interface ResolveTierContext {
  entityType?: string;
  isBoss?: boolean;
  isTerminal?: boolean;
  isMajorNpc?: boolean;
  actionText?: string;
  userOverride?: LodTierKey;
}

/**
 * Resolves the optimal Level-of-Detail (LOD) tier based on tactical context.
 */
export function resolveIntelligenceTier(context: ResolveTierContext = {}): LodTierConfig {
  const { entityType, isBoss, isTerminal, isMajorNpc, actionText = '', userOverride = 'auto' } = context;

  // Explicit user override
  if (userOverride && userOverride !== 'auto' && LOD_TIERS[userOverride]) {
    return LOD_TIERS[userOverride];
  }

  const lowerAction = actionText.toLowerCase();

  // Tier 3: Terminals, environmental telemetry, surveillance, audio claxons
  if (
    isTerminal ||
    entityType === 'terminal' ||
    entityType === 'sensor' ||
    lowerAction.includes('terminal readout') ||
    lowerAction.includes('sensor scan') ||
    lowerAction.includes('security claxon') ||
    lowerAction.includes('diagnostics')
  ) {
    return LOD_TIERS.tier3_ambient;
  }

  // Tier 1: Boss, Major NPC, primary operative, complex negotiations, narrative climax
  if (
    isBoss ||
    isMajorNpc ||
    entityType === 'operative' ||
    lowerAction.includes('interrogate') ||
    lowerAction.includes('negotiate') ||
    lowerAction.includes('climax') ||
    lowerAction.includes('psionic')
  ) {
    return LOD_TIERS.tier1_hero;
  }

  // Tier 2 Default: Squad members, minions, tactical encounters
  return LOD_TIERS.tier2_tactical;
}

/**
 * Calculates real-time VRAM budget and GQA savings for consumer GPUs.
 */
export function calculateVramTelemetry(tierKey: LodTierKey, contextTokens: number = 2048) {
  const tier = (tierKey === 'auto' ? LOD_TIERS.tier1_hero : LOD_TIERS[tierKey]) || LOD_TIERS.tier1_hero;
  const baseVramMb = tier.vramEstimateMb;
  // Approximate KV cache: ~0.15 MB per 1k tokens with GQA vs ~0.60 MB with standard MHA
  const kvCacheMb = Math.round((contextTokens / 1024) * 150);
  const mhaEquivalentMb = Math.round((contextTokens / 1024) * 600);
  const gqaSavingsMb = mhaEquivalentMb - kvCacheMb + tier.gqaSavingsMb;

  const totalEstimatedVramMb = baseVramMb + kvCacheMb;
  const fits8GbVram = totalEstimatedVramMb <= 7600; // leaves buffer for OS/Display

  return {
    tierKey: tier.key,
    tierLabel: tier.label,
    badge: tier.badge,
    parameterSize: tier.parameterSize,
    baseVramMb,
    kvCacheMb,
    gqaSavingsMb,
    totalEstimatedVramMb,
    fits8GbVram,
    recommendedGqaFlags: `--cache-type-k q8_0 --cache-type-v q8_0 --ctx-size ${tier.maxContextTokens}`
  };
}

export interface LocalLlamaOptions {
  endpoint?: string;
  prompt: string;
  grammar?: string;
  tier?: LodTierConfig;
  temperature?: number;
  maxTokens?: number;
  onChunk?: (chunk: string) => void;
  signal?: AbortSignal;
}

/**
 * Calls local llama.cpp server with native GBNF grammar logit constraints.
 * Returns null if the local endpoint is unreachable.
 */
export async function callLocalLlama({
  endpoint,
  prompt,
  grammar,
  tier = LOD_TIERS.tier1_hero,
  temperature,
  maxTokens = 512,
  onChunk,
  signal
}: LocalLlamaOptions): Promise<string | null> {
  const baseEndpoint = (endpoint || 'http://localhost:8080').replace(/\/+$/, '');
  const url = `${baseEndpoint}/completion`;

  const body: Record<string, any> = {
    prompt,
    temperature: temperature ?? tier.recommendedTemp,
    n_predict: maxTokens,
    stream: Boolean(onChunk),
    cache_prompt: true
  };

  if (grammar) {
    body.grammar = grammar;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), onChunk ? 30000 : 15000);
    const combinedSignal = signal || controller.signal;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: combinedSignal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Local llama.cpp returned HTTP ${res.status}`);
      return null;
    }

    if (onChunk && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const piece = parsed.content || parsed.text || '';
              if (piece) {
                accumulated += piece;
                onChunk(piece);
              }
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
      return accumulated;
    }

    const json = await res.json();
    return json.content || json.text || '';
  } catch (err) {
    // If connection refused or offline, gracefully return null to trigger cloud fallback
    return null;
  }
}
