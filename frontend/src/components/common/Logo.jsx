import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

export default function Logo({ tone = "dark", to = "/" }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-brand-400/70 text-[10px] font-semibold tracking-[0.14em] text-brand-400">
        BE
      </span>
      <span
        className={cn(
          "font-display text-lg tracking-tight",
          tone === "light" ? "text-brand-400" : "text-brand-400"
        )}
      >
        BookEasy
      </span>
    </Link>
  );
}
