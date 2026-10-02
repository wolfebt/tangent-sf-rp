/**
 * @file adeThemes.ts
 * @description Theme tokens and styling definitions for ADE navigation and cockpit workspaces.
 */

export interface ThemeConfig {
  iconBox: string;
  activeBox: string;
  activeBtn: string;
  activeLabel: string;
  idleLabel: string;
  bar: string;
  badge: string;
}

export type AdeThemeName = 'cyan' | 'purple' | 'amber' | 'emerald';

export const ADE_THEMES: Record<AdeThemeName, ThemeConfig> = {
  cyan: {
    iconBox: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400 group-hover:text-cyan-300',
    activeBox: 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)]',
    activeBtn: 'bg-cyan-950/70 border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.25)]',
    activeLabel: 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.7)]',
    idleLabel: 'text-slate-400 group-hover:text-cyan-300',
    bar: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    badge: 'bg-cyan-500 text-black'
  },
  purple: {
    iconBox: 'bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-400 group-hover:text-purple-300',
    activeBox: 'bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    activeBtn: 'bg-purple-950/70 border-purple-400/80 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    activeLabel: 'text-purple-300 font-extrabold [text-shadow:0_0_8px_rgba(168,85,247,0.7)]',
    idleLabel: 'text-slate-400 group-hover:text-purple-300',
    bar: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    badge: 'bg-purple-500 text-white'
  },
  amber: {
    iconBox: 'bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-400 group-hover:text-amber-300',
    activeBox: 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    activeBtn: 'bg-amber-950/70 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    activeLabel: 'text-amber-300 font-extrabold [text-shadow:0_0_8px_rgba(245,158,11,0.7)]',
    idleLabel: 'text-slate-400 group-hover:text-amber-300',
    bar: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    badge: 'bg-amber-500 text-black'
  },
  emerald: {
    iconBox: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400 group-hover:text-emerald-300',
    activeBox: 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    activeBtn: 'bg-emerald-950/70 border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    activeLabel: 'text-emerald-300 font-extrabold [text-shadow:0_0_8px_rgba(16,185,129,0.7)]',
    idleLabel: 'text-slate-400 group-hover:text-emerald-300',
    bar: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    badge: 'bg-emerald-500 text-black'
  }
};
