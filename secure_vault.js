// === SECURE-VAULT.JS V6.4 - GENERAL API SDK ===
// Zero dependencies. Works on any website. 6 hour lockout.
// Secure Enclave + 3-of-5 Shamir + Rate Limit

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SecureVault = factory(); // CHANGED FROM ZK
  }
}(typeof self!== 'undefined'? self : this, function () {

  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const H = b => [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
  const B = h => new Uint8Array(h.match(/.{1,2}/g).map(b=>parseInt(b,16)));

  function concatUint8(...arrays) {
    let totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
    let result = new Uint8Array(totalLength);
    let offset = 0;
    for (let arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }

  function hexToDigits(hex) {
    let result = '0';
    for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.substr(i, 2), 16);
      result = (BigInt(result) * 256n + BigInt(byte)).toString();
    }
    return result;
  }

  function digitsToHex(digits) {
    let num = BigInt(digits);
    if (num === 0n) return '00';
    let hex = '';
    while (num > 0n) {
      const byte = Number(num % 256n);
      hex = byte.toString(16).padStart(2, '0') + hex;
      num = num / 256n;
    }
    return hex.length % 2? '0' + hex : hex;
  }

  async function hashIdentity(str) {
    const data = new TextEncoder().encode(str.toLowerCase().trim());
    const hash = await crypto.subtle.digest("SHA-256", data);
    return H(hash).slice(0, 32);
  }

  let StorageAdapter = {
    get: async (key) => localStorage.getItem(key),
    set: async (key, val) => localStorage.setItem(key, val),
    remove: async (key) => localStorage.removeItem(key)
  };

  function setStorage(adapter) {
    StorageAdapter = adapter;
  }

  const RateLimit = {
    maxAttempts: 5,
    lockoutMs: 6 * 60 * 60 * 1000,

    async check(key) {
      const raw = await StorageAdapter.get(`sv_rl_${key}`); // CHANGED zk_ to sv_
      const data = raw? JSON.parse(raw) : { c: 0, t: 0 };
      const now = Date.now();

      if (data.t > now) {
        const diff = data.t - now;
        let hours = Math.floor(diff / 3600000);
        let mins = Math.ceil((diff % 3600000) / 60000);
        if (mins === 60) { hours += 1; mins = 0; }
        throw new Error(`Too many attempts. Try again in ${hours}h ${mins}m`);
      }

      if (now - data.t > 900000) data.c = 0;
      return data;
    },

    async recordFail(key) {
      const data = await this.check(key);
      data.c++;
      data.t = Date.now();
      if (data.c >= this.maxAttempts) {
        data.t = Date.now() + this.lockoutMs;
      }
      await StorageAdapter.set(`sv_rl_${key}`, JSON.stringify(data));
    },

    async recordSuccess(key) {
      await StorageAdapter.remove(`sv_rl_${key}`);
    },

    setConfig(maxAttempts, lockoutHours) {
      this.maxAttempts = maxAttempts;
      this.lockoutMs = lockoutHours * 60 * 60 * 1000;
    }
  };

  const SecureStore = {
    async isAvailable() {
      if (window.PublicKeyCredential) {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return false;
    },

    async saveMasterKey(userId, masterKey) {
      try {
        if (!await this.isAvailable()) throw new Error("No enclave");
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const cred = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "SecureVault", id: window.location.hostname },
            user: { id: B(await hashIdentity(userId)), name: userId, displayName: userId },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
            extensions: { prf: { eval: { first: B(masterKey) } } }
          }
        });
        await StorageAdapter.set(`sv_cred_${userId}`, H(cred.rawId));
        return { success: true, secure: true };
      } catch (e) {
        const enc = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(12)) },
          await crypto.subtle.importKey("raw", B(await hashIdentity(userId + "fallback")), "AES-GCM", false, ["encrypt"]),
          new TextEncoder().encode(masterKey)
        );
        await StorageAdapter.set(`sv_fallback_${userId}`, H(enc));
        return { success: true, secure: false };
      }
    },

    async getMasterKey(userId) {
      try {
        const credId = await StorageAdapter.get(`sv_cred_${userId}`);
        if (credId && await this.isAvailable()) {
          const challenge = crypto.getRandomValues(new Uint8Array(32));
          const assertion = await navigator.credentials.get({
            publicKey: {
              challenge,
              allowCredentials: [{ type: "public-key", id: B(credId) }],
              userVerification: "required",
              extensions: { prf: { eval: { first: new Uint8Array(32) } } }
            }
          });
          const prf = assertion.getClientExtensionResults().prf.results.first;
          return { success: true, masterKey: H(new Uint8Array(prf)), secure: true };
        }
        const enc = await StorageAdapter.get(`sv_fallback_${userId}`);
        if (enc) {
          const dec = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(12) },
            await crypto.subtle.importKey("raw", B(await hashIdentity(userId + "fallback")), "AES-GCM", false, ["decrypt"]),
            B(enc)
          );
          return { success: true, masterKey: new TextDecoder().decode(dec), secure: false };
        }
        throw new Error("No key found");
      } catch (e) { return { success: false, error: e.message }; }
    }
  };

  const PRIME = 2n ** 127n - 1n;

  function _randomBigInt() {
    const arr = crypto.getRandomValues(new Uint8Array(16));
    let hex = '0x';
    for (let i = 0; i < arr.length; i++) hex += arr[i].toString(16).padStart(2, '0');
    return BigInt(hex) % PRIME;
  }

  function _split(secretBytes, total, threshold) {
    const secret = BigInt('0x' + H(secretBytes));
    if (secret >= PRIME) throw new Error("Secret too large");
    const coeffs = [secret];
    for (let i = 1; i < threshold; i++) coeffs.push(_randomBigInt());

    const shares = [];
    for (let x = 1; x <= total; x++) {
      let y = 0n;
      for (let i = coeffs.length - 1; i >= 0; i--) {
        y = (y * BigInt(x) + coeffs[i]) % PRIME;
      }
      shares.push({ x, y: y.toString(16) });
    }
    return shares;
  }

  function _combine(shares) {
    let secret = 0n;
    for (let i = 0; i < shares.length; i++) {
      let num = 1n, den = 1n;
      for (let j = 0; j < shares.length; j++) {
        if (i === j) continue;
        num = (num * -BigInt(shares[j].x)) % PRIME;
        den = (den * (BigInt(shares[i].x) - BigInt(shares[j].x))) % PRIME;
      }
      let inv = 1n, base = den, exp = PRIME - 2n;
      while (exp > 0n) {
        if (exp % 2n === 1n) inv = (inv * base) % PRIME;
        base = (base * base) % PRIME;
        exp = exp / 2n;
      }
      const term = (BigInt('0x' + shares[i].y) * num * inv) % PRIME;
      secret = (secret + term + PRIME) % PRIME;
    }
    let hex = secret.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    return B(hex);
  }

  async function signup(email, username, password) {
    try {
      const emailHash = await hashIdentity(email);
      const usernameHash = await hashIdentity(username);
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const mat = new TextEncoder().encode(password + emailHash + usernameHash);
      const base = await crypto.subtle.importKey("raw", mat, "PBKDF2", false, ["deriveBits"]);
      const mk = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" }, base, 256);
      const ver = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        await crypto.subtle.importKey("raw", new Uint8Array(mk), "PBKDF2", false, ["deriveBits"]), 256
      );
      return { success: true, user: { emailHash, usernameHash, salt: H(salt), verifier: H(ver) }, masterKey: H(mk) };
    } catch (e) { return { success: false, error: `Signup: ${e.message}` }; }
  }

  async function login(email, username, password, u) {
    const rlKey = `login_${u.emailHash}`;
    try {
      await RateLimit.check(rlKey);
      const emailHash = await hashIdentity(email);
      const usernameHash = await hashIdentity(username);
      if (emailHash!== u.emailHash || usernameHash!== u.usernameHash) throw new Error("User not found");
      const salt = B(u.salt);
      const mat = new TextEncoder().encode(password + emailHash + usernameHash);
      const base = await crypto.subtle.importKey("raw", mat, "PBKDF2", false, ["deriveBits"]);
      const mk = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" }, base, 256);
      const ver = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        await crypto.subtle.importKey("raw", new Uint8Array(mk), "PBKDF2", false, ["deriveBits"]), 256
      );
      if (H(ver)!== u.verifier) throw new Error("Wrong password");

      await SecureStore.saveMasterKey(username, H(mk));
      await RateLimit.recordSuccess(rlKey);
      return { success: true, masterKey: H(mk) };
    } catch (e) {
      await RateLimit.recordFail(rlKey);
      return { success: false, error: `Login: ${e.message}` };
    }
  }

  async function createPairUniversal(secret, config = {}) {
    try {
      const total = config.totalShares || 5;
      const threshold = config.threshold || 3;
      const labels = config.labels || ["share1","share2","share3","share4","share5"];
      if (total < threshold) throw new Error("totalShares must be >= threshold");
      if (total > 255) throw new Error("Max 255 shares");
      if (threshold < 2) throw new Error("Min threshold is 2");

      const secretBytes = new TextEncoder().encode(secret);
      const secretHash = H(await crypto.subtle.digest("SHA-256", secretBytes));
      const shares = _split(secretBytes, total, threshold);

      const result = {
        success: true,
        threshold,
        totalShares: total,
        secretHash,
        shares: {},
        instructions: `Store each share separately. Need ANY ${threshold} to unlock.`
      };
      labels.forEach((label, i) => {
        if (shares[i]) result.shares[label] = `${shares[i].x}-${shares[i].y}`;
      });
      return result;
    } catch (e) { return { success: false, error: `CreatePair: ${e.message}` }; }
  }

  async function unlockPairUniversal(providedShares, expectedHash, pairId = "default") {
    const rlKey = `unlock_${pairId}`;
    try {
      await RateLimit.check(rlKey);
      if (!Array.isArray(providedShares) || providedShares.length < 2) throw new Error("Provide array of 2+ shares");
      if (!expectedHash) throw new Error("expectedHash required for integrity check");

      const shares = providedShares.map(s => {
        const [x, y] = s.split('-');
        return { x: parseInt(x), y };
      });

      const secretBytes = _combine(shares);
      const hash = H(await crypto.subtle.digest("SHA-256", secretBytes));

      if (hash!== expectedHash) {
        throw new Error("Invalid shares or insufficient shares");
      }
      await RateLimit.recordSuccess(rlKey);
      const secret = new TextDecoder().decode(secretBytes);
      return { success: true, secret };
    } catch (e) {
      await RateLimit.recordFail(rlKey);
      return { success: false, error: e.message };
    }
  }

  async function encryptShareForServer(share) {
    const key = await crypto.subtle.generateKey({name:"AES-GCM",length:256}, true, ["encrypt","decrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({name:"AES-GCM",iv}, key, new TextEncoder().encode(share));
    const rawKey = await crypto.subtle.exportKey("raw", key);
    return {
      encryptedShare: H(new Uint8Array(encrypted)),
      serverKey: H(new Uint8Array(rawKey)),
      iv: H(iv)
    };
  }

  async function decryptShareFromServer(encryptedHex, keyHex, ivHex) {
    const key = await crypto.subtle.importKey("raw", B(keyHex), "AES-GCM", false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({name:"AES-GCM",iv:B(ivHex)}, key, B(encryptedHex));
    return new TextDecoder().decode(decrypted);
  }

  return {
    signup,
    login,
    createPairUniversal,
    unlockPairUniversal,
    encryptShareForServer,
    decryptShareFromServer,
    getMasterKey: SecureStore.getMasterKey,
    setStorage,
    setRateLimit: (maxAttempts, lockoutHours) => RateLimit.setConfig(maxAttempts, lockoutHours),
    version: "6.4.0"
  };
}));

