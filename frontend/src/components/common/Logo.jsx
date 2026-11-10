import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";

export default function Logo({ size = "md" }) {
  const box = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const text = size === "lg" ? "text-2xl" : "text-xl";
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className={`${box} grid place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30`}>
        <CalendarCheck size={size === "lg" ? 24 : 20} />
      </span>
      <span className={`${text} font-bold text-slate-900`}>
        BookEasy <span className="text-brand-700">ET</span>
      </span>
    </Link>
  );
}