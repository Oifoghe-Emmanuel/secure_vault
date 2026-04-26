# SecureVault.js

**Zero-dependency 3-of-5 crypto vault for the web.** Split secrets across devices. Recover with any 3 shares. 6-hour brute-force protection.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Size](https://img.shields.io/badge/Size-12KB-blue.svg)]()
[![Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg)]()

### Features

- **3-of-5 Shamir Secret Sharing** - Same math as Coinbase Custody
- **Secure Enclave Support** - Face ID / Touch ID on iOS/Android
- **6 Hour Rate Limit** - Auto-lock after 5 failed attempts
- **SHA-256 Integrity Check** - Prevents wrong secret reconstruction
- **Zero Dependencies** - 1 file. No npm. No build step.
- **Works Offline** - All crypto runs in browser
- **~12KB Minified** - Faster than jQuery

### Install

**CDN:**
```html
<script src="https://cdn.jsdelivr.net/gh/yourusername/secure-vault@main/secure-vault.js"></script>
