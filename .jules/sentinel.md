## 2025-02-13 - Prevent XSS in Dynamic Guide Content
**Vulnerability:** Unsanitized use of dangerouslySetInnerHTML in UserGuideView.jsx
**Learning:** In interactive/dynamic UI components like guides, using dangerouslySetInnerHTML to render parsed text (e.g., Markdown-like replacements) without sanitization introduces XSS risks, even if the primary source is internal data, as user-provided mods or dynamic compendiums could inject malicious payloads.
**Prevention:** Always wrap variables passed into dangerouslySetInnerHTML with DOMPurify.sanitize() to ensure only safe HTML is executed by the browser.
