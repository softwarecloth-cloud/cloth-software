import crypto from "crypto";
import User from "../models/User.js";
import {
  signToken,
  sendTokenCookie,
  clearTokenCookie,
} from "../utils/token.js";

const isProd = process.env.NODE_ENV === "production";

// Issues a fresh JWT, drops it in the httpOnly cookie and returns the safe
// user shape. The token itself is deliberately NOT included in the JSON body.
const authResponse = (res, user, status, message) => {
  const token = signToken(user._id);
  sendTokenCookie(res, token);
  return res.status(status).json({
    success: true,
    message,
    user: user.toPublicJSON(),
  });
};

// ======================
// POST /auth/register
// ======================
export const register = async (req, res) => {
  try {
    const { name, email, password, number, gender } = req.body;

    if (!name || !email || !password || !number || !gender) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, number and gender are all required",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email is already registered" });
    }

    const user = await User.create({ name, email, password, number, gender });
    return authResponse(res, user, 201, "Account created successfully");
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0]?.message || "Invalid data";
      return res.status(400).json({ success: false, message });
    }
    console.error("register error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Could not create account" });
  }
};

// ======================
// POST /auth/login
// ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    // Same response whether the email is unknown or the password is wrong, so
    // the endpoint can't be used to enumerate registered emails.
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    return authResponse(res, user, 200, "Logged in successfully");
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ success: false, message: "Could not log in" });
  }
};

// ======================
// POST /auth/logout
// ======================
export const logout = (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({ success: true, message: "Logged out" });
};

// ======================
// GET /auth/me   (protected)
// ======================
export const getMe = (req, res) => {
  return res.status(200).json({ success: true, user: req.user.toPublicJSON() });
};

// ======================
// POST /auth/forgot-password
// ======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always answer the same way so this can't reveal which emails exist.
    const genericMessage =
      "If an account exists for that email, a password reset link has been sent.";

    if (!user) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // No mail service is wired up in this project. In development we return the
    // token so the flow is testable end to end; in production it would instead
    // be emailed and the response would carry nothing extra.
    const payload = { success: true, message: genericMessage };
    if (!isProd) {
      payload.resetToken = rawToken;
      payload.resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Could not process request" });
  }
};

// ======================
// POST /auth/reset-password
// ======================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Token and new password are required" });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Token is invalid or has expired" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return authResponse(res, user, 200, "Password updated successfully");
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0]?.message || "Invalid data";
      return res.status(400).json({ success: false, message });
    }
    console.error("resetPassword error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Could not reset password" });
  }
};
