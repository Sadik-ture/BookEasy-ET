// 1200 -> "1.2k", 2100 -> "2.1k", 856 -> "856"
export function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

// 15000 -> "ETB 150"
export function formatPrice(minor, currency = "ETB") {
  const value = minor / 100;
  return `${currency} ${value.toLocaleString("en-US", {
    minimumFractionDigits: minor % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

// 90 -> "1 h 30 min"
export function formatDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// "13:30" -> "1:30 PM"
export function formatClock(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ap}`;
}

// ISO date -> "Thu, 12 Nov 2026 · 10:00 AM" in the given timezone
export function formatDateTime(iso, tz = "Africa/Addis_Ababa") {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return `${date} · ${time}`;
}