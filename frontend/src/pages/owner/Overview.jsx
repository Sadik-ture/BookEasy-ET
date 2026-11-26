import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, ExternalLink, Hourglass, ShoppingBag, UtensilsCrossed, Wallet, TriangleAlert } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { useOwner } from "../../context/OwnerContext";
import { getOverview } from "../../services/manageService";
import { formatPrice } from "../../utils/format";

export default function Overview() {
  const { business } = useOwner();
  const isRestaurant = business.category === "restaurant";
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    const controller = new AbortController();
    const load = () =>
      getOverview(controller.signal)
        .then((data) => setState({ status: "ready", data }))
        .catch((err) => {
          if (err.code !== "ERR_CANCELED") setState((s) => (s.data ? s : { status: "error", data: null }));
        });
    load();
    const id = setInterval(load, 20000);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, []);

  const d = state.data;
  const val = (n) => (d ? String(n) : "–");

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Business dashboard</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900">{business.name}</h1>
          <p className="mt-1 text-slate-500">Here's what needs your attention today.</p>
        </div>
        <Button as={Link} to={`/business/${business.slug}`} variant="outline">
          <ExternalLink size={16} /> View public page
        </Button>
      </div>

      {business.status !== "approved" && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          <Hourglass size={18} className="mt-0.5 shrink-0" /> Your business is waiting for approval and is not visible to customers yet.
        </p>
      )}
      {state.status === "error" && (
        <p className="mt-6 flex items-center gap-2 rounded-2xl bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
          <TriangleAlert size={18} /> Couldn't load today's numbers.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isRestaurant ? (
          <>
            <StatCard dark icon={ShoppingBag} label="Active orders" value={val(d?.activeOrders)} hint="Right now" />
            <StatCard icon={UtensilsCrossed} label="Orders today" value={val(d?.todayOrders)} tone="green" />
            <StatCard icon={Wallet} label="Completed sales today" value={d ? formatPrice(d.todayRevenueMinor) : "–"} tone="amber" />
          </>
        ) : (
          <>
            <StatCard dark icon={Hourglass} label="Waiting for your answer" value={val(d?.pendingBookings)} hint="Pending" />
            <StatCard icon={CalendarDays} label="Bookings today" value={val(d?.todayBookings)} tone="green" />
          </>
        )}
        <StatCard icon={Clock} label="Status" value={business.isOpen === null ? "–" : business.isOpen ? "Open" : "Closed"} tone="rose" hint="By your hours" />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-extrabold text-ink-900">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {isRestaurant ? (
            <>
              <Button as={Link} to="/manage/orders">Open orders</Button>
              <Button as={Link} to="/manage/menu" variant="outline">Edit menu</Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/manage/bookings">Review bookings</Button>
              <Button as={Link} to="/manage/services" variant="outline">Edit services</Button>
              <Button as={Link} to="/manage/staff" variant="outline">Manage staff</Button>
            </>
          )}
        </div>
        {!isRestaurant && (
          <p className="mt-4 text-sm text-slate-500">
            Customers can only book once you have at least one service and one staff member who performs it.
          </p>
        )}
      </Card>
    </div>
  );
}