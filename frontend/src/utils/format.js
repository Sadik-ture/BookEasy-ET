// 1200 -> "1.2k", 2100 -> "2.1k", 856 -> "856"
export function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}