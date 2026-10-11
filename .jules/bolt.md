## 2026-10-11 - [Search Filtering Deferred Values]
**Learning:** For client-side search filtering of large arrays (e.g., catalogs, compendiums, and rosters), React's `useDeferredValue` on the search query state prevents main thread blocking and UI stutter during rapid typing.
**Action:** Always wrap search input state in `useDeferredValue` when filtering large datasets on the client-side to improve rendering performance and responsiveness.
