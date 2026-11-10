import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/businesses", label: "Explore" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-brand-600 ${
      isActive ? "text-brand-700" : "text-slate-700"
    }`;

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        {/* Desktop links */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop auth area */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
              >
                <LayoutDashboard size={16} />
                {user.fullName.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50"
              >
                {l.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50"
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium"
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium">
                Login
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-brand-600 py-2.5 text-center text-sm font-semibold text-white">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}