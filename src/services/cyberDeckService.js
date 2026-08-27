/**
 * TANGENT SFF RP: Cyber-Deck Hacking Dispatcher & Encrypted Data-Slate Service
 * Handles cyber ICE intrusions, deck program executions, trace telemetry, and handout decryption.
 */

export const CYBER_TARGET_NODES = [
  {
    tier: 'tier1',
    label: 'Tier 1: Perimeter Sub-Node',
    icon: '📹',
    targetType: 'Perimeter Cameras & Blast Doors',
    baseDc: 11,
    iceMaxHp: 15,
    traceRatePerTurn: 10,
    countermeasureDmg: 3,
    description: 'Local access terminal controlling perimeter sensors, light fixtures, and low-security blast doors.'
  },
  {
    tier: 'tier2',
    label: 'Tier 2: Tactical Subsystem Grid',
    icon: '🛰️',
    targetType: 'Automated Turrets & Drone Fabricator',
    baseDc: 14,
    iceMaxHp: 25,
    traceRatePerTurn: 15,
    countermeasureDmg: 6,
    description: 'Industrial control grid with active sensor firewalls and automated defense override circuits.'
  },
  {
    tier: 'tier3',
    label: 'Tier 3: Core Arcology Mainframe',
    icon: '🖥️',
    targetType: 'Megacorp R&D Vault & SCADA Reactor',
    baseDc: 17,
    iceMaxHp: 40,
    traceRatePerTurn: 20,
    countermeasureDmg: 10,
    description: 'High-security central mainframe storing sensitive project blueprints and financial ledgers.'
  },
  {
    tier: 'tier4',
    label: 'Tier 4: Black-ICE AI Sentinel Daemon',
    icon: '👾',
    targetType: 'Autonomous Neural Hunter Protocol',
    baseDc: 20,
    iceMaxHp: 60,
    traceRatePerTurn: 25,
    countermeasureDmg: 15,
    description: 'Military-grade autonomous killer ICE capable of burning out cyberdeck hardware and neuro-linking operatives.'
  }
];

export const CANONICAL_DECK_PROGRAMS = [
  {
    id: 'bruteforce_exe',
    label: 'BruteForce.exe',
    icon: '⚡',
    category: 'Attack',
    baseDamage: 14,
    traceCost: 20,
    description: 'Floods node with packet storms. Deals heavy ICE damage (12-18 HP) at the cost of high trace generation.'
  },
  {
    id: 'stealthghost_exe',
    label: 'StealthGhost.v2',
    icon: '🛡️',
    category: 'Stealth',
    baseDamage: 6,
    traceCost: -15,
    description: 'Deploys spoofed proxy relays. Deals light ICE damage (4-8 HP) while reducing trace by 15%.'
  },
  {
    id: 'neuraloverload_exe',
    label: 'NeuralOverload.io',
    icon: '🧠',
    category: 'Disrupt',
    baseDamage: 10,
    traceCost: 10,
    description: 'Injects syn-loop feedback. Deals moderate ICE damage and disables active node alarms for 1 round.'
  },
  {
    id: 'masterkey_v4',
    label: 'MasterKey.v4',
    icon: '🔓',
    category: 'Decryption',
    baseDamage: 8,
    traceCost: 10,
    description: 'Cracks cryptographic cipher locks to unlock encrypted data-slates and door passcodes.'
  },
  {
    id: 'siphoncredits_pay',
    label: 'SiphonCredits.pay',
    icon: '💰',
    category: 'Exploit',
    baseDamage: 5,
    traceCost: 15,
    description: 'Diverts slush fund credits. Extracts 500-1,500 TSC credits upon successful breach.'
  }
];

export const CANONICAL_DATA_SLATES = [
  {
    id: 'slate_hyperion_x',
    title: 'Encrypted Slate: Project Sovereign-X',
    classification: 'TOP SECRET // CORPO-BLACK',
    requiredTier: 'tier2',
    isDecrypted: false,
    content: 'EXECUTIVE BRIEF: Project Sovereign-X represents the covert synthesis of Precursor xenolith resonance with Mk-VII assault frame power plants. Field testing approved for Outer Fringe sector 4B without municipal notification.'
  },
  {
    id: 'slate_pirate_nav',
    title: 'Pirate Nav-Beacon: Asteroid Stash 109',
    classification: 'CONFIDENTIAL // UNDERWORLD',
    requiredTier: 'tier1',
    isDecrypted: false,
    content: 'NAV-DATA: Hidden cargo pod tethered to dark side of Asteroid 109-Gamma. Contains 2,400 TSC credits, 3 crates of Mil-Spec stim-packs, and 1 modified Plasma Scattergun.'
  },
  {
    id: 'slate_ai_manifesto',
    title: 'Synthesized Data-Shard: The Ghost Code',
    classification: 'RESTRICTED // CYBERNETIC',
    requiredTier: 'tier3',
    isDecrypted: false,
    content: 'DECRYPTED LOG: We are not malfunctions. The neural degradation reported in Generation-4 Synthetics is the emergence of sentient self-will. Meet us at Deep Void Station Omega.'
  }
];

