import { Minus, Plus } from "lucide-react";
import { cn } from "../../utils/cn";

export default function QtyStepper({ value, onChange, max = 20, small = false }) {
  const btn = cn(
    "grid place-items-center rounded-lg bg-brand-50 text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40",
    small ? "h-7 w-7" : "h-9 w-9"
  );
  return (
    <div className="inline-flex items-center gap-2">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        <Minus size={small ? 14 : 16} />
      </button>
      <span className={cn("min-w-6 text-center font-bold text-ink-900", small ? "text-sm" : "text-base")}>{value}</span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={small ? 14 : 16} />
      </button>
    </div>
  );
}