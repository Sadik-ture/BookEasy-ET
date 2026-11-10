import { LayoutGrid } from "lucide-react";
import Card from "../ui/Card";
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
      {/* Mobile: horizontal chips */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {items.map((item) => (
          <button
            key={item.key || "all"}
            onClick={() => onChange(item.key)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 transition",
              value === item.key
                ? "bg-brand-600 text-white ring-brand-600"
                : "bg-white text-slate-700 ring-slate-200 hover:bg-brand-50"
            )}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Desktop: sidebar */}
      <Card className="sticky top-24 hidden p-3 lg:block">
        <h2 className="px-3 pb-2 pt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Categories
        </h2>
        <ul className="space-y-1">
          {items.map((item) => {
            const active = value === item.key;
            return (
              <li key={item.key || "all"}>
                <button
                  onClick={() => onChange(item.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                    active ? "bg-brand-600 text-white shadow-glow" : "text-slate-700 hover:bg-brand-50"
                  )}
                >
                  <item.icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {showCounts && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}