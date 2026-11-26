import crypto from "node:crypto";
import { COOKIE_NAME, CSRF_COOKIE } from "../utils/token.js";
import { fail } from "../utils/http.js";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);
const EXEMPT = new Set([
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
]);

function matches(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

// Double-submit cookie. The session cookie is httpOnly; this one is readable by the app.
export function csrfProtection(req, res, next) {
  if (SAFE.has(req.method) || EXEMPT.has(req.path)) return next();
  if (!req.cookies?.[COOKIE_NAME]) return next();
  const header = req.get("x-csrf-token");
  const cookie = req.cookies?.[CSRF_COOKIE];
  if (!header || !cookie || !matches(header, cookie)) {
    return fail(res, 403, "CSRF", "The page needs a refresh before that action can be saved.");
  }
  next();
}
