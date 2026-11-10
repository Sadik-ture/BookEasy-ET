import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Scissors, Flower2, Utensils, CalendarCheck, ShoppingBag, QrCode, ArrowRight } from "lucide-react";

const chips = [
  { icon: CalendarCheck, title: "Book Services", sub: "(Barber & Salon)", color: "bg-brand-100 text-brand-700" },
  { icon: ShoppingBag, title: "Order Food", sub: "(Takeaway / Dine-in)", color: "bg-rose-100 text-rose-600" },
  { icon: QrCode, title: "Scan & Order", sub: "(QR Code)", color: "bg-indigo-100 text-indigo-700" },
];

const categories = [
  {
    key: "barbershop",
    icon: Scissors,
    title: "Barbershops",
    sub: "Look sharp, feel great",
    bg: "from-brand-100 to-brand-200/60",
    iconColor: "text-slate-800",
  },
  {
    key: "salon",
    icon: Flower2,
    title: "Beauty Salons",
    sub: "Relax & refresh",
    bg: "from-brand-100 to-brand-200/60",
    iconColor: "text-brand-600",
  },
  {
    key: "restaurant",
    icon: Utensils,
    title: "Restaurants",
    sub: "Order delicious food",
    bg: "from-orange-100 to-orange-200/70",
    iconColor: "text-orange-500",
  },
];

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
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-100 via-white to-brand-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
              Discover.
              <br />
              Book. <span className="text-brand-600">Enjoy.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-slate-700">
              Your all-in-one platform for Barbershops, Beauty Salons and Restaurants in Ethiopia.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {chips.map((c) => (
                <div key={c.title} className="flex items-center gap-2.5 rounded-full bg-white/80 py-2 pl-2 pr-4 shadow-sm ring-1 ring-slate-100">
                  <span className={`grid h-9 w-9 place-items-center rounded-full ${c.color}`}>
                    <c.icon size={18} />
                  </span>
                  <span className="text-xs leading-tight">
                    <span className="block font-semibold text-slate-800">{c.title}</span>
                    <span className="text-slate-500">{c.sub}</span>
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex max-w-xl items-center rounded-2xl bg-white p-2 shadow-xl shadow-brand-600/10 ring-1 ring-slate-100"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a salon, restaurant or service..."
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Hero image: put your own photo at frontend/public/images/hero.jpg */}
          <div className="relative hidden h-[420px] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-200 to-brand-400 shadow-2xl shadow-brand-600/20 lg:block">
            <img
              src="/images/hero.jpg"
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Popular Categories</h2>
          <Link to="/businesses" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.key}
              to={`/businesses?category=${c.key}`}
              className={`group rounded-2xl bg-gradient-to-br ${c.bg} p-8 text-center shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg`}
            >
              <c.icon size={40} className={`mx-auto ${c.iconColor}`} />
              <h3 className="mt-4 text-lg font-bold text-slate-900">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.sub}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}