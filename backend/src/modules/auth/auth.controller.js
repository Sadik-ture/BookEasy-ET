import bcrypt from "bcryptjs";
import User from "../users/user.model.js";
import Membership from "../memberships/membership.model.js";
import { permissionsFor } from "../memberships/permissions.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { signToken, setAuthCookie, clearAuthCookie, ensureCsrfCookie } from "../../utils/token.js";
import { makeSecretToken, hashToken } from "../../utils/tokens.js";
import { sendMail } from "../../utils/mailer.js";
import { fail } from "../../utils/http.js";

const publicUser = (u) => ({
  id: u._id,
  fullName: u.fullName,
  email: u.email,
  phone: u.phone || "",
  role: u.role,
});

async function sessionFor(user) {
  const rows = await Membership.find({ userId: user._id, status: "active" }).populate(
    "businessId",
    "name slug category status"
  );
  const memberships = rows
    .filter((m) => m.businessId)
    .map((m) => ({
      id: m._id,
      role: m.role,
      permissions: permissionsFor(m),
      business: {
        id: m.businessId._id,
        name: m.businessId.name,
        slug: m.businessId.slug,
        category: m.businessId.category,
        status: m.businessId.status,
      },
    }));
  return { user: publicUser(user), memberships };
}

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
  ensureCsrfCookie(req, res);
  const data = await sessionFor(user);
  res.status(201).json({ success: true, data });
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
  ensureCsrfCookie(req, res);
  const data = await sessionFor(user);
  res.json({ success: true, data });
});

export const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, data: { message: "Signed out" } });
};

export const me = asyncHandler(async (req, res) => {
  ensureCsrfCookie(req, res);
  const data = await sessionFor(req.user);
  res.json({ success: true, data });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  req.user.fullName = fullName;
  req.user.phone = phone || "";
  await req.user.save();
  const data = await sessionFor(req.user);
  res.json({ success: true, data });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+passwordHash");
  const ok = user && (await bcrypt.compare(req.body.currentPassword, user.passwordHash));
  if (!ok) return fail(res, 401, "INVALID_CREDENTIALS", "Current password is incorrect.", { currentPassword: "Current password is incorrect." });
  user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({ success: true, data: { message: "Password updated" } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+resetTokenHash +resetTokenExpires");
  if (user && user.status === "active") {
    const { raw, hash } = makeSecretToken();
    user.resetTokenHash = hash;
    user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    const link = `${process.env.APP_URL || "http://localhost:5173"}/reset-password?token=${raw}`;
    await sendMail({
      to: user.email,
      subject: "Reset your BookEasy ET password",
      text: `Use this link within 30 minutes to choose a new password:\n${link}\n\nIf you did not ask for this, you can ignore the email.`,
    });
  }
  res.json({
    success: true,
    data: { message: "If an account exists for that email, a reset link is on its way." },
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    resetTokenHash: hashToken(req.body.token),
    resetTokenExpires: { $gt: new Date() },
  }).select("+passwordHash +resetTokenHash +resetTokenExpires");
  if (!user) return fail(res, 400, "INVALID_TOKEN", "This reset link is invalid or has expired.");
  user.passwordHash = await bcrypt.hash(req.body.password, 12);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({ success: true, data: { message: "Password updated. You can sign in now." } });
});