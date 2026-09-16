## 2025-02-27 - [Predictable Invite Code Generation]
**Vulnerability:** The invite code generation logic was using Math.random(), which is not cryptographically secure and could allow attackers to predict or brute-force group invite codes.
**Learning:** Found in `generateInviteCode()` in `src/services/groupService.js`. Due to modulo bias when directly converting numeric hashes to strings with limited charsets, it is critical to use a character set whose length is a power of 2 (32 in this case) combined with `globalThis.crypto.getRandomValues()` for uniform distribution.
**Prevention:** Avoid using `Math.random()` for any sensitive strings, tokens, or IDs. Always use `globalThis.crypto.getRandomValues()` along with a properly sized character set.
