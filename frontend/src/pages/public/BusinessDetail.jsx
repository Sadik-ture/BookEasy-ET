import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Star,
  SearchX,
  TriangleAlert,
  Utensils,
  ShoppingBag,
  Share2,
  Navigation,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ServiceList from "../../components/booking/ServiceList";
import BookingPanel from "../../components/booking/BookingPanel";
import MenuView from "../../components/orders/MenuView";
import CartPanel from "../../components/orders/CartPanel";
import { useCart } from "../../context/CartContext";
import { fetchBusiness, fetchServices, fetchStaff, fetchMenu, fetchTable } from "../../services/marketplaceService";
import { getCategory } from "../../utils/categories";
import { todayIn, weekdayOf } from "../../utils/dates";
import { formatClock, formatCount, formatPrice } from "../../utils/format";
import ReviewsPanel from "../../components/reviews/ReviewsPanel";
import { cn } from "../../utils/cn";
import { mapsLink, rememberBusiness } from "../../utils/recent";
import FavoriteButton from "../../components/marketplace/FavoriteButton";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const flattenMenu = (menu) => menu.flatMap((c) => c.items);

function Message({ icon: Icon, title, text }) {
  return (
    <div className="mx-auto grid max-w-md place-items-center px-4 py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-brand-600">
        <Icon size={28} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-ink-900">{title}</h1>
      <p className="mt-1 text-ink-700">{text}</p>
      <Button as={Link} to="/businesses" variant="soft" className="mt-6">
        Back to Explore
      </Button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="h-72 animate-pulse rounded-3xl bg-surface" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="h-96 animate-pulse rounded-3xl bg-surface" />
        <div className="h-96 animate-pulse rounded-3xl bg-surface" />
      </div>
    </div>
  );
}

