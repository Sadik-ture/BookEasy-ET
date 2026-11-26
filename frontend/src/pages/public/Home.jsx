import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Scissors, Flower2, Utensils, CalendarCheck, ShoppingBag, QrCode, ArrowRight, Check, Store } from "lucide-react";
import Button from "../../components/ui/Button";
import BusinessCard from "../../components/marketplace/BusinessCard";
import { readRecent } from "../../utils/recent";

const chips = [
  { icon: CalendarCheck, title: "Book Services", sub: "Barber & Salon", color: "bg-brand-100 text-brand-700" },
  { icon: ShoppingBag, title: "Order Food", sub: "Takeaway / Dine-in", color: "bg-orange-100 text-orange-600" },
  { icon: QrCode, title: "Scan & Order", sub: "QR Code", color: "bg-indigo-100 text-indigo-700" },
];

const categories = [
  { key: "barbershop", icon: Scissors, title: "Barbershops", sub: "Look sharp, feel great", bg: "from-[#efe6ff] to-[#f6f1ff]", tile: "bg-white text-ink-900" },
  { key: "salon", icon: Flower2, title: "Beauty Salons", sub: "Relax & refresh", bg: "from-[#f4e9ff] to-[#f8f2ff]", tile: "bg-white text-brand-600" },
  { key: "restaurant", icon: Utensils, title: "Restaurants", sub: "Order delicious food", bg: "from-[#ffe8d4] to-[#fff3e8]", tile: "bg-white text-accent-600" },
];

const steps = [
  { n: "1", title: "Discover", text: "Browse barbershops, salons and restaurants near you, with real services and menus." },
  { n: "2", title: "Book or order", text: "Pick a time with your favorite stylist, or order food before you even arrive." },
  { n: "3", title: "Enjoy", text: "Skip the waiting. Show up when it's ready and enjoy the experience." },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/businesses?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#efe8ff] via-[#f7f4ff] to-[#fff7ef]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-700">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white">
                <CalendarCheck size={16} />
              </span>
              BookEasy ET
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight text-ink-900 sm:text-6xl">
              Discover.
              <br />
              <span className="text-brand-600">Book.</span> Enjoy.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
              Your all-in-one platform for Barbershops, Beauty Salons and Restaurants in Ethiopia.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {chips.map((c) => (
                <div key={c.title} className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-soft ring-1 ring-slate-900/5">
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${c.color}`}>
                    <c.icon size={15} />
                  </span>
                  <span className="text-[11px] leading-tight">
                    <span className="block font-bold text-ink-900">{c.title}</span>
                    <span className="text-slate-500">{c.sub}</span>
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSearch} className="mt-7 flex max-w-xl items-center rounded-full bg-white p-1.5 shadow-soft ring-1 ring-slate-900/5">
              <Search size={18} className="ml-3 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a salon, restaurant or service..."
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
              />
              <button type="submit" aria-label="Search" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-glow">
                <Search size={18} />
              </button>
            </form>
          </div>
          <div className="relative mx-auto h-[420px] w-full max-w-xl overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-900/20 sm:h-[520px]">
            <img
              src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1400&q=80"
              alt="A stylist cutting hair in a salon"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">Popular Categories</h2>
          <Link to="/businesses" className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.key}
              to={`/businesses?category=${c.key}`}
              className={`grid place-items-center rounded-[1.75rem] bg-gradient-to-br ${c.bg} px-6 py-10 text-center ring-1 ring-white transition hover:-translate-y-1 hover:shadow-soft`}
            >
              <span className={`grid h-16 w-16 place-items-center rounded-2xl shadow-soft ${c.tile}`}>
                <c.icon size={28} />
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-ink-900">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">Pick up where you left off</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((b) => (
              <BusinessCard key={b.slug} business={b} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">How BookEasy ET works</h2>
            <p className="mt-2 text-slate-500">Three simple steps from choosing to enjoying.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-3xl bg-brand-50/60 p-7 ring-1 ring-brand-100">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-lg font-extrabold text-white shadow-glow">{s.n}</span>
                <h3 className="mt-5 text-xl font-extrabold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 p-8 text-white sm:p-14">
          <div className="relative grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-brand-200">
                <Store size={14} /> For business owners
              </span>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Run a barbershop, salon or restaurant?</h2>
              <p className="mt-3 max-w-lg text-white/70">Get a professional online presence and simple tools to manage your day.</p>
             <Button as={Link} to="/list-your-business" variant="light" size="lg" className="mt-7">
              </Button>
            </div>
            <ul className="space-y-3.5">
              {["Appointment calendar with staff schedules", "Digital menu and takeaway orders", "QR ordering for every table", "One dashboard for bookings and orders"].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500/40"><Check size={14} /></span>
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
