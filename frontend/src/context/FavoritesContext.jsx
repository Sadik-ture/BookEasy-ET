import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { fetchFavorites, removeFavorite, saveFavorite } from "../services/favoriteService";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ids, setIds] = useState(() => new Set());

  const reload = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      return;
    }
    try {
      const items = await fetchFavorites();
      setIds(new Set(items.map((b) => String(b.id))));
    } catch {
      /* keep the last known list */
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggle = useCallback(
    async (businessId) => {
      if (!user) {
        navigate("/login", { state: { from: location.pathname } });
        return false;
      }
      const id = String(businessId);
      const saved = ids.has(id);
      setIds((prev) => {
        const next = new Set(prev);
        if (saved) next.delete(id);
        else next.add(id);
        return next;
      });
      try {
        if (saved) await removeFavorite(id);
        else await saveFavorite(id);
        return !saved;
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          if (saved) next.add(id);
          else next.delete(id);
          return next;
        });
        return saved;
      }
    },
    [user, ids, navigate, location.pathname]
  );

  const value = useMemo(
    () => ({ ids, count: ids.size, has: (id) => ids.has(String(id)), toggle, reload }),
    [ids, toggle, reload]
  );
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
