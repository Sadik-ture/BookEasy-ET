import { CalendarDays, UtensilsCrossed, Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const stats = [
  { label: "Upcoming Bookings", value: 0, icon: CalendarDays, color: "bg-brand-100 text-brand-700" },
  { label: "Recent Orders", value: 0, icon: UtensilsCrossed, color: "bg-green-100 text-green-700" },
  { label: "Favorites", value: 0, icon: Heart, color: "bg-rose-100 text-rose-600" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Welcome back, {firstName}! 👋</h1>
      <p className="mt-1 text-slate-500">Here's what's happening with your bookings and orders.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${s.color}`}>
              <s.icon size={22} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}