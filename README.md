# SecureVault.js

**Zero-dependency crypto vault for the web.** Supports Solo, Pair, and 3-of-5 recovery. Secure Enclave + 6-hour rate limit.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Size](https://img.shields.io/badge/Size-12KB-blue.svg)]()
[![Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg)]()

### Features

- **3 Recovery Modes:** Solo 1-of-1, Pair 2-of-2, or 3-of-5 Shamir
- **Secure Enclave:** Face ID / Touch ID / Windows Hello where available
- **6 Hour Lockout:** Auto-lock after 5 failed unlock attempts
- **SHA-256 Integrity:** Prevents wrong secret from partial shares
- **Zero Dependencies:** 1 file. No npm. No build step.
- **12KB Minified:** Works offline, runs in any browser
- **Alpha Pattern:** All modes use same Shamir SSS engine

### Install

**CDN:**
```html
<script src="https://cdn.jsdelivr.net/gh/Oifoghe-Emmanuel/secure-vault@main/secure_vault.js"></script>
