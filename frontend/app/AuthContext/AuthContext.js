"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/app/api/api";

/**
 * Auth state for the whole app.
 *
 * The JWT is kept ONLY in an httpOnly cookie set by the backend — it is never
 * returned in a response body, never read by JS, never put in localStorage.
 * This context tracks just the non-sensitive `user` object; the browser sends
 * the cookie automatically on every `credentials: "include"` request.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on first load (and after a refresh) by asking the
  // backend who the cookie belongs to.
  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ---- helpers -------------------------------------------------------------
  const run = async (fn) => {
    try {
      const res = await fn();
      return { success: true, ...(res.data || {}) };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Something went wrong",
      };
    }
  };

  // ---- actions ------------------------------------------------------------
  const signup = async ({ name, email, password, number, gender }) => {
    const result = await run(() =>
      api.post("/auth/register", { name, email, password, number, gender })
    );
    if (result.success && result.user) setUser(result.user);
    return result;
  };

  const login = async ({ email, password }) => {
    const result = await run(() =>
      api.post("/auth/login", { email, password })
    );
    if (result.success && result.user) setUser(result.user);
    return result;
  };

  const forgotPassword = async ({ email }) =>
    run(() => api.post("/auth/forgot-password", { email }));

  const resetPassword = async ({ token, password }) => {
    const result = await run(() =>
      api.post("/auth/reset-password", { token, password })
    );
    if (result.success && result.user) setUser(result.user);
    return result;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // backend clears the cookie
    } finally {
      setUser(null); // clear client state no matter what
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signup,
        login,
        logout,
        forgotPassword,
        resetPassword,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
