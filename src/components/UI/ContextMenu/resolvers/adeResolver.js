import { 
  Sparkles, 
  Wand2, 
  BookOpen, 
  MapPin, 
  GitBranch, 
  Compass, 
  FileText, 
  Edit3, 
  Copy, 
  Trash2, 
  Plus, 
  Layers, 
  Radio, 
  ShieldAlert, 
  Check, 
  Volume2
} from 'lucide-react';

/**
 * Resolves context menu options for ADE STUDIO (Story Foundry / Scenarios / Maps)
 * with deep AIME mythopoeic creative AI integration.
 */
export function resolveAdeMenu(context, appState, handlers) {
  const { subcategory = 'story', entityId, entityType, entityData, selectedText } = context;
  const { 
    activeStoryNode, 
    executeAimePrompt, 
    openAimeWorkspace, 
    onEditNode, 
    onDeleteNode, 
    onCreateNode, 
    onBranchNode,
    applyTextReplacement
  } = handlers;

  const items = [];
  const beatTitle = entityData?.title || activeStoryNode?.title || 'Story Beat';

  // 1. TEXT SELECTION IN NARRATIVE EDITOR / QUILL
  if (selectedText && selectedText.length > 0) {
    return [
      {
        type: 'section-header',
        label: 'Selected Prose'
      },
      {
        id: 'copy-prose',
        label: 'Copy Prose',
        icon: Copy,
        shortcut: 'Ctrl+C',
        onClick: () => navigator.clipboard.writeText(selectedText)
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'AIME Mythopoeic Co-Pilot'
      },
      {
        id: 'aime-polish-prose',
        label: 'AIME: Polish & Evocative Rewrite',
        icon: Sparkles,
        aiType: 'AIME',
        highlight: true,
        onClick: () => executeAimePrompt({
          title: 'Polished Narrative Rewrite',
          prompt: `Rewrite and polish the following narrative passage for the Tangent SFF RPG setting. Enhance rhythm, heighten emotional stakes, and evoke cinematic science-fantasy tone: "${selectedText}"`,
          context: `Scene: ${beatTitle}`,
          applyTarget: 'selection',
          applyLabel: 'Replace Selection'
        })
      },
      {
        id: 'aime-transmute-mechanics',
        label: 'AIME: Transmute Mechanics into Prose',
        icon: Wand2,
        aiType: 'AIME',
        highlight: true,
        onClick: () => executeAimePrompt({
          title: 'Transmute Rules to Sensory Prose',
          prompt: `Transmute the following rules or action description into immersive sensory narrative prose. Depict equipment with accurate Tech Level aesthetics (TL 0-5: industrial grease vs TL 4 nanotech hard-light), Metaphysical levels (ML 0-5: ozone stench, barometric shifts), and depict combat trauma organically rather than abstract numbers: "${selectedText}"`,
          context: `Scene: ${beatTitle}`,
          applyTarget: 'selection',
          applyLabel: 'Replace Selection'
        })
      },
      {
        id: 'aime-generate-dialogue',
        label: 'AIME: Generate In-Character Dialogue',
        icon: Radio,
        aiType: 'AIME',
        onClick: () => executeAimePrompt({
          title: 'Generate Dialogue Lines',
          prompt: `Based on this scene context, write 3 distinct variations of authentic spoken dialogue for the active characters. Ground their speech in their canonical faction ideology and lineage mannerisms: "${selectedText}"`,
          context: `Scene: ${beatTitle}`,
          applyTarget: 'selection',
          applyLabel: 'Insert Below'
        })
      },
      {
        id: 'aime-expand-sensory',
        label: 'AIME: Expand Sensory Atmosphere',
        icon: BookOpen,
        aiType: 'AIME',
        onClick: () => executeAimePrompt({
          title: 'Expand Sensory Details',
          prompt: `Expand this description to vividly capture the tactile environment: atmospheric pressure, hum of ship reactors, flickering holosigns, optical glare, smells of propellant and alien biochemistry: "${selectedText}"`,
          context: `Scene: ${beatTitle}`,
          applyTarget: 'selection',
          applyLabel: 'Insert Below'
        })
      },
      { type: 'divider' },
      {
        id: 'aime-open-copilot',
        label: 'Open Full AIME Creative Studio',
        icon: Sparkles,
        aiType: 'AIME',
        onClick: () => openAimeWorkspace?.(`Regarding "${selectedText}": `)
      }
    ];
  }

  // 2. STORY BEAT NODE IN SCENARIO GRAPH
  if (entityType === 'story-beat' || entityId || subcategory === 'scenarios' || subcategory === 'story') {
    if (entityId || entityData) {
      items.push(
        {
          type: 'section-header',
          label: `Story Beat: ${beatTitle}`
        },
        {
          id: 'edit-beat-node',
          label: 'Edit Story Beat',
          icon: Edit3,
          onClick: () => onEditNode?.(entityId || entityData?.id)
        },
        {
          id: 'branch-narrative-node',
          label: 'Add Branching Story Beat',
          icon: GitBranch,
          onClick: () => onBranchNode?.(entityId || entityData?.id)
        },
        { type: 'divider' },
        {
          type: 'section-header',
          label: 'AIME Scenario Architect'
        },
        {
          id: 'aime-expand-scene',
          label: 'AIME: Expand Beat into Full Scene',
          icon: Sparkles,
          aiType: 'AIME',
          highlight: true,
          onClick: () => executeAimePrompt({
            title: `Expand Scene: ${beatTitle}`,
            prompt: `Expand the story beat "${beatTitle}" into a complete dramatic RPG scene for the Architect. Provide: 1) Sensory Room Overview, 2) NPC Motivations & Tension, 3) Interactive Clues/Environmental Opportunities, 4) Recommended Tangent skill checks with Target Defense/CR baselines. Beat info: ${JSON.stringify(entityData || {})}`,
            context: `Scenario: ${beatTitle}`
          })
        },
        {
          id: 'aime-branching-choices',
          label: 'AIME: Generate 3 Branching Decisions',
          icon: GitBranch,
          aiType: 'AIME',
          highlight: true,
          onClick: () => executeAimePrompt({
            title: `Branching Choices for ${beatTitle}`,
            prompt: `Design 3 distinct, high-agency decision paths stemming from "${beatTitle}": Path A (Direct Tactical/Combat Confrontation), Path B (Diplomatic Negotiation / Social Leverage), Path C (Covert Infiltration / Technical Bypass). For each, list player stakes and possible complications.`,
            context: `Scenario: ${beatTitle}`
          })
        },
        {
          id: 'aime-inject-twist',
          label: 'AIME: Inject Complication or Hazard',
          icon: ShieldAlert,
          aiType: 'AIME',
          onClick: () => executeAimePrompt({
            title: `Complication for ${beatTitle}`,
            prompt: `Introduce an unexpected, cinematic complication or environmental twist to shake up the encounter at "${beatTitle}". Tie it into the active factions, sudden system failure, or a betrayal.`,
            context: `Scenario: ${beatTitle}`
          })
        },
        {
          id: 'aime-synthesize-gem',
          label: 'AIME: Synthesize Guidance Gem',
          icon: Compass,
          aiType: 'AIME',
          onClick: () => executeAimePrompt({
            title: `Guidance Gem: ${beatTitle}`,
            prompt: `Synthesize a concise Architect Guidance Gem for "${beatTitle}": Essential GM directives, secret lore reveals, pacing triggers, and advice for managing player spotlight.`,
            context: `Scenario: ${beatTitle}`
          })
        },
        { type: 'divider' },
        {
          id: 'delete-beat-node',
          label: 'Delete Story Beat',
          icon: Trash2,
          danger: true,
          onClick: () => onDeleteNode?.(entityId || entityData?.id)
        }
      );
      return items;
    }
  }

  // 3. ELEMENT FORGE (ASSETS / ENTITIES / NPCS)
  if (subcategory === 'elements' || entityType === 'element') {
    const elementName = entityData?.name || 'Story Element';
    items.push(
      {
        type: 'section-header',
        label: `Element: ${elementName}`
      },
      {
        id: 'edit-element',
        label: 'Open in Element Forge',
        icon: Edit3,
        onClick: () => handlers.onEditElement?.(entityData || { id: entityId })
      },
      {
        id: 'duplicate-element',
        label: 'Clone Element',
        icon: Copy,
        onClick: () => handlers.onDuplicateElement?.(entityData || { id: entityId })
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'AIME Worldbuilding Copilot'
      },
      {
        id: 'aime-deepen-lore',
        label: 'AIME: Deepen Motivations & Secrets',
        icon: Sparkles,
        aiType: 'AIME',
        highlight: true,
        onClick: () => executeAimePrompt({
          title: `Deepen Lore: ${elementName}`,
          prompt: `Flesh out the narrative depth of "${elementName}". Generate 2 hidden agendas, a dramatic personal vulnerability, a cultural superstition, and 3 rumor hooks players might overhear in taverns or data conduits.`,
          context: `Element: ${elementName}`
        })
      },
      {
        id: 'aime-voice-profile',
        label: 'AIME: Generate Dialogue Profile',
        icon: Radio,
        aiType: 'AIME',
        onClick: () => executeAimePrompt({
          title: `Voice Profile: ${elementName}`,
          prompt: `Create a voice and mannerisms acting profile for ${elementName}: vocal cadence, vocabulary quirks, physical gestures, stress responses, and 4 sample quote lines.`,
          context: `Element: ${elementName}`
        })
      }
    );
    return items;
  }

  // 4. MAPMAKER / TACTICAL STAGE CANVAS
  if (subcategory === 'map' || subcategory === 'stage') {
    items.push(
      {
        type: 'section-header',
        label: 'Tactical Environment'
      },
      {
        id: 'spawn-map-token',
        label: 'Spawn Combatant Token',
        icon: Plus,
        onClick: () => handlers.onSpawnToken?.(context.clickCoords)
      },
      {
        id: 'ping-location',
        label: 'Ping Coordinates to Players',
        icon: MapPin,
        onClick: () => handlers.onPingLocation?.(context.clickCoords)
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'AIME Stage Narrator'
      },
      {
        id: 'aime-describe-room',
        label: 'AIME: Describe Tactical Environment',
        icon: Sparkles,
        aiType: 'AIME',
        highlight: true,
        onClick: () => executeAimePrompt({
          title: 'Atmospheric Room Description',
          prompt: `Generate an atmospheric boxed-text description of this tactical battleground to read aloud to the players. Describe lighting, cover opportunities, acoustic echoes, and hazard indicators. Ground in Tangent SFF RPG aesthetics.`,
          context: 'MapMaker Stage'
        })
      },
      {
        id: 'aime-suggest-hazard',
        label: 'AIME: Suggest Environmental Hazard',
        icon: ShieldAlert,
        aiType: 'AIME',
        onClick: () => executeAimePrompt({
          title: 'Environmental Hazard Generator',
          prompt: `Suggest an active environmental hazard for this location (such as leaking plasma conduit, zero-g eddy, magnetic interference, toxic spore vents, or collapsing catwalk). Provide rules mechanics: trigger condition, CR saving throw, and damage dice.`,
          context: 'MapMaker Stage'
        })
      }
    );
    return items;
  }

  // DEFAULT ADE FALLBACK
  items.push(
    {
      type: 'section-header',
      label: 'Story Foundry'
    },
    {
      id: 'create-story-beat',
      label: 'Create New Story Beat',
      icon: Plus,
      onClick: () => onCreateNode?.()
    },
    { type: 'divider' },
    {
      type: 'section-header',
      label: 'AIME Mythopoeic Co-Pilot'
    },
    {
      id: 'aime-brainstorm-arc',
      label: 'AIME: Brainstorm Narrative Arc',
      icon: Sparkles,
      aiType: 'AIME',
      highlight: true,
      onClick: () => executeAimePrompt({
        title: 'Brainstorm Narrative Arc',
        prompt: `Brainstorm a compelling 3-act story arc for a Tangent SFF RPG adventure involving space salvage, covert syndicate operatives, and an ancient precursor alien relic. Outline Hook, Rising Action, Climax, and Resolution.`,
        context: 'Story Foundry'
      })
    },
    {
      id: 'aime-open-studio',
      label: 'Open Full AIME Studio',
      icon: Wand2,
      aiType: 'AIME',
      onClick: () => openAimeWorkspace?.()
    }
  );

  return items;
}

export default resolveAdeMenu;
