const KEY = "bookeasy_recent";
const MAX = 6;

export function readRecent() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function rememberBusiness(business) {
  if (!business?.slug) return;
  const next = [
    {
      id: business.id,
      name: business.name,
      slug: business.slug,
      category: business.category,
      coverImage: business.coverImage || "",
      ratingAvg: business.ratingAvg || 0,
      ratingCount: business.ratingCount || 0,
      address: business.address || {},
    },
    ...readRecent().filter((b) => b.slug !== business.slug),
  ].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function mapsLink(address) {
  const q = [address?.line, address?.street, address?.area, address?.city].filter(Boolean).join(", ");
  if (!q) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
