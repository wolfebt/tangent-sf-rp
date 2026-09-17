## 2024-05-18 - Client-Side Search Filtering
**Learning:** Found that filtering large arrays directly in `useMemo` based on real-time `searchQuery` state can cause UI stutter.
**Action:** Always wrap `searchQuery` with `useDeferredValue` (e.g. `const deferredSearchQuery = useDeferredValue(searchQuery);`) when filtering large arrays on the client side.
