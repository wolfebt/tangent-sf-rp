## 2025-02-18 - Avoid Modulo Bias When Generating Secure Strings
**Vulnerability:** Weak random number generation for secure invite codes
**Learning:** When using `window.crypto.getRandomValues` with a character array, using `%` modulo can introduce bias unless the character array length is a power of 2. In Tangent SF, the invite code character set has exactly 32 characters, which completely eliminates modulo bias without complex logic.
**Prevention:** Always verify the length of the string dictionary when using modulo with `window.crypto.getRandomValues`, or use rejection sampling for non-power-of-2 character sets.
