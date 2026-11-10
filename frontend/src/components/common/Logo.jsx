import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Logo({ tone = "dark", to = "/" }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
        <CalendarCheck size={20} />
      </span>
      <span
        className={cn(
          "text-xl font-extrabold tracking-tight",
          tone === "light" ? "text-white" : "text-ink-900"
        )}
      >
        BookEasy<span className={tone === "light" ? "text-brand-300" : "text-brand-600"}> ET</span>
      </span>
    </Link>
  );
}