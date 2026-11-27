import { LayoutGrid } from "lucide-react";
import { CATEGORIES } from "../../utils/categories";
import { cn } from "../../utils/cn";

export default function CategoryFilter({ value, onChange, counts = {}, total = 0 }) {
  const showCounts = Object.keys(counts).length > 0;
  const items = [
    { key: "", label: "All", icon: LayoutGrid, count: total },
    ...CATEGORIES.map((c) => ({ ...c, count: counts[c.key] ?? 0 })),
  ];

  return (
    <>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {items.map((item) => (
          <button
            key={item.key || "all"}
            onClick={() => onChange(item.key)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 transition",
              value === item.key
                ? "bg-brand-400 text-[#1a140c] ring-brand-400"
                : "bg-surface text-ink-800 ring-line hover:bg-paper"
            )}
          >
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="sticky top-24 hidden rounded-2xl border border-line bg-surface p-2 lg:block">
        <h2 className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700/70">
          Categories
        </h2>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = value === item.key;
            return (
              <li key={item.key || "all"}>
                <button
                  onClick={() => onChange(item.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active ? "bg-brand-50 text-brand-800" : "text-ink-800 hover:bg-paper"
                  )}
                >
                  <item.icon size={17} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {showCounts && (
                    <span className={cn("text-xs tabular-nums", active ? "text-brand-700" : "text-ink-700/60")}>
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
