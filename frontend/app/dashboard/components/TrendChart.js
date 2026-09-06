"use client";

import { money } from "@/app/shared/format";

/**
 * Small dependency-free bar chart for the period breakdown.
 * data: [{ key, revenue, profit }]
 */
export default function TrendChart({ data = [] }) {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        No sales in this period yet.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const shortKey = (k) => {
    // "2026-09-01" -> "1", "2026-09" -> "Sep"
    const parts = k.split("-");
    if (parts.length === 3) return String(Number(parts[2]));
    const m = Number(parts[1]);
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1] || k;
  };

  return (
    <div className="overflow-x-auto">
      <div
        className="flex min-w-full items-end gap-1.5"
        style={{ height: 160 }}
      >
        {data.map((d) => (
          <div
            key={d.key}
            className="group flex min-w-[14px] flex-1 flex-col items-center justify-end gap-1"
            title={`${d.key} · ${money(d.revenue)} sales · ${money(d.profit)} profit`}
          >
            <div className="relative flex w-full flex-col justify-end" style={{ height: 130 }}>
              <div
                className="w-full rounded-t bg-neutral-300 transition group-hover:bg-neutral-400 dark:bg-neutral-700 dark:group-hover:bg-neutral-600"
                style={{ height: `${(d.revenue / max) * 100}%` }}
              />
              <div
                className="absolute bottom-0 w-full rounded-t bg-neutral-900 dark:bg-white"
                style={{ height: `${(Math.max(d.profit, 0) / max) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-400">{shortKey(d.key)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-neutral-300 dark:bg-neutral-700" />
          Sales
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-neutral-900 dark:bg-white" />
          Profit
        </span>
      </div>
    </div>
  );
}
