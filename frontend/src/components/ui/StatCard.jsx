import { cn } from "../../utils/cn";

const tones = {
  brand: "bg-brand-50 text-brand-600",
  green: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-500",
  amber: "bg-amber-50 text-amber-600",
};

export default function StatCard({ icon: Icon, label, value, hint, tone = "brand", dark = false }) {
  return (
    <div
      className={cn(
        "rounded-3xl p-5 ring-1 transition hover:-translate-y-0.5",
        dark
          ? "bg-ink-900 text-white shadow-soft ring-ink-800"
          : "bg-white shadow-soft ring-slate-900/5"
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-2xl",
            dark ? "bg-white/10 text-white" : tones[tone]
          )}
        >
          <Icon size={20} />
        </span>
        {hint && (
          <span className={cn("text-xs font-medium", dark ? "text-white/50" : "text-slate-400")}>
            {hint}
          </span>
        )}
      </div>
      <p className="mt-5 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className={cn("mt-1 text-sm", dark ? "text-white/60" : "text-slate-500")}>{label}</p>
    </div>
  );
}