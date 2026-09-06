import User from "../models/User.js";
import { verifyToken } from "../utils/token.js";

// Gate for routes that need a logged-in user. Reads the JWT from the httpOnly
// cookie (falls back to a Bearer header for non-browser clients / tooling),
// verifies it, and loads the current user onto req.user.
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired session" });
  }
};

export default protect;
