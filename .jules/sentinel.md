## 2025-02-14 - Fix insecure random number generation for invite codes
**Vulnerability:** Invite codes were being generated using `Math.random()`, which is a pseudorandom number generator (PRNG) and not cryptographically secure. This could theoretically allow an attacker to predict future invite codes if they observe enough past ones.
**Learning:** For secure operations, even those that seem low-risk like invite codes, standard `Math.random()` should be avoided due to predictability.
**Prevention:** Always use the Web Crypto API's `crypto.getRandomValues()` for security-sensitive random number generation. When mapping to a character set using modulo arithmetic, ensure the character set's length is a power of 2 (e.g., 32 characters) to avoid modulo bias.
