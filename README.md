# SecureVault v6.4.1 - Alpha Pattern™

**Zero-Knowledge Password Vault with Mathematically Secure Backup**

**Alpha Pattern™** - A name I created for teaching AES-GCM random IVs. Invented by Emmanuel Oifoghe, 2026.

## Sponsor

**To support financially and to Dartmouth college:** https://paystack.shop/pay/h9wvwzrcg3

Your support helps:
1. **Build SecureVault v6.5** with Device Binding 2FA
2. **Fund my Dartmouth College** CS undergrad application Jan 2027
3. **Keep Alpha Pattern open source** for students worldwide

Thank you for believing in real crypto from Nigeria.

---

## What is Alpha Pattern™?

**Alpha Pattern** = A beginner-friendly name for AES-GCM encryption with hardware-random IVs.

Example: Letter 'J'
- Day 1: J → `22568fed039bf98e...`
- Day 2: J → `9196cc88331ce795...`

**Why:** Each encrypt uses a new random IV from `crypto.getRandomValues(12)`  
**Result:** Same plaintext encrypts differently every time. This is called IND-CPA security.

I created this name to teach my brother in Agbarho why "A=J today, A=Z tomorrow" matters. The math is standard AES-GCM. The name Alpha Pattern is mine.

---

## Features

### 1. Zero-Knowledge Architecture
- **Master key never leaves your device** → Stored in iPhone Secure Enclave / Android TEE via WebAuthn
- **Server sees only:** `verifier` hash. Server never sees password or master key
- **If server hacked:** Attackers get useless hashes, not your passwords

### 2. Alpha Pattern™ Implementation
- **Uses AES-256-GCM** → Industry standard encryption
- **Unique IV per encrypt** → `crypto.getRandomValues(12)` ensures Alpha Pattern behavior
- **IND-CPA Secure** → Same plaintext = different ciphertext every time
- **OWASP Compliant** → PBKDF2 600,000 iterations

### 3. Shamir 3-of-5 Backup
- **Split your master key** into 5 shares
- **Any 3 shares recover** → Keep one on phone, paper, cloud, brother, laptop
- **2 shares = useless** → Thief needs 3. You lose 2, still safe
- **Mathematically secure** → Based on finite field arithmetic

### 4. Brute Force Protection
- **5 wrong passwords** = 6 hour lockout
- **Rate limiting** enforced client-side
- **Password leak alone can't compromise account** → Need device + password

### 5. Public Security Audit

Run this in any browser console to verify crypto:

```js
auditSecureVault()
// Expected: [7/9] SECURITY CHECKS PASSED
```

Why 7/9? The last 2 tests need Face ID/Touch ID. On desktop you see 7/9. On iPhone you see 9/9. All core crypto tests pass on any device.

---

## Quick Start

### 1. Install
```html
<script src="secure_vault.js"></script>
```

### 2. Sign Up
```js
const user = await SecureVault.signup("you@email.com", "username", "StrongPass123!");
```

### 3. Login
```js
const login = await SecureVault.login("you@email.com", "username", "StrongPass123!", user.user);
const masterKey = login.masterKey; // Use this to encrypt passwords
```

### 4. Create Backup
```js
const backup = await SecureVault.createPairUniversal("MySecret", {
  totalShares: 5,
  threshold: 3,
  labels: ["phone","paper","cloud","brother","laptop"]
});

console.log(backup.shares.paper); // Print this and hide it
```

### 5. Recover
```js
const recovered = await SecureVault.unlockPairUniversal(
  [share1, share2, share3], // Any 3 shares
  backup.secretHash,
  "recovery"
);
```

---

## Security Properties Proven by Tests

| Attack            | Protection                                      | Test                                      |
|------------------|------------------------------------------------|-------------------------------------------|
| Database leak     | Alpha Pattern: Random IV per encrypt           | Same J = different ciphertext             |
| Password leak     | Zero-knowledge: Key in Secure Enclave          | No plaintext in storage                   |
| Phone lost        | Shamir 3-of-5: Recover with paper + cloud + brother | 3 shares unlock                    |
| Brute force       | 6 hour lockout after 5 tries                   | Rate limit triggers                       |
| IV reuse bug      | IV stored with ciphertext, extracted correctly | Decrypted key matches                     |

---

## How It's Better Than v1.0 Dec 2025

| Dec 2025 - Failed            | v6.4.1 - Alpha Pattern                |
|-----------------------------|--------------------------------------|
| Caesar cipher + Base64      | AES-256-GCM with Alpha Pattern       |
| Password in localStorage    | Zero-knowledge via WebAuthn          |
| No backup                   | Shamir 3-of-5 mathematically secure  |
| No rate limit               | 6 hour lockout                       |
| Static IV = broken          | Random IV = IND-CPA secure           |

**Lesson:** Security comes from math, not hiding. One line - static IV - destroys AES-GCM. Fixed in v6.4.1 using standard crypto.

---

## Roadmap v6.5

**Device Binding 2FA:** New phone login requires email code. Password leak alone won't compromise accounts. Like Facebook, Google, GTBank.

---

## Run The Audit Yourself

```js
// Paste in browser console
auditSecureVault()

// Output:
// [+] PASS: Alpha Pattern: Same J = different ciphertext
// [+] PASS: Zero-knowledge: No plaintext in storage  
// [+] PASS: Shamir 3-of-5: 2 shares fail, 3 shares work
// [7/9] SECURITY CHECKS PASSED
```

---

## License

MIT - Use it, learn from it, build better.

---

## Contact

Emmanuel Oifoghe  
Agbarho, Delta State, Nigeria  
GitHub: Oifoghe-Emmanuel  

**Sponsor:** https://paystack.shop/pay/h9wvwzrcg3

---

_Alpha Pattern™ - A name I created for teaching AES-GCM random IVs. Invented 2026._
