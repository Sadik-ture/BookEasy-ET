import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import Button from "../ui/Button";
import { getCategory } from "../../utils/categories";
import { formatCount } from "../../utils/format";
import { cn } from "../../utils/cn";

export default function BusinessCard({ business: b }) {
  const cat = getCategory(b.category);
  if (!cat) return null;

  const Icon = cat.icon;
  const to = `/business/${b.slug}`;
  const location = [b.address?.area, b.address?.city].filter(Boolean).join(", ");

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Cover */}
      <Link to={to} className="relative block h-44 overflow-hidden" aria-label={b.name}>
        <div className={cn("absolute inset-0 bg-gradient-to-br", cat.cover)}>
          <Icon size={110} className="absolute -bottom-5 -right-5 rotate-12 text-white/20" />
        </div>
        {b.coverImage && (
          <img
            src={b.coverImage}
            alt={b.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}

        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink-900 backdrop-blur">
          <Icon size={13} /> {cat.label.replace(/s$/, "")}
        </span>

        {b.isOpen !== null && (
          <span
            className={cn(
              "absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold backdrop-blur",
              b.isOpen ? "bg-emerald-500/90 text-white" : "bg-ink-900/70 text-white"
            )}
          >
            {b.isOpen ? "Open now" : "Closed"}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="p-5">
        <Link to={to}>
          <h3 className="truncate text-lg font-extrabold text-ink-900 transition group-hover:text-brand-700">
            {b.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5 text-sm">
          {b.ratingCount > 0 ? (
            <>
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-ink-900">{b.ratingAvg.toFixed(1)}</span>
              <span className="text-slate-500">({formatCount(b.ratingCount)} reviews)</span>
            </>
          ) : (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">New</span>
          )}
        </div>

        {location && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={15} className="shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}

        {b.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {b.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {t}
              </span>
            ))}
          </div>
        )}

        <Button as={Link} to={to} className="mt-5 w-full">
          {cat.action}
        </Button>
      </div>
    </article>
  );
}