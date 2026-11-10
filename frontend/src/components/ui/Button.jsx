import { cn } from "../../utils/cn";

const variants = {
  primary: "bg-brand-600 text-white shadow-glow hover:bg-brand-700",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  outline: "border border-slate-200 bg-white text-ink-900 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  accent: "bg-accent-500 text-white hover:bg-accent-600",
  light: "bg-white text-brand-700 hover:bg-brand-50",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  type = "button",
  children,
  ...props
}) {
  const extra = Tag === "button" ? { type, disabled: loading || props.disabled } : {};
  return (
    <Tag
      {...props}
      {...extra}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </Tag>
  );
}