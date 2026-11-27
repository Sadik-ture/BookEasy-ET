import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { fetchBusinesses } from "../../services/marketplaceService";
import { CATEGORIES } from "../../utils/categories";
import BusinessCard from "../../components/marketplace/BusinessCard";
import Button from "../../components/ui/Button";
import Reveal from "../../components/motion/Reveal";

const steps = [
  { n: "01", title: "Find a place", text: "Search barbers, salons, and restaurants across Addis Ababa." },
  { n: "02", title: "Pick a time or a dish", text: "Choose a service and a slot, or add food to your order." },
  { n: "03", title: "Show up ready", text: "Your booking and order stay in one account." },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetchBusinesses({ limit: 4, sort: "popular" }, controller.signal)
      .then((res) => {
        setPlaces(res.data?.items || []);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/businesses?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-400">Addis Ababa</p>
            <h1 className="mt-5 max-w-xl font-display text-5xl leading-[1.02] text-brand-400 sm:text-6xl lg:text-7xl">
              Book with elegance.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-700">
              Barbershops, salons, and restaurants, reserved without the wait.
            </p>
            <form onSubmit={search} className="mt-8 flex max-w-lg flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Search</span>
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400/70" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Barber, salon, or restaurant"
                  className="h-12 w-full border border-line bg-surface pl-10 pr-4 text-sm text-ink-900 outline-none placeholder:text-ink-700 focus:border-brand-400"
                />
              </label>
              <Button type="submit" variant="outline" className="h-12">
                Discover
              </Button>
            </form>
          </div>

          <Link to="/businesses?category=salon" className="motion-card relative block aspect-[4/5] overflow-hidden border border-brand-400/40">
            <img src={CATEGORIES[1].photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/20" />
            <span className="absolute bottom-5 left-5 right-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-400">Beauty salons</span>
              <span className="mt-1 block font-display text-3xl text-ink-900">Book a chair</span>
            </span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl text-brand-400">Popular now</h2>
            <p className="mt-1 text-sm text-ink-700">Places people are booking and ordering from.</p>
          </div>
          <Link to="/businesses" className="hidden items-center gap-1 text-sm font-semibold text-brand-800 sm:inline-flex">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {status === "loading" && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="aspect-[5/3] animate-pulse bg-line" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-line" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-line" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "ready" && places.length > 0 && (
          <Reveal className="stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {places.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </Reveal>
        )}

        {status !== "loading" && places.length === 0 && (
          <p className="mt-8 text-sm text-ink-700">Places will appear here once businesses are listed.</p>
        )}

        <Link to="/businesses" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-800 sm:hidden">
          View all <ArrowRight size={16} />
        </Link>
      </section>

      <section className="border-y border-line bg-surface">
        <Reveal className="stagger mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n}>
              <p className="font-display text-3xl text-brand-400">{step.n}</p>
              <h3 className="mt-3 text-lg font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{step.text}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 border border-brand-400/40 bg-surface px-6 py-10 sm:px-10 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl text-brand-400">List your business</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-700">
              A public page, a calendar, and orders in the same dashboard.
            </p>
          </div>
          <Button as={Link} to="/list-your-business" variant="light">
            Get started
          </Button>
        </div>
      </section>
    </div>
  );
}
