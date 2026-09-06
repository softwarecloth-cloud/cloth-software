// Turns a { period, date, from, to } query into a concrete [start, end) window.
//
//   period = "day"   -> that calendar day
//   period = "month" -> that calendar month
//   period = "year"  -> that calendar year
//   period = "all"   -> no bounds
//   from/to          -> explicit override (inclusive from, exclusive to+1day)
//
// Dates are interpreted in the server's local timezone, which for a single
// shop is what the owner expects.
export function resolveRange({ period = "month", date, from, to } = {}) {
  if (from || to) {
    const start = from ? new Date(from) : new Date(0);
    const end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end, period: "custom" };
  }

  const ref = date ? new Date(date) : new Date();
  if (Number.isNaN(ref.getTime())) {
    return resolveRange({ period });
  }

  if (period === "all") {
    return { start: new Date(0), end: new Date(8640000000000000), period };
  }

  const start = new Date(ref);
  const end = new Date(ref);

  if (period === "day") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (period === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);
  } else {
    // month (default)
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end, period };
}
