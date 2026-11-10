import bcrypt from "bcryptjs";
import User from "../users/user.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { signToken, setAuthCookie, clearAuthCookie } from "../../utils/token.js";

const publicUser = (u) => ({
  id: u._id,
  fullName: u.fullName,
  email: u.email,
  phone: u.phone || "",
  role: u.role,
});

const emailTaken = (res) =>
  res.status(409).json({
    success: false,
    error: {
      code: "EMAIL_TAKEN",
      message: "Please review the submitted information.",
      fields: { email: "An account with this email already exists." },
    },
  });

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (await User.exists({ email })) return emailTaken(res);

  const passwordHash = await bcrypt.hash(password, 12);

  let user;
  try {
    user = await User.create({ fullName, email, phone, passwordHash });
  } catch (err) {
    if (err.code === 11000) return emailTaken(res); // duplicate email (race condition)
    throw err;
  }

  setAuthCookie(res, signToken(user._id));
  res.status(201).json({ success: true, data: { user: publicUser(user) } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+passwordHash");
  const ok = user && user.status === "active" && (await bcrypt.compare(password, user.passwordHash));

  if (!ok) {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
    });
  }

  setAuthCookie(res, signToken(user._id));
  res.json({ success: true, data: { user: publicUser(user) } });
});

export const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, data: { message: "Signed out" } });
};

export const me = (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
};