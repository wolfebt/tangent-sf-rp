## 2025-02-14 - Insecure Randomness in Invite Code Generation
**Vulnerability:** The `generateInviteCode` function used `Math.random()` to generate invite codes.
**Learning:** `Math.random()` is not a cryptographically secure PRNG, making invite codes theoretically predictable and potentially allowing attackers to guess valid codes to join private groups.
**Prevention:** Always use `window.crypto.getRandomValues()` (or `globalThis.crypto.getRandomValues()`) for generating sensitive tokens, identifiers, or invite codes in client-side code.
