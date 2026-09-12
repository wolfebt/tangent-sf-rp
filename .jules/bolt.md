## 2024-05-24 - OmnicortexCatalogView Client-Side Search Blocking
**Learning:** Client-side search filtering of large arrays (like catalogs and compendiums) causes main thread blocking and UI stutter during rapid typing because the `useMemo` dependency array triggers a heavy filtering operation on every keystroke.
**Action:** Use React's `useDeferredValue` on the search query state. This allows the search input to remain responsive while deferring the heavy filtering computation to the background.
