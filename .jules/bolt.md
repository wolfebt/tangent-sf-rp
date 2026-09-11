## 2024-05-24 - [Implement deferred search query for UniversalCatalogModal]
**Learning:** Client-side search filtering of large arrays (like catalogs and compendiums) blocks the main thread during rapid typing, causing UI stutter.
**Action:** Use React's `useDeferredValue` on the search query state when passing it into a filtering `useMemo` block. This allows React to prioritize user input (typing) over re-rendering the large list immediately.
