// CryptoJS v3.1.2
// code.google.com/p/crypto-js
// (c) 2009-2013 by Jeff Mott. All rights reserved.
// code.google.com/p/crypto-js/wiki/License

// Initialization round constants tables
const K: number[] = [];

// Compute constants
(() => {
  function isPrime(n: number): boolean {
    const sqrtN = Math.sqrt(n);
    for (let factor = 2; factor <= sqrtN; factor++) {
      if (!(n % factor)) return false;
    }
    return true;
  }

  function getFractionalBits(n: number): number {
    return ((n - (n | 0)) * 0x100000000) | 0;
  }

  let n = 2;
  let nPrime = 0;
  while (nPrime < 64) {
    if (isPrime(n)) {
      K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));
      nPrime++;
    }
    n++;
  }
})();

function bytesToWords(bytes: number[]): number[] {
  const words: number[] = [];
  for (let i = 0, b = 0; i < bytes.length; i++, b += 8) {
    words[b >>> 5] |= bytes[i] << (24 - b % 32);
  }
  return words;
}

function wordsToBytes(words: number[]): number[] {
  const bytes: number[] = [];
  for (let b = 0; b < words.length * 32; b += 8) {
    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xff);
  }
  return bytes;
}

// Reusable object
const W: number[] = [];

function processBlock(H: number[], M: number[], offset: number): void {
  // Working variables
  let a = H[0];
  let b = H[1];
  let c = H[2];
  let d = H[3];
  let e = H[4];
  let f = H[5];
  let g = H[6];
  let h = H[7];

  // Computation
  for (let i = 0; i < 64; i++) {
    if (i < 16) {
      W[i] = M[offset + i] | 0;
    } else {
      const gamma0x = W[i - 15];
      const gamma0 =
        ((gamma0x << 25) | (gamma0x >>> 7)) ^
        ((gamma0x << 14) | (gamma0x >>> 18)) ^
        (gamma0x >>> 3);

      const gamma1x = W[i - 2];
      const gamma1 =
        ((gamma1x << 15) | (gamma1x >>> 17)) ^
        ((gamma1x << 13) | (gamma1x >>> 19)) ^
        (gamma1x >>> 10);

      W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
    }

    const ch = (e & f) ^ (~e & g);
    const maj = (a & b) ^ (a & c) ^ (b & c);

    const sigma0 =
      ((a << 30) | (a >>> 2)) ^
      ((a << 19) | (a >>> 13)) ^
      ((a << 10) | (a >>> 22));
    const sigma1 =
      ((e << 26) | (e >>> 6)) ^
      ((e << 21) | (e >>> 11)) ^
      ((e << 7) | (e >>> 25));

    const t1 = h + sigma1 + ch + K[i] + W[i];
    const t2 = sigma0 + maj;

    h = g;
    g = f;
    f = e;
    e = (d + t1) | 0;
    d = c;
    c = b;
    b = a;
    a = (t1 + t2) | 0;
  }

  // Intermediate hash value
  H[0] = (H[0] + a) | 0;
  H[1] = (H[1] + b) | 0;
  H[2] = (H[2] + c) | 0;
  H[3] = (H[3] + d) | 0;
  H[4] = (H[4] + e) | 0;
  H[5] = (H[5] + f) | 0;
  H[6] = (H[6] + g) | 0;
  H[7] = (H[7] + h) | 0;
}

interface Sha256Options {
  asBytes?: boolean;
  asString?: boolean;
}

export default function sha256(message: string | number[], options?: Sha256Options): string | number[] {
  if (typeof message === 'string') {
    message = convertString.UTF8.stringToBytes(message);
  }

  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

  const m = bytesToWords(message as number[]);
  const l = message.length * 8;

  m[l >> 5] |= 0x80 << (24 - l % 32);
  m[((l + 64 >> 9) << 4) + 15] = l;

  for (let i = 0; i < m.length; i += 16) {
    processBlock(H, m, i);
  }

  const digestbytes = wordsToBytes(H);
  if (options && options.asBytes) {
    return digestbytes;
  } else if (options && options.asString) {
    return convertString.bytesToString(digestbytes);
  } else {
    return bytesToHex(digestbytes);
  }
}

function bytesToHex(bytes: number[]): string {
  const hexArray = [];
  for (const byte of bytes) {
    hexArray.push((byte >>> 4).toString(16));
    hexArray.push((byte & 0xf).toString(16));
  }
  return hexArray.join('');
}

namespace convertString {
  export namespace UTF8 {
    export function stringToBytes(str: string): number[] {
      const bytes = [];
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code <= 0x7f) {
          bytes.push(code);
        } else if (code <= 0x7ff) {
          bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        } else if (code <= 0xffff) {
          bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        } else {
          bytes.push(
            0xf0 | (code >> 18),
            0x80 | ((code >> 12) & 0x3f),
            0x80 | ((code >> 6) & 0x3f),
            0x80 | (code & 0x3f)
          );
        }
      }
      return bytes;
    }
  }

  export function bytesToString(bytes: number[]): string {
    let str = '';
    for (const byte of bytes) {
      str += String.fromCharCode(byte);
    }
    return str;
  }
}

sha256.x2 = function (message: string | number[], options?: Sha256Options): string | number[] {
  return sha256(sha256(message, { asBytes: true }), options);
};