// === TEST SUITE ===
async function testSecureVault() {
  console.log("=== SECURE-VAULT V6.4 TESTS ===");
  localStorage.clear();
  const testId = `test_${Date.now()}`;

  console.log("\n--- CASE 1: SIGNUP + LOGIN ---");
  const alice = await SecureVault.signup("alice@test.com", "alice", "pass123");
  const loginRes = await SecureVault.login("alice@test.com", "alice", "pass123", alice.user);
  console.log("LOGIN:", loginRes.success? "✅ PASS" : "❌ FAIL");

  console.log("\n--- CASE 2: CREATE 3-OF-5 PAIR ---");
  const pair = await SecureVault.createPairUniversal("GTBank PIN: 4928", {
    totalShares: 5,
    threshold: 3,
    labels: ["alice","bob","paper","server","lawyer"]
  });
  console.log("CREATE:", pair.success? "✅ PASS" : "❌ FAIL");

  console.log("\n--- CASE 3: UNLOCK WITH ANY 3 ---");
  const unlock1 = await SecureVault.unlockPairUniversal(
    [pair.shares.alice, pair.shares.bob, pair.shares.paper],
    pair.secretHash,
    testId
  );
  console.log("UNLOCK 3:", unlock1.secret === "GTBank PIN: 4928"? "✅ PASS" : "❌ FAIL");

  console.log("\n--- CASE 4: RATE LIMIT TEST ---");
  const rlTestId = `rl_test_${Date.now()}`;
  for(let i=0; i<5; i++) {
    await SecureVault.unlockPairUniversal([pair.shares.alice], pair.secretHash, rlTestId);
  }
  const unlock6 = await SecureVault.unlockPairUniversal([pair.shares.alice], pair.secretHash, rlTestId);
  console.log("6 HOUR LOCK:", unlock6.error.includes("6h")? "✅ PASS" : "❌ FAIL");
  console.log("Message:", unlock6.error);

  console.log("\n=== ALL TESTS COMPLETE ===");
  console.log("PRINT THIS:", pair.shares.paper);
  console.log("SAVE HASH:", pair.secretHash);
}

testSecureVault();