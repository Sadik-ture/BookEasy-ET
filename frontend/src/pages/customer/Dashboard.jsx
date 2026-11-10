import { Link } from "react-router-dom";
import {
  CalendarDays,
  UtensilsCrossed,
  Heart,
  CheckCircle2,
  Scissors,
  Flower2,
  Utensils,
  QrCode,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import StatCard from "../../components/ui/StatCard";
import { cn } from "../../utils/cn";

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="grid place-items-center px-6 py-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon size={24} />
      </span>
      <p className="mt-4 font-bold text-ink-900">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{text}</p>
      {action}
    </div>
  );
}

const quick = [
  { to: "/businesses?category=barbershop", label: "Book a barber", icon: Scissors, color: "bg-brand-50 text-brand-600" },
  { to: "/businesses?category=salon", label: "Book a salon", icon: Flower2, color: "bg-fuchsia-50 text-fuchsia-600" },
  { to: "/businesses?category=restaurant", label: "Order food", icon: Utensils, color: "bg-orange-50 text-accent-600" },
  { to: "/businesses", label: "Scan QR", icon: QrCode, color: "bg-indigo-50 text-indigo-600" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user.fullName.split(" ")[0];
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const checklist = [
    { label: "Create your account", done: true },
    { label: "Add your phone number", done: Boolean(user.phone) },
    { label: "Make your first booking or order", done: false },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">{today}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900">
            Hello, {firstName} 👋
          </h1>
          <p className="mt-1 text-slate-500">Here's what's happening with your bookings and orders.</p>
        </div>
        <div className="flex gap-3">
          <Button as={Link} to="/businesses?category=salon">
            Book a service
          </Button>
          <Button as={Link} to="/businesses?category=restaurant" variant="outline">
            Order food
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard dark icon={CalendarDays} label="Upcoming Bookings" value="0" hint="Next 30 days" />
        <StatCard icon={UtensilsCrossed} label="Active Orders" value="0" tone="green" />
        <StatCard icon={CheckCircle2} label="Completed" value="0" tone="amber" />
        <StatCard icon={Heart} label="Favorites" value="0" tone="rose" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-extrabold text-ink-900">Upcoming Bookings</h2>
              <Link to="/my-bookings" className="text-sm font-bold text-brand-600 hover:text-brand-700">
                View all
              </Link>
            </div>
            <EmptyState
              icon={CalendarDays}
              title="No upcoming bookings"
              text="When you book a barber or salon, your appointments will show up here."
              action={
                <Button as={Link} to="/businesses?category=barbershop" variant="soft" size="sm" className="mt-5">
                  Find a barbershop
                </Button>
              }
            />
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-extrabold text-ink-900">Recent Orders</h2>
              <Link to="/my-orders" className="text-sm font-bold text-brand-600 hover:text-brand-700">
                View all
              </Link>
            </div>
            <EmptyState
              icon={UtensilsCrossed}
              title="No orders yet"
              text="Order takeaway or from your table and track the status here."
              action={
                <Button as={Link} to="/businesses?category=restaurant" variant="soft" size="sm" className="mt-5">
                  Browse restaurants
                </Button>
              }
            />
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-extrabold text-ink-900">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quick.map((q) => (
                <Link
                  key={q.label}
                  to={q.to}
                  className="rounded-2xl border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span className={cn("grid h-10 w-10 place-items-center rounded-xl", q.color)}>
                    <q.icon size={18} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-ink-900">{q.label}</p>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink-900">Getting started</h2>
              <span className="text-xs font-bold text-slate-400">
                {doneCount}/{checklist.length}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
            <ul className="mt-5 space-y-3">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                      c.done ? "bg-emerald-500 text-white" : "border-2 border-slate-200"
                    )}
                  >
                    {c.done && <Check size={14} />}
                  </span>
                  <span className={cn(c.done ? "text-slate-400 line-through" : "font-medium text-ink-800")}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}