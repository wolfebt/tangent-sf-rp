import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Hash, 
  Lock, 
  Globe, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  Users, 
  Check, 
  ShieldAlert, 
  LogOut, 
  Copy, 
  Radio, 
  Sparkles,
  Edit3,
  Printer,
  Eraser,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { ChatService } from '../../services/chatService';
import { AudioService } from '../../services/audioService';

export const ChannelSettingsModal = ({ isOpen, onClose, channel, messages = [] }) => {
  const { 
    renameChannel, 
    updateChannel, 
    deleteChannel, 
    addChannelMember, 
    removeChannelMember,
    userDirectory,
    refreshUserDirectory,
    clearChannelMessages
  } = useChat();
  const { currentUser, isAdmin } = useAuth();

  const targetChannel = channel;
  const [displayName, setDisplayName] = useState('');
  const [topic, setTopic] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'members' | 'danger'
  const [searchUser, setSearchUser] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const isDefaultPublic = targetChannel?.id?.startsWith('public_');
  const isDM = targetChannel?.type === 'direct' || targetChannel?.id?.startsWith('dm_');
  const isCreator = targetChannel?.createdById === currentUser?.uid;
  const canEdit = !isDefaultPublic && (isCreator || isAdmin);

  useEffect(() => {
    if (isOpen && targetChannel) {
      setDisplayName(targetChannel.displayName || `#${targetChannel.name || ''}`);
      setTopic(targetChannel.topic || '');
      setIsPublic(targetChannel.isPublic !== false);
      setErrorMsg('');
      setSuccessMsg('');
      refreshUserDirectory();
    }
  }, [isOpen, targetChannel, refreshUserDirectory]);

  if (!isOpen || !targetChannel) return null;

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Frequency name cannot be empty.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      await renameChannel(targetChannel.id, displayName.trim(), topic.trim());
      if (canEdit && targetChannel.isPublic !== isPublic) {
        await updateChannel(targetChannel.id, { isPublic: isPublic });
      }
      setSuccessMsg('Frequency configurations updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update channel settings:', err);
      setErrorMsg(err.message || 'Failed to update frequency.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (uid) => {
    try {
      await addChannelMember(targetChannel.id, uid);
      setSuccessMsg('Operator invited to frequency.');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg('Failed to add operator.');
    }
  };

  const handleRemoveMember = async (uid) => {
    if (window.confirm('Remove operator from frequency?')) {
      try {
        await removeChannelMember(targetChannel.id, uid);
        setSuccessMsg('Operator removed from frequency.');
        setTimeout(() => setSuccessMsg(''), 2500);
      } catch (err) {
        setErrorMsg('Failed to remove operator.');
      }
    }
  };

  const handleDelete = async () => {
    if (isDefaultPublic) {
      alert('Default Holonet channels cannot be terminated.');
      return;
    }
    if (window.confirm(`Terminate frequency "${targetChannel.displayName || targetChannel.name}"? This action is permanent.`)) {
      try {
        AudioService.playTerminalBeep(900, 0.05);
        await deleteChannel(targetChannel.id);
        onClose();
      } catch (err) {
        setErrorMsg('Failed to terminate channel.');
      }
    }
  };

  const handleCopyFreqInfo = () => {
    AudioService.playTerminalBeep(1200, 0.02);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Frequency: ${targetChannel.displayName} [${targetChannel.id}]`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrintChat = async () => {
    try {
      setSaving(true);
      AudioService.playTerminalBeep(1200, 0.03);

      // Fetch latest messages if prop not supplied or empty
      let printableMessages = Array.isArray(messages) && messages.length > 0 
        ? messages 
        : await ChatService.fetchChannelMessages(targetChannel.id, 400);

      const printWindow = window.open('', '_blank', 'width=850,height=900');
      if (!printWindow) {
        alert('Please allow popups to print transmission transcripts.');
        setSaving(false);
        return;
      }

      const freqName = targetChannel.displayName || `#${targetChannel.name || 'frequency'}`;
      const freqTopic = targetChannel.topic || 'No topic specified';
      const exportDate = new Date().toLocaleString();

      const rowsHtml = (printableMessages || []).map((msg, idx) => {
        let timestamp = '';
        if (msg.createdAt?.toDate) {
          timestamp = msg.createdAt.toDate().toLocaleString();
        } else if (msg.createdLocalAt) {
          timestamp = new Date(msg.createdLocalAt).toLocaleString();
        } else {
          timestamp = 'SYNCED';
        }

        const sender = msg.senderHandle || 'Unknown Operator';
        const isIC = Boolean(msg.isIC || msg.type === 'ic_transmission');
        const isDice = msg.type === 'dice_roll';
        const isTelemetry = msg.type === 'persona_log_entry' || msg.isReadOnlyLog;

        let content = msg.text || '';
        if (isDice && msg.metadata) {
          const res = msg.metadata.total ?? msg.metadata.result ?? '';
          const expr = msg.metadata.expression || 'dice';
          const lbl = msg.metadata.label ? `[${msg.metadata.label}] ` : '';
          content = `🎲 ${lbl}Rolled ${expr}: ${res}`;
        } else if (isTelemetry && msg.summary) {
          content = `📋 ${msg.summary}`;
        }

        return `
          <div style="border-bottom: 1px solid #e2e8f0; padding: 8px 0; font-family: monospace; font-size: 12px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; color: #64748b; font-size: 11px; margin-bottom: 3px;">
              <span><strong>#${idx + 1}</strong> &bull; <span style="color: ${isIC ? '#7e22ce' : '#0284c7'}; font-weight: bold;">${sender}</span> ${isIC ? '(IN-CHARACTER)' : ''}</span>
              <span>${timestamp}</span>
            </div>
            <div style="color: #0f172a; white-space: pre-wrap; font-family: ${isDice || isTelemetry ? 'monospace' : 'sans-serif'};">${content}</div>
          </div>
        `;
      }).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Transmission Transcript - ${freqName}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; margin: 30px; color: #0f172a; }
              .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
              .meta-grid { display: flex; gap: 20px; font-size: 12px; font-family: monospace; color: #475569; margin-top: 6px; }
              @media print {
                body { margin: 15mm; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 16px; display: flex; gap: 10px;">
              <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Print / Save as PDF</button>
              <button onclick="window.close()" style="padding: 8px 16px; background: #e2e8f0; color: #334155; border: none; border-radius: 6px; cursor: pointer;">Close</button>
            </div>
            <div class="header">
              <h2 style="margin: 0; font-family: monospace; text-transform: uppercase;">TANGENT SF RP // COMMLINK RELAY TRANSCRIPT</h2>
              <div style="font-size: 16px; font-weight: bold; margin-top: 4px; color: #0369a1;">${freqName}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">${freqTopic}</div>
              <div class="meta-grid">
                <div>Channel ID: <code>${targetChannel.id}</code></div>
                <div>Exported: <strong>${exportDate}</strong></div>
                <div>Total Transmissions: <strong>${printableMessages.length}</strong></div>
              </div>
            </div>
            <div>
              ${rowsHtml || '<p style="color: #64748b; font-style: italic;">No transmissions recorded in this frequency.</p>'}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);

      setSuccessMsg('Transmission log prepared for printing.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to print chat transcript:', err);
      setErrorMsg('Failed to generate printable transcript.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearChat = async () => {
    if (isDefaultPublic && !isAdmin) {
      alert('Default Holonet frequency messages can only be purged by an Administrator.');
      return;
    }

    const confirmMsg = `WARNING: Are you sure you want to CLEAR all message transmissions for "${targetChannel.displayName || targetChannel.name}"? This action cannot be undone.`;
    if (window.confirm(confirmMsg)) {
      try {
        setSaving(true);
        AudioService.playTerminalBeep(900, 0.05);
        await clearChannelMessages(targetChannel.id);
        setSuccessMsg('Frequency transmission logs cleared successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        console.error('Failed to clear channel messages:', err);
        setErrorMsg('Failed to clear transmission logs.');
      } finally {
        setSaving(false);
      }
    }
  };

  const currentMembersList = Array.isArray(targetChannel.members) ? targetChannel.members : [];
  const nonMembers = userDirectory.filter(u => !currentMembersList.includes(u.uid) && (
    (u.userHandle || u.displayName || u.email || '').toLowerCase().includes(searchUser.toLowerCase())
  ));

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-fade-in">
      <div className="bg-[#0f141d] border border-cyan-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh] sm:max-h-[88vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Settings size={17} />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
                FREQUENCY CONFIGURATION
              </h2>
              <span className="text-[11px] font-mono text-cyan-400">
                {targetChannel.displayName || `#${targetChannel.name}`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/80 p-2 gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
              activeTab === 'general'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 size={13} />
            <span>GENERAL & RENAME</span>
          </button>

          {!isDefaultPublic && !isDM && (
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
                activeTab === 'members'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users size={13} />
              <span>MEMBERS ({currentMembersList.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('transcripts')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
              activeTab === 'transcripts'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer size={13} />
            <span>PRINT & LOGS</span>
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => setActiveTab('danger')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
                activeTab === 'danger'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert size={13} />
              <span>TERMINATE</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs font-mono">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/60 text-red-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 flex items-center gap-1.5">
              <Check size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: General & Renaming */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              {/* Frequency Name (Rename) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                  Frequency Name / Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isDefaultPublic && !isAdmin}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  required
                />
                {isDefaultPublic && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    System core Holonet channel name is protected.
                  </p>
                )}
              </div>

              {/* Topic */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                  Frequency Topic / Transmit Header
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={2}
                  disabled={isDefaultPublic && !isAdmin}
                  placeholder="Set topic description for this frequency..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-50"
                />
              </div>

              {/* Privacy Setting */}
              {!isDefaultPublic && !isDM && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider">
                    Encryption Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => canEdit && setIsPublic(true)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        canEdit ? 'cursor-pointer' : 'opacity-70'
                      } ${
                        isPublic 
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 font-bold' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Globe size={13} />
                        <span>PUBLIC HOLONET</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Open frequency visible to all operators.
                      </p>
                    </div>

                    <div
                      onClick={() => canEdit && setIsPublic(false)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        canEdit ? 'cursor-pointer' : 'opacity-70'
                      } ${
                        !isPublic 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Lock size={13} />
                        <span>ENCRYPTED TEAM</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Restricted to invited operators only.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Copy Frequency Meta */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCopyFreqInfo}
                  className="text-slate-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Copy size={12} />
                  <span>{copiedLink ? 'Copied Telemetry!' : 'Copy Frequency Telemetry'}</span>
                </button>

                {(canEdit || isAdmin) && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>{saving ? 'UPDATING...' : 'APPLY CHANGES'}</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* TAB 2: Members Management */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div>
                <span className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider">
                  Active Operators in Frequency ({currentMembersList.length})
                </span>

                <div className="max-h-44 overflow-y-auto space-y-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {currentMembersList.map(memberUid => {
                    const userMeta = userDirectory.find(u => u.uid === memberUid);
                    const handle = userMeta?.userHandle || userMeta?.displayName || userMeta?.email || (memberUid === currentUser?.uid ? 'You' : memberUid.substring(0, 10));
                    const isSelf = memberUid === currentUser?.uid;

                    return (
                      <div
                        key={memberUid}
                        className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800"
                      >
                        <span className="font-bold text-slate-200">
                          @{handle} {isSelf && <span className="text-cyan-400 text-[10px]">(You)</span>}
                        </span>

                        {canEdit && !isSelf && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(memberUid)}
                            className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                            title="Remove operator from frequency"
                          >
                            <UserMinus size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Invite new operators */}
              {canEdit && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="block text-slate-300 font-bold uppercase tracking-wider">
                    Invite Registered Operators
                  </span>

                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Search operators to invite..."
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />

                  <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    {nonMembers.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic p-1">No operators available to invite.</p>
                    ) : (
                      nonMembers.map(u => {
                        const handle = u.userHandle || u.displayName || u.email || 'Operator';
                        return (
                          <div
                            key={u.uid}
                            className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900"
                          >
                            <span className="text-slate-300">@{handle}</span>
                            <button
                              type="button"
                              onClick={() => handleAddMember(u.uid)}
                              className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold transition-colors"
                            >
                              INVITE
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

              {/* TAB 3: Print & Transcript Logs */}
              {activeTab === 'transcripts' && (
                <div className="space-y-4">
                  {/* Print / Export Transcripts Card */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold">
                      <Printer size={16} />
                      <span>PRINT &amp; EXPORT TRANSMISSION LOGS</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Generate a formatted, printable commlink transcript of all transmissions, dialogue, and dice rolls in this frequency. Opens the system print/PDF export dialog.
                    </p>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handlePrintChat}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer size={15} />
                      <span>PRINT / EXPORT CHAT TRANSCRIPT</span>
                    </button>
                  </div>

                  {/* Clear Transcripts Card */}
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Eraser size={16} />
                      <span>PURGE &amp; CLEAR FREQUENCY CHAT</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {isDefaultPublic && !isAdmin 
                        ? 'System core Holonet channels require Administrator privileges to purge message logs.'
                        : 'Wipe all transmitted messages and chatter from this frequency. Frequency configuration and members will be preserved.'}
                    </p>
                    <button
                      type="button"
                      disabled={saving || (isDefaultPublic && !isAdmin)}
                      onClick={handleClearChat}
                      className="w-full py-2.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-black border border-amber-500/40 hover:border-amber-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                    >
                      <Eraser size={15} />
                      <span>CLEAR ALL MESSAGES</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Danger Zone */}
              {activeTab === 'danger' && canEdit && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <ShieldAlert size={16} />
                <span>TERMINATE FREQUENCY RELAY</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Terminating this channel will permanently remove its frequency from the Holonet relay and delete all transmitted logs.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                <span>PERMANENTLY TERMINATE CHANNEL</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelSettingsModal;
