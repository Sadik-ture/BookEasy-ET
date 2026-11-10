import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import Logo from "./Logo";

const perks = [
  "Book barbers and salons in a few taps",
  "Order food for takeaway or from your table",
  "Track every booking and order in one place",
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="relative">
          <Logo tone="light" />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Book. Order.
            <br />
            Skip the wait.
          </h2>
          <ul className="mt-8 space-y-4">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/80">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15">
                  <Check size={14} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/50">© {new Date().getFullYear()} BookEasy ET</p>
      </aside>

      {/* Form side */}
      <main className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-sm text-slate-600">{footer}</div>
        </div>
      </main>
    </div>
  );
}