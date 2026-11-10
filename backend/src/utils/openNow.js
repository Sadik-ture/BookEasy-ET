const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const toMinutes = (s) => {
  const [h, m] = String(s).split(":").map(Number);
  return h * 60 + (m || 0);
};

// Returns true / false, or null when opening hours are unknown
export function isOpenNow(hours = [], timezone = "Africa/Addis_Ababa", now = new Date()) {
  if (!hours.length) return null;

  let parts;
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
  } catch {
    return null;
  }

  const get = (type) => parts.find((p) => p.type === type)?.value;
  const day = DAYS[get("weekday")];
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));

  const today = hours.find((h) => h.day === day);
  if (today && !today.closed) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (close > open) {
      if (minutes >= open && minutes < close) return true;
    } else if (minutes >= open) {
      return true; // closes after midnight
    }
  }

  // Hours that run past midnight from yesterday
  const yesterday = hours.find((h) => h.day === (day + 6) % 7);
  if (yesterday && !yesterday.closed) {
    const open = toMinutes(yesterday.open);
    const close = toMinutes(yesterday.close);
    if (close <= open && minutes < close) return true;
  }

  return false;
}