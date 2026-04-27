# SecureVault.js

**Zero-dependency crypto vault for the web.**  
Solo, Pair, and 3-of-5 recovery with WebAuthn + 6-hour lockout.

**MIT License | 12KB minified | Zero Dependencies | Works Offline**

---

## 🎓 My Story

I’m Emmanuel Oifoghe, 19, from Delta, Nigeria. 

I missed Dartmouth’s 2025 deadline for Thayer School of Engineering, but I didn’t wait. I taught myself WebCrypto and built SecureVault.js in 2 weeks to prove I can learn real-world cryptography.

**Why this exists:** I want to protect people’s data online and fund my CS education through building. This is project #1. Computer Science isn’t just books - you need broad ideas everywhere.

**To Thayer:** If you’re reading this - I’m ready to learn. My code is my application.

**To everyone else:** If this project helps you or your company, consider sponsoring my textbooks and next application cycle.

💚 **Sponsor my CS journey:** [GitHub Sponsors](https://github.com/sponsors/Oifoghe-Emmanuel)

---

## ✨ Features

- **3 Recovery Modes** → Solo 1-of-1, Pair 2-of-2, 3-of-5 Shamir Secret Sharing
- **WebAuthn Support** → Face ID / Touch ID / Windows Hello where available
- **6-Hour Lockout** → Auto-lock after 5 failed unlock attempts  
- **SHA-256 Integrity** → Prevents reconstruction with wrong shares
- **Zero Dependencies** → Single file. No npm. No build step.
- **12KB minified** → Works offline in any modern browser
- **Unified Engine** → All modes use the same Shamir SSS core

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
*Use case:* Single device, simple backup

```js
// Lock
const result = await SecureVault.createSolo("Bitcoin seed: apple boat cat dog");

// Save result.share safely

// Unlock
const secret = await SecureVault.unlockSolo(savedShare);
// "Bitcoin seed: apple boat cat dog"
```

---

### 2. Pair Mode (2-of-2)
*Use case:* Paper backup + digital backup, both required

```js
// Lock
const result = await SecureVault.createPairUniversal("GTBank PIN: 4928");

// Print result.shares.paper
// Save result.shares.digital to phone

// Unlock
const secret = await SecureVault.unlockPair(paperShare, digitalShare);
// "GTBank PIN: 4928"
```

---

### 3. Five-Way Mode (3-of-5 Shamir)
*Use case:* Family/trust recovery, any 3 shares required

```js
// Lock
const result = await SecureVault.createFiveWay("LastPass Master: xK9$mP2#");

// Distribute: share1 → wife, share2 → brother, share3 → lawyer, etc.

// Unlock with any 3
const secret = await SecureVault.unlockFiveWay([share1, share3, share5]);
// "LastPass Master: xK9$mP2#"
```

---

## 📄 API Response

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

- *AES-256-GCM* encryption
- *PBKDF2* 100,000 iterations
- *Shamir Secret Sharing* for all modes
- *WebAuthn* Secure Enclave when available
- *6-hour lockout* after 5 failed attempts
- *SHA-256* integrity verification

---

## 🌐 Browser Support

Chrome 60+ | Safari 14+ | Firefox 60+ | Edge 79+

---

## 📜 License

MIT © 2026 Oifoghe-Emmanuel

---

## 🧠 Philosophy

> Built for humans.  
> Zero trust, maximum security.  
> *Alpha Pattern:* All modes use same Shamir SSS engine

---

*Star ⭐ if you’re tired of 50-dep crypto libs.*  
*Sponsor 💚 if you want to invest in the next generation of builders.*
