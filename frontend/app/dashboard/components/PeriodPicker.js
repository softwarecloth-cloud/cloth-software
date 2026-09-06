"use client";

/**
 * period = "day" | "month" | "year", date = yyyy-mm-dd anchor.
 * Renders the three period buttons plus a prev / label / next stepper.
 */
export default function PeriodPicker({ period, date, onChange }) {
  const anchor = new Date(date);

  const step = (dir) => {
    const d = new Date(anchor);
    if (period === "day") d.setDate(d.getDate() + dir);
    else if (period === "year") d.setFullYear(d.getFullYear() + dir);
    else d.setMonth(d.getMonth() + dir);
    const off = d.getTimezoneOffset();
    onChange({
      period,
      date: new Date(d.getTime() - off * 60000).toISOString().slice(0, 10),
    });
  };

  const label = (() => {
    if (period === "day")
      return anchor.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    if (period === "year") return String(anchor.getFullYear());
    return anchor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  })();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
        {["day", "month", "year"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange({ period: p, date })}
            className={
              "px-3 py-1.5 text-xs font-medium capitalize transition " +
              (period === p
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800")
            }
          >
            {p}
          </button>
        ))}
      </div>

      <div className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-1 dark:border-neutral-700 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => step(-1)}
          className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Previous period"
        >
          ‹
        </button>
        <span className="min-w-[8rem] text-center text-xs font-medium">{label}</span>
        <button
          type="button"
          onClick={() => step(1)}
          className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Next period"
        >
          ›
        </button>
      </div>
    </div>
  );
}
