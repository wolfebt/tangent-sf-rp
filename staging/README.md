# TANGENT SF RP — Markdown SSOT Staging Dropzone

You can place updated `.md` files either in the workspace-level `..\staging\` directory or in this `staging\` directory. Both are scanned automatically by `scripts/ingestStagedMarkdown.mjs`.

## Quick Commands

```powershell
# 1. Dry-run preview of staged files
npm.cmd run sync:staging -- --dry-run

# 2. Ingest staged files, run Option A cross-vault propagation, and rebuild all bundles
npm.cmd run sync:staging -- --apply --rebuild

# 3. Run Option A cross-vault propagation standalone (docs/game_rules -> src/data/omnicortex)
npm.cmd run sync:cross-vault -- --dry-run
npm.cmd run sync:cross-vault -- --apply

# 4. Audit Markdown completeness & truncation markers across all vaults
npm.cmd run audit:markdown
```
