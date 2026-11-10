import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  UtensilsCrossed,
  Heart,
  User,
  Compass,
  LogOut,
  Menu,
  Bell,
  Search,
  X,
} from "lucide-react";
import Logo from "../components/common/Logo";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/my-bookings", label: "My Bookings", icon: CalendarDays },
  { to: "/my-orders", label: "My Orders", icon: UtensilsCrossed },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
];

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-ink-900 to-ink-950 px-4 py-6 text-white">
      <div className="px-2">
        <Logo tone="light" to="/dashboard" />
      </div>

      <nav className="mt-10 flex-1 space-y-1.5">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "bg-brand-600 text-white shadow-glow"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon size={19} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Discover card */}
      <div className="mb-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600/30 text-brand-200">
          <Compass size={18} />
        </span>
        <p className="mt-3 text-sm font-bold">Find something new</p>
        <p className="mt-1 text-xs leading-relaxed text-white/50">
          Browse barbershops, salons and restaurants near you.
        </p>
        <Button as={Link} to="/businesses" variant="light" size="sm" className="mt-3 w-full" onClick={onNavigate}>
          Explore
        </Button>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 border-t border-white/10 pt-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold">
          {user.fullName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.fullName}</p>
          <p className="truncate text-xs text-white/50">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/businesses?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen lg:pl-72">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-5 z-10 rounded-xl p-2 text-white/70 hover:bg-white/10 lg:hidden"
        >
          <X size={20} />
        </button>
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>

      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-900/5 bg-white/80 px-4 backdrop-blur-xl sm:px-8">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <form onSubmit={handleSearch} className="relative max-w-md flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search businesses…"
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <Bell size={18} />
          </button>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}