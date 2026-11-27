import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

const links = [
  ["/platform", "Overview"],
  ["/platform/businesses", "Businesses"],
  ["/platform/users", "Users"],
  ["/platform/plans", "Plans"],
  ["/platform/reviews", "Reviews"],
  ["/platform/settings", "Settings"],
];

export default function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-ink-700">Loading…</div>;
  if (!user || !["super_admin", "support_admin"].includes(user.role)) return <Navigate to="/dashboard" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-[#f4fbfb] px-4 py-8 text-ink-900">
      <h1 className="text-2xl font-extrabold">Platform</h1>
      <nav className="mt-4 flex gap-2 overflow-x-auto">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/platform"} className={({ isActive }) => cn("rounded-full px-4 py-2 text-sm font-bold", isActive ? "bg-brand-400 text-[#1a140c]" : "bg-surface text-ink-700")}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6"><Outlet /></div>
    </div>
  );
}
