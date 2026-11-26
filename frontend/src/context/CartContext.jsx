import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const KEY = "bookeasy_cart_v1";
const MAX_QTY = 20;
const EMPTY = { businessId: "", slug: "", businessName: "", lines: [] };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const c = raw ? JSON.parse(raw) : null;
    if (c && typeof c.businessId === "string" && Array.isArray(c.lines)) return c;
  } catch {
    /* storage unavailable or corrupted: start with an empty cart */
  }
  return EMPTY;
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(load);
  const cartRef = useRef(cart);
  cartRef.current = cart;

  // Keep the cart across page refreshes
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  // A cart belongs to ONE restaurant at a time
  const add = useCallback((business, item) => {
    const current = cartRef.current;
    if (current.businessId && current.businessId !== business.id && current.lines.length > 0) {
      const ok = window.confirm(
        `Your order has items from ${current.businessName}. Start a new order from ${business.name} instead?`
      );
      if (!ok) return;
    }
    setCart((prev) => {
      const base =
        prev.businessId === business.id
          ? prev
          : { businessId: business.id, slug: business.slug, businessName: business.name, lines: [] };
      const existing = base.lines.find((l) => l.id === item.id);
      const lines = existing
        ? base.lines.map((l) => (l.id === item.id ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + 1) } : l))
        : [...base.lines, { id: item.id, name: item.name, priceMinor: item.priceMinor, quantity: 1 }];
      return { ...base, lines };
    });
  }, []);

  // quantity 0 removes the line
  const setQty = useCallback((itemId, quantity) => {
    setCart((prev) => {
      const lines =
        quantity <= 0
          ? prev.lines.filter((l) => l.id !== itemId)
          : prev.lines.map((l) => (l.id === itemId ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l));
      return lines.length ? { ...prev, lines } : EMPTY;
    });
  }, []);

  const clear = useCallback(() => setCart(EMPTY), []);

  const fill = useCallback((business, items) => {
    const lines = items
      .filter((i) => i?.id && i.quantity > 0)
      .map((i) => ({ id: i.id, name: i.name, priceMinor: i.priceMinor, quantity: Math.min(MAX_QTY, i.quantity) }));
    if (!lines.length) return;
    setCart({ businessId: business.id, slug: business.slug, businessName: business.name, lines });
  }, []);

  // Sync saved lines with the current menu (removed items disappear, prices update)
  const reconcile = useCallback((businessId, menuItems) => {
    setCart((prev) => {
      if (prev.businessId !== businessId) return prev;
      const byId = new Map(menuItems.map((i) => [i.id, i]));
      const lines = prev.lines
        .filter((l) => byId.has(l.id))
        .map((l) => ({ ...l, name: byId.get(l.id).name, priceMinor: byId.get(l.id).priceMinor }));
      const changed =
        lines.length !== prev.lines.length ||
        lines.some((l, i) => l.priceMinor !== prev.lines[i].priceMinor || l.name !== prev.lines[i].name);
      if (!changed) return prev;
      return lines.length ? { ...prev, lines } : EMPTY;
    });
  }, []);

  const value = useMemo(() => ({ cart, add, setQty, clear, fill, reconcile }), [cart, add, setQty, clear, fill, reconcile]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}