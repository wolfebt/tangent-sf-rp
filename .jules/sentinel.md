## 2024-05-31 - [MEDIUM] Fix weak random number generation for invite codes
**Vulnerability:** Weak random number generation using Math.random() for squad invite codes.
**Learning:** Math.random() is predictable and cryptographically insecure, making invite codes theoretically guessable. Modulo bias when selecting characters from strings of arbitrary lengths can also skew the distribution of generated values.
**Prevention:** Always use globalThis.crypto.getRandomValues() for generating secure identifiers like invite codes. When selecting characters from a string or array, ensure the source length is a power of 2 (e.g., 32 characters) and use a bitwise AND operator (e.g., & 31) to eliminate modulo bias.
