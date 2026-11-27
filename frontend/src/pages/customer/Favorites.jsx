import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, TriangleAlert } from "lucide-react";
import BusinessCard from "../../components/marketplace/BusinessCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { fetchFavorites } from "../../services/favoriteService";
import { useFavorites } from "../../context/FavoritesContext";

export default function Favorites() {
  const { ids } = useFavorites();
  const [state, setState] = useState({ status: "loading", items: [] });

  useEffect(() => {
    let live = true;
    fetchFavorites()
      .then((items) => {
        if (live) setState({ status: "ready", items });
      })
      .catch(() => {
        if (live) setState({ status: "error", items: [] });
      });
    return () => {
      live = false;
    };
  }, [ids]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Favorites</h1>
      <p className="mt-1 text-ink-700">Places you want to come back to.</p>

      {state.status === "loading" && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-surface" />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <Card className="mt-8 grid place-items-center px-6 py-14 text-center">
          <TriangleAlert className="text-rose-500" />
          <p className="mt-3 font-bold text-ink-900">Couldn't load your favorites</p>
        </Card>
      )}

      {state.status === "ready" && state.items.length === 0 && (
        <Card className="mt-8 grid place-items-center px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
            <Heart size={24} />
          </span>
          <p className="mt-4 font-bold text-ink-900">No saved places yet</p>
          <p className="mt-1 max-w-xs text-sm text-ink-700">Tap the heart on a barbershop, salon, or restaurant.</p>
          <Button as={Link} to="/businesses" variant="soft" size="sm" className="mt-5">
            Explore
          </Button>
        </Card>
      )}

      {state.status === "ready" && state.items.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {state.items.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </div>
  );
}
