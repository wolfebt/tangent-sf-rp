## 2024-06-25 - Client-Side Filtering Optimization
**Learning:** Filtering large arrays synchronously on every keystroke in components like `OmnicortexCatalogView.jsx` blocks the main thread, causing severe UI stutter during rapid typing.
**Action:** Use React's `useDeferredValue` on search query states for client-side filtering of large lists. This allows the input to update immediately while deferring the expensive filtering computation.
