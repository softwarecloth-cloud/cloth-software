"use client";

import { money } from "@/app/shared/format";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 dark:border-neutral-800 dark:bg-neutral-900 " +
        className
      }
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "default" }) {
  const toneClass =
    tone === "positive"
      ? "text-green-600 dark:text-green-400"
      : tone === "negative"
        ? "text-red-600 dark:text-red-400"
        : "text-neutral-900 dark:text-neutral-100";
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className={`mt-1.5 text-xl font-semibold sm:text-2xl ${toneClass}`}>
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
      ) : null}
    </Card>
  );
}

export function Money({ value, className = "" }) {
  return <span className={className}>{money(value)}</span>;
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
      {children}
    </div>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-2 py-10 text-sm text-neutral-500 dark:text-neutral-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700 dark:border-neutral-700 dark:border-t-neutral-300" />
      {label}
    </div>
  );
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
      {children}
    </div>
  );
}

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    success: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
