import { cn } from "../../utils/cn";

export default function Card({ className = "", children, ...props }) {
  return (
    <div
      {...props}
      className={cn("rounded-3xl bg-white shadow-soft ring-1 ring-slate-900/5", className)}
    >
      {children}
    </div>
  );
}