export default function BusinessDetail() {
  const { slug } = useParams();
  const { cart, reconcile, fill } = useCart();
  const [state, setState] = useState({ status: "loading", business: null });
  const [copied, setCopied] = useState(false);
  const [catalog, setCatalog] = useState({ services: [], staff: [], menu: [] });
  const [tab, setTab] = useState("services");
  const [serviceId, setServiceId] = useState("");
  const panelRef = useRef(null);

  
  // Table from a scanned QR code: /business/habesha-restaurant?table=CODE
  const [searchParams, setSearchParams] = useSearchParams();
  const tableCode = searchParams.get("table") || "";
  const [table, setTable] = useState({ status: tableCode ? "loading" : "none", info: null });

  useEffect(() => {
    if (!tableCode) {
      setTable({ status: "none", info: null });
      return;
    }
    const controller = new AbortController();
    setTable({ status: "loading", info: null });
    fetchTable(tableCode, controller.signal)
      .then((info) => setTable({ status: "ready", info }))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setTable({ status: "invalid", info: null });
      });
    return () => controller.abort();
  }, [tableCode]);

  // Only use the table if it really belongs to THIS restaurant
  const activeTable =
    table.status === "ready" && table.info.business.slug === slug ? { code: tableCode, label: table.info.table.label } : null;
  const tableProblem = Boolean(tableCode) && (table.status === "invalid" || (table.status === "ready" && !activeTable));

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", business: null });
    setCatalog({ services: [], staff: [], menu: [] });
    setTab("services");
    setServiceId("");

    (async () => {
      try {
        const business = await fetchBusiness(slug, controller.signal);
        if (business.category === "restaurant") {
          const menu = await fetchMenu(slug, controller.signal);
          setCatalog({ services: [], staff: [], menu });
          reconcile(business.id, flattenMenu(menu)); // keep a saved cart in sync with the live menu
        } else {
          const [services, staff] = await Promise.all([
            fetchServices(slug, controller.signal),
            fetchStaff(slug, controller.signal),
          ]);
          setCatalog({ services, staff, menu: [] });
          setServiceId(services[0]?.id || "");
        }
        setState({ status: "ready", business });
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;
        setState({ status: err.response?.status === 404 ? "notfound" : "error", business: null });
      }
    })();

    return () => controller.abort();
  }, [slug, reconcile]);

  useEffect(() => {
    if (state.status === "ready" && state.business) rememberBusiness(state.business);
  }, [state.status, state.business]);

  useEffect(() => {
    if (!state.business || catalog.menu.length === 0) return;
    let payload = null;
    try {
      payload = JSON.parse(sessionStorage.getItem("bookeasy_reorder") || "null");
    } catch {
      payload = null;
    }
    if (!payload || payload.slug !== state.business.slug) return;
    sessionStorage.removeItem("bookeasy_reorder");
    const flat = flattenMenu(catalog.menu);
    const items = payload.items
      .map((line) => {
        const menuItem = flat.find((m) => String(m.id) === String(line.menuItemId));
        return menuItem
          ? { id: menuItem.id, name: menuItem.name, priceMinor: menuItem.priceMinor, quantity: line.quantity }
          : null;
      })
      .filter(Boolean);
    fill(state.business, items);
  }, [state.business, catalog.menu, fill]);

  const { status, business } = state;
  if (status === "loading") return <Skeleton />;
  if (status === "notfound")
    return <Message icon={SearchX} title="Business not found" text="This business doesn't exist or isn't available." />;
  if (status === "error")
    return <Message icon={TriangleAlert} title="Something went wrong" text="Please check your connection and try again." />;

  const cat = getCategory(business.category);
  const Icon = cat.icon;
  const isBookable = business.category !== "restaurant";
  const location = [business.address?.line, business.address?.area, business.address?.city].filter(Boolean).join(", ");
  const todayDow = weekdayOf(todayIn(business.timezone));

  // Cart summary for the mobile bar (only for this restaurant)
  const myLines = cart.businessId === business.id ? cart.lines : [];
  const cartCount = myLines.reduce((n, l) => n + l.quantity, 0);
  const cartTotal = myLines.reduce((n, l) => n + l.priceMinor * l.quantity, 0);

  const tabs = [
    { key: "services", label: isBookable ? "Services" : "Menu" },
    { key: "reviews", label: "Reviews" },
    { key: "location", label: "Location" },
  ];

  const scrollToPanel = () => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleSelectService = (id) => {
    setServiceId(id);
    if (window.innerWidth < 1024) scrollToPanel();
  };

  // Called by the cart when the server says items changed
  const refreshMenu = async () => {
    try {
      const menu = await fetchMenu(slug);
      setCatalog((c) => ({ ...c, menu }));
      reconcile(business.id, flattenMenu(menu));
    } catch {
      /* keep the current menu */
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/businesses" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-900">
        <ArrowLeft size={16} /> Back to Explore
      </Link>
      {activeTable && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-600 px-5 py-4 text-white shadow-glow">
          <QrCode size={20} className="shrink-0" />
          <p className="text-sm font-bold">You're ordering from {activeTable.label}</p>
          <span className="ml-auto hidden text-xs text-white/80 sm:block">Staff will bring your order to the table</span>
        </div>
      )}
      {tableProblem && (
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" /> This table code isn't valid for this restaurant, so you can only
          order for takeaway. Please ask the staff for help.
        </p>
      )}

      <div className="mt-5 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Header card */}
          <Card className="overflow-hidden">
            <div className={cn("relative h-52 bg-gradient-to-br sm:h-64", cat.cover)}>
              <img
                src={business.coverImage || cat.photo}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold text-ink-900 backdrop-blur">
                <Icon size={13} /> {cat.label.replace(/s$/, "")}
              </span>
              {business.isOpen !== null && (
                <span
                  className={cn(
                    "absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold backdrop-blur",
                    business.isOpen ? "bg-emerald-500/90 text-white" : "bg-ink-950/80 text-ink-800"
                  )}
                >
                  {business.isOpen ? "Open now" : "Closed"}
                </span>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-display text-4xl font-medium tracking-tight text-brand-400">{business.name}</h1>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const url = window.location.href;
                      try {
                        if (navigator.share) {
                          await navigator.share({ title: business.name, url });
                          return;
                        }
                      } catch {
                        return;
                      }
                      await navigator.clipboard.writeText(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    }}
                    className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-700 hover:bg-brand-50"
                    aria-label={copied ? "Link copied" : "Share"}
                    title={copied ? "Link copied" : "Share"}
                  >
                    <Share2 size={16} />
                  </button>
                  <FavoriteButton businessId={business.id} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-700">
                {business.ratingCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <b className="text-ink-900">{business.ratingAvg.toFixed(1)}</b>
                    <span>({formatCount(business.ratingCount)} reviews)</span>
                  </span>
                )}
                {location && (
                  <a href={mapsLink(business.address)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-brand-600">
                    <MapPin size={15} /> {location}
                    <Navigation size={13} />
                  </a>
                )}
                {business.phone && (
                  <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-brand-600">
                    <Phone size={15} /> {business.phone}
                  </a>
                )}
              </div>

              {business.description && <p className="mt-4 text-ink-700">{business.description}</p>}
              {business.acceptingRequests === false && (
                <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  This business is not taking new bookings or orders right now.
                </p>
              )}

              {business.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {business.tags.map((t) => (
                    <span key={t} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Tabs */}
          <Card className="p-2 sm:p-4">
            <div className="flex gap-1 border-b border-slate-100 px-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "-mb-px border-b-2 px-4 py-3 text-sm font-bold transition",
                    tab === t.key
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-ink-700 hover:text-ink-900"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div key={tab} className="fade-in p-2 sm:p-4">
              {tab === "services" &&
                (isBookable ? (
                  <ServiceList services={catalog.services} selectedId={serviceId} onSelect={handleSelectService} />
                ) : catalog.menu.length > 0 ? (
                  <MenuView business={business} categories={catalog.menu} />
                ) : (
                  <div className="grid place-items-center py-12 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-accent-600">
                      <Utensils size={24} />
                    </span>
                    <p className="mt-4 font-bold text-ink-900">The menu is coming soon</p>
                    <p className="mt-1 max-w-xs text-sm text-ink-700">This restaurant hasn't published its menu yet.</p>
                  </div>
                ))}

              {tab === "reviews" && <ReviewsPanel slug={business.slug} />}

              {tab === "location" && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="font-extrabold text-ink-900">Address</h3>
                    <p className="mt-2 flex items-start gap-2 text-sm text-ink-700">
                      <MapPin size={16} className="mt-0.5 shrink-0" /> {location || "Not provided"}
                    </p>
                    {business.phone && (
                      <p className="mt-3 flex items-center gap-2 text-sm text-ink-700">
                        <Phone size={16} /> {business.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-ink-900">Opening hours</h3>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {DAY_ORDER.map((d) => {
                        const h = business.openingHours?.find((x) => x.day === d);
                        return (
                          <li
                            key={d}
                            className={cn(
                              "flex justify-between rounded-lg px-3 py-1.5",
                              d === todayDow ? "bg-brand-50 font-bold text-brand-700" : "text-ink-700"
                            )}
                          >
                            <span>{DAY_NAMES[d]}</span>
                            <span>{!h || h.closed ? "Closed" : `${formatClock(h.open)} – ${formatClock(h.close)}`}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div ref={panelRef} className="scroll-mt-24 lg:sticky lg:top-24">
          {isBookable ? (
            <BookingPanel
              key={business.id}
              business={business}
              services={catalog.services}
              staff={catalog.staff}
              serviceId={serviceId}
              onServiceChange={setServiceId}
            />
          ) : (
                    <CartPanel
              key={business.id}
              business={business}
              table={activeTable}
              onStale={refreshMenu}
              onTableInvalid={() => setSearchParams({}, { replace: true })}
            />
          )}
        </div>
      </div>

      {/* Mobile cart bar */}
      {!isBookable && cartCount > 0 && (
        <button
          onClick={scrollToPanel}
          className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-2xl bg-brand-600 px-5 py-4 text-sm font-bold text-white shadow-glow lg:hidden"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag size={18} /> View order ({cartCount})
          </span>
          <span>{formatPrice(cartTotal)}</span>
        </button>
      )}
    </div>
  );
}