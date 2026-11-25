// Today's date as YYYY-MM-DD in a timezone
export function todayIn(tz) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

// 0 = Sunday ... 6 = Saturday
export function weekdayOf(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

// Next `count` days, starting today in the business timezone
export function buildDays(tz, count = 14) {
  const start = todayIn(tz);
  return Array.from({ length: count }, (_, i) => {
    const date = addDays(start, i);
    const [y, m, d] = date.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    const fmt = (o) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...o }).format(dt);
    return {
      date,
      weekday: fmt({ weekday: "short" }),
      day: d,
      month: fmt({ month: "short" }),
      isToday: i === 0,
    };
  });
}