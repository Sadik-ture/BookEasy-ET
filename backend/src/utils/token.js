import crypto from "node:crypto";
import jwt from "jsonwebtoken";

export const COOKIE_NAME = "bookeasy_token";
export const CSRF_COOKIE = "bookeasy_csrf";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: SEVEN_DAYS });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.clearCookie(CSRF_COOKIE, { ...cookieOptions(), httpOnly: false });
}

export function ensureCsrfCookie(req, res) {
  if (req.cookies?.[CSRF_COOKIE]) return req.cookies[CSRF_COOKIE];
  const token = crypto.randomBytes(24).toString("hex");
  res.cookie(CSRF_COOKIE, token, { ...cookieOptions(), httpOnly: false, maxAge: SEVEN_DAYS });
  return token;
}