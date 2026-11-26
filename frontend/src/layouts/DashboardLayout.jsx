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
  Store,
  ShoppingBag,
  Scissors,
  Users,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import Logo from "../components/common/Logo";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useOwner } from "../context/OwnerContext";
import { cn } from "../utils/cn";

const customerNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/my-bookings", label: "My Bookings", icon: CalendarDays },
  { to: "/my-orders", label: "My Orders", icon: UtensilsCrossed },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
];

function ownerNavFor(category) {
  const base = [{ to: "/manage", label: "Overview", icon: LayoutDashboard, end: true }];
  const own =
    category === "restaurant"
      ? [
          { to: "/manage/orders", label: "Orders", icon: ShoppingBag },
          { to: "/manage/menu", label: "Menu", icon: BookOpen },
        ]
      : [
          { to: "/manage/bookings", label: "Bookings", icon: CalendarDays },
          { to: "/manage/services", label: "Services", icon: Scissors },
          { to: "/manage/staff", label: "Staff", icon: Users },
        ];
  return [...base, ...own, { to: "/dashboard", label: "Customer view", icon: User }];
}

function Sidebar({ variant, nav, business, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-ink-900 to-ink-950 px-4 py-6 text-white">
      <div className="px-2">
        <Logo tone="light" to={variant === "owner" ? "/manage" : "/dashboard"} />
      </div>

      {variant === "owner" && business && (
        <div className="mx-2 mt-6 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">Your business</p>
          <p className="mt-0.5 truncate text-sm font-bold">{business.name}</p>
        </div>
      )}

      <nav className={cn("flex-1 space-y-1.5", variant === "owner" ? "mt-6" : "mt-10")}>
        {nav.map((item) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                isActive ? "bg-brand-600 text-white shadow-glow" : "text-white/60 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon size={19} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {variant === "owner" && business ? (
        <div className="mb-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600/30 text-brand-200">
            <ExternalLink size={18} />
          </span>
          <p className="mt-3 text-sm font-bold">Your public page</p>
          <p className="mt-1 text-xs leading-relaxed text-white/50">See what customers see.</p>
          <Button as={Link} to={`/business/${business.slug}`} variant="light" size="sm" className="mt-3 w-full" onClick={onNavigate}>
            View page
          </Button>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600/30 text-brand-200">
            <Compass size={18} />
          </span>
          <p className="mt-3 text-sm font-bold">Find something new</p>
          <p className="mt-1 text-xs leading-relaxed text-white/50">Browse barbershops, salons and restaurants near you.</p>
          <Button as={Link} to="/businesses" variant="light" size="sm" className="mt-3 w-full" onClick={onNavigate}>
            Explore
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-white/10 pt-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold">
          {user.fullName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.fullName}</p>
          <p className="truncate text-xs text-white/50">{user.email}</p>
        </div>
        <button onClick={handleLogout} aria-label="Logout" className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ variant = "customer" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const owner = useOwner(); // null outside the owner area
  const navigate = useNavigate();

  const business = variant === "owner" ? owner?.business : null;
  let nav = variant === "owner" && business ? ownerNavFor(business.category) : customerNav;
  if (variant === "customer" && user.role === "business_owner") {
    nav = [...customerNav.slice(0, 1), { to: "/manage", label: "My Business", icon: Store }, ...customerNav.slice(1)];
  }

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/businesses?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen lg:pl-72">
      {open && <div className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-5 z-10 rounded-xl p-2 text-white/70 hover:bg-white/10 lg:hidden">
          <X size={20} />
        </button>
        <Sidebar variant={variant} nav={nav} business={business} onNavigate={() => setOpen(false)} />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-900/5 bg-white/80 px-4 backdrop-blur-xl sm:px-8">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden">
          <Menu size={22} />
        </button>

        {variant === "owner" ? (
          <p className="truncate text-sm font-bold text-ink-900">{business?.name}</p>
        ) : (
          <form onSubmit={handleSearch} className="relative max-w-md flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search businesses…"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </form>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button aria-label="Notifications" className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
            <Bell size={18} />
          </button>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{user.fullName.charAt(0).toUpperCase()}</span>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}