## 2025-03-01 - Add `title` and `aria-label` to icon-only buttons
**Learning:** Icon-only buttons used for password/key visibility toggles often lack accessible names, making them difficult to interact with using screen readers.
**Action:** Always add `aria-label` to icon-only buttons for accessibility, and `title` to provide a helpful tooltip on hover.
## 2023-10-13 - Avoid attempting to format with missing scripts\n**Learning:** The repository does not have a `format` script defined in `package.json`, so commands like `pnpm run format` will fail.\n**Action:** Verify the existence of scripts in `package.json` before adding them to an execution plan, and rely on existing checks like `pnpm lint` if formatting scripts are unavailable.
