import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { getCategory } from "../../utils/categories";
import { formatCount } from "../../utils/format";
import FavoriteButton from "./FavoriteButton";

export default function BusinessCard({ business: b }) {
  const cat = getCategory(b.category);
  if (!cat) return null;
  const to = `/business/${b.slug}`;
  const location = [b.address?.area, b.address?.city].filter(Boolean).join(", ");

  return (
    <article className="motion-card flex flex-col border border-brand-400/35 bg-surface">
      <div className="relative">
        <FavoriteButton businessId={b.id} className="absolute right-3 top-3 z-10" />
        <Link to={to} className="relative block aspect-square overflow-hidden bg-ink-950" aria-label={b.name}>
          <img
            src={b.coverImage || cat.photo}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 py-3.5">
        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-400">
          <span>{cat.label.replace(/s$/, "")}</span>
          <span className="inline-flex items-center gap-1 text-ink-800">
            <Star size={11} className="fill-brand-400 text-brand-400" />
            {b.ratingCount > 0 ? b.ratingAvg.toFixed(1) : "New"}
            {b.ratingCount > 0 && <span className="text-ink-700">({formatCount(b.ratingCount)})</span>}
          </span>
        </div>
        <Link to={to}>
          <h3 className="truncate font-display text-lg text-brand-400">{b.name}</h3>
        </Link>
        {location && <p className="truncate text-xs text-ink-700">{location}</p>}
        <Link
          to={to}
          className="mt-auto inline-flex items-center gap-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400 transition hover:text-brand-700"
        >
          {cat.action}
        </Link>
      </div>
    </article>
  );
}
