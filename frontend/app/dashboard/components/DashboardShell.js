"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/AuthContext/AuthContext";
import { SHOP } from "@/app/shared/shop";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "grid" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "box" },
  { href: "/dashboard/receipts", label: "Cloth received", icon: "truck" },
  { href: "/dashboard/billing", label: "New bill", icon: "receipt" },
  { href: "/dashboard/invoices", label: "Invoices", icon: "list" },
  { href: "/dashboard/expenses", label: "Expenses", icon: "wallet" },
];

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    box: "M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4M21 7v10l-9 4",
    truck: "M3 6h11v9H3zM14 9h4l3 3v3h-7zM7 18a2 2 0 100-4 2 2 0 000 4zM17 18a2 2 0 100-4 2 2 0 000 4z",
    receipt: "M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6M9 15h4",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    wallet: "M3 7a2 2 0 012-2h12a2 2 0 012 2M3 7v10a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 01-2-2zM16 12h.01",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}

function NavLinks({ pathname, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition " +
              (active
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800")
            }
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);

  const onLogout = async () => {
    await logout();
    router.replace("/");
  };

  const initials = (user?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6 dark:border-neutral-800 dark:bg-neutral-900/90">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 md:hidden dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Open menu"
          >
            <Icon name="list" />
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-base font-semibold tracking-tight"
          >
            <img
              src={SHOP.logo}
              alt=""
              className="h-7 w-7 rounded-full"
            />
            {SHOP.name}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-500 sm:block dark:text-neutral-400">
            {user?.name}
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-neutral-900 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900">
            {initials}
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-56 shrink-0 border-r border-neutral-200 p-4 md:block dark:border-neutral-800">
          <NavLinks pathname={pathname} />
        </aside>

        {/* Mobile drawer */}
        {drawer ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawer(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-xl dark:bg-neutral-900">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold">Menu</span>
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  className="rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              <NavLinks pathname={pathname} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        ) : null}

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
