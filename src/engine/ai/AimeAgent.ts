/**
 * @file AimeAgent.ts
 * @description Stage 7 AIME Mythopoeic Narrative Agent.
 * Powers progressive beat drafting, two-tier grounding context assembly,
 * sliding-window chat memory, and streaming sensory prose transmutation.
 */

import { VertexAIGateway } from './VertexAIGateway';

export interface GroundingContext {
  projectName?: string;
  activeSceneTitle?: string;
  sceneBeats?: string;
  currentDraft?: string;
  elementsPresent?: Array<{ id: string; name: string; type: string; tl?: number; ml?: number }>;
  omnicortexLore?: string;
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
   * Assembles Two-Tier Grounding Context.
   * Tier 1: Canonical Rules & Current Scene Beat.
   * Tier 2: Linked Elements Catalog & Omnicortex Lore.
   */
  public assemblePrompt(userPrompt: string, context: GroundingContext): string {
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

    return `${tier1Rules}${tier2Entities}\n\n[USER DIRECTIVE]\n${userPrompt}`;
  }

  /**
   * Generates a streaming progressive scene beat via async generator.
   */
  public async *streamProse(
    prompt: string,
    context: GroundingContext
  ): AsyncGenerator<string, void, unknown> {
    const assembledPrompt = this.assemblePrompt(prompt, context);
    this.addMessage('user', prompt);

    // Call Vertex AI Gateway
    const response = await VertexAIGateway.generateContent(assembledPrompt, {
      model: 'gemini-1.5-flash',
      temperature: 0.8
    });

    const fullText = response.text || 'Atmospheric telemetry confirms nominal conditions.';
    const words = fullText.split(' ');

    // Yield in simulated streaming chunks for responsive typing experience
    let buffer = '';
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      buffer += chunk;
      yield chunk;
      await new Promise(r => setTimeout(r, 25));
    }

    this.addMessage('model', buffer.trim());
  }
}

export const AimeAgent = new AimeNarrativeAgent();
export default AimeAgent;