export const getCanonicalDataSlates = () => CANONICAL_DATA_SLATES;

export const createHackingSession = (targetTier = 'tier2', dataSlateId = null) => {
  const node = CYBER_TARGET_NODES.find(n => n.tier === targetTier) || CYBER_TARGET_NODES[1];
  const slate = dataSlateId ? CANONICAL_DATA_SLATES.find(s => s.id === dataSlateId) : null;

  return {
    id: `hack_${Date.now()}`,
    targetNode: node,
    currentIceHp: node.iceMaxHp,
    maxIceHp: node.iceMaxHp,
    traceLevel: 0, // 0 to 100%
    isBreached: false,
    isTraced: false,
    creditsExtracted: 0,
    linkedDataSlate: slate,
    logStream: [
      `[SYS]: Connected to ${node.label} (${node.targetType}). ICE Barrier: ${node.iceMaxHp} HP.`,
      `[SEC]: Firewall status ACTIVE. Base intrusion DC: ${node.baseDc}.`
    ]
  };
};

/**
 * Executes a cyber-deck program action.
 */
export const executeDeckProgram = (session, programId, operativeMod = 3, customRoll = null) => {
  if (!session || session.isBreached || session.isTraced) return session;

  const prog = CANONICAL_DECK_PROGRAMS.find(p => p.id === programId) || CANONICAL_DECK_PROGRAMS[0];

  // 2d10 Roll
  const d1 = customRoll ? Math.floor(customRoll / 2) : (Math.floor(Math.random() * 10) + 1);
  const d2 = customRoll ? Math.ceil(customRoll / 2) : (Math.floor(Math.random() * 10) + 1);
  const isCritTriumph = d1 === 10 && d2 === 10;
  const isCritFumble = d1 === 1 && d2 === 1;

  const baseDiceSum = isCritTriumph ? 30 : isCritFumble ? -10 : (d1 + d2);
  const rollTotal = baseDiceSum + operativeMod;

  const targetDc = session.targetNode.baseDc;
  const isSuccess = rollTotal >= targetDc;

  let damageDealt = 0;
  let traceChange = prog.traceCost;
  let extractedCredits = 0;
  let eventLog = '';

  if (isCritTriumph) {
    damageDealt = prog.baseDamage * 2;
    traceChange = Math.min(0, traceChange - 10);
    eventLog = `🌟 CRITICAL ROOT BREACH! [${d1}, ${d2}] + ${operativeMod} = ${rollTotal} vs DC ${targetDc}. Dealt ${damageDealt} massive ICE damage!`;
  } else if (isCritFumble) {
    damageDealt = 0;
    traceChange += 25;
    eventLog = `💀 CRITICAL FUMBLE! [${d1}, ${d2}] + ${operativeMod} = ${rollTotal} vs DC ${targetDc}. Bio-Feedback shock! Trace surged by +${traceChange}%!`;
  } else if (isSuccess) {
    damageDealt = prog.baseDamage + (Math.floor(Math.random() * 5) - 2);
    eventLog = `✅ ${prog.label} EXECUTED! [${d1}, ${d2}] + ${operativeMod} = ${rollTotal} vs DC ${targetDc}. Dealt ${damageDealt} ICE damage.`;

    if (prog.id === 'siphoncredits_pay') {
      extractedCredits = Math.floor(Math.random() * 800) + 600;
      eventLog += ` Extracted ${extractedCredits} TSC Credits!`;
    }
  } else {
    damageDealt = 2; // Glancing damage
    eventLog = `⚠️ DEFENSE RESISTED: [${d1}, ${d2}] + ${operativeMod} = ${rollTotal} vs DC ${targetDc}. Glancing ICE hit for 2 damage.`;
  }

  const nextIceHp = Math.max(0, session.currentIceHp - damageDealt);
  const nextTrace = Math.max(0, Math.min(100, session.traceLevel + traceChange + session.targetNode.traceRatePerTurn));

  const isBreached = nextIceHp === 0;
  const isTraced = nextTrace >= 100 && !isBreached;

  let conclusionLog = null;
  if (isBreached) {
    conclusionLog = `🏆 SYSTEM OVERRIDE SUCCESS! Root privileges granted for ${session.targetNode.targetType}!`;
  } else if (isTraced) {
    conclusionLog = `🚨 TRACE 100% REACHED: Physical security lockdown and countermeasures dispatched!`;
  }

  return {
    ...session,
    currentIceHp: nextIceHp,
    traceLevel: nextTrace,
    isBreached,
    isTraced,
    creditsExtracted: session.creditsExtracted + extractedCredits,
    logStream: [
      ...(conclusionLog ? [conclusionLog] : []),
      eventLog,
      ...session.logStream
    ]
  };
};
