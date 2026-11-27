import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const base =
    "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-semibold transition-[background-color,color,border-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        className={cn(base, "border-line bg-surface text-ink-700 hover:bg-brand-50")}
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
              ? "border-brand-600 bg-brand-400 text-[#1a140c] shadow-glow"
              : "border-line bg-surface text-ink-700 hover:bg-brand-50"
          )}
        >
          {p}
        </button>
      ))}

      <button
        className={cn(base, "border-line bg-surface text-ink-700 hover:bg-brand-50")}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}