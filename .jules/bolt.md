## 2024-05-19 - Deferring Search State in Large Catalogs
**Learning:** React 18's `useDeferredValue` is highly effective in `OmnicortexCatalogView` and similar components that filter large arrays based on text input, avoiding UI stutter during rapid typing.
**Action:** Always prefer `useDeferredValue` for client-side search filtering of large arrays (e.g., catalogs, compendiums) to decouple the expensive filter calculation from the immediate input state update.
