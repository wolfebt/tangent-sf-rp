import { 
  Bot, 
  Sparkles, 
  Copy, 
  Search, 
  BookOpen, 
  Dices, 
  Radio, 
  Command, 
  Settings,
  HelpCircle
} from 'lucide-react';

/**
 * Resolves context menu options for global areas:
 * Compendium, Codex, Comms, or generic unmapped surfaces.
 */
export function resolveGlobalMenu(context, appState, handlers) {
  const { pathname = '/', selectedText } = context;
  const items = [];

  // Text selection is top priority
  if (selectedText && selectedText.length > 0) {
    items.push(
      {
        type: 'section-header',
        label: 'Selection'
      },
      {
        id: 'global-copy-text',
        label: 'Copy Text',
        icon: Copy,
        shortcut: 'Ctrl+C',
        onClick: () => navigator.clipboard.writeText(selectedText)
      },
      {
        id: 'global-search-compendium',
        label: `Search Compendium for "${selectedText.slice(0, 18)}..."`,
        icon: Search,
        onClick: () => {
          window.location.href = `/compendium?q=${encodeURIComponent(selectedText)}`;
        }
      },
      { type: 'divider' }
    );
  }

  // COMPENDIUM SPECIFIC
  if (pathname.startsWith('/compendium') || pathname.startsWith('/rules')) {
    items.push(
      {
        type: 'section-header',
        label: 'Compendium Codex'
      },
      {
        id: 'compendium-copy-link',
        label: 'Copy Rule Citation Link',
        icon: Copy,
        onClick: () => navigator.clipboard.writeText(window.location.href)
      },
      {
        id: 'compendium-open-dbm',
        label: 'Inspect in Omni-Cortex',
        icon: BookOpen,
        onClick: () => {
          window.location.href = '/dbm?category=compendium';
        }
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Rules Arbiter'
      },
      {
        id: 'bastion-clarify-rule',
        label: 'Ask BASTION: Clarify Rule Mechanics',
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => handlers.executeBastionPrompt?.({
          title: 'Compendium Rule Clarification',
          prompt: selectedText 
            ? `Provide a definitive canonical rules adjudication for this text in Tangent SFF RPG: "${selectedText}"`
            : `Provide a canonical overview of the Tangent SFF RPG dual resolution combat system (2d10 + Combat Skill + Attribute Mod vs Target Defense, defender wins ties).`,
          context: 'Compendium Rules Codex'
        })
      }
    );
    return items;
  }

  // COMMS / NETWORK SPECIFIC
  if (pathname.startsWith('/comms') || pathname.startsWith('/network') || pathname.startsWith('/chat')) {
    items.push(
      {
        type: 'section-header',
        label: 'Terran Data Net'
      },
      {
        id: 'comms-toggle-dice',
        label: 'Toggle Dice Roller Dock',
        icon: Dices,
        shortcut: 'Alt+D',
        onClick: () => window.dispatchEvent(new CustomEvent('toggle-dice-dock'))
      },
      {
        id: 'comms-toggle-dock',
        label: 'Toggle Comm-Link Dock',
        icon: Radio,
        shortcut: 'Alt+C',
        onClick: () => window.dispatchEvent(new CustomEvent('toggle-comms-dock'))
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Comms Assistant'
      },
      {
        id: 'bastion-adjudicate-chat',
        label: 'Ask BASTION: Adjudicate Player Check',
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => handlers.executeBastionPrompt?.({
          title: 'Adjudicate Tactical Action from Comms',
          prompt: `Adjudicate a player action or contested check for the game master in the Tangent SFF RPG system. State the required skill, relevant attribute mod, Target Defense / CR, and margins of success consequences.`,
          context: 'Tactical Comms Channel'
        })
      }
    );
    return items;
  }

  // GENERAL FALLBACK
  items.push(
    {
      type: 'section-header',
      label: 'Quick Commands'
    },
    {
      id: 'open-command-palette',
      label: 'Command Palette',
      icon: Command,
      shortcut: 'Ctrl+K',
      onClick: () => {
        // Trigger command palette if bound
        const evt = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
        window.dispatchEvent(evt);
      }
    },
    {
      id: 'quick-roll-dice',
      label: 'Open Dice Roller',
      icon: Dices,
      shortcut: 'Alt+D',
      onClick: () => window.dispatchEvent(new CustomEvent('toggle-dice-dock'))
    },
    {
      id: 'quick-comms-link',
      label: 'Open Comm-Link',
      icon: Radio,
      shortcut: 'Alt+C',
      onClick: () => window.dispatchEvent(new CustomEvent('toggle-comms-dock'))
    }
  );

  return items;
}

export default resolveGlobalMenu;
