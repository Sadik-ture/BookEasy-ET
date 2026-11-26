import crypto from "node:crypto";

export function makeSecretToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export function hashToken(raw) {
  return crypto.createHash("sha256").update(String(raw)).digest("hex");
}
