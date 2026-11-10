export default function FormField({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}