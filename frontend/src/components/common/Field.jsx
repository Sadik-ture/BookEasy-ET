import { cn } from "../../utils/cn";

const base =
  "w-full rounded-2xl border bg-surface px-4 text-sm outline-none transition placeholder:text-ink-700 focus:ring-4";
const ok = "border-line focus:border-brand-500 focus:ring-brand-100";
const bad = "border-rose-400 focus:ring-rose-100";

export function SelectField({ label, error, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-800">{label}</span>
      <select {...props} className={cn(base, "h-12 cursor-pointer", error ? bad : ok)}>
        {children}
      </select>
      {error && <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}

export function TextAreaField({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-800">{label}</span>
      <textarea {...props} className={cn(base, "resize-none py-3", error ? bad : ok)} />
      {error && <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}