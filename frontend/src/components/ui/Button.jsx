import { cn } from "../../utils/cn";

const variants = {
  primary: "border border-brand-400 bg-brand-400 text-[#1a140c] hover:bg-brand-700",
  dark: "border border-brand-400/40 bg-ink-950 text-brand-400 hover:border-brand-400",
  soft: "bg-brand-50 text-brand-400 hover:bg-brand-100",
  outline: "border border-brand-400/70 bg-transparent text-brand-400 hover:bg-brand-400 hover:text-[#1a140c]",
  ghost: "text-ink-800 hover:bg-surface/5",
  accent: "bg-brand-400 text-[#1a140c] hover:bg-brand-700",
  light: "bg-brand-400 text-[#1a140c] hover:bg-brand-700",
};

const sizes = {
  sm: "h-9 px-3.5 text-xs tracking-[0.14em] uppercase",
  md: "h-11 px-5 text-xs tracking-[0.16em] uppercase",
  lg: "h-12 px-6 text-sm tracking-[0.16em] uppercase",
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
        "inline-flex items-center justify-center gap-2 font-semibold transition-[background-color,color,border-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.985] active:duration-100 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      )}
      {children}
    </Tag>
  );
}
