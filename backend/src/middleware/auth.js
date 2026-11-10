import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import { COOKIE_NAME } from "../utils/token.js";

const unauthorized = (res) =>
  res.status(401).json({
    success: false,
    error: { code: "UNAUTHORIZED", message: "Please sign in to continue." },
  });

export async function requireAuth(req, res, next) {
  let user;
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return unauthorized(res);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    user = await User.findById(payload.sub);
  } catch {
    return unauthorized(res);
  }
  if (!user || user.status !== "active") return unauthorized(res);
  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not have permission to do this." },
      });
    }
    next();
  };
}