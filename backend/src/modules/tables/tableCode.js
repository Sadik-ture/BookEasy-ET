import crypto from "node:crypto";

// Easy to read: no 0/O or 1/I. 32 symbols, so every random byte maps evenly.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// 14 characters is about 70 bits of randomness: impossible to guess
export function makeTableCode() {
  let s = "";
  for (const b of crypto.randomBytes(14)) s += ALPHABET[b % ALPHABET.length];
  return s;
}

export const TABLE_CODE_REGEX = /^[A-Za-z0-9]{10,40}$/;