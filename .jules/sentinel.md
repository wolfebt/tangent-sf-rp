## 2024-05-18 - [Replaced insecure Math.random with crypto.getRandomValues for invite codes]
**Vulnerability:** Used Math.random to generate invite codes in groupService.js
**Learning:** Math.random is not a cryptographically secure PRNG and its generated values can be easily predicted, allowing malicious actors to potentially guess group invite codes.
**Prevention:** Always use window.crypto.getRandomValues for generating secure random strings or numbers.
