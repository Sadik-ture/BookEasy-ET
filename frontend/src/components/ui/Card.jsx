import { cn } from "../../utils/cn";

export default function Card({ className = "", children, ...props }) {
  return (
    <div
      {...props}
      className={cn("rounded-2xl border border-line bg-surface shadow-soft", className)}
    >
      {children}
    </div>
  );
}
