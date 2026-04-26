# SecureVault.js

**Zero-dependency crypto vault for the web.**  
Supports Solo, Pair, and 3-of-5 recovery with Secure Enclave integration and a 6-hour rate limit.

**MIT License | 12KB | Zero Dependencies**

---

## ✨ Features

- **3 Recovery Modes**
  - Solo (1-of-1)
  - Pair (2-of-2)
  - 3-of-5 Shamir Secret Sharing
- **Secure Enclave Support**  
  Face ID / Touch ID / Windows Hello (where available)
- **6-Hour Lockout**  
  Auto-lock after 5 failed unlock attempts
- **SHA-256 Integrity Check**  
  Prevents reconstruction with incorrect shares
- **Zero Dependencies**  
  Single file. No npm. No build step.
- **Tiny Size**  
  12KB minified, works offline in any browser
- **Unified Architecture**  
  All modes use the same Shamir SSS engine

---

## 📦 Installation

### CDN
```html
<script src="https://cdn.jsdelivr.net/gh/Oifoghe-Emmanuel/secure_vault@main/secure_vault.js"></script>
```

### ESM
```js
import 'https://cdn.jsdelivr.net/gh/Oifoghe-Emmanuel/secure_vault@main/secure_vault.js';
```

---

## 🚀 Usage

### 1. Solo Mode (1-of-1)
**Use case:** Single device, simple backup

```js
// Lock
const result = await SecureVault.createSolo("Bitcoin seed: apple boat cat dog");

// Save result.share safely

// Unlock
const secret = await SecureVault.unlockSolo(savedShare);
console.log(secret);
// "Bitcoin seed: apple boat cat dog"
```

---

### 2. Pair Mode (2-of-2)
**Use case:** Paper backup + digital backup (both required)

```js
// Lock
const result = await SecureVault.createPairUniversal("GTBank PIN: 4928");

// Print result.shares.paper
// Save result.shares.digital to phone

// Unlock
const secret = await SecureVault.unlockPair(paperShare, digitalShare);
console.log(secret);
// "GTBank PIN: 4928"
```

---

### 3. Five-Way Mode (3-of-5 Shamir)
**Use case:** Family or trust-based recovery (any 3 shares required)

```js
// Lock
const result = await SecureVault.createFiveWay("LastPass Master: xK9$mP2#");

// Distribute shares securely:
// share1 → wife
// share2 → brother
// share3 → lawyer
// share4 → safe
// share5 → bank vault

// Unlock (any 3 shares)
const secret = await SecureVault.unlockFiveWay([
  share1,
  share3,
  share5
]);

console.log(secret);
// "LastPass Master: xK9$mP2#"
```

---

## 📄 API Response Format

All `create*` functions return:

```json
{
  "success": true,
  "threshold": 1,
  "totalShares": 1,
  "secretHash": "sha256...",
  "shares": {},
  "instructions": "Store each share separately..."
}
```

---

## 🔐 Security

- AES-256-GCM encryption
- PBKDF2 (100,000 iterations)
- Shamir Secret Sharing (all modes)
- WebAuthn Secure Enclave (when available)
- 6-hour lockout after 5 failed attempts
- SHA-256 integrity verification

---

## 🌐 Browser Support

- Chrome 60+
- Safari 14+
- Firefox 60+
- Edge 79+

---

## 📜 License

MIT © 2026 Oifoghe-Emmanuel

---

## 🧠 Philosophy

> Built for humans.  
> Zero trust, maximum security.- **Alpha Pattern:** All modes use same Shamir SSS engine

### Install

**CDN:**
```html
<script src="https://cdn.jsdelivr.net/gh/Oifoghe-Emmanuel/secure_vault@main/secure_vault.js"></script>
