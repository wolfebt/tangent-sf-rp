## 2026-10-08 - Fix admin override authorization bypass
**Vulnerability:** A logic error in `AuthContext.jsx` used `!== 'false'` to evaluate the `omnicortex_admin_override` local storage item, meaning any user without that key explicitly set to `'false'` would automatically receive admin rights.
**Learning:** Default-open logic (`!== 'false'`) for security flags introduces severe authorization bypass vulnerabilities, particularly on the frontend where local storage states are easily manipulated or uninitialized.
**Prevention:** Always use default-closed logic (e.g., `=== 'true'`) when evaluating boolean security flags or authorization overrides from local storage or environment variables.
