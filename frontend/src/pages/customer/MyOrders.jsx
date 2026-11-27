import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Clock, TriangleAlert, UtensilsCrossed } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { fetchMyOrders, cancelOrder } from "../../services/orderService";
import { parseApiError } from "../../utils/apiError";
import { formatDateTime, formatPrice } from "../../utils/format";
import { ORDER_STATUS, PROGRESS_STEPS } from "../../utils/orderStatus";
import { cn } from "../../utils/cn";

function Progress({ status }) {
  const current = PROGRESS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="mt-4 flex items-center">
      {PROGRESS_STEPS.map((s, i) => {
        const done = i < current || (i === current && status === "ready");
        const now = i === current && !done;
        return (
          <div key={s.key} className={cn("flex items-center", i < PROGRESS_STEPS.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
                  done && "bg-emerald-500 text-white",
                  now && "bg-brand-400 text-[#1a140c] ring-4 ring-brand-100",
                  !done && !now && "bg-surface text-ink-700"
                )}
              >
                {done ? <Check size={14} /> : i + 1}
              </span>
              <span className={cn("text-[11px] font-semibold", done || now ? "text-ink-900" : "text-ink-700")}>
                {s.label}
              </span>
            </div>
            {i < PROGRESS_STEPS.length - 1 && (
              <span className={cn("mx-2 mb-5 h-0.5 flex-1 rounded", i < current ? "bg-emerald-500" : "bg-surface")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MyOrders() {
  const [scope, setScope] = useState("active");
  const [state, setState] = useState({ status: "loading", items: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [cancellingId, setCancellingId] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const load = useCallback(
    async (silent, signal) => {
      if (!silent) setState((s) => ({ ...s, status: "loading" }));
      try {
        const items = await fetchMyOrders(scope, signal);
        setState({ status: "ready", items });
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;
        if (!silent) setState({ status: "error", items: [] });
      }
    },
    [scope]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(false, controller.signal);
    // While watching active orders, refresh every 20 seconds so status changes appear
    const id = scope === "active" ? setInterval(() => load(true, controller.signal), 20000) : null;
    return () => {
      controller.abort();
      if (id) clearInterval(id);
    };
  }, [load, scope, reloadKey]);

  const handleCancel = async (o) => {
    if (!window.confirm(`Cancel order ${o.orderNumber} at ${o.business?.name || "the restaurant"}?`)) return;
    setCancellingId(o.id);
    setNotice({ type: "", text: "" });
    try {
      await cancelOrder(o.id);
      setNotice({ type: "ok", text: "Your order was cancelled." });
    } catch (err) {
      setNotice({ type: "error", text: parseApiError(err).message });
    } finally {
      setCancellingId("");
      setReloadKey((k) => k + 1);
    }
  };

  const { status, items } = state;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-4xl font-medium tracking-tight text-ink-900">My Orders</h1>
      <p className="mt-1 text-ink-700">Track your takeaway orders from restaurants.</p>

      <div className="mt-6 inline-flex rounded-2xl bg-surface p-1">
        {["active", "past"].map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={cn(
              "rounded-xl px-5 py-2 text-sm font-bold capitalize transition",
              scope === s ? "bg-surface text-brand-700 shadow-sm" : "text-ink-700 hover:text-ink-900"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {notice.text && (
        <p
          className={cn(
            "mt-4 rounded-xl px-4 py-3 text-sm font-medium",
            notice.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          )}
        >
          {notice.text}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {status === "loading" &&
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-surface" />)}

        {status === "error" && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
              <TriangleAlert size={24} />
            </span>
            <p className="mt-4 font-bold text-ink-900">Couldn't load your orders</p>
            <Button variant="soft" className="mt-5" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </Button>
          </Card>
        )}

        {status === "ready" && items.length === 0 && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <UtensilsCrossed size={24} />
            </span>
            <p className="mt-4 font-bold text-ink-900">{scope === "active" ? "No active orders" : "No past orders yet"}</p>
            <p className="mt-1 max-w-xs text-sm text-ink-700">
              {scope === "active"
                ? "Order from a restaurant and you can follow it here."
                : "Completed and cancelled orders will show up here."}
            </p>
            {scope === "active" && (
              <Button as={Link} to="/businesses?category=restaurant" variant="soft" size="sm" className="mt-5">
                Browse restaurants
              </Button>
            )}
          </Card>
        )}

        {status === "ready" &&
          items.map((o) => {
            const st = ORDER_STATUS[o.status] || { label: o.status, tone: "neutral" };
            const tz = o.business?.timezone || "Africa/Addis_Ababa";
            const tracking = PROGRESS_STEPS.some((s) => s.key === o.status);
            return (
              <Card key={o.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    {o.business ? (
                      <Link
                        to={`/business/${o.business.slug}`}
                        className="block truncate text-lg font-extrabold text-ink-900 hover:text-brand-700"
                      >
                        {o.business.name}
                      </Link>
                    ) : (
                      <p className="text-lg font-extrabold text-ink-900">Restaurant</p>
                    )}
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-700">
                      <Clock size={14} /> {formatDateTime(o.createdAt, tz)} · {o.orderNumber}
                      {o.type === "dine_in" ? ` · ${o.tableLabel}` : ""}
                    </p>
                  </div>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </div>

                {tracking && <Progress status={o.status} />}

                <ul className="mt-4 space-y-1.5 text-sm">
                  {o.items.map((i) => (
                    <li key={i.name} className="flex justify-between gap-3">
                      <span className="text-ink-700">
                        {i.quantity} × {i.name}
                      </span>
                      <span className="font-semibold text-ink-900">{formatPrice(i.lineTotalMinor, o.currency)}</span>
                    </li>
                  ))}
                </ul>
                {o.notes && <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-sm text-ink-700">Note: {o.notes}</p>}
                {o.collectionNote && <p className="mt-3 text-sm font-medium text-ink-800">{o.collectionNote}</p>}
                {o.estimatedReadyAt && (
                  <p className="mt-1 text-sm text-ink-700">Estimated ready {formatDateTime(o.estimatedReadyAt, tz)}</p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-extrabold text-ink-900">{formatPrice(o.totalMinor, o.currency)}</span>
                  <div className="flex gap-2">
                    {o.business?.slug && o.items?.some((i) => i.menuItemId) && (
                      <Button
                        size="sm"
                        variant="soft"
                        onClick={() => {
                          sessionStorage.setItem(
                            "bookeasy_reorder",
                            JSON.stringify({
                              slug: o.business.slug,
                              items: o.items.filter((i) => i.menuItemId).map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
                            })
                          );
                          navigate(`/business/${o.business.slug}`);
                        }}
                      >
                        Order again
                      </Button>
                    )}
                    {o.status === "pending" && (
                      <Button size="sm" variant="outline" loading={cancellingId === o.id} onClick={() => handleCancel(o)}>
                        Cancel order
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}