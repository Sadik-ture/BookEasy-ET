import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import Logo from "./Logo";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

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

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-900/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 rounded-full bg-slate-100/80 p-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-600 hover:text-ink-900"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden items-center gap-2 md:flex">
          {loading ? null : user ? (
            <>
              <Button as={Link} to="/dashboard" variant="soft" size="sm">
                <LayoutDashboard size={16} /> {user.fullName.split(" ")[0]}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost">
                Login
              </Button>
              <Button as={Link} to="/signup">
                Sign Up
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-5 md:hidden">
          <nav className="flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-brand-50"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          {user ? (
            <div className="flex gap-3">
              <Button as={Link} to="/dashboard" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
                Dashboard
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button as={Link} to="/login" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Login
              </Button>
              <Button as={Link} to="/signup" className="flex-1" onClick={() => setOpen(false)}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}