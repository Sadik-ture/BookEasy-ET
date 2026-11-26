import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import Button from "../ui/Button";
import { getCategory } from "../../utils/categories";
import { formatCount } from "../../utils/format";
import FavoriteButton from "./FavoriteButton";

export default function BusinessCard({ business: b }) {
  const cat = getCategory(b.category);
  if (!cat) return null;
  const to = `/business/${b.slug}`;
  const location = [b.address?.area, b.address?.city].filter(Boolean).join(", ");

  return (
    <article className="group relative overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <FavoriteButton businessId={b.id} className="absolute right-3 top-3 z-10" />
      {/* Cover */}
      <Link to={to} className="relative block h-40 overflow-hidden" aria-label={b.name}>
        <img
          src={b.coverImage || cat.photo}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="p-4">
        <Link to={to}>
          <h3 className="truncate text-base font-extrabold text-ink-900">{b.name}</h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm">
          <Star size={15} className="fill-amber-400 text-amber-400" />
          <span className="font-bold text-ink-900">{b.ratingCount > 0 ? b.ratingAvg.toFixed(1) : "New"}</span>
          {b.ratingCount > 0 && <span className="text-slate-500">({formatCount(b.ratingCount)} reviews)</span>}
        </div>
        {location && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}
        <Button as={Link} to={to} className="mt-4 w-full rounded-xl">
          {cat.action}
        </Button>
      </div>
    </article>
  );
}