## 2024-05-19 - [Missing useMemo import failure]
**Learning:** An optimization was rejected because adding a `useMemo` optimization without explicitly importing the `useMemo` hook in the file leads to a `ReferenceError` at runtime.
**Action:** When adding React hooks, verify the file contains the correct imports. Clean up any test/scratchpad files or unwanted auto-generated artifacts (like uninstructed `pnpm-lock.yaml`) before proposing changes.
