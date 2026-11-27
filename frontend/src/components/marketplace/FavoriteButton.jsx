import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import { cn } from "../../utils/cn";

export default function FavoriteButton({ businessId, className }) {
  const { has, toggle } = useFavorites();
  const saved = has(businessId);
  const [pulse, setPulse] = useState(0);
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(businessId);
        setPulse((n) => n + 1);
      }}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border border-brand-400/40 bg-ink-950/80 text-brand-400 backdrop-blur transition-colors duration-200 hover:text-rose-400",
        saved && "text-rose-500",
        className
      )}
    >
      <Heart key={pulse} size={16} className={cn(pulse > 0 && "heart-pop", saved && "fill-rose-500")} />
    </button>
  );
}
