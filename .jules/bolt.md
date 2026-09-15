## 2024-05-18 - Client-Side Filtering Optimization
**Learning:** Client-side search filtering of large arrays (catalogs, compendiums, rosters) causes significant main thread blocking and UI stutter during rapid typing because React renders the input and the filtered list synchronously.
**Action:** Use React's `useDeferredValue` on the search query state used in the filtering logic, allowing the input to remain highly responsive while the heavier list filtering processes in the background.
