import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Scissors,
  Users,
  CalendarDays,
  UtensilsCrossed,
  ClipboardList,
  QrCode,
  BarChart3,
  CreditCard,
  MessageSquareText,
  UserPlus,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import Logo from "../components/common/Logo";
import Button from "../components/ui/Button";
import NotificationBell from "../components/common/NotificationBell";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

const LINKS = [
  { to: "/workspace", label: "Today", icon: LayoutDashboard, end: true, perm: null },
  { to: "/workspace/profile", label: "Profile", icon: Store, perm: "profile" },
  { to: "/workspace/services", label: "Services", icon: Scissors, perm: "catalog", categories: ["barbershop", "salon"] },
  { to: "/workspace/staff", label: "Staff", icon: Users, perm: "catalog", categories: ["barbershop", "salon"] },
  { to: "/workspace/bookings", label: "Bookings", icon: CalendarDays, perm: "bookings", categories: ["barbershop", "salon"] },
  { to: "/workspace/menu", label: "Menu", icon: UtensilsCrossed, perm: "catalog", categories: ["restaurant"] },
  { to: "/workspace/orders", label: "Orders", icon: ClipboardList, perm: "orders", categories: ["restaurant"] },
  { to: "/workspace/tables", label: "Tables", icon: QrCode, perm: "tables", categories: ["restaurant"] },
  { to: "/workspace/team", label: "Team", icon: UserPlus, perm: "team" },
  { to: "/workspace/reviews", label: "Reviews", icon: MessageSquareText, perm: "profile" },
  { to: "/workspace/reports", label: "Reports", icon: BarChart3, perm: "reports" },
  { to: "/workspace/subscription", label: "Plan", icon: CreditCard, perm: "subscription" },
];

export default function WorkspaceLayout() {
  const { memberships, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(localStorage.getItem("bookeasy_workspace") || "");

  useEffect(() => {
    if (!loading && memberships.length === 0) navigate("/register-business", { replace: true });
  }, [loading, memberships, navigate]);

  useEffect(() => {
    if (!memberships.length) return;
    const found = memberships.some((m) => m.business.id === activeId);
    const next = found ? activeId : memberships[0].business.id;
    if (next !== activeId) setActiveId(next);
    localStorage.setItem("bookeasy_workspace", next);
  }, [memberships, activeId]);

  if (loading || !memberships.length) return <div className="grid place-items-center py-32 text-slate-500">Loading…</div>;

  const active = memberships.find((m) => m.business.id === activeId) || memberships[0];
  const links = LINKS.filter((l) => {
    if (l.perm && !active.permissions.includes(l.perm)) return false;
    if (l.categories && !l.categories.includes(active.business.category)) return false;
    return true;
  });

  const choose = (id) => {
    localStorage.setItem("bookeasy_workspace", id);
    setActiveId(id);
    setOpen(false);
  };

  return (
    <div className="min-h-screen lg:pl-72">
      {open && <div className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 bg-ink-950 text-white transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-full flex-col px-4 py-6">
          <div className="flex items-center justify-between px-2">
            <Logo tone="light" to="/workspace" />
            <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
          </div>
          {memberships.length > 1 && (
            <select
              value={active.business.id}
              onChange={(e) => choose(e.target.value)}
              className="mt-6 h-11 rounded-xl bg-white/10 px-3 text-sm"
            >
              {memberships.map((m) => (
                <option key={m.business.id} value={m.business.id}>{m.business.name}</option>
              ))}
            </select>
          )}
          <p className="mt-4 px-2 text-xs font-bold uppercase tracking-wide text-white/40">
            {active.business.name} · {active.role}
          </p>
          <nav className="mt-3 flex-1 space-y-1 overflow-y-auto">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold", isActive ? "bg-brand-600 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")}
              >
                <item.icon size={18} /> {item.label}
              </NavLink>
            ))}
          </nav>
          <Button as={Link} to="/dashboard" variant="light" size="sm" className="mb-3">Customer home</Button>
          <button onClick={() => logout().then(() => navigate("/"))} className="flex items-center gap-2 px-2 text-sm text-white/60">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-900/5 bg-white/80 px-4 backdrop-blur-xl">
        <button className="rounded-xl p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
        <p className="font-extrabold text-ink-900">{active.business.status === "approved" ? active.business.name : `${active.business.name} (${active.business.status})`}</p>
        <div className="ml-auto"><NotificationBell /></div>
      </header>
      <main className="px-4 py-8 sm:px-8"><Outlet context={{ membership: active }} /></main>
    </div>
  );
}
