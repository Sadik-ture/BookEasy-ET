import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CalendarPlus, Clock, MapPin, TriangleAlert, User } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { fetchMyBookings, cancelBooking } from "../../services/bookingService";
import { parseApiError } from "../../utils/apiError";
import { formatDateTime, formatDuration, formatPrice } from "../../utils/format";
import { cn } from "../../utils/cn";
import { downloadBookingCalendar } from "../../utils/calendar";

const STATUS = {
  pending: { label: "Pending", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  rejected: { label: "Rejected", tone: "danger" },
  completed: { label: "Completed", tone: "info" },
  no_show: { label: "No-show", tone: "neutral" },
};

function DateTile({ iso, tz }) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric" }).format(d);
  const month = new Intl.DateTimeFormat("en-GB", { timeZone: tz, month: "short" }).format(d);
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
      <div className="text-center leading-tight">
        <p className="text-xl font-extrabold">{day}</p>
        <p className="text-xs font-bold uppercase">{month}</p>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [scope, setScope] = useState("upcoming");
  const [state, setState] = useState({ status: "loading", items: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [cancellingId, setCancellingId] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: "loading" }));
    fetchMyBookings(scope, controller.signal)
      .then((items) => setState({ status: "ready", items }))
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        setState({ status: "error", items: [] });
      });
    return () => controller.abort();
  }, [scope, reloadKey]);

  const handleCancel = async (b) => {
    const name = b.business?.name || "this business";
    if (!window.confirm(`Cancel your ${b.serviceName} appointment at ${name}?`)) return;
    setCancellingId(b.id);
    setNotice({ type: "", text: "" });
    try {
      await cancelBooking(b.id);
      setNotice({ type: "ok", text: "Your booking was cancelled." });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setNotice({ type: "error", text: parseApiError(err).message });
    } finally {
      setCancellingId("");
    }
  };

  const { status, items } = state;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-4xl font-medium tracking-tight text-ink-900">My Bookings</h1>
      <p className="mt-1 text-ink-700">Your appointments at barbershops and salons.</p>

      <div className="mt-6 inline-flex rounded-2xl bg-surface p-1">
        {["upcoming", "past"].map((s) => (
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
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-3xl bg-surface" />)}

        {status === "error" && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
              <TriangleAlert size={24} />
            </span>
            <p className="mt-4 font-bold text-ink-900">Couldn't load your bookings</p>
            <Button variant="soft" className="mt-5" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </Button>
          </Card>
        )}

        {status === "ready" && items.length === 0 && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <CalendarDays size={24} />
            </span>
            <p className="mt-4 font-bold text-ink-900">
              {scope === "upcoming" ? "No upcoming bookings" : "No past bookings yet"}
            </p>
            <p className="mt-1 max-w-xs text-sm text-ink-700">
              {scope === "upcoming"
                ? "Book a barber or salon and your appointment will appear here."
                : "Completed and cancelled appointments will show up here."}
            </p>
            {scope === "upcoming" && (
              <Button as={Link} to="/businesses?category=barbershop" variant="soft" size="sm" className="mt-5">
                Find a barbershop
              </Button>
            )}
          </Card>
        )}

        {status === "ready" &&
          items.map((b) => {
            const st = STATUS[b.status] || { label: b.status, tone: "neutral" };
            const tz = b.business?.timezone || "Africa/Addis_Ababa";
            const area = [b.business?.address?.area, b.business?.address?.city].filter(Boolean).join(", ");
            return (
              <Card key={b.id} className="p-5">
                <div className="flex gap-4">
                  <DateTile iso={b.startAt} tz={tz} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        {b.business ? (
                          <Link
                            to={`/business/${b.business.slug}`}
                            className="block truncate text-lg font-extrabold text-ink-900 hover:text-brand-700"
                          >
                            {b.business.name}
                          </Link>
                        ) : (
                          <p className="text-lg font-extrabold text-ink-900">Business</p>
                        )}
                        <p className="text-sm font-semibold text-brand-700">{b.serviceName}</p>
                      </div>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>

                    <div className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-ink-700 sm:grid-cols-2">
                      <span className="flex items-center gap-2">
                        <Clock size={15} className="shrink-0" /> {formatDateTime(b.startAt, tz)}
                      </span>
                      <span className="flex items-center gap-2">
                        <User size={15} className="shrink-0" /> {b.staffName} · {formatDuration(b.durationMinutes)}
                      </span>
                      {area && (
                        <span className="flex items-center gap-2">
                          <MapPin size={15} className="shrink-0" /> {area}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="font-extrabold text-ink-900">{formatPrice(b.priceMinor, b.currency)}</span>
                      {scope === "upcoming" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="soft" onClick={() => downloadBookingCalendar(b)}>
                            <CalendarPlus size={15} /> Calendar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            loading={cancellingId === b.id}
                            onClick={() => handleCancel(b)}
                          >
                            Cancel booking
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}