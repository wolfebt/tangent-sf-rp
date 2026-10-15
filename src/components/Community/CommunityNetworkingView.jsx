import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  Search, 
  Plus, 
  Radio, 
  Sparkles, 
  Check, 
  X, 
  Copy, 
  Crown, 
  Send, 
  Filter, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Eye,
  Heart,
  Activity
} from 'lucide-react';
import { useSquad } from '../../context/SquadContext';
import { useFolio } from '../../context/FolioContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AudioService } from '../../services/audioService';
import { QuickSquadInviteModal } from '../Chat/QuickSquadInviteModal';
import { SquadInviteConfirmationModal } from '../Squads/SquadInviteConfirmationModal';

const TACTICAL_ROLES = [
  'Vanguard',
  'Medic / Field Surgeon',
  'Tech / Hacker',
  'Recon / Scout',
  'Heavy Weapons',
  'Infiltrator',
  'Specialist / Pilot',
  'Psionic / Mystic'
];

export const CommunityNetworkingView = ({ onNavigateToSquad }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { 
    squads = [],
    groups = [], 
    subscribeToLFPGroups, 
    subscribeToLFTPersonas, 
    flagSquadLFP, 
    flagPersonaLFT,
    isUserArchitect,
    isUserCoArchitect,
    canManageTeam,
    joinByCode
  } = useSquad() || {};
  const effectiveSquads = squads.length > 0 ? squads : groups;

  const { personaRoster = [], roster = [] } = useFolio() || {};
  const myPersonas = personaRoster.length > 0 ? personaRoster : roster;

  // Active Tab: 'lfs' (Looking for Squad) | 'lfp' (Looking for Persons)
  const [activeTab, setActiveTab] = useState('lfs');
  const isLfs = activeTab === 'lfs' || activeTab === 'lft';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Live Subscription Data
  const [lftPersonas, setLftPersonas] = useState([]);
  const [lfpGroups, setLfpGroups] = useState([]);

  // Modals
  const [isFlagLftModalOpen, setIsFlagLftModalOpen] = useState(false);
  const [isFlagLfpModalOpen, setIsFlagLfpModalOpen] = useState(false);
  const [recruitingTargetUser, setRecruitingTargetUser] = useState(null);
  const [joiningTargetGroup, setJoiningTargetGroup] = useState(null);

  // Subscribe to LFT & LFP feeds
  useEffect(() => {
    const unsubLFT = subscribeToLFTPersonas?.((list) => {
      setLftPersonas(list || []);
    });
    const unsubLFP = subscribeToLFPGroups?.((list) => {
      setLfpGroups(list || []);
    });

    return () => {
      if (typeof unsubLFT === 'function') unsubLFT();
      if (typeof unsubLFP === 'function') unsubLFP();
    };
  }, [subscribeToLFTPersonas, subscribeToLFPGroups]);

  // Determine user's Architect squads for recruiting
  const architectSquads = useMemo(() => {
    return (groups || []).filter(g => canManageTeam ? canManageTeam(g) : (g.creatorId === currentUser?.uid));
  }, [groups, currentUser, canManageTeam]);

  // Check if current user has an active LFT persona
  const myLftEntry = useMemo(() => {
    return lftPersonas.find(p => p.operatorUid === currentUser?.uid);
  }, [lftPersonas, currentUser]);

  // Check if current user's squads are flagged for LFP
  const myLfpSquads = useMemo(() => {
    return lfpGroups.filter(g => g.creatorId === currentUser?.uid || g.coArchitectId === currentUser?.uid);
  }, [lfpGroups, currentUser]);

  // Filtered LFT Personas
  const filteredLFT = useMemo(() => {
    return lftPersonas.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.concept && item.concept.toLowerCase().includes(q)) ||
        (item.species && item.species.toLowerCase().includes(q)) ||
        (item.operatorHandle && item.operatorHandle.toLowerCase().includes(q)) ||
        (item.pitch && item.pitch.toLowerCase().includes(q))
      );

      const matchesRole = selectedRoleFilter === 'ALL' || (
        Array.isArray(item.preferredRoles) && item.preferredRoles.some(r => r.toLowerCase().includes(selectedRoleFilter.toLowerCase()))
      ) || (item.concept && item.concept.toLowerCase().includes(selectedRoleFilter.toLowerCase()));

      return matchesSearch && matchesRole;
    });
  }, [lftPersonas, searchQuery, selectedRoleFilter]);

  // Filtered LFP Groups
  const filteredLFP = useMemo(() => {
    return lfpGroups.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const lfpData = item.lfp || {};
      const matchesSearch = !q || (
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.campaignTitle && item.campaignTitle.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (lfpData.pitch && lfpData.pitch.toLowerCase().includes(q))
      );

      const matchesRole = selectedRoleFilter === 'ALL' || (
        Array.isArray(lfpData.neededRoles) && lfpData.neededRoles.some(r => r.toLowerCase().includes(selectedRoleFilter.toLowerCase()))
      );

      return matchesSearch && matchesRole;
    });
  }, [lfpGroups, searchQuery, selectedRoleFilter]);

  const handleWithdrawLFT = async (personaId) => {
    try {
      AudioService.playTerminalBeep(900, 0.03);
      await flagPersonaLFT({
        personaId,
        operatorUid: currentUser?.uid,
        active: false
      });
      toast({ type: 'info', text: 'Persona withdrawn from LFT registry.' });
    } catch (err) {
      toast({ type: 'error', text: 'Failed to withdraw persona.' });
    }
  };

  const handleWithdrawLFP = async (groupId) => {
    try {
      AudioService.playTerminalBeep(900, 0.03);
      await flagSquadLFP({
        groupId,
        active: false
      });
      toast({ type: 'info', text: 'Squad vacancy notice closed.' });
    } catch (err) {
      toast({ type: 'error', text: 'Failed to update squad status.' });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#070b13] text-slate-100 font-sans select-none overflow-hidden">
      {/* ── Sub-header Navigation & Controls ── */}
      <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-cyan-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              COMMUNITY NETWORKING &amp; RECRUITMENT
            </h2>
          </div>

          {/* 2-Tab Switcher: LFS vs LFP */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setActiveTab('lfs');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLfs
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>LOOKING FOR SQUAD (LFS)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[9px]">
                {lftPersonas.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setActiveTab('lfp');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isLfs
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>LOOKING FOR PERSONAS (LFP)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px]">
                {lfpGroups.length}
              </span>
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          {isLfs ? (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.02);
                setIsFlagLftModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>FLAG PERSONA FOR LFS</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.02);
                setIsFlagLfpModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>FLAG SQUAD FOR LFP</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Search & Tactical Role Filter Bar ── */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isLfs ? 'Search personas by name, species, role, or operator...' : 'Search squads by name, campaign, or needed roles...'}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0 flex items-center gap-1">
            <Filter size={10} />
            <span>ROLE:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedRoleFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer shrink-0 ${
              selectedRoleFilter === 'ALL'
                ? 'bg-cyan-500 text-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ALL
          </button>
          {['Vanguard', 'Medic', 'Tech', 'Recon', 'Heavy', 'Infiltrator', 'Specialist'].map(role => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer shrink-0 ${
                selectedRoleFilter === role
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Tab Views ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* TAB 1: LOOKING FOR SQUAD (LFS) */}
        {isLfs && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  DEPLOYMENT-READY PERSONAS SEEKING SQUAD COMMISSIONS ({filteredLFT.length})
                </h3>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Operators broadcasting availability for tactical fireteam recruitment and mission ops.
                </p>
              </div>

              {myLftEntry && (
                <div className="p-2 px-3 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-[9px] text-purple-400 font-mono uppercase font-bold block">YOUR ACTIVE LFS BROADCAST</span>
                    <span className="text-xs font-bold text-white font-mono">{myLftEntry.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWithdrawLFT(myLftEntry.personaId)}
                    className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold cursor-pointer transition-colors"
                  >
                    WITHDRAW
                  </button>
                </div>
              )}
            </div>

            {filteredLFT.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <Sparkles size={28} className="mx-auto text-purple-400/60" />
                <p className="text-slate-300 font-mono text-xs font-bold">No Personas Currently Broadcast on LFS</p>
                <p className="text-slate-500 text-[11px] max-w-md mx-auto">
                  Flag your Folio character sheet above to signal Architects across the network that you are ready for squad operations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredLFT.map((item) => {
                  const isSelf = item.operatorUid === currentUser?.uid;

                  return (
                    <div
                      key={item.id || item.personaId}
                      className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-3 shadow-md"
                    >
                      <div className="space-y-2.5">
                        {/* Header: Persona Name & Operator */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500/50 flex items-center justify-center font-bold text-sm text-purple-200 font-mono shrink-0">
                              {item.name?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-white text-xs font-mono truncate block">
                                {item.name}
                              </span>
                              <span className="text-[10px] font-mono text-purple-400 truncate block">
                                {item.species} • {item.concept}
                              </span>
                            </div>
                          </div>

                          <span className="text-[9.5px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono shrink-0">
                            @{item.operatorHandle}
                          </span>
                        </div>

                        {/* Stats Badges */}
                        <div className="flex items-center gap-2 font-mono text-[9.5px]">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                            HP: {item.health || 30}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                            VIT: {item.vitality || 30}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500">
                            {new Date(item.updatedAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Preferred Roles */}
                        {Array.isArray(item.preferredRoles) && item.preferredRoles.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {item.preferredRoles.map(r => (
                              <span 
                                key={r} 
                                className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[9px] font-mono font-bold"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Mission Pitch / Availability */}
                        {item.pitch && (
                          <p className="text-[10.5px] text-slate-300 font-sans leading-relaxed bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                            "{item.pitch}"
                          </p>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {isSelf ? (
                          <button
                            type="button"
                            onClick={() => handleWithdrawLFT(item.personaId)}
                            className="w-full py-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-mono font-bold transition-all cursor-pointer"
                          >
                            WITHDRAW FROM LFS
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              AudioService.playTerminalBeep(1200, 0.02);
                              setRecruitingTargetUser({
                                uid: item.operatorUid,
                                handle: item.operatorHandle,
                                displayName: item.operatorHandle
                              });
                            }}
                            className="w-full py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <Send size={12} />
                            <span>RECRUIT / DISPATCH INVITE</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOOKING FOR PERSONAS (LFP) */}
        {!isLfs && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  ACTIVE SQUADS RECRUITING PERSONAS ({filteredLFP.length})
                </h3>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Lead Architects recruiting operators and character personas for campaign missions.
                </p>
              </div>

              {myLfpSquads.length > 0 && (
                <div className="p-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-[9px] text-emerald-400 font-mono uppercase font-bold block">YOUR RECRUITING SQUAD</span>
                    <span className="text-xs font-bold text-white font-mono">{myLfpSquads[0].name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWithdrawLFP(myLfpSquads[0].id)}
                    className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold cursor-pointer transition-colors"
                  >
                    CLOSE RECRUITMENT
                  </button>
                </div>
              )}
            </div>

            {filteredLFP.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <Shield size={28} className="mx-auto text-emerald-400/60" />
                <p className="text-slate-300 font-mono text-xs font-bold">No Squads Actively Recruiting</p>
                <p className="text-slate-500 text-[11px] max-w-md mx-auto">
                  Architects can flag their fireteam above to advertise open slots and sought-after tactical roles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredLFP.map((squad) => {
                  const lfp = squad.lfp || {};
                  const openSlots = lfp.openSlots || (squad.maxMembers ? squad.maxMembers - (squad.members?.length || 1) : 2);
                  const isArchitect = squad.creatorId === currentUser?.uid || squad.coArchitectId === currentUser?.uid;
                  const isMember = (squad.members || []).some(m => (typeof m === 'string' ? m === currentUser?.uid : m?.userId === currentUser?.uid));

                  return (
                    <div
                      key={squad.id}
                      className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3 shadow-md"
                    >
                      <div className="space-y-2.5">
                        {/* Header: Squad Name & Open Slots */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-mono shrink-0">
                              <Shield size={18} />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-white text-xs font-mono truncate block">
                                {squad.name}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400 truncate block">
                                Architect: @{squad.creatorHandle || 'Architect'}
                              </span>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold shrink-0">
                            {openSlots} OPEN SLOTS
                          </span>
                        </div>

                        {/* Campaign Title if present */}
                        {squad.campaignTitle && (
                          <div className="text-[10.5px] font-mono text-purple-300 flex items-center gap-1">
                            <span>Story:</span>
                            <span className="font-bold text-white truncate">{squad.campaignTitle}</span>
                          </div>
                        )}

                        {/* Needed Roles */}
                        {Array.isArray(lfp.neededRoles) && lfp.neededRoles.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">
                              SOUGHT-AFTER ROLES:
                            </span>
                            <div className="flex items-center gap-1 flex-wrap">
                              {lfp.neededRoles.map(r => (
                                <span 
                                  key={r} 
                                  className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mission Pitch / Description */}
                        {(lfp.pitch || squad.description) && (
                          <p className="text-[10.5px] text-slate-300 font-sans leading-relaxed bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                            "{lfp.pitch || squad.description}"
                          </p>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {isMember ? (
                          <span className="w-full py-1 text-center text-[10.5px] font-mono text-emerald-400 font-bold">
                            ALREADY ENROLLED
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              AudioService.playTerminalBeep(1200, 0.02);
                              setJoiningTargetGroup(squad);
                            }}
                            className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                          >
                            <Shield size={12} />
                            <span>JOIN SQUAD WITH PERSONA</span>
                          </button>
                        )}

                        {squad.inviteCode && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(squad.inviteCode);
                              AudioService.playTerminalBeep(1250, 0.02);
                              toast({ type: 'success', text: `Invite code ${squad.inviteCode} copied!` });
                            }}
                            className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                            aria-label="Copy Join Code"
                            title="Copy Join Code"
                          >
                            <Copy size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── MODAL 1: Flag Persona For LFT ── */}
      {isFlagLftModalOpen && (
        <FlagPersonaLftModal
          isOpen={isFlagLftModalOpen}
          onClose={() => setIsFlagLftModalOpen(false)}
          personas={myPersonas}
          currentUser={currentUser}
          existingLft={myLftEntry}
          onSave={flagPersonaLFT}
          toast={toast}
        />
      )}

      {/* ── MODAL 2: Flag Squad For LFP ── */}
      {isFlagLfpModalOpen && (
        <FlagSquadLfpModal
          isOpen={isFlagLfpModalOpen}
          onClose={() => setIsFlagLfpModalOpen(false)}
          squads={architectSquads}
          currentUser={currentUser}
          onSave={flagSquadLFP}
          toast={toast}
        />
      )}

      {/* ── MODAL 3: Quick Recruit Dispatch Modal ── */}
      {recruitingTargetUser && (
        <QuickSquadInviteModal
          isOpen={Boolean(recruitingTargetUser)}
          onClose={() => setRecruitingTargetUser(null)}
          preselectedUser={recruitingTargetUser}
        />
      )}

      {/* ── MODAL 4: Join Squad with Persona Confirmation ── */}
      {joiningTargetGroup && (
        <SquadInviteConfirmationModal
          isOpen={Boolean(joiningTargetGroup)}
          onClose={() => setJoiningTargetGroup(null)}
          invite={{
            id: `direct_join_${joiningTargetGroup.id}`,
            groupId: joiningTargetGroup.id,
            groupName: joiningTargetGroup.name,
            fromUserHandle: joiningTargetGroup.creatorHandle,
            groupMetadata: joiningTargetGroup
          }}
        />
      )}
    </div>
  );
};

/**
 * Modal to Flag / Update a Persona as Looking For Team
 */
const FlagPersonaLftModal = ({ isOpen, onClose, personas = [], currentUser, existingLft, onSave, toast }) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState(
    existingLft?.personaId || (personas[0]?.['character-doc-id'] || personas[0]?.id || '')
  );
  const [selectedRoles, setSelectedRoles] = useState(existingLft?.preferredRoles || []);
  const [pitch, setPitch] = useState(existingLft?.pitch || '');
  const [submitting, setSubmitting] = useState(false);

  const toggleRole = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPersonaId) {
      toast({ type: 'error', text: 'Select a persona from your Folio first.' });
      return;
    }

    const persona = personas.find(p => (p['character-doc-id'] || p.id) === selectedPersonaId);
    setSubmitting(true);
    try {
      await onSave({
        personaId: selectedPersonaId,
        personaData: persona,
        operatorUid: currentUser?.uid,
        operatorHandle: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Operator',
        preferredRoles: selectedRoles,
        pitch,
        active: true
      });
      AudioService.playTerminalBeep(1400, 0.05);
      toast({ type: 'success', text: 'Persona successfully broadcast to LFT registry!' });
      onClose();
    } catch (err) {
      toast({ type: 'error', text: 'Failed to broadcast persona.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-sans animate-fade-in">
      <div className="bg-[#0b121d] border border-purple-500/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.3)] flex flex-col max-h-[90vh] text-slate-100 font-mono">
        <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                FLAG PERSONA AS LOOKING FOR SQUAD (LFS)
              </h3>
              <p className="text-[11px] text-slate-400">
                Broadcast availability to Architects recruiting for active campaigns
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal" title="Close modal" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Persona selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-300 uppercase block">
              SELECT DEPLOYING PERSONA (FROM FOLIO):
            </label>
            {personas.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                No character sheets found in Folio. Please create a sheet in the Folio workstation first.
              </div>
            ) : (
              <select
                value={selectedPersonaId}
                onChange={(e) => setSelectedPersonaId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                {personas.map(p => {
                  const id = p['character-doc-id'] || p.id;
                  const name = p['char-name'] || p.name || 'Persona';
                  const role = p['char-concept'] || p['char-occu'] || 'Specialist';
                  return (
                    <option key={id} value={id}>
                      {name} ({role})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Preferred Roles Checkboxes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase block">
              PREFERRED TACTICAL ROLES:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {TACTICAL_ROLES.map(role => {
                const isSelected = selectedRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`p-2 rounded-xl text-left text-[11px] font-mono border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-400 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{role}</span>
                    {isSelected && <Check size={12} className="text-purple-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability / Mission Pitch */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase block">
              MISSION AVAILABILITY &amp; PITCH:
            </label>
            <textarea
              rows={3}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="e.g. Experienced recon scout ready for high-stakes black ops or deep-space exploration. Available evenings UTC."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-400 font-sans"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-[10.5px] text-purple-300 flex items-center gap-2">
            <Sparkles size={14} className="shrink-0" />
            <span>Architects across the Terran Data Network can review your sheet summary and send direct squad invitations.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || personas.length === 0}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'BROADCASTING...' : 'BROADCAST TO LFS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Modal to Flag / Update a Squad as Looking For Persons
 */
const FlagSquadLfpModal = ({ isOpen, onClose, squads = [], currentUser, onSave, toast }) => {
  const [selectedGroupId, setSelectedGroupId] = useState(squads[0]?.id || '');
  const [openSlots, setOpenSlots] = useState(2);
  const [neededRoles, setNeededRoles] = useState([]);
  const [pitch, setPitch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleRole = (role) => {
    setNeededRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      toast({ type: 'error', text: 'Select a squad to flag for recruitment.' });
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        groupId: selectedGroupId,
        neededRoles,
        openSlots,
        pitch,
        active: true
      });
      AudioService.playTerminalBeep(1400, 0.05);
      toast({ type: 'success', text: 'Squad vacancy notice broadcast to LFP feed!' });
      onClose();
    } catch (err) {
      toast({ type: 'error', text: 'Failed to broadcast squad vacancy.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-sans animate-fade-in">
      <div className="bg-[#0b121d] border border-emerald-500/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.3)] flex flex-col max-h-[90vh] text-slate-100 font-mono">
        <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                FLAG SQUAD AS LOOKING FOR PERSONAS (LFP)
              </h3>
              <p className="text-[11px] text-slate-400">
                Advertise open squad vacancies &amp; sought-after character roles
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal" title="Close modal" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Squad selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-300 uppercase block">
              SELECT ARCHITECT FIRETEAM / SQUAD:
            </label>
            {squads.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                You do not lead or co-manage any squads yet. Create a squad in the Squads module first.
              </div>
            ) : (
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer font-bold"
              >
                {squads.map(g => (
                  <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                    🛡️ {g.name} ({g.members?.length || 1} members)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Open Slots */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase block">
              VACANT OPERATOR SLOTS NEEDED:
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={openSlots}
              onChange={(e) => setOpenSlots(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-bold"
            />
          </div>

          {/* Sought-after Roles Checkboxes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase block">
              SOUGHT-AFTER TACTICAL ROLES:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {TACTICAL_ROLES.map(role => {
                const isSelected = neededRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`p-2 rounded-xl text-left text-[11px] font-mono border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{role}</span>
                    {isSelected && <Check size={12} className="text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mission Pitch */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase block">
              CAMPAIGN BRIEFING / MISSION PITCH:
            </label>
            <textarea
              rows={3}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="e.g. Operating in Sector 4 salvage corridor. Looking for a combat hacker and field medic for weekly high-danger operations."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || squads.length === 0}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'BROADCASTING...' : 'BROADCAST SQUAD VACANCY'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityNetworkingView;
