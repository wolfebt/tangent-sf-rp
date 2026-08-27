/**
 * Session Event Logger & Narrative Chrono-Recap Synthesizer for Tangent SFF RP
 * Captures live tabletop events, combat highlights, and story beats, synthesizing episodic session recaps.
 */

class SessionJournalManager {
  constructor() {
    this.events = [];
    this.sessionStartTime = new Date();
    this.campaignName = 'Active Operation';
  }

  setCampaignName(name) {
    if (name) this.campaignName = name;
  }

  logEvent({ type = 'action', actor = 'Operative', target = null, details = '', isCrit = false }) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const eventObj = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      type, // 'strike' | 'crit' | 'stabilize' | 'scene' | 'bridge' | 'complication'
      actor,
      target,
      details,
      isCrit
    };
    this.events.push(eventObj);
    return eventObj;
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
    this.sessionStartTime = new Date();
  }

  /**
   * Synthesizes an episodic "Previously on Tangent SFF..." narrative recap
   */
  generateMarkdownRecap() {
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const totalEvents = this.events.length;

    const crits = this.events.filter(e => e.isCrit || e.type === 'crit');
    const strikes = this.events.filter(e => e.type === 'strike');
    const complications = this.events.filter(e => e.type === 'complication');

    let md = `# 🌌 Mission Debrief & Episodic Recap: ${this.campaignName}\n`;
    md += `**Date:** ${dateStr} · **Log Duration:** ${this.events.length} Tactical Events Captured\n\n`;
    md += `---\n\n`;

    md += `## 🎬 Tactical Narrative Summary\n`;
    if (this.events.length === 0) {
      md += `*No tactical engagements logged during this debrief period. Operations proceeded nominally under standard stealth protocols.*\n\n`;
    } else {
      md += `The squad deployed into the active operational theater, engaging hostile elements under shifting environmental and tactical pressures. `;
      if (crits.length > 0) {
        md += `Critical tactical breakthroughs were achieved during the encounter, marked by exceptional precision strikes and high-risk maneuvers. `;
      }
      if (complications.length > 0) {
        md += `The squad adapted to multiple unexpected tactical curveballs, maintaining unit coherence through intense hostile pressure. `;
      }
      md += `\n\n`;
    }

    // Chrono Event Timeline
    md += `## ⏱️ Chronological Tactical Milestones\n\n`;
    if (this.events.length === 0) {
      md += `*System standby. Awaiting mission telemetry.*\n\n`;
    } else {
      this.events.slice(-15).forEach(e => {
        const icon = e.isCrit ? '🌟' : e.type === 'strike' ? '⚔️' : e.type === 'complication' ? '⚠️' : '🔹';
        md += `- **[${e.timestamp}]** ${icon} **${e.actor}**: ${e.details} ${e.target ? `*(Target: ${e.target})*` : ''}\n`;
      });
      md += `\n`;
    }

    // Highlights & MVP Metrics
    md += `## 🎖️ Mission Highlights\n`;
    md += `- **Tactical Strikes Logged:** ${strikes.length}\n`;
    md += `- **Critical Triumphs / Fumbles:** ${crits.length}\n`;
    md += `- **Narrative Complications Survived:** ${complications.length}\n\n`;

    md += `---\n`;
    md += `*Synthesized by BASTION AI Tactical Chronicler · Tangent SFF RP v2.6*\n`;

    return md;
  }
}

export const SessionJournal = new SessionJournalManager();
