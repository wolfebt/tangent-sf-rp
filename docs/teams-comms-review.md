# Teams & Comms — Deep-Dive Review, Revised Blueprint & Implementation Plan

> **Scope:** `TeamsPage`, `CommsPage`, `TeamsNavRail`, `CommsNavRail`, `CommLinkDock`, `SquadRosterTab`, `SquadInvitesTab`, `SquadCommsTab`, `SquadSettingsTab`, `CommCenterWidget`, `CommsCenterDrawer`, `CommsVttPanel`, `VoiceCommsBar`, `QuickTeamInviteModal`, `TeamInviteConfirmationModal`, `CommsHUDBar`, `GameGroupModal`, `SquadSummarySidebar`, `PersonaAuditLogSidebar`.
> **Status:** ✅ **ALL PHASES IMPLEMENTED & VERIFIED (Build Verified: Clean 0 Errors)**

---

## Executive Summary

The Teams & Comms system delivers a high-fidelity cyberpunk/tactical communications experience across three escalating surfaces — the **HUD Bar** (ambient), the **CommLinkDock** (quick-access tray), and the **Teams & Comms Workstations** (full-page workstations). 

Following code investigation, all identified UX friction points, nav stubs, persona invite inconsistencies, duplicate modal logic, and state bloat have been resolved and consolidated.

---

## ✅ Pros — What's Working Well

### 1. Multi-Surface Architecture
The system provides comms at three escalating fidelities — the **HUD bar** (ambient), the **CommLinkDock modal** (quick access), and the **full /comms page** (power user).

### 2. Rich Nav Rails
Both `TeamsNavRail` and `CommsNavRail` follow a consistent visual grammar — portal tooltips, badge notifications, audio feedback, active indicators, and muted/unmuted toggles.

### 3. Invite Flow Breadth
Three invite pathways exist: **join code**, **shareable deep-link**, and **direct operator dispatch**.

### 4. VoiceCommsBar
Push-to-talk, deafen, speaking indicators, dynamic waveform, room name, remote participant roster, and LiveKit SFU integration.

### 5. Live Breadcrumb Status Header
Both `/teams` and `/comms` have live breadcrumb headers showing active squad, invite code, relay status, and operator count.

### 6. QR Code Recruitment
The QR code panel in `SquadRosterTab` using a QR API is a clever zero-friction mobile onboarding feature.

---

## 🔍 Investigation Findings & Code Revisions

### 1. `SquadCommsTab` & `MessageInput` Signature
- **Finding:** The initial review assumed `<MessageInput channelId={...} speakingMode={...} />`. In the codebase, `MessageInput` does not accept `channelId` or `speakingMode` props; it reads `activeChannel`, `speakingMode`, and `sendMessage` directly from `ChatContext`.
- **Resolution:** `SquadCommsTab` was refactored to mount `<MessageView messages={messages} loading={loadingMessages} activeChannel={activeChannel} />` and `<MessageInput isCompact={true} />`. `TeamsPage` synchronizes `selectChannel(activeGroup.channelId)` whenever entering the comms tab.

### 2. Missing `TeamInviteConfirmationModal` in `TeamsPage`
- **Finding:** `SquadInvitesTab` accepted invites by calling `acceptInvite(inv.id)` without passing `groupId` or `persona`. Furthermore, `TeamsPage.jsx` did not have `TeamInviteConfirmationModal` mounted at all.
- **Resolution:** `TeamsPage.jsx` now destructures `reviewingInvite`, `openInviteConfirmation`, and `closeInviteConfirmation` from `GroupContext`, mounts `<TeamInviteConfirmationModal>`, and passes `openInviteConfirmation` to `SquadInvitesTab`.

### 3. Nav Stub Tabs in `CommsPage` and `CommLinkDock`
- **Finding:** The `teams` and `logs` (AUDIT) nav tabs in both `CommsPage` and `CommLinkDock` rendered `ChannelSidebar` as a placeholder.
- **Resolution:**
  - Created `SquadSummarySidebar.jsx` (active squad dossier, online members, 1-click frequency tuning, squad switcher, link to `/teams`).
  - Created `PersonaAuditLogSidebar.jsx` powered by real-time `PersonaLogService.subscribeToPersonaLog(personaId)` with filters for checks, combat, and vitals.

