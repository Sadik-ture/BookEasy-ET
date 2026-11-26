import { useEffect, useState } from "react";
import { Clock, Phone, TriangleAlert, User, UtensilsCrossed } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useOwner } from "../../context/OwnerContext";
import { listOrders, setOrderStatus } from "../../services/manageService";
import { parseApiError } from "../../utils/apiError";
import { ORDER_STATUS } from "../../utils/orderStatus";
import { formatDateTime, formatPrice } from "../../utils/format";
import { cn } from "../../utils/cn";

const ACTIONS = {
  pending: [
    { status: "accepted", label: "Accept", variant: "primary" },
    { status: "rejected", label: "Decline", variant: "outline" },
  ],
  accepted: [
    { status: "preparing", label: "Start preparing", variant: "primary" },
    { status: "cancelled", label: "Cancel", variant: "ghost" },
  ],
  preparing: [{ status: "ready", label: "Mark ready", variant: "primary" }],
  ready: [{ status: "completed", label: "Picked up · Complete", variant: "primary" }],
};

export default function ManageOrders() {
  const { business } = useOwner();
  const [scope, setScope] = useState("active");
  const [state, setState] = useState({ status: "loading", items: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: s.items.length ? "ready" : "loading" }));
    listOrders(scope, controller.signal)
      .then((items) => setState({ status: "ready", items }))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setState({ status: "error", items: [] });
      });
    // New orders should appear without reloading
    const id = scope === "active" ? setInterval(() => listOrders(scope, controller.signal).then((items) => setState({ status: "ready", items })).catch(() => {}), 15000) : null;
    return () => {
      controller.abort();
      if (id) clearInterval(id);
    };
  }, [scope, reloadKey]);

  const act = async (o, status, label) => {
    if ((status === "rejected" || status === "cancelled") && !window.confirm(`${label} order ${o.orderNumber}?`)) return;
    setBusyId(o.id);
    setNotice("");
    try {
      await setOrderStatus(o.id, status);
    } catch (err) {
      setNotice(parseApiError(err).message);
    } finally {
      setBusyId("");
      setReloadKey((k) => k + 1);
    }
  };

  const { status, items } = state;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Orders</h1>
      <p className="mt-1 text-slate-500">Oldest orders first. This page refreshes by itself.</p>

      <div className="mt-6 inline-flex rounded-2xl bg-slate-100 p-1">
        {["active", "past"].map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={cn("rounded-xl px-5 py-2 text-sm font-bold capitalize transition", scope === s ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-ink-900")}
          >
            {s}
          </button>
        ))}
      </div>

      {notice && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{notice}</p>}

      <div className="mt-6 space-y-4">
        {status === "loading" && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-slate-100" />)}

        {status === "error" && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500"><TriangleAlert size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">Couldn't load orders</p>
            <Button variant="soft" className="mt-5" onClick={() => setReloadKey((k) => k + 1)}>Try again</Button>
          </Card>
        )}

        {status === "ready" && items.length === 0 && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><UtensilsCrossed size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">{scope === "active" ? "No active orders" : "No past orders yet"}</p>
            <p className="mt-1 text-sm text-slate-500">New orders will show up here automatically.</p>
          </Card>
        )}

        {status === "ready" &&
          items.map((o) => {
            const st = ORDER_STATUS[o.status] || { label: o.status, tone: "neutral" };
            return (
              <Card key={o.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-extrabold text-ink-900">{o.orderNumber}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock size={14} /> {formatDateTime(o.createdAt, business.timezone)} · Takeaway
                    </p>
                  </div>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-slate-600">
                  <span className="flex items-center gap-2"><User size={15} /> {o.customerName}</span>
                  <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-brand-600">
                    <Phone size={15} /> {o.phone}
                  </a>
                </div>

                <ul className="mt-4 space-y-1.5 text-sm">
                  {o.items.map((i) => (
                    <li key={i.name} className="flex justify-between gap-3">
                      <span className="text-slate-700">
                        <b className="text-ink-900">{i.quantity} ×</b> {i.name}
                      </span>
                      <span className="font-semibold text-ink-900">{formatPrice(i.lineTotalMinor, o.currency)}</span>
                    </li>
                  ))}
                </ul>
                {o.notes && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">Note: {o.notes}</p>}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-lg font-extrabold text-ink-900">{formatPrice(o.totalMinor, o.currency)}</span>
                  <div className="flex flex-wrap gap-2">
                    {(ACTIONS[o.status] || []).map((a) => (
                      <Button key={a.status} size="sm" variant={a.variant} loading={busyId === o.id} onClick={() => act(o, a.status, a.label)}>
                        {a.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}