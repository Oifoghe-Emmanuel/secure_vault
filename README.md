# SecureVault v6.4

> I started Dec 2025 with a black box. Thought security through obscurity would work. It didn't.  
>
> By Apr 2026 I learned: you don't build crypto. You compose trusted primitives people already audited.  
>
> This is what I built after that.

---

## What is this?

SecureVault is **NOT** a new cryptography system.  
I'm 19 from Delta State, Nigeria. I'm not reinventing AES.

This is a **software engineering project**.

I wanted to learn how real apps combine:
- login/signup  
- AES-GCM encryption  
- Shamir 3-of-5 recovery when you lose your password  
- rate limiting so bots don't kill you  
- storing stuff safely on the client  

I started with a black box. Learned that obscurity fails. So I rebuilt it using WebCrypto, PBKDF2, and Shamir — stuff security people actually trust.

The hard part was making them work together without creating new holes.

---

## What's inside v6.4

### Security primitives I wired up:
- **AES-GCM** via WebCrypto API for encryption  
- **PBKDF2 with 600k iterations** to turn passwords into keys  
- **SHA-256** to hash identity = email + username  

### Auth flow I built:
- Signup / login  
- Password verification  
- Identity hashing so I'm not storing raw emails  

### Recovery if you get locked out:
- **3-of-5 Shamir Secret Sharing**  
- Lose 2 shares? You still recover with 3  

### Abuse controls:
- Rate limiting  
- 6-hour lockout after too many failed attempts  
- Client-side storage only. No secrets hit my server  

### Experimental:
- WebAuthn / FaceID fallback (still testing)

---

## How to use it

```javascript
// Create account
SecureVault.signup(email, username, password)

// Login
SecureVault.login(email, username, password, userObject)

// Encrypt a secret
SecureVault.createPairUniversal(secret, config)

// Recover with shares
SecureVault.unlockPairUniversal(shares, expectedHash)

// Send share to your server safely
SecureVault.encryptShareForServer(share)
SecureVault.decryptShareFromServer(encrypted, key, iv)
```

---

## Be very clear:

### This is:
✅ A project I built Dec 2025 - Apr 2026 to learn systems design  
✅ Code you can read to understand how I think  
✅ Something I'm still improving  

### This is NOT:
❌ Ready for your bank or production  
❌ New cryptography research  
❌ "Unhackable" — nothing is  

---

## What building this taught me

1. *I started with obscurity. That was wrong.*  
   Security through obscurity fails. Use transparent, audited primitives.

2. *Security is composition, not invention.*  
   You use existing blocks like AES-GCM. The skill is fitting them together safely.

3. *Bugs live in architecture.*  
   The AES algorithm is fine. Your session handling will kill you.

4. *Every system has assumptions.*  
   Mine assumes your browser isn't compromised. If it is, game over.

5. *I'm a software engineer, not a cryptographer.*  
   My job is managing complexity, not inventing new math.

---

## Why I'm sharing this

I missed Dartmouth College 2025.  
I want to study CS at Dartmouth in 2026:

> *"to advance myself, become a better problem solver, get real hands-on experience, learn a lot, and invent things that matter."*

Until then, I'm building in public from Delta State, Nigeria.

If this code or my journey helps you, sponsor me to stay in school.

👉 **Sponsor me:** https://paystack.shop/pay/h9wvwzrcg3

Every sponsor gets:
1. Name in `CONTRIBUTORS.md` as a thank you  

---

## Author

**Emmanuel O.**  
Delta State, Nigeria  
Started with a black box Dec 2025. Rebuilt it right by Apr 2026.  

Missed Dartmouth once. Not missing my shot at CS.

- GitHub: https://github.com/Oifoghe-Emmanuel/secure_vault  
- Twitter/X: [@OifogheEmmanuel]  

---
