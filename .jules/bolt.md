## 2024-05-18 - Client-side search filtering of large arrays
**Learning:** Searching large arrays client-side without deferring the query state blocks the main thread and causes UI stutter during typing.
**Action:** Use React's `useDeferredValue` on the search query state to decouple the heavy filtering calculation from the text input rendering.
