## 2026-10-07 - Client-side search filtering of large arrays
**Learning:** React component `UniversalCatalogModal` and `DBMWikiView` filter massive game arrays synchronously on every keystroke. This blocks the main thread, causing significant UI stutter when a player rapidly types to filter large compendiums or rulebooks.
**Action:** Always use React's `useDeferredValue` for search filter query state variables when performing client-side filtering over large datasets like catalogs or rulebook compendiums to ensure the main thread can prioritize updating the search input.
