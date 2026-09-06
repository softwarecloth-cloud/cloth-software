// Display helpers shared across the dashboard.

const PKR = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 0,
});

/** 27960 -> "Rs 27,960" */
export function money(n) {
  const value = Number(n) || 0;
  return `Rs ${PKR.format(Math.round(value))}`;
}

/** 27960 -> "27,960" */
export function num(n) {
  return PKR.format(Number(n) || 0);
}

/** ISO / Date -> "1 Sep 2026" */
export function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** ISO / Date -> "1 Sep 2026, 3:42 pm" */
export function fmtDateTime(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return `${fmtDate(date)}, ${date.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}

/** A yyyy-mm-dd string for <input type="date"> (local time). */
export function dateInputValue(d = new Date()) {
  const date = new Date(d);
  const off = date.getTimezoneOffset();
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 10);
}
