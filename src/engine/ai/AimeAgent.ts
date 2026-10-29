/**
 * @file AimeAgent.ts
 * @description Stage 7 AIME Mythopoeic Narrative Agent.
 * Powers progressive beat drafting, two-tier grounding context assembly,
 * Omnicortex Vector RAG injection, Neuro-Symbolic Structural Mandate narration,
 * sliding-window chat memory, and streaming sensory prose transmutation.
 */

import { VertexAIGateway } from './VertexAIGateway.ts';
import {
  queryOmnicortexRAG,
  formatRagContextForAIME
} from '../../services/omnicortexVectorRag.ts';
import {
  formatMandateForPrompt,
  type AdeStructuralMandate
} from '../../services/ade/adeEngineBridge.ts';
import {
  generateCombatCommentary
} from '../../services/aimeDirectorService.js';

export interface GroundingContext {
  projectName?: string;
  activeSceneTitle?: string;
  sceneBeats?: string;
  currentDraft?: string;
  elementsPresent?: Array<{ id: string; name: string; type: string; tl?: number; ml?: number }>;
  omnicortexLore?: string;
  mandate?: AdeStructuralMandate;
}

export interface CombatStrikeTelemetry {
  attackerName: string;
  targetName: string;
  weaponName?: string;
  targetedLimb?: string;
  netDamage?: number;
  isHit: boolean;
  isCriticalTriumph?: boolean;
  isCriticalFumble?: boolean;
  isDowned?: boolean;
  appliedStatuses?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export class AimeNarrativeAgent {
  private history: ChatMessage[] = [];
  private readonly MAX_HISTORY_TURNS = 10;

  /**
   * Adds a message to the sliding-window history with automated pruning.
   */
  public addMessage(role: 'user' | 'model' | 'system', content: string): void {
    this.history.push({
      role,
      content,
      timestamp: Date.now()
    });

    if (this.history.length > this.MAX_HISTORY_TURNS * 2) {
      // Retain system prompt + last N turns
      const systemPrompts = this.history.filter(m => m.role === 'system');
      const recentMessages = this.history.slice(-this.MAX_HISTORY_TURNS * 2);
      this.history = [...systemPrompts, ...recentMessages];
    }
  }

  public getHistory(): ChatMessage[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
  }

  /**
   * Assembles Two-Tier Grounding Context + Omnicortex Vector RAG + Sealed Structural Mandate.
   * Tier 1: Canonical Rules & Current Scene Beat.
   * Tier 2: Linked Elements Catalog & Omnicortex Lore.
   */
  public assemblePrompt(userPrompt: string, context: GroundingContext = {}): string {
    const tier1Rules = `
[TIER 1 GROUNDING: TANGENT SF RP CANON]
- Universe: ${context.projectName || 'Tangent Universe'}
- Active Scene: "${context.activeSceneTitle || 'Tactical Breach'}"
- Scene Beats: ${context.sceneBeats || 'Infiltration -> Breach -> Discovery'}
- Transmutation Directive: Never expose raw math formulas (e.g. "2d10+4", "Armor DR 6"). Transmute them into visceral sensory descriptions (e.g. "high-velocity rail discharge shrieking against ceramic composite ablative plating").
`;

    let tier2Entities = '';
    if (context.elementsPresent && context.elementsPresent.length > 0) {
      tier2Entities = `
[TIER 2 GROUNDING: PRESENT ENTITIES & OMNICORTEX LORE]
${context.elementsPresent.map(e => `- ${e.name} (${e.type}, TL${e.tl ?? 3}, ML${e.ml ?? 0})`).join('\n')}
${context.omnicortexLore ? `Lore Excerpt: ${context.omnicortexLore}` : ''}
`;
    }

    // Retrieve top Omnicortex Vector RAG chunks for canonical lore/mechanics grounding
    let ragSection = '';
    try {
      const ragResults = queryOmnicortexRAG(`${userPrompt} ${context.activeSceneTitle || ''}`.trim(), 3);
      if (ragResults && ragResults.length > 0) {
        ragSection = `\n${formatRagContextForAIME(ragResults)}\n`;
      }
    } catch {
      // Non-blocking if RAG index is initializing
    }

    let mandateSection = '';
    if (context.mandate) {
      mandateSection = `\n${formatMandateForPrompt(context.mandate)}\n`;
    }

    return `${tier1Rules}${tier2Entities}${ragSection}${mandateSection}\n\n[USER DIRECTIVE]\n${userPrompt}`;
  }

  /**
   * Generates a streaming progressive scene beat via async generator with abortable cancellation.
   */
  public async *streamProse(
    prompt: string,
    context: GroundingContext = {},
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    const assembledPrompt = this.assemblePrompt(prompt, context);
    this.addMessage('user', prompt);

    if (signal?.aborted) return;

    // Call Vertex AI Gateway
    const response = await VertexAIGateway.generateContent(assembledPrompt, {
      model: 'gemini-2.5-flash',
      temperature: 0.8
    });

    if (signal?.aborted) return;

    const fullText = response.text || 'Atmospheric telemetry confirms nominal conditions.';
    const words = fullText.split(' ');

    // Yield in simulated streaming chunks for responsive typing experience
    let buffer = '';
    for (let i = 0; i < words.length; i += 3) {
      if (signal?.aborted) break;
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      buffer += chunk;
      yield chunk;
      await new Promise(r => setTimeout(r, 25));
    }

    if (buffer.trim()) {
      this.addMessage('model', buffer.trim());
    }
  }

  /**
   * Streams a Neuro-Symbolic Story Beat strictly subordinated to a sealed AdeStructuralMandate.
   */
  public async *streamMandatedBeat(
    actionText: string,
    mandate: AdeStructuralMandate,
    context: GroundingContext = {},
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    yield* this.streamProse(actionText, { ...context, mandate }, signal);
  }

  /**
   * Synthesizes immediate VTT combat strike narration grounded in sealed mechanical strike telemetry.
   */
  public narrateCombatStrike(telemetry: CombatStrikeTelemetry): {
    eventType: string;
    narrativeText: string;
    timestamp: string;
  } {
    let eventType = 'combat_exchange';
    if (telemetry.isCriticalTriumph) {
      eventType = 'critical_triumph';
    } else if (telemetry.isCriticalFumble) {
      eventType = 'critical_fumble';
    } else if (telemetry.isDowned) {
      eventType = 'operative_downed';
    }

    const baseCommentary = generateCombatCommentary(eventType, {
      attackerName: telemetry.attackerName,
      targetName: telemetry.targetName,
      damage: telemetry.netDamage ?? 0,
      weapon: telemetry.weaponName || 'tactical weapon',
      location: telemetry.targetedLimb || 'torso',
      isDowned: telemetry.isDowned,
      isTriumph: telemetry.isCriticalTriumph,
      isFumble: telemetry.isCriticalFumble
    });

    let enrichedText = baseCommentary.narrativeText;
    if (!telemetry.isHit && !telemetry.isCriticalFumble) {
      enrichedText = `🛡️ EVADED / DEFLECTED: ${telemetry.attackerName}'s ${telemetry.weaponName || 'strike'} toward ${telemetry.targetName}'s ${telemetry.targetedLimb || 'chassis'} glances off cover and active defense vectors!`;
    } else if (telemetry.appliedStatuses && telemetry.appliedStatuses.length > 0) {
      enrichedText += ` [TRAUMA APPLIED: ${telemetry.appliedStatuses.join(', ')}]`;
    }

    this.addMessage('model', enrichedText);
    return {
      eventType,
      narrativeText: enrichedText,
      timestamp: baseCommentary.timestamp
    };
  }
}

export const AimeAgent = new AimeNarrativeAgent();
export default AimeAgent;
