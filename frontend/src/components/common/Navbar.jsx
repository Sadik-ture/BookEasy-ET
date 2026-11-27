import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md transition-shadow duration-300",
        scrolled && "shadow-soft"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200",
                  isActive ? "text-brand-400" : "text-ink-700 hover:text-brand-400"
                )
              }
            >
              {({ isActive }) => (
                <span className={cn(isActive && "border-b border-brand-400 pb-1")}>{l.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? null : user ? (
            <>
              <Button as={Link} to={user.role === "business_owner" ? "/manage" : "/dashboard"} variant="soft" size="sm">
                <LayoutDashboard size={16} /> {user.fullName.split(" ")[0]}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Login
              </Button>
              <Button as={Link} to="/signup" size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink-900 hover:bg-black/5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="menu-panel border-t border-line bg-paper px-4 pb-5 md:hidden">
          <nav className="flex flex-col py-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-ink-800 hover:bg-surface"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          {user ? (
            <div className="flex gap-3">
              <Button as={Link} to={user.role === "business_owner" ? "/manage" : "/dashboard"} variant="soft" className="flex-1" onClick={() => setOpen(false)}>
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
                Sign up
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
