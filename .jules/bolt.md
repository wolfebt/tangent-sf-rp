
## 2024-05-18 - Deferring large compendium search filters
**Learning:** In large React compendium catalogs with complex string matching inside `useMemo` hooks (like `OmnicortexCatalogView.jsx`), typing in search fields can severely block the main thread and cause UI stutter if not deferred or debounced.
**Action:** Apply React's `useDeferredValue(searchQuery)` before passing it to expensive filtering `useMemo` hooks, allowing keystrokes to remain highly responsive while the filter list catches up asynchronously.
