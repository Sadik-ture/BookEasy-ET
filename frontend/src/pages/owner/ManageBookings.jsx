import { useEffect, useState } from "react";
import { CalendarDays, Clock, Phone, TriangleAlert, User } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Switch from "../../components/ui/Switch";
import { useOwner } from "../../context/OwnerContext";
import { listBookings, setBookingStatus, setAutoConfirm } from "../../services/manageService";
import { parseApiError } from "../../utils/apiError";
import { BOOKING_STATUS } from "../../utils/bookingStatus";
import { formatDateTime, formatDuration, formatPrice } from "../../utils/format";
import { cn } from "../../utils/cn";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

const ACTIONS = {
  pending: [
    { status: "confirmed", label: "Confirm", variant: "primary" },
    { status: "rejected", label: "Decline", variant: "outline" },
  ],
  confirmed: [
    { status: "completed", label: "Mark completed", variant: "primary" },
    { status: "no_show", label: "No-show", variant: "outline" },
    { status: "cancelled", label: "Cancel", variant: "ghost" },
  ],
};

export default function ManageBookings() {
  const { business, patch } = useOwner();
  const [scope, setScope] = useState("pending");
  const [state, setState] = useState({ status: "loading", items: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const [savingAuto, setSavingAuto] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: s.items.length ? "ready" : "loading" }));
    listBookings(scope, controller.signal)
      .then((items) => setState({ status: "ready", items }))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setState({ status: "error", items: [] });
      });
    const id = setInterval(() => {
      listBookings(scope, controller.signal).then((items) => setState({ status: "ready", items })).catch(() => {});
    }, 30000);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [scope, reloadKey]);

  const act = async (b, status, label) => {
    if ((status === "cancelled" || status === "rejected") && !window.confirm(`${label} this booking for ${b.customer?.name || "the customer"}?`)) return;
    setBusyId(b.id);
    setNotice("");
    try {
      await setBookingStatus(b.id, status);
    } catch (err) {
      setNotice(parseApiError(err).message);
    } finally {
      setBusyId("");
      setReloadKey((k) => k + 1);
    }
  };

  const toggleAuto = async (value) => {
    setSavingAuto(true);
    try {
      await setAutoConfirm(value);
      patch({ autoConfirm: value });
    } catch (err) {
      setNotice(parseApiError(err).message);
    } finally {
      setSavingAuto(false);
    }
  };

  const { status, items } = state;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-4xl font-medium tracking-tight text-ink-900">Bookings</h1>
      <p className="mt-1 text-ink-700">Confirm requests and keep track of appointments.</p>

      <Card className="mt-6 flex items-center justify-between gap-4 p-5">
        <div>
          <p className="font-bold text-ink-900">Confirm bookings automatically</p>
          <p className="text-sm text-ink-700">New bookings are confirmed instantly. Otherwise you approve each one.</p>
        </div>
        <Switch checked={business.autoConfirm} onChange={toggleAuto} disabled={savingAuto} label="Confirm bookings automatically" />
      </Card>

      <div className="mt-6 inline-flex flex-wrap rounded-2xl bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setScope(t.key)}
            className={cn("rounded-xl px-5 py-2 text-sm font-bold transition", scope === t.key ? "bg-surface text-brand-700 shadow-sm" : "text-ink-700 hover:text-ink-900")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {notice && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{notice}</p>}

      <div className="mt-6 space-y-4">
        {status === "loading" && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-3xl bg-surface" />)}

        {status === "error" && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500"><TriangleAlert size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">Couldn't load bookings</p>
            <Button variant="soft" className="mt-5" onClick={() => setReloadKey((k) => k + 1)}>Try again</Button>
          </Card>
        )}

        {status === "ready" && items.length === 0 && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><CalendarDays size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">Nothing here</p>
            <p className="mt-1 text-sm text-ink-700">Bookings in this list will appear here.</p>
          </Card>
        )}

        {status === "ready" &&
          items.map((b) => {
            const st = BOOKING_STATUS[b.status] || { label: b.status, tone: "neutral" };
            return (
              <Card key={b.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-extrabold text-ink-900">{b.serviceName}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-700">
                      <Clock size={14} /> {formatDateTime(b.startAt, business.timezone)} · {formatDuration(b.durationMinutes)}
                    </p>
                  </div>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </div>

                <div className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-ink-700 sm:grid-cols-2">
                  <span className="flex items-center gap-2"><User size={15} /> {b.customer?.name || "Customer"}</span>
                  {b.customer?.phone ? (
                    <a href={`tel:${b.customer.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-brand-600">
                      <Phone size={15} /> {b.customer.phone}
                    </a>
                  ) : (
                    <span className="text-ink-700">No phone number</span>
                  )}
                  <span>With {b.staffName}</span>
                  <span className="font-bold text-ink-900">{formatPrice(b.priceMinor, b.currency)}</span>
                </div>
                {b.customerNotes && <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-sm text-ink-700">Note: {b.customerNotes}</p>}

                {ACTIONS[b.status] && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {ACTIONS[b.status].map((a) => (
                      <Button key={a.status} size="sm" variant={a.variant} loading={busyId === b.id} onClick={() => act(b, a.status, a.label)}>
                        {a.label}
                      </Button>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}