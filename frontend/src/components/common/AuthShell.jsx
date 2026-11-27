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
    <div className="page-in grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="relative">
          <Logo tone="light" />
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-5xl leading-[1.05] text-brand-400">
            Book. Order.
            <br />
            Skip the wait.
          </h2>
          <ul className="mt-8 space-y-4">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/80">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface/15">
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
      <main className="flex flex-col justify-center bg-paper px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-brand-600"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <h1 className="font-display text-4xl text-brand-400">{title}</h1>
          <p className="mt-2 text-ink-700">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-sm text-ink-700">{footer}</div>
        </div>
      </main>
    </div>
  );
}