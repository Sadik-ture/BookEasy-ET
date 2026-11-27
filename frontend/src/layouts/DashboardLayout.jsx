import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  UtensilsCrossed,
  Heart,
  User,
  Compass,
  LogOut,
  Menu,
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
import NotificationBell from "../components/common/NotificationBell";
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
          { to: "/manage/menu", label: "Menu", icon: BookOpen },           { to: "/manage/tables", label: "Tables", icon: QrCode },
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
    <div className="flex h-full flex-col border-r border-line bg-surface px-3 py-4 text-ink-900">
      <div className="px-2">
        <Logo tone="light" to={variant === "owner" ? "/manage" : "/dashboard"} />
      </div>

      {variant === "owner" && business && (
        <div className="mx-2 mt-6 rounded-xl border border-line bg-paper px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Your business</p>
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
                isActive ? "bg-brand-50 text-brand-800" : "text-ink-700 hover:bg-paper hover:text-ink-900"
              )
            }
          >
            <item.icon size={19} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {variant === "owner" && business ? (
        <div className="mb-4 rounded-xl border border-line bg-paper p-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-800">
            <ExternalLink size={18} />
          </span>
          <p className="mt-3 text-sm font-semibold">Your public page</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-700">See what customers see.</p>
          <Button as={Link} to={`/business/${business.slug}`} variant="light" size="sm" className="mt-3 w-full" onClick={onNavigate}>
            View page
          </Button>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-line bg-paper p-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-800">
            <Compass size={18} />
          </span>
          <p className="mt-3 text-sm font-semibold">Find something new</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-700">Browse barbershops, salons and restaurants near you.</p>
          <Button as={Link} to="/businesses" variant="light" size="sm" className="mt-3 w-full" onClick={onNavigate}>
            Explore
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-line pt-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-400 text-sm font-semibold text-[#1a140c]">
          {user.fullName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.fullName}</p>
          <p className="truncate text-xs text-ink-700">{user.email}</p>
        </div>
        <button onClick={handleLogout} aria-label="Logout" className="rounded-lg p-2 text-ink-700 transition hover:bg-paper hover:text-ink-900">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ variant = "customer" }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
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
    <div className="min-h-screen bg-paper text-ink-900 lg:pl-72">
      {open && <div className="fixed inset-0 z-40 bg-ink-950/40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-5 z-10 rounded-lg p-2 text-ink-700 hover:bg-paper lg:hidden">
          <X size={20} />
        </button>
        <Sidebar variant={variant} nav={nav} business={business} onNavigate={() => setOpen(false)} />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur-md sm:px-6">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-ink-900 hover:bg-surface lg:hidden">
          <Menu size={22} />
        </button>
        <Link to="/profile" className="hidden items-center gap-3 sm:flex">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-400 text-sm font-semibold text-[#1a140c]">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{user.fullName}</span>
            <span className="block truncate text-xs text-ink-700">{user.email}</span>
          </span>
        </Link>
        {variant === "owner" ? (
          <p className="ml-auto truncate text-sm font-medium text-ink-700">{business?.name}</p>
        ) : (
          <form onSubmit={handleSearch} className="relative ml-auto w-full max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-700/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places"
              aria-label="Search"
              className="h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-4 text-sm text-ink-900 outline-none placeholder:text-ink-700/50 focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
            />
          </form>
        )}
        <NotificationBell />
      </header>

      <main key={pathname} className="page-in px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}