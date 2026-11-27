import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/cn";

export default function FormField({ label, error, icon: Icon, type = "text", ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-800">{label}</span>
      <span className="relative block">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-700"
          />
        )}
        <input
          {...props}
          type={isPassword && show ? "text" : type}
          className={cn(
            "h-12 w-full rounded-2xl border bg-surface text-sm outline-none transition placeholder:text-ink-700 focus:ring-4",
            Icon ? "pl-11" : "pl-4",
            isPassword ? "pr-12" : "pr-4",
            error
              ? "border-rose-400 focus:ring-rose-100"
              : "border-line focus:border-brand-500 focus:ring-brand-100"
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-700 hover:text-ink-700"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
      {error && <span className="fade-in mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}