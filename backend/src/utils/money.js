export function lineTotalMinor(priceMinor, quantity) {
  if (!Number.isInteger(priceMinor) || priceMinor < 0) {
    throw new Error("Price must be a non-negative integer in minor units");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer");
  }
  return priceMinor * quantity;
}

export function sumMinor(lines) {
  return lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);
}
