import { Heart } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import { cn } from "../../utils/cn";

export default function FavoriteButton({ businessId, className }) {
  const { has, toggle } = useFavorites();
  const saved = has(businessId);
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(businessId);
      }}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-400 shadow-soft ring-1 ring-slate-900/5 transition hover:text-rose-500",
        saved && "text-rose-500",
        className
      )}
    >
      <Heart size={16} className={saved ? "fill-rose-500" : ""} />
    </button>
  );
}
