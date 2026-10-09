## 2024-05-18 - [Preventing UI Stutter in Large Catalogs]
**Learning:** Client-side filtering of large lists (like `UniversalCatalogModal` and `OmnicortexCatalogView`) can block the main thread and cause UI stutter during rapid search typing.
**Action:** Use React's `useDeferredValue` hook on the search query before passing it into the `useMemo` filter computation to keep the input responsive.
