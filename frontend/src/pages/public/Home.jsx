import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Scissors,
  Flower2,
  Utensils,
  CalendarCheck,
  ShoppingBag,
  QrCode,
  ArrowRight,
  Check,
  Store,
  Sparkles,
} from "lucide-react";
import Button from "../../components/ui/Button";

const chips = [
  { icon: CalendarCheck, title: "Book Services", sub: "Barber & Salon", color: "bg-brand-100 text-brand-700" },
  { icon: ShoppingBag, title: "Order Food", sub: "Takeaway / Dine-in", color: "bg-orange-100 text-orange-600" },
  { icon: QrCode, title: "Scan & Order", sub: "QR at your table", color: "bg-indigo-100 text-indigo-700" },
];

const categories = [
  {
    key: "barbershop",
    icon: Scissors,
    title: "Barbershops",
    sub: "Look sharp, feel great",
    bg: "from-brand-100 to-brand-200/70",
    tile: "bg-white text-ink-900",
  },
  {
    key: "salon",
    icon: Flower2,
    title: "Beauty Salons",
    sub: "Relax & refresh",
    bg: "from-fuchsia-100 to-brand-100",
    tile: "bg-white text-brand-600",
  },
  {
    key: "restaurant",
    icon: Utensils,
    title: "Restaurants",
    sub: "Order delicious food",
    bg: "from-orange-100 to-amber-100",
    tile: "bg-white text-accent-600",
  },
];

const steps = [
  { n: "1", title: "Discover", text: "Browse barbershops, salons and restaurants near you, with real services and menus." },
  { n: "2", title: "Book or order", text: "Pick a time with your favorite stylist, or order food before you even arrive." },
  { n: "3", title: "Enjoy", text: "Skip the waiting. Show up when it's ready and enjoy the experience." },
];

const popular = ["Haircut", "Beard trim", "Braids", "Manicure", "Takeaway"];

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/businesses?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-100 via-white to-brand-50" />
        <div className="absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute right-0 top-40 -z-10 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-brand-700 shadow-soft ring-1 ring-brand-100">
              <Sparkles size={14} /> Made for Ethiopia
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl">
              Discover.
              <br />
              Book.{" "}
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                Enjoy.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
              Your all-in-one platform for Barbershops, Beauty Salons and Restaurants in Ethiopia.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {chips.map((c) => (
                <div
                  key={c.title}
                  className="flex items-center gap-2.5 rounded-full bg-white py-2 pl-2 pr-4 shadow-soft ring-1 ring-slate-900/5"
                >
                  <span className={`grid h-9 w-9 place-items-center rounded-full ${c.color}`}>
                    <c.icon size={17} />
                  </span>
                  <span className="text-xs leading-tight">
                    <span className="block font-bold text-ink-900">{c.title}</span>
                    <span className="text-slate-500">{c.sub}</span>
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-soft ring-1 ring-slate-900/5"
            >
              <Search size={20} className="ml-3 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a salon, restaurant or service..."
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-slate-400"
              />
              <Button type="submit">Search</Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-500">Popular:</span>
              {popular.map((p) => (
                <Link
                  key={p}
                  to={`/businesses?search=${encodeURIComponent(p)}`}
                  className="rounded-full bg-white/70 px-3 py-1 font-medium text-slate-600 ring-1 ring-slate-900/5 transition hover:bg-white hover:text-brand-700"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>

          {/* Hero visual. Put your photo at frontend/public/images/hero.jpg */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative h-[440px] overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-brand-500 via-brand-700 to-ink-900 shadow-2xl shadow-brand-700/30 sm:h-[520px]">
              <Scissors size={220} className="absolute -bottom-10 -right-10 rotate-12 text-white/10" />
              <img
                src="/images/hero.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>

            {/* Floating cards (decorative preview) */}
            <div className="absolute -left-4 top-10 animate-float rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-slate-900/5 sm:-left-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CalendarCheck size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">Booking confirmed</p>
                  <p className="text-xs text-slate-500">Thu, 10:00 AM</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-2 bottom-14 animate-float rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-slate-900/5 [animation-delay:2s] sm:-right-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-accent-600">
                  <Utensils size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">Order is ready</p>
                  <p className="text-xs text-slate-500">Ready for pickup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">Popular Categories</h2>
            <p className="mt-1 text-slate-500">Pick what you need today.</p>
          </div>
          <Link
            to="/businesses"
            className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.key}
              to={`/businesses?category=${c.key}`}
              className={`group rounded-3xl bg-gradient-to-br ${c.bg} p-7 ring-1 ring-slate-900/5 transition hover:-translate-y-1 hover:shadow-soft`}
            >
              <span className={`grid h-14 w-14 place-items-center rounded-2xl shadow-soft ${c.tile}`}>
                <c.icon size={26} />
              </span>
              <h3 className="mt-6 text-xl font-extrabold text-ink-900">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.sub}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-ink-900">
                Explore <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">How BookEasy ET works</h2>
            <p className="mt-2 text-slate-500">Three simple steps from choosing to enjoying.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-3xl bg-brand-50/60 p-7 ring-1 ring-brand-100">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-lg font-extrabold text-white shadow-glow">
                  {s.n}
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR BUSINESSES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 p-8 text-white sm:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="relative grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-brand-200">
                <Store size={14} /> For business owners
              </span>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Run a barbershop, salon or restaurant?
              </h2>
              <p className="mt-3 max-w-lg text-white/70">
                Get a professional online presence and simple tools to manage your day.
              </p>
              <Button as={Link} to="/signup" variant="light" size="lg" className="mt-7">
                List your business <ArrowRight size={18} />
              </Button>
            </div>
            <ul className="space-y-3.5">
              {[
                "Appointment calendar with staff schedules",
                "Digital menu and takeaway orders",
                "QR ordering for every table",
                "One dashboard for bookings and orders",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500/40">
                    <Check size={14} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}