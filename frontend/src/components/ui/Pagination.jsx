import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const base =
    "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        className={cn(base, "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            base,
            p === page
              ? "border-brand-600 bg-brand-600 text-white shadow-glow"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          {p}
        </button>
      ))}

      <button
        className={cn(base, "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}