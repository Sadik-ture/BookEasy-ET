import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, SearchX, RefreshCw, ChevronDown, TriangleAlert } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Pagination from "../../components/ui/Pagination";
import CategoryFilter from "../../components/marketplace/CategoryFilter";
import BusinessCard from "../../components/marketplace/BusinessCard";
import useDebounce from "../../hooks/useDebounce";
import { CATEGORY_KEYS, getCategory } from "../../utils/categories";
import { fetchBusinesses, fetchCategories } from "../../services/marketplaceService";

const SORTS = [
  { value: "popular", label: "Popular" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];
const PAGE_SIZE = 9;

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-900/5">
      <div className="h-44 animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function Message({ icon: Icon, title, text, action }) {
  return (
    <Card className="grid place-items-center px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-brand-600">
        <Icon size={28} />
      </span>
      <h3 className="mt-5 text-lg font-extrabold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action}
    </Card>
  );
}

export default function Explore() {
  const [params, setParams] = useSearchParams();

  // Read and sanitize filters from the URL
  const rawCategory = params.get("category") || "";
  const category = CATEGORY_KEYS.includes(rawCategory) ? rawCategory : "";
  const searchParam = params.get("search") || "";
  const rawSort = params.get("sort");
  const sort = SORTS.some((s) => s.value === rawSort) ? rawSort : "popular";
  const page = Math.max(1, parseInt(params.get("page"), 10) || 1);

  const [q, setQ] = useState(searchParam);
  const debouncedQ = useDebounce(q.trim(), 400);
  const [counts, setCounts] = useState({});
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ status: "loading", items: [], meta: null });

  const updateParams = (patch, { replace = false, keepPage = false } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!keepPage) next.delete("page");
    setParams(next, { replace });
  };

  // Category counts for the sidebar (once)
  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal)
      .then((cats) => setCounts(Object.fromEntries(cats.map((c) => [c.key, c.count]))))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Typing in the search box updates the URL after a short pause
  useEffect(() => {
    if (debouncedQ !== searchParam) updateParams({ search: debouncedQ }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  // Keep the input in sync when the URL changes from outside (e.g. navbar link)
  useEffect(() => {
    if (searchParam !== debouncedQ) setQ(searchParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam]);

  // Load businesses whenever filters change
  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: "loading" }));

    fetchBusinesses({ category, search: searchParam, sort, page, limit: PAGE_SIZE }, controller.signal)
      .then((res) => setState({ status: "ready", items: res.data.items, meta: res.meta }))
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        setState({ status: "error", items: [], meta: null });
      });

    return () => controller.abort();
  }, [category, searchParam, sort, page, reloadKey]);

  const { status, items, meta } = state;
  const hasFilters = Boolean(category || searchParam);
  const activeCategory = getCategory(category);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const clearAll = () => {
    setQ("");
    setParams({});
  };

  const goToPage = (p) => {
    updateParams({ page: String(p) }, { keepPage: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
        {activeCategory ? activeCategory.label : "Explore Businesses"}
      </h1>
      <p className="mt-1 text-slate-500">Find the best services near you</p>

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, service or area…"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value === "popular" ? "" : e.target.value })}
            aria-label="Sort businesses"
            className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:w-auto"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort by: {s.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <CategoryFilter
            value={category}
            counts={counts}
            total={total}
            onChange={(key) => updateParams({ category: key })}
          />
        </aside>

        <section>
          <div className="mb-5 flex min-h-6 items-center justify-between">
            <p className="text-sm text-slate-500">
              {meta ? `${meta.total} ${meta.total === 1 ? "business" : "businesses"} found` : "Loading…"}
            </p>
            {hasFilters && (
              <button onClick={clearAll} className="text-sm font-bold text-brand-600 hover:text-brand-700">
                Clear filters
              </button>
            )}
          </div>

          {status === "loading" && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {status === "error" && (
            <Message
              icon={TriangleAlert}
              title="Couldn't load businesses"
              text="Please check your connection and try again."
              action={
                <Button variant="soft" className="mt-6" onClick={() => setReloadKey((k) => k + 1)}>
                  <RefreshCw size={16} /> Try again
                </Button>
              }
            />
          )}

          {status === "ready" && items.length === 0 && (
            <Message
              icon={SearchX}
              title="No businesses found"
              text="Try a different search or remove some filters."
              action={
                hasFilters && (
                  <Button variant="soft" className="mt-6" onClick={clearAll}>
                    Clear filters
                  </Button>
                )
              }
            />
          )}

          {status === "ready" && items.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((b) => (
                  <BusinessCard key={b.id} business={b} />
                ))}
              </div>
              <Pagination page={meta.page} totalPages={meta.totalPages} onChange={goToPage} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}