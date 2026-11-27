import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Heart, Share2, Store, UtensilsCrossed } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import { getSummary } from "../../services/manageService";
import { fetchMyBookings } from "../../services/bookingService";
import { fetchMyOrders } from "../../services/orderService";
import { formatDateTime, formatPrice } from "../../utils/format";
import { cn } from "../../utils/cn";

const views = ["Blocks", "List", "Table"];

function Panel({ className = "", children }) {
  const painted = className.includes("bg-");
  return (
    <section
      className={cn(
        "rounded-2xl border p-5 shadow-soft",
        painted ? "" : "border-line bg-surface text-ink-900",
        className
      )}
    >
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [view, setView] = useState("Blocks");
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState({ summary: null, bookings: [], orders: [] });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getSummary(controller.signal),
      fetchMyBookings("upcoming", controller.signal),
      fetchMyOrders("active", controller.signal),
    ])
      .then(([summary, bookings, orders]) => setData({ summary, bookings, orders }))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const s = data.summary;
  const upcoming = s?.upcomingBookings ?? data.bookings.length;
  const active = s?.activeOrders ?? data.orders.length;
  const done = s?.completed ?? 0;
  const saved = s?.favorites ?? 0;
  const next = data.bookings[0];
  const activity = [done, upcoming, active, saved, Math.max(upcoming, 1)];
  const max = Math.max(...activity, 1);
  const line = activity
    .map((n, i) => {
      const x = (i / (activity.length - 1)) * 100;
      const y = 78 - (n / max) * 58;
      return `${x},${y}`;
    })
    .join(" ");

  const rows = [
    ...data.bookings.map((b) => ({
      id: b.id,
      name: b.business?.name || "Booking",
      meta: `${b.serviceName} · ${formatDateTime(b.startAt, b.business?.timezone)}`,
      amount: formatPrice(b.priceMinor, b.currency),
      up: true,
    })),
    ...data.orders.map((o) => ({
      id: o.id,
      name: o.business?.name || "Order",
      meta: o.orderNumber,
      amount: formatPrice(o.totalMinor, o.currency),
      up: false,
    })),
  ];

  const mixTotal = Math.max(upcoming + active + done + saved, 1);
  const mix = [
    { label: "Bookings", value: upcoming, color: "bg-brand-700" },
    { label: "Orders", value: active, color: "bg-brand-500" },
    { label: "Completed", value: done, color: "bg-brand-300" },
    { label: "Favorites", value: saved, color: "bg-accent-500" },
  ].map((m) => ({ ...m, width: `${Math.max(8, Math.round((m.value / mixTotal) * 100))}%` }));

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    const lines = [
      "BookEasy ET report",
      `Upcoming bookings,${upcoming}`,
      `Active orders,${active}`,
      `Completed,${done}`,
      `Favorites,${saved}`,
      "",
      ...rows.map((r) => `${r.name},${r.meta},${r.amount}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookeasy-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl font-medium tracking-tight">Dashboard</h1>
        <button type="button" onClick={share} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-800">
          <Share2 size={14} /> {copied ? "Copied" : "Share link"}
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-line bg-surface p-1">
            {views.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", view === v ? "bg-brand-400 text-[#1a140c]" : "text-ink-700")}
              >
                {v}
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={download}>
            Download report
          </Button>
        </div>
      </div>

      {view === "Table" ? (
        <Panel className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-700">
              <tr>
                <th className="pb-3 font-semibold">Place</th>
                <th className="pb-3 font-semibold">Detail</th>
                <th className="pb-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-ink-700">Nothing booked or ordered yet.</td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="py-3 font-semibold">{r.name}</td>
                  <td className="py-3 text-ink-700">{r.meta}</td>
                  <td className={cn("py-3 text-right font-semibold", r.up ? "text-brand-800" : "text-rose-700")}>{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ) : (
        <div className={cn("mt-5 grid gap-4", view === "List" ? "grid-cols-1" : "xl:grid-cols-[0.9fr_1.3fr]")}>
          <Panel className="bg-ink-950 text-white">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/70">Next visit</p>
              <Link to="/businesses" className="text-sm font-medium text-white/80">Book</Link>
            </div>
            <p className="mt-8 font-display text-3xl font-medium tracking-tight">{next ? next.business?.name : "No booking yet"}</p>
            <p className="mt-2 text-sm text-white/70">{next ? `${next.serviceName} · ${formatDateTime(next.startAt, next.business?.timezone)}` : "Pick a barber, salon, or restaurant."}</p>
            <div className="mt-8 flex gap-2">
              <Button as={Link} to="/businesses?category=salon" size="sm" variant="light">
                <ArrowUpRight size={15} /> Book
              </Button>
              <Button as={Link} to="/my-orders" size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-surface/10">
                <ArrowDownRight size={15} /> Orders
              </Button>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Activity</h2>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink-700">This month</span>
            </div>
            <svg viewBox="0 0 100 80" className="mt-4 h-44 w-full" role="img" aria-label="Activity chart">
              <polyline fill="none" stroke="#146346" strokeWidth="1.6" points={line} />
              <circle cx="50" cy={78 - ((activity[2] / max) * 58)} r="1.6" fill="#146346" />
            </svg>
            <p className="text-sm text-ink-700">
              {upcoming} upcoming · {active} active orders · {done} completed
            </p>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent</h2>
              <Link to="/my-bookings" className="text-sm font-medium text-brand-800">View all</Link>
            </div>
            {rows.length === 0 ? (
              <p className="mt-6 text-sm text-ink-700">Bookings and orders show up here.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {rows.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper text-ink-800">
                      {r.up ? <CalendarDays size={16} /> : <UtensilsCrossed size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{r.name}</span>
                      <span className="block truncate text-xs text-ink-700">{r.meta}</span>
                    </span>
                    <span className={cn("text-sm font-semibold", r.up ? "text-brand-800" : "text-rose-700")}>{r.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className={cn("grid gap-4", view === "List" ? "" : "sm:grid-cols-[1.2fr_0.8fr]")}>
            <Panel>
              <h2 className="text-lg font-semibold">Your mix</h2>
              <div className="mt-5 space-y-3">
                {mix.map((m) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className={cn("grid h-9 w-9 place-items-center rounded-lg text-xs font-semibold text-white", m.color, m.color === "bg-brand-300" && "text-ink-900")}>{m.value}</span>
                    <div className="min-w-0 flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-paper">
                        <div className={cn("h-full rounded-full", m.color)} style={{ width: m.width }} />
                      </div>
                      <p className="mt-1 text-xs text-ink-700">{m.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel className="bg-brand-50">
              <h2 className="font-display text-2xl font-medium">Book in one place</h2>
              <p className="mt-2 text-sm text-ink-700">Barbers, salons, and restaurants across Addis Ababa.</p>
              <div className="mt-6 flex gap-3 text-brand-800">
                <Heart size={18} />
                <Store size={18} />
                <CalendarDays size={18} />
              </div>
              <Button as={Link} to={user.role === "business_owner" ? "/manage" : "/list-your-business"} size="sm" className="relative mt-6">
                {user.role === "business_owner" ? "Open business" : "List your business"}
              </Button>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
