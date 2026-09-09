## 2025-03-01 - Add `title` and `aria-label` to icon-only buttons
**Learning:** Icon-only buttons used for password/key visibility toggles often lack accessible names, making them difficult to interact with using screen readers.
**Action:** Always add `aria-label` to icon-only buttons for accessibility, and `title` to provide a helpful tooltip on hover.

## 2025-03-01 - Add `aria-label` and `title` to icon-only UI overlay controls
**Learning:** Icon-only buttons used in UI overlays (modals, toasts, floating docks) for closing or clearing actions frequently lack accessible names, making them difficult for screen readers to navigate.
**Action:** Always add `aria-label` for screen readers and `title` for hover tooltips to any interactive icon-only control (e.g. Close, Clear, Reset buttons).
