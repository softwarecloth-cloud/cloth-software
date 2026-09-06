import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import protect from "../middleware/auth.js";

const router = Router();

// Tighter limit on the credential endpoints to slow down brute-force / spam.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

export default router;
