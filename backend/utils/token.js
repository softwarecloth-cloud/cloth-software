import jwt from "jsonwebtoken";

const isProd = process.env.NODE_ENV === "production";

// 7 days, kept in one place so the JWT lifetime and the cookie lifetime agree.
const TOKEN_TTL_DAYS = 7;
const TOKEN_TTL_MS = TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

export const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: `${TOKEN_TTL_DAYS}d`,
  });

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

// The cookie is the ONLY place the token lives. It is httpOnly (JS on the page
// can't read it, so XSS can't steal it), sameSite to blunt CSRF, and secure in
// production so it is never sent over plain HTTP.
export const sendTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: TOKEN_TTL_MS,
    path: "/",
  });
};

export const clearTokenCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
};
