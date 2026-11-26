export const WELCOME_CODE = "BOOK10";
export const WELCOME_PERCENT = 10;

// Returns the discounted total, or null when the code is not recognized.
export function discountForCode(code, subtotalMinor) {
  if (String(code || "").trim().toUpperCase() !== WELCOME_CODE) return null;
  const subtotal = Math.max(0, Math.floor(Number(subtotalMinor) || 0));
  const discountMinor = Math.floor((subtotal * WELCOME_PERCENT) / 100);
  return { code: WELCOME_CODE, discountMinor, totalMinor: subtotal - discountMinor };
}
