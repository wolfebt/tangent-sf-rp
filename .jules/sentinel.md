## 2026-10-02 - [Insecure Invite Code Generation]
**Vulnerability:** Random strings generated using Math.random() and modulo arithmetic.
**Learning:** Using Math.random() is predictable and modulo arithmetic can introduce bias. However, if the alphabet length is exactly a power of 2 (e.g., 32 characters), mapping 0-255 distribution (from crypto API) to it avoids modulo bias completely.
**Prevention:** Always use window.crypto.getRandomValues() with an appropriate character length (power of 2) when doing modulo mapping for secure tokens.
