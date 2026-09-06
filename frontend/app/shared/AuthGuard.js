"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/AuthContext/AuthContext";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
      Loading…
    </div>
  );
}

/** Renders children only for signed-in users; otherwise bounces to login. */
export function RequireAuth({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/?from=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading || !isAuthenticated) return <FullScreenLoader />;
  return children;
}

/** Renders children only for signed-out users; signed-in users go to /dashboard. */
export function RedirectIfAuthed({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || isAuthenticated) return <FullScreenLoader />;
  return children;
}
