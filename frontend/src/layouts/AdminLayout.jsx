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
  if (loading) return <div className="py-20 text-center text-slate-500">Loading…</div>;
  if (!user || !["super_admin", "support_admin"].includes(user.role)) return <Navigate to="/dashboard" replace />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">Platform</h1>
      <nav className="mt-4 flex gap-2 overflow-x-auto">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/platform"} className={({ isActive }) => cn("rounded-full px-4 py-2 text-sm font-bold", isActive ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600")}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6"><Outlet /></div>
    </div>
  );
}
