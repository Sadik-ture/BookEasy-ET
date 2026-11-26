const pad = (n) => String(n).padStart(2, "0");

export const toMinutes = (s) => {
  const [h, m] = String(s).split(":").map(Number);
  return h * 60 + (m || 0);
};

export const fromMinutes = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

export function isRealDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10) === s;
}

// Inclusive YYYY-MM-DD range, used for staff time off.
export function isDateOff(timeOff = [], date) {
  return timeOff.some((t) => t.startDate && t.endDate && t.startDate <= date && date <= t.endDate);
}

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

// 0 = Sunday ... 6 = Saturday (a calendar date has the same weekday everywhere)
export function weekdayOf(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

// Today's date (YYYY-MM-DD) in a timezone
export function todayInZone(tz, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function offsetMs(date, tz) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const v = {};
  for (const p of parts) if (p.type !== "literal") v[p.type] = Number(p.value);
  const asUtc = Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute, v.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// Converts a local date + minutes-since-midnight in a timezone to a UTC Date
export function zonedToUtc(dateStr, minutes, tz) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const guess = Date.UTC(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60);
  let utc = guess - offsetMs(new Date(guess), tz);
  utc = guess - offsetMs(new Date(utc), tz);
  return new Date(utc);
}