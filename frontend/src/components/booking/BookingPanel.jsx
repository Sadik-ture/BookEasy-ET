import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarCheck, Check, CircleAlert, Users } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useAuth } from "../../context/AuthContext";
import { fetchAvailability } from "../../services/marketplaceService";
import { createBooking } from "../../services/bookingService";
import { parseApiError } from "../../utils/apiError";
import { buildDays } from "../../utils/dates";
import { formatClock, formatDateTime, formatDuration, formatPrice } from "../../utils/format";
import { cn } from "../../utils/cn";

export default function BookingPanel({ business, services, staff, serviceId, onServiceChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const days = useMemo(() => buildDays(business.timezone, 14), [business.timezone]);

  const [date, setDate] = useState(days[0].date);
  const [staffId, setStaffId] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [avail, setAvail] = useState({ status: "idle", slots: [], message: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState(null);

  const service = services.find((s) => s.id === serviceId);
  const eligibleStaff = useMemo(
    () => staff.filter((s) => s.serviceIds.includes(serviceId)),
    [staff, serviceId]
  );

  // If the chosen professional doesn't do the newly chosen service, go back to "Any"
  useEffect(() => {
    if (staffId && !eligibleStaff.some((s) => s.id === staffId)) setStaffId("");
  }, [eligibleStaff, staffId]);

  // Load available times
  useEffect(() => {
    if (!serviceId) {
      setAvail({ status: "idle", slots: [], message: "" });
      return;
    }
    const controller = new AbortController();
    setTime("");
    setAvail({ status: "loading", slots: [], message: "" });

    fetchAvailability({ slug: business.slug, serviceId, date, staffId }, controller.signal)
      .then((data) => setAvail({ status: "ready", slots: data.slots, message: data.message || "" }))
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        setAvail({ status: "error", slots: [], message: "" });
      });

    return () => controller.abort();
  }, [business.slug, serviceId, date, staffId, reloadKey]);

  if (services.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-ink-700">
        Booking isn't available yet for this business.
      </Card>
    );
  }

  const selectedSlot = avail.slots.find((s) => s.time === time);

  const handleConfirm = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const booking = await createBooking({
        businessId: business.id,
        serviceId,
        staffId: staffId || undefined,
        date,
        time,
        notes: notes.trim() || undefined,
      });
      setBooked(booking);
    } catch (err) {
      setError(parseApiError(err).message);
      if (err.response?.status === 409) setReloadKey((k) => k + 1); // refresh the times
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setBooked(null);
    setTime("");
    setNotes("");
    setReloadKey((k) => k + 1);
  };

  // Success view
  if (booked) {
    const confirmed = booked.status === "confirmed";
    return (
      <Card className="p-6 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-600">
          <Check size={30} />
        </span>
        <h3 className="mt-5 text-xl font-extrabold text-ink-900">
          {confirmed ? "Booking confirmed!" : "Request sent!"}
        </h3>
        <p className="mt-1 text-sm text-ink-700">
          {confirmed
            ? "Your appointment is confirmed. See you there."
            : "The business will confirm your appointment shortly."}
        </p>

        <dl className="mt-6 space-y-3 rounded-2xl bg-brand-50 p-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-700">Service</dt>
            <dd className="font-bold text-ink-900">{booked.serviceName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-700">With</dt>
            <dd className="font-bold text-ink-900">{booked.staffName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-700">When</dt>
            <dd className="text-right font-bold text-ink-900">{formatDateTime(booked.startAt, business.timezone)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-700">Price</dt>
            <dd className="font-bold text-ink-900">{formatPrice(booked.priceMinor, booked.currency)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex gap-3">
          <Button as={Link} to="/my-bookings" className="flex-1">
            My bookings
          </Button>
          <Button variant="outline" className="flex-1" onClick={reset}>
            Book another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
        <CalendarCheck size={20} className="text-brand-600" /> Book an Appointment
      </h3>

      {/* Service */}
      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-800">Service</span>
        <select
          value={serviceId}
          onChange={(e) => onServiceChange(e.target.value)}
          className="h-12 w-full cursor-pointer rounded-2xl border border-line bg-surface px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {formatPrice(s.priceMinor)}
            </option>
          ))}
        </select>
      </label>

      {/* Professional */}
      <div className="mt-5">
        <span className="mb-2 block text-sm font-semibold text-ink-800">Professional</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStaffId("")}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition",
              staffId === ""
                ? "bg-brand-400 text-[#1a140c] ring-brand-600"
                : "bg-surface text-ink-800 ring-line hover:bg-brand-50"
            )}
          >
            <Users size={15} /> Any
          </button>
          {eligibleStaff.map((s) => (
            <button
              key={s.id}
              onClick={() => setStaffId(s.id)}
              className={cn(
                "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-semibold ring-1 transition",
                staffId === s.id
                  ? "bg-brand-400 text-[#1a140c] ring-brand-600"
                  : "bg-surface text-ink-800 ring-line hover:bg-brand-50"
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
                  staffId === s.id ? "bg-[#1a140c]/15 text-[#1a140c]" : "bg-brand-100 text-brand-400"
                )}
              >
                {s.name.charAt(0)}
              </span>
              {s.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div className="mt-5">
        <span className="mb-2 block text-sm font-semibold text-ink-800">Date</span>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {days.map((d) => (
            <button
              key={d.date}
              onClick={() => setDate(d.date)}
              className={cn(
                "flex w-16 shrink-0 flex-col items-center rounded-2xl px-2 py-3 ring-1 transition",
                date === d.date
                  ? "bg-brand-400 text-[#1a140c] shadow-glow ring-brand-600"
                  : "bg-surface text-ink-800 ring-line hover:bg-brand-50"
              )}
            >
              <span className={cn("text-xs font-semibold", date === d.date ? "text-[#1a140c]/70" : "text-ink-700")}>
                {d.isToday ? "Today" : d.weekday}
              </span>
              <span className="mt-0.5 text-xl font-extrabold">{d.day}</span>
              <span className={cn("text-xs", date === d.date ? "text-[#1a140c]/70" : "text-ink-700")}>{d.month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div className="mt-3">
        <span className="mb-2 block text-sm font-semibold text-ink-800">Time</span>

        {avail.status === "loading" && (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        )}

        {avail.status === "error" && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            Couldn't load times.{" "}
            <button className="font-bold underline" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </p>
        )}

        {avail.status === "ready" && avail.slots.length === 0 && (
          <p className="rounded-xl bg-brand-50 px-4 py-4 text-center text-sm text-ink-700">
            {avail.message || "No times available."} Try another date.
          </p>
        )}

        {avail.status === "ready" && avail.slots.length > 0 && (
          <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto pr-1">
            {avail.slots.map((s) => (
              <button
                key={s.time}
                onClick={() => setTime(s.time)}
                className={cn(
                  "h-11 rounded-xl text-sm font-semibold ring-1 transition",
                  time === s.time
                    ? "bg-brand-400 text-[#1a140c] ring-brand-600"
                    : "bg-surface text-ink-800 ring-line hover:bg-brand-50 hover:text-brand-700"
                )}
              >
                {formatClock(s.time)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-800">Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="Anything the business should know?"
          className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-ink-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
      </label>

      {/* Summary */}
      {service && selectedSlot && (
        <div className="mt-5 rounded-2xl bg-brand-50 p-4 text-sm">
          <p className="font-bold text-ink-900">{service.name}</p>
          <p className="mt-0.5 text-ink-700">
            {formatDateTime(selectedSlot.startAt, business.timezone)} · {formatDuration(service.durationMinutes)}
          </p>
          <p className="mt-2 flex justify-between font-extrabold text-ink-900">
            <span>Total</span>
            <span>{formatPrice(service.priceMinor)}</span>
          </p>
          <p className="mt-1 text-xs text-ink-700">Pay at the business after your service.</p>
        </div>
      )}

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <CircleAlert size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <Button size="lg" className="mt-5 w-full" disabled={!time} loading={submitting} onClick={handleConfirm}>
        {user ? (submitting ? "Booking…" : "Confirm Booking") : "Log in to book"}
      </Button>
    </Card>
  );
}