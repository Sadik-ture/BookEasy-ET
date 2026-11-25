import { Clock, Check } from "lucide-react";
import Button from "../ui/Button";
import { formatDuration, formatPrice } from "../../utils/format";
import { cn } from "../../utils/cn";

export default function ServiceList({ services, selectedId, onSelect }) {
  if (!services.length) {
    return <p className="py-10 text-center text-sm text-slate-500">This business hasn't added any services yet.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {services.map((s) => {
        const selected = s.id === selectedId;
        return (
          <li
            key={s.id}
            className={cn(
              "flex flex-col gap-3 px-2 py-4 transition sm:flex-row sm:items-center sm:justify-between",
              selected && "rounded-2xl bg-brand-50/60"
            )}
          >
            <div className="min-w-0 sm:px-3">
              <p className="font-bold text-ink-900">{s.name}</p>
              {s.description && <p className="mt-0.5 text-sm text-slate-500">{s.description}</p>}
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Clock size={13} /> {formatDuration(s.durationMinutes)}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:px-3">
              <span className="text-base font-extrabold text-ink-900">{formatPrice(s.priceMinor)}</span>
              <Button size="sm" variant={selected ? "soft" : "primary"} onClick={() => onSelect(s.id)}>
                {selected ? (
                  <>
                    <Check size={15} /> Selected
                  </>
                ) : (
                  "Book"
                )}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}