### 4. Duplicate Modal Ecosystem (`GameGroupModal` vs `TeamsPage`)
- **Finding:** `GameGroupModal.jsx` was an unmaintained 1,195-line copy of the teams interface, mounted in `GlobalHUD` for in-situ VTT sessions.
- **Resolution:** Refactored `GameGroupModal.jsx` into a clean ~240-line modal composed directly from `SquadRosterTab`, `SquadInvitesTab`, `SquadCommsTab`, and `SquadSettingsTab`. Changes to squad tabs now automatically apply to both `/teams` and `GameGroupModal`.

### 5. `SquadSettingsTab` State Bloat
- **Finding:** `TeamsPage` maintained 6 pieces of settings state and 14 props drilled into `SquadSettingsTab`.
- **Resolution:** Internalized settings state and the `handleSaveSettings` submission handler directly into `SquadSettingsTab.jsx`.

### 6. Voice Comms Local Identity
- **Finding:** Local user was hardcoded as "Local Operator".
- **Resolution:** Connected `useAuth()` to render `@{userHandle}` or `currentUser.displayName` with real avatar initial.

### 7. `CommCenterWidget` Click Trap
- **Finding:** Whole card had an `onClick` navigating to comms, interfering with input selection.
- **Resolution:** Removed the outer card click handler; made the header title and footer "CENTER MATRIX" explicit, discoverable click targets.

### 8. `CommsNavRail` Compact Mode
- **Finding:** `isCompact` prop was unused.
- **Resolution:** When `isCompact` is true, the rail narrows to `w-14`, and icon text labels are collapsed, expanding usable workspace in `CommLinkDock`.

---

## 🔧 Implemented Action Plan & Status

| ID | Area | Type | Status | File(s) Modified / Created |
|---|---|---|---|---|
| **REC-01** | Nav stub tabs (teams, logs) | Feature | ✅ Done | `SquadSummarySidebar.jsx`, `PersonaAuditLogSidebar.jsx`, `CommsPage.jsx`, `CommLinkDock.jsx` |
| **REC-02** | SquadCommsTab full UI | Feature | ✅ Done | `SquadCommsTab.jsx`, `TeamsPage.jsx` |
| **REC-03** | Invite accept persona picker | UX / Bug | ✅ Done | `TeamsPage.jsx`, `SquadInvitesTab.jsx` |
| **REC-04** | Comms tab unread badge | Feedback | ✅ Done | `TeamsNavRail.jsx` |
| **REC-05** | GameGroupModal consolidation | Architecture | ✅ Done | `GameGroupModal.jsx` |
| **REC-06** | Settings state extraction | Architecture | ✅ Done | `SquadSettingsTab.jsx`, `TeamsPage.jsx` |
| **REC-07** | HUDBar dual toggle prop | Hygiene | ✅ Done | `CommsHUDBar.jsx` |
| **REC-08** | CommLinkDock / Comms parity | Architecture | ✅ Done | `CommLinkDock.jsx`, `CommsPage.jsx` |
| **REC-09** | VoiceCommsBar real handle | Polish | ✅ Done | `VoiceCommsBar.jsx` |
| **REC-10** | Widget click trap | UX | ✅ Done | `CommCenterWidget.jsx` |
| **REC-11** | Speaking mode switcher | UX | ✅ Done | Handled via `MessageInput` in `SquadCommsTab.jsx` |
| **REC-12** | isCompact nav rail | Polish | ✅ Done | `CommsNavRail.jsx` |
| **REC-13** | Jargon tooltips | Onboarding | ✅ Done | `SquadInvitesTab.jsx` |

---

## Component Dependency Map (Updated)

```
HUD Bar (CommsHUDBar)
├── Alt+C ──────────────► CommLinkDock (modal)
│                          ├── CommsNavRail (isCompact: w-14)
│                          │   ├── matrix ──► ChannelSidebar + MessageView
│                          │   ├── roster ──► NetworkRosterView
│                          │   ├── teams ───► SquadSummarySidebar
│                          │   ├── vtt ─────► CommsVttPanel
│                          │   ├── logs ────► PersonaAuditLogSidebar (real-time telemetry)
│                          │   └── settings ─► Station Preferences
│                          └── Maximize ──► /comms (CommsPage)
│
└── Teams button / Modal ─► TeamsPage (/teams) & GameGroupModal (in-situ modal)
                             ├── TeamsNavRail (live unread badge)
                             ├── tab: roster ──► SquadRosterTab
                             ├── tab: directory ► SquadDirectoryTab
                             ├── tab: invites ──► SquadInvitesTab (opens TeamInviteConfirmationModal)
                             ├── tab: comms ────► SquadCommsTab (full MessageView + MessageInput)
                             ├── tab: tactical ──► SquadTacticalTab
                             └── tab: settings ──► SquadSettingsTab (self-contained state)
